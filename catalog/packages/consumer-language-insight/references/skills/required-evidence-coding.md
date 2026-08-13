# 消费者原话编码（必需）

## 三层结构

每条信息严格区分：

1. **原话**：短摘录或忠实转述，带来源记录 ID。
2. **编码**：对这条原话的标签，例如“送礼场景”“担心刺激”“安装麻烦”。
3. **判断**：跨多条证据形成的暂定解释。

不要把编码或判断伪装成消费者原话。

## 建议字段

```text
record_id, platform, content_type, published_at, collected_at,
category, product, quote, scene, problem, desired_outcome,
objection, trigger, workaround, sentiment_expression,
source_url, batch_id, duplicate_group, notes
```

`sentiment_expression` 只记录消费者表达出的情绪，不把自动情感分数当作事实。

## 证据门槛

- 单条原话只能作为线索，不能写成群体结论。
- 多条相似原话应保留来源差异和反例，不只给出现次数。
- 出现次数只描述当前采集样本，不自动代表人群比例。
- 购买/使用评论与公开讨论不一致时，分别呈现，不强行合并。
- 每个判断都要链接到具体记录 ID；无法链接的内容放入“待验证假设”。

## 人工确认

营销负责人决定：分类是否符合实际业务、哪些表达可进入文案、哪些结论要补做访谈或补采样本。
