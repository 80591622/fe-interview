# 生命周期相关

## Vue3 生命周期有哪些？

- setup 组件初始化时调用，用于初始化响应式数据和事件。
- onBeforeMount 组件 DOM 挂载前执行
- onMounted 组件 DOM 挂载完成后执行
- onBeforeUpdate 组件更新前执行
- onUpdated 组件更新后执行
- onBeforeUnmount 组件卸载前执行
- onUnmounted 组件卸载后执行

## setup 执行时机

- setup 在组件实例创建后，beforeCreate 和 created 生命周期钩子之前执行。
- 此时组件实例尚未完全创建，无法访问 this。
- setup 的返回值会被合并到组件的响应式数据中，可以在模板中直接使用。

## onMounted 和 mounted 区别

- 名称不同：Vue3 使用 onMounted，Vue2 使用 mounted。
- 使用方式不同：onMounted 是 Composition API，需要从 vue 中导入并在 setup 中使用；mounted 是 Options API，直接作为组件选项使用。
- 执行时机相同：都是在组件 DOM 挂载完成后执行。

## beforeUnmount 和 unmounted

- beforeUnmount：组件卸载前执行，此时组件实例仍然可用。
- unmounted：组件卸载后执行，此时组件实例已经被销毁，无法再访问。
- 这两个生命周期钩子用于清理组件的副作用，例如取消订阅、清除定时器等。

## keep-alive 生命周期

- keep-alive 是 Vue 的内置组件，用于缓存不活跃的组件实例。
- 当组件被 keep-alive 包裹时，会增加两个生命周期钩子：activated 和 deactivated。
- activated：组件被激活时执行。
- deactivated：组件被停用时执行。

## activated / deactivated 什么时候触发

- activated：当 keep-alive 包裹的组件从缓存中被激活时触发。
- deactivated：当 keep-alive 包裹的组件被缓存时触发。
- 这些钩子只在使用 keep-alive 时才会触发，用于处理组件的激活和停用逻辑。
