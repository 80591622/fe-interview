# 微前端问题及解决方案

## 技术栈

- **主应用**：Vue 3 + TypeScript + Pinia + Vite
- **子应用**：Vue 3 + Webpack（历史项目，均基于 Webpack 构建）
- **微前端框架**：qiankun 2.x

## 子应用使用 Webpack 原因

子应用大多是从原有单体系统拆分出来的历史项目，本身基于 Webpack 构建；qiankun 对 Webpack 的支持非常成熟，子应用只需配置 UMD 输出格式即可接入，改造成本低。而 Vite 子应用需要额外的插件和配置来解决 ESM 与 qiankun 沙箱的兼容问题，考虑到稳定性和改造成本，选择保持子应用原有的 Webpack 构建方式。

本文记录了从技术调研到生产上线过程中遇到的各种坑、尝试的解决方案、以及最终形成的最佳实践。

## 第零阶段：加载模式选择

### 背景

qiankun 提供两种加载子应用的方式：
- **registerMicroApps + start**：声明式，qiankun 自动管理
- **loadMicroApp**：命令式，开发者手动控制

### 初始尝试：registerMicroApps + start

```javascript
// main.ts
import { registerMicroApps, start } from "qiankun";

registerMicroApps([
  {
    name: "sub-app-1",
    entry: "//localhost:3000",
    container: "#sub-app-container",
    activeRule: "/sub-app-1",
  },
]);

start();
```

### 🔴 踩坑 0：容器必须始终存在

**现象**：路由切换时报错 `Target container with #sub-app-container not existed`

**原因**：registerMicroApps + start 模式要求子应用容器始终存在于 DOM 中，但项目布局为：每个子应用页面有独立的控制面板，容器随路由组件动态创建 / 销毁

**尝试解决**：使用 v-show 让容器始终存在

```vue
<template>
  <div>
    <router-view v-show="!isSubApp" />
    <div id="sub-app-1-container" v-show="currentApp === 'sub-app-1'"></div>
    <div id="sub-app-2-container" v-show="currentApp === 'sub-app-2'"></div>
  </div>
</template>
```

**❌ 问题**：布局变得复杂，每个子应用的控制面板无法独立管理。

### 最终决定：使用 loadMicroApp

#### 选择理由

- **布局灵活**：中后台系统每个业务模块都有独立的操作面板和工具栏，容器需要随路由组件动态创建 / 销毁
- **精细控制**：部分子应用需要根据用户权限动态加载，需要在 onMounted 时根据权限判断是否加载
- **独立页面**：每个业务子应用有独立的面包屑、操作按钮区域，无法共用统一容器
- **运维仪表盘需求**：产品要求实现类似 Grafana 的仪表盘页面，同时展示多个监控子应用

#### 代码示例

```javascript
// 使用 loadMicroApp
import { loadMicroApp } from "qiankun";

onMounted(() => {
  microApp = loadMicroApp({
    name: "sub-app-1",
    entry: "//localhost:3000",
    container: "#sub-app-1-box",
    props: {
      /* ... */
    },
  });
});

onUnmounted(() => {
  microApp?.unmount();
});
```

### ✅ 阶段成果

- 确定使用 loadMicroApp 模式
- 不再调用 start()，完全手动控制子应用生命周期
- 为了实现 URL 同步，主应用为子应用定义了路由（/sub-app-1/:subpath(.*)*），但这不是 loadMicroApp 的必需配置

## 第一阶段：基础通信方案

### 目标

实现主子应用之间的状态共享和通信。业务场景包括：
- 用户登录信息（token、用户名、权限列表）需要在所有子应用中共享
- 全局配置（主题、语言、租户信息）需要实时同步
- 子应用之间需要进行业务数据传递（如订单模块跳转到客户模块时携带客户 ID）

### 初始方案：使用 qiankun 内置 initGlobalState

```javascript
// 主应用
import { initGlobalState } from "qiankun";

const actions = initGlobalState({ name: "test", age: 18 });
actions.onGlobalStateChange((state, prev) => {
  console.log("主应用监听到变化", state, prev);
});
```

### 🔴 踩坑 1：initGlobalState 限制太多

**问题**：
- 子应用只能修改主应用初始化时定义的属性
- 新增属性会被静默忽略
- 无法与 Pinia 深度集成

**决定**：放弃 initGlobalState，自己基于 Pinia 实现通信方案。

### 自定义方案：基于 Pinia 的通信

```typescript
// 主应用 globalStore.ts
export const useGlobalStore = defineStore("global", () => {
  const state = reactive<GlobalState>({ ...DEFAULT_STATE });

  function getGlobalState() {
    return { ...toRaw(state) };
  }

  function setGlobalState(partialState: Partial<GlobalState>) {
    Object.assign(state, partialState);
    notifySubscribers();
  }

  // 通过 props 传递给子应用
  function createSubAppMethods(appName: string) {
    return {
      getGlobalState,
      setGlobalState,
      onGlobalStateChange: (callback) => {
        /* ... */
      },
    };
  }

  return { state, getGlobalState, setGlobalState, createSubAppMethods };
});
```

### 🔴 踩坑 2：qiankun 覆盖同名方法

**现象**：子应用调用 props.setGlobalState() 时，执行的不是我们传递的方法，而是 qiankun 内置的方法。

**原因**：qiankun 会自动向子应用 props 注入 setGlobalState 和 onGlobalStateChange，覆盖了我们的同名方法。

**解决方案**：重命名所有方法，使用 Main 前缀：

```typescript
// 修改前
getGlobalState, setGlobalState, onGlobalStateChange, offGlobalStateChange;

// 修改后
getMainState, setMainState, onMainStateChange, offMainStateChange;
```

### ✅ 阶段成果

- 实现了两种同步模式：实时同步（适用于需要即时响应的模块如消息中心）和按需获取（适用于数据变化不频繁的模块如系统设置）
- 添加了运行时属性校验，防止未声明属性被使用，避免线上出现难以排查的 bug

## 第二阶段：路由跳转方案

### 目标

实现子应用跳转到主应用路由，以及子应用之间的跳转。业务场景：
- 订单详情页点击 "查看客户" 跳转到客户管理子应用
- 子应用中的 "返回首页" 按钮跳转到主应用首页
- 审批流程中跨多个子应用的流转

### 初始方案：传递 parentRouter

```javascript
// 主应用
loadMicroApp({
  props: {
    parentRouter: router, // 传递主应用 router
  },
});

// 子应用
const parentRouter = inject("parentRouter");
parentRouter.push("/about"); // 跳转到主应用路由
```

### 🔴 踩坑 3：浏览器返回按钮异常

**现象**：从订单子应用跳转到客户子应用后，点击浏览器返回按钮，不是返回订单页面，而是直接跳到系统首页。测试同学提了 P1 级 bug。

**原因**：主应用和子应用都使用 createWebHistory，两个 router 都监听 popstate 事件，产生冲突。

### 深入分析：Vue Router 4 的 history.state 问题

这个问题的根本原因在于 Vue Router 4 没有对 history.state 做唯一性标记，导致多个 router 实例会互相干扰。

#### Vue Router 3.x 的实现（有唯一标识）：

```javascript
// vue-router 3.x - src/util/push-state.js
const Time = window.performance || Date;
let _key = genKey();

function genKey() {
  return Time.now().toFixed(3); // ✅ 生成唯一 key
}

function pushState(url, replace) {
  const state = { key: genKey() }; // ✅ 每次导航都有唯一标识
  if (replace) {
    history.replaceState(state, "", url);
  } else {
    history.pushState(state, "", url);
  }
}

// 在 popstate 监听中会校验 key
window.addEventListener("popstate", (e) => {
  const current = getStateKey();
  if (e.state && e.state.key) {
    setStateKey(e.state.key); // ✅ 通过 key 判断是否是自己的路由
  }
});
```

#### Vue Router 4.x 的实现（无唯一标识）：

```typescript
// vue-router 4.x - src/history/html5.ts
function buildState(
  back: HistoryLocation | null,
  current: HistoryLocation,
  forward: HistoryLocation | null,
  replaced: boolean = false,
  computeScroll: boolean = false
): StateEntry {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length - 1,
    scroll: computeScroll ? computeScrollPosition() : null,
    // ❌ 注意：没有任何唯一标识！
  };
}

// popstate 监听中直接读取 state，不做来源校验
window.addEventListener("popstate", ({ state }: PopStateEvent) => {
  const fromState: StateEntry = historyState.value; // ❌ 直接读取，不判断来源
  const toState: StateEntry = state;
  // 两个 router 都会执行到这里，互相干扰
});
```

### 冲突场景示意

```css
时间线：
1. 主应用 router 写入 state: { current: '/home', position: 1 }
2. 子应用 router 写入 state: { current: '/list', position: 2 }
3. 用户点击浏览器返回按钮
4. 触发 popstate 事件
5. 主应用 router 读取 state → 可能读到子应用写入的 { current: '/list' }
6. 子应用 router 读取 state → 可能读到主应用写入的 { current: '/home' }
7. 两边都乱了！
```

### 为什么 Vue Router 3 没有这个问题？

Vue Router 3 通过 genKey() 为每次导航生成唯一标识，在 popstate 事件中会校验 state.key，只处理属于自己的路由记录。而 Vue Router 4 移除了这个机制，导致多个 router 实例共享同一个 history.state，互相覆盖。

### 尝试解决方法

#### 尝试 1：setTimeout 延迟跳转

```javascript
setTimeout(() => {
  parentRouter.push("/about");
}, 0);
```

**❌ 无效，问题依旧。**

#### 尝试 2：使用原生 History API + dispatchEvent

```javascript
function navigateTo(path) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
}
```

**❌ 部分有效，但仍有问题。**

### 最终方案：子应用使用 memoryHistory

#### 核心思路

- 子应用使用 createMemoryHistory，不监听浏览器 popstate
- 跨应用导航由主应用 router 统一处理
- 子应用内部路由变化通过 syncRoute 同步到浏览器 URL

#### 代码示例

```javascript
// 子应用 main.js
router = createRouter({
  history: window.__POWERED_BY_QIANKUN__
    ? createMemoryHistory() // 微前端环境用 memoryHistory
    : createWebHistory("/"), // 独立运行用 webHistory
  routes,
});
```

```typescript
// 主应用 globalStore.ts
function navigateTo(options: NavigateOptions): void {
  const { path, appName, replace = false } = options;
  let targetPath = path;

  if (appName) {
    const routeConfig = subAppRoutes.get(appName);
    if (routeConfig) {
      targetPath = `${routeConfig.basePath}${path}`;
    }
  }

  if (replace) {
    mainRouter.replace(targetPath);
  } else {
    mainRouter.push(targetPath);
  }
}
```

### ✅ 阶段成果

- 浏览器返回按钮正常工作
- 跨应用导航正常

## 第三阶段：URL 同步问题

### 🔴 踩坑 4：子应用内部路由不更新 URL

**现象**：用户在订单子应用内从列表页跳转到详情页，浏览器地址栏 URL 不变，导致用户无法分享链接、刷新后丢失页面状态。产品经理表示这是不可接受的体验问题。

**原因**：子应用使用 createMemoryHistory，路由变化不会反映到浏览器 URL。

**解决方案**：添加 syncRoute 方法，子应用路由变化时同步到浏览器 URL。

```typescript
// 主应用
function syncSubAppRoute(appName: string, subPath: string): void {
  const routeConfig = subAppRoutes.get(appName);
  const fullPath =
    subPath === "/"
      ? routeConfig.basePath
      : `${routeConfig.basePath}${subPath}`;

  // 使用 replaceState，不产生新的历史记录
  window.history.replaceState(null, "", fullPath);
}
```

```javascript
// 子应用
router.afterEach((to) => {
  globalStore.syncRoute(to.path);
});
```

### ✅ 阶段成果

- 子应用内部路由变化时，浏览器 URL 同步更新

## 第四阶段：直接访问深层路由

### 🔴 踩坑 5：直接访问子应用深层路由失败

**现象**：用户收藏了订单详情页链接 https://xxx.com/order/detail/12345，第二天打开时显示的是订单列表页而不是详情页。客服收到大量用户投诉。

**原因**：子应用使用 createMemoryHistory，默认从 / 开始，不会读取浏览器 URL。

**解决方案**：主应用传递 initialPath，子应用挂载前先跳转。

```javascript
// 主应用
const subpath = route.params.subpath;
const initialPath = subpath
  ? "/" + (Array.isArray(subpath) ? subpath.join("/") : subpath)
  : "/";

loadMicroApp({
  props: {
    initialPath,
    // ...
  },
});
```

```javascript
// 子应用
if (window.__POWERED_BY_QIANKUN__ && initialPath && initialPath !== "/") {
  router.replace(initialPath).then(() => {
    instance.mount(container);
  });
} else {
  instance.mount(container);
}
```

### 🔴 踩坑 6：initialPath 导致返回按钮异常

**现象**：用户直接访问订单详情页 /order/detail/12345，点击页面上的 "返回列表" 按钮无响应，控制台不停打印日志，页面卡死。

**原因**：
- 子应用 "返回列表" 使用 router.back()
- 但 memoryHistory 中只有一条记录（/detail/12345），无法后退
- router.back() 可能触发了某种循环

**解决方案**：子应用的 "返回" 按钮在微前端环境下使用 router.push("/") 而非 router.back()。

```javascript
const handleBack = () => {
  if (window.__POWERED_BY_QIANKUN__) {
    router.push("/"); // 直接跳转到首页
  } else {
    router.back(); // 独立运行时正常后退
  }
};
```

### 🔴 踩坑 7：syncRoute 在初始路由时触发

**现象**：直接访问深层路由时， afterEach 钩子触发 syncRoute，导致 URL 被覆盖。

**解决方案**：使用标志位跳过初始路由的同步。

```javascript
if (window.__POWERED_BY_QIANKUN__) {
  let isInitialNavigation = true;
  router.afterEach((to) => {
    if (isInitialNavigation) {
      isInitialNavigation = false;
      return; // 跳过初始路由
    }
    globalStore.syncRoute(to.path);
  });
}
```

### 🔴 踩坑 7.1：isInitialNavigation 标志位放置位置

#### 背景

在实现踩坑 7 的解决方案时，讨论了 isInitialNavigation 标志位应该放在哪里。

#### 三种方案对比

| 方案        | 代码位置                                  | 执行时机         | 子应用切换后再回来               |
| ----------- | ----------------------------------------- | ---------------- | -------------------------------- |
| 模块顶层    | 文件顶部 `let isInitialNavigation = true` | 模块加载时       | ❌ 不会重置，标志位仍为 false     |
| bootstrap   | bootstrap() 中设置                        | 子应用首次初始化 | ❌ 不会重置，bootstrap 只执行一次 |
| render 内部 | render() 函数内定义                       | 每次 mount       | ✅ 每次都重置为 true              |

#### 场景分析

用户操作流程：访问 /sub-app-1/about → 切换到 /sub-app-2 → 再切回 /sub-app-1/detail

- 如果标志位在模块顶层或 bootstrap：第三步时 isInitialNavigation 已经是 false，初始路由会触发 syncRoute，可能覆盖 URL
- 如果标志位在 render 内部：第三步时 isInitialNavigation 重新初始化为 true，正确跳过初始路由

#### 最终决定：标志位放在 render() 函数内部

```javascript
// ✅ 正确做法：标志位在 render 内部
function render(props) {
  // ... 创建 router 等

  if (window.__POWERED_BY_QIANKUN__) {
    let isInitialNavigation = true; // 每次 mount 都重新初始化
    router.afterEach((to) => {
      if (isInitialNavigation) {
        isInitialNavigation = false;
        return;
      }
      globalStore.syncRoute(to.path);
    });
  }
}
```

#### 选择理由

- **语义正确**：「跳过初始路由」应该是「每次挂载时跳过第一次」，而非「整个生命周期只跳过一次」
- **逻辑内聚**：initialPath 通过 props 在 mount 时传入，标志位放在 render 内部与之呼应
- **场景覆盖**：正确处理子应用切换后再回来的场景

### ✅ 最终成果

- 直接访问子应用深层路由正常工作
- 子应用内部导航正常
- 跨应用导航正常
- 浏览器返回按钮正常

## 最终架构

```scss
┌─────────────────────────────────────────────────────────────┐
│                        主应用                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   GlobalStore                        │   │
│  │  - state (Pinia reactive)                           │   │
│  │  - navigateTo() → 使用主应用 router                  │   │
│  │  - syncSubAppRoute() → history.replaceState         │   │
│  │  - createSubAppMethods() → 生成子应用通信方法        │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│              props: { initialPath, navigateTo, syncRoute }  │
│                              ▼                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                      子应用                           │  │
│  │  - createMemoryHistory() 避免 popstate 冲突          │  │
│  │  - router.afterEach → syncRoute 同步 URL            │  │
│  │  - initialPath → 挂载前跳转到初始路由                │  │
│  │  - navigateTo → 跨应用导航                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 第五阶段：多子应用仪表盘实现

### 目标

系统在微前端改造之前就有一个运维监控仪表盘页面，需要同时展示多个监控模块（日志监控、性能指标、告警中心）。这个功能是最终选择 loadMicroApp 模式的核心原因之一 ——registerMicroApps + start 模式根本无法优雅实现这种多子应用并行加载的场景。

### 为什么 registerMicroApps + start 难以实现？

在技术选型阶段，首先尝试了 registerMicroApps + start 模式，但很快发现它无法满足仪表盘的需求。

#### registerMicroApps + start 模式的核心限制

- **路由互斥设计**：基于 single-spa 的路由监听，一个 URL 对应一个激活的子应用
- **自动卸载机制**：当 URL 变化时，自动卸载当前子应用，加载新子应用
- **容器限制**：所有子应用容器必须始终存在于 DOM 中

```javascript
// registerMicroApps 模式 - 子应用是路由互斥的
registerMicroApps([
  {
    name: "sub-app-1",
    activeRule: "/sub-app-1", // 只有访问 /sub-app-1 时才激活
  },
  {
    name: "sub-app-3",
    activeRule: "/sub-app-3", // 只有访问 /sub-app-3 时才激活
  },
]);
// 无法同时激活两个子应用！
```

#### 理论上的解决方案（但不推荐）

```javascript
// 尝试让两个子应用同时激活
registerMicroApps([
  {
    name: "sub-app-1",
    activeRule: "/dashboard", // 都在 /dashboard 激活
    container: "#app-1-container",
  },
  {
    name: "sub-app-3",
    activeRule: "/dashboard", // 都在 /dashboard 激活
    container: "#app-3-container",
  },
]);
```

**❌ 问题**：
- 两个容器必须始终存在于 DOM
- 无法灵活控制加载顺序和时机
- 无法传递不同的 props（如 dashboardMode）
- 布局控制困难

### loadMicroApp 的优势

```javascript
// loadMicroApp 模式 - 完全手动控制
onMounted(() => {
  // 可以同时加载多个子应用
  microApp1 = loadMicroApp({
    name: "sub-app-1",
    container: "#dashboard-app-1",
    props: { dashboardMode: true },
  });

  microApp3 = loadMicroApp({
    name: "sub-app-3",
    container: "#dashboard-app-3",
    props: { dashboardMode: true },
  });
});
```

**✅ 优势**：
- 完全控制加载时机
- 可以传递不同的 props
- 容器可以动态创建
- 灵活的布局控制

### 🔴 踩坑 8：仪表盘模式下 URL 同步冲突

**现象**：在运维仪表盘页面，当用户在日志监控面板切换 Tab 时，性能指标面板的 URL 被覆盖，导致刷新后两个面板状态都丢失。

**原因**：两个子应用都在 router.afterEach 中调用 syncRoute，互相覆盖浏览器 URL。

**解决方案**：引入 dashboardMode 标识，仪表盘模式下禁用 URL 同步。

```javascript
// 主应用传递 dashboardMode
loadMicroApp({
  props: {
    dashboardMode: true, // 关键标识
    // 不传递 syncRoute，或传递空函数
  },
});
```

```javascript
// 子应用根据 dashboardMode 控制行为
router.afterEach((to) => {
  // 仪表盘模式下不同步 URL
  if (props.dashboardMode) return;
  props.syncRoute?.(to.path);
});
```

### 🔴 踩坑 9：仪表盘模式下跨应用导航按钮

**现象**：在运维仪表盘页面，用户点击日志监控面板中的 "查看详情" 按钮（原本设计为跳转到日志详情页），结果整个仪表盘页面被替换，用户需要重新进入仪表盘。

**原因**：跨应用导航会触发主应用路由变化，离开 /dashboard 页面。

**解决方案**：仪表盘模式下隐藏跨应用导航按钮，只保留内部页面切换。

```vue
<!-- 子应用组件 -->
<template>
  <!-- 仪表盘模式下隐藏跨应用导航 -->
  <div v-if="!dashboardMode" class="cross-app-nav">
    <button @click="navigateToOtherApp">跳转到其他应用</button>
  </div>

  <!-- 内部路由始终可用 -->
  <div class="internal-nav">
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
  </div>
</template>
```

### 🔴 踩坑 10：多子应用状态同步

**现象**：在运维仪表盘页面，运维人员在控制面板切换监控时间范围（如从 "最近 1 小时" 切换到 "最近 24 小时"），只有日志监控面板刷新了数据，性能指标面板没有响应。

**原因**：状态变化通知机制只通知了第一个注册的监听器，后注册的子应用没有收到通知。

**解决方案**：确保 GlobalStore 的 notifySubscribers 遍历所有订阅者。

```typescript
// globalStore.ts
const subscribers = new Map<string, StateChangeCallback>();

function notifySubscribers() {
  const currentState = getGlobalState();
  // 遍历所有订阅者
  subscribers.forEach((callback, appName) => {
    try {
      callback(currentState);
    } catch (error) {
      console.error(`通知 ${appName} 失败:`, error);
    }
  });
}
```

### 仪表盘页面最终实现

以下是运维监控仪表盘的核心实现代码：

```vue
<!-- DashboardView.vue - 运维监控仪表盘 -->
<template>
  <div class="dashboard-container">
    <h1>运维监控中心</h1>

    <!-- 统一控制面板 - 时间范围选择器 -->
    <div class="control-panel">
      <div class="time-range">
        <span>监控时间范围：</span>
        <el-select v-model="timeRange" @change="onTimeRangeChange">
          <el-option label="最近1小时" value="1h" />
          <el-option label="最近24小时" value="24h" />
          <el-option label="最近7天" value="7d" />
        </el-select>
      </div>
      <div class="actions">
        <el-button @click="refreshAll">刷新全部</el-button>
      </div>
    </div>

    <!-- 子应用并排显示 - 监控面板 -->
    <div class="apps-row">
      <div class="app-wrapper">
        <h3>日志监控</h3>
        <div id="dashboard-log-monitor" class="app-container"></div>
      </div>
      <div class="app-wrapper">
        <h3>性能指标</h3>
        <div id="dashboard-perf-metrics" class="app-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loadMicroApp } from "qiankun";
import { onMounted, onUnmounted, ref } from "vue";
import { useGlobalStore } from "@/stores/globalStore";

const globalStore = useGlobalStore();
const timeRange = ref("1h");

let logMonitorApp = null;
let perfMetricsApp = null;

onMounted(() => {
  const logConfig = globalStore.getMicroAppConfig("log-monitor");
  const perfConfig = globalStore.getMicroAppConfig("perf-metrics");

  // 同时加载两个监控子应用
  logMonitorApp = loadMicroApp({
    ...logConfig,
    container: "#dashboard-log-monitor",
    props: {
      ...globalStore.createSubAppMethods("log-monitor"),
      dashboardMode: true, // 关键：启用仪表盘模式
      initialTimeRange: timeRange.value,
    },
  });

  perfMetricsApp = loadMicroApp({
    ...perfConfig,
    container: "#dashboard-perf-metrics",
    props: {
      ...globalStore.createSubAppMethods("perf-metrics"),
      dashboardMode: true, // 关键：启用仪表盘模式
      initialTimeRange: timeRange.value,
    },
  });
});

onUnmounted(() => {
  logMonitorApp?.unmount();
  perfMetricsApp?.unmount();
});

const onTimeRangeChange = (value) => {
  // 通知所有子应用更新时间范围
  globalStore.setGlobalState({ timeRange: value });
};

const refreshAll = () => {
  globalStore.setGlobalState({ refreshTrigger: Date.now() });
};
</script>

<style scoped>
.apps-row {
  display: flex;
  gap: 20px;
}
.app-wrapper {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
.app-container {
  min-height: 400px;
}
</style>
```

### ✅ 阶段成果

- 成功实现运维监控仪表盘，同时展示日志监控和性能指标两个子应用
- 两个子应用独立运行，互不干扰，各自维护内部状态
- 主应用统一控制面板可以同时向两个子应用广播时间范围变更
- 该方案已在生产环境稳定运行，日均 PV 超过 5000
- 明确展示了 loadMicroApp 相比 registerMicroApps + start 的优势

## registerMicroApps + start 模式的局限性总结

### 核心局限

- **路由互斥设计**
  - 基于 single-spa 的路由监听机制
  - 一个 URL 只能激活一个子应用
  - 难以实现多子应用同时显示

- **容器必须始终存在**
  - 所有子应用容器必须在 DOM 中始终存在
  - 无法随路由组件动态创建 / 销毁
  - 布局灵活性受限

- **生命周期自动管理**
  - 无法精细控制加载 / 卸载时机
  - 无法实现条件加载、懒加载等高级场景
  - 无法为不同场景传递不同的 props

### 适用场景对比

| 场景             | registerMicroApps + start | loadMicroApp |
| ---------------- | ------------------------- | ------------ |
| 简单路由切换     | ✅ 推荐                    | ✅ 可用       |
| 多子应用并行     | ❌ 不适合                  | ✅ 推荐       |
| 仪表盘 / 工作台  | ❌ 不适合                  | ✅ 推荐       |
| 动态容器         | ❌ 不支持                  | ✅ 支持       |
| 弹窗中加载子应用 | ❌ 不适合                  | ✅ 推荐       |
| 精细生命周期控制 | ❌ 不支持                  | ✅ 支持       |

### 结论

如果业务场景需要：
- 同时显示多个子应用（运维仪表盘、工作台、多租户管理）
- 动态创建 / 销毁子应用容器（复杂布局、权限控制）
- 精细控制子应用生命周期（按需加载、条件渲染）
- 在非路由场景加载子应用（弹窗、Tab、抽屉）

那么 loadMicroApp 是唯一合理的选择。

## 第六阶段：子应用入口地址环境配置

### 目标

在开发和生产环境中，子应用的入口地址是不同的：
- 开发环境：//localhost:3000、//localhost:3001 等本地开发服务器地址
- 生产环境：可能是同域部署（window.location.origin）或跨域部署（独立域名）

需要实现一套灵活的配置方案，让子应用入口地址能够根据环境自动切换，同时支持通过环境变量覆盖默认配置。

### 🔴 踩坑 11：硬编码地址导致部署困难

**现象**：开发时一切正常，但部署到测试环境后子应用全部加载失败，因为代码中硬编码了 //localhost:3000。

**原因**：子应用入口地址直接写死在配置文件中，没有区分环境。

```typescript
// ❌ 错误做法：硬编码地址
export const microAppsConfig = [
  {
    name: "sub-app-1",
    entry: "//localhost:3000", // 生产环境无法访问
    // ...
  },
];
```

### 解决方案：环境感知的动态配置

设计了一套配置优先级机制：

```scss
环境变量 (VITE_SUB_APP_X_ENTRY)
         │
         ▼ 不存在时
生产环境配置 (prodEntries) / 开发环境配置 (devEntries)
         │
         ▼ 同域模式时
window.location.origin
```

#### 1. 定义环境配置常量

```typescript
// config/microApps.ts

/** 子应用环境配置 */
interface AppEnvConfig {
  /** 开发环境地址 */
  dev: string;
  /** 生产环境地址（跨域部署时使用） */
  prod: string;
  /** 环境变量名（用于覆盖默认配置） */
  envKey: string;
}

/** 子应用环境配置映射 */
const appEnvConfigs: Record<string, AppEnvConfig> = {
  "sub-app-1": {
    dev: "//localhost:3000",
    prod: "//sub1.example.com",
    envKey: "VITE_SUB_APP_1_ENTRY",
  },
  "sub-app-2": {
    dev: "//localhost:3001",
    prod: "//sub2.example.com",
    envKey: "VITE_SUB_APP_2_ENTRY",
  },
  "sub-app-3": {
    dev: "//localhost:3002",
    prod: "//sub3.example.com",
    envKey: "VITE_SUB_APP_3_ENTRY",
  },
};
```

#### 2. 实现核心配置函数

```typescript
/** 部署模式：同域部署或跨域部署 */
export type DeployMode = "same-origin" | "cross-origin";

/** 默认部署模式 */
const DEFAULT_DEPLOY_MODE: DeployMode = "same-origin";

/**
 * 获取当前部署模式
 */
export function getDeployMode(): DeployMode {
  const envMode = import.meta.env.VITE_DEPLOY_MODE;
  if (envMode === "same-origin" || envMode === "cross-origin") {
    return envMode;
  }
  if (envMode) {
    console.warn(
      `[Environment_Config] 无效的部署模式 "${envMode}"，使用默认值 "${DEFAULT_DEPLOY_MODE}"`
    );
  }
  return DEFAULT_DEPLOY_MODE;
}

/**
 * 从环境变量获取子应用入口地址
 */
export function getEntryFromEnv(appName: string): string | undefined {
  const config = appEnvConfigs[appName];
  if (!config) return undefined;

  const envValue = import.meta.env[config.envKey];
  return envValue || undefined;
}

/**
 * 获取子应用入口地址
 * 优先级：环境变量 > 环境配置 > 默认值
 */
export function getEntry(appName: string): string {
  // 1. 优先检查环境变量
  const envEntry = getEntryFromEnv(appName);
  if (envEntry) {
    return envEntry;
  }

  const config = appEnvConfigs[appName];

  // 2. 开发环境：返回开发地址
  if (import.meta.env.DEV) {
    if (!config) {
      console.warn(`[Environment_Config] 未找到子应用 "${appName}" 的配置`);
      return "";
    }
    return config.dev;
  }

  // 3. 生产环境：根据部署模式返回地址
  const deployMode = getDeployMode();

  // 同域模式：使用当前域名
  if (deployMode === "same-origin") {
    return window.location.origin;
  }

  // 跨域模式：使用配置的生产地址
  if (!config) {
    console.warn(
      `[Environment_Config] 未找到子应用 "${appName}" 的配置，降级到同域模式`
    );
    return window.location.origin;
  }
  return config.prod;
}
```

#### 3. 重构 microAppsConfig 使用动态地址

```typescript
/** 子应用静态配置（不含 entry） */
const microAppsStaticConfig: Omit<MicroAppConfig, "entry">[] = [
  {
    name: "sub-app-1",
    container: "#sub-app-1-box",
    basePath: "/sub-app-1",
  },
  // ... 其他子应用
];

/** 子应用配置列表（动态生成 entry） */
export const microAppsConfig: MicroAppConfig[] = microAppsStaticConfig.map(
  (config) => ({
    ...config,
    entry: getEntry(config.name),
  })
);
```

#### 环境变量配置示例

创建 .env.example 文件作为配置模板：

```bash
# 部署模式配置
# 可选值：same-origin（同域部署）、cross-origin（跨域部署）
VITE_DEPLOY_MODE=same-origin

# 子应用入口地址配置（可选，用于覆盖默认配置）
# VITE_SUB_APP_1_ENTRY=//sub1.example.com
# VITE_SUB_APP_2_ENTRY=//sub2.example.com
# VITE_SUB_APP_3_ENTRY=//sub3.example.com
```

### ✅ 阶段成果

- 子应用入口地址根据环境自动切换
- 支持同域部署和跨域部署两种模式
- 支持通过环境变量覆盖默认配置
- 新增子应用只需在 appEnvConfigs 中添加一条记录
- 保持现有 API 接口不变，向后兼容

## 第七阶段：404 页面统一处理

### 目标

在微前端架构中，需要统一处理 404 页面：
- 主应用路由未匹配时显示 404 页面
- 子应用路由未匹配时，由主应用统一处理 404
- 子应用独立运行时使用自己的 404 页面

### 🔴 踩坑 12：子应用 404 页面显示在主应用容器内

**现象**：用户访问 /sub-app-1/unknown-page 时，子应用的 404 页面显示在主应用的子应用容器内，视觉效果很奇怪，不像是一个完整的 404 页面。

**原因**：子应用注册了 fallback 路由 /:pathMatch(.*)*，未匹配的路由会渲染子应用的 404 组件。

**解决方案**：微前端环境下，子应用不注册 404 路由，通过回调通知主应用统一处理。

```javascript
// 子应用 main.js
const finalRoutes = window.__POWERED_BY_QIANKUN__
  ? routes // 微前端环境：不添加 404 路由
  : [...routes, notFoundRoute]; // 独立运行：添加 404 路由
```

### 🔴 踩坑 13：子应用初始加载时 404 检测失败

**现象**：直接访问 /sub-app-1/unknown-page，子应用没有跳转到主应用 404 页面，而是显示空白。

**原因**：子应用使用memoryHistory，初始加载时路由会先跳转到 /，再跳转到目标路径。在 beforeEach 中检测 404 时，闭包捕获的是第一次导航的 to 对象。

#### 调试日志

```yaml
beforeEach: /unknown-page, matched: 0, isMounted: false
afterEach: /, matched: 1, isInitialNavigation: true
afterEach: /unknown-page, matched: 0, isInitialNavigation: false
setTimeout callback: matched: 1 (错误 - 捕获了旧的 'to')
```

**解决方案**：使用 pendingNotFoundPath 变量保存待处理的 404 路径，而不是依赖闭包。

```javascript
export function setupRouterGuards(router, options = {}) {
  const { onRouteNotFound, onRouteChange } = options;
  let isMounted = false;
  let pendingNotFoundPath = null; // 保存待处理的 404 路径

  router.beforeEach((to, from, next) => {
    if (window.__POWERED_BY_QIANKUN__ && onRouteNotFound) {
      if (to.matched.length === 0) {
        if (isMounted) {
          onRouteNotFound(to.fullPath);
          return;
        } else {
          // 未挂载时，记录路径而不是依赖闭包
          pendingNotFoundPath = to.fullPath;
        }
      }
    }
    next();
  });

  router.afterEach((to) => {
    if (!isMounted) {
      setTimeout(() => {
        isMounted = true;
        // 检查保存的路径，而不是闭包中的 to
        if (
          window.__POWERED_BY_QIANKUN__ &&
          onRouteNotFound &&
          pendingNotFoundPath
        ) {
          onRouteNotFound(pendingNotFoundPath);
          pendingNotFoundPath = null;
        }
      }, 0);
      return;
    }
    if (onRouteChange && to.matched.length > 0) {
      onRouteChange(to.path);
    }
  });
}
```

### 🔴 踩坑 14：404 检测导致子应用卸载错误

**现象**：访问子应用 404 路由时，控制台报错 Cannot unmount an app that is not mounted。

**原因**：在子应用挂载完成前就调用了 onRouteNotFound，导致主应用尝试卸载未挂载的子应用。

**解决方案**：使用 isMounted 标志位，确保只有在子应用挂载完成后才处理 404。

### 主应用 404 页面实现

```vue
<!-- views/notFound/index.vue -->
<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();

// 获取原始访问路径（子应用通过 query.from 传递）
const currentPath = computed(() => {
  const fromPath = route.query.from;
  if (fromPath) return fromPath;
  if (route.path === "/404") return "未知路径";
  return route.fullPath;
});

const handleBackHome = () => router.push("/");

const handleRetry = () => {
  const fromPath = route.query.from;
  if (fromPath) {
    router.push(fromPath);
  } else {
    window.location.reload();
  }
};
</script>
```

### 主应用 globalStore 添加 onRouteNotFound

```typescript
function createSubAppMethods(appName: string): SubAppProps {
  return {
    // ... 其他方法
    onRouteNotFound: (path: string) => {
      const routeConfig = subAppRoutes.get(appName);
      const basePath = routeConfig?.basePath || "";
      const fullPath = path.startsWith("/")
        ? `${basePath}${path}`
        : `${basePath}/${path}`;
      navigateTo({
        path: "/404",
        query: { from: fullPath },
      });
    },
  };
}
```

### ✅ 阶段成果

- 主应用统一处理所有 404 路由
- 子应用检测未匹配路由，通知主应用跳转 404 页面
- 子应用独立运行时使用自己的 404 页面
- 404 页面显示原始访问路径，支持返回首页和重试功能

## 踩坑总结

| 序号 | 问题                         | 原因                            | 解决方案                             |
| ---- | ---------------------------- | ------------------------------- | ------------------------------------ |
| 0    | registerMicroApps 容器限制   | 容器必须始终存在于 DOM          | 改用 loadMicroApp 模式               |
| 1    | initGlobalState 限制太多     | qiankun 设计限制                | 自定义 Pinia 通信方案                |
| 2    | qiankun 覆盖同名方法         | qiankun 自动注入同名方法        | 使用 Main 前缀重命名                 |
| 3    | 浏览器返回按钮异常           | 主子应用 router 都监听 popstate | 子应用使用 memoryHistory             |
| 4    | 子应用内部路由不更新 URL     | memoryHistory 不操作浏览器 URL  | 添加 syncRoute 同步 URL              |
| 5    | 直接访问深层路由失败         | memoryHistory 默认从 / 开始     | 传递 initialPath，挂载前跳转         |
| 6    | initialPath 导致返回按钮异常 | memoryHistory 只有一条记录      | 返回按钮使用 push ("/") 而非 back () |
| 7    | syncRoute 在初始路由时触发   | afterEach 在 replace 后也会触发 | 使用标志位跳过初始路由               |
| 7.1  | 标志位放置位置选择           | 模块顶层 /bootstrap 只执行一次  | 标志位放在 render 函数内部           |
| 8    | 仪表盘模式 URL 同步冲突      | 多子应用同时调用 syncRoute      | dashboardMode 下禁用 syncRoute       |
| 9    | 仪表盘模式跨应用导航问题     | 导航会离开仪表盘页面            | dashboardMode 下隐藏跨应用导航       |
| 10   | 多子应用状态同步不完整       | 通知机制只通知部分订阅者        | 确保遍历所有订阅者                   |
| 11   | 硬编码地址导致部署困难       | 子应用地址没有区分环境          | 环境感知的动态配置方案               |
| 12   | 子应用 404 显示在容器内      | 子应用注册了 fallback 路由      | 微前端环境不注册 404 路由            |
| 13   | 初始加载时 404 检测失败      | 闭包捕获错误的路由对象          | 使用 pendingNotFoundPath 变量        |
| 14   | 404 检测导致卸载错误         | 挂载前调用 onRouteNotFound      | 使用 isMounted 标志位                |

## 写在最后

以上就是团队在企业级中后台系统微前端改造过程中的完整踩坑记录。从技术调研到生产上线，前后历时 3 个月，期间踩了无数的坑。希望这份文档能帮助正在或即将进行微前端改造的团队少走弯路。