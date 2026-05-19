import { motion } from "framer-motion";
import { useState } from "react";
import styles from "./AnalyticsChart.module.css";

interface DataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export default function AnalyticsChart({ data, height = 240, color = "var(--color-primary-500)" }: AnalyticsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const padding = 40;
  const chartWidth = 600; // Viewbox width
  const chartHeight = 240; // Viewbox height

  const maxValue = Math.max(...data.map(d => d.value), 10);
  
  const points = data.map((d, i) => ({
    x: padding + (i * (chartWidth - padding * 2)) / (data.length - 1),
    y: chartHeight - padding - (d.value * (chartHeight - padding * 2)) / maxValue,
    value: d.value,
    label: d.label
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <div className={styles.container} style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className={styles.chart} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line 
            key={p}
            x1={padding} 
            y1={padding + p * (chartHeight - padding * 2)} 
            x2={chartWidth - padding} 
            y2={padding + p * (chartHeight - padding * 2)} 
            className={styles.grid} 
          />
        ))}

        {/* Area */}
        <motion.path 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          d={areaD} 
          fill="url(#chartGradient)" 
        />

        {/* Line */}
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={pathD} 
          className={styles.line} 
          style={{ stroke: color }}
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <motion.circle 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              cx={p.x} 
              cy={p.y} 
              r="4" 
              className={styles.point}
              style={{ fill: color }}
            />
          </g>
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          (i === 0 || i === points.length - 1 || i % 2 === 0) && (
            <text 
              key={i} 
              x={p.x} 
              y={chartHeight - 10} 
              textAnchor="middle" 
              className={styles.axis}
            >
              {p.label}
            </text>
          )
        ))}
      </svg>

      {hoveredIndex !== null && (
        <div 
          className={styles.tooltip}
          style={{ 
            left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
            top: `${(points[hoveredIndex].y / chartHeight) * 100}%`
          }}
        >
          {points[hoveredIndex].label}: {points[hoveredIndex].value.toLocaleString()}
        </div>
      )}
    </div>
  );
}
