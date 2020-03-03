const StateMachine = require('javascript-state-machine');
const visualize = require('javascript-state-machine/lib/visualize');
const Joi = require('@hapi/joi');
const slugify = require('slugify');
const EventsHaNode = require('../../lib/events-ha-node');

module.exports = function(RED) {
    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            outputs: 1,
            attributes: nodeConfig => nodeConfig.attributes || [],
            config: {},
            exposeToHomeAssistant: nodeConfig => true,
            resend: {},
            outputLocation: {},
            outputLocationType: nodeConfig =>
                nodeConfig.outputLocationType || 'none',
            triggerProperty: nodeConfig =>
                nodeConfig.triggerProperty || 'payload',
            triggerPropertyType: nodeConfig =>
                nodeConfig.triggerPropertyType || 'msg',
            discreteOutputs: nodeConfig => nodeConfig.discreteOutputs || false,
            outputStateChangeOnly: nodeConfig =>
                nodeConfig.outputStateChangeOnly || false,
            throwException: nodeConfig => nodeConfig.throwException || false,
            states: nodeConfig => nodeConfig.states || [],
            transitions: nodeConfig => nodeConfig.transitions || [],
            outputDotFileOnDeploy: nodeConfig =>
                nodeConfig.outputDotFileOnDeploy || false.valueOf,
            timeoutUnits: nodeConfig => nodeConfig.timeoutUnits || 'seconds'
        },
        input: {
            attributes: {
                messageProp: 'attributes',
                configProp: 'attributes',
                default: []
            },
            timeout: {
                messageProp: 'timeout',
                default: false
            },
            timeoutUnits: {
                messageProp: 'timeoutUnits',
                configProp: "timeoutUnits",
                validation: {
                    haltOnFail: true,
                    schema: Joi.string()
                        .valid(
                            'milliseconds',
                            'seconds',
                            'minutes',
                            'hours',
                            'days'
                        )
                        .label('timeoutUnits')
                }
            }
        }
    };

    class StateMachineNode extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.registered = false;
            this.states = this.nodeConfig.states;
            this.transitions = this.nodeConfig.transitions;
            this.fsm = undefined;
            this.activeTimer = false;
            this.expiresAt = false;
            this.timeoutId = -1;
            this.init();
        }

        async init() {
            await this.loadPersistedData();

            this.addEventClientListener(
                `ha_events:config_update`,
                this.onConfigUpdate.bind(this)
            );

            if (this.isConnected) {
                await this.registerEntity();
            }

            await this.createStateMachine();

            if (this.nodeConfig.outputDotFileOnDeploy) {
                const dotOutput = {
                    id: this.id,
                    name: this.name || '',
                    msg: visualize(this.fsm)
                };
                this.RED.comms.publish('debug', dotOutput);
            }
        }

        async createStateMachine() {
            let initState = this.states[0].name;
            if (
                this.lastPayload &&
                Object.prototype.hasOwnProperty.call(this.lastPayload, 'state')
            ) {
                initState = this.lastPayload.state;
            }

            // Check if each state that has a timeout set, also has a timeout transition.
            // Add one if it doesn't already exist.
            this.states.forEach((state, i) => {
                const timeout =
                    !isNaN(state.stateTimeout) && state.stateTimeout > 0
                        ? state.stateTimeout
                        : false;
                if (
                    timeout &&
                    !this.transitions.some(
                        t => t.name === 'timeout' && t.from === state.name
                    )
                ) {
                    const next = i < this.states.length - 1 ? i + 1 : 0;
                    this.transitions.push({
                        name: 'timeout',
                        from: state.name,
                        to: this.states[next].name
                    });
                }
            });

            // Add the transition for msg.initialize.
            if (
                !this.transitions.some(
                    t => t.name === 'builtin_initialize_reset'
                )
            ) {
                this.transitions.push({
                    name: 'builtin_initialize_reset',
                    from: '*',
                    to: this.states[0].name
                });
            }
            // Add the transition for msg.forceState.
            if (!this.transitions.some(t => t.name === 'builtin_force_state')) {
                this.transitions.push({
                    name: 'builtin_force_state',
                    from: '*',
                    to: function(s) {
                        return s;
                    }
                });
            }

            try {
                this.fsm = new StateMachine({
                    init: initState,
                    transitions: this.transitions
                });
            } catch (e) {
                this.setStatusFailed(e.message);
                throw e;
            }

            let statusText = `State: ${initState}`;

            // Check if there was an active timer before the node was restarted. See if we should restart.
            if (
                this.lastPayload &&
                Object.prototype.hasOwnProperty.call(
                    this.lastPayload,
                    'activeTimer'
                ) &&
                this.lastPayload.activeTimer
            ) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        this.lastPayload.attributes,
                        'expires_at'
                    )
                ) {
                    try {
                        this.expiresAt = new Date(this.lastPayload.attributes.expires_at);
                        if (this.expiresAt.getTime() > Date.now()) {
                            this.createTimer(
                                {},
                                {},
                                this.expiresAt.getTime() - Date.now()
                            );
                            statusText += ` until ${this.getTimeoutString(this.expiresAt)}`;
                        } else {
                            this.activeTimer = false;
                            this.expiresAt = false;
                            statusText += '; Timer Expired';
                        }
                    } catch (e) {
                        this.setStatusFailed(e.message);
                        throw e;
                    }
                }
            }

            this.setStatusSuccess(statusText);
        }

        setStatus(
            opts = {
                shape: 'dot',
                fill: 'blue',
                text: ''
            }
        ) {
            this.node.status(opts);
        }

        camelize(value) {
            return slugify(value, {
                replacement: '_',
                remove: /[^A-Za-z0-9-_~ ]/,
                lower: true
            });
        }

        async registerEntity() {
            if (this.websocketClient.integrationVersion === 0) {
                this.error(this.integrationErrorMessage);
                this.setStatusFailed('Error');
                return;
            }

            if (this.registered) {
                return;
            }

            const config = {};
            this.nodeConfig.config
                .filter(c => c.value.length)
                .forEach(e => (config[e.property] = e.value));

            const payload = {
                type: 'nodered/discovery',
                server_id: this.nodeConfig.server.id,
                node_id: this.id,
                component: 'sensor',
                config: config
            };

            // Add state and attributes to payload if resend enabled
            if (this.nodeConfig.resend && this.lastPayload) {
                payload.state = this.lastPayload.state;
                payload.attributes = this.lastPayload.attributes;
            }

            this.debugToClient(payload);

            await this.websocketClient.send(payload);
            let statusText = `State: ${this.fsm.state}`;
            if (this.activeTimer && this.expiresAt !== false) {
                statusText += ` until ${this.getTimeoutString(this.expiresAt)}`
            }
            this.setStatusSuccess(`${statusText}; Registered`);
            this.registered = true;
        }

        onHaEventsClose() {
            super.onHaEventsClose();

            this.registered = false;
        }

        async onConfigUpdate() {
            this.registerEntity();
        }

        onHaIntegration(type) {
            super.onHaIntegration(type);

            if (type === 'unloaded') {
                this.error(
                    'Node-RED custom integration has been removed from Home Assistant it is needed for this node to function.'
                );
                this.setStatusFailed('Error');
            }
        }

        onClose(removed) {
            super.onClose(removed);

            if (this.registered && this.isConnected && removed) {
                const payload = {
                    type: 'nodered/discovery',
                    server_id: this.nodeConfig.server.id,
                    node_id: this.id,
                    component: 'sensor',
                    remove: true
                };

                this.websocketClient.send(payload);
            }
        }

        async onInput({ parsedMessage, message }) {
            this.handleInput({ parsedMessage, message });
        }

        handleInput({ parsedMessage, message }) {
            clearTimeout(this.timeoutId);

            if (
                Object.prototype.hasOwnProperty.call(message, 'reset') &&
                this.activeTimer
            ) {
                this.setStatusSuccess(`State: ${this.fsm.state}; Timer Reset`);
                this.activeTimer = false;
                // TODO: Status is not sent to HA if msg.reset is reeceived.
                return;
            }

            this.activeTimer = false;

            if (this.websocketClient.integrationVersion === 0) {
                this.error(this.integrationErrorMessage);
                this.setStatusFailed('Error');
                return false;
            }

            let trigger = RED.util.evaluateNodeProperty(
                this.nodeConfig.triggerProperty,
                this.nodeConfig.triggerPropertyType,
                this,
                message
            );

            if (Object.prototype.hasOwnProperty.call(message, 'initalize')) {
                trigger = 'builtin_initialize_reset';
            } else if (
                Object.prototype.hasOwnProperty.call(message, 'forceState') &&
                typeof message.forceState === 'string'
            ) {
                trigger = 'builtin_force_state';
            }

            if (trigger === undefined) {
                return;
            }

            let transition = false;

            if (this.fsm.can(trigger)) {
                trigger = this.camelize(trigger);
                if (trigger === 'builtin_force_state') {
                    this.fsm.builtin_force_state(message.forceState);
                } else {
                    this.fsm[trigger]();
                }
                transition = true;
            } else if (this.nodeConfig.throwException) {
                this.node.error('Invalid transition', message);
                return null;
            }

            const attr = {};
            let statusText = `State: ${this.fsm.state}`;
            let timeout = this.states.filter(s => s.name === this.fsm.state)[0]
                .stateTimeout;
            if (
                timeout &&
                Object.prototype.hasOwnProperty.call(message, 'timeout')
            ) {
                timeout = parsedMessage.timeout.value;
            }

            if (!isNaN(timeout) && timeout > 0) {
                let timeoutUnits = this.nodeConfig.timeoutUnits;
                if (
                    Object.prototype.hasOwnProperty.call(
                        parsedMessage,
                        'timeoutUnits'
                    )
                ) {
                    timeoutUnits = parsedMessage.timeoutUnits.value;
                }

                statusText += this.getWaitStatusText(timeout, timeoutUnits);
                timeout = this.getTimeoutInMilliseconds(timeout, timeoutUnits);
                this.expiresAt = new Date(Date.now() + timeout);
                attr.expires_at = this.expiresAt.toISOString();

                this.createTimer(parsedMessage, message, timeout);
            }

            const attributes = Object.prototype.hasOwnProperty.call(
                parsedMessage,
                'attributes'
            )
                ? this.getAttributes(parsedMessage)
                : this.nodeConfig.attributes;

            try {
                attributes.forEach(x => {
                    // Change string to lower-case and remove unwanted characters
                    const property = slugify(x.property, {
                        replacement: '_',
                        remove: /[^A-Za-z0-9-_~ ]/,
                        lower: true
                    });
                    attr[property] = this.getValue(
                        x.value,
                        x.valueType,
                        message
                    );
                });
            } catch (e) {
                this.setStatusFailed('Error');
                this.node.error(`Attribute: ${e.message}`, message);
                return;
            }

            const payload = {
                type: 'nodered/entity',
                server_id: this.nodeConfig.server.id,
                node_id: this.id,
                state: this.fsm.state,
                attributes: attr
            };
            this.lastPayload = {
                state: this.fsm.state,
                attributes: attr,
                activeTimer: this.activeTimer
            };
            this.saveNodeData('lastPayload', this.lastPayload);
            this.debugToClient(payload);

            if (!this.isConnected) {
                this.setStatusFailed('No Connection');
                this.error(
                    'Sensor update attempted without connection to server.',
                    message
                );
            } else {
                this.websocketClient
                    .send(payload)
                    .then(() => {
                        this.setStatusSuccess(statusText);
                    })
                    .catch(err => {
                        this.error(
                            `Entity API error. ${
                                err.message
                                    ? ` Error Message: ${err.message}`
                                    : ''
                            }`,
                            message
                        );
                        this.setStatusFailed('API Error');
                    });
            }

            if (transition || !this.nodeConfig.outputStateChangeOnly) {
                if (this.nodeConfig.outputLocationType !== 'none') {
                    this.setContextValue(
                        this.fsm.state,
                        this.nodeConfig.outputLocationType || 'msg',
                        this.nodeConfig.outputLocation || 'payload',
                        message
                    );
                }

                if (!this.nodeConfig.discreteOutputs) {
                    this.send(message);
                } else {
                    const onward = [];
                    onward[
                        this.states.findIndex(
                            item => item.name === this.fsm.state
                        )
                    ] = message;
                    this.send(onward);
                }
            }
        }

        createTimer(parsedMessage, message, timeout) {
            this.activeTimer = true;
            this.timeoutId = setTimeout(async () => {
                this.activeTimer = false;

                // Delete any overrides from the previous message so we can reuse.
                if (Object.prototype.hasOwnProperty.call(message, 'timeout')) {
                    delete message.timeout;
                }
                if (
                    Object.prototype.hasOwnProperty.call(
                        parsedMessage,
                        'timeoutUnits'
                    )
                ) {
                    delete parsedMessage.timeoutUnits;
                }

                // Set the trigger to `timeout`
                this.setContextValue(
                    'timeout',
                    this.nodeConfig.triggerPropertyType || 'msg',
                    this.nodeConfig.triggerProperty || 'payload',
                    message
                );

                // Call input handler as if this was a new message.
                this.handleInput({
                    parsedMessage: parsedMessage,
                    message: message
                });
            }, timeout);
        }

        getAttributes(parsedMessage) {
            let attributes = [];
            if (
                parsedMessage.attributes.source !== 'message' ||
                this.nodeConfig.inputOverride === 'block'
            ) {
                attributes = this.nodeConfig.attributes;
            } else {
                if (this.nodeConfig.inputOverride === 'merge') {
                    const keys = Object.keys(
                        parsedMessage.attributes.value
                    ).map(e => e.toLowerCase());
                    this.nodeConfig.attributes.forEach(ele => {
                        if (!keys.includes(ele.property.toLowerCase())) {
                            attributes.push(ele);
                        }
                    });
                }
                for (const [prop, val] of Object.entries(
                    parsedMessage.attributes.value
                )) {
                    attributes.push({
                        property: prop,
                        value: val
                    });
                }
            }
            return attributes;
        }

        getValue(value, valueType, msg) {
            let val;
            switch (valueType) {
                case 'msg':
                case 'flow':
                case 'global':
                    val = this.getContextValue(valueType, value, msg);
                    break;
                case 'bool':
                    val = value === 'true';
                    break;
                case 'json':
                    try {
                        val = JSON.parse(value);
                    } catch (e) {
                        // error parsing
                    }
                    break;
                case 'date':
                    val = Date.now();
                    break;
                case 'jsonata':
                    try {
                        val = this.evaluateJSONata(value, msg);
                    } catch (e) {
                        throw new Error(`JSONata Error: ${e.message}`);
                    }
                    break;
                case 'num':
                    val = Number(value);
                    break;
                default:
                    val = value;
            }
            return val;
        }

        async loadPersistedData() {
            let data;
            try {
                data = await this.getNodeData();
            } catch (e) {
                this.error(e.message, {});
            }

            if (!data) return;

            if (Object.prototype.hasOwnProperty.call(data, 'lastPayload')) {
                this.lastPayload = data.lastPayload;
            }
        }

        getWaitStatusText(timeout, timeoutUnits) {
            const timeoutMs = this.getTimeoutInMilliseconds(
                timeout,
                timeoutUnits
            );
            switch (timeoutUnits) {
                case 'milliseconds':
                    return ` for ${timeout} milliseconds`;
                case 'hours':
                case 'days':
                    return ` until ${this.timeoutStatus(timeoutMs)}`;
                case 'minutes':
                default:
                    return ` for ${timeout} ${timeoutUnits}: ${this.timeoutStatus(
                        timeoutMs
                    )}`;
            }
        }

        getTimeoutInMilliseconds(timeout, timeoutUnits) {
            switch (timeoutUnits) {
                case 'milliseconds':
                    return timeout;
                case 'minutes':
                    return timeout * (60 * 1000);
                case 'hours':
                    return timeout * (60 * 60 * 1000);
                case 'days':
                    return timeout * (24 * 60 * 60 * 1000);
                default:
                    return timeout * 1000;
            }
        }

        timeoutStatus(milliseconds = 0) {
            const timeout = Date.now() + milliseconds;
            return this.getTimeoutString(new Date(timeout));
        }

        getTimeoutString(expiresAt) {
            const timeoutStr = expiresAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour12: false,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });

            return timeoutStr;
        }
    }

    RED.nodes.registerType('ha-state-machine', StateMachineNode);
};
