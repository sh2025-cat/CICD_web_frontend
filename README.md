# Cat CICD Frontend

CI/CD 파이프라인을 시각화하고 관리하는 웹 프론트엔드 애플리케이션입니다.

![메인 화면](docs/img/main.png)

## 기능

- **리포지토리 관리**: 프론트엔드/백엔드 리포지토리 목록 조회
- **배포 현황 대시보드**: 최근 배포 상태, 현재 라이브 환경, 버전 정보 확인
- **버전 관리**: 커밋 기반 버전 리스트 및 배포 내역 조회
- **배포 파이프라인**: 6단계 CI/CD 파이프라인 시각화
  - 테스트 → 보안 점검 → 빌드 → 인프라 확인 → 배포 → 모니터링
- **Blue/Green 배포**: 무중단 배포를 위한 환경 전환 지원

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** - 빌드 도구
- **Tailwind CSS** + **shadcn/ui** - 스타일링
- **React Router v7** - 라우팅
- **Axios** - HTTP 클라이언트

## 시작하기

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### Docker

```bash
# 이미지 빌드
docker build -t cat-frontend .

# 컨테이너 실행
docker run -p 3000:3000 cat-frontend
```

## 환경 변수

```bash
# .env.example 참고
VITE_API_BASE_URL=http://localhost:8080
```

## 프로젝트 구조

```
src/
├── api/          # API 클라이언트
├── components/   # UI 컴포넌트
├── hooks/        # 커스텀 훅
├── lib/          # 유틸리티 및 데이터
├── pages/        # 페이지 컴포넌트
├── services/     # 서비스 레이어
└── types/        # 타입 정의
```

## CI/CD 파이프라인

GitHub Actions를 통해 자동 배포가 구성되어 있습니다.

### 트리거
- `main` 브랜치 push
- 수동 실행 (workflow_dispatch)

### 파이프라인 단계

```
1. Checkout Code
2. AWS 인증 (ECR, ECS)
3. Docker 이미지 빌드 (멀티스테이지)
4. ECR 푸시 (태그: SHA, latest)
5. ECS Task Definition 업데이트
6. ECS 서비스 롤링 배포
7. 배포 완료 대기 (services-stable)
```

### 인프라 구성

| 리소스 | 값 |
|--------|-----|
| AWS 리전 | ap-northeast-2 |
| ECR 리포지토리 | cat-frontend |
| ECS 클러스터 | cat-cluster |
| ECS 서비스 | cat-frontend |
| 배포 방식 | 롤링 업데이트 (무중단) |

### 필요한 GitHub Secrets

| Secret | 설명 |
|--------|------|
| `AWS_ACCESS_KEY` | AWS Access Key ID |
| `AWS_SECRET_KEY` | AWS Secret Access Key |

## 라이선스

MIT
