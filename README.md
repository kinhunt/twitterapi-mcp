# TwitterAPI MCP Server

A Model Context Protocol (MCP) server that provides access to Twitter data through the TwitterAPI.io service. This server enables Claude and other MCP clients to interact with Twitter's ecosystem without requiring Twitter developer account approval.

## Features

- **User Information**: Get detailed user profiles, followers, and following lists
- **Tweet Operations**: Search tweets, get tweet details, replies, and user timelines
- **Search Capabilities**: Advanced search for both tweets and users
- **Write Actions**: Post tweets and interact with content (requires login)
- **Enterprise Ready**: Proxy support and robust error handling
- **No Twitter Auth**: Uses TwitterAPI.io which doesn't require Twitter developer approval

## Installation

### Quick Start with npx (Recommended)

```bash
npx twitterapi-mcp
```

### Global Installation

```bash
npm install -g twitterapi-mcp
```

### Local Installation

```bash
npm install twitterapi-mcp
```

## Configuration

### Environment Variables

- `TWITTERAPI_API_KEY` - Your TwitterAPI.io API key (required)
- `PROXY_URL` or `HTTP_PROXY` - Proxy URL for enterprise environments (optional)

### Getting an API Key

1. Visit [TwitterAPI.io](https://twitterapi.io/)
2. Create a free account
3. Get your API key from the dashboard
4. Set the `TWITTERAPI_API_KEY` environment variable

## Usage with Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "twitterapi": {
      "command": "npx",
      "args": ["twitterapi-mcp"],
      "env": {
        "TWITTERAPI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### With Proxy Support

```json
{
  "mcpServers": {
    "twitterapi": {
      "command": "npx",
      "args": ["twitterapi-mcp"],
      "env": {
        "TWITTERAPI_API_KEY": "your_api_key_here",
        "PROXY_URL": "http://proxy.company.com:8080"
      }
    }
  }
}
```

## Available Tools

### User Information
- `get_user_by_username` - Get user details by username
- `get_user_by_id` - Get user details by user ID
- `get_user_followers` - Get user's followers list
- `get_user_following` - Get list of users someone follows
- `search_users` - Search for users by query

### Tweet Operations
- `get_user_tweets` - Get tweets from a specific user
- `search_tweets` - Search tweets by keywords
- `get_tweet_by_id` - Get specific tweet details
- `get_tweet_replies` - Get replies to a tweet

### Write Actions (Requires Login)
- `login_user` - Login to Twitter account
- `create_tweet` - Post new tweets or replies

## Examples

### Get User Information
```typescript
// Get user by username
await get_user_by_username({ username: "elonmusk" })

// Get user followers
await get_user_followers({ username: "elonmusk", count: 50 })
```

### Search and Retrieve Tweets
```typescript
// Search recent tweets
await search_tweets({ 
  query: "artificial intelligence", 
  count: 20, 
  result_type: "recent" 
})

// Get user's recent tweets
await get_user_tweets({ username: "openai", count: 10 })

// Get tweet details
await get_tweet_by_id({ tweet_id: "1234567890123456789" })
```

### Create Content (Requires Login)
```typescript
// Login first
await login_user({ 
  username: "your_username", 
  password: "your_password" 
})

// Post a tweet
await create_tweet({ text: "Hello from MCP!" })

// Reply to a tweet
await create_tweet({ 
  text: "Great point!", 
  reply_to: "1234567890123456789" 
})
```

## API Limits and Pricing

TwitterAPI.io offers:
- **Pay-as-you-go**: $0.15 per 1,000 tweets
- **High Performance**: 1000+ requests per second
- **Free Trial**: $0.1 in credits to start
- **No Monthly Fees**: Only pay for what you use

## Development

### Building from Source

```bash
git clone https://github.com/yourusername/twitterapi-mcp.git
cd twitterapi-mcp
npm install
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

### Testing the Server

```bash
# Test with MCP client
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js
```

## Architecture

This MCP server is built with:

- **TypeScript**: Type-safe implementation
- **@modelcontextprotocol/sdk**: Official MCP SDK
- **axios**: HTTP client with proxy support
- **Enterprise Features**: Proxy support, comprehensive error handling

### Project Structure

```
twitterapi-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Documentation
```

## Error Handling

The server includes comprehensive error handling for:

- API authentication failures
- Rate limiting responses
- Network connectivity issues
- Invalid parameters
- Service unavailability

## Security Considerations

- API keys should be stored as environment variables
- Login credentials are only used for authentication, not stored
- All requests use HTTPS
- Proxy support for enterprise security requirements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [TwitterAPI.io Docs](https://docs.twitterapi.io/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/twitterapi-mcp/issues)
- **Twitter Support**: [TwitterAPI.io Support](https://twitterapi.io/)

## Acknowledgments

- Built on [TwitterAPI.io](https://twitterapi.io/) service
- Uses the [Model Context Protocol](https://modelcontextprotocol.io/)
- Inspired by the growing MCP ecosystem

---

**Note**: This is an unofficial MCP server for TwitterAPI.io. Make sure to comply with Twitter's Terms of Service when using this tool.