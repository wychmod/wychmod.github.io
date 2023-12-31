# 1-大厂码农开发基础
![](../../youdaonote-images/Pasted%20image%2020221023212526.png)

# 2- 需求怎么来的
![](../../youdaonote-images/Pasted%20image%2020221023215227.png)
在互联网从事开发工作，会有更多的角色，我们以承接需求的视角来看，涉及的角色包括：业务方、产品、运营、研发、测试，这些角色以及各项的负责人、系统架构师、风控等部门都会按照需求的大小不同而会被拉到一起进行项目 PRD 评审，并逐步到排期、研发上线。这里分别介绍下每一个角色在整个项目从研发到上线过程中的角色，方便大家了解在互联网做研发是一种怎样的工作模式。（当然每家互联网可能有不同的扁平化管理会略有差异）

## 业务

研发角度你所承接的需求，最开始并不是产品经理给你，而是业务方根据市场战略提出需求，这些需求的背后是依赖于某些战略落地的背景，完成目标结果，这个目标可能是拉新、促活、留存等等，最终在预期投入下完成价值产出。

## 产品

业务定需求、产品做方案，产品经理需要梳理方案执行落地的过程，协调各方部门配合完成项目开发。所以在 UI、前后端研发视角下，各处都有产品经理的身影。当产品经理把各方可配合的信息协调好后，就开始整理输出 PRD 文档，在整理完成后开始拉对应的项目需要的人员，组会一起评审 PRD。可能有些时候第一次 PRD 评审会遇到不少问题，如果不通过或者有问题，则需要 2、3 次评审。评审完成后交棒给研发。

## 研发

当产品经理的 PRD 评审通过后，按照项目的大小会有架构师、跨部门协同人员、项目开发人员、测试人员等进入到项目开发落地中。在这个阶段首先会有架构师确定整体的实现方案，再通过会议评审后，把需求拆分模块拆解分配到各个研发人员身上。再由研发人员进行细节设计，因为谁开发谁做细化设计，更能把握开发过程。在研发整体设计完成后，统一组会进行设计评审，这时候需要产品、运营、架构师、开发人员、UI 以及 leader，都会参会评审，评审内容包括：架构设计、细节设计、人员分工、开发时间、联调时间、测试时间、预发时间和上线节点，以及运营介入的时间和外部人员配合的时间。这些内容都在会议上确认完毕后，会由产品经理发出一个整体的项目计划甘特图，由各方人员知晓投入的时间节点以及确认工时投入和目标产出。好了，这些都确认好后，研发正式进入开发阶段，并每天有一次敏捷日会，来反馈风险和进度以及待推进完成的事项。

## 测试

当研发项目逐步接近尾声，并已经完成提测标准时候，有代码评审、有测试用例、有自行验证下，你项目所分配的测试人员就会开始编写测试用例并进入用例评审了。有些时候测试用例也会早于研发提测前就开始进行，当测试用例评审完成并已经拿到研发人员提测报告，那么测试就要开始进行第一轮冒烟测试了，完成后就是功能、流程和预发以及白名单测试。在测试的过程中测试人员会关注到每一个细节的节点，白盒测试人员还会关注代码实现流程。当测试工作完成以后，会提交测试报告，再由研发人员通知系统上线时间点，约定各方配合验证，最终发布到线上，交付产品和业务方进行验收。

## 运营

在测试和上线的过程中，运营人员会配合配置一些活动、玩法、券信息、息费、地图链路、视频等各项内容，来配合测试人员进行系统验证。在最终系统交付后也是需要运营人员进行处理各项运营动作，使用业务费用，完成业务目标，收集 GMV、UV、PV、获客、留存、转换等各项数据，用于分析效果和制定优化完善策略。

# 3-系统架构设计
![](../../youdaonote-images/Pasted%20image%2020221023225421.png)
当你拿到需求以后需要做的不是立刻进入编码，而是要视需求大小进行不同层级的系统设计，这个过程包括：要拆解出属于此项目的各项人员职责、决定采用一个什么的架构来承接、各个功能模块如何细化设计、涉及到的库表要如何设计、分支计划是什么样、列出工程导图，最后要准备一个执行进度的汇总表分别统计开发到上线阶段的各项进度把控风险，直至项目开发完成发出上线报告推进项目上线交付，至此才算是一趟完整的旅程。

## 职责总表

一般使用专门的系统或者一个excel表，记录前端、后端、UI、需要配合的外部、运维和测试，这些人员的在此项目的工作职责、预估工期、启动时间和预计完成时间。方便在项目开发阶段可以明确的找到各个模块对应的负责人员，减少一定的沟通成本。

## 系统架构

负载(LVS、F5、Nginx)、网关(Zuul、Gateway、自研)、结构(DDD、MVC、SOA)、治理(RateLimiter、HyStrix、netflix)、框架(Spring、SpringBoot、MyBatis)、服务(RPC、MQ、分布式任务、配置中心)、数据(ES、HBase、Mysql&分库分表)，七个模块是整个搭建系统架构过程中必须考虑到的点。一般在公司内部这些基本是固定成型的，除非是系统有升级或者之前没到的新技术才会重新设计架构。

## 功能模块

在系统架构制定完成后，就需要把具体的需求拆分到各个人员手里进行细节设计，包括：服务领域的拆分、功能细节实现、网关接口包装等，这些细节的设计可以更好的评估出指定人员完成此需求的工期，算是包产到户的感觉。

## 库表设计

在整个研发设计阶段，库表的设计是非常核心和重要的，这将决定着一个系统在开发阶段对数据的存储和使用是否方便，以及后续扩展不同需求时候，是否会折腾库表继续扩展。所以详细设计库表结构，底层结构的完善建设，有利于将来系统服务的扩展。另外一般对于较大型的系统开发，需要设计分库分表，那么分库分表后就还需要考虑把数据通过类似otter的工具，通过binlog把数据同步到ES，方便查询和使用。

## 分支计划

千万别小看这样一个小小规则的定义，就这样一个约定的规则，可能在某些时候会避免一些错误分支的提交、删除、误合并。因为一个需求可能会涉及较多系统共同开发，所以明确一个统一的分支名称，和分支范围可以更好的约束代码提交，也更能顺利的推进后续测试、预发、上线流程。（关于分支的命名规范，通常会采用时间、开发者、开发内容，组合一个分支名称）

## 工程导图

如果你的系统设计涉及的内容不少，而且需要协同各方来配合开发，那么把这样的功能模块梳理到如 xmind 思维导图以及配合 visio 展示给会议评审的参与者时，能尽快地让大家在共同的语境下交流，更好地减少沟通成本。

## 进度汇总

在项目开发和上线阶段，如果要保证项目的进度，就需要做一些进度汇总和风险暴露的策略制定。比如一个敏捷项目需要每天开发日会，汇总研发的开发进度、测试的用例进度、产品的补全进度、运营的配合进度等，这些交叉信息的汇聚，会尽可能避免出现，“你认为、你觉得”这样的事情的发生，提早暴露和规避临近测试和上线时暴露的风险。

## 上线计划

最后在项目测试接近尾声，测试报告即将发送出来前，需要梳理上线计划。这会涉及到此项目开发过程中的内部、外部人员，他们需要在项目上线时进行配合提供接口或者服务验证。另外上线前还需要提前准备好所需要的上线资源，包括：服务器、数据库、组件授权、服务配置、权限开通、埋点数据等等。也需要提前与运营沟通配合上线过程中一些需要业务运营配置的内容，提前准备好，方便线上验证时使用。

综上，就是整个开发阶段涉及的系统架构设计，系统设计不仅仅是单独说只是一个需求的实现设计，还会涉及上下游的很多信息都会包括，可能你目前只是整个项目开发中的一环，但如果你能站在一个全局的视角来看，就会发现这里涉及的内容会非常多，也是一个架构师应该掌握的技能。

# 进入开发阶段

![](../../youdaonote-images/Pasted%20image%2020221024111943.png)

## 系统搭建

通常我们会按照一个系统需要服务建设的复杂度来选择搭建的框架，比如：单体架构、分布式架构、分库分表架构、分层架构等，按照不同的体量进行选择。如果是较大型的系统开发则会把不同的职责拆分为独立的系统进行开发，包括：基础层、业务层、网关层、任务层、异步层，基础层处理数据库、Redis、ES的使用以及提供原子接口。业务层用于包装业务、网关提供Http接口、任务层处理分布式任务、异步层用于接收MQ消息。

## 数据服务

一般互联网中的系统大部分都是使用 MySql 作为数据库服务使用，因为它是免费的，如果数据量较大还可以使用分库分表策略进行设计数据库。如果分库分表，那么散落在各个库表里的数据，就需要基于binlog 使用 otter 工具把数据同步到 ES 中，便于汇总查询。

## 测试环境

在一些大厂开发中，通常本地的开发机器是不能直接启动运行测试完整流程的，需要把服务部署到测试环境，才可以正常调用访问一些相关资源。

## 功能开发

从一个系统的开发过程可以包括：数据库表创建、原子服务开发、业务逻辑串联、领域功能实现、网关接口包装，一层层搭建和开发各个模块的功能。重在思考领域的建设，把隔层的实现分离到各个层里，避免互相污染。常用技术使用上包括：RPC、MQ、分布式任务、配置中心、网关、Redis

## 单元测试

其实这个是一个研发标准或者内部自发的约定，因为很大一部分研发是不写单测的，也不考虑单测覆盖率，这样的代码通常在交付测试以后会有很大的风险，其实编写单元测试是提升研发交付质量非常重要的一环，只有你自己已经完整地测试过的代码，才会保证如期交付上线。

## 接口联调

在接口联调阶段主要包括自身功能开发对接外部，和自己提供出去的接口。通常在服务端开发完成接口的30%时，可以把部分接口提供给前端，前端开始对接接口，服务端陆续提供新的接口。直至所有接口对接完成并联调通过。

## 提交测试

在研发开发完成并代码评审以后，接下来就是对整个系统开始提交测试阶段。这个时候需要按照约定提交测试报告，包括：涉及的系统、开发的接口、单测覆盖度等。

# 5-系统上线维护

![](../../youdaonote-images/Pasted%20image%2020221024150403.png)

# 6-开发规范

**分支命名**：日期_姓名首字母缩写_功能单词，如：`210804_xfg_buildFramework`

**提交规范**：`作者，type: desc` 如：`小傅哥，fix：修复查询用户信息逻辑问题` 参考Commit message 规范

```markdown
# 主要type
feat:     增加新功能
fix:      修复bug
# 特殊type
docs:     只改动了文档相关的内容
style:    不影响代码含义的改动，例如去掉空格、改变缩进、增删分号
build:    构造工具的或者外部依赖的改动，例如webpack，npm
refactor: 代码重构时使用
revert:   执行git revert打印的message
# 暂不使用type
test:     添加测试或者修改现有测试
perf:     提高性能的改动
ci:       与CI（持续集成服务）有关的改动
chore:    不修改src或者test的其余修改，例如构建过程或辅助工具的变动
```