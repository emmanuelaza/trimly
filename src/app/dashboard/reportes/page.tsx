import React from 'react';
import ReportesClient from './ReportesClient';
import { getReportStats } from '@/app/actions/appointments';

export default async function ReportesPage() {
  const stats = await getReportStats();

  if (!stats) {
    return <div>No hay datos disponibles</div>;
  }

  return <ReportesClient stats={stats} />;
}
