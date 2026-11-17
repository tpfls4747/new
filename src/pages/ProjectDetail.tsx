import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { MediaSlot } from '../components/MediaSlot'
import { SiteFooter, SiteHeader } from '../components/SiteHeader'
import { Txt } from '../components/Txt'
import { getProject, profile, projects, type Project } from '../data/projects'

const SECTIONS = [
  { id: 'overview', label: '개요와 역할' },
  { id: 'problem', label: '문제와 근거' },
  { id: 'alternatives', label: '탐색한 대안' },
  { id: 'flow', label: '핵심 사용자 흐름' },
  { id: 'final-ui', label: '최종 UI' },
  { id: 'validation', label: '검증' },
] as const

export function ProjectDetail() {
  const { slug } = useParams()
  const project = getProject(slug)
  const location = useLocation()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const from = (location.state as { from?: string } | null)?.from

  useLayoutEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  useEffect(() => {
    document.title = project ? `${project.title} — ${profile.nameEn}` : `프로젝트를 찾을 수 없어요 — ${profile.nameEn}`
    titleRef.current?.focus({ preventScroll: true })
  }, [project])

  if (!project) return <NotFound />

  const cs = project.caseStudy
  // 홈의 어느 이미지에서 왔는지에 따라 같은 layoutId로 이어지게 합니다.
  const layoutId = from === 'featured' ? `featured-${project.slug}` : `media-${project.slug}`
  const idx = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(idx + 1) % projects.length]

  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="detail">
        <header className="detail-hero">
          <Link to={{ pathname: '/', hash: '#projects' }} className="back-link">
            ← 모든 프로젝트
          </Link>
          <p className="eyebrow">Case study · {project.titleEn}</p>
          <h1 ref={titleRef} tabIndex={-1} className="detail-title">
            {project.title}
          </h1>
          <p className="detail-question">
            <Txt value={project.question} />
          </p>
          <motion.div layoutId={layoutId} className="detail-media">
            <MediaSlot media={project.hero} priority />
          </motion.div>
        </header>

        <div className="detail-layout">
          <nav className="toc" aria-label="케이스 스터디 목차">
            <ol>
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span> {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="detail-sections">
            <Section n={1} id="overview" title="프로젝트 개요와 역할">
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

            <Section n={2} id="problem" title="문제와 근거">
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

            <Section n={3} id="alternatives" title="탐색한 대안">
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

            <Section n={4} id="flow" title="핵심 사용자 흐름">
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

            <Section n={5} id="final-ui" title="최종 UI">
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

            <Section n={6} id="validation" title={cs?.validation.kind === 'result' ? '검증 결과' : '다음 검증 계획'}>
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

        {next.slug !== project.slug && <NextProject project={next} />}
      </main>
      <SiteFooter />
    </div>
  )
}

function Section({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="cs-section" aria-labelledby={`${id}-title`}>
      <p className="cs-n" aria-hidden="true">
        {String(n).padStart(2, '0')}
      </p>
      <h2 id={`${id}-title`} className="cs-title">
        {title}
      </h2>
      {children}
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

function NextProject({ project }: { project: Project }) {
  return (
    <aside className="next-project" aria-label="다음 프로젝트">
      <p className="eyebrow">다음 프로젝트</p>
      <Link to={`/projects/${project.slug}`} state={{ from: 'card' }} className="next-link">
        {project.title} <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}

function NotFound() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="detail not-found">
        <h1 className="detail-title" tabIndex={-1}>
          프로젝트를 찾을 수 없어요
        </h1>
        <Link to="/" className="button button--primary">
          홈으로
        </Link>
      </main>
    </div>
  )
}
