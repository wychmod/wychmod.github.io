## get_event_loop

1. 检查调用函数时是否有循环在运行
2. 如果有，就返回pid与当前的运行循环
3. 如果没有，就获取线程全局loop实例

> 如果不在主线程使用是会报错，它使用默认的Loop策略是全局创建，在子线程运行要使用loop = asyncio.new_event_loop()， asyncio.set_event_loop(loop)。