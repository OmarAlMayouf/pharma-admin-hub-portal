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
  alternativeCollectionID: "3424234dd",
  wishlistCollectionID: "67fa1767002e153281c8",
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
        description: description,
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
    }
    return response;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};
