import { ScrollSyncService } from '@/types/editor';

export function createScrollSyncService(): ScrollSyncService {
  let isEnabled = true;
  let editorElement: HTMLElement | null = null;
  let previewElement: HTMLElement | null = null;
  let isSyncing = false;

  const syncEditorToPreview = (editorScrollRatio: number) => {
    if (!isEnabled || !previewElement || isSyncing) return;
    
    isSyncing = true;
    const previewScrollHeight = previewElement.scrollHeight - previewElement.clientHeight;
    previewElement.scrollTop = editorScrollRatio * previewScrollHeight;
    
    // 同期フラグをリセット
    setTimeout(() => {
      isSyncing = false;
    }, 50);
  };

  const syncPreviewToEditor = (previewScrollRatio: number) => {
    if (!isEnabled || !editorElement || isSyncing) return;
    
    isSyncing = true;
    const editorScrollHeight = editorElement.scrollHeight - editorElement.clientHeight;
    editorElement.scrollTop = previewScrollRatio * editorScrollHeight;
    
    // 同期フラグをリセット
    setTimeout(() => {
      isSyncing = false;
    }, 50);
  };

  const enableSync = () => {
    isEnabled = true;
  };

  const disableSync = () => {
    isEnabled = false;
  };

  const setElements = (editor: HTMLElement | null, preview: HTMLElement | null) => {
    editorElement = editor;
    previewElement = preview;
  };

  return {
    syncEditorToPreview,
    syncPreviewToEditor,
    enableSync,
    disableSync,
    get isEnabled() {
      return isEnabled;
    },
    setElements,
  } as ScrollSyncService & { setElements: (editor: HTMLElement | null, preview: HTMLElement | null) => void };
}