import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
  barsCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  accentColor = '#10b981',
  barsCount = 38,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barsCount - 2;
      const centerY = height / 2;

      for (let i = 0; i < barsCount; i++) {
        const normalized = i / barsCount;
        const envelope = Math.sin(normalized * Math.PI); // subtle taper at ends

        let amplitude = 3;
        if (isPlaying) {
          const wave1 = Math.sin(phase + i * 0.4);
          const wave2 = Math.cos(phase * 0.7 - i * 0.25);
          const ripple = Math.sin(i * 9.2 + phase * 1.8) * 0.4;
          amplitude = Math.max(5, (Math.abs(wave1 * 0.6 + wave2 * 0.4 + ripple)) * (height * 0.42) * envelope + 4);
        } else {
          amplitude = 2.5 + Math.sin(i * 0.5) * 1.5;
        }

        const x = i * (barWidth + 2) + 2;
        const topY = centerY - amplitude;
        const barHeight = Math.max(4, amplitude * 2);

        const grad = ctx.createLinearGradient(0, topY, 0, topY + barHeight);
        if (isPlaying) {
          grad.addColorStop(0, accentColor);
          grad.addColorStop(1, '#059669');
        } else {
          grad.addColorStop(0, '#57534e');
          grad.addColorStop(1, '#292524');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, barHeight / 2);
        ctx.roundRect(x, topY, barWidth, barHeight, radius);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.09;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, accentColor, barsCount]);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden py-1">
      <canvas
        ref={canvasRef}
        width={380}
        height={48}
        className="w-full h-12 max-w-md object-contain"
      />
    </div>
  );
};
