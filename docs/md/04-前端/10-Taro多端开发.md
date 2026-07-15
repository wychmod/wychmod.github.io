# Taro 多端开发

> **原文归档**：[archive/old-taro-notes/](../archive/old-taro-notes/)
> 包含：6 个文件（基本知识 / 环境搭建 / 技术选型 / 自带方法 / 设计思想及架构 / 小程序展示富文本）

## 一、核心主题概述

Taro 是京东凹凸实验室开源的**多端统一开发框架**：开发者使用 React 语法（Taro 3 起同时支持 Vue）编写源码，通过编译时转换 + 运行时适配，最终输出可在微信小程序、支付宝小程序、百度小程序、字节跳动小程序、H5、React Native、快手小程序、鸿蒙等多端运行的代码。

归档的 6 篇旧文覆盖了 Taro 1.x 时期的核心知识，包括：

- 小程序与 H5 的差异、生命周期、函数式组件写法；
- CLI 安装、项目初始化、各端 dev/build 命令；
- 与 WePY、mpvue、原生开发的对比与选型建议；
- `Taro.showToast`、`Taro.getStorage` 等常用 API；
- 编译原理、AST 转换、运行时、组件/API 多端适配；
- 使用 `wxParse` 在小程序中展示富文本。

本文先对以上主题做系统化的总结与代码示例，随后完整保留原始文件内容，仅修正图片相对路径。

## 二、Taro 简介与环境搭建

### 2.1 安装 CLI 并初始化项目

```bash
# 全局安装 Taro CLI
npm install -g @tarojs/cli
# 或 yarn global add @tarojs/cli

# 创建项目
taro init myApp
# 按提示选择：React / Vue、TypeScript、CSS 预处理器、模板等

cd myApp
npm install
```

### 2.2 常用开发与构建命令

| 目标端 | 开发（watch） | 构建（production） |
|---|---|---|
| 微信小程序 | `npm run dev:weapp` | `npm run build:weapp` |
| 百度小程序 | `npm run dev:swan` | `npm run build:swan` |
| 支付宝小程序 | `npm run dev:alipay` | `npm run build:alipay` |
| 字节跳动小程序 | `npm run dev:tt` | `npm run build:tt` |
| QQ 小程序 | `npm run dev:qq` | `npm run build:qq` |
| H5 | `npm run dev:h5` | `npm run build:h5` |
| React Native | `npm run dev:rn` | `npm run build:rn` |
| 快应用 | `npm run dev:quickapp` | `npm run build:quickapp` |

```bash
# 使用 npx 也可直接调用
npx taro build --type weapp --watch
npx taro build --type h5 --watch

# 更新 CLI
npm i -g @tarojs/cli@latest
# 更新项目内 Taro 依赖
taro update project
```

> 💡 补充：小程序预览需要下载对应平台开发者工具（微信开发者工具、百度/支付宝开发者工具等），编译完成后选择项目根目录或 `dist` 目录进行预览。H5 直接在浏览器访问即可。

## 三、技术选型

### 3.1 主流小程序框架对比

| 维度 | 原生开发 | WePY | mpvue | Taro |
|---|---|---|---|---|
| 开发方式 | JS + JSON + WXML + WXSS | 类 Vue，.wpy 单文件 | Vue 开发方式 | React 开发方式 |
| NPM 支持 | 受限 | 支持 | 支持 | 支持 |
| ES6+ / 预编译器 | 受限 | 支持 | 支持 | 支持 |
| 状态管理 | 无 | Redux | Vuex | Redux / Zustand / MobX 等 |
| 生命周期 | 小程序生命周期 | 小程序生命周期 | Vue 生命周期 | React 生命周期 |
| 跨端能力 | 仅自家平台 | 小程序 | 小程序 | 小程序 + H5 + RN + 鸿蒙等 |

### 3.2 选型建议

- **团队已有 React 经验**：首选 Taro，学习曲线最低，可直接复用 React 生态（Hooks、状态管理、UI 库）。
- **团队已有 Vue 经验**：Taro 3.x 支持 Vue 3；若只做小程序，也可评估 uni-app。
- **中小型项目、想贴近原生小程序**：WePY 或原生开发。
- **需要一套代码跑多端**：Taro 或 uni-app；Taro 在 React 体系与 RN 输出上更强，uni-app 在 Vue 体系与小游戏端覆盖更广。

> 💡 补充：Taro 3 在架构上改为**重运行时**（基于 React Reconciler / Vue 3 Renderer），大幅提升了语法兼容度，支持函数式组件、Hooks、Context、Portals 等现代特性，基本消除了 Taro 1.x 时代大量“不能这样写”的限制。

## 四、Taro 核心 API 与组件

### 4.1 跨端组件

Taro 提供一套与小程序组件对齐的跨端组件，命名采用 PascalCase。

```jsx
import Taro from '@tarojs/taro';
import { View, Text, Image, Button, Input, ScrollView } from '@tarojs/components';

export default function Index() {
  return (
    <View className="container">
      <Text className="title">Hello Taro</Text>
      <Image
        src="https://example.com/logo.png"
        mode="aspectFit"
        style={{ width: '100px', height: '100px' }}
      />
      <Input
        type="text"
        placeholder="请输入"
        onInput={(e) => console.log(e.detail.value)}
      />
      <Button onClick={() => Taro.showToast({ title: '点击了' })}>
        点我
      </Button>
      <ScrollView scrollY style={{ height: '300px' }}>
        <View>可滚动内容</View>
      </ScrollView>
    </View>
  );
}
```

常用组件映射：

| Web / React | Taro 组件 | 说明 |
|---|---|---|
| `<div>` | `<View>` | 视图容器 |
| `<span>` / `<p>` | `<Text>` | 文本 |
| `<img>` | `<Image>` | 图片，支持 `mode` |
| `<input>` | `<Input>` | 输入框 |
| `<button>` | `<Button>` | 按钮 |
| `<form>` | `<Form>` | 表单 |
| `<scroll>` | `<ScrollView>` | 滚动视图 |
| `<swiper>` | `<Swiper>` | 轮播 |
| - | `<RichText>` | 富文本 |

### 4.2 常用 API

Taro 将各端原生 API 统一封装为 `Taro.xxx`，并对异步 API 做 Promise 化。

```jsx
import Taro from '@tarojs/taro';

// 网络请求
Taro.request({
  url: 'https://api.example.com/data',
  method: 'GET',
}).then(res => console.log(res.data));

// 路由跳转
Taro.navigateTo({ url: '/pages/detail/detail?id=1' });
Taro.redirectTo({ url: '/pages/index/index' });
Taro.navigateBack({ delta: 1 });

// 本地存储
Taro.setStorage({ key: 'token', data: 'xxx' });
const token = Taro.getStorageSync('token');

// 交互反馈
Taro.showToast({ title: '成功', icon: 'success', duration: 2000 });
Taro.showModal({ title: '提示', content: '确认删除？' });
Taro.showLoading({ title: '加载中...' });
Taro.hideLoading();

// 系统信息
Taro.getSystemInfo().then(res => console.log(res.windowWidth));
```

### 4.3 页面配置与路由

Taro 采用小程序式的配置式路由，`app.config.js`（或 `app.js` 中的 `config`）定义页面列表：

```js
// app.config.js
export default {
  pages: [
    'pages/index/index',
    'pages/detail/detail',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/mine/mine', text: '我的' },
    ],
  },
};
```

获取路由参数：

```jsx
import { useLoad } from '@tarojs/taro';

export default function Detail() {
  useLoad((options) => {
    console.log(options.id); // 页面参数
  });
  return <View>Detail</View>;
}
```

> 💡 补充：Taro 1.x 中使用 `this.$router.params.xxx` 获取页面参数；Taro 3 推荐使用 Hooks（`useLoad`、`useDidShow`、`usePullDownRefresh` 等）或 `getCurrentInstance().router.params`。

## 五、设计思想与架构

### 5.1 编译时 + 运行时双架构

Taro 的核心思想是**用一套 React/Vue 语法，通过编译 + 运行时抹平多端差异**。

```
源代码（React / Vue 语法）
    ↓
Babel 编译：JSX → 小程序模板 / H5 DOM / RN 组件
    ↓
各端运行时（Taro Runtime）：
  - @tarojs/runtime  标准运行时框架
  - @tarojs/components 标准基础组件库
  - @tarojs/api      标准端能力 API
    ↓
微信小程序 / 支付宝 / 百度 / H5 / React Native / 鸿蒙 ...
```

### 5.2 编译原理：AST 转换

Taro 借助 Babel 完成源码到目标代码的转换：

1. **Parse**：`@babel/parser` 将源码解析为 AST；
2. **Traverse / Replace**：`@babel/traverse` 遍历并修改 AST 节点；
3. **Generate**：根据新 AST 生成目标端代码。

例如 JSX 中的列表循环：

```jsx
// 源码
this.state.list.map(item => <View>{item}</View>)

// 编译为微信小程序模板
<view wx:for="{{list}}" wx:for-item="item">{{item}}</view>
```

### 5.3 运行时适配

编译后的代码并不能直接运行，Taro 运行时负责：

- `createApp` / `createPage` / `createComponent`：将类组件注册为小程序 App/Page/Component；
- state 映射为小程序 `data`；
- React 生命周期映射为小程序生命周期；
- 事件处理函数通过 `processEvent` 解析作用域与参数；
- 异步 API Promise 化；
- `setState` 优化：nextTick 合并、`$usedState` 数据裁剪、diff 最小更新路径。

```js
// 简化示例：Promise 化 wx.getStorage
Taro.getStorage = options => {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      ...options,
      success: res => { options.success?.(res); resolve(res); },
      fail: err => { options.fail?.(err); reject(err); },
    });
  });
};
```

### 5.4 H5 与 React Native 的适配

- **H5**：Taro 早期使用自研类 React 框架 Nerv 作为运行时，将 `View` 渲染为 `div`、`Image` 渲染为 `img`，并通过 WEUI 还原小程序样式；Taro 3 后统一接入 React Reconciler。
- **React Native**：组件映射为 `View`、`Text`、`Touchable*` 等 RN 组件，样式通过 `css-to-react-native` 转换为 RN StyleSheet，并约束 flex 布局、禁用全局样式等。

> 💡 补充：Taro 选择微信小程序的组件与 API 作为运行时标准，因为微信文档完善、能力丰富，且百度/支付宝小程序在早期都向微信对齐，这大大降低了多端实现成本。

## 六、实战：富文本展示

小程序原生不支持直接渲染 HTML，Taro 1.x 时代常借助 `wxParse` 将 HTML 转为小程序 WXML。

```jsx
import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import WxParse from '../../utils/wxParse/wxParse.js';
import '../../utils/wxParse/wxParse.scss';

export default class ParseComponent extends Component {
  componentDidMount() {}

  defaultProps = { mark: '' };

  render() {
    if (this.props.mark) {
      WxParse.wxParse('domText', 'html', this.props.mark, this.$scope, 5);
    }
    return (
      <View>
        {process.env.TARO_ENV === 'weapp' ? (
          <View>
            <import src='../../utils/wxParse/wxParse.wxml' />
            <template is='wxParse' data='{{wxParseData:domText.nodes}}' />
          </View>
        ) : (
          <View>只在小程序里支持</View>
        )}
      </View>
    );
  }
}
```

配置 `copy` 将 `wxParse` 的 `wxss` / `wxml` 资源复制到 `dist`：

```js
// config/index.js
const config = {
  copy: {
    patterns: [
      { from: 'src/components/wxParse/wxParse.wxss', to: 'dist/components/wxParse/wxParse.wxss' },
      { from: 'src/components/wxParse/wxParse.wxml', to: 'dist/components/wxParse/wxParse.wxml' },
    ],
    options: {},
  },
};
```

> 💡 补充：Taro 3.x 推荐直接使用内置 `<RichText nodes={htmlString} />` 或社区库（如 `@tarojs/components-advanced`、`taro-html`）处理富文本；若需兼容复杂 HTML，仍可引入 `wxParse` 或 `mp-html`。

## 七、2026 年跨端方案选型

截至 2026 年，主流跨端方案格局如下：

| 方案 | 技术栈 | 优势 | 劣势 | 适用场景 |
|---|---|---|---|---|
| **Taro** | React / Vue | 京东维护、React 生态强、RN/鸿蒙支持好 | 版本迭代快、部分平台能力跟进有延迟 | 中大型多端应用、React 团队 |
| **uni-app** | Vue / Vue3 | 生态庞大、覆盖平台多、插件丰富 | React 支持弱、部分端性能一般 | 快速开发、Vue 团队、小游戏 |
| **原生小程序** | 各平台语法 | 性能最优、能力最全 | 重复开发、工程化弱 | 对性能/体验要求极高的单端 |
| **Flutter** | Dart | 自绘引擎、性能接近原生 | 包体积大、Dart 生态小、小程序支持有限 | App 为主、重交互场景 |
| **React Native** | React | 原生体验、生态成熟 | 只输出 App，不输出小程序 | 纯 App 跨 iOS/Android |

建议：

- 若团队以 React 为主，且需同时覆盖小程序 + H5 + App，**Taro 仍是首选**。
- 若团队以 Vue 为主，或需快速上线并覆盖大量平台，**uni-app** 性价比更高。
- 若只需做小程序且追求极致体验，可考虑原生开发或 Taro + 原生混合。

> 💡 补充：Taro 4 已进一步强化鸿蒙与小程序性能（如 Skyline 渲染适配、编译提速），选型时建议结合官方最新 release notes 与团队技术栈做 PoC 验证。

## 八、常见坑与补充

1. **事件传参**：Taro 1.x 要求自定义事件以 `on` 开头；Taro 3 已大幅放宽，但仍建议遵循 `onXxx` 约定。
2. **图片资源**：必须使用 `<Image>` 组件并通过 `import` 或网络地址引入，不能直接用 `<img>`。
3. **JSX 限制（Taro 1.x）**：不支持对象展开 `{...props}`、不能在 `render` 外定义 JSX、不能在 `map` 循环中使用 `if` 表达式。Taro 3 已基本解决。
4. **组件属性命名**：避免用 `id`、`class`、`style` 作为自定义组件的 props 或 state 字段名，这些在微信小程序中可能丢失。
5. **环境变量**：使用 `process.env.NODE_ENV`、`process.env.TARO_ENV` 时避免解构，直接写完整路径。
6. **预加载**：微信小程序中可使用 `componentWillPreload` 提前发起请求，通过 `this.$preloadData` 在 `componentWillMount` 中获取。
7. **样式差异**：若需兼容 React Native，避免全局样式、标签选择器，使用 flex 布局。
8. **路由参数**：页面 `componentWillMount` 中可能拿不到参数，应使用 `useLoad` 或 `componentDidMount` 后再处理。

> 💡 补充：本文归档内容基于 Taro 1.x 时代的笔记，部分写法在 Taro 3/4 中已不适用；实际开发请以 [Taro 官方文档](https://docs.taro.zone/) 为准。

---

# 以下为原内容存档

> 以下内容为原始归档文件的完整保留，仅修正图片相对路径，文字原貌不变。

## React-taro基本知识.md

# Taro基本知识

## 一、Taro核心转化图

![image](../../youdaonote-images/C6A31D3909274DDAA8A43F1D83CB2812.png)

## 二、初始化目录结构

![image](../../youdaonote-images/A88A05AFE8FA4405A14B47C7AD63C84D.png)

**注意事项**

1.dist 目录下每次编译会覆盖，所以编译一次铐出去一次。

2.config是配置文件，类似于react 的webpack。

3.src存放源码, app.js下面定义页面的路径，被定义的为页面，其他的为组件。

## 三、小程序和h5的差别：

##### 1.在taro中需要配置路由来说明页面和组件的区别,而react的概念是万物皆组件

```jsx
config = {
    pages: [
      'pages/index/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }
```

##### 2.taro 传递函数时，格式必须是 on + '函数名'

##### 3.使用props 需要设置默认值

##### 4..引入的函数不能直接在子组件中用箭头函数调用，需要在子组件中单独写个函数，调用props上的函数

##### 5.图片必须放在Image组件里面，通过import 引入

##### 6.不能在render之外定义jsx，不能在函数中定义jsx（最近的版本已经支持了）

##### 7.不能在包含 JSX 元素的 map 循环中使用 if 表达式

##### 8.不能在 JSX 参数中使用对象展开符
```react
# 微信小程序组件要求每一个传入组件的参数都必须预先设定好，而对象展开符则是动态传入不固定数量的参数。所以 Taro 没有办法支持该功能。

# 无效情况
<View {...this.props} />

<View {...props} />

<Custom {...props} />
```

### 组件属性传递注意

不要以 `id`、`class`、`style` 作为自定义组件的属性与内部 state 的名称，因为这些属性名在微信小程序中会丢失。

### 组件 `state` 与 `props` 里字段重名的问题

不要在 `state` 与 `props` 上用同名的字段，因为这些被字段在微信小程序中都会挂在 `data` 上。

### 小程序中页面生命周期 `componentWillMount` 不一致问题

由于微信小程序里页面在 `onLoad` 时才能拿到页面的路由参数，而页面 onLoad 前组件都已经 `attached` 了。因此页面的 `componentWillMount` 可能会与预期不太一致。例如：

```react
// 错误写法
render () {
  // 在 willMount 之前无法拿到路由参数
  const abc = this.$router.params.abc
  return <Custom adc={abc} />
}

// 正确写法
componentWillMount () {
  const abc = this.$router.params.abc
  this.setState({
    abc
  })
}
render () {
  // 增加一个兼容判断
  return this.state.abc && <Custom adc={abc} />
}
```

对于不需要等到页面 willMount 之后取路由参数的页面则没有任何影响。

### 环境变量 `process.env` 的使用

不要以解构的方式来获取通过 `env` 配置的 `process.env` 环境变量，请直接以完整书写的方式 `process.env.NODE_ENV` 来进行使用

```react
// 错误写法，不支持
const { NODE_ENV = 'development' } = process.env
if (NODE_ENV === 'development') {
  ...
}

// 正确写法
if (process.env.NODE_ENV === 'development') {

}
```

### 预加载

在**微信小程序中**，从调用 `Taro.navigateTo`、`Taro.redirectTo` 或 `Taro.switchTab` 后，到页面触发 componentWillMount 会有一定延时。因此一些网络请求可以提前到发起跳转前一刻去请求。

Taro 提供了 `componentWillPreload` 钩子，它接收页面跳转的参数作为参数。可以把需要预加载的内容通过 `return` 返回，然后在页面触发 componentWillMount 后即可通过 `this.$preloadData` 获取到预加载的内容。

```react
class Index extends Component {
  componentWillMount () {
    console.log('isFetching: ', this.isFetching)
    this.$preloadData
      .then(res => {
        console.log('res: ', res)
        this.isFetching = false
      })
  }

  componentWillPreload (params) {
    return this.fetchData(params.url)
  }

  fetchData () {
    this.isFetching = true
    ...
  }
}
```

## 四、生命周期&State：

1.状态更新一定是异步的。
2.必须用setState去赋值。

- **constructor**，顾名思义，组件的构造函数。一般会在这里进行 `state` 的初始化，事件的绑定等等
- **componentWillMount**，是当组件在进行挂载操作前，执行的函数，一般紧跟着 `constructor` 函数后执行
- **componentDidMount**，是当组件挂载在 dom 节点后执行。一般会在这里执行一些异步数据的拉取等动作
- **shouldComponentUpdate**，返回 `false` 时，组件将不会进行更新，可用于渲染优化
- **componentWillReceiveProps**，当组件收到新的 `props` 时会执行的函数，传入的参数就是 `nextProps` ，你可以在这里根据新的 `props` 来执行一些相关的操作，例如某些功能初始化等
- **componentWillUpdate**，当组件在进行更新之前，会执行的函数
- **componentDidUpdate**，当组件完成更新时，会执行的函数，传入两个参数是 `prevProps` 、`prevState`
- **componentWillUnmount**，当组件准备销毁时执行。在这里一般可以执行一些回收的工作，例如 `clearInterval(this.timer)` 这种对定时器的回收操作

## 五、路由功能：

##### 在taro中，路由功能是默认自带的，不需要开发者进行额外的路由配置。通过小程序的配置适配了小程序和h5的路由问题。在config中指定好pages，然后在代码中通过taro提供的api来跳转到目的页面。

路由跳转：

```react
import Taro from '@tarojs/taro'

Taro.navigateTo(params).then(...)
                             
Taro.redirectTo(params).then(...)
```

获取url中的参数

```react
 xxx = this.$router.params.xxx
```

## 六、函数式组件

### 普通函数式组件

定义一个函数式组件非常简单：

```jsx
function Welcome(props) {
  return <View>Hello, {props.name}</View>;
}
```

这个函数接受一个参数 `props`，并且返回的是一个 JSX 元素。这样的函数就是函数式组件。相对于的 ES6 Class 组件是：

```jsx
class Welcome extends React.Component {
  render() {
    return <View>Hello, {this.props.name}</View>;
  }
}
```

在 Taro 中使用函数式组件有以下限制：

1. 函数的命名需要遵循[帕斯卡式命名法](https://baike.baidu.com/item/%E5%B8%95%E6%96%AF%E5%8D%A1%E5%91%BD%E5%90%8D%E6%B3%95/9464494?fr=aladdin)；
2. 一个文件中只能定义一个普通函数式组件或一个 Class 组件

### 类函数式组件

由于一个文件不能定义两个组件，但有时候我们需要组件内部的抽象组件，这时类函数式组件就是你想要答案。假设我们有一个 Class 组件，它包括了一个 `Header` 一个 `Footer`，我们可以这样定义：

```jsx
class SomePage extends Taro.Component {
  renderHeader () {
    const { header } = this.state
    return <View>{header}</View>
  }

  renderFooter (footer) {
    return <View>{footer}</View>
  }

  render () {
    return (
      <View>
        {this.renderHeader()}
        {...}
        {this.renderFooter('footer')}
      </View>
    )
  }
}
```

在 `renderHeader` 或 `renderFooter` 函数中，我们可以访问类的 `this`，也可以传入不限量的参数，这类型的函数也可以调用无限次数。但这样的写法也存在一些限制：

1. 函数的命名必须以 `render` 开头，`render` 后的第一个字母需要大写
2. 函数的参数不得传入 JSX 元素或 JSX 元素引用
3. 函数不能递归地调用自身

### 使用匿名函数

> 自 v1.2.9 开始支持

> 注意：在各小程序端，使用匿名函数，尤其是在 **循环中** 使用匿名函数，比使用 `bind` 进行事件传参占用更大的内存，速度也会更慢。

除了 `bind` 之外，事件参数也可以使用匿名函数进行传参。直接写匿名函数不会打乱原有监听函数的参数顺序：

```jsx
class Popper extends Component {
  constructor () {
    super(...arguments)
    this.state = { name: 'Hello world!' }
  }

  render () {
    const name = 'test'
    return (
      <Button onClick={(e) => {
        e.stopPropagation()
        this.setState({
          name
        })
      }}>
        {this.state.name}
      </Button>
    )
  }
}
```

> 注意： 使用通过 `usingComponents` 的第三方组件不支持匿名函数

### 柯里化

> 自 v1.3.0-beta.1 开始支持

> 在各小程序端，使用柯里化 Taro 会在编译后多生成一个匿名函数。

除了 `bind` 和匿名函数之外，事件参数也可以使用[柯里化](https://zh.wikipedia.org/wiki/%E6%9F%AF%E9%87%8C%E5%8C%96)传参。

```jsx
class Title extends Component{

  handleClick = (index) => (e) => {
    e.stopPropagation()
    this.setState({
      currentIndex: index
    })
  }

  render() {
    const { currentIndex } = this.props;
    return (
      {/* 调用 `this.handleClick(currentIndex)` 会返回一个函数，这个函数可以访问到 `currentIndex` 同时也能满足 `onClick` 的签名 */}
      <View onClick={this.handleClick(currentIndex)}>
      </View>
    )
  }
 }
```

## 七、系统变量

```react
process.env.TARP_ENV #用于判断当前环境
```

## React-taro环境搭建.md

# Taro环境搭建

## 一、安装

安装Taro 开发工具@tarojs/cli(用npm或者yarn进行全局安装)

**命令**

npm install -g @tarojs/cli

yarn global add @tarojs/cli


## 二、创建模板项目

**命令：**

taro init myApp

**创建应用**

taro init app

## 三、dev环境启动

**命令：**

npm run dev:h5 WEB

npm run dev:weapp 微信小程序

npm run dev:swan 百度小程序

npm run dev:alipay 支付宝小程序

npm run dev:rn ReactNative

### 微信小程序

选择微信小程序模式，需要自行下载并打开[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)，然后选择项目根目录进行预览。具体安装的方法和使用请参考第 3 章《[微信小程序开发入门与技术选型](https://juejin.im/book/5b73a131f265da28065fb1cd/section/5b73e92ce51d456680600665)》里的 「微信小程序开发入门」。

微信小程序编译预览及打包：

```
# npm script
$ npm run dev:weapp
$ npm run build:weapp
# 仅限全局安装
$ taro build --type weapp --watch
$ taro build --type weapp
# npx 用户也可以使用
$ npx taro build --type weapp --watch
$ npx taro build --type weapp
```

### 百度小程序

选择百度小程序模式，需要自行下载并打开[百度开发者工具](https://smartprogram.baidu.com/docs/develop/devtools/show_sur/)，然后在项目编译完后选择项目根目录下 `dist` 目录进行预览。

百度小程序编译预览及打包：

```
# npm script
$ npm run dev:swan
$ npm run build:swan
# 仅限全局安装
$ taro build --type swan --watch
$ taro build --type swan
# npx 用户也可以使用
$ npx taro build --type swan --watch
$ npx taro build --type swan
```

### 支付宝小程序

选择支付宝小程序模式，需要自行下载并打开[支付宝小程序开发者工具](https://docs.alipay.com/mini/developer/getting-started/)，然后在项目编译完后选择项目根目录下 `dist` 目录进行预览。

支付宝小程序编译预览及打包：

```
# npm script
$ npm run dev:alipay
$ npm run build:alipay
# 仅限全局安装
$ taro build --type alipay --watch
$ taro build --type alipay
# npx 用户也可以使用
$ npx taro build --type alipay --watch
$ npx taro build --type alipay
```

### H5

H5 模式，无需特定的开发者工具，在执行完下述命令之后即可通过浏览器进行预览。

H5 编译预览及打包：

```
# npm script
$ npm run dev:h5
# 仅限全局安装
$ taro build --type h5 --watch
# npx 用户也可以使用
$ npx taro build --type h5 --watch
```

### React Native

React Native 端运行需执行如下命令，React Native 端相关的运行说明请参见 [React Native 教程](https://nervjs.github.io/taro/docs/react-native.html)。

```
# npm script
$ npm run dev:rn
# 仅限全局安装
$ taro build --type rn --watch
# npx 用户也可以使用
$ npx taro build --type rn --watch
```

## 更新 Taro

Taro 提供了更新命令来更新 CLI 工具自身和项目中 Taro 相关的依赖。

更新 taro-cli 工具：

```
# taro
$ taro update self
# npm 
npm i -g @tarojs/cli@latest 
# yarn 
yarn global add @tarojs/cli@latest
```

更新项目中 Taro 相关的依赖，这个需要在你的项目下执行。

```
$ taro update project
```

## 四、项目打包

```react
"build:weapp": "taro build --type weapp",
"build:swan": "taro build --type swan",
"build:alipay": "taro build --type alipay",
"build:tt": "taro build --type tt",
"build:h5": "taro build --type h5",
"build:rn": "taro build --type rn",
"build:qq": "taro build --type qq",
"build:quickapp": "taro build --type quickapp",

# 搭建express服务器，将dist复制进入该项目    
npm install -g express
$ mkdir myapp
$ cd myapp
$ npm init
index.js

const express = require('express')
const app = express()

app.get('/', (req, res) => res.sendFile(__dirname+'/dist/index.html');
app.use(express.static('dist'));
app.listen(3000, () => console.log('Example app listening on port 3000!'))

node index.js
```

## taro-技术选型.md

## 流行的小程序开发框架


目前比较流行的小程序开发框架主要有[WePY](https://tencent.github.io/wepy/)、[mpvue](https://github.com/Meituan-Dianping/mpvue)、[Taro](https://github.com/NervJS/taro)，我们简单对比下。

- [WePY](https://tencent.github.io/wepy/) 应该是比较早的小程序开发框架了，而且也是腾讯内部开源的一款框架。它主要解决了小程序开发较为松散，不能用 NPM 包，自定义组件开发不友好等问题。相比于原生的开发方式，已经是大大地增强了开发体验，提高了开发效率。
- [mpvue](https://github.com/Meituan-Dianping/mpvue) 是美团点评技术团队开源的一款小程序开发框架，相较于 WePY，mpvue 则是完全用 [Vue](https://vuejs.org/index.html) 的开发方式来开发小程序，开发体验较 WePY 相比有了进一步的提升。
- [Taro](https://github.com/NervJS/taro) 则是我们京东凹凸实验室团队开源的一款小程序开发框架，与 mpvue 相反，Taro 用的是 [React](https://reactjs.org/) 的开发方式来开发小程序，可以说又是另一个派别了。

具体看下面表格：

|                      | 原生开发          | WePY                  | mpvue          | Taro             |
| -------------------- | ----------------- | --------------------- | -------------- | ---------------- |
| **开发方式**         | JS,JSON,WXML,WXSS | 类 Vue 开发，wpy 文件 | Vue 开发方式   | React 开发方式   |
| **是否支持 NPM 包**  | 非常规支持        | 支持                  | 支持           | 支持             |
| **ES6+ 特性支持**    | 开发者工具支持    | 支持                  | 支持           | 支持             |
| **CSS 预编译器支持** | 不支持            | 支持                  | 支持           | 支持             |
| **状态管理**         | 无                | Redux                 | Vuex           | Redux            |
| **生命周期**         | 小程序生命周期    | 小程序生命周期        | Vue 的生命周期 | React 的生命周期 |
| **流行程度**         | -                 | 14.9k个 Star          | 14.1k个 Star   | 10.5k个 Star     |



更具体的区别与对比要深入使用过才有发言权，在这里就不多说了，这里只是给大家一个大概的介绍，以便对当前小程序流行的开发方式有一定的了解。

## 技术选型

讲了那么多关于小程序的开发方式，我们应该如何选型？

首先，还是不太推荐小程序原生的开发方式。2018 年了，它还缺乏很多的现代前端开发所需的东西，例如 NPM 包，CSS 预编译，状态管理等，如果要开发大型项目，自然会需要做非常多的适配方法，简言之就是原生方式还是比较费时费力。不过据说新的版本会加入 NPM 包支持等新功能，在这里就小小期待一下吧。

### WePY

假如你需要开发中小型的小程序，同时也想体验原生小程序的诸多语法和特性，[WePY](https://tencent.github.io/wepy/) 是你很好的选择。它保留了小程序诸多的语法特性，例如模板绑定、生命周期、API 调用等，同时在小程序原生开发的基础上，优化整合了现代前端开发利器，很好地提升了开发体验。而且由于开源的时间很早，网上也有了很多关于此框架 Bug 解决方法的文章，也不怕会遇到什么困难而影响后续开发。

缺点可能就是有一定的学习成本，需要适应。

### mpvue

假如你是 Vue 开发者，同时也不想做太多的折腾，继续沿用 Vue 的开发方式来开发小程序，那么用 [mpvue](https://github.com/Meituan-Dianping/mpvue) 将会是你的最明智决定。除了有一些因为环境原因不能在小程序中使用的特性之外，几乎就和用 Vue 差不多，可以说真的是入门只需 5分钟。同时也支持一些第三方 UI 库，这给一些需要讲求速度的小程序开发者提供了便利。

### Taro

在上面描述 mpvue 的话语中，把 Vue 替换成 React ，就是对应 Taro 的描述了。作为一款新兴的框架（6月开源），第一款用 React 语法写小程序的框架，Taro 一直在不断的迭代和快速的成长，还给开发者提供了 [Taro-UI](https://nervjs.github.io/taro-ui/#/) 。对于 React 爱好者，Taro 将是你开发小程序的不二选择。

目前 Taro 1.0.0 的正式版已经发布，在稳定性和可用性上都有了很大的提高；除此之外，Taro 的多端转换功能也是其特色之一，可以将一套代码转换到小程序、H5 和 React Native 三端中使用，之后还有快应用等多端的支持计划。

Taro 支持主流的 React 开发方式，但由于实现原理，小程序限制等诸多原因导致它对一些较为特殊，不太常用的写法还不能 100% 支持，好在官网为此提供了最佳实践的文档。

## 小结

本章我们介绍了微信小程序开发入门，其中包括小程序账号的申请，微信开发者工具的简单使用以及新建了示例小程序；然后我们了解了小程序项目里都有哪些文件以及功能作用；最后我们对比了几个主流的开发框架。

总的来说，开发方式并没有什么优劣之分，适合自己的才是最好的。技术最终还是为业务服务，技术选型也是对症下药的过程，上面所说的几种框架各有优劣，哪种更适合团队，更能提高开发效率，自然就选择哪一种框架。

## taro-自带方法.md


# 1.Taro.showToast(OBJECT)

显示消息提示框，支持 `Promise` 化使用。

**OBJECT 参数说明：**

| 参数     | 类型     | 必填 | 说明                                             |
| -------- | -------- | ---- | ------------------------------------------------ |
| title    | String   | 是   | 提示的内容                                       |
| icon     | String   | 否   | 图标，有效值 "success", "loading", "none"        |
| image    | String   | 否   | 自定义图标的本地路径，image 的优先级高于 icon    |
| duration | Number   | 否   | 提示的延迟时间，单位毫秒，默认：1500             |
| mask     | Boolean  | 否   | 是否显示透明蒙层，防止触摸穿透，默认：false      |
| success  | Function | 否   | 接口调用成功的回调函数                           |
| fail     | Function | 否   | 接口调用失败的回调函数                           |
| complete | Function | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

**icon 有效值**

| 有效值  | 说明         |
| ------- | ------------ |
| success | 显示成功图标 |
| loading | 显示加载图标 |
| none    | 不显示图标   |

## 示例代码

```jsx
import Taro from '@tarojs/taro'

Taro.showToast({
  title: '成功',
  icon: 'success',
  duration: 2000
})
  .then(res => console.log(res))
```

## API支持度

| API            | 微信小程序 | H5   | React Native |
| -------------- | ---------- | ---- | ------------ |
| Taro.showToast | ✔️          | ✔️    | ✔️            |

# 2.Taro.getStorage(OBJECT)

从本地缓存中异步获取指定 key 对应的内容，支持 `Promise` 化使用。

**OBJECT 参数说明：**

| 参数     | 类型     | 必填 | 说明                                             |
| -------- | -------- | ---- | ------------------------------------------------ |
| key      | String   | 是   | 本地缓存中的指定的 key                           |
| success  | Function | 否   | 接口调用成功的回调函数                           |
| fail     | Function | 否   | 接口调用失败的回调函数                           |
| complete | Function | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

**success 返回参数说明：**

| 参数 | 类型   | 说明           |
| ---- | ------ | -------------- |
| data | String | key 对应的内容 |

## 示例代码

```jsx
import Taro from '@tarojs/taro'

Taro.getStorage({ key: 'key' })
  .then(res => console.log(res.data))
```

## API支持度

| API                     | 微信小程序 | H5   | React Native |
| ----------------------- | ---------- | ---- | ------------ |
| Taro.getStorage         | ✔️          | ✔️    | ✔️            |
| Taro.getStorageSync     | ✔️          | ✔️    |              |
| Taro.getStorageInfo     | ✔️          | ✔️    | ✔️            |
| Taro.getStorageInfoSync | ✔️          | ✔️    |              |

# 3.Taro.getStorageSync(KEY)

从本地缓存中同步获取指定 key 对应的内容。

**参数说明：**

| 参数 | 类型   | 必填 | 说明                   |
| ---- | ------ | ---- | ---------------------- |
| key  | String | 是   | 本地缓存中的指定的 key |

## 示例代码

```jsx
import Taro from '@tarojs/taro'

const data = Taro.getStorageSync('key')
```

## API支持度

| API                 | 微信小程序 | H5   | React Native |
| ------------------- | ---------- | ---- | ------------ |
| Taro.getStorageSync | ✔️          | ✔️    |              |

## Taro-设计思想及架构.md

# Taro 设计思想及架构
> Taro 诞生之初是为了解决微信小程序开发的一系列痛点，那么它是如何从一个小程序开发框架慢慢演变成一个多端统一开发框架的呢？本章节将带你了解 Taro 的整体设计思想与架构。

## 使用 React 语法来写小程序

### 谈一谈小程序开发

微信小程序为我们的业务提供了一种新的展现形态，但对于开发者来说，开发体验则显得并不那么友好。

首先，从文件组织上看，一个小程序页面或组件，需要同时包含 4 个文件：脚本逻辑、样式、模板以及配置文件，在开发一个功能模块时，就需要在 4 个文件之间切换，而当功能模块多的话，就需要在多个文件之间切换，这样显然非常浪费时间。

其次，从开发方式上看，在前端工程化思想深入人心的今天，小程序的种种开发方式显得有些落后了，主要体现在以下几个方面：

- 没有自定义文件预处理，无法直接使用 Sass、Less 以及较新的 ES.Next 语法；
- 字符串模板太过孱弱，小程序的字符串模板仿的是 **Vue**，但是没有提供 **Vue** 那么多的语法糖，当实现一些比较复杂的处理时，写起来就非常麻烦，虽然提供了 `wxs` 作为补充，但是使用体验还是非常糟糕；
- 缺乏测试套件，无法编写测试代码来保证项目质量，也就不能进行持续集成，自动化打包。

所以，从开发方式上看，小程序开发没有融入目前主流的工程化开发思想，很多业界开发模式与工具没有在小程序开发中得到相应体现，像是从前端工业时代回退到了刀耕火种的年代。

最后，从代码规范上看，小程序的规范有很多不统一的地方，例如内置组件的属性名，有时候是全小写，有时候是 `CamelCase` 格式，有时候又是中划线分割的形式，这样就导致编码的时候得不时查阅文档才能确定写法。

### 如何更优雅地开发小程序

在 Taro 的设计之初，我们的想法就是希望能够以一种更加优雅的方式来开发小程序，解决小程序开发上的种种痛点，首先我们希望能使用前端工程化的方式来进行开发，同时在语法上，我们希望能抛弃小程序的四不像语法，遵循一套我们熟悉的框架语法来进行开发，这样不仅能更好地保证开发质量、提升开发体验，同时也能大大降低开发者开发小程序的成本。

于是，在开发方式上，Taro 打造了一套完善编译工具，引入了前置编译的机制，可以自动化地对源文件进行一系列的处理，最终输出小程序上的可执行文件，包括代码的编译转换处理，加入文件预处理功能，支持 NPM 包管理等等，这一部分的原理，将会在后续章节中为大家介绍。而语法标准上，我们把目光投向了市面上流行的三大前端框架。



![前端三大框架](https://user-gold-cdn.xitu.io/2018/10/8/1665182480ea31e5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



**React**、**Vue**、**Angular** 是目前前端框架三巨头，他们各有各的风格，关于他们的优劣，在业界也是一直争论不休，这本身也是智者见智仁者见仁的事，所以在本文中就不再评述。Taro 最终采用的是 **React** 语法来作为自己的语法标准，主要有以下几点考虑：

- React 是一个非常流行的框架，也有广大的受众，使用它也能降低小程序开发的学习成本；
- 小程序的数据驱动模板更新的思想与实现机制，与 React 类似；
- React 采用 JSX 作为自身模板，JSX 相比字符串模板来说更自由，更自然，更具表现力，不需要依赖字符串模板的各种语法糖，也能完成复杂的处理
- React 本身有跨端的实现方案 - React Native，并且非常成熟，社区活跃，对于 Taro 来说有更多的多端开发可能性。

最终，Taro 采用了 **React** 语法来作为自己的语法标准，配合前端工程化的思想，为小程序开发打造了更加优雅的开发体验。

### 如何实现优雅

那么如何实现使用 React 来开发小程序呢？在 Taro 中采用的是**编译原理**的思想，所谓编译原理，就是一个对输入的源代码进行语法分析，语法树构建，随后对语法树进行转换操作再解析生成目标代码的过程。



![img](https://user-gold-cdn.xitu.io/2018/10/8/1665182480dfc020?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



在后续章节中，我们将会为大家详细讲述，如何基于编译原理思想来实现使用 React 来开发小程序，揭开其背后的种种开发秘辛。

## 探索多端可能性

多端统一开发一直是所有开发人员的共同追求。在终端碎片化的大背景下，前有 Hybrid 模式拉开序幕，后有 React Native、Weex 风起云涌，再到如今 Flutter 横空出世，种种这些都是为了能够 `Write once, run anywhere` 。给每一种终端单独进行开发的成本是昂贵的，所以一个能够尽可能抹平多端开发差异的开发解决方案就显得极为重要。

### 多端转换原理

开发时我们遵循 React 语法标准，结合编译原理的思想，对代码文件进行一系列转换操作，最终获得可以在小程序运行的代码。而 React 最开始就是为了解决 Web 开发而生的，所以对代码稍加改动，也可以直接生成在 Web 端运行的代码，而同属 React 语法体系下的 React Native，也能够很便捷地提供支持。同理其他平台，如快应用、百度小程序等，将源码进行编译转换操作，也能获得该平台下的对应语法代码。



![img](https://user-gold-cdn.xitu.io/2018/10/8/1665182486e8b561?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



### 抹平多端差异

基于编译原理，我们已经可以将 Taro 源码编译成不同端上可以运行的代码了，但是这对于实现多端开发还是远远不够。因为不同的平台都有自己的特性，每一个平台都不尽相同，这些差异主要体现在**不同的组件标准**与**不同的 API 标准**以及**不同的运行机制**上。

以小程序和 Web 端为例。



![img](https://user-gold-cdn.xitu.io/2018/10/8/1665182486f397d9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





![img](https://user-gold-cdn.xitu.io/2018/10/8/1665182487386fef?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



可以看出小程序和 Web 端上**组件标准**与 **API** 标准有很大差异，这些差异仅仅通过代码编译手段是无法抹平的，例如你不能直接在编译时将小程序的 `<view />` 直接编译成 `<div />`，因为他们虽然看上去有些类似，但是他们的组件属性有很大不同的，仅仅依靠代码编译，无法做到一致，同理，众多 `API` 也面临一样的情况。针对这样的情况，Taro 采用了定制一套运行时标准来抹平不同平台之间的差异。

这一套标准主要以三个部分组成，包括**标准运行时框架**、**标准基础组件库**、**标准端能力 API**，其中运行时框架和 API 对应 **@taro/taro**，组件库对应 **@tarojs/components**，通过在不同端实现这些标准，从而达到去差异化的目的。



![img](https://user-gold-cdn.xitu.io/2018/10/8/16651824884a5682?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



而在标准的定制上，起初我们想重新定制一套标准规范，但是发现在所有端都得实现这套标准的成本太高，所以我们就思考为什么不以一个端的组件库、API 为标准呢？这样不仅省去了标准定制的时间，而且在这个端上我们可以不用去实现这套标准了。最终在所有端中，我们挑选了微信小程序的组件库和 API 来作为 Taro 的运行时标准，因为微信小程序的文档非常完善，而且组件与 API 也是非常丰富，同时最重要的是，百度小程序以及支付宝小程序都是遵循的微信小程序的标准，这样一来，Taro 在实现这两个平台的转换上成本就大大降低了。



![img](https://user-gold-cdn.xitu.io/2018/10/8/16651824b8ac59a4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



## 小结

本文主要介绍了 Taro 在实现多端统一开发上的架构原理与思想，带大家了解 Taro 背后的设计原理，帮助大家对 Taro 有更深刻的理解。Taro 主要借助编译原理的思想来实现多端统一开发，在接下来的章节中将带领大家更深入地了解编译原理在 Taro 中的应用，为大家打开解决问题的新思路。

## Taro Build

`taro build` 命令是整个 Taro 项目的灵魂和核心，主要负责**多端代码编译**（H5，小程序，React Native 等）。

Taro 命令的关联，参数解析等和 `taro init` 其实是一模一样的，那么最关键的代码转换部分是怎样实现的呢？

这一部分内容过于庞大，需要单独拉出来一篇讲。不过这里可以先简单提一下。

### 编译工作流与抽象语法树（AST）

Taro 的核心部分就是将代码编译成其他端（H5、小程序、React Native 等）代码。一般来说，将一种结构化语言的代码编译成另一种类似的结构化语言的代码包括以下几个步骤：



![image](https://user-gold-cdn.xitu.io/2018/10/8/166515483b7fa7c0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



首先是 Parse，将代码解析（Parse）成抽象语法树（Abstract Syntex Tree），然后对 AST 进行遍历（traverse）和替换(replace)（这对于前端来说其实并不陌生，可以类比 DOM 树的操作），最后是生成（generate），根据新的 AST 生成编译后的代码。

### Babel 模块

Babel 是一个通用的多功能的 `JavaScript`编译器，更确切地说是源码到源码的编译器，通常也叫做转换编译器（transpiler）。 意思是说你为 Babel 提供一些 JavaScript 代码，Babel 更改这些代码，然后返回给你新生成的代码。

此外它还拥有众多模块可用于不同形式的静态分析。

> 静态分析是在不需要执行代码的前提下对代码进行分析的处理过程（执行代码的同时进行代码分析即是动态分析）。 静态分析的目的是多种多样的， 它可用于语法检查、编译、代码高亮、代码转换、优化和压缩等等场景。

## 多端差异

在开始讲述实现之前，先了解一下各端之间的差异，这也是我们实际操作中绕不过的坎。

### 组件差异

小程序、H5 以及快应用都可以划分为 XML 类，React Native 归为 JSX 类，两种语言风牛马不相及，给适配设置了非常大的障碍。XML 类有个明显的特点是关注点分离（Separation of Concerns），即语义层（XML）、视觉层（CSS）、交互层（JavaScript）三者分离的松耦合形式，JSX 类则要把三者混为一体，用脚本来包揽三者的工作。

不同端的组件的差异还体现在定制程度上：

- H5 标签（组件）提供最基础的功能——布局、表单、媒体、图形等等；
- 小程序组件相对 H5 有了一定程度的定制，我们可以把小程序组件看作一套类似于 H5 的 UI 组件库；
- React Native 端组件也同样如此，而且基本是专“组”专用的，比如要触发点击事件就得用 `Touchable` 或者 `Text` 组件，要渲染文本就得用 `Text` 组件（虽然小程序也提供了 `Text` 组件，但它的文本仍然可以直接放到 `view` 之类的组件里）。

对于 React Native 的样式，我们可以姑且把它当作 CSS 的子集，但相比于 CSS，又有非常大的差别，首先是单位不一致，你必须根据屏幕的尺寸来精细地控制元素的尺寸和相关数值，然后是以对象的形式存在，不作用于全局，没有**选择器**的概念，你完全可以把它看做是一种 `Inline Style`，对于写惯了 XML 类的朋友，可能不太适应这种“另类”的写法，于是林林总总的[第三方库](https://github.com/MicheleBertoli/css-in-js)就冒出来了，这类库统称为 `CSS in JS`，至于他们存在的意义就见仁见智了。

### API 差异

各端 API 的差异具有定制化、接口不一、能力限制的特点：

1. 定制化：各端所提供的 API 都是经过量身打造的，比如小程序的开放接口类 API，完全是针对小程序所处的微信环境打造的，其提供的功能以及外在表现都已由框架提供实现，用户上手可用，毋须关心内部实现。
2. 接口不一：相同的功能，在不同端下的调用方式以及调用参数等也不一样，比如 `socket`，小程序中用 `wx.connectSocket` 来连接，H5 则用 `new WebSocket()` 来连接，这样的例子我们可以找到很多个。
3. 能力限制：各端之间的差异可以进行定制适配，然而并不是所有的 API（此处特指小程序 API，因为多端适配是向小程序看齐的）在各个端都能通过定制适配来实现，因为不同端所能提供的端能力“大异小同”，这是在适配过程中不可抗拒、不可抹平的差异。

## 设计思路

由多端差异我们了解到进行多端适配的困难，那应该如何去设计组件和 API 呢？

由于组件和 API 定制程度的不同，相同功能的组件和 API 提供的能力不完全相同，在设计的时候，对于端差异较小的不影响主要功能的，我们直接使用相应端对应的组件 API 来实现，并申明特性的支持程度，对于端差异较大的且影响了主要功能的，则通过封装的形式来完成，并申明特性的支持程度，**绝大部分的组件 API 都是通过这种形式来实现的**。

这里特别提到样式的设计，前面提到 React Native 的 `Inline Style`，不支持全局样式，不支持标签样式，不支持部分的 CSS 属性，flex 布局等等，这些可能会在交付开发者使用过程中人为产生的问题，我们会在规范中提到：如果你要兼容 React Native，不要使用全局样式，不要用标签样式，不能写这个样式等等。

## 多端适配

### 样式处理

H5 端使用官方提供的 [WEUI](https://github.com/Tencent/weui) 进行适配，React Native 端则在组件内添加样式，并通过脚本来控制一些状态类的样式，框架核心在编译的时候把源代码的 `class` 所指向的样式通过 [css-to-react-native](https://github.com/styled-components/css-to-react-native) 进行转译，所得 StyleSheet 样式传入组件的 `style` 参数，组件内部会对样式进行二次处理，得到最终的样式。



![样式处理流程](https://user-gold-cdn.xitu.io/2018/10/8/1665155932b630fe?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



> 为什么需要对样式进行二次处理？
>
> 部分组件是直接把传入 style 的样式赋给最外层的 React Native 原生组件，但部分经过层层封装的组件则不然，我们要把容器样式、内部样式和文本样式离析。为了方便解释，我们把这类组件简化为以下的形式：
>
> ```react
> <View style={wrapperStyle}>
>   <View style={containerStyle}>
>     <Text style={textStyle}>Hello World</Text>
>   </View>
> </View>
> ```
>
> 假设组件有样式 `margin-top`、`background-color` 和 `font-size`，转译传入组件后，就要把分别把它们传到 `wrapperStyle`、`containerStyle` 和 `textStyle`，可参考 `ScrollView` 的 `style` 和 `contentContainerStyle`。

### 组件封装

组件的封装则是一个“仿制”的过程，利用端提供的原材料，加工成通用的组件，暴露相对统一的调用方式。我们用 `<Button />` 这个组件来举例，在小程序端它也许是长这样子的：

```react
<button size="mini" plain={{plain}} loading={{loading}} hover-class="you-hover-me"></button>
```

如果要实现 H5 端这么一个按钮，大概会像下面这样，在组件内部把小程序的按钮特性实现一遍，然后暴露跟小程序一致的调用方式，就完成了 H5 端一个组件的设计。

```react
<button
  {...omit(this.props, ['hoverClass', 'onTouchStart', 'onTouchEnd'])}
  className={cls}
  style={style}
  onClick={onClick}
  disabled={disabled}
  onTouchStart={_onTouchStart}
  onTouchEnd={_onTouchEnd}
>
  {loading && <i class='weui-loading' />}
  {children}
</button>
```

其他端的组件适配相对 H5 端来说会更曲折复杂一些，因为 H5 跟小程序的语言较为相似，而其他端需要整合特定端的各种组件，以及利用端组件的特性来实现，比如在 React Native 中实现这个按钮，则需要用到 `<Touchable* />`、`<View />`、`<Text />`，要实现动画则需要用上 `<Animated.View />`，还有就是相对于 H5 和小程序比较容易实现的 `touch` 事件，在 React Native 中则需要用上 `PanResponder` 来进行“仿真”，总之就是，因“端”制宜，一切为了最后只需一行代码通行多端！

除了属性支持外，事件回调的参数也需要进行统一，为此，需要在内部进行处理，比如 `Input` 的 `onInput` 事件，需要给它造一个类似小程序相同事件的回调参数，比如 `{ target: { value: text }, detail: { value: text } }`，这样，开发者们就可以像下面这样处理回调事件，无需关心中间发生了什么。

```react
function onInputHandler ({ target, detail }) {
  console.log(target.value, detail.value)
}
```

当然，因“端”制宜也并不能支持所有的特性，换句话说实现完全支持会特别困难，比如 `<Input />` 的 `type` 属性，下面是 React Native 实现中的类型对应，可以看到 `idcard` 类型转为了 `default` 类型，因为 React Native 本身不支持：

```react
const keyboardTypeMap = {
  text: 'default',
  number: 'numeric',
  idcard: 'default',
  digit: Platform.select({
    ios: 'decimal-pad',
    android: 'numeric'
  })
}
```

还有就是组件规范方面，由于 React Native 是 flex 型布局的，这点跟 H5 和小程序还是有蛮大区别的，所以就得在开发规范中约束用户要注意这些，比如用户要兼容 React Native 就要采用 flex 布局的写法。

### 质量把关

> 代码质量重于泰山，凹凸实验室始终把代码质量看作重中之重，通过两个强力手腕来保证，一是代码规范，二是测试。

#### 代码规范

在日常业务中也需遵循代码规范，日常 Code Review 也会把代码规范作为检查的一方面，统一的规范对于代码交接，业务检查等方面有重要作用，在 Taro 组件库和 API 的相应库代码都严格遵循这个规范，既保证团队开发者协作的顺畅，又利于优秀的开源合作者们贡献代码。总之，代码规范既体现个人的代码素养，也侧面体现团队的综合能力。

#### 测试

作为 Taro 中的重要一环，组件和 API 功能的稳定性尤为重要，于是引入了**单元测试**，细心的读者可以翻阅框架代码、组件和 API 的库都带有 `JEST` 测试。当然，不管在任何框架，写测试是一个优秀开发者必做的工作。

# JSX 转换微信小程序模板的实现

> 在一个优秀且严格的规范限制下，从更高抽象的视角（语法树）来看，每个人写的代码都差不多。
>
> 也就是说，对于微信小程序这样不开放不开源的端，我们可以先把 React 代码想象成一颗抽象语法树，根据这颗树生成小程序支持的模板代码，再做一个小程序运行时框架处理事件和生命周期与之兼容，然后把业务代码跑在运行时框架就完成了小程序端的适配。

## 代码的本质

不管是任意语言的代码，其实它们都有两个共同点：

1. 它们都是由字符串构成的文本
2. 它们都要遵循自己的语言规范

第一点很好理解，既然代码是字符串构成的，我们要修改/编译代码的最简单的方法就是使用字符串的各种正则表达式。例如我们要将 JSON 中一个键名 `foo` 改为 `bar`，只要写一个简单的正则表达式就能做到：

```javascript
jsonStr.replace(/(?<=")foo(?="\s*:)/i, 'bar')
```

而这句代码就是我们的编译器——你看到这里可能觉得被骗了：“说好了讲一些编译原理高大上的东西呢？”但实际上这是理解编译器万里长征的第零步（也可能是最重要的一步）：**编译就是把一段字符串改成另外一段字符串**。很多同学觉得做编译一定是高大上的，但当我们把它拉下神坛，就可以发现它其实就是（艰难地）操作字符串而已。

我们再来看这个正则表达式，由于 JSON 规定了它的键名必须由双引号包裹且包裹键名的第二个双引号的下一个非空字符串一定是冒号，所以我们的正则一定能匹配到对应的键值。这就是我们之前提到的凡是语言一定有一个规范， JavaScript 作为 JSON 的超集也和 JSON 别无二致，也就是说不管是 JSON 还是 JavaScript 它们的代码都是结构化的，我们可以通过任意一个结构化的数据结构（Schema）把它们的对应语法描述出来。

## Babel

JavaScript 社区其实有非常多 parser 实现，比如 Acorn、Esprima、Recast、Traceur、Cherow 等等。但我们还是选择使用 Babel，主要有以下几个原因：

1. Babel 可以解析还没有进入 ECMAScript 规范的语法。例如装饰器这样的提案，虽然现在没有进入标准但是已经广泛使用有一段时间了；
2. Babel 提供插件机制解析 TypeScript、Flow、JSX 这样的 JavaScript 超集，不必单独处理这些语言；
3. Babel 拥有庞大的生态，有非常多的文档和样例代码可供参考；
4. 除去 parser 本身，Babel 还提供各种方便的工具库可以优化、生成、调试代码。

### Babylon（ `@babel/parser`）

Babylon 就是 Babel 的 parser。它可以把一段符合规范的 JavaScript 代码输出成一个符合 [Esprima](https://github.com/jquery/esprima) 规范的 AST。 大部分 parser 生成的 AST 数据结构都遵循 [Esprima](https://github.com/jquery/esprima) 规范，包括 ESLint 的 parser [ESTree](https://github.com/eslint/espree)。这就意味着我们熟悉了 [Esprima](https://github.com/jquery/esprima) 规范的 AST 数据结构还能去写 ESLNint 插件。

我们可以尝试解析 `n * n` 这句简单的表达式：

```react
import * as babylon from "babylon";

const code = `n * n`;

babylon.parse(code);
```

最终 Babylon 会解析成这样的数据结构：



![image](https://user-gold-cdn.xitu.io/2018/10/8/1665157669296bc1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



你也可以使用 [ASTExploroer](https://astexplorer.net/) 快速地查看代码的 AST。

### Babel-traverse (`@babel/traverse`)

`babel-traverse` 可以遍历由 Babylon 生成的抽象语法树，并把抽象语法树的各个节点从拓扑数据结构转化成一颗路径（Path）树，Path 表示两个节点之间连接的响应式（Reactive）对象，它拥有添加、删除、替换节点等方法。当你调用这些修改树的方法之后，路径信息也会被更新。除此之外，Path 还提供了一些操作作用域（Scope） 和标识符绑定（Identifier Binding） 的方法可以去做处理一些更精细复杂的需求。可以说 `babel-traverse` 是使用 Babel 作为编译器最核心的模块。

让我们尝试一下把一段代码中的 `n * n` 变为 `x * x`：

```react
import * as babylon from "@babel/parser";
import traverse from "babel-traverse";

const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(code);

traverse(ast, {
  enter(path) {
    if (
      path.node.type === "Identifier" &&
      path.node.name === "n"
    ) {
      path.node.name = "x";
    }
  }
});
```

### Babel-types（`@babel/types`）

`babel-types` 是一个用于 AST 节点的 Lodash 式工具库，它包含了构造、验证以及变换 AST 节点的方法。 该工具库包含考虑周到的工具方法，对编写处理 AST 逻辑非常有用。例如我们之前在 `babel-traverse` 中改变标识符 `n` 的代码可以简写为：

```react
import traverse from "babel-traverse";
import * as t from "babel-types";

traverse(ast, {
  enter(path) {
    if (t.isIdentifier(path.node, { name: "n" })) {
      path.node.name = "x";
    }
  }
});
```

可以发现使用 `babel-types` 能提高我们转换代码的可读性，在配合 TypeScript 这样的静态类型语言后，`babel-types` 的方法还能提供类型校验的功能，能有效地提高我们转换代码的健壮性和可靠性。

## 设计思路

Taro 的结构主要分两个方面：运行时和编译时。运行时负责把编译后到代码运行在本不能运行的对应环境中，你可以把 Taro 运行时理解为前端开发当中 `polyfill`。举例来说，小程序新建一个页面是使用 `Page` 方法传入一个字面量对象，并不支持使用类。如果全部依赖编译时的话，那么我们要做到事情大概就是把类转化成对象，把 `state` 变为 `data`，把生命周期例如 `componentDidMount` 转化成 `onReady`，把事件由可能的类函数（Class method）和类属性函数(Class property function) 转化成字面量对象方法（Object property function）等等。

但这显然会让我们的编译时工作变得非常繁重，在一个类异常复杂时出错的概率也会变高。但我们有更好的办法：实现一个 `createPage` 方法，接受一个类作为参数，返回一个小程序 `Page` 方法所需要的字面量对象。这样不仅简化了编译时的工作，我们还可以在 `createPage` 对编译时产出的类做各种操作和优化。通过运行时把工作分离了之后，再编译时我们只需要在文件底部加上一行代码 `Page(createPage(componentName))` 即可。

![设计思想](https://user-gold-cdn.xitu.io/2018/10/8/1665157cb5a81196?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

为了使 Taro 组件转换成小程序组件并运行在小程序环境下， Taro 主要做了两个方面的工作：编译以及运行时适配。编译过程会做很多工作，例如：将 JSX 转换成小程序 .wxml 模板，生成小程序的配置文件、页面及组件的代码等等。编译生成好的代码仍然不能直接运行在小程序环境里，那运行时又是如何与之协同工作的呢？

## 注册程序、页面以及自定义组件

在小程序中会区分程序、页面以及组件，通过调用对应的函数，并传入包含生命周期回调、事件处理函数等配置内容的 object 参数来进行注册：

```react
Component({
  data: {},
  methods: {
    handleClick () {}
  }
})
```

而在 Taro 里，它们都是一个组件类：

```react、
class CustomComponent extends Component {
  state = { }
  handleClick () { }
}
```

那么 Taro 的组件类是如何转换成小程序的程序、页面或组件的呢？

例如，有一个组件：customComponent，编译过程会在组件底部添加一行这样的代码（此处代码作示例用，与实际项目生成的代码不尽相同）：

```react
Component(createComponent(customComponent))
```

createComponent 方法是整个运行时的入口，在运行的时候，会根据传入的组件类，返回一个组件的配置对象。

> 在小程序里，程序的功能及配置与页面和组件差异较大，因此运行时提供了两个方法 createApp 和 createComponent 来分别创建程序和组件（页面）。createApp 的实现非常简单，本章我们主要介绍 createComponent 做的工作。

createComponent 方法主要做了这样几件事情：

1. 将组件的 state 转换成小程序组件配置对象的 data
2. 将组件的生命周期对应到小程序组件的生命周期
3. 将组件的事件处理函数对应到小程序组件的事件处理函数

接下来将分别讲解以上三个部分。

## 组件 state 转换

其实在 Taro（React） 组件里，除了组件的 state，JSX 里还可以访问 props 、render 函数里定义的值、以及任何作用域上的成员。而在小程序中，与模板绑定的数据均来自对应页面（或组件）的 data 。因此 JSX 模板里访问到的数据都会对应到小程序组件的 data 上。接下来我们通过列表渲染的例子来说明 state 和 data 是如何对应的：

### 在 JSX 里访问 state

在小程序的组件上使用 wx:for 绑定一个数组，就可以实现循环渲染。例如，在 Taro 里你可能会这么写：

```react
{ 
  state = {
    list: [1, 2, 3]
  }
  render () {
    return (
      <View>
        {this.state.list.map(item => <View>{item}</View>)}
      </View>
    )
  }
}
```

编译后的小程序组件模板：

```react
<view>
  <view wx:for="{{list}}" wx:for-item="item">{{item}}</view> 
</view>
```

其中 state.list 只需直接对应到小程序（页面）组件的 data.list 上即可。

### 在 render 里生成了新的变量

然而事情通常没有那么简单，在 Taro 里也可以这么用：

```react
{
  state = {
    list = [1, 2, 3]
  }
  render () {
    return (
      <View>
        {this.state.list.map(item => ++item).map(item => <View>{item}</View>)}
      </View>
    )
  }
}
```

编译后的小程序组件模板是这样的：

```react
<view>
  <view wx:for="{{$anonymousCallee__1}}" wx:for-item="item">{{item}}</view> 
</view>
```

在编译时会给 Taro 组件创建一个 `_createData` 的方法，里面会生成 `$anonymousCallee__1` 这个变量， `$anonymousCallee__1` 是由编译器生成的，对 `this.state.list` 进行相关操作后的变量。 `$anonymousCallee__1` 最终会被放到组件的 data 中给模板调用：

```react
var $anonymousCallee__1 = this.state.list.map(function (item) {
  return ++item;
});
```

render 里 return 之前的所有定义变量或者对 props、state 计算产生新变量的操作，都会被编译到 `_createData` 方法里执行，这一点在前面 JSX 编译成小程序模板的相关文章中已经提到。每当 Taro 调用 `this.setState API` 来更新数据时，都会调用生成的 `_createData` 来获取最新数据。

## 将组件的生命周期对应到小程序组件的生命周期

生命周期的对应工作主要包含两个部分：初始化过程和状态更新过程。

初始化过程里的生命周期对应很简单，在小程序的生命周期回调函数里调用 Taro 组件里对应的生命周期函数即可，例如：小程序组件 ready 的回调函数里会调用 Taro 组件的 componentDidMount 方法。它们的执行过程和对应关系如下图：



![asset/taro-weapp-runtime-lifecycle.jpg](https://user-gold-cdn.xitu.io/2018/10/8/166515c132121443?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



> 小程序的页面除了渲染过程的生命周期外，还有一些类似于 onPullDownRefresh 、 onReachBottom 等功能性的回调方法也放到了生命周期回调函数里。这些功能性的回调函数，Taro 未做处理，直接保留了下来。

小程序页面的 componentWillMount 有一点特殊，会有两种初始化方式。由于小程序的页面需要等到 onLoad 之后才可以获取到页面的路由参数，因此如果是启动页面，会等到 onLoad 时才会触发。而对于小程序内部通过 navigateTo 等 API 跳转的页面，Taro 做了一个兼容，调用 navigateTo 时将页面参数存储在一个全局对象中，在页面 attached 的时候从全局对象里取到，这样就不用等到页面 onLoad 即可获取到路由参数，触发 componentWillMount 生命周期。

状态更新：



![asset/taro-weapp-runtime-setstate](https://user-gold-cdn.xitu.io/2018/10/8/166515c132336584?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



Taro 组件的 setState 行为最终会对应到小程序的 setData。Taro 引入了如 nextTick ，编译时识别模板中用到的数据，在 setData 前进行数据差异比较等方式来提高 setState 的性能。

如上图，组件调用 setState 方法之后，并不会立刻执行组件更新逻辑，而是会将最新的 state 暂存入一个数组中，等 nextTick 回调时才会计算最新的 state 进行组件更新。这样即使连续多次的调用 setState 并不会触发多次的视图更新。在小程序中 nextTick 是这么实现的：

```react
const nextTick = (fn, ...args) => {
  fn = typeof fn === 'function' ? fn.bind(null, ...args) : fn
  const timerFunc = wx.nextTick ? wx.nextTick : setTimeout
  timerFunc(fn)
}
```

除了计算出最新的组件 state ，在组件状态更新过程里还会调用前面提到过的 `_createData` 方法，得到最终小程序组件的 data，并调用小程序的 setData 方法来进行组件的更新。

组件更新如何触发子组件的更新呢？

这里用到了小程序组件的 properties 的 observer 特性，给子组件传入一个 prop 并在子组件里监听 prop 的更改，这个 prop 更新就会触发子组件的状态更新逻辑。细心的 Taro 开发者可能会发现，编译后的代码里会给每个自定义的组件传入一个 `__triggerObserer` 的值，它的作用正是用于触发子组件的更新逻辑。

由于小程序在调用 setData 之后，会将数据使用 JSON.stringify 进行序列化，再拼接成脚本，然后再传给视图层渲染，这样的话，当数据量非常大的时候，小程序就会变得异常卡顿，性能很差。Taro 在框架级别帮助开发者进行了优化。

- 首先，在编译的过程中会找到所有在模板中用到到字段 ，并存储到组件的 $usedState 字段中。例如，编译后的小程序模板：

```react
<view>{{a}}<view>
```

那么在编译后的组件类里就会多这样一个字段：

```react
{
  $usedState = ['a']
}
```

在计算完小程序的 data 之后，会遍历 $usedState 字段，将多余的内容过滤掉，只保留模板用到的数据。例如，即使原本组件的状态包含：

```react
{
  state = {
    a: 1,
    b: 2,
    c: 3
  }
}
```

最终 setData 的数据也只会包含 $usedState 里存在的字段：

```react
{
  a: 1
}
```

- 其次在 setData 之前进行了一次数据 Diff，找到数据的最小更新路径，然后再使用此路径来进行更新。例如：

```react
// 初始 state
this.state = {
  a: [0],
  b: {
    x: {
      y: 1
    }
  }
}

// 调用 this.setState

this.setState({
  a: [1, 2],
  b: {
    x: {
      y: 10
    }
  }
})
```

在优化之前，会直接将 this.setState 的数据传给 setData，即:

```react
this.$scope.setData({
  a: [1, 2],
  b: {
    x: {
      y: 10
    }
  }
})
```

而在优化之后的数据更新则变成了:

```react
this.$scope.setData({
  'a[0]': 1,
  'a[1]': 2,
  'b.x.y': 10
})
```

这样的优化对于小程序来说意义非常重大，可以避免因为数据更新导致的性能问题。

## 事件处理函数对应

在小程序的组件里，事件响应函数需要配置在 methods 字段里。而在 JSX 里，事件是这样绑定的：

```react
<View onClick={this.handleClick}></View>
```

编译的过程会将 JSX 转换成小程序模板：

```react
<view bindclick="handleClick"></view>
```

在 createComponent 方法里，会将事件响应函数 handleClick 添加到 methods 字段中，并且在响应函数里调用真正的 this.handleClick 方法。

在编译过程中，会提取模板中绑定过的方法，并存到组件的 $events 字段里，这样在运行时就可以只将用到的事件响应函数配置到小程序组件的 methods 字段中。

在运行时通过 processEvent 这个方法来处理事件的对应，省略掉处理过程，就是这样的：

```react
function processEvent (eventHandlerName, obj) {
  obj[eventHandlerName] = function (event) {
    // ...
		scope[eventHandlerName].apply(callScope, realArgs)
  }
}
```

这个方法的核心作用就是解析出事件响应函数执行时真正的作用域 callScope 以及传入的参数。在 JSX 里，我们可以像下面这样通过 bind 传入参数：

```react
<View onClick={this.handleClick.bind(this, arga, argb)}></View>
```

小程序不支持通过 bind 的方式传入参数，但是小程序可以用 data 开头的方式，将数据传递到 event.currentTarget.dataset 中。编译过程会将 bind 方式传递的参数对应到 dataset 中，processEvent 函数会从 dataset 里取到传入的参数传给真正的事件响应函数。

至此，经过编译之后的 Taro 组件终于可以运行在小程序环境里了。为了方便用户的使用，小程序运行时还提供了更多的特性，接下来会举一个例子来说明。

## 对 API 进行 Promise 化的处理

Taro 对小程序的所有 API 进行了一个分类整理，将其中的异步 API 做了一层 Promise 化的封装。例如，`wx.getStorage`经过下面的处理对应到`Taro.getStorage`(此处代码作示例用，与实际源代码不尽相同)：

```react
Taro['getStorage'] = options => {
  let obj = Object.assign({}, options)
  const p = new Promise((resolve, reject) => {
		['fail', 'success', 'complete'].forEach((k) => {
		  obj[k] = (res) => {
		    options[k] && options[k](res)
		    if (k === 'success') {
			  resolve(res)
		    } else if (k === 'fail') {
			  reject(res)
		    }
		  }
		})
		wx['getStorage'](obj)
  })
  return p
}
```

就可以这么调用了：

```react
// 小程序的调用方式
Taro.getStorage({
  key: 'test',
  success() {
		
  }
})
// 在 Taro 里也可以这样调用
Taro.getStorage({
  key: 'test'
}).then(() => {
  // success
})
```

## H5 运行时解析

首先，我们选用`Nerv`作为 Web 端的运行时框架。你可能会有问题：同样是类`React`框架，为何我们不直接用`React`，而是用`Nerv`呢？

**为了更快更稳**。开发过程中前端框架本身有可能会出现问题。如果是第三方框架，很有可能无法得到及时的修复，导致整个项目的进度受影响。`Nerv`就不一样。作为团队自研的产品，出现任何问题我们都可以在团队内部快速得到解决。与此同时，`Nerv`也具有与`React`相同的 API，同样使用 Virtual DOM 技术进行优化，正常使用与`React`并没有区别，完全可以满足我们的需要。

使用`Taro`之后，我们书写的是类似于下图的代码：



![image-20180910201354596](https://user-gold-cdn.xitu.io/2018/10/8/166515ae12e8fe10?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



我们注意到，就算是转换过的代码，也依然存在着`view`、`button`等在 Web 开发中并不存在的组件。如何在 Web 端正常使用这些组件？这是我们碰到的第一个问题。

### 组件实现

我们不妨捋一捋小程序和 Web 开发在这些组件上的差异：



![image-20180903170556961](https://user-gold-cdn.xitu.io/2018/10/8/166515ae12d7da84?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



作为开发者，你第一反应或许会尝试在编译阶段下功夫，尝试直接使用效果类似的 Web 组件替代：用`div`替代`view`，用`img`替代`image`，以此类推。

费劲心机搞定标签转换之后，上面这个差异似乎是解决了。但很快你就会碰到一些更加棘手的问题：`hover-start-time`、`hover-stay-time`等等这些常规 Web 开发中并不存在的属性要如何处理？

回顾一下：在前面讲到多端转换的时候，我们说到了`babel`。在`Taro`中，我们使用`babylon`生成 AST，`babel-traverse`去修改和移动 AST 中的节点。但`babel`所做的工作远远不止这些。

我们不妨去`babel`的 [playground](https://babeljs.io/repl) 看一看代码在转译前后的对比：在使用了`@babel/preset-env`的`BUILT-INS`之后，简单的一句源码`new Map()`，在`babel`编译后却变成了好几行代码：



![image-20180903211023072](https://user-gold-cdn.xitu.io/2018/10/8/166515ae12e9969d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



注意看这几个文件：`core-js/modules/web.dom.iterable`，`core-js/modules/es6.array.iterator`，`core-js/modules/es6.map`。我们可以在`core-js`的 Git 仓库找到他们的真身。很明显，这几个模块就是对应的 es 特性运行时的实现。

从某种角度上讲，我们要做的事情和`babel`非常像。`babel`把基于新版 ECMAScript 规范的代码转换为基于旧 ECMAScript 规范的代码，而`Taro`希望把基于`React`语法的代码转换为小程序的语法。我们从`babel`受到了启发：既然`babel`可以通过运行时框架来实现新特性，那我们也同样可以通过运行时代码，实现上面这些 Web 开发中不存在的功能。

举个例子。对于`view`组件，首先它是个普通的类 React 组件，它把它的子组件如实展示出来：

```
import Nerv, { Component } from 'nervjs';

class View extends Component {
  render() {
    return (
      <div>{this.props.children}</div>
    );
  }
}
```

这太简单。接下来，我们需要对`hover-start-time`做处理。与`Taro`其他地方的命名规范一致，我们这个`View`组件接受的属性名将会是驼峰命名法：`hoverStartTime`。`hoverStartTime`参数决定我们将在`View`组件触发`touch`事件多久后改变组件的样式。`hover-stay-time`属性的处理也十分类似，就不再赘述。这些属性的实现比起前面的代码会稍微复杂一点点，但绝对没有超纲。

```
// 示例代码
render() {
  const {
    hoverStartTime = 50,
    onTouchStart
  } = this.props;

  const _onTouchStart = e => {
    setTimeout(() => {
      // @TODO 触发touch样式改变
    }, hoverStartTime);
    onTouchStart && onTouchStart(e);
  }
  return (
    <div onTouchStart={_onTouchStart}>
      {this.props.children}
    </div>
  );
}
```

再稍加修饰，我们就能得到一个功能完整的 Web 版 [View 组件](https://github.com/NervJS/taro/tree/master/packages/taro-components/src/components/view) 。

`view`可以说是小程序最简单的组件之一了。`text`的实现甚至比上面的代码还要简单得多。但这并不说明组件的实现之路上就没有障碍。复杂如`swiper`，`scroll-view`，`tabbar`，我们需要花费大量的精力分析小程序原生组件的 API，交互行为，极端值处理，接受的属性等等，再通过 Web 技术实现。

## API 适配

除了组件，小程序下有一些 API 也是 Web 开发中所不具备的。比如小程序框架内置的`wx.request`/`wx.getStorage`等 API；但在 Web 开发中，我们使用的是`fetch`/`localStorage`等内置的函数或者对象。



![image-20180903170610928](https://user-gold-cdn.xitu.io/2018/10/8/166515ae12c9ef95?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



小程序的 API 实现是个巨大的黑盒，我们仅仅知道如何使用它，使用它会得到什么结果，但对它内部的实现一无所知。

如何让 Web 端也能使用小程序框架中提供的这些功能？既然已经知道这个黑盒的入参出参情况，那我们自己打造一个黑盒就好了。

换句话说，我们依然通过运行时框架来实现这些 Web 端不存在的能力。

具体说来，我们同样需要分析小程序原生 API，最后通过 Web 技术实现。有兴趣可以在 [Git 仓库](https://github.com/NervJS/taro/tree/master/packages/taro-h5/src)中看到这些原生 API 的实现。下面以`wx.setStorage`为例进行简单解析。

`wx.setStorage`是一个异步接口，可以把`key: value`数据存储在本地缓存。很容易联想到，在 Web 开发中也有类似的数据存储概念，这就是`localStorage`。到这里，我们的目标已经十分明确：我们需要借助于`localStorage`，实现一个与`wx.setStorage`相同的 API。

我们首先查阅[官方文档](https://developers.weixin.qq.com/miniprogram/dev/api/data.html#wxsetstorageobject)了解这个 API 的具体入参出参：

| 参数     | 类型          | 必填 | 说明                                             |
| -------- | ------------- | ---- | ------------------------------------------------ |
| key      | String        | 是   | 本地缓存中的指定的 key                           |
| data     | Object/String | 是   | 需要存储的内容                                   |
| success  | Function      | 否   | 接口调用成功的回调函数                           |
| fail     | Function      | 否   | 接口调用失败的回调函数                           |
| complete | Function      | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |



而在 Web 中，如果我们需要往本地存储写入数据，使用的 API 是`localStorage.setItem(key, value)`。我们很容易就可以构思出这个函数的雏形：

```
/* 示例代码 */
function setStorage({ key, value }) {
  localStorage.setItem(key, value);
}
```

我们顺手做点优化，把基于异步回调的 API 都给做了一层 Promise 包装，这可以让代码的流程处理更加方便。所以这段代码看起来会像下面这样：

```
/* 示例代码 */
function setStorage({ key, value }) {
  localStorage.setItem(key, value);
  return Promise.resolve({ errMsg: 'setStorage:ok' });
}
```

看起来很完美，但开发的道路不会如此平坦。我们还需要处理其余的入参：`success`、`fail`和`complete`。`success`回调会在操作成功完成时调用，`fail`会在操作失败的时候执行，`complete`则无论如何都会执行。`setStorage`函数只会在`key`值是`String`类型时有正确的行为，所以我们为这个函数添加了一个简单的类型判断，并在异常情况下执行`fail`回调。经过这轮变动，这段代码看起来会像下面这样：

```
/* 示例代码 */
function setStorage({ key, value, success, fail, complete }) {
  let res = { errMsg: 'setStorage:ok' }
  if (typeof key === 'string') {
    localStorage.setItem(key, value);
    success && success(res);
  } else {
    fail && fail(res);
    return Promise.reject(res);
  }
  complete && complete(res);
  return Promise.resolve({ errMsg: 'setStorage:ok' });
}
```

> 这个函数的最终版本可以在 [Taro 仓库](https://github.com/NervJS/taro/blob/master/packages/taro-h5/src/api/storage/index.js)中找到。

把这个 API 实现挂载到`Taro`模块之后，我们就可以通过`Taro.setStorage`来调用这个 API 了。

当然，也有一些 API 是 Web 端无论如何无法实现的，比如`wx.login`，又或者`wx.scanCode`。我们维护了一个 API 实现情况的[列表](https://github.com/NervJS/taro/blob/master/packages/taro-h5/src/api/api.md)，在实际的多端项目开发中应该尽可能避免使用它们。

## 路由

作为小程序的一大能力，小程序框架中以栈的形式维护了当前所有的页面，由框架统一管理。用户只需要调用`wx.navigateTo`,`wx.navigateBack`,`wx.redirectTo`等官方 API，就可以实现页面的跳转、回退、重定向，而不需要关心页面栈的细节。但是作为多端项目，当我们尝试在 Web 端实现路由功能的时候，就需要对小程序和 Web 端单页应用的路由原理有一定的了解。

小程序的路由比较轻量。使用时，我们先通过`app.json`为小程序配置页面列表：

```
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs"
  ],
  // ...
}
```

在运行时，小程序内维护了一个页面栈，始终展示栈顶的页面（`Page`对象）。当用户进行跳转、后退等操作时，相应的会使页面栈进行入栈、出栈等操作。

路由方式页面栈表现初始化新页面入栈(push)打开新页面新页面入栈(push)页面重定向当前页面出栈，新页面入栈(pop, push)页面返回页面不断出栈，直到目标返回页(pop)Tab 切换页面全部出栈，只留下新的 Tab 页面重加载页面全部出栈，只留下新的页面

同时，在页面栈发生路由变化时，还会触发相应页面的生命周期：

| 路由方式   | 触发时机                                                     | 路由前页面 | 路由后页面     |
| ---------- | ------------------------------------------------------------ | ---------- | -------------- |
| 初始化     | 小程序打开的第一个页面                                       |            | onLoad, onShow |
| 打开新页面 | 调用 API `wx.navigateTo` 或使用组件 `navigator`              | onHide     | onLoad, onShow |
| 页面重定向 | 调用 API `wx.redirectTo` 或使用组件 `navigator`              | onUnload   | onLoad, onShow |
| 页面返回   | 调用 API `wx.navigateBack` 或使用组件 `navigator` 或用户按左上角返回按钮 | onUnload   | onShow         |
| 重启动     | 调用 API `wx.reLaunch` 或使用组件 `navigator`                | onUnload   | onLoad, onShow |



对于 Web 端单页应用路由，我们则以`react-router`为例进行说明：

首先，`react-router`开始通过`history`工具监听页面路径的变化。

在页面路径发生变化时，`react-router`会根据新的`location`对象，触发 UI 层的更新。

至于 UI 层如何更新，则是取决于我们在`Route`组件中对页面路径和组件的绑定，甚至可以实现嵌套路由。

可以说，`react-router`的路由方案是组件级别的。

具体到`Taro`，为了保持跟小程序的行为一致，我们不需要细致到组件级别的路由方案，但需要为每次路由保存完整的页面栈。

实现形式上，我们参考`react-router`：监听页面路径变化，再触发 UI 更新。这是`React`的精髓之一，单向数据流。



![image-20180904164054887](https://user-gold-cdn.xitu.io/2018/10/8/166515ae12fc3d2c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



`@tarojs/router`包中包含了一个轻量的`history`实现。`history`中维护了一个栈，用来记录页面历史的变化。对历史记录的监听，依赖两个事件：`hashchange`和`popstate`。

```
/* 示例代码 */
window.addEventListener('hashchange', () => {});
window.addEventListener('popstate', () => {})
```

对于使用 Hash 模式的页面路由，每次页面跳转都会依次触发`popstate`和`hashchange`事件。由于在`popstate`的回调中可以取到当前页面的 state，我们选择它作为主要跳转逻辑的容器。

作为 UI 层，`@tarojs/router`包提供了一个`Router`组件，维护页面栈。与小程序类似，用户不需要手动调用`Router`组件，而是由`Taro`自动处理。

对于历史栈来说，无非就是三种操作：`push`, `pop`，还有`replace`。在历史栈变动时触发`Router`的回调，就可以让`Router`也同步变化。这就是`Taro`中路由的基本原理。

> 只有三种操作，说起来很简单，但实际操作中有一个难点。设想你正处在一个历史栈的中间：(...、a、b、你、b，c)，c 是栈顶。 这时候，你通过`hashchange`事件得知页面 Hash 变化了，肯定是页面发生跳转了。不过很遗憾，跳转后的页面 Hash 是 b。这时候，你能知道这次路由变动到底是前进还是后退吗？
>
> 我们在`hashchange`回调中，通过`history.replaceState` API，在 state 中记录了页面的跳转次数。从而可以在`popstate`中推断导致跳转的具体行为。具体可以在[这里](https://github.com/NervJS/taro/blob/9841f48b53fe09b07ee7a87012a69acf7307ec53/packages/taro-router/src/lib/history.js#L76)看到相关实现。

> `@tarojs/router`实现中还有一些小细节需要处理。比如如何加入`compomentDidShow`之类原本不存在的生命周期？ 我们选择在运行时进行这个操作。对于在入口`config`中注册的页面文件，我们继承了页面类并对`componentDidMount`做了改写，简单粗暴地插入了`componentDidShow`的调用。

## taro小程序展示富文本.md

在微信小程序下会用到wxParse这个东西来达到html转换wxml的效果，

taro小程序官方也给出了示例，地址

这里封装成自己的组件：

```
import Taro, { Component } from "@tarojs/taro"
import { View } from "@tarojs/components"
import WxParse from '../../utils/wxParse/wxParse.js'
import "../../utils/wxParse/wxParse.scss"

export default class ParseComponent extends Component {
    componentDidMount() {}
    defaultProps = {
        mark: ""
    }
    render() {
 
        if (this.props.mark) {
            let domText = this.props.mark
            WxParse.wxParse("domText", "html", domText, this.$scope, 5);
        }
        return (
            <View>
                {process.env.TARO_ENV === "weapp" ? (
                    <View>
                        <import src='../../utils/wxParse/wxParse.wxml' />
                        <template is='wxParse' data='{{wxParseData:domText.nodes}}'
                        />
                    </View>
                ) : (
                    <View>只在小程序里支持</View>
                )}
            </View>
        );
    }
}
```

另外，转化之后的图片地址是相对地址，在小程序中是无法显示的，所以需要到html2json.js文件中加上图片的域名地址：

```
//对img添加额外数据
            if (node.tag === 'img') {
                node.imgIndex = results.images.length;
                var imgUrl = '域名地址' + node.attr.src;
                if (imgUrl[0] == '') {
                    imgUrl.splice(0, 1);
                }
                imgUrl = wxDiscode.urlToHttpUrl(imgUrl, __placeImgeUrlHttps);
                node.attr.src = imgUrl;
                node.from = bindName;
                results.images.push(node);
                results.imageUrls.push(imgUrl);
            }
```

config/index.js

```
  copy: {
    patterns: [
      { from: 'src/components/wxParse/wxParse.wxss', to: 'dist/components/wxParse/wxParse.wxss'},
      { from: 'src/components/wxParse/wxParse.wxml', to: 'dist/components/wxParse/wxParse.wxml'}
    ],
    options: {}
  },
```
