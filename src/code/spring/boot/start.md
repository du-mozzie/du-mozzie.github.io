---
order: 2
title: SpringBoot启动过程
date: 2021-10-10
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

# SpringBoot启动过程

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606210009066.png)

1. 创建SpringBootApplication

   - 保存了资源加载器resourceLoader

   - 断言primarySources是否为空

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606210133874.png)

   - 保存SpringBootApplication启动类的位置到this.primarySources

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606210614995.png)

   - 判断web应用的类型webApplicationType

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606210810798.png)

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606210832813.png)

   - **bootstrappers**初始启动引导器（List\<Bootstrapper>）去spring.factories中找org.springframework.boot.`Bootstrapper`类型的配置

   - setInitializers去spring.factories中找==ApplicationContextInitializer==，保存List\<ApplicationContextInitializer\<?>> initializers

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606221653519.png)

   - setListeners去spring.factories找==ApplicationListener==应用监听器，保存List\<ApplicationListener\<?>> listeners

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606221803399.png)

   - mainApplicationClass找到主程序this.mainApplicationClass = deduceMainApplicationClass();

     main方法下的

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606222240560.png)

2. 运行SpringBootApplication

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210606223245039.png)

   - 创建**StopWatch**，停止监听器，监听应用创建时长

   - 开启**StopWatch**，记录应用启动时间

   - 创建引导上下文(Context环境)，createBootstrapContext()

     - 创建默认的DefaultBootstrapContext

     - 遍历配置的**bootstrappers**初始启动引导器`在spring.factories找到的`，调用Bootstrapper的intitialize方法，来完成对引导启动器上下文环境设置，`this.bootstrappers.forEach((initializer) -> initializer.intitialize(bootstrapContext));`

       ```java
       public interface Bootstrapper {
       
          /**
           * Initialize the given {@link BootstrapRegistry} with any required registrations.
           * @param registry the registry to initialize
           */
          void intitialize(BootstrapRegistry registry);
       
       }
       ```

   - ```java
     创建应用上下文配置
     ConfigurableApplicationContext context = null;
     ```

   - 让当前应用进入headless模式，**java.awt.headless**

   - **获取所有getRunListeners（运行监听器）**`为了方便所有Listener进行事件感知`

     - getRunListeners去spring.factories找==SpringApplicationRunListener==

       ```java
       SpringApplicationRunListeners listeners = getRunListeners(args);
       ```

       ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607002052432.png)

       ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607002524457.png)

    - 遍历所有的SpringApplicationRunListeners，调用starting方法

      -   `相当于通知所有感兴趣系统正在启动的人，项目正在starting`

   - 保存命令行参数：ApplicationArguments

   - 准备环境信息：prepareEnvironment

     - 返回或者创建基础环境信息对象：getOrCreateEnvironment

       当前环境是：StandardServletEnvironment

       ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607004046206.png)

     - 配置环境信息对象：configureEnvironment(environment, applicationArguments.getSourceArgs());

       -   读取所有的配置源的配置属性值：configurePropertySources(environment, args);

     - 绑定环境信息：ConfigurationPropertySources.attach(environment);

     - 监听器调用`listeners.environmentPrepared()方法`，通知所有的监听器当前环境准备完成

   - 创建IOC容器信息`createApplicationContext()`

     -   会根据项目类型（servlet）创建容器
     -   当前会创建**AnnotationConfigServletWebServerApplicationContext**

   - 准备ApplicationContext IOC容器的基本信息 prepareContext()

     - 保存环境信息

     - IOC容器的后置处理流程

     - 应用初始化器applyInitializers；

       - 遍历所有的==ApplicationContextInitializer==，调用initialize，来对IOC容器进行初始化扩展

       - 遍历所有的listener调用contextprepared，EventPublishingRunListener通知所有的监听器contextprepared

         ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607012444451.png)

     - 所有的监听器调用contextLoaded，通知所有的监听器contextLoaded

   - 刷新IOC容器

     -   创建容器中的所有组件（spring底层）

   - 刷新完成后afterRefresh

   - stopWatch.stop();结束监听器，获取应用创建时长

   - 所有监听器调用listeners.started(context);方法，通知监听器项目启动完成

   - 调用所有的runners，callRunners(context, applicationArguments);

     - 获取容器中的==ApplicationRunner==

       ```java
       @FunctionalInterface
       public interface ApplicationRunner {
       
       	/**
       	 * Callback used to run the bean.
       	 * @param args incoming application arguments
       	 * @throws Exception on error
       	 */
       	void run(ApplicationArguments args) throws Exception;
       
       }
       ```

     - 获取容器中的==CommandLineRunner==

       ```java
       @FunctionalInterface
       public interface CommandLineRunner {
       
       	/**
       	 * Callback used to run the bean.
       	 * @param args incoming main method arguments
       	 * @throws Exception on error
       	 */
       	void run(String... args) throws Exception;
       
       }
       ```

     - 合并所有Runner，并且按照@Order进行排序

     - 遍历所有的Runner，调用run()方法

   - 如果以上有异常，会调用监听器的listeners.failed(context, exception)方法，通知监听器有异常

   - 调用所有监听器的listeners.running(context)方法，通知所有监听器项目进入running状态

   - 如果running有问题，通知监听器failed，调用所有的监听器filed