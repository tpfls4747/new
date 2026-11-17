import { SHOW_CONTENT_MARKERS, type Copy } from '../data/projects'

/** draft / todo 표기를 처리하는 텍스트 렌더러 */
export function Txt({ value }: { value: Copy }) {
  if (typeof value === 'string') return <>{value}</>
  if ('todo' in value) {
    return (
      <span className="todo" title="자료를 넣어야 하는 자리">
        <span className="todo-badge" aria-hidden="true">작성 필요</span>
        <span className="visually-hidden">작성 필요: </span>
        {value.todo}
      </span>
    )
  }
  return (
    <>
      {value.draft}
      {SHOW_CONTENT_MARKERS && (
        <span className="draft-badge" title="초안 — 실제 내용으로 교체">
          초안
        </span>
      )}
    </>
  )
}

export const isMissing = (value: Copy) => typeof value !== 'string' && 'todo' in value
