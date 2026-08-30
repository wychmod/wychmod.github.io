# 手写 Spring：后置处理器与 FactoryBean

> **原文归档**：[old-spring-notes](/md/archive/README?id=old-spring-notes)
> **参考实现**：[wychmod/mini-spring](https://github.com/wychmod/mini-spring)
> **本章目标**：把 Spring 最核心的两个扩展口子讲明白。

---

## 一、为什么需要后置处理器

容器创建 bean 的时候，并不是所有逻辑都写死。
Spring 预留了一个扩展口子，让你能在 bean 初始化前后插入自己的处理逻辑。

| 接口 | 能做什么 |
|---|---|
| `BeanFactoryPostProcessor` | 改 `BeanDefinition` |
| `BeanPostProcessor` | 改 bean 实例本身 |
| `InstantiationAwareBeanPostProcessor` | 在实例化和属性填充阶段插一脚 |

在你的实现里，`AbstractApplicationContext.refresh()` 会先执行 `BeanFactoryPostProcessor`，再注册 `BeanPostProcessor`。

实现边界也要说清楚：当前版本没有实现 `Ordered` / `PriorityOrdered` 这类排序规则，后置处理器基本按注册顺序执行。等 AOP、自动装配、占位符处理都接上后，顺序会直接影响最终行为。

## 二、BeanFactoryPostProcessor 处理什么

`BeanFactoryPostProcessor` 的作用，是在 bean 还没创建之前，修改 bean 的元数据。
`PropertyPlaceholderConfigurer` 就是这个角色。

它做的事很明确：

1. 读取属性文件。
2. 替换 `BeanDefinition` 里的 `${...}`。
3. 往工厂里塞一个字符串解析器，供 `@Value` 复用。

这说明它改的是“说明书”，不是“对象本体”。

## 三、BeanPostProcessor 处理什么

`BeanPostProcessor` 的作用，是在 bean 初始化前后做增强。
它更接近“给对象加工”。

| 回调 | 位置 | 典型用途 |
|---|---|---|
| `postProcessBeforeInitialization` | 初始化前 | Aware、字段预处理 |
| `postProcessAfterInitialization` | 初始化后 | 包装代理对象 |

你这里的 `ApplicationContextAwareProcessor` 就是典型前置处理器。
`DefaultAdvisorAutoProxyCreator` 就是典型后置处理器。

## 四、FactoryBean 不是普通 bean

`FactoryBean` 本身也是 bean，但它的职责不是“自己被用”，而是“生产另一个对象”。
所以容器拿到 `FactoryBean` 时，通常要区分两件事：

| 对象 | 含义 |
|---|---|
| `FactoryBean` 本身 | 工厂对象 |
| `FactoryBean#getObject()` | 真正产出的对象 |

你的 `FactoryBeanRegistrySupport` 就是在做这个缓存和拆分。

> 💡 补充：这类设计很适合代理对象、复杂构建对象、第三方客户端对象。

当前实现支持的是“某个 bean 类实现 `FactoryBean` 接口后，由 `getObject()` 产出真正对象”。它还没有覆盖 XML 里的 `factory-bean` / `factory-method` 这类工厂方法配置，后者可以作为更完整版本的扩展点。

## 五、事件机制也在这个阶段接上

你的 `ApplicationEvent`、`ApplicationListener`、`SimpleApplicationEventMulticaster` 组成了最小事件系统。
容器刷新完成后，会发 `ContextRefreshedEvent`；关闭时，会发 `ContextClosedEvent`。

这意味着 Spring 不只是“造 bean”，还会“通知别人发生了什么”。

## 六、从 0 复刻时怎么写

如果你自己实现：

1. 先写 `BeanFactoryPostProcessor`，改配置。
2. 再写 `BeanPostProcessor`，改对象。
3. 再写 `InstantiationAwareBeanPostProcessor`，把更早的插点补上。
4. 再补 `FactoryBean`，支持复杂对象创建。
5. 最后加事件机制。

这章写完，你的容器就有真正的扩展能力了。

## 七、下一章预告

下一章写 **AOP 与代理**。
那是 Spring 里最容易看懂、也最容易写偏的一部分。

---

## 📚 完整资料

- [归档来源地图](/md/archive/README?id=old-spring-notes)
- [mini-spring 参考实现](https://github.com/wychmod/mini-spring)
- [Spring Framework 官方文档](https://docs.spring.io/spring-framework/reference/core/beans/factory-extension.html)

---

## 最新修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-27 | 新增 | 补写“后置处理器与 FactoryBean”，把扩展点、工厂对象和事件机制串起来 |
| 2026-08-27 | 订正 | 补充后置处理器排序和 FactoryBean 支持范围，区分接口式 FactoryBean 与 XML 工厂方法 |

> 📚 完整历史修改记录见 [修改记录归档](/_meta/CHANGELOG_HISTORY.md)。
