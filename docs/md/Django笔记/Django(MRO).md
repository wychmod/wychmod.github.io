# django rest framework开发笔记

## 项目初始化
### 创建虚拟环境安装django包：
```python
mkvirtualenv xxx

pip install djangorestframework -i https://pypi.douban.com/simple/
pip install markdown -i https://pypi.douban.com/simple/       # Markdown support for the browsable API.
pip install django-filter -i https://pypi.douban.com/simple/  # Filtering support
pip install mysqlclient -i https://pypi.douban.com/simple/
pip install pillow -i https://pypi.douban.com/simple/
pip install coreapi -i https://pypi.douban.com/simple/
pip install django-guardian -i https://pypi.douban.com/simple/

```
### Setting.py配置：
#### 配置数据库
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': "mxshop",
        'USER': 'root',
        'PASSWORD': "123456",
        'HOST': "127.0.0.1",
        'OPTIONS': {'init_command': 'SET default_storage_engine=INNODB;'} # 和第三方数据库的migration有关
    }
}
```
**创建数据库**：

![image](../youdaonote-images/70B6490750994CDFA31679E99EB08746.png)

#### 配置目录结构
**apps和extra_apps 右键Mark as sources Root**
![image](../youdaonote-images/0CD3470081224367AA8807D3BF3F240A.png)

**配置apps下面的路径为默认路径，这也引用的时候就可以直接引用apps下的user，而不用apps.user**
```python
import os
import sys

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))
sys.path.insert(0, os.path.join(BASE_DIR, 'extra_apps'))
```

> sys.path.insert(0,‘/path’)，这样新添加的目录会优先于其他目录被import检查

## models设计
### user设计
字段名称 | 字段属性
---|---
id | int
password | varchar
last_login | datetime
is_superuser | tinyint
username | varchar
first_name | varchar
last_name | varchar
email | varchar
is_staff | tinyint
is_active | tinyint
date_joined | datetime

**继承默认user表：**

新的user替换旧的user
```python
from datetime import datetime

from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class UserProfile(AbstractUser):
    """
    用户
    """
    name = models.CharField(max_length=30, null=True, blank=True, verbose_name="姓名")
    birthday = models.DateField(null=True, blank=True, verbose_name="出生年月")
    gender = models.CharField(max_length=6, choices=(("male", u"男"), ("female", "女")), default="female", verbose_name="性别")
    mobile = models.CharField(null=True, blank=True, max_length=11, verbose_name="电话")
    email = models.EmailField(max_length=100, null=True, blank=True, verbose_name="邮箱")

    class Meta:
        verbose_name = "用户"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.username


class VerifyCode(models.Model):
    """
    短信验证码
    """
    code = models.CharField(max_length=10, verbose_name="验证码")
    mobile = models.CharField(max_length=11, verbose_name="电话")
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    class Meta:
        verbose_name = "短信验证码"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.code
        
setting.py:

AUTH_USER_MODEL = 'users.UserProfile'
```
> verbose_name 是admin上面的名字和一些导出文件的名字。

### 一个model实现无限分类
```python
class GoodsCategory(models.Model):
    """
    商品类别
    """
    CATEGORY_TYPE = (
        (1, "一级类目"),
        (2, "二级类目"),
        (3, "三级类目"),
    )

    name = models.CharField(default="", max_length=30, verbose_name="类别名", help_text="类别名")
    code = models.CharField(default="", max_length=30, verbose_name="类别code", help_text="类别code")
    desc = models.TextField(default="", verbose_name="类别描述", help_text="类别描述")
    category_type = models.IntegerField(choices=CATEGORY_TYPE, verbose_name="类目级别", help_text="类目级别")
    parent_category = models.ForeignKey("self", null=True, blank=True, verbose_name="父类目级别", help_text="父目录",
                                        related_name="sub_cat")
    is_tab = models.BooleanField(default=False, verbose_name="是否导航", help_text="是否导航")
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    class Meta:
        verbose_name = "商品类别"
        verbose_name_plural = verbose_name
```
> related代替了在通过一个对象查询出多个对象集合时，使用表名_set来获取 GoodsCategory.parent_category_set.all() = GoodsCategory.sub_cat.all()
[related_name 详解](https://blog.csdn.net/wuliangtianzu/article/details/82656647)

### 一对多外键设计及上传
```python
class GoodsImage(models.Model):
    """
    商品轮播图
    """
    goods = models.ForeignKey(Goods, verbose_name="商品", related_name="images")
    image = models.ImageField(upload_to="", verbose_name="图片", null=True, blank=True)
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    class Meta:
        verbose_name = '商品图片'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.goods.name
```

### DjangoUeditor
**原版的不支持python3，所以复制自己的进来。**

![image](../youdaonote-images/6BC825CDDAB741EC9E91F394F47ED6DA.png)

1. 将djangoueditor添加到setting.py中
```python
INSTALLED_APPS = [
    ...
    'DjangoUeditor',
]
```
2. 添加url
```python
urlpatterns = [
    path('ueditor/', include('DjangoUeditor.urls' )),
]
```
3. xadmin中添加插件ueditor
在xadmin下的plugin中新建一个ueditor.py文件，里面写入如下：
```python
import xadmin
from xadmin.views import BaseAdminPlugin, CreateAdminView, ModelFormAdminView, UpdateAdminView
from DjangoUeditor.models import UEditorField
from DjangoUeditor.widgets import UEditorWidget
from django.conf import settings


class XadminUEditorWidget(UEditorWidget):
    def __init__(self,**kwargs):
        self.ueditor_options=kwargs
        self.Media.js = None
        super(XadminUEditorWidget,self).__init__(kwargs)


class UeditorPlugin(BaseAdminPlugin):

    def get_field_style(self, attrs, db_field, style, **kwargs):
        if style == 'ueditor':
            if isinstance(db_field, UEditorField):
                widget = db_field.formfield().widget
                param = {}
                param.update(widget.ueditor_settings)
                param.update(widget.attrs)
                return {'widget': XadminUEditorWidget(**param)}
        return attrs

    def block_extrahead(self, context, nodes):
        js = '<script type="text/javascript" src="%s"></script>' % (settings.STATIC_URL + "ueditor/ueditor.config.js")         #自己的静态目录
        js += '<script type="text/javascript" src="%s"></script>' % (settings.STATIC_URL + "ueditor/ueditor.all.min.js")   #自己的静态目录
        nodes.append(js)

xadmin.site.register_plugin(UeditorPlugin, UpdateAdminView)
xadmin.site.register_plugin(UeditorPlugin, CreateAdminView)
```
4. 将ueditor添加到plugin下的_init_中
```python
PLUGINS = (
    ...
    'ueditor',
)
```
5. 将ueditor添加到plugin下的_init_中
```python
class CourseAdmin(object):
    ...
    style_fields = {"detail": "ueditor"}
```
6. 报错
F:\course\myblog\myblogvenv\lib\site-packages\django\forms\boundfield.py in as_widget, line 93
```python
# renderer=self.form.renderer,
```

### 购物车的有关model
```python
from datetime import datetime

from django.db import models
from django.contrib.auth import get_user_model

from goods.models import Goods
User = get_user_model()
# Create your models here.


class ShoppingCart(models.Model):
    """
    购物车
    """
    user = models.ForeignKey(User, verbose_name=u"用户")
    goods = models.ForeignKey(Goods, verbose_name=u"商品")
    nums = models.IntegerField(default=0, verbose_name="购买数量")

    add_time = models.DateTimeField(default=datetime.now, verbose_name=u"添加时间")

    class Meta:
        verbose_name = '购物车'
        verbose_name_plural = verbose_name
        unique_together = ("user", "goods")

    def __str__(self):
        return "%s(%d)".format(self.goods.name, self.nums)


class OrderInfo(models.Model):
    """
    订单
    """
    ORDER_STATUS = (
        ("TRADE_SUCCESS", "成功"),
        ("TRADE_CLOSED", "超时关闭"),
        ("WAIT_BUYER_PAY", "交易创建"),
        ("TRADE_FINISHED", "交易结束"),
        ("paying", "待支付"),
    )

    user = models.ForeignKey(User, verbose_name="用户")
    order_sn = models.CharField(max_length=30, null=True, blank=True, unique=True, verbose_name="订单号")
    trade_no = models.CharField(max_length=100, unique=True, null=True, blank=True, verbose_name=u"交易号")
    pay_status = models.CharField(choices=ORDER_STATUS, default="paying", max_length=30, verbose_name="订单状态")
    post_script = models.CharField(max_length=200, verbose_name="订单留言")
    order_mount = models.FloatField(default=0.0, verbose_name="订单金额")
    pay_time = models.DateTimeField(null=True, blank=True, verbose_name="支付时间")

    # 用户信息
    address = models.CharField(max_length=100, default="", verbose_name="收货地址")
    signer_name = models.CharField(max_length=20, default="", verbose_name="签收人")
    singer_mobile = models.CharField(max_length=11, verbose_name="联系电话")

    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    class Meta:
        verbose_name = u"订单"
        verbose_name_plural = verbose_name

    def __str__(self):
        return str(self.order_sn)


class OrderGoods(models.Model):
    """
    订单的商品详情
    """
    order = models.ForeignKey(OrderInfo, verbose_name="订单信息", related_name="goods")
    goods = models.ForeignKey(Goods, verbose_name="商品")
    goods_num = models.IntegerField(default=0, verbose_name="商品数量")

    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    class Meta:
        verbose_name = "订单商品"
        verbose_name_plural = verbose_name

    def __str__(self):
        return str(self.order.order_sn)
```

### 外键级联删除
```python
	on_delete=None,               # 删除关联表中的数据时,当前表与其关联的field的行为
	on_delete=models.CASCADE,     # 删除关联数据,与之关联也删除
	on_delete=models.DO_NOTHING,  # 删除关联数据,什么也不做
	on_delete=models.PROTECT,     # 删除关联数据,引发错误ProtectedError
	# models.ForeignKey('关联表', on_delete=models.SET_NULL, blank=True, null=True)
	on_delete=models.SET_NULL,    # 删除关联数据,与之关联的值设置为null（前提FK字段需要设置为可空,一对一同理）
	# models.ForeignKey('关联表', on_delete=models.SET_DEFAULT, default='默认值')
	on_delete=models.SET_DEFAULT, # 删除关联数据,与之关联的值设置为默认值（前提FK字段需要设置默认值,一对一同理）
	on_delete=models.SET,         # 删除关联数据,
	 a. 与之关联的值设置为指定值,设置：models.SET(值)
	 b. 与之关联的值设置为可执行对象的返回值,设置：models.SET(可执行对象)
```
> django 升级到2.0之后,表与表之间关联的时候,必须要写on_delete参数,否则会报异常,由于多对多(ManyToManyField)没有 on_delete 参数,所以以上只针对外键(ForeignKey)和一对一(OneToOneField)

### 配置xamin
上一篇笔记里面有。
```python
pip install https://codeload.github.com/sshwsfc/xadmin/zip/django2 -i https://pypi.douban.com/simple/

pip install django-crispy-forms django-reversion django-formtools future httplib2 six -i https://pypi.doub
an.com/simple/

pip install xlwt xlsxwriter -i https://pypi.douban.com/simple/

INSTALLED_APPS = [
    ...
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'apps.users.apps.UsersConfig',
    'DjangoUeditor',
    'goods',
    'trade',
    'user_operation',
    'xadmin',
    'crispy_forms',
    'reversion',
    ...
]

# 修改使用中文界面
LANGUAGE_CODE = 'zh-Hans'

# 修改时区
TIME_ZONE = 'Asia/Shanghai'
```

**在总路由中添加xadmin的路由信息**
```python
import xadmin
xadmin.autodiscover()

# version模块自动注册需要版本控制的 Model
from xadmin.plugins import xversion
xversion.register_models()

urlpatterns = [
    path(r'xadmin/', xadmin.site.urls),
]
```

**错误1**
```python
# ImportError: cannot import name 'six'

# 解决方法
pip install six

# 然后找到 Lib\site-packages 下的six.py 复制到 django/utils下面
```

**错误2**
```python
# ImportError: cannot import name 'python_2_unicode_compatible'

from django.utils.encoding import force_text, python_2_unicode_compatible
# 改为
from django.utils.encoding import force_text
from django.utils.six import python_2_unicode_compatible

```

**错误3**
```python
# ModuleNotFoundError: No module named 'django.contrib.staticfiles.templatetags'

if 'django.contrib.staticfiles' in settings.INSTALLED_APPS:
    from django.contrib.staticfiles.templatetags.staticfiles import static
else:
    from django.templatetags.static import static

# 改为

# if 'django.contrib.staticfiles' in settings.INSTALLED_APPS:
#     from django.contrib.staticfiles.templatetags.staticfiles import static
# else:
from django.templatetags.static import static

# 问题解决
```

**错误4**
```python
# TypeError: render() got an unexpected keyword argument 'renderer'

# 跟随错误提示

        return widget.render(
            name=self.html_initial_name if only_initial else self.html_name,
            value=self.value(),
            attrs=attrs,
            renderer=self.form.renderer,
        )

# 改为

        return widget.render(
            name=self.html_initial_name if only_initial else self.html_name,
            value=self.value(),
            attrs=attrs,
            # renderer=self.form.renderer,
        )

# 问题解决
```

**可以在apps.py里面设置分组名称**
```python
from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'apps.users'
    verbose_name = "用户"
```

### 设置图片的存放位置
```python
MEDIA_URL = "/media/"

MEDIA_ROOT = os.path.join(BASE_DIR, "media")

from django.urls import path,include,re_path
from django.views.static import serve
from eduproject.settings import MEDIA_ROOT

urlpatterns = [
    # 处理 media 信息，用于图片获取
    re_path(r'^media/(?P<path>.*)', serve, {"document_root":MEDIA_ROOT}),
]
```

### 联合唯一记录
```python
class UserFav(models.Model):
    """
    用户收藏
    """
    user = models.ForeignKey(User, verbose_name="用户")
    goods = models.ForeignKey(Goods, verbose_name="商品", help_text="商品id")
    add_time = models.DateTimeField(default=datetime.now, verbose_name=u"添加时间")

    class Meta:
        verbose_name = '用户收藏'
        verbose_name_plural = verbose_name
        unique_together = ("user", "goods")

    def __str__(self):
        return self.user.username
```

## RESTful API 设计指南
[RESTful API 设计指南](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)

## 文档配置
```python
path('docs/', include_docs_urls(title='暮雪生鲜'))
    """
    收货地址管理
    list:
        获取收货地址
    create:
        添加收货地址
    update:
        更新收货地址
    delete:
        删除收货地址
    """
```

## Serializer的书写
### 基本的serializer
```python
from rest_framework import serializers
from snippets.models import Snippet, LANGUAGE_CHOICES, STYLE_CHOICES


class SnippetSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(required=False, allow_blank=True, max_length=100)
    code = serializers.CharField(style={'base_template': 'textarea.html'})
    linenos = serializers.BooleanField(required=False)
    language = serializers.ChoiceField(choices=LANGUAGE_CHOICES, default='python')
    style = serializers.ChoiceField(choices=STYLE_CHOICES, default='friendly')

    def create(self, validated_data):
        """
        Create and return a new `Snippet` instance, given the validated data.
        """
        return Snippet.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `Snippet` instance, given the validated data.
        """
        instance.title = validated_data.get('title', instance.title)
        instance.code = validated_data.get('code', instance.code)
        instance.linenos = validated_data.get('linenos', instance.linenos)
        instance.language = validated_data.get('language', instance.language)
        instance.style = validated_data.get('style', instance.style)
        instance.save()
        return instance
```

### 使用ModelSerializer
```python
class SnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snippet
        fields = ['id', 'title', 'code', 'linenos', 'language', 'style']
        
class GoodsSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    images = GoodsImageSerializer(many=True)
    class Meta:
        model = Goods
        fields = "__all__"
```
重要的是要记住，ModelSerializer类并没有做任何特别神奇的事情，它们只是创建序列化器类的捷径：
- 自动确定的一组字段。
- create()和update()方法的简单默认实现。

> Serializer里的数据都在self.initial_data里面。

### CurrentUserDefault在serliaser中获取当前用户
```python
class UserFavSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = UserFav
        # 唯一索引
        validators = [
            UniqueTogetherValidator(
                queryset=UserFav.objects.all(),
                fields=('user', 'goods'),
                message="已经收藏"
            )
        ]

        fields = ("user", "goods", "id")
```

### 自定义响应action的serliaser
```python
    # 重载get_serializer_class方法
    def get_serializer_class(self):
        if self.action == "retrieve":
            return UserDetailSerializer
        elif self.action == "create":
            return UserRegSerializer

        return UserDetailSerializer
```

### 添加购物车serliaser
```python
class ShopCartSerializer(serializers.Serializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    nums = serializers.IntegerField(required=True, label="数量",min_value=1,
                                    error_messages={
                                        "min_value":"商品数量不能小于一",
                                        "required": "请选择购买数量"
                                    })
    goods = serializers.PrimaryKeyRelatedField(required=True, queryset=Goods.objects.all())

    def create(self, validated_data):
        user = self.context["request"].user
        nums = validated_data["nums"]
        goods = validated_data["goods"]

        existed = ShoppingCart.objects.filter(user=user, goods=goods)

        if existed:
            existed = existed[0]
            existed.nums += nums
            existed.save()
        else:
            existed = ShoppingCart.objects.create(**validated_data)

        return existed

    def update(self, instance, validated_data):
        #修改商品数量
        instance.nums = validated_data["nums"]
        instance.save()
        return instance
```

## views的书写
```python
INSTALLED_APPS = [
    ...
    'rest_framework',
]

path('api-auth/', include('rest_framework.urls')),
```
### APIView书写view
```python
from snippets.models import Snippet
from snippets.serializers import SnippetSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class SnippetList(APIView):
    """
    List all snippets, or create a new snippet.
    """
    def get(self, request, format=None):
        snippets = Snippet.objects.all()
        serializer = SnippetSerializer(snippets, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = SnippetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

> 多个对象要加many=True

### 使用mixins
```python
from snippets.models import Snippet
from snippets.serializers import SnippetSerializer
from rest_framework import mixins
from rest_framework import generics

class SnippetList(mixins.ListModelMixin,
                  mixins.CreateModelMixin,
                  generics.GenericAPIView):
    queryset = Snippet.objects.all()
    serializer_class = SnippetSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
```

### 使用基于通用类的视图
```python
from snippets.models import Snippet
from snippets.serializers import SnippetSerializer
from rest_framework import generics


class SnippetList(generics.ListCreateAPIView):
    queryset = Snippet.objects.all()
    serializer_class = SnippetSerializer


class SnippetDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Snippet.objects.all()
    serializer_class = SnippetSerializer
```

> generics.ListCreateAPIView = mixins.ListModelMixin+
                  generics.GenericAPIView
                  

### 使用viewset + router
```pyhon
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'categorys', CategoryViewset, base_name="categorys")

class CategoryViewset(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    list:
        商品分类列表数据
    retrieve:
        获取商品分类详情
    """
    queryset = GoodsCategory.objects.filter(category_type=1)
    serializer_class = CategorySerializer
```
> GenericViewSet  继承自GenericAPIView与ViewSetMixin，在实现了调用as_view()时传入字典（如{'get':'list'}）的映射处理工作的同时，还提供了GenericAPIView提供的基础方法，可以直接搭配Mixin扩展类使用。

### 分页
**全局配置**
```python
setting.py

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100
}
```

**定制分页**
```python
class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 10000

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000
    
    
class BillingRecordsView(generics.ListAPIView):
    queryset = Billing.objects.all()
    serializer_class = BillingRecordsSerializer
    pagination_class = LargeResultsSetPagination
```

### drf的过滤
**过滤必须完全等于，但是不能搜索区间**
```python
INSTALLED_APPS = [
    ...
    'django_filters',
    ...
]

from django_filters.rest_framework import DjangoFilterBackend

class UserListView(generics.ListAPIView):
    ...
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'in_stock']
```

**自定义filter.py**
```python
filter.py
from rest_framework import generics
from django_filters import rest_framework as filters
from myapp import Product


class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = filters.NumberFilter(field_name="price", lookup_expr='lte')
        top_category = django_filters.NumberFilter(method='top_category_filter')


    def top_category_filter(self, queryset, name, value):
        return queryset.filter(Q(category_id=value)|Q(category__parent_category_id=value)|Q(category__parent_category__parent_category_id=value))
        
    class Meta:
        model = Product
        fields = ['category', 'in_stock', 'min_price', 'max_price']
        
view.py
class ProductList(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProductFilter
```

[django-filter 文档](https://django-filter.readthedocs.io/en/master/#django-filter)

### drf的搜索（drf自带的）
**该SearchFilter级支持简单单的查询参数基于搜索和基于该admin界面的搜索功能。**
```python
from rest_framework import filters

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']
    search_fields = ['=username', '=email']
```
- '^'开始搜索。
- '='完全匹配。
- '@'全文搜索。（当前仅支持Django的PostgreSQL后端。）
- '$'正则表达式搜索。

### drf的排序
**本OrderingFilter类支持的结果简单的查询参数进行控制顺序。**
```python
http://example.com/api/users?ordering=username
http://example.com/api/users?ordering=-username
http://example.com/api/users?ordering=account,username

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['username', 'email']
```
![image](../youdaonote-images/1A2870C6B672407E9F0ECF53A71F96E3.png)

### lookup_field retrieve查询
**lookup_field 默认为pk查询，就是 xxx/good/id， id默认是pk**
现在可以重新设置，设置为某个字段的id，而不是该表的id
```python
lookup_field = "goods_id"
```

### 跨域问题
```python
pip install django-cors-headers


INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE  = [   ＃或Django <1.10上的MIDDLEWARE_CLASSES 
    ... 
    ' corsheaders.middleware.CorsMiddleware '，# 要放在高位，最好放第一个。
     ' django.middleware.common.CommonMiddleware '，
     ... 
]

CORS_ORIGIN_ALLOW_ALL = true
```

### 生成订单的viewset
```python
class OrderSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    pay_status = serializers.CharField(read_only=True)
    trade_no = serializers.CharField(read_only=True)
    order_sn = serializers.CharField(read_only=True)
    pay_time = serializers.DateTimeField(read_only=True)
    alipay_url = serializers.SerializerMethodField(read_only=True)

    def get_alipay_url(self, obj):
        alipay = AliPay(
            appid="",
            app_notify_url="http://127.0.0.1:8000/alipay/return/",
            app_private_key_path=private_key_path,
            alipay_public_key_path=ali_pub_key_path,  # 支付宝的公钥，验证支付宝回传消息使用，不是你自己的公钥,
            debug=True,  # 默认False,
            return_url="http://127.0.0.1:8000/alipay/return/"
        )

        url = alipay.direct_pay(
            subject=obj.order_sn,
            out_trade_no=obj.order_sn,
            total_amount=obj.order_mount,
        )
        re_url = "https://openapi.alipaydev.com/gateway.do?{data}".format(data=url)

        return re_url


    def generate_order_sn(self):
        # 当前时间+userid+随机数
        from random import Random
        random_ins = Random()
        order_sn = "{time_str}{userid}{ranstr}".format(time_str=time.strftime("%Y%m%d%H%M%S"),
                                                       userid=self.context["request"].user.id, ranstr=random_ins.randint(10, 99))

        return order_sn

    def validate(self, attrs):
        attrs["order_sn"] = self.generate_order_sn()
        return attrs

    class Meta:
        model = OrderInfo
        fields = "__all__"
        
class OrderViewset(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """
    订单管理
    list:
        获取个人订单
    delete:
        删除订单
    create：
        新增订单
    """
    permission_classes = (IsAuthenticated, IsOwnerOrReadOnly)
    authentication_classes = (JSONWebTokenAuthentication, SessionAuthentication)
    serializer_class = OrderSerializer

    def get_queryset(self):
        return OrderInfo.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrderDetailSerializer
        return OrderSerializer
            
    def perform_create(self, serializer):
        order = serializer.save()
        shop_carts = ShoppingCart.objects.filter(user=self.request.user)
        for shop_cart in shop_carts:
            order_goods = OrderGoods()
            order_goods.goods = shop_cart.goods
            order_goods.goods_num = shop_cart.nums
            order_goods.order = order
            order_goods.save()

            shop_cart.delete()
        return order
```


## drf的登录
### Authentication
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ]
}
```
### TokenAuthentication
```python
INSTALLED_APPS = [
    ...
    'rest_framework.authtoken'
]
```
**请确保manage.py migrate在更改设置后运行。该rest_framework.authtoken应用程序提供Django数据库迁移。**

还需要为用户创建令牌。
```python
from rest_framework.authtoken.models import Token

token = Token.objects.create(user=...)
print(token.key)
```
**设置登录返回token的url**
```python
from rest_framework.authtoken import views
urlpatterns += [
    url(r'^api-token-auth/', views.obtain_auth_token)
]
```
**令牌密钥应包含在AuthorizationHTTP标头中。密钥应以字符串文字“ Token”作为前缀，并用空格分隔两个字符串。**
```python
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```
> 缺点是token永久储存，不会过期。同时都存在一个数据库，不能在分布式的数据库。

**之前是全局配置，现在光是viewset的配置**
```python
authentication_classes = (TokenAuthentication, )
```

### JWT用户认证
[前后端分离之JWT用户认证](https://www.jianshu.com/p/180a870a308a)
```python
pip install djangorestframework-jwt -i https://pypi.douban.com/simple/
```
在settings.py文件中，将JSONWebTokenAuthentication 添加到REST framework框架的DEFAULT_AUTHENTICATION_CLASSES.
```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
```
　　同样，你还可以使用基于APIView类的视图，在每个视图或每个视图集的基础上设置身份验证方案。与 Token 认证一样，尽可能使用基于APIView类的视图认证方式。

但使用基于APIView类的视图认证方式时，不要忘记导入类。
```python
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
```
在你的urls.py文件中添加以下URL路由，以便通过POST包含用户名和密码的令牌获取。
```python
from rest_framework_jwt.views import obtain_jwt_token
urlpatterns += [
    url(r'^api-token-auth/', obtain_jwt_token)
]
```
**访问需要登陆认证后才能访问的url时，在请求头（Header）中添加 Authorization:JWT <your_token>  （Authorization 为 name，JWT <your_token> 为 value）；登陆认证成功后，自动返回给前端一个 Token**
在setting.py中设置一些信息。
```python
JWT_AUTH = {
    'JWT_ENCODE_HANDLER':
    'rest_framework_jwt.utils.jwt_encode_handler',
 
    'JWT_DECODE_HANDLER':
    'rest_framework_jwt.utils.jwt_decode_handler',
 
    'JWT_PAYLOAD_HANDLER':
    'rest_framework_jwt.utils.jwt_payload_handler',
 
    'JWT_PAYLOAD_GET_USER_ID_HANDLER':
    'rest_framework_jwt.utils.jwt_get_user_id_from_payload_handler',
 
    'JWT_RESPONSE_PAYLOAD_HANDLER':
    'rest_framework_jwt.utils.jwt_response_payload_handler',
    
    // 这是用于签署JWT的密钥，确保这是安全的，不共享不公开的
    'JWT_SECRET_KEY': settings.SECRET_KEY,
    'JWT_GET_USER_SECRET_KEY': None,
    'JWT_PUBLIC_KEY': None,
    'JWT_PRIVATE_KEY': None,
    'JWT_ALGORITHM': 'HS256',
    // 如果秘钥是错误的，它会引发一个jwt.DecodeError
    'JWT_VERIFY': True,
    'JWT_VERIFY_EXPIRATION': True,
    'JWT_LEEWAY': 0,
    // Token过期时间设置
    'JWT_EXPIRATION_DELTA': datetime.timedelta(seconds=300),
    'JWT_AUDIENCE': None,
    'JWT_ISSUER': None,
    
    // 是否开启允许Token刷新服务，及限制Token刷新间隔时间，从原始Token获取开始计算
    'JWT_ALLOW_REFRESH': False,
    'JWT_REFRESH_EXPIRATION_DELTA': datetime.timedelta(days=7),
 
    // 定义与令牌一起发送的Authorization标头值前缀
    'JWT_AUTH_HEADER_PREFIX': 'JWT',
    'JWT_AUTH_COOKIE': None,
```

### 用户自定义手机号和邮箱同时验证
```python
User = get_user_model()


class CustomBackend(ModelBackend):
    """
    自定义用户验证
    """
    def authenticate(self, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(Q(username=username)|Q(mobile=username))
            if user.check_password(password):
                return user
        except Exception as e:
            return None
```

### 手机验证码注册功能（云片网）
新增签名
```python
import json
import requests


class YunPian(object):

    def __init__(self, api_key):
        self.api_key = api_key
        self.single_send_url = "https://sms.yunpian.com/v2/sms/single_send.json"

    def send_sms(self, code, mobile):
        parmas = {
            "apikey": self.api_key,
            "mobile": mobile,
            "text": "【慕学生鲜】您的验证码是{code}。如非本人操作，请忽略本短信".format(code=code)
        }

        response = requests.post(self.single_send_url, data=parmas)
        re_dict = json.loads(response.text)
        return re_dict


if __name__ == "__main__":
    yun_pian = YunPian("")
    yun_pian.send_sms("2017", "")
```
短信验证码models
```python
class VerifyCode(models.Model):
    """
    短信验证码
    """
    code = models.CharField(max_length=10, verbose_name="验证码")
    mobile = models.CharField(max_length=11, verbose_name="电话")
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    class Meta:
        verbose_name = "短信验证码"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.code

```
viewset
```python
class SmsCodeViewset(CreateModelMixin, viewsets.GenericViewSet):
    """
    发送短信验证码
    """
    serializer_class = SmsSerializer

    def generate_code(self):
        """
        生成四位数字的验证码
        :return:
        """
        seeds = "1234567890"
        random_str = []
        for i in range(4):
            random_str.append(choice(seeds))

        return "".join(random_str)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mobile = serializer.validated_data["mobile"]

        yun_pian = YunPian(APIKEY)

        code = self.generate_code()

        sms_status = yun_pian.send_sms(code=code, mobile=mobile)

        if sms_status["code"] != 0:
            return Response({
                "mobile":sms_status["msg"]
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            code_record = VerifyCode(code=code, mobile=mobile)
            code_record.save()
            return Response({
                "mobile":mobile
            }, status=status.HTTP_201_CREATED)
```
serliazer
```python
class SmsSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=11)

    # 重载validate方法
    def validate_mobile(self, mobile):
        """
        验证手机号码
        :param data:
        :return:
        """

        # 手机是否注册
        if User.objects.filter(mobile=mobile).count():
            raise serializers.ValidationError("用户已经存在")

        # 验证手机号码是否合法
        if not re.match(REGEX_MOBILE, mobile):
            raise serializers.ValidationError("手机号码非法")

        # 验证码发送频率
        one_mintes_ago = datetime.now() - timedelta(hours=0, minutes=1, seconds=0)
        if VerifyCode.objects.filter(add_time__gt=one_mintes_ago, mobile=mobile).count():
            raise serializers.ValidationError("距离上一次发送未超过60s")

        return mobile

# 手机号码正则表达式
REGEX_MOBILE = "^1[358]\d{9}$|^147\d{8}$|^176\d{8}$"
```

### 注册功能详细
serliazer
```python
class UserRegSerializer(serializers.ModelSerializer):
    # write_only 导致其不会序列化
    code = serializers.CharField(required=True, write_only=True, max_length=4, min_length=4,label="验证码",
                                 error_messages={
                                     "blank": "请输入验证码",
                                     "required": "请输入验证码",
                                     "max_length": "验证码格式错误",
                                     "min_length": "验证码格式错误"
                                 },
                                 help_text="验证码")
    # 使用了drf自带的validator来验证用户名是否存在  
    username = serializers.CharField(label="用户名", help_text="用户名", required=True, allow_blank=False,
                                     validators=[UniqueValidator(queryset=User.objects.all(), message="用户已经存在")])

    password = serializers.CharField(
        style={'input_type': 'password'},help_text="密码", label="密码", write_only=True,
    )

    def validate_code(self, code):
        verify_records = VerifyCode.objects.filter(mobile=self.initial_data["username"]).order_by("-add_time")
        if verify_records:
            last_record = verify_records[0]

            five_mintes_ago = datetime.now() - timedelta(hours=0, minutes=5, seconds=0)
            if five_mintes_ago > last_record.add_time:
                raise serializers.ValidationError("验证码过期")

            if last_record.code != code:
                raise serializers.ValidationError("验证码错误")

        else:
            raise serializers.ValidationError("验证码错误")

    def validate(self, attrs):
        attrs["mobile"] = attrs["username"] # 将手机号存为username和mobile
        del attrs["code"]
        return attrs

    class Meta:
        model = User
        fields = ("username", "code", "mobile", "password")

```
viewset
```python
class UserViewset(CreateModelMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    用户
    """
    serializer_class = UserRegSerializer
    queryset = User.objects.all()
    authentication_classes = (JSONWebTokenAuthentication, authentication.SessionAuthentication )

    def get_serializer_class(self):
        if self.action == "retrieve": 
            return UserDetailSerializer
        elif self.action == "create":
            return UserRegSerializer

        return UserDetailSerializer

    # permission_classes = (permissions.IsAuthenticated, )
    def get_permissions(self):
        if self.action == "retrieve":
            return [permissions.IsAuthenticated()]
        elif self.action == "create":
            return []

        return []
    
    # 创建成功后返回token
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)

        re_dict = serializer.data
        payload = jwt_payload_handler(user)
        re_dict["token"] = jwt_encode_handler(payload)
        re_dict["name"] = user.name if user.name else user.username

        headers = self.get_success_headers(serializer.data)
        return Response(re_dict, status=status.HTTP_201_CREATED, headers=headers)

    def get_object(self):
        return self.request.user

    def perform_create(self, serializer):
        return serializer.save()
```

### django信号量
**当某个事件完成时会生成一个信号量，可以被全局捕获**
下面是创建用户，将用户的密码加密的信号量运用
signals.py
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def create_user(sender, instance=None, created=False, **kwargs):
    if created:
        password = instance.password
        instance.set_password(password)
        instance.save()
```
app.py
```python
class UsersConfig(AppConfig):
    name = 'users'
    verbose_name = "用户管理"

    def ready(self):
        import users.signals
```

## drf的权限验证
### IsAuthenticated
**该IsAuthenticated许可类将拒绝允许任何未认证用户，并允许许可，否则。
如果您只想让注册用户访问您的API，则此权限很合适。**
```python
from rest_framework.permissions import IsAuthenticated

permission_classes = (IsAuthenticated, IsOwnerOrReadOnly)
```

### 自定义权限
**对象级权限，仅允许对象的所有者对其进行编辑。
假设模型实例有一个“owner”属性。**
```python
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `owner`.
        return obj.user == request.user
```

### 自定义响应方法的权限
```python
    # 在viewset里面重载permissions
    def get_permissions(self):
        if self.action == "retrieve":
            return [permissions.IsAuthenticated()]
        elif self.action == "create":
            return []

        return []
```
## channels-api websocket

https://www.jianshu.com/p/3de90e457bb4
https://github.com/linuxlewis/channels-api#getting-started
https://channels.readthedocs.io/en/latest/index.html
https://www.oschina.net/translate/in_deep_with_django_channels_the_future_of_real_time_apps_in_django
https://www.cnblogs.com/ITdong-1/articles/10140286.html

## drf 的缓存设置
```python
pip install drf-extensions

# 使用
from myapps.serializers import UserSerializer
from rest_framework_extensions.cache.mixins import CacheResponseMixin

class UserViewSet(CacheResponseMixin, viewsets.ModelViewSet):
    serializer_class = UserSerializer
    
# 设置过期时间
REST_FRAMEWORK_EXTENSIONS = {
    'DEFAULT_CACHE_RESPONSE_TIMEOUT': 60 * 15
}
```
### django-redis
```python
pip install django-redis

# setting.py
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
# url举例子
redis://[:password]@localhost:6379/0
rediss://[:password]@localhost:6379/0
unix://[:password]@/path/to/socket.sock?db=0
```


## 限制访问速率
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}
```