import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockRepositories } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">🐱</div>
            <h1 className="text-xl font-bold">Cat CICD</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
              👤
            </div>
            <span className="text-sm font-medium">관리자</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            배포할 리포지토리를 선택하세요
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {mockRepositories.map((repo) => (
            <Link key={repo.id} to={`/repo/${repo.type}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{repo.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {repo.type === 'frontend' ? '프론트엔드' : '백엔드'} 리포지토리
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        repo.lastDeployment.result === 'SUCCESS'
                          ? 'bg-green-500 hover:bg-green-600'
                          : repo.lastDeployment.result === 'FAILED'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }
                    >
                      {repo.lastDeployment.result === 'SUCCESS'
                        ? '성공'
                        : repo.lastDeployment.result === 'FAILED'
                        ? '실패'
                        : '진행중'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">최근 배포</span>
                      <span className="font-medium">{repo.lastDeployment.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">현재 라이브 환경</span>
                      <Badge variant="outline">{repo.currentEnvironment}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">현재 버전</span>
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
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {repo.currentVersion.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            disabled
            className="gap-2"
            onClick={() => toast.info('추후 지원 예정입니다')}
          >
            <span>+</span>
            리포지토리 추가
          </Button>
        </div>
      </main>
    </div>
  );
}
