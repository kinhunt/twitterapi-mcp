#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

/**
 * Interface definitions for TwitterAPI.io responses
 */
interface TwitterUser {
  id: string;
  username: string;
  name: string;
  description?: string;
  verified?: boolean;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  profile_image_url?: string;
  created_at?: string;
}

interface Tweet {
  id: string;
  text: string;
  author: TwitterUser;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  in_reply_to?: string;
  referenced_tweets?: Array<{
    type: 'retweeted' | 'quoted' | 'replied_to';
    id: string;
  }>;
}

interface SearchResponse {
  data: Tweet[];
  meta?: {
    result_count: number;
    next_token?: string;
  };
}

interface UserResponse {
  data: TwitterUser;
}

interface TweetsResponse {
  data: Tweet[];
}

/**
 * TwitterAPI.io MCP Server
 * Provides access to Twitter data through TwitterAPI.io service
 */
class TwitterAPIMCPServer {
  private server: Server;
  private apiClient: AxiosInstance;
  private apiKey: string;
  private loginCookie: string | null = null;

  constructor() {
    // Get API key from environment
    this.apiKey = process.env.TWITTERAPI_API_KEY || '';
    if (!this.apiKey) {
      console.error('Warning: TWITTERAPI_API_KEY environment variable not set');
    }

    this.server = new Server(
      {
        name: 'twitterapi-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Configure axios client with proxy support
    const axiosConfig: AxiosRequestConfig = {
      baseURL: 'https://api.twitterapi.io/twitter',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TwitterAPI-MCP-Server/1.0.0'
      }
    };

    // Proxy support for enterprise environments
    const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
    if (proxyUrl) {
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
      axiosConfig.proxy = false;
      console.log('Using proxy:', proxyUrl);
    }

    this.apiClient = axios.create(axiosConfig);

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_user_by_username',
            description: 'Get Twitter user information by username',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Twitter username (without @)',
                },
              },
              required: ['username'],
            },
          } as Tool,
          {
            name: 'get_user_by_id',
            description: 'Get Twitter user information by user ID',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'Twitter user ID',
                },
              },
              required: ['user_id'],
            },
          } as Tool,
          {
            name: 'get_user_tweets',
            description: 'Get tweets from a specific user',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Twitter username (without @)',
                },
                count: {
                  type: 'number',
                  description: 'Number of tweets to retrieve (default: 10, max: 100)',
                  minimum: 1,
                  maximum: 100,
                },
              },
              required: ['username'],
            },
          } as Tool,
          {
            name: 'search_tweets',
            description: 'Search for tweets using keywords',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for tweets',
                },
                count: {
                  type: 'number',
                  description: 'Number of tweets to retrieve (default: 10, max: 100)',
                  minimum: 1,
                  maximum: 100,
                },
                result_type: {
                  type: 'string',
                  description: 'Type of search results',
                  enum: ['recent', 'popular', 'mixed'],
                },
              },
              required: ['query'],
            },
          } as Tool,
          {
            name: 'get_tweet_by_id',
            description: 'Get a specific tweet by its ID',
            inputSchema: {
              type: 'object',
              properties: {
                tweet_id: {
                  type: 'string',
                  description: 'Twitter tweet ID',
                },
              },
              required: ['tweet_id'],
            },
          } as Tool,
          {
            name: 'get_tweet_replies',
            description: 'Get replies to a specific tweet',
            inputSchema: {
              type: 'object',
              properties: {
                tweet_id: {
                  type: 'string',
                  description: 'Twitter tweet ID',
                },
                count: {
                  type: 'number',
                  description: 'Number of replies to retrieve (default: 10, max: 100)',
                  minimum: 1,
                  maximum: 100,
                },
              },
              required: ['tweet_id'],
            },
          } as Tool,
          {
            name: 'get_user_followers',
            description: 'Get followers of a specific user',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Twitter username (without @)',
                },
                count: {
                  type: 'number',
                  description: 'Number of followers to retrieve (default: 20, max: 100)',
                  minimum: 1,
                  maximum: 100,
                },
              },
              required: ['username'],
            },
          } as Tool,
          {
            name: 'get_user_following',
            description: 'Get users that a specific user is following',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Twitter username (without @)',
                },
                count: {
                  type: 'number',
                  description: 'Number of following to retrieve (default: 20, max: 100)',
                  minimum: 1,
                  maximum: 100,
                },
              },
              required: ['username'],
            },
          } as Tool,
          {
            name: 'search_users',
            description: 'Search for Twitter users',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for users',
                },
                count: {
                  type: 'number',
                  description: 'Number of users to retrieve (default: 10, max: 50)',
                  minimum: 1,
                  maximum: 50,
                },
              },
              required: ['query'],
            },
          } as Tool,
          {
            name: 'login_user',
            description: 'Login to Twitter account for write actions (requires username and password)',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Twitter username or email',
                },
                password: {
                  type: 'string',
                  description: 'Twitter password',
                },
              },
              required: ['username', 'password'],
            },
          } as Tool,
          {
            name: 'create_tweet',
            description: 'Create a new tweet (requires login)',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Tweet text (max 280 characters)',
                  maxLength: 280,
                },
                reply_to: {
                  type: 'string',
                  description: 'Tweet ID to reply to (optional)',
                },
              },
              required: ['text'],
            },
          } as Tool,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        if (!args) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
        }

        switch (name) {
          case 'get_user_by_username':
            return await this.getUserByUsername(args.username as string);

          case 'get_user_by_id':
            return await this.getUserById(args.user_id as string);

          case 'get_user_tweets':
            return await this.getUserTweets(
              args.username as string,
              args.count as number
            );

          case 'search_tweets':
            return await this.searchTweets(
              args.query as string,
              args.count as number,
              args.result_type as string
            );

          case 'get_tweet_by_id':
            return await this.getTweetById(args.tweet_id as string);

          case 'get_tweet_replies':
            return await this.getTweetReplies(
              args.tweet_id as string,
              args.count as number
            );

          case 'get_user_followers':
            return await this.getUserFollowers(
              args.username as string,
              args.count as number
            );

          case 'get_user_following':
            return await this.getUserFollowing(
              args.username as string,
              args.count as number
            );

          case 'search_users':
            return await this.searchUsers(
              args.query as string,
              args.count as number
            );

          case 'login_user':
            return await this.loginUser(
              args.username as string,
              args.password as string
            );

          case 'create_tweet':
            return await this.createTweet(
              args.text as string,
              args.reply_to as string
            );

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(ErrorCode.InternalError, `TwitterAPI.io error: ${message}`);
      }
    });
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    try {
      const config: AxiosRequestConfig = {
        headers: {},
        params: params || {},
      };

      // Add API key if available
      if (this.apiKey && config.headers) {
        config.headers['x-api-key'] = this.apiKey;
      }

      // Add login cookie for write actions
      if (this.loginCookie && config.headers) {
        config.headers['Cookie'] = this.loginCookie;
      }

      const response = await this.apiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`TwitterAPI.io API error (${statusCode}): ${errorMessage}`);
      }
      throw error;
    }
  }

  private async makePostRequest(endpoint: string, data: Record<string, any>): Promise<any> {
    try {
      const config: AxiosRequestConfig = {
        headers: {},
      };

      // Add API key if available
      if (this.apiKey && config.headers) {
        config.headers['x-api-key'] = this.apiKey;
      }

      // Add login cookie for write actions
      if (this.loginCookie && config.headers) {
        config.headers['Cookie'] = this.loginCookie;
      }

      const response = await this.apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`TwitterAPI.io API error (${statusCode}): ${errorMessage}`);
      }
      throw error;
    }
  }

  private async getUserByUsername(username: string): Promise<CallToolResult> {
    const data = await this.makeRequest(`/user/info`, { userName: username });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async getUserById(userId: string): Promise<CallToolResult> {
    const data = await this.makeRequest(`/user/info`, { user_id: userId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async getUserTweets(username: string, count: number = 10): Promise<CallToolResult> {
    const data = await this.makeRequest(`/user/last_tweets`, {
      userName: username,
      count: Math.min(count, 100),
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async searchTweets(
    query: string,
    count: number = 10,
    resultType: string = 'recent'
  ): Promise<CallToolResult> {
    const data = await this.makeRequest(`/tweet/advanced_search`, {
      query,
      count: Math.min(count, 100),
      result_type: resultType,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async getTweetById(tweetId: string): Promise<CallToolResult> {
    const data = await this.makeRequest(`/tweets`, { tweet_id: tweetId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async getTweetReplies(tweetId: string, count: number = 10): Promise<CallToolResult> {
    const data = await this.makeRequest(`/tweet/replies`, {
      id: tweetId,
      count: Math.min(count, 100),
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async getUserFollowers(username: string, count: number = 20): Promise<CallToolResult> {
    const data = await this.makeRequest(`/user/followers`, {
      userName: username,
      count: Math.min(count, 100),
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async getUserFollowing(username: string, count: number = 20): Promise<CallToolResult> {
    const data = await this.makeRequest(`/user/followings`, {
      userName: username,
      count: Math.min(count, 100),
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async searchUsers(query: string, count: number = 10): Promise<CallToolResult> {
    const data = await this.makeRequest(`/user/search`, {
      query,
      count: Math.min(count, 50),
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async loginUser(username: string, password: string): Promise<CallToolResult> {
    try {
      const loginData = await this.makePostRequest('/user_login_v2', {
        userName: username,
        password,
      });

      // Store login cookie for future requests
      if (loginData.cookie) {
        this.loginCookie = loginData.cookie;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Login successful',
              user: loginData.user || {},
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Login failed',
            }, null, 2),
          },
        ],
      };
    }
  }

  private async createTweet(text: string, replyTo?: string): Promise<CallToolResult> {
    if (!this.loginCookie) {
      throw new Error('Must login first before creating tweets');
    }

    const tweetData: Record<string, any> = { text };
    if (replyTo) {
      tweetData.reply_to = replyTo;
    }

    const data = await this.makePostRequest('/create_tweet_v2', tweetData);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TwitterAPI.io MCP server running on stdio');
  }
}

const server = new TwitterAPIMCPServer();
server.run().catch(console.error);