# 🎬 Cognimotion

[![Python Version](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active-success.svg)](README.md)

> **Cognimotion** —— 一个语义驱动的动画引擎，将静态幻灯片转化为可编程的 SVG/Canvas 动画视频。

---

## 📖 项目简介

Cognimotion 是一款基于 **Python 自动化** 的动画生成工具，能够根据 PPT/幻灯片中的内容（包括文字、图形、数据等）智能生成语义驱动的动画，并最终输出为高质量的 **MP4/GIF/WEB** 视频。

通过融合 **OCR 文字提取**、**NLP 语义分析** 与 **SVG/Canvas 动画技术**，Cognimotion 实现了从静态内容到动态视频的全自动化转换，让演示文稿焕发新生。

---

## ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 🧠 **语义驱动** | 通过 NLP 分析文本内容，自动识别标题、段落、数据、图表，并为每种内容类型匹配最佳动画效果 |
| 🎨 **矢量动画** | 基于 SVG 标准生成矢量动画，无限缩放不失真，适合各种分辨率输出 |
| ⚡ **高性能渲染** | 支持 Canvas 像素级渲染，轻松应对复杂粒子效果和动态数据可视化 |
| 🔄 **全自动化** | 从内容提取 → 语义分析 → 动画生成 → 视频导出，全程无需人工干预 |
| 🆓 **完全免费** | 基于开源技术栈，无任何付费依赖 |
| 🎯 **高自由度** | 支持自定义动画规则，可编程控制动画时间线，满足个性化需求 |

---

## 🏗️ 技术架构

```
PPT 图片/矢量素材
        ↓   (OCR 文字提取)
Semantic Parser (NLP 语义分析)
        ↓   (规则映射)
Animation Script Generator (SVG / Canvas 动画脚本)
        ↓   (浏览器渲染)
Animation Renderer (Headless 浏览器 / Canvas 录制)
        ↓   (FFmpeg 编码)
Video Exporter (MP4/GIF/WEBM)
        ↓
输出视频文件
```

### 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **核心语言** | Python 3.12+ |
| **PDF处理** | PyMuPDF (fitz) |
| **图形动画** | SVG (svgwrite), Canvas (HTML5) |
| **文字识别** | Tesseract OCR |
| **语义分析** | NLTK / spaCy / OpenAI GPT |
| **视频处理** | FFmpeg, MoviePy, imageio |
| **浏览器渲染** | Playwright |
| **前端动画** | anime.js, CSS3 |
| **环境管理** | uv |

---

## 🚀 快速开始

### 1. 环境要求

- Python 3.8 或更高版本
- FFmpeg (用于视频编码)
- Tesseract OCR 引擎

### 2. 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourusername/Cognimotion.git
cd Cognimotion

# 创建虚拟环境 (推荐)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安装 Python 依赖
pip install -r requirements.txt
```

### 3. 安装系统依赖

#### Windows

- 下载并安装 [Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
- 下载并安装 [FFmpeg](https://ffmpeg.org/download.html)

#### macOS

```bash
brew install tesseract ffmpeg
```

#### Linux (Ubuntu)

```bash
sudo apt-get install tesseract-ocr ffmpeg
```

### 4. 运行示例

```python
from cognimotion import Cognimotion

# 初始化引擎
engine = Cognimotion(
    input_file="slides.png",
    output_format="mp4",
    fps=30
)

# 设置动画规则
engine.add_rule("title", "fade-in", duration=1.0)
engine.add_rule("data", "number-count", duration=2.0)
engine.add_rule("chart", "bar-grow", duration=1.5)

# 执行转换
engine.generate("output/presentation.mp4")
```

---

## 🎬 Glassmorphism 动画演示

本项目包含一个完整的 **Glassmorphism PDF 动画演示** 功能，可以将 PDF 幻灯片转换为带有精美动画效果的网页和视频。

### 功能特性

- **毛玻璃风格** - 使用 Glassmorphism 设计语言
- **多种动画效果** - 淡入、缩放、滑入、旋转等
- **双模式交互** - 支持自动播放和点击触发
- **视频导出** - 可导出为 MP4 格式

### 快速开始

```bash
# 使用 uv 管理环境
uv sync

# 启动本地服务器预览
# 直接在浏览器中打开 web/index.html
```

### 转换 PDF 为图片

```bash
python pdf/pdf_to_images.py
```

### 录制视频

```bash
python record_video.py
```

### 动画网页文件

```
web/
├── index.html      # 主页面
├── style.css       # Glassmorphism 样式
└── animation.js   # 动画逻辑
```

### 输出文件

```
output/
└── presentation.mp4   # 导出的演示视频
```

---

## 📂 项目结构

```
Cognimotion/
├── cognimotion/           # 核心包 (规划中)
│   ├── __init__.py
│   ├── extractor.py       # 内容提取 (OCR)
│   ├── parser.py          # 语义分析 (NLP)
│   ├── animator.py        # 动画生成器
│   ├── renderer.py        # 渲染引擎
│   └── exporter.py        # 视频导出
├── pdf/                   # PDF 处理
│   ├── pdf_to_images.py   # PDF 转图片脚本
│   └── images/            # 转换后的图片
├── web/                   # 动画网页
│   ├── index.html
│   ├── style.css
│   └── animation.js
├── output/                # 输出视频
├── tests/                 # 测试文件
├── pyproject.toml         # uv 配置
└── README.md
```

---

## 💡 使用示例

### 示例 1：基础转换

```python
from cognimotion import Cognimotion

engine = Cognimotion(
    input_file="presentation/slide1.png",
    output_format="mp4",
    fps=24,
    resolution=(1920, 1080)
)

engine.generate("output/slide1_animated.mp4")
```

### 示例 2：自定义动画规则

```python
# 定义标题动画：淡入 + 上浮
engine.add_rule("title", animation="fade-in-up", duration=1.0, delay=0.2)

# 定义数据动画：数字递增
engine.add_rule("data", animation="number-counter", duration=2.0)

# 定义图表动画：柱状图生长
engine.add_rule("chart", animation="bar-grow", duration=1.5, easing="ease-out")

# 生成视频
engine.generate("output/custom_anim.mp4")
```

### 示例 3：批量处理

```python
from cognimotion import BatchProcessor

processor = BatchProcessor(
    input_dir="slides/",
    output_dir="videos/",
    output_format="mp4"
)

processor.process_all()
```

---

## 📜 动画规则说明

Cognimotion 支持通过配置文件定义动画规则。以下是默认规则示例：

```json
{
  "title": {
    "animation": "fade-in",
    "duration": 1.0,
    "easing": "ease-out"
  },
  "paragraph": {
    "animation": "fade-in-left",
    "duration": 0.8,
    "stagger": 0.1
  },
  "data": {
    "animation": "number-counter",
    "duration": 2.0,
    "easing": "ease-in-out"
  },
  "chart": {
    "animation": "bar-grow",
    "duration": 1.5,
    "direction": "bottom-to-top"
  },
  "image": {
    "animation": "scale-in",
    "duration": 0.8,
    "easing": "elastic"
  }
}
```

### 🎬 支持的动画类型

| 类型 | 描述 |
|------|------|
| `fade-in` | 淡入效果 |
| `fade-in-up` | 淡入并上浮 |
| `fade-in-left` | 淡入从左滑入 |
| `slide-in` | 滑入效果 |
| `scale-in` | 缩放进入 |
| `number-counter` | 数字递增 |
| `bar-grow` | 柱状图生长 |
| `pie-fill` | 饼图填充 |
| `line-draw` | 线条绘制 |
| `typewriter` | 打字机效果 |

---

## 🎯 应用场景

| 场景 | 说明 |
|------|------|
| 📚 **在线教育** | 将课程 PPT 自动转化为带动画的教学视频 |
| 📊 **商业演示** | 自动生成动效化的产品演示或业务报告视频 |
| 📰 **新闻资讯** | 将图文内容转化为动态新闻短视频 |
| 📈 **数据可视化** | 动态展示数据图表和研究数据 |
| 🎤 **演讲辅助** | 为演讲者生成带有动画的辅助视频素材 |

---

## ⚙️ 配置选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `input_file` | str | required | 输入文件路径 |
| `output_format` | str | "mp4" | 输出格式 (mp4/gif/webm) |
| `fps` | int | 24 | 帧率 |
| `resolution` | tuple | (1920, 1080) | 视频分辨率 |
| `quality` | str | "high" | 视频质量 (low/medium/high) |
| `duration` | float | auto | 动画总时长 |
| `theme` | str | "default" | 视觉主题 |

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

感谢以下开源项目提供的技术支持：

- [svgwrite](https://github.com/mozman/svgwrite) - Python SVG 生成
- [MoviePy](https://zulko.github.io/moviepy/) - 视频处理
- [Puppeteer](https://puppeteer.sh/) - 浏览器自动化
- [anime.js](https://animejs.com/) - JavaScript 动画引擎
- [Tesseract](https://github.com/tesseract-ocr/tesseract) - OCR 文字识别

---

## 📧 联系与支持

- 📌 问题反馈：https://github.com/yourusername/Cognimotion/issues
- 💬 讨论交流：https://github.com/yourusername/Cognimotion/discussions
- 📧 邮箱：support@cognimotion.dev

---

<div align="center">

**让静态内容动起来** 🚀

*Built with ❤️ by ＠阿鹤Ｑｕａｎｔ*

</div>

---

## 2026-02-17 Update

- Updated `web/animation.js` to load element metadata from `web/elements.json` (same directory as `index.html`).
- This removes cross-directory dependency on `../pdf/elements.json` and makes local preview/deployment simpler.
