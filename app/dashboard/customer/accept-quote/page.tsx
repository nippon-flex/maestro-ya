import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AcceptQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const params = await searchParams;
  const quoteId = params.quoteId;

  if (!quoteId) {
    redirect('/dashboard/customer');
  }

  // Llamar a la API para aceptar la cotización
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/quotes/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quoteId: Number(quoteId) }),
  });

  const data = await response.json();

  if (data.success) {
    // Redirigir a la página del trabajo
    redirect(`/dashboard/job/${data.jobId}`);
  } else {
    // Si hay error, volver al dashboard con mensaje
    redirect('/dashboard/customer?error=no-se-pudo-aceptar');
  }
}