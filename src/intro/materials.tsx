import type { Ref } from 'react'
import type * as THREE from 'three'

/** 부드러운 반사광의 샴페인 골드 */
export function GoldMaterial() {
  return <meshPhysicalMaterial color="#efc98a" metalness={1} roughness={0.2} clearcoat={0.5} clearcoatRoughness={0.1} envMapIntensity={1.25} />
}

/** 컷 면이 보이는 무지갯빛 크리스털. emissive를 올리면 Bloom으로 빛남 */
export function CrystalMaterial({ ref, tint = '#f1e8ff', glow = '#c8a8ff' }: { ref?: Ref<THREE.MeshPhysicalMaterial>; tint?: string; glow?: string }) {
  return (
    <meshPhysicalMaterial
      ref={ref}
      color={tint}
      flatShading
      transmission={0.9}
      thickness={0.4}
      ior={2.3}
      roughness={0.03}
      metalness={0}
      iridescence={1}
      iridescenceIOR={1.7}
      clearcoat={1}
      emissive={glow}
      emissiveIntensity={0.35}
      envMapIntensity={1.8}
      toneMapped={false}
    />
  )
}
