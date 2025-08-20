// Netlify Function to serve draft state for real-time collaboration
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
    // Set CORS headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };
    // Handle preflight OPTIONS requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Try to read the state file
        const stateFilePath = path.join('/tmp', 'draft-state.json');

        try {
            const data = await fs.readFile(stateFilePath, 'utf8');
            const parsedData = JSON.parse(data);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(parsedData)
            };
        } catch (fileError) {
            // File doesn't exist or is corrupted, return empty state
            console.log('No existing state file, returning default state');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    timestamp: Date.now(),
                    state: {
                        picks: [],
                        currentPick: null,
                        keepers: {},
                        teams: [],
                        draftSettings: {},
                        recentPick: null,
                        draftJustCompleted: false
                    }
                })
            };
        }

    } catch (error) {
        console.error('Error serving draft state:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
