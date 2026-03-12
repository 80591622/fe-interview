# 响应式原理相关

## Vue2 和 Vue3 响应式有什么区别？

- 实现原理不同，Vue2 使用 Object.defineProperty，Vue3 使用 Proxy。
- 监听能力不同，Vue2 无法监听属性新增、删除以及数组下标变化，而 Vue3 可以完整监听。
- Vue2 在初始化时需要递归遍历对象，而 Vue3 使用 Proxy 懒代理，性能更好。
- Vue3 引入了 reactive、ref、watchEffect 等 Composition API。
- Vue3 的响应式系统可以独立使用，并且对 TypeScript 支持更好。

## Vue3 为什么用 Proxy？

- Proxy 可以直接监听对象而非属性，避免了 Vue2 中需要递归遍历对象的问题。
- Proxy 可以监听属性的新增和删除，而 Object.defineProperty 无法做到。
- Proxy 可以监听数组的下标变化和长度变化，解决了 Vue2 中数组监听的局限性。
- Proxy 是 ES6 的新特性，性能更好，并且支持懒代理，只有在访问时才会建立响应式。

## Vue2 为什么无法监听数组下标变化？

- Vue2 使用 Object.defineProperty 来实现响应式，它只能监听对象的属性，而不能监听数组的下标变化。
- 为了处理数组，Vue2 重写了数组的 7 个方法（push、pop、shift、unshift、splice、sort、reverse），通过这些方法来触发响应式更新。
- 但对于直接修改数组下标（如 arr[0] = 1）或修改数组长度（如 arr.length = 0）的操作，Vue2 无法监听到。

## Vue3 的 reactive 和 ref 区别？

- 类型不同：reactive 只能处理对象类型，ref 可以处理基本类型和对象类型。
- 访问方式不同：reactive 返回的是代理对象，直接访问属性；ref 返回的是包装对象，需要通过 .value 访问。
- 响应式原理不同：reactive 使用 Proxy 实现，ref 内部使用 reactive 包装基本类型。
- 适用场景不同：reactive 适用于复杂对象，ref 适用于基本类型或需要在模板中直接使用的场景。

## computed 和 watch 区别？

- 计算属性（computed）是基于依赖缓存的，只有依赖变化时才会重新计算，适合用于派生状态。
- 监听器（watch）是响应式地执行副作用，适合用于执行异步操作或开销较大的操作。
- computed 自动追踪依赖，而 watch 需要手动指定监听的数据源。
- computed 必须返回一个值，而 watch 可以执行任意操作，不需要返回值。

## watchEffect 和 watch 区别？

- watchEffect 会自动追踪所有依赖，而 watch 需要手动指定监听的数据源。
- watchEffect 会在组件初始化时立即执行一次，而 watch 默认只在数据源变化时执行。
- watchEffect 无法获取变化前后的值，而 watch 可以通过回调函数的参数获取。
- watchEffect 适合用于响应式地执行副作用，而 watch 适合用于需要更精细控制的场景。

## Vue3 的 effect 调度机制是什么？

- effect 是 Vue3 响应式系统的核心，用于追踪依赖和触发更新。
- 调度机制允许我们控制 effect 的执行时机，例如可以延迟执行、批量执行或取消执行。
- 通过 scheduler 选项，我们可以自定义 effect 的调度行为。
- 调度机制是 Vue3 实现响应式更新、避免重复更新的关键。

## nextTick 原理是什么？

- nextTick 用于在 DOM 更新后执行回调函数。
- 原理是利用浏览器的微任务队列，在所有同步任务执行完成后，DOM 更新完成前执行回调。
- Vue3 中，nextTick 内部使用 Promise.resolve() 来创建微任务。
- 适用于需要在 DOM 更新后操作 DOM 的场景，例如获取更新后的 DOM 尺寸或位置。

## Vue3 如何避免重复更新？

- 使用 effect 调度机制，将多个更新操作批量处理。
- 利用响应式系统的依赖追踪，只在依赖变化时才触发更新。
- 使用 computed 缓存计算结果，避免重复计算。
- 引入了 Fragment 减少 DOM 节点，提高渲染性能。
- 优化了 diff 算法，减少不必要的 DOM 操作。

## Vue diff 算法是什么？

- diff 算法是 Vue 用于比较新旧虚拟 DOM 树，找出差异并高效更新 DOM 的算法。
- Vue3 中，diff 算法进行了优化，使用了最长递增子序列算法来减少 DOM 操作。
- 主要步骤包括：1. 同级比较 2. 用 key 标识节点 3. 比较子节点 4. 处理新增和删除节点。
- diff 算法的效率直接影响 Vue 应用的渲染性能。
