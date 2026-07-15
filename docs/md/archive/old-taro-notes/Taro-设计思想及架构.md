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

Babylon 就是 Babel 的 parser。它可以把一段符合规范的 JavaScript 代码输出成一个符合 [Esprima](https://github.com/jquery/esprima) 规范的 AST。 大部分 parser 生成的 AST 数据结构都遵循 [Esprima](https://github.com/jquery/esprima) 规范，包括 ESLint 的 parser [ESTree](https://github.com/eslint/espree)。这就意味着我们熟悉了 [Esprima](https://github.com/jquery/esprima) 规范的 AST 数据结构还能去写 ESLint 插件。

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
3. 将组件的事件处理函数对应到小程序的事件处理函数

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