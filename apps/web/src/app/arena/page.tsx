'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ctfApi, type CtfEventSummary } from '@/lib/api';

export default function ArenaPage() {
  const [events, setEvents] = useState<CtfEventSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    ctfApi
      .list()
      .then(({ data }) => {
        if (active) setEvents(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Không tải được giải CTF.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Đấu trường CTF</h1>
          <p className="mt-2 text-muted-foreground">
            Giải thử thách, tích điểm cố định và so thứ hạng theo thời điểm đạt điểm.
          </p>
        </header>
        {loading ? (
          <p>Đang tải…</p>
        ) : error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : events.length === 0 ? (
          <Card className="p-6">Chưa có giải CTF nào được công bố.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id} className="space-y-3 p-6">
                <h2 className="text-xl font-semibold">{event.title}</h2>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <p className="text-sm">
                  {new Date(event.startsAt).toLocaleString('vi-VN')} –{' '}
                  {new Date(event.endsAt).toLocaleString('vi-VN')}
                </p>
                <Button asChild variant="outline">
                  <Link href={`/arena/${event.slug}`}>Xem giải đấu</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
