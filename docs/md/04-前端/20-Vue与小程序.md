# Vue 与小程序

> **原文归档**：[`archive/old-vue-miniapp-notes/`](../archive/old-vue-miniapp-notes/)
> 包含：Vue3 + Vue CLI、微信小程序开发

---

## 一、Vue3 + Vue CLI 入门

### 1.1 Vue CLI 简介

Vue CLI 是基于 Vue.js 的**快速开发完整系统**。

### 1.2 创建项目

```bash
# 安装
npm install -g @vue/cli
yarn global add @vue/cli

# 创建
vue --version
vue create my-project

# 选择：Vue 3 + Babel + Router + Vuex + CSS Pre-processors
```

### 1.3 项目结构

```
my-project/
├── public/
├── src/
│   ├── assets/         # 静态资源
│   ├── components/     # 组件
│   ├── views/          # 页面
│   ├── router/         # 路由
│   ├── store/          # Vuex
│   ├── App.vue
│   └── main.ts
├── .env.development    # 开发环境变量
├── .env.production     # 生产环境变量
└── vue.config.js       # CLI 配置
```

### 1.4 集成 Ant Design Vue

```bash
npm install ant-design-vue@next --save
```

```ts
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';

createApp(App).use(Antd).mount('#app');
```

### 1.5 路由开发

```ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') }
];

export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});
```

### 1.6 Vue3 vs Vue2 关键变化

| 维度 | Vue2 | Vue3 |
|---|---|---|
| 数据绑定 | `data() { return {} }` | `setup()` + `ref/reactive` |
| 生命周期 | 8 个 + before/after | 改名 + 加 on 前缀 |
| 组件通信 | props/event | props/emits |
| 响应式 | Object.defineProperty | Proxy |
| 多根节点组件 | 不支持 | 支持 |
| TypeScript | 弱 | 一等公民 |

### 1.7 setup 方法

```ts
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  setup() {
    const count = ref(0);
    onMounted(() => console.log('mounted'));
    return { count };
  }
});
```

> 💡 `setup()` 替代了 `data() / methods / mounted / computed / watch`，是 Composition API 的入口。

### 1.8 多环境配置

```bash
# .env.development
NODE_ENV=development
VUE_APP_SERVER=http://127.0.0.1:8880

# .env.production
NODE_ENV=production
VUE_APP_SERVER=https://api.prod.com
```

```json
// package.json
{
  "scripts": {
    "serve-dev": "vue-cli-service serve --mode dev --port 8080",
    "serve-prod": "vue-cli-service serve --mode prod",
    "build-dev": "vue-cli-service build --mode dev",
    "build-prod": "vue-cli-service build --mode prod"
  }
}
```

---

## 二、微信小程序

> 📚 完整笔记见 [微信小程序开发（七月）.md](../archive/old-vue-miniapp-notes/微信小程序开发（七月）.md)（10KB，已归档）

### 2.1 文件结构

```
project/
├── app.js             # 入口逻辑
├── app.json           # 全局配置
├── app.wxss           # 全局样式
├── pages/
│   └── index/
│       ├── index.js   # 页面逻辑
│       ├── index.json # 页面配置
│       ├── index.wxml # 页面结构（类似 HTML）
│       └── index.wxss # 页面样式（类似 CSS）
└── utils/
```

### 2.2 生命周期

| 阶段 | 回调 |
|---|---|
| 加载 | onLoad / onShow / onReady |
| 切后台 | onHide |
| 卸载 | onUnload |
| 下拉刷新 | onPullDownRefresh |
| 触底 | onReachBottom |
| 转发 | onShareAppMessage |

### 2.3 数据绑定

```js
// page.js
Page({
  data: {
    message: 'Hello',
    list: [1, 2, 3]
  },
  onLoad() {
    this.setData({ message: 'Updated' });
  }
});
```

```xml
<!-- page.wxml -->
<view>{{message}}</view>
<view wx:for="{{list}}">{{item}}</view>
```

### 2.4 与 Vue 的区别

| 维度 | 微信小程序 | Vue |
|---|---|---|
| 数据更新 | `setData()` | 直接赋值（响应式） |
| 模板语法 | `{{}}` + `wx:if` | `{{}}` + `v-if` |
| 组件 | 4 文件（js/json/wxml/wxss） | 单文件（.vue） |
| 学习曲线 | 平缓（中文文档） | 平缓 |

---

## 📚 完整资料

- [Vue3 + Vue CLI 项目搭建](../archive/old-vue-miniapp-notes/Vue3+Vue-CLI项目搭建.md) — 5KB
- [微信小程序开发（七月）](../archive/old-vue-miniapp-notes/微信小程序开发（七月）.md) — 10KB
