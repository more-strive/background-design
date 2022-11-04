import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import './icons'
import 'element-ui/lib/theme-chalk/index.css';
import './assets/styles/base.scss'

Vue.config.productionTip = false
Vue.use(ElementUI);
new Vue({
  render: h => h(App),
}).$mount('#app')
