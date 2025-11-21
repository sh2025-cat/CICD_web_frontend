import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

import testVideo from '@/assets/tree/test.mp4';
import securityVideo from '@/assets/tree/security.mp4';
import buildVideo from '@/assets/tree/build.mp4';
import infraVideo from '@/assets/tree/infra.mp4';
import deployVideo from '@/assets/tree/deploy.mp4';

type TreeStage = 'test' | 'security' | 'build' | 'infrastructure' | 'deploy' | 'monitoring';

interface TreeVisualizationProps {
  stage: TreeStage;
  className?: string;
}

interface VideoConfig {
  src: string;
  playbackRate: number;
  startTime?: number;
  endTime?: number;
}

const stageVideoConfig: Record<TreeStage, VideoConfig> = {
  test: {
    src: testVideo,
    playbackRate: 1.5,
  },
  security: {
    src: securityVideo,
    playbackRate: 1.5,
  },
  build: {
    src: buildVideo,
    playbackRate: 1.0,
  },
  infrastructure: {
    src: infraVideo,
    playbackRate: 1.0,
  },
  deploy: {
    src: deployVideo,
    playbackRate: 0.5,
    startTime: 1,
    endTime: 4,
  },
  monitoring: {
    src: deployVideo,
    playbackRate: 0.5,
    startTime: 3,
    endTime: 4,
  },
};

export function TreeVisualization({ stage, className }: TreeVisualizationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const config = stageVideoConfig[stage];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = config.playbackRate;

    if (config.startTime !== undefined) {
      video.currentTime = config.startTime;
    }

    video.play();

    const handleTimeUpdate = () => {
      if (config.endTime !== undefined && video.currentTime >= config.endTime) {
        video.currentTime = config.startTime ?? 0;
        video.play();
      }
    };

    const handleEnded = () => {
      if (config.startTime !== undefined) {
        video.currentTime = config.startTime;
      } else {
        video.currentTime = 0;
      }
      video.play();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [stage, config]);

  return (
    <div className={cn('', className)}>
      <video
        ref={videoRef}
        src={config.src}
        muted
        playsInline
        className="h-[430px] w-auto"
      />
    </div>
  );
}

export function getTreeStageFromDeployment(deployment: any): TreeStage {
  const { stages } = deployment;

  if (stages.monitoring.status === 'SUCCESS' || stages.monitoring.status === 'RUNNING') return 'monitoring';
  if (stages.deploy.status === 'SUCCESS' || stages.deploy.status === 'RUNNING') return 'deploy';
  if (stages.infrastructure.status === 'SUCCESS' || stages.infrastructure.status === 'RUNNING') return 'infrastructure';
  if (stages.build.status === 'SUCCESS' || stages.build.status === 'RUNNING') return 'build';
  if (stages.security.status === 'SUCCESS' || stages.security.status === 'RUNNING') return 'security';

  return 'test';
}
