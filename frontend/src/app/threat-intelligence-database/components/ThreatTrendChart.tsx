import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ThreatTrendChartProps {
  data: Array<{
    month: string;
    detected: number;
    mitigated: number;
  }>;
}

const ThreatTrendChart = ({ data }: ThreatTrendChartProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-headline font-bold text-foreground mb-4">
        Threat Detection Trends (Last 6 Months)
      </h3>
      <div className="w-full h-80" aria-label="Threat Detection Trends Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="detected" fill="#EF4444" name="Threats Detected" />
            <Bar dataKey="mitigated" fill="#10B981" name="Threats Mitigated" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThreatTrendChart;