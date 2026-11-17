import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'

/** 프로젝트 상세는 홈 위에 창으로 열리므로 두 경로 모두 Home이 그립니다. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:slug" element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
