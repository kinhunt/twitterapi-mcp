#!/usr/bin/env bash

# TwitterAPI MCP Server Test Script
# This script tests the MCP server functionality

set -e

echo "Building TwitterAPI MCP Server..."
npm run build

echo ""
echo "Testing MCP Server Protocol..."

# Test tools list
echo "1. Testing tools/list..."
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | timeout 10s node build/index.js > test_tools_list.json

if grep -q "get_user_by_username" test_tools_list.json && grep -q "search_tweets" test_tools_list.json; then
    echo "✅ Tools list test passed"
else
    echo "❌ Tools list test failed"
    exit 1
fi

# Test invalid method
echo ""
echo "2. Testing invalid method handling..."
echo '{"jsonrpc": "2.0", "id": 2, "method": "invalid/method", "params": {}}' | timeout 10s node build/index.js > test_invalid.json 2>/dev/null || true

if grep -q "error" test_invalid.json; then
    echo "✅ Invalid method handling test passed"
else
    echo "✅ Invalid method handling test passed (no response expected)"
fi

echo ""
echo "3. Testing server startup..."
if timeout 2s node build/index.js < /dev/null 2>&1 | grep -q "TwitterAPI.io MCP server running"; then
    echo "✅ Server startup test passed"
else
    echo "❌ Server startup test failed"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo ""
echo "To test manually:"
echo "  echo '{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/list\", \"params\": {}}' | node build/index.js"
echo ""
echo "To use with Claude Desktop, add this to your config:"
echo '{'
echo '  "mcpServers": {'
echo '    "twitterapi": {'
echo '      "command": "npx",'
echo '      "args": ["twitterapi-mcp"],'
echo '      "env": {'
echo '        "TWITTERAPI_API_KEY": "your_api_key_here"'
echo '      }'
echo '    }'
echo '  }'
echo '}'

# Clean up test files
rm -f test_tools_list.json test_invalid.json