
## 1、用conda创建Python虚拟环境（在conda prompt环境下完成）
```
conda create -n environment_name python=X.X
```
(注：该命令只适用于Windows环境；“environment_name”是要创建的环境名；“python=X.X”是选择的Python版本)

## 2、激活虚拟环境（在conda prompt环境下完成）
```
conda activate your_env_name
```
Windows: activate your_env_name(虚拟环境名称)

## 3、给虚拟环境安装外部包\
```
conda install -n your_env_name [package]

pip install
```
例如: conda install -n tensorflow pandas

## 4、查看已有的环境(当前已激活的环境会显示一个星号)
```
conda info -e
```

## 5、删除一个已有的虚拟环境
```
conda remove --name your_env_name --all
```
## 6、查看pip的安装目录
```
pip list
```

## 7、删除已经安装的模块
```
pip uninstall **
```
(例如：pip uninstall numpy)
