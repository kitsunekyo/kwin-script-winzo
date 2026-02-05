/**
 * @typedef {object} QRectF
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * Stores per-window state for the "almost maximize" toggle.
 *
 * Map key is the KWin window `internalId` of the currently managed window.
 * Map value contains the window's original geometry (to restore) and the
 * target managed geometry (almost maximized).
 *
 * @type {Map<string, { originalGeometry: QRectF, managedGeometry: QRectF }>}
 */
const managedWindows = new Map();

/**
 *
 * @param {{}} a
 * @param {{}} b
 * @returns {boolean}
 */
function shallowCompare(a, b) {
  try {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (const property in a) {
      if (a[property] !== b[property]) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 *
 * @param {QRectF} changedGeometry
 * @returns
 */
function handleGeometryChanged(changedGeometry) {
  const windowId = workspace.activeWindow.internalId;

  const { originalGeometry } = managedWindows.get(windowId);

  const wasChanged = !shallowCompare(originalGeometry, changedGeometry);

  if (!wasChanged) {
    return;
  }

  workspace.activeWindow.frameGeometry = {
    x: changedGeometry.x,
    y: changedGeometry.y,
    width: originalGeometry.width,
    height: originalGeometry.height,
  };

  workspace.activeWindow.frameGeometryChanged.disconnect(handleGeometryChanged);
  managedWindows.delete(windowId);
}

/**
 *
 * @returns void
 */
function onShortcut() {
  const windowId = workspace.activeWindow.internalId;

  const managedWindow = managedWindows.get(windowId);

  if (!!managedWindow) {
    workspace.activeWindow.frameGeometry = Object.assign(
      {},
      managedWindow.originalGeometry,
    );
    workspace.activeWindow.frameGeometryChanged.disconnect(
      handleGeometryChanged,
    );

    managedWindows.delete(windowId);

    return;
  }

  const managedGeometry = getAlmostMaximizedGeometry(100);
  const originalGeometry = Object.assign(
    {},
    workspace.activeWindow.frameGeometry,
  );

  managedWindows.set(windowId, { originalGeometry, managedGeometry });

  workspace.activeWindow.frameGeometry = managedGeometry;
  workspace.activeWindow.frameGeometryChanged.connect(handleGeometryChanged);
}

/**
 *
 * @param {number} padding
 * @param {number} dockOffset - Offset the window height and position by the dock height (WIP)
 * @returns {QRectF}
 */
function getAlmostMaximizedGeometry(padding, dockOffset = 0) {
  const desktopWidth = workspace.workspaceWidth;
  const desktopHeight = workspace.workspaceHeight;

  const width = desktopWidth - padding;
  const height = desktopHeight - padding - dockOffset;

  const x = (desktopWidth - width) / 2;
  const y = (desktopHeight - height) / 2 - dockOffset;

  return { x, y, width, height };
}

registerShortcut(
  "winzo: Almost maximize",
  "winzo: Almost maximize",
  "Meta+Ctrl+Backspace",
  () => {
    try {
      onShortcut();
    } catch (e) {
      console.error("something went wrong", e);
    }
  },
);
