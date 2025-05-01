import { Client, Account, Databases, ID, Query } from "appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.ksu.pharmaseek",
  projectId: "67a8f88b00066166aec8",
  databaseID: "67a8fc1f00123f3631b6",
  patientCollectionID: "67a8fc92002ef2b6fb5d",
  pharmacyCollectionID: "67b1cb17000847162887",
  branchCollectionID: "67adccce0027756823da",
  productCollectionID: "67addc06001497deffdb",
  addressCollectionID: "67b74b77000f3e299e33",
  reminderCollectionID: "67c1fb7400210ddc07dc",
  ticketCollectionID: "67c92eb400022f36cb17",
  product_availabilityCollectionID: "67ade8ee0020fa040538",
  alternativeCollectionID: "680f009f000b95114982",
  wishlistCollectionID: "67fa1767002e153281c8",
  search_logCollectionID: "6810c417001811f5b7ff",
  storageID: "67a8fee40010aedf2888",
};

const client = new Client();
client.setEndpoint(config.endpoint).setProject(config.projectId);

const account = new Account(client);
const databases = new Databases(client);

export const signIn = async (pharmacyId: string, password: string) => {
  try {
    if (!pharmacyId.trim()) throw new Error("Pharmacy ID is required");
    if (!password.trim()) throw new Error("Password is required");

    const pharmacy = await databases.listDocuments(
      config.databaseID,
      config.pharmacyCollectionID,
      [Query.equal("$id", pharmacyId)]
    );

    if (pharmacy.documents.length === 0 || password !== "admin123") {
      throw new Error("Invalid credentials");
    }

    const session = await account.createAnonymousSession();

    localStorage.setItem("pharmacyId", pharmacyId);
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const loadPharmacyData = async (pharmacyId: string) => {
  try {
    const response = await databases.listDocuments(
      config.databaseID,
      config.pharmacyCollectionID,
      [Query.equal("$id", pharmacyId)]
    );

    if (response.documents.length > 0) {
      return {
        id: response.documents[0].$id,
        name: response.documents[0].name,
      };
    }
    return null;
  } catch (error) {
    console.error("Error loading pharmacy data:", error);
    return null;
  }
};

export const checkSession = async () => {
  try {
    return await account.getSession("current");
  } catch (error) {
    // Clear local storage if session check fails
    localStorage.removeItem("pharmacyId");
    throw error;
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.log("No active session to delete");
  }
  // Always clear local storage
  localStorage.removeItem("pharmacyId");
};

export const getBranchesByPharmacyId = async (pharmacyId: string) => {
  try {
    const response = await databases.listDocuments(
      config.databaseID,
      config.branchCollectionID,
      [Query.equal("pharmacyId", pharmacyId)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
};

export const getProductsByPharmacyId = async (pharmacyId: string) => {
  try {
    const response = await databases.listDocuments(
      config.databaseID,
      config.productCollectionID,
      [Query.equal("pharmacyId", pharmacyId), Query.limit(10000)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
export const getProductsExceptThisByPharmacyId = async (
  pharmacyId: string,
  productId: string
) => {
  try {
    const response = await databases.listDocuments(
      config.databaseID,
      config.productCollectionID,
      [Query.equal("pharmacyId", pharmacyId), Query.limit(10000)]
    );
    const filtered = response.documents.filter(
      (product) => product.$id !== productId
    );
    return filtered;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
export const cleanAboutText = (text: any) => {
  if (!text || typeof text !== "string") return "";

  return text.replace(/\s+/g, " ").trim();
};

export const addProducts = async (
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  url: string
) => {
  try {
    const response = await databases.createDocument(
      config.databaseID,
      config.productCollectionID,
      ID.unique(),
      {
        name: name,
        price: price,
        description: cleanAboutText(description),
        image: imageUrl,
        url: url,
        pharmacyId: localStorage.getItem("pharmacyId"),
      }
    );
    return response;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const addProduct = async (
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  url: string,
  branches: string[],
  alternatives: string[]
) => {
  try {
    const response = await databases.createDocument(
      config.databaseID,
      config.productCollectionID,
      ID.unique(),
      {
        name: name,
        price: price,
        description: cleanAboutText(description),
        image: imageUrl,
        url: url,
        pharmacyId: localStorage.getItem("pharmacyId"),
      }
    );
    // Add branches availability to the product
    for (const branchId of branches) {
      await databases.createDocument(
        config.databaseID,
        config.product_availabilityCollectionID,
        ID.unique(),
        {
          productId: response.$id,
          branchId: branchId,
        }
      );
    }

    // Add alternative products to the product
    for (const alternativeId of alternatives) {
      await databases.createDocument(
        config.databaseID,
        config.alternativeCollectionID,
        ID.unique(),
        {
          productId: response.$id,
          alternativeProductId: alternativeId,
        }
      );
      await databases.createDocument(
        config.databaseID,
        config.alternativeCollectionID,
        ID.unique(),
        {
          productId: alternativeId,
          alternativeProductId: response.$id,
        }
      );
    }
    return response;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const modifyProduct = async (
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  url: string,
  branches: string[],
  alternatives: string[],
  productId: string
) => {
  try {
    const response = await databases.updateDocument(
      config.databaseID,
      config.productCollectionID,
      productId,
      {
        name: name,
        price: price,
        description: description,
        image: imageUrl,
        url: url,
      }
    );

    // Delete branches availability from the product
    const oldBranches = await databases.listDocuments(
      config.databaseID,
      config.product_availabilityCollectionID,
      [Query.equal("productId", productId)]
    );

    for (const branch of oldBranches.documents) {
      await databases.deleteDocument(
        config.databaseID,
        config.product_availabilityCollectionID,
        branch.$id
      );
    }
    // Add branches availability to the product
    for (const branchId of branches) {
      await databases.createDocument(
        config.databaseID,
        config.product_availabilityCollectionID,
        ID.unique(),
        {
          productId: response.$id,
          branchId: branchId,
        }
      );
    }

    // Delete alternative products from the product
    const oldAlternatives = await databases.listDocuments(
      config.databaseID,
      config.alternativeCollectionID,
      [
        Query.or([
          Query.equal("productId", productId),
          Query.equal("alternativeProductId", productId),
        ]),
      ]
    );

    for (const alternative of oldAlternatives.documents) {
      await databases.deleteDocument(
        config.databaseID,
        config.alternativeCollectionID,
        alternative.$id
      );
    }

    // Insert new alternatives (BIDIRECTIONAL)
    for (const alternativeId of alternatives) {
      await databases.createDocument(
        config.databaseID,
        config.alternativeCollectionID,
        ID.unique(),
        {
          productId: response.$id,
          alternativeProductId: alternativeId,
        }
      );
      await databases.createDocument(
        config.databaseID,
        config.alternativeCollectionID,
        ID.unique(),
        {
          productId: alternativeId,
          alternativeProductId: response.$id,
        }
      );
    }
    return response;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const getProductAvailability = async (productId: string) => {
  try {
    const response = await databases.listDocuments(
      config.databaseID,
      config.product_availabilityCollectionID,
      [Query.equal("productId", productId)]
    );
    const branchIds = response.documents.map((doc) => doc.branchId.$id);
    return branchIds;
  } catch (error) {
    console.error("Error fetching product availability:", error);
    return [];
  }
};
export const getProductAlternatives = async (productId: string) => {
  try {
    const response = await databases.listDocuments(
      config.databaseID,
      config.alternativeCollectionID,
      [Query.equal("productId", productId)]
    );
    const alternativeProductIds = response.documents.map(
      (doc) => doc.alternativeProductId
    );
    return alternativeProductIds;
  } catch (error) {
    console.error("Error fetching product alternatives:", error);
    return [];
  }
};

export const deleteProducts = async (productIds: string[]) => {
  try {
    // Run all deletions in parallel
    await Promise.all(
      productIds.map(async (productId) => {
        // 1. Delete all availabilities
        const availabilities = await databases.listDocuments(
          config.databaseID,
          config.product_availabilityCollectionID,
          [Query.equal("productId", productId)]
        );

        await Promise.all(
          availabilities.documents.map((availability) =>
            databases.deleteDocument(
              config.databaseID,
              config.product_availabilityCollectionID,
              availability.$id
            )
          )
        );

        // 2. Delete all alternatives (both directions)
        const alternatives = await databases.listDocuments(
          config.databaseID,
          config.alternativeCollectionID,
          [
            Query.or([
              Query.equal("productId", productId),
              Query.equal("alternativeProductId", productId),
            ]),
          ]
        );

        await Promise.all(
          alternatives.documents.map((alternative) =>
            databases.deleteDocument(
              config.databaseID,
              config.alternativeCollectionID,
              alternative.$id
            )
          )
        );

        // 3. Delete the product itself
        await databases.deleteDocument(
          config.databaseID,
          config.productCollectionID,
          productId
        );
      })
    );
  } catch (error) {
    console.error("Error deleting products:", error);
    throw error;
  }
};

export const addBranch = async (
  name: string,
  latitude: number,
  longitude: number,
  street: string,
  borough: string,
  city: string,
  website_url: string,
  location_link: string,
  working_hours: string,
  rating: number,
  about: string
) => {
  try {
    const response = await databases.createDocument(
      config.databaseID,
      config.branchCollectionID,
      ID.unique(),
      {
        name: name,
        site: website_url,
        borough: borough,
        street: street,
        city: city,
        latitude: latitude,
        longitude: longitude,
        rating: rating,
        working_hours: working_hours,
        about: about,
        location_link: location_link,
        pharmacyId: localStorage.getItem("pharmacyId"),
      }
    );
    return response;
  } catch (error) {
    console.error("Error adding branch:", error);
    throw error;
  }
};

export const deleteBranches = async (branchIds: string[]) => {
  try {
    // Run all deletions in parallel
    await Promise.all(
      branchIds.map(async (branchId) => {
        // 1. Delete all availabilities
        const availabilities = await databases.listDocuments(
          config.databaseID,
          config.product_availabilityCollectionID,
          [Query.equal("branchId", branchId)]
        );

        await Promise.all(
          availabilities.documents.map((availability) =>
            databases.deleteDocument(
              config.databaseID,
              config.product_availabilityCollectionID,
              availability.$id
            )
          )
        );

        // 2. Delete the branch itself
        await databases.deleteDocument(
          config.databaseID,
          config.branchCollectionID,
          branchId
        );
      })
    );
  } catch (error) {
    console.error("Error deleting branches:", error);
    throw error;
  }
};

export const modifyBranch = async (
  name: string,
  latitude: number,
  longitude: number,
  street: string,
  borough: string,
  city: string,
  website_url: string,
  location_link: string,
  working_hours: string,
  rating: number,
  about: string,
  branchId: string
) => {
  try {
    const response = await databases.updateDocument(
      config.databaseID,
      config.branchCollectionID,
      branchId,
      {
        name: name,
        site: website_url,
        borough: borough,
        street: street,
        city: city,
        latitude: latitude,
        longitude: longitude,
        rating: rating,
        working_hours: working_hours,
        about: about,
        location_link: location_link,
      }
    );
    return response;
  } catch (error) {
    console.error("Error modifying branch:", error);
    throw error;
  }
};

export const getSearchAnalytics = async () => {
  try {
    const response = await databases.listDocuments(
      config.databaseID,
      config.search_logCollectionID,
      [
        Query.equal("pharmacyId", localStorage.getItem("pharmacyId")),
        Query.limit(10000),
      ]
    );
    return response.documents;
  } catch (err) {
    console.error("Failed to fetch search analytics:", err);
    return [];
  }
};
