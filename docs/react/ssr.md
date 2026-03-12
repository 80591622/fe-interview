# React 服务端渲染

服务端渲染 (SSR) 是一种在服务器端生成 HTML 并发送给客户端的技术，可以提高首屏加载速度和 SEO 友好性。

## 1. 什么是服务端渲染 (SSR)？它与客户端渲染有什么区别？

**服务端渲染 (SSR)** 是指在服务器端生成 HTML 并发送给客户端的过程。

**客户端渲染** 是指在客户端（浏览器）中生成 HTML 的过程。

**区别**：
| 特性 | 服务端渲染 | 客户端渲染 |
|------|-----------|-----------|
| 首屏加载速度 | 快 | 慢 |
| SEO 友好性 | 好 | 差 |
| 服务器负载 | 高 | 低 |
| 客户端资源消耗 | 低 | 高 |
| 开发复杂度 | 高 | 低 |

## 2. React 中实现服务端渲染的方式有哪些？

**实现方式**：

- **Next.js**：React 官方推荐的 SSR 框架
- **Gatsby**：基于 React 的静态站点生成器
- **自定义 SSR**：使用 ReactDOMServer 自行实现
- **Remix**：基于 React 的全栈框架

**Next.js 优势**：

- 零配置
- 自动代码分割
- 内置路由
- 支持静态生成和服务器端渲染
- 丰富的生态系统

## 3. 什么是 Next.js？它的核心特性是什么？

**Next.js** 是一个基于 React 的前端框架，提供了服务端渲染、静态生成等功能。

**核心特性**：

- **服务端渲染 (SSR)**：在服务器端生成 HTML
- **静态生成 (SSG)**：在构建时生成静态 HTML
- **增量静态再生 (ISR)**：在构建后更新静态内容
- **自动代码分割**：减少初始加载时间
- **内置路由**：基于文件系统的路由
- **API 路由**：在同一代码库中创建 API 端点
- **国际化支持**：内置 i18n 支持
- **图像优化**：自动优化图像

## 4. 服务端渲染的工作原理是什么？

**服务端渲染的工作原理**：

1. 客户端发送 HTTP 请求到服务器
2. 服务器接收请求，执行 React 代码生成 HTML
3. 服务器将生成的 HTML 发送给客户端
4. 客户端接收 HTML 并显示内容
5. 客户端加载 JavaScript 代码，激活页面（hydration）

**Hydration**：

- 客户端加载 JavaScript 代码
- React 接管服务器生成的 HTML
- 绑定事件监听器
- 使页面变为可交互状态

## 5. 服务端渲染的优势和劣势是什么？

**优势**：

- **首屏加载速度快**：减少了客户端的渲染时间
- **SEO 友好**：搜索引擎可以直接索引服务器生成的 HTML
- **减少客户端资源消耗**：减轻了客户端的计算负担
- **更好的用户体验**：用户可以更快地看到内容

**劣势**：

- **服务器负载增加**：服务器需要执行 React 代码
- **开发复杂度增加**：需要处理服务端和客户端的差异
- **构建时间延长**：需要在服务器端构建应用
- **可能的性能问题**：如果服务器处理能力不足，可能会影响响应速度

## 6. 如何在 Next.js 中实现服务端渲染？

**在 Next.js 中实现服务端渲染**：

1. **使用 getServerSideProps**：

```jsx
export async function getServerSideProps(context) {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data }
  };
}

function Page({ data }) {
  return <div>{data}</div>;
}

export default Page;
```

2. **使用 getInitialProps**（Next.js 9.3 之前的方式）：

```jsx
function Page({ data }) {
  return <div>{data}</div>;
}

Page.getInitialProps = async (context) => {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return { data };
};

export default Page;
```

**注意事项**：

- getServerSideProps 在每次请求时都会执行
- 只能在页面组件中使用
- 不能在客户端组件中使用

## 7. 什么是静态生成 (SSG)？它与服务端渲染有什么区别？

**静态生成 (SSG)** 是指在构建时生成静态 HTML 文件的过程。

**与服务端渲染的区别**：
| 特性 | 静态生成 | 服务端渲染 |
|------|---------|-----------|
| 生成时机 | 构建时 | 每次请求时 |
| 服务器负载 | 低 | 高 |
| 响应速度 | 快 | 中等 |
| 适用场景 | 内容不频繁变化的页面 | 内容频繁变化的页面 |

**在 Next.js 中实现静态生成**：

```jsx
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data }
  };
}

function Page({ data }) {
  return <div>{data}</div>;
}

export default Page;
```

## 8. 什么是增量静态再生 (ISR)？

**增量静态再生 (ISR)** 是 Next.js 引入的特性，允许在构建后更新静态内容，而不需要重新构建整个应用。

**工作原理**：

1. 在构建时生成静态 HTML
2. 当用户请求页面时，返回静态 HTML
3. 同时，后台重新生成页面
4. 下次请求时，返回更新后的静态 HTML

**使用方法**：

```jsx
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data },
    revalidate: 60 // 60 秒后重新生成
  };
}
```

**优势**：

- 结合了静态生成和服务端渲染的优点
- 减少了构建时间
- 提高了响应速度
- 降低了服务器负载

## 9. 如何处理服务端和客户端的差异？

**服务端和客户端的差异**：

- **API 访问**：服务端可以直接访问后端 API，客户端需要通过网络请求
- **环境变量**：服务端可以访问所有环境变量，客户端只能访问以 NEXT*PUBLIC* 开头的环境变量
- **浏览器 API**：服务端没有浏览器 API，如 window、document 等
- **数据获取**：服务端可以在渲染前获取数据，客户端需要在组件挂载后获取

**处理方法**：

1. **使用条件判断**：

```jsx
if (typeof window !== 'undefined') {
  // 客户端代码
  window.scrollTo(0, 0);
}
```

2. **使用 useEffect**：

```jsx
useEffect(() => {
  // 客户端代码
  window.scrollTo(0, 0);
}, []);
```

3. **使用动态导入**：

```jsx
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
});
```

## 10. 服务端渲染的性能优化策略有哪些？

**性能优化策略**：

1. **使用缓存**：
   - 缓存 API 响应
   - 缓存页面渲染结果
   - 使用 CDN 缓存静态资源

2. **优化数据获取**：
   - 减少 API 请求次数
   - 并行获取数据
   - 使用数据预取

3. **代码分割**：
   - 按路由分割代码
   - 按需加载组件
   - 减少初始加载体积

4. **优化服务器**：
   - 使用高性能服务器
   - 配置适当的服务器资源
   - 启用 gzip 压缩

5. **使用增量静态再生**：
   - 对于不频繁变化的内容，使用 ISR
   - 减少服务器的渲染负担

6. **监控和分析**：
   - 监控服务器性能
   - 分析页面加载时间
   - 优化瓶颈点

**Next.js 特定优化**：

- 使用 `next/image` 优化图像
- 使用 `next/link` 预加载页面
- 使用 `next/font` 优化字体加载
- 配置适当的 `revalidate` 时间
