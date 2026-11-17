import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getSnapPosition, slotDistancePx } from './anchors'
import { T, clamp01, easeInOutCubic, easeOutCubic, type Bridge, elapsed } from './bridge'
import type { Rig } from './sceneRig'
import { screenToWorld } from './sceneRig'
import { KEY_TIP_X, gemGeometry, starShape } from './shapes'

const X = new THREE.Vector3(1, 0, 0)
const Y = new THREE.Vector3(0, 1, 0)
const Z = new THREE.Vector3(0, 0, 1)
/** 자물쇠 로컬 기준, 열쇠가 구멍으로 들어가는 방향 (손잡이는 왼쪽 아래 앞쪽) */
const INSERT_DIR_LOCAL = new THREE.Vector3(0.42, 0.3, -1).normalize()

/**
 * 은빛(살짝 핑크) 열쇠. 원점 = 별 손잡이 중심 = 회전 피벗(열쇠 축 위), 끝은 +X 방향.
 * 대기·드래그: DOM 드래그 핸들을 따라가며 끝이 구멍을 향함.
 * 성공 시: 자동 정렬(120ms) → 삽입(100ms) → 자기 축 90도 회전(240ms).
 */
export function Key({ bridge, rig }: { bridge: Bridge; rig: Rig }) {
  const group = useRef<THREE.Group>(null)
  const canvas = useThree((s) => s.gl.domElement)
  const s = useMemo(
    () => ({
      q: new THREE.Quaternion(),
      qa: new THREE.Quaternion(),
      qb: new THREE.Quaternion(),
      qStart: new THREE.Quaternion(),
      startPos: new THREE.Vector3(),
      startQuat: new THREE.Quaternion(),
      snap: new THREE.Vector3(),
      pre: new THREE.Vector3(),
      inside: new THREE.Vector3(),
      captured: false,
      rollStart: 0,
      d: new THREE.Vector3(),
      n: new THREE.Vector3(),
      want: new THREE.Vector3(),
      v: new THREE.Vector3(),
    }),
    [],
  )

  const geo = useMemo(() => {
    const star = new THREE.ExtrudeGeometry(starShape(5, 0.36, 0.2, Math.PI), {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.05,
      bevelSegments: 5,
    })
    star.translate(0, 0, -0.03)
    return {
      star,
      gem: gemGeometry(0.105, 8),
      shaft: new THREE.CylinderGeometry(0.045, 0.045, 1.24, 20),
      collar: new THREE.TorusGeometry(0.065, 0.028, 12, 28),
      tooth: new THREE.BoxGeometry(0.2, 0.17, 0.055),
      tooth2: new THREE.BoxGeometry(0.09, 0.1, 0.055),
      cap: new THREE.SphereGeometry(0.046, 16, 12),
    }
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g || !rig.valid || !rig.tip || !rig.slot) return
    const { camera, size } = state
    const t = state.clock.elapsedTime
    const keyScale = rig.lockScale * 0.9
    g.scale.setScalar(keyScale)
    const e = elapsed(bridge)

    if (e < 0) {
      s.captured = false
      // ── 대기·드래그: 카메라와 평행한 평면(z) 위에서 DOM 핸들 위치를 따라감
      const z = rig.lockScale * 0.85
      screenToWorld(rig.handleScreen.x, rig.handleScreen.y, z, camera, size.width, size.height, g.position)
      const dragging = bridge.phase === 'dragging'
      if (!dragging) g.position.y += Math.sin(t * 1.6 + 1) * 0.025 * rig.lockScale
      // 시작부터 삽입 방향(구멍 쪽)을 향하게
      const dx = rig.holeScreen.x - rig.handleScreen.x
      const dy = rig.holeScreen.y - rig.handleScreen.y
      s.qa.setFromAxisAngle(Z, Math.atan2(-dy, dx))
      s.qb.setFromAxisAngle(Y, dragging ? 0.42 : 0.28 + Math.sin(t * 0.9) * 0.06)
      s.q.copy(s.qa).multiply(s.qb)
      g.quaternion.slerp(s.q, 1 - Math.exp(-(dragging ? 16 : 8) * dt))
      g.updateMatrixWorld()

      // ── 판정: 열쇠 끝(tip) 앵커와 구멍(slot) 앵커의 CSS px 거리
      const dist = slotDistancePx(rig.tip, rig.slot, camera, canvas)
      // 첫 시안 30px 기준 + 자물쇠가 크면 비례해서 넓힘, 손가락은 조금 더 넉넉하게
      const R = Math.max(bridge.pointerType === 'touch' ? 36 : 30, rig.lockPx * 0.12)
      const inRange = dragging && dist <= R
      bridge.near = dragging ? clamp01(1 - (dist - R) / (R * 1.8)) : 0
      if (inRange !== bridge.inRange) {
        bridge.inRange = inRange
        bridge.onRangeChange(inRange)
      }
      return
    }

    // ── 성공 시퀀스
    // 구멍 안쪽 방향 d (자물쇠 회전을 반영한 월드 방향)
    s.d.copy(INSERT_DIR_LOCAL).applyQuaternion(rig.lockQuat).normalize()
    if (!s.captured) {
      s.startPos.copy(g.position)
      s.startQuat.copy(g.quaternion)
      // 축(X)을 d에 맞추고, 손잡이 면이 카메라를 향하도록 d 기준 roll을 계산
      s.qa.setFromUnitVectors(X, s.d)
      s.n.copy(Z).applyQuaternion(s.qa)
      s.want.copy(Z).addScaledVector(s.d, -Z.dot(s.d)).normalize()
      const rollFace = Math.atan2(s.v.copy(s.n).cross(s.want).dot(s.d), s.n.dot(s.want))
      s.rollStart = rollFace - Math.PI / 4
      s.captured = true
    }
    s.qa.setFromUnitVectors(X, s.d)
    s.qStart.setFromAxisAngle(s.d, s.rollStart).multiply(s.qa)

    // 정렬된 방향에서 tip이 slot에 닿는 위치 (handoff: getSnapPosition)
    const savedPos = s.v.copy(g.position)
    const savedQuat = s.q.copy(g.quaternion)
    g.quaternion.copy(s.qStart)
    g.updateMatrixWorld()
    getSnapPosition(g, rig.tip, rig.slot, s.snap)
    g.position.copy(savedPos)
    g.quaternion.copy(savedQuat)

    const unit = rig.lockScale
    s.pre.copy(s.snap).addScaledVector(s.d, -0.06 * unit) // 구멍 바로 앞
    s.inside.copy(s.snap).addScaledVector(s.d, 0.24 * unit) // 살짝 들어감

    if (e < T.ALIGN_END) {
      // 1) 자동 정렬
      const p = easeOutCubic(e / T.ALIGN_END)
      g.position.lerpVectors(s.startPos, s.pre, p)
      g.quaternion.slerpQuaternions(s.startQuat, s.qStart, p)
    } else if (e < T.PUSH_END) {
      // 2) 삽입 (자물쇠 안쪽 방향)
      const p = easeOutCubic((e - T.ALIGN_END) / (T.PUSH_END - T.ALIGN_END))
      g.position.lerpVectors(s.pre, s.inside, p)
      g.quaternion.copy(s.qStart)
    } else {
      // 3) 열쇠의 로컬 축(= d)을 중심으로 90도 회전. 피벗은 축 위의 원점.
      const p = easeInOutCubic((e - T.PUSH_END) / (T.TURN_END - T.PUSH_END))
      g.position.copy(s.inside)
      s.qb.setFromAxisAngle(s.d, s.rollStart + (Math.PI / 2) * p).multiply(s.qa)
      g.quaternion.copy(s.qb)
    }

    if (e >= T.UNLOCK && !bridge.unlockedFired) {
      bridge.unlockedFired = true
      bridge.onUnlocked()
    }
  })

  return (
    <group ref={group}>
      <KeyModel geo={geo} />
      {/* tip 앵커: 판정과 정렬의 기준점 */}
      <object3D
        ref={(o: THREE.Object3D | null) => {
          rig.tip = o
        }}
        position={[KEY_TIP_X, 0, 0]}
      />
    </group>
  )
}

/** GLB 모델로 교체할 때는 이 컴포넌트를 바꾸고 tip 앵커 위치(KEY_TIP_X)만 맞추면 됩니다. */
function KeyModel({ geo }: { geo: Record<string, THREE.BufferGeometry> }) {
  const metal = (
    <meshPhysicalMaterial
      color="#f2dfe6"
      metalness={1}
      roughness={0.17}
      clearcoat={0.6}
      clearcoatRoughness={0.1}
      envMapIntensity={1.35}
      sheen={0.4}
      sheenColor="#ffd4e6"
    />
  )
  return (
    <group>
      {/* 별 손잡이 */}
      <mesh geometry={geo.star}>{metal}</mesh>
      {/* 손잡이 가운데 핑크 보석 */}
      <mesh geometry={geo.gem} position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          color="#ffc6e4"
          flatShading
          transmission={0.8}
          thickness={0.25}
          ior={2.0}
          roughness={0.04}
          emissive="#ff8fca"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh geometry={geo.collar} position={[0.38, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {metal}
      </mesh>
      <mesh geometry={geo.shaft} position={[0.33 + 0.62, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        {metal}
      </mesh>
      <mesh geometry={geo.cap} position={[KEY_TIP_X - 0.02, 0, 0]}>
        {metal}
      </mesh>
      {/* 톱니 */}
      <mesh geometry={geo.tooth} position={[1.34, -0.1, 0]}>
        {metal}
      </mesh>
      <mesh geometry={geo.tooth2} position={[1.12, -0.07, 0]}>
        {metal}
      </mesh>
    </group>
  )
}
