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
  site_url?: string;
  borough?: string;
  street?: string;
  city?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  working_hours?: string;
  about?: string;
  location_link?: string;
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
  url: string;
  branches: string[];
  alternatives: string[];
}

export interface NewBranchForm {
  name: string;
  site_url?: string;
  borough?: string;
  street?: string;
  city?: string;
  latitude: number;
  longitude: number;
  rating?: string;
  working_hours?: string;
  about?: string;
  location_link?: string;
}
