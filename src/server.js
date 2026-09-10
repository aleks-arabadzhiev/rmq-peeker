const express = require('express');
const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'client')));

process.on('uncaughtException', (err) => {
    console.error('Global Uncaught Exception trapped:', err.message);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Global Unhandled Rejection trapped:', reason);
});

const getConfig = () => {
    const configPath = path.join(__dirname, 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

app.get('/api/connections', (req, res) => {
    try {
        const config = getConfig();
        const names = config.connections.map(c => c.name);
        res.json(names);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/peek/:connectionName', async (req, res) => {
    let connection = null;
    try {
        const config = getConfig();
        const connConfig = config.connections.find(c => c.name === req.params.connectionName);

        if (!connConfig) {
            return res.status(404).json({ error: "Connection configuration not found." });
        }

        const { protocol = 'amqp', host, port, vhost, username, password, queues, peek_count } = connConfig;
        const peekCount = peek_count || 5;

        const connectOptions = {
            protocol: protocol === 'amqps' ? 'amqps' : 'amqp',
            hostname: host,
            port: port,
            username: username,
            password: password,
            vhost: vhost
        };


        try {
            connection = await amqp.connect(connectOptions);
            
            connection.on('error', (err) => {
                console.error(`[AMQP Connection Error on ${connConfig.name}]:`, err.message);
            });

        } catch (err) {
            return res.status(500).json({ error: `AMQP Error: Failed to establish connection to ${host}:${port}.\nDetails: ${err.message}` });
        }

        let channel = await connection.createChannel();
        channel.on('error', (err) => {
            console.error(`[AMQP Channel Error]:`, err.message);
        });

        let results = [];

        for (const queue of queues) {
            let messages = [];
            let pulledMsgs = [];
            let totalMessages = 0;

            try {
                let firstMsg = await channel.get(queue, { noAck: false });

                if (firstMsg) {
                    totalMessages = firstMsg.fields.messageCount + 1;
                    pulledMsgs.push(firstMsg);
                    messages.push(firstMsg.content.toString());

                    const remainingToFetch = Math.min(peekCount - 1, firstMsg.fields.messageCount);
                    for (let i = 0; i < remainingToFetch; i++) {
                        let nextMsg = await channel.get(queue, { noAck: false });
                        if (nextMsg) {
                            pulledMsgs.push(nextMsg);
                            messages.push(nextMsg.content.toString());
                        }
                    }
                }

                for (let i = pulledMsgs.length - 1; i >= 0; i--) {
                    channel.reject(pulledMsgs[i], true);
                }

                results.push({ queue, totalMessages, peeked: messages, error: null });

            } catch (err) {
                results.push({ queue, totalMessages: 0, peeked: [], error: `Queue Error: ${err.message}` });
                // Attempt to recreate channel if it was closed
                try {
                    channel = await connection.createChannel();
                    channel.on('error', () => {});
                } catch (recreateErr) {
                    console.error("Failed to recreate channel:", recreateErr.message);
                }
            }
        }

        await channel.close();
        await connection.close();
        res.json(results);

    } catch (error) {
        console.error("Route processing error:", error.message);
        if (connection) {
            try { await connection.close(); } catch(e) {}
        }
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));