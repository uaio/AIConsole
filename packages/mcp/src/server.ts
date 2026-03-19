import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { listDevices, getConsoleLogs } from './tools/index.js';

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
    console.error('[shutdown] Server closed successfully');
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

export async function startMCPServer(): Promise<void> {
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
