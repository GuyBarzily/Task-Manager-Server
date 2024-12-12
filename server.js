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

    // Initialize Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    // Start Apollo Server
    await server.start();

    // Apply middleware for GraphQL endpoint
    app.use(
        '/graphql',               // The GraphQL endpoint
        cors(),                   // Cross-origin resource sharing middleware
        bodyParser.json(),        // Body parser to handle JSON requests
        expressMiddleware(server) // Connect Apollo Server with Express
    );

    // MongoDB connection using environment variable URI
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.log('MongoDB connection error:', err));

    // Start the Express server
    const PORT = process.env.PORT || 4000; // Use port from .env or default to 4000
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}/graphql`);
    });
}

// Run the server
startServer();
