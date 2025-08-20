// Initialize database tables for fantasy draft tracker
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (!process.env.DATABASE_URL) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'DATABASE_URL not configured' })
        };
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Create draft_state table
        await sql`
            CREATE TABLE IF NOT EXISTS draft_state (
                id SERIAL PRIMARY KEY,
                draft_id VARCHAR(255) NOT NULL DEFAULT 'main',
                picks JSONB DEFAULT '[]'::jsonb,
                keepers JSONB DEFAULT '{}'::jsonb,
                current_pick JSONB,
                teams JSONB DEFAULT '[]'::jsonb,
                draft_settings JSONB DEFAULT '{}'::jsonb,
                recent_pick JSONB,
                draft_completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Create index on draft_id for faster queries
        await sql`
            CREATE INDEX IF NOT EXISTS idx_draft_state_draft_id 
            ON draft_state(draft_id)
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Database initialized successfully' 
            })
        };

    } catch (error) {
        console.error('Database initialization error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to initialize database', 
                details: error.message 
            })
        };
    }
};