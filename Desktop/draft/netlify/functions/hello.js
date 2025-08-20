// Minimal test function to verify Netlify Functions are working
exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Hello from Netlify Functions!',
            timestamp: new Date().toISOString()
        })
    };
};