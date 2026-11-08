import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { VerifyForm } from './verify-form';

export const metadata: Metadata = {
  title: 'Xác thực chứng chỉ | CyberForce',
  description:
    'Nhập mã trên chứng chỉ CyberForce để kiểm tra chữ ký số, tính toàn vẹn và trạng thái thu hồi.',
};

export default function VerifyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">CyberForce · Chứng chỉ</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Xác thực chứng chỉ</h1>
          <p className="max-w-2xl text-muted-foreground">
            Nhập mã trên chứng chỉ hoặc quét mã QR để xem kết quả xác thực công khai. Không cần đăng
            nhập.
          </p>
        </header>
        <Card className="space-y-5 p-6 sm:p-8">
          <VerifyForm />
          <p className="text-sm text-muted-foreground">
            Kết quả chỉ hiển thị thông tin được cấp công khai. Tệp PDF gốc chỉ người sở hữu mới tải
            được.
          </p>
        </Card>
      </main>
    </>
  );
}
