import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'

// 导入全局样式
import '@/assets/styles/main.scss'

// 导入国际化配置
import zhCN from '@/assets/locales/zh-CN.json'
import enUS from '@/assets/locales/en-US.json'

// 创建i18n实例
const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
