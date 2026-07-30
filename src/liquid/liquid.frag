precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_color[5];
uniform vec3 u_base;
uniform float u_intensity;
uniform float u_speed;
uniform float u_warp;

/* --- 3D Simplex noise (Ashima / Ian McEwan, MIT) --- */
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0,i1.z,i2.z,1.0)) + i.y + vec4(0.0,i1.y,i2.y,1.0)) + i.x + vec4(0.0,i1.x,i2.x,1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0*floor(p*ns.z*ns.z);
  vec4 x_ = floor(j*ns.z);
  vec4 y_ = floor(j - 7.0*x_);
  vec4 x = x_*ns.x + ns.yyyy;
  vec4 y = y_*ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p){
  float f = 0.0;
  float amp = 0.5;
  for(int i=0;i<5;i++){ f += amp*snoise(p); p *= 2.0; amp *= 0.5; }
  return f;
}

void main(){
  vec2 uv = (gl_FragCoord.xy*2.0 - u_res) / min(u_res.x, u_res.y);
  float t = u_time * u_speed;

  /* domain warp: noise fed back into noise → flowing, morphing color field */
  vec3 p = vec3(uv*1.35, t);
  vec3 q = vec3(
    fbm(p),
    fbm(p + vec3(5.2, 1.3, 2.8)),
    fbm(p + vec3(8.3, 2.8, 1.1))
  );
  vec3 r = vec3(
    fbm(p + u_warp*q + vec3(1.7, 9.2, 0.5) + 0.15*t),
    fbm(p + u_warp*q + vec3(8.3, 2.8, 0.8) + 0.12*t),
    fbm(p + u_warp*q + vec3(4.1, 6.0, 0.3) + 0.10*t)
  );
  float f = fbm(p + u_warp*1.25*r);

  /* palette mix chain — colors are uniforms (u_color[0..4]) */
  vec3 col = mix(u_color[0], u_color[1], smoothstep(0.0, 1.0, q.x*0.5+0.5));
  col = mix(col, u_color[2], smoothstep(0.10, 0.90, r.y*0.5+0.5));
  col = mix(col, u_color[3], smoothstep(0.20, 0.95, r.z*0.5+0.5));
  col = mix(col, u_color[4], smoothstep(0.30, 1.00, q.z*0.5+0.5) * 0.6);

  /* intensity field + dark base addend (both uniforms) */
  float inten = smoothstep(-0.25, 0.95, f);
  vec3 outc = u_base + col * inten * u_intensity;

  /* subtle vignette (algorithm constant, NOT themeable) */
  float vig = 1.0 - 0.32 * dot(uv*0.5, uv*0.5);
  outc *= vig;

  gl_FragColor = vec4(outc, 1.0);
}
