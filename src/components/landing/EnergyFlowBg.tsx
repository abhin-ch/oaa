'use client';

import { useEffect, useRef } from 'react';

interface CanvasBuilding {
  x: number;
  width: number;
  height: number;
  hasCircle: boolean;
  fillPhase: number;
  fillSpeed: number;
  windowCols: number;
  windowRows: number;
  style: 'grid' | 'stripe' | 'solid' | 'curtainWall';
  rooftop: 'flat' | 'antenna' | 'setback' | 'mechanical' | 'spire';
  depth: number; // 0 = back row, 1 = mid, 2 = front — controls opacity
}

// Seeded random for deterministic layout across frames
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function EnergyFlowBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationId: number;
    let allCanvasBuildings: CanvasBuilding[][] = []; // [backRow, midRow, frontRow]
    let isDark = document.documentElement.classList.contains('dark');

    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const generateRow = (w: number, h: number, depth: number, seed: number): CanvasBuilding[] => {
      const rand = mulberry32(seed);
      const row: CanvasBuilding[] = [];
      const styles: CanvasBuilding['style'][] = ['grid', 'stripe', 'solid', 'curtainWall'];
      const rooftops: CanvasBuilding['rooftop'][] = [
        'flat',
        'flat',
        'antenna',
        'setback',
        'mechanical',
        'spire',
      ];

      // Depth affects scale and density
      const scale = depth === 0 ? 0.55 : depth === 1 ? 0.75 : 1;
      const unit = Math.max(18, Math.floor(w / 36)) * scale;
      const gap = unit * (0.15 + rand() * 0.15);
      const baselineY = h * (depth === 0 ? 0.94 : depth === 1 ? 0.97 : 1);
      const maxH = depth === 0 ? h * 0.6 : depth === 1 ? h * 0.7 : h * 0.8;

      let x = -unit * 3 + rand() * unit * 2;
      while (x < w + unit * 2) {
        const widthMul = rand() > 0.7 ? 1.8 + rand() * 1.2 : 0.7 + rand() * 0.9;
        const bw = Math.floor(unit * widthMul);

        const roll = rand();
        let heightMul: number;
        if (roll < 0.2) heightMul = 2 + rand() * 2;
        else if (roll < 0.65) heightMul = 4 + rand() * 3;
        else heightMul = 7 + rand() * 5;

        const bh = Math.min(unit * heightMul, maxH);
        const style = styles[Math.floor(rand() * styles.length)] ?? 'grid';
        const hasCircle = widthMul < 1.5 && rand() > 0.85;
        const windowCols = Math.max(1, Math.floor(bw / (unit * 0.4)));
        const windowRows = Math.max(2, Math.floor(bh / (unit * 0.45)));
        const rooftop =
          rand() > 0.45 ? (rooftops[Math.floor(rand() * rooftops.length)] ?? 'flat') : 'flat';

        row.push({
          x,
          width: bw,
          height: bh,
          hasCircle,
          fillPhase: rand() * Math.PI * 2,
          fillSpeed: 0.0004 + rand() * 0.0006, // ~5x slower
          windowCols,
          windowRows,
          style,
          rooftop,
          depth,
        });

        x += bw + gap;
      }
      return row;
    };

    const generateCity = (w: number, h: number) => {
      allCanvasBuildings = [
        generateRow(w, h, 0, 111), // back — smaller, fainter
        generateRow(w, h, 1, 222), // mid
        generateRow(w, h, 2, 333), // front — largest, most visible
      ];
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateCity(rect.width, rect.height);
    };

    let time = 0;

    const opacityByDepth: Record<number, number> = { 0: 0.03, 1: 0.045, 2: 0.07 };
    const windowDimByDepth: Record<number, number> = { 0: 0.01, 1: 0.015, 2: 0.02 };
    const windowLitByDepth: Record<number, number> = { 0: 0.04, 1: 0.05, 2: 0.07 };
    const safeAlpha = (map: Record<number, number>, key: number) => map[key] ?? 0.05;

    // Returns rgba string for current theme
    const c = (alpha: number) =>
      isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      for (const row of allCanvasBuildings) {
        const depth = row[0]?.depth ?? 2;
        const baselineY = h * (depth === 0 ? 0.94 : depth === 1 ? 0.97 : 1);
        const strokeAlpha = safeAlpha(opacityByDepth, depth);

        // Ground line for this row
        ctx.beginPath();
        ctx.moveTo(0, baselineY);
        ctx.lineTo(w, baselineY);
        ctx.strokeStyle = c(strokeAlpha * 0.6);
        ctx.lineWidth = 1;
        ctx.stroke();

        for (const b of row) {
          const bx = b.x;
          const by = baselineY - b.height;

          // Fill level — very slow oscillation
          const fillLevel = prefersReduced
            ? 0.35
            : (Math.sin(time * b.fillSpeed + b.fillPhase) + 1) / 2;

          // CanvasBuilding outline
          ctx.strokeStyle = c(strokeAlpha);
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, b.width, b.height);

          // Rooftop
          drawRooftop(ctx, b, bx, by, strokeAlpha);

          // Windows
          const padding = b.width * 0.1;
          const innerW = b.width - padding * 2;
          const innerH = b.height - padding * 1.5;

          if (b.style === 'grid') {
            drawWindowGrid(ctx, bx + padding, by + padding * 0.8, innerW, innerH, b, fillLevel);
          } else if (b.style === 'stripe') {
            drawStripes(ctx, bx + padding, by + padding * 0.8, innerW, innerH, b, fillLevel);
          } else if (b.style === 'curtainWall') {
            drawCurtainWall(ctx, bx, by, b.width, b.height, b, fillLevel);
          } else {
            // Solid — subtle fill only
            const fillHeight = b.height * fillLevel;
            ctx.fillStyle = c(safeAlpha(windowDimByDepth, depth));
            ctx.fillRect(bx, baselineY - fillHeight, b.width, fillHeight);
          }

          // OAA circle
          if (b.hasCircle) {
            const cx = bx + b.width / 2;
            const radius = (b.width - 6) / 2;
            const cy = by + b.width / 2 + 3;
            if (cy + radius < baselineY - 4) {
              ctx.beginPath();
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
              ctx.strokeStyle = c(strokeAlpha * 0.7);
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      if (!prefersReduced) {
        time++;
        animationId = requestAnimationFrame(draw);
      }
    };

    function drawWindowGrid(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      b: CanvasBuilding,
      fillLevel: number,
    ) {
      const { windowCols: cols, windowRows: rows, depth } = b;
      const gapX = Math.max(2, (w * 0.18) / cols);
      const gapY = Math.max(2, (h * 0.12) / rows);
      const winW = (w - gapX * (cols + 1)) / cols;
      const winH = (h - gapY * (rows + 1)) / rows;

      if (winW < 1 || winH < 1) return;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const wx = x + gapX + col * (winW + gapX);
          const wy = y + gapY + row * (winH + gapY);
          const fillY = y + h - h * fillLevel;
          const isLit = wy + winH > fillY;

          ctx.fillStyle = isLit
            ? c(safeAlpha(windowLitByDepth, depth))
            : c(safeAlpha(windowDimByDepth, depth));
          ctx.fillRect(wx, wy, winW, winH);
        }
      }
    }

    function drawStripes(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      b: CanvasBuilding,
      fillLevel: number,
    ) {
      const { windowRows: rows, depth } = b;
      const stripeH = Math.max(1.5, h / (rows * 2.5));
      const gap = (h - stripeH * rows) / (rows + 1);

      for (let row = 0; row < rows; row++) {
        const sy = y + gap + row * (stripeH + gap);
        const fillY = y + h - h * fillLevel;
        const isLit = sy + stripeH > fillY;

        ctx.fillStyle = isLit
          ? c(safeAlpha(windowLitByDepth, depth))
          : c(safeAlpha(windowDimByDepth, depth));
        ctx.fillRect(x, sy, w, stripeH);
      }
    }

    function drawCurtainWall(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      b: CanvasBuilding,
      fillLevel: number,
    ) {
      const { windowCols: cols, windowRows: rows, depth } = b;
      const mullion = 1;
      const panelW = (w - mullion * (cols + 1)) / cols;
      const panelH = (h - mullion * (rows + 1)) / rows;

      if (panelW < 1 || panelH < 1) return;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = x + mullion + col * (panelW + mullion);
          const py = y + mullion + row * (panelH + mullion);
          const fillY = y + h - h * fillLevel;
          const isLit = py + panelH > fillY;

          ctx.fillStyle = isLit
            ? c(safeAlpha(windowLitByDepth, depth) * 0.8)
            : c(safeAlpha(windowDimByDepth, depth));
          ctx.fillRect(px, py, panelW, panelH);
        }
      }
    }

    function drawRooftop(
      ctx: CanvasRenderingContext2D,
      b: CanvasBuilding,
      bx: number,
      by: number,
      alpha: number,
    ) {
      ctx.strokeStyle = c(alpha);
      ctx.lineWidth = 1;

      if (b.rooftop === 'antenna') {
        const cx = bx + b.width / 2;
        const spireH = b.width * 0.7;
        ctx.beginPath();
        ctx.moveTo(cx, by);
        ctx.lineTo(cx, by - spireH);
        ctx.stroke();
        // Crossbars
        ctx.beginPath();
        ctx.moveTo(cx - 3, by - spireH * 0.5);
        ctx.lineTo(cx + 3, by - spireH * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 2, by - spireH * 0.75);
        ctx.lineTo(cx + 2, by - spireH * 0.75);
        ctx.stroke();
      } else if (b.rooftop === 'spire') {
        // Tapered spire (CN Tower-esque)
        const cx = bx + b.width / 2;
        const spireH = b.width * 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - b.width * 0.08, by);
        ctx.lineTo(cx, by - spireH);
        ctx.lineTo(cx + b.width * 0.08, by);
        ctx.stroke();
        // Observation deck
        const deckY = by - spireH * 0.35;
        ctx.beginPath();
        ctx.moveTo(cx - b.width * 0.2, deckY);
        ctx.lineTo(cx + b.width * 0.2, deckY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - b.width * 0.2, deckY + 3);
        ctx.lineTo(cx + b.width * 0.2, deckY + 3);
        ctx.stroke();
      } else if (b.rooftop === 'setback') {
        const setW = b.width * 0.5;
        const setH = b.width * 0.4;
        const sx = bx + (b.width - setW) / 2;
        ctx.strokeRect(sx, by - setH, setW, setH);
        // Second setback
        const set2W = setW * 0.5;
        const set2H = setH * 0.5;
        ctx.strokeRect(sx + (setW - set2W) / 2, by - setH - set2H, set2W, set2H);
      } else if (b.rooftop === 'mechanical') {
        const mw = b.width * 0.3;
        const mh = b.width * 0.22;
        const mx = bx + b.width * 0.12;
        ctx.strokeRect(mx, by - mh, mw, mh);
        // Second unit
        const mx2 = bx + b.width * 0.55;
        ctx.strokeRect(mx2, by - mh * 0.65, mw * 0.7, mh * 0.65);
        // Pipe/vent
        ctx.beginPath();
        ctx.moveTo(mx + mw * 0.5, by - mh);
        ctx.lineTo(mx + mw * 0.5, by - mh - 4);
        ctx.stroke();
      }
    }

    resize();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
