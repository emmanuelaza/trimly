import { getBarbershop } from '@/app/actions/barbershops';
import PlanesClient from './PlanesClient';

export const metadata = { title: 'Mis planes | Trimly' };
export const dynamic = 'force-dynamic';

export default async function PlanesPage() {
  const barbershop = await getBarbershop();
  return <PlanesClient barbershop={barbershop} />;
}
