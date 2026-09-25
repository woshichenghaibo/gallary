# gallery

GitHub Pages 静态照片墙示例，支持：

- 每页显示 20 张图片
- 上一页 / 下一页 + 页码分页
- 图片灯箱预览（点击放大、键盘左右切换、Esc 关闭）
- 自定义域名模板（`CNAME.template`）

## 目录结构

- `index.html`
- `style.css`
- `script.js`
- `images.json`
- `CNAME.template`
- `images/`（你自己的图片目录）

## 使用方式

1. 将照片文件放入 `images/` 目录。
2. 在 `images.json` 中维护图片文件名列表（与 `images/` 下文件名保持一致）。
3. 在 GitHub 仓库 **Settings → Pages** 中设置：
   - Source: `Deploy from a branch`
   - Branch: `main`（或默认分支）
   - Folder: `/ (root)`

## 绑定自定义域名

1. 复制 `CNAME.template` 为 `CNAME`，并将内容改成你的域名（例如 `photos.example.com`）。
2. 在域名服务商处配置 DNS：
   - 二级域名：添加 `CNAME` 记录到 `YOUR_USERNAME.github.io`
   - 裸域名：添加 GitHub Pages 官方 `A` 记录
3. 回到仓库 **Settings → Pages** 填写 Custom domain，并在可用时启用 HTTPS。
