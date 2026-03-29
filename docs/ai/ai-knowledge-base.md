# ai知识库

## 一、面试时你这样介绍项目（直接背）

我在企业级 AI 知识库项目中负责前端核心模块开发，技术栈是 Vue3 + Vite + TypeScript + Pinia。我主要负责对话系统全链路交互，包括：流式响应渲染、Markdown 解析、打字机效果、对话历史管理、多轮对话上下文管理等核心能力。整体采用模块化、可复用、可扩展的架构设计，把对话能力拆成独立管理器（Manager），保证低耦合、高复用，最终实现接近 ChatGPT 流畅度的对话体验。

- 流式输出：分段接收、打字机渲染、断网重试、断点续传
- 上下文管理：存对话历史、控制 Token、智能压缩保重点
- 渲染优化：Markdown + 代码高亮、防抖增量、防 XSS、修复截断
- 本地存储：IndexedDB 持久化、会话 + 消息两张表

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

- 我封装了一个 StreamManager，统一处理：
- SSE 连接建立 / 断开
- 接收后端流式 chunk
- 异常重试、超时处理、停止生成
- 把流数据分发给打字机与渲染层
- 所有对话请求都走这个管理器，全局统一、无冗余代码。

### 2.2 流式响应演示组件

组件只做两件事：

- 调用 StreamManager 发起请求
- 接收实时流数据，交给打字机渲染

### 2.3 细节补充

1. new AbortController()  
   作用：创建请求中断控制器用来生成中断信号，实现手动取消请求、异常中断、防止多流冲突。
2. const reader = response.body.getReader()  
   作用：获取流式读取器拿到浏览器原生的流读取对象，开始逐块读取后端返回的数据流。
3. const decoder = new TextDecoder()  
   作用：创建文本解码器把后端返回的二进制数据（Uint8Array） 转成可读字符串。
4. const { done, value } = await reader.read()  
   作用：异步读取一块流数据循环调用，每次读取一段数据，返回：  
   done：是否读完
   value：二进制数据片段
5. const chunk = decoder.decode(value, { stream: true })  
   作用：解码二进制片段为文本把二进制 value 转成字符串 chunk，{ stream: true } 表示支持连续流式解码。
6. this.buffer += chunk  
   作用：拼接文本到缓冲区把每一段解码后的文本不断追加缓存，保证内容完整、不丢失。  
   三、最精简记忆口诀（10 秒背完）  
   控制器中断 → 拿读取器 → 创建解码器 → 读数据 → 解码 → 拼缓存  
   四、面试官问 “流式请求原理” 你就说：
   我通过 fetch 发起请求，用 AbortController 做中断控制，通过 getReader 获取流读取器，用 TextDecoder 把二进制数据解码成文本，循环 read 读取数据片段，最后拼接到缓冲区实时展示，实现 AI 回答边接收边渲染。

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
    this.controller = null;
    // 全局流状态：是否正在进行流式输出
    this.isStreaming = false;
    // 内容缓冲区：存储完整的响应文本，保证内容不丢失
    this.buffer = '';
    // SSE 连接实例（用于管理 SSE 连接状态）
    this.eventSource = null;
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
    this.stop();

    // 新建 SSE 连接（浏览器原生 API，自动处理重连）
    this.eventSource = new EventSource(url);
    // 标记流开始
    this.isStreaming = true;
    // 清空缓冲区，准备接收新内容
    this.buffer = '';

    /**
     * SSE 连接成功回调
     */
    this.eventSource.onopen = () => {
      // 通知外部：连接已建立，开始推流
      options.onStart?.();
    };

    /**
     * 接收服务器推送的消息（核心：每收到一段数据就触发）
     */
    this.eventSource.onmessage = (event) => {
      // 如果已经停止流，则不处理消息
      if (!this.isStreaming) return;

      try {
        // 解析后端返回的 JSON 数据
        const data = JSON.parse(event.data);
        // 取出本次推送的文本片段
        const chunk = data.content || '';
        // 将片段追加到缓冲区
        this.buffer += chunk;
        // 回调通知外部：收到新片段，返回 片段内容 + 完整内容
        options.onChunk?.(chunk, this.buffer);

        // 如果后端标记传输完成
        if (data.done) {
          // 停止流
          this.stop();
          // 回调通知外部：传输完成
          options.onComplete?.(this.buffer);
        }
      } catch (e) {
        // 消息解析失败，抛出错误
        options.onError?.('消息解析失败');
      }
    };

    /**
     * SSE 连接异常处理
     */
    this.eventSource.onerror = (error) => {
      // 停止流
      this.stop();
      // 回调通知错误
      options.onError?.(error);
    };

    return this.eventSource;
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
      this.stop();
      // 清空缓冲区
      this.buffer = '';
      // 标记流开始
      this.isStreaming = true;
      // 创建中断控制器，用于手动终止请求
      this.controller = new AbortController();

      // 回调通知：开始请求
      options.onStart?.();

      // 发起 POST 请求，开启流式读取
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: this.controller.signal // 绑定中断信号
      });

      // 请求失败直接抛出异常
      if (!response.ok) throw new Error('请求失败');

      // 获取流式读取器
      const reader = response.body.getReader();
      // 文本解码器：将二进制流转为字符串
      const decoder = new TextDecoder();

      // 循环读取流
      while (this.isStreaming) {
        // 读取一段数据
        const { done, value } = await reader.read();
        // 数据读完则退出循环
        if (done) break;

        // 解码二进制数据
        const chunk = decoder.decode(value, { stream: true });
        // 追加到缓冲区
        this.buffer += chunk;
        // 回调通知：收到新片段
        options.onChunk?.(chunk, this.buffer);
      }

      // 停止流
      this.stop();
      // 回调通知：完成
      options.onComplete?.(this.buffer);
      return this.buffer;
    } catch (error) {
      // 异常处理
      this.stop();
      options.onError?.(error.message || '连接异常');
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
      this.stop();
      // 清空缓冲区
      this.buffer = '';
      // 标记开始
      this.isStreaming = true;
      // 回调通知开始
      options.onStart?.();

      // 将文本拆分为字符数组，实现逐字输出
      const chars = text.split('');
      let index = 0;
      // 打字速度默认 30ms 一个字
      const speed = options.speed || 30;

      // 定时器：逐字推送
      const timer = setInterval(() => {
        // 停止条件：手动停止 或 文本输出完毕
        if (!this.isStreaming || index >= chars.length) {
          clearInterval(timer);
          this.stop();
          options.onComplete?.(this.buffer);
          resolve(this.buffer);
          return;
        }

        // 取出一个字符
        const char = chars[index++];
        // 追加到缓冲区
        this.buffer += char;
        // 回调通知：输出一个字符
        options.onChunk?.(char, this.buffer);
      }, speed);
    });
  }

  /**
   * 统一停止所有流式传输
   * 功能：中断 Fetch、关闭 SSE、重置状态
   */
  stop() {
    // 标记流结束
    this.isStreaming = false;

    // 1. 中断 Fetch 请求
    this.controller?.abort();
    this.controller = null;

    // 2. 关闭 SSE 连接
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * 重置管理器
   * 功能：停止流 + 清空缓冲区
   */
  reset() {
    this.stop();
    this.buffer = '';
  }
}

// 单例模式导出：全局唯一实例，所有组件共用同一个流管理器
export default new StreamManager();
```

核心要点：

- res.body.getReader() 获取 ReadableStream 的读取器
- TextDecoder 把 Uint8Array 转成字符串
- 用 buffer 拼接跨 chunk 的数据，防止 SSE 消息被截断
- 每条 SSE 消息格式：event: xxx\ndata: xxx\n\n

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

- 封装 MarkdownRenderManager，统一处理：
- 解析流式片段（不完整也能安全渲染）
- 代码块高亮、代码复制
- 表格、列表、引用、公式适配
- 安全过滤 XSS

````js
// 导入 marked 库：用于将 Markdown 文本解析为 HTML
import { marked } from 'marked';
// 导入 highlight.js：用于代码块语法高亮
import hljs from 'highlight.js';
// 安全渲染（防止XSS）
import DOMPurify from 'dompurify';

/**
 * Markdown 渲染器类
 * 功能：专门处理 AI 知识库中流式回答的 Markdown 渲染
 * 包含：代码高亮、自定义代码块、表格、链接、复制功能、安全解析
 * 设计模式：单例模式，全局一个渲染器即可
 */
export class MarkdownRenderer {
  /**
   * 构造函数
   * 作用：类初始化时就完成 marked 配置，避免重复配置
   */
  constructor() {
    // 初始化配置 marked
    this.configureMarked();
  }

  /**
   * 配置 marked 解析规则（核心配置）
   * 作用：统一设置全局解析规则、代码高亮、自定义渲染节点
   */
  configureMarked() {
    // 全局配置 marked 选项
    marked.setOptions({
      // 代码高亮处理函数
      highlight: (code, lang) => {
        // 如果指定了语言，并且 hljs 支持该语言
        if (lang && hljs.getLanguage(lang)) {
          try {
            // 使用指定语言进行高亮
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {
            console.error('Highlight error:', e);
          }
        }
        // 如果没有指定语言 / 不支持，自动识别高亮
        return hljs.highlightAuto(code).value;
      },
      // 开启换行符转换：将 \n 转为 <br>，适合流式文本展示
      breaks: true,
      // 开启 GFM 标准：支持表格、删除线、任务列表等
      gfm: true
    });

    // ------------------------------
    // 创建自定义渲染器：控制 HTML 输出结构
    // ------------------------------
    const renderer = new marked.Renderer();

    /**
     * 自定义代码块渲染（最核心、最加分）
     * 作用：给代码块增加 头部、语言标识、复制按钮
     * @param code 代码内容
     * @param language 代码语言
     */
    renderer.code = (code, language) => {
      // 取语言，没有则默认 plaintext
      const lang = language || 'plaintext';
      // 代码高亮处理
      const highlighted = hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value;

      // 1. 判断语言里是否带文件名（格式：js:index.js 这种）
      const hasFileName = lang.includes(':') ? lang.split(':')[1] : '';
      // 2. 提取真正的代码语言（去掉文件名）
      const realLang = lang.includes(':') ? lang.split(':')[0] : lang;
      // 3. 生成代码行号（核心功能）
      const lineNumbers = code
        .split('\n')
        .map((_, i) => `<span class="line">${i + 1}</span>`)
        .join('');

      // 返回自定义 HTML 结构（带语言、复制按钮、样式容器）
      return `
        <div class="code-block">
          <div class="code-header">
            <span class="language">${realLang}</span>
            ${hasFileName ? `<span class="filename">${hasFileName}</span>` : ''}
            <div class="code-actions">
              <button class="copy-btn" onclick="copyCode(this)">复制</button>
              <button class="fold-btn" onclick="toggleCode(this)">收起</button>
            </div>
          </div>
          <div class="code-body">
            <div class="line-numbers">${lineNumbers}</div>
            <pre><code class="hljs language-${realLang}">${highlighted}</code></pre>
          </div>
        </div>
      `;
    };

    /**
     * 自定义表格渲染
     * 作用：给表格加外层容器，方便做横向滚动（企业文档必备）
     */
    renderer.table = (header, body) => {
      return `
        <div class="table-wrapper">
          <table class="markdown-table">
            <thead>${header}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    };

    /**
     * 自定义链接渲染
     * 作用：外部链接自动新窗口打开，增加安全属性
     */
    renderer.link = (href, title, text) => {
      // 判断是否为外部链接
      const external = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttr}${external}>${text}</a>`;
    };

    // 自定义图片渲染
    renderer.image = (href, title, alt) => {
      const altText = alt || '图片';
      const titleAttr = title ? `title="${title}"` : '';
      return `
        <div class="image-wrapper">
          <img 
            src="${href}" 
            alt="${altText}"
            ${titleAttr}
            loading="lazy"
            class="markdown-img"
            onclick="previewImage(this)"
            onError="this.style.display='none'"
          >
        </div>
      `;
    };

    // 将自定义渲染器注入 marked
    marked.use({ renderer });
  }

  /**
   * 渲染 Markdown 文本 → HTML
   * @param markdown 原始文本
   * @returns 渲染后的 HTML
   */
  render(markdown) {
    try {
      // 调用 marked 解析
      return marked.parse(markdown);
    } catch (error) {
      // 异常捕获：防止流式文本不完整导致页面崩溃
      console.error('Markdown parse error:', error);
      return `<p>解析错误: ${error.message}</p>`;
    }
  }

  /**
   * 安全渲染（企业级必备）
   * 作用：防止 XSS 攻击
   * 实际项目中会搭配 DOMPurify 对 HTML 进行过滤
   */
  renderSafe(markdown) {
    const html = this.render(markdown);
    // 企业项目必须在这里加 DOMPurify 净化
    // 核心：清洗危险标签、脚本、事件
    return DOMPurify.sanitize(html, {
      // 允许代码高亮的 class
      ADD_ATTR: ['class'],
      // 允许使用代码高亮的样式
      ALLOW_UNKNOWN_PROTOCOLS: true
    });
  }

  /**
   * 工具方法：从 Markdown 中提取所有代码块
   * 用途：代码批量复制、代码审查、代码展示
   */
  extractCodeBlocks(markdown) {
    // 正则匹配 ```语言\n代码``` 格式
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    // 循环提取所有代码块
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  /**
   * 独立代码高亮方法（可复用）
   * 直接对代码字符串进行高亮，不渲染完整 Markdown
   */
  highlightCode(code, language) {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value;
    }
    return hljs.highlightAuto(code).value;
  }
}

// 单例模式导出：全局只创建一个实例，避免重复配置、提升性能
export default new MarkdownRenderer();

// ------------------------------
// 全局复制函数
// 作用：点击代码块的复制按钮，复制代码到剪贴板
// ------------------------------
window.copyCode = function (button) {
  // 找到最近的代码块容器
  const codeBlock = button.closest('.code-block');
  // 获取代码文本
  const code = codeBlock.querySelector('code').textContent;

  // 调用浏览器剪贴板 API
  navigator.clipboard.writeText(code).then(() => {
    // 复制成功后按钮文字变化
    button.textContent = '已复制';
    // 2秒后恢复
    setTimeout(() => {
      button.textContent = '复制';
    }, 2000);
  });
};
````

### 3.2 Markdown 渲染演示组件

接收打字机输出的文本，调用 Manager 渲染成富文本，支持边流边渲染。

### 面试时你怎么介绍这段代码？

- 我封装了一个MarkdownRenderer 类，专门处理 AI 知识库的流式回答渲染。
- 内部基于 marked + highlight.js 实现，做了自定义代码块、代码高亮、复制功能、表格适配、外部链接新窗口打开。
- 同时做了异常捕获、安全渲染、代码块提取，采用单例模式，全局只初始化一次，性能更好。
- 这个类是整个 AI 回答展示的UI 渲染核心，能流畅支持流式、不完整 Markdown 渲染。

### 1. 自定义代码块 怎么做？

- 我通过 marked 自定义渲染器，重写了 renderer.code 方法。
- 把默认的代码块，改成了带头部、语言标签、复制按钮的结构。
- 外层套容器，方便样式控制和点击复制，整体就是企业级的代码块展示效果。
  `marked.Renderer()`、`重写code方法`、`自定义HTML结构`

### 2. 代码高亮 怎么做？

- 集成了 highlight.js，在 marked 配置里注册 highlight 函数。
- 解析代码块时，自动根据语言进行语法高亮，不指定语言就自动识别。最终返回带高亮样式的 HTML，页面直接渲染彩色代码。
  关键词（必说）：`highlight.js`、`自动识别语言`、`语法高亮`

### 3. 复制功能 怎么做？

- 我在代码块头部加了复制按钮，点击时通过 navigator.clipboard 写入剪贴板。
- 用 closest 找到代码块，提取 code 标签文本，复制成功后按钮文字变成 “已复制”，2 秒后自动恢复。
  关键词（必说）：`clipboard API`、`DOM查找`、`按钮状态切换`

### 4. 表格适配 怎么做？

- 重写了 renderer.table 方法，给表格外层包了一层 table-wrapper。
- 这样可以实现横向滚动，企业文档里的宽表格不会把页面撑开，体验更友好。
  关键词（必说）：`自定义table渲染`、`外层容器`、`横向滚动适配`

### 5. 外部链接新窗口打开 怎么做？

- 重写了 renderer.link 方法，判断链接是否以 http 开头。
- 如果是外部链接，自动加上 target="\_blank" 和 rel="noopener"，保证安全，并且在新标签页打开。
  关键词（必说）：`判断外链`、`target="_blank`、`rel安全属性`

### 6. 流式渲染 Markdown，语法不完整（如代码块只一半、加粗不闭合），你是怎么处理的？

因为流式返回是逐字、逐段的，Markdown 语法经常被截断，比如代码块只返回一半 ```js、加粗只写 abc，  
直接解析会导致标签不闭合、页面错乱、DOM 崩溃 \*\*。  
我在项目里用了4 种处理方案：  
1.不实时解析，先把内容存到缓冲区 buffer，等一段完整后再解析；  
2.使用防抖（debounce），等流暂停 300~500ms 再解析，保证语法完整；  
3.解析前做语法容错修复，自动补全不闭合的代码块、加粗、列表；  
4.用 DOMPurify 做安全净化，避免不完整标签导致页面异常。  
5.这样即使流式输出不完整，也能正常解析、页面不乱、样式不崩。

## 4）打字机效果（AI 对话灵魂）

### 4.1 打字机效果管理器

1.封装 TypewriterManager，控制：  
2.逐字输出速度  
3.中英文差异化速度  
4.暂停、继续、中断  
5.避免闪烁、抖动、重复渲染  
6.我做了增量更新，只追加字符，不整段替换，性能非常好

```js
/**
 * 打字机效果管理器
 * 功能：实现 AI 回答流式逐字输出、光标动画、删除效果、标点暂停、延迟控制
 * 设计模式：单例模式，全局共用一个实例
 * 应用场景：AI 知识库流式回答、对话界面逐字渲染
 */
export class TypewriterEffect {
  /**
   * 构造函数：初始化打字机配置
   * @param {Object} options - 配置项
   * @param {number} options.speed - 打字速度（毫秒/字），默认 50ms
   * @param {string} options.cursor - 光标字符，默认 "|"
   * @param {boolean} options.loop - 是否循环，默认 false
   */
  constructor(options = {}) {
    // 打字速度：每个字的间隔时间
    this.speed = options.speed || 50;
    // 光标样式：默认 |
    this.cursor = options.cursor || '|';
    // 是否循环播放（打字+删除循环），一般 AI 场景不用
    this.loop = options.loop || false;
  }

  /**
   * 基础打字机效果
   * 作用：逐字输出文本，通过回调实时返回当前文本
   * @param {string} text - 要输出的完整文本
   * @param {Function} callback - 回调函数，实时返回打字中的内容
   * @returns {Promise<string>} 最终完整文本
   */
  async type(text, callback) {
    // 当前已打出的文字
    let currentText = '';

    // 循环逐字拼接
    for (let i = 0; i < text.length; i++) {
      // 拼接当前字符
      currentText += text[i];
      // 回调通知外部：返回当前打字内容
      callback(currentText);
      // 等待打字速度延迟
      await this.delay(this.speed);
    }

    // 返回最终完整文本
    return currentText;
  }

  /**
   * 带光标的打字机效果（直接操作 DOM 元素）
   * 作用：打字时显示光标，结束后隐藏
   * @param {HTMLElement} element - 要渲染的 DOM 元素
   * @param {string} text - 文本内容
   */
  async typeWithCursor(element, text) {
    let currentText = '';

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      // 文本 + 光标一起显示
      element.textContent = currentText + this.cursor;
      await this.delay(this.speed);
    }

    // 打字完成，移除光标
    element.textContent = currentText;
  }

  /**
   * 逐字删除效果（倒着打字）
   * 作用：从后往前逐字删除文本
   * @param {string} text - 要删除的完整文本
   * @param {Function} callback - 实时返回删除中的内容
   * @returns {Promise<string>} 空字符串
   */
  async delete(text, callback) {
    // 从完整文本开始删除
    let currentText = text;

    // 逐字删除，直到删完
    while (currentText.length > 0) {
      // 删除最后一个字符
      currentText = currentText.slice(0, -1);
      // 回调返回删除中内容
      callback(currentText);
      // 删除速度更快（速度/2）
      await this.delay(this.speed / 2);
    }

    return currentText;
  }

  /**
   * 智能打字机：遇到标点符号暂停（最接近 AI 真实效果）
   * 作用：在句子结束标点处停顿，更自然、更拟人
   * @param {string} text - 文本
   * @param {Function} callback - 实时回调
   * @param {Array} pauseChars - 触发暂停的标点符号
   * @returns {Promise<string>} 完整文本
   */
  async typeWithPause(text, callback, pauseChars = ['.', '!', '?', '。', '！', '？']) {
    let currentText = '';

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      callback(currentText);

      // 如果当前字符是标点符号 → 暂停更久（模拟语气停顿）
      if (pauseChars.includes(text[i])) {
        await this.delay(this.speed * 5);
      } else {
        await this.delay(this.speed);
      }
    }

    return currentText;
  }

  /**
   * 延迟工具函数（Promise 封装）
   * 作用：让异步函数等待指定毫秒数
   * @param {number} ms - 毫秒
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 计算打字总时长
   * 用途：用于动画控制、进度预测、自动滚动
   * @param {string} text - 文本
   * @returns {number} 总时长（毫秒）
   */
  calculateDuration(text) {
    return text.length * this.speed;
  }
}

// 单例模式导出：全局唯一实例
export default new TypewriterEffect();
```

## 面试官最常问的 4 个问题

### 一、面试官问：打字机效果是怎么实现的？

- 我封装了一个单例模式的 TypewriterEffect 打字机管理器，核心是通过 async/await + 延迟函数 实现逐字输出。
- 遍历文本内容，每拼接一个字符就调用一次回调更新视图，然后等待指定速度延迟，再继续下一个字。
- 同时支持光标动画、标点停顿、删除效果，整体流畅拟人，非常适合 AI 流式回答场景。

### 二、面试官问：你的打字机有哪些功能？

- 基础逐字打字：遍历字符 + 延迟 + 实时回调
- 带光标渲染：打字时显示光标，结束自动隐藏
- 智能标点停顿：遇到句号、问号等自动延长停顿，更拟人
- 逐字删除效果：反向删除文本，用于重新生成等场景

### 三、面试官问：为什么用 async/await 而不是 setInterval？

因为 async/await 能精准控制每一步节奏，逻辑更清晰、更容易控制中断、扩展标点停顿等功能。
setInterval 是固定时间，不好动态调整停顿，也不方便处理异常中断。

### 四、面试官问：标点停顿有什么用？

在句子结束的标点（。！？）处延长延迟，让 AI 回答更接近人类说话语气，不会一直匀速输出显得机械，体验更自然。

### 五、面试官问：和流式输出怎么配合？

后端流式返回 chunk，前端把内容拼接到缓冲区，然后交给打字机逐字渲染，实现边接收、边输出，让用户不用等全部内容返回就能看到回答，等待感更低、体验更流畅。

### 六、 内容很长、频繁渲染怎么优化？（高频加分题）

- 控制字符输出速度，避免过快导致页面卡顿；
- 使用 requestAnimationFrame 让渲染更顺滑；
- 对 Markdown 内容不实时解析，而是等一段完整内容后再解析，避免语法截断；
- 长文本使用增量渲染，不每次都重绘全部内容。

### 七、 在打字机执行过程中，如果出现网络中断、流异常结束、用户手动中断等情况，我会做这几步处理：

- 先终止当前打字的异步遍历，清除正在执行的延迟定时器，避免继续无效渲染；
- 把页面上未完成的文字直接展示完整，不再继续逐字播放，保证内容可用；
- 同时隐藏光标，恢复正常文本展示状态，避免界面出现残留光标；
- 如果是可重试场景，会触发异常重试机制，重新请求流式内容，恢复渲染。

### 4.2 打字机效果演示组件

接收流式字符串 → 逐字输出 → 传给 Markdown 渲染。

## 5）对话历史管理

### 5.1 对话历史管理器

ChatHistoryManager 负责：

- 历史消息存储
- 清空 / 删除 / 重新生成
- 本地缓存（localStorage/indexedDB）
- 与后端同步历史记录

```js
// 导入 Dexie：IndexedDB 的封装库，简化本地数据库操作
import Dexie from 'dexie';

/**
 * 对话历史管理器
 * 功能：本地持久化存储 AI 对话记录、会话管理、消息增删改查、导入导出、搜索
 * 技术：Dexie + IndexedDB（浏览器原生数据库，可存储大量数据）
 * 设计模式：单例模式，全局唯一实例
 * 应用场景：AI 知识库对话历史、多会话切换、历史记录持久化
 */
export class ChatHistoryManager {
  /**
   * 构造函数：初始化数据库
   * 1. 创建数据库
   * 2. 定义表结构
   * 3. 初始化当前会话 ID
   */
  constructor() {
    // 初始化 IndexedDB 数据库，库名：ChatDatabase
    this.db = new Dexie('ChatDatabase');

    // 定义数据库版本和表结构（version 1）
    this.db.version(1).stores({
      // 会话表：存储对话列表（++id 自增主键）
      conversations: '++id, title, createdAt, updatedAt',
      // 消息表：存储每条消息，关联会话 ID
      messages: '++id, conversationId, role, content, createdAt'
    });

    // 当前正在使用的会话 ID
    this.currentConversationId = null;
  }

  /**
   * 创建新会话
   * @param {string} title - 会话标题（默认：新对话）
   * @returns {Promise<number>} 新会话 ID
   */
  async createConversation(title = '新对话') {
    // 向 conversations 表添加一条记录
    const id = await this.db.conversations.add({
      title: title,
      createdAt: Date.now(), // 创建时间戳
      updatedAt: Date.now() // 更新时间戳
    });

    // 设置为当前活跃会话
    this.currentConversationId = id;
    return id;
  }

  /**
   * 获取所有会话列表
   * 排序：按更新时间倒序（最新的排在最上面）
   */
  async getAllConversations() {
    return await this.db.conversations
      .orderBy('updatedAt') // 按更新时间排序
      .reverse() // 倒序
      .toArray(); // 转为数组
  }

  /**
   * 获取单个会话详情
   * @param {number} conversationId - 会话 ID
   */
  async getConversation(conversationId) {
    return await this.db.conversations.get(conversationId);
  }

  /**
   * 更新会话信息（标题、时间等）
   * @param {number} conversationId - 会话 ID
   * @param {object} updates - 要更新的字段
   */
  async updateConversation(conversationId, updates) {
    await this.db.conversations.update(conversationId, {
      ...updates,
      updatedAt: Date.now() // 自动更新最后修改时间
    });
  }

  /**
   * 删除会话（连带删除该会话下的所有消息）
   * @param {number} conversationId - 会话 ID
   */
  async deleteConversation(conversationId) {
    // 1. 删除会话本身
    await this.db.conversations.delete(conversationId);
    // 2. 删除该会话下的所有消息（关联删除）
    await this.db.messages.where('conversationId').equals(conversationId).delete();
  }

  /**
   * 添加一条消息（用户提问 / AI 回答）
   * @param {number} conversationId - 会话 ID
   * @param {string} role - 角色：user / assistant
   * @param {string} content - 消息内容
   * @returns {Promise<number>} 消息 ID
   */
  async addMessage(conversationId, role, content) {
    const messageId = await this.db.messages.add({
      conversationId: conversationId,
      role: role,
      content: content,
      createdAt: Date.now()
    });

    // 添加消息后，自动更新会话的最后修改时间
    await this.updateConversation(conversationId, {});

    return messageId;
  }

  /**
   * 获取某个会话的所有消息
   * @param {number} conversationId - 会话 ID
   * @returns {Promise<Array>} 消息列表
   */
  async getMessages(conversationId) {
    return await this.db.messages.where('conversationId').equals(conversationId).toArray();
  }

  /**
   * 删除单条消息
   * @param {number} messageId - 消息 ID
   */
  async deleteMessage(messageId) {
    await this.db.messages.delete(messageId);
  }

  /**
   * 清空所有会话和消息（清空数据库）
   */
  async clearAll() {
    await this.db.conversations.clear();
    await this.db.messages.clear();
  }

  /**
   * 导出会话（会话信息 + 全部消息）
   * 用途：备份、分享、日志
   */
  async exportConversation(conversationId) {
    const conversation = await this.getConversation(conversationId);
    const messages = await this.getMessages(conversationId);

    return {
      conversation,
      messages
    };
  }

  /**
   * 导入会话
   * @param {object} data - 导出的会话数据
   * @returns {Promise<number>} 新会话 ID
   */
  async importConversation(data) {
    // 1. 创建新会话
    const conversationId = await this.db.conversations.add({
      title: data.conversation.title,
      createdAt: data.conversation.createdAt,
      updatedAt: Date.now()
    });

    // 2. 批量导入消息
    for (const message of data.messages) {
      await this.addMessage(conversationId, message.role, message.content);
    }

    return conversationId;
  }

  /**
   * 搜索所有消息（关键词搜索）
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<Array>} 匹配的消息列表
   */
  async searchMessages(keyword) {
    const allMessages = await this.db.messages.toArray();
    return allMessages.filter((msg) => msg.content.toLowerCase().includes(keyword.toLowerCase()));
  }
}

// 单例模式导出：全局唯一实例
export default new ChatHistoryManager();
```

## 面试时你怎么介绍这个类？

- 我封装了 ChatHistoryManager 对话历史管理器，基于 Dexie + IndexedDB 实现本地持久化。
- 主要功能包括多会话管理、消息增删改查、会话导出导入、关键词搜索。
- 采用两张表结构：会话表 + 消息表，通过 conversationId 关联。
- 所有操作都是异步，支持大量聊天记录存储，关闭页面不丢失。

## 面试官必问 4 题

### 1. 为什么用 IndexedDB，不用 localStorage？

- 因为 localStorage 只能存 5MB，聊天记录多了会溢出。IndexedDB 可以存几百 MB，支持结构化存储、索引、查询、异步，更适合对话历史这种大量数据场景。

### 2. 表结构怎么设计的？

2.1 conversations（会话表）  
 **存放会话列表**

- id（主键）
- title（会话标题：需求评审、业务咨询等）
- createdAt（创建时间）
- updatedAt（更新时间）

  2.2 messages（消息表）  
   **存放对话内容**

- id（主键）
- conversationId（关联会话 ID，外键）
- role（user / assistant）
- content（消息内容）
- createdAt（时间）

  2.3 users（配置表）  
   **存放用户设置**

- key
- value  
  **标准的一对多设计。**

### 3. 怎么实现会话删除？

- 删除会话时，同时删除关联的所有消息，避免脏数据。先删会话，再按 conversationId 删除消息。

### 4. 你用 Dexie 操作 IndexedDB 用了哪些方法

```js
  // 增（添加数据）
  add() // 作用：添加一条新数据（会话 / 消息）

  示例：db.conversations.add({ title: '...' })

  // 查（查询数据）
  get()  // 作用：根据主键 ID查单条数据
  getAll() / toArray() // 作用：把表中所有数据转成数组
  where().equals()  // 作用：条件查询（根据 conversationId 查消息）
  orderBy().reverse() // 作用：排序（按时间倒序，最新在前）

  // 改（修改数据）
  update()  // 作用：根据 ID 更新字段（改标题、改时间）

  // 删（删除数据）
  delete()  // 作用：根据 ID 删除单条记录
  where().equals().delete() // 作用：批量删除（删除会话下所有消息）
  clear()  // 作用：清空整张表（清空所有会话 / 消息）
```

### 5.如何确保三张表关联字段的唯一性和一致性

通过主键唯一、外键关联约束、事务级联操作、业务逻辑校验四层保障，确保关联 ID 不重复、不丢失、不错乱。

1. 主键自增保证唯一

- users.userId：主键、唯一、不重复
- conversations.id：主键、唯一
- messages.id：主键、唯一  
  Dexie / IndexedDB 使用 ++id 自增主键，数据库层面保证绝对不重复。

```js
// 唯一性保障：自增主键 ++id
users: '++userId, ...';
conversations: '++id, userId, ...';
messages: '++id, conversationId, ...';
```

1. 外键逻辑关联

- 会话表的 userId 必须指向一个真实存在的用户
- 消息表的 conversationId 必须指向一个真实存在的会话

2. 级联删除保证一致性

- 会话表的 userId 必须指向一个真实存在的用户
- 消息表的 conversationId 必须指向一个真实存在的会话

3. 级联删除保证一致性

- 删除用户 → 删除该用户所有会话
- 删除会话 → 删除该会话所有消息

- 我从数据库层、关联层、业务层、事务层四层确保唯一性和一致性：
- 主键自增保证 ID 绝对唯一；
- 外键关联确保每个会话、消息都归属正确；
- 级联删除保证删除用户 / 会话时，关联数据一起清理；
- 使用数据库事务，保证操作原子性，要么全成功、要么全失败；
- 业务插入前做存在性校验，避免脏数据。
- 这样可以完全保证用户、会话、消息三张表的关联 ID 唯一性、数据一致性。

```js
// 级联删除（一致性保障）
async deleteUser(userId) {
  // 事务：要么全成功，要么全失败
  await this.db.transaction('rw', this.db.users, this.db.conversations, this.db.messages, async () => {
    await this.db.users.delete(userId);
    await this.db.conversations.where('userId').equals(userId).delete();
    await this.db.messages.where('conversationId').notIn(
      await this.db.conversations.toArray().map(c => c.id)
    ).delete();
  });
}
```

1. 事务（Transaction）保证原子性

- 增、删、改使用Dexie 事务
- 要么全部成功，要么全部失败
- 绝对不会出现：只删了会话没删消息。

4. 插入数据前校验

- 添加会话前，检查userId是否存在
- 添加消息前，检查conversationId是否存在
- 避免产生无效脏数据。

### 5.2 对话历史演示组件

虚拟列表渲染长列表，支持滚动定位、未读提示、重新生成回答。

## 6）多轮对话上下文（最加分！）

### 6.1 上下文管理器

- ContextManager 管理多轮对话：
- 保存历史问答对
- 发送请求时自动带上上文
- 控制上下文长度（防止超 token）
- 支持清空上下文、重新生成

```js
/**
 * 上下文管理器（ContextManager）
 * 功能：维护 AI 多轮对话历史、控制上下文长度、Token 估算、上下文压缩、格式化消息
 * 作用：让 AI 能“记住”之前的对话内容，实现真正的多轮交互
 * 设计模式：单例模式，全局唯一上下文
 * 应用场景：AI 知识库多轮对话、上下文传递、防止超 Token、对话记忆
 */
export class ContextManager {
  /**
   * 构造函数：初始化上下文配置
   * @param {Object} options - 配置项
   * @param {number} options.maxContextLength - 最大保留消息条数，默认 10 条
   * @param {number} options.maxTokens - 最大 Token 限制，默认 4000（防止超过模型上限）
   */
  constructor(options = {}) {
    // 最大上下文消息条数（超过自动删除最早的）
    this.maxContextLength = options.maxContextLength || 10;
    // 最大 Token 限制（大模型接口有 Token 上限，超过会报错）
    this.maxTokens = options.maxTokens || 4000;
    // 上下文数组：存储所有对话消息（user + assistant + system）
    this.context = [];
  }

  /**
   * 添加一条消息到上下文
   * @param {string} role - 角色：user / assistant / system
   * @param {string} content - 消息内容
   */
  addMessage(role, content) {
    // 向上下文数组 push 一条消息
    this.context.push({
      role: role,
      content: content,
      timestamp: Date.now() // 记录时间戳（可选）
    });

    // 限制上下文长度：超过最大条数，删除最早的一条（先进先出）
    if (this.context.length > this.maxContextLength) {
      this.context.shift();
    }
  }

  /**
   * 获取完整原始上下文
   * @returns {Array} 完整上下文数组
   */
  getContext() {
    return this.context;
  }

  /**
   * 获取格式化后的上下文（用于传给后端 API）
   * 作用：只保留 role + content，去掉时间戳等无用字段
   * @returns {Array} 接口需要的标准格式
   */
  getFormattedContext() {
    return this.context.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 清空上下文（新对话/重置对话时调用）
   */
  clearContext() {
    this.context = [];
  }

  /**
   * 获取最近 N 条消息
   * @param {number} n - 条数
   * @returns {Array} 最近消息
   */
  getRecentMessages(n) {
    return this.context.slice(-n);
  }

  /**
   * 估算当前上下文总 Token 数（简化版算法）
   * 原理：中文字符 ≈ 1.5 token / 个
   * 作用：防止超过大模型最大 Token 限制
   * @returns {number} 估算 Token 数量
   */
  estimateTokens() {
    // 累加所有消息的文字长度
    const totalLength = this.context.reduce((sum, msg) => sum + msg.content.length, 0);
    // 粗略估算并向上取整
    return Math.ceil(totalLength * 1.5);
  }

  /**
   * 根据 Token 数量自动裁剪上下文
   * 作用：如果 Token 超标，从最早的消息开始删除，直到符合限制
   */
  trimContextByTokens() {
    // 只要 Token 超标，且消息数量 >1，就不断删除最早消息
    while (this.estimateTokens() > this.maxTokens && this.context.length > 1) {
      this.context.shift();
    }
  }

  /**
   * 生成上下文摘要信息（用于调试/展示/日志）
   * @returns {Object} 摘要：总消息数、用户消息数、AI消息数、Token数、深度
   */
  generateSummary() {
    const messages = this.context.length;
    const userMessages = this.context.filter((m) => m.role === 'user').length;
    const assistantMessages = this.context.filter((m) => m.role === 'assistant').length;
    const tokens = this.estimateTokens();

    return {
      totalMessages: messages, // 总消息数
      userMessages: userMessages, // 用户提问数
      assistantMessages: assistantMessages, // AI回答数
      estimatedTokens: tokens, // 估算Token
      contextDepth: Math.min(messages, this.maxContextLength) // 实际上下文深度
    };
  }

  /**
   * 上下文压缩（高级优化）
   * 逻辑：保留系统提示 + 保留最近几条对话，删除早期无关内容
   * 既节省 Token，又不丢失近期记忆
   * @param {number} keepRecent - 保留最近几条消息
   */
  compressContext(keepRecent = 5) {
    // 如果消息本身就很少，不需要压缩
    if (this.context.length <= keepRecent) {
      return;
    }

    // 保留 system 角色消息（如：系统提示词）
    const systemMessages = this.context.filter((m) => m.role === 'system');

    // 保留最近 N 条对话
    const recentMessages = this.context.slice(-keepRecent);

    // 重新组合上下文
    this.context = [...systemMessages, ...recentMessages];
  }
}

// 单例模式导出：全局唯一上下文管理器
export default new ContextManager();
```

### 面试官让你介绍上下文管理器，你直接背：

- 我封装的 ContextManager 是专门管理多轮对话记忆的核心类。
- 它负责存储历史消息、格式化上下文、限制消息条数、估算 Token、自动裁剪超长上下文、上下文压缩。
- 目的是让 AI 能理解多轮对话，同时避免超过模型 Token 限制，保证接口稳定、响应更快、节省成本。

### 面试官必问：多轮对话怎么做？你答：

每次发送问题时，把最近 N 轮问答拼到请求里，后端就能理解上下文。前端通过上下文管理器统一维护，避免组件内混乱。

### 面试官 99% 会问的 4 个问题（直接背）

1. 为什么要做上下文管理？  
   因为 AI 本身没有记忆，必须把历史对话一起传给后端，模型才能理解多轮意图。
2. 为什么要限制长度和 Token？  
   大模型有最大 Token 限制，超过会报错；同时上下文太长会降低响应速度，所以必须自动裁剪。
3. 怎么估算 Token？  
   我用简化算法：中文字符长度 × 1.5，能有效防止超出模型限制。
4. 上下文压缩有什么用？  
   保留系统提示和最近对话，删除早期无关内容，既节省 Token，又保证近期记忆不丢失。

### 估算token和上下文智能压缩实际在业务中的流程

# 真实业务场景组合使用流程（标准实战做法）

## 一、初始化阶段

1. 新建一个上下文数组
2. 设置好最大 Token、保留最近几条对话

## 二、用户每发一次消息 → 固定执行流程（必走）

```
用户提问
    ↓
把用户消息 push 进上下文
    ↓
【Token 自动裁剪】
    - 算一下总 Token
    - 超了就从最前面删，直到合规
    - 目的：保证接口一定能发出去
    ↓
携带上下文请求 AI
    ↓
AI 返回结果
    ↓
把 AI 回答也 push 进上下文
    ↓
【再次做 Token 裁剪】
    - 防止下一轮直接爆炸
    - 这一步是基础保障，每一轮必做
```

## 三、对话变长时的优化处理（≥15～20 轮）

### 触发条件

- 用户一直在聊、历史非常多了
- 即使裁剪后不超 Token，历史还是很乱
- AI 容易抓不住重点，回答开始跑偏、逻辑变弱

### 自动触发上下文压缩

**压缩策略：**

- 保留 system 人设 / 系统提示
- 保留最近 5～6 轮对话
- 更早的历史全部丢掉
- 压缩完再自动做一次 Token 裁剪

> 这一步是质量优化，不是每轮都做，是历史太多才做。

## 四、组合关系总结

| 机制           | 使用频率   | 作用             | 比喻                                         |
| -------------- | ---------- | ---------------- | -------------------------------------------- |
| **Token 裁剪** | 每轮必用   | 保命（不超限制） | 交通警察：每辆车都要查，超员绝对不让上路     |
| **上下文压缩** | 多轮后才用 | 提质（精简结构） | 整理车厢：东西太多太乱，清理垃圾只留重要物品 |

## 五、执行顺序

```
先压缩 → 再裁剪
```

**原因：**

- 压缩是精简结构
- 裁剪是最终把关长度

> 最直白的比喻：**先整理车厢，再查超员**

## 六、面试满分回答（直接背）

> 在实际业务中，我是这样组合使用的：
>
> 每一轮用户提问、AI 回答之后，都会执行 **Token 自动裁剪**，确保上下文长度不会超过模型限制，保证接口能正常调用，这是基础安全机制，**每轮必做**。
>
> 当对话轮次非常多、历史内容过于冗长时，我会自动触发 **上下文压缩**，只保留系统提示词和最近几轮关键对话，清理早期冗余信息，避免 AI 被过多历史干扰，导致回答不准确。
>
> 执行顺序上，**先做上下文压缩，再做 Token 裁剪**，最终保证上下文既精简又合规。
>
> 两者结合，既保证了接口稳定不报错，又让多轮对话的回答质量更高、逻辑更连贯。

### 用于什么场景？（面试必背）

- 多轮对话记忆
- 控制上下文长度，防止消息过多
- Token 估算 + 自动裁剪，防止超模型限制
- 格式化消息，统一传给后端
- 上下文压缩，保留重要信息、删除无用内容
- 切换会话、清空历史、重置对话

### 怎么使用？（流程）

- 用户提问前，把历史对话交给上下文管理器
- 调用 addMessage 把用户问题和 AI 回答加入上下文
- 调用 trimContextByTokens 自动裁剪超长上下文
- 调用 getFormattedContext 获取标准格式传给后端
- 切换会话 / 新对话时，调用 clearContext 清空
- 对话过长时，调用 compressContext 做智能压缩

### 为什么需要？

- 因为 AI 本身没有记忆，必须靠前端把历史对话整理好传给后端，才能实现多轮对话。
- 让 AI 记住历史，知道用户在问什么业务问题。
- 控制上下文长度，避免消息太多导致请求失败。
- Token 估算与自动裁剪，防止超过模型最大 Token 限制报错。
- 统一格式化消息，保证前后端格式一致。
- 智能压缩上下文，保留业务关键信息，节省 Token。
- 如果没有上下文管理器，AI 就无法实现多轮对话，也无法在企业业务场景中稳定使用。

## 难点与亮点

### 难点1: 如何处理流式响应中的断线重连？

### 问题场景: 网络不稳定时，流式传输会中断，已接收的内容可能丢失。

```js
/**
 * 高可靠流式管理器 - ReliableStreamManager
 * 功能：在普通 Fetch Stream 基础上，增加 断点续传、自动重试、进度持久化、异常恢复
 * 解决痛点：网络波动、断网、页面刷新导致流式回答中断，无法恢复
 * 核心特性：断点续传 + 指数退避重试 + 本地进度存储
 * 应用场景：AI 知识库流式回答、长文本输出、弱网环境
 */
class ReliableStreamManager {
  /**
   * 构造函数：初始化可靠流所需状态
   */
  constructor() {
    // 内容缓冲区：存储完整的流式返回内容
    this.buffer = '';
    // 上次流位置：记录已接收内容长度，用于断点续传
    this.lastPosition = 0;
    // 最大重试次数：网络失败最多重试 3 次
    this.maxRetries = 3;
    // 当前重试次数
    this.retryCount = 0;
  }

  /**
   * 创建高可靠流式请求（核心方法）
   * @param {string} url - 后端流式接口地址
   * @param {object} body - 请求参数（问题、上下文等）
   * @param {object} options - 回调：onChunk / onComplete / onError
   */
  async createStream(url, body, options = {}) {
    try {
      // 发起 Fetch 流式请求，携带断点续传信息
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 关键：告诉后端从哪个位置继续推送数据（断点续传）
          'X-Stream-Position': this.lastPosition.toString()
        },
        body: JSON.stringify({
          ...body,
          // 向后端传递：从上次中断的位置恢复
          resumeFrom: this.lastPosition
        })
      });

      // 获取流读取器
      const reader = response.body.getReader();
      // 文本解码器：将二进制流 → 字符串
      const decoder = new TextDecoder();

      // 循环读取流数据
      while (true) {
        const { done, value } = await reader.read();

        // 流读取完成
        if (done) {
          // 通知外部：传输完成
          options.onComplete?.(this.buffer);
          // 完成后重置所有状态
          this.reset();
          break;
        }

        // 解码二进制片段
        const chunk = decoder.decode(value, { stream: true });
        // 将片段追加到缓冲区
        this.buffer += chunk;
        // 更新当前流位置（断点续传关键）
        this.lastPosition += chunk.length;
        // 回调通知外部：收到新片段
        options.onChunk?.(chunk, this.buffer);

        // 关键：实时保存进度到 localStorage（刷新/断网可恢复）
        this.saveProgress();
      }
    } catch (error) {
      // 捕获异常：网络失败、断网、超时
      if (this.retryCount < this.maxRetries) {
        // 未达到最大重试次数，则自动重试
        this.retryCount++;
        console.log(`Retry ${this.retryCount}/${this.maxRetries}`);

        // 指数退避重试：等待时间越来越长（1s → 2s → 4s），避免频繁请求
        await this.delay(Math.pow(2, this.retryCount) * 1000);
        // 重新发起请求（自动携带断点信息）
        return this.createStream(url, body, options);
      } else {
        // 重试次数用完，抛出错误
        options.onError?.(error);
        throw error;
      }
    }
  }

  /**
   * 保存流式进度到 localStorage
   * 作用：页面刷新、重启浏览器后可恢复进度
   */
  saveProgress() {
    localStorage.setItem('stream_buffer', this.buffer);
    localStorage.setItem('stream_position', this.lastPosition.toString());
  }

  /**
   * 从 localStorage 恢复流式进度
   * 作用：刷新页面后继续之前的输出，不会从头开始
   */
  restoreProgress() {
    this.buffer = localStorage.getItem('stream_buffer') || '';
    this.lastPosition = parseInt(localStorage.getItem('stream_position') || '0');
  }

  /**
   * 重置管理器状态（流完成/异常终止时调用）
   * 清空内存 + 清空本地存储
   */
  reset() {
    this.buffer = '';
    this.lastPosition = 0;
    this.retryCount = 0;
    // 清理本地存储
    localStorage.removeItem('stream_buffer');
    localStorage.removeItem('stream_position');
  }

  /**
   * 延迟工具函数（用于重试等待）
   * @param {number} ms - 毫秒
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

## 面试时你怎么介绍这个类？（满分逐字稿）

- 我写了一个高可靠流式管理器 ReliableStreamManager，在普通 Fetch Stream 的基础上做了增强。
- 它实现了断点续传、自动重试、指数退避、进度持久化。即使遇到断网、刷新、网络波动，也能从上次中断的位置继续接收数据，不会丢失内容、不 会从头开始。
- 同时实时把进度保存到 localStorage，大幅提升弱网环境下的用户体验。

1. 记录已接收的位置
2. 断线后从上次位置恢复
3. 指数退避重试策略
4. 本地缓存已接收内容

### 1. 断点续传是怎么实现的？

前端记录已接收内容长度 lastPosition，重试时通过请求头 X-Stream-Position 传给后端，后端从该位置继续推送数据，实现中断恢复。

### 2. 为什么要用指数退避重试？

避免网络异常时频繁疯狂重试，等待时间逐级增加（1s → 2s → 4s），给网络恢复时间，减轻服务器压力。

### 3. 为什么要把进度存在 localStorage？

防止页面刷新、意外关闭导致流式内容丢失，刷新后可以调用 restoreProgress() 恢复输出。

### 4. 这个类比普通 Stream 好在哪里？

普通流断网就废了，必须重发；这个类可恢复、可重试、可持久化，生产环境稳定性极强。

### 5. lastPosition 是干嘛的？

记录已接收文本长度，重试时告诉后端：从这里继续发，不要从头发。

### 6. 什么时候调用 reset ()？

流式完全传输完成后调用，清空缓冲区、重置状态、清理本地存储。

### 如何优化markdown渲染性能

### 问题场景: 长文本Markdown实时渲染会导致页面卡顿。

```js
// 注意：需提前引入 marked 库（marked.parse 用于解析 markdown）
import { marked } from 'marked';

/**
 * 优化版 Markdown 渲染器 - OptimizedMarkdownRenderer
 * 功能：解决 AI 流式输出大段 Markdown 时页面卡顿、渲染频繁、性能差问题
 * 核心特性：缓存 + 防抖 + 增量渲染 + 分块切割 + 异步渲染 + 不阻塞主线程
 * 应用场景：AI 流式回答实时渲染、大文本 Markdown 展示
 * 设计模式：单例/工具类，面向性能优化
 */
class OptimizedMarkdownRenderer {
  /**
   * 构造函数：初始化优化渲染所需的状态
   */
  constructor() {
    // 渲染缓存 Map：存储已渲染好的 HTML，避免重复解析，提升速度
    this.renderCache = new Map();

    // 渲染队列：用于控制渲染顺序（流式输出必备）
    this.renderQueue = [];

    // 是否正在渲染：防止并发渲染冲突
    this.isRendering = false;

    // 防抖定时器：用于 debounceRender 方法
    this.renderTimer = null;
  }

  /**
   * 防抖渲染（核心优化 1）
   * 作用：短时间内多次触发渲染时，只执行最后一次，减少渲染次数
   * 场景：流式输出每字都触发渲染，用防抖降低频率
   * @param {string} markdown - 原始文本
   * @param {Function} callback - 渲染完成回调
   */
  debounceRender(markdown, callback) {
    // 清除上一次定时器
    clearTimeout(this.renderTimer);

    // 重新设置定时器，100ms 内无新触发才执行渲染
    this.renderTimer = setTimeout(() => {
      this.render(markdown, callback);
    }, 100);
  }

  /**
   * 增量渲染（核心优化 2）
   * 作用：分段渲染 Markdown，逐段展示，不阻塞页面
   * 特点：带缓存 + 分块解析 + 异步更新 UI
   * @param {string} markdown - 完整文本
   * @param {Function} callback - 实时返回渲染后的 HTML
   */
  async incrementalRender(markdown, callback) {
    // 1. 生成缓存 key，检查是否已渲染过
    const cacheKey = this.getCacheKey(markdown);
    if (this.renderCache.has(cacheKey)) {
      // 有缓存直接返回，不重复解析
      callback(this.renderCache.get(cacheKey));
      return;
    }

    // 2. 把 Markdown 按规则切割成多个小块
    const chunks = this.splitMarkdown(markdown);
    let renderedHtml = '';

    // 3. 逐块渲染
    for (const chunk of chunks) {
      // 解析当前块
      const chunkHtml = marked.parse(chunk);
      // 拼接到总 HTML
      renderedHtml += chunkHtml;

      // 4. 实时回调：把当前已渲染内容更新到页面
      callback(renderedHtml);

      // 5. 让出主线程：等待浏览器下一帧，防止页面卡顿
      await this.nextTick();
    }

    // 6. 渲染完成，存入缓存
    this.renderCache.set(cacheKey, renderedHtml);
  }

  /**
   * 分块切割 Markdown（核心优化 3）
   * 作用：把大文本分成小块，避免一次性解析超大内容导致卡顿
   * 按行分割，保证块大小适中，不破坏结构
   * @param {string} markdown - 完整文本
   * @param {number} chunkSize - 每块最大长度，默认 1000 字符
   * @returns {Array} 分块数组
   */
  splitMarkdown(markdown, chunkSize = 1000) {
    const chunks = [];
    let currentChunk = '';

    // 按换行符分割，保证不破坏行结构
    const lines = markdown.split('\n');

    for (const line of lines) {
      currentChunk += line + '\n';

      // 当前块达到阈值，推入数组并重置
      if (currentChunk.length >= chunkSize) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }

    // 把最后一段不足阈值的内容推入
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * 生成缓存 Key（简单哈希算法）
   * 作用：把 Markdown 文本转为唯一 hash，用于缓存标识
   * @param {string} markdown - 原始文本
   * @returns {string} 哈希字符串
   */
  getCacheKey(markdown) {
    let hash = 0;
    for (let i = 0; i < markdown.length; i++) {
      const char = markdown.charCodeAt(i);
      // 哈希计算公式
      hash = (hash << 5) - hash + char;
      // 转成32位整数
      hash = hash & hash;
    }
    return hash.toString();
  }

  /**
   * 等待浏览器下一帧（让出主线程）
   * 作用：让浏览器有时间渲染页面，防止 JS 长时间阻塞
   * 流式渲染必备，保证打字机效果流畅不卡顿
   * @returns {Promise}
   */
  nextTick() {
    return new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
  }
}
```

### 面试时你怎么介绍这个类？

- 我写了 OptimizedMarkdownRenderer 优化版渲染器，专门解决 AI 流式输出大段 Markdown 卡顿问题。
- 内部做了 缓存、防抖、增量渲染、分块解析、异步渲染。
- 每次只渲染一小段，用 requestAnimationFrame 让出主线程，保证页面不卡顿。
- 同时用 Map 缓存避免重复渲染，用 防抖减少渲染次数，是企业级流式渲染必备的性能优化方案。

### 面试官最爱问的 6 个问题（直接背）

1. 为什么要做增量渲染？  
   因为一次性渲染大段 Markdown 会阻塞主线程，页面卡顿。增量渲染分段解析、分段展示，保证打字机效果流畅。
2. 防抖有什么用？  
   流式输出每一个字符都会触发渲染，用防抖合并多次渲染，减少解析次数，提升性能。
3. 缓存作用是什么？  
   相同内容只渲染一次，重复渲染直接从缓存取，大幅提升速度。
4. 为什么要分块？  
   避免超大文本一次性解析造成卡顿，分块后浏览器可以逐段渲染，不阻塞 UI。
5. nextTick 为什么用 requestAnimationFrame？  
   让 JS 暂停，把控制权还给浏览器，让浏览器有时间渲染页面，保证打字机效果流畅。
6. 这个渲染器比普通渲染好在哪？  
   普通渲染：大文本卡顿、频繁解析、无缓存、性能差优化渲染：不卡顿、不阻塞、少解析、速度快，适合企业级流式输出。

## 智能上下文压缩

- 根据消息重要性压缩上下文
- 保留关键信息，移除冗余内容
- 动态调整上下文深度

```js
/**
 * 智能上下文管理器 - SmartContextManager
 * 功能：基于业务消息重要性评分实现智能上下文压缩，自动保留关键业务对话，丢弃无关内容
 * 核心能力：业务导向评分机制 + 智能筛选 + 动态Token保留策略
 * 解决痛点：传统上下文压缩只会删除最早消息，容易丢失关键业务信息；
 *          智能压缩会优先保留业务核心内容，更贴合企业多部门使用场景
 * 应用场景：企业级业务AI知识库、跨部门业务咨询、需求流程查询、评审规范问答、制度政策解读
 */
class SmartContextManager {
  /**
   * 构造函数：初始化上下文配置与状态
   * @param {Object} options - 配置项
   * @param {number} options.maxTokens - 模型最大Token限制，默认 4000
   */
  constructor(options = {}) {
    // 模型最大Token上限，超过会触发压缩
    this.maxTokens = options.maxTokens || 4000;

    // 上下文数组：存储 system + user + assistant 完整对话
    this.context = [];
  }

  /**
   * 【企业级】多层加权消息重要性评分
   * 打分维度：角色权重、时效性、业务关键词命中、信息密度、长文本智能判断
   * 作用：为每条消息计算业务价值分数，分数越高越需要保留
   * @param {Array} messages - 对话历史消息列表
   * @returns {Array} 每条消息对应的分数列表
   */
  scoreMessages(messages) {
    return messages.map((msg, index) => {
      let score = 0;

      // 系统提示词（人设/规则）→ 最高优先级
      if (msg.role === 'system') {
        score += 100;
      }
      // 用户提问 → 核心意图，高权重
      if (msg.role === 'user') {
        score += 40;
      }
      // AI 回答 → 常规权重
      if (msg.role === 'assistant') {
        score += 20;
      }

      // 时效性加分：越新的消息相关性越强，分数越高
      const timeScore = (messages.length - index) * 8;
      score += timeScore;

      // 业务关键词命中计分（企业业务核心词库）
      const businessKeywords = [
        '需求',
        '评审',
        '流程',
        '规范',
        '制度',
        '业务',
        '项目',
        '重要',
        '关键',
        '必须',
        '注意',
        '政策',
        '变更',
        '风险',
        '上线',
        '版本',
        '规则',
        '问题',
        '方案'
      ];
      const hitCount = businessKeywords.filter((kw) => msg.content.includes(kw)).length;
      score += hitCount * 30;

      // 低信息密度内容惩罚（语气词过多）
      const fillerWords = ['嗯', '啊', '那个', '就是', '其实', '说白了', '也就是说', '对吧'];
      const fillerCount = fillerWords.reduce((cnt, w) => cnt + (msg.content.includes(w) ? 1 : 0), 0);
      if (fillerCount >= 2) score -= 30;

      // 无业务关键词内容惩罚
      if (hitCount === 0) score -= 20;

      // 长文本智能处理
      const len = msg.content.length;
      // 长文本 + 无业务关键词 → 低密度冗余 → 扣分
      if (len > 600 && hitCount === 0) {
        score -= 50;
      }
      // 长文本 + 业务关键词多 → 高密度业务内容 → 加分
      if (len > 600 && hitCount >= 2) {
        score += 15;
      }

      // 确保分数不为负
      return Math.max(score, 0);
    });
  }

  /**
   * 【动态策略】根据Token占用量计算需要保留的消息条数
   * 规则：Token越紧张，压缩力度越大，确保不超出模型限制
   * @returns {number} 保留的消息条数
   */
  calculateKeepCount() {
    const tokens = this.estimateTokens();

    // Token充足：保留全部
    if (tokens < this.maxTokens * 0.5) {
      return this.context.length;
    }
    // Token中等：温和压缩，保留70%
    else if (tokens < this.maxTokens * 0.8) {
      return Math.ceil(this.context.length * 0.7);
    }
    // Token紧张：重度压缩，保留50%
    else {
      return Math.ceil(this.context.length * 0.5);
    }
  }

  /**
   * 【核心】智能上下文压缩（业务优先）
   * 执行流程：
   * 1. 分离系统消息并强制保留
   * 2. 对对话消息进行多层加权评分
   * 3. 按分数从高到低排序
   * 4. 根据Token占用动态筛选高分消息
   * 5. 恢复原始对话顺序
   * 6. 替换为新的高质量上下文
   */
  compressContext() {
    const messages = this.context;

    // 分离并保留系统消息
    const systemMsg = messages.filter((m) => m.role === 'system');
    const dialogMsg = messages.filter((m) => m.role !== 'system');

    // 对对话消息进行评分
    const scores = this.scoreMessages(dialogMsg);

    // 绑定分数与原始索引，按分数排序
    const sortedMessages = dialogMsg.map((msg, index) => ({ msg, score: scores[index], index })).sort((a, b) => b.score - a.score);

    // 动态计算保留条数
    const keepCount = this.calculateKeepCount();

    // 筛选高分消息并恢复原始顺序
    const keepDialog = sortedMessages
      .slice(0, keepCount)
      .sort((a, b) => a.index - b.index)
      .map((item) => item.msg);

    // 最终上下文 = 系统消息 + 精选高价值对话
    this.context = [...systemMsg, ...keepDialog];
  }

  /**
   * 估算上下文总Token（简易版，可根据实际场景替换）
   * @returns {number} 估算Token数
   */
  estimateTokens() {
    const totalText = this.context.map((msg) => msg.content).join('');
    // 中文场景粗略估算：1汉字 ≈ 1.5 token
    return Math.ceil(totalText.length * 1.5);
  }

  /**
   * 向上下文追加消息
   * @param {string} role - 角色：system / user / assistant
   * @param {string} content - 消息内容
   */
  addMessage(role, content) {
    this.context.push({
      role,
      content,
      timestamp: Date.now()
    });
  }

  /**
   * 获取当前格式化后的上下文（用于接口请求）
   * @returns {Array} 标准格式消息列表
   */
  getFormattedContext() {
    return this.context.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 清空上下文
   */
  clear() {
    this.context = [];
  }
}
```

## 面试时你怎么介绍这段代码？

- 我实现了智能上下文管理器 SmartContextManager，用于解决长对话上下文冗余问题。
- 它通过自定义评分算法给每条消息打分，包括时效性、用户消息、代码块、重要关键词、消息长度等维度。
- 压缩时会自动保留高分重要消息，并根据Token 占用动态调整保留数量。
- 相比普通的 “删最早消息”，这种方式更智能、更安全、不丢失关键对话，同时大幅节省 Token，提升模型响应速度。

## 面试官 99% 会问的 6 个问题（业务知识库版・直接背）

### 智能上下文压缩和普通压缩有什么区别？

普通压缩只会删最早的消息，很容易删掉关键的业务内容；智能压缩会给每条消息按业务重要性打分，只删不重要的内容，优先保留业务核心信息，效果更贴合企业场景。
你的评分规则有哪些？我根据企业业务场景设置了几个核心维度：

- 越近期的消息 + 分
- 用户的业务提问 + 分
- 包含业务关键词（需求、评审、流程、规范等）+ 高分
- 包含重要、关键、注意等强调性内容 + 分
- 业务类长文本不扣分

### 为什么业务关键词分数最高？

因为我做的是企业业务 AI 知识库，业务规则、需求要点、评审结论、流程规范是整个对话的核心，一旦丢失，AI 就无法理解业务场景，回答会偏离业务，所以这部分权重最高。

### 为什么用户消息比 AI 消息重要？

- 因为用户的提问代表真实的业务意图，AI 是围绕用户问题来回答的。用户问题不能丢，而 AI 的部分解释性内容可以适度精简。
- 动态保留数量有什么用？根据 Token 占用自动调节压缩强度：Token 充足就不压缩，Token 快超标就加强压缩，在保留业务信息的同时，保证接口不超限、不报错。
- 为什么保留消息后要重新排序？因为按分数排序会打乱对话原本的先后顺序，必须按原始索引重新排序，才能保证业务对话逻辑连贯、上下文不乱。

### 长文本会不会导致搜索（检索）不准？

- 有可能，但不是长文本本身导致不准，而是因为文本太长、信息太杂，会让向量表征变模糊，召回不精准。
- 所以在我们 RAG 架构里，真正做检索的是后端的文档分块（chunk），前端只负责对话和展示。
- 而我在前端上下文压缩里保留长业务文本，是因为：
- 已经检索回来的内容都是相关的业务片段，
- 这些内容是 AI 回答业务问题的核心依据，不能随便删，
- 我控制的是对话历史长度，不是原始文档长度，
- 所以不会影响检索准确性，只会让 AI 回答更完整、更贴近业务。

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
9. 在 AI 流式输出过程中，如果返回的 Markdown 标签被截断（如代码块未闭合），前端如何处理渲染？

- 使用防抖和增量渲染，减少半段标签解析频率
- 对 marked 解析做 try/catch 异常捕获，保证不崩溃
- 检测末尾不完整标签，自动忽略或补全闭合
- 用 DOMPurify 净化修复不合法 HTML 结构
- 分块按行渲染，避免语法断裂

10. 什么是 RAG（检索增强生成）？前端在 RAG 流程中可以参与哪些工作？  
    先从企业私有知识库 / 向量库中检索相关文档片段，把这些资料作为上下文交给大模型，让模型基于真实资料回答，而不是凭空生成。  
    解决痛点：AI 胡编乱造、知识滞后、无法使用企业内部数据
    - 用户提出问题
    - 问题向量化 → 去向量库检索
    - 召回相关文档片段
    - 拼接：系统提示 + 历史对话 + 检索片段 + 用户问题
    - 送给大模型生成回答
    - 流式返回前端，并展示引用来源
