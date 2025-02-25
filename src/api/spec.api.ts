// src/api/spec.api.ts
import request from '@/utils/request'
import type {
      ISpec,
      ICreateSpecParams,
      IUpdateSpecParams
} from '@/types/spec'

const BASE_URL = '/specs'

export const specApi = {
      // 获取规格列表
      getSpecList() {
            return request.get<ISpec[]>(BASE_URL)
      },

      // 获取规格详情
      getSpecDetail(id: number) {
            return request.get<ISpec>(`${BASE_URL}/${id}`)
      },

      // 创建规格
      createSpec(data: ICreateSpecParams) {
            return request.post<ISpec>(BASE_URL, data)
      },

      // 更新规格
      updateSpec(id: number, data: IUpdateSpecParams) {
            return request.put<ISpec>(`${BASE_URL}/${id}`, data)
      },

      // 删除规格
      deleteSpec(id: number) {
            return request.delete<void>(`${BASE_URL}/${id}`)
      }
}