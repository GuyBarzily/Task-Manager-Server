const { WebSocketServer } = require('ws');

let clients = [];  // Store all WebSocket clients

// Set up the WebSocket server for handling subscriptions
const setupWebSocketServer = (httpServer) => {
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',

        verifyClient: (info, done) => {
            // Allow connections from any origin (or adjust as needed)
            done(true);
        },
    });

    // Handle incoming WebSocket connections
    wsServer.on('connection', (socket) => {
        console.log('WebSocket: New connection established');

        // Add the client socket to the clients array
        clients.push(socket);

        // Handle incoming messages from the client
        socket.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            console.log('WebSocket message received:', parsedMessage);
        });

        // Send a "ping" message every 30 seconds to keep the connection alive
        const pingInterval = setInterval(() => {
            if (socket.readyState === socket.OPEN) {
                socket.ping('ping');
                console.log('WebSocket: Ping sent');
            }
        }, 30000);  // 30 seconds interval

        // Listen for pong responses from the client to confirm the connection is alive
        socket.on('pong', () => {
            console.log('WebSocket: Pong received');
        });

        // When a client disconnects, remove it from the clients array
        socket.on('close', () => {
            console.log('WebSocket: Connection closed');
            clearInterval(pingInterval); // Clear the ping interval when the socket closes
            clients = clients.filter(client => client !== socket);
        });

        socket.on('error', (err) => {
            console.log('WebSocket Error:', err);
        });
    });
};

// Export the method to broadcast messages to all connected WebSocket clients
const broadcastToClients = (message) => {
    clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

module.exports = { setupWebSocketServer, broadcastToClients };
