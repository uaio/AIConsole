import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { listDevices, getConsoleLogs, getNetworkRequests, watchLogs, getStorage } from './tools/index.js';
import { startEmbeddedServer, stopEmbeddedServer, type EmbeddedServerConfig } from './launcher.js';

interface ToolArgs {
  [key: string]: unknown;
}

interface GetConsoleLogsArgs {
  deviceId: string;
  limit?: number;
  level?: 'log' | 'warn' | 'error' | 'info';
}

let isShuttingDown = false;

async function gracefulShutdown(server: Server, signal: string): Promise<void> {
  if (isShuttingDown) {
    console.error(`[${signal}] Already shutting down, forcing exit`);
    process.exit(1);
  }

  isShuttingDown = true;
  console.error(`[${signal}] Starting graceful shutdown...`);

  try {
    await server.close();
    console.error('[shutdown] MCP Server closed');

    // 停止内嵌服务器
    await stopEmbeddedServer();

    console.error('[shutdown] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[shutdown] Error during shutdown:', error);
    process.exit(1);
  }
}

function setupGlobalErrorHandlers(server: Server): void {
  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('[uncaughtException]', error);
    gracefulShutdown(server, 'uncaughtException').catch(() => {
      process.exit(1);
    });
  });

  // 处理未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[unhandledRejection]', 'Unhandled Promise Rejection at:', promise, 'reason:', reason);
    gracefulShutdown(server, 'unhandledRejection').catch(() => {
      process.exit(1);
    });
  });

  // 处理 SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.error('[SIGINT] Received interrupt signal');
    gracefulShutdown(server, 'SIGINT').catch(() => {
      process.exit(1);
    });
  });

  // 处理 SIGTERM
  process.on('SIGTERM', () => {
    console.error('[SIGTERM] Received termination signal');
    gracefulShutdown(server, 'SIGTERM').catch(() => {
      process.exit(1);
    });
  });
}

export async function startMCPServer(config?: EmbeddedServerConfig): Promise<void> {
  // 启动内嵌服务器
  console.error('[AIConsole] Starting embedded server...');
  const { url } = await startEmbeddedServer(config);
  console.error(`[AIConsole] Embedded server running at ${url}`);

  const server = new Server(
    {
      name: 'aiconsole-mcp',
      version: '0.1.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 设置全局错误处理器
  setupGlobalErrorHandlers(server);

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: listDevices.name,
          description: listDevices.description,
          inputSchema: listDevices.inputSchema
        },
        {
          name: getConsoleLogs.name,
          description: getConsoleLogs.description,
          inputSchema: getConsoleLogs.inputSchema
        },
        {
          name: getNetworkRequests.name,
          description: getNetworkRequests.description,
          inputSchema: getNetworkRequests.inputSchema
        },
        {
          name: watchLogs.name,
          description: watchLogs.description,
          inputSchema: watchLogs.inputSchema
        },
        {
          name: getStorage.name,
          description: getStorage.description,
          inputSchema: getStorage.inputSchema
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'list_devices':
          return { content: [{ type: 'text', text: JSON.stringify(await listDevices.execute(args || {}), null, 2) }] };

        case 'get_console_logs': {
          if (!args) {
            throw new Error('get_console_logs requires arguments');
          }
          // 验证必需参数
          if (!args.deviceId || typeof args.deviceId !== 'string') {
            throw new Error('get_console_logs requires a valid deviceId');
          }
          // 类型安全的参数构建
          const logsArgs: GetConsoleLogsArgs = {
            deviceId: args.deviceId,
            limit: typeof args.limit === 'number' ? args.limit : undefined,
            level: typeof args.level === 'string' && ['log', 'warn', 'error', 'info'].includes(args.level)
              ? args.level as 'log' | 'warn' | 'error' | 'info'
              : undefined
          };
          return { content: [{ type: 'text', text: JSON.stringify(await getConsoleLogs.execute(logsArgs), null, 2) }] };
        }

        case 'get_network_requests': {
          const networkArgs = {
            deviceId: typeof args?.deviceId === 'string' ? args.deviceId : undefined,
            limit: typeof args?.limit === 'number' ? args.limit : undefined,
            method: typeof args?.method === 'string' ? args.method : undefined,
            urlPattern: typeof args?.urlPattern === 'string' ? args.urlPattern : undefined,
            status: typeof args?.status === 'number' ? args.status : undefined
          };
          return { content: [{ type: 'text', text: JSON.stringify(await getNetworkRequests.execute(networkArgs), null, 2) }] };
        }

        case 'watch_logs': {
          // 解析 levels 数组
          let levels: ('log' | 'warn' | 'error' | 'info')[] | undefined;
          if (Array.isArray(args?.levels)) {
            const validLevels = ['log', 'warn', 'error', 'info'];
            levels = args.levels.filter((l: unknown): l is 'log' | 'warn' | 'error' | 'info' =>
              typeof l === 'string' && validLevels.includes(l)
            );
            if (levels.length === 0) levels = undefined;
          }

          const watchArgs = {
            deviceId: typeof args?.deviceId === 'string' ? args.deviceId : undefined,
            levels,
            since: typeof args?.since === 'number' ? args.since : undefined,
            limit: typeof args?.limit === 'number' ? args.limit : undefined
          };
          return { content: [{ type: 'text', text: JSON.stringify(await watchLogs.execute(watchArgs), null, 2) }] };
        }

        case 'get_storage': {
          const storageArgs = {
            deviceId: typeof args?.deviceId === 'string' ? args.deviceId : undefined,
            type: typeof args?.type === 'string' ? args.type as 'all' | 'localStorage' | 'sessionStorage' | 'cookies' : undefined
          };
          return { content: [{ type: 'text', text: JSON.stringify(await getStorage.execute(storageArgs), null, 2) }] };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      // 工具执行错误处理
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Tool Error] ${name}:`, errorMessage);
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: errorMessage, tool: name }, null, 2) }],
        isError: true
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('AIConsole MCP Server running on stdio');
}
