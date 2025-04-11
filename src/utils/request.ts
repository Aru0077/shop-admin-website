// src/utils/http.request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading'


interface ApiResponse<T = any> {
      success: boolean
      message: string
      data: T
}

class HttpRequest {
      private instance: AxiosInstance
      private loading?: LoadingInstance
      private requestCount: number = 0


      constructor() {
            this.instance = axios.create({
                  baseURL: import.meta.env.VITE_API_BASE_URL,
                  timeout: 10000,
                  headers: {
                        'Content-Type': 'application/json'
                  }
            })

            this.setupInterceptors()
      }

      private showLoading() {
            if (this.requestCount === 0) {
                  this.loading = ElLoading.service({
                        lock: true,
                        text: '加载中...',
                        background: 'rgba(0, 0, 0, 0.7)'
                  })
            }
            this.requestCount++
      }

      private hideLoading() {
            this.requestCount--
            if (this.requestCount === 0) {
                  this.loading?.close()
            }
      }


      private setupInterceptors() {
            this.instance.interceptors.request.use(
                  (config) => {
                        this.showLoading()
                        const token = localStorage.getItem('token')
                        if (token && config.headers) {
                              config.headers.Authorization = `Bearer ${token}`
                        }
                        return config
                  },
                  (error) => {
                        this.hideLoading()
                        return Promise.reject(error)
                  }
            )

            this.instance.interceptors.response.use(
                  (response: AxiosResponse<ApiResponse>) => {
                        this.hideLoading()
                        console.log('结果:', response);

                        const { data: res } = response

                        if (!res?.success) {
                              return Promise.reject(new Error(res.message || 'Request failed'))
                        }

                        return res.data
                  },
                  (error) => {
                        this.hideLoading()
                        const message = error.response?.data?.message || 'Network error'
                        console.log(error.response?.data);

                        if (error.response?.status === 401) {
                              localStorage.removeItem('token')
                              ElMessage.error('登录已过期，请重新登录')
                              setTimeout(() => {
                                    window.location.href = '/login'
                              }, 1500) // 延迟1.5秒，让用户看到提示消息
                        }

                        return Promise.reject(new Error(message))
                  }
            )
      }

      public get<T = any>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
            return this.instance.get(url, { ...config, params })
      }

      public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
            return this.instance.post(url, data, config)
      }

      public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
            return this.instance.put(url, data, config)
      }

      public delete<T = any>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
            return this.instance.delete(url, { ...config, params })
      }

      public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
            return this.instance.patch(url, data, config)
      }
}

const httpRequest = new HttpRequest()
export default httpRequest