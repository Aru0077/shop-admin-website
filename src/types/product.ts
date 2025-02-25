// src/types/product.ts
export enum ProductStatus {
    DRAFT = 'DRAFT',                 // 草稿
    OFFLINE = 'OFFLINE',             // 下架
    ONLINE = 'ONLINE',               // 上架
    DELETED = 'DELETED'              // 删除
}

export interface ICategory {
    id: number;                      
    name: string;
    parentId: number;              
    level: number;
    createdAt: string;
    updatedAt: string;
    children?: ICategory[];
}

export interface ISkuSpec {
    sku_id: number;                   
    specId: number;                   
    specValueId: number;              
}

export interface ISku {
    id: number;                      
    productId: number;               
    price: number;
    promotion_price?: number;
    stock: number;
    skuCode: string;
    image?: string;
    sku_specs: ISkuSpec[];
}

export interface IProduct {
    id: number;                     
    name: string;
    categoryId: number;             
    category?: ICategory;
    content?: string;
    mainImage?: string;
    detailImages?: string[];        
    is_promotion: number;
    productCode: string;
    status: ProductStatus;
    skus: ISku[];
    salesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateProductParams {
    name: string;
    categoryId: number;               
    content?: string;
    mainImage?: string;
    detailImages?: string[];         
    is_promotion?: number;
    productCode: string;
}

export interface IUpdateProductParams {
    name?: string;
    categoryId?: number;            
    content?: string;
    mainImage?: string;
    detailImages?: string[];         
    is_promotion?: number;
    productCode?: string;
}

export interface IUpdateStatusParams {
    status: ProductStatus;
}

export interface IProductQueryParams {
    page?: number;
    limit?: number;
    categoryId?: number;             
    status?: ProductStatus;
    is_promotion?: number;
    sort?: 'stock' | 'sales' | 'created';
    order?: 'asc' | 'desc';
    keyword?: string;
}

export interface IProductStats {
    onlineCount: number;
    lowStockCount: number;
    soldOutCount: number;
}

export interface IProductListResponse {
    total: number;
    page: number;
    limit: number;
    data: IProduct[];
}

