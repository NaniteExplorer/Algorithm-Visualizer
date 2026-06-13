import * as THREE from 'three';
import { Visualizer } from '../Visualizer';
import type { FrameContext, VisualizationEngine } from '../engine/VisualizationEngine';
import { SCENE } from '@/theme';
import { createGlowTexture } from '../primitives/glow';

/**
 * The AlgoViz hero scene — deliberately restrained.
 *
 * A single, coherent motif: a hollow spherical lattice of glowing nodes
 * (a nod to graphs/data structures) wrapped by two slim, slowly-precessing
 * orbital rings of fine particles. The shell is *hollow*, so the centre of
 * frame stays open and the wordmark floats in clean negative space rather than
 * fighting a busy field — the difference between "noisy" and "composed".
 *
 * Links are drawn only between near neighbours and their brightness fades with
 * length (encoded in vertex colour against additive blending), so the mesh
 * reads as a soft suggestion of structure instead of a tangle of lines. A faint
 * dust of distant points adds depth without clutter.
 *
 * Everything is procedural and driven purely by the frame clock, so it loops
 * forever without touching the playback timeline.
 */
export class HeroVisualizer extends Visualizer {
  private static readonly NODE_COUNT = 90;
  private static readonly SHELL_RADIUS = 22;
  private static readonly SHELL_JITTER = 2.4;
  private static readonly LINK_DISTANCE = 7.5;
  private static readonly MAX_LINKS = 130;

  private static readonly DUST_COUNT = 140;
  private static readonly DUST_RADIUS = 60;

  private static readonly RING_COUNT = 2;
  private static readonly RING_PARTICLES = 180;
  private static readonly RING_RADIUS = 30;

  private points: THREE.Points | null = null;
  private dust: THREE.Points | null = null;
  private links: THREE.LineSegments | null = null;
  private sprite: THREE.Texture | null = null;

  private basePositions: Float32Array = new Float32Array();
  private phases: Float32Array = new Float32Array();

  private ringGroup = new THREE.Group();
  private rings: THREE.Points[] = [];

  protected onAttach(_engine: VisualizationEngine): void {
    void _engine;
    this.sprite = createGlowTexture();
    this.buildShell();
    this.buildRings();
    this.buildDust();
    this.group.rotation.x = 0.18;
  }

  protected onFrame(ctx: FrameContext): void {
    // A single, slow, unhurried spin keeps the scene "alive" without motion noise.
    this.group.rotation.y += ctx.dt * 0.045;
    this.animateShell(ctx);
    this.animateRings(ctx);
  }

  protected onDispose(): void {
    this.sprite?.dispose();
    this.sprite = null;
    this.points = null;
    this.dust = null;
    this.links = null;
    this.rings = [];
  }

  // ── Hollow lattice shell ─────────────────────────────────────────────

  private buildShell(): void {
    const { NODE_COUNT, SHELL_RADIUS, SHELL_JITTER, LINK_DISTANCE, MAX_LINKS } = HeroVisualizer;
    const positions = new Float32Array(NODE_COUNT * 3);
    const colors = new Float32Array(NODE_COUNT * 3);
    this.phases = new Float32Array(NODE_COUNT);

    const cool = new THREE.Color(SCENE.hero.nodeCore);
    const warm = new THREE.Color(SCENE.hero.nodeWarm);
    const tmp = new THREE.Color();

    // Fibonacci sphere → even, organic distribution on the shell surface.
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NODE_COUNT; i += 1) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2; // 1 → -1
      const radius = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const jitter = SHELL_RADIUS + (pseudoRandom(i * 5.3) - 0.5) * SHELL_JITTER;
      const x = Math.cos(theta) * radius * jitter;
      const z = Math.sin(theta) * radius * jitter;
      positions.set([x, y * jitter, z], i * 3);

      // Mostly cool cyan, with violet reserved for a sparse minority → calm palette.
      const warmth = Math.pow(pseudoRandom(i * 4.2), 2.2);
      tmp.copy(cool).lerp(warm, warmth);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
      this.phases[i] = pseudoRandom(i * 9.9) * Math.PI * 2;
    }
    this.basePositions = positions.slice();

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pointsMat = new THREE.PointsMaterial({
      size: 1.7,
      map: this.sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(pointsGeo, pointsMat);

    // Near-neighbour links, brightness fading with length. Vertex colour against
    // additive blending gives a per-segment falloff a single opacity can't.
    const linkPositions: number[] = [];
    const linkColors: number[] = [];
    const base = new THREE.Color(SCENE.hero.nodeCore);
    let count = 0;
    for (let i = 0; i < NODE_COUNT && count < MAX_LINKS; i += 1) {
      const ax = positions[i * 3];
      const ay = positions[i * 3 + 1];
      const az = positions[i * 3 + 2];
      for (let j = i + 1; j < NODE_COUNT && count < MAX_LINKS; j += 1) {
        const dx = ax - positions[j * 3];
        const dy = ay - positions[j * 3 + 1];
        const dz = az - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq >= LINK_DISTANCE * LINK_DISTANCE) continue;
        // 1 when nodes touch, → 0 at the cutoff. Squared for a softer tail.
        const strength = Math.pow(1 - Math.sqrt(distSq) / LINK_DISTANCE, 2) * 0.5;
        linkPositions.push(ax, ay, az, positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        linkColors.push(
          base.r * strength, base.g * strength, base.b * strength,
          base.r * strength, base.g * strength, base.b * strength,
        );
        count += 1;
      }
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
    linkGeo.setAttribute('color', new THREE.Float32BufferAttribute(linkColors, 3));
    const linkMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.links = new THREE.LineSegments(linkGeo, linkMat);

    this.group.add(this.links, this.points);
  }

  private animateShell(ctx: FrameContext): void {
    if (!this.points) return;
    const attr = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < this.phases.length; i += 1) {
      const o = i * 3;
      // Gentle, slow breathing — barely perceptible, just enough to feel alive.
      const wobble = 1 + Math.sin(ctx.elapsed * 0.5 + this.phases[i]) * 0.02;
      arr[o] = this.basePositions[o] * wobble;
      arr[o + 1] = this.basePositions[o + 1] * wobble;
      arr[o + 2] = this.basePositions[o + 2] * wobble;
    }
    attr.needsUpdate = true;
  }

  // ── Orbital rings ────────────────────────────────────────────────────

  private buildRings(): void {
    const { RING_COUNT, RING_PARTICLES, RING_RADIUS } = HeroVisualizer;
    const accent = new THREE.Color(SCENE.hero.nodeCore);

    for (let r = 0; r < RING_COUNT; r += 1) {
      const positions = new Float32Array(RING_PARTICLES * 3);
      const radius = RING_RADIUS + r * 5;
      for (let i = 0; i < RING_PARTICLES; i += 1) {
        const a = (i / RING_PARTICLES) * Math.PI * 2;
        // Slight thickness so the ring reads as a band, not a wire.
        const rr = radius + (pseudoRandom(i * (3.1 + r)) - 0.5) * 1.6;
        positions.set([Math.cos(a) * rr, (pseudoRandom(i * (7.7 + r)) - 0.5) * 0.8, Math.sin(a) * rr], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: accent,
        size: 0.6,
        map: this.sprite ?? undefined,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const ring = new THREE.Points(geo, mat);
      // Tilt each ring onto a distinct plane so they precess past one another.
      ring.rotation.x = Math.PI / 2 + (r === 0 ? 0.5 : -0.4);
      ring.rotation.z = r === 0 ? 0.3 : -0.6;
      this.rings.push(ring);
      this.ringGroup.add(ring);
    }
    this.group.add(this.ringGroup);
  }

  private animateRings(ctx: FrameContext): void {
    for (let i = 0; i < this.rings.length; i += 1) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.rings[i].rotation.y += ctx.dt * 0.18 * dir;
    }
  }

  // ── Distant dust (depth) ─────────────────────────────────────────────

  private buildDust(): void {
    const { DUST_COUNT, DUST_RADIUS } = HeroVisualizer;
    const positions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i += 1) {
      const r = DUST_RADIUS * (0.6 + pseudoRandom(i * 2.7) * 0.4);
      const theta = pseudoRandom(i * 6.1) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(i * 11.5) - 1);
      positions.set(
        [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)],
        i * 3,
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(SCENE.hero.nodeCore),
      size: 0.5,
      map: this.sprite ?? undefined,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.dust = new THREE.Points(geo, mat);
    this.group.add(this.dust);
  }
}

/** Deterministic pseudo-random in [0,1) — avoids Math.random for SSR stability. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
