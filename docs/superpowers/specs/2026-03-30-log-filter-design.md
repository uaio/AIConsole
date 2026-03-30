# 日志搜索/筛选功能设计

**日期**: 2026-03-30
**状态**: 待实现

---

## 背景

AIConsole Web 控制台需要日志筛选能力，方便开发者和 AI 在大量日志中快速定位关键信息。

## 需求

1. **级别过滤** — 按 error / warn / log / info 级别筛选日志
2. **关键词搜索** — 输入关键词实时过滤日志内容
3. 两者组合生效（AND 关系）

不需要按设备过滤（左侧设备列表已实现）。

## 设计方案

### 改动范围

仅 `packages/web`，纯前端过滤，不改 Server / SDK / MCP。

### UI 布局

在 LogPanel 顶部新增工具栏：

```
┌──────────────────────────────────────────────┐
│ [All] [Log] [Warn] [Error] [Info]   [🔍 搜索] │
├──────────────────────────────────────────────┤
│  ...日志列表...                                │
└──────────────────────────────────────────────┘
```

- 级别按钮组：默认选中 All，点击切换到单个级别
- 搜索框：输入时实时过滤，匹配日志 message 字段（大小写不敏感）
- 两者同时生效：先按级别过滤，再按关键词过滤

### 状态管理

在 `LogPanel` 组件内新增两个 state：

```typescript
const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
const [searchText, setSearchText] = useState('');
```

过滤逻辑：

```typescript
const filteredLogs = logs.filter(log => {
  const levelMatch = filterLevel === 'all' || log.level === filterLevel;
  const textMatch = !searchText || log.message.toLowerCase().includes(searchText.toLowerCase());
  return levelMatch && textMatch;
});
```

### 文件变更

| 文件 | 改动 |
|------|------|
| `packages/web/src/components/LogPanel.tsx` | 新增工具栏 UI + filterLevel / searchText 状态 + 过滤逻辑 |
| `packages/web/src/styles/global.css` | 可选，如需全局工具栏样式 |

不新增文件，不引入新依赖。

### 样式方案

沿用项目现有的内联样式方案（JavaScript 对象），不引入 CSS 框架。

## 成功标准

1. 点击级别按钮后只显示对应级别的日志
2. 输入关键词后实时过滤，只显示匹配的日志
3. 级别 + 关键词组合过滤正常工作
4. 切换设备后筛选状态重置
5. 清空日志后筛选状态保留
