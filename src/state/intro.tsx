import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'

interface IntroState {
  /** 인트로를 지나 포트폴리오 본문에 들어온 상태 */
  entered: boolean
  enter: () => void
  replay: () => void
  /** 리본이 본문을 드러낼 때 clip-path를 적용하는 대상 */
  pageRef: RefObject<HTMLDivElement | null>
  /** 입장 직후 포커스를 옮겨야 하는지 */
  consumeFocusRequest: () => boolean
}

const IntroContext = createContext<IntroState | null>(null)

export function IntroProvider({ children }: { children: ReactNode }) {
  // 상세 URL로 직접 들어오면 인트로를 건너뜁니다.
  const [entered, setEntered] = useState(() => {
    if (import.meta.env.VITE_EMBED) return false
    const path = window.location.pathname.replace(import.meta.env.BASE_URL, '/')
    return path !== '/' && path !== ''
  })
  const pageRef = useRef<HTMLDivElement | null>(null)
  const focusRequest = useRef(false)

  const enter = useCallback(() => {
    focusRequest.current = true
    setEntered(true)
  }, [])
  const replay = useCallback(() => {
    window.scrollTo({ top: 0 })
    setEntered(false)
  }, [])
  const consumeFocusRequest = useCallback(() => {
    const v = focusRequest.current
    focusRequest.current = false
    return v
  }, [])

  const value = useMemo(
    () => ({ entered, enter, replay, pageRef, consumeFocusRequest }),
    [entered, enter, replay, consumeFocusRequest],
  )
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export function useIntro() {
  const ctx = useContext(IntroContext)
  if (!ctx) throw new Error('useIntro must be used inside IntroProvider')
  return ctx
}
