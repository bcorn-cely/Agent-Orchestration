'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ProcurementConfirmationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="p-8 max-w-md w-full shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Purchase Order Confirmed</h1>
          <p className="text-muted-foreground mb-6">
            Your purchase order has been successfully created and sent to the supplier.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You will receive a confirmation email with all the details shortly.
          </p>
          <Link href="/coupa">
            <Button className="w-full">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ProcurementConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading confirmation page...</p>
          </div>
        </Card>
      </div>
    }>
      <ProcurementConfirmationContent />
    </Suspense>
  );
}

