---
order: 6
title: '分布式服务'
date: 2022-02-09
category: 
    - Redis
    - 分布式
    - Redisson
tag: 
    - Redis
    - 分布式
    - Redisson
timeline: true
article: true
---

# 分布式服务

分布式服务包括分布式远程服务(RRemoteService )、分布式实时对象服务(RLiveObjectService )、分布式执行服务(RExecutorService )、分布式调度任务服务(RScheduledExecutorService )、分布式映射归纳服务(MapReduce)

1.  分布式远程服务：实现了java的RPC远程调用，可以通过共享接口执行另一个Redisson实例里的对象方法。
2.  分布式实时对象(RLO)：使用生成的代理类，将一个指定的普通java类的所有字段以及这些字段的操作(get set方法)全部映射到一个Redis Hash的数据结构。get和set方法被转义为hget和hset命令，从而使所有连接到同一个redis节点的客户端同时对一个指定对象操作。通过将这些值保存在一个像redis这样的远程共享的空间的过程，把这个对象强化成一个分布式对象。这个对象就叫RLO。RLO使用方法：通过一系列注解@REntity(必选，类)、@RId(必选、主键字段)、@RIndex、@RObjectField、@RCascade(级联操作)
3.  分布式执行服务：执行任务及取消任务

```java
public class ExecutorServiceExamples {

    public static class RunnableTask implements Runnable, Serializable {

        @RInject
        RedissonClient redisson;

        @Override
        public void run() {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("5", "11");
        }
        
    }
    
    public static class CallableTask implements Callable<String>, Serializable {

        @RInject
        RedissonClient redisson;
        
        @Override
        public String call() throws Exception {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("1", "2");
            return map.get("3");
        }

    }
    
    public static void main(String[] args) {
        Config config = new Config();
        config.useClusterServers()
            .addNodeAddress("127.0.0.1:7001", "127.0.0.1:7002", "127.0.0.1:7003");
        
        RedissonClient redisson = Redisson.create(config);

        RedissonNodeConfig nodeConfig = new RedissonNodeConfig(config);
        nodeConfig.setExecutorServiceWorkers(Collections.singletonMap("myExecutor", 1));
        RedissonNode node = RedissonNode.create(nodeConfig);
        node.start();

        RExecutorService e = redisson.getExecutorService("myExecutor");
        e.execute(new RunnableTask());
        e.submit(new CallableTask());
        
        e.shutdown();
        node.shutdown();
    }
    
}
```

4、分布式调度任务服务：对计划任务的设定(可以通过CRON表达式)及去掉计划任务

```java
public class SchedulerServiceExamples {

    public static class RunnableTask implements Runnable, Serializable {

        @RInject
        RedissonClient redisson;

        @Override
        public void run() {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("5", "11");
        }
        
    }
    
    public static class CallableTask implements Callable<String>, Serializable {

        @RInject
        RedissonClient redisson;
        
        @Override
        public String call() throws Exception {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("1", "2");
            return map.get("3");
        }

    }
    
    public static void main(String[] args) {
        Config config = new Config();
        config.useClusterServers()
            .addNodeAddress("127.0.0.1:7001", "127.0.0.1:7002", "127.0.0.1:7003");
        
        RedissonClient redisson = Redisson.create(config);

        RedissonNodeConfig nodeConfig = new RedissonNodeConfig(config);
        nodeConfig.setExecutorServiceWorkers(Collections.singletonMap("myExecutor", 5));
        RedissonNode node = RedissonNode.create(nodeConfig);
        node.start();

        RScheduledExecutorService e = redisson.getExecutorService("myExecutor");
        e.schedule(new RunnableTask(), 10, TimeUnit.SECONDS);
        e.schedule(new CallableTask(), 4, TimeUnit.MINUTES);

        e.schedule(new RunnableTask(), CronSchedule.of("10 0/5 * * * ?"));
        e.schedule(new RunnableTask(), CronSchedule.dailyAtHourAndMinute(10, 5));
        e.schedule(new RunnableTask(), CronSchedule.weeklyOnDayAndHourAndMinute(12, 4, Calendar.MONDAY, Calendar.FRIDAY));
        
        e.shutdown();
        node.shutdown();
    }
    
}
```

5、分布式映射归纳服务：通过映射归纳处理存储在Redis环境里的大量数据。示例代码单词统计
