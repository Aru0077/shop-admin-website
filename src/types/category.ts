// src/types/category.ts
export interface ICategory {
      id: number;
      name: string;
      parentId: number;
      level: number;
      createdAt: string;
      updatedAt: string;
      children?: ICategory[];
  }
  
  // 创建分类参数接口
  export interface ICreateCategoryParams {
      name: string;
      parentId?: number;
  }
  
  // 更新分类参数接口
  export interface IUpdateCategoryParams {
      name: string;
      parentId?: number;
  }
  
  // 分类树实际响应结构
  export interface ICategoryTreeResponse {
      success: boolean;
      message: string;
      data: {
          [key: string]: ICategory | { id: string; parentId: string; children?: ICategory[] };
      };
  }