import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_TICK, GRID } from './theme';
import { ChartTooltip } from './ChartTooltip';

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
  /** Render as a filled area (only when every series is an area). */
  area?: boolean;
}

interface TrendChartProps {
  data: unknown[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  xTickFormatter?: (v: string) => string;
  yTickFormatter?: (v: number) => string;
  valueFormatter?: (v: string | number) => string;
  yDomain?: [number | 'auto', number | 'auto'];
}

export function TrendChart({
  data,
  xKey,
  series,
  height = 240,
  xTickFormatter,
  yTickFormatter,
  valueFormatter,
  yDomain,
}: TrendChartProps) {
  const hasArea = series.some((s) => s.area);
  const Chart = hasArea ? AreaChart : LineChart;
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            minTickGap={30}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={yDomain ?? ['auto', 'auto']}
            tickFormatter={(v: number) => (yTickFormatter ? yTickFormatter(v) : String(v))}
          />
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: GRID }} />
          {series.map((s) =>
            hasArea ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? '4 4' : undefined}
                fill={s.color}
                fillOpacity={0.08}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? '4 4' : undefined}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ),
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
