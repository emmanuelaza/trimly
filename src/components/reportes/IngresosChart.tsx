"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '1 Abr', ingresos: 400000 },
  { name: '5 Abr', ingresos: 800000 },
  { name: '10 Abr', ingresos: 650000 },
  { name: '15 Abr', ingresos: 1200000 },
  { name: '20 Abr', ingresos: 900000 },
  { name: '25 Abr', ingresos: 1500000 },
  { name: '30 Abr', ingresos: 1100000 },
];

export function IngresosChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9F53B" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#C9F53B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E1E24" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8A8A8A', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8A8A8A', fontSize: 12 }} 
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F1F26', border: '1px solid #2E2E38', borderRadius: '12px' }}
            itemStyle={{ color: '#F2F2F0' }}
            formatter={(value: any) => [`$${value?.toLocaleString?.() || value}`, 'Ingresos']}
          />
          <Area 
            type="monotone" 
            dataKey="ingresos" 
            stroke="#C9F53B" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIngresos)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
