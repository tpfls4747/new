import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { T, clamp01, easeOutBack, easeOutCubic, type Bridge, elapsed } from './bridge'
import type { Rig } from './sceneRig'
import { worldToScreen } from './sceneRig'
import { HEART_BEVEL, HEART_DEPTH, KEYHOLE, LOCK_FRONT_Z, gemGeometry, heartShape, keyholePath, keyholeRimShape, wingShape } from './shapes'

const SHACKLE_R = 0.4
const SHACKLE_TUBE = 0.075

/** 하트형 자물쇠: 펄 라벤더 금속 몸체 + 라벤더 보석 + 날개 + 잠금 고리 */
export function Lock({ bridge, rig }: { bridge: Bridge; rig: Rig }) {
  const group = useRef<THREE.Group>(null)
  const shacklePivot = useRef<THREE.Group>(null)
  const wingL = useRef<THREE.Group>(null)
  const wingR = useRef<THREE.Group>(null)
  const rimMat = useRef<THREE.MeshStandardMaterial>(null)
  const gemMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const holeLocal = useMemo(() => KEYHOLE.clone(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const geo = useMemo(() => {
    const heart = new THREE.ExtrudeGeometry(heartShape(), {
      depth: HEART_DEPTH,
      bevelEnabled: true,
      bevelThickness: HEART_BEVEL,
      bevelSize: 0.14,
      bevelSegments: 10,
      curveSegments: 64,
    })
    heart.translate(0, 0, -HEART_DEPTH / 2)
    const hole = new THREE.ShapeGeometry(keyholePath(1) as THREE.Shape, 24)
    const rim = new THREE.ExtrudeGeometry(keyholeRimShape(), {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 32,
    })
    const wing = new THREE.ExtrudeGeometry(wingShape(), {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
      curveSegments: 16,
    })
    wing.translate(0, 0, -0.015)
    const arc = new THREE.TorusGeometry(SHACKLE_R, SHACKLE_TUBE, 20, 48, Math.PI)
    const leg = new THREE.CylinderGeometry(SHACKLE_TUBE, SHACKLE_TUBE, 0.42, 20)
    const gem = gemGeometry(0.15, 8)
    const plate = new THREE.CylinderGeometry(0.22, 0.24, 0.03, 48)
    return { heart, hole, rim, wing, arc, leg, gem, plate }
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g || !rig.valid) return
    const t = state.clock.elapsedTime
    const e = elapsed(bridge)
    const inserting = e >= 0

    // 위치·크기: DOM 앵커에서 매 프레임 동기화
    g.position.copy(rig.lockWorld)
    g.position.y += Math.sin(t * 1.1) * 0.035 * rig.lockScale
    g.scale.setScalar(rig.lockScale)
    const sway = inserting ? 0 : Math.sin(t * 0.55) * 0.14
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, sway, 6, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, inserting ? 0 : Math.sin(t * 0.4) * 0.04, 6, dt)
    g.updateMatrixWorld()
    rig.lockQuat.copy(g.quaternion)

    // 구멍의 월드/화면 좌표 (판정·리본 시작점에 사용)
    tmp.copy(holeLocal)
    g.localToWorld(tmp)
    rig.holeWorld.copy(tmp)
    worldToScreen(tmp, state.camera, state.size.width, state.size.height, rig.holeScreen)

    // 구멍 테두리 발광: 가까워질수록 밝게, 꽂히는 순간 반짝
    if (rimMat.current) {
      const flash = inserting ? Math.max(0, 1 - Math.abs(e - T.PUSH_END) / 220) : 0
      const target = 0.25 + bridge.near * 2.8 + flash * 4 + (inserting && e > T.UNLOCK ? 1.5 : 0)
      rimMat.current.emissiveIntensity = THREE.MathUtils.damp(rimMat.current.emissiveIntensity, target, 14, dt)
    }
    // 보석: 평소엔 은은하게 숨쉬고, 잠금 해제 시 밝아짐
    if (gemMat.current) {
      const unlock = inserting ? clamp01((e - T.UNLOCK + 120) / 260) : 0
      gemMat.current.emissiveIntensity = 0.55 + Math.sin(t * 2) * 0.15 + unlock * 4.5
    }

    // 잠금 고리: 위로 살짝 올라가며 한쪽 다리를 축으로 열림
    if (shacklePivot.current) {
      const k = inserting ? (e - T.SHACKLE_START) / (T.SHACKLE_END - T.SHACKLE_START) : 0
      const lift = easeOutBack(clamp01(k)) * 0.16
      const swing = easeOutCubic(clamp01(k - 0.35)) * 0.55
      shacklePivot.current.position.y = 0.66 + lift
      shacklePivot.current.rotation.y = -swing
    }

    // 날개: 작은 날갯짓, 잠금 해제 때 크게
    const flapAmp = inserting && e > T.UNLOCK ? 0.4 : 0.12
    const flapSpeed = inserting && e > T.UNLOCK ? 9 : 2.2
    const flap = Math.sin(t * flapSpeed) * flapAmp
    if (wingL.current) wingL.current.rotation.y = 0.55 + flap
    if (wingR.current) wingR.current.rotation.y = -0.55 - flap
  }, -1)

  return (
    <group ref={group}>
      {/* 몸체 */}
      <mesh geometry={geo.heart} castShadow>
        <meshPhysicalMaterial
          color="#ece4fa"
          metalness={0.55}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.08}
          iridescence={0.7}
          iridescenceIOR={1.35}
          envMapIntensity={1.1}
        />
      </mesh>

      {/* 구멍 주변 판 */}
      <mesh geometry={geo.plate} position={[KEYHOLE.x, KEYHOLE.y - 0.02, LOCK_FRONT_Z - 0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color="#f6f1ff" metalness={0.8} roughness={0.16} clearcoat={1} envMapIntensity={1.2} />
      </mesh>
      {/* 구멍: 진한 가지색으로 대비 */}
      <mesh geometry={geo.hole} position={[KEYHOLE.x, KEYHOLE.y, LOCK_FRONT_Z + 0.012]}>
        <meshBasicMaterial color="#1d0f2a" />
      </mesh>
      {/* slot 앵커: 열쇠 끝이 닿아야 하는 지점 */}
      <object3D
        ref={(o: THREE.Object3D | null) => {
          rig.slot = o
        }}
        position={[KEYHOLE.x, KEYHOLE.y, KEYHOLE.z]}
      />
      {/* 구멍 테두리: 발광(Bloom) 대상 */}
      <mesh geometry={geo.rim} position={[KEYHOLE.x, KEYHOLE.y, LOCK_FRONT_Z + 0.004]}>
        <meshStandardMaterial
          ref={rimMat}
          color="#d9c8ff"
          metalness={0.6}
          roughness={0.25}
          emissive="#b996ff"
          emissiveIntensity={0.25}
          toneMapped={false}
        />
      </mesh>

      {/* 라벤더 보석: 컷 면 + 굴절(transmission) + 발광 */}
      <mesh geometry={geo.gem} position={[0, 0.36, LOCK_FRONT_Z - 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          ref={gemMat}
          color="#c4a8ff"
          flatShading
          transmission={0.85}
          thickness={0.35}
          ior={2.1}
          roughness={0.04}
          metalness={0}
          iridescence={0.4}
          emissive="#9c6dff"
          emissiveIntensity={0.6}
          envMapIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      {/* 보석 받침 */}
      <mesh position={[0, 0.36, LOCK_FRONT_Z - 0.06]}>
        <torusGeometry args={[0.165, 0.025, 12, 32]} />
        <meshPhysicalMaterial color="#f3ecff" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* 날개 */}
      <group ref={wingL} position={[-0.86, 0.3, -0.04]} scale={[-1, 1, 1]}>
        <mesh geometry={geo.wing}>
          <meshPhysicalMaterial color="#ffffff" metalness={0.3} roughness={0.25} clearcoat={1} iridescence={1} iridescenceIOR={1.4} />
        </mesh>
      </group>
      <group ref={wingR} position={[0.86, 0.3, -0.04]}>
        <mesh geometry={geo.wing}>
          <meshPhysicalMaterial color="#ffffff" metalness={0.3} roughness={0.25} clearcoat={1} iridescence={1} iridescenceIOR={1.4} />
        </mesh>
      </group>

      {/* 잠금 고리: 왼쪽 다리를 축으로 회전 */}
      <group ref={shacklePivot} position={[-SHACKLE_R, 0.66, 0]}>
        <group position={[SHACKLE_R, 0, 0]}>
          <mesh geometry={geo.arc} position={[0, 0.06, 0]}>
            <meshPhysicalMaterial color="#e9e2ee" metalness={1} roughness={0.16} envMapIntensity={1.3} />
          </mesh>
          <mesh geometry={geo.leg} position={[-SHACKLE_R, -0.15, 0]}>
            <meshPhysicalMaterial color="#e9e2ee" metalness={1} roughness={0.16} envMapIntensity={1.3} />
          </mesh>
          <mesh geometry={geo.leg} position={[SHACKLE_R, -0.15, 0]}>
            <meshPhysicalMaterial color="#e9e2ee" metalness={1} roughness={0.16} envMapIntensity={1.3} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
