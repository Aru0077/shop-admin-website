// src/types/user.ts
import { IPaginationParams, IPaginationResponse } from './admin'

// 用户基本信息接口
export interface IUser {
      id: string;
      username: string;
      facebookId: string | null;
      isBlacklist: number;
      createdAt: string;
      updatedAt: string;
      _count?: {
            orders: number;
            addresses: number;
            cartItems: number;
            favorites: number;
      };
}

// 用户搜索参数接口
export interface IUserSearchParams extends IPaginationParams {
      username?: string;
}

// 用户分页响应接口
export interface IUserPaginationResponse extends IPaginationResponse<IUser> { }

// 设置黑名单状态参数接口
export interface IBlacklistStatusParams {
      isBlacklist: number;
}