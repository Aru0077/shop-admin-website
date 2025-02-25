// src/api/banner.api.ts
import request from '@/utils/request'
import type {
      IBanner,
      ICreateBannerParams,
      IUpdateBannerParams
} from '@/types/banner'

const BASE_URL = '/banner'

export const bannerApi = {
      // 获取首页 banner
      getBanner() {
            return request.get<IBanner>(BASE_URL)
      },

      // 创建首页 banner
      createBanner(data: ICreateBannerParams) {
            return request.post<IBanner>(BASE_URL, data)
      },

      // 更新首页 banner
      updateBanner(data: IUpdateBannerParams) {
            return request.put<IBanner>(BASE_URL, data)
      },

      // 删除首页 banner
      deleteBanner() {
            return request.delete<void>(BASE_URL)
      }
}