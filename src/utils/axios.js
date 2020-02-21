import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getAccessToken, removeAccessToken, removeToken } from '@/utils/auth'
import router from '@/router'

const code_http = {
  processing: 102,
  ok: 200,
  completed: 201,
  done: 202,
  created: 204,
  missing_parameters: 400,
  unauthorized: 401,
  forbidden: 403,
  underfined: 404,
  not_allowed: 405,
  request_expired: 408,
  conflict: 409,
  unprocessable: 422,
  resent: 429,
  fail: 500,
  exception: 501,
  unsavedb: 502,
  unavailable: 503
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_GATEWAY_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.access_token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getAccessToken();
      config.headers['Content-Type'] = 'application/json';
    }
    console.log(getAccessToken())
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
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

    // if the custom code is not 20000, it is judged as an error.
    if (response.status !== code_http.ok) {
      Message({
        message: response.message + 'abcd' || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (response.status === code_http.forbidden || response.code === code_http.unprocessable || response.code === code_http.unauthorized) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/login').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(response.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug

    if (error.response.status === code_http.forbidden || error.response.status === code_http.unprocessable || error.response.status === code_http.unauthorized) {
      // to re-login
      MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        confirmButtonText: 'Re-Login',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        removeToken()
        removeAccessToken()
        router.push('/login');
      })
    }

    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
