# React 基础与状态管理

> **原文归档**：[`archive/old-react-notes/`](../archive/old-react-notes/)
> 包含：React16 基础、Redux 入门/2、js 防抖节流柯里化 reduce

---

## 一、React 入门

### 1.1 简介

> 📷 React 三大体系：![React三大体系](../archive/youdaonote-images/24E5704A058F4009AFD55C22CB3D3568.png)

- Facebook 推出的前端框架
- A JavaScript library for building user interfaces
- 衍生：React Native（移动端）、React VR
- 2013 年开始推广，现已发布 React 16（Fiber）

### 1.2 三大优点

- **生态强大**：几乎没有 React 解决不了的需求
- **上手简单**：几小时即可入门，但需要更多时间深入
- **社区强大**：一线互联网公司都在用（阿里、美团、百度、知乎等）

### 1.3 开发环境

```bash
# 1. 安装 Node.js
node -v
npm -v

# 2. 安装脚手架
npm install -g create-react-app

# 3. 创建项目
D:
mkdir my-app
cd my-app
create-react-app my-app
cd my-app
npm start
```

### 1.4 三大体系

| 体系 | 用途 |
|---|---|
| React.js | Web 端 |
| React Native | 移动端（iOS/Android） |
| React VR | 虚拟现实 |

---

## 二、JS 函数式编程工具

### 2.1 防抖（debounce）

> 💡 **场景**：高频事件（scroll/resize/input）只执行最后一次

```js
function debounce(fn, delay) {
  let timer = null;
  return function() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}
```

### 2.2 节流（throttle）

> 💡 **场景**：高频事件按固定频率执行

```js
function throttle(fn, delay) {
  let valid = true;
  return function() {
    if (!valid) return false;
    valid = false;
    setTimeout(() => {
      fn();
      valid = true;
    }, delay);
  };
}
```

### 2.3 函数柯里化（Currying）

```js
// 普通 add
function add(x, y) { return x + y; }

// 柯里化后
function curryingAdd(x) {
  return function(y) { return x + y; };
}

add(1, 2);           // 3
curryingAdd(1)(2);   // 3
```

**作用**：参数复用（如不同正则校验可复用第一次的正则参数）

### 2.4 reduce 进阶用法

```js
// 数组求和
[0, 1, 2, 3].reduce((acc, cur) => acc + cur, 0);  // 6

// 二维转一维
[[1,2],[3,4]].reduce((acc, cur) => acc.concat(cur), []);  // [1,2,3,4]
```

---

## 三、Redux 状态管理

> 📚 完整 Redux 教程见 [Redux 入门](../archive/old-react-notes/React基础（技术胖）/Redux入门.md) 和 [Redux2](../archive/old-react-notes/React基础（技术胖）/Redux2.md)（已归档）

### 3.1 核心概念

| 概念 | 说明 |
|---|---|
| **Store** | 整个应用唯一的 state 容器 |
| **State** | 应用状态（只读） |
| **Action** | 描述"发生了什么"的对象（必须有 type） |
| **Reducer** | 纯函数，根据 action 返回新 state |
| **Dispatch** | 触发 action 的唯一方法 |

### 3.2 三大原则

1. **单一数据源**：整个应用只有一个 store
2. **State 只读**：唯一改变 state 的方法是 dispatch action
3. **Reducer 是纯函数**：相同输入必定相同输出

### 3.3 数据流

```
View → dispatch(action) → Reducer → new State → View
```

---

## 四、React Hooks（速查）

> 📚 完整 Hooks 教程见 [React Hooks.pdf](../archive/old-react-notes/React%20Hooks.pdf)（已归档）

| Hook | 用途 |
|---|---|
| `useState` | 状态管理 |
| `useEffect` | 副作用（替代 componentDidMount 等） |
| `useContext` | 跨组件传值 |
| `useReducer` | 复杂状态逻辑 |
| `useMemo` | 性能优化（缓存值） |
| `useCallback` | 性能优化（缓存函数） |
| `useRef` | 拿到 DOM 引用 / 保存可变值 |

---

## 五、React Router（速查）

> 📚 [React Router.pdf](../archive/old-react-notes/React%20Router.pdf)（已归档）

```jsx
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';

<BrowserRouter>
  <Link to="/">Home</Link>
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/about" component={About} />
  </Switch>
</BrowserRouter>
```

---

## 六、Next.js（速查）

> 📚 [Next.js 入门.pdf](../archive/old-react-notes/React服务端渲染框架Next.js入门(共12集).pdf)（已归档）

- React 服务端渲染框架
- 解决 SPA 的 SEO 问题
- 内置路由、SSR、SSG

---

## 📚 完整资料

- [React 16 基础](../archive/old-react-notes/React基础（技术胖）/React16基础.md) — 24KB
- [Redux 入门](../archive/old-react-notes/React基础（技术胖）/Redux入门.md) — 10KB
- [Redux2](../archive/old-react-notes/React基础（技术胖）/Redux2.md) — 60KB
- [js 防抖节流柯里化 reduce](../archive/old-react-notes/js防抖、节流和柯里化和reduce.md) — 5KB
- [React Hooks.pdf](../archive/old-react-notes/React%20Hooks.pdf) — 826KB
- [React Router.pdf](../archive/old-react-notes/React%20Router.pdf) — 584KB
- [Next.js.pdf](../archive/old-react-notes/React服务端渲染框架Next.js入门(共12集).pdf) — 815KB
