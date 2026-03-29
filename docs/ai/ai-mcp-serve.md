# MCP API Type Generator 面试与使用文档

---

## 一、代码到底是做什么的？（极简版）

这是一个 **MCP（Model Context Protocol）标准服务器**，核心功能：

> **接收 JSON 字符串 → 自动生成对应的 TypeScript Interface 类型定义**

它是一个命令行工具 + AI 工具调用服务，可以被 AI（如 Claude）直接调用，自动把 API 返回的 JSON 转成 TS 类型，前端开发不用手写 interface。

---

## 二、代码核心结构拆解（面试只需要说这 4 点）

### 1. 技术栈

- **Node.js + TypeScript**
- **MCP SDK**（`@modelcontextprotocol/sdk`）
- **stdio** 标准输入输出通信

### 2. 核心功能函数

**`jsonToTypeScript()`**：

- 递归解析 JSON 对象 / 数组
- 自动生成安全、规范的 TS interface
- 去重、处理特殊键名、嵌套对象、数组

### 3. MCP 服务器逻辑

- 注册工具：`generate_types_from_json`
- 接收 AI / 客户端传入的 `json` + `interfaceName`
- 解析、生成、返回 TS 代码
- 异常捕获（JSON 解析失败、参数错误）

### 4. 运行方式

通过 **stdio（标准输入输出）** 运行，轻量、无端口、可直接被 AI 集成调用。

---

## 三、简历上写「MCP 服务器集成」，面试怎么说？

### 标准话术（15 秒版）

> 我独立开发了一个 **基于 MCP 协议的 TypeScript 类型自动生成服务器**，主要用于前端开发提效。这个服务通过 MCP 标准接口提供能力，对外暴露一个工具函数，输入 JSON 数据就能自动生成完整的 TypeScript 接口定义，支持嵌套对象、数组、复杂结构解析。服务使用 Node.js + MCP SDK 实现，采用 stdio 传输，轻量无侵入，可以直接集成到 AI 助手（如 Claude）中，让 AI 自动为前端生成类型代码，大幅减少重复编码工作。

### 进阶话术（30 秒版）

> 这个 MCP 服务器是我针对前端类型定义繁琐问题做的效率工具。它遵循 MCP 协议规范，实现了工具注册、参数校验、JSON 递归解析、TS 类型生成、错误处理完整流程。我设计了递归解析算法处理复杂 JSON，支持对象嵌套、数组泛型、安全键名转换，同时做了接口去重和异常捕获保证稳定性。它可以作为标准 MCP 工具被 AI 客户端调用，实现 API 数据一键转 TS 类型，提升开发效率，减少手写代码的出错率。

---

## 四、面试官 90% 会问的问题 + 满分答案

### Q1: 什么是 MCP？你为什么用 MCP？

**答案**：

MCP 是 **Model Context Protocol**，模型上下文协议，是一个标准化的 AI 工具调用协议。它让 AI 可以安全、统一地调用外部工具 / 服务。

我用 MCP 是因为：

| 优势       | 说明                                      |
| ---------- | ----------------------------------------- |
| **标准化** | 通用协议，所有支持 MCP 的 AI 都能直接调用 |
| **轻量**   | 基于 stdio / HTTP，部署简单               |
| **安全**   | 权限、能力明确声明                        |
| **可扩展** | 方便增加更多工具                          |

---

### Q2: 这个 MCP 服务器的工作流程是什么？

**答案**：

```
1. 启动服务器，建立 stdio 通信通道
2. 向调用方（AI）暴露工具：generate_types_from_json
3. 接收参数：JSON 字符串 + 接口名称
4. 参数校验 → JSON 解析
5. 递归解析数据结构，生成 TS interface
6. 返回生成的代码
7. 异常统一捕获并返回错误信息
```

---

### Q3: `jsonToTypeScript` 这个函数核心怎么做的？

**答案**：

| 步骤          | 说明                                  |
| ------------- | ------------------------------------- |
| 递归遍历 JSON | 深度优先遍历所有属性                  |
| 判断类型      | object / array / 基本类型             |
| 数组处理      | 取第一个元素生成子接口，返回 `Item[]` |
| 对象处理      | 递归生成 interface                    |
| 特殊处理      | 处理特殊键名、首字母格式化、接口去重  |
| 返回结果      | 拼接成完整 TS 代码                    |

**核心算法**：

```typescript
// 类型判断逻辑
if (value === null) return 'null';
if (Array.isArray(value)) return 处理数组();
if (typeof value === 'object') return 递归生成接口();
return typeof value; // number/string/boolean
```

---

### Q4: 你遇到了什么难点？怎么解决的？

**答案**：

| 难点                   | 解决方案                                 |
| ---------------------- | ---------------------------------------- |
| **复杂嵌套 JSON 解析** | 用递归 + 缓存 Set 解决，避免重复生成接口 |
| **非法 TS 属性名**     | 做了安全键名处理，自动加引号包裹         |
| **空数组无法判断类型** | 统一返回 `unknown[]`，保证类型安全       |
| **MCP 协议对接**       | 严格按照 Schema 定义工具、参数、返回格式 |

---

### Q5: 这个服务可以用在什么场景？

**答案**：

- AI 自动生成前端 TS 类型定义
- 接口联调时，一键把后端返回 JSON 转 TS
- 低代码平台自动生成类型
- 前端工程化提效工具

---

### Q6: MCP 和 API / WebService 有什么区别？

**答案**：

| 对比项   | MCP                              | 传统 RESTful API |
| -------- | -------------------------------- | ---------------- |
| **定位** | AI 专用调用协议                  | 通用接口服务     |
| **特点** | 专注工具 / 能力暴露              | 数据 CRUD        |
| **优势** | 自带工具描述、参数校验、权限模型 | 需自行实现       |
| **传输** | 轻量（stdio），不用 HTTP 端口    | HTTP 端口        |
| **集成** | 更适合 AI 本地工具链             | 通用但较重       |

**总结**：比传统 RESTful 更轻量化、更安全、更适合 AI 场景。

---

### Q7: 你这个项目的技术亮点是什么？

**答案**：

- ✅ **MCP 标准化集成**，可直接对接 AI
- ✅ **递归算法**完美支持复杂 JSON
- ✅ **健壮的错误处理**，不会崩溃
- ✅ **生产可用**，无依赖、轻量、稳定
- ✅ **真正解决前端痛点**，提升开发效率

---

### Q8: 如果让你优化，你会加什么功能？

**答案**：

- 支持生成 `type` / `interface` 切换
- 支持注释生成（从 JSON 示例提取）
- 支持批量接口生成
- 增加配置项：可配置命名风格
- 增加 HTTP 传输模式，支持远程调用

---

## 五、你可以直接写在简历上的描述（优化版）

> **基于 MCP 协议的 TypeScript 类型自动生成服务器**

- 遵循 MCP 标准协议开发，实现 AI 可调用的类型生成工具
- 递归解析复杂 JSON 结构，自动生成规范 TypeScript 接口定义
- 支持嵌套对象、数组泛型、安全键名转换、接口去重
- 完整参数校验、异常捕获、错误返回机制
- 基于 stdio 轻量传输，可无缝集成 AI 助手（Claude）
- 大幅减少前端类型定义工作量，提升开发效率

---

## 六、MCP Server 核心代码解析

### 1. 工具注册

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_types_from_json',
        description: 'Generate TypeScript interface from JSON response',
        inputSchema: {
          type: 'object',
          properties: {
            json: { type: 'string', description: 'JSON string' },
            interfaceName: { type: 'string', description: 'Root interface name' }
          },
          required: ['json', 'interfaceName']
        }
      }
    ]
  };
});
```

### 2. 工具调用处理

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'generate_types_from_json') {
    // 参数校验
    if (!args || typeof args.json !== 'string') {
      throw new Error('Invalid json parameter');
    }

    // JSON 解析
    const json = JSON.parse(args.json);

    // 生成 TS 类型
    const types = jsonToTypeScript(json, args.interfaceName);

    return {
      content: [{ type: 'text', text: types }]
    };
  }
});
```

### 3. 服务器启动

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('API Type Generator MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

---

## 七、真实项目中的完整使用流程

### 1. 先把你的 MCP 服务打包/安装到项目

把这个文件放到项目内，比如 `tools/mcp-type-generator/index.js`

在 `package.json` 加一个声明：

```json
"mcp": {
  "api-type-generator": {
    "command": "node tools/mcp-type-generator/index.js"
  }
}
```

安装依赖：`@modelcontextprotocol/sdk`

### 2. 在 AI 编辑器/Claude 里配置 MCP 服务

Cursor / Claude / VS Code 插件里，添加 MCP 服务配置：

```json
{
  "mcpServers": {
    "api-type-generator": {
      "command": "node",
      "args": ["./tools/mcp-type-generator/index.js"]
    }
  }
}
```

**这一步的作用**：让 AI 知道：本地有一个可用工具，可以生成 TS 类型。

### 3. 开发时，AI 自动调用你的服务

**场景举例**：你拿到后端接口返回的 JSON：

```json
{
  "code": 0,
  "data": {
    "list": [{ "id": 1, "name": "test" }],
    "total": 100
  },
  "msg": "success"
}
```

你对 AI 说：

> 把这个 JSON 转成项目里的 TS interface

然后 AI 就会：

1. 调用你注册的 MCP 工具 `generate_types_from_json`
2. 把 JSON 传给你的服务
3. 你的服务生成好 interface
4. AI 直接把代码返回/插入到你的项目 `.d.ts` 或 `.ts` 文件

**最终你项目里自动出现**：

```typescript
interface ApiResponse {
  code: number;
  data: ApiResponseData;
  msg: string;
}

interface ApiResponseData {
  list: ApiResponseDataListItem[];
  total: number;
}

interface ApiResponseDataListItem {
  id: number;
  name: string;
}
```

### 4. 前端业务代码直接使用类型

```typescript
import type { ApiResponse } from './types/api';

const res = await fetch('/api/list');
const data = (await res.json()) as ApiResponse;
```

---

## 八、总结

**代码 = MCP 服务器 + JSON 转 TS 工具**

**面试核心**：说清 MCP 是什么 + 你的服务做什么 + 流程 + 亮点
