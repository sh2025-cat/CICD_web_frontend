import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { mockRepositories, createNewDeployment, type DeploymentListItem } from '@/lib/mock-data';
import { getDeploymentsByRepoId } from '@/services/repository.service';

export default function RepoDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const navigate = useNavigate();

    const [deployments, setDeployments] = useState<DeploymentListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const repo = mockRepositories.find((r) => r.id === id);

    useEffect(() => {
        getDeploymentsByRepoId(id)
            .then(setDeployments)
            .catch((err) => {
                console.error('배포 목록 로드 실패:', err);
                toast.error('배포 목록을 불러오는데 실패했습니다');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (!repo) {
        return <div>리포지토리를 찾을 수 없습니다</div>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">로딩 중...</p>
            </div>
        );
    }

    // 배포 가능 버전: pipelineStatus == "PENDING"
    const availableVersions = deployments.filter(
        (d) => d.pipelineStatus === 'PENDING'
    );

    // 배포 내역: pipelineStatus가 "SUCCESS", "FAILED", "INPROGRESS"
    const deploymentHistory = deployments.filter(
        (d) => ['SUCCESS', 'FAILED', 'INPROGRESS'].includes(d.pipelineStatus)
    );

    const handleDeploy = (deployment: DeploymentListItem) => {
        const deploymentId = createNewDeployment(id, deployment);
        navigate(`/deploy/${deploymentId}`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
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
                {/* Repository Summary */}
                <Card className="mb-8 max-w-3xl mx-auto">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-3xl">{repo.name}</CardTitle>
                                <CardDescription className="mt-2"></CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">최근 배포 일시</p>
                                <p className="font-medium">{repo.deployedAt}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">커밋 해시</p>
                                <Badge variant="outline" className="font-mono text-xs">
                                    {repo.commitHash}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">커밋 메시지</p>
                            <p className="mt-1">{repo.commitMsg}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4 max-w-3xl mx-auto">
                    {/* Version List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>배포 가능 버전 리스트</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availableVersions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    배포 가능한 버전이 없습니다
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>커밋</TableHead>
                                            <TableHead>메시지</TableHead>
                                            <TableHead className="text-center">배포</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {availableVersions.map((deployment) => (
                                            <TableRow key={deployment.deploymentId}>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {deployment.commit.shortHash}
                                                    </code>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        CI 완료: {deployment.timings.completedAt}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <p className="line-clamp-2 text-sm">{deployment.commit.message}</p>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDeploy(deployment)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                                    >
                                                        배포
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Deployment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>배포 내역</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {deploymentHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    배포 내역이 없습니다
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {deploymentHistory.map((deployment) => (
                                        <Link
                                            key={deployment.deploymentId}
                                            to={`/deploy/${deployment.deploymentId}?lastStep=${deployment.lastStep}`}
                                        >
                                            <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                                <div className="flex items-start justify-between mb-2">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {deployment.commit.shortHash}
                                                    </code>
                                                    <Badge
                                                        className={
                                                            deployment.pipelineStatus === 'SUCCESS'
                                                                ? 'bg-green-500 hover:bg-green-600'
                                                                : deployment.pipelineStatus === 'FAILED'
                                                                  ? 'bg-red-500 hover:bg-red-600'
                                                                  : 'bg-yellow-500 hover:bg-yellow-600'
                                                        }
                                                    >
                                                        {deployment.pipelineStatus === 'SUCCESS'
                                                            ? '성공'
                                                            : deployment.pipelineStatus === 'FAILED'
                                                              ? '실패'
                                                              : '진행중'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    {deployment.timings.startedAt}
                                                </p>
                                                <p className="text-xs line-clamp-2">{deployment.commit.message}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
