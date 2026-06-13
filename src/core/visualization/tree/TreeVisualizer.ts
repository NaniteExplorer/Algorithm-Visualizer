import * as THREE from 'three';
import { Visualizer } from '../Visualizer';
import type { FrameContext, VisualizationEngine } from '../engine/VisualizationEngine';
import { TreeModel, TreeNodeRole } from '@/core/model/TreeModel';
import { GlowNode } from '../primitives/GlowNode';
import { GlowEdge } from '../primitives/GlowEdge';
import { TREE_EDGE_ACTIVE, TREE_EDGE_DEFAULT, TREE_NODE_STYLES } from './palette';

interface EdgeView {
  parent: number;
  child: number;
  edge: GlowEdge;
}

/**
 * Renders a {@link TreeModel} as a glowing binary tree in the XY plane: nodes
 * are value-labelled spheres, edges connect parents to children.
 *
 * A pure pull renderer. Hidden nodes (not yet inserted) are invisible; the first
 * frame a node becomes visible it "pops in" by damping up from zero scale, which
 * gives the insertion animation its satisfying snap. Comparisons flash cyan,
 * the current node swells amber, visited nodes cool to indigo, found glows green.
 */
export class TreeVisualizer extends Visualizer {
  private static readonly NODE_RADIUS = 1.7;
  private static readonly EDGE_RADIUS = 0.1;

  private nodeViews: GlowNode[] = [];
  private edgeViews: EdgeView[] = [];
  private wasVisible: boolean[] = [];

  constructor(private readonly model: TreeModel) {
    super();
  }

  protected onAttach(_engine: VisualizationEngine): void {
    void _engine;
    this.rebuild();
  }

  protected onFrame(ctx: FrameContext): void {
    for (let i = 0; i < this.nodeViews.length; i += 1) {
      const view = this.nodeViews[i];
      const visible = this.model.isVisible(i);
      if (visible && !this.wasVisible[i]) view.popIn();
      this.wasVisible[i] = visible;
      view.setVisible(visible);

      const style = TREE_NODE_STYLES[this.model.roleAt(i)];
      view.setTargetStyle(style.color, style.emissive, style.scale);
      view.update(ctx.dt);
    }

    for (const { parent, child, edge } of this.edgeViews) {
      const visible = this.model.isVisible(parent) && this.model.isVisible(child);
      edge.group.visible = visible;
      const role = this.model.roleAt(child);
      const active = role === TreeNodeRole.Comparing || role === TreeNodeRole.Current;
      const s = active ? TREE_EDGE_ACTIVE : TREE_EDGE_DEFAULT;
      edge.setTargetStyle(s.color, s.emissive, s.opacity);
      edge.update(ctx.dt);
    }
  }

  protected onDispose(): void {
    this.nodeViews.forEach((n) => n.dispose());
    this.edgeViews.forEach((e) => e.edge.dispose());
    this.nodeViews = [];
    this.edgeViews = [];
    this.wasVisible = [];
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

    const { NODE_RADIUS, EDGE_RADIUS } = TreeVisualizer;
    const positions = this.model.nodes.map((n) => new THREE.Vector3(n.x, n.y, 0));

    // Edges first (behind the node orbs).
    for (const node of this.model.nodes) {
      if (node.parent === null) continue;
      const edge = new GlowEdge(positions[node.parent], positions[node.id], EDGE_RADIUS);
      this.edgeViews.push({ parent: node.parent, child: node.id, edge });
      this.group.add(edge.group);
    }

    for (const node of this.model.nodes) {
      const view = new GlowNode(positions[node.id], NODE_RADIUS, String(node.value));
      view.setVisible(false);
      this.nodeViews.push(view);
      this.group.add(view.group);
    }
    this.wasVisible = new Array(this.model.nodes.length).fill(false);
  }
}
