---
order: 13
title: 线程池
date: 2021-10-16
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

## 配置一个自己的线程池

```java
@EnableConfigurationProperties(ThreadPoolConfigProperties.class)
@Configuration
public class MyThreadConfig {

    @Bean
    public ThreadPoolExecutor threadPoolExecutor(ThreadPoolConfigProperties pool) {
        return new ThreadPoolExecutor(
                pool.getCoreSize(),
                pool.getMaxSize(),
                pool.getKeepAliveTime(),
                TimeUnit.SECONDS,
                new LinkedBlockingDeque\<>(1000),
                Executors.defaultThreadFactory(),
                // 被拒绝的任务抛出异常
                new ThreadPoolExecutor.AbortPolicy()
        );
    }
}
```

````java
@ConfigurationProperties(prefix = "thread.pool")
@Data
public class ThreadPoolConfigProperties {

    private Integer coreSize;
    private Integer maxSize;
    private Integer keepAliveTime;
}
````

```yaml
thread:
  pool:
    core-size: 20
    max-size: 200
    keep-alive-time: 5
```

## 异步编排

```java
public ProductDetailVo findByProductId(Long productId) {
    CompletableFuture\<ProductDetailVo> infoFuture = CompletableFuture.supplyAsync(() -> {
        // 查询商品信息
        ProductModel model = this.getOne(new QueryWrapper\<ProductModel>()
                                         .eq("id", productId)
                                         .eq("is_publish", 1)
                                        );
        Assert.notNull(model, BizExceptionEnum.PRODUCT_NOT_EXIST, "ProductServiceImpl : findById " +
                       "error");
        return ProductDetailVo.fromModel(model);
    }, executor);


    CompletableFuture\<Void> attrFuture = infoFuture.thenAcceptAsync((res) -> {
        List\<ProductAttrVo> list = new ArrayList\<>();
        res.setProductAttrVos(list);
        // 查询商品属性
        List\<ProductAttributeValueModel> productAttributeValues =
            productAttributeValueMapper.selectList(new QueryWrapper\<ProductAttributeValueModel>().eq(
                "product_id", productId));
        // 查询商品属性名称
        for (ProductAttributeValueModel productAttributeValueModel : productAttributeValues) {
            ProductAttrVo productAttrVo = new ProductAttrVo();
            // 查询属性名称
            ProductAttributeModel productAttributeModel =
                productAttributeMapper.selectOne(new QueryWrapper\<ProductAttributeModel>()
                                                 .eq("id",
                                                     productAttributeValueModel.getProductAttributeId())
                                                 .eq("type", 1)
                                                );
            Assert.notNull(productAttributeModel, BizExceptionEnum.PRODUCT_ATTR_NAME_NOT_EXIST);
            // 组合属性名称跟属性值
            productAttrVo.setName(productAttributeModel.getName());
            productAttrVo.setValue(productAttributeValueModel.getValue());
            productAttrVo.setIcon(productAttributeValueModel.getIcon());
            list.add(productAttrVo);
        }
    }, executor);

    CompletableFuture\<Void> buyImageFuture = infoFuture.thenAcceptAsync((res) -> {
        // 查询购买页商品图片
        List\<ProductBuyImageVo> productBuyImageVoList =
            productBuyImageMapper.selectList(new QueryWrapper\<ProductBuyImageModel>().eq(
                "product_id", productId))
            .stream()
            .map(ProductBuyImageVo::fromModel)
            .collect(Collectors.toList());
        res.setBuyImages(productBuyImageVoList);
    }, executor);

    CompletableFuture\<Void> specFuture = infoFuture.thenAcceptAsync((res) -> {
        // 查询商品规格
        List\<SkuStockVo> skuStockVoList =
            skuStockMapper.selectList(new QueryWrapper\<SkuStockModel>().eq(
                "product_id", productId))
            .stream()
            .map(SkuStockVo::fromModel)
            .collect(Collectors.toList());
        res.setSkuStockVos(skuStockVoList);
    }, executor);
    ProductDetailVo productDetailVo = null;
    try {
        // 等待异步任务都完成
        CompletableFuture.allOf(attrFuture, buyImageFuture, specFuture).get();
        productDetailVo = infoFuture.get();
    } catch (InterruptedException | ExecutionException e) {
        Assert.thrown(BizExceptionEnum.PRODUCT_NOT_EXIST);
    }
    return productDetailVo;
}
```

## 并发

1. 服务单一职责+独立部署

    秒杀服务即使自己扛不住压力，挂掉，不要影响其他服务

2. 秒杀链接加密

    防止恶意攻击，模拟秒杀请求，1000次/s攻击

    防止链接暴露，自己工作人员，提前秒杀商品

3. 库存预热+快速扣减

    秒杀读多写少。无需每次实时校验库存。我们库存预热，放到redis中。信号量控制进来秒杀的请求

4. 动静分离

    nginx做好动静分离。保证秒杀和商品详情页的动态请求才打到后端的服务集群。

    使用CDN网络，分担本集群压力

5. 恶意请求拦截

    识别非法攻击请求进行拦截，网关层

6. 流量错峰

    使用各种手段，讲流量分担到更大宽度的时间点。比如验证码，加入购物车

7. 限流&熔断&降级

    前端限流+后端限流

    限制次数，限制总量，快速失败降级运行，熔断隔离防止雪崩

8. 队列削峰

    1万个商品，每个1000件秒杀。双11所有秒杀成功的请求，进入队列，慢慢创建订单，扣减库存即可

==高并发三大处理手段==

- 缓存（Redis）
- 异步（ThreadPoolExecutor, CompletableFuture）
- 队排好（RabbitMQ）