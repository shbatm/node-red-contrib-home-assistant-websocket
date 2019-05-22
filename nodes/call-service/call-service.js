/* eslint-disable camelcase */
const BaseNode = require('../../lib/base-node');
// const mustache = require('mustache');
const RenderTemplate = require('../../lib/mustache-context');

module.exports = function(RED) {
    const nodeOptions = {
        debug: true,
        config: {
            service_domain: {},
            service: {},
            data: {},
            mergecontext: {},
            name: {},
            server: { isNode: true },
            output_location: {},
            output_location_type: {}
        }
    };

    class CallServiceNode extends BaseNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
        }
        isObjectLike(v) {
            return v !== null && typeof v === 'object';
        }
        // Disable connection status for api node
        setConnectionStatus() {}
        tryToObject(v) {
            if (!v) return null;
            try {
                return JSON.parse(v);
            } catch (e) {
                return v;
            }
        }
        onInput({ message }) {
            const config = this.nodeConfig;
            if (
                config.server.websocket.connectionState !==
                config.server.websocket.CONNECTED
            ) {
                this.setStatusFailed('No Connection');
                this.error(
                    'Call-Service attempted without connection to server.',
                    message
                );

                return;
            }

            let payload, payloadDomain, payloadService;

            if (message && message.payload) {
                payload = this.tryToObject(message.payload);
                payloadDomain = this.utils.selectn('domain', payload);
                payloadService = this.utils.selectn('service', payload);
            }
            const configDomain = config.service_domain;
            const configService = config.service;
            const serverName = this.utils.toCamelCase(config.server.name);
            const context = this.node.context();
            const apiDomain = RenderTemplate(
                payloadDomain || configDomain,
                message,
                context,
                serverName
            );
            const apiService = RenderTemplate(
                payloadService || configService,
                message,
                context,
                serverName
            );
            const configData = RenderTemplate(
                config.data,
                message,
                context,
                serverName
            );
            const apiData = this.getApiData(payload, configData);

            if (!apiDomain || !apiService) {
                this.error(
                    `call service node is missing api "${
                        !apiDomain ? 'domain' : 'service'
                    }" property, not found in config or payload`,
                    message
                );
                this.setStatusFailed('Error');
                return;
            }

            this.debug(
                `Calling Service: ${apiDomain}:${apiService} -- ${JSON.stringify(
                    apiData || {}
                )}`
            );

            const msgPayload = {
                domain: apiDomain,
                service: apiService,
                data: apiData || null
            };

            this.setStatusSending();

            return config.server.websocket
                .callService(apiDomain, apiService, apiData)
                .then(() => {
                    this.setStatusSuccess(`${apiDomain}.${apiService} called`);

                    this.setContextValue(
                        msgPayload,
                        config.output_location_type || 'msg',
                        config.output_location || 'payload',
                        message
                    );
                    this.send(message);
                })
                .catch(err => {
                    this.error(
                        `Call-service API error.${
                            err.message ? ` Error Message: ${err.message}` : ''
                        }`,
                        message
                    );

                    this.setStatusFailed('API Error');
                });
        }

        getApiData(payload, data) {
            let apiData;
            let contextData = {};

            let payloadData = this.utils.selectn('data', payload);
            let configData = this.tryToObject(data);
            payloadData = payloadData || {};
            configData = configData || {};

            // Calculate payload to send end priority ends up being 'Config, Global Ctx, Flow Ctx, Payload' with right most winning
            if (this.nodeConfig.mergecontext) {
                const ctx = this.node.context();
                let flowVal = ctx.flow.get(this.nodeConfig.mergecontext);
                let globalVal = ctx.global.get(this.nodeConfig.mergecontext);
                flowVal = flowVal || {};
                globalVal = globalVal || {};
                contextData = this.utils.merge({}, globalVal, flowVal);
            }

            apiData = this.utils.merge(
                {},
                configData,
                contextData,
                payloadData
            );

            return apiData;
        }
    }

    RED.nodes.registerType('api-call-service', CallServiceNode);
};
