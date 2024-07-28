---
order: 2
title: Bean
date: 2021-10-02
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

## 生命周期

1. 构造器：无参构造器
2. 依赖注入：@Autowired：
3. 初始化：@PostConstruct
4. 销毁：@PreDestory

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707480929751-8a60c291-dd7a-4d0b-a8fb-c759bd29df64.png)

```java
@Slf4j
@Component
public class LifeCycleBean {

    public LifeCycleBean() {
        log.info("构造");
    }

    @Autowired
    public void autowire(@Value("${JAVA_HOME}") String home) {
        log.info("依赖注入: {}", home);
    }

    @PostConstruct
    public void init() {
        log.info("初始化");
    }

    @PreDestroy
    public void destroy() {
        log.info("销毁");
    }
}
```

运行主启动类，查看控制台的日志信息（只列举主要信息）：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707464121664-f05f078e-1d9f-48fa-beca-032a3d20aa25.png)

6个bean后处理器方法（InstantiationAwareBeanPostProcessor, DestructionAwareBeanPostProcessor）：

1. postProcessBeforeInstantiation：实例化之前执行, 这里返回的对象会替换掉原本的 bean
2. postProcessAfterInstantiation：实例化之后执行, 这里如果返回 false 会跳过依赖注入阶段
3. postProcessProperties：依赖注入阶段执行, 如 @Autowired、@Value、@Resource
4. postProcessBeforeInitialization：初始化之前执行, 这里返回的对象会替换掉原本的 bean, 如 @PostConstruct、@ConfigurationProperties
5. postProcessAfterInitialization：初始化之后执行, 这里返回的对象会替换掉原本的 bean, 如代理增强
6. postProcessBeforeDestruction：销毁之前执行, 如 @PreDestroy

```java
@Component
public class MyBeanPostProcessor implements InstantiationAwareBeanPostProcessor, DestructionAwareBeanPostProcessor {

	private static final Logger log = LoggerFactory.getLogger(MyBeanPostProcessor.class);

	@Override
	public void postProcessBeforeDestruction(Object bean, String beanName) throws BeansException {
		if (beanName.equals("lifeCycleBean"))
			log.debug("<<<<<< 销毁之前执行, 如 @PreDestroy");
	}

	@Override
	public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
		if (beanName.equals("lifeCycleBean"))
			log.debug("<<<<<< 实例化之前执行, 这里返回的对象会替换掉原本的 bean");
		return null;
	}

	@Override
	public boolean postProcessAfterInstantiation(Object bean, String beanName) throws BeansException {
		if (beanName.equals("lifeCycleBean")) {
			log.debug("<<<<<< 实例化之后执行, 这里如果返回 false 会跳过依赖注入阶段");
			//            return false;
		}
		return true;
	}

	@Override
	public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) throws BeansException {
		if (beanName.equals("lifeCycleBean"))
			log.debug("<<<<<< 依赖注入阶段执行, 如 @Autowired、@Value、@Resource");
		return pvs;
	}

	@Override
	public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		if (beanName.equals("lifeCycleBean"))
			log.debug("<<<<<< 初始化之前执行, 这里返回的对象会替换掉原本的 bean, 如 @PostConstruct、@ConfigurationProperties");
		return bean;
	}

	@Override
	public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		if (beanName.equals("lifeCycleBean"))
			log.debug("<<<<<< 初始化之后执行, 这里返回的对象会替换掉原本的 bean, 如代理增强");
		return bean;
	}
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707464218799-684d1649-fc73-40db-8309-315024c59b6e.png)

完整生命周期：

1. 通过BeanDefinition获取bean的定义信息
2. 调用构造函数实例化bean
3. bean的依赖注入
4. 处理Aware接口（BeanNameAware、BeanFactoryAware、ApplicationContextAware）
5. Bean的后置处理器 BeanPostProcessor-前置
6. 初始化方法（InitializingBean、init-method）
7. Bean的后置处理器 BeanPostProcessor-后置

![image-20240728182858858](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240728182858858.png)

## 模板模式

为什么实现了 BeanPostProcessor 接口后就能够在 Bean 生命周期的各个阶段进行拓展呢？

这使用了模板方法设计模式。

现有如下代码，模拟 BeanFactory 构造 Bean：

```java
static class MyBeanFactory {
    public Object getBean() {
        Object bean = new Object();
        System.out.println("构造 " + bean);
        System.out.println("依赖注入 " + bean);
        System.out.println("初始化 " + bean);
        return bean;
    }
}
```

假设现在需要在依赖注入之后，初始化之前进行其他的操作，那首先能想到的就是在这个位置直接书写相关操作的代码，但这会使代码更加臃肿、增加耦合性，显然不是一种好方式。

可以定义一个接口：

```java
interface BeanPostProcessor {
    void inject(Object bean);
}
```

然后对 MyBeanFactory 进行修改：

```java
static class MyBeanFactory {
    public Object getBean() {
        Object bean = new Object();
        System.out.println("构造 " + bean);
        System.out.println("依赖注入 " + bean);
        for (BeanPostProcessor processor : processors) {
            processor.inject(bean);
        }
        System.out.println("初始化 " + bean);
        return bean;
    }

    private List<BeanPostProcessor> processors = new ArrayList<>();

    public void addProcessor(BeanPostProcessor processor) {
        processors.add(processor);
    }
}
```

之后如果需要拓展，调用 MyBeanFactory 实例的 addProcessor() 方法添加拓展逻辑即可：

```java
public static void main(String[] args) {
    MyBeanFactory beanFactory = new MyBeanFactory();
    beanFactory.addProcessor(bean -> System.out.println("解析 @Autowired"));
    beanFactory.addProcessor(bean -> System.out.println("解析 @Resource"));
    beanFactory.getBean();
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707481096383-db30d443-7418-4309-810a-0e29bf022b4c.png)

## Bean 后置处理器

现有如下三个类：

```java
public class Bean1 {
    private static final Logger log = LoggerFactory.getLogger(Bean1.class);

    private Bean2 bean2;

    @Autowired
    public void setBean2(Bean2 bean2) {
        log.debug("@Autowired 生效: {}", bean2);
        this.bean2 = bean2;
    }

    private Bean3 bean3;

    @Resource
    public void setBean3(Bean3 bean3) {
        log.debug("@Resource 生效: {}", bean3);
        this.bean3 = bean3;
    }

    private String home;

    @Autowired
    public void setHome(@Value("${JAVA_HOME}") String home) {
        log.debug("@Value 生效: {}", home);
        this.home = home;
    }

    @PostConstruct
    public void init() {
        log.debug("@PostConstruct 生效");
    }

    @PreDestroy
    public void destroy() {
        log.debug("@PreDestroy 生效");
    }
}
public class Bean2 {
}
public class Bean3 {
}
```

Bean2 和 Bean3 很简单，而在 Bean1 中使用了多个注解以实现 Bean 注入和值注入。

```java
public class A04 {
    public static void main(String[] args) {
        // ⬇️GenericApplicationContext 是一个【干净】的容器
        GenericApplicationContext context = new GenericApplicationContext();

        // ⬇️用原始方法注册三个 bean
        context.registerBean("bean1", Bean1.class);
        context.registerBean("bean2", Bean2.class);
        context.registerBean("bean3", Bean3.class);
		
        // ⬇️初始化容器
        context.refresh(); // 执行beanFactory后处理器, 添加bean后处理器, 初始化所有单例

        // ⬇️销毁容器
        context.close();
    }
}
```

运行上述方法后，控制台中没有打印任何日志信息，也就是说 Bean1 中使用的注解并没有生效。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707811138564-ff101855-6d4b-4251-b8b4-3d8dced746e3.png)

向 GenericApplicationContext 添加一些与 Bean 后置处理器相关的 Bean，使得 Bean1 中使用的注解能够生效。

```java
// 解析值注入内容
context.getDefaultListableBeanFactory().setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver());
// @Autowired @Value
context.registerBean(AutowiredAnnotationBeanPostProcessor.class);
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707811182884-dc229fd8-e728-4d97-be7a-813542f2bb05.png)

@Autowired 和 @Value 注解成功生效，但 @Resource、@PostConstruct 和 @PreDestroy 依旧没有生效，因此还需要添加解析它们的 Bean 后置处理器。

```java
context.registerBean(CommonAnnotationBeanPostProcessor.class); // @Resource @PostConstruct @PreDestroy
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707811242784-b5e0e05f-4e43-4b00-8b03-bc0ec884ba8a.png)

解析@ConfigurationProperties

```java
@Getter
@Setter
@ToString
@ConfigurationProperties(prefix = "java")
public class Bean4 {
    private String home;
    private String version;
}
```

上述代码用于获取环境变量中 java.home 和 java.version 的信息。

对先前的 main() 方法进行补充：

```java
// 注册bean4
context.registerBean("bean4", Bean4.class);
// 打印ben4信息
System.out.println(context.getBean(Bean4.class));
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707811447532-93d3ba2f-b535-41e7-9b3b-42c7d4709817.png)

Bean4 成功添加到容器中，但值注入失败了，显然也是因为缺少解析 @ConfigurationProperties 注解的后置处理器。

```java
ConfigurationPropertiesBindingPostProcessor.register(context.getDefaultListableBeanFactory()); // @ConfigurationProperties
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707811482605-be699ef3-5c99-4a89-9160-5b7d5412051a.png)

#### AutowiredAnnotationBeanPostProcessor原理

通过前文可知 AutowiredAnnotationBeanPostProcessor 用于解析 @Autowired 和 @Value 注解，那它究竟是怎么工作的呢？

```java
public static void main(String[] args) {
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    // 注册成品 Bean，不再进行 Bean 的创建、依赖注入、初始化等操作
    beanFactory.registerSingleton("bean2", new Bean2());
    beanFactory.registerSingleton("bean3", new Bean3());
    // @Value
    beanFactory.setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver());

    // 查看哪些属性、方法加了 @Autowired，这称之为 InjectionMetadata
    AutowiredAnnotationBeanPostProcessor postProcessor = new AutowiredAnnotationBeanPostProcessor();
    postProcessor.setBeanFactory(beanFactory);

    Bean1 bean1 = new Bean1();
    System.out.println(bean1);
    // 执行依赖注入，@Autowired、@Value
    postProcessor.postProcessProperties(null, bean1, "bean1");
    System.out.println(bean1);
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707814689693-a4367fb3-ac2c-4100-9e57-e29d0c3a390e.png)

在未调用 AutowiredAnnotationBeanPostProcessor#postProcessProperties() 方法时，Bean1 中的 bean2、bean3 和 home 都没有注入成功，而在调用之后，成功注入了 bean2 和 home，但 home 的值似乎有点奇怪，并没有打印出前文中相同的值，可能是因为没有成功解析 #{}？

至于 bean3 为什么没注入成功，是因为 bean3 的注入是利用 @Resource，而不是 @Autowired。如果对 Bean1 进行修改：

```java
public class Bean1 {
	// --snip--
    
    @Autowired
    private Bean3 bean3;

    @Resource
    public void setBean3(Bean3 bean3) {
        log.info("@Resource 生效: {}", bean3);
        this.bean3 = bean3;
    }
    
    // --snip--
}
```

再次运行

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707814737662-31f647ff-4c24-41e4-a4ca-dd0b2288161d.png)

成功注入了 bean3。如果想要成功注入 home，则需要在 BeanFactory 中添加 #{} 的解析器：

```java
beanFactory.addEmbeddedValueResolver(new StandardEnvironment()::resolvePlaceholders); // ${} 的解析器
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707814782918-3e7020a1-471e-4d49-8fad-c6ae420d022a.png)

AutowiredAnnotationBeanPostProcessor#postProcessProperties()

源码如下：

```java
@Override
public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {
	InjectionMetadata metadata = findAutowiringMetadata(beanName, bean.getClass(), pvs);
	try {
		metadata.inject(bean, beanName, pvs);
	}
	catch (BeanCreationException ex) {
		throw ex;
	}
	catch (Throwable ex) {
		throw new BeanCreationException(beanName, "Injection of autowired dependencies failed", ex);
	}
	return pvs;
}
```

其中的 findAutowiringMetadata() 用于查找指定的 bean 对象中哪些地方使用了 @Autowired、@Value 等与注入相关的注解，并将这些信息封装在 InjectionMetadata 对象中，之后调用其 inject() 方法利用反射完成注入。

findAutowiringMetadata() 方法是一个私有方法，尝试利用反射进行调用并进行断点查看 InjectionMetadata 对象中的信息：

```java
@SneakyThrows
public static void main(String[] args) {
    // --snip--
    
    AutowiredAnnotationBeanPostProcessor postProcessor = new AutowiredAnnotationBeanPostProcessor();
    postProcessor.setBeanFactory(beanFactory);

    Bean1 bean1 = new Bean1();

    Method method = AutowiredAnnotationBeanPostProcessor.class.getDeclaredMethod("findAutowiringMetadata", String.class, Class.class, PropertyValues.class);
    method.setAccessible(true);
    // 获取 Bean1 上加了 @Value、@Autowired 注解的成员变量、方法参数信息
    InjectionMetadata metadata = (InjectionMetadata) method.invoke(postProcessor, "bean1", Bean1.class, null);
    // 此处断点
    System.out.println(metadata);
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707815408442-e9cce8ab-745f-4c33-8539-3dc93e19729b.png)

InjectionMetadata 中有一个名为 injectedElements 的集合类型成员变量，根据上图所示，injectedElements 存储了被相关注解标记的成员变量、方法的信息，因为 Bean1 中的 bean3 成员变量、setBean2() 和 setHome() 方法恰好被 @Autowired 注解标记。

然后按照源码一样，调用 InjectionMetadata#inject() 方法进行依赖注入：

```java
@SneakyThrows
public static void main(String[] args) {
    // --snip--

    // 获取 Bean1 上加了 @Value、@Autowired 注解的成员变量、方法参数信息
    InjectionMetadata metadata = (InjectionMetadata) method.invoke(postProcessor, "bean1", Bean1.class, null);

    // 调用 InjectionMetadata 来进行依赖注入，注入时按类型查找值
    metadata.inject(bean1, "bean1", null);
    System.out.println(bean1);
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707815624180-0bdc25eb-d076-41d7-928d-2380ec4837b8.png)

调用 inject() 方法后会利用反射进行依赖注入，但在反射之前，肯定得先拿到被注入的对象或值，那这些对象或值是怎么取到的呢？

可以通过以下代码概括：

```java
@SneakyThrows
public static void main(String[] args) {
    // --snip--
	
	// 3. 如何按类型查找值
	Field bean3 = Bean1.class.getDeclaredField("bean3");
	DependencyDescriptor dd1 = new DependencyDescriptor(bean3, false);
	Object o = beanFactory.doResolveDependency(dd1, null, null, null);
	System.out.println(o);

	Method setBean2 = Bean1.class.getDeclaredMethod("setBean2", Bean2.class);
	DependencyDescriptor dd2 =
			new DependencyDescriptor(new MethodParameter(setBean2, 0), true);
	Object o1 = beanFactory.doResolveDependency(dd2, null, null, null);
	System.out.println(o1);

	Method setHome = Bean1.class.getDeclaredMethod("setHome", String.class);
	DependencyDescriptor dd3 =
			new DependencyDescriptor(new MethodParameter(setHome, 0), true);
	Object o2 = beanFactory.doResolveDependency(dd3, null, null, null);
	System.out.println(o2);
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707815664508-28fadcab-abb4-497c-8052-92b4f313cc98.png)



**后处理器解析对应注解**

- AutowiredAnnotationBeanPostProcessor：@Autowired @Value
- CommonAnnotationBeanPostProcessor：@Resource @PostConstruct @PreDestroy
- ConfigurationPropertiesBindingPostProcessor：@ConfigurationProperties
