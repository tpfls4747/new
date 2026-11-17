import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { T, clamp01, easeOutBack, easeOutCubic, elapsed, type Bridge } from './bridge'
import { CrystalMaterial, GoldMaterial } from './materials'
import type { Rig } from './sceneRig'
import { worldToScreen } from './sceneRig'
import { HEART_BEVEL, HEART_DEPTH, KEYHOLE, LOCK_FRONT_Z, featherShape, gemGeometry, heartRimShape, heartShape, keyholePath, keyholeRimShape, sparkleShape } from './shapes'

const SHACKLE_R = 0.4
const SHACKLE_TUBE = 0.07

/** 깃털 배치: [길이, 폭, 각도(rad), 뒤쪽 z] — 위에서 아래로 짧아지는 세 겹 */
const FEATHERS: [number, number, number, number][] = [
  [0.86, 0.2, 0.42, 0],
  [0.72, 0.17, 0.12, -0.03],
  [0.56, 0.14, -0.18, -0.06],
]

/** 하트형 자물쇠: 핑크 펄 몸체 + 금테 + 크리스털 보석 + 무지갯빛 날개 + 금색 고리 */
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
    const heart = new THREE.ExtrudeGeometry(heartShape() as THREE.Shape, {
      depth: HEART_DEPTH,
      bevelEnabled: true,
      bevelThickness: HEART_BEVEL,
      bevelSize: 0.14,
      bevelSegments: 10,
      curveSegments: 64,
    })
    heart.translate(0, 0, -HEART_DEPTH / 2)
    const rim = new THREE.ExtrudeGeometry(heartRimShape(), {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: 4,
      curveSegments: 64,
    })
    const hole = new THREE.ShapeGeometry(keyholePath(1) as THREE.Shape, 24)
    const holeRim = new THREE.ExtrudeGeometry(keyholeRimShape(), {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 32,
    })
    const feathers = FEATHERS.map(([L, w]) => {
      const g = new THREE.ExtrudeGeometry(featherShape(L, w), {
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.012,
        bevelSegments: 2,
        curveSegments: 20,
      })
      g.translate(0, 0, -0.006)
      return g
    })
    const arc = new THREE.TorusGeometry(SHACKLE_R, SHACKLE_TUBE, 20, 48, Math.PI)
    const leg = new THREE.CylinderGeometry(SHACKLE_TUBE, SHACKLE_TUBE, 0.42, 20)
    const gem = gemGeometry(0.16, 8)
    const plate = new THREE.CylinderGeometry(0.21, 0.23, 0.03, 48)
    const twinkle = new THREE.ExtrudeGeometry(sparkleShape(0.06), { depth: 0.01, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2 })
    return { heart, rim, hole, holeRim, feathers, arc, leg, gem, plate, twinkle }
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

    // 구멍의 월드/화면 좌표
    tmp.copy(holeLocal)
    g.localToWorld(tmp)
    rig.holeWorld.copy(tmp)
    worldToScreen(tmp, state.camera, state.size.width, state.size.height, rig.holeScreen)

    // 구멍 테두리 발광: 가까워질수록 밝게, 꽂히는 순간 반짝
    if (rimMat.current) {
      const flash = inserting ? Math.max(0, 1 - Math.abs(e - T.PUSH_END) / 220) : 0
      const target = 0.15 + bridge.near * 2.8 + flash * 4 + (inserting && e > T.UNLOCK ? 1.5 : 0)
      rimMat.current.emissiveIntensity = THREE.MathUtils.damp(rimMat.current.emissiveIntensity, target, 14, dt)
    }
    // 보석: 은은하게 숨쉬고, 잠금 해제 시 밝아짐
    if (gemMat.current) {
      const unlock = inserting ? clamp01((e - T.UNLOCK + 120) / 260) : 0
      gemMat.current.emissiveIntensity = 0.35 + Math.sin(t * 2) * 0.12 + unlock * 4.5
    }

    // 잠금 고리: 위로 살짝 올라가며 한쪽 다리를 축으로 열림
    if (shacklePivot.current) {
      const k = inserting ? (e - T.SHACKLE_START) / (T.SHACKLE_END - T.SHACKLE_START) : 0
      shacklePivot.current.position.y = 0.66 + easeOutBack(clamp01(k)) * 0.16
      shacklePivot.current.rotation.y = -easeOutCubic(clamp01(k - 0.35)) * 0.55
    }

    // 날개: 작은 날갯짓, 잠금 해제 때 크게
    const open = inserting && e > T.UNLOCK
    const flap = Math.sin(t * (open ? 9 : 2.2)) * (open ? 0.4 : 0.12)
    if (wingL.current) wingL.current.rotation.y = 0.5 + flap
    if (wingR.current) wingR.current.rotation.y = -0.5 - flap
  }, -1)

  const wing = (
    <>
      {FEATHERS.map(([, , angle, z], i) => (
        <mesh key={i} geometry={geo.feathers[i]} rotation={[0, 0, angle]} position={[0, -i * 0.05, z]}>
          <meshPhysicalMaterial
            color="#fbeaff"
            transparent
            opacity={0.85}
            transmission={0.5}
            thickness={0.05}
            roughness={0.12}
            metalness={0.1}
            iridescence={1}
            iridescenceIOR={1.9}
            clearcoat={1}
            side={THREE.DoubleSide}
            emissive="#e7d4ff"
            emissiveIntensity={0.22}
            sheen={1}
            sheenColor="#c9e6ff"
          />
        </mesh>
      ))}
    </>
  )

  return (
    <group ref={group}>
      {/* 몸체: 핑크 펄 */}
      <mesh geometry={geo.heart}>
        <meshPhysicalMaterial
          color="#f8d3e6"
          metalness={0.2}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.06}
          iridescence={0.55}
          iridescenceIOR={1.4}
          sheen={0.6}
          sheenColor="#ffe9f4"
          envMapIntensity={1.05}
        />
      </mesh>
      {/* 앞면 가장자리 금테 */}
      <mesh geometry={geo.rim} position={[0, 0, LOCK_FRONT_Z - 0.012]}>
        <GoldMaterial />
      </mesh>

      {/* 금색 반짝이 장식 */}
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} geometry={geo.twinkle} position={[x, 0.3, LOCK_FRONT_Z - 0.005]}>
          <GoldMaterial />
        </mesh>
      ))}

      {/* 구멍 주변 금색 판 */}
      <mesh geometry={geo.plate} position={[KEYHOLE.x, KEYHOLE.y - 0.02, LOCK_FRONT_Z - 0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <GoldMaterial />
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
      <mesh geometry={geo.holeRim} position={[KEYHOLE.x, KEYHOLE.y, LOCK_FRONT_Z + 0.004]}>
        <meshStandardMaterial ref={rimMat} color="#f7e3b8" metalness={0.8} roughness={0.2} emissive="#d9b6ff" emissiveIntensity={0.15} toneMapped={false} />
      </mesh>

      {/* 크리스털 보석: 컷 면 + 굴절 + 무지갯빛 + 발광 */}
      <mesh geometry={geo.gem} position={[0, 0.34, LOCK_FRONT_Z - 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <CrystalMaterial ref={gemMat} />
      </mesh>
      <mesh position={[0, 0.34, LOCK_FRONT_Z - 0.06]}>
        <torusGeometry args={[0.172, 0.026, 12, 40]} />
        <GoldMaterial />
      </mesh>

      {/* 날개: 세 겹 깃털 */}
      <group ref={wingL} position={[-0.84, 0.3, -0.06]} scale={[-1, 1, 1]}>
        {wing}
      </group>
      <group ref={wingR} position={[0.84, 0.3, -0.06]}>
        {wing}
      </group>

      {/* 잠금 고리: 왼쪽 다리를 축으로 회전 */}
      <group ref={shacklePivot} position={[-SHACKLE_R, 0.66, 0]}>
        <group position={[SHACKLE_R, 0, 0]}>
          <mesh geometry={geo.arc} position={[0, 0.06, 0]}>
            <GoldMaterial />
          </mesh>
          <mesh geometry={geo.leg} position={[-SHACKLE_R, -0.15, 0]}>
            <GoldMaterial />
          </mesh>
          <mesh geometry={geo.leg} position={[SHACKLE_R, -0.15, 0]}>
            <GoldMaterial />
          </mesh>
        </group>
      </group>
    </group>
  )
}
