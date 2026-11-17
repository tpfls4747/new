import * as THREE from 'three'

/** 3D 씬 내부에서 Lock/Key/StarBurst가 공유하는 프레임 상태 */
export interface Rig {
  valid: boolean
  /** 캔버스 기준 px */
  canvasRect: DOMRect | null
  lockWorld: THREE.Vector3
  lockScale: number
  lockPx: number
  lockQuat: THREE.Quaternion
  holeWorld: THREE.Vector3
  holeScreen: THREE.Vector2
  handleScreen: THREE.Vector2
  handleRestScreen: THREE.Vector2
  /** 앵커: 열쇠 끝, 자물쇠 구멍 */
  tip: THREE.Object3D | null
  slot: THREE.Object3D | null
}

export function createRig(): Rig {
  return {
    valid: false,
    canvasRect: null,
    lockWorld: new THREE.Vector3(),
    lockScale: 1,
    lockPx: 200,
    lockQuat: new THREE.Quaternion(),
    holeWorld: new THREE.Vector3(),
    holeScreen: new THREE.Vector2(),
    handleScreen: new THREE.Vector2(),
    handleRestScreen: new THREE.Vector2(),
    tip: null,
    slot: null,
  }
}

const _ndc = new THREE.Vector3()
const _dir = new THREE.Vector3()

/** 화면 px → z평면 위 월드 좌표 */
export function screenToWorld(px: number, py: number, z: number, camera: THREE.Camera, w: number, h: number, out = new THREE.Vector3()) {
  _ndc.set((px / w) * 2 - 1, -(py / h) * 2 + 1, 0.5).unproject(camera)
  _dir.copy(_ndc).sub(camera.position).normalize()
  const t = (z - camera.position.z) / _dir.z
  return out.copy(camera.position).addScaledVector(_dir, t)
}

/** 월드 좌표 → 화면 px */
export function worldToScreen(v: THREE.Vector3, camera: THREE.Camera, w: number, h: number, out = new THREE.Vector2()) {
  _ndc.copy(v).project(camera)
  return out.set(((_ndc.x + 1) / 2) * w, ((1 - _ndc.y) / 2) * h)
}

/** z평면에서 1px이 몇 월드 단위인지 */
export function unitsPerPx(camera: THREE.PerspectiveCamera, z: number, h: number) {
  const dist = camera.position.z - z
  return (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist) / h
}
