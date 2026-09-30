import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, CURSOR_FILL, GRID } from './theme';
import { ChartTooltip } from './ChartTooltip';

const BAND_COLORS = ['#22C55E', '#84CC16', '#F59E0B', '#F97316', '#EF4444'];

/** Files grouped by complexity band. */
export function DistributionChart({
  data,
  height = 220,
}: {
  data: { band: string; files: number }[];
  height?: number;
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="band" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
          <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} files`} />} cursor={{ fill: CURSOR_FILL }} />
          <Bar dataKey="files" name="Files" radius={[3, 3, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAND_COLORS[i % BAND_COLORS.length]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
