/**
 * { originalGeometry: QFrameGeometry; managedGeometry: QFrameGeometry }
 */
const managedWindows = new Map();

function handleGeometryChanged(changedGeometry) {
  console.log("geometry changed");

  const windowId = workspace.activeWindow.internalId;

  const { managedGeometry } = managedWindows.get(windowId);

  if (!managedGeometry) {
    console.log("isnt managed, abort");
    workspace.activeWindow.frameGeometryChanged.disconnect(
      handleGeometryChanged,
    );
  }

  console.log(`${managedGeometry.width} === ${changedGeometry.width}`);
  console.log(`${managedGeometry.height} === ${changedGeometry.height}`);
  console.log(`${managedGeometry.x} === ${changedGeometry.x}`);
  console.log(`${managedGeometry.y} === ${changedGeometry.y}`);

  const wasChanged =
    managedGeometry.width !== changedGeometry.width ||
    managedGeometry.height !== changedGeometry.height ||
    managedGeometry.x !== changedGeometry.x ||
    managedGeometry.y !== changedGeometry.y;

  if (wasChanged) {
    console.log("changed, giving up control");
    workspace.activeWindow.frameGeometryChanged.disconnect(
      handleGeometryChanged,
    );
    managedWindows.delete(windowId);
    return;
  }
}

function onShortcut() {
  const windowId = workspace.activeWindow.internalId;

  const managedWindow = managedWindows.get(windowId);

  console.log("1. stored geometry", managedWindow);

  if (!!managedWindow) {
    console.log("a2. is stored");

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

  console.log("b2. is NOT stored");
  const managedGeometry = getAlmostMaximizedGeometry(0.9);
  const originalGeometry = Object.assign(
    {},
    workspace.activeWindow.frameGeometry,
  );

  managedWindows.set(windowId, { originalGeometry, managedGeometry });
  console.log("b3. pushed stash", managedWindows.get(windowId));

  workspace.activeWindow.frameGeometry = managedGeometry;
  console.log("b4. updated geometry");

  workspace.activeWindow.frameGeometryChanged.connect(handleGeometryChanged);

  workspace.activeWindow.windowClosed.connect(() => {
    window.frameGeometryChanged.disconnect(onFrameGeometryChanged);
  });
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

workspace.activeWindow.frameGeometryChanged.disconnect(handleGeometryChanged);

registerShortcut(
  "winzo: Almost maximize",
  "winzo: Almost maximize",
  "Meta+Ctrl+Backspace",
  onShortcut,
);
