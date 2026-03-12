# 组件通信相关

## 父子通信方式

- props/emit：父组件通过 props 向子组件传递数据，子组件通过 emit 向父组件发送事件。
- ref：父组件通过 ref 引用子组件实例，直接访问子组件的方法和属性。
- provide/inject：父组件通过 provide 提供数据，子组件通过 inject 注入数据。
- slot：父组件通过 slot 向子组件传递内容。

## 兄弟组件通信

- event bus：使用一个事件总线来传递事件。
- Vuex/Pinia：使用状态管理库来管理共享状态。
- provide/inject：通过共同的父组件提供数据。
- props/emit：通过父组件作为中间件传递数据。

## provide / inject 原理

- provide 方法用于在父组件中提供数据。
- inject 方法用于在子组件中注入父组件提供的数据。
- 数据会沿着组件树向下传递，即使中间有多层组件。
- 这种方式适用于深层组件间的通信，避免了 props 逐级传递的繁琐。

## event bus 为什么不推荐

- event bus 是一个全局的事件总线，容易导致事件命名冲突。
- 事件的订阅和发布分散在不同组件中，难以追踪和调试。
- 当组件销毁时，如果没有及时取消订阅，可能会导致内存泄漏。
- 对于复杂的状态管理，Vuex/Pinia 提供了更规范和可维护的方案。

## Vuex / Pinia 通信原理

- Vuex：使用单一状态树管理应用状态，通过 mutations 同步修改状态，通过 actions 处理异步操作。
- Pinia：基于 Vue3 的 Composition API 设计，支持 TypeScript，提供了更简洁的 API。
- 两者都通过 store 来管理共享状态，组件通过 dispatch 或 commit 来触发状态变更，通过 mapState 或 computed 来获取状态。
