import { defineConfig } from 'vitepress';

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: '前端知识库',
  description: '全面覆盖前端开发的核心知识点，从基础到高级，助力前端工程师技术成长',
  head: [['link', { rel: 'stylesheet', href: '/.vitepress/custom.css' }]],
  themeConfig: {
    nav: [
      // { text: 'React 面试题', link: '/react/' },
    ],
    search: {
      provider: 'local'
    },
    sidebar: {
      '/': [
        {
          text: 'CSS 面试题',
          collapsed: false,
          items: [
            { text: '概述', link: '/css/' },
            { text: '核心概念', link: '/css/core' },
            { text: '布局', link: '/css/layout' },
            { text: '视觉效果', link: '/css/visual' },
            { text: '性能优化', link: '/css/performance' },
            { text: '响应式设计', link: '/css/responsive' }
          ]
        },
        {
          text: 'Vue 3 面试题',
          collapsed: false,
          items: [
            { text: '概述', link: '/vue3/' },
            { text: '响应式原理', link: '/vue3/reactive' },
            { text: '生命周期', link: '/vue3/lifecycle' },
            { text: '组件通信', link: '/vue3/communication' },
            { text: 'Vue Router', link: '/vue3/router' },
            { text: '性能优化', link: '/vue3/performance' },
            { text: 'Composition API', link: '/vue3/composition-api' },
            { text: '其他特性', link: '/vue3/features' }
          ]
        },
        {
          text: 'React 面试题',
          collapsed: false,
          items: [
            { text: '概述', link: '/react/' },
            { text: '核心概念', link: '/react/core' },
            { text: 'Hooks', link: '/react/hooks' },
            { text: '状态管理', link: '/react/state' },
            { text: 'React Router', link: '/react/router' },
            { text: '性能优化', link: '/react/performance' },
            { text: '并发渲染', link: '/react/concurrent' },
            { text: '服务端渲染', link: '/react/ssr' }
          ]
        },
        {
          text: 'Js 面试题',
          collapsed: false,
          items: [
            { text: '数据类型', link: '/js/dataType/' },
            { text: '类型判断', link: '/js/typeCheck/' },
            { text: '数据类型转换', link: '/js/typeConversion/' }
          ]
        },
        {
          text: '工程化',
          collapsed: false,
          items: [
            { text: '微前端', link: '/engineering/micro-frontend/' },
            { text: '微前端问题及解决方案', link: '/engineering/micro-frontend-problems/' },
            { text: '前端性能优化', link: '/engineering/performance-optimization/' },
            { text: '组件库', link: '/engineering/component-library/' }
          ]
        },
        {
          text: 'AI 面试题',
          collapsed: false,
          items: [
            { text: '概述', link: '/ai/' },
            { text: 'AI 基础概念', link: '/ai/ai-basics/' },
            { text: '前端 AI 应用', link: '/ai/frontend-ai/' }
          ]
        }
      ]
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 前端知识库'
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com' }]
  }
});