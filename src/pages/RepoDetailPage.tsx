import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { mockRepositories, mockVersions, mockDeploymentHistory, createNewDeployment, type Version } from '@/lib/mock-data';

export default function RepoDetailPage() {
  const params = useParams();
  const type = params.type as string;
  const navigate = useNavigate();

  const repo = mockRepositories.find(r => r.type === type);
  const versions = mockVersions[type] || [];
  const deploymentHistory = mockDeploymentHistory[type] || [];

  if (!repo) {
    return <div>리포지토리를 찾을 수 없습니다</div>;
  }

  const handleDeploy = (version: Version) => {
    const deploymentId = createNewDeployment(type, version);
    navigate(`/deploy/${deploymentId}`);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') return <Badge className="bg-green-500 hover:bg-green-600">성공</Badge>;
    if (status === 'FAILED') return <Badge className="bg-red-500 hover:bg-red-600">실패</Badge>;
    if (status === 'RUNNING') return <Badge className="bg-blue-500 hover:bg-blue-600">진행중</Badge>;
    return <Badge variant="outline">대기</Badge>;
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
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
              👤
            </div>
            <span className="text-sm font-medium">관리자</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6">
        {/* Repository Summary */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{repo.name}</CardTitle>
                <CardDescription className="mt-2">
                  {type === 'frontend' ? '프론트엔드' : '백엔드'} 리포지토리
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">최근 배포 일시</p>
                <p className="font-medium">{repo.lastDeployment.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">현재 라이브 환경</p>
                <Badge variant="outline">{repo.currentEnvironment}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">현재 라이브 버전</p>
                <div className="flex items-center gap-2">
                  {repo.currentVersion.tag && (
                    <Badge variant="outline" className="font-mono text-xs h-5">
                      {repo.currentVersion.tag}
                    </Badge>
                  )}
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {repo.currentVersion.commitSha}
                  </code>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">마지막 CI 상태</p>
                {getStatusBadge(repo.lastCIStatus)}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">커밋 메시지</p>
              <p className="mt-1">{repo.currentVersion.message}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deployment History */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>배포 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {deploymentHistory.map((deployment) => (
                    <Link key={deployment.id} to={`/deploy/${deployment.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {deployment.version}
                          </code>
                          <Badge
                            className={deployment.result === 'SUCCESS' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                          >
                            {deployment.result === 'SUCCESS' ? '성공' : '실패'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{deployment.date}</p>
                        <p className="text-xs text-muted-foreground">{deployment.targetEnvironment}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Version List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>버전 리스트</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>태그</TableHead>
                      <TableHead>커밋</TableHead>
                      <TableHead>메시지</TableHead>
                      <TableHead className="text-center">배포</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((version) => (
                      <TableRow key={version.commitSha}>
                        <TableCell>
                          {version.tag ? (
                            <Badge variant="outline" className="font-mono">
                              {version.tag}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {version.commitSha}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {version.timestamp}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2 text-sm">{version.commitMessage}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleDeploy(version)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            배포
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
