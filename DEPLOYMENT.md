# Deployment Guide for TwitterAPI MCP Server

This guide covers how to publish the TwitterAPI MCP Server to both GitHub and npm.

## Prerequisites

1. **GitHub Account**: Ensure you have a GitHub account and are logged in
2. **NPM Account**: Ensure you have an npm account and are logged in locally
   ```bash
   npm whoami  # Should return your npm username
   ```
3. **Git SSH**: Ensure SSH keys are configured for GitHub

## Step 1: GitHub Repository Setup

1. **Create GitHub Repository**:
   - Go to GitHub and create a new repository named `twitterapi-mcp`
   - Keep it public for easier distribution
   - Don't initialize with README (we already have files)

2. **Push to GitHub**:
   ```bash
   # Add GitHub remote (replace yourusername with your GitHub username)
   git remote add origin git@github.com:yourusername/twitterapi-mcp.git
   
   # Push to GitHub
   git push -u origin main
   ```

3. **Update package.json URLs**:
   - Update the repository, bugs, and homepage URLs in package.json
   - Replace `yourusername` with your actual GitHub username

## Step 2: NPM Publishing Setup

1. **Set up NPM Token for GitHub Actions** (optional for automated publishing):
   - Go to npmjs.com -> Access Tokens -> Generate New Token
   - Choose "Automation" type
   - Copy the token
   - In GitHub repository: Settings -> Secrets and variables -> Actions
   - Add secret named `NPM_TOKEN` with your token value

2. **Manual NPM Publishing**:
   ```bash
   # Ensure you're logged in
   npm whoami
   
   # Build the project
   npm run build
   
   # Publish to npm
   npm publish --access public
   ```

## Step 3: Testing the Published Package

1. **Test npx usage**:
   ```bash
   # Test that the package works with npx
   echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | npx twitterapi-mcp
   ```

2. **Test Claude Desktop Integration**:
   Add to your Claude Desktop config:
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

## Step 4: Version Management

1. **For updates**:
   ```bash
   # Update version (patch/minor/major)
   npm version patch
   
   # Publish new version
   npm publish
   
   # Push tags to GitHub
   git push origin main --tags
   ```

2. **Automated publishing**:
   - GitHub Actions will automatically publish to npm when you create a release
   - Or when you push a tag starting with 'v' (e.g., v1.0.1)

## Step 5: Documentation Updates

After publishing, update:
- README.md installation instructions with your actual package name
- GitHub repository description and topics
- npm package description and keywords

## Verification Checklist

- [ ] GitHub repository created and code pushed
- [ ] NPM package published successfully  
- [ ] Package works with `npx twitterapi-mcp`
- [ ] MCP protocol responds correctly
- [ ] Claude Desktop integration works
- [ ] GitHub Actions workflows are set up
- [ ] Documentation is complete and accurate

## Troubleshooting

**NPM Publish Issues**:
- Ensure you're logged in: `npm whoami`
- Check package name availability: `npm view twitterapi-mcp`
- Use `--access public` for scoped packages

**GitHub Push Issues**:
- Ensure SSH keys are configured
- Check remote URL: `git remote -v`
- Use personal access token if SSH isn't available

**MCP Integration Issues**:
- Verify shebang line in build/index.js
- Check executable permissions: `ls -la build/index.js`
- Test MCP protocol manually before integrating with clients

## Next Steps

1. Consider adding more comprehensive tests
2. Add error handling improvements
3. Implement rate limiting respect
4. Add more TwitterAPI.io endpoints
5. Create example usage scripts
6. Set up monitoring and analytics