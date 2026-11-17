import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * 화면 전체 핑크 뭉게구름 하늘 + 반짝이는 별.
 * Bloom이 투명 배경에서 사라지지 않도록 캔버스 안에 그립니다.
 */
export function Backdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uAspect: { value: 1 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uAspect;
          vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
          }
          float fbm(vec2 p) {
            float v = 0.0, a = 0.5;
            for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
            return v;
          }
          // 둥글게 부푼 구름 덩어리: 아래쪽 띠 + 몇 개의 둥근 봉우리
          float puffs(vec2 p, float t) {
            float c = 0.0;
            for (int i = 0; i < 7; i++) {
              float fi = float(i);
              vec2 ctr = vec2(fract(fi * 0.173 + t * 0.004 * (1.0 + fi * 0.1)) * 1.6 - 0.3, 0.06 + mod(fi, 3.0) * 0.07);
              ctr.x *= uAspect;
              float r = 0.16 + mod(fi * 0.37, 0.12);
              c = max(c, smoothstep(r, r * 0.35, distance(p, ctr)));
            }
            return c;
          }
          void main() {
            vec2 uv = vUv;
            vec2 p = vec2(uv.x * uAspect, uv.y);
            float t = uTime;
            // 하늘: 위는 라일락 핑크, 아래로 갈수록 복숭앗빛 핑크
            vec3 top = lin(vec3(0.957, 0.855, 0.937));
            vec3 mid = lin(vec3(0.992, 0.890, 0.929));
            vec3 low = lin(vec3(1.0, 0.925, 0.925));
            vec3 col = mix(low, mid, smoothstep(0.0, 0.5, uv.y));
            col = mix(col, top, smoothstep(0.5, 1.0, uv.y));

            // 뭉게구름: 아래쪽은 둥근 봉우리, 위쪽은 옅게 흐르는 구름
            float n = fbm(p * 3.0 + vec2(t * 0.01, 0.0));
            float base = puffs(p + (n - 0.5) * 0.08, t) ;
            base = max(base, smoothstep(0.32, 0.05, uv.y + (n - 0.5) * 0.12));
            float high = smoothstep(0.55, 0.85, fbm(p * 1.6 + vec2(-t * 0.006, 3.0))) * smoothstep(0.35, 0.9, uv.y) * 0.55;
            vec3 cloudLight = lin(vec3(1.0, 0.975, 0.985));
            vec3 cloudShade = lin(vec3(0.95, 0.76, 0.86));
            float shade = smoothstep(0.0, 1.0, n);
            vec3 cloud = mix(cloudShade, cloudLight, shade);
            col = mix(col, cloud, base * 0.92);
            col = mix(col, cloudLight, high);

            // 반짝이는 작은 별
            vec2 g = p * 34.0;
            vec2 id = floor(g);
            float h = hash(id);
            if (h > 0.965) {
              vec2 f = fract(g) - 0.5;
              float tw = 0.5 + 0.5 * sin(t * (1.5 + h * 3.0) + h * 40.0);
              float star = smoothstep(0.09, 0.0, abs(f.x)) * smoothstep(0.35, 0.0, abs(f.y)) + smoothstep(0.09, 0.0, abs(f.y)) * smoothstep(0.35, 0.0, abs(f.x));
              col = mix(col, vec3(1.0), clamp(star * tw, 0.0, 1.0) * smoothstep(0.25, 0.6, uv.y) * 0.9);
            }
            gl_FragColor = vec4(min(col, vec3(0.985)), 1.0);
          }
        `,
      }),
    [],
  )
  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime
    material.uniforms.uAspect.value = s.size.width / Math.max(1, s.size.height)
  })
  return (
    <mesh frustumCulled={false} renderOrder={-1000} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
