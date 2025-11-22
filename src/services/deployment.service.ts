import { mockDeploymentFlowData } from '@/lib/mock-data';
import type { DeploymentFlowData, StepName } from '@/lib/mock-data';
import apiClient from '@/api/client';

/**
 * 배포 플로우 상세 정보 조회
 * GET /api/repos/deployment/{deploymentId}
 */
export async function getDeploymentFlow(deploymentId: number): Promise<DeploymentFlowData> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        const deployment = mockDeploymentFlowData[deploymentId];
        if (!deployment) {
            throw new Error(`Deployment ${deploymentId} not found`);
        }
        return deployment;
    }

    const response = await apiClient.get<{ data: DeploymentFlowData }>(
        `/api/repos/deployment/${deploymentId}`
    );
    return response.data.data;
}

/**
 * Mock SSE 로그 생성
 */
function generateMockLogs(stepName: StepName): string[] {
    const logs: Record<StepName, string[]> = {
        test: [
            '[2025-11-22 10:00:00] 테스트 시작...',
            '[2025-11-22 10:00:01] 의존성 설치 중...',
            '[2025-11-22 10:00:03] npm install 완료',
            '[2025-11-22 10:00:04] 테스트 실행 중...',
            '[2025-11-22 10:00:08] ✓ 컴포넌트 렌더링 테스트 통과',
            '[2025-11-22 10:00:09] ✓ API 호출 테스트 통과',
            '[2025-11-22 10:00:10] ✓ 상태 관리 테스트 통과',
            '[2025-11-22 10:00:12] 전체 테스트: 156개 통과, 0개 실패',
            '[2025-11-22 10:00:13] 커버리지: 87.5%',
            '[2025-11-22 10:00:15] ✅ 테스트 완료',
        ],
        security: [
            '[2025-11-22 10:00:16] 보안 점검 시작...',
            '[2025-11-22 10:00:17] 의존성 취약점 스캔 중...',
            '[2025-11-22 10:00:20] npm audit 실행',
            '[2025-11-22 10:00:25] 취약점 0개 발견',
            '[2025-11-22 10:00:26] 코드 보안 분석 중...',
            '[2025-11-22 10:00:30] SQL Injection 검사 통과',
            '[2025-11-22 10:00:32] XSS 취약점 검사 통과',
            '[2025-11-22 10:00:35] ✅ 보안 점검 완료',
        ],
        build: [
            '[2025-11-22 10:00:36] 빌드 시작...',
            '[2025-11-22 10:00:37] Vite 빌드 실행 중...',
            '[2025-11-22 10:00:40] 소스 파일 변환 중...',
            '[2025-11-22 10:00:50] TypeScript 컴파일 완료',
            '[2025-11-22 10:01:00] 번들 최적화 중...',
            '[2025-11-22 10:01:10] 번들 크기: 245.3 KB',
            '[2025-11-22 10:01:15] Docker 이미지 빌드 중...',
            '[2025-11-22 10:01:20] 이미지 태그: cicd_frontend:a3f2c1d',
            '[2025-11-22 10:01:25] ✅ 빌드 완료',
        ],
        infra: [
            '[2025-11-22 10:01:26] 인프라 상태 확인 중...',
            '[2025-11-22 10:01:27] ECS 클러스터 상태 확인...',
            '[2025-11-22 10:01:30] 클러스터: my-ecs-cluster (정상)',
            '[2025-11-22 10:01:32] 서비스: frontend-service (실행 중)',
            '[2025-11-22 10:01:35] Target Group 헬스 체크...',
            '[2025-11-22 10:01:38] Blue: 정상 (2/2 healthy)',
            '[2025-11-22 10:01:40] Green: 준비 완료',
            '[2025-11-22 10:01:42] ✅ 인프라 확인 완료',
        ],
        deploy: [
            '[2025-11-22 10:01:43] 배포 시작...',
            '[2025-11-22 10:01:45] Green 환경에 새 태스크 배포 중...',
            '[2025-11-22 10:01:50] Task Definition 업데이트',
            '[2025-11-22 10:02:00] 새 태스크 시작 중...',
            '[2025-11-22 10:02:10] 헬스 체크 대기 중...',
            '[2025-11-22 10:02:20] Green 태스크 정상 (2/2)',
            '[2025-11-22 10:02:25] Blue → Green 트래픽 전환 준비',
            '[2025-11-22 10:02:30] ✅ 배포 완료',
        ],
        monitoring: [
            '[2025-11-22 10:02:31] 모니터링 시작...',
            '[2025-11-22 10:02:35] CloudWatch 메트릭 수집 중...',
            '[2025-11-22 10:02:40] CPU 사용률: 12.5%',
            '[2025-11-22 10:02:45] 메모리 사용률: 45.2%',
            '[2025-11-22 10:02:50] 응답 시간: 평균 125ms',
            '[2025-11-22 10:02:55] 5xx 에러: 0건',
            '[2025-11-22 10:03:00] ✅ 모니터링 정상',
        ],
    };

    return logs[stepName] || ['로그가 없습니다'];
}

/**
 * Mock EventSource (가짜 SSE 시뮬레이션)
 */
class MockEventSource {
    timers: number[] = [];
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();
    logs: string[];
    onLog: (logLine: string) => void;
    onComplete: () => void;

    constructor(
        logs: string[],
        onLog: (logLine: string) => void,
        onComplete: () => void
    ) {
        this.logs = logs;
        this.onLog = onLog;
        this.onComplete = onComplete;
        this.startStreaming();
    }

    addEventListener(type: string, listener: (event: MessageEvent) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type)!.push(listener);
    }

    startStreaming() {
        this.logs.forEach((log, index) => {
            const timer = window.setTimeout(() => {
                // event=log로 각 로그 라인 전송
                const event = new MessageEvent('log', { data: log });
                this.listeners.get('log')?.forEach((listener) => listener(event));
                this.onLog(log);

                // 마지막 로그면 complete 이벤트 전송
                if (index === this.logs.length - 1) {
                    const completeTimer = window.setTimeout(() => {
                        const completeEvent = new MessageEvent('complete', { data: '' });
                        this.listeners.get('complete')?.forEach((listener) => listener(completeEvent));
                        this.onComplete();
                    }, 500);
                    this.timers.push(completeTimer);
                }
            }, index * 500); // 0.5초 간격으로 로그 출력
            this.timers.push(timer);
        });
    }

    close() {
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers = [];
    }
}

/**
 * SSE 로그 스트리밍
 * GET /api/sse/jobs/{deploymentId}/{jobId}/logs/stream
 *
 * @param deploymentId - 배포 ID
 * @param jobId - GitHub Job ID
 * @param onLog - 로그 라인 수신 시 호출되는 콜백 (event=log일 때)
 * @param onComplete - 로그 스트리밍 완료 시 호출되는 콜백 (event=complete일 때)
 * @returns EventSource 인스턴스 (연결 종료 시 close() 호출 필요)
 */
export function streamDeploymentLogs(
    deploymentId: number,
    jobId: number,
    onLog: (logLine: string) => void,
    onComplete: () => void
): EventSource | MockEventSource {
    // Mock 모드
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        const deployment = mockDeploymentFlowData[deploymentId];
        if (!deployment) {
            console.error(`Deployment ${deploymentId} not found`);
            onComplete();
            return new MockEventSource([], onLog, onComplete);
        }

        const step = deployment.steps.find((s) => s.githubJobId === jobId);
        if (!step) {
            console.error(`Step with jobId ${jobId} not found`);
            onComplete();
            return new MockEventSource([], onLog, onComplete);
        }

        const mockLogs = generateMockLogs(step.name);
        return new MockEventSource(mockLogs, onLog, onComplete) as any;
    }

    // 실제 API 모드
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const url = `${baseUrl}/api/sse/jobs/${deploymentId}/${jobId}/logs/stream`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener('log', (event: MessageEvent) => {
        const logLine = event.data;
        onLog(logLine);
    });

    eventSource.addEventListener('complete', () => {
        onComplete();
        eventSource.close();
    });

    eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error);
        eventSource.close();
    };

    return eventSource;
}

/**
 * 배포 단계 업데이트 (다음 단계 진행)
 * POST /api/repos/{deploymentId}/next
 *
 * @param deploymentId - 배포 ID
 * @param step - 다음 진행할 단계 이름
 */
export async function updateDeploymentStep(
    deploymentId: number,
    step: StepName
): Promise<void> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        // Mock 모드에서는 실제 업데이트하지 않음
        console.log(`[Mock] Updating deployment ${deploymentId} to next step: ${step}`);
        return;
    }

    try {
        await apiClient.post(`/api/repos/${deploymentId}/next`, { step });
    } catch (error) {
        console.error('Failed to update deployment step:', error);
        throw error;
    }
}
