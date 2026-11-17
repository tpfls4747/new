import { Vector3, type Camera, type Object3D } from 'three'

/**
 * magic-portfolio-handoff.md의 스니펫을 바탕으로 한 앵커 유틸.
 * tip(열쇠 끝)과 slot(구멍) 앵커를 CSS 픽셀로 투영해 기기 해상도와 무관한 관용도를 줍니다.
 */
const _a = new Vector3()
const _b = new Vector3()
const _c = new Vector3()

/** tip과 slot 사이의 화면 거리 (CSS px) */
export function slotDistancePx(tip: Object3D, slot: Object3D, camera: Camera, canvas: HTMLCanvasElement) {
  const box = canvas.getBoundingClientRect()
  const a = tip.getWorldPosition(_a).project(camera)
  const b = slot.getWorldPosition(_b).project(camera)
  const dx = ((a.x - b.x) * box.width) / 2
  const dy = ((a.y - b.y) * box.height) / 2
  return Math.hypot(dx, dy)
}

export function isNearSlot(tip: Object3D, slot: Object3D, camera: Camera, canvas: HTMLCanvasElement, radius = 30) {
  return slotDistancePx(tip, slot, camera, canvas) <= radius
}

/** 열쇠 방향을 맞춘 상태에서, tip이 slot에 닿도록 하는 열쇠 위치 (key.parent 로컬) */
export function getSnapPosition(key: Object3D, tip: Object3D, slot: Object3D, out = new Vector3()) {
  out
    .copy(key.getWorldPosition(_a))
    .add(slot.getWorldPosition(_b))
    .sub(tip.getWorldPosition(_c))
  return key.parent ? key.parent.worldToLocal(out) : out
}
