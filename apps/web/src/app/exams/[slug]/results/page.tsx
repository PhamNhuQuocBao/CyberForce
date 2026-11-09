'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';
import { examsApi, type CertificateStatus, type ExamSessionView } from '@/lib/api';
import { BadgeUnlockModal, type BadgeUnlock } from '@/components/profile/BadgeUnlockModal';

function ResultsContent() {
  const { slug } = useParams<{ slug: string }>();
  const id = useSearchParams().get('id');
  const { accessToken, isLoading } = useAuthStore();
  const [session, setSession] = useState<ExamSessionView | null>(null);
  const [certificate, setCertificate] = useState<CertificateStatus | null>(null);
  const [badgeAward, setBadgeAward] = useState<BadgeUnlock | null>(null);
  const previousCertificateStatus = useRef<{ sessionId: string; status: string } | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!certificate) return;
    if (
      previousCertificateStatus.current?.sessionId === id &&
      previousCertificateStatus.current.status !== 'issued' &&
      certificate.status === 'issued'
    ) {
      setBadgeAward({
        title: 'Capstone Certified',
        description: 'Chứng chỉ đã được cấp và huy hiệu được thêm vào hồ sơ.',
        rankUp: false,
      });
    }
    if (id) previousCertificateStatus.current = { sessionId: id, status: certificate.status };
  }, [certificate, id]);
  useEffect(() => {
    if (!id || !accessToken) return;
    let live = true;
    async function load() {
      try {
        const [examResult, certificateResult] = await Promise.all([
          examsApi.session(id!, accessToken!),
          examsApi.certificate(id!, accessToken!),
        ]);
        if (live) {
          setSession(examResult.data);
          setCertificate(certificateResult.data);
          setError(null);
        }
      } catch (reason) {
        if (live) setError(reason instanceof Error ? reason.message : 'Không tải được kết quả.');
      }
    }
    void load();
    const timer = setInterval(() => {
      void load();
    }, 5000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [id, accessToken]);
  async function confirmName() {
    if (!id || !accessToken || busy || name.trim().length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const result = await examsApi.confirmCertificateName(id, name.trim(), accessToken);
      setCertificate(result.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không xác nhận được tên.');
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    if (!id || !accessToken || certificate?.status !== 'issued') return;
    setBusy(true);
    setError(null);
    try {
      const blob = await examsApi.downloadCertificate(id, accessToken);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.code}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được chứng chỉ.');
    } finally {
      setBusy(false);
    }
  }
  const retryAt = session?.finishedAt
    ? new Date(new Date(session.finishedAt).getTime() + 14 * 86400000)
    : null;
  const linkedInUrl = 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME';
  return (
    <>
      <BadgeUnlockModal award={badgeAward} onClose={() => setBadgeAward(null)} />
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link href={`/exams/${slug}`} className="text-link">
          ← Chi tiết kỳ thi
        </Link>
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Kết quả kỳ thi</h1>
        </header>
        {isLoading ? (
          <p>Đang tải…</p>
        ) : !accessToken ? (
          <Card className="p-6">Đăng nhập để xem kết quả.</Card>
        ) : !id ? (
          <Card className="p-6">Thiếu mã phiên thi.</Card>
        ) : !session ? (
          <p role="status">Đang tải kết quả…</p>
        ) : (
          <>
            <Card className="space-y-3 p-6">
              <p className="text-sm text-muted-foreground">{session.exam.title}</p>
              <h2 className="text-2xl font-semibold">
                {session.passed === null
                  ? 'Đang chấm điểm'
                  : session.passed
                    ? 'Đã đạt'
                    : 'Chưa đạt'}
              </h2>
              <p className="text-lg">
                {session.score}/{session.totalPoints} điểm · Ngưỡng đạt {session.exam.passingScore}
              </p>
              <p className="text-sm text-muted-foreground">
                Kết thúc{' '}
                {session.finishedAt
                  ? new Date(session.finishedAt).toLocaleString('vi-VN')
                  : 'đang xử lý'}
              </p>
            </Card>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="space-y-3 p-6">
                <h2 className="font-semibold">Nội dung bài thi</h2>
                {session.objectives.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 border-b border-border py-2 text-sm"
                  >
                    <span>{item.title}</span>
                    <span className="shrink-0">
                      {session.submissions.some((s) => s.objectiveId === item.id)
                        ? `${item.points}/${item.points}`
                        : `0/${item.points}`}
                    </span>
                  </div>
                ))}
              </Card>
              <Card className="space-y-4 p-6">
                <h2 className="font-semibold">{session.passed ? 'Chứng chỉ' : 'Bước tiếp theo'}</h2>
                {session.passed === false ? (
                  <>
                    <p>Bạn có thể ôn lại các nội dung chưa đạt trong lộ trình.</p>
                    {retryAt && <p>Được thi lại từ {retryAt.toLocaleString('vi-VN')}.</p>}
                    <Button asChild variant="outline">
                      <Link href="/paths">Mở lộ trình</Link>
                    </Button>
                  </>
                ) : certificate?.status === 'needs_name' ? (
                  <>
                    <p>
                      Phiên thi này chưa có họ tên để in trên chứng chỉ. Vui lòng xác nhận một lần.
                    </p>
                    <label className="block space-y-2">
                      <span className="text-sm">Họ tên trên chứng chỉ</span>
                      <Input
                        value={name}
                        maxLength={120}
                        autoComplete="name"
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                    <Button disabled={busy || name.trim().length < 2} onClick={confirmName}>
                      Xác nhận tên
                    </Button>
                  </>
                ) : certificate?.status === 'issued' ? (
                  <>
                    <p>
                      Mã chứng chỉ: <strong className="font-mono">{certificate.code}</strong>
                    </p>
                    <p>Ngày cấp: {new Date(certificate.issuedAt).toLocaleDateString('vi-VN')}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled={busy} onClick={download}>
                        Tải PDF chính thức
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/verify/${encodeURIComponent(certificate.code)}`}>
                          Xác thực công khai
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
                          Thêm vào LinkedIn
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Khi thêm vào LinkedIn, hãy nhập mã chứng chỉ ở trên và dùng liên kết xác thực
                      công khai. Mã QR trong PDF dẫn trực tiếp tới kết quả tra cứu.
                    </p>
                  </>
                ) : session.passed ? (
                  <p role="status">
                    {certificate?.status === 'retrying'
                      ? 'Có lỗi khi tạo chứng chỉ. Hệ thống đang tự thử lại; kết quả thi đã được giữ nguyên.'
                      : 'Đang tạo chứng chỉ có chữ ký số. Trang sẽ tự cập nhật.'}
                  </p>
                ) : (
                  <p>Đang đồng bộ kết quả.</p>
                )}
              </Card>
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
      </main>
    </>
  );
}
export default function ExamResultsPage() {
  return (
    <Suspense fallback={<p>Đang tải…</p>}>
      <ResultsContent />
    </Suspense>
  );
}
