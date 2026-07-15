# 在线网络可视化工具 Netron

**可以清晰的看到每一层的输入输出，网络总体的架构，而且支持各种不同网络框架。**

**（1）支持的框架及对应的文件**

![](../youdaonote-images/Pasted%20image%2020221025111030.png)

**（2）实验式支持，可能不太稳定**

![](../youdaonote-images/Pasted%20image%2020221025111129.png)

# 1 Yolov5 四种网络模型

Yolov5官方代码中，给出的目标检测网络中一共有4个版本，分别是**Yolov5s、Yolov5m、Yolov5l、Yolov5x**四个模型。  

学习一个新的算法，最好在脑海中对**算法网络的整体架构**有一个清晰的理解。

先使用Yolov5代码中**models/export.py**脚本将**pt文件**转换为**onnx格式**，再用**netron工具**打开，这样就可以看全网络的整体架构了。

## 1.1 Yolov5网络结构图

