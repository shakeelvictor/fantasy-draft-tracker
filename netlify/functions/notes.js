// Handle pick notes operations (GET, POST, DELETE)
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database URL not configured' })
        };
    }

    try {
        const sql = neon(databaseUrl);

        // GET - Load all notes
        if (event.httpMethod === 'GET') {
            const rows = await sql`SELECT pick_key, note FROM pick_notes ORDER BY created_at ASC`;
            
            // Convert array of rows to object format expected by frontend
            const notes = {};
            rows.forEach(row => {
                notes[row.pick_key] = row.note;
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ notes })
            };
        }

        // POST - Save or update a note
        if (event.httpMethod === 'POST') {
            const { pickKey, note } = JSON.parse(event.body);

            if (!pickKey || typeof note !== 'string') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'pickKey and note are required' })
                };
            }

            // Use INSERT ... ON CONFLICT for upsert (PostgreSQL)
            await sql`
                INSERT INTO pick_notes (pick_key, note, updated_at)
                VALUES (${pickKey}, ${note}, NOW())
                ON CONFLICT (pick_key)
                DO UPDATE SET 
                    note = EXCLUDED.note,
                    updated_at = NOW()
            `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Note saved successfully',
                    pickKey,
                    note
                })
            };
        }

        // DELETE - Remove a note
        if (event.httpMethod === 'DELETE') {
            // Extract pickKey from path (e.g., /api/notes/1-team1)
            const pathParts = event.path.split('/');
            const pickKey = decodeURIComponent(pathParts[pathParts.length - 1]);

            if (!pickKey || pickKey === 'notes') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'pickKey is required in path' })
                };
            }

            const result = await sql`DELETE FROM pick_notes WHERE pick_key = ${pickKey}`;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Note deleted successfully',
                    pickKey,
                    deleted: result.count > 0
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Notes API error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error', 
                details: error.message 
            })
        };
    }
};