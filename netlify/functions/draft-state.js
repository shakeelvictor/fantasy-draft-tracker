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
            // File doesn't exist or is corrupted, return proper initial state
            console.log('No existing state file, returning initial state');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    timestamp: Date.now(),
                    state: {
                        draftSettings: {
                            teamCount: 11,
                            rounds: 20,
                            draftType: 'linear'
                        },
                        teams: [
                            { id: 'team-1', name: 'Ryaan', owner: 'Ryaan', color: '#ef4444' },
                            { id: 'team-2', name: 'Laura', owner: 'Laura', color: '#22c55e' },
                            { id: 'team-3', name: 'Andres', owner: 'Andres', color: '#3b82f6' },
                            { id: 'team-4', name: 'Vip', owner: 'Vip', color: '#f97316' },
                            { id: 'team-5', name: 'Hoss', owner: 'Hoss', color: '#a855f7' },
                            { id: 'team-6', name: 'Imran', owner: 'Imran', color: '#eab308' },
                            { id: 'team-7', name: 'Asher', owner: 'Asher', color: '#06b6d4' },
                            { id: 'team-8', name: 'Shak', owner: 'Shak', color: '#84cc16' },
                            { id: 'team-9', name: 'Anand', owner: 'Anand', color: '#f59e0b' },
                            { id: 'team-10', name: 'Dante', owner: 'Dante', color: '#8b5cf6' },
                            { id: 'team-11', name: 'Samson', owner: 'Samson', color: '#ec4899' }
                        ],
                        picks: [],
                        currentPick: {
                            round: 1,
                            pickNumber: 1,
                            pickInRound: 1,
                            teamId: 'team-1'
                        },
                        keepers: {},
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
