import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

interface HeatmapGridProps {
  data: Record<string, number>; // date → score
  className?: string;
}

function getHeatmapColor(score: number | undefined): string {
  if (!score) return 'bg-bg-elevated border-border/50';
  if (score >= 900) return 'bg-accent border-accent/60';
  if (score >= 700) return 'bg-primary-light/70 border-primary/40';
  if (score >= 400) return 'bg-primary/50 border-primary/30';
  return 'bg-primary/20 border-primary/15';
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ data, className = '' }) => {
  const [tooltip, setTooltip] = useState<{ date: string; score: number; x: number; y: number } | null>(null);

  const today = dayjs();
  const startOfYear = today.startOf('year');
  const totalDays = today.dayOfYear();

  // Build array of days from Jan 1 to today
  const days: { date: string; score: number | undefined }[] = [];
  for (let i = 0; i < 365; i++) {
    const d = startOfYear.add(i, 'day');
    if (d.isAfter(today)) {
      days.push({ date: d.format('YYYY-MM-DD'), score: undefined });
    } else {
      const dateStr = d.format('YYYY-MM-DD');
      days.push({ date: dateStr, score: data[dateStr] });
    }
  }

  // Group by week columns
  const firstDayOfWeek = startOfYear.day(); // 0=Sun
  const cells = Array(firstDayOfWeek).fill(null).concat(days);

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={`${className}`}>
      {/* Month labels */}
      <div className="flex gap-0.5 mb-1 ml-6">
        {monthLabels.map(m => (
          <span key={m} className="text-text-muted text-[9px] font-body" style={{ minWidth: 28 }}>
            {m}
          </span>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 justify-around pr-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <span key={i} className="text-text-muted text-[9px] font-body h-3 leading-3">{d}</span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5 flex-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="w-3 h-3 rounded-sm opacity-0" />;
                }
                const isFuture = dayjs(day.date).isAfter(today);
                return (
                  <motion.div
                    key={di}
                    className={[
                      'w-3 h-3 rounded-sm border heatmap-cell',
                      isFuture ? 'opacity-20 bg-bg-elevated border-border/30' : getHeatmapColor(day.score),
                    ].join(' ')}
                    title={`${day.date}: ${day.score !== undefined ? `${day.score} pts` : 'not played'}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.random() * 0.3, duration: 0.2 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-text-muted text-xs">Less</span>
        {['bg-bg-elevated', 'bg-primary/20', 'bg-primary/50', 'bg-primary-light/70', 'bg-accent'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-text-muted text-xs">More</span>
      </div>

      <div className="flex items-center gap-4 mt-2 justify-end text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-accent inline-block" /> 1000+
        </span>
        <span>{totalDays} days this year</span>
      </div>
    </div>
  );
};
