const StateMachine = require('javascript-state-machine');
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
            transitions: nodeConfig => nodeConfig.transitions || []
        },
        input: {
            attributes: {
                messageProp: 'payload.attributes',
                configProp: 'attributes',
                default: []
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

            let initState = this.states[0];
            if (this.lastPayload && 'state' in this.lastPayload) {
                initState = this.lastPayload.state;
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
            this.setStatusSuccess(`State: ${initState}`);
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
            this.setStatusSuccess(`State: ${this.fsm.state}; Registered`);
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
            if (!this.isConnected) {
                this.setStatusFailed('No Connection');
                this.error(
                    'Sensor update attempted without connection to server.',
                    message
                );

                return;
            }

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

            if (trigger === undefined) {
                return;
            }

            const attributes = this.getAttributes(parsedMessage);

            const attr = {};
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

            let transition = false;

            if (this.fsm.can(trigger)) {
                trigger = this.camelize(trigger);
                this.fsm[trigger]();
                transition = true;
            } else if (this.nodeConfig.throwException) {
                this.node.error('Invalid transition', message);
                return null;
            }

            if (transition || !this.nodeConfig.outputStateChangeOnly) {
                const payload = {
                    type: 'nodered/entity',
                    server_id: this.nodeConfig.server.id,
                    node_id: this.id,
                    state: this.fsm.state,
                    attributes: attr
                };
                this.lastPayload = {
                    state: this.fsm.state,
                    attributes: attr
                };
                this.saveNodeData('lastPayload', this.lastPayload);
                this.debugToClient(payload);

                this.websocketClient
                    .send(payload)
                    .then(() => {
                        this.setStatusSuccess(this.fsm.state);

                        if (this.nodeConfig.outputLocationType !== 'none') {
                            this.setContextValue(
                                payload,
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
                                this.states.indexOf(this.fsm.state)
                            ] = message;
                            this.send(onward);
                        }
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
        }

        handleTriggerMessage(data = {}) {
            const msg = {
                topic: 'triggered',
                payload: data.payload
            };

            if (this.isEnabled) {
                this.setStatusSuccess('triggered');
                this.send([msg, null]);
            } else {
                this.setStatusFailed('triggered');
                this.send([null, msg]);
            }
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
    }

    RED.nodes.registerType('ha-state-machine', StateMachineNode);
};
