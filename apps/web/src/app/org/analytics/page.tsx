'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Download, Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkillGapMatrixTable, skillLabels } from '@/components/org/SkillGapMatrixTable';
import { orgApi, type OrgAnalytics } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

type Organization = { id: string; name: string; slug: string };

export default function OrgAnalyticsPage() {
  const { user, accessToken, isLoading: authLoading } = useAuthStore();
  const allowed = user && ['org_admin', 'superadmin'].includes(user.role);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgId, setOrgId] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OrgAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken || !allowed) return;
    let live = true;
    void orgApi
      .list(accessToken)
      .then((result) => {
        if (!live) return;
        setOrganizations(result.data);
        setOrgId((current) => current || result.data[0]?.id || '');
      })
      .catch((reason) => {
        if (live) setError(reason instanceof Error ? reason.message : 'Không tải được tổ chức.');
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [accessToken, allowed]);

  useEffect(() => {
    if (!accessToken || !orgId || !allowed) return;
    let live = true;
    setLoading(true);
    void orgApi
      .analytics(orgId, groupId, page, accessToken)
      .then((result) => {
        if (live) {
          setData(result.data);
          setError('');
        }
      })
      .catch((reason) => {
        if (live) setError(reason instanceof Error ? reason.message : 'Không tải được ma trận.');
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [accessToken, allowed, orgId, groupId, page]);

  async function download(format: 'pdf' | 'csv') {
    if (!accessToken || !orgId || busy) return;
    setBusy(true);
    setError('');
    try {
      const blob = await orgApi.export(orgId, groupId, format, accessToken);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cyberforce-skill-gap-${organizations.find((item) => item.id === orgId)?.slug ?? 'org'}.${format}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được báo cáo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6 pb-16">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Enterprise Talent Intelligence
          </p>
          <h1 className="text-3xl font-semibold">Ma trận kỹ năng tổ chức</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Theo dõi điểm thực hành theo 8 lĩnh vực. Tỷ lệ thành thạo = EXP kỹ năng đã đạt / EXP
            hiện có trong nội dung đã xuất bản, tối đa 100%.
          </p>
        </header>
        {authLoading ? (
          <p>Đang kiểm tra quyền…</p>
        ) : !allowed ? (
          <Card className="p-6">Chỉ quản trị viên tổ chức có quyền xem báo cáo này.</Card>
        ) : (
          <>
            {error && (
              <Card className="border-destructive/50 p-4 text-destructive" role="alert">
                {error}
              </Card>
            )}
            {organizations.length === 0 && !loading ? (
              <Card className="p-8">
                Bạn chưa được gán quản trị tổ chức nào. Quản trị viên nền tảng cần tạo tổ chức và
                cấp quyền cho tài khoản của bạn.
              </Card>
            ) : (
              <>
                <Card className="flex flex-wrap items-end gap-4 p-5">
                  <label className="min-w-56 flex-1 space-y-2 text-sm">
                    <span className="font-medium">Tổ chức</span>
                    <select
                      className="h-11 w-full rounded-btn border border-input bg-background px-3"
                      value={orgId}
                      onChange={(event) => {
                        setOrgId(event.target.value);
                        setGroupId(null);
                        setPage(1);
                      }}
                    >
                      {organizations.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-56 flex-1 space-y-2 text-sm">
                    <span className="font-medium">Phòng ban / lớp</span>
                    <select
                      className="h-11 w-full rounded-btn border border-input bg-background px-3"
                      value={groupId ?? ''}
                      onChange={(event) => {
                        setGroupId(event.target.value || null);
                        setPage(1);
                      }}
                    >
                      <option value="">Toàn tổ chức</option>
                      {data?.groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={busy || !data}
                      onClick={() => void download('pdf')}
                    >
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy || !data}
                      onClick={() => void download('csv')}
                    >
                      <Download className="mr-2 h-4 w-4" /> CSV
                    </Button>
                  </div>
                </Card>
                {loading ? (
                  <p>Đang tổng hợp dữ liệu…</p>
                ) : (
                  data && (
                    <>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card className="p-5">
                          <Users className="mb-3 h-5 w-5" />
                          <p className="text-3xl font-bold">{data.memberCount}</p>
                          <p className="text-sm text-muted-foreground">
                            thành viên trong phạm vi đã chọn
                          </p>
                        </Card>
                        <Card className="p-5">
                          <p className="text-3xl font-bold">{data.gaps.length}</p>
                          <p className="text-sm text-muted-foreground">kỹ năng cần ưu tiên</p>
                        </Card>
                        <Card className="p-5">
                          <p className="text-sm font-medium">Ngưỡng so sánh</p>
                          <p className="mt-2 text-2xl font-bold">75/100</p>
                          <p className="text-sm text-muted-foreground">
                            Tốt từ 75 · Trung bình 40–74 · Cần cải thiện dưới 40
                          </p>
                        </Card>
                      </div>
                      {!data.hasActivity && (
                        <Card className="space-y-3 border-primary p-6" role="status">
                          <h2 className="text-lg font-semibold">
                            Chưa có dữ liệu thực hành kỹ năng cho nhóm này
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Tất cả 8 kỹ năng hiện ở mức 0/100. Điểm sẽ xuất hiện khi thành viên hoàn
                            thành task có gắn nhãn kỹ năng.
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs font-mono">
                            {skillLabels.map(([axis, label]) => (
                              <span key={axis} className="rounded-badge bg-muted px-3 py-2">
                                {label}: 0/100
                              </span>
                            ))}
                          </div>
                        </Card>
                      )}
                      {data.gaps.length > 0 && (
                        <section className="space-y-3" aria-label="Kỹ năng cần cải thiện">
                          <h2 className="text-xl font-semibold">Ưu tiên đào tạo</h2>
                          <div className="grid gap-4 md:grid-cols-2">
                            {data.gaps.map((gap) => (
                              <Card key={gap.skill} className="p-5">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
                                  <div>
                                    <h3 className="font-semibold">
                                      {skillLabels.find(([axis]) => axis === gap.skill)?.[1]}
                                    </h3>
                                    <p className="text-sm">
                                      Trung bình {gap.average}/100 · {gap.belowBenchmarkPercent}%
                                      thành viên dưới mốc 75.
                                    </p>
                                    {gap.paths.length > 0 && (
                                      <p className="mt-2 text-sm text-muted-foreground">
                                        Lộ trình đề xuất:{' '}
                                        {gap.paths.map((path, index) => (
                                          <span key={path.id}>
                                            {index > 0 && ', '}
                                            <Link
                                              href={`/paths/${path.slug}`}
                                              className="text-link"
                                            >
                                              {path.title}
                                            </Link>
                                          </span>
                                        ))}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </section>
                      )}
                      <section className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-semibold">Skill Gap Matrix</h2>
                            <p className="text-xs text-muted-foreground">
                              Di chuột vào ô điểm để xem EXP thực nhận và tổng EXP hiện có. Trục
                              chưa có bài học gắn nhãn được hiển thị trung tính.
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Cập nhật {new Date(data.generatedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <SkillGapMatrixTable data={data} />
                        {data.totalPages > 1 && (
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              variant="outline"
                              disabled={page <= 1}
                              onClick={() => setPage(page - 1)}
                            >
                              Trước
                            </Button>
                            <span className="text-sm">
                              Trang {page}/{data.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              disabled={page >= data.totalPages}
                              onClick={() => setPage(page + 1)}
                            >
                              Sau
                            </Button>
                          </div>
                        )}
                      </section>
                    </>
                  )
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
