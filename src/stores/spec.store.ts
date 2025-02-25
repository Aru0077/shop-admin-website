// src/stores/spec.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { specApi } from '@/api/spec.api'
import type {
      ISpec,
      ICreateSpecParams,
      IUpdateSpecParams
} from '@/types/spec'

export const useSpecStore = defineStore('spec', () => {
      const specList = ref<ISpec[]>([])
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)

      // 检查是否需要刷新数据（5分钟缓存）
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      // 获取规格列表
      const getSpecList = async (forceRefresh = false) => {
            if (!forceRefresh && specList.value.length > 0 && !needsRefresh()) {
                  return specList.value
            }

            loading.value = true
            try {
                  const res = await specApi.getSpecList()
                  specList.value = res
                  lastFetchTime.value = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 获取规格详情
      const getSpecDetail = async (id: number) => {
            const spec = specList.value.find(item => item.id === id)
            if (spec && !needsRefresh()) {
                  return spec
            }
            return await specApi.getSpecDetail(id)
      }

      // 创建规格
      const createSpec = async (params: ICreateSpecParams) => {
            const res = await specApi.createSpec(params)
            await getSpecList(true)
            return res
      }

      // 更新规格
      const updateSpec = async (id: number, params: IUpdateSpecParams) => {
            const res = await specApi.updateSpec(id, params)
            await getSpecList(true)
            return res
      }

      // 删除规格
      const deleteSpec = async (id: number) => {
            await specApi.deleteSpec(id)
            await getSpecList(true)
      }

      // 根据ID查找规格
      const findSpecById = (id: number): ISpec | undefined => {
            return specList.value.find(spec => spec.id === id)
      }

      // 检查规格名称是否已存在
      const isSpecNameExists = (name: string, excludeId?: number): boolean => {
            return specList.value.some(spec =>
                  spec.name === name && (!excludeId || spec.id !== excludeId)
            )
      }

      return {
            specList,
            loading,
            lastFetchTime,
            getSpecList,
            getSpecDetail,
            createSpec,
            updateSpec,
            deleteSpec,
            findSpecById,
            isSpecNameExists,
            needsRefresh
      }
}, {
      persist: true
})