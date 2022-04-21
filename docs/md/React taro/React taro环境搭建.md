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

