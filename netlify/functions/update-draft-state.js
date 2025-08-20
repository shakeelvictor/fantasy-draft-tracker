// Netlify Function to update draft state in Neon database
const { neon } = require('@neondatabase/serverless');

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

    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database not configured' })
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

        const sql = neon(databaseUrl);
        const draftId = 'main'; // Default draft ID
        const state = data.state;

        // Check if draft state exists
        const existing = await sql`
            SELECT id FROM draft_state WHERE draft_id = ${draftId}
        `;

        if (existing.length > 0) {
            // Update existing record
            await sql`
                UPDATE draft_state SET
                    picks = ${JSON.stringify(state.picks || [])},
                    keepers = ${JSON.stringify(state.keepers || {})},
                    current_pick = ${JSON.stringify(state.currentPick)},
                    teams = ${JSON.stringify(state.teams || [])},
                    draft_settings = ${JSON.stringify(state.draftSettings || {})},
                    recent_pick = ${JSON.stringify(state.recentPick)},
                    draft_completed = ${state.draftJustCompleted || false},
                    updated_at = NOW()
                WHERE draft_id = ${draftId}
            `;
        } else {
            // Insert new record
            await sql`
                INSERT INTO draft_state (
                    draft_id, 
                    picks, 
                    keepers, 
                    current_pick, 
                    teams, 
                    draft_settings, 
                    recent_pick, 
                    draft_completed,
                    updated_at
                ) VALUES (
                    ${draftId},
                    ${JSON.stringify(state.picks || [])},
                    ${JSON.stringify(state.keepers || {})},
                    ${JSON.stringify(state.currentPick)},
                    ${JSON.stringify(state.teams || [])},
                    ${JSON.stringify(state.draftSettings || {})},
                    ${JSON.stringify(state.recentPick)},
                    ${state.draftJustCompleted || false},
                    NOW()
                )
            `;
        }
        
        console.log('Successfully saved draft state to database with timestamp:', data.timestamp);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, timestamp: data.timestamp })
        };

    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database error', details: error.message })
        };
    }
};
