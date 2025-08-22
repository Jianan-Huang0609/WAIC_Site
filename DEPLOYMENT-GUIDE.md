# 🚀 GitHub Pages 部署指南

## 📋 问题解决步骤

### 1. 启用GitHub Pages

1. **访问您的GitHub仓库**：https://github.com/Jianan-Huang0609/WAIC_Site
2. **进入Settings**：点击仓库页面顶部的"Settings"标签
3. **找到Pages设置**：在左侧菜单中找到"Pages"
4. **配置Source**：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main"
   - Folder: 选择 "/ (root)"
5. **保存设置**：点击"Save"

### 2. 等待部署完成

- GitHub Pages通常需要几分钟时间部署
- 部署完成后，您的网站将在以下地址可用：
  - **主页面**：https://jianan-huang0609.github.io/WAIC_Site/
  - **测试页面**：https://jianan-huang0609.github.io/WAIC_Site/test-images.html

### 3. 验证部署

1. 访问上述链接确认网站正常显示
2. 检查图片是否正常加载
3. 测试响应式设计在不同设备上的表现

## 🔧 故障排除

### 如果网站无法访问：

1. **检查仓库设置**：
   - 确保仓库是Public的
   - 确保GitHub Pages已启用

2. **检查文件结构**：
   - 确保`index.html`在根目录
   - 确保所有引用的图片文件存在

3. **检查Actions**：
   - 进入仓库的"Actions"标签
   - 查看部署是否成功

### 如果图片无法显示：

1. **检查图片路径**：
   - 确保图片文件已上传到GitHub
   - 检查HTML中的图片路径是否正确

2. **图片优化**：
   - 如果图片文件过大，考虑压缩
   - 使用WebP格式替代JPG/PNG

## 📞 获取帮助

如果遇到问题，可以：
1. 检查GitHub Pages的官方文档
2. 查看仓库的Actions日志
3. 联系技术支持

---

*最后更新：2025年1月* 