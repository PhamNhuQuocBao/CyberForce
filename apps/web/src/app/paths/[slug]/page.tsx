'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth-store';
import { pathsApi, type PathDetailResponse, type PathRoomDetail } from '@/lib/api';
import { PrerequisiteLockDialog } from '@/components/paths/PrerequisiteLockDialog';

const roomStatus = {
  completed: 'Đã hoàn thành',
  in_progress: 'Đang học',
  available: 'Đủ điều kiện',
  locked: 'Chưa đủ điều kiện',
};
export default function LearningPathDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { accessToken, isLoading: authLoading } = useAuthStore();
  const [path, setPath] = useState<PathDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [lockedRoom, setLockedRoom] = useState<PathRoomDetail | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setError(null);
    pathsApi
      .getPath(slug, accessToken)
      .then((res) => {
        if (active) setPath(res.data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Không thể tải lộ trình.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, accessToken, authLoading, retry]);

  async function enroll() {
    if (!accessToken || enrolling) return;
    setEnrolling(true);
    setEnrollmentError(null);
    setEnrollmentMessage(null);
    try {
      await pathsApi.enroll(slug, accessToken);
      setEnrollmentMessage('Đã đăng ký lộ trình.');
      setRetry((value) => value + 1);
    } catch (err) {
      setEnrollmentError(
        err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.',
      );
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link className="text-link inline-flex min-h-11 items-center text-sm" href="/paths">
          ← Danh mục lộ trình
        </Link>
        {enrollmentMessage && <p role="status">{enrollmentMessage}</p>}
        {enrollmentError && (
          <p role="alert" className="text-destructive">
            {enrollmentError}
          </p>
        )}
        {loading || authLoading ? (
          <p role="status">Đang tải lộ trình…</p>
        ) : error || !path ? (
          <Card className="space-y-4 p-6">
            <p role="alert" className="text-destructive">
              {error || 'Không tìm thấy lộ trình.'}
            </p>
            <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>
              Thử lại
            </Button>
          </Card>
        ) : (
          <>
            <Card className="space-y-5 p-6 sm:p-8">
              <p className="text-sm text-muted-foreground">
                {path.category} · {path.difficultyLevel} · {path.estimatedHours} giờ
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">{path.title}</h1>
              {path.description && (
                <p className="max-w-2xl leading-relaxed text-muted-foreground">
                  {path.description}
                </p>
              )}
              <p className="text-sm">
                {path.totalRoomsCount} phòng · {path.totalTrackExp.toLocaleString()} EXP
              </p>
              {accessToken && (
                <div className="space-y-2">
                  <p className="text-sm">
                    {path.completedRoomsCount}/{path.totalRoomsCount} phòng hoàn thành ·{' '}
                    {path.progressPercentage}%
                  </p>
                  <progress
                    className="h-2 w-full accent-primary"
                    value={path.progressPercentage}
                    max={100}
                    aria-label="Tiến độ lộ trình"
                  />
                </div>
              )}
              {!accessToken ? (
                <Button asChild>
                  <Link href="/login">Đăng nhập để đăng ký</Link>
                </Button>
              ) : !path.isEnrolled ? (
                <Button disabled={enrolling || Boolean(enrollmentMessage)} onClick={enroll}>
                  {enrolling
                    ? 'Đang đăng ký…'
                    : enrollmentMessage
                      ? 'Đã đăng ký'
                      : 'Đăng ký lộ trình'}
                </Button>
              ) : (
                <p className="text-sm font-medium">
                  {path.status === 'mastered'
                    ? 'Bạn đã hoàn thành lộ trình này.'
                    : 'Bạn đã đăng ký lộ trình này.'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Phòng học chưa mở trên phiên bản này. Bạn có thể xem nội dung và điều kiện tiên
                quyết bên dưới.
              </p>
            </Card>
            {path.modules.length === 0 && <p>Chưa có học phần trong lộ trình này.</p>}
            {path.modules.map((module) => (
              <Card key={`${module.moduleOrder}-${module.moduleName}`}>
                <details open>
                  <summary className="cursor-pointer p-6 font-medium">
                    {module.moduleName}
                    <span className="ml-3 text-sm font-normal text-muted-foreground">
                      {module.completedRoomsCount}/{module.roomsCount} phòng hoàn thành
                    </span>
                  </summary>
                  <ul className="divide-y border-t">
                    {module.rooms.map((room) => (
                      <li key={room.id} className="space-y-3 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h2 className="font-medium">{room.title}</h2>
                          <span className="text-sm text-muted-foreground">
                            {roomStatus[room.status]}
                          </span>
                        </div>
                        {room.description && (
                          <p className="text-sm text-muted-foreground">{room.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {room.estimatedMinutes} phút · {room.taskCount} nhiệm vụ ·{' '}
                          {room.pointsReward} EXP · {room.isFree ? 'Miễn phí' : 'Nội dung trả phí'}
                        </p>
                        {room.status === 'locked' ? (
                          <Button variant="outline" onClick={() => setLockedRoom(room)}>
                            Xem điều kiện tiên quyết
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground">Phòng học chưa mở</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              </Card>
            ))}
          </>
        )}
      </main>
      <PrerequisiteLockDialog
        isOpen={Boolean(lockedRoom)}
        onClose={() => setLockedRoom(null)}
        targetRoom={lockedRoom}
      />
    </>
  );
}
