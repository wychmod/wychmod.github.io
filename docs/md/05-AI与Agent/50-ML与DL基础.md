# ML 与 DL 基础

> **原文归档**：[`archive/old-ml-dl-notes/`](../../archive/old-ml-dl-notes/)
> 包含：根目录视觉模型 5 篇 + 1 PDF + 笔记 1 篇

---

## 一、视觉与 CNN 模型

### 1.1 目标检测模型一览

> 📚 [AI人工智能-目标检测模型一览.md](../../archive/old-ml-dl-notes/AI人工智能-目标检测模型一览.md)（14KB）

**目标检测主流模型**：

| 模型 | 年份 | 特点 |
|---|---|---|
| R-CNN | 2014 | 两阶段，开山之作 |
| Fast R-CNN | 2015 | 共享卷积特征 |
| Faster R-CNN | 2015 | RPN 网络，端到端 |
| YOLO v1-v3 | 2015-2018 | 单阶段，实时 |
| SSD | 2016 | 多尺度特征图 |
| YOLO v4-v5 | 2020-2021 | 工程化、易用 |
| DETR | 2020 | Transformer 检测 |
| YOLOv8 | 2023 | Ultralytics 出品，最主流 |
| RT-DETR | 2023 | 实时 DETR |

### 1.2 YOLOv5 核心知识

> 📚 [Yolov5核心基础知识.md](../../archive/old-ml-dl-notes/Yolov5核心基础知识.md)（885B 入门）

- 数据集格式（YOLO txt 标注）
- 模型结构：Backbone + Neck + Head
- 训练流程：数据增强 → 训练 → 验证 → 推理
- 部署：ONNX / TensorRT / OpenVINO

### 1.3 Conv1D（一维卷积）

> 📚 [一维卷积神经网络Conv1D.md](../../archive/old-ml-dl-notes/一维卷积神经网络Conv1D.md)（4KB）

**Conv1D 应用**：
- 文本 / 序列数据
- 语音信号处理
- 时间序列预测
- 与 Conv2D 不同：只在 1 个维度上滑动

### 1.4 Batch Normalization

> 📚 [批标准化 (Batch Normalization).md](../../archive/old-ml-dl-notes/批标准化%20(Batch%20Normalization).md)（3KB）

**为什么需要 BN**：
- 解决内部协变量偏移（Internal Covariate Shift）
- 加速训练（可用大学习率）
- 轻微正则化效果

**BN 公式**：
```
x̂ = (x - μ_batch) / √(σ²_batch + ε)
y = γ * x̂ + β
```

### 1.5 论文阅读笔记

> 📚 [论文阅读笔记-吴恩达ecg论文.md](../../archive/old-ml-dl-notes/论文阅读笔记-吴恩达ecg论文.md)（5KB）

吴恩达团队 ECG（心电图）异常检测论文。

### 1.6 深度学习报错解决方案

> 📚 [深度学习报错解决方案.md](../../archive/old-ml-dl-notes/深度学习报错解决方案.md)（4KB）

常见报错：
- CUDA out of memory → 减小 batch size
- NaN loss → 减小学习率 / 梯度裁剪
- shape mismatch → 检查数据维度
- 维度不匹配 → 用 print 调试

### 1.7 LBP 特征（传统 CV）

> 📚 [LBP特征及其变体和python实现.pdf](../../archive/old-ml-dl-notes/LBP特征及其变体和python实现.pdf)（596KB PDF，已归档）

LBP（Local Binary Pattern）= 传统 CV 特征工程，深度学习普及后已少用。

---

## 二、2026 年 ML/DL 入门建议

> ⚠️ 原笔记是 2018-2020 风格，传统 ML + 深度学习基础。在 LLM 时代，**学习路径需要调整**

### 2.1 现在的正确学习路径

```
1. Python + NumPy + Pandas（1 周）
   ↓
2. 机器学习基础（sklearn）（1-2 周）
   - 监督/无监督/强化
   - 经典模型：线性/树/SVM
   ↓
3. 深度学习基础（2-3 周）
   - MLP / CNN / RNN
   - PyTorch（取代 TF/Keras）
   ↓
4. Transformer + LLM（2-3 周）
   - Attention
   - 预训练 + 微调（QLoRA）
   ↓
5. 实战（持续）
   - LLM API + RAG + Agent
   - 选一个方向深耕
```

### 2.2 工具选型

| 旧 | 新 |
|---|---|
| TensorFlow 1.x | **PyTorch**（主流）|
| TensorFlow 2.x + Keras | PyTorch + Lightning |
| 自训 BERT | 调 LLM API |
| word2vec | 预训练 Embedding |
| OpenCV + 传统 CV | **YOLOv8** / 预训练视觉模型 |

---

## 📚 完整资料

- [`archive/old-ml-dl-notes/`](../../archive/old-ml-dl-notes/) — 完整 ML/DL 笔记归档
  - 根目录 5 篇（目标检测/YOLOv5/Conv1D/BN/论文）
  - 1 个 PDF（LBP）
  - 1 篇（深度学习报错）
