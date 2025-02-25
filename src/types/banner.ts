// src/types/banner.ts
export interface IBanner {
      id: number;
      imageUrl: string;
      title: string;
      content?: string;
      createdAt: string;
      updatedAt: string;
}

export interface ICreateBannerParams {
      imageUrl: string;
      title: string;
      content?: string;
}

export interface IUpdateBannerParams {
      imageUrl: string;
      title: string;
      content?: string;
}