# spring-依赖注入

## 依赖注入-属性注入&SpEL表达式
### 1. setter属性注入
xml方式的setter注入
```xml
<bean id="person" class="com.linkedbear.spring.basic_di.a_quickstart_set.bean.Person">
    <property name="name" value="test-person-byset"/>
    <property name="age" value="18"/>
</bean>
```
注解方式的setter注入
```java
@Bean
public Person person() {
    Person person = new Person();
    person.setName("test-person-anno-byset");
    person.setAge(18);
    return person;
}
```
### 2. 构造器注入
注解式构造器属性注入
```java
public Person(String name, Integer age) {
    this.name = name;
    this.age = age;
}

@Bean
public Person person() {
    return new Person("test-person-anno-byconstructor", 18);
}
```
xml方式的构造器注入
```xml
<bean id="person" class="com.linkedbear.spring.basic_di.b_constructor.bean.Person">
    <constructor-arg index="0" value="test-person-byconstructor"/>
    <constructor-arg index="1" value="18"/>
</bean>
```

### 3. 注解式属性注入（组件扫描方式）
#### @Component下的属性注入
```java
@Component
public class Black {

    @Value("black-value-anno")
    private String name;

    @Value("0")
    private Integer order;

    @Override
    public String toString() {
        return "Black{" + "name='" + name + '\'' + ", order=" + order + '}';
    }
}

public class InjectValueAnnoApplication {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext("com.linkedbear.basic_di.c_value_spel.bean");
        Black black = ctx.getBean(Black.class);
        System.out.println("simple value : " + black);
    }
}
```
#### 外部配置文件引入-@PropertySource
**用于导入外部的配置文件：@PropertySource**
```properties
red.name=red-value-byproperties
red.order=1
```
```java
@Configuration
// 顺便加上包扫描
@ComponentScan("com.linkedbear.spring.basic_di.c_value_spel.bean")
@PropertySource("classpath:basic_di/value/red.properties")
public class InjectValueConfiguration {
    
}

@Value("${red.name}")
private String name;

@Value("${red.order}")
private Integer order;

public static void main(String[] args) throws Exception {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(InjectValueConfiguration.class);
    Red red = ctx.getBean(Red.class);
    System.out.println("properties value : " + red);
}
```
xml中使用占位符
```xml
<bean class="com.linkedbear.spring.basic_di.c_value_spel.bean.Red">
    <property name="name" value="${red.name}"/>
    <property name="order" value="${red.order}"/>
</bean>
```
> properties 文件，它加载到 SpringFramework 的 IOC 容器后，会转换成 Map 的形式来保存这些配置。实际上这些配置属性和值存放的真实位置是一个叫 Environment 的抽象中。

#### SpEL表达式
SpEL 全称 Spring Expression Language ，它从 SpringFramework 3.0 开始被支持，它本身可以算 SpringFramework 的组成部分，但又可以被独立使用。它可以支持调用属性值、属性参数以及方法调用、数组存储、逻辑计算等功能。

**SpEL 的语法统一用 #{} 表示，花括号内部编写表达式语言。**
```java
@Component
public class Blue {
    // @Value 配合 SpEL 完成字面量的属性注入，需要额外在花括号内部加单引号
    @Value("#{'blue-value-byspel'}")
    private String name;
    
    @Value("#{2}")
    private Integer order;

Blue{name='blue-value-byspel', order=2}
```
- **SpEL 可以取 IOC 容器中其它 Bean 的属性**
```java
@Component
public class Green {
    
    @Value("#{'copy of ' + blue.name}")
    private String name;
    
    @Value("#{blue.order + 1}")
    private Integer order;

use spel bean property : Green{name='copy of blue-value-byspel', order=3}

<bean class="com.linkedbear.spring.basic_di.c_value_spel.bean.Green">
    <property name="name" value="#{'copy of ' + blue.name}"/>
    <property name="order" value="#{blue.order + 1}"/>
</bean>
```
- **SpEL 可以直接引用类常量，以及调用对象的方法**
```java
@Component
public class White {
    
    @Value("#{blue.name.substring(0, 3)}")
    private String name;
    
    // 直接引用类的属性，需要在类的全限定名外面使用 T() 包围。
    @Value("#{T(java.lang.Integer).MAX_VALUE}")
    private Integer order;
    
```
```xml
<bean class="com.linkedbear.spring.basic_di.c_value_spel.bean.White">
    <property name="name" value="#{blue.name.substring(0, 3)}"/>
    <property name="order" value="#{T(java.lang.Integer).MAX_VALUE}"/>
</bean>
```

## 依赖注入-自动注入
### @Autowired
在 Bean 中直接在 **属性 / setter** 方法 上标注 ==@Autowired== 注解，IOC 容器会**按照属性对应的类型，从容器中找对应类型的 Bean 赋值到对应的属性上**，实现自动注入。
```java
@Component
public class Person {
    private String name = "administrator";
    // setter

@Component
public class Dog {
    
    @Value("dogdog")
    private String name;
    
    private Person person;
    // toString() ......
    
// 给Dog注入Person的三种方式
@Component
public class Dog {
    // ......
    @Autowired
    private Person person;

// 构造器注入
@Component
public class Dog {
    // ......
    private Person person;
    
    @Autowired
    public Dog(Person person) {
        this.person = person;
    }

// setter 方法注入
@Component
public class Dog {
    // ......
    private Person person;
    
    @Autowired
    public void setPerson(Person person) {
        this.person = person;
    }

public class InjectComplexFieldAnnoApplication {
    
    public static void main(String[] args) throws Exception {
        ApplicationContext ctx = new AnnotationConfigApplicationContext("com.linkedbear.spring.basic_di.d_complexfield.bean");
        Dog dog = ctx.getBean(Dog.class);
        System.out.println(dog);
    }
}

Dog{name='dogdog', person=Person{name='administrator'}}
```
- **注入的Bean不存在**
将 Person 上面的 @Component 暂时的注释掉
```java
    @Autowired(required = false)
    private Person person;
    
    Dog{name='dogdog', person=null}
```