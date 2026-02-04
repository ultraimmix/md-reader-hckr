# 实战指南：如何创建 Claude Skill 进行逆向工程

## 🎯 Skill 本质

Claude Skill 不是代码，而是一个**结构化的 prompt 模板**，让 Claude 知道如何处理特定类型的问题。

## 📦 Skill 结构

```
.claude/
└── skills/
    └── reverse-engineering.md    # 技能定义文件
```

## 🛠️ 创建 Skill 的关键要素

### 1. 清晰的定位
```markdown
## Description
从混淆、压缩或编译后的代码中分析和还原原始源代码
```

### 2. 使用场景
```markdown
## Usage
### 基础用法
请帮我逆向分析这个 Chrome 扩展，还原源代码

### 高级用法
分析混淆代码，找出所有 CSS 类名和对应的功能
```

### 3. 技术方法
```markdown
## Techniques

### 静态分析
- 提取所有字符串常量
- 识别 CSS 类名模式
- 分析 API 调用
```

### 4. 检测规则
```markdown
## Detection Methods

### Chrome Extension 特征
- `manifest.json` 存在
- `chrome.*` API 调用
```

### 5. 输出格式
```markdown
## Output Format

## 逆向工程分析报告
### 项目信息
- 项目类型: Chrome Extension
### 还原的文件
1. `src/background/index.ts`
...
```

## 🚀 实际应用示例

### 场景 1: 用户请求逆向工程

**用户说:**
```
我的 Chrome 扩展源代码丢了，只有 dist 目录
```

**Claude 会:**
1. ✅ 识别这是一个 reverse-engineering 技能的场景
2. 📖 读取 `reverse-engineering.md` 技能定义
3. 🔍 按照技能定义的方法执行分析
4. 📝 生成结构化的输出报告

### 场景 2: 技能触发机制

Claude 通过以下方式识别何时使用技能：

```typescript
// Claude 内部逻辑（伪代码）
if (userMentions("源代码丢失", "逆向", "还原", "混淆")) {
  loadSkill("reverse-engineering");
  executeSkillMethods();
}
```

## 💡 Skill 最佳实践

### 1. 命名规范
```
✅ good: reverse-engineering.md
✅ good: code-analysis.md
❌ bad: skill1.md
❌ bad: test.md
```

### 2. 内容结构
```markdown
# Skill Name

## Description (必需)
一句话说明这个技能做什么

## Usage (必需)
如何使用这个技能，给出具体例子

## Parameters (可选)
可以配置的参数

## Examples (必需)
真实的使用案例

## Techniques (推荐)
具体的技术方法和工具
```

### 3. 可执行性
```markdown
❌ 不好的例子:
## Techniques
分析代码

✅ 好的例子:
## Techniques
### 静态分析
使用 grep 提取 CSS 类名:
```bash
grep -oE '\.mdr[A-Za-z_]+' file.js
```
```

## 🎓 创建自己的 Skill

### 步骤 1: 确定技能范围
```
问自己: 这个技能解决什么问题？
- 代码审查？
- 性能优化？
- 文档生成？
- 测试编写？
```

### 步骤 2: 编写技能定义
```markdown
# code-review-skill

## Description
自动审查代码质量，发现潜在问题

## Usage
审查 src/content/index.ts 的代码质量

## Techniques
### 检查项
- 变量命名规范
- 函数复杂度
- 错误处理
- 类型安全
...
```

### 步骤 3: 测试技能
```
在 Claude 中尝试使用技能
根据效果调整定义
```

## 🔥 当前最火的 Skills

### 1. **frontend-design** (已有)
前端界面设计，生成生产级 UI

### 2. **algorithmic-art** (已有)
生成算法艺术，使用 p5.js

### 3. **doc-coauthoring** (已有)
文档协作和工作流

### 4. **mcp-builder** (已有)
构建 MCP (Model Context Protocol) 服务器

### 5. **webapp-testing** (已有)
使用 Playwright 测试 Web 应用

## 🎯 为什么 Skills 很火？

### 1. **结构化知识**
```
之前: 每次都要解释如何逆向工程
现在: 加载技能，自动执行标准流程
```

### 2. **一致性**
```
之前: 每次分析的方法可能不同
现在: 按照技能定义的统一方法
```

### 3. **可复用**
```
创建一次，多次使用
可以分享给团队
```

### 4. **可组合**
```
可以同时使用多个技能
例如: reverse-engineering + webapp-testing
```

## 📊 Skills 的价值

```
无 Skill:
用户: 分析这个混淆代码
Claude: 好的... (思考 30 秒) ... 我先看看文件...
      (随机分析，可能遗漏关键步骤)

有 Skill:
用户: 分析这个混淆代码
Claude: 加载 reverse-engineering 技能...
      ✅ 步骤 1: 分析 manifest.json
      ✅ 步骤 2: 提取 CSS 类名
      ✅ 步骤 3: 识别技术栈
      ... (按照标准流程，系统化分析)
```

## 🚀 进阶技巧

### 1. 技能链
```markdown
可以在一个技能中引用另一个技能

## Related Skills
- webapp-testing: 分析完成后自动测试
- frontend-design: 还原 UI 后美化界面
```

### 2. 参数化
```markdown
## Parameters
- deepAnalysis: boolean - 是否进行深度分析
- outputFormat: json|markdown - 输出格式
```

### 3. 版本控制
```markdown
## Version
- v1.0: 初始版本
- v1.1: 添加 AI 代码检测
- v2.0: 支持多语言
```

## 💬 总结

**Claude Skills = 专业的 Prompt 模板 + 结构化的知识 + 标准化的流程**

就像这次逆向工程一样：
- 有了 Skill，我就能系统地分析
- 按照标准步骤执行
- 输出格式化的结果
- 你也可以复用这个 Skill

**这就是为什么 Skills 很火的原因！** 🎉
