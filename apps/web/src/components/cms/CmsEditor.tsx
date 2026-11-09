'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, cmsApi, type CmsItem, type CmsKind, type CmsStatus } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const kinds: CmsKind[] = ['paths', 'modules', 'rooms', 'tasks', 'questions'];
const labels: Record<CmsKind, string> = {
  paths: 'Lộ trình',
  modules: 'Module',
  rooms: 'Phòng',
  tasks: 'Task',
  questions: 'Câu hỏi',
};
const statuses: Record<CmsStatus, string> = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
  archived: 'Đã lưu trữ',
};
const childKind: Partial<Record<CmsKind, CmsKind>> = {
  paths: 'modules',
  modules: 'rooms',
  rooms: 'tasks',
  tasks: 'questions',
};
const parentField: Partial<Record<CmsKind, string>> = {
  modules: 'pathId',
  rooms: 'moduleId',
  tasks: 'roomId',
  questions: 'taskId',
};
type Form = Record<string, string | number | boolean>;
const defaults: Record<CmsKind, Form> = {
  paths: {
    title: '',
    slug: '',
    description: '',
    category: 'Offense',
    difficultyLevel: 'Beginner',
    estimatedHours: 20,
    orderIndex: 0,
  },
  modules: { pathId: '', title: '', orderIndex: 1 },
  rooms: {
    pathId: '',
    moduleId: '',
    title: '',
    slug: '',
    description: '',
    difficulty: 'Easy',
    roomType: 'walkthrough',
    isFree: true,
    pointsReward: 200,
    estimatedMinutes: 45,
    orderIndex: 0,
    prerequisiteRoomId: '',
    requiredForCapstone: true,
    labEnabled: true,
    image: '',
    cpuMillicores: 2000,
    memoryMb: 2048,
    ports: '80',
    starterEnabled: true,
    starterTitle: 'Bài thực hành',
    starterContent: '',
    starterQuestion: '',
    starterFlagType: 'static',
    starterAnswer: '',
    starterPattern: '',
    starterPoints: 50,
  },
  tasks: { roomId: '', title: '', taskOrder: 1, contentMdx: '' },
  questions: {
    taskId: '',
    questionText: '',
    flagType: 'static',
    answer: '',
    flagPattern: '',
    hintTiers: '[]',
    pointsReward: 50,
  },
};

function fromItem(kind: CmsKind, item: CmsItem): Form {
  const base = { ...defaults[kind] };
  for (const key of Object.keys(base)) {
    const value = item[key];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
      base[key] = value;
  }
  if (kind === 'rooms') {
    const spec =
      item.targetTemplateSpec && typeof item.targetTemplateSpec === 'object'
        ? (item.targetTemplateSpec as Record<string, unknown>)
        : {};
    base.labEnabled = Boolean(spec.image);
    base.image = typeof spec.image === 'string' ? spec.image : '';
    base.cpuMillicores = typeof spec.cpuMillicores === 'number' ? spec.cpuMillicores : 2000;
    base.memoryMb = typeof spec.memoryMb === 'number' ? spec.memoryMb : 2048;
    base.ports = Array.isArray(spec.ports)
      ? spec.ports.join(', ')
      : typeof spec.port === 'number'
        ? String(spec.port)
        : '';
    base.prerequisiteRoomId =
      typeof item.prerequisiteRoomId === 'string' ? item.prerequisiteRoomId : '';
    base.starterEnabled = false;
  }
  if (kind === 'questions') {
    base.answer = '';
    base.hintTiers = JSON.stringify(item.hintTiers ?? []);
  }
  return base;
}

function payload(kind: CmsKind, form: Form, isNew: boolean): Record<string, unknown> {
  if (kind === 'paths')
    return {
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      category: form.category,
      difficultyLevel: form.difficultyLevel,
      estimatedHours: Number(form.estimatedHours),
      orderIndex: Number(form.orderIndex),
    };
  if (kind === 'modules')
    return { pathId: form.pathId, title: form.title, orderIndex: Number(form.orderIndex) };
  if (kind === 'rooms') {
    const ports = String(form.ports)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number);
    return {
      pathId: form.pathId,
      moduleId: form.moduleId,
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      difficulty: form.difficulty,
      roomType: form.roomType,
      isFree: Boolean(form.isFree),
      pointsReward: Number(form.pointsReward),
      estimatedMinutes: Number(form.estimatedMinutes),
      orderIndex: Number(form.orderIndex),
      prerequisiteRoomId: form.prerequisiteRoomId || null,
      requiredForCapstone: Boolean(form.requiredForCapstone),
      labEnabled: Boolean(form.labEnabled),
      ...(form.labEnabled && { image: form.image }),
      cpuMillicores: Number(form.cpuMillicores),
      memoryMb: Number(form.memoryMb),
      ports,
      ...(isNew &&
        form.starterEnabled && {
          starterTask: {
            title: form.starterTitle,
            contentMdx: form.starterContent,
            questionText: form.starterQuestion,
            flagType: form.starterFlagType,
            ...(form.starterFlagType === 'static' && { answer: form.starterAnswer }),
            ...(form.starterFlagType === 'regex' && { flagPattern: form.starterPattern }),
            pointsReward: Number(form.starterPoints),
          },
        }),
    };
  }
  if (kind === 'tasks')
    return {
      roomId: form.roomId,
      title: form.title,
      taskOrder: Number(form.taskOrder),
      contentMdx: form.contentMdx,
    };
  const hints = JSON.parse(String(form.hintTiers));
  return {
    taskId: form.taskId,
    questionText: form.questionText,
    flagType: form.flagType,
    ...(form.answer && { answer: form.answer }),
    ...(form.flagPattern && { flagPattern: form.flagPattern }),
    hintTiers: hints,
    pointsReward: Number(form.pointsReward),
  };
}

export function CmsEditor() {
  const { kind: rawKind, id } = useParams<{ kind: string; id: string }>();
  const kind = kinds.includes(rawKind as CmsKind) ? (rawKind as CmsKind) : null;
  const isNew = id === 'new';
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading } = useAuthStore();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'org_admin';
  const [item, setItem] = useState<CmsItem | null>(null);
  const [form, setForm] = useState<Form>(kind ? defaults[kind] : {});
  const [options, setOptions] = useState<Partial<Record<CmsKind, CmsItem[]>>>({});
  const [children, setChildren] = useState<CmsItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [back, setBack] = useState('/admin/cms');

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    if (from?.startsWith('/admin/cms')) setBack(from);
  }, []);
  const load = useCallback(async () => {
    if (!kind || !accessToken || !isAdmin) return;
    setLoading(true);
    try {
      const parents: CmsKind[] =
        kind === 'modules'
          ? ['paths']
          : kind === 'rooms'
            ? ['paths', 'modules', 'rooms']
            : kind === 'tasks'
              ? ['rooms']
              : kind === 'questions'
                ? ['tasks']
                : [];
      const [current, ...lists] = await Promise.all([
        isNew ? Promise.resolve(null) : cmsApi.get(kind, id, accessToken).then((res) => res.data),
        ...parents.map((parent) =>
          cmsApi.list(parent, accessToken, { limit: 50 }).then((res) => res.data.items),
        ),
      ]);
      if (current) {
        setItem(current);
        setForm(fromItem(kind, current));
      } else {
        const initial = { ...defaults[kind] };
        const preselected = new URLSearchParams(window.location.search).get('parentId');
        const field = parentField[kind];
        if (preselected && field) {
          initial[field] = preselected;
          if (kind === 'rooms') {
            const parentModule = (lists[parents.indexOf('modules')] ?? []).find(
              (row) => row.id === preselected,
            );
            if (parentModule?.pathId) initial.pathId = parentModule.pathId;
          }
        }
        setItem(null);
        setForm(initial);
      }
      setOptions(Object.fromEntries(parents.map((parent, index) => [parent, lists[index]])));
      setDirty(false);
      setError(
        new URLSearchParams(window.location.search).has('publishError')
          ? 'Đã lưu bản nháp; xuất bản thất bại. Kiểm tra điều kiện rồi thử lại.'
          : '',
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được nội dung.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, id, isAdmin, isNew, kind]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!kind || !item || !accessToken || !childKind[kind]) {
      setChildren([]);
      return;
    }
    let live = true;
    void cmsApi
      .list(childKind[kind]!, accessToken, { parentId: item.id, limit: 50 })
      .then((result) => {
        if (live) setChildren(result.data.items);
      })
      .catch(() => {
        if (live) setChildren([]);
      });
    return () => {
      live = false;
    };
  }, [kind, item?.id, accessToken]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key: string, value: Form[string]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setFieldErrors((current) => ({ ...current, [key]: '' }));
  };
  const value = (key: string) => String(form[key] ?? '');
  const field = (
    key: string,
    label: string,
    options?: { type?: string; min?: number; placeholder?: string; required?: boolean },
  ) => (
    <label className="block space-y-2 text-sm" key={key}>
      <span className="font-medium">{label}</span>
      <Input
        value={value(key)}
        type={options?.type ?? 'text'}
        min={options?.min}
        placeholder={options?.placeholder}
        required={options?.required}
        aria-invalid={Boolean(fieldErrors[key])}
        onChange={(event) =>
          set(key, options?.type === 'number' ? Number(event.target.value) : event.target.value)
        }
      />
      {fieldErrors[key] && <span className="text-destructive">{fieldErrors[key]}</span>}
    </label>
  );
  const textArea = (key: string, label: string, rows = 5) => (
    <label className="block space-y-2 text-sm" key={key}>
      <span className="font-medium">{label}</span>
      <textarea
        className="w-full rounded-btn border border-input bg-background px-3 py-2"
        rows={rows}
        value={value(key)}
        onChange={(event) => set(key, event.target.value)}
      />
    </label>
  );
  const choose = (key: string, label: string, values: Array<[string, string]>) => (
    <label className="block space-y-2 text-sm" key={key}>
      <span className="font-medium">{label}</span>
      <select
        className="h-10 w-full rounded-btn border border-input bg-background px-3"
        value={value(key)}
        onChange={(event) => set(key, event.target.value)}
      >
        <option value="">Chọn…</option>
        {values.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      {fieldErrors[key] && <span className="text-destructive">{fieldErrors[key]}</span>}
    </label>
  );
  const parent = (
    key: string,
    label: string,
    parentKind: CmsKind,
    filtered?: (item: CmsItem) => boolean,
  ) =>
    choose(
      key,
      label,
      (options[parentKind] ?? [])
        .filter(filtered ?? (() => true))
        .map((row) => [row.id, row.title ?? row.questionText ?? row.id]),
    );
  const toggle = (key: string, label: string) => (
    <label key={key} className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={Boolean(form[key])}
        onChange={(event) => set(key, event.target.checked)}
      />
      {label}
    </label>
  );

  function showError(reason: unknown) {
    if (reason instanceof ApiError && reason.code === 'VALIDATION_ERROR' && reason.details) {
      const next: Record<string, string> = {};
      Object.entries(reason.details).forEach(([key, messages]) => {
        if (Array.isArray(messages)) next[key] = String(messages[0]);
      });
      setFieldErrors(next);
      setError('Kiểm tra các trường được đánh dấu.');
    } else setError(reason instanceof Error ? reason.message : 'Không lưu được nội dung.');
  }

  async function save(publish = false) {
    if (!kind || !accessToken || busy) return;
    setBusy(true);
    setError('');
    setFieldErrors({});
    let saved: CmsItem | null = null;
    try {
      const data = payload(kind, form, isNew);
      saved = isNew
        ? (await cmsApi.create(kind, data, accessToken)).data
        : (await cmsApi.update(kind, id, item!.updatedAt, data, accessToken)).data;
      const result = publish
        ? (await cmsApi.status(kind, saved.id, saved.updatedAt, 'published', accessToken)).data
        : saved;
      setItem(result);
      setForm(fromItem(kind, result));
      setDirty(false);
      if (isNew) router.replace(`/admin/cms/${kind}/${result.id}?from=${encodeURIComponent(back)}`);
    } catch (reason) {
      if (saved) {
        setItem(saved);
        setForm(fromItem(kind, saved));
        setDirty(false);
        if (isNew)
          router.replace(
            `/admin/cms/${kind}/${saved.id}?from=${encodeURIComponent(back)}&publishError=1`,
          );
      }
      showError(reason);
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: CmsStatus) {
    if (!kind || !accessToken || !item || busy) return;
    if (dirty) {
      setError('Lưu thay đổi trước khi đổi trạng thái.');
      return;
    }
    if (
      status === 'archived' &&
      !window.confirm('Lưu trữ mục này sẽ ẩn nội dung liên quan khỏi học viên. Tiếp tục?')
    )
      return;
    setBusy(true);
    setError('');
    try {
      const result = (await cmsApi.status(kind, item.id, item.updatedAt, status, accessToken)).data;
      setItem(result);
      setForm(fromItem(kind, result));
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      !kind ||
      !accessToken ||
      !item ||
      busy ||
      !window.confirm('Xóa bản nháp này? Nội dung có dữ liệu liên quan sẽ bị chặn xóa.')
    )
      return;
    setBusy(true);
    setError('');
    try {
      await cmsApi.delete(kind, item.id, item.updatedAt, accessToken);
      router.push(back);
    } catch (reason) {
      showError(reason);
      setBusy(false);
    }
  }
  function goBack(event: React.MouseEvent) {
    if (dirty && !window.confirm('Có thay đổi chưa lưu. Rời trang?')) event.preventDefault();
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link href={back} onClick={goBack} className="text-link">
          ← Danh mục CMS
        </Link>
        <header>
          <p className="text-sm text-muted-foreground">
            {kind ? labels[kind] : 'CMS'} · {item ? statuses[item.status] : 'Mới'}
          </p>
          <h1 className="text-3xl font-semibold">
            {item?.title ??
              item?.questionText ??
              `Tạo ${kind ? labels[kind].toLowerCase() : 'nội dung'}`}
          </h1>
        </header>
        {authLoading ? (
          <p>Đang kiểm tra quyền…</p>
        ) : !isAdmin ? (
          <Card className="p-6">Chỉ quản trị viên có quyền chỉnh sửa nội dung.</Card>
        ) : !kind ? (
          <Card className="p-6">Loại nội dung không hợp lệ.</Card>
        ) : loading ? (
          <p>Đang tải…</p>
        ) : (
          <>
            {error && (
              <Card className="border-destructive/50 p-4 text-sm text-destructive" role="alert">
                {error}
                {error.includes('thay đổi') && (
                  <Button variant="outline" size="sm" className="ml-2" onClick={() => void load()}>
                    Tải bản mới
                  </Button>
                )}
              </Card>
            )}
            <form
              className="space-y-6"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                void save(false);
              }}
            >
              <Card className="space-y-5 p-6">
                <h2 className="text-lg font-semibold">Thông tin</h2>
                <div className="grid gap-5 md:grid-cols-2">
                  {kind === 'paths' && (
                    <>
                      {field('title', 'Tên lộ trình', { required: true })}
                      {field('slug', 'Slug', { required: true })}
                      {field('category', 'Danh mục', { required: true })}
                      {field('difficultyLevel', 'Độ khó', { required: true })}
                      {field('estimatedHours', 'Số giờ dự kiến', { type: 'number', min: 1 })}
                      {field('orderIndex', 'Thứ tự', { type: 'number', min: 0 })}
                    </>
                  )}
                  {kind === 'modules' && (
                    <>
                      {parent('pathId', 'Lộ trình', 'paths')}
                      {field('title', 'Tên module', { required: true })}
                      {field('orderIndex', 'Thứ tự', { type: 'number', min: 0 })}
                    </>
                  )}
                  {kind === 'rooms' && (
                    <>
                      {parent('pathId', 'Lộ trình', 'paths')}
                      {parent('moduleId', 'Module', 'modules', (row) => row.pathId === form.pathId)}
                      {field('title', 'Tên phòng', { required: true })}
                      {field('slug', 'Slug', { required: true })}
                      {field('difficulty', 'Độ khó')}
                      {choose('roomType', 'Loại phòng', [
                        ['walkthrough', 'Walkthrough'],
                        ['challenge', 'Challenge'],
                        ['koth', 'KotH'],
                        ['exam', 'Exam'],
                      ])}
                      {field('pointsReward', 'EXP của phòng', { type: 'number', min: 1 })}
                      {field('estimatedMinutes', 'Phút dự kiến', { type: 'number', min: 1 })}
                      {field('orderIndex', 'Thứ tự', { type: 'number', min: 0 })}
                      {parent('prerequisiteRoomId', 'Phòng tiên quyết (tùy chọn)', 'rooms')}
                    </>
                  )}
                  {kind === 'tasks' && (
                    <>
                      {parent('roomId', 'Phòng', 'rooms')}
                      {field('title', 'Tên task', { required: true })}
                      {field('taskOrder', 'Thứ tự', { type: 'number', min: 0 })}
                    </>
                  )}
                  {kind === 'questions' && (
                    <>
                      {parent('taskId', 'Task', 'tasks')}
                      {field('questionText', 'Nội dung câu hỏi', { required: true })}
                      {choose('flagType', 'Loại cờ', [
                        ['static', 'Static'],
                        ['regex', 'Regex'],
                        ['dynamic_hmac', 'Dynamic Salt'],
                      ])}
                      {field('pointsReward', 'EXP thưởng', { type: 'number', min: 1 })}
                      {form.flagType === 'static' &&
                        field(
                          'answer',
                          item?.answerConfigured ? 'Cờ mới (để trống nếu giữ cũ)' : 'Cờ static',
                          { required: !item?.answerConfigured },
                        )}
                      {form.flagType === 'regex' && field('flagPattern', 'Regex pattern')}
                    </>
                  )}
                </div>
                {(kind === 'paths' || kind === 'rooms') && textArea('description', 'Mô tả')}
                {kind === 'rooms' && (
                  <div className="flex flex-wrap gap-5">
                    {toggle('isFree', 'Miễn phí')}
                    {toggle('requiredForCapstone', 'Tính vào điều kiện Capstone')}
                  </div>
                )}
                {kind === 'tasks' && textArea('contentMdx', 'Nội dung MDX', 12)}
                {kind === 'questions' && textArea('hintTiers', 'Gợi ý (JSON)', 5)}
              </Card>
              {kind === 'rooms' && (
                <Card className="space-y-5 p-6">
                  <h2 className="text-lg font-semibold">Môi trường lab</h2>
                  {toggle('labEnabled', 'Phòng thực hành có Docker image')}
                  {form.labEnabled && (
                    <div className="grid gap-5 md:grid-cols-2">
                      {field('image', 'Docker image', {
                        required: true,
                        placeholder: 'cyberforce/lab-sqli:v1',
                      })}
                      {field('cpuMillicores', 'CPU (millicores, 250–2000)', {
                        type: 'number',
                        min: 250,
                      })}
                      {field('memoryMb', 'RAM (MB, 256–2048)', { type: 'number', min: 256 })}
                      {field('ports', 'Cổng TCP nội bộ, cách nhau dấu phẩy', {
                        placeholder: '80, 8080',
                      })}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Image được kiểm tra trên orchestrator host khi xuất bản. Không mở cổng trên
                    host; truy cập lab qua mạng VPN cách ly.
                  </p>
                </Card>
              )}
              {kind === 'rooms' && isNew && (
                <Card className="space-y-5 p-6">
                  <h2 className="text-lg font-semibold">Task và câu hỏi đầu tiên</h2>
                  {toggle('starterEnabled', 'Tạo cùng phòng')}
                  {form.starterEnabled && (
                    <>
                      <div className="grid gap-5 md:grid-cols-2">
                        {field('starterTitle', 'Tên task', { required: true })}
                        {field('starterQuestion', 'Câu hỏi', { required: true })}
                        {choose('starterFlagType', 'Loại cờ', [
                          ['static', 'Static'],
                          ['regex', 'Regex'],
                          ['dynamic_hmac', 'Dynamic Salt'],
                        ])}
                        {field('starterPoints', 'EXP câu hỏi', { type: 'number', min: 1 })}
                        {form.starterFlagType === 'static' &&
                          field('starterAnswer', 'Cờ static', { required: true })}
                        {form.starterFlagType === 'regex' &&
                          field('starterPattern', 'Regex pattern', { required: true })}
                      </div>
                      {textArea('starterContent', 'Nội dung MDX', 8)}
                    </>
                  )}
                </Card>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy}>
                  {busy ? 'Đang lưu…' : 'Lưu nháp'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void save(true)}
                >
                  {isNew ? 'Tạo & xuất bản' : 'Lưu & xuất bản'}
                </Button>
                {item?.status === 'published' && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void changeStatus('archived')}
                  >
                    Lưu trữ
                  </Button>
                )}
                {item?.status === 'archived' && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void changeStatus('draft')}
                  >
                    Khôi phục nháp
                  </Button>
                )}
                {item?.status === 'draft' && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void remove()}
                  >
                    Xóa nháp
                  </Button>
                )}
              </div>
            </form>
            {item && childKind[kind] && (
              <Card className="space-y-3 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold">{labels[childKind[kind]!]}</h2>
                  <Button asChild variant="outline">
                    <Link
                      href={`/admin/cms/${childKind[kind]}/new?parentId=${item.id}&from=${encodeURIComponent(`/admin/cms/${kind}/${item.id}`)}`}
                    >
                      Thêm {labels[childKind[kind]!].toLowerCase()}
                    </Link>
                  </Button>
                </div>
                {children.length ? (
                  <ul className="divide-y">
                    {children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between gap-3 py-3 text-sm"
                      >
                        <span>
                          {child.title ?? child.questionText} · {statuses[child.status]}
                        </span>
                        <Link
                          className="text-link"
                          href={`/admin/cms/${childKind[kind]}/${child.id}?from=${encodeURIComponent(`/admin/cms/${kind}/${item.id}`)}`}
                        >
                          Sửa
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có nội dung con.</p>
                )}
                {kind === 'rooms' && item.status === 'published' && (
                  <Button asChild variant="outline">
                    <Link href={`/rooms/${item.slug}`}>Xem như học viên</Link>
                  </Button>
                )}
              </Card>
            )}
          </>
        )}
      </main>
    </>
  );
}
