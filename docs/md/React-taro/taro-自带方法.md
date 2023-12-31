[toc]
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

