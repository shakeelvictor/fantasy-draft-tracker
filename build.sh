#!/bin/bash
echo "🚀 Starting build process..."
echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

echo "🔍 Checking functions directory:"
if [ -d "netlify/functions" ]; then
    echo "✅ Functions directory exists"
    echo "📂 Functions directory contents:"
    ls -la netlify/functions/
    
    echo "🔍 Checking function files:"
    for file in netlify/functions/*.js; do
        if [ -f "$file" ]; then
            echo "📄 Found function: $(basename "$file")"
            echo "💾 File size: $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "unknown") bytes"
        fi
    done
else
    echo "❌ Functions directory not found!"
fi

echo "🏗️ Build complete!"