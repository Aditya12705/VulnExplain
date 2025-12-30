import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  impact: number;
}

export const FinancialImpactChart: React.FC<Props> = ({ impact }) => {
  // Create relative data points for comparison context
  const data = [
    { name: 'Avg. Minor Breach', value: 15000 },
    { name: 'This Audit', value: impact },
    { name: 'Avg. Major Breach', value: 150000 },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumSignificantDigits: 3,
    }).format(val);
  };

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={120} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
            formatter={(value: number) => [formatCurrency(value), 'Est. Cost']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.name === 'This Audit' ? '#F43F5E' : '#374151'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};