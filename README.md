# Serin Choi — UX/UI Portfolio

마법소녀 변신 장면에서 영감을 받은 3D 인트로가 있는 UX/UI 포트폴리오.
은빛 열쇠를 하트 자물쇠에 끌어다 놓으면 잠금이 풀리고 대표 프로젝트가 나타납니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

확인용 주소 옵션

- `/?slow=10` 성공 시퀀스를 10배 느리게 재생
- `/?webgl=0` WebGL 미지원 화면
- `/projects/seat-swap` 상세 페이지 직접 진입

## 콘텐츠 수정

- 텍스트·이미지 경로: `src/data/projects.ts`
- 이미지 파일: `public/projects/<slug>/` (데이터의 `src`에 `/projects/<slug>/파일명.png`)
- 현재 내용은 가상의 샘플입니다.

## 구조

- `src/intro/` 3D 인트로 (Three.js · React Three Fiber · Drei · Postprocessing)
  - `anchors.ts` 열쇠 끝(tip)·구멍(slot) 앵커 판정과 정렬
  - `Key.tsx`, `Lock.tsx` 오리지널 열쇠·자물쇠 (GLB 교체 시 `KeyModel`과 `shapes.ts`의 `KEY_TIP_X`, `KEYHOLE` 조정)
  - `IntroOverlay.tsx` 드래그 핸들(use-gesture), 안내 문구, 바로 보기 버튼
- `src/pages/` 홈(대표작·프로젝트 그리드), 케이스 스터디 상세
