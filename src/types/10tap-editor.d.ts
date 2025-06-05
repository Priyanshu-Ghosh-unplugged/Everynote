declare module '10tap-editor' {
  import { RefObject } from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  export interface EditorMethods {
    getHTML: () => Promise<string>;
    loadHTML: (html: string) => void;
    // Add other methods you discover from the documentation
  }

  export interface EditorProps {
    ref?: RefObject<EditorMethods>;
    initialContentHTML?: string;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
    // Add other props you discover from the documentation
  }

  export interface ToolbarProps {
    editor?: RefObject<EditorMethods>;
    style?: StyleProp<ViewStyle>;
    // Add other props and actions based on documentation
  }

  export class Editor extends React.Component<EditorProps> implements EditorMethods {
    getHTML(): Promise<string> {
      // Type stub only: implementation provided by the actual 10tap-editor package at runtime
      throw new Error("Method not implemented. This is a type stub.");
    }

    loadHTML(html: string): void {
      // Type stub only: implementation provided by the actual 10tap-editor package at runtime
      throw new Error("Method not implemented. This is a type stub.");
    }
  }
  export class Toolbar extends React.Component<ToolbarProps> {}
} 