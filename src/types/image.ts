// src/types/image.ts
export interface IImage {
      id: number;
      imageUrl: string;
      isUsed: number;
      createdAt: string;
}

export interface IImagePaginationParams {
      page?: number;
      limit?: number;
      isUsed?: number | null;
}

export interface IImageResponse {
      id: string;
      imageUrl: string;
}

export interface IBatchDeleteParams {
      ids: string[];
}

export interface IPaginationResponse<T> {
      total: number;
      page: number;
      limit: number;
      data: T[];
}