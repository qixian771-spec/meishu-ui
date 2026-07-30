import { describe, it, expect } from 'vitest';
// ?raw gives the verbatim source string (vite native + glsl plugin both support it)
import fragSrc from '../liquid.frag?raw';

describe('liquid.frag — verbatim port with uniforms', () => {
  const src = fragSrc as unknown as string;

  it('declares the five promoted uniforms', () => {
    expect(src).toContain('uniform vec3 u_color[5]');
    expect(src).toContain('uniform vec3 u_base');
    expect(src).toContain('uniform float u_intensity');
    expect(src).toContain('uniform float u_speed');
    expect(src).toContain('uniform float u_warp');
  });

  it('has NO demo palette variable names or the base literal', () => {
    expect(src).not.toContain('cViolet');
    expect(src).not.toContain('cBlue');
    expect(src).not.toContain('cGreen');
    expect(src).not.toContain('cCoral');
    expect(src).not.toContain('cPink');
    expect(src).not.toContain('vec3(0.039, 0.039, 0.059)');
  });

  it('uses u_color[0..4] in the mix chain (>=5 array references)', () => {
    const matches = src.match(/u_color\[/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(5);
  });

  it('preserves algorithm constants (uv-scale 1.35, vignette 0.32, pink weight 0.6)', () => {
    expect(src).toContain('1.35');
    expect(src).toContain('0.32');
    expect(src).toContain('0.6');
  });

  it('keeps snoise + fbm + domain-warp structure', () => {
    expect(src).toContain('float snoise(vec3 v)');
    expect(src).toContain('float fbm(vec3 p)');
    expect(src).toContain('u_warp*q');
    expect(src).toContain('u_warp*1.25*r');
  });
});
