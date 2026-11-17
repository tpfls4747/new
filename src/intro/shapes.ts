import * as THREE from 'three'

/**
 * 첫 버전 오브젝트는 기본 지오메트리 + Shape 압출 + 베벨로 만듭니다.
 * GLB로 교체할 때는 Lock.tsx / Key.tsx의 <LockModel>, <KeyModel> 부분만 바꾸면 되고,
 * 구멍 위치(KEYHOLE), 열쇠 끝 위치(KEY_TIP)만 모델에 맞춰 조정하면 됩니다.
 */

/** 자물쇠 로컬 좌표에서 열쇠 구멍 중심 */
export const HEART_DEPTH = 0.34
export const HEART_BEVEL = 0.2
export const LOCK_FRONT_Z = HEART_DEPTH / 2 + HEART_BEVEL
export const KEYHOLE = new THREE.Vector3(0, -0.14, LOCK_FRONT_Z)
/** 열쇠 로컬 좌표에서 손잡이(원점) → 끝까지의 거리 (+X 방향) */
export const KEY_TIP_X = 1.55

export function heartShape() {
  const s = new THREE.Shape()
  // 둥근 하트: 아래 끝을 뾰족하지 않게 다듬은 실루엣
  s.moveTo(0, -0.78)
  s.bezierCurveTo(-0.18, -0.7, -0.92, -0.26, -0.92, 0.22)
  s.bezierCurveTo(-0.92, 0.6, -0.66, 0.84, -0.44, 0.84)
  s.bezierCurveTo(-0.2, 0.84, -0.06, 0.7, 0, 0.56)
  s.bezierCurveTo(0.06, 0.7, 0.2, 0.84, 0.44, 0.84)
  s.bezierCurveTo(0.66, 0.84, 0.92, 0.6, 0.92, 0.22)
  s.bezierCurveTo(0.92, -0.26, 0.18, -0.7, 0, -0.78)
  return s
}

/** 열쇠 구멍 실루엣 (원 + 아래로 넓어지는 사다리꼴) */
export function keyholePath(scale = 1, target: THREE.Path = new THREE.Shape()) {
  const r = 0.1 * scale
  const cy = 0.04 * scale
  const topHalf = 0.045 * scale
  const botHalf = 0.072 * scale
  const botY = -0.2 * scale
  const a = Math.asin(topHalf / r) // 원과 사다리꼴이 만나는 지점
  const start = -Math.PI / 2 - a
  const end = -Math.PI / 2 + a
  target.moveTo(-topHalf, cy - Math.cos(a) * r)
  target.lineTo(-botHalf, botY)
  target.lineTo(botHalf, botY)
  target.lineTo(topHalf, cy - Math.cos(a) * r)
  // 오른쪽 아래에서 원 위쪽을 돌아 왼쪽 아래로 (반시계)
  target.absarc(0, cy, r, end, start + Math.PI * 2, false)
  return target
}

/** 구멍 테두리: 바깥 실루엣에 구멍 모양 hole */
export function keyholeRimShape() {
  const outer = keyholePath(1.42) as THREE.Shape
  const hole = keyholePath(1.0, new THREE.Path())
  outer.holes.push(hole)
  return outer
}

export function starShape(points = 5, outer = 0.34, inner = 0.17, rotation = Math.PI / 2) {
  const s = new THREE.Shape()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = rotation + (i / (points * 2)) * Math.PI * 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

/** 4갈래 반짝임 */
export function sparkleShape(size = 1) {
  const s = new THREE.Shape()
  const k = 0.18 * size
  s.moveTo(0, size)
  s.quadraticCurveTo(k, k, size, 0)
  s.quadraticCurveTo(k, -k, 0, -size)
  s.quadraticCurveTo(-k, -k, -size, 0)
  s.quadraticCurveTo(-k, k, 0, size)
  return s
}

/** 작은 날개: 뿌리(0,0)에서 바깥으로, 아래쪽은 깃털 세 개로 물결 */
export function wingShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 0.02)
  s.bezierCurveTo(0.12, 0.28, 0.42, 0.42, 0.7, 0.38)
  s.bezierCurveTo(0.66, 0.3, 0.6, 0.24, 0.56, 0.2)
  s.quadraticCurveTo(0.6, 0.08, 0.5, 0.04)
  s.quadraticCurveTo(0.44, 0.1, 0.38, 0.06)
  s.quadraticCurveTo(0.36, -0.06, 0.24, -0.06)
  s.quadraticCurveTo(0.2, 0.0, 0.14, -0.02)
  s.quadraticCurveTo(0.08, -0.12, 0, -0.06)
  s.closePath()
  return s
}

/** 컷이 들어간 보석 (라운드 브릴리언트 느낌의 로우폴리 회전체) */
export function gemGeometry(radius = 0.16, segments = 8) {
  const pts = [
    new THREE.Vector2(0.0001, -radius * 0.95), // 큘릿
    new THREE.Vector2(radius, -radius * 0.05), // 거들
    new THREE.Vector2(radius, radius * 0.05),
    new THREE.Vector2(radius * 0.62, radius * 0.42), // 크라운
    new THREE.Vector2(0.0001, radius * 0.42), // 테이블
  ]
  const g = new THREE.LatheGeometry(pts, segments)
  const ng = g.toNonIndexed()
  ng.computeVertexNormals()
  g.dispose()
  return ng
}
