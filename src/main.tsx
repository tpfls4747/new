import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource-variable/nunito'
import '@fontsource/jua/400.css'
import '@fontsource/gowun-dodum/400.css'
import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { IntroProvider } from './state/intro.tsx'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

/** VITE_EMBED=1 빌드: 주소를 쓸 수 없는 미리보기용 (메모리 라우터, 항상 인트로부터) */
const Router = import.meta.env.VITE_EMBED ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <MotionConfig reducedMotion="user">
        <IntroProvider>
          <App />
        </IntroProvider>
      </MotionConfig>
    </Router>
  </StrictMode>,
)
