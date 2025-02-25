// 管理员用户接口
export interface IAdminUser {
      id: number;
      username: string;
      status: number;
      isSuper: boolean;
      lastLoginTime: string | null;
      createdAt: string;
      updatedAt: string;
  }
  
  // 登录参数接口
  export interface ILoginParams {
      username: string;
      password: string;
  }
  
  // 创建管理员参数接口
  export interface ICreateAdminParams {
      username: string;
      password: string;
      isSuper?: boolean;
  }
  
  // 更新状态参数接口
  export interface IUpdateStatusParams {
      status: number;
  }
  
  // 重置密码参数接口
  export interface IResetPasswordParams {
      newPassword: string;
  }
  
  // 分页参数接口
  export interface IPaginationParams {
      page?: number;
      limit?: number;
  }
  
  // 分页响应接口
  export interface IPaginationResponse<T> {
      total: number;
      page: number;
      limit: number;
      data: T[];
  }
  
  // 登录响应接口
  export interface ILoginResponse {
      token: string;
      admin: Omit<IAdminUser, 'password'>;
  }