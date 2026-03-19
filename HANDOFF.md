# AIConsole 开发者交接指南

本文档帮助新开发者（或新的 Claude Code 实例）快速了解项目并无缝衔接开发工作。

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/uaio/AIConsole.git
cd AIConsole
pnpm install
pnpm build
```

### 2. 了解项目
按以下顺序阅读文档：

1. **`PROJECT_STATUS.md`** - 项目整体状态
   - 项目概览
   - 已完成功能
   - 技术栈
   - 关键设计决策
   - 下一步工作建议

2. **`TASK_STATUS.md`** - 详细任务状态
   - 所有 21 个任务的完成状态
   - 每个任务的提交历史
   - 关键代码修复记录
   - 技术债务清单

3. **`docs/TESTING_GUIDE.md`** - 测试流程
   - 完整的测试验证流程
   - 常见问题排查

### 3. 启动开发
```bash
# 启动服务器
npx aiconsole

# 运行测试
pnpm test

# 开发模式
pnpm dev
```

---

## 📚 重要文档位置

### 设计文档
- `docs/superpowers/specs/2026-03-18-aiconsole-design.md` - 完整设计规范

### 实现计划
- `docs/superpowers/plans/2026-03-19-mvp-implementation.md` - 21 个任务的详细实现计划

### 包文档
- `packages/vconsole/README.md` - SDK 使用文档
- `README.md` - 项目根文档

---

## 🔑 关键信息速查

### 项目结构
```
packages/
├── vconsole/  # SDK（拦截 console，WebSocket 上报）
├── server/    # 服务器（WebSocket + HTTP API）
├── mcp/       # MCP Server（AI 工具集成）
└── web/       # PC 查看页面（React）
```

### 核心技术
- **Monorepo**: pnpm + Turborepo
- **WebSocket**: 自定义协议
- **MCP**: @modelcontextprotocol/sdk
- **测试**: Vitest

### 设备标识公式
```javascript
hash(window.location.origin + window.location.pathname + navigator.userAgent + projectId)
```

### WebSocket 消息格式
```javascript
// 设备注册
{ type: 'register', projectId, deviceId, deviceInfo }

// 日志上报
{ type: 'console', deviceId, tabId, timestamp, level, message, stack }

// PC 查看器
{ type: 'viewer' }
```

---

## 🎯 当前状态

- **版本**: 0.1.0 MVP
- **进度**: 21/21 任务完成 ✅
- **测试**: 27/27 通过 ✅
- **仓库**: https://github.com/uaio/AIConsole

---

## 🐛 常见问题

### Q: 如何添加新功能？
A: 使用 brainstorming skill 设计，然后创建实现计划。

### Q: 如何修复 bug？
A: 使用 systematic-debugging skill 诊断问题。

### Q: 代码风格规范？
A: 见项目根 `CLAUDE.md`（如有）或遵循现有代码风格。

### Q: 如何运行测试？
A: `pnpm test` 或 `pnpm --filter <package> test`

---

## 📝 开发工作流

1. **设计阶段**: 使用 brainstorming skill
2. **计划阶段**: 创建实现计划文档
3. **执行阶段**: 使用 subagent-driven-development skill
4. **测试阶段**: 运行测试确保质量
5. **审查阶段**: 使用 requesting-code-review skill
6. **完成阶段**: 使用 finishing-a-development-branch skill

---

**最后更新**: 2026-03-19
**仓库**: https://github.com/uaio/AIConsole
