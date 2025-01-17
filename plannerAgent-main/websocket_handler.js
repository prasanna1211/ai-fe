const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class WebSocketHandler {
    constructor() {
        this.clients = new Map();
        this.searchCallback = searchCallback;
    }

    async verifyGoogleToken(token) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            return ticket.getPayload();
        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }

    handleConnection(ws) {
        const clientId = Math.random().toString(36).substring(7);
        let isAuthenticated = false;

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === 'auth') {
                    const payload = await this.verifyGoogleToken(data.token);
                    if (!payload) {
                        console.log('Authentication failed for client:', clientId);
                        ws.close();
                        return;
                    }
                    isAuthenticated = true;
                    this.clients.set(clientId, { ws, userId: payload.sub });
                    console.log('Client authenticated:', clientId, payload.email);
                    return;
                }

                if (!isAuthenticated) {
                    console.log('Unauthenticated request from client:', clientId);
                    ws.close();
                    return;
                }

                if (data.searchText) {
                    console.log(`Processing search request: "${data.searchText}" from client: ${clientId}`);
                    this.handleSearch(data.searchText, clientId);
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected:', clientId);
            this.clients.delete(clientId);
        });
    }

    handleSearch(searchText, clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        const { runAgent } = require("./app");
        const renderCallback = {
            renderPlanSteps: (title, steps) => {
                this.renderPlanSteps(clientId, title, steps);
            },
            renderCurrentStepTitle: (header, value) => {
                this.renderCurrentStepTitle(clientId, header, value);
            },
            renderStepResult: (step, resultTitle) => {
                this.renderStepResult(clientId, step, resultTitle);
            },
            renderLog: (log) => {
                this.renderLog(clientId, log);
            },
        };

        runAgent(searchText, renderCallback).catch(error => {
            console.error('Error in runAgent:', error);
            this.renderLog(clientId, "❌ An error occurred while processing your request.");
        });
    }

    renderPlanSteps(clientId, title, steps) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.ws.send(JSON.stringify({
            key: 'renderListSteps',
            title,
            steps,
        }));
    }

    renderCurrentStepTitle(clientId, header, value) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.ws.send(JSON.stringify({
            key: 'renderCurrentStepTitle',
            header,
            value,
        }));
    }

    renderStepResult(clientId, step, resultTitle) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.ws.send(JSON.stringify({
            key: 'renderStepResult',
            step,
            resultTitle,
        }));
    }

    renderLog(clientId, log) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.ws.send(JSON.stringify({
            key: 'renderLog',
            log,
        }));
    }
}

module.exports = WebSocketHandler; 