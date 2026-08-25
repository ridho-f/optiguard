import { ContentProtectionConfig } from './types';

export interface ShortcutsBlockerOptions {
  blockContextMenu?: boolean;
  blockShortcuts?: boolean;
  contentProtection?: ContentProtectionConfig;
  onBlocked?: (reason: string, details?: any) => void;
}

/**
 * Attaches event listeners to block right click contextmenu, inspect keyboard shortcuts,
 * text selection, copy/cut, and drag-and-drop.
 * Returns an unbind cleanup function.
 */
export function setupShortcutsBlocker(
  options: ShortcutsBlockerOptions
): () => void {
  if (typeof document === 'undefined') return () => {};

  const cleanups: Array<() => void> = [];
  const content = options.contentProtection || {};

  // 1. Block Context Menu (Right Click)
  if (options.blockContextMenu) {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu inside form inputs unless explicitly configured
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        !content.blockCopy
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      if (options.onBlocked) {
        options.onBlocked('contextmenu_blocked', { x: e.clientX, y: e.clientY });
      }
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu, {
      capture: true,
    });
    cleanups.push(() => {
      document.removeEventListener('contextmenu', handleContextMenu, {
        capture: true,
      });
    });
  }

  // 2. Block Keyboard Shortcuts (F12, Inspect, View Source, Save)
  if (options.blockShortcuts) {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isF12 = e.key === 'F12' || e.keyCode === 123;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isInspect =
        isCtrlOrCmd &&
        e.shiftKey &&
        ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key);
      const isViewSource =
        isCtrlOrCmd && (e.key === 'u' || e.key === 'U' || e.keyCode === 85);
      const isSave =
        isCtrlOrCmd && (e.key === 's' || e.key === 'S' || e.keyCode === 83);

      if (isF12 || isInspect || isViewSource || isSave) {
        e.preventDefault();
        e.stopPropagation();
        if (options.onBlocked) {
          options.onBlocked('shortcut_blocked', { key: e.key, code: e.code });
        }
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    cleanups.push(() => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    });
  }

  // 3. Block Copy (Ctrl+C / Cmd+C / clipboard copy)
  if (content.blockCopy) {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (options.onBlocked) {
        options.onBlocked('copy_blocked');
      }
      return false;
    };
    document.addEventListener('copy', handleCopy, { capture: true });
    cleanups.push(() => {
      document.removeEventListener('copy', handleCopy, { capture: true });
    });
  }

  // 4. Block Cut
  if (content.blockCut) {
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    document.addEventListener('cut', handleCut, { capture: true });
    cleanups.push(() => {
      document.removeEventListener('cut', handleCut, { capture: true });
    });
  }

  // 5. Block Drag & Drop of images / text
  if (content.blockDragDrop) {
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    cleanups.push(() => {
      document.removeEventListener('dragstart', handleDragStart, {
        capture: true,
      });
    });
  }

  // 6. Block Text Selection via CSS
  if (content.blockTextSelection) {
    const style = document.createElement('style');
    style.id = 'optiguard-selection-styles';
    style.textContent = `
      body, body * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);
    cleanups.push(() => {
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });
  }

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  };
}
