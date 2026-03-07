import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface EnrollmentData {
  month: string
  count: number
}

interface EnrollmentChartProps {
  data: EnrollmentData[]
  isLoading?: boolean
  className?: string
}

export function EnrollmentChart({ data, isLoading, className }: EnrollmentChartProps) {
  if (isLoading) {
    return <EnrollmentChartSkeleton className={className} />
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Student Enrollment</CardTitle>
        <Badge variant="outline" className="font-normal">
          Last 6 months
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="month"
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
              <Bar
                dataKey="count"
                name="Students"
                fill="hsl(var(--chart-1))"
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

function EnrollmentChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  )
}
