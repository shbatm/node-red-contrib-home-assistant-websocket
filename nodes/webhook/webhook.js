module.exports = function(RED) {
    const EventsNode = require('../../lib/events-node');

    const nodeOptions = {
        config: {
            name: {},
            server: { isNode: true },
            outputs: 1,
            webhookId: {},
            exposeToHomeAssistant: nodeConfig => true,
            payloadLocation: nodeConfig =>
                nodeConfig.payloadLocation || 'payload',
            payloadLocationType: nodeConfig =>
                nodeConfig.payloadLocationType || 'msg',
            headersLocation: {},
            headersLocationType: nodeConfig =>
                nodeConfig.headersLocationType || 'none'
        }
    };

    class Webhook extends EventsNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            if (this.isConnected) {
                this.registerEntity();
            }
        }

        onHaEventsClose() {
            super.onHaEventsClose();

            this.removeWebhook = null;
        }

        async onEvent(evt) {
            const message = {
                topic: this.nodeConfig.webhookId
            };

            // Set Payload Location
            this.setContextValue(
                evt.data.payload,
                this.nodeConfig.payloadLocationType,
                this.nodeConfig.payloadLocation,
                message
            );
            // Set Headers Location
            this.setContextValue(
                evt.data.headers,
                this.nodeConfig.headersLocationType,
                this.nodeConfig.headersLocation,
                message
            );
            this.setStatusSuccess('Received');
            this.send(message);
        }

        onHaIntegration(type) {
            super.onHaIntegration(type);

            if (type === 'unloaded') {
                if (this.removeWebhook) {
                    this.removeWebhook();
                    this.removeWebhook = null;
                }
                this.error(
                    'Node-RED custom integration has been removed from Home Assistant it is needed for this node to function.'
                );
                this.setStatusFailed('Error');
            }
        }

        async registerEntity() {
            if (super.registerEntity() === false) {
                return;
            }

            if (!this.nodeConfig.webhookId) {
                this.error(this.integrationErrorMessage);
                this.setStatusFailed('Error');
                return;
            }

            if (!this.removeWebhook) {
                this.removeWebhook = await this.websocketClient.client.subscribeMessage(
                    this.onEvent.bind(this),
                    {
                        type: 'nodered/webhook',
                        webhook_id: this.nodeConfig.webhookId,
                        name: this.id,
                        server_id: this.nodeConfig.server.id
                    }
                );
            }
            this.setStatusSuccess('Registered');
            this.registered = true;
        }

        onClose(removed) {
            super.onClose(removed);

            if (this.registered && this.isConnected && this.removeWebhook) {
                this.removeWebhook().catch(() => {});
            }
        }
    }

    RED.nodes.registerType('ha-webhook', Webhook);
};
