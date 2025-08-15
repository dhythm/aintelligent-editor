// Document Model
export interface Document {
  id: string;
  title: string;
  content: string; // マークダウン形式
  lastEdited: Date;
  wordCount: number;
  tags: string[];
  status: "Draft" | "Review" | "Final";
}

// View Mode
export interface ViewMode {
  type: "editor-only" | "preview-only" | "split-horizontal" | "split-vertical";
}

// Editor State
export interface EditorState {
  content: string;
  viewMode: ViewMode["type"];
  scrollSyncEnabled: boolean;
  theme: "light" | "dark";
  isAutoSaveEnabled: boolean;
  lastSaved: Date | null;
}

// Component Props
export interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
  syncScroll?: boolean;
  theme: "light" | "dark";
}

export interface MarkdownPreviewProps {
  content: string;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
  syncScroll?: boolean;
  theme: "light" | "dark";
}

export interface ViewModeToggleProps {
  currentMode: ViewMode["type"];
  onModeChange: (mode: ViewMode["type"]) => void;
}

export interface DocumentEditorProps {
  documentId?: string;
  initialContent?: string;
}

// Scroll Sync Service Interface
export interface ScrollSyncService {
  syncEditorToPreview: (editorScrollRatio: number) => void;
  syncPreviewToEditor: (previewScrollRatio: number) => void;
  enableSync: () => void;
  disableSync: () => void;
  isEnabled: boolean;
}

// Error Boundary State
export interface ErrorBoundaryState {
  hasError: boolean;
  errorType: "parser" | "editor" | "network" | "unknown";
  errorMessage: string;
}