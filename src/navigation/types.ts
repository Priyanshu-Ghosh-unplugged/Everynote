export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Note: { noteId: string };
  NoteEditor: { noteId?: string };
  Category: { categoryId: string };
  CategoryManagement: undefined;
  Settings: undefined;
  SearchResults: undefined;
  UserProfile: undefined;
  EditProfile: undefined;
  Calendar: undefined; // Add Calendar route
};