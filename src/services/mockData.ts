
import { Product, Branch } from "@/types/pharmacy";

// Mock products
export const mockProducts: Product[] = [
  {
    id: "prod1",
    name: "Paracetamol 500mg",
    price: 5.99,
    description: "Pain reliever and fever reducer",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3",
    pharmacyId: "PHARM123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod2",
    name: "Ibuprofen 200mg",
    price: 7.49,
    description: "Anti-inflammatory pain reliever",
    imageUrl: "https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3",
    pharmacyId: "PHARM123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod3",
    name: "Vitamin C 1000mg",
    price: 12.99,
    description: "Immune system support supplement",
    imageUrl: "https://images.unsplash.com/photo-1626111395144-ec8a9d7e5c43?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3",
    pharmacyId: "PHARM123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod4",
    name: "Allergy Relief",
    price: 15.99,
    description: "24-hour non-drowsy allergy relief",
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=2680&ixlib=rb-4.0.3",
    pharmacyId: "PHARM123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod5",
    name: "Multivitamin",
    price: 24.99,
    description: "Daily multivitamin with minerals",
    imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=2487&ixlib=rb-4.0.3",
    pharmacyId: "PHARM456",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Mock branches
export const mockBranches: Branch[] = [
  {
    id: "branch1",
    name: "Downtown Branch",
    address: "123 Main St, City",
    pharmacyId: "PHARM123",
  },
  {
    id: "branch2",
    name: "Northside Branch",
    address: "456 Park Ave, City",
    pharmacyId: "PHARM123",
  },
  {
    id: "branch3",
    name: "Westend Branch",
    address: "789 West St, City",
    pharmacyId: "PHARM123",
  },
  {
    id: "branch4",
    name: "Eastside Branch",
    address: "321 East Rd, City",
    pharmacyId: "PHARM456",
  }
];

// Mock product-branch relationships
export const mockProductBranches = [
  { productId: "prod1", branchId: "branch1" },
  { productId: "prod1", branchId: "branch2" },
  { productId: "prod2", branchId: "branch1" },
  { productId: "prod3", branchId: "branch3" },
  { productId: "prod4", branchId: "branch1" },
  { productId: "prod4", branchId: "branch2" },
  { productId: "prod4", branchId: "branch3" },
];

// Mock alternative products relationships
export const mockAlternativeProducts = [
  { productId: "prod1", alternativeProductId: "prod2" },
  { productId: "prod2", alternativeProductId: "prod1" },
  { productId: "prod3", alternativeProductId: "prod5" },
];
