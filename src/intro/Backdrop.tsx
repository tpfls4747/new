import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

/** 화면 전체 펄 화이트 → 라벤더 배경 (Bloom이 투명 배경에서 사라지지 않도록 캔버스 안에 그림) */
export function Backdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
          float blob(vec2 uv, vec2 c, float r) { return smoothstep(r, 0.0, distance(uv, c)); }
          void main() {
            vec2 uv = vUv;
            vec3 pearl = lin(vec3(0.984, 0.973, 1.0));   // #FBF8FF
            vec3 lav   = lin(vec3(0.925, 0.894, 0.976)); // 옅은 라벤더
            vec3 blush = lin(vec3(0.992, 0.937, 0.965)); // 펄 핑크 기운
            vec3 col = mix(pearl, lav, smoothstep(0.1, 1.1, uv.x * 0.55 + (1.0 - uv.y) * 0.6));
            float t = uTime * 0.05;
            col = mix(col, blush, 0.55 * blob(uv, vec2(0.78 + sin(t) * 0.05, 0.72 + cos(t * 1.3) * 0.04), 0.55));
            col = mix(col, lav, 0.5 * blob(uv, vec2(0.2 + cos(t) * 0.04, 0.25), 0.5));
            col = mix(col, pearl, 0.6 * blob(uv, vec2(0.55, 0.5), 0.35));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  )
  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime
  })
  return (
    <mesh frustumCulled={false} renderOrder={-1000} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
