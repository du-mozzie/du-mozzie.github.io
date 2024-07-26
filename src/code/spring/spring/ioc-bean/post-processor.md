---
order: 3
title: BeanFactory后置处理器
date: 2021-10-03
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

# 常见的 BeanFactory 后置处理器

先引入要用到的依赖：

```xml
<dependency>
	<groupId>org.mybatis.spring.boot</groupId>
	<artifactId>mybatis-spring-boot-starter</artifactId>
	<version>2.3.0</version>
</dependency>

<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>druid-spring-boot-starter</artifactId>
	<version>1.2.15</version>
</dependency>

<dependency>
	<groupId>mysql</groupId>
	<artifactId>mysql-connector-java</artifactId>
</dependency>
```

需要用到的类信息：

```java
@Configuration
@ComponentScan("com.itheima.a05.component")
public class Config {
    @Bean
    public Bean1 bean1() {
        return new Bean1();
    }

    @Bean
    public SqlSessionFactoryBean sqlSessionFactoryBean(DataSource dataSource) {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        return sqlSessionFactoryBean;
    }

    @Bean(initMethod = "init")
    public DruidDataSource dataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:mysql://localhost:3306/test");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        return dataSource;
    }
}
public class Bean1 {

    private static final Logger log = LoggerFactory.getLogger(Bean1.class);

    public Bean1() {
        log.debug("我被 Spring 管理啦");
    }
}
@Component
public class Bean2 {

    private static final Logger log = LoggerFactory.getLogger(Bean2.class);

    public Bean2() {
        log.debug("我被 Spring 管理啦");
    }
}
```

继续使用 GenericApplicationContext 作为容器，向容器中注册 config：

```java
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("config", Config.class);

    context.refresh();

    for (String name : context.getBeanDefinitionNames()) {
        System.out.println(name);
    }

    context.close();
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707819058942-c5ae9de7-554e-48d0-88db-736c076f27f2.png)

并没有打印出除 config 以外的 Bean 信息，也就是说 Config 类中的 @ComponentScan 和 @Bean 注解都没有生效。

根据经验，显然是因为缺少某个后置处理器。

```java
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("config", Config.class);
    // @ComponentScan @Bean @Import @ImportResource
    context.registerBean(ConfigurationClassPostProcessor.class);
    
    // --snip--
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707819259720-a62a5162-9d0e-4521-bfac-a1ae3bc55d28.png)

在使用 MyBatis 时，经常会使用到 @Mapper 注解，而这个注解的解析也需要使用到特定的 BeanFactory 后置处理器。

以下两个接口被 @Mapper 注解标记：

```java
@Mapper
public interface Mapper1 {
}

@Mapper
public interface Mapper2 {
}
```

然后添加解析 @Mapper 注解的后置处理器：

```java
context.registerBean(MapperScannerConfigurer.class, bd -> { // @MapperScanner
   bd.getPropertyValues().add("basePackage", "com.itheima.a05.mapper");
});
```

其中的 basePackage 是 MapperScannerConfigurer 中的一个成员变量，表示需要扫描的包路径，设置的值恰好是被 @Mapper 注解标记的接口所在的包路径。

控制台打印的信息中增加了两个mapper接口，还有一些常用的后置处理器：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707819791965-ba770f8b-a7b4-4251-a4a6-ee782a2c9c4f.png)

# 模拟实现

移除向容器中添加的 ConfigurationClassPostProcessor 和 MapperScannerConfigurer 两个后置处理器，自行编码模拟它们功能的实现。

@ComponentScan 原理

在 Bean2 所在包路径下再增加两个类，用于后续测试：

```java
@Controller
public class Bean3 {

    private static final Logger log = LoggerFactory.getLogger(Bean3.class);

    public Bean3() {
        log.debug("我被 Spring 管理啦");
    }
}

public class Bean4 {

    private static final Logger log = LoggerFactory.getLogger(Bean4.class);

    public Bean4() {
        log.debug("我被 Spring 管理啦");
    }
}
```

编写 ComponentScanPostProcessor 用于实现 @ComponentScan 注解的解析：

```java
public class ComponentScanPostProcessor implements BeanDefinitionRegistryPostProcessor {
    @Override // context.refresh
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {

    }

    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory) throws BeansException {
        try {
            ComponentScan componentScan = AnnotationUtils.findAnnotation(Config.class, ComponentScan.class);
            if (componentScan != null) {
                for (String p : componentScan.basePackages()) {
                    System.out.println(p);
                    // com.itheima.a05.component -> classpath*:com/itheima/a05/component/**/*.class
                    String path = "classpath*:" + p.replace(".", "/") + "/**/*.class";
                    System.out.println(path);
                    CachingMetadataReaderFactory factory = new CachingMetadataReaderFactory();
                    Resource[] resources = new PathMatchingResourcePatternResolver().getResources(path);
                    AnnotationBeanNameGenerator generator = new AnnotationBeanNameGenerator();
                    for (Resource resource : resources) {
                        // System.out.println(resource);
                        MetadataReader reader = factory.getMetadataReader(resource);
                        // System.out.println("类名:" + reader.getClassMetadata().getClassName());
                        AnnotationMetadata annotationMetadata = reader.getAnnotationMetadata();
                        // System.out.println("是否加了 @Component:" + annotationMetadata.hasAnnotation(Component.class.getName()));
                        // System.out.println("是否加了 @Component 派生:" + annotationMetadata.hasMetaAnnotation(Component.class.getName()));
                        if (annotationMetadata.hasAnnotation(Component.class.getName())
                            || annotationMetadata.hasMetaAnnotation(Component.class.getName())) {
                            AbstractBeanDefinition bd = BeanDefinitionBuilder
                                    .genericBeanDefinition(reader.getClassMetadata().getClassName())
                                    .getBeanDefinition();
                            String name = generator.generateBeanName(bd, beanFactory);
                            beanFactory.registerBeanDefinition(name, bd);
                        }
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

测试：

```java
// 注册自定义的CommponentScanPostProcessor
context.registerBean(ComponentScanPostProcessor.class); // 解析 @ComponentScan
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707820387250-2fd2d7af-ade0-4278-8cf4-000e2daa830f.png)

@Bean 原理

编写一个 BeanFactoryPostProcessor 的实现类用于解析 @Bean 注解：

```java
public class BeanFactoryPostProcessor implements BeanDefinitionRegistryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {

    }

    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory) throws BeansException {
        try {
            CachingMetadataReaderFactory factory = new CachingMetadataReaderFactory();
            MetadataReader reader = factory.getMetadataReader(new ClassPathResource("com/itheima/a05/Config.class"));
            Set<MethodMetadata> methods = reader.getAnnotationMetadata().getAnnotatedMethods(Bean.class.getName());
            for (MethodMetadata method : methods) {
                System.out.println(method);
                String initMethod = method.getAnnotationAttributes(Bean.class.getName()).get("initMethod").toString();
                BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition();
                builder.setFactoryMethodOnBean(method.getMethodName(), "config");
				// 工厂方法、构造方法的注入模式使用构造器模式
                builder.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_CONSTRUCTOR);
                if (!initMethod.isEmpty()) {
                    builder.setInitMethodName(initMethod);
                }
                AbstractBeanDefinition bd = builder.getBeanDefinition();
                beanFactory.registerBeanDefinition(method.getMethodName(), bd);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

在构造 BeanDefinition 时调用了 setAutowireMode() 方法设置注入模式，这是因为在 Config 类中有一特殊的被 @Bean 标记的方法：

```java
@Bean
public SqlSessionFactoryBean sqlSessionFactoryBean(DataSource dataSource) {
	SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
	sqlSessionFactoryBean.setDataSource(dataSource);
	return sqlSessionFactoryBean;
}
```

接收一个 DataSource 类型的参数，需要将容器中这个类型的 Bean 进行注入，设置的 AbstractBeanDefinition.AUTOWIRE_CONSTRUCTOR 注入模式则能完成这个功能。

```java
context.registerBean(BeanFactoryPostProcessor.class); // 解析 @Bean
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707820805028-42da598f-b1ab-4434-bc7c-c18dd063a1d9.png)

@Mapper 原理

@Mapper 注解是在接口上使用的，但根据前文内容可知，@Mapper 被解析后在 Spring 容器中也存在与被标记的接口相关的 Bean。

难道 Spring 能管理接口？

那肯定是不行的，Spring 只能管理对象这是毋庸置疑的。那这些接口是怎么变成对象被 Spring 管理的呢？

这依赖于 MapperFactoryBean 将接口转换为对象。

在 Config 添加注册 Mapper1 和 Mapper2 的方法：

```java
@Bean
public MapperFactoryBean<Mapper1> mapper1(SqlSessionFactory sqlSessionFactory) {
	MapperFactoryBean<Mapper1> factory = new MapperFactoryBean<>(Mapper1.class);
	factory.setSqlSessionFactory(sqlSessionFactory);
	return factory;
}

@Bean
public MapperFactoryBean<Mapper2> mapper2(SqlSessionFactory sqlSessionFactory) {
	MapperFactoryBean<Mapper2> factory = new MapperFactoryBean<>(Mapper2.class);
	factory.setSqlSessionFactory(sqlSessionFactory);
	return factory;
}
```

再运行 main() 方法可以看到容器中存在名为 mapper1 和 mapper2 的 Bean。

这种方式虽然可以完成 Mapper 接口的注册，但每次只能单个注册，不能批量注册。

移除 Config 类中的 mapper1() 和 mapper2() 方法，自行编写 BeanDefinitionRegistryPostProcessor 接口的实现类完成 @Mapper 注解的解析：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707820932105-2dc78cec-ddb8-4aa5-8c28-8a2754416da7.png)

```java
public class MapperPostProcessor implements BeanDefinitionRegistryPostProcessor {

    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanFactory) throws BeansException {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:com/itheima/a05/mapper/**/*.class");
            AnnotationBeanNameGenerator generator = new AnnotationBeanNameGenerator();
            CachingMetadataReaderFactory factory = new CachingMetadataReaderFactory();
            for (Resource resource : resources) {
                MetadataReader reader = factory.getMetadataReader(resource);
                ClassMetadata classMetadata = reader.getClassMetadata();
                if (classMetadata.isInterface()) {
                    AbstractBeanDefinition bd = BeanDefinitionBuilder.genericBeanDefinition(MapperFactoryBean.class)
                            .addConstructorArgValue(classMetadata.getClassName())
                            .setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE)
                            .getBeanDefinition();
                    AbstractBeanDefinition bd2 = BeanDefinitionBuilder.genericBeanDefinition(classMetadata.getClassName()).getBeanDefinition();
                    String name = generator.generateBeanName(bd2, beanFactory);
                    beanFactory.registerBeanDefinition(name, bd);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {

    }
}
```

测试：

```java
/*
 * BeanFactoryPostProcessor 的注册不能少，因为需要容器中存在 SqlSessionFactoryBean
 * 而 SqlSessionFactoryBean 是在配置类中利用 @Bean 进行注册的
 */
context.registerBean(BeanFactoryPostProcessor.class); // 解析 @Bean
context.registerBean(MapperPostProcessor.class); // 解析 Mapper 接口
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707821125291-d63896cf-cd0c-4bbe-948c-b81b8fa1e475.png)

容器中存在 mapper1 和 mapper2 两个 Bean。

# 注册创建完成的 Bean

如果要将 Bean 添加到 Spring 容器中，需要先根据配置文件或注解信息为每一个 Bean 生成一个 BeanDefinition，然后将这些 BeanDefinition 添加到 BeanDefinitionRegistry 中，当创建 Bean 对象时，直接从 BeanDefinitionRegistry 中获取 BeanDefinition 来生成 Bean。

如果生成的 Bean 是单例的，Spring 会将它们保存到 SingletonBeanRegistry 中，后续需要时从这里面寻找，避免重复创建。

那么向 Spring 容器中添加单例 Bean 时，可以跳过注册 BeanDefinition，直接向 SingletonBeanRegistry 中添加创建完成的 Bean。既然添加的是创建完成的 Bean，所以 这个 Bean 不会经过 Spring 的生命周期。

SingletonBeanRegistry 是一个接口，它有一个子接口名为 ConfigurableListableBeanFactory，而这恰好是 BeanFactoryPostProcessor 接口中抽象方法的参数：

```java
@FunctionalInterface
public interface BeanFactoryPostProcessor {

	/**
	 * Modify the application context's internal bean factory after its standard
	 * initialization. All bean definitions will have been loaded, but no beans
	 * will have been instantiated yet. This allows for overriding or adding
	 * properties even to eager-initializing beans.
	 * @param beanFactory the bean factory used by the application context
	 * @throws org.springframework.beans.BeansException in case of errors
	 */
	void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;
}
```

尝试使用 BeanFactoryPostProcessor 注册创建完成的 Bean：

```java
@Slf4j
public class TestBeanFactoryPostProcessor {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.registerBean("bean2", Bean2.class);
        context.registerBean(MyBeanFactoryPostProcessor.class);
        context.refresh();

        Arrays.stream(context.getBeanDefinitionNames()).forEach(System.out::println);
        System.out.println("--------------------");
        System.out.println(context.getBean(Bean1.class));
    }

    static class MyBeanFactoryPostProcessor implements org.springframework.beans.factory.config.BeanFactoryPostProcessor {
        @Override
        public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
            Bean1 bean1 = new Bean1();
            bean1.setName("bean1");
            beanFactory.registerSingleton("bean1", bean1);
        }
    }

    @Getter
    @ToString
    static class Bean1 {
        @Setter
        private String name;
        private Bean2 bean2;

        @Autowired
        private void setBean2(Bean2 bean2) {
            log.debug("依赖注入 bean2");
            this.bean2 = bean2;
        }

        @PostConstruct
        public void init() {
            log.debug("初始化...");
        }
    }

    static class Bean2 {
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707821862734-67c024eb-034a-4d0b-bb94-10a5050095f5.png)

BeanDefinition 的名称数组中不包含 bean1，也没有输出任何与经过 Spring 生命周期相关的日志信息，容器中 bean1 里注入的 bean2 也是 null。这表明通过这种方式注册的 Bean 不会注册 BeanDefinition，也不会经过 Spring 生命周期。