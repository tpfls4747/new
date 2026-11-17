import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { MediaSlot } from './MediaSlot'
import { Txt } from './Txt'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <li className="card">
      <Link to={`/projects/${project.slug}`} state={{ from: 'card' }} className="card-link">
        <motion.div layoutId={`media-${project.slug}`} className="card-media">
          <MediaSlot media={project.thumbnail} />
        </motion.div>
        <div className="card-body">
          <p className="card-index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')} · {project.titleEn}
          </p>
          <h3 className="card-title">{project.title}</h3>
          <dl className="card-meta">
            <div>
              <dt>해결하려는 문제</dt>
              <dd>
                <Txt value={project.question} />
              </dd>
            </div>
            <div>
              <dt>내 역할</dt>
              <dd>
                <Txt value={project.role} />
              </dd>
            </div>
          </dl>
          <span className="card-cta" aria-hidden="true">
            케이스 스터디 →
          </span>
        </div>
      </Link>
    </li>
  )
}
