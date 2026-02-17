"""
Video Recorder - 使用 Playwright 录制网页动画为 MP4 视频
"""
import asyncio
from playwright.async_api import async_playwright
import os
from pathlib import Path


async def record_presentation():
    """录制演示文稿为视频"""
    
    # 配置
    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    output_video = output_dir / "presentation.mp4"
    
    html_file = Path(__file__).parent / "web" / "index.html"
    html_url = f"file:///{html_file.resolve()}"
    
    print(f"Recording: {html_url}")
    print(f"Output: {output_video}")
    
    async with async_playwright() as p:
        # 启动浏览器
        browser = await p.chromium.launch(
            headless=True,
            args=['--start-maximized']
        )
        
        # 创建上下文（设置视口大小）
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=1
        )
        
        # 创建页面
        page = await context.new_page()
        
        # 导航到页面
        await page.goto(html_url)
        
        # 等待页面加载完成
        await page.wait_for_load_state('networkidle')
        
        # 等待第一页激活并加载图片
        await page.wait_for_selector('.slide.active .slide-image', timeout=10000)
        
        print("Page loaded, starting recording...")
        
        # 开始录制
        # 注意：Playwright 原生不支持视频录制，我们需要用另一种方式
        # 使用 ffmpeg 录制屏幕或使用 page.screenshot 捕获帧
        
        # 方案：使用截图 + ffmpeg 合成视频（更可靠）
        await capture_video_frames(page, output_dir)
        
        # 清理
        await browser.close()
        
        print(f"Recording complete!")
        return str(output_video)


async def capture_video_frames(page, output_dir):
    """通过截图捕获视频帧"""
    
    frames_dir = output_dir / "frames"
    frames_dir.mkdir(exist_ok=True)
    
    total_pages = 12
    delay_per_page = 3  # 每页停留3秒（录制帧数）
    fps = 30
    frames_per_page = delay_per_page * fps
    
    print(f"Capturing {total_pages} pages, {frames_per_page} frames per page...")
    
    for page_num in range(total_pages):
        # 如果不是第一页，点击下一页
        if page_num > 0:
            await page.click('#nextBtn')
            await page.wait_for_timeout(500)  # 等待动画开始
        
        # 捕获该页的所有帧
        for frame_num in range(frames_per_page):
            # 截图
            screenshot_path = frames_dir / f"frame_{page_num:02d}_{frame_num:04d}.png"
            await page.screenshot(path=str(screenshot_path), full_page=False)
            
            # 等待下一帧
            await page.wait_for_timeout(1000 / fps)
        
        print(f"Page {page_num + 1}/{total_pages} captured")
    
    # 使用 ffmpeg 合成视频
    await create_video_from_frames(frames_dir, output_dir / "presentation.mp4")
    
    # 清理帧
    import shutil
    shutil.rmtree(frames_dir)
    print("Frames cleaned up")


async def create_video_from_frames(frames_dir, output_video):
    """使用 ffmpeg 将帧合成为视频"""
    import subprocess
    
    # 尝试使用系统 ffmpeg 或 playwright 内置的
    ffmpeg_cmd = [
        "ffmpeg",
        "-framerate", "30",
        "-i", str(frames_dir / "frame_%02d_%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "slow",
        str(output_video)
    ]
    
    try:
        print("Creating video with ffmpeg...")
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        if result.returncode == 0:
            print(f"Video created: {output_video}")
        else:
            print(f"FFmpeg error: {result.stderr}")
            # 尝试备用方案
            await create_video_pillow(frames_dir, output_video)
    except FileNotFoundError:
        print("FFmpeg not found, using Pillow fallback...")
        await create_video_pillow(frames_dir, output_video)
    except subprocess.TimeoutExpired:
        print("Video creation timeout")
        await create_video_pillow(frames_dir, output_video)


async def create_video_pillow(frames_dir, output_video):
    """使用 Pillow + imageio 创建视频（备用方案）"""
    try:
        import imageio
        from PIL import Image
        
        print("Creating video with imageio...")
        
        # 获取所有帧
        frame_files = sorted(frames_dir.glob("frame_*.png"))
        
        # 读取并调整帧大小
        frames = []
        target_size = (1920, 1080)
        
        for frame_file in frame_files:
            img = Image.open(frame_file)
            # 调整大小（如果需要）
            if img.size != target_size:
                img = img.resize(target_size, Image.Resampling.LANCZOS)
            frames.append(img)
        
        # 保存为视频
        imageio.mimsave(str(output_video), frames, fps=30)
        print(f"Video created: {output_video}")
        
    except ImportError:
        print("imageio not installed, installing...")
        import subprocess
        subprocess.run(["pip", "install", "imageio"], check=True)
        await create_video_pillow(frames_dir, output_video)


async def main():
    """主函数"""
    print("=" * 50)
    print("Glassmorphism Presentation Video Recorder")
    print("=" * 50)
    
    video_path = await record_presentation()
    
    print("=" * 50)
    print(f"Done! Video saved to: {video_path}")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
