// src/api/image.api.ts
import request from '@/utils/request'
import type {
      IImage,
      IImagePaginationParams,
      IImageResponse,
      IBatchDeleteParams,
      IPaginationResponse
} from '@/types/image'

const BASE_URL = '/images'

export const imageApi = {
      // 批量上传图片
      uploadImages(files: File[]) {
            const formData = new FormData()
            files.forEach(file => {
                  formData.append('files', file)
            })

            return request.post<IImageResponse[]>(`${BASE_URL}/upload`, formData, {
                  headers: {
                        'Content-Type': 'multipart/form-data'
                  }
            })
      },

      // 获取图片列表
      getImageList(params: IImagePaginationParams) {
            return request.get<IPaginationResponse<IImage>>(BASE_URL, params)
      },

      // 删除单个图片
      deleteImage(id: number) {
            return request.delete<void>(`${BASE_URL}/${id}`)
      },

      // 批量删除图片
      batchDeleteImages(data: IBatchDeleteParams) {
            return request.post<void>(`${BASE_URL}/batch-delete`, data)
      }
}