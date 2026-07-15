# Taro 多端开发

> **原文归档**：[`archive/old-taro-notes/`](../archive/old-taro-notes/)
> 包含：Taro 基本知识、环境搭建、技术选型、自带方法、设计思想及架构、富文本展示

---

## 一、Taro 简介

Taro 是京东凹凸实验室推出的**多端统一开发框架**。基于 React 语法，一套代码可以编译成：
- 微信小程序
- 支付宝小程序
- 百度小程序
- 抖音小程序
- H5
- React Native

## 二、环境搭建

```bash
# 1. 安装 CLI
npm install -g @tarojs/cli

# 2. 创建项目
taro init my-app

# 3. 选择模板（默认 default / TypeScript / Vue）
# 4. 编译运行
cd my-app
npm run dev:weapp      # 微信小程序
npm run dev:h5         # H5
npm run dev:rn         # React Native
```

## 三、技术选型

| 场景 | 推荐 |
|---|---|
| 已有 React 经验 | Taro（直接用 React 语法） |
| 已有 Vue 经验 | Taro 3.x + Vue 3 |
| 性能敏感 | Taro 3 + React + TypeScript |
| 大型项目 | Taro 3 + 状态管理（Dva/Zustand） |

## 四、Taro 自带方法

### 4.1 组件

- `View` 替代 `<div>`
- `Text` 替代 `<span>`
- `Image` 替代 `<img>`
- `Button` / `Input` / `Form` 等

### 4.2 API

- `Taro.request` 替代 `wx.request`
- `Taro.navigateTo` 路由跳转
- `Taro.setStorage` 本地存储
- `Taro.showToast` 弹窗

### 4.3 路由

```js
// 配置式路由
{
  pages: ['pages/index/index', 'pages/about/about'],
  window: { /* ... */ }
}

// 编程式跳转
Taro.navigateTo({ url: '/pages/about/about' });
```

## 五、设计思想及架构（原文核心）

> 📚 完整架构设计见 [Taro-设计思想及架构.md](../archive/old-taro-notes/Taro-设计思想及架构.md)（53KB，已归档）

### 5.1 编译时 + 运行时双架构

```
源代码（React 语法）
  ↓
Babel 编译（webpack/taro-cli）
  ↓
各端目标代码（小程序/H5/RN）
  ↓
各端运行时（Taro Runtime）
```

### 5.2 核心模块

| 模块 | 职责 |
|---|---|
| `taro-cli` | 编译、打包、初始化项目 |
| `@tarojs/runtime` | 运行时抹平 API 差异 |
| `@tarojs/components` | 跨端组件库 |
| `@tarojs/api` | 跨端 API 抹平 |

### 5.3 与原生小程序对比

| 维度 | 原生小程序 | Taro |
|---|---|---|
| 学习成本 | 各端语法不同 | React 语法一次学习 |
| 跨端支持 | 仅自家平台 | 6+ 端 |
| 性能 | 优 | 略逊（编译开销） |
| 生态 | 各自生态 | React 生态 |

## 六、富文本展示

> 📚 [taro 小程序展示富文本.md](../archive/old-taro-notes/taro小程序展示富文本.md)

```jsx
// Taro 3.x
import { RichText } from '@tarojs/components';

<RichText nodes={htmlString} />
```

---

## 📚 完整资料

- [Taro 基本知识](../archive/old-taro-notes/React-taro基本知识.md) — 9KB
- [Taro 环境搭建](../archive/old-taro-notes/React-taro环境搭建.md) — 4KB
- [Taro 技术选型](../archive/old-taro-notes/taro-技术选型.md) — 5KB
- [Taro 自带方法](../archive/old-taro-notes/taro-自带方法.md) — 3KB
- [Taro 设计思想及架构](../archive/old-taro-notes/Taro-设计思想及架构.md) — **53KB（最大篇）**
- [Taro 富文本展示](../archive/old-taro-notes/taro小程序展示富文本.md) — 2KB
