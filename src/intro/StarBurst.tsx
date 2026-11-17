import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { T, clamp01, easeOutCubic, type Bridge, elapsed } from './bridge'
import type { Rig } from './sceneRig'
import { sparkleShape } from './shapes'

const COUNT = 9

/** 열쇠가 꽂히는 순간 짧게 튀는 작은 별 (발광 없이 밝은 색만) */
export function StarBurst({ bridge, rig }: { bridge: Bridge; rig: Rig }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const geo = useMemo(() => new THREE.ShapeGeometry(sparkleShape(1), 6), [])
  const dirs = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const a = (i / COUNT) * Math.PI * 2 + (i % 2) * 0.3
        const r = 0.7 + ((i * 37) % 10) / 20
        return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.2)
      }),
    [],
  )
  useFrame(() => {
    const e = elapsed(bridge)
    const k = (e - T.BURST) / 460
    refs.current.forEach((m, i) => {
      if (!m) return
      const on = e >= T.BURST && k <= 1
      m.visible = on
      if (!on) return
      const p = easeOutCubic(k)
      m.position.copy(rig.holeWorld).addScaledVector(dirs[i], p * 0.55 * rig.lockScale)
      m.position.z += 0.25 * rig.lockScale
      const sc = Math.sin(clamp01(k) * Math.PI) * (i % 3 === 0 ? 0.075 : 0.05) * rig.lockScale
      m.scale.setScalar(Math.max(sc, 0.0001))
      m.rotation.z = k * 2 + i
    })
  })
  return (
    <group>
      {dirs.map((_, i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)} geometry={geo} visible={false}>
          <meshBasicMaterial color={i % 2 ? '#f6f0ff' : '#ffe6f3'} transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
