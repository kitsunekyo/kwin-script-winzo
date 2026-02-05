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
 * @param {QRectF} desiredGeometry
 * @returns void
 */
function updateGeometry(managedGeometry) {
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

  const originalGeometry = Object.assign(
    {},
    workspace.activeWindow.frameGeometry,
  );

  managedWindows.set(windowId, { originalGeometry, managedGeometry });

  workspace.activeWindow.frameGeometry = managedGeometry;
  workspace.activeWindow.frameGeometryChanged.connect(handleGeometryChanged);
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
