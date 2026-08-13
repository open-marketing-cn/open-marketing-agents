# v0.1 私有审计记录

审计日期：2026-08-13  
候选版本：0.1.0-alpha.1  
目标：Mac Apple Silicon + Codex

## 已通过

- 新建独立 Git 根目录，没有继承任何旧项目历史。
- 工作树与 Git 历史自定义拒绝词扫描通过。
- Gitleaks v8.29.1 工作树与完整 Git 历史扫描通过。
- Svelte 类型检查 0 错误、0 警告。
- 前端目录规则测试 5/5 通过。
- Rust 安装器测试 4/4 通过：非法路径、未验证包阻止、内置 Skill 安装、用户修改备份。
- Vite 生产构建通过。
- Tauri `.app` 和 Apple Silicon `.dmg` 构建通过。
- 应用 Bundle ID：`com.interflow.open-marketing`；最低系统版本 macOS 12。
- 第一轮界面检查通过：六工作空间、Agent/Skill、搜索、状态、权限、验证与来源信息可见。
- 初始目录无历史运行、客户数据、外部 Token 或原始媒体。

## 当前发布阻塞

以下任何一项未完成前，不得把仓库转公开或发布 `v0.1.0`：

1. 至少一个 Agent 完成“内容版本 × Codex × 实际品类”的真实从业者脱敏任务验证。
2. 把对应包状态从 `pending_validation` 更新为 `installable`，并重新运行安装/调用/更新/卸载测试。
3. 完成 Apple Developer ID 签名与公证；当前 alpha 包只有 ad-hoc 签名，不适合公开分发。
4. 在 GitHub 私有仓库再次检查文件树、Actions、Issue 模板、Release 附件和安装说明。
5. 对私有远端完整历史再次运行 Gitleaks 和拒绝词扫描。

## 构建产物

构建产物位于被 Git 忽略的 `src-tauri/target/release/bundle/`。不得把 `.app` 或 `.dmg` 直接提交进 Git 历史。私有审计确认后，可把已签名并公证的 DMG 作为 GitHub Release 附件上传。

当前 alpha DMG SHA-256：

```text
f52fff7d475b1c4dbb2df0cd204561dbf66242cf09ff22ecec2737a622469a9a
```

每次重新构建后该值都会变化，发布前必须重新计算并写入 Release Notes。
