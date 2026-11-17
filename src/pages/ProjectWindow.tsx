import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MediaSlot } from '../components/MediaSlot'
import { Txt } from '../components/Txt'
import { getProject, profile, projects, type Project } from '../data/projects'



/**
 * 프로젝트 창. /projects/:slug 에서 홈 위에 창처럼 열립니다.
 * 링크로 직접 들어와도 인트로 없이 바로 이 창이 열립니다.
 */
export function ProjectWindow({ slug }: { slug: string }) {
  const project = getProject(slug)
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const from = (location.state as { from?: string } | null)?.from

  const close = () => {
    // 사이트 안에서 열었으면 뒤로 가기(목록 스크롤 유지), 링크로 직접 들어왔으면 홈으로
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (from && idx > 0) navigate(-1)
    else navigate('/', { replace: true })
  }

  useEffect(() => {
    const prev = document.title
    document.title = project ? `${project.title} — ${profile.nameEn}` : `프로젝트를 찾을 수 없어요 — ${profile.nameEn}`
    const opener = document.activeElement as HTMLElement | null
    titleRef.current?.focus({ preventScroll: true })
    scrollRef.current?.scrollTo({ top: 0 })
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      document.title = prev
      html.style.overflow = prevOverflow
      opener?.focus?.({ preventScroll: true })
    }
  }, [project])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const layoutId = project ? (from === 'featured' ? `featured-${project.slug}` : `media-${project.slug}`) : undefined
  const idx = projects.findIndex((p) => p.slug === slug)
  const next = projects[(idx + 1) % projects.length]
  const prev = projects[(idx - 1 + projects.length) % projects.length]
  const cs = project?.caseStudy

  return (
    <motion.div
      className="pw-backdrop"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.2 } }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <motion.div
        className="pw"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pw-title"
        initial={reduced ? false : { y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { y: 30, opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <div className="window-bar pw-bar">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="window-name">{project ? `${project.titleEn} · ${project.year}` : 'Not found'}</span>
          <button type="button" className="pw-close" onClick={close} aria-label="프로젝트 창 닫기">
            ✕
          </button>
        </div>
        <div className="pw-scroll" ref={scrollRef}>
          {!project ? (
            <div className="detail not-found">
              <h1 id="pw-title" ref={titleRef} tabIndex={-1} className="detail-title">
                프로젝트를 찾을 수 없어요
              </h1>
              <Link to="/" className="button button--primary">
                홈으로
              </Link>
            </div>
          ) : (
      <main className="detail">
        <header className="detail-hero">
          <div className="detail-intro">
            <p className="detail-kicker">
              {project.year} <span aria-hidden="true">•</span> {project.category}
            </p>
            <h1 id="pw-title" ref={titleRef} tabIndex={-1} className="detail-title">
              {project.title}
            </h1>
            <p className="detail-summary">
              <Txt value={project.summary} />
            </p>
          </div>
          <div className="row">
            <p className="row-label">Overview</p>
            <p className="detail-question">
              <Txt value={project.question} />
            </p>
          </div>
          <motion.div layoutId={layoutId} className="detail-media">
            <MediaSlot media={project.hero} priority />
          </motion.div>
        </header>

        <div className="detail-layout">
          <div className="detail-sections">
            <Section label="Role" id="overview" title="프로젝트 개요와 역할">
              <dl className="meta-grid">
                <div>
                  <dt>내 역할</dt>
                  <dd>
                    <Txt value={project.role} />
                  </dd>
                </div>
                {project.meta.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd>
                      <Txt value={m.value} />
                    </dd>
                  </div>
                ))}
              </dl>
              {(cs?.overview ?? [project.summary]).map((c, i) => (
                <p key={i} className="prose">
                  <Txt value={c} />
                </p>
              ))}
            </Section>

            <Section label="Problem" id="problem" title="문제와 근거">
              {cs ? (
                <>
                  <p className="prose lead">
                    <Txt value={cs.problem.statement} />
                  </p>
                  <ul className="evidence">
                    {cs.problem.evidence.map((e) => (
                      <li key={e.title}>
                        <h4>{e.title}</h4>
                        <p>
                          <Txt value={e.body} />
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Pending what="문제 정의와 근거 자료" />
              )}
            </Section>

            <Section label="Options" id="alternatives" title="탐색한 대안">
              {cs ? (
                <>
                  <ul className="alternatives">
                    {cs.alternatives.map((a) => (
                      <li key={a.name} className={a.chosen ? 'alt alt--chosen' : 'alt'}>
                        <div className="alt-head">
                          <h4>{a.name}</h4>
                          {a.chosen && <span className="chip">선택</span>}
                        </div>
                        <p>
                          <Txt value={a.description} />
                        </p>
                        <div className="alt-pc">
                          <div>
                            <p className="alt-label">장점</p>
                            <ul>
                              {a.pros.map((x, i) => (
                                <li key={i}>
                                  <Txt value={x} />
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="alt-label">한계</p>
                            <ul>
                              {a.cons.map((x, i) => (
                                <li key={i}>
                                  <Txt value={x} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {cs.alternativesNote && (
                    <p className="prose note">
                      <Txt value={cs.alternativesNote} />
                    </p>
                  )}
                </>
              ) : (
                <Pending what="검토한 대안과 비교 기준" />
              )}
            </Section>

            <Section label="Flow" id="flow" title="핵심 사용자 흐름">
              {cs ? (
                <>
                  <ol className="flow">
                    {cs.flow.map((f, i) => (
                      <li key={f.step}>
                        <span className="flow-n" aria-hidden="true">
                          {i + 1}
                        </span>
                        <div>
                          <h4>{f.step}</h4>
                          <p>
                            <Txt value={f.detail} />
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {cs.flowMedia && <MediaSlot media={cs.flowMedia} className="flow-media" />}
                </>
              ) : (
                <Pending what="핵심 사용자 흐름도" />
              )}
            </Section>

            <Section label="Final UI" id="final-ui" title="최종 UI">
              {cs ? (
                <ul className="screens">
                  {cs.finalUI.map((s, i) => (
                    <li key={i}>
                      <MediaSlot media={s.media} />
                      <p className="screen-caption">
                        <Txt value={s.caption} />
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <Pending what="최종 화면 이미지" />
              )}
            </Section>

            <Section label="Validation" id="validation" title={cs?.validation.kind === 'result' ? '검증 결과' : '다음 검증 계획'}>
              {cs ? (
                <ul className="evidence">
                  {cs.validation.items.map((v) => (
                    <li key={v.title}>
                      <h4>{v.title}</h4>
                      <p>
                        <Txt value={v.body} />
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <Pending what="검증 결과 또는 검증 계획" />
              )}
            </Section>
          </div>
        </div>

      </main>
          )}
        </div>
        {project && <PillNav prev={prev} next={next} onHome={close} />}
      </motion.div>
    </motion.div>
  )
}

function Section({ label, id, title, children }: { label: string; id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="cs-section row" aria-labelledby={`${id}-title`}>
      <p className="row-label" aria-hidden="true">
        {label}
      </p>
      <div className="row-body">
        <h2 id={`${id}-title`} className="cs-title">
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}

function Pending({ what }: { what: string }) {
  return (
    <p className="pending">
      <span className="todo-badge">자료 준비 중</span> {what}을(를) <code>src/data/projects.ts</code>의 caseStudy에 추가하면 이 자리에 표시됩니다.
    </p>
  )
}

/** 창 아래에 떠 있는 이전 · 홈 · 다음 이동 바 */
function PillNav({ prev, next, onHome }: { prev: Project; next: Project; onHome: () => void }) {
  return (
    <nav className="pill-nav" aria-label="프로젝트 이동">
      <Link to={`/projects/${prev.slug}`} state={{ from: 'index' }} replace className="pill">
        <small>‹ 이전</small>
        <span>{prev.titleEn}</span>
      </Link>
      <button type="button" className="pill pill--home" onClick={onHome} aria-label="목록으로 돌아가기">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />
        </svg>
      </button>
      <Link to={`/projects/${next.slug}`} state={{ from: 'index' }} replace className="pill">
        <small>다음 ›</small>
        <span>{next.titleEn}</span>
      </Link>
    </nav>
  )
}
