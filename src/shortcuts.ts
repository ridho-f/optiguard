/**
 * Attaches event listeners to block right click contextmenu and inspect keyboard shortcuts.
 * Returns an unbind cleanup function.
 */
export function setupShortcutsBlocker(options: {
  blockContextMenu?: boolean;
  blockShortcuts?: boolean;
}): () => void {
  if (typeof document === 'undefined') return () => {};

  const cleanups: Array<() => void> = [];

  if (options.blockContextMenu) {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
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
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    cleanups.push(() => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
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
