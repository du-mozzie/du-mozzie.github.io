---
order: 1
title: SpringBoot自动配置原理
date: 2021-10-09
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
prev: ./
---

# SpringBoot自动配置原理

```java
//核心源码
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
}
```

## @SpringBootConfiguration

代表当前是一个配置类

## @EnableAutoConfiguration

```java
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {

	/**
	 * Environment property that can be used to override when auto-configuration is
	 * enabled.
	 */
	String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

	/**
	 * Exclude specific auto-configuration classes such that they will never be applied.
	 * @return the classes to exclude
	 */
	Class<?>[] exclude() default {};

	/**
	 * Exclude specific auto-configuration class names such that they will never be
	 * applied.
	 * @return the class names to exclude
	 * @since 1.3.0
	 */
	String[] excludeName() default {};

}
```

>   @AutoConfigurationPackage

```java
//@Import给容器中导入组件
@Import(AutoConfigurationPackages.Registrar.class)
public @interface AutoConfigurationPackage {}
//利用Registrar给容器中导入一系列组件
//将指定的一个包下面的所有组件导进来，SpringBoot启动类所在的包
```

>   @Import(AutoConfigurationImportSelector.class)

1. getAutoConfigurationEntry(annotationMetadata)给容器中批量导入一些组件

2. List\<String> configurations = getCandidateConfigurations(annotationMetadata, attributes)获取所有需要导入容器的配置类

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607075728090.png)

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607080322989.png)

   - ```java
     List<String> configurations = SpringFactoriesLoader.loadFactoryNames(getSpringFactoriesLoaderFactoryClass(),
           getBeanClassLoader());
     ```

     - 工厂加载器加载`private static Map\<String, List\<String>> loadSpringFactories(ClassLoader classLoader) {}`得到所有的组件，从META-INF/spring.factories下获取；==spring-boot-autoconfigure-2.5.0.jar==文件里写死了一启动就要加载的所有配置类

       ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607081425971.png)

3. 虽然一开始默认加载了131个配置类，按照条件规则`@Conditional`最终会按需配置

   `在配置类下有一个注解@Conditional，获取该注解的条件来判断该配置类是否使用，如果使用了就会生效，最终在排除配置类的时候会保留该配置类`

   -   SpringBoot会在底层默认配置好组件，如果用户自己配置了就以用的的优先，@ConditionalOnMissingBean

   **总结：**

   1.  SpringBoot默认会加载所有的配置类`spring-boot-autoconfigure-2.5.0.jar`下的	xxxAutoConfigure
   2.  每个自动配置类按照条件进行生效，默认都会绑定配置文件指定的参数，xxxProperties里面拿，xxxProperties和配置文件进行了绑定
   3.  生效的配置类会在容器中装配很多组件
   4.  只要容器有了这些组件，相当于这些功能都有了
   5.  定制化配置
       -   用户直接自己实现配置类的组件@Bean装配到容器中
       -   查看组件的配置文件的参数，去Application.properties中修改

   xxxAutoConfiguration ---> 组件 ---> xxxProperties获取参数 \<--`绑定`--> Application.properties

## @ComponentScan

包扫描，指定我们要扫描哪些

## 自动装配第三方依赖

一、需求描述
写了一个maven项目封装一套组件可以给第三方使用，如果第三方直接引用依赖，Spring Boot不会对引用的jar中的配置类（如带有@Configuration的类）

解决方案：

1. 使用者手动配置 @ComponentScan

   测试

2. 配置开关决定是否开启配置

3. Spring Boot 主动加载
   这三种方式友好程度依次递增

### 1、使用@ComponentScan

只需在SpringBoot启动类或自定义的配置类中添加 **@ComponentScan** 注解即可

- 启动类

  ```java
  @SpringBootApplication
  @ComponentScan(basePackages = "com.du.config")
  public class DiyListenerApplication {
      public static void main(String[] args) {
          SpringApplication.run(DiyListenerApplication.class, args);
      }
  }
  ```

- 配置类

  ```java
  @Configuration
  @ComponentScan(basePackages = "com.du.config")
  public class MyConfig {
  }
  ```

### 2、通过配置开关

- 在自定义组件中添加配置类

  ```java
  @Configuration
  public class MyConfig {
  }
  ```

- 在自定义组件中添加注解开关

  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.TYPE})
  @Documented
  @Import({TestConfig.class})
  public @interface EnableTestConfig {
  }
  ```

- 在自定义的配置类中开启配置

  ```java
  @Configuration
  @EnableTestConfig
  public class MyConfig {
  }
  ```

  或者直接在启动类中添加 **@EnableTestConfig** 注解。

### 3、Spring 自动配置

在自定义配置类的resources中新建META-INF目录并添加spring.factories配置文件

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210607105520928.png)

添加配置

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration\
  com.du.config.MyConfig
```

其中 **org.springframework.boot.autoconfigure.EnableAutoConfiguration** 代表自动配置的 key，即代表需要自动配置哪些类，`\` 可以理解为一个换行符，则该行下面的每行当做一个参数。

从第二行开始都是一个配置类，需要填写该配置类的全限定名

## 总结

1. 在 Spring Boot 项目中的引导类上有一个注解 @SpringBootApplication，这个注解是对三个注解进行了封装，分别是：
   - @SpringBootConfiguration
   - @EnableAutoConfiguration
   - @ComponentScan
2. 其中 **@EnableAutoConfiguration** 是实现自动化配置的核心注解。该注解通过 **@Import** 注解导入对应的配置选择器。内部就是读取了该项目和该项目引I用的 Jar 包的的 classpath 路径下 **META-INF/spring.factories** 文件中的所配置的类的全类名。在这些配置类中所定义的 Bean 会根据条件注解**所指定的条件来决定**是否需要将其导入到 Spring 容器中。
3. 条件判断会有像 **@ConditionalOnClass** 这样的注解，判断是否有对应的 class 文件，如果有则加载该类，把这个配置类的所有的 Bean 放入 Spring 容器中使用。
