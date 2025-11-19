import { cn } from '@/lib/utils';

type TreeStage = 'initial' | 'seed' | 'sprout' | 'security' | 'small-tree' | 'watering' | 'full-tree';

interface TreeVisualizationProps {
  stage: TreeStage;
  className?: string;
}

export function TreeVisualization({ stage, className }: TreeVisualizationProps) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="relative w-full max-w-md aspect-square">
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="leaf-displacement" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            <filter id="bark-texture" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05 0.8" numOctaves="4" result="noise" />
              <feColorMatrix type="saturate" values="0" in="noise" result="grayscaleNoise" />
              <feComponentTransfer in="grayscaleNoise" result="adjustedNoise">
                <feFuncA type="linear" slope="0.6" />
              </feComponentTransfer>
              <feComposite operator="in" in="adjustedNoise" in2="SourceGraphic" result="texturedBark" />
              <feBlend mode="multiply" in="texturedBark" in2="SourceGraphic" />
            </filter>

            <filter id="soil-texture">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0" in="noise" result="coloredNoise" />
              <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="grain" />
              <feBlend mode="multiply" in="grain" in2="SourceGraphic" />
            </filter>

            <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
              <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
              <feComponentTransfer in="offsetBlur" result="shadow">
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feBlend mode="normal" in="SourceGraphic" in2="shadow" />
            </filter>

            <linearGradient id="trunk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3E2723" />
              <stop offset="40%" stopColor="#5D4037" />
              <stop offset="100%" stopColor="#281915" />
            </linearGradient>

            <radialGradient id="leaf-gradient-dark" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#2E7D32" />
              <stop offset="100%" stopColor="#1B5E20" />
            </radialGradient>

            <radialGradient id="leaf-gradient-mid" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#66BB6A" />
              <stop offset="100%" stopColor="#388E3C" />
            </radialGradient>

            <radialGradient id="leaf-gradient-light" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#A5D6A7" />
              <stop offset="100%" stopColor="#66BB6A" />
            </radialGradient>
          </defs>
        </svg>

        {stage === 'initial' && <InitialGround />}
        {stage === 'seed' && <SeedStage />}
        {stage === 'sprout' && <SproutStage />}
        {stage === 'security' && <SecurityStage />}
        {stage === 'small-tree' && <SmallTreeStage />}
        {stage === 'watering' && <WateringStage />}
        {stage === 'full-tree' && <FullTreeStage />}
      </div>
    </div>
  );
}

function InitialGround() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      <svg viewBox="0 0 400 100" className="w-full h-24 overflow-visible">
        <path
          d="M 20 100 C 80 90, 150 85, 200 85 C 250 85, 320 90, 380 100 Z"
          fill="#5D4037"
          filter="url(#soil-texture)"
        />
        <path
          d="M 0 100 L 400 100 L 400 120 L 0 120 Z"
          fill="#4E342E"
        />
      </svg>
      <div className="absolute bottom-12 text-center text-muted-foreground text-sm font-medium">
        배포를 시작하세요
      </div>
    </div>
  );
}

function SeedStage() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      <svg viewBox="0 0 400 150" className="w-full h-40 overflow-visible">
        <path
          d="M 20 150 C 80 140, 150 135, 200 135 C 250 135, 320 140, 380 150 Z"
          fill="#5D4037"
          filter="url(#soil-texture)"
        />

        <g transform="translate(200, 140)">
          <path
            d="M -6 0 C -8 -5, -8 -10, 0 -12 C 8 -10, 8 -5, 6 0 Z"
            fill="#3E2723"
            filter="url(#bark-texture)"
          />
          <circle cx="-2" cy="-2" r="1" fill="#5D4037" opacity="0.6" />
          <circle cx="3" cy="-4" r="1.5" fill="#5D4037" opacity="0.6" />
        </g>
      </svg>
      <div className="absolute bottom-4 text-center text-muted-foreground text-sm font-medium">
        씨앗을 심었습니다
      </div>
    </div>
  );
}

function SproutStage() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      <svg viewBox="0 0 400 200" className="w-full h-52 overflow-visible">
        <path
          d="M 20 200 C 80 190, 150 185, 200 185 C 250 185, 320 190, 380 200 Z"
          fill="#5D4037"
          filter="url(#soil-texture)"
        />

        <g transform="translate(200, 185)">
          <path
            d="M 0 0 C 2 -10, -2 -20, -1 -30"
            stroke="#689F38"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            filter="url(#bark-texture)"
          />

          <g transform="translate(-1, -30)">
            <path
              d="M 0 0 C -10 -5, -15 -15, -20 -10 C -15 -5, -5 0, 0 0 Z"
              fill="#81C784"
              filter="url(#leaf-displacement)"
            />
            <path
              d="M 0 0 C 10 -8, 15 -18, 22 -12 C 15 -2, 5 0, 0 0 Z"
              fill="#AED581"
              filter="url(#leaf-displacement)"
            />
          </g>
        </g>
      </svg>
      <div className="absolute bottom-4 text-center text-muted-foreground text-sm font-medium">
        새싹이 자라나고 있습니다
      </div>
    </div>
  );
}

function SecurityStage() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      <svg viewBox="0 0 400 220" className="w-full h-56 overflow-visible">
        <path
          d="M 20 220 C 80 210, 150 205, 200 205 C 250 205, 320 210, 380 220 Z"
          fill="#5D4037"
          filter="url(#soil-texture)"
        />

        <g transform="translate(200, 205)">
          <path
            d="M -2 0 C -3 -20, -4 -40, 0 -60 C 3 -40, 2 -20, 2 0 Z"
            fill="url(#trunk-gradient)"
            filter="url(#bark-texture)"
          />

          <path d="M 0 -40 C -10 -45, -20 -50, -25 -45" stroke="#5D4037" strokeWidth="2" fill="none" />
          <path d="M 0 -30 C 10 -35, 20 -40, 25 -35" stroke="#5D4037" strokeWidth="2" fill="none" />

          <g filter="url(#soft-shadow)">
            <path
              d="M -15 -60 C -25 -70, -15 -85, 0 -90 C 15 -85, 25 -70, 15 -60 Z"
              fill="url(#leaf-gradient-mid)"
              filter="url(#leaf-displacement)"
            />
            <path
              d="M -35 -45 C -40 -55, -30 -60, -20 -50 Z"
              fill="url(#leaf-gradient-dark)"
              filter="url(#leaf-displacement)"
            />
            <path
              d="M 20 -35 C 30 -45, 40 -40, 25 -30 Z"
              fill="url(#leaf-gradient-light)"
              filter="url(#leaf-displacement)"
            />
          </g>
        </g>
      </svg>
      <div className="absolute bottom-4 text-center text-muted-foreground text-sm font-medium">
        보안 점검 중입니다
      </div>
    </div>
  );
}

function SmallTreeStage() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      <svg viewBox="0 0 400 280" className="w-full h-72 overflow-visible">
        <path
          d="M 20 280 C 80 270, 150 265, 200 265 C 250 265, 320 270, 380 280 Z"
          fill="#5D4037"
          filter="url(#soil-texture)"
        />

        <g transform="translate(200, 265)">
          <path
            d="M -6 0 C -5 -30, -8 -60, -2 -90 C 4 -60, 3 -30, 6 0 Z"
            fill="url(#trunk-gradient)"
            filter="url(#bark-texture)"
          />

          <path d="M -4 -60 C -20 -70, -30 -80, -40 -75" stroke="#4E342E" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 4 -50 C 20 -60, 30 -70, 40 -65" stroke="#4E342E" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 0 -80 C -5 -95, 5 -105, 0 -115" stroke="#4E342E" strokeWidth="3" fill="none" strokeLinecap="round" />

          <g filter="url(#soft-shadow)">
            <path
              d="M -50 -75 C -60 -90, -40 -110, -20 -100 C 0 -120, 20 -110, 40 -90 C 50 -70, 30 -60, 10 -65 C -10 -60, -30 -60, -50 -75 Z"
              fill="url(#leaf-gradient-dark)"
              filter="url(#leaf-displacement)"
            />

            <path
              d="M -30 -90 C -40 -110, -10 -130, 10 -120 C 30 -130, 50 -110, 30 -90 Z"
              fill="url(#leaf-gradient-mid)"
              filter="url(#leaf-displacement)"
            />

            <path
              d="M -20 -110 C -30 -130, 0 -145, 20 -130 C 10 -115, 0 -110, -20 -110 Z"
              fill="url(#leaf-gradient-light)"
              filter="url(#leaf-displacement)"
            />
          </g>
        </g>
      </svg>
      <div className="absolute bottom-4 text-center text-muted-foreground text-sm font-medium">
        나무가 자라고 있습니다
      </div>
    </div>
  );
}

function WateringStage() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      <svg viewBox="0 0 400 280" className="w-full h-72 overflow-visible">
        <path
          d="M 20 280 C 80 270, 150 265, 200 265 C 250 265, 320 270, 380 280 Z"
          fill="#5D4037"
          filter="url(#soil-texture)"
        />

        <g transform="translate(200, 265)">
          <path
            d="M -6 0 C -5 -30, -8 -60, -2 -90 C 4 -60, 3 -30, 6 0 Z"
            fill="url(#trunk-gradient)"
            filter="url(#bark-texture)"
          />
          <path d="M -4 -60 C -20 -70, -30 -80, -40 -75" stroke="#4E342E" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 4 -50 C 20 -60, 30 -70, 40 -65" stroke="#4E342E" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 0 -80 C -5 -95, 5 -105, 0 -115" stroke="#4E342E" strokeWidth="3" fill="none" strokeLinecap="round" />

          <g filter="url(#soft-shadow)">
            <path
              d="M -50 -75 C -60 -90, -40 -110, -20 -100 C 0 -120, 20 -110, 40 -90 C 50 -70, 30 -60, 10 -65 C -10 -60, -30 -60, -50 -75 Z"
              fill="url(#leaf-gradient-dark)"
              filter="url(#leaf-displacement)"
            />
            <path
              d="M -30 -90 C -40 -110, -10 -130, 10 -120 C 30 -130, 50 -110, 30 -90 Z"
              fill="url(#leaf-gradient-mid)"
              filter="url(#leaf-displacement)"
            />
            <path
              d="M -20 -110 C -30 -130, 0 -145, 20 -130 C 10 -115, 0 -110, -20 -110 Z"
              fill="url(#leaf-gradient-light)"
              filter="url(#leaf-displacement)"
            />
          </g>
        </g>

        <g>
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1={160 + i * 10}
              y1={50 + (i % 3) * 20}
              x2={160 + i * 10}
              y2={70 + (i % 3) * 20}
              stroke="#4FC3F7"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            >
              <animate
                attributeName="y1"
                from={50 + (i % 3) * 20}
                to={250}
                dur={`${0.8 + i * 0.1}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y2"
                from={70 + (i % 3) * 20}
                to={270}
                dur={`${0.8 + i * 0.1}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur={`${0.8 + i * 0.1}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
        </g>
      </svg>
      <div className="absolute bottom-4 text-center text-muted-foreground text-sm font-medium">
        인프라를 점검하고 있습니다
      </div>
    </div>
  );
}

function FullTreeStage() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      <svg viewBox="0 0 400 340" className="w-full h-full overflow-visible">
        <path
          d="M 20 340 C 80 330, 150 325, 200 325 C 250 325, 320 330, 380 340 Z"
          fill="#5D4037"
          filter="url(#soil-texture)"
        />

        <g transform="translate(200, 325)">
          <path d="M -10 0 C -20 5, -30 10, -40 15" stroke="#3E2723" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#bark-texture)" />
          <path d="M 10 0 C 20 5, 30 10, 40 15" stroke="#3E2723" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#bark-texture)" />

          <path
            d="M -15 0 C -12 -40, -18 -80, -10 -120 C -5 -140, 5 -140, 10 -120 C 18 -80, 12 -40, 15 0 Z"
            fill="url(#trunk-gradient)"
            filter="url(#bark-texture)"
          />

          <g stroke="#4E342E" strokeWidth="8" strokeLinecap="round" filter="url(#bark-texture)">
            <path d="M -10 -100 C -30 -110, -50 -115, -70 -110" />
            <path d="M 10 -100 C 30 -110, 50 -115, 70 -110" />
            <path d="M 0 -120 C -10 -140, 10 -160, 0 -180" strokeWidth="6" />
          </g>

          <g filter="url(#soft-shadow)">
            <path
              d="M -80 -110 C -100 -130, -80 -160, -50 -150 C -40 -180, 0 -190, 40 -160 C 70 -170, 90 -140, 80 -110 C 60 -90, -60 -90, -80 -110 Z"
              fill="url(#leaf-gradient-dark)"
              filter="url(#leaf-displacement)"
            />

            <path
              d="M -60 -130 C -70 -150, -40 -180, -10 -170 C 10 -190, 50 -180, 60 -150 C 80 -140, 50 -120, 30 -130 C 10 -120, -40 -120, -60 -130 Z"
              fill="url(#leaf-gradient-mid)"
              filter="url(#leaf-displacement)"
            />

            <path
              d="M -40 -150 C -50 -170, -20 -190, 0 -185 C 20 -200, 50 -180, 40 -160 C 50 -150, 20 -140, 0 -150 C -20 -140, -30 -140, -40 -150 Z"
              fill="url(#leaf-gradient-light)"
              filter="url(#leaf-displacement)"
            />

            <path
              d="M -20 -190 C -30 -200, -10 -210, 0 -200 C 10 -210, 30 -200, 20 -190 Z"
              fill="#C8E6C9"
              filter="url(#leaf-displacement)"
              opacity="0.8"
            />
          </g>
        </g>
      </svg>
      <div className="absolute bottom-4 text-center text-green-800 font-bold text-base animate-pulse">
        배포가 완료되었습니다! 🎉
      </div>
    </div>
  );
}

export function getTreeStageFromDeployment(deployment: any): TreeStage {
  const { stages } = deployment;

  if (stages.monitoring.status === 'SUCCESS') return 'full-tree';
  if (stages.deploy.status === 'SUCCESS' || stages.deploy.status === 'RUNNING') return 'full-tree';
  if (stages.infrastructure.status === 'SUCCESS' || stages.infrastructure.status === 'RUNNING') return 'watering';
  if (stages.build.status === 'SUCCESS' || stages.build.status === 'RUNNING') return 'small-tree';
  if (stages.security.status === 'SUCCESS' || stages.security.status === 'RUNNING') return 'security';
  if (stages.test.status === 'SUCCESS' || stages.test.status === 'RUNNING') return 'sprout';
  if (stages.test.status === 'FAILED') return 'sprout';

  return 'seed';
}
