import * as THREE from 'three';

/**
 * Shared procedural texture + sprite helpers used across visualizers.
 *
 * Keeping these here (rather than duplicated per family) means every glowing
 * orb, label and particle reads from one code path, so the look stays coherent
 * platform-wide and there are no asset dependencies to ship.
 */

/** Soft radial sprite so points/nodes read as glowing orbs under the bloom pass. */
export function createGlowTexture(): THREE.Texture {
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

/**
 * Render a short string to a transparent canvas sprite. Used for node value
 * labels in the graph/tree scenes — cheap (one texture per label) and always
 * camera-facing.
 */
export function makeLabelSprite(text: string, color = '#e2e8f0'): THREE.Sprite {
  const pad = 8;
  const font = 'bold 44px ui-monospace, monospace';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = 56 + pad * 2;
  canvas.width = w;
  canvas.height = h;

  // Re-set font after the resize (resizing clears the 2d context state).
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set((w / h) * 2.4, 2.4, 1);
  return sprite;
}
