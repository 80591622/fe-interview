# ai知识库

## 一、面试时你这样介绍项目（直接背）
我在企业级 AI 知识库项目中负责前端核心模块开发，技术栈是 Vue3 + Vite + TypeScript + Pinia。我主要负责对话系统全链路交互，包括：流式响应渲染、Markdown 解析、打字机效果、对话历史管理、多轮对话上下文管理等核心能力。整体采用模块化、可复用、可扩展的架构设计，把对话能力拆成独立管理器（Manager），保证低耦合、高复用，最终实现接近 ChatGPT 流畅度的对话体验。

## 1）技术实现方案
### 1.1 对话界面架构
我把对话界面拆成 核心管理器 + UI 组件两层：
下层：流式响应、Markdown 渲染、打字机、对话历史、上下文，全部做成独立 Manager，纯逻辑、无 UI、可复用。
上层：对话组件、历史列表组件、输入框、消息卡片，只负责渲染。
这样业务变化不影响核心逻辑，核心逻辑也能跨页面复用。
### 1.2 技术栈
Vue3 + Vite + TS + Pinia + 自定义 hooks + SSE 流式通信流式用 EventSource / Fetch ReadableStream渲染用 marked + highlight.js

## 2）流式响应渲染（必考！）
### 2.1 流式响应管理器
我封装了一个 StreamManager，统一处理：
SSE 连接建立 / 断开
接收后端流式 chunk
异常重试、超时处理、停止生成
把流数据分发给打字机与渲染层
所有对话请求都走这个管理器，全局统一、无冗余代码。
### 2.2 流式响应演示组件
组件只做两件事：
调用 Manager 发起请求
接收实时流数据，交给打字机渲染
组件非常薄，逻辑全部下沉。
### 面试官必问：流式怎么实现？你答：
用 SSE（text/event-stream），后端逐字返回，前端通过 EventSource 监听 message 事件，实时接收增量数据，不等待全量返回，体验更流畅。

```js
/**
 * 流式响应管理器 - 企业级 AI 对话核心工具类
 * 功能：同时支持 SSE / Fetch Stream / 模拟流，统一管理连接、状态、中断、数据缓存
 * 设计模式：单例模式 + 面向对象封装，全局唯一实例
 */
export class StreamManager {
  /**
   * 构造函数：初始化流管理所需的基础状态
   */
  constructor() {
    // Fetch 流中断控制器（用于终止 Fetch 请求）
    this.controller = null
    // 全局流状态：是否正在进行流式输出
    this.isStreaming = false
    // 内容缓冲区：存储完整的响应文本，保证内容不丢失
    this.buffer = ''
    // SSE 连接实例（用于管理 SSE 连接状态）
    this.eventSource = null
  }

  /**
   * 1. 创建 SSE 流式连接（Server-Sent Events）
   * 适用场景：GET 请求、轻量流式、服务器主动推送
   * @param {string} url - 后端 SSE 接口地址
   * @param {object} options - 回调配置：onStart/onChunk/onError/onComplete
   * @returns {EventSource} SSE 实例
   */
  createSSEConnection(url, options = {}) {
    // 先关闭上一次的流，避免多个流同时运行
    this.stop()

    // 新建 SSE 连接（浏览器原生 API，自动处理重连）
    this.eventSource = new EventSource(url)
    // 标记流开始
    this.isStreaming = true
    // 清空缓冲区，准备接收新内容
    this.buffer = ''

    /**
     * SSE 连接成功回调
     */
    this.eventSource.onopen = () => {
      // 通知外部：连接已建立，开始推流
      options.onStart?.()
    }

    /**
     * 接收服务器推送的消息（核心：每收到一段数据就触发）
     */
    this.eventSource.onmessage = (event) => {
      // 如果已经停止流，则不处理消息
      if (!this.isStreaming) return

      try {
        // 解析后端返回的 JSON 数据
        const data = JSON.parse(event.data)
        // 取出本次推送的文本片段
        const chunk = data.content || ''
        // 将片段追加到缓冲区
        this.buffer += chunk
        // 回调通知外部：收到新片段，返回 片段内容 + 完整内容
        options.onChunk?.(chunk, this.buffer)

        // 如果后端标记传输完成
        if (data.done) {
          // 停止流
          this.stop()
          // 回调通知外部：传输完成
          options.onComplete?.(this.buffer)
        }
      } catch (e) {
        // 消息解析失败，抛出错误
        options.onError?.('消息解析失败')
      }
    }

    /**
     * SSE 连接异常处理
     */
    this.eventSource.onerror = (error) => {
      // 停止流
      this.stop()
      // 回调通知错误
      options.onError?.(error)
    }

    return this.eventSource
  }

  /**
   * 2. 创建 Fetch 流式连接（标准 POST 流式）
   * 适用场景：POST 请求、携带复杂参数（上下文、对话历史）、企业级主流方案
   * @param {string} url - 后端接口地址
   * @param {object} body - 请求体（问题、上下文、历史对话）
   * @param {object} options - 回调配置
   * @returns {Promise<string>} 最终完整文本
   */
  async createFetchStream(url, body, options = {}) {
    try {
      // 停止上一个流，防止冲突
      this.stop()
      // 清空缓冲区
      this.buffer = ''
      // 标记流开始
      this.isStreaming = true
      // 创建中断控制器，用于手动终止请求
      this.controller = new AbortController()

      // 回调通知：开始请求
      options.onStart?.()

      // 发起 POST 请求，开启流式读取
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: this.controller.signal, // 绑定中断信号
      })

      // 请求失败直接抛出异常
      if (!response.ok) throw new Error('请求失败')

      // 获取流式读取器
      const reader = response.body.getReader()
      // 文本解码器：将二进制流转为字符串
      const decoder = new TextDecoder()

      // 循环读取流
      while (this.isStreaming) {
        // 读取一段数据
        const { done, value } = await reader.read()
        // 数据读完则退出循环
        if (done) break

        // 解码二进制数据
        const chunk = decoder.decode(value, { stream: true })
        // 追加到缓冲区
        this.buffer += chunk
        // 回调通知：收到新片段
        options.onChunk?.(chunk, this.buffer)
      }

      // 停止流
      this.stop()
      // 回调通知：完成
      options.onComplete?.(this.buffer)
      return this.buffer
    } catch (error) {
      // 异常处理
      this.stop()
      options.onError?.(error.message || '连接异常')
    }
  }

  /**
   * 3. 模拟流式响应（前端独立调试/演示神器）
   * 作用：后端未开发完成时，前端模拟 AI 打字机效果
   * @param {string} text - 要输出的完整文本
   * @param {object} options - 配置：speed 速度 + 回调
   * @returns {Promise<string>} 最终文本
   */
  simulateStream(text, options = {}) {
    return new Promise((resolve) => {
      // 停止现有流
      this.stop()
      // 清空缓冲区
      this.buffer = ''
      // 标记开始
      this.isStreaming = true
      // 回调通知开始
      options.onStart?.()

      // 将文本拆分为字符数组，实现逐字输出
      const chars = text.split('')
      let index = 0
      // 打字速度默认 30ms 一个字
      const speed = options.speed || 30

      // 定时器：逐字推送
      const timer = setInterval(() => {
        // 停止条件：手动停止 或 文本输出完毕
        if (!this.isStreaming || index >= chars.length) {
          clearInterval(timer)
          this.stop()
          options.onComplete?.(this.buffer)
          resolve(this.buffer)
          return
        }

        // 取出一个字符
        const char = chars[index++]
        // 追加到缓冲区
        this.buffer += char
        // 回调通知：输出一个字符
        options.onChunk?.(char, this.buffer)
      }, speed)
    })
  }

  /**
   * 统一停止所有流式传输
   * 功能：中断 Fetch、关闭 SSE、重置状态
   */
  stop() {
    // 标记流结束
    this.isStreaming = false

    // 1. 中断 Fetch 请求
    this.controller?.abort()
    this.controller = null

    // 2. 关闭 SSE 连接
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * 重置管理器
   * 功能：停止流 + 清空缓冲区
   */
  reset() {
    this.stop()
    this.buffer = ''
  }
}

// 单例模式导出：全局唯一实例，所有组件共用同一个流管理器
export default new StreamManager()
```
**SSE 就 5 个核心点：**
1. new EventSource(url) → 创建连接
2. onopen → 连接成功
3. onmessage → 接收流式片段（核心）
4. onerror → 异常处理
5. close() → 关闭连接
   
**面试官问：SSE 工作流程？**
**你背这个满分流程：**
- 前端用 new EventSource() 建立连接
- 连接成功触发 onopen
- 后端持续推送片段，前端 onmessage 实时接收
- 接收完成或异常时调用 close() 关闭
- 全程服务器单向推送，轻量、适合 AI 流式回答

## 3）Markdown 解析与代码高亮
### 3.1 Markdown 渲染管理器
封装 MarkdownRenderManager，统一处理：
解析流式片段（不完整也能安全渲染）
代码块高亮、代码复制
表格、列表、引用、公式适配
安全过滤 XSS
### 3.2 Markdown 渲染演示组件
接收打字机输出的文本，调用 Manager 渲染成富文本，支持边流边渲染。

### 4）打字机效果（AI 对话灵魂）
## 4.1 打字机效果管理器
封装 TypewriterManager，控制：
逐字输出速度
中英文差异化速度
暂停、继续、中断
避免闪烁、抖动、重复渲染
我做了增量更新，只追加字符，不整段替换，性能非常好
### 4.2 打字机效果演示组件
接收流式字符串 → 逐字输出 → 传给 Markdown 渲染。

## 5）对话历史管理
### 5.1 对话历史管理器
ChatHistoryManager 负责：
历史消息存储
清空 / 删除 / 重新生成
本地缓存（localStorage/indexedDB）
与后端同步历史记录
### 5.2 对话历史演示组件
虚拟列表渲染长列表，支持滚动定位、未读提示、重新生成回答。

### 6）多轮对话上下文（最加分！）
## 6.1 上下文管理器
ContextManager 管理多轮对话：
保存历史问答对
发送请求时自动带上上文
控制上下文长度（防止超 token）
支持清空上下文、重新生成
### 面试官必问：多轮对话怎么做？你答：
每次发送问题时，把最近 N 轮问答拼到请求里，后端就能理解上下文。前端通过上下文管理器统一维护，避免组件内混乱。

## 三、面试官 90% 会问的 8 个问题（你直接背答案）
1. 流式中断怎么实现？
通过 EventSource.close() 关闭连接，管理器清空状态，打字机停止。
2. 网络断了怎么办？
监听 error 事件，做自动重试，最多 3 次，失败给用户提示，支持手动重发。
3. Markdown 边流边渲染怎么做到？
流式接收片段 → 交给打字机逐字输出 → 实时调用 Markdown 解析，增量渲染，不重建 DOM。
4. 打字机如何避免卡顿？
使用 requestAnimationFrame，字符追加，不替换整个 DOM，虚拟列表滚动优化。
5. 重新生成回答怎么做？
删除最后一条 AI 消息 → 上下文管理器移除上轮 → 重新发起流式请求 → 追加新消息。
6. 多轮对话上下文怎么传？
上下文管理器维护 message 数组，发送时携带 history，后端就能理解多轮意图。
7. 你项目最难的点是什么？（高分答案）
最难的是流式 + 打字机 + Markdown 三者协同：流不稳定、片段乱序、不完整 Markdown 会渲染异常。我通过管理器分层、数据队列、增量渲染、异常兜底解决了，最终体验非常流畅。
8. 前端在 RAG 里做了什么？
负责交互层：提问、流式展示、上下文、历史、引用来源展示、用户反馈。让 RAG 的结果可看、可追溯、可交互。

