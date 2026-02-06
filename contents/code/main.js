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
 * removes window from managedWindows state and disconnects from moveResizedChanged signal
 */
function releaseControl() {
  const windowId = workspace.activeWindow.internalId;

  workspace.activeWindow.moveResizedChanged.disconnect(releaseControl);
  managedWindows.delete(windowId);
}

/**
 * @param {QRectF} desiredGeometry
 * @returns void
 */
function updateGeometry(targetGeometry) {
  const isDesktop = workspace.activeWindow.desktopWindow;
  if (isDesktop) {
    return;
  }

  const windowId = workspace.activeWindow.internalId;

  const managedWindow = managedWindows.get(windowId);

  if (!!managedWindow) {
    const isManagedButDifferentSize = !shallowCompare(
      targetGeometry,
      managedWindow.managedGeometry,
    );

    if (isManagedButDifferentSize) {
      workspace.activeWindow.frameGeometry = targetGeometry;
      managedWindows.set(
        windowId,
        Object.assign({}, managedWindow, { managedGeometry: targetGeometry }),
      );
      return;
    }

    workspace.activeWindow.frameGeometry = Object.assign(
      {},
      managedWindow.originalGeometry,
    );
    workspace.activeWindow.moveResizedChanged.disconnect(releaseControl);

    managedWindows.delete(windowId);

    return;
  }

  const originalGeometry = Object.assign(
    {},
    workspace.activeWindow.frameGeometry,
  );

  managedWindows.set(windowId, {
    originalGeometry,
    managedGeometry: targetGeometry,
  });

  workspace.activeWindow.frameGeometry = targetGeometry;
  workspace.activeWindow.moveResizedChanged.connect(releaseControl);
  workspace.activeWindow.closed.connect(releaseControl);
}

/**
 * Returns a new centered QRectF
 * @param {{ width: number, height: number, x?: number, y?: number }} geometry
 */
function centerGeometry(geometry) {
  const desktopWidth = workspace.workspaceWidth;
  const desktopHeight = workspace.workspaceHeight;

  const x = (desktopWidth - geometry.width) / 2;
  const y = (desktopHeight - geometry.height) / 2;

  return Object.assign({}, geometry, { x, y });
}

/**
 *
 * @param {number} padding
 * @returns {QRectF}
 */
function getPaddedGeometry(padding) {
  return centerGeometry({
    width: workspace.workspaceWidth - padding,
    height: workspace.workspaceHeight - padding,
  });
}

/**
 *
 * @param {number} width
 * @param {number} height
 * @returns {QRectF}
 */
function getSizedGeometry(width, height) {
  return centerGeometry({ width, height });
}

registerShortcut(
  "winzo: Almost maximize",
  "winzo: Almost maximize",
  "Meta+Ctrl+Backspace",
  () => {
    try {
      updateGeometry(getPaddedGeometry(100));
    } catch (e) {
      console.error("something went wrong", e);
    }
  },
);

registerShortcut(
  "winzo: Set 1080p",
  "winzo: Set 1080p",
  "Meta+Ctrl+Enter",
  () => {
    try {
      updateGeometry(getSizedGeometry(1920, 1080));
    } catch (e) {
      console.error("something went wrong", e);
    }
  },
);
