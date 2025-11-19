'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function RenewalApprovalContent() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get('token');
  // Clean the token - remove any trailing quotes or whitespace that might have been introduced during URL encoding/decoding
  const token = rawToken ? rawToken.replace(/['"]+$/, '').trim() : null;
  const autoApprove = searchParams.get('auto') !== 'false'; // Auto-approve by default
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleApproval = async (approved: boolean, retryCount = 0): Promise<void> => {
    if (!token) {
      setStatus('error');
      setMessage('Missing approval token');
      return;
    }

    setStatus('loading');
    setMessage(approved ? 'Approving renewal...' : 'Rejecting renewal...');

    try {
      const response = await fetch('/api/workflows/renewal/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          approved,
          comment: approved ? undefined : 'Rejected via email link',
          by: undefined, // Could extract from token or add to URL
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If it's a 404 (hook not found) and we haven't retried, wait and retry
        if (response.status === 404 && retryCount < 3) {
          setMessage(`Waiting for workflow to be ready... (attempt ${retryCount + 1}/3)`);
          
          // Wait progressively longer: 2s, 4s, 6s
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          await handleApproval(approved, retryCount + 1);
          return;
        }
        
        const errorMessage = responseData.message || responseData.error || response.statusText;
        throw new Error(`Approval failed: ${errorMessage}`);
      }

      setStatus('success');
      setMessage(approved 
        ? 'Renewal approved successfully! The workflow will continue.' 
        : 'Renewal rejected. The workflow has been notified.'
      );
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to process approval';
      setMessage(errorMessage);
      
      // If it's a "not found" error, provide helpful context
      if (errorMessage.includes('not found') || errorMessage.includes('Hook not found')) {
        setMessage(
          'The workflow approval hook was not found. This usually means:\n' +
          '• The workflow hasn\'t reached the approval point yet (try again in a few seconds)\n' +
          '• The workflow has already timed out or completed\n' +
          '• The approval link has expired'
        );
      }
    }
  };

  // Auto-approve on page load if autoApprove is true
  useEffect(() => {
    if (token && autoApprove && status === 'idle') {
      handleApproval(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, autoApprove, status]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Invalid Approval Link</h1>
          <p className="text-muted-foreground">The approval link is missing a token.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="p-8 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Renewal Approval</h1>
        <p className="text-muted-foreground mb-6">
          Review and approve or reject the renewal plan.
        </p>

        {status === 'idle' && (
          <div className="flex gap-3">
            <Button
              onClick={() => handleApproval(true)}
              className="flex-1"
              size="lg"
            >
              Approve
            </Button>
            <Button
              onClick={() => handleApproval(false)}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              Reject
            </Button>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              {message}
            </p>
            <p className="text-sm text-muted-foreground">
              You can close this page now.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 whitespace-pre-line">
              {message}
            </div>
            <Button
              onClick={() => {
                setStatus('idle');
                setMessage('');
              }}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function RenewalApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading approval page...</p>
          </div>
        </Card>
      </div>
    }>
      <RenewalApprovalContent />
    </Suspense>
  );
}

