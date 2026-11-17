import { useDrag } from '@use-gesture/react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { profile } from '../data/projects'
import { useIntro } from '../state/intro'
import { T, createBridge, type Phase } from './bridge'
import { KeySketch, LockSketch } from './Sketches'
import { canUseWebGL } from './webgl'

const IntroScene = lazy(() => import('./IntroScene'))

const HINTS: Record<Phase | 'near', string> = {
  idle: '열쇠를 자물쇠에 끌어다 놓으세요',
  dragging: '열쇠 끝을 구멍 가까이 가져가세요',
  near: '지금 놓으세요',
  inserting: '딸깍—',
  ribbon: '열렸어요',
}

/**
 * 첫 화면. 드래그 입력은 열쇠 위의 DOM 핸들에서만 받고(touch-action: none),
 * 나머지 영역은 일반 스크롤을 유지합니다. 3D는 핸들과 자물쇠 앵커의 위치를 따라 그립니다.
 */
export function IntroOverlay() {
  const { enter } = useIntro()
  const reduced = useReducedMotion() ?? false
  const bridge = useMemo(createBridge, [])
  const webgl = useMemo(canUseWebGL, [])
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [near, setNear] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const cancelDrag = useRef<(() => void) | null>(null)
  const timers = useRef<number[]>([])
  const show3D = webgl && !failed

  const setBoth = useCallback(
    (p: Phase) => {
      bridge.phase = p
      setPhase(p)
    },
    [bridge],
  )

  const finish = useCallback(() => enter(), [enter])

  const springBack = useCallback(() => {
    bridge.inRange = false
    bridge.near = 0
    setNear(false)
    setBoth('idle')
    if (reduced) {
      x.set(0)
      y.set(0)
      return
    }
    // 드래그 직후 같은 프레임에서 시작하면 측정 속도가 비정상일 수 있어 초기 속도를 0으로 고정
    const spring = { type: 'spring', stiffness: 380, damping: 22, mass: 0.9, velocity: 0 } as const
    x.stop()
    y.stop()
    animate(x, 0, spring)
    animate(y, 0, spring)
  }, [bridge, reduced, setBoth, x, y])

  const beginInsert = useCallback(() => {
    if (bridge.phase === 'inserting' || bridge.phase === 'ribbon') return // 중복 실행 방지
    setNear(false)
    if (reduced) {
      finish()
      return
    }
    bridge.unlockedFired = false
    bridge.onUnlocked = () => {
      setBoth('ribbon')
      // 다음 단계에서 빛 리본으로 교체. 지금은 고리가 열린 뒤 본문으로 전환.
      timers.current.push(window.setTimeout(finish, (T.SHACKLE_END - T.UNLOCK + 120) * bridge.timeScale))
    }
    bridge.insertStart = performance.now()
    setBoth('inserting')
  }, [bridge, finish, reduced, setBoth])

  useEffect(() => {
    bridge.onRangeChange = (v) => setNear(v)
    bridge.onReady = () => setReady(true)
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [bridge])

  const canDrag = show3D && ready && (phase === 'idle' || phase === 'dragging')

  const bind = useDrag(
    ({ first, last, offset: [ox, oy], canceled, event, cancel }) => {
      if (first) {
        if (bridge.phase !== 'idle') return cancel()
        x.stop()
        y.stop()
        bridge.pointerType = (event as PointerEvent).pointerType || 'mouse'
        cancelDrag.current = cancel
        setBoth('dragging')
      }
      if (bridge.phase !== 'dragging') return
      x.set(ox)
      y.set(oy)
      if (last) {
        cancelDrag.current = null
        // 놓는 순간의 앵커 거리로 다시 판정 (Key.tsx가 매 프레임 갱신)
        if (!canceled && bridge.inRange) beginInsert()
        else springBack()
      }
    },
    {
      enabled: canDrag,
      // offset이 현재 위치에서 이어지므로 잡는 순간 열쇠가 튀지 않음
      from: () => [x.get(), y.get()],
      pointer: { capture: true, keys: false },
      filterTaps: false,
    },
  )

  // pointercancel / 캡처 유실 / Esc: 드래그 중일 때만 복귀
  const handleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = handleRef.current
    if (!el) return
    const abort = () => {
      if (bridge.phase !== 'dragging') return
      cancelDrag.current?.()
      cancelDrag.current = null
      springBack()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && abort()
    el.addEventListener('pointercancel', abort)
    el.addEventListener('lostpointercapture', abort)
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('pointercancel', abort)
      el.removeEventListener('lostpointercapture', abort)
      window.removeEventListener('keydown', onKey)
    }
  }, [bridge, springBack])

  const hint = !show3D
    ? '이 환경에서는 3D 인트로를 표시할 수 없어요. 아래 버튼으로 바로 볼 수 있어요.'
    : !ready
      ? '자물쇠를 준비하고 있어요…'
      : near && phase === 'dragging'
        ? HINTS.near
        : HINTS[phase]

  return (
    <motion.div
      className="intro"
      data-phase={phase}
      data-near={near || undefined}
      initial={false}
      exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.35 } }}
      aria-label="인트로"
      role="region"
    >
      <div className="intro-inner">
        {show3D && (
          <SceneBoundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <IntroScene bridge={bridge} />
            </Suspense>
          </SceneBoundary>
        )}

        <header className="intro-head">
          <p className="eyebrow">Portfolio · 2026</p>
          <h1 className="intro-name">
            <span lang="en">{profile.nameEn}</span>
            <span className="intro-name-ko">{profile.nameKo}</span>
          </h1>
          <p className="intro-role" lang="en">
            {profile.title}
          </p>
        </header>

        <div className="intro-stage">
          <div
            className="lock-anchor"
            ref={(el) => {
              bridge.lockEl = el
            }}
          >
            {(!show3D || !ready) && <LockSketch />}
          </div>
          <div className="key-rest">
            <motion.div
              {...(bind() as Record<string, unknown>)}
              ref={(el: HTMLDivElement | null) => {
                handleRef.current = el
                bridge.handleEl = el
              }}
              className="key-handle"
              style={{ x, y }}
              role="button"
              tabIndex={canDrag ? 0 : -1}
              aria-hidden={!show3D}
              aria-disabled={!canDrag}
              aria-label="은빛 열쇠. 끌어서 자물쇠에 놓거나 Enter 키로 꽂을 수 있어요"
              onKeyDown={(e) => {
                if (!canDrag) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  beginInsert()
                }
              }}
            >
              {(!show3D || !ready) && <KeySketch />}
            </motion.div>
          </div>
        </div>

        <div className="intro-foot">
          <p className="intro-hint" aria-live="polite">
            {near && phase === 'dragging' && <span aria-hidden="true">✦ </span>}
            {hint}
          </p>
          <button type="button" className="button button--primary intro-skip" onClick={finish}>
            프로젝트 바로 보기 <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
