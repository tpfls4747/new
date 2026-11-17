import { Environment, Lightformer, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Backdrop } from './Backdrop'
import type { Bridge } from './bridge'
import { Key } from './Key'
import { Lock } from './Lock'
import { createRig, screenToWorld, unitsPerPx, type Rig } from './sceneRig'
import { StarBurst } from './StarBurst'

/** 자물쇠 디자인의 전체 높이와 시각적 중심 (로컬 단위) */
const LOCK_DESIGN_H = 2.25
const LOCK_DESIGN_CY = 0.1

/** 3D 인트로 씬. React.lazy로 불러와서 본문과 버튼은 three.js 로딩을 기다리지 않습니다. */
export default function IntroScene({ bridge }: { bridge: Bridge }) {
  const rig = useMemo(createRig, [])
  if (import.meta.env.DEV) Object.assign(window, { __intro: { rig, bridge } })
  return (
    <Canvas
      className="intro-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 50 }}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      onCreated={() => bridge.onReady()}
      // 입력은 DOM 핸들에서만 받으므로 캔버스는 포인터 이벤트를 쓰지 않음 (스크롤 유지)
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <RigSync bridge={bridge} rig={rig} />
      <Backdrop />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} color="#e6d8ff" />
      {/* 외부 HDR 없이 Lightformer로 만든 부드러운 반사 환경 */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#f3eefb']} />
        <Lightformer form="rect" intensity={3} position={[0, 4, 5]} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-5, 0, 3]} scale={[3, 8, 1]} color="#d8c6ff" />
        <Lightformer form="rect" intensity={1.4} position={[5, -1, 3]} scale={[3, 8, 1]} color="#ffd9ec" />
        <Lightformer form="ring" intensity={2} position={[0, -4, 4]} scale={4} color="#ffffff" />
      </Environment>
      <Lock bridge={bridge} rig={rig} />
      <Key bridge={bridge} rig={rig} />
      <StarBurst bridge={bridge} rig={rig} />
      <AmbientSparkles rig={rig} />
      <EffectComposer multisampling={4}>
        {/* 임계값을 1.5로 두어 금속 반사광은 제외하고, toneMapped=false + 높은 emissive를 가진 보석·구멍 테두리만 발광 */}
        <Bloom mipmapBlur luminanceThreshold={1.5} luminanceSmoothing={0.15} intensity={1.1} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  )
}

/** DOM 앵커(자물쇠 자리, 열쇠 핸들) → 3D 좌표 동기화. 다른 컴포넌트보다 먼저 실행. */
function RigSync({ bridge, rig }: { bridge: Bridge; rig: Rig }) {
  useFrame((state) => {
    const { camera, size, gl } = state
    const lockEl = bridge.lockEl
    const handleEl = bridge.handleEl
    if (!lockEl) return
    const c = gl.domElement.getBoundingClientRect()
    rig.canvasRect = c
    const l = lockEl.getBoundingClientRect()
    const cam = camera as THREE.PerspectiveCamera
    const upp = unitsPerPx(cam, 0, size.height)
    rig.lockPx = l.height
    rig.lockScale = (l.height * upp) / LOCK_DESIGN_H
    screenToWorld(l.left - c.left + l.width / 2, l.top - c.top + l.height / 2, 0, camera, size.width, size.height, rig.lockWorld)
    rig.lockWorld.y -= LOCK_DESIGN_CY * rig.lockScale
    if (handleEl) {
      const h = handleEl.getBoundingClientRect()
      rig.handleScreen.set(h.left - c.left + h.width / 2, h.top - c.top + h.height / 2)
    }
    rig.valid = true
  }, -2)
  return null
}

function AmbientSparkles({ rig }: { rig: Rig }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!ref.current || !rig.valid) return
    ref.current.position.copy(rig.lockWorld)
    ref.current.scale.setScalar(rig.lockScale)
  })
  return (
    <group ref={ref}>
      <Sparkles count={26} scale={[3.4, 3, 1.6]} size={2.2} speed={0.25} opacity={0.75} color="#cbb7ff" noise={0.6} />
    </group>
  )
}
