
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  pharmacyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  pharmacyId: string;
}

export interface ProductBranch {
  productId: string;
  branchId: string;
}

export interface AlternativeProduct {
  productId: string;
  alternativeProductId: string;
}

export interface NewProductForm {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  branches: string[];
  alternatives: string[];
}
