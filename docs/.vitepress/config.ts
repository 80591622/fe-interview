import { defineConfig } from 'vitepress';

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: '前端知识库',
  description: '全面覆盖前端开发的核心知识点，从基础到高级，助力前端工程师技术成长',
  // head: [['link', { rel: 'stylesheet', href: '/.vitepress/custom.css' }]],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '通用面试题', link: '/general/' },
      { text: 'React 面试题', link: '/react/' },
      { text: 'Vue 3 面试题', link: '/vue3/' }
    ],
    search: {
      provider: 'local'
    },
    sidebar: {
      '/vue3/': [
        {
          text: 'Vue 3 面试题',
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
