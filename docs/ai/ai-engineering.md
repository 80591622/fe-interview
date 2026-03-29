# **AI赋能前端工程化实践：**

+ **Prompt工程**：建立前端场景化Prompt库（组件开发/样式调优/性能优化等），制定团队AI协作规范，提升代码生成准确率
+ **工具链定制**：开发前端专用Skill指令（React/Vue组件生成、Tailwind样式优化、TypeScript类型推导等）和MCP服务器集成
+ **流程标准化**：引入SpecKit规范需求拆解、UI还原、组件开发、代码review全链路，实现AI深度参与各环节
+ **成果验证**：组件开发效率提升50%+，样式还原准确度提高，代码规范性和可维护性显著改善

4个场景具体的代码



[ai-frontend-demo.zip](https://www.yuque.com/attachments/yuque/0/2026/zip/207857/1770857907018-87f21238-a3f3-4c8e-84a7-525a8b90a001.zip)



## **场景一：组件开发提效**
**业务背景：** 项目需要开发大量表单组件（用户信息表单、订单表单、筛选表单等），传统开发需要反复编写表单校验、数据绑定、样式适配等重复代码。

**AI应用实践：**

1. **定制Prompt模板**：

```plain
基于Vue3 Composition API + Element Plus开发表单组件
基于React react-hook-form  + Ant Design开发表单组件
   要求：
   - 使用TypeScript定义Props类型
   - 集成Vuelidate进行表单校验
   - 支持v-model双向绑定
   - 响应式布局适配

1. 性能更好：非受控组件，减少重渲染
2. API更简洁：useForm一个hook搞定
3. 类型安全：TypeScript支持完美
4. 生态丰富：支持各种UI库
```

1. **开发自定义Skill**： 
    - 创建`vue3-form-generator` Skill，输入字段配置JSON，自动生成完整组件代码
    - 包含：template结构、script setup逻辑、TypeScript类型、校验规则、样式
2. **具体成果**： 
    - 原本1个表单组件需要2-3小时，现在30分钟完成
    - 代码规范统一，减少code review时间
    - 自动生成单元测试框架

---

## **场景二：样式还原与优化**
**业务背景：** 设计师提供Figma设计稿，需要精准还原复杂UI（卡片列表、数据大屏、响应式布局等），传统开发需要反复调试CSS。

**AI应用实践：**

1. **Prompt工程**：

```plain
根据设计稿描述生成Tailwind CSS类名
   要求：
   - 响应式断点处理（sm/md/lg/xl）
   - 深色模式适配（dark:）
   - 动画效果（transition/animate）
   - 遵循项目Tailwind配置
```

1. **工作流程**： 
    - 截图设计稿 → AI分析布局结构 → 生成Tailwind类名 → 微调适配
    - 使用AI优化现有CSS，转换为Tailwind工具类，减少自定义样式
2. **具体案例**： 
    - 数据大屏页面：20+图表卡片布局，AI辅助完成响应式适配，原需2天，现1天完成
    - 减少自定义CSS代码量60%，样式一致性提升

---

## **场景三：TypeScript类型推导与优化**
**业务背景：** Vue3项目使用TypeScript，API接口众多（100+接口），需要维护大量类型定义，手动编写易出错且效率低。

**AI应用实践：**

1. **MCP集成**： 
    - 开发`api-type-generator` MCP服务器
    - 读取Swagger/OpenAPI文档，自动生成TypeScript接口类型
2. **Prompt优化**：

```plain
根据API响应JSON生成TypeScript类型
   要求：
   - 嵌套对象递归定义
   - 可选字段标注（?:）
   - 枚举类型提取
   - 添加JSDoc注释
```

1. **具体成果**： 
    - API类型定义从手动1小时/接口 → AI生成5分钟/批量接口
    - 类型覆盖率从60% → 95%+
    - 减少运行时类型错误

---

## **场景四：代码Review与重构**
**业务背景：** 老项目Vue2迁移至Vue3，需要重构Options API为Composition API，同时优化性能和代码质量。

**AI应用实践：**

1. **SpecKit流程规范**： 
    - 需求：明确迁移范围和目标（性能提升、类型安全）
    - 设计：AI分析组件依赖关系，生成迁移优先级
    - 开发：AI辅助批量转换API语法
    - Review：AI检查常见问题（ref/reactive误用、watch依赖遗漏）
2. **具体操作**：

```plain
将Vue2 Options API组件转换为Vue3 Composition API
   要求：
   - data → ref/reactive
   - methods → 普通函数
   - computed → computed()
   - watch → watch/watchEffect
   - 生命周期钩子对应转换
   - 优化响应式性能
```

1. **成果数据**： 
    - 50+组件迁移，人工审核为主，AI辅助转换节省70%时间
    - 性能优化：首屏渲染提升30%

---

## **场景五：单元测试自动生成**
**业务背景：** 项目要求测试覆盖率>80%，但编写单元测试耗时，开发人员不愿写测试。

**AI应用实践：**

1. **自定义Skill**：`vue3-test-generator`
    - 输入：Vue组件代码
    - 输出：Vitest单元测试代码（组件渲染、Props测试、事件测试、快照测试）
2. **Prompt示例**：

```plain
为Vue3组件生成Vitest单元测试
   要求：
   - 使用@vue/test-utils
   - 测试Props传递
   - 测试事件触发
   - 测试插槽渲染
   - 边界情况覆盖
```

1. **具体成果**： 
    - 测试覆盖率从40% → 85%
    - 单个组件测试编写从1小时 → 15分钟（AI生成+人工审核）

---

## **面试回答技巧**
**当面试官追问时，可以这样回答：**

"以组件开发为例，我们项目中有大量表单场景。我建立了一套Prompt模板库，针对不同类型表单（新增/编辑/筛选），AI可以根据字段配置自动生成完整的Vue3组件，包括Composition API逻辑、TypeScript类型定义、Element Plus集成、表单校验规则等。

同时开发了自定义Skill，比如输入一个JSON配置，就能生成标准化的表单组件。这让我们的表单开发效率从平均3小时缩短到30分钟，而且代码规范性更好，减少了code review的时间。

另外在样式还原方面，我会让AI分析设计稿，直接生成Tailwind类名，特别是响应式布局和深色模式适配，效率提升非常明显。"

---

 

---

## 
# **场景一：Vue、React组件自动生成(具体实案例-参考代码)**
## **1. 创建自定义Skill**
### 步骤1：创建Skill目录结构
bash

```bash
# 在本地创建skill目录
mkdir -p ~/claude-skills/vue3-form-generator
cd ~/claude-skills/vue3-form-generator
```

### 步骤2：创建SKILL.md文件
bash

```bash
touch SKILL.md
```

**SKILL.md内容：**

markdown

```markdown
# Vue3 Form Generator Skill

## 功能描述
根据字段配置JSON自动生成Vue3表单组件（Composition API + TypeScript + Element Plus）

## 输入格式
用户提供JSON配置，包含表单字段信息：
- fieldName: 字段名
- label: 字段标签
- type: 字段类型（input/select/date/number等）
- required: 是否必填
- rules: 校验规则

## 输出要求
生成完整的Vue3单文件组件，包含：
1. TypeScript类型定义
2. Composition API逻辑
3. Element Plus表单组件
4. Vuelidate表单校验
5. 响应式样式

## 代码规范
- 使用script setup语法
- 使用ref/reactive管理状态
- 所有Props必须有TypeScript类型
- 表单必须有完整校验
- 支持v-model双向绑定

## 示例

输入：
```json
{
  "formName": "UserForm",
  "fields": [
    {
      "fieldName": "username",
      "label": "用户名",
      "type": "input",
      "required": true,
      "rules": "minLength:3,maxLength:20"
    },
    {
      "fieldName": "email",
      "label": "邮箱",
      "type": "input",
      "required": true,
      "rules": "email"
    },
    {
      "fieldName": "age",
      "label": "年龄",
      "type": "number",
      "required": false,
      "rules": "min:18,max:100"
    }
  ]
}
```

输出：生成完整的UserForm.vue组件
```

### 步骤3：在Claude中上传Skill

1. 打开 Claude.ai
2. 点击右上角设置图标
3. 选择「Custom Skills」或直接在对话中上传
4. 上传 `SKILL.md` 文件

### 步骤4：使用Skill生成组件

**在Claude对话框中输入：**
```
使用vue3-form-generator skill，根据以下配置生成表单组件：

{
  "formName": "UserForm",
  "fields": [
    {
      "fieldName": "username",
      "label": "用户名",
      "type": "input",
      "required": true,
      "rules": "minLength:3,maxLength:20"
    },
    {
      "fieldName": "email",
      "label": "邮箱",
      "type": "input",
      "required": true,
      "rules": "email"
    },
    {
      "fieldName": "age",
      "label": "年龄",
      "type": "number",
      "required": false,
      "rules": "min:18,max:100"
    },
    {
      "fieldName": "gender",
      "label": "性别",
      "type": "select",
      "required": true,
      "options": ["男", "女", "其他"]
    }
  ]
}
```

### 步骤5：Claude会生成完整组件代码
**生成的UserForm.vue：**

vue

```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
    class="user-form"
  >
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="formData.username"
        placeholder="请输入用户名"
        clearable
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        placeholder="请输入邮箱"
        clearable
      />
    </el-form-item>

    <el-form-item label="年龄" prop="age">
      <el-input-number
        v-model="formData.age"
        :min="18"
        :max="100"
        placeholder="请输入年龄"
      />
    </el-form-item>

    <el-form-item label="性别" prop="gender">
      <el-select v-model="formData.gender" placeholder="请选择性别">
        <el-option label="男" value="男" />
        <el-option label="女" value="女" />
        <el-option label="其他" value="其他" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 类型定义
interface UserFormData {
  username: string
  email: string
  age: number | undefined
  gender: string
}

// Props定义
interface Props {
  modelValue?: UserFormData
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    username: '',
    email: '',
    age: undefined,
    gender: ''
  })
})

// Emits定义
const emit = defineEmits<{
  'update:modelValue': [value: UserFormData]
  'submit': [value: UserFormData]
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<UserFormData>({
  username: props.modelValue?.username || '',
  email: props.modelValue?.email || '',
  age: props.modelValue?.age,
  gender: props.modelValue?.gender || ''
})

// 校验规则
const rules = reactive<FormRules<UserFormData>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  age: [
    { type: 'number', message: '年龄必须是数字', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== undefined && (value < 18 || value > 100)) {
          callback(new Error('年龄必须在18-100之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('update:modelValue', formData)
      emit('submit', formData)
    }
  })
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
}

// 暴露方法供父组件调用
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
})
</script>

<style scoped>
.user-form {
  max-width: 600px;
  padding: 20px;
}
</style>
```

### 步骤6：在项目中使用生成的组件
**创建测试页面 TestForm.vue：**

vue

```vue
<template>
  <div class="test-page">
    <h2>表单测试页面</h2>
    <UserForm v-model="userData" @submit="handleFormSubmit" />
    
    <div v-if="submittedData" class="result">
      <h3>提交结果：</h3>
      <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserForm from './UserForm.vue'

const userData = ref({
  username: '',
  email: '',
  age: undefined,
  gender: ''
})

const submittedData = ref(null)

const handleFormSubmit = (data: any) => {
  submittedData.value = data
  console.log('表单提交数据：', data)
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

pre {
  background: #fff;
  padding: 10px;
  border-radius: 4px;
}
</style>
```

### 步骤7：运行项目
bash

```bash
# 1. 创建Vue3项目（如果还没有）
npm create vue@latest my-form-project
cd my-form-project

# 2. 安装依赖
npm install
npm install element-plus

# 3. 配置Element Plus（main.ts）
# 添加以下代码到 src/main.ts
```

**src/main.ts：**

typescript

```typescript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

bash

```bash
# 4. 将生成的 UserForm.vue 和 TestForm.vue 放到 src/components/

# 5. 修改 App.vue 引入 TestForm

# 6. 运行项目
npm run dev
```

**App.vue：**

vue

```vue
<template>
  <TestForm />
</template>

<script setup lang="ts">
import TestForm from './components/TestForm.vue'
</script>
```

---

# **场景二：Tailwind样式自动生成(具体实案例-参考代码)**
## **完整运行步骤**
### 步骤1：创建Vue3 + Tailwind项目
bash

```bash
# 创建项目
npm create vue@latest tailwind-demo
cd tailwind-demo

# 安装依赖
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 步骤2：配置Tailwind
**tailwind.config.js：**

javascript

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

**src/style.css：**

css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**src/main.ts：**

typescript

```typescript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

### 步骤3：在Claude中使用Prompt生成样式

**在Claude对话框中输入：**
```
我需要开发一个数据卡片组件，请根据以下设计要求生成Tailwind CSS类名：

设计要求：
1. 卡片宽度：默认全宽，md断点以上为1/3宽度，lg断点以上为1/4宽度
2. 内边距：16px
3. 背景：白色，深色模式下为深灰色(#1f2937)
4. 圆角：8px
5. 阴影：轻微阴影，hover时加深
6. 边框：1px浅灰色边框
7. 标题：文字大小18px，加粗，深色模式下白色
8. 数值：文字大小32px，蓝色(#3b82f6)
9. 描述：文字大小14px，灰色
10. 包含过渡动画效果

请生成完整的Vue3组件代码
```

### 步骤4：Claude生成的组件代码
**src/components/DataCard.vue：**

vue

```vue
<template>
  <div 
    class="w-full md:w-1/3 lg:w-1/4 p-4 transition-transform duration-300 hover:scale-105"
  >
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <!-- 标题 -->
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {{ title }}
      </h3>
      
      <!-- 数值 -->
      <div class="text-3xl font-bold text-blue-500 dark:text-blue-400 my-3">
        {{ value }}
      </div>
      
      <!-- 描述 -->
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>
      
      <!-- 趋势指示器（可选） -->
      <div v-if="trend" class="mt-3 flex items-center">
        <span 
          :class="[
            'text-sm font-medium',
            trend > 0 ? 'text-green-500' : 'text-red-500'
          ]"
        >
          {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
        </span>
        <span class="text-xs text-gray-400 ml-2">vs 上周</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  description: string
  trend?: number
}

withDefaults(defineProps<Props>(), {
  trend: undefined
})
</script>
```

### 步骤5：创建演示页面
**src/components/Dashboard.vue：**

vue

```vue
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- 标题栏 -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          数据看板
        </h1>
        <button
          @click="toggleDarkMode"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          切换{{ isDark ? '浅色' : '深色' }}模式
        </button>
      </div>

      <!-- 数据卡片网格 -->
      <div class="flex flex-wrap -mx-4">
        <DataCard
          v-for="card in dataCards"
          :key="card.id"
          :title="card.title"
          :value="card.value"
          :description="card.description"
          :trend="card.trend"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataCard from './DataCard.vue'

const isDark = ref(false)

const dataCards = [
  {
    id: 1,
    title: '总用户数',
    value: '12,543',
    description: '累计注册用户',
    trend: 12.5
  },
  {
    id: 2,
    title: '活跃用户',
    value: '8,321',
    description: '本周活跃用户',
    trend: 8.3
  },
  {
    id: 3,
    title: '总订单',
    value: '3,456',
    description: '本月订单数量',
    trend: -2.4
  },
  {
    id: 4,
    title: '收入',
    value: '¥89,234',
    description: '本月总收入',
    trend: 15.8
  },
  {
    id: 5,
    title: '新增用户',
    value: '234',
    description: '今日新增',
    trend: 5.2
  },
  {
    id: 6,
    title: '转化率',
    value: '3.2%',
    description: '平均转化率',
    trend: 0.8
  },
  {
    id: 7,
    title: '客单价',
    value: '¥456',
    description: '平均客单价',
    trend: -1.2
  },
  {
    id: 8,
    title: '退款率',
    value: '1.8%',
    description: '本月退款率',
    trend: -0.5
  }
]

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
  // 检查系统主题偏好
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>
```

### 步骤6：运行项目
**App.vue：**

vue

```vue
<template>
  <Dashboard />
</template>

<script setup lang="ts">
import Dashboard from './components/Dashboard.vue'
</script>
```

bash

```bash
# 运行项目
npm run dev

# 访问 http://localhost:5173
# 可以看到响应式数据卡片，支持深色模式切换
```

---

# **场景三：API类型自动生成（MCP服务器）(具体实案例-参考代码)**
## **完整运行步骤**
### 步骤1：创建MCP服务器项目
bash

```bash
# 创建项目目录
mkdir api-type-generator-mcp
cd api-type-generator-mcp

# 初始化项目
npm init -y

# 安装依赖
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node tsx
```

### 步骤2：创建TypeScript配置
**tsconfig.json：**

json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 步骤3：创建MCP服务器代码
**src/index.ts：**

typescript

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// API响应转TypeScript类型
function jsonToTypeScript(json: any, interfaceName: string): string {
  const generateType = (obj: any, name: string, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 'any[]';
      return generateType(obj[0], name, indent) + '[]';
    }
    
    if (obj === null) return 'null';
    if (typeof obj !== 'object') {
      return typeof obj;
    }
    
    let result = `${spaces}interface ${name} {\n`;
    
    for (const [key, value] of Object.entries(obj)) {
      const propType = Array.isArray(value)
        ? `${generateType(value[0], `${name}${key.charAt(0).toUpperCase()}${key.slice(1)}Item`, indent + 1)}[]`
        : typeof value === 'object' && value !== null
        ? `${name}${key.charAt(0).toUpperCase()}${key.slice(1)}`
        : typeof value;
      
      result += `${spaces}  ${key}: ${propType}\n`;
    }
    
    result += `${spaces}}\n\n`;
    
    // 生成嵌套接口
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result = generateType(value, `${name}${key.charAt(0).toUpperCase()}${key.slice(1)}`, indent) + result;
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        result = generateType(value[0], `${name}${key.charAt(0).toUpperCase()}${key.slice(1)}Item`, indent) + result;
      }
    }
    
    return result;
  };
  
  return generateType(json, interfaceName);
}

// OpenAPI/Swagger转TypeScript
function swaggerToTypeScript(swagger: any): string {
  let result = '';
  
  if (swagger.definitions) {
    for (const [name, schema] of Object.entries(swagger.definitions)) {
      result += `interface ${name} {\n`;
      const props = (schema as any).properties || {};
      for (const [propName, propSchema] of Object.entries(props)) {
        const type = (propSchema as any).type || 'any';
        const required = (schema as any).required?.includes(propName);
        result += `  ${propName}${required ? '' : '?'}: ${type}\n`;
      }
      result += `}\n\n`;
    }
  }
  
  return result;
}

// 创建MCP服务器
const server = new Server(
  {
    name: "api-type-generator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 注册工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_types_from_json",
        description: "根据JSON响应生成TypeScript类型定义",
        inputSchema: {
          type: "object",
          properties: {
            json: {
              type: "string",
              description: "JSON字符串",
            },
            interfaceName: {
              type: "string",
              description: "接口名称",
            },
          },
          required: ["json", "interfaceName"],
        },
      },
      {
        name: "generate_types_from_swagger",
        description: "根据Swagger/OpenAPI文档生成TypeScript类型",
        inputSchema: {
          type: "object",
          properties: {
            swagger: {
              type: "string",
              description: "Swagger JSON字符串",
            },
          },
          required: ["swagger"],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "generate_types_from_json") {
      const json = JSON.parse(args.json as string);
      const types = jsonToTypeScript(json, args.interfaceName as string);
      
      return {
        content: [
          {
            type: "text",
            text: types,
          },
        ],
      };
    }

    if (name === "generate_types_from_swagger") {
      const swagger = JSON.parse(args.swagger as string);
      const types = swaggerToTypeScript(swagger);
      
      return {
        content: [
          {
            type: "text",
            text: types,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("API Type Generator MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### 步骤4：配置package.json
**package.json：**

json

```json
{
  "name": "api-type-generator-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "api-type-generator-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 步骤5：编译和测试
bash

```bash
# 编译
npm run build

# 测试运行
npm run dev
```

### 步骤6：在Claude Desktop配置MCP
**配置文件位置：**

+ macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
+ Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**claude_desktop_config.json：**

json

```json
{
  "mcpServers": {
    "api-type-generator": {
      "command": "node",
      "args": ["/绝对路径/api-type-generator-mcp/dist/index.js"]
    }
  }
}
```

### 步骤7：在Claude中使用MCP

**重启Claude Desktop，然后在对话框中输入：**
```
使用api-type-generator MCP工具，根据以下API响应生成TypeScript类型：

{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "profile": {
      "avatar": "https://example.com/avatar.jpg",
      "bio": "前端开发工程师",
      "location": "北京"
    },
    "posts": [
      {
        "id": 1,
        "title": "我的第一篇文章",
        "content": "文章内容...",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}

接口名称：UserResponse
```

**Claude会调用MCP工具生成：**

typescript

```typescript
interface UserResponseDataProfileType {
  avatar: string
  bio: string
  location: string
}

interface UserResponseDataPostsItem {
  id: number
  title: string
  content: string
  createdAt: string
}

interface UserResponseData {
  id: number
  username: string
  email: string
  profile: UserResponseDataProfileType
  posts: UserResponseDataPostsItem[]
}

interface UserResponse {
  code: number
  message: string
  data: UserResponseData
}
```

### 步骤8：在Vue3项目中使用生成的类型
**src/types/api.ts：**

typescript

```typescript
// 复制Claude生成的类型定义
interface UserResponseDataProfile {
  avatar: string
  bio: string
  location: string
}

interface UserResponseDataPostsItem {
  id: number
  title: string
  content: string
  createdAt: string
}

interface UserResponseData {
  id: number
  username: string
  email: string
  profile: UserResponseDataProfile
  posts: UserResponseDataPostsItem[]
}

export interface UserResponse {
  code: number
  message: string
  data: UserResponseData
}
```

**src/api/user.ts：**

typescript

```typescript
import type { UserResponse } from '../types/api'

export const getUserInfo = async (userId: number): Promise<UserResponse> => {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}
```

**src/components/UserProfile.vue：**

vue

```vue
<template>
  <div v-if="userInfo" class="user-profile">
    <img :src="userInfo.data.profile.avatar" alt="avatar" />
    <h2>{{ userInfo.data.username }}</h2>
    <p>{{ userInfo.data.email }}</p>
    <p>{{ userInfo.data.profile.bio }}</p>
    
    <div class="posts">
      <h3>文章列表</h3>
      <div v-for="post in userInfo.data.posts" :key="post.id">
        <h4>{{ post.title }}</h4>
        <p>{{ post.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '../api/user'
import type { UserResponse } from '../types/api'

const userInfo = ref<UserResponse | null>(null)

onMounted(async () => {
  userInfo.value = await getUserInfo(1)
})
</script>
```

---

# **场景四：Vue2迁移Vue3（代码重构）(具体实案例-参考代码)**
## **完整运行步骤**
### 步骤1：准备Vue2组件示例
**创建测试项目：**

bash

```bash
mkdir vue-migration-demo
cd vue-migration-demo
npm create vue@latest vue3-project
cd vue3-project
npm install
```

**创建Vue2风格组件 src/components/TodoListVue2.vue（模拟旧代码）：**

vue

```vue
<template>
  <div class="todo-list">
    <h2>待办事项</h2>
    
    <div class="add-todo">
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo"
        placeholder="添加新任务"
      />
      <button @click="addTodo">添加</button>
    </div>

    <ul>
      <li 
        v-for="todo in filteredTodos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input 
          type="checkbox" 
          v-model="todo.completed"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">删除</button>
      </li>
    </ul>

    <div class="filters">
      <button @click="filter = 'all'">全部</button>
      <button @click="filter = 'active'">未完成</button>
      <button @click="filter = 'completed'">已完成</button>
    </div>

    <p>统计：{{ stats }}</p>
  </div>
</template>

<script>
// Vue2 Options API 风格
export default {
  name: 'TodoListVue2',
  
  data() {
    return {
      newTodo: '',
      todos: [],
      filter: 'all',
      nextId: 1
    }
  },

  computed: {
    filteredTodos() {
      if (this.filter === 'active') {
        return this.todos.filter(todo => !todo.completed)
      }
      if (this.filter === 'completed') {
        return this.todos.filter(todo => todo.completed)
      }
      return this.todos
    },

    stats() {
      const total = this.todos.length
      const completed = this.todos.filter(t => t.completed).length
      return `总计：${total}，已完成：${completed}`
    }
  },

  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({
          id: this.nextId++,
          text: this.newTodo,
          completed: false
        })
        this.newTodo = ''
      }
    },

    removeTodo(id) {
      this.todos = this.todos.filter(todo => todo.id !== id)
    }
  },

  mounted() {
    console.log('组件已挂载')
  },

  watch: {
    todos: {
      handler(newVal) {
        localStorage.setItem('todos', JSON.stringify(newVal))
      },
      deep: true
    }
  },

  created() {
    const saved = localStorage.getItem('todos')
    if (saved) {
      this.todos = JSON.parse(saved)
      this.nextId = Math.max(...this.todos.map(t => t.id), 0) + 1
    }
  }
}
</script>

<style scoped>
.todo-list {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
}

.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input[type="text"] {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

li.completed span {
  text-decoration: line-through;
  color: #999;
}

.filters {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #f0f0f0;
}
</style>
```

### 步骤2：在Claude中使用Prompt迁移

**在Claude对话框中输入：**
```
请将以下Vue2 Options API组件迁移为Vue3 Composition API，要求：

1. 使用 <script setup lang="ts">
2. data → ref/reactive
3. methods → 普通函数
4. computed → computed()
5. watch → watch()
6. 生命周期钩子对应转换（mounted → onMounted）
7. 添加完整的TypeScript类型定义
8. 优化性能（使用toRefs等）
9. 保持原有功能不变

[粘贴上面的TodoListVue2.vue完整代码]
```

### 步骤3：Claude生成的Vue3版本
**src/components/TodoListVue3.vue：**

vue

```vue
<template>
  <div class="todo-list">
    <h2>待办事项（Vue3版本）</h2>
    
    <div class="add-todo">
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo"
        placeholder="添加新任务"
      />
      <button @click="addTodo">添加</button>
    </div>

    <ul>
      <li 
        v-for="todo in filteredTodos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input 
          type="checkbox" 
          v-model="todo.completed"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">删除</button>
      </li>
    </ul>

    <div class="filters">
      <button 
        v-for="f in filters" 
        :key="f.value"
        :class="{ active: filter === f.value }"
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <p>{{ stats }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

// 类型定义
interface Todo {
  id: number
  text: string
  completed: boolean
}

type FilterType = 'all' | 'active' | 'completed'

interface Filter {
  value: FilterType
  label: string
}

// 响应式状态
const newTodo = ref('')
const todos = ref<Todo[]>([])
const filter = ref<FilterType>('all')
const nextId = ref(1)

// 过滤器选项
const filters: Filter[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'completed', label: '已完成' }
]

// 计算属性
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed)
    case 'completed':
      return todos.value.filter(todo => todo.completed)
    default:
      return todos.value
  }
})

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(t => t.completed).length
  const active = total - completed
  return `总计：${total}，已完成：${completed}，未完成：${active}`
})

// 方法
const addTodo = () => {
  const text = newTodo.value.trim()
  if (text) {
    todos.value.push({
      id: nextId.value++,
      text,
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}

const loadTodos = () => {
  const saved = localStorage.getItem('todos-vue3')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      todos.value = parsed
      nextId.value = Math.max(...parsed.map((t: Todo) => t.id), 0) + 1
    } catch (e) {
      console.error('加载待办事项失败', e)
    }
  }
}

const saveTodos = () => {
  localStorage.setItem('todos-vue3', JSON.stringify(todos.value))
}

// 监听器
watch(
  todos,
  () => {
    saveTodos()
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  loadTodos()
  console.log('Vue3组件已挂载')
})

// 暴露给模板（可选，用于调试）
defineExpose({
  todos,
  addTodo,
  removeTodo
})
</script>

<style scoped>
.todo-list {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input[type="text"]:focus {
  outline: none;
  border-color: #3b82f6;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

li:hover {
  background: #f9f9f9;
}

li.completed span {
  text-decoration: line-through;
  color: #999;
}

li span {
  flex: 1;
}

.filters {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.filters button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.filters button:hover {
  background: #f0f0f0;
}

.filters button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

button:hover {
  background: #f0f0f0;
}

p {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 14px;
}
</style>
```

### 步骤4：性能优化版本（进阶）
**src/components/TodoListOptimized.vue：**

vue

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, toRefs } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
}

type FilterType = 'all' | 'active' | 'completed'

// 使用 composable 抽离逻辑
const useTodoStorage = () => {
  const STORAGE_KEY = 'todos-optimized'
  
  const load = (): Todo[] => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('加载失败', e)
      }
    }
    return []
  }
  
  const save = (todos: Todo[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
  
  return { load, save }
}

const useTodos = () => {
  const { load, save } = useTodoStorage()
  
  const todos = ref<Todo[]>(load())
  const nextId = ref(
    todos.value.length > 0 
      ? Math.max(...todos.value.map(t => t.id)) + 1 
      : 1
  )
  
  const addTodo = (text: string) => {
    if (text.trim()) {
      todos.value.push({
        id: nextId.value++,
        text: text.trim(),
        completed: false
      })
    }
  }
  
  const removeTodo = (id: number) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
  }
  
  const toggleTodo = (id: number) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }
  
  // 自动保存
  watch(todos, () => save(todos.value), { deep: true })
  
  return {
    todos,
    addTodo,
    removeTodo,
    toggleTodo
  }
}

// 使用 composables
const { todos, addTodo, removeTodo, toggleTodo } = useTodos()
const newTodo = ref('')
const filter = ref<FilterType>('all')

// 计算属性
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(t => !t.completed)
    case 'completed':
      return todos.value.filter(t => t.completed)
    default:
      return todos.value
  }
})

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(t => t.completed).length
  return {
    total,
    completed,
    active: total - completed
  }
})

// 方法
const handleAddTodo = () => {
  addTodo(newTodo.value)
  newTodo.value = ''
}

onMounted(() => {
  console.log('优化版组件已挂载')
})
</script>

<template>
  <div class="todo-list-optimized">
    <h2>待办事项（性能优化版）</h2>
    
    <div class="add-todo">
      <input 
        v-model="newTodo" 
        @keyup.enter="handleAddTodo"
        placeholder="添加新任务"
      />
      <button @click="handleAddTodo">添加</button>
    </div>

    <ul>
      <li 
        v-for="todo in filteredTodos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input 
          type="checkbox" 
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">删除</button>
      </li>
    </ul>

    <div class="filters">
      <button 
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        全部
      </button>
      <button 
        :class="{ active: filter === 'active' }"
        @click="filter = 'active'"
      >
        未完成
      </button>
      <button 
        :class="{ active: filter === 'completed' }"
        @click="filter = 'completed'"
      >
        已完成
      </button>
    </div>

    <div class="stats">
      <span>总计：{{ stats.total }}</span>
      <span>已完成：{{ stats.completed }}</span>
      <span>未完成：{{ stats.active }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 样式同上，这里省略 */
.stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}
</style>
```

### 步骤5：对比测试页面
**src/App.vue：**

vue

```vue
<template>
  <div class="app">
    <h1>Vue2 vs Vue3 迁移对比</h1>
    
    <div class="comparison">
      <div class="column">
        <TodoListVue2 />
      </div>
      
      <div class="column">
        <TodoListVue3 />
      </div>
      
      <div class="column">
        <TodoListOptimized />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TodoListVue2 from './components/TodoListVue2.vue'
import TodoListVue3 from './components/TodoListVue3.vue'
import TodoListOptimized from './components/TodoListOptimized.vue'
</script>

<style>
.app {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.column {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
}
</style>
```

### 步骤6：运行项目
bash

```bash
# 确保在项目目录
cd vue3-project

# 安装依赖（如果还没安装）
npm install

# 运行项目
npm run dev

# 访问 http://localhost:5173
```

### 步骤7：性能对比测试
在浏览器开发者工具中：

1. **打开 Performance 面板**
2. **录制交互过程**（添加/删除任务）
3. **对比三个版本的性能差异**

**预期结果：**

+ Vue3 Composition API 版本：更好的类型推导
+ 优化版本：更少的重渲染，更好的代码组织
