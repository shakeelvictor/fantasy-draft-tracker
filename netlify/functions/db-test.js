// Test function to verify Neon database connection and configuration
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

    const testResults = {
        timestamp: new Date().toISOString(),
        tests: []
    };

    // Test 1: Check if database URL is configured (try both variants)
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    testResults.tests.push({
        name: "Environment Variable Check",
        status: databaseUrl ? "✅ PASS" : "❌ FAIL",
        details: databaseUrl 
            ? `Database URL configured via ${process.env.NETLIFY_DATABASE_URL ? 'NETLIFY_DATABASE_URL' : 'DATABASE_URL'}` 
            : "No database URL environment variable found"
    });

    if (!databaseUrl) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(testResults)
        };
    }

    try {
        const sql = neon(databaseUrl);

        // Test 2: Database Connection
        try {
            await sql`SELECT 1 as test`;
            testResults.tests.push({
                name: "Database Connection",
                status: "✅ PASS",
                details: "Successfully connected to Neon database"
            });
        } catch (connError) {
            testResults.tests.push({
                name: "Database Connection",
                status: "❌ FAIL",
                details: `Connection failed: ${connError.message}`
            });
            throw connError;
        }

        // Test 3: Check if draft_state table exists
        try {
            const tableCheck = await sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'draft_state'
                )
            `;
            
            if (tableCheck[0].exists) {
                testResults.tests.push({
                    name: "Table Existence",
                    status: "✅ PASS",
                    details: "draft_state table exists"
                });

                // Test 4: Count existing records
                const count = await sql`SELECT COUNT(*) as count FROM draft_state`;
                testResults.tests.push({
                    name: "Data Check",
                    status: "✅ PASS", 
                    details: `Found ${count[0].count} draft record(s) in database`
                });

                // Test 5: Try a sample insert/update
                try {
                    const testDraftId = 'test-' + Date.now();
                    await sql`
                        INSERT INTO draft_state (
                            draft_id, picks, keepers, teams, draft_settings, updated_at
                        ) VALUES (
                            ${testDraftId},
                            '[]'::jsonb,
                            '{}'::jsonb,
                            '[]'::jsonb,
                            '{}'::jsonb,
                            NOW()
                        )
                    `;

                    // Clean up test record
                    await sql`DELETE FROM draft_state WHERE draft_id = ${testDraftId}`;

                    testResults.tests.push({
                        name: "Write Test",
                        status: "✅ PASS",
                        details: "Successfully inserted and deleted test record"
                    });
                } catch (writeError) {
                    testResults.tests.push({
                        name: "Write Test", 
                        status: "❌ FAIL",
                        details: `Write test failed: ${writeError.message}`
                    });
                }

            } else {
                testResults.tests.push({
                    name: "Table Existence",
                    status: "❌ FAIL",
                    details: "draft_state table does not exist. Run /api/init-db first."
                });
            }
        } catch (tableError) {
            testResults.tests.push({
                name: "Table Check",
                status: "❌ FAIL",
                details: `Table check failed: ${tableError.message}`
            });
        }

    } catch (error) {
        testResults.tests.push({
            name: "Database Test",
            status: "❌ FAIL",
            details: `Database error: ${error.message}`
        });
    }

    // Summary
    const passCount = testResults.tests.filter(t => t.status.includes("✅")).length;
    const totalCount = testResults.tests.length;
    
    testResults.summary = {
        overall: passCount === totalCount ? "✅ ALL TESTS PASSED" : `❌ ${passCount}/${totalCount} TESTS PASSED`,
        recommendation: passCount === totalCount 
            ? "Database is properly configured and ready to use!"
            : "Some issues detected. Check the failed tests above."
    };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(testResults, null, 2)
    };
};