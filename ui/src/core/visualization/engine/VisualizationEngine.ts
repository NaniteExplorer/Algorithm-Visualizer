import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SCENE } from '@/theme';

/** Per-frame context handed to every tick subscriber. */
export interface FrameContext {
  /** Seconds since the previous frame (clamped). */
  readonly dt: number;
  /** Seconds since the engine started. */
  readonly elapsed: number;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
}

export interface EngineOptions {
  /** Bloom strength; 0 disables the glow. */
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  /** Allow the user to orbit the camera. */
  enableControls?: boolean;
  /** Subtle automatic camera drift for a "living" idle scene. */
  autoRotate?: boolean;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
}

type TickFn = (ctx: FrameContext) => void;

/**
 * Owns the entire WebGL stack — renderer, scene, camera, post-processing and the
 * animation loop — and nothing domain-specific. Visualizers attach to it by
 * adding objects to `scene` and subscribing to `onFrame`. This separation means
 * the engine can host a sorting scene today and a graph/tree scene tomorrow with
 * zero changes; only the attached visualizer differs.
 *
 * Lifecycle: `new` → `mount(container)` → … → `dispose()`. All GPU resources are
 * released on dispose, and a ResizeObserver keeps the framebuffer crisp.
 */
export class VisualizationEngine {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly composer: EffectComposer;
  private readonly bloomPass: UnrealBloomPass;
  private controls: OrbitControls | null = null;

  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafId = 0;
  private lastTime = 0;
  private elapsed = 0;
  private running = false;

  private readonly tickFns = new Set<TickFn>();
  private readonly options: Required<EngineOptions>;

  constructor(options: EngineOptions = {}) {
    this.options = {
      bloomStrength: options.bloomStrength ?? 0.85,
      bloomRadius: options.bloomRadius ?? 0.5,
      bloomThreshold: options.bloomThreshold ?? 0.15,
      enableControls: options.enableControls ?? true,
      autoRotate: options.autoRotate ?? false,
      cameraPosition: options.cameraPosition ?? [0, 26, 62],
      cameraTarget: options.cameraTarget ?? [0, 9, 0],
    };

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SCENE.background);
    this.scene.fog = new THREE.Fog(SCENE.fog, 70, 180);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    this.camera.position.set(...this.options.cameraPosition);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // Post-processing chain: scene → bloom → tone-mapped output.
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      this.options.bloomStrength,
      this.options.bloomRadius,
      this.options.bloomThreshold,
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    this.setupLighting();
  }

  /** Attach the canvas to the DOM, wire resize, and start the loop. */
  mount(container: HTMLElement): void {
    this.container = container;
    container.appendChild(this.renderer.domElement);
    Object.assign(this.renderer.domElement.style, {
      display: 'block',
      width: '100%',
      height: '100%',
    });

    if (this.options.enableControls) {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minDistance = 30;
      controls.maxDistance = 110;
      controls.maxPolarAngle = Math.PI * 0.495; // never drop below the floor
      controls.autoRotate = this.options.autoRotate;
      controls.autoRotateSpeed = 0.6;
      controls.target.set(...this.options.cameraTarget);
      controls.update();
      this.controls = controls;
    } else {
      this.camera.lookAt(new THREE.Vector3(...this.options.cameraTarget));
    }

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.start();
  }

  /** Subscribe a per-frame callback. Returns an unsubscribe fn. */
  onFrame(fn: TickFn): () => void {
    this.tickFns.add(fn);
    return () => this.tickFns.delete(fn);
  }

  /** Tear down all GPU + DOM resources. Safe to call once. */
  dispose(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.controls?.dispose();
    this.controls = null;
    this.tickFns.clear();

    this.disposeSceneGraph();
    this.composer.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container?.removeChild(this.renderer.domElement);
    }
    this.container = null;
  }

  // ── Internals ───────────────────────────────────────────────────────

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    const key = new THREE.DirectionalLight(SCENE.keyLight, 1.1);
    key.position.set(18, 40, 28);
    const rim = new THREE.DirectionalLight(SCENE.rimLight, 0.8);
    rim.position.set(-24, 16, -18);
    const fill = new THREE.PointLight(SCENE.rimLight, 0.5, 220);
    fill.position.set(0, 30, 40);
    this.scene.add(ambient, key, rim, fill);
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.elapsed += dt;

      this.controls?.update();
      const ctx: FrameContext = { dt, elapsed: this.elapsed, scene: this.scene, camera: this.camera };
      this.tickFns.forEach((fn) => fn(ctx));
      this.composer.render();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private resize(): void {
    if (!this.container) return;
    const { clientWidth: w, clientHeight: h } = this.container;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloomPass.resolution.set(w, h);
  }

  /** Recursively release geometries/materials for everything still in the scene. */
  private disposeSceneGraph(): void {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose?.();
    });
    this.scene.clear();
  }
}
