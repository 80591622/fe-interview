# React Hooks

React Hooks 是 React 16.8 引入的新特性，允许在函数组件中使用状态和其他 React 特性。

## 1. 什么是 React Hooks？为什么要使用它们？

**React Hooks** 是允许在函数组件中使用状态和其他 React 特性的函数。

**使用原因：**

- 代码复用：可以将状态逻辑抽取到自定义 Hooks 中
- 逻辑组织：将相关逻辑放在一起，提高代码可读性
- 简化代码：避免类组件的复杂性，如 this 绑定
- 更好的类型推断：函数组件在 TypeScript 中类型推断更简单

## 2. 常用的 React Hooks 有哪些？它们的作用是什么？

**useState**：用于在函数组件中添加状态

- 接受初始状态作为参数，返回状态值和更新状态的函数
- 示例：`const [count, setCount] = useState(0);`

**useEffect**：用于处理副作用

- 接受一个函数和依赖数组，在组件挂载、更新或卸载时执行
- 示例：`useEffect(() => { /* 副作用逻辑 */ }, [dependencies]);`

**useContext**：用于访问 React Context

- 接受一个 Context 对象，返回该 Context 的当前值
- 示例：`const theme = useContext(ThemeContext);`

**useReducer**：用于管理复杂状态

- 接受一个 reducer 函数和初始状态，返回状态值和 dispatch 函数
- 示例：`const [state, dispatch] = useReducer(reducer, initialState);`

**useCallback**：用于缓存函数

- 接受一个函数和依赖数组，返回缓存的函数
- 示例：`const handleClick = useCallback(() => { /* 逻辑 */ }, [dependencies]);`

**useMemo**：用于缓存计算结果

- 接受一个函数和依赖数组，返回缓存的计算结果
- 示例：`const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);`

**useRef**：用于获取 DOM 元素或存储可变值

- 接受初始值作为参数，返回一个 ref 对象，其 current 属性指向初始值
- 示例：`const inputRef = useRef(null);`

**useLayoutEffect**：与 useEffect 类似，但在浏览器渲染前执行

- 用法与 useEffect 相同，但执行时机不同
- 示例：`useLayoutEffect(() => { /* 逻辑 */ }, [dependencies]);`

## 3. useState 和 useReducer 的区别是什么？什么时候使用它们？

**useState**：适用于简单状态管理

- 优点：使用简单，语法简洁
- 缺点：对于复杂状态逻辑，代码可能变得混乱

**useReducer**：适用于复杂状态管理

- 优点：可以处理复杂的状态逻辑，代码结构更清晰
- 缺点：使用相对复杂，需要编写 reducer 函数

**使用场景：**

- 使用 useState：管理简单的状态，如计数器、表单输入等
- 使用 useReducer：管理复杂的状态，如具有多个子状态的对象、需要根据前一个状态计算新状态的场景

## 4. useEffect 的依赖数组有什么作用？如何正确使用它？

**依赖数组** 用于控制 useEffect 的执行时机：

- 当依赖数组为空 `[]` 时，useEffect 只在组件挂载时执行一次
- 当依赖数组包含变量时，useEffect 会在这些变量发生变化时执行
- 当不提供依赖数组时，useEffect 会在每次组件渲染时执行

**正确使用方法：**

- 只包含 useEffect 中使用的变量，避免包含不必要的依赖
- 避免在 useEffect 中修改依赖数组中的变量，否则会导致无限循环
- 对于函数依赖，可以使用 useCallback 来缓存函数
- 对于对象依赖，可以使用 useMemo 来缓存对象

## 5. 什么是自定义 Hook？如何创建和使用它？

**自定义 Hook** 是一个以 `use` 开头的函数，用于封装可复用的状态逻辑。

**创建方法：**

```jsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

**使用方法：**

```jsx
function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(10);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

**注意事项：**

- 自定义 Hook 必须以 `use` 开头，这样 React 才能正确识别它
- 自定义 Hook 可以调用其他 Hook
- 自定义 Hook 中的状态是独立的，每个使用该 Hook 的组件都有自己的状态

## 6. useCallback 和 useMemo 的区别是什么？什么时候使用它们？

**useCallback**：用于缓存函数

- 接受一个函数和依赖数组，返回缓存的函数
- 作用：避免不必要的函数重新创建，减少子组件的重新渲染

**useMemo**：用于缓存计算结果

- 接受一个函数和依赖数组，返回缓存的计算结果
- 作用：避免不必要的计算，提高性能

**使用场景：**

- useCallback：当函数作为 props 传递给子组件，且子组件使用了 React.memo 进行优化时
- useMemo：当需要进行昂贵的计算，且计算结果依赖于某些变量时

## 7. useRef 有哪些用途？

**useRef** 有两个主要用途：

1. **获取 DOM 元素**：

```jsx
const inputRef = useRef(null);

// 访问 DOM 元素
const focusInput = () => inputRef.current.focus();

return <input ref={inputRef} />;
```

2. **存储可变值**：

```jsx
const countRef = useRef(0);

// 更新 ref 的值
const increment = () => {
  countRef.current += 1;
  console.log(countRef.current);
};

// ref 的变化不会触发组件重新渲染
```

**特点：**

- useRef 返回的 ref 对象在组件的整个生命周期内保持不变
- 修改 ref.current 不会触发组件重新渲染
- 可以用于存储不需要引起重新渲染的数据

## 8. useEffect 和 useLayoutEffect 的区别是什么？

**执行时机：**

- useEffect：在浏览器渲染之后执行
- useLayoutEffect：在浏览器渲染之前执行

**使用场景：**

- useEffect：大多数副作用场景，如数据获取、订阅等
- useLayoutEffect：需要在渲染前执行的操作，如 DOM 测量、动画等

**注意事项：**

- useLayoutEffect 会阻塞浏览器渲染，应避免在其中执行耗时操作
- 在服务端渲染中，useLayoutEffect 会被忽略

## 9. 如何在 useEffect 中正确处理异步操作？

**正确处理方法：**

1. **使用 async/await**：

```jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error);
    }
  };

  fetchData();
}, []);
```

2. **清理异步操作**：

```jsx
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      if (isMounted) {
        setData(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

**注意事项：**

- 避免在 useEffect 的回调函数中直接使用 async，因为它会返回一个 Promise，而 useEffect 期望返回一个清理函数
- 及时清理异步操作，避免在组件卸载后更新状态

## 10. 什么是 Hook 的规则？

**Hook 的规则：**

1. **只在函数组件的顶层调用 Hook**：
   - 不要在条件语句、循环或嵌套函数中调用 Hook
   - 确保 Hook 在每次组件渲染时的调用顺序一致

2. **只在 React 函数组件中调用 Hook**：
   - 不要在普通 JavaScript 函数中调用 Hook
   - 可以在自定义 Hook 中调用其他 Hook

3. **使用 eslint-plugin-react-hooks 来检查 Hook 的使用**：
   - 该插件会自动检查 Hook 的使用是否符合规则
   - 可以在项目中配置 ESLint 来启用该插件

**违反规则的后果：**

- 可能导致状态管理混乱
- 可能导致组件渲染异常
- 可能导致内存泄漏
