import { nanoid } from "nanoid";

type DiagramInput = {
  modules: { id: string; label: string }[];
  edges: { from: string; to: string; weight: number }[];
};

type DiagramOptions = {
  title: string;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function generateExcalidraw(input: DiagramInput, opts: DiagramOptions) {
  const modules = input.modules.slice(0, 20);
  const edges = input.edges.slice(0, 40);

  const elements: any[] = [];

  // Simple grid layout.
  const cols = Math.ceil(Math.sqrt(modules.length || 1));
  const cellW = 320;
  const cellH = 160;
  const rectW = 260;
  const rectH = 90;

  const moduleToRectId = new Map<string, string>();
  const moduleCenters = new Map<string, { x: number; y: number }>();

  for (let i = 0; i < modules.length; i += 1) {
    const m = modules[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellW;
    const y = row * cellH;

    const rectId = `rect_${nanoid(10)}`;
    const textId = `text_${nanoid(10)}`;
    moduleToRectId.set(m.id, rectId);
    moduleCenters.set(m.id, { x: x + rectW / 2, y: y + rectH / 2 });

    elements.push({
      id: rectId,
      type: "rectangle",
      x,
      y,
      width: rectW,
      height: rectH,
      angle: 0,
      strokeColor: "#c7d2fe",
      backgroundColor: "#0b1020",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 3 },
      seed: 1,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: [{ id: textId, type: "text" }],
      updated: Date.now(),
      link: null,
      locked: false,
    });

    elements.push({
      id: textId,
      type: "text",
      x: x + 16,
      y: y + 28,
      width: rectW - 32,
      height: 24,
      angle: 0,
      strokeColor: "#ffffff",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: 2,
      version: 1,
      versionNonce: 2,
      isDeleted: false,
      boundElements: [],
      updated: Date.now(),
      link: null,
      locked: false,
      text: m.label,
      fontSize: 18,
      fontFamily: 1,
      textAlign: "left",
      verticalAlign: "top",
      baseline: 18,
      containerId: rectId,
      originalText: m.label,
      lineHeight: 1.2,
    });
  }

  for (const e of edges) {
    const fromRect = moduleToRectId.get(e.from);
    const toRect = moduleToRectId.get(e.to);
    const fromCenter = moduleCenters.get(e.from);
    const toCenter = moduleCenters.get(e.to);
    if (!fromRect || !toRect || !fromCenter || !toCenter) continue;

    const arrowId = `arrow_${nanoid(10)}`;
    const weight = clamp(e.weight, 1, 8);

    elements.push({
      id: arrowId,
      type: "arrow",
      x: fromCenter.x,
      y: fromCenter.y,
      width: toCenter.x - fromCenter.x,
      height: toCenter.y - fromCenter.y,
      angle: 0,
      strokeColor: "#78f0b5",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1 + Math.floor(weight / 3),
      strokeStyle: "solid",
      roughness: 0,
      opacity: 90,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: 3,
      version: 1,
      versionNonce: 3,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      points: [
        [0, 0],
        [toCenter.x - fromCenter.x, toCenter.y - fromCenter.y],
      ],
      lastCommittedPoint: null,
      startBinding: { elementId: fromRect, focus: 0, gap: 8 },
      endBinding: { elementId: toRect, focus: 0, gap: 8 },
      startArrowhead: null,
      endArrowhead: "arrow",
      elbowed: false,
    });
  }

  // Title text in the corner.
  elements.push({
    id: `title_${nanoid(10)}`,
    type: "text",
    x: -10,
    y: -60,
    width: 900,
    height: 36,
    angle: 0,
    strokeColor: "#ffffff",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 4,
    version: 1,
    versionNonce: 4,
    isDeleted: false,
    boundElements: [],
    updated: Date.now(),
    link: null,
    locked: false,
    text: opts.title,
    fontSize: 24,
    fontFamily: 1,
    textAlign: "left",
    verticalAlign: "top",
    baseline: 22,
    containerId: null,
    originalText: opts.title,
    lineHeight: 1.1,
  });

  return {
    type: "excalidraw",
    version: 2,
    source: "codebase-analyzer",
    elements,
    appState: {
      theme: "dark",
      viewBackgroundColor: "#0b1020",
      gridSize: null,
    },
    files: {},
  };
}

