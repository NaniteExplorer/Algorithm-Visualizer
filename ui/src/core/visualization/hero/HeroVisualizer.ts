import * as THREE from 'three';
import { Visualizer } from '../Visualizer';
import type { FrameContext, VisualizationEngine } from '../engine/VisualizationEngine';
import { SCENE } from '@/theme';

/**
 * The AlgoViz hero scene: a slowly rotating constellation of glowing nodes
 * connected by faint links — an abstract nod to graphs/networks, the next
 * algorithm families on the roadmap. It deliberately reuses the same
 * `VisualizationEngine` (bloom, tone mapping, render loop) as the sorting scene,
 * proving the engine is content-agnostic and keeping one rendering code path.
 *
 * Nodes drift on independent sine phases for an organic "breathing" feel; the
 * whole group auto-rotates via the engine. All geometry is procedural so there
 * are no asset dependencies.
 */
export class HeroVisualizer extends Visualizer {
  private static readonly NODE_COUNT = 150;
  private static readonly RADIUS = 26;
  private static readonly LINK_DISTANCE = 9;

  private points: THREE.Points | null = null;
  private links: THREE.LineSegments | null = null;
  private sprite: THREE.Texture | null = null;

  /** Rest positions + per-node phase offsets for the breathing animation. */
  private basePositions: Float32Array = new Float32Array();
  private phases: Float32Array = new Float32Array();

  protected onAttach(_engine: VisualizationEngine): void {
    void _engine;
    const { NODE_COUNT, RADIUS, LINK_DISTANCE } = HeroVisualizer;

    // 1 — scatter nodes inside a soft ellipsoid.
    const positions = new Float32Array(NODE_COUNT * 3);
    const colors = new Float32Array(NODE_COUNT * 3);
    this.phases = new Float32Array(NODE_COUNT);
    const cool = new THREE.Color(SCENE.hero.nodeCore);
    const warm = new THREE.Color(SCENE.hero.nodeWarm);
    const tmp = new THREE.Color();

    for (let i = 0; i < NODE_COUNT; i += 1) {
      const r = RADIUS * Math.cbrt(pseudoRandom(i * 3.1));
      const theta = pseudoRandom(i * 7.7) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(i * 12.3) - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.7; // flatten vertically
      const z = r * Math.cos(phi);
      positions.set([x, y, z], i * 3);

      tmp.copy(cool).lerp(warm, pseudoRandom(i * 4.2));
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
      this.phases[i] = pseudoRandom(i * 9.9) * Math.PI * 2;
    }
    this.basePositions = positions.slice();

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.sprite = createGlowTexture();
    const pointsMat = new THREE.PointsMaterial({
      size: 1.6,
      map: this.sprite,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(pointsGeo, pointsMat);

    // 2 — link nearby nodes (precomputed once; cheap O(n²) for 150 nodes).
    const linkPositions: number[] = [];
    for (let i = 0; i < NODE_COUNT; i += 1) {
      const ax = positions[i * 3];
      const ay = positions[i * 3 + 1];
      const az = positions[i * 3 + 2];
      for (let j = i + 1; j < NODE_COUNT; j += 1) {
        const dx = ax - positions[j * 3];
        const dy = ay - positions[j * 3 + 1];
        const dz = az - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < LINK_DISTANCE * LINK_DISTANCE) {
          linkPositions.push(ax, ay, az, positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        }
      }
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
    const linkMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(SCENE.hero.nodeCore),
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.links = new THREE.LineSegments(linkGeo, linkMat);

    this.group.add(this.links, this.points);
    this.group.rotation.x = 0.25;
  }

  protected onFrame(ctx: FrameContext): void {
    // Whole-constellation slow spin.
    this.group.rotation.y += ctx.dt * 0.08;

    // Per-node breathing: displace each node radially on its own sine phase.
    if (!this.points) return;
    const attr = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < this.phases.length; i += 1) {
      const o = i * 3;
      const wobble = 1 + Math.sin(ctx.elapsed * 0.6 + this.phases[i]) * 0.04;
      arr[o] = this.basePositions[o] * wobble;
      arr[o + 1] = this.basePositions[o + 1] * wobble;
      arr[o + 2] = this.basePositions[o + 2] * wobble;
    }
    attr.needsUpdate = true;
  }

  protected onDispose(): void {
    this.sprite?.dispose();
    this.sprite = null;
    this.points = null;
    this.links = null;
  }
}

/** Deterministic pseudo-random in [0,1) — avoids Math.random for SSR stability. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Procedural soft radial sprite so nodes read as glowing orbs under bloom. */
function createGlowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
