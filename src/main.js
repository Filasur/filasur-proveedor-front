import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createNotivue } from 'notivue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import 'notivue/notification.css'
import 'notivue/animations.css'
import 'sweetalert2/dist/sweetalert2.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(createNotivue({
  position: 'top-right',
  limit: 4,
  enqueue: true,
  avoidDuplicates: true,
  notifications: {
    global: {
      duration: 5000,
    },
  },
}))
app.use(router)
app.mount('#app')
