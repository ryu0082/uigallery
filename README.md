# UIVault — UI/UX Reference Gallery

uibowl.io에서 영감을 받은 UI/UX 레퍼런스 갤러리입니다.

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── globals.css        # 전역 스타일 + CSS 변수
│   ├── layout.tsx         # 루트 레이아웃 (폰트 설정)
│   └── page.tsx           # 메인 페이지
├── components/
│   ├── gallery/
│   │   ├── GalleryCard.tsx    # 개별 카드 (호버 선택, 좋아요, 북마크)
│   │   ├── GalleryGrid.tsx    # 그리드 (Masonry / Uniform, 필터링, 정렬)
│   │   ├── HeroSection.tsx    # 상단 히어로 + 통계
│   │   ├── SelectionBar.tsx   # 하단 플로팅 선택 바 (내보내기)
│   │   └── Toolbar.tsx        # 검색 + 레이아웃 토글 + 선택 모드
│   └── layout/
│       ├── Header.tsx         # 상단 네비게이션
│       └── Sidebar.tsx        # 사이드바 (카테고리, 태그, 정렬)
├── lib/
│   ├── data.ts            # 목업 데이터 (48개 아이템)
│   ├── store.ts           # Zustand 상태 관리
│   └── utils.ts           # 유틸 함수 (cn, formatNumber, timeAgo)
└── types/
    └── index.ts           # TypeScript 타입 정의
```

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **Masonry / Grid 레이아웃** | 두 가지 레이아웃 전환 |
| **카테고리 필터** | 10개 카테고리 (Navigation, Hero, Cards 등) |
| **태그 필터** | 멀티 태그 필터링 |
| **실시간 검색** | 제목, 설명, 태그, 카테고리 전체 검색 |
| **정렬** | Latest / Popular / Trending |
| **호버 선택** | 카드 호버 시 체크박스 노출 |
| **다중 선택 & 내보내기** | JSON / URL 복사 내보내기 |
| **좋아요 / 북마크** | 개별 카드 인터랙션 |
| **무한 로드** | Load more 패턴 (24개 → 12개씩 추가) |

---

## 🎨 디자인 시스템

- **폰트**: DM Serif Display (제목) + DM Sans (본문) + DM Mono (코드/숫자)
- **테마**: 다크 + 에디토리얼 매거진 스타일
- **어센트 컬러**: `#c8ff00` (Acid Yellow)
- **스켈레톤 로딩**: shimmer 애니메이션
- **레이아웃**: CSS columns (Masonry) + CSS Grid (Uniform)

---

## 🔌 실제 데이터 연동 방법

`src/lib/data.ts`의 목업 데이터를 실제 API로 교체:

```ts
// src/app/api/gallery/route.ts 생성 후
// src/lib/data.ts → fetch("/api/gallery") 로 교체

// 또는 Supabase, PlanetScale 등 DB 연결
import { createClient } from "@supabase/supabase-js";
```

---

## 📦 배포

Vercel에 배포 권장:

```bash
npx vercel
```
