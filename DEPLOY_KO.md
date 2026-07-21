# 배포 및 애드센스 신청 가이드

## 1. 로컬에서 확인하기
```bash
npm install
npm run dev
```
`http://localhost:3000` 에서 확인하세요.

## 2. GitHub에 올리기
```bash
git init
git add .
git commit -m "init: 타임패널 타이머 사이트"
git branch -M main
git remote add origin <본인 GitHub 저장소 주소>
git push -u origin main
```

## 3. Vercel로 배포하기
1. https://vercel.com 에서 GitHub 계정으로 로그인
2. "Add New → Project" 선택 후 방금 올린 저장소 선택
3. 프레임워크는 Next.js로 자동 인식됨 → 별도 설정 없이 "Deploy" 클릭
4. 배포 완료 후 발급된 도메인(예: `timepanel.vercel.app`) 확인
5. (선택) 커스텀 도메인을 연결하면 애드센스 심사에 더 유리합니다

## 4. 배포 후 꼭 바꿔야 할 것
- `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts` 안의
  `SITE_URL = "https://example.com"` → 실제 배포 도메인으로 교체
- `src/app/about/page.tsx`, `src/app/privacy/page.tsx` 안의
  `contact@example.com` → 실제 연락 가능한 이메일로 교체
- `public/ads.txt` → 애드센스 승인 후 발급받는 게시자 ID로 교체

## 5. 애드센스 신청 전 체크리스트
- [ ] 실제 도메인 연결 (가능하면 `.vercel.app` 대신 커스텀 도메인 권장)
- [ ] 개인정보처리방침 페이지 문구를 실제 운영 정보로 업데이트
- [ ] 콘텐츠 최소 확보 (타이머 기능 외에 소개/설명 텍스트가 이미 홈페이지에 포함되어 있음)
- [ ] 사이트 방문 트래픽이 어느 정도 쌓인 뒤 신청 (완전히 새 사이트는 반려되는 경우가 많음)
- [ ] https://www.google.com/adsense 에서 사이트 등록 → 심사 대기 → 승인 후
      `src/app/layout.tsx`의 `ADSENSE_CLIENT_ID` 값 채우고
      `.ad-slot` 자리에 실제 광고 유닛 코드 삽입

## 6. 참고
- 프레임워크: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- 광고 자리(상/하단)는 이미 레이아웃에 확보되어 있어 승인 후 코드만 교체하면 됩니다
