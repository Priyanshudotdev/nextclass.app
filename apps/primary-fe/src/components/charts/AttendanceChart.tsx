import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface AttendanceData {
  day: string
  present: number
  absent: number
}

interface AttendanceChartProps {
  data: AttendanceData[]
  isLoading?: boolean
  className?: string
}

export function AttendanceChart({ data, isLoading, className }: AttendanceChartProps) {
  if (isLoading) {
    return <AttendanceChartSkeleton className={className} />
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Attendance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                width={40}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-md)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingBottom: 16 }}
              />
              <Bar
                dataKey="present"
                name="Present"
                fill="hsl(var(--chart-1))"
                stackId="attendance"
                radius={[0, 0, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="hsl(var(--chart-4))"
                stackId="attendance"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function AttendanceChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  )
}
