import { describe, it, expect } from 'vitest';
import { hexToVec3, themeToUniforms } from '../themeBridge';
import { defaultTheme } from '../defaultTheme';

function approx(a: number[], b: number[], eps = 1e-3) {
  expect(a.length).toBe(b.length);
  for (let i = 0; i < a.length; i++) expect(Math.abs(a[i] - b[i])).toBeLessThan(eps);
}

describe('hexToVec3', () => {
  it('parses #RRGGBB to 0..1 vec3', () => {
    approx([...hexToVec3('#4ADE80')], [0.290, 0.871, 0.502]);
    approx([...hexToVec3('#A78BFA')], [0.655, 0.545, 0.980]);
  });

  it('accepts shorthand without #', () => {
    approx([...hexToVec3('4ADE80')], [0.290, 0.871, 0.502]);
  });

  it('throws on malformed input', () => {
    expect(() => hexToVec3('#XYZ')).toThrow();
    expect(() => hexToVec3('#12345')).toThrow();
    expect(() => hexToVec3('')).toThrow();
    expect(() => hexToVec3(null as unknown as string)).toThrow();
  });
});

describe('themeToUniforms(defaultTheme)', () => {
  const u = themeToUniforms(defaultTheme);

  it('u_color is a Float32Array of length 15 reproducing the demo palette', () => {
    expect(u.u_color).toBeInstanceOf(Float32Array);
    expect(u.u_color.length).toBe(15);
    approx([u.u_color[0], u.u_color[1], u.u_color[2]], [0.655, 0.545, 0.980]); // violet
    approx([u.u_color[6], u.u_color[7], u.u_color[8]], [0.290, 0.871, 0.502]); // green
  });

  it('u_base reproduces the demo dark base', () => {
    approx([...u.u_base], [0.039, 0.039, 0.059]);
  });

  it('intensity/speed/warp match the demo', () => {
    expect(u.u_intensity).toBe(0.9);
    expect(u.u_speed).toBe(0.05);
    expect(u.u_warp).toBe(2.0);
  });
});

describe('themeToUniforms validation', () => {
  it('clamps intensity to [0,1]', () => {
    const u = themeToUniforms({ ...defaultTheme, intensity: 5 });
    expect(u.u_intensity).toBe(1);
  });

  it('clamps speed to >=0', () => {
    const u = themeToUniforms({ ...defaultTheme, speed: -3 });
    expect(u.u_speed).toBe(0);
  });

  it('falls back warp to 2.0 when invalid', () => {
    const u = themeToUniforms({ ...defaultTheme, warp: 0 });
    expect(u.u_warp).toBe(2.0);
  });
});
