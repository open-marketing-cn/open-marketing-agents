# 消费者原话编码

## 三层结构

1. **原话**：短摘录或忠实转述，附 `record_id`。
2. **编码**：对原话的标签，例如“送礼场景”“担心刺激”“安装麻烦”。
3. **判断**：跨多条证据形成的暂定解释。

不得把编码或判断写成消费者原话。

## 建议字段

```text
record_id, source, content_type, published_at, collected_at,
category, product, quote, scene, problem, desired_outcome,
objection, trigger, workaround, expressed_emotion,
source_url, batch_id, duplicate_group, notes
```

## 证据门槛

- 单条原话只是线索，不是群体结论。
- 相似原话要保留来源差异、反例和当前样本数量。
- 出现次数只描述当前样本，不代表人群比例。
- 不同来源冲突时分别呈现，不强行合并。
- 每个判断链接到具体记录 ID；无法链接的内容放入“待验证假设”。
