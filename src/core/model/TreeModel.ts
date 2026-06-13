import { type TreeData, type TreeNode, type TreeStep, TreeStepKind } from '../algorithms/tree/TreeStep';
import type { StepConsumer } from '../playback/PlaybackController';

/** Visual status of a tree node. */
export enum TreeNodeRole {
  Hidden = 'hidden',
  Default = 'default',
  Comparing = 'comparing',
  Current = 'current',
  Visited = 'visited',
  Found = 'found',
}

export interface TreeMetrics {
  comparisons: number;
  visited: number;
}

/**
 * Authoritative logical state for a tree run — pure and replayable. Holds the
 * static, pre-laid-out BST plus the dynamic overlay: which nodes are visible
 * (insertion reveals them), which is being compared, which is current, which
 * have been visited, and the found node. The visualizer pulls all of this each
 * frame; layout never changes after generation.
 */
export class TreeModel implements StepConsumer<TreeStep> {
  private _nodes: TreeNode[] = [];

  private readonly visible = new Set<number>();
  private readonly visited = new Set<number>();
  private comparing = -1;
  private current = -1;
  private found = -1;

  private _metrics: TreeMetrics = { comparisons: 0, visited: 0 };

  reset(input: TreeData): void {
    this._nodes = input.nodes;
    this.visible.clear();
    this.visited.clear();
    this.comparing = -1;
    this.current = -1;
    this.found = -1;
    this._metrics = { comparisons: 0, visited: 0 };
  }

  rewind(): void {
    this.reset({ nodes: this._nodes, root: this._nodes.length ? 0 : null, order: [] });
  }

  get nodes(): readonly TreeNode[] {
    return this._nodes;
  }
  get metrics(): TreeMetrics {
    return { ...this._metrics };
  }

  isVisible(id: number): boolean {
    return this.visible.has(id);
  }

  roleAt(id: number): TreeNodeRole {
    if (!this.visible.has(id)) return TreeNodeRole.Hidden;
    if (id === this.found) return TreeNodeRole.Found;
    if (id === this.comparing) return TreeNodeRole.Comparing;
    if (id === this.current) return TreeNodeRole.Current;
    if (this.visited.has(id)) return TreeNodeRole.Visited;
    return TreeNodeRole.Default;
  }

  apply(step: TreeStep): void {
    // Comparing/current only describe the most recent step.
    this.comparing = -1;
    this.current = -1;

    switch (step.kind) {
      case TreeStepKind.RevealAll:
        for (let i = 0; i < this._nodes.length; i += 1) this.visible.add(i);
        break;
      case TreeStepKind.Reveal:
        if (step.node !== undefined) {
          this.visible.add(step.node);
          this.current = step.node;
        }
        break;
      case TreeStepKind.Compare:
        if (step.node !== undefined) {
          this.comparing = step.node;
          this._metrics.comparisons += 1;
        }
        break;
      case TreeStepKind.Visit:
        if (step.node !== undefined) {
          this.current = step.node;
          this.visited.add(step.node);
          this._metrics.visited += 1;
        }
        break;
      case TreeStepKind.Found:
        if (step.node !== undefined) this.found = step.node;
        break;
      case TreeStepKind.NotFound:
      case TreeStepKind.Done:
        break;
    }
  }
}
