import * as THREE from 'three';

/**
 * A single animated 3D bar.
 *
 * The bar separates *target* state (set instantly when a step is applied) from
 * *rendered* state (eased toward the target every frame). This is the core of
 * the "classy" feel: discrete algorithm steps become smooth, frame-rate
 * independent motion. Height and colour are both critically damped, so a fast
 * playback rate reads as fluid rather than strobing.
 *
 * Geometry is a shared unit cube scaled per-bar, keeping draw setup cheap even
 * for large arrays.
 */
export class Bar {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;

  private height: number;
  private targetHeight: number;
  private targetEmissive = 0.12;
  private readonly color = new THREE.Color('#3b5bdb');
  private readonly targetColor = new THREE.Color('#3b5bdb');

  /** How quickly rendered state chases target state (higher = snappier). */
  private static readonly HEIGHT_LAMBDA = 14;
  private static readonly COLOR_LAMBDA = 16;

  constructor(geometry: THREE.BoxGeometry, x: number, width: number, height: number) {
    this.height = height;
    this.targetHeight = height;
    this.material = new THREE.MeshStandardMaterial({
      color: this.color.clone(),
      emissive: this.color.clone(),
      emissiveIntensity: this.targetEmissive,
      roughness: 0.35,
      metalness: 0.15,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.scale.set(width, Math.max(height, 0.001), width);
    this.mesh.position.set(x, height / 2, 0);
  }

  /** Set the value-driven target height (world units). */
  setTargetHeight(height: number): void {
    this.targetHeight = height;
  }

  /** Set the role-driven target colour + glow. */
  setTargetStyle(colorHex: string, emissive: number): void {
    this.targetColor.set(colorHex);
    this.targetEmissive = emissive;
  }

  /** Ease rendered state toward targets and push to the GPU mesh. */
  update(dt: number): void {
    this.height = THREE.MathUtils.damp(this.height, this.targetHeight, Bar.HEIGHT_LAMBDA, dt);
    const t = 1 - Math.exp(-Bar.COLOR_LAMBDA * dt);
    this.color.lerp(this.targetColor, t);

    const h = Math.max(this.height, 0.001);
    this.mesh.scale.y = h;
    this.mesh.position.y = h / 2;
    this.material.color.copy(this.color);
    this.material.emissive.copy(this.color);
    this.material.emissiveIntensity = THREE.MathUtils.damp(
      this.material.emissiveIntensity,
      this.targetEmissive,
      Bar.COLOR_LAMBDA,
      dt,
    );
  }

  setX(x: number): void {
    this.mesh.position.x = x;
  }

  setWidth(width: number): void {
    this.mesh.scale.x = width;
    this.mesh.scale.z = width;
  }
}
