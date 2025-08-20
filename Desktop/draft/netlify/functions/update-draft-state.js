// Netlify Function to handle draft state updates
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
    // Set CORS headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    // Handle preflight OPTIONS requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Validate the data structure
        if (!data.timestamp || !data.state) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid data structure' })
            };
        }

        // Store the state in a simple JSON file
        const stateFilePath = path.join('/tmp', 'draft-state.json');
        await fs.writeFile(stateFilePath, JSON.stringify(data));
        
        console.log('Successfully saved draft state with timestamp:', data.timestamp);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, timestamp: data.timestamp })
        };

    } catch (error) {
        console.error('Error updating draft state:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
