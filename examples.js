#!/usr/bin/env node

// Example usage script for TwitterAPI MCP Server
// This script demonstrates the available tools and usage

const { execSync } = require('child_process');

function runMCPCommand(request) {
  try {
    const result = execSync(`echo '${JSON.stringify(request)}' | node build/index.js`, {
      encoding: 'utf8',
      timeout: 10000
    });
    
    // Parse the JSON response from stdout
    const lines = result.split('\n').filter(line => line.trim());
    const jsonLine = lines.find(line => line.startsWith('{'));
    
    if (jsonLine) {
      return JSON.parse(jsonLine);
    }
    throw new Error('No JSON response found');
  } catch (error) {
    throw new Error(`MCP command failed: ${error.message}`);
  }
}

async function main() {
  console.log('🐦 TwitterAPI MCP Server Example Usage\n');

  try {
    // List available tools
    console.log('📋 Listing available tools...');
    const toolsResponse = runMCPCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });
    
    if (toolsResponse.result && toolsResponse.result.tools) {
      const tools = toolsResponse.result.tools;
      console.log(`Found ${tools.length} tools:\n`);
      
      tools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}`);
        console.log(`   Description: ${tool.description}`);
        console.log(`   Required params: ${tool.inputSchema.required?.join(', ') || 'none'}\n`);
      });
    }

    console.log('💡 Example usage with API key:');
    console.log('TWITTERAPI_API_KEY="your_key" node examples.js\n');

    console.log('🔧 To test a specific tool call:');
    console.log('echo \'{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_user_by_username", "arguments": {"username": "elonmusk"}}}\' | TWITTERAPI_API_KEY="your_key" node build/index.js\n');

    console.log('🏠 Claude Desktop Configuration:');
    console.log(JSON.stringify({
      "mcpServers": {
        "twitterapi": {
          "command": "npx",
          "args": ["twitterapi-mcp"],
          "env": {
            "TWITTERAPI_API_KEY": "your_api_key_here"
          }
        }
      }
    }, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}