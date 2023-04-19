import { createApp } from 'vue'
import App from './App.vue'
import VueGtag from 'vue-gtag'
// import './assets/main.css'

createApp(App)
  .use(VueGtag, {
    config: { id: 'G-7620876686' },
  })
  .mount('#app')
