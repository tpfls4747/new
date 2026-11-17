/**
 * DOM(드래그 핸들, 버튼)과 3D 씬이 프레임마다 공유하는 가변 상태.
 * three.js를 가져오지 않아서 3D 청크가 로드되기 전에도 쓸 수 있습니다.
 */
export type Phase = 'idle' | 'dragging' | 'inserting' | 'ribbon'

export interface Bridge {
  phase: Phase
  /** 자물쇠 위치·크기를 정하는 DOM 앵커 */
  lockEl: HTMLElement | null
  /** 열쇠 손잡이(드래그 핸들) DOM 요소 */
  handleEl: HTMLElement | null
  pointerType: string
  /** 0..1 — 열쇠 끝이 구멍에 얼마나 가까운지 (테두리 발광) */
  near: number
  /** 지금 놓으면 꽂히는 거리인지 */
  inRange: boolean
  /** 꽂기 시작 시각 (performance.now), 0이면 아직 */
  insertStart: number
  unlockedFired: boolean
  onRangeChange: (inRange: boolean) => void
  onUnlocked: () => void
  onReady: () => void
  /** 확인용: ?slow=10 이면 성공 시퀀스를 10배 느리게 재생 */
  timeScale: number
}

/** 꽂기 시작 후 경과 시간(ms). 시작 전이면 -1 */
export function elapsed(b: Bridge) {
  return b.insertStart ? (performance.now() - b.insertStart) / b.timeScale : -1
}

export function createBridge(): Bridge {
  return {
    phase: 'idle',
    lockEl: null,
    handleEl: null,
    pointerType: 'mouse',
    near: 0,
    inRange: false,
    insertStart: 0,
    unlockedFired: false,
    onRangeChange: () => {},
    onUnlocked: () => {},
    onReady: () => {},
    timeScale: Math.max(1, Number(new URLSearchParams(window.location.search).get('slow')) || 1),
  }
}

/** 열쇠를 놓은 순간부터의 타임라인 (ms) */
export const T = {
  ALIGN_END: 120, // 자동 정렬: 열쇠 끝이 구멍 앞에 붙음
  PUSH_END: 220, // 삽입 100ms: 딸깍 맞물림 + 작은 별
  BURST: 190,
  TURN_END: 460, // 회전 240ms: 자기 축으로 90도
  SHACKLE_START: 380, // 회전 끝무렵 고리 열림
  SHACKLE_END: 580,
  UNLOCK: 420, // 잠금 해제 → 전환 시작
  RIBBON: 420, // 빛 리본 (다음 단계)
} as const

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)
export const easeInOutCubic = (t: number) => {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
export const easeOutBack = (t: number) => {
  const x = clamp01(t)
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
