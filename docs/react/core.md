# React 核心概念

React 的核心概念是理解和使用 React 的基础，也是面试中经常被问到的内容。

## 1. React 是什么？它的核心特性是什么？

React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发和维护。

**核心特性：**

- **声明式**：使用声明式代码描述 UI，使代码更可预测、更易于调试
- **组件化**：将 UI 拆分为独立、可复用的组件
- **一次学习，随处编写**：可以在浏览器中使用 React DOM，也可以在服务器端使用 React DOM Server，还可以在移动端使用 React Native
- **虚拟 DOM**：通过虚拟 DOM 提高渲染性能
- **单向数据流**：数据从父组件流向子组件，使数据流动更加清晰

## 2. 虚拟 DOM 是什么？它如何提高性能？

**虚拟 DOM (Virtual DOM)** 是 React 中用于表示真实 DOM 结构的 JavaScript 对象。

**工作原理：**

1. 当组件状态变化时，React 会创建一个新的虚拟 DOM 树
2. 然后与旧的虚拟 DOM 树进行比较，找出差异（Diff 算法）
3. 最后只更新需要变化的部分到真实 DOM 中

**性能优势：**

- 减少直接操作 DOM 的次数，因为 DOM 操作是昂贵的
- 批量更新，减少浏览器重排和重绘
- 跨平台支持，因为虚拟 DOM 是平台无关的

## 3. React 的 Diff 算法是如何工作的？

React 的 Diff 算法用于比较新旧虚拟 DOM 树的差异，以最小化 DOM 操作。

**核心策略：**

- **同级比较**：只比较同一层级的节点，不跨层级比较
- **key 属性**：使用 key 来识别节点，提高比较效率
- **类型比较**：如果节点类型不同，直接替换整个节点
- **属性比较**：如果节点类型相同，只更新变化的属性

## 4. 什么是 JSX？它与 JavaScript 有什么关系？

**JSX** 是 JavaScript XML 的缩写，是一种在 JavaScript 中编写 HTML 结构的语法扩展。

**特点：**

- JSX 不是必需的，但它使 React 代码更具可读性
- JSX 在编译时会被 Babel 等工具转换为普通的 JavaScript 代码
- JSX 允许在 HTML 结构中嵌入 JavaScript 表达式
- JSX 遵循 XML 语法规则，例如标签必须闭合

**示例：**

```jsx
// JSX 代码
const element = <h1>Hello, {name}!</h1>;

// 编译后的 JavaScript 代码
const element = React.createElement('h1', null, `Hello, ${name}!`);
```

## 5. React 组件的生命周期有哪些阶段？

React 组件的生命周期分为三个主要阶段：

**挂载阶段 (Mounting)**：

- constructor
- static getDerivedStateFromProps
- render
- componentDidMount

**更新阶段 (Updating)**：

- static getDerivedStateFromProps
- shouldComponentUpdate
- render
- getSnapshotBeforeUpdate
- componentDidUpdate

**卸载阶段 (Unmounting)**：

- componentWillUnmount

**错误处理阶段 (Error Handling)**：

- static getDerivedStateFromError
- componentDidCatch

## 6. 什么是 props 和 state？它们有什么区别？

**props** 是组件接收的外部数据，由父组件传递给子组件。

- props 是只读的，子组件不能修改 props
- props 可以是任何类型的数据，包括函数

**state** 是组件内部的状态数据，由组件自己管理。

- state 是可变的，组件可以通过 setState 方法修改 state
- state 通常用于存储组件的内部状态，如表单输入值、加载状态等

**区别：**

- props 是外部传入的，state 是内部管理的
- props 是只读的，state 是可变的
- props 用于组件间通信，state 用于组件内部状态管理

## 7. 什么是受控组件和非受控组件？

**受控组件** 是由 React 状态控制值的组件。

- 输入值由 state 控制
- 当用户输入时，会触发 onChange 事件，更新 state
- 受控组件的值始终与 state 保持同步

**非受控组件** 是由 DOM 自身管理值的组件。

- 输入值由 DOM 管理
- 通过 ref 来获取 DOM 元素的值
- 非受控组件的值与 state 无关

**使用场景：**

- 受控组件：需要实时验证、表单提交等场景
- 非受控组件：简单表单、文件上传等场景

## 8. 什么是高阶组件 (HOC)？它的作用是什么？

**高阶组件 (Higher-Order Component)** 是一个接收组件并返回新组件的函数。

**作用：**

- 代码复用：将通用逻辑抽取到 HOC 中
- 逻辑增强：为组件添加额外的功能
- 条件渲染：根据条件决定是否渲染组件
- 状态管理：为组件添加状态管理能力

**示例：**

```jsx
const withAuth = (WrappedComponent) => {
  return (props) => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
      return <LoginPage />;
    }
    return <WrappedComponent {...props} />;
  };
};

const ProtectedComponent = withAuth(MyComponent);
```

## 9. 什么是 render props？它的作用是什么？

**render props** 是一种技术，通过 props 传递一个函数，该函数返回 React 元素。

**作用：**

- 代码复用：将组件的逻辑与 UI 分离
- 灵活组合：允许组件的使用者自定义渲染内容
- 避免 HOC 的命名冲突问题

**示例：**

```jsx
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (event) => {
    this.setState({ x: event.clientX, y: event.clientY });
  };

  render() {
    return <div onMouseMove={this.handleMouseMove}>{this.props.render(this.state)}</div>;
  }
}

// 使用
<MouseTracker
  render={({ x, y }) => (
    <h1>
      The mouse position is ({x}, {y})
    </h1>
  )}
/>;
```

## 10. 什么是 React 上下文 (Context)？它的作用是什么？

**React 上下文 (Context)** 是一种在组件树中传递数据的方式，无需通过 props 逐层传递。

**作用：**

- 避免 props drilling（ props 逐层传递）
- 共享全局状态，如主题、用户信息等
- 简化组件间通信

**使用步骤：**

1. 创建 Context：`const MyContext = React.createContext(defaultValue);`
2. 提供 Context：使用 `<MyContext.Provider value={value}>` 包裹组件树
3. 消费 Context：使用 `useContext(MyContext)` 或 `<MyContext.Consumer>` 获取值

**示例：**

```jsx
// 创建 Context
const ThemeContext = React.createContext('light');

// 提供 Context
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedComponent />
    </ThemeContext.Provider>
  );
}

// 消费 Context
function ThemedComponent() {
  const theme = useContext(ThemeContext);
  return <div>Current theme: {theme}</div>;
}
```
