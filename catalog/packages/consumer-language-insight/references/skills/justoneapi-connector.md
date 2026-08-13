# Just One API 连接器（可选）

Just One API 是外部付费服务，不属于 Open Marketing。用户自行注册、付费、阅读其条款，并在本地配置凭证。Open Marketing 不代理收费，也不保存 Token。

官方资料：

- 网站：https://justoneapi.com/en
- 文档：https://docs.justoneapi.com/en/
- MCP：https://github.com/justoneapi/justoneapi-mcp
- Python SDK：https://github.com/justoneapi/justoneapi-python

## 推荐接法：MCP

官方远程 MCP 地址为 `https://mcp.justoneapi.com/mcp`，通过 Bearer Token 鉴权；本地 stdio 方案使用 `npx -y justoneapi-mcp` 和 `JUSTONEAPI_TOKEN`。具体配置以 Just One API 当前官方文档为准。

不要把 Token 写入项目文件、Agent 输出、截图、日志或 `.open-marketing/`。如果没有可用连接器或凭证，停止联网采集，并提示用户可以改为导入文件。

## 调用顺序

1. 使用 `search_endpoints` 按平台和能力查找端点。
2. 使用 `get_endpoint_schema` 核对参数与返回字段。
3. 向用户展示：平台、端点用途、关键词、时间范围、分页/数量、预计保存字段。
4. 用户确认后才使用 `call_endpoint`。
5. 每次响应保存为独立 JSON 文件，再做字段清理和标准化。

不要凭记忆写死 API 路径或请求参数。端点可能更新，必须先查询当前 schema。

## 首批适用来源

- 小红书：笔记搜索、笔记详情、笔记评论。
- 抖音：视频搜索、视频详情、视频评论；需要购买/使用评论时优先电商商品评论。
- 淘宝/天猫：商品搜索、商品详情、商品评论。
- 京东：商品搜索、商品详情、商品评论。
- B站：视频搜索、评论、弹幕。
- 微博：关键词搜索、博文详情、评论。

先采与任务直接相关的字段。除非研究问题明确需要，否则不调用用户主页、粉丝列表、设备、位置或创作者画像端点。

## 保存与清理

- 原始响应：`.open-marketing/runs/<run-id>/raw/<platform>-<batch>.json`
- 标准化结果：`.open-marketing/runs/<run-id>/normalized/<platform>.jsonl`
- 来源表：`.open-marketing/runs/<run-id>/sources.csv`
- 默认移除头像 URL、主页 URL、账号 ID、设备、精确位置和其他非任务必需身份字段。
- 不上传这些文件到 Git；默认把 `.open-marketing/` 加入项目 `.gitignore`。

API 成功返回只证明数据被取得，不证明数据完整、真实、代表整体市场或具备因果意义。
