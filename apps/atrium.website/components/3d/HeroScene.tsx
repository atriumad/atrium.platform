'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const VERT = /* glsl */`
void main() {
  gl_Position = vec4(position, 1.0);
}
`

/*
 * Patio de luces — crossed grid shadow shader.
 *
 * A glass skylight has TWO sets of structural members at crossing angles
 * (~28° and ~-44°). Each set creates its own periodic shadow bands.
 * Their PRODUCT creates genuine interference: bright diamond cells where
 * both systems are in the lit gap, double-dark where both beams overlap.
 *
 * Cosine-based gradient bands (not hard smoothstep) give the soft,
 * light-leaking quality of real glass-filtered sun.
 *
 * All animation frequencies are mutually prime so patterns never sync.
 */
/* ── Shared GLSL helpers ─────────────────────────────────────────────── */
const GLSL_COMMON = /* glsl */`
precision highp float;
uniform float uTime;
uniform vec2  uRes;
const float TAU = 6.28318530;
vec2 rot2(vec2 v, float a) {
  float c = cos(a), s = sin(a);
  return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.545); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
`

/*
 * HOME variant — asymmetric crossed grid (~28° / ~-44°).
 * Diagonal light from upper-left. Mint glass tint. Slow drift.
 */
const FRAG_HOME = /* glsl */`${GLSL_COMMON}
const vec3 LIT    = vec3(0.055, 0.285, 0.310);
const vec3 SHADOW = vec3(0.006, 0.048, 0.060);
const vec3 ACCENT = vec3(0.710, 0.949, 0.859);  /* mint */

void main() {
  vec2  uv = gl_FragCoord.xy / uRes;
  float t  = uTime;
  float cloud = 0.89 + sin(t * 0.113) * 0.11;

  float angA  = 0.49 + sin(t * 0.173) * 0.010;
  vec2  cA    = rot2(uv - 0.5, angA);
  float driftA = t * 0.0015 + sin(t * 0.223) * 0.020;
  float litA  = pow(clamp(0.5 + 0.5*cos((cA.x+driftA)/0.130*TAU), 0.0, 1.0), 0.70);

  float angB  = -0.77 + cos(t * 0.131) * 0.009;
  vec2  cB    = rot2(uv - 0.5, angB);
  float driftB = t * 0.0012 + sin(t * 0.293) * 0.017;
  float litB  = pow(clamp(0.5 + 0.5*cos((cB.x+driftB)/0.105*TAU), 0.0, 1.0), 0.70);

  float light  = litA * litB;
  float crossed = (1.0-litA) * (1.0-litB);

  float fade = clamp((1.0 - (uv.x*0.38 + (1.0-uv.y)*0.42)) * cloud, 0.28, 1.0);

  float sh1 = noise(uv*7.5 + vec2( t*0.20, t*0.13));
  float sh2 = noise(uv*3.8 + vec2(-t*0.09, t*0.25));
  float atmos = sh1*0.55 + sh2*0.45;

  vec3 col = mix(LIT, SHADOW, (1.0-light)*fade*0.85);
  col += ACCENT * light * fade * (0.08 + atmos*0.045);
  col  = mix(col, SHADOW*0.55, crossed*fade*0.55);

  vec2 vc = uv - vec2(0.42, 0.50);
  col *= clamp(1.0 - dot(vc,vc)*0.68, 0.20, 1.0);
  gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0);
}
`

/*
 * SERVICES variant — symmetric 45°/-45° overhead grid + fine horizontal layer.
 * Three-way interference. Amber warm glass tint. 2× faster movement.
 * Radial fade from center-top (light descending symmetrically).
 */
const FRAG_SERVICES = /* glsl */`${GLSL_COMMON}
const vec3 LIT    = vec3(0.048, 0.255, 0.278);
const vec3 SHADOW = vec3(0.006, 0.040, 0.052);
const vec3 ACCENT = vec3(0.920, 0.780, 0.560);  /* amber warm */

void main() {
  vec2  uv = gl_FragCoord.xy / uRes;
  float t  = uTime;

  /* Overhead radial fade — light descends from center-top */
  float radial = clamp(1.0 - length(uv - vec2(0.5, 0.28)) * 0.90, 0.18, 1.0);
  float cloud  = 0.87 + sin(t * 0.178) * 0.13;

  /* SET A — 45°, faster wobble */
  float angA  = 0.785 + sin(t * 0.243) * 0.030;
  vec2  cA    = rot2(uv - 0.5, angA);
  float driftA = t * 0.0032 + sin(t * 0.317) * 0.035;
  float litA  = pow(clamp(0.5 + 0.5*cos((cA.x+driftA)/0.110*TAU), 0.0, 1.0), 0.65);

  /* SET B — -45°, independent drift */
  float angB  = -0.785 + cos(t * 0.197) * 0.025;
  vec2  cB    = rot2(uv - 0.5, angB);
  float driftB = t * 0.0027 + sin(t * 0.373) * 0.028;
  float litB  = pow(clamp(0.5 + 0.5*cos((cB.x+driftB)/0.095*TAU), 0.0, 1.0), 0.65);

  /* SET C — fine horizontal bands (venetian blind, partial weight) */
  float driftC = t * 0.0018 + sin(t * 0.271) * 0.022;
  float litC   = pow(clamp(0.5 + 0.5*cos((uv.y+driftC)/0.055*TAU), 0.0, 1.0), 0.80);
  litC = mix(1.0, litC, 0.50);

  float light  = litA * litB * litC;
  float crossed = (1.0-litA) * (1.0-litB);
  float fade   = radial * cloud;

  float sh1 = noise(uv*8.0 + vec2( t*0.34, t*0.21));
  float sh2 = noise(uv*4.2 + vec2(-t*0.18, t*0.41));
  float atmos = sh1*0.55 + sh2*0.45;

  vec3 col = mix(LIT, SHADOW, (1.0-light)*fade*0.88);
  col += ACCENT * light * fade * (0.10 + atmos*0.055);
  col  = mix(col, SHADOW*0.50, crossed*fade*0.50);

  vec2 vc = uv - vec2(0.50, 0.48);
  col *= clamp(1.0 - dot(vc,vc)*0.72, 0.18, 1.0);
  gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0);
}
`

export type SceneVariant = 'home' | 'services'

function AtriumLight({ frag }: { frag: string }) {
  const { size } = useThree()
  const matRef   = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes:  { value: new THREE.Vector2() },
    }),
    [],
  )

  useFrame((_, delta) => {
    if (!matRef.current) return
    const { uTime, uRes } = matRef.current.uniforms
    if (uTime) uTime.value += delta
    if (uRes) uRes.value.set(size.width, size.height)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function HeroScene({ variant = 'home' }: { variant?: SceneVariant }) {
  const frag = variant === 'services' ? FRAG_SERVICES : FRAG_HOME
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 1], fov: 60, near: 0.1, far: 10 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      gl={{ alpha: false, antialias: false, powerPreference: 'high-performance' }}
    >
      <AtriumLight frag={frag} />
    </Canvas>
  )
}
