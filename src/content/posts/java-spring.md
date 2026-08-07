---
title: Spring Boot 快速入门
category: 后端
date: 2026-07-25
---

# Spring Boot 快速入门

Spring Boot 让 Spring 应用的搭建变得异常简单，约定优于配置。

## 创建项目

使用 Spring Initializr 生成项目骨架，选择依赖：

- Spring Web
- Spring Data JPA
- H2 Database

## 第一个 REST 接口

```java
@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Pixel World!";
    }
}
```

## 配置文件

`application.yml` 比传统 properties 更清晰：

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
```

## 自动装配原理

`@SpringBootApplication` 包含：

- `@SpringBootConfiguration`：配置类
- `@EnableAutoConfiguration`：自动装配
- `@ComponentScan`：组件扫描

Spring Boot 通过 `spring.factories` 文件加载自动配置类，根据条件注解决定是否生效。

> Spring Boot 的核心思想：约定优于配置，开箱即用。
