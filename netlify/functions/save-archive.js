// Netlify Function to save draft archives to Neon database
const { neon } = require('@neondatabase/serverless');

// Reuse database connection across requests for better performance
let cachedConnection = null;
let connectionExpiry = 0;
const CONNECTION_TTL = 300000; // 5 minutes

const getConnection = (databaseUrl) => {
    const now = Date.now();
    if (!cachedConnection || now > connectionExpiry) {
        console.log('Creating new database connection');
        cachedConnection = neon(databaseUrl);
        connectionExpiry = now + CONNECTION_TTL;
    }
    return cachedConnection;
};

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
        
        // Validate the archive data structure
        if (!data.archive || !data.archive.id || !data.archive.name) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid archive data structure' })
            };
        }

        const sql = getConnection(databaseUrl);
        const archive = data.archive;

        // Create archives table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS draft_archives (
                id VARCHAR(255) PRIMARY KEY,
                name TEXT NOT NULL,
                date TIMESTAMP NOT NULL,
                settings JSONB NOT NULL,
                teams JSONB NOT NULL,
                picks JSONB NOT NULL,
                keepers JSONB DEFAULT '{}'::jsonb,
                completed BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Insert or update the archive
        await sql`
            INSERT INTO draft_archives (
                id, name, date, settings, teams, picks, keepers, completed, updated_at
            ) VALUES (
                ${archive.id},
                ${archive.name},
                ${archive.date},
                ${JSON.stringify(archive.settings)},
                ${JSON.stringify(archive.teams)},
                ${JSON.stringify(archive.picks)},
                ${JSON.stringify(archive.keepers || {})},
                ${archive.completed || true},
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                date = EXCLUDED.date,
                settings = EXCLUDED.settings,
                teams = EXCLUDED.teams,
                picks = EXCLUDED.picks,
                keepers = EXCLUDED.keepers,
                completed = EXCLUDED.completed,
                updated_at = NOW()
        `;
        
        console.log('Successfully saved archive to database:', archive.id);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, archiveId: archive.id })
        };

    } catch (error) {
        console.error('Archive save error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save archive', details: error.message })
        };
    }
};