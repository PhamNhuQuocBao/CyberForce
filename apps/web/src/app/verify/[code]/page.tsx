import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { VerifyForm } from '../verify-form';

export const dynamic = 'force-dynamic';

type Result =
  | {
      status: 'valid';
      certificate: {
        code: string;
        recipientName: string;
        examTitle: string;
        score: number;
        totalPoints: number;
        issuedAt: string;
        learningPathTitle: string;
        issuer: string;
        signatureVerified: boolean;
        pdfIntegrityVerified: boolean;
      };
    }
  | {
      status: 'revoked';
      code: string;
      revokedAt: string;
      reason: 'academic_integrity' | 'issued_in_error' | 'other';
    }
  | { status: 'not_found' | 'invalid' | 'unavailable' };

const lookup = cache(async (code: string): Promise<Result> => {
  if (!/^CF-CERT-\d{4}-(?:[A-F0-9]{6}|[A-F0-9]{16})$/.test(code)) return { status: 'not_found' };
  const base =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';
  try {
    const response = await fetch(
      `${base.replace(/\/$/, '')}/certificates/verify/${encodeURIComponent(code)}`,
      { cache: 'no-store' },
    );
    if (!response.ok) return { status: 'unavailable' };
    const body = (await response.json()) as { success?: boolean; data?: Result };
    return body.success && body.data ? body.data : { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
});

const reasonText = {
  academic_integrity: 'Vi phạm tính liêm chính học thuật',
  issued_in_error: 'Cấp chứng chỉ do nhầm lẫn',
  other: 'Lý do khác',
};

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const result = await lookup(params.code);
  const title =
    result.status === 'valid'
      ? `Chứng chỉ ${result.certificate.examTitle} của ${result.certificate.recipientName} | CyberForce`
      : 'Kết quả xác thực chứng chỉ | CyberForce';
  const description =
    result.status === 'valid'
      ? `Xác thực chứng chỉ ${result.certificate.code} được cấp bởi CyberForce.`
      : 'Kiểm tra trạng thái chứng chỉ CyberForce bằng mã chứng chỉ.';
  return { title, description, openGraph: { title, description, type: 'website' } };
}

export default async function VerifyResultPage({ params }: { params: { code: string } }) {
  const result = await lookup(params.code);
  const status = {
    valid: {
      title: 'Chứng chỉ hợp lệ',
      detail: 'Chữ ký số và tệp chứng chỉ đã được kiểm tra; chứng chỉ hiện chưa bị thu hồi.',
      color: 'text-[#245b16] dark:text-[#a3ea2a]',
    },
    revoked: {
      title: 'Chứng chỉ đã bị thu hồi',
      detail: 'Chứng chỉ này không còn hiệu lực. Vui lòng liên hệ CyberForce nếu cần đối soát.',
      color: 'text-destructive',
    },
    not_found: {
      title: 'Không tìm thấy chứng chỉ',
      detail: 'Không có chứng chỉ với mã này. Hãy kiểm tra lại mã được cung cấp.',
      color: 'text-destructive',
    },
    invalid: {
      title: 'Chứng chỉ không vượt qua xác thực',
      detail:
        'Chữ ký số hoặc tệp chứng chỉ không khớp với dữ liệu đã cấp. Vui lòng liên hệ CyberForce.',
      color: 'text-destructive',
    },
    unavailable: {
      title: 'Chưa thể xác minh',
      detail: 'Dịch vụ xác thực tạm thời không sẵn sàng. Vui lòng thử lại sau.',
      color: 'text-warning',
    },
  }[result.status];
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container max-w-3xl space-y-7">
        <Link href="/verify" className="text-link text-sm">
          ← Tra cứu mã khác
        </Link>
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            CyberForce · Xác thực chứng chỉ
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Kết quả tra cứu</h1>
        </header>
        <Card className="space-y-3 p-6 sm:p-8" role="status">
          <h2 className={`text-2xl font-semibold ${status.color}`}>{status.title}</h2>
          <p className="leading-relaxed">{status.detail}</p>
          <p className="break-all font-mono text-sm text-muted-foreground">{params.code}</p>
        </Card>
        {result.status === 'valid' && (
          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 text-lg font-semibold">Thông tin chứng chỉ</h2>
            <dl className="grid gap-5 sm:grid-cols-2">
              {[
                ['Người nhận', result.certificate.recipientName],
                ['Kỳ thi', result.certificate.examTitle],
                ['Lộ trình', result.certificate.learningPathTitle],
                ['Điểm', `${result.certificate.score}/${result.certificate.totalPoints}`],
                ['Ngày cấp', new Date(result.certificate.issuedAt).toLocaleDateString('vi-VN')],
                ['Đơn vị cấp', result.certificate.issuer],
                [
                  'Chữ ký số',
                  result.certificate.signatureVerified ? 'Đã xác thực' : 'Chưa xác thực',
                ],
                [
                  'Tệp chứng chỉ',
                  result.certificate.pdfIntegrityVerified ? 'Toàn vẹn' : 'Chưa xác thực',
                ],
              ].map(([label, value]) => (
                <div key={label} className="border-t pt-3">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
        {result.status === 'revoked' && (
          <Card className="space-y-2 p-6">
            <h2 className="font-semibold">Thông tin thu hồi</h2>
            <p>Lý do: {reasonText[result.reason]}</p>
            <p>Ngày thu hồi: {new Date(result.revokedAt).toLocaleDateString('vi-VN')}</p>
          </Card>
        )}
        <section className="space-y-4 border-t pt-6">
          <h2 className="font-semibold">Tra cứu mã khác</h2>
          <VerifyForm />
        </section>
      </main>
    </>
  );
}
