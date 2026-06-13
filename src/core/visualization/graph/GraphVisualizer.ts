import * as THREE from 'three';
import { Visualizer } from '../Visualizer';
import type { FrameContext, VisualizationEngine } from '../engine/VisualizationEngine';
import { GraphModel } from '@/core/model/GraphModel';
import { SCENE } from '@/theme';
import { GlowNode } from '../primitives/GlowNode';
import { GlowEdge } from '../primitives/GlowEdge';
import { GRAPH_EDGE_STYLES, GRAPH_NODE_STYLES } from './palette';

interface EdgeView {
  u: number;
  v: number;
  edge: GlowEdge;
}

/**
 * Renders a {@link GraphModel} as a glowing 3D node-link network: nodes are
 * labelled spheres, edges are thin emissive cylinders carrying their weight.
 *
 * A pure pull renderer — each frame it reads every node/edge role from the model
 * and eases its colour, glow and scale toward the matching style. The frontier
 * fans out in cyan, the current node swells amber, settled nodes cool to indigo,
 * and the final shortest path ignites in gold.
 */
export class GraphVisualizer extends Visualizer {
  private static readonly NODE_RADIUS = 1.1;
  private static readonly EDGE_RADIUS = 0.13;

  private nodeViews: GlowNode[] = [];
  private edgeViews: EdgeView[] = [];

  constructor(private readonly model: GraphModel) {
    super();
  }

  protected onAttach(_engine: VisualizationEngine): void {
    void _engine;
    this.buildEnvironment();
    this.rebuild();
  }

  protected onFrame(ctx: FrameContext): void {
    for (let i = 0; i < this.nodeViews.length; i += 1) {
      const style = GRAPH_NODE_STYLES[this.model.nodeRole(i)];
      this.nodeViews[i].setTargetStyle(style.color, style.emissive, style.scale);
      this.nodeViews[i].update(ctx.dt);
    }
    for (const { u, v, edge } of this.edgeViews) {
      const style = GRAPH_EDGE_STYLES[this.model.edgeRole(u, v)];
      edge.setTargetStyle(style.color, style.emissive, style.opacity);
      edge.update(ctx.dt);
    }
  }

  protected onDispose(): void {
    this.nodeViews.forEach((n) => n.dispose());
    this.edgeViews.forEach((e) => e.edge.dispose());
    this.nodeViews = [];
    this.edgeViews = [];
  }

  rebuild(): void {
    this.nodeViews.forEach((n) => {
      this.group.remove(n.group);
      n.dispose();
    });
    this.edgeViews.forEach((e) => {
      this.group.remove(e.edge.group);
      e.edge.dispose();
    });
    this.nodeViews = [];
    this.edgeViews = [];

    const { NODE_RADIUS, EDGE_RADIUS } = GraphVisualizer;
    const positions = this.model.nodes.map((n) => new THREE.Vector3(n.x, n.y, n.z));

    // Edges first so they sit visually behind the node orbs.
    for (const { u, v, w } of this.model.edges) {
      const edge = new GlowEdge(positions[u], positions[v], EDGE_RADIUS, w);
      this.edgeViews.push({ u, v, edge });
      this.group.add(edge.group);
    }

    for (const node of this.model.nodes) {
      const view = new GlowNode(positions[node.id], NODE_RADIUS, String(node.id));
      this.nodeViews.push(view);
      this.group.add(view.group);
    }
  }

  /** Faint floor grid that grounds the network and catches the bloom glow. */
  private buildEnvironment(): void {
    const grid = new THREE.GridHelper(220, 44, SCENE.grid, SCENE.grid);
    grid.position.y = -10;
    (grid.material as THREE.Material).opacity = 0.18;
    (grid.material as THREE.Material).transparent = true;
    this.group.add(grid);
  }
}
