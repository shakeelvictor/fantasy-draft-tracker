// Netlify Function to load draft archives from Neon database
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

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
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
        const sql = neon(databaseUrl);

        // Check if archives table exists
        const tableExists = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'draft_archives'
            )
        `;

        if (!tableExists[0].exists) {
            // Return empty archives if table doesn't exist
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ archives: [] })
            };
        }

        // Get all archives ordered by date (newest first)
        const archives = await sql`
            SELECT * FROM draft_archives 
            ORDER BY date DESC
        `;

        // Transform the data to match the expected format
        const formattedArchives = archives.map(archive => ({
            id: archive.id,
            name: archive.name,
            date: archive.date,
            settings: archive.settings,
            teams: archive.teams,
            picks: archive.picks,
            keepers: archive.keepers || {},
            completed: archive.completed
        }));

        console.log(`Successfully loaded ${formattedArchives.length} archives from database`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ archives: formattedArchives })
        };

    } catch (error) {
        console.error('Archive load error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to load archives', details: error.message })
        };
    }
};