# Cola Skill 本轮选取记录

核验日期：2026-09-15。发现入口：[Cola Skill](https://colaskill.com/zh/)、[第二页](https://colaskill.com/zh/?page=2)。Cola 用于发现，作者仓库用于核验。以下三项加入目录；未复制第三方技能源码。

| 单项 Skill | 补充的任务 | 原作者与来源 | 固定 Commit | 状态 |
|---|---|---|---|---|
| baoyu-infographic | 流程、对比与研究结论的信息图 | [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills/tree/1567581c26ec29f4216c6e6835415bf30343b0e3/skills/baoyu-infographic) | 1567581c26ec29f4216c6e6835415bf30343b0e3 | MIT；来源与隔离安装通过；成品实测未完成 |
| baoyu-xhs-images | 长文到系列小红书图卡 | [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills/tree/1567581c26ec29f4216c6e6835415bf30343b0e3/skills/baoyu-xhs-images) | 1567581c26ec29f4216c6e6835415bf30343b0e3 | MIT；来源与隔离安装通过；成品实测未完成 |
| writing-dna-skill | 从自有文章整理品牌写作规范 | [larashero3-dotcom/writing-dna-skill](https://github.com/larashero3-dotcom/writing-dna-skill/tree/ee3d97ee27268004b5187d97711161f44fc4aae4) | ee3d97ee27268004b5187d97711161f44fc4aae4 | MIT；来源与隔离安装通过；完整语料实测未完成 |

## 核验范围

读取独立 SKILL.md、所需引用目录和仓库 LICENSE。把上述固定 Commit 的检出作为安装来源，用 skills CLI 的 `--skill` 只选对应单项，验证 Codex 与 Claude Code 安装目录；文件安装成功不等于模型实际调用或输出达标。

目录安装命令指向上游，未来上游变动需要重新核验。图像类 Skill 还需要可用的生图工具；写作整理需要至少 20 篇自有或授权的完整文章，不用少量示例冒充验证成果。

## 去重与未引入项

Cola 中的 IP Logo、GBro 封面、去 AI 味、近 30 天研究、归藏 PPT、公众号排版已经有目录条目，本轮不重复添加。个人 IP 插画页面标注未知许可证，本轮不引入；通用编程、求职、小说和投资工具不属于本轮产品营销任务范围。

## 下一次实测

用同一篇已授权产品说明比较信息图与系列图卡，记录文字正确率、修改次数、版式与最终可读性；写作规范使用自有文章，检查后续新稿是否保留事实且符合品牌表达。未跑完前不标成实战验证。
