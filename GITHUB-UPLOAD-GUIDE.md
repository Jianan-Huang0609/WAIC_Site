# 🚀 GitHub 上传完整指南

## 📋 准备工作

### ✅ 必需工具
- [Git](https://git-scm.com/) (已安装)
- [GitHub 账户](https://github.com/) (已有)
- 本地项目文件 (已完成)

### ⚠️ 图片优化说明
由于您的原始图片文件过大（最大12MB），GitHub无法上传。我已经为您准备了优化方案：

## 🎯 方案一：使用外部图片托管（推荐）

### 步骤1：创建GitHub仓库
1. 登录GitHub
2. 点击右上角 "+" → "New repository"
3. 仓库名：`waic-2025-site`
4. 选择 "Public"
5. 勾选 "Add a README file"
6. 点击 "Create repository"

### 步骤2：克隆仓库到本地
```bash
git clone https://github.com/你的用户名/waic-2025-site.git
cd waic-2025-site
```

### 步骤3：准备项目文件
将以下文件复制到仓库目录：
```
waic-2025-site/
├── index.html              # 主页面
├── README.md               # 项目说明（使用README-GitHub.md的内容）
├── LICENSE                 # 许可证文件
├── .gitignore             # Git忽略文件
└── images/                 # 创建图片文件夹
    ├── waic-bg.jpg         # 背景图片（压缩版）
    ├── tech-evolution.png  # 技术图谱
    └── gallery/            # 展会图片集（压缩版）
```

### 步骤4：上传到GitHub
```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "初始化WAIC 2025项目"

# 推送到GitHub
git push origin main
```

## 🎯 方案二：使用GitHub LFS（大文件存储）

如果必须使用原始图片，可以使用GitHub LFS：

### 安装Git LFS
```bash
# Windows
git lfs install

# 跟踪大文件
git lfs track "*.jpg"
git lfs track "*.png"
git lfs track "*.jfif"
```

### 上传步骤
```bash
git add .gitattributes
git add .
git commit -m "添加大文件支持"
git push origin main
```

## 🎯 方案三：使用外部图片服务

### 推荐服务
1. **ImgBB** (免费，支持大文件)
2. **Cloudinary** (免费额度)
3. **GitHub Issues** (临时方案)

### 使用ImgBB步骤
1. 访问 [imgbb.com](https://imgbb.com/)
2. 上传图片
3. 复制图片链接
4. 在HTML中使用外部链接

## 📁 最终项目结构

```
waic-2025-site/
├── index.html              # 主页面
├── README.md               # 项目说明
├── LICENSE                 # MIT许可证
├── .gitignore             # Git忽略文件
├── images/                 # 图片资源
│   ├── waic-bg.jpg         # 背景图片
│   ├── tech-evolution.png  # 技术图谱
│   └── gallery/            # 展会图片
└── assets/                 # 其他资源
```

## 🌐 启用GitHub Pages

1. 进入GitHub仓库
2. 点击 "Settings"
3. 左侧菜单选择 "Pages"
4. Source选择 "Deploy from a branch"
5. Branch选择 "main"
6. 点击 "Save"

### 网站地址
您的网站将在以下地址可用：
```
https://你的用户名.github.io/waic-2025-site/
```

## 🔧 故障排除

### 问题1：图片上传失败
**解决方案**：
- 压缩图片到1MB以下
- 使用外部图片托管
- 使用Git LFS

### 问题2：GitHub Pages不显示
**解决方案**：
- 检查文件路径是否正确
- 确保index.html在根目录
- 等待几分钟让GitHub Pages部署

### 问题3：图片显示不出来
**解决方案**：
- 检查图片路径
- 使用相对路径：`./images/图片名.jpg`
- 确保图片格式支持（jpg, png, gif）

## 📞 需要帮助？

如果遇到问题，可以：
1. 检查GitHub仓库的Issues
2. 查看GitHub Pages文档
3. 联系项目维护者

---

**祝您上传成功！** 🎉 