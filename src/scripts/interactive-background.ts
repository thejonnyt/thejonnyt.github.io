// ============================================
// CONFIGURATION PARAMETERS
// ============================================
const CONFIG = {
  gridSpacing: 14,           // Distance between grid points (px)
  baseDotSize: 0,            // Base size of dots (px)
  maxDotSize: 2,            // Maximum size when near cursor (px)
  effectRadius: 250,         // Radius of effect around cursor (px)
  decayExponent: 1.2,          // Exponential decay factor (higher = faster decay)
  dotColor: '#FFFFFF',       // Color of dots
  dotOpacity: 0.2,           // Base opacity of dots
};

interface Point {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
}

class InteractiveBackground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private points: Point[] = [];
  private mouseX: number = -1000;
  private mouseY: number = -1000;
  private animationFrameId: number | null = null;
  private isVisible: boolean = !document.hidden;
  private prefersReducedMotion: boolean;
  private reducedMotionQuery: MediaQueryList;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = this.reducedMotionQuery.matches;

    this.init();
    this.setupEventListeners();
    this.scheduleDraw();
  }

  private init(): void {
    this.resize();
    this.createGrid();
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createGrid();
  }

  private createGrid(): void {
    this.points = [];
    const cols = Math.ceil(this.canvas.width / CONFIG.gridSpacing);
    const rows = Math.ceil(this.canvas.height / CONFIG.gridSpacing);

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const x = col * CONFIG.gridSpacing;
        const y = row * CONFIG.gridSpacing;
        this.points.push({ x, y, baseX: x, baseY: y });
      }
    }
  }

  private setupEventListeners(): void {
    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseleave', this.handleMouseLeave);

    // Touch events
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd);

    // Resize
    window.addEventListener('resize', this.handleResize);

    // Visibility + reduced motion
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange);
  }

  private calculateDotSize(point: Point): number {
    const dx = point.baseX - this.mouseX;
    const dy = point.baseY - this.mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > CONFIG.effectRadius) {
      return CONFIG.baseDotSize;
    }

    // Exponential decay: size decreases as distance increases
    const normalizedDistance = distance / CONFIG.effectRadius; // 0 to 1
    const decayFactor = Math.pow(1 - normalizedDistance, CONFIG.decayExponent);

    return CONFIG.baseDotSize + (CONFIG.maxDotSize - CONFIG.baseDotSize) * decayFactor;
  }

  private draw(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw dots
    this.points.forEach(point => {
      const size = this.calculateDotSize(point);

      this.ctx.fillStyle = CONFIG.dotColor;
      this.ctx.globalAlpha = CONFIG.dotOpacity;
      this.ctx.beginPath();
      this.ctx.arc(point.baseX, point.baseY, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1;
  }

  private scheduleDraw(): void {
    if (this.prefersReducedMotion || !this.isVisible || this.animationFrameId !== null) {
      return;
    }
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null;
      this.draw();
    });
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.scheduleDraw();
  };

  private handleMouseLeave = (): void => {
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.scheduleDraw();
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
      this.scheduleDraw();
    }
  };

  private handleTouchEnd = (): void => {
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.scheduleDraw();
  };

  private handleResize = (): void => {
    this.resize();
    this.scheduleDraw();
  };

  private handleVisibilityChange = (): void => {
    this.isVisible = !document.hidden;
    if (this.isVisible) {
      this.scheduleDraw();
    }
  };

  private handleReducedMotionChange = (event: MediaQueryListEvent): void => {
    this.prefersReducedMotion = event.matches;
    if (!this.prefersReducedMotion) {
      this.scheduleDraw();
    }
  };

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.reducedMotionQuery.removeEventListener('change', this.handleReducedMotionChange);
  }
}

function initInteractiveBackground(): void {
  const canvas = document.getElementById('interactive-bg') as HTMLCanvasElement | null;
  if (!canvas) return;
  if (canvas.dataset.initialized === 'true') return;
  canvas.dataset.initialized = 'true';
  new InteractiveBackground(canvas);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractiveBackground, { once: true });
} else {
  initInteractiveBackground();
}

document.addEventListener('astro:after-swap', initInteractiveBackground);
