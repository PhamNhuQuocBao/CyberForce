'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content">
        <section className="bg-brand-dark text-white">
          <div className="page-container grid gap-12 py-16 md:grid-cols-[1.5fr_1fr] md:py-24">
            <div>
              <p className="mb-6 text-sm text-[#B8C1D1]">Nền tảng học tập an ninh mạng</p>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Hiểu cách tấn công.
                <br />
                Xây năng lực phòng thủ.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#B8C1D1]">
                Kết nối kiến thức, thực hành và đánh giá kỹ năng trong một hành trình học tập rõ
                ràng.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link
                    href={
                      isAuthenticated && user
                        ? `/user/${encodeURIComponent(user.username)}`
                        : '/register'
                    }
                  >
                    {isAuthenticated ? 'Xem hồ sơ của bạn' : 'Tạo tài khoản'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <a
                  href="#labs"
                  className="inline-flex min-h-12 items-center px-4 text-sm underline underline-offset-4"
                >
                  Tìm hiểu nền tảng
                </a>
              </div>
            </div>
            <div className="self-end border-t border-[#344158] pt-6 text-sm md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="mb-6 font-medium">Từ nền tảng đến thực hành</p>
              <ol className="space-y-6 text-[#B8C1D1]">
                <li>
                  <span className="mb-1 block text-white">01 · Học có định hướng</span>Kiến thức
                  được sắp xếp theo từng chủ đề.
                </li>
                <li>
                  <span className="mb-1 block text-white">02 · Thực hành theo nhiệm vụ</span>Áp dụng
                  lý thuyết vào các tình huống an ninh mạng.
                </li>
                <li>
                  <span className="mb-1 block text-white">03 · Theo dõi năng lực</span>Tổng hợp tiến
                  độ, kỹ năng và thành tích cá nhân.
                </li>
              </ol>
            </div>
          </div>
        </section>
        <div className="page-container">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              Một không gian để phát triển kỹ năng
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Tìm hiểu các hình thức học tập và đánh giá của CyberForce.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              [
                'labs',
                'Học & thực hành',
                'Phòng lý thuyết tập trung vào nội dung và câu hỏi. Phòng thực hành kết hợp nhiệm vụ với không gian máy ảo.',
              ],
              [
                'arena',
                'Thi đấu an ninh mạng',
                'Các hình thức CTF và King of the Hill giúp rèn tư duy giải quyết vấn đề và phối hợp trong môi trường cạnh tranh.',
              ],
              [
                'certs',
                'Hồ sơ & chứng chỉ',
                'Tổng hợp kỹ năng, lộ trình đã hoàn thành và chứng chỉ trong hồ sơ cá nhân có tùy chọn quyền riêng tư.',
              ],
            ].map(([id, title, description]) => (
              <section id={id} key={id} className="border-t pt-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </section>
            ))}
          </div>
          <section
            id="creator-studio"
            className="mt-16 flex flex-col justify-between gap-6 rounded-card border bg-card p-6 sm:p-8 md:flex-row md:items-center"
          >
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold">Chia sẻ kiến thức cùng cộng đồng</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Bạn muốn đóng góp nội dung? Đăng nhập và chọn “Đăng ký trở thành Creator” trong menu
                tài khoản để gửi kinh nghiệm, chuyên môn và ý tưởng của bạn.
              </p>
            </div>
            {!isAuthenticated && (
              <Button asChild variant="outline">
                <Link href="/login">Đăng nhập</Link>
              </Button>
            )}
          </section>
        </div>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <span>CyberForce</span>
          <span>Học tập · Thực hành · Phát triển năng lực</span>
        </div>
      </footer>
    </div>
  );
}
