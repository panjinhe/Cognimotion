/**
 * Cognimotion - 元素级动画引擎
 * 根据提取的元素为每个元素制作独立动画
 */

// 配置
const CONFIG = {
    pageWidth: 3823,
    pageHeight: 2134,
    animDuration: 800,        // 单个元素动画时长
    animStagger: 100,         // 元素间延迟
    autoPlayDelay: 5000,      // 自动播放时每页停留时间
};

// 动画效果定义
const ANIMATIONS = {
    // 文字动画
    text: {
        typewriter: {
            // 打字机效果
            animation: 'typewriter',
            duration: 0.05,  // 每个字符的时间
        },
        fadeIn: {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 0.6,
            easing: 'easeOutQuad'
        },
        slideInLeft: {
            opacity: [0, 1],
            translateX: [-50, 0],
            duration: 0.6,
            easing: 'easeOutCubic'
        },
        slideInRight: {
            opacity: [0, 1],
            translateX: [50, 0],
            duration: 0.6,
            easing: 'easeOutCubic'
        }
    },
    // 图片动画
    image: {
        scaleIn: {
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 0.8,
            easing: 'easeOutBack'
        },
        fadeIn: {
            opacity: [0, 1],
            duration: 0.6,
            easing: 'easeOutQuad'
        },
        rotateIn: {
            opacity: [0, 1],
            rotate: [-15, 0],
            scale: [0.9, 1],
            duration: 0.8,
            easing: 'easeOutBack'
        }
    },
    // 形状动画
    shape: {
        fadeIn: {
            opacity: [0, 1],
            duration: 0.5,
            easing: 'easeOutQuad'
        },
        drawIn: {
            opacity: [0, 1],
            strokeDashoffset: [1000, 0],
            duration: 1.0,
            easing: 'easeInOutCubic'
        }
    }
};

// 状态
let currentPage = 0;
let isAutoPlay = true;
let isAnimating = false;
let autoPlayTimer = null;
let elementsData = null;
let currentPageElements = [];

// DOM 元素
const slidesContainer = document.getElementById('slidesContainer');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');
const progressFill = document.getElementById('progressFill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoPlayBtn = document.getElementById('autoPlayBtn');
const clickModeBtn = document.getElementById('clickModeBtn');

/**
 * 初始化演示
 */
async function init() {
    // 加载元素数据
    await loadElementsData();
    
    // 设置总页数
    totalPagesEl.textContent = Object.keys(elementsData).length;
    
    // 创建幻灯片
    createSlides();
    
    // 绑定事件
    bindEvents();
    
    // 显示第一页
    showPage(0);
    
    // 自动播放
    if (isAutoPlay) {
        startAutoPlay();
    }
}

/**
 * 加载元素数据
 */
async function loadElementsData() {
    try {
        const response = await fetch('../pdf/elements.json');
        elementsData = await response.json();
        console.log('Elements data loaded:', Object.keys(elementsData).length, 'pages');
    } catch (error) {
        console.error('Failed to load elements data:', error);
        elementsData = {};
    }
}

/**
 * 创建所有幻灯片
 */
function createSlides() {
    const pages = Object.keys(elementsData).sort();
    
    pages.forEach((pageKey, index) => {
        const pageData = elementsData[pageKey];
        
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.dataset.page = index;
        
        const content = document.createElement('div');
        content.className = 'slide-content';
        
        // 添加背景（底图）
        const bgImg = document.createElement('img');
        bgImg.src = `../pdf/images/${pageData.source}`;
        bgImg.className = 'slide-bg';
        bgImg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;opacity:0.3;filter:blur(2px);';
        content.appendChild(bgImg);
        
        // 容器用于放置动画元素
        const elementsContainer = document.createElement('div');
        elementsContainer.className = 'elements-container';
        elementsContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
        
        // 创建每个元素
        pageData.elements.forEach((el, elIndex) => {
            const elementDiv = createElementDiv(el, elIndex);
            elementsContainer.appendChild(elementDiv);
        });
        
        content.appendChild(elementsContainer);
        slide.appendChild(content);
        slidesContainer.appendChild(slide);
    });
}

/**
 * 根据元素数据创建 DOM 元素
 */
function createElementDiv(element, index) {
    const div = document.createElement('div');
    div.className = `element element-${element.type}`;
    div.dataset.index = index;
    div.dataset.type = element.type;
    
    // 计算在页面中的位置和大小
    const scaleX = 100 / CONFIG.pageWidth;
    const scaleY = 100 / CONFIG.pageHeight;
    
    const left = element.bbox[0] * scaleX;
    const top = element.bbox[1] * scaleY;
    const width = element.width * scaleX;
    const height = element.height * scaleY;
    
    div.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: ${top}%;
        width: ${width}%;
        height: ${height}%;
        opacity: 0;
        transform: translateY(20px);
    `;
    
    // 根据元素类型添加不同内容
    if (element.type === 'text') {
        // 文字元素 - 用于打字机效果
        div.textContent = element.text;
        div.classList.add('text-element');
        div.style.cssText += `
            font-size: ${Math.max(12, height * 0.4)}px;
            color: #333;
            background: rgba(255,255,255,0.9);
            padding: 4px 8px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            white-space: pre-wrap;
            word-break: break-word;
        `;
    } else if (element.type === 'image') {
        // 图片元素 - 显示裁剪的图片区域
        // 由于我们没有原始图片的裁剪版本，这里用占位符
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        `;
        placeholder.innerHTML = '🖼️';
        div.appendChild(placeholder);
    } else if (element.type === 'shape') {
        // 形状元素 - 背景形状
        div.style.cssText += `
            background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
            border: 2px solid rgba(102,126,234,0.3);
            border-radius: 12px;
        `;
    }
    
    return div;
}

/**
 * 显示指定页面并播放元素动画
 */
function showPage(pageIndex) {
    if (isAnimating || pageIndex === currentPage) return;
    if (pageIndex < 0 || pageIndex >= Object.keys(elementsData).length) return;
    
    isAnimating = true;
    stopAutoPlay();
    
    const currentSlide = document.querySelector(`.slide[data-page="${currentPage}"]`);
    const targetSlide = document.querySelector(`.slide[data-page="${pageIndex}"]`);
    
    currentPage = pageIndex;
    currentPageEl.textContent = currentPage + 1;
    updateProgress();
    
    // 切换幻灯片
    if (currentSlide) {
        currentSlide.classList.remove('active');
    }
    
    targetSlide.classList.add('active');
    
    // 播放该页的元素动画
    playPageAnimations(targetSlide);
}

/**
 * 播放页面元素动画
 */
function playPageAnimations(slide) {
    const elements = slide.querySelectorAll('.element');
    const pageKey = Object.keys(elementsData).sort()[currentPage];
    const pageData = elementsData[pageKey];
    
    // 按Y坐标排序（从上到下）
    const sortedElements = Array.from(elements).sort((a, b) => {
        return parseFloat(a.style.top) - parseFloat(b.style.top);
    });
    
    // 为每个元素播放动画
    sortedElements.forEach((el, index) => {
        const elementData = pageData.elements[index];
        const delay = index * CONFIG.animStagger;
        
        setTimeout(() => {
            playElementAnimation(el, elementData);
        }, delay);
    });
    
    // 动画完成后设置标志
    setTimeout(() => {
        isAnimating = false;
        if (isAutoPlay) {
            startAutoPlay();
        }
    }, sortedElements.length * CONFIG.animStagger + CONFIG.animDuration * 1000 + 500);
}

/**
 * 为单个元素播放动画
 */
function playElementAnimation(element, elementData) {
    const type = elementData.type;
    
    // 根据元素类型选择动画
    let animConfig;
    if (type === 'text') {
        // 文字动画
        const isTitle = elementData.text && elementData.text.length < 20;
        if (isTitle) {
            // 标题使用打字机效果
            playTypewriterAnimation(element, elementData.text);
            return;
        } else {
            // 普通文字使用淡入
            animConfig = ANIMATIONS.text.fadeIn;
        }
    } else if (type === 'image') {
        // 图片动画
        animConfig = ANIMATIONS.image.scaleIn;
    } else {
        // 形状动画
        animConfig = ANIMATIONS.shape.fadeIn;
    }
    
    // 播放动画
    anime({
        targets: element,
        opacity: [0, 1],
        translateY: [20, 0],
        translateX: [0, 0],
        scale: [0.8, 1],
        rotate: [0, 0],
        duration: animConfig.duration * 1000,
        easing: animConfig.easing || 'easeOutQuad'
    });
}

/**
 * 打字机动画
 */
function playTypewriterAnimation(element, text) {
    element.textContent = '';
    element.style.opacity = 1;
    element.style.transform = 'translateY(0)';
    
    let charIndex = 0;
    const chars = text.split('');
    
    const typeChar = () => {
        if (charIndex < chars.length) {
            element.textContent += chars[charIndex];
            charIndex++;
            setTimeout(typeChar, 30);
        }
    };
    
    typeChar();
}

/**
 * 更新进度条
 */
function updateProgress() {
    const total = Object.keys(elementsData).length;
    const progress = ((currentPage + 1) / total) * 100;
    progressFill.style.width = `${progress}%`;
}

/**
 * 开始自动播放
 */
function startAutoPlay() {
    if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
    }
    
    const total = Object.keys(elementsData).length;
    autoPlayTimer = setTimeout(() => {
        const nextPage = (currentPage + 1) % total;
        showPage(nextPage);
    }, CONFIG.autoPlayDelay);
}

/**
 * 停止自动播放
 */
function stopAutoPlay() {
    if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
    }
}

/**
 * 切换到自动播放模式
 */
function enableAutoPlay() {
    isAutoPlay = true;
    autoPlayBtn.classList.add('active');
    clickModeBtn.classList.remove('active');
    startAutoPlay();
}

/**
 * 切换到点击模式
 */
function enableClickMode() {
    isAutoPlay = false;
    autoPlayBtn.classList.remove('active');
    clickModeBtn.classList.add('active');
    stopAutoPlay();
}

/**
 * 绑定事件
 */
function bindEvents() {
    prevBtn.addEventListener('click', () => showPage(currentPage - 1));
    nextBtn.addEventListener('click', () => showPage(currentPage + 1));
    autoPlayBtn.addEventListener('click', enableAutoPlay);
    clickModeBtn.addEventListener('click', enableClickMode);
    
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                showPage(currentPage - 1);
                break;
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                if (isAutoPlay) {
                    showPage(currentPage + 1);
                }
                break;
        }
    });
    
    slidesContainer.addEventListener('click', (e) => {
        if (!isAutoPlay && !isAnimating) {
            const slide = document.querySelector(`.slide[data-page="${currentPage}"]`);
            playPageAnimations(slide);
        }
    });
    
    window.addEventListener('resize', adjustScale);
    adjustScale();
}

/**
 * 调整缩放
 */
function adjustScale() {
    const slides = document.querySelector('.slides-container');
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const scaleX = (viewportWidth - 80) / CONFIG.pageWidth;
    const scaleY = (viewportHeight - 150) / CONFIG.pageHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    slides.style.transform = `scale(${scale})`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
