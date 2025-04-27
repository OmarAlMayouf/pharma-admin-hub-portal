
export interface User {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (pharmacyId: string, password: string) => Promise<void>;
  logout: () => void;
}
