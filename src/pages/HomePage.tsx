import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Repository } from '@/lib/mock-data';
import { getRepositories } from '@/services/repository.service';
import { toast } from 'sonner';

export default function HomePage() {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRepositories()
            .then(setRepositories)
            .catch((err) => {
                console.error('리포지토리 로드 실패:', err);
                toast.error('리포지토리를 불러오는데 실패했습니다');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">로딩 중...</p>
            </div>
        );
    }

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
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">👤</div>
                        <span className="text-sm font-medium">관리자</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto py-8 px-4">
                <div className="mb-8 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">배포할 리포지토리를 선택하세요</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
                    {repositories.map((repo) => (
                        <Link key={repo.id} to={`/repo/${repo.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl">{repo.name}</CardTitle>
                                            <CardDescription className="mt-1"></CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">최근 배포</span>
                                            <span className="font-medium">{repo.deployedAt}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">커밋 해시</span>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {repo.commitHash}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <p className="text-sm text-muted-foreground line-clamp-1">{repo.commitMsg}</p>
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
