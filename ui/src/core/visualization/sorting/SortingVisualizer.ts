import * as THREE from 'three';
import { Visualizer } from '../Visualizer';
import type { FrameContext, VisualizationEngine } from '../engine/VisualizationEngine';
import { ArrayModel } from '@/core/model/ArrayModel';
import { ROLE_STYLES, SCENE } from '@/theme';
import { Bar } from './Bar';

/**
 * Renders an `ArrayModel` as a row of glowing, height-mapped 3D bars on a
 * reflective grid floor.
 *
 * It is a *pull* renderer: every frame it reads the model's current values and
 * per-cell roles and nudges each bar toward them. Because it never mutates the
 * model and never touches the timeline, it is completely agnostic to *which*
 * algorithm is playing or *who* advanced the model (autoplay, single-step, or a
 * scrubber seek all look identical from here).
 */
export class SortingVisualizer extends Visualizer {
  private static readonly TOTAL_WIDTH = 64;
  private static readonly MAX_HEIGHT = 26;
  private static readonly FILL_RATIO = 0.68;

  private bars: Bar[] = [];
  private sharedGeometry: THREE.BoxGeometry | null = null;

  constructor(private readonly model: ArrayModel) {
    super();
  }

  protected onAttach(_engine: VisualizationEngine): void {
    void _engine;
    this.sharedGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.buildEnvironment();
    this.rebuild();
  }

  protected onFrame(ctx: FrameContext): void {
    const { maxValue } = this.model;
    for (let i = 0; i < this.bars.length; i += 1) {
      const target = (this.model.value(i) / maxValue) * SortingVisualizer.MAX_HEIGHT;
      const style = ROLE_STYLES[this.model.roleAt(i)];
      const bar = this.bars[i];
      bar.setTargetHeight(target);
      bar.setTargetStyle(style.color, style.emissive);
      bar.update(ctx.dt);
    }
  }

  protected onDispose(): void {
    this.sharedGeometry?.dispose();
    this.sharedGeometry = null;
    this.bars = [];
  }

  /**
   * Reconcile the bar meshes with the current model size. Called on attach and
   * whenever a new dataset of a different length is generated.
   */
  rebuild(): void {
    if (!this.sharedGeometry) return;
    // Drop existing bars (geometry is shared and survives; materials are not).
    this.bars.forEach((bar) => {
      this.group.remove(bar.mesh);
      (bar.mesh.material as THREE.Material).dispose();
    });
    this.bars = [];

    const count = this.model.size;
    const { TOTAL_WIDTH, FILL_RATIO, MAX_HEIGHT } = SortingVisualizer;
    const slot = TOTAL_WIDTH / Math.max(count, 1);
    const width = slot * FILL_RATIO;

    for (let i = 0; i < count; i += 1) {
      const x = -TOTAL_WIDTH / 2 + (i + 0.5) * slot;
      const height = (this.model.value(i) / this.model.maxValue) * MAX_HEIGHT;
      const bar = new Bar(this.sharedGeometry, x, width, height);
      this.bars.push(bar);
      this.group.add(bar.mesh);
    }
  }

  /** Floor plane + grid that grounds the bars and catches the bloom glow. */
  private buildEnvironment(): void {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 260),
      new THREE.MeshStandardMaterial({
        color: SCENE.floor,
        roughness: 0.6,
        metalness: 0.4,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;

    const grid = new THREE.GridHelper(220, 60, SCENE.grid, SCENE.grid);
    (grid.material as THREE.Material).opacity = 0.25;
    (grid.material as THREE.Material).transparent = true;

    this.group.add(floor, grid);
  }
}
