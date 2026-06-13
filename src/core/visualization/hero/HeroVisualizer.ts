import * as THREE from 'three';
import { Visualizer } from '../Visualizer';
import type { FrameContext, VisualizationEngine } from '../engine/VisualizationEngine';
import { SCENE } from '@/theme';
import { createGlowTexture } from '../primitives/glow';

/**
 * The AlgoViz hero scene: a slowly rotating "crown" of glowing bars whose
 * heights ripple in a perpetual travelling wave (a living nod to sorting),
 * wrapped inside a drifting constellation of linked nodes (a nod to graphs).
 * Together they tease the two flagship families on one content-agnostic engine.
 *
 * Everything is procedural — no asset dependencies — and animation is driven
 * purely by the frame clock, so it loops forever without touching the timeline.
 */
export class HeroVisualizer extends Visualizer {
  private static readonly NODE_COUNT = 110;
  private static readonly RADIUS = 26;
  private static readonly LINK_DISTANCE = 9;

  private static readonly BAR_COUNT = 72;
  private static readonly RING_RADIUS = 19;

  private points: THREE.Points | null = null;
  private links: THREE.LineSegments | null = null;
  private sprite: THREE.Texture | null = null;

  private basePositions: Float32Array = new Float32Array();
  private phases: Float32Array = new Float32Array();

  private barGroup = new THREE.Group();
  private bars: THREE.Mesh[] = [];
  private barGeometry: THREE.BoxGeometry | null = null;

  protected onAttach(_engine: VisualizationEngine): void {
    void _engine;
    this.buildConstellation();
    this.buildBarRing();
    this.group.rotation.x = 0.22;
  }

  protected onFrame(ctx: FrameContext): void {
    // Whole-scene slow spin.
    this.group.rotation.y += ctx.dt * 0.07;
    this.barGroup.rotation.y -= ctx.dt * 0.12; // counter-rotate the crown

    this.animateConstellation(ctx);
    this.animateBars(ctx);
  }

  protected onDispose(): void {
    this.sprite?.dispose();
    this.sprite = null;
    this.barGeometry?.dispose();
    this.barGeometry = null;
    this.points = null;
    this.links = null;
    this.bars = [];
  }

  // ── Bar crown ────────────────────────────────────────────────────────

  private buildBarRing(): void {
    const { BAR_COUNT, RING_RADIUS } = HeroVisualizer;
    this.barGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cool = new THREE.Color(SCENE.hero.nodeCore);
    const warm = new THREE.Color(SCENE.hero.nodeWarm);
    const tmp = new THREE.Color();

    for (let i = 0; i < BAR_COUNT; i += 1) {
      const angle = (i / BAR_COUNT) * Math.PI * 2;
      tmp.copy(cool).lerp(warm, 0.5 + 0.5 * Math.sin(angle));
      const material = new THREE.MeshStandardMaterial({
        color: tmp.clone(),
        emissive: tmp.clone(),
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.2,
      });
      const bar = new THREE.Mesh(this.barGeometry, material);
      bar.position.set(Math.cos(angle) * RING_RADIUS, 0, Math.sin(angle) * RING_RADIUS);
      bar.scale.set(0.9, 4, 0.9);
      this.bars.push(bar);
      this.barGroup.add(bar);
    }
    this.group.add(this.barGroup);
  }

  private animateBars(ctx: FrameContext): void {
    const { BAR_COUNT } = HeroVisualizer;
    for (let i = 0; i < this.bars.length; i += 1) {
      const wave = Math.sin(ctx.elapsed * 1.6 + (i / BAR_COUNT) * Math.PI * 6);
      const h = 4 + (wave * 0.5 + 0.5) * 12;
      const bar = this.bars[i];
      bar.scale.y = h;
      bar.position.y = h / 2;
    }
  }

  // ── Constellation ────────────────────────────────────────────────────

  private buildConstellation(): void {
    const { NODE_COUNT, RADIUS, LINK_DISTANCE } = HeroVisualizer;
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
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.7;
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
      size: 1.5,
      map: this.sprite,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(pointsGeo, pointsMat);

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
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.links = new THREE.LineSegments(linkGeo, linkMat);

    this.group.add(this.links, this.points);
  }

  private animateConstellation(ctx: FrameContext): void {
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
}

/** Deterministic pseudo-random in [0,1) — avoids Math.random for SSR stability. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
