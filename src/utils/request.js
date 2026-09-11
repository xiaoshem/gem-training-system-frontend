import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000, // request timeout
  crossDomain: true
})

let handlingUnauthorized = false

function handleUnauthorized() {
  if (handlingUnauthorized) {
    return
  }
  handlingUnauthorized = true

  const redirect = router.currentRoute.path === '/login'
    ? null
    : router.currentRoute.fullPath

  store.dispatch('user/resetToken')
    .catch(() => {})
    .then(() => {
      Message.closeAll()
      Message({
        message: '登录已过期，请重新登录',
        type: 'error',
        duration: 5 * 1000
      })

      if (router.currentRoute.path !== '/login') {
        return router.replace({
          path: '/login',
          query: redirect ? { redirect } : {}
        }).catch(() => {})
      }
    })
    .then(() => {
      window.setTimeout(() => {
        handlingUnauthorized = false
      }, 1000)
    })
}

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    const newToken = response.headers['authorization'] // 获取新的 Token
    if (newToken) {
      setToken(newToken) // 存储新的 Token
      store.commit('user/SET_TOKEN', newToken) // 同步更新当前标签页的 Vuex Token
    }

    if (res.code !== 1) {
      Message({
        message: res.msg || '错误',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg || '错误'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          handleUnauthorized()
          break
        case 403:
          Message({
            message: '没有权限访问该资源',
            type: 'error',
            duration: 5 * 1000
          })
          break
        case 404:
          Message({
            message: '请求的资源不存在',
            type: 'error',
            duration: 5 * 1000
          })
          break
        default:
          Message({
            message: error.response.data.msg || '发生未知错误',
            type: 'error',
            duration: 5 * 1000
          })
      }
    } else {
      Message({
        message: '网络错误，请稍后重试',
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
