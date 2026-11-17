import { motion } from 'motion/react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { MediaSlot } from './MediaSlot'
import { Txt } from './Txt'

/**
 * 연도별 타임라인. 왼쪽에 연도, 세로 선 위의 점, 오른쪽에 작업명·설명·미리보기.
 * 미리보기를 누르면 프로젝트 창(/projects/:slug)이 열립니다.
 */
export function WorksIndex({ projects }: { projects: Project[] }) {
  const years = useMemo(() => {
    const map = new Map<number, Project[]>()
    ;[...projects].sort((a, b) => b.year - a.year).forEach((p) => map.set(p.year, [...(map.get(p.year) ?? []), p]))
    return [...map.entries()]
  }, [projects])
  const latest = years[0]?.[1][0]?.slug

  return (
    <div className="tl">
      <div className="tl-start" aria-hidden="true">
        <span className="tl-start-label">Magic plan</span>
        <svg className="tl-start-icon" viewBox="0 0 24 24">
          <path d="M12 21C7 17 3 13.6 3 9.6A4.6 4.6 0 0 1 12 7.4a4.6 4.6 0 0 1 9 2.2c0 4-4 7.4-9 11.4Z" />
        </svg>
        <svg className="tl-start-curve" viewBox="0 0 60 90" preserveAspectRatio="none">
          <path d="M44 0 C44 40 4 40 4 90" />
        </svg>
      </div>

      <ol className="tl-years">
        {years.map(([year, items], yi) => (
          <li key={year} className={`tl-year${yi === 0 ? ' tl-year--current' : ''}`}>
            <div className="tl-year-label">
              <small aria-hidden="true">{items.length} works</small>
              <span>{year}</span>
            </div>
            <span className="tl-node" aria-hidden="true" />
            <ul className="tl-entries">
              {items.map((p) => (
                <li key={p.slug} className="tl-entry">
                  <h3 className="tl-title">
                    {p.title}
                    {p.slug === latest && <span className="tl-tag">NEW</span>}
                  </h3>
                  <p className="tl-role">
                    <Txt value={p.role} />
                  </p>
                  <p className="tl-desc">
                    <Txt value={p.summary} />
                  </p>
                  <Link to={`/projects/${p.slug}`} state={{ from: 'index' }} className="tl-preview">
                    <span className="tl-stack" aria-hidden="true">
                      <span className="tl-card tl-card--back2">
                        <MediaSlot media={p.thumbnail} />
                      </span>
                      <span className="tl-card tl-card--back1">
                        <MediaSlot media={p.thumbnail} />
                      </span>
                      <motion.span layoutId={`media-${p.slug}`} className="tl-card tl-card--front">
                        <MediaSlot media={p.thumbnail} />
                      </motion.span>
                    </span>
                    <span className="tl-preview-text">
                      <span className="tl-preview-name" lang="en">
                        {p.titleEn}
                      </span>
                      <span className="tl-preview-sub">
                        <Txt value={p.question} />
                      </span>
                    </span>
                    <span className="tl-open" aria-hidden="true">
                      열어보기 →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
