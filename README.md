# AIConsole

AIConsole 是一个用于移动端调试的远程控制台工具，可以实时查看移动设备的 console 日志、网络请求和系统信息。

## 特性

- 实时日志同步 - 查看移动设备的 console 输出
- 设备管理 - 支持多设备同时连接
- WebSocket 通信 - 低延迟的双向通信
- MCP 集成 - 支持 Model Context Protocol
- Web 控制台 - 现代化的 Web UI

## 架构

AIConsole 采用 Monorepo 架构，包含以下包：

- `aiconsole` - 移动端 SDK，用于拦截和上报日志
- `@aiconsole/server` - Node.js 服务器，提供 WebSocket 和 HTTP API
- `@aiconsole/web` - Web 控制台 UI
- `@aiconsole/mcp` - MCP Server 集成

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建所有包

```bash
pnpm build
```

### 3. 启动服务器

```bash
# 使用默认端口 8080
npx @aiconsole/server

# 或指定端口
npx @aiconsole/server -p 9000
```

服务器将在 `http://localhost:8080` 启动。

### 4. 在移动设备中使用

在你的移动端 Web 应用中引入 AIConsole SDK：

```html
<script src="https://unpkg.com/aiconsole@latest/dist/index.js"></script>
<script>
  const aiconsole = new AIConsole({
    projectId: 'demo-project',
    server: 'ws://your-server-ip:8080'
  });
</script>
```

或使用 npm：

```bash
npm install aiconsole
```

```typescript
import AIConsole from 'aiconsole';

const aiconsole = new AIConsole({
  projectId: 'my-app',
  server: 'ws://localhost:8080'
});
```

### 5. 访问控制台

在浏览器中打开 `http://localhost:8080`，你将看到连接的设备列表和实时日志。

## 开发

### 项目结构

```
aiconsole/
├── packages/
│   ├── vconsole/      # 移动端 SDK
│   ├── server/        # Node.js 服务器
│   ├── web/           # Web 控制台
│   └── mcp/           # MCP 集成
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

### 开发模式

```bash
# 监听模式构建所有包
pnpm dev

# 单独开发某个包
cd packages/vconsole
pnpm dev

cd packages/server
pnpm dev

cd packages/web
pnpm dev
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
cd packages/vconsole
pnpm test
```

## 命令行工具

### aiconsole (服务器)

启动 AIConsole 服务器：

```bash
aiconsole [选项]
```

选项：
- `-p, --port <port>` - 指定端口号（默认：8080）

### aiconsole-mcp (MCP Server)

启动 MCP 服务器：

```bash
aiconsole-mcp
```

## 配置

### 环境变量

Web 控制台支持以下环境变量（创建 `.env` 文件）：

```env
VITE_WS_URL=ws://localhost:8080
VITE_API_URL=http://localhost:8080
```

### 服务器配置

服务器默认配置：
- 端口：8080
- WebSocket 路径：`/ws`
- HTTP API 路径：`/api`

## API 文档

### HTTP API

#### 获取设备列表

```http
GET /api/devices
```

#### 获取设备日志

```http
GET /api/devices/:deviceId/logs
```

#### 发送命令到设备

```http
POST /api/devices/:deviceId/command
Content-Type: application/json

{
  "type": "eval",
  "code": "console.log('hello')"
}
```

### WebSocket 协议

#### 客户端消息

```typescript
// 设备注册
{
  type: 'register',
  deviceId: string,
  tabId: string,
  deviceInfo: DeviceInfo
}

// 日志上报
{
  type: 'console',
  deviceId: string,
  tabId: string,
  entry: LogEntry
}

// 心跳
{
  type: 'heartbeat',
  deviceId: string
}
```

#### 服务器消息

```typescript
// 命令执行
{
  type: 'command',
  command: Command
}
```

## MCP 集成

AIConsole 提供 MCP Server，允许 AI 助手（如 Claude）访问和控制移动设备。

### 配置 Claude Desktop

在 Claude Desktop 配置文件中添加：

```json
{
  "mcpServers": {
    "aiconsole": {
      "command": "node",
      "args": ["/path/to/aiconsole/packages/mcp/dist/index.js"]
    }
  }
}
```

### 可用工具

- `list_devices` - 列出所有连接的设备
- `get_device_logs` - 获取设备日志
- `send_command` - 向设备发送命令
- `get_device_info` - 获取设备信息

## 故障排查

### 连接失败

1. 检查服务器是否运行
2. 检查防火墙设置
3. 确认 WebSocket URL 正确

### 日志不显示

1. 检查浏览器控制台是否有错误
2. 确认 SDK 初始化参数正确
3. 检查网络连接

### 设备离线

1. 检查移动设备网络连接
2. 确认心跳间隔设置
3. 查看服务器日志

## 贡献

欢迎贡献！请阅读我们的贡献指南。

## 许可证

MIT
