/** WebGL 사용 가능 여부. ?webgl=0 으로 미지원 상황을 테스트할 수 있습니다. */
export function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).get('webgl') === '0') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    return !!gl
  } catch {
    return false
  }
}
