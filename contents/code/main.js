/**
 * { originalGeometry: QFrameGeometry; managedGeometry: QFrameGeometry }
 */
const managedWindows = new Map();

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

function handleGeometryChanged(changedGeometry) {
  const windowId = workspace.activeWindow.internalId;

  const { managedGeometry, originalGeometry } = managedWindows.get(windowId);

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

  const managedGeometry = getAlmostMaximizedGeometry(0.9);
  const originalGeometry = Object.assign(
    {},
    workspace.activeWindow.frameGeometry,
  );

  managedWindows.set(windowId, { originalGeometry, managedGeometry });

  workspace.activeWindow.frameGeometry = managedGeometry;
  workspace.activeWindow.frameGeometryChanged.connect(handleGeometryChanged);
}

function getAlmostMaximizedGeometry(sizePercentage) {
  const desktopWidth = workspace.workspaceWidth;
  const desktopHeight = workspace.workspaceHeight;

  const width = desktopWidth * sizePercentage;
  const height = desktopHeight * sizePercentage;

  const x = (desktopWidth - width) / 2;
  const y = (desktopHeight - height) / 2;

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
