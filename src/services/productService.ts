
import { Product, Branch, ProductBranch, AlternativeProduct } from "@/types/pharmacy";
import { mockProducts, mockBranches, mockProductBranches, mockAlternativeProducts } from "./mockData";

// In-memory data store for the demo
let products = [...mockProducts];
let branches = [...mockBranches];
let productBranches = [...mockProductBranches];
let alternativeProducts = [...mockAlternativeProducts];

// Get products by pharmacy ID
export const getProductsByPharmacyId = (pharmacyId: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products.filter(product => product.pharmacyId === pharmacyId));
    }, 500);
  });
};

// Get branches by pharmacy ID
export const getBranchesByPharmacyId = (pharmacyId: string): Promise<Branch[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(branches.filter(branch => branch.pharmacyId === pharmacyId));
    }, 500);
  });
};

// Get product branches
export const getProductBranches = (productId: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const branchIds = productBranches
        .filter(pb => pb.productId === productId)
        .map(pb => pb.branchId);
      resolve(branchIds);
    }, 300);
  });
};

// Get alternative products
export const getAlternativeProducts = (productId: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alternativeIds = alternativeProducts
        .filter(ap => ap.productId === productId)
        .map(ap => ap.alternativeProductId);
      resolve(alternativeIds);
    }, 300);
  });
};

// Add a new product
export const addProduct = (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">, 
  selectedBranches: string[],
  selectedAlternatives: string[]
): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a new product ID
      const newId = `prod${products.length + 1}`;
      
      // Create the new product
      const newProduct: Product = {
        id: newId,
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to products list
      products = [...products, newProduct];
      
      // Add branch relationships
      const newProductBranches = selectedBranches.map(branchId => ({
        productId: newId,
        branchId
      }));
      productBranches = [...productBranches, ...newProductBranches];
      
      // Add alternative product relationships
      const newAlternatives = selectedAlternatives.map(altProductId => ({
        productId: newId,
        alternativeProductId: altProductId
      }));
      
      // Add reciprocal relationships
      const reciprocalAlternatives = selectedAlternatives.map(altProductId => ({
        productId: altProductId,
        alternativeProductId: newId
      }));
      
      alternativeProducts = [...alternativeProducts, ...newAlternatives, ...reciprocalAlternatives];
      
      resolve(newProduct);
    }, 1000);
  });
};

// Update a product
export const updateProduct = (
  productId: string,
  updatedData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
  selectedBranches: string[],
  selectedAlternatives: string[]
): Promise<Product> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        reject(new Error("Product not found"));
        return;
      }
      
      // Update product data
      const updatedProduct: Product = {
        ...products[productIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      products = [
        ...products.slice(0, productIndex),
        updatedProduct,
        ...products.slice(productIndex + 1)
      ];
      
      // Update branch relationships
      // First remove all existing relationships
      productBranches = productBranches.filter(pb => pb.productId !== productId);
      
      // Then add the new relationships
      const newProductBranches = selectedBranches.map(branchId => ({
        productId,
        branchId
      }));
      productBranches = [...productBranches, ...newProductBranches];
      
      // Update alternative product relationships
      // First remove existing relationships (both directions)
      alternativeProducts = alternativeProducts.filter(
        ap => ap.productId !== productId && ap.alternativeProductId !== productId
      );
      
      // Then add new relationships
      const newAlternatives = selectedAlternatives.map(altProductId => ({
        productId,
        alternativeProductId: altProductId
      }));
      
      const reciprocalAlternatives = selectedAlternatives.map(altProductId => ({
        productId: altProductId,
        alternativeProductId: productId
      }));
      
      alternativeProducts = [...alternativeProducts, ...newAlternatives, ...reciprocalAlternatives];
      
      resolve(updatedProduct);
    }, 1000);
  });
};

// Delete products
export const deleteProducts = (productIds: string[]): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Remove products
      products = products.filter(product => !productIds.includes(product.id));
      
      // Remove branch relationships
      productBranches = productBranches.filter(
        pb => !productIds.includes(pb.productId)
      );
      
      // Remove alternative product relationships (both directions)
      alternativeProducts = alternativeProducts.filter(
        ap => !productIds.includes(ap.productId) && !productIds.includes(ap.alternativeProductId)
      );
      
      resolve(productIds);
    }, 1000);
  });
};

// Get product by ID
export const getProductById = (productId: string): Promise<Product | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find(p => p.id === productId) || null;
      resolve(product);
    }, 300);
  });
};
