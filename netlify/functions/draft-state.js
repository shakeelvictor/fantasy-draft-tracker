// Netlify Function to serve draft state from Neon database
const { neon } = require('@neondatabase/serverless');

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

    if (!process.env.DATABASE_URL) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database not configured' })
        };
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const draftId = 'main'; // Default draft ID

        // Get draft state from database
        const result = await sql`
            SELECT * FROM draft_state 
            WHERE draft_id = ${draftId} 
            ORDER BY updated_at DESC 
            LIMIT 1
        `;

        if (result.length > 0) {
            const draftState = result[0];
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    timestamp: new Date(draftState.updated_at).getTime(),
                    state: {
                        picks: draftState.picks || [],
                        keepers: draftState.keepers || {},
                        currentPick: draftState.current_pick,
                        teams: draftState.teams || [],
                        draftSettings: draftState.draft_settings || {},
                        recentPick: draftState.recent_pick,
                        draftJustCompleted: draftState.draft_completed || false
                    }
                })
            };
        } else {
            // No draft state exists, return initial state
            console.log('No draft state found, returning initial state');
            const initialState = {
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
            };

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    timestamp: Date.now(),
                    state: initialState
                })
            };
        }

    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database error', details: error.message })
        };
    }
};
