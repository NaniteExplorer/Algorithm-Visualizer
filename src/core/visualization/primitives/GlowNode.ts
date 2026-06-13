import * as THREE from 'three';
import { makeLabelSprite } from './glow';

/**
 * A glowing spherical node with an optional camera-facing value label.
 *
 * Like {@link Bar}, it separates target state (colour, glow, scale, visibility)
 * from rendered state and critically-damps toward it every frame, so graph/tree
 * steps animate as fluid pulses rather than hard cuts. Used by both the graph
 * and tree visualizers.
 */
export class GlowNode {
  readonly group = new THREE.Group();
  private readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly label: THREE.Sprite | null;

  private readonly color = new THREE.Color('#3b5bdb');
  private readonly targetColor = new THREE.Color('#3b5bdb');
  private targetEmissive = 0.25;
  private targetScale = 1;
  private scale = 1;
  private readonly baseRadius: number;

  private static readonly LAMBDA = 14;

  constructor(position: THREE.Vector3, radius: number, label?: string) {
    this.baseRadius = radius;
    this.material = new THREE.MeshStandardMaterial({
      color: this.color.clone(),
      emissive: this.color.clone(),
      emissiveIntensity: this.targetEmissive,
      roughness: 0.3,
      metalness: 0.2,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 24), this.material);
    this.group.add(this.mesh);
    this.group.position.copy(position);

    this.label = label !== undefined ? makeLabelSprite(label) : null;
    if (this.label) {
      this.label.position.set(0, radius + 1.6, 0);
      this.group.add(this.label);
    }
  }

  setTargetStyle(colorHex: string, emissive: number, scale = 1): void {
    this.targetColor.set(colorHex);
    this.targetEmissive = emissive;
    this.targetScale = scale;
  }

  update(dt: number): void {
    const t = 1 - Math.exp(-GlowNode.LAMBDA * dt);
    this.color.lerp(this.targetColor, t);
    this.material.color.copy(this.color);
    this.material.emissive.copy(this.color);
    this.material.emissiveIntensity = THREE.MathUtils.damp(
      this.material.emissiveIntensity,
      this.targetEmissive,
      GlowNode.LAMBDA,
      dt,
    );
    this.scale = THREE.MathUtils.damp(this.scale, this.targetScale, GlowNode.LAMBDA, dt);
    this.mesh.scale.setScalar(this.scale);
  }

  /** World radius at the current animated scale (used to seat edges). */
  get radius(): number {
    return this.baseRadius * this.scale;
  }

  /** Show/hide the whole node (mesh + label). */
  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  /** Snap the current scale to ~0 so the next frames damp it up into a pop-in. */
  popIn(): void {
    this.scale = 0.01;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    if (this.label) {
      this.label.material.map?.dispose();
      this.label.material.dispose();
    }
  }
}
