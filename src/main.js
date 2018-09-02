import Vue from 'vue'
import Vuetify from 'vuetify'
import axios from 'axios'
import VueTimeago from 'vue-timeago'
import App from './App'
import router from './router'
import store from './store'
// import bulma from 'bulma'
import moment from 'moment'

require('material-design-icons/iconfont/material-icons.css')
require('typeface-roboto/index.css')
require('vuetify/dist/vuetify.min.css')
require('bulma/css/bulma.css')

Vue.filter('formatRemaining', function (value) {
  if (value) {
    return moment.unix(value).toNow(true)
  }
})
Vue.filter('formatSeconds', function (value) {
  if (value) {
    return moment.duration(value, 'seconds').humanize()
  }
})
Vue.filter('timeago', function (value) {
  if (value) {
    return moment.unix(value).fromNow()
  }
})
Vue.use(VueTimeago, {
  name: 'timeago',
  locale: 'en-US',
  locales: {
    'en-US': require('vue-timeago/locales/en-US.json')
  }
})

Vue.use(Vuetify, {
  iconfont: 'fa',
  icons: {
    'cancel': 'fas fa-ban',
    'menu': 'fas fa-ellipsis-v'
  },
  theme: {
    primary: '#b71c1c',
    secondary: '#b0bec5',
    accent: '#8c9eff',
    error: '#b71c1c'
  }
})
// Vue.use(bulma)

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.config.keyCodes.enter = null
/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
