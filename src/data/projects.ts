/**
 * 프로젝트 데이터 — 사이트의 모든 프로젝트 텍스트와 이미지 경로를 이 파일에서 수정합니다.
 *
 * 표기 규칙
 *  - 일반 문자열: 확정된 내용
 *  - draft('...'): 구조를 보여주기 위한 초안. 실제 내용으로 바꾼 뒤 일반 문자열로 바꾸세요.
 *  - todo('...'): 아직 자료가 없는 자리. 무엇을 넣어야 하는지 안내 문구가 표시됩니다.
 *  - media({ src }): src를 비워 두면 교체용 자리 표시가 나타납니다.
 *    이미지는 public/projects/<slug>/ 아래에 두고 '/projects/<slug>/파일명.png' 형태로 적습니다.
 *
 * 조사 결과, 사용자 수, 성과 지표는 실제 자료가 있을 때만 적어주세요.
 */

/** 초안·작성 필요 표시를 화면에 보여줄지 여부. 내용을 모두 채운 뒤 false로 바꾸세요. */
export const SHOW_CONTENT_MARKERS = false

export type Copy = string | { draft: string } | { todo: string }

export const draft = (text: string): Copy => ({ draft: text })
export const todo = (text: string): Copy => ({ todo: text })

export interface Media {
  /** 비워 두면 자리 표시가 나타납니다. 예: '/projects/seat-swap/hero.png' */
  src?: string
  alt: string
  /** 자리 표시에 보여줄 파일 경로 안내 */
  hint: string
  /** CSS aspect-ratio. 기본 4 / 3 */
  aspect?: string
  /** 자리 표시 안에 그릴 간단한 와이어 스케치 종류 */
  sketch?: 'seat-map' | 'phone' | 'chart' | 'room' | 'flow'
}

export const media = (m: Media): Media => m

export interface CaseStudy {
  overview: Copy[]
  problem: {
    statement: Copy
    evidence: { title: string; body: Copy }[]
  }
  alternatives: {
    name: string
    description: Copy
    pros: Copy[]
    cons: Copy[]
    chosen?: boolean
  }[]
  alternativesNote?: Copy
  flow: { step: string; detail: Copy }[]
  flowMedia?: Media
  finalUI: { media: Media; caption: Copy }[]
  validation: {
    /** 'result' = 검증 결과, 'plan' = 다음 검증 계획 */
    kind: 'result' | 'plan'
    items: { title: string; body: Copy }[]
  }
}

export interface Project {
  /** 고유 URL: /projects/<slug> */
  slug: string
  title: string
  titleEn: string
  /** 해결하려는 문제 (카드와 상세 상단에 표시) */
  question: Copy
  summary: Copy
  role: Copy
  meta: { label: string; value: Copy }[]
  thumbnail: Media
  hero: Media
  featured?: boolean
  /** 비워 두면 상세 페이지의 각 섹션에 자리 표시가 나타납니다. */
  caseStudy?: CaseStudy
}

export const projects: Project[] = [
  {
    slug: 'seat-swap',
    title: '공연 티켓 좌석 교환',
    titleEn: 'Seat Swap',
    featured: true,
    question: '떨어진 두 자리를 어떻게 연석으로 바꿀까?',
    summary: draft(
      '예매 후 떨어져 앉게 된 일행이 같은 공연의 다른 관람객과 좌석을 바꿔 나란히 앉을 수 있도록 돕는 교환 흐름을 설계했습니다.',
    ),
    role: 'UX 설계 · UI 디자인 · 프로토타입',
    meta: [
      { label: '기간', value: '2025.03 – 2025.05 (샘플)' },
      { label: '플랫폼', value: '모바일 앱' },
      { label: '팀', value: '디자이너 1, PM 1, 개발자 2' },
      { label: '도구', value: 'Figma, ProtoPie' },
    ],
    thumbnail: media({
      alt: '공연 티켓 좌석 교환 대표 화면',
      hint: '/projects/seat-swap/thumb.png',
      aspect: '4 / 3',
      sketch: 'seat-map',
    }),
    hero: media({
      alt: '좌석 배치도 위에서 교환 후보를 비교하는 화면',
      hint: '/projects/seat-swap/hero.png',
      aspect: '4 / 3',
      sketch: 'seat-map',
    }),
    caseStudy: {
      overview: [
        draft(
          '인기 공연을 예매하다 보면 연석이 남지 않아 일행이 떨어져 앉게 되는 경우가 있습니다. 이 프로젝트는 같은 공연의 관람객끼리 좌석을 바꿔 연석을 만들 수 있는 교환 기능을 다룹니다.',
        ),
        draft(
          '케이스 스터디는 교환 요청부터 새 티켓 발급까지의 흐름과, 처음 만나는 두 관람객이 안심하고 교환할 수 있게 하는 장치에 집중합니다.',
        ),
      ],
      problem: {
        statement: draft(
          '좌석을 바꾸려면 상대를 직접 찾고, 조건을 맞추고, 양도 절차를 따로 밟아야 한다는 가설에서 출발했습니다. 문제를 “교환 상대를 찾는 부담을 어떻게 줄일까”로 좁혔습니다.',
        ),
        evidence: [
          {
            title: '근거 1 · 사용자 조사',
            body: '인터뷰 참여자들은 교환 상대를 찾는 과정보다 “상대가 약속을 지킬지” 확신이 없는 순간을 가장 불편하게 이야기했습니다. (샘플 내용)',
          },
          {
            title: '근거 2 · 관찰 자료',
            body: '커뮤니티 교환 글은 좌석 정보가 자유 형식이라 조건이 맞는지 판단하려면 글을 하나씩 열어봐야 했습니다. (샘플 내용)',
          },
          {
            title: '제약 조건',
            body: '교환은 같은 공연·같은 가격대 좌석끼리만 가능하고, 공연 하루 전에 마감된다는 가상의 정책을 전제로 했습니다.',
          },
        ],
      },
      alternatives: [
        {
          name: 'A. 교환 게시판',
          description: draft('원하는 교환 조건을 글로 올리고 관람객끼리 직접 연락하는 방식'),
          pros: [draft('구현이 단순하고 익숙한 형태')],
          cons: [draft('상대를 찾는 부담이 사용자에게 그대로 남음'), draft('조건이 자유 텍스트라 비교하기 어려움')],
        },
        {
          name: 'B. 조건 기반 매칭',
          chosen: true,
          description: draft('내 좌석과 받아들일 수 있는 조건을 고르면, 서로 맞는 교환 상대를 후보로 보여주는 방식'),
          pros: [draft('탐색 부담을 서비스가 맡음'), draft('조건이 구조화되어 후보를 비교하기 쉬움')],
          cons: [draft('후보가 없을 때의 대기 경험을 따로 설계해야 함')],
        },
        {
          name: 'C. 다자간 연쇄 교환',
          description: draft('세 명 이상이 순서대로 좌석을 바꿔 모두의 조건을 맞추는 방식'),
          pros: [draft('1:1로는 성사되지 않는 교환도 가능')],
          cons: [draft('한 명만 이탈해도 전체가 무산될 수 있음'), draft('과정을 이해시키기 어려움')],
        },
      ],
      alternativesNote: draft('B안을 기본 흐름으로 두고, C안은 매칭 후보가 없을 때의 확장안으로 남겼습니다. 실제 결정 근거로 바꿔주세요.'),
      flow: [
        { step: '교환할 티켓 고르기', detail: draft('예매 내역에서 떨어진 두 장을 함께 선택합니다.') },
        { step: '원하는 자리 조건', detail: draft('나란히 앉기, 같은 열, 같은 구역 등 받아들일 수 있는 조건을 고릅니다.') },
        { step: '교환 후보 비교', detail: draft('좌석 배치도 위에서 교환 후 내 자리가 어떻게 바뀌는지 미리 봅니다.') },
        { step: '요청과 수락', detail: draft('상대가 수락하면 정해진 시간 안에 양쪽이 최종 확인합니다.') },
        { step: '새 티켓 받기', detail: draft('교환이 확정되면 기존 티켓은 무효화되고 새 좌석으로 티켓이 다시 발급됩니다.') },
      ],
      flowMedia: media({
        alt: '좌석 교환 핵심 사용자 흐름도',
        hint: '/projects/seat-swap/flow.png',
        aspect: '16 / 7',
        sketch: 'flow',
      }),
      finalUI: [
        {
          media: media({ alt: '교환할 티켓 선택 화면', hint: '/projects/seat-swap/ui-01.png', aspect: '9 / 16', sketch: 'phone' }),
          caption: draft('떨어진 두 장을 한 번에 선택'),
        },
        {
          media: media({ alt: '교환 후보 비교 화면', hint: '/projects/seat-swap/ui-02.png', aspect: '9 / 16', sketch: 'seat-map' }),
          caption: draft('교환 후 좌석을 배치도에서 미리 보기'),
        },
        {
          media: media({ alt: '교환 확정 화면', hint: '/projects/seat-swap/ui-03.png', aspect: '9 / 16', sketch: 'phone' }),
          caption: draft('양쪽 확인 후 새 티켓 발급'),
        },
      ],
      validation: {
        kind: 'plan',
        items: [
          {
            title: '과제 기반 사용성 테스트',
            body: draft('“떨어진 두 자리를 연석으로 바꿔보세요” 과제로, 조건 설정과 후보 비교 단계에서 막히는 지점을 관찰합니다.'),
          },
          {
            title: '확인할 질문',
            body: draft('교환 후 좌석 미리보기가 수락 결정에 도움이 되는가? 수락 대기 시간이 불안감을 주지 않는가?'),
          },
          {
            title: '결과 기록',
            body: '테스트 후 관찰 내용과 개선 사항을 이 자리에 정리합니다. (샘플 내용)',
          },
        ],
      },
    },
  },
  {
    slug: 'year-end-tax',
    title: '연말정산 시뮬레이션',
    titleEn: 'Year-end Tax Simulator',
    question: '복잡한 공제 항목 앞에서, 내 환급액을 미리 가늠할 수 있을까?',
    summary: '급여와 지출 항목 몇 가지만 입력하면 예상 환급액이 바로 바뀌는 시뮬레이터. 어떤 공제를 더 챙기면 좋을지 한눈에 보여줍니다.',
    role: 'UX 리서치 · 정보 구조 · UI 디자인',
    meta: [
      { label: '기간', value: '2024.11 – 2025.01 (샘플)' },
      { label: '플랫폼', value: '모바일 웹' },
    ],
    thumbnail: media({
      alt: '연말정산 시뮬레이션 대표 화면',
      hint: '/projects/year-end-tax/thumb.png',
      aspect: '4 / 3',
      sketch: 'chart',
    }),
    hero: media({
      alt: '연말정산 시뮬레이션 대표 화면',
      hint: '/projects/year-end-tax/hero.png',
      aspect: '4 / 3',
      sketch: 'chart',
    }),
  },
  {
    slug: 'furniture-layout',
    title: '가구 배치 도구',
    titleEn: 'Furniture Layout',
    question: '가구를 사기 전에, 내 방에 잘 들어갈지 확인할 수 있을까?',
    summary: '방 크기를 입력하고 가구를 끌어다 놓으면 동선과 문 열림 반경까지 확인할 수 있는 배치 도구입니다.',
    role: '인터랙션 설계 · UI 디자인 · 프로토타입',
    meta: [
      { label: '기간', value: '2024.06 – 2024.08 (샘플)' },
      { label: '플랫폼', value: '데스크톱 웹' },
    ],
    thumbnail: media({
      alt: '가구 배치 도구 대표 화면',
      hint: '/projects/furniture-layout/thumb.png',
      aspect: '4 / 3',
      sketch: 'room',
    }),
    hero: media({
      alt: '가구 배치 도구 대표 화면',
      hint: '/projects/furniture-layout/hero.png',
      aspect: '4 / 3',
      sketch: 'room',
    }),
  },
]

export const featuredProject = projects.find((p) => p.featured) ?? projects[0]
export const getProject = (slug: string | undefined) => projects.find((p) => p.slug === slug)

/** 소개·연락처 — 사이트 공통 정보 */
export const profile = {
  nameKo: '최세린',
  nameEn: 'Serin Choi',
  title: 'UX/UI Designer',
  intro: '복잡한 규칙을 사람이 이해할 수 있는 화면으로 바꾸는 일을 좋아합니다. 문제를 작게 쪼개고, 대안을 나란히 놓고 비교하고, 프로토타입으로 빠르게 확인하는 방식으로 일합니다. (샘플 소개)',
  email: 'hello@example.com (샘플)',
  links: [] as { label: string; href: string }[],
}
