"""
元素提取器 - 从图片中提取文字、图形、图片区域
用于 Cognimotion 动画引擎
"""
import cv2
import numpy as np
import easyocr
from PIL import Image
from pathlib import Path
import json
from typing import List, Dict, Tuple, Optional


class Element:
    """元素基类"""
    def __init__(self, bbox: Tuple[int, int, int, int], element_type: str):
        self.bbox = bbox  # (x1, y1, x2, y2)
        self.type = element_type
        self.x1, self.y1, self.x2, self.y2 = bbox
        self.width = self.x2 - self.x1
        self.height = self.y2 - self.y1
        self.center_x = (self.x1 + self.x2) // 2
        self.center_y = (self.y1 + self.y2) // 2
    
    def to_dict(self) -> dict:
        return {
            'type': self.type,
            'bbox': self.bbox,
            'width': self.width,
            'height': self.height,
            'center': (self.center_x, self.center_y)
        }


class TextElement(Element):
    """文字元素"""
    def __init__(self, bbox: Tuple[int, int, int, int], text: str, confidence: float = 1.0):
        super().__init__(bbox, 'text')
        self.text = text
        self.confidence = confidence
        # 估计文字行数
        self.lines = len(text.split('\n'))
    
    def to_dict(self) -> dict:
        data = super().to_dict()
        data['text'] = self.text
        data['confidence'] = self.confidence
        data['lines'] = self.lines
        return data


class ImageElement(Element):
    """图片元素"""
    def __init__(self, bbox: Tuple[int, int, int, int], image_data: Optional[np.ndarray] = None):
        super().__init__(bbox, 'image')
        self.image_data = image_data
    
    def to_dict(self) -> dict:
        data = super().to_dict()
        return data


class ShapeElement(Element):
    """形状元素"""
    def __init__(self, bbox: Tuple[int, int, int, int], shape_type: str = 'rectangle'):
        super().__init__(bbox, 'shape')
        self.shape_type = shape_type
    
    def to_dict(self) -> dict:
        data = super().to_dict()
        data['shape_type'] = self.shape_type
        return data


class ElementExtractor:
    """元素提取器"""
    
    def __init__(self, languages=['ch_sim', 'en']):
        """初始化提取器"""
        print("Initializing OCR reader...")
        self.reader = easyocr.Reader(languages, gpu=False, verbose=False)
        print("OCR reader ready")
    
    def extract_from_image(self, image_path: str) -> List[Element]:
        """从图片中提取所有元素"""
        # 读取图片
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Cannot read image: {image_path}")
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        elements = []
        
        # 1. 提取文字
        print("Extracting text...")
        text_elements = self._extract_text(img, gray)
        elements.extend(text_elements)
        
        # 2. 提取图片区域
        print("Extracting image regions...")
        image_elements = self._extract_image_regions(img, gray)
        elements.extend(image_elements)
        
        # 3. 提取形状
        print("Extracting shapes...")
        shape_elements = self._extract_shapes(img, gray)
        elements.extend(shape_elements)
        
        return elements
    
    def _extract_text(self, img: np.ndarray, gray: np.ndarray) -> List[TextElement]:
        """使用 EasyOCR 提取文字"""
        results = self.reader.readtext(img)
        
        elements = []
        for (bbox, text, confidence) in results:
            # bbox is [[x1,y1], [x2,y1], [x2,y2], [x1,y2]]
            x1 = int(min([p[0] for p in bbox]))
            y1 = int(min([p[1] for p in bbox]))
            x2 = int(max([p[0] for p in bbox]))
            y2 = int(max([p[1] for p in bbox]))
            
            if text.strip():  # 过滤空文本
                elements.append(TextElement(
                    (x1, y1, x2, y2),
                    text,
                    confidence
                ))
        
        return elements
    
    def _extract_image_regions(self, img: np.ndarray, gray: np.ndarray) -> List[ImageElement]:
        """提取图片/照片区域"""
        elements = []
        
        # 使用边缘检测和轮廓查找
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        # 膨胀连接边缘
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=2)
        
        # 查找轮廓
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            # 过滤太小的区域
            if w > 100 and h > 100:
                # 检查是否是图片（通过纹理特征）
                if w > 200 or h > 200:
                    elements.append(ImageElement((x, y, x + w, y + h)))
        
        return elements
    
    def _extract_shapes(self, img: np.ndarray, gray: np.ndarray) -> List[ShapeElement]:
        """提取形状元素（矩形、圆形等）"""
        elements = []
        
        # 二值化
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # 查找轮廓
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = cv2.contourArea(contour)
            
            # 过滤太小的区域
            if w > 50 and h > 50 and area > 1000:
                # 近似轮廓形状
                peri = cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
                
                if len(approx) == 4:
                    # 矩形
                    elements.append(ShapeElement((x, y, x + w, y + h), 'rectangle'))
                elif len(approx) > 6:
                    # 圆形/椭圆
                    elements.append(ShapeElement((x, y, x + w, y + h), 'circle'))
        
        return elements
    
    def extract_all_pages(self, images_dir: str, output_path: str = None) -> Dict:
        """提取所有页面的元素"""
        images_dir = Path(images_dir)
        pages = {}
        
        # 按页码排序
        image_files = sorted(images_dir.glob("page_*.png"))
        
        for img_file in image_files:
            page_num = int(img_file.stem.split('_')[1])
            print(f"\n{'='*50}")
            print(f"Processing page {page_num}: {img_file.name}")
            print('='*50)
            
            elements = self.extract_from_image(str(img_file))
            
            pages[f"page_{page_num:02d}"] = {
                'source': str(img_file.name),
                'elements': [e.to_dict() for e in elements]
            }
            
            print(f"Found {len(elements)} elements:")
            for e in elements:
                print(f"  - {e.type}: {e.bbox}")
        
        # 保存为JSON
        if output_path is None:
            output_path = images_dir.parent / "elements.json"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(pages, f, ensure_ascii=False, indent=2)
        
        print(f"\nElements saved to: {output_path}")
        return pages


if __name__ == "__main__":
    # 测试
    extractor = ElementExtractor()
    # 图片在 pdf/images/ 目录下
    images_dir = Path(__file__).parent / "pdf" / "images"
    pages = extractor.extract_all_pages(str(images_dir))
    print(f"\nTotal pages processed: {len(pages)}")
