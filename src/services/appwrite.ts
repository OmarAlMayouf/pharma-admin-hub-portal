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

    if (pharmacy.documents.length === 0) {
      throw new Error("Pharmacy not found");
    }

    if (password !== "admin123") {
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
