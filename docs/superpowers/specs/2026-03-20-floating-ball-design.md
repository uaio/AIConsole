# 悬浮球功能设计规范

> 为 vconsole 添加可拖拽、可吸附的悬浮球控制按钮

**创建日期**: 2026-03-20
**状态**: 设计中
**优先级**: P1

---

## 📋 功能概述

为 vconsole 添加悬浮球功能，提供便捷的调试面板访问方式，同时支持拖动和边缘吸附以避免遮挡页面内容。

---

## 🎯 核心需求

### 1. 悬浮球外观
- **默认大小**: 44x44px 圆形
- **图标**: vconsole logo 或自定义图标
- **样式**: 半透明（opacity: 0.6）
- **z-index**: 99999 确保在最上层

### 2. 交互行为

#### 状态定义
- **正常态**: 完整显示，点击激活 vconsole 面板
- **吸附态**: 显示半个球，半透明，点击无效，只有连击才能激活
- **拖动态**: 跟随手指/鼠标，实时移动

#### 状态转换
```
正常态 ─────拖动─────→ 拖动态
  │                         │
  │                      松开靠近边缘
  │                         │
  │                         ↓
  └─────────────────── 吸附态（半透明，点击无效）
                            │
                         连击3次(500ms内)
                            │
                            ↓
                        返回正常态
```

### 3. 连击检测
- **时间窗口**: 500ms
- **触发条件**: 在吸附态下连续点击 3 次
- **行为**: 从吸附态返回正常态（完整显示，不透明）

### 4. 边缘吸附
- **触发条件**: 拖动结束时距离屏幕边缘 < 20px
- **吸附位置**:
  - 左边缘: `left: 0, top: 50%, transform: translateY(-50%)`
  - 右边缘: `right: 0, top: 50%, transform: translateY(-50%)`
  - 顶部边缘: `top: 0, left: 50%, transform: translateX(-50%)`
  - 底部边缘: `bottom: 0, left: 50%, transform: translateX(-50%)`

- **吸附状态显示**:
  - 只显示半个球（`clip-path`）
  - 半透明（opacity: 0.3）
  - 有阴影提示可点击激活

---

## 🏗️ 技术实现

### 组件结构

```
vconsole/
├── src/
│   ├── ui/
│   │   ├── FloatingBall.ts          # 悬浮球主组件
│   │   ├── ClickDetector.ts         # 连击检测器
│   │   └── DragHandler.ts           # 拖拽处理器
│   ├── index.ts                     # 导出 FloatingBall
│   └── types.ts                     # 类型定义
```

### 核心类

#### FloatingBall

```typescript
interface FloatingBallOptions {
  icon?: string;           // 悬浮球图标
  size?: number;           // 默认 44
  snapThreshold?: number;  // 吸附阈值，默认 20
  clickWindow?: number;   // 连击时间窗口，默认 500
  onActivate?: () => void; // 激活回调
}

class FloatingBall {
  private element: HTMLElement;
  private state: 'normal' | 'snapped' | 'dragging' = 'normal';
  private snappedSide?: 'left' | 'right' | 'top' | 'bottom';
  private clickDetector: ClickDetector;
  private dragHandler: DragHandler;

  create(): HTMLElement;     // 创建悬浮球 DOM
  mount(): void;              // 挂载到页面
  show(): void;                // 显示悬浮球
  hide(): void;                // 隐藏悬浮球
  snapTo(side: string): void;  // 手动吸附到指定边
  activate(): void;             // 激活（从吸附态恢复）
}
```

#### ClickDetector

```typescript
class ClickDetector {
  private clicks: number[] = [];
  private windowMs: number;
  private callback: () => void;

  registerClick(): void;       // 注册一次点击
  check(): boolean;             // 检查是否达到触发条件
  reset(): void;                // 重置点击计数
}
```

#### DragHandler

```typescript
class DragHandler {
  private element: HTMLElement;
  private state: 'idle' | 'dragging' = 'idle';
  private startPos: { x: number; y: number };
  private currentPos: { x: number; y: number };

  start(x: number, y: number): void;
  move(x: number, y: number): void;
  end(): void;
  getNearestEdge(x: number, y: number): 'left' | 'right' | 'top' | 'bottom' | null;
}
```

### 事件处理

#### 触摸事件
```typescript
touchstart: 开始拖动
touchmove: 拖动中
touchend: 结束拖动，检查是否需要吸附
```

#### 鼠标事件
```typescript
mousedown: 开始拖动
mousemove: 拖动中
mouseup: 结束拖动，检查是否需要吸附
```

#### 点击事件
```typescript
click: 注册点击（由 ClickDetector 处理连击逻辑）
```

### CSS 样式

#### 正常态
```css
.floating-ball {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

#### 吸附态（左侧示例）
```css
.floating-ball.snapped-left {
  left: 0 !important;
  top: 50%;
  transform: translateY(-50%);
  clip-path: inset(0 50% 0 0);
  opacity: 0.3;
}
```

#### 拖动态
```css
.floating-ball.dragging {
  opacity: 1;
  cursor: grabbing;
  transition: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
```

---

## 📊 数据流

### 初始化流程
```
页面加载
    ↓
创建 FloatingBall 实例
    ↓
挂载到 DOM
    ↓
初始化 ClickDetector 和 DragHandler
    ↓
监听触摸/鼠标事件
```

### 拖动流程
```
用户开始拖动
    ↓
DragHandler.start()
    ↓
状态 → dragging
    ↓
用户移动
    ↓
DragHandler.move()
    ↓
更新位置
    ↓
用户松开
    ↓
DragHandler.end()
    ↓
检查是否靠近边缘
    ↓
是 → FloatingBall.snapTo()
    ↓
状态 → snapped
```

### 连击激活流程
```
用户在吸附态点击
    ↓
ClickDetector.registerClick()
    ↓
检查 500ms 内是否有 3 次点击
    ↓
是 → FloatingBall.activate()
    ↓
状态 → normal
```

---

## 🧪 测试要点

### 功能测试
1. 点击悬浮球可以显示/隐藏 vconsole
2. 拖动悬浮球可以随意移动
3. 靠近边缘时自动吸附
4. 吸附后只显示半个球
5. 吸附后单击无效
6. 连击 3 次（500ms 内）恢复完整显示
7. 拖动过程中透明度变为不透明

### 兼容性测试
1. iOS Safari
2. Android Chrome
3. 微信内置浏览器
4. PC 浏览器（用于开发调试）

### 边界情况
1. 快速拖动是否跟手
2. 屏幕旋转时的位置处理
3. 多点触控的处理
4. 极端位置（四角）的吸附行为

---

## 🎨 UI 细节

### 图标
- 默认使用 vconsole logo
- 支持自定义图标 URL
- 大小建议：24x24px

### 动画时长
- 位置变化：300ms
- 透明度变化：300ms
- 吸附动作：300ms

### 视觉反馈
- 拖动时：不透明 + 放大阴影
- 吸附时：平滑过渡到边缘
- 连击激活时：短暂的放大动画提示

---

## 📝 API 设计

### 初始化

```typescript
import { FloatingBall } from './vconsole';

const ball = new FloatingBall({
  icon: '/path/to/icon.png',
  onActivate: () => {
    vconsole.show();
  }
});

ball.mount();
```

### 方法

```typescript
// 显示悬浮球
ball.show();

// 隐藏悬浮球
ball.hide();

// 手动吸附到指定边
ball.snapTo('left');  // 'left' | 'right' | 'top' | 'bottom'

// 激活（从吸附态恢复）
ball.activate();

// 销毁
ball.destroy();
```

---

## ✅ 验收标准

- [ ] 悬浮球默认显示，不遮挡页面内容
- [ ] 点击可以切换 vconsole 面板显示/隐藏
- [ ] 拖动流畅，无延迟感
- [ ] 靠近边缘自动吸附
- [ ] 吸附后只显示半个球，半透明
- [ ] 吸附后单击无效
- [ ] 连续点击 3 次（500ms 内）恢复完整显示
- [ ] 所有动画流畅自然
- [ ] 移动端和 PC 端都能正常工作
