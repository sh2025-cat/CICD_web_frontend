import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Lock, ChevronRight } from 'lucide-react';
import { mockDeployments, mockDeploymentFlowData, type Deployment, type CIStatus, type DeploymentFlowData, type Repository } from '@/lib/mock-data';
import { TreeVisualization, getTreeStageFromDeployment } from '@/components/tree-visualization';
import { toast } from 'sonner';
import { streamDeploymentLogs, getDeploymentFlow, updateDeploymentStep } from '@/services/deployment.service';

export default function DeploymentFlowPage() {
    const params = useParams();
    const deploymentId = params.deploymentId as string;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // 이전 페이지에서 전달받은 리포지토리 데이터
    const repo = (location.state as { repo?: Repository })?.repo || null;

    // 숫자 ID면 새로운 mockDeploymentFlowData 사용, 문자열이면 기존 mockDeployments 사용
    const isNumericId = !isNaN(Number(deploymentId));
    const numericId = Number(deploymentId);

    // 새로운 구조를 기존 Deployment 타입으로 변환하는 임시 함수
    const convertToOldStructure = (flowData: typeof mockDeploymentFlowData[number]): Deployment | undefined => {
        if (!flowData) return undefined;

        return {
            id: `deploy-${flowData.id}`,
            repositoryName: flowData.meta.project,
            version: {
                commitSha: flowData.commit.shortHash,
                commitMessage: flowData.commit.message,
            },
            createdAt: flowData.timings.createdAt,
            currentStage: '배포',
            stages: {
                test: { name: '테스트', status: flowData.steps.find(s => s.name === 'test')?.status as CIStatus || 'LOCKED' },
                security: { name: '보안 점검', status: flowData.steps.find(s => s.name === 'security')?.status as CIStatus || 'LOCKED' },
                build: { name: '빌드', status: flowData.steps.find(s => s.name === 'build')?.status as CIStatus || 'LOCKED' },
                infrastructure: { name: '인프라 상태 확인', status: flowData.steps.find(s => s.name === 'infra')?.status as CIStatus || 'LOCKED' },
                deploy: { name: '배포', status: flowData.steps.find(s => s.name === 'deploy')?.status as CIStatus || 'LOCKED' },
                monitoring: { name: '모니터링', status: flowData.steps.find(s => s.name === 'monitoring')?.status as CIStatus || 'LOCKED' },
            },
        };
    };

    const [deployment, setDeployment] = useState<Deployment | undefined>(
        isNumericId
            ? convertToOldStructure(mockDeploymentFlowData[numericId])
            : mockDeployments[deploymentId]
    );
    const [deploymentFlowData, setDeploymentFlowData] = useState<DeploymentFlowData | null>(null);
    const [selectedStageKey, setSelectedStageKey] = useState<string>('test');
    const [logs, setLogs] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);

    // API로부터 배포 플로우 데이터 가져오기
    useEffect(() => {
        if (isNumericId) {
            getDeploymentFlow(numericId)
                .then((data) => {
                    setDeploymentFlowData(data);
                    // deployment도 업데이트
                    setDeployment(convertToOldStructure(data));

                    // URL query parameter의 lastStep 사용, 없으면 steps 배열의 마지막 단계 사용
                    const lastStepParam = searchParams.get('lastStep');
                    if (lastStepParam) {
                        // lastStep을 stageKey로 변환 (infra -> infrastructure)
                        const lastStageKey = lastStepParam === 'infra' ? 'infrastructure' : lastStepParam;
                        setSelectedStageKey(lastStageKey);
                    } else if (data.steps && data.steps.length > 0) {
                        // query parameter 없으면 steps 배열의 마지막 단계 사용
                        const lastStep = data.steps[data.steps.length - 1];
                        const lastStageKey = lastStep.name === 'infra' ? 'infrastructure' : lastStep.name;
                        setSelectedStageKey(lastStageKey);
                    }
                })
                .catch((err) => {
                    console.error('배포 플로우 로드 실패:', err);
                    toast.error('배포 정보를 불러오는데 실패했습니다');
                });
        }
    }, [isNumericId, numericId]);

    useEffect(() => {
        if (!deployment) return;

        const deployStage = deployment.stages.deploy;

        if (deployStage.status === 'RUNNING') {
            if (deployStage.deployStep === 'deploying') {
                const timer = setTimeout(() => {
                    setDeployment((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            stages: {
                                ...prev.stages,
                                deploy: {
                                    ...prev.stages.deploy,
                                    deployStep: 'deployed',
                                },
                            },
                        };
                    });
                    toast.success('배포가 완료되었습니다. 전환을 진행해주세요.');
                }, 3000);
                return () => clearTimeout(timer);
            }

            if (deployStage.deployStep === 'switching') {
                const timer = setTimeout(() => {
                    setDeployment((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            stages: {
                                ...prev.stages,
                                deploy: {
                                    ...prev.stages.deploy,
                                    deployStep: 'switched',
                                    status: 'SUCCESS',
                                },
                            },
                        };
                    });
                    toast.success('Blue → Green 전환이 완료되었습니다.');
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [deployment?.stages.deploy.deployStep, deployment?.stages.deploy.status]);

    useEffect(() => {
        if (deployment) {
            const stages = [
                { key: 'test', status: deployment.stages.test.status },
                { key: 'security', status: deployment.stages.security.status },
                { key: 'build', status: deployment.stages.build.status },
                { key: 'infrastructure', status: deployment.stages.infrastructure.status },
                { key: 'deploy', status: deployment.stages.deploy.status },
                { key: 'monitoring', status: deployment.stages.monitoring.status },
            ];

            const currentRunning = stages.find((s) => s.status === 'RUNNING');
            if (currentRunning) {
                setSelectedStageKey(currentRunning.key);
            } else {
                const activeStages = stages.filter((s) => s.status !== 'LOCKED');
                if (activeStages.length > 0) {
                    setSelectedStageKey(activeStages[activeStages.length - 1].key);
                }
            }
        }
    }, [deployment]);

    // SSE 로그 스트리밍
    useEffect(() => {
        if (!deploymentFlowData) {
            console.log('[SSE] deploymentFlowData not loaded yet');
            return;
        }

        const currentStep = deploymentFlowData.steps.find((s) => {
            const stageKey = s.name === 'infra' ? 'infrastructure' : s.name;
            return stageKey === selectedStageKey;
        });

        console.log(`[SSE] Selected stage: ${selectedStageKey}, Found step:`, currentStep);

        if (!currentStep) {
            console.log('[SSE] No step found for this stage, clearing logs');
            setLogs([]);
            setIsStreaming(false);
            return;
        }

        // 로그 초기화 및 스트리밍 시작
        setLogs([]);
        setIsStreaming(true);

        // SSE 스트리밍 시작
        const eventSource = streamDeploymentLogs(
            deploymentFlowData.id,
            currentStep.githubJobId,
            (logLine) => {
                setLogs((prev) => [...prev, logLine]);
            },
            () => {
                console.log(`${selectedStageKey} 로그 스트리밍 완료`);
                setIsStreaming(false);
            }
        );

        return () => {
            eventSource.close();
            setIsStreaming(false);
        };
    }, [deploymentFlowData, selectedStageKey]);

    if (!deployment) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">배포를 찾을 수 없습니다</h2>
                    <Link to="/">
                        <Button>홈으로 돌아가기</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const stages = [
        { key: 'test', name: '테스트', status: deployment.stages.test.status },
        { key: 'security', name: '보안 점검', status: deployment.stages.security.status },
        { key: 'build', name: '빌드', status: deployment.stages.build.status },
        { key: 'infrastructure', name: '인프라 상태 확인', status: deployment.stages.infrastructure.status },
        { key: 'deploy', name: '배포', status: deployment.stages.deploy.status },
        { key: 'monitoring', name: '모니터링', status: deployment.stages.monitoring.status },
    ];

    const handleNextStage = async () => {
        const currentIndex = stages.findIndex((s) => s.key === selectedStageKey);
        if (currentIndex === -1 || currentIndex === stages.length - 1) return;

        const nextStage = stages[currentIndex + 1];

        if (nextStage.status !== 'LOCKED') {
            setSelectedStageKey(nextStage.key);
            return;
        }

        const currentStageIndex = stages.findIndex((s) => s.status === 'RUNNING');
        const lastSuccessIndex = stages.findLastIndex((s) => s.status === 'SUCCESS');

        const nextIndex = currentStageIndex !== -1 ? currentStageIndex + 1 : lastSuccessIndex + 1;

        if (nextIndex >= stages.length) return;

        if (stages[lastSuccessIndex]?.key === 'deploy' && deployment.stages.deploy.deployStep !== 'switched') {
            toast.error('Blue → Green 전환을 먼저 진행해주세요');
            return;
        }

        const nextStageKey = stages[nextIndex].key as keyof typeof deployment.stages;

        // API 호출: 다음 단계 업데이트
        if (isNumericId) {
            try {
                // infrastructure -> infra로 변환
                const stepName = nextStageKey === 'infrastructure' ? 'infra' : nextStageKey;
                await updateDeploymentStep(numericId, stepName as any);

                // 성공하면 deploymentFlowData 다시 가져오기
                const updatedData = await getDeploymentFlow(numericId);
                setDeploymentFlowData(updatedData);
                setDeployment(convertToOldStructure(updatedData));
                setSelectedStageKey(nextStageKey);
            } catch (error) {
                console.error('Failed to update deployment step:', error);
                toast.error('다음 단계로 진행하는데 실패했습니다');
            }
            return;
        }

        // Mock 모드 (문자열 ID) - 기존 로직
        const updatedDeployment = { ...deployment };

        if (nextStageKey === 'deploy') {
            updatedDeployment.stages[nextStageKey].status = 'RUNNING';
            if (!updatedDeployment.stages[nextStageKey].deployStep) {
                updatedDeployment.stages[nextStageKey].deployStep = 'initial';
            }
        } else if (nextStageKey === 'monitoring') {
            updatedDeployment.stages[nextStageKey].status = 'SUCCESS';
        } else {
            updatedDeployment.stages[nextStageKey].status = 'SUCCESS';
        }

        updatedDeployment.currentStage = stages[nextIndex].name;

        setDeployment(updatedDeployment);
        setSelectedStageKey(nextStageKey);
    };

    const handlePrevStage = () => {
        const currentIndex = stages.findIndex((s) => s.key === selectedStageKey);
        if (currentIndex > 0) {
            setSelectedStageKey(stages[currentIndex - 1].key);
        }
    };

    const canProceed = () => {
        const currentIndex = stages.findIndex((s) => s.key === selectedStageKey);
        if (currentIndex === -1 || currentIndex === stages.length - 1) return false;

        const nextStage = stages[currentIndex + 1];
        const currentStage = stages[currentIndex];

        if (nextStage.status !== 'LOCKED') return true;

        if (currentStage.status === 'SUCCESS') return true;

        if (currentStage.key === 'deploy' && deployment.stages.deploy.deployStep !== 'switched') return false;

        return false;
    };

    const getStatusIcon = (status: CIStatus) => {
        if (status === 'SUCCESS') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        if (status === 'FAILED') return <XCircle className="h-5 w-5 text-red-500" />;
        if (status === 'RUNNING') return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
        return <Lock className="h-5 w-5 text-muted-foreground" />;
    };

    const renderStageContent = () => {
        // SSE 로그가 실제로 있을 때만 로그 표시
        const showSSELogs = deploymentFlowData && logs.length > 0;

        if (showSSELogs) {
            return (
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            {isStreaming && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isStreaming ? '실시간 로그' : '로그'}
                        </h4>
                        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
                            {logs.map((line, i) => (
                                <div key={i} className="whitespace-pre-wrap break-all">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            );
        }

        switch (selectedStageKey) {
            case 'test':
                return (
                    <CardContent className="space-y-4">
                        {deployment.stages.test.status === 'FAILED' && deployment.stages.test.details && (
                            <>
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <h4 className="font-semibold text-destructive mb-2">테스트 실패</h4>
                                    <p className="text-sm mb-2">
                                        실패한 테스트: {deployment.stages.test.details.failedTests}개 / 전체:{' '}
                                        {deployment.stages.test.details.totalTests}개
                                    </p>
                                    <div className="space-y-1 mb-3">
                                        {deployment.stages.test.details.failedTestNames?.map(
                                            (name: string, i: number) => (
                                                <p key={i} className="text-sm text-muted-foreground">
                                                    • {name}
                                                </p>
                                            )
                                        )}
                                    </div>
                                    <div className="bg-background p-3 rounded border font-mono text-xs overflow-x-auto">
                                        <pre className="whitespace-pre-wrap break-all">
                                            {deployment.stages.test.details.logs}
                                        </pre>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    ⚠️ 테스트가 통과해야 다음 단계로 진행할 수 있습니다.
                                </p>
                            </>
                        )}
                        {deployment.stages.test.status === 'SUCCESS' && deployment.stages.test.details && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">전체 테스트</span>
                                    <span className="font-medium">{deployment.stages.test.details.totalTests}개</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">실패</span>
                                    <span className="font-medium text-green-500">
                                        {deployment.stages.test.details.failedTests}개
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">커버리지</span>
                                    <span className="font-medium">{deployment.stages.test.details.coverage}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                );
            case 'security':
                return (
                    <CardContent className="space-y-4">
                        {deployment.stages.security.details?.vulnerabilities?.length > 0 && (
                            <>
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-semibold text-yellow-800 mb-3">
                                        ⚠️ 보안 취약점이 발견되었습니다
                                    </h4>
                                    <div className="space-y-3">
                                        {deployment.stages.security.details.vulnerabilities.map(
                                            (vuln: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="p-3 bg-background rounded border border-yellow-100"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h5 className="font-medium text-sm">{vuln.title}</h5>
                                                        <Badge
                                                            variant="secondary"
                                                            className={
                                                                vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH'
                                                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                            }
                                                        >
                                                            {vuln.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        {vuln.file}:{vuln.line}
                                                    </p>
                                                    {vuln.description && <p className="text-sm">{vuln.description}</p>}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    ℹ️ 취약점이 발견되었지만 배포는 계속 진행할 수 있습니다. 가능한 빠른 시일 내에
                                    수정하는 것을 권장합니다.
                                </p>
                            </>
                        )}
                        {(!deployment.stages.security.details?.vulnerabilities ||
                            deployment.stages.security.details.vulnerabilities.length === 0) && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">✓ 보안 취약점이 발견되지 않았습니다</p>
                            </div>
                        )}
                    </CardContent>
                );
            case 'build':
                return (
                    <CardContent className="space-y-4">
                        {deployment.stages.build.status === 'FAILED' && deployment.stages.build.details && (
                            <>
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <h4 className="font-semibold text-destructive mb-2">빌드 실패</h4>
                                    <p className="text-sm mb-2">
                                        실패한 스텝: {deployment.stages.build.details.failedStep}
                                    </p>
                                    <p className="text-sm mb-2">
                                        Exit Code: {deployment.stages.build.details.exitCode}
                                    </p>
                                    <div className="bg-background p-3 rounded border font-mono text-xs overflow-x-auto">
                                        <pre className="whitespace-pre-wrap break-all">
                                            {deployment.stages.build.details.logs}
                                        </pre>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    ⚠️ 빌드가 성공해야 다음 단계로 진행할 수 있습니다.
                                </p>
                            </>
                        )}
                        {deployment.stages.build.status === 'SUCCESS' && deployment.stages.build.details && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">이미지 태그</span>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                        {deployment.stages.build.details.imageTag}
                                    </code>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">빌드 시간</span>
                                    <span className="font-medium">{deployment.stages.build.details.buildTime}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                );
            case 'infrastructure':
                return (
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">ECS 서비스 상태</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">서비스 이름</span>
                                        <span className="font-medium">cat-fe-service</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">태스크 수</span>
                                        <span className="font-medium">2 / 2 / 0 (desired / running / pending)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Task Definition</span>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">cat-fe-task:12</code>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Target Group 상태</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Blue 타겟 그룹</span>
                                        <span className="font-medium text-green-500">헬시: 2개</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Green 타겟 그룹</span>
                                        <span className="font-medium text-green-500">헬시: 2개</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">현재 트래픽</span>
                                        <Badge variant="outline">Blue</Badge>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">메트릭 (최근 5분)</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">CPU 사용률</span>
                                        <span className="font-medium">23.5%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">메모리 사용률</span>
                                        <span className="font-medium">45.2%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                );
            case 'deploy':
                const deployStep = deployment.stages.deploy.deployStep || 'initial';
                const isDeployFailed = deployment.stages.deploy.status === 'FAILED';

                return (
                    <CardContent className="space-y-4">
                        {isDeployFailed && deployment.stages.deploy.details && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                                <h4 className="font-semibold text-destructive mb-2">
                                    {deployment.stages.deploy.details.error || '배포 실패'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {deployment.stages.deploy.details.message}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">현재 라이브 환경</span>
                                <Badge variant={deployStep === 'switched' ? 'default' : 'outline'}>
                                    {deployStep === 'switched' ? 'Green' : 'Blue'}
                                </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">배포 대상 환경</span>
                                <Badge variant="outline">Green</Badge>
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="text-left p-2">항목</th>
                                        <th className="text-left p-2">이전 (Blue)</th>
                                        <th className="text-left p-2">이후 (Green)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="p-2 text-muted-foreground">Commit</td>
                                        <td className="p-2">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">a3f2c1d</code>
                                        </td>
                                        <td className="p-2">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {deployment.version.commitSha}
                                            </code>
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="p-2 text-muted-foreground">이미지 태그</td>
                                        <td className="p-2 text-xs">cat-frontend:a3f2c1d</td>
                                        <td className="p-2 text-xs">cat-frontend:{deployment.version.commitSha}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-2">
                            {isDeployFailed ? (
                                <Button
                                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                                    variant="outline"
                                    onClick={() => toast.info('재시도 기능은 준비 중입니다.')}
                                >
                                    <Loader2 className="mr-2 h-4 w-4" />
                                    재시도
                                </Button>
                            ) : (
                                <>
                                    {deployStep === 'initial' && (
                                        <Button
                                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                                            onClick={() => {
                                                setDeployment((prev) => {
                                                    if (!prev) return prev;
                                                    return {
                                                        ...prev,
                                                        stages: {
                                                            ...prev.stages,
                                                            deploy: { ...prev.stages.deploy, deployStep: 'deploying' },
                                                        },
                                                    };
                                                });
                                            }}
                                        >
                                            배포 시작
                                        </Button>
                                    )}

                                    {deployStep === 'deploying' && (
                                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            배포 진행 중...
                                        </Button>
                                    )}

                                    {(deployStep === 'deployed' || deployStep === 'switching') && (
                                        <>
                                            <Button
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                                onClick={() => {
                                                    setDeployment((prev) => {
                                                        if (!prev) return prev;
                                                        return {
                                                            ...prev,
                                                            stages: {
                                                                ...prev.stages,
                                                                deploy: {
                                                                    ...prev.stages.deploy,
                                                                    deployStep: 'switching',
                                                                },
                                                            },
                                                        };
                                                    });
                                                }}
                                                disabled={deployStep === 'switching'}
                                            >
                                                {deployStep === 'switching' ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        전환 중...
                                                    </>
                                                ) : (
                                                    '전환하기'
                                                )}
                                            </Button>
                                            <Button
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={() => {
                                                    if (confirm('배포를 취소하시겠습니까?')) {
                                                        setDeployment((prev) => {
                                                            if (!prev) return prev;
                                                            return {
                                                                ...prev,
                                                                stages: {
                                                                    ...prev.stages,
                                                                    deploy: {
                                                                        ...prev.stages.deploy,
                                                                        deployStep: 'initial',
                                                                    },
                                                                },
                                                            };
                                                        });
                                                        toast.info('배포가 취소되었습니다.');
                                                    }
                                                }}
                                                disabled={deployStep === 'switching'}
                                            >
                                                배포 취소
                                            </Button>
                                        </>
                                    )}

                                    {deployStep === 'switched' && (
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                                disabled
                                                variant="secondary"
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                전환 완료
                                            </Button>
                                            <Button
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={() => toast.info('롤백 기능은 추후 지원 예정입니다.')}
                                            >
                                                롤백
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                );
            case 'monitoring':
                return (
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">CPU 사용률</p>
                                <p className="text-2xl font-bold">24.3%</p>
                                <p className="text-xs text-green-500 mt-1">↓ 배포 전 대비 -2.1%</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">5xx 에러</p>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-xs text-green-500 mt-1">✓ 정상</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">요청 수</p>
                                <p className="text-2xl font-bold">1,234</p>
                                <p className="text-xs text-muted-foreground mt-1">최근 5분</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">응답 시간</p>
                                <p className="text-2xl font-bold">145ms</p>
                                <p className="text-xs text-green-500 mt-1">↓ 배포 전 대비 -12ms</p>
                            </div>
                        </div>
                    </CardContent>
                );
            default:
                return null;
        }
    };

    const treeStage = getTreeStageFromDeployment(deployment);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-primary">🐱</div>
                            <h1 className="text-xl font-bold">Cat CICD</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">👤</div>
                        <span className="text-sm font-medium">관리자</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
                {/* Deployment Summary */}
                <Card className="mb-8 max-w-3xl mx-auto">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{deployment.repositoryName}</CardTitle>
                                <CardDescription className="mt-2">배포 ID: {deployment.id}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">배포 대상 버전</p>
                                <div className="flex items-center gap-2">
                                    {deployment.version.tag && (
                                        <Badge variant="outline" className="font-mono">
                                            {deployment.version.tag}
                                        </Badge>
                                    )}
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                        {deployment.version.commitSha}
                                    </code>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">생성 시각</p>
                                <p className="text-sm font-medium">{deployment.createdAt}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">커밋 메시지</p>
                                <p className="text-sm font-medium line-clamp-1">{deployment.version.commitMessage}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Stepper */}
                <div className="mb-8 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        {stages.map((stage, index) => (
                            <div
                                key={stage.key}
                                className="relative flex flex-col items-center flex-1 cursor-pointer group"
                                onClick={() => {
                                    if (stage.status !== 'LOCKED') {
                                        setSelectedStageKey(stage.key);
                                    }
                                }}
                            >
                                <div
                                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                                        selectedStageKey === stage.key ? 'ring-2 ring-primary ring-offset-2' : ''
                                    } ${
                                        stage.status === 'SUCCESS'
                                            ? 'bg-green-100 border-green-500'
                                            : stage.status === 'FAILED'
                                            ? 'bg-red-100 border-red-500'
                                            : stage.status === 'RUNNING'
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'bg-muted border-muted-foreground'
                                    }`}
                                >
                                    {getStatusIcon(stage.status)}
                                </div>
                                <p
                                    className={`mt-2 text-xs text-center font-medium ${
                                        selectedStageKey === stage.key
                                            ? 'font-bold text-primary'
                                            : index ===
                                              stages.findIndex((s) => s.status === 'RUNNING' || s.status === 'FAILED')
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {stage.name}
                                </p>
                                {index < stages.length - 1 && (
                                    <>
                                        <div
                                            className={`absolute top-6 left-1/2 w-full h-0.5 -z-0 ${
                                                stage.status === 'SUCCESS' ? 'bg-green-500' : 'bg-muted'
                                            }`}
                                        />
                                        <div
                                            className={`absolute top-6 right-0 -translate-y-1/2 translate-x-1/2 z-0 ${
                                                stage.status === 'SUCCESS' ? 'text-green-500' : 'text-muted-foreground'
                                            }`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-4 items-start">
                    {/* Stage Details Panel */}
                    <div className="space-y-4 w-[500px]">
                        <Card className="h-[350px] flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {stages.find((s) => s.key === selectedStageKey)?.name}
                                    </CardTitle>
                                    <Badge
                                        className={
                                            (() => {
                                                // deploymentFlowData의 steps에서 status 가져오기
                                                let status;
                                                if (deploymentFlowData) {
                                                    const stepName = selectedStageKey === 'infrastructure' ? 'infra' : selectedStageKey;
                                                    const step = deploymentFlowData.steps.find(s => s.name === stepName);
                                                    status = step?.status || deployment.stages[selectedStageKey as keyof typeof deployment.stages].status;
                                                } else {
                                                    status = deployment.stages[selectedStageKey as keyof typeof deployment.stages].status;
                                                }

                                                if (status === 'SUCCESS') return 'bg-green-500 hover:bg-green-600';
                                                if (status === 'FAILED') return 'bg-red-500 hover:bg-red-600';
                                                if (status === 'RUNNING') return 'bg-blue-500 hover:bg-blue-600';
                                                return 'bg-secondary text-secondary-foreground';
                                            })()
                                        }
                                    >
                                        {(() => {
                                            // deploymentFlowData의 steps에서 status 가져오기
                                            let status;
                                            if (deploymentFlowData) {
                                                const stepName = selectedStageKey === 'infrastructure' ? 'infra' : selectedStageKey;
                                                const step = deploymentFlowData.steps.find(s => s.name === stepName);
                                                status = step?.status || deployment.stages[selectedStageKey as keyof typeof deployment.stages].status;
                                            } else {
                                                status = deployment.stages[selectedStageKey as keyof typeof deployment.stages].status;
                                            }

                                            if (status === 'SUCCESS') return '성공';
                                            if (status === 'FAILED') return '실패';
                                            if (status === 'RUNNING') return '진행 중';
                                            return '대기';
                                        })()}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <div className="flex-1 overflow-y-auto">{renderStageContent()}</div>
                        </Card>

                        {/* Action Buttons */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={handlePrevStage}
                                            disabled={stages.findIndex((s) => s.key === selectedStageKey) === 0}
                                        >
                                            이전 단계
                                        </Button>
                                        <Button
                                            variant="default"
                                            className="flex-1"
                                            disabled={!canProceed()}
                                            onClick={handleNextStage}
                                        >
                                            다음 단계
                                        </Button>
                                    </div>
                                    {!canProceed() && (
                                        <p className="text-sm text-muted-foreground text-center">
                                            이전 단계를 완료해야 다음 단계로 진행할 수 있습니다
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tree Visualization Panel */}
                    <div>
                        <Card className="overflow-hidden">
                            <TreeVisualization stage={treeStage} />
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
