#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片压缩脚本
将大图片压缩到适合GitHub上传的大小
"""

import os
import sys
from PIL import Image
import glob

def compress_image(input_path, output_path, max_size_mb=1.0, quality=85):
    """
    压缩图片到指定大小
    """
    try:
        # 打开图片
        with Image.open(input_path) as img:
            # 转换为RGB模式（如果是RGBA）
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # 计算目标文件大小（字节）
            max_size_bytes = max_size_mb * 1024 * 1024
            
            # 初始质量
            current_quality = quality
            
            # 尝试不同的质量设置
            while current_quality > 10:
                # 保存到临时文件来检查大小
                temp_path = output_path + '.temp'
                img.save(temp_path, 'JPEG', quality=current_quality, optimize=True)
                
                # 检查文件大小
                file_size = os.path.getsize(temp_path)
                
                if file_size <= max_size_bytes:
                    # 如果大小合适，移动到最终位置
                    os.replace(temp_path, output_path)
                    print(f"✓ 压缩成功: {os.path.basename(input_path)} -> {file_size/1024/1024:.2f}MB (质量: {current_quality})")
                    return True
                else:
                    # 删除临时文件，降低质量重试
                    os.remove(temp_path)
                    current_quality -= 10
            
            # 如果质量降到最低还是太大，尝试调整尺寸
            width, height = img.size
            scale_factor = 0.9
            
            while scale_factor > 0.3:
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                resized_img.save(output_path, 'JPEG', quality=85, optimize=True)
                
                file_size = os.path.getsize(output_path)
                if file_size <= max_size_bytes:
                    print(f"✓ 压缩成功: {os.path.basename(input_path)} -> {file_size/1024/1024:.2f}MB (尺寸: {new_width}x{new_height})")
                    return True
                
                scale_factor -= 0.1
            
            print(f"✗ 压缩失败: {os.path.basename(input_path)} (无法压缩到目标大小)")
            return False
            
    except Exception as e:
        print(f"✗ 处理失败: {os.path.basename(input_path)} - {str(e)}")
        return False

def main():
    # 创建压缩后的图片目录
    compressed_dir = "image_compressed"
    if not os.path.exists(compressed_dir):
        os.makedirs(compressed_dir)
    
    # 处理image目录中的图片
    image_dir = "image"
    if os.path.exists(image_dir):
        print("🖼️  开始压缩image目录中的图片...")
        
        # 支持的图片格式
        image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.jfif']
        
        for ext in image_extensions:
            for image_path in glob.glob(os.path.join(image_dir, ext)):
                filename = os.path.basename(image_path)
                name, ext = os.path.splitext(filename)
                
                # 转换为jpg格式
                output_path = os.path.join(compressed_dir, f"{name}.jpg")
                
                # 检查原始文件大小
                original_size = os.path.getsize(image_path) / (1024 * 1024)
                print(f"📁 处理: {filename} ({original_size:.2f}MB)")
                
                # 压缩图片
                compress_image(image_path, output_path, max_size_mb=1.0)
    
    # 处理image_BG目录中的图片
    bg_dir = "image_BG"
    if os.path.exists(bg_dir):
        print("\n🖼️  开始压缩image_BG目录中的图片...")
        
        for image_path in glob.glob(os.path.join(bg_dir, "*.jpg")):
            filename = os.path.basename(image_path)
            name, ext = os.path.splitext(filename)
            
            output_path = os.path.join(compressed_dir, f"{name}.jpg")
            
            original_size = os.path.getsize(image_path) / (1024 * 1024)
            print(f"📁 处理: {filename} ({original_size:.2f}MB)")
            
            compress_image(image_path, output_path, max_size_mb=1.0)
    
    print(f"\n✅ 压缩完成！压缩后的图片保存在 '{compressed_dir}' 目录中")
    print("📋 下一步：更新HTML文件中的图片路径")

if __name__ == "__main__":
    main()