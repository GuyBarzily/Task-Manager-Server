const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

require('dotenv').config();

async function startServer() {
    const app = express();

    // Create the Apollo Server with schema and resolvers
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    // Start Apollo Server
    await server.start();

    // Apply middleware for GraphQL endpoint (queries and mutations)
    app.use(
        '/graphql',               // GraphQL endpoint for queries and mutations
        cors(),
        bodyParser.json(),
        expressMiddleware(server)
    );

    // MongoDB connection
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.log('MongoDB connection error:', err));

    const httpServer = app.listen(4000, () => {
        console.log('Server is running on http://localhost:4000/graphql');
    });

    // Set up the WebSocket server for handling subscriptions
    //setupWebSocketServer(httpServer);  // Initialize WebSocket server
}

// Start the server
startServer();

