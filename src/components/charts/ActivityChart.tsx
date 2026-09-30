import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_TICK, CURSOR_FILL, GRID } from './theme';
import { ChartTooltip } from './ChartTooltip';

export interface ActivitySeriesDef {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

interface ActivityChartProps {
  data: unknown[];
  xKey: string;
  bars: ActivitySeriesDef[];
  lines?: (ActivitySeriesDef & { right?: boolean })[];
  height?: number;
  xTickFormatter?: (v: string) => string;
  leftFormatter?: (v: number) => string;
  rightFormatter?: (v: number) => string;
  valueFormatter?: (v: string | number) => string;
}

/** Bars + overlay lines on one or two axes (commit activity, churn, …). */
export function ActivityChart({
  data,
  xKey,
  bars,
  lines = [],
  height = 260,
  xTickFormatter,
  leftFormatter,
  rightFormatter,
  valueFormatter,
}: ActivityChartProps) {
  const hasRight = lines.some((l) => l.right);
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: hasRight ? 4 : 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            minTickGap={24}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            yAxisId="left"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => (leftFormatter ? leftFormatter(v) : String(v))}
          />
          {hasRight && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => (rightFormatter ? rightFormatter(v) : String(v))}
            />
          )}
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} cursor={{ fill: CURSOR_FILL }} />
          {bars.map((b) => (
            <Bar
              key={b.key}
              yAxisId="left"
              dataKey={b.key}
              name={b.label}
              fill={b.color}
              fillOpacity={0.45}
              radius={[2, 2, 0, 0]}
              maxBarSize={26}
            />
          ))}
          {lines.map((l) => (
            <Line
              key={l.key}
              yAxisId={l.right ? 'right' : 'left'}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              strokeWidth={2}
              strokeDasharray={l.dashed ? '4 4' : undefined}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
