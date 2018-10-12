import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI, { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

import api from '@/api'
import errinfo from '@/api/errinfo'

import filters from '@/filters'
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

// Vue.use(VueQuillEditor)
Vue.use(ElementUI)

Vue.prototype.$api = api
Vue.prototype.$error = function (msg) {
    Message({
        showClose: true,
        message: errinfo[msg] || msg,
        type: 'error'
    })
}
Vue.prototype.$success = function (msg) {
    Message({
        showClose: true,
        message: errinfo[msg] || msg,
        type: 'success'
    })
}

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
