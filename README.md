# gallery

GitHub Pages 静态照片墙示例，支持：

- 每页显示 20 张图片
- 上一页 / 下一页 + 页码分页
- 图片灯箱预览（点击放大、键盘左右切换、Esc 关闭）
- 运行时自动读取仓库 `images/` 目录中的图片，无需维护 `images.json`
- 自定义域名模板（`CNAME.template`）

## 目录结构

- `index.html`
- `style.css`
- `script.js`
- `CNAME.template`
- `images/`（你自己的图片目录）

## 使用方式

1. 将照片文件放入 `images/` 目录。
2. 支持的图片格式为：`.jpg`、`.jpeg`、`.png`、`.gif`、`.webp`、`.avif`。页面会在运行时通过 GitHub Contents API 自动发现这些文件，并忽略子目录与非图片文件。
3. 仓库需要保持 **公开（public）**，这样浏览器端脚本才能在不暴露 token 的前提下访问 GitHub Contents API。
4. 在 GitHub 仓库 **Settings → Pages** 中设置：
   - Source: `Deploy from a branch`
   - Branch: `main`（或默认分支）
   - Folder: `/ (root)`

之后你只需要继续往 `images/` 上传新图片，GitHub Pages 页面刷新后就会自动显示，无需再维护任何图片清单文件。

## 绑定自定义域名

1. 复制 `CNAME.template` 为 `CNAME`，并将内容改成你的域名（例如 `photos.example.com`）。
2. 在域名服务商处配置 DNS：
   - 二级域名：添加 `CNAME` 记录到 `YOUR_USERNAME.github.io`
   - 裸域名：添加 GitHub Pages 官方 `A` 记录  
     `185.199.108.153`  
     `185.199.109.153`  
     `185.199.110.153`  
     `185.199.111.153`
     （发布前请以 GitHub 官方文档为准再次核对：https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site ）
3. 回到仓库 **Settings → Pages** 填写 Custom domain，并在可用时启用 HTTPS。
