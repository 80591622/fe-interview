# React Router

React Router 是 React 官方推荐的路由库，用于处理 React 应用的导航和路由。

## 1. 什么是 React Router？它的作用是什么？

**React Router** 是一个用于 React 应用的路由库，允许开发者在单页应用中实现导航功能。

**作用**：

- 实现单页应用的导航功能
- 管理应用的 URL 状态
- 支持嵌套路由
- 支持参数化路由
- 支持编程式导航
- 支持路由守卫

## 2. React Router 的核心组件有哪些？它们的作用是什么？

**核心组件**：

- **BrowserRouter**：使用 HTML5 History API 实现的路由
- **HashRouter**：使用 URL hash 实现的路由
- **Routes**：路由配置的容器
- **Route**：定义路由规则
- **Link**：创建导航链接
- **NavLink**：创建带有激活状态的导航链接
- **Outlet**：渲染嵌套路由的组件
- **useNavigate**：编程式导航的 Hook
- **useParams**：获取路由参数的 Hook
- **useLocation**：获取当前位置信息的 Hook
- **useSearchParams**：获取和修改查询参数的 Hook

**使用示例**：

```jsx
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users/1">User 1</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/users/:id"
          element={<User />}
        />
      </Routes>
    </BrowserRouter>
  );
}

function User() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>User {id}</h1>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}
```

## 3. React Router v5 和 v6 的主要区别是什么？

**React Router v6 的主要变化**：

1. **API 简化**：
   - 移除了 Switch 组件，使用 Routes 组件
   - 移除了 component、render 和 children props，使用 element prop
   - 移除了 exact prop，默认就是精确匹配

2. **嵌套路由改进**：
   - 使用 Outlet 组件渲染嵌套路由
   - 支持相对路径

3. **新的 Hooks**：
   - useNavigate 替代 useHistory
   - useRoutes 用于在组件中定义路由
   - useSearchParams 用于处理查询参数

4. **性能优化**：
   - 更高效的路由匹配算法
   - 减少了运行时开销

5. **类型安全**：
   - 更好的 TypeScript 支持

**v5 示例**：

```jsx
<Switch>
  <Route
    exact
    path="/"
    component={Home}
  />
  <Route
    path="/about"
    component={About}
  />
  <Route
    path="/users/:id"
    component={User}
  />
</Switch>
```

**v6 示例**：

```jsx
<Routes>
  <Route
    path="/"
    element={<Home />}
  />
  <Route
    path="/about"
    element={<About />}
  />
  <Route
    path="/users/:id"
    element={<User />}
  />
</Routes>
```

## 4. 如何实现嵌套路由？

**在 React Router v6 中实现嵌套路由**：

```jsx
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        >
          <Route
            index
            element={<DashboardHome />}
          />
          <Route
            path="settings"
            element={<DashboardSettings />}
          />
          <Route
            path="profile"
            element={<DashboardProfile />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/settings">Settings</Link>
        <Link to="/dashboard/profile">Profile</Link>
      </nav>
      <Outlet /> {/* 渲染嵌套路由 */}
    </div>
  );
}

function DashboardHome() {
  return <h2>Dashboard Home</h2>;
}

function DashboardSettings() {
  return <h2>Dashboard Settings</h2>;
}

function DashboardProfile() {
  return <h2>Dashboard Profile</h2>;
}
```

**关键点**：

- 使用嵌套的 Route 组件定义子路由
- 使用 index 属性定义默认子路由
- 在父组件中使用 Outlet 组件渲染子路由

## 5. 如何实现路由参数？

**在 React Router v6 中实现路由参数**：

```jsx
import { Routes, Route, useParams } from 'react-router-dom';

// 定义带参数的路由
<Routes>
  <Route
    path="/users/:id"
    element={<User />}
  />
  <Route
    path="/products/:category/:id"
    element={<Product />}
  />
</Routes>;

// 在组件中获取参数
function User() {
  const { id } = useParams();
  return <h1>User {id}</h1>;
}

function Product() {
  const { category, id } = useParams();
  return (
    <h1>
      Product {id} in {category}
    </h1>
  );
}
```

**注意事项**：

- 路由参数使用 `:paramName` 语法定义
- 使用 useParams Hook 获取参数
- 参数值总是字符串类型

## 6. 如何实现编程式导航？

**使用 useNavigate Hook 实现编程式导航**：

```jsx
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 登录逻辑
    navigate('/dashboard'); // 导航到 dashboard
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
      <button type="submit">Login</button>
    </form>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 登出逻辑
    navigate('/login', { replace: true }); // 替换历史记录
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

**导航选项**：

- `replace`：替换当前历史记录，而不是添加新记录
- `state`：传递状态数据

**导航方法**：

- `navigate('/path')`：导航到指定路径
- `navigate(-1)`：导航到上一页
- `navigate(1)`：导航到下一页

## 7. 如何实现路由守卫？

**实现路由守卫的方法**：

1. **使用自定义组件**：

```jsx
import { Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children }) {
  const isAuthenticated = checkAuth(); // 检查用户是否已登录
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

// 使用
<Routes>
  <Route
    path="/login"
    element={<Login />}
  />
  <Route
    path="/dashboard"
    element={
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    }
  />
</Routes>;
```

2. **使用嵌套路由**：

```jsx
<Routes>
  <Route
    path="/"
    element={<Layout />}
  >
    <Route
      path="login"
      element={<Login />}
    />
    <Route
      path="dashboard"
      element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      }
    />
    <Route
      path="profile"
      element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      }
    />
  </Route>
</Routes>
```

**注意事项**：

- 路由守卫用于保护需要认证的路由
- 可以将用户重定向到登录页面
- 可以保存原始的目标路径，登录后重定向回去

## 8. 如何处理 404 页面？

**处理 404 页面**：

```jsx
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route
    path="/"
    element={<Home />}
  />
  <Route
    path="/about"
    element={<About />}
  />
  <Route
    path="/users/:id"
    element={<User />}
  />
  <Route
    path="*"
    element={<NotFound />}
  />
</Routes>;

function NotFound() {
  return (
    <div>
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
```

**关键点**：

- 使用 `path="*"` 匹配所有未匹配的路由
- 通常将 404 路由放在所有路由的最后

## 9. 如何使用查询参数？

**使用 useSearchParams Hook 处理查询参数**：

```jsx
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newQuery = formData.get('query');
    setSearchParams({ q: newQuery, page: '1' });
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="query"
          defaultValue={query}
        />
        <button type="submit">Search</button>
      </form>
      <p>Searching for: {query}</p>
      <p>Page: {page}</p>
    </div>
  );
}
```

**注意事项**：

- useSearchParams 返回一个包含当前查询参数的对象和一个用于更新查询参数的函数
- 查询参数值总是字符串类型
- 更新查询参数会触发组件重新渲染

## 10. 如何实现路由懒加载？

**使用 React.lazy 和 Suspense 实现路由懒加载**：

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 懒加载组件
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/about"
            element={<About />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**关键点**：

- 使用 React.lazy 懒加载组件
- 使用 Suspense 提供加载状态
- 路由懒加载可以减少初始加载时间
- 适合大型应用的性能优化
