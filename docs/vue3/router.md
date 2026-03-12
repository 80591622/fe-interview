# Vue Router 相关

## Vue Router 实现原理

- Vue Router 是 Vue 的官方路由管理器，用于构建单页应用。
- 核心原理是通过监听 URL 的变化，匹配对应的路由规则，渲染相应的组件。
- 支持 hash 模式和 history 模式。
- 提供了路由守卫、动态路由、嵌套路由等功能。

## hash 和 history 区别

- hash 模式：URL 中包含 # 符号，# 后面的内容不会发送到服务器，通过监听 hashchange 事件来处理路由变化。
- history 模式：使用 HTML5 的 History API，URL 更加美观，但需要服务器配置支持，否则刷新会 404。
- hash 模式兼容性更好，history 模式 URL 更友好。

## history 模式为什么刷新会 404

- history 模式使用 HTML5 的 History API，URL 中不包含 # 符号。
- 当用户刷新页面时，浏览器会向服务器发送请求，而服务器上没有对应的路由，因此会返回 404。
- 解决方法是在服务器上配置 fallback 路由，将所有请求都重定向到 index.html。

## 路由守卫执行顺序

- 全局前置守卫（router.beforeEach）
- 路由独享守卫（beforeEnter）
- 组件内守卫（beforeRouteEnter）
- 全局解析守卫（router.beforeResolve）
- 导航确认
- 全局后置守卫（router.afterEach）
- 组件内守卫（beforeRouteEnter 的 next 回调）

## 动态路由原理

- 动态路由是指路由路径中包含参数，例如 /user/:id。
- 原理是通过正则表达式匹配 URL，提取参数并传递给组件。
- 组件可以通过 $route.params 或 useRoute() 来获取路由参数。
- 动态路由适用于需要根据不同参数显示不同内容的场景。
