export type CIStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'LOCKED';
export type Environment = 'Blue' | 'Green';

export interface Repository {
  id: string;
  name: string;
  type: 'frontend' | 'backend';
  lastDeployment: {
    date: string;
    result: 'SUCCESS' | 'FAILED' | 'RUNNING';
  };
  currentEnvironment: Environment;
  lastCIStatus: CIStatus;
  currentVersion: {
    commitSha: string;
    message: string;
    tag?: string;
  };
}

export interface Version {
  commitSha: string;
  commitMessage: string;
  tag?: string;
  ciStatus: CIStatus;
  testStatus: CIStatus;
  securityStatus: CIStatus;
  buildStatus: CIStatus;
  timestamp: string;
}

export interface DeploymentHistory {
  id: string;
  date: string;
  version: string;
  result: 'SUCCESS' | 'FAILED';
  targetEnvironment: string;
}

export interface DeploymentStage {
  name: string;
  status: CIStatus;
  details?: any;
  deployStep?: 'initial' | 'deploying' | 'deployed' | 'switching' | 'switched' | 'failed';
}

export interface Deployment {
  id: string;
  repositoryName: string;
  version: {
    commitSha: string;
    commitMessage: string;
    tag?: string;
  };
  createdAt: string;
  currentStage: string;
  stages: {
    test: DeploymentStage;
    security: DeploymentStage;
    build: DeploymentStage;
    infrastructure: DeploymentStage;
    deploy: DeploymentStage;
    monitoring: DeploymentStage;
  };
}

export const mockRepositories: Repository[] = [
  {
    id: 'cat-frontend',
    name: 'cat-frontend',
    type: 'frontend',
    lastDeployment: {
      date: '2025-01-15 14:30:00',
      result: 'SUCCESS',
    },
    currentEnvironment: 'Blue',
    lastCIStatus: 'SUCCESS',
    currentVersion: {
      commitSha: 'a3f2c1d',
      message: '메인 페이지 UI 개선',
      tag: 'v1.1.0',
    },
  },
  {
    id: 'cat-backend',
    name: 'cat-backend',
    type: 'backend',
    lastDeployment: {
      date: '2025-01-14 09:15:00',
      result: 'FAILED',
    },
    currentEnvironment: 'Green',
    lastCIStatus: 'SUCCESS',
    currentVersion: {
      commitSha: 'b7e9f2a',
      message: 'API 응답 속도 최적화',
      tag: 'v1.9.5',
    },
  },
];

export const mockVersions: Record<string, Version[]> = {
  frontend: [
    {
      commitSha: 'c9d8e7f',
      commitMessage: '로그인 폼 유효성 검사 추가',
      tag: 'v1.2.0',
      ciStatus: 'SUCCESS',
      testStatus: 'SUCCESS',
      securityStatus: 'SUCCESS',
      buildStatus: 'SUCCESS',
      timestamp: '2025-01-16 10:20:00',
    },
    {
      commitSha: 'b2a1c3d',
      commitMessage: '대시보드 차트 컴포넌트 추가',
      tag: 'v1.1.5',
      ciStatus: 'FAILED',
      testStatus: 'FAILED',
      securityStatus: 'SUCCESS',
      buildStatus: 'SUCCESS',
      timestamp: '2025-01-16 09:45:00',
    },
    {
      commitSha: 'a3f2c1d',
      commitMessage: '메인 페이지 UI 개선',
      tag: 'v1.1.0',
      ciStatus: 'SUCCESS',
      testStatus: 'SUCCESS',
      securityStatus: 'FAILED',
      buildStatus: 'SUCCESS',
      timestamp: '2025-01-15 14:30:00',
    },
  ],
  backend: [
    {
      commitSha: 'd4e5f6g',
      commitMessage: '데이터베이스 쿼리 최적화',
      tag: 'v2.0.1',
      ciStatus: 'SUCCESS',
      testStatus: 'SUCCESS',
      securityStatus: 'SUCCESS',
      buildStatus: 'SUCCESS',
      timestamp: '2025-01-16 11:00:00',
    },
    {
      commitSha: 'c3d2e1f',
      commitMessage: '인증 미들웨어 리팩토링',
      tag: 'v2.0.0',
      ciStatus: 'SUCCESS',
      testStatus: 'SUCCESS',
      securityStatus: 'SUCCESS',
      buildStatus: 'FAILED',
      timestamp: '2025-01-15 16:20:00',
    },
    {
      commitSha: 'b7e9f2a',
      commitMessage: 'API 응답 속도 최적화',
      tag: 'v1.9.5',
      ciStatus: 'SUCCESS',
      testStatus: 'SUCCESS',
      securityStatus: 'SUCCESS',
      buildStatus: 'SUCCESS',
      timestamp: '2025-01-14 09:15:00',
    },
  ],
};

export const mockDeploymentHistory: Record<string, DeploymentHistory[]> = {
  frontend: [
    {
      id: 'deploy-fe-001',
      date: '2025-01-15 14:30:00',
      version: 'a3f2c1d',
      result: 'SUCCESS',
      targetEnvironment: 'Blue → Green',
    },
    {
      id: 'deploy-fe-002',
      date: '2025-01-14 11:20:00',
      version: 'z9x8y7w',
      result: 'FAILED',
      targetEnvironment: 'Blue → Green',
    },
    {
      id: 'deploy-fe-003',
      date: '2025-01-13 16:45:00',
      version: 'p5q6r7s',
      result: 'SUCCESS',
      targetEnvironment: 'Green → Blue',
    },
  ],
  backend: [
    {
      id: 'deploy-be-001',
      date: '2025-01-14 09:15:00',
      version: 'b7e9f2a',
      result: 'SUCCESS',
      targetEnvironment: 'Blue → Green',
    },
    {
      id: 'deploy-be-002',
      date: '2025-01-12 14:30:00',
      version: 'm3n4o5p',
      result: 'SUCCESS',
      targetEnvironment: 'Green → Blue',
    },
  ],
};

export const mockDeployments: Record<string, Deployment> = {
  'deploy-fe-001': {
    id: 'deploy-fe-001',
    repositoryName: 'cat-frontend',
    version: {
      commitSha: 'a3f2c1d',
      commitMessage: '메인 페이지 UI 개선',
      tag: 'v1.1.0',
    },
    createdAt: '2025-01-15 14:30:00',
    currentStage: '모니터링',
    stages: {
      test: { name: '테스트', status: 'SUCCESS', details: { totalTests: 150, failedTests: 0, coverage: '85%' } },
      security: { name: '보안 점검', status: 'SUCCESS', details: { vulnerabilities: [] } },
      build: { name: '빌드', status: 'SUCCESS', details: { imageTag: 'cat-frontend:a3f2c1d', buildTime: '2m 10s' } },
      infrastructure: { name: '인프라 상태 확인', status: 'SUCCESS' },
      deploy: { name: '배포', status: 'SUCCESS', deployStep: 'switched' },
      monitoring: { name: '모니터링', status: 'SUCCESS' },
    },
  },
  'deploy-fe-002': {
    id: 'deploy-fe-002',
    repositoryName: 'cat-frontend',
    version: {
      commitSha: 'b2a1c3d',
      commitMessage: '대시보드 차트 컴포넌트 추가',
      tag: 'v1.1.5',
    },
    createdAt: '2025-01-16 09:50:00',
    currentStage: '테스트',
    stages: {
      test: {
        name: '테스트',
        status: 'FAILED',
        details: {
          totalTests: 156,
          failedTests: 3,
          failedTestNames: [
            'Dashboard.test.tsx - 차트 데이터 렌더링 테스트',
            'ChartComponent.test.tsx - 빈 데이터 처리 테스트',
            'ChartComponent.test.tsx - 날짜 포맷 테스트',
          ],
          logs: `FAIL src/components/Dashboard.test.tsx
  ● 차트 데이터 렌더링 테스트
    Expected: 5 data points
    Received: undefined

FAIL src/components/ChartComponent.test.tsx
  ● 빈 데이터 처리 테스트
    TypeError: Cannot read property 'length' of undefined`,
        },
      },
      security: { name: '보안 점검', status: 'LOCKED' },
      build: { name: '빌드', status: 'LOCKED' },
      infrastructure: { name: '인프라 상태 확인', status: 'LOCKED' },
      deploy: { name: '배포', status: 'LOCKED' },
      monitoring: { name: '모니터링', status: 'LOCKED' },
    },
  },
  'deploy-fe-003': {
    id: 'deploy-fe-003',
    repositoryName: 'cat-frontend',
    version: {
      commitSha: 'a3f2c1d',
      commitMessage: '메인 페이지 UI 개선',
      tag: 'v1.1.0',
    },
    createdAt: '2025-01-15 14:35:00',
    currentStage: '보안 점검',
    stages: {
      test: {
        name: '테스트',
        status: 'SUCCESS',
        details: {
          totalTests: 153,
          failedTests: 0,
          coverage: '85.2%',
        },
      },
      security: {
        name: '보안 점검',
        status: 'SUCCESS',
        details: {
          vulnerabilities: [
            {
              title: 'SQL Injection 가능성',
              severity: 'HIGH',
              file: 'src/api/users.ts',
              line: 45,
              description: '사용자 입력값이 직접 쿼리에 사용됨',
            },
            {
              title: 'XSS 취약점',
              severity: 'MEDIUM',
              file: 'src/components/UserProfile.tsx',
              line: 78,
              description: 'dangerouslySetInnerHTML 사용',
            },
          ],
        },
      },
      build: {
        name: '빌드',
        status: 'LOCKED',
      },
      infrastructure: {
        name: '인프라 상태 확인',
        status: 'LOCKED',
      },
      deploy: {
        name: '배포',
        status: 'LOCKED',
      },
      monitoring: {
        name: '모니터링',
        status: 'LOCKED',
      },
    },
  },
};

export function createNewDeployment(repoType: string, version: Version): string {
  const deploymentId = `deploy-new-${Date.now()}`;
  const repoName = repoType === 'frontend' ? 'cat-frontend' : 'cat-backend';

  mockDeployments[deploymentId] = {
    id: deploymentId,
    repositoryName: repoName,
    version: {
      commitSha: version.commitSha,
      commitMessage: version.commitMessage,
      tag: version.tag,
    },
    createdAt: new Date().toLocaleString('ko-KR'),
    currentStage: '테스트',
    stages: {
      test: {
        name: '테스트',
        status: 'SUCCESS',
        details: {
          totalTests: 156,
          failedTests: 0,
          coverage: '87.5%',
        },
      },
      security: {
        name: '보안 점검',
        status: 'LOCKED',
        details: { vulnerabilities: [] },
      },
      build: {
        name: '빌드',
        status: 'LOCKED',
        details: {
          imageTag: `${repoName}:${version.commitSha}`,
          buildTime: '2m 34s',
        },
      },
      infrastructure: {
        name: '인프라 상태 확인',
        status: 'LOCKED',
      },
      deploy: {
        name: '배포',
        status: 'LOCKED',
        deployStep: 'initial',
      },
      monitoring: {
        name: '모니터링',
        status: 'LOCKED',
      },
    },
  };

  return deploymentId;
}
