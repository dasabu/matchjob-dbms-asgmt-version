'use client'

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent } from '../../components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/ui/chart'
import { ISkill } from '../../interfaces/schemas'

export default function SkillsChart({ skills }: { skills: ISkill[] }) {
  return (
    <Card className="w-full lg:p-16 p-8">
      <CardContent>
        <ChartContainer
          config={{
            total: {
              label: 'Total',
              color: 'hsl(var(--primary))',
            },
          }}
          className="[h-100px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skills}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis type="number" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[4, 4, 0, 0]}
                barSize={30}
                // barGap={8}
              >
                {skills.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${index * 36}, 70%, 50%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
