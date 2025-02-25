// src/types/spec.ts
export interface ISpec {
      id: number;           // 改为number类型
      name: string;
      values: ISpecValue[];
      createdAt?: string;
      updatedAt?: string;
}

export interface ISpecValue {
      id: number;          // 改为number类型
      specId: number;      // 改为number类型
      value: string;
}

export interface ICreateSpecParams {
      name: string;
      values: string[];
}

export interface IUpdateSpecParams {
      name?: string;
      values?: string[];
}

// 添加规格组合类型定义
export interface ISpecCombination {
      specId: number;
      specValueId: number;
}

// 更新事件类型
export type SpecCombinationsType = Array<ISpecCombination[]>;