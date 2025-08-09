const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (Shopify stores)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
}));

// Serve static files
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        // Set CORS headers for all static files
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
        
        // Set appropriate content types
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Jarvis Widget Frontend',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test_deployment.html'));
});

// Widget endpoints with explicit CORS
app.get('/shopify_chatbot_widget.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'shopify_chatbot_widget.js'));
});

app.get('/shopify_chatbot_widget.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'shopify_chatbot_widget.css'));
});

app.get('/shopify_chatbot_widget.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'shopify_chatbot_widget.html'));
});

// Handle 404s
app.use((req, res) => {
    res.status(404).json({
        error: 'File not found',
        available_files: [
            '/shopify_chatbot_widget.js',
            '/shopify_chatbot_widget.css',
            '/shopify_chatbot_widget.html',
            '/test_deployment.html',
            '/health'
        ]
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Jarvis Widget Frontend server running on port ${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🌐 Widget URL: http://localhost:${PORT}/shopify_chatbot_widget.js`);
});

module.exports = app;
