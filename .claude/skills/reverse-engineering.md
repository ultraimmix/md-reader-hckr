# Reverse Engineering & Deobfuscation Skill

专门用于从混淆/编译后的代码还原原始源代码的技能。

## Description

从混淆、压缩或编译后的 JavaScript/TypeScript 代码中分析和还原原始源代码结构和功能。适用于意外丢失源代码的场景。

## Usage

### 基础用法

```
请帮我逆向分析这个 Chrome 扩展，还原源代码
分析 dist/content/index.global.js，还原原始功能
```

### 高级用法

```
逆向分析整个项目，还原所有源代码文件
分析混淆代码，找出所有 CSS 类名和对应的功能
从编译产物推断原始的技术栈和构建配置
```

## Parameters

- `projectType`: 项目类型 (chrome-extension, nodejs, web-app, etc.)
- `targetPath`: 目标代码路径
- `outputPath`: 输出目录 (默认: src/)
- `analysisLevel`: 分析深度 (quick, standard, thorough)

## Examples

### Example 1: Chrome Extension 反向工程

**用户输入:**
```
我的 Chrome 扩展源代码丢失了，只有 dist/ 目录中的编译后的代码。
请帮我还原原始项目结构和源代码。
```

**技能执行:**
1. 分析 manifest.json 确定扩展配置
2. 扫描 dist/ 目录，识别所有编译产物
3. 提取 CSS 类名、变量名、函数名模式
4. 分析 import/require 语句，识别依赖库
5. 推断原始技术栈（Vue/React/Angular 等）
6. 还原 package.json 和构建配置
7. 创建完整的源代码结构

**输出:**
- 完整的 src/ 目录结构
- 所有 TypeScript/JavaScript 源文件
- package.json 和配置文件
- README.md 和功能文档
- 技术栈分析报告

### Example 2: 混淆代码分析

**用户输入:**
```
分析这个混淆的 JavaScript 文件，还原原始逻辑
```

**技能执行:**
1. 识别混淆模式（变量名混淆、控制流扁平化等）
2. 提取字符串常量和关键标识符
3. 分析代码执行流程
4. 识别主要功能模块
5. 重命名变量和函数
6. 添加注释和文档
7. 生成可读的源代码

### Example 3: 技术栈推断

**用户输入:**
```
从这些编译产物推断原始使用的技术栈和构建工具
```

**技能执行:**
1. 分析文件名模式（hash、chunk 等）
2. 识别打包器特征（Webpack、Vite、Rollup 等）
5. 检测 CSS 框架（UnoCSS、Tailwind 等）
6. 识别框架版本
7. 推断构建配置
8. 生成完整的构建配置文件

## Techniques

### 1. 静态分析
- 提取所有字符串常量
- 识别 CSS 类名模式
- 分析 API 调用
- 提取 import/require 路径

### 2. 模式匹配
- 函数命名模式识别
- 类名推断（基于 CSS 类、变量名等）
- 模块边界识别
- 代码组织结构推断

### 3. 架构推断
- Chrome Extension: manifest.json → background/content/popup
- Node.js: package.json → dependencies → module structure
- Web App: entry point → routing → components

### 4. 代码重构
- 变量重命名
- 函数提取
- 模块分离
- 添加类型注解（TypeScript）

## Detection Methods

### Chrome Extension 特征
- `manifest.json` 存在
- `chrome.*` API 调用
- `dist/background/`, `dist/content/`, `dist/popup/` 结构
- Service Worker 文件

### Vue.js 特征
- `@vue/` 导入
- `.vue` 单文件组件引用
- `createApp`, `ref`, `computed` 等 API
- `__vue` 或 `Vue` 全局对象

### React 特征
- `react` 和 `react-dom` 导入
- JSX 语法（编译后）
- `useState`, `useEffect` 等 Hooks
- `createElement` 调用

### Vite 构建特征
- `dist/assets/` 目录
- Hash 文件名 (`app-abc123.js`)
- `type="module"` 脚本标签
- Fast import 语法

### Webpack 构建特征
- `__webpack_require__`
- Chunk 文件 (`chunk.js`)
- Manifest 文件
- Runtime 代码

## Best Practices

1. **逐步分析**: 从简单的配置文件开始，逐步深入到复杂逻辑
2. **保留痕迹**: 记录分析过程和推断依据
3. **验证推断**: 通过实际运行或测试验证还原的代码
4. **文档化**: 添加详细的注释和文档
5. **保守估计**: 不确定的功能标记为 TODO 或注释说明

## Limitations

- 无法还原 100% 的原始代码逻辑
- 混淆程度极高时可能无法完全还原
- 需要结合人工判断和调整
- 某些优化可能改变代码结构

## Safety Guidelines

- 仅用于合法的代码恢复场景
- 不应用于恶意软件分析（会触发安全拒绝）
- 尊重知识产权和版权
- 仅在用户明确声明是自己的代码时执行

## Related Tools

- `strings`: 提取可读字符串
- `grep`: 模式搜索
- `bash`: 执行分析脚本
- `Read`: 读取文件内容
- `Glob`: 查找文件模式

## Output Format

```markdown
## 逆向工程分析报告

### 项目信息
- 项目类型: Chrome Extension
- 技术栈: Vue 3 + TypeScript + Vite
- 构建工具: Vite 6.0
- CSS 框架: UnoCSS

### 还原的文件
1. `src/background/index.ts` - Service Worker
2. `src/content/index.ts` - Content Script
3. `src/popup/App.vue` - Popup UI
...

### 功能清单
- [x] Markdown 渲染
- [x] 三栏布局
- [x] 主题切换
...

### 下一步建议
1. 安装依赖: `npm install`
2. 构建项目: `npm run build`
3. 加载扩展测试
```

## Tips

- 使用 `three-column.js` 作为参考（未混淆文件）
- 优先分析 CSS 类名，通常能反映功能模块
- Chrome Extension 的 manifest.json 是最好的入口点
- 查找未混淆的辅助文件（如 `three-column.js`）
- 使用 `strings` 命令快速提取可读内容
