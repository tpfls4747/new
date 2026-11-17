import { Link, useLocation } from 'react-router-dom'
import { profile } from '../data/projects'
import { useIntro } from '../state/intro'

export function SiteHeader() {
  const { replay } = useIntro()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label={`${profile.nameEn} 홈`}>
        <span className="brand-name">{profile.nameEn}</span>
        <span className="brand-role">{profile.title}</span>
      </Link>
      <nav aria-label="주요 메뉴" className="site-nav">
        <Link to={{ pathname: '/', hash: '#projects' }}>프로젝트</Link>
        <Link to={{ pathname: '/', hash: '#about' }}>소개</Link>
        {onHome && (
          <button type="button" className="link-button" onClick={replay}>
            인트로 다시 보기
          </button>
        )}
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} {profile.nameEn} · {profile.nameKo}
      </p>
      <p className="footer-note">열쇠와 자물쇠는 이 사이트를 위해 만든 오리지널 3D 오브젝트입니다.</p>
    </footer>
  )
}
