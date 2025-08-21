// Netlify Function to delete draft archives from Neon database
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
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

    // Only allow DELETE requests
    if (event.httpMethod !== 'DELETE') {
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
        // Get archive ID from query parameters
        const archiveId = event.queryStringParameters?.id;
        
        if (!archiveId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Archive ID is required' })
            };
        }

        const sql = getConnection(databaseUrl);

        // Check if archive exists before deleting
        const existingArchive = await sql`
            SELECT id, name FROM draft_archives WHERE id = ${archiveId}
        `;

        if (existingArchive.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Archive not found' })
            };
        }

        // Delete the archive
        const result = await sql`
            DELETE FROM draft_archives WHERE id = ${archiveId}
        `;
        
        console.log(`Successfully deleted archive from database: ${archiveId}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                deletedArchiveId: archiveId,
                archiveName: existingArchive[0].name
            })
        };

    } catch (error) {
        console.error('Archive deletion error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete archive', details: error.message })
        };
    }
};