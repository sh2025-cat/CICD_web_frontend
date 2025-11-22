export type CIStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'LOCKED';
export type PipelineStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'INPROGRESS';
export type DeploymentStatus = 'PENDING' | 'INPROGRESS' | 'SUCCESS' | 'FAILED';
export type LastStep = 'test' | 'security' | 'build' | 'infra' | 'deploy' | 'monitoring';
export type StepName = 'test' | 'security' | 'build' | 'infra' | 'deploy' | 'monitoring';

export interface Repository {
    id: number;
    name: string;
    commitHash: string;
    commitMsg: string;
    deployedAt: string;
}

export interface DeploymentCommit {
    message: string;
    shortHash: string;
    branch: string;
    authorName: string;
}

export interface DeploymentTimings {
    startedAt: string;
    completedAt: string;
    duration: string;
}

export interface DeploymentStageInfo {
    name: string;
    status: string;
}

// DeploymentFlowPage 관련 타입
export interface DeploymentFlowMeta {
    project: string;
    cluster: string;
    service: string;
    taskDefArn: string;
    imageTag: string;
}

export interface DeploymentFlowStep {
    name: StepName;
    status: string;
    duration: string;
    githubJobId: number;
    startedAt: string;
}

export interface DeploymentFlowTimings {
    createdAt: string;
    finishedAt: string;
    duration: string;
}

export interface DeploymentFlowData {
    id: number;
    status: DeploymentStatus;
    githubRunId: string;
    githubRunUrl: string;
    timings: DeploymentFlowTimings;
    meta: DeploymentFlowMeta;
    commit: DeploymentCommit;
    steps: DeploymentFlowStep[];
}

export interface DeploymentListItem {
    deploymentId: number;
    lastStep: LastStep;
    pipelineStatus: PipelineStatus;
    commit: DeploymentCommit;
    timings: DeploymentTimings;
    stages: DeploymentStageInfo[];
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
        id: 1,
        name: 'cicd_frontend',
        commitHash: 'a3f2c1d',
        commitMsg: '메인 페이지 UI 개선',
        deployedAt: '2025-11-20 11:11:11.000',
    },
    {
        id: 2,
        name: 'cicd_backend',
        commitHash: 'b7e9f2a',
        commitMsg: 'API 응답 속도 최적화',
        deployedAt: '2025-11-20 11:11:11.000',
    },
];

// RepoDetailPage에서 사용할 배포 리스트 Mock 데이터
export const mockDeploymentList: Record<number, DeploymentListItem[]> = {
    1: [
        {
            deploymentId: 105,
            lastStep: 'test',
            pipelineStatus: 'PENDING',
            commit: {
                message: 'Update production to v1.1.0',
                shortHash: 'a1b2c3d',
                branch: 'main',
                authorName: 'User1',
            },
            timings: {
                startedAt: '2025-11-20T10:00:00',
                completedAt: '2025-11-20T10:00:35',
                duration: '35s',
            },
            stages: [
                { name: 'build', status: 'SUCCESS' },
                { name: 'test', status: 'SUCCESS' },
                { name: 'deploy', status: 'SUCCESS' },
            ],
        },
        {
            deploymentId: 104,
            lastStep: 'build',
            pipelineStatus: 'INPROGRESS',
            commit: {
                message: 'Fix login bug',
                shortHash: 'f9e8d7c',
                branch: 'feature/login',
                authorName: 'User2',
            },
            timings: {
                startedAt: '2025-11-20T09:00:00',
                completedAt: '2025-11-20T09:00:10',
                duration: '10s',
            },
            stages: [
                { name: 'build', status: 'SUCCESS' },
                { name: 'test', status: 'FAILED' },
                { name: 'deploy', status: 'PENDING' },
            ],
        },
        {
            deploymentId: 103,
            lastStep: 'deploy',
            pipelineStatus: 'SUCCESS',
            commit: {
                message: '메인 페이지 UI 개선',
                shortHash: 'a3f2c1d',
                branch: 'main',
                authorName: 'User3',
            },
            timings: {
                startedAt: '2025-11-19T14:30:00',
                completedAt: '2025-11-19T14:32:15',
                duration: '2m 15s',
            },
            stages: [
                { name: 'build', status: 'SUCCESS' },
                { name: 'test', status: 'SUCCESS' },
                { name: 'deploy', status: 'SUCCESS' },
            ],
        },
        {
            deploymentId: 102,
            lastStep: 'test',
            pipelineStatus: 'FAILED',
            commit: {
                message: '대시보드 차트 추가',
                shortHash: 'b2a1c3d',
                branch: 'feature/dashboard',
                authorName: 'User4',
            },
            timings: {
                startedAt: '2025-11-19T11:00:00',
                completedAt: '2025-11-19T11:01:20',
                duration: '1m 20s',
            },
            stages: [
                { name: 'build', status: 'SUCCESS' },
                { name: 'test', status: 'FAILED' },
                { name: 'deploy', status: 'PENDING' },
            ],
        },
    ],
    2: [
        {
            deploymentId: 201,
            lastStep: 'test',
            pipelineStatus: 'PENDING',
            commit: {
                message: '데이터베이스 쿼리 최적화',
                shortHash: 'd4e5f6g',
                branch: 'main',
                authorName: 'Backend User',
            },
            timings: {
                startedAt: '2025-11-20T11:00:00',
                completedAt: '2025-11-20T11:02:30',
                duration: '2m 30s',
            },
            stages: [
                { name: 'build', status: 'SUCCESS' },
                { name: 'test', status: 'SUCCESS' },
                { name: 'deploy', status: 'SUCCESS' },
            ],
        },
        {
            deploymentId: 200,
            lastStep: 'deploy',
            pipelineStatus: 'SUCCESS',
            commit: {
                message: 'API 응답 속도 최적화',
                shortHash: 'b7e9f2a',
                branch: 'main',
                authorName: 'Backend User',
            },
            timings: {
                startedAt: '2025-11-19T09:15:00',
                completedAt: '2025-11-19T09:17:45',
                duration: '2m 45s',
            },
            stages: [
                { name: 'build', status: 'SUCCESS' },
                { name: 'test', status: 'SUCCESS' },
                { name: 'deploy', status: 'SUCCESS' },
            ],
        },
    ],
};

// DeploymentFlowPage에서 사용할 배포 플로우 Mock 데이터
export const mockDeploymentFlowData: Record<number, DeploymentFlowData> = {
    105: {
        id: 105,
        status: 'PENDING',
        githubRunId: '123456789',
        githubRunUrl: 'https://github.com/user/cicd_frontend/actions/runs/123456789',
        timings: {
            createdAt: '2025-11-20T10:00:00',
            finishedAt: '2025-11-20T10:00:35',
            duration: '35s',
        },
        meta: {
            project: 'cicd_frontend',
            cluster: 'my-ecs-cluster',
            service: 'frontend-service',
            taskDefArn: 'arn:aws:ecs:us-east-1:123456:task-definition/frontend:10',
            imageTag: 'v1.1.0-a1b2c3d',
        },
        commit: {
            message: 'Update production to v1.1.0',
            shortHash: 'a1b2c3d',
            branch: 'main',
            authorName: 'User1',
        },
        steps: [
            {
                name: 'test',
                status: 'SUCCESS',
                duration: '15s',
                githubJobId: 11111111,
                startedAt: '2025-11-20T10:00:00',
            },
        ],
    },
    104: {
        id: 104,
        status: 'INPROGRESS',
        githubRunId: '123456788',
        githubRunUrl: 'https://github.com/user/cicd_frontend/actions/runs/123456788',
        timings: {
            createdAt: '2025-11-20T09:00:00',
            finishedAt: '2025-11-20T09:00:10',
            duration: '10s',
        },
        meta: {
            project: 'cicd_frontend',
            cluster: 'my-ecs-cluster',
            service: 'frontend-service',
            taskDefArn: 'arn:aws:ecs:us-east-1:123456:task-definition/frontend:9',
            imageTag: 'v1.0.9-f9e8d7c',
        },
        commit: {
            message: 'Fix login bug',
            shortHash: 'f9e8d7c',
            branch: 'feature/login',
            authorName: 'User2',
        },
        steps: [
            {
                name: 'test',
                status: 'SUCCESS',
                duration: '12s',
                githubJobId: 11111112,
                startedAt: '2025-11-20T09:00:00',
            },
            {
                name: 'security',
                status: 'SUCCESS',
                duration: '20s',
                githubJobId: 11111113,
                startedAt: '2025-11-20T09:00:12',
            },
            {
                name: 'build',
                status: 'RUNNING',
                duration: '0s',
                githubJobId: 11111114,
                startedAt: '2025-11-20T09:00:32',
            },
        ],
    },
    103: {
        id: 103,
        status: 'SUCCESS',
        githubRunId: '123456787',
        githubRunUrl: 'https://github.com/user/cicd_frontend/actions/runs/123456787',
        timings: {
            createdAt: '2025-11-19T14:30:00',
            finishedAt: '2025-11-19T14:32:15',
            duration: '2m 15s',
        },
        meta: {
            project: 'cicd_frontend',
            cluster: 'my-ecs-cluster',
            service: 'frontend-service',
            taskDefArn: 'arn:aws:ecs:us-east-1:123456:task-definition/frontend:8',
            imageTag: 'v1.1.0-a3f2c1d',
        },
        commit: {
            message: '메인 페이지 UI 개선',
            shortHash: 'a3f2c1d',
            branch: 'main',
            authorName: 'User3',
        },
        steps: [
            {
                name: 'test',
                status: 'SUCCESS',
                duration: '18s',
                githubJobId: 11111115,
                startedAt: '2025-11-19T14:30:00',
            },
            {
                name: 'security',
                status: 'SUCCESS',
                duration: '25s',
                githubJobId: 11111116,
                startedAt: '2025-11-19T14:30:18',
            },
            {
                name: 'build',
                status: 'SUCCESS',
                duration: '45s',
                githubJobId: 11111117,
                startedAt: '2025-11-19T14:30:43',
            },
            {
                name: 'infra',
                status: 'SUCCESS',
                duration: '10s',
                githubJobId: 11111118,
                startedAt: '2025-11-19T14:31:28',
            },
            {
                name: 'deploy',
                status: 'SUCCESS',
                duration: '27s',
                githubJobId: 11111119,
                startedAt: '2025-11-19T14:31:38',
            },
        ],
    },
    102: {
        id: 102,
        status: 'FAILED',
        githubRunId: '123456786',
        githubRunUrl: 'https://github.com/user/cicd_frontend/actions/runs/123456786',
        timings: {
            createdAt: '2025-11-19T11:00:00',
            finishedAt: '2025-11-19T11:01:20',
            duration: '1m 20s',
        },
        meta: {
            project: 'cicd_frontend',
            cluster: 'my-ecs-cluster',
            service: 'frontend-service',
            taskDefArn: 'arn:aws:ecs:us-east-1:123456:task-definition/frontend:7',
            imageTag: 'v1.0.8-b2a1c3d',
        },
        commit: {
            message: '대시보드 차트 추가',
            shortHash: 'b2a1c3d',
            branch: 'feature/dashboard',
            authorName: 'User4',
        },
        steps: [
            {
                name: 'test',
                status: 'FAILED',
                duration: '22s',
                githubJobId: 11111120,
                startedAt: '2025-11-19T11:00:00',
            },
            {
                name: 'security',
                status: 'SUCCESS',
                duration: '18s',
                githubJobId: 11111121,
                startedAt: '2025-11-19T11:00:22',
            },
            {
                name: 'build',
                status: 'SUCCESS',
                duration: '40s',
                githubJobId: 11111122,
                startedAt: '2025-11-19T11:00:40',
            },
        ],
    },
    201: {
        id: 201,
        status: 'PENDING',
        githubRunId: '987654321',
        githubRunUrl: 'https://github.com/user/cicd_backend/actions/runs/987654321',
        timings: {
            createdAt: '2025-11-20T11:00:00',
            finishedAt: '2025-11-20T11:02:30',
            duration: '2m 30s',
        },
        meta: {
            project: 'cicd_backend',
            cluster: 'my-ecs-cluster',
            service: 'backend-service',
            taskDefArn: 'arn:aws:ecs:us-east-1:123456:task-definition/backend:12',
            imageTag: 'v1.2.0-d4e5f6g',
        },
        commit: {
            message: '데이터베이스 쿼리 최적화',
            shortHash: 'd4e5f6g',
            branch: 'main',
            authorName: 'Backend User',
        },
        steps: [
            {
                name: 'test',
                status: 'SUCCESS',
                duration: '20s',
                githubJobId: 22222221,
                startedAt: '2025-11-20T11:00:00',
            },
        ],
    },
    200: {
        id: 200,
        status: 'SUCCESS',
        githubRunId: '987654320',
        githubRunUrl: 'https://github.com/user/cicd_backend/actions/runs/987654320',
        timings: {
            createdAt: '2025-11-19T09:15:00',
            finishedAt: '2025-11-19T09:17:45',
            duration: '2m 45s',
        },
        meta: {
            project: 'cicd_backend',
            cluster: 'my-ecs-cluster',
            service: 'backend-service',
            taskDefArn: 'arn:aws:ecs:us-east-1:123456:task-definition/backend:11',
            imageTag: 'v1.1.5-b7e9f2a',
        },
        commit: {
            message: 'API 응답 속도 최적화',
            shortHash: 'b7e9f2a',
            branch: 'main',
            authorName: 'Backend User',
        },
        steps: [
            {
                name: 'test',
                status: 'SUCCESS',
                duration: '25s',
                githubJobId: 22222222,
                startedAt: '2025-11-19T09:15:00',
            },
            {
                name: 'security',
                status: 'SUCCESS',
                duration: '30s',
                githubJobId: 22222223,
                startedAt: '2025-11-19T09:15:25',
            },
            {
                name: 'build',
                status: 'SUCCESS',
                duration: '50s',
                githubJobId: 22222224,
                startedAt: '2025-11-19T09:15:55',
            },
            {
                name: 'infra',
                status: 'SUCCESS',
                duration: '15s',
                githubJobId: 22222225,
                startedAt: '2025-11-19T09:16:45',
            },
            {
                name: 'deploy',
                status: 'SUCCESS',
                duration: '35s',
                githubJobId: 22222226,
                startedAt: '2025-11-19T09:17:00',
            },
        ],
    },
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
            build: {
                name: '빌드',
                status: 'SUCCESS',
                details: { imageTag: 'cat-frontend:a3f2c1d', buildTime: '2m 10s' },
            },
            infrastructure: { name: '인프라 상태 확인', status: 'SUCCESS' },
            deploy: { name: '배포', status: 'LOCKED' },
            monitoring: { name: '모니터링', status: 'LOCKED' },
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

export function createNewDeployment(repoId: number, deploymentItem: DeploymentListItem): number {
    const deploymentId = deploymentItem.deploymentId;

    // 이미 mockDeploymentFlowData에 있으면 그냥 ID 반환
    if (mockDeploymentFlowData[deploymentId]) {
        return deploymentId;
    }

    const repo = mockRepositories.find(r => r.id === repoId);
    const repoName = repo?.name || 'unknown';

    // 새로운 DeploymentFlowData 생성
    mockDeploymentFlowData[deploymentId] = {
        id: deploymentId,
        status: 'PENDING',
        githubRunId: `${Math.floor(Math.random() * 1000000000)}`,
        githubRunUrl: `https://github.com/user/${repoName}/actions/runs/${Math.floor(Math.random() * 1000000000)}`,
        timings: {
            createdAt: deploymentItem.timings.startedAt,
            finishedAt: deploymentItem.timings.completedAt,
            duration: deploymentItem.timings.duration,
        },
        meta: {
            project: repoName,
            cluster: 'my-ecs-cluster',
            service: `${repoName}-service`,
            taskDefArn: `arn:aws:ecs:us-east-1:123456:task-definition/${repoName}:1`,
            imageTag: `${repoName}:${deploymentItem.commit.shortHash}`,
        },
        commit: {
            message: deploymentItem.commit.message,
            shortHash: deploymentItem.commit.shortHash,
            branch: deploymentItem.commit.branch,
            authorName: deploymentItem.commit.authorName,
        },
        steps: [
            {
                name: 'test',
                status: 'SUCCESS',
                duration: '15s',
                githubJobId: Math.floor(Math.random() * 100000000),
                startedAt: deploymentItem.timings.startedAt,
            },
        ],
    };

    // 기존 mockDeployments에도 추가 (하위 호환성)
    const stringId = `deploy-${deploymentId}`;
    mockDeployments[stringId] = {
        id: stringId,
        repositoryName: repoName,
        version: {
            commitSha: deploymentItem.commit.shortHash,
            commitMessage: deploymentItem.commit.message,
        },
        createdAt: deploymentItem.timings.startedAt,
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
                    imageTag: `${repoName}:${deploymentItem.commit.shortHash}`,
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
            },
            monitoring: {
                name: '모니터링',
                status: 'LOCKED',
            },
        },
    };

    return deploymentId;
}
