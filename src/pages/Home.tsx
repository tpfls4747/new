import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useMatch } from 'react-router-dom'
import { Mascot } from '../components/Mascot'
import { MediaSlot } from '../components/MediaSlot'
import { WorksIndex } from '../components/WorksIndex'
import { SiteFooter, SiteHeader } from '../components/SiteHeader'
import { Txt } from '../components/Txt'
import { featuredProject, profile, projects } from '../data/projects'
import { IntroOverlay } from '../intro/IntroOverlay'
import { ProjectWindow } from './ProjectWindow'
import { useIntro } from '../state/intro'

export function Home() {
  const { entered, pageRef, consumeFocusRequest } = useIntro()
  const featuredHeading = useRef<HTMLHeadingElement>(null)
  const location = useLocation()
  const p = featuredProject
  const reduced = useReducedMotion()
  const match = useMatch('/projects/:slug')
  const openSlug = match?.params.slug

  useEffect(() => {
    if (!openSlug) document.title = `${profile.nameEn} — ${profile.title} 포트폴리오`
  }, [openSlug])

  // 인트로 중에는 본문 스크롤을 잠그고, 인트로 오버레이 안에서만 스크롤합니다.
  useLayoutEffect(() => {
    if (entered) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    window.scrollTo({ top: 0 })
    return () => {
      html.style.overflow = prev
    }
  }, [entered])

  // 입장 직후 대표 프로젝트로 포커스 이동
  useEffect(() => {
    if (entered && consumeFocusRequest()) {
      featuredHeading.current?.focus({ preventScroll: true })
    }
  }, [entered, consumeFocusRequest])

  // /#projects 같은 해시 링크 처리
  useEffect(() => {
    if (!entered || !location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }))
  }, [entered, location.hash, location.key])

  return (
    <>
      <div ref={pageRef} className="page" inert={!entered || !!openSlug}>
        <a href="#projects" className="skip-link">
          프로젝트 목록으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main">
          <section className="featured" aria-labelledby="featured-title">
            <div className="featured-copy">
              <p className="eyebrow">대표 프로젝트 · {p.titleEn}</p>
              <h2 id="featured-title" ref={featuredHeading} tabIndex={-1} className="featured-title">
                {p.title}
              </h2>
              <p className="featured-question">
                <Txt value={p.question} />
              </p>
              <dl className="featured-meta">
                <div>
                  <dt>내 역할</dt>
                  <dd>
                    <Txt value={p.role} />
                  </dd>
                </div>
              </dl>
              <p className="featured-summary">
                <Txt value={p.summary} />
              </p>
              <Link to={`/projects/${p.slug}`} state={{ from: 'featured' }} className="button button--primary">
                케이스 스터디 보기
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <motion.div layoutId={`featured-${p.slug}`} className="featured-media">
              <MediaSlot media={p.hero} priority />
            </motion.div>
          </section>

          <section id="projects" className="projects" aria-labelledby="projects-title">
            <div className="section-head">
              <h2 id="projects-title" className="section-title">
                Works
              </h2>
              <p className="section-sub">작업을 누르면 프로젝트 창이 열립니다</p>
            </div>
            <WorksIndex projects={projects} />
          </section>

          <section id="about" className="about" aria-labelledby="about-title">
            <h2 id="about-title" className="section-title">
              About
            </h2>
            <div className="about-body">
              <p className="about-name">
                {profile.nameKo} <span lang="en">{profile.nameEn}</span>
              </p>
              <p>
                <Txt value={profile.intro} />
              </p>
              <p className="about-contact">
                연락처 · <Txt value={profile.email} />
              </p>
            </div>
          </section>
        </main>
        <SiteFooter />
        <Mascot />
      </div>
      <AnimatePresence>{entered && openSlug && <ProjectWindow key="pw" slug={openSlug} />}</AnimatePresence>
      {/* 움직임 줄이기: 퇴장 애니메이션 없이 즉시 제거 (3D 렌더링도 바로 중단) */}
      {reduced ? !entered && <IntroOverlay key="intro" /> : <AnimatePresence>{!entered && <IntroOverlay key="intro" />}</AnimatePresence>}
    </>
  )
}
