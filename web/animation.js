/**
 * Glassmorphism Presentation Animation
 * 支持自动播放和点击触发两种模式
 */

// 配置
const CONFIG = {
    totalPages: 12,
    imagePath: '../pdf/images/page_{n}.png',
    autoPlayDelay: 4000,      // 自动播放时每页停留时间
    animDuration: 800,        // 动画基础时长
    animStagger: 150,         // 元素间延迟
};

// 动画效果定义
const ANIMATIONS = {
    // 淡入效果
    fadeIn: {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: CONFIG.animDuration,
        easing: 'easeOutQuad'
    },
    // 缩放淡入
    scaleIn: {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: CONFIG.animDuration,
        easing: 'easeOutElastic(1, .6)'
    },
    // 左滑入
    slideInLeft: {
        opacity: [0, 1],
        translateX: [-100, 0],
        duration: CONFIG.animDuration,
        easing: 'easeOutCubic'
    },
    // 右滑入
    slideInRight: {
        opacity: [0, 1],
        translateX: [100, 0],
        duration: CONFIG.animDuration,
        easing: 'easeOutCubic'
    },
    // 下往上滑
    slideInUp: {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: CONFIG.animDuration,
        easing: 'easeOutBack'
    },
    // 旋转缩放
    rotateScaleIn: {
        opacity: [0, 1],
        scale: [0.5, 1],
        rotate: [-10, 0],
        duration: CONFIG.animDuration,
        easing: 'easeOutBack'
    },
    // 模糊淡入
    blurIn: {
        opacity: [0, 1],
        filter: ['blur(10px)', 'blur(0px)'],
        duration: CONFIG.animDuration,
        easing: 'easeOutQuad'
    }
};

// 每页的动画配置（轮流使用不同效果）
const PAGE_ANIMATIONS = [
    'fadeIn',         // 第1页 - 淡入
    'scaleIn',        // 第2页 - 缩放淡入
    'slideInLeft',    // 第3页 - 左滑入
    'slideInRight',   // 第4页 - 右滑入
    'slideInUp',      // 第5页 - 下往上滑
    'rotateScaleIn',  // 第6页 - 旋转缩放
    'blurIn',         // 第7页 - 模糊淡入
    'fadeIn',         // 第8页 - 淡入
    'scaleIn',        // 第9页 - 缩放淡入
    'slideInLeft',    // 第10页 - 左滑入
    'slideInRight',   // 第11页 - 右滑入
    'slideInUp'       // 第12页 - 下往上滑
];

// 状态
let currentPage = 0;
let isAutoPlay = true;
let isAnimating = false;
let autoPlayTimer = null;
let animationTimeline = null;

// DOM 元素
const slidesContainer = document.getElementById('slidesContainer');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');
const progressFill = document.getElementById('progressFill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoPlayBtn = document.getElementById('autoPlayBtn');
const clickModeBtn = document.getElementById('clickModeBtn');
const hint = document.getElementById('hint');

/**
 * 初始化演示
 */
function init() {
    // 设置总页数
    totalPagesEl.textContent = CONFIG.totalPages;
    
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
 * 创建所有幻灯片
 */
function createSlides() {
    for (let i = 0; i < CONFIG.totalPages; i++) {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.dataset.page = i;
        
        const content = document.createElement('div');
        content.className = 'slide-content';
        
        const img = document.createElement('img');
        img.src = CONFIG.imagePath.replace('{n}', String(i + 1).padStart(2, '0'));
        img.alt = `Page ${i + 1}`;
        img.className = 'slide-image';
        img.loading = 'lazy';
        
        content.appendChild(img);
        slide.appendChild(content);
        slidesContainer.appendChild(slide);
    }
}

/**
 * 显示指定页面
 */
function showPage(pageIndex, animate = true) {
    if (isAnimating || pageIndex === currentPage) return;
    if (pageIndex < 0 || pageIndex >= CONFIG.totalPages) return;
    
    isAnimating = true;
    
    // 停止自动播放
    stopAutoPlay();
    
    // 获取当前页和目标页
    const currentSlide = document.querySelector(`.slide[data-page="${currentPage}"]`);
    const targetSlide = document.querySelector(`.slide[data-page="${pageIndex}"]`);
    
    // 更新页码
    currentPage = pageIndex;
    currentPageEl.textContent = currentPage + 1;
    
    // 更新进度条
    updateProgress();
    
    // 切换幻灯片
    if (animate) {
        // 退出当前页动画
        if (currentSlide) {
            anime({
                targets: currentSlide.querySelector('.slide-content'),
                opacity: 0,
                scale: 0.95,
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    currentSlide.classList.remove('active');
                }
            });
        }
        
        // 激活目标页
        targetSlide.classList.add('active');
        
        // 进入目标页动画
        const animName = PAGE_ANIMATIONS[currentPage];
        const animConfig = ANIMATIONS[animName];
        
        // 重置初始状态
        const content = targetSlide.querySelector('.slide-content');
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
        
        anime({
            targets: content,
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.95, 1],
            duration: animConfig.duration,
            easing: animConfig.easing,
            complete: () => {
                isAnimating = false;
                // 继续自动播放
                if (isAutoPlay) {
                    startAutoPlay();
                }
            }
        });
        
        // 图片动画
        const img = targetSlide.querySelector('.slide-image');
        anime({
            targets: img,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: animConfig.duration,
            delay: 100,
            easing: animConfig.easing
        });
    } else {
        // 无动画直接切换
        if (currentSlide) {
            currentSlide.classList.remove('active');
        }
        targetSlide.classList.add('active');
        targetSlide.querySelector('.slide-content').style.opacity = '1';
        isAnimating = false;
    }
}

/**
 * 播放页面进入动画（用于点击模式）
 */
function playPageAnimation() {
    if (isAnimating) return;
    
    const targetSlide = document.querySelector(`.slide[data-page="${currentPage}"]`);
    const animName = PAGE_ANIMATIONS[currentPage];
    const animConfig = ANIMATIONS[animName];
    
    isAnimating = true;
    
    // 内容动画
    const content = targetSlide.querySelector('.slide-content');
    anime({
        targets: content,
        ...animConfig,
        begin: () => {
            content.style.opacity = '0';
        },
        complete: () => {
            isAnimating = false;
        }
    });
    
    // 图片动画
    const img = targetSlide.querySelector('.slide-image');
    anime({
        targets: img,
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: animConfig.duration,
        delay: animConfig.duration * 0.3,
        easing: 'easeOutQuad'
    });
}

/**
 * 更新进度条
 */
function updateProgress() {
    const progress = ((currentPage + 1) / CONFIG.totalPages) * 100;
    progressFill.style.width = `${progress}%`;
}

/**
 * 开始自动播放
 */
function startAutoPlay() {
    if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
    }
    
    autoPlayTimer = setTimeout(() => {
        const nextPage = (currentPage + 1) % CONFIG.totalPages;
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
    hint.innerHTML = '按 <kbd>空格</kbd> 或 <kbd>点击</kbd> 继续 · <kbd>←</kbd> <kbd>→</kbd> 切换页面';
    startAutoPlay();
}

/**
 * 切换到点击模式
 */
function enableClickMode() {
    isAutoPlay = false;
    autoPlayBtn.classList.remove('active');
    clickModeBtn.classList.add('active');
    hint.innerHTML = '按 <kbd>空格</kbd> 或 <kbd>点击</kbd> 触发动画 · <kbd>←</kbd> <kbd>→</kbd> 切换页面';
    stopAutoPlay();
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 上一页
    prevBtn.addEventListener('click', () => {
        showPage(currentPage - 1);
    });
    
    // 下一页
    nextBtn.addEventListener('click', () => {
        showPage(currentPage + 1);
    });
    
    // 自动播放按钮
    autoPlayBtn.addEventListener('click', enableAutoPlay);
    
    // 点击模式按钮
    clickModeBtn.addEventListener('click', enableClickMode);
    
    // 键盘事件
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
                } else {
                    playPageAnimation();
                }
                break;
            case 'Enter':
                if (!isAutoPlay) {
                    playPageAnimation();
                }
                break;
        }
    });
    
    // 点击幻灯片（点击模式）
    slidesContainer.addEventListener('click', (e) => {
        if (!isAutoPlay && !isAnimating) {
            playPageAnimation();
        }
    });
    
    // 窗口大小调整
    window.addEventListener('resize', adjustScale);
    
    // 初始调整
    adjustScale();
}

/**
 * 调整幻灯片缩放以适应屏幕
 */
function adjustScale() {
    const container = document.querySelector('.presentation-container');
    const slides = document.querySelector('.slides-container');
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const slideWidth = 1376;
    const slideHeight = 768;
    
    // 计算缩放比例
    const scaleX = (viewportWidth - 80) / slideWidth;
    const scaleY = (viewportHeight - 150) / slideHeight;
    const scale = Math.min(scaleX, scaleY, 1); // 最大为1
    
    slides.style.transform = `scale(${scale})`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
