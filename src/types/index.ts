export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  UserProfile: undefined;
  Onboarding: undefined;
  Help: undefined;
  About: undefined;
};

export interface SQLTransaction {
  executeSql: (
    sqlStatement: string,
    args?: any[],
    callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
    errorCallback?: (transaction: SQLTransaction, error: SQLError) => boolean
  ) => void;
}

export interface SQLResultSet {
  rows: {
    _array: any[];
    length: number;
    item: (index: number) => any;
  };
}

export interface SQLError {
  code: number;
  message: string;
} 