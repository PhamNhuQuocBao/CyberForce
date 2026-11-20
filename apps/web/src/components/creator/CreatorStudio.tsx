'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';
import {
  creatorApi,
  type CreatorRoom,
  type CreatorTask,
  type CreatorQuestion,
  type CreatorTestStatus,
} from '@/lib/api';
import { MdxLiveEditor, supportedMdxError } from './MdxLiveEditor';
import { CreatorTerminal } from './CreatorTerminal';

type Tab = 'content' | 'questions' | 'environment' | 'test';
const skillOptions = [
  ['web', 'Web'],
  ['network', 'Network'],
  ['binary', 'Binary/Pwn'],
  ['crypto', 'Crypto/PKI'],
  ['forensics', 'DFIR'],
  ['windows_ad', 'Windows/AD'],
  ['defensive', 'Blue Team'],
  ['cloud_devsecops', 'Cloud/DevSecOps'],
] as const;
type Parent = { id: string; title: string; modules: Array<{ id: string; title: string }> };
type RoomForm = {
  pathId: string;
  moduleId: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  roomType: string;
  image: string;
  cpuMillicores: number;
  memoryMb: number;
  ports: string;
  pointsReward: number;
  estimatedMinutes: number;
  orderIndex: number;
  isFree: boolean;
  requiredForCapstone: boolean;
};
const emptyRoom: RoomForm = {
  pathId: '',
  moduleId: '',
  title: '',
  slug: '',
  description: '',
  difficulty: 'Easy',
  roomType: 'walkthrough',
  image: '',
  cpuMillicores: 1000,
  memoryMb: 1024,
  ports: '80',
  pointsReward: 200,
  estimatedMinutes: 45,
  orderIndex: 0,
  isFree: true,
  requiredForCapstone: true,
};
const roomForm = (room: CreatorRoom): RoomForm => ({
  pathId: room.pathId,
  moduleId: room.moduleId,
  title: room.title,
  slug: room.slug,
  description: room.description ?? '',
  difficulty: room.difficulty,
  roomType: room.roomType,
  image: room.targetTemplateSpec?.image ?? '',
  cpuMillicores: room.targetTemplateSpec?.cpuMillicores ?? 2000,
  memoryMb: room.targetTemplateSpec?.memoryMb ?? 2048,
  ports: (room.targetTemplateSpec?.ports ?? []).join(', '),
  pointsReward: room.pointsReward,
  estimatedMinutes: room.estimatedMinutes,
  orderIndex: room.orderIndex,
  isFree: room.isFree,
  requiredForCapstone: room.requiredForCapstone,
});
const roomPayload = (form: RoomForm) => ({
  pathId: form.pathId,
  moduleId: form.moduleId,
  title: form.title,
  slug: form.slug,
  description: form.description || null,
  difficulty: form.difficulty,
  roomType: form.roomType,
  isFree: form.isFree,
  pointsReward: Number(form.pointsReward),
  estimatedMinutes: Number(form.estimatedMinutes),
  orderIndex: Number(form.orderIndex),
  prerequisiteRoomId: null,
  requiredForCapstone: form.requiredForCapstone,
  labEnabled: true,
  image: form.image,
  cpuMillicores: Number(form.cpuMillicores),
  memoryMb: Number(form.memoryMb),
  ports: form.ports
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number),
});
const reviewLabel: Record<string, string> = {
  editing: 'Đang soạn',
  pending_review: 'Chờ duyệt',
  changes_requested: 'Cần sửa',
  rejected: 'Đã từ chối',
  approved: 'Đã duyệt',
};

export function CreatorStudio() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading } = useAuthStore();
  const allowed = Boolean(
    user && ['creator', 'instructor', 'org_admin', 'superadmin'].includes(user.role),
  );
  const [room, setRoom] = useState<CreatorRoom | null>(null);
  const [form, setForm] = useState<RoomForm>(emptyRoom);
  const [parents, setParents] = useState<Parent[]>([]);
  const [tab, setTab] = useState<Tab>('content');
  const [test, setTest] = useState<CreatorTestStatus | null>(null);
  const [taskId, setTaskId] = useState('new');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskOrder, setTaskOrder] = useState(1);
  const [content, setContent] = useState('');
  const [skillTags, setSkillTags] = useState<CreatorTask['skillTags']>([]);
  const [questionId, setQuestionId] = useState('new');
  const [questionText, setQuestionText] = useState('');
  const [flagType, setFlagType] = useState<'static' | 'regex' | 'dynamic_hmac'>('static');
  const [answer, setAnswer] = useState('');
  const [pattern, setPattern] = useState('');
  const [points, setPoints] = useState(50);
  const [flagAnswers, setFlagAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectTask = (value: string, source: CreatorTask[]) => {
    setTaskId(value);
    const task = source.find((item) => item.id === value);
    setTaskTitle(task?.title ?? '');
    setTaskOrder(task?.taskOrder ?? source.length + 1);
    setContent(task?.contentMdx ?? '');
    setSkillTags(task?.skillTags ?? []);
    setQuestionId('new');
    setQuestionText('');
    setAnswer('');
    setPattern('');
    setPoints(50);
    setFlagType('static');
  };
  const selectQuestion = (value: string, tasks: CreatorTask[]) => {
    setQuestionId(value);
    const question = tasks.flatMap((task) => task.questions).find((item) => item.id === value);
    setQuestionText(question?.questionText ?? '');
    setFlagType(question?.flagType ?? 'static');
    setAnswer('');
    setPattern(question?.flagPattern ?? '');
    setPoints(question?.pointsReward ?? 50);
  };
  const refresh = useCallback(async () => {
    if (!accessToken || !allowed) return;
    const [catalog, current, testResult] = await Promise.all([
      creatorApi.catalog(accessToken),
      isNew ? Promise.resolve(null) : creatorApi.get(id, accessToken),
      isNew ? Promise.resolve(null) : creatorApi.testStatus(id, accessToken),
    ]);
    setParents(catalog.data);
    if (current) {
      setRoom(current.data);
      setForm(roomForm(current.data));
      selectTask(current.data.tasks[0]?.id ?? 'new', current.data.tasks);
    }
    if (testResult) setTest(testResult.data);
  }, [accessToken, allowed, id, isNew]);
  useEffect(() => {
    if (!accessToken || !allowed) return;
    let live = true;
    void refresh()
      .catch((reason) => {
        if (live) setError(reason instanceof Error ? reason.message : 'Không tải được bài lab.');
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [accessToken, allowed, refresh]);

  const editable =
    isNew ||
    (room?.status === 'draft' &&
      ['editing', 'changes_requested', 'rejected'].includes(room.reviewStatus));
  const selectedTask = room?.tasks.find((task) => task.id === taskId);
  const selectedQuestion = selectedTask?.questions.find((question) => question.id === questionId);
  const modules = parents.find((path) => path.id === form.pathId)?.modules ?? [];
  function failure(reason: unknown) {
    setError(reason instanceof Error ? reason.message : 'Thao tác thất bại.');
    setMessage('');
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (reason) {
      failure(reason);
    } finally {
      setBusy(false);
    }
  }
  const change = <K extends keyof RoomForm>(key: K, value: RoomForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const field = (key: keyof RoomForm, label: string, type = 'text') => (
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <Input
        type={type}
        value={String(form[key])}
        disabled={!editable || busy}
        onChange={(event) =>
          change(
            key,
            (type === 'number' ? Number(event.target.value) : event.target.value) as never,
          )
        }
      />
    </label>
  );
  async function saveRoom(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    await run(async () => {
      const data = roomPayload(form);
      const result = isNew
        ? await creatorApi.create(data, accessToken)
        : await creatorApi.update(id, room!.updatedAt, data, accessToken);
      setRoom(result.data);
      setForm(roomForm(result.data));
      setMessage('Đã lưu bản nháp.');
      if (isNew) router.replace(`/creator/rooms/${result.data.id}`);
      else setTest((await creatorApi.testStatus(id, accessToken)).data);
    });
  }
  async function saveTask() {
    if (!room || !accessToken || !editable) return;
    if (supportedMdxError(content)) {
      setError('Sửa lỗi cú pháp trước khi lưu nội dung.');
      return;
    }
    await run(async () => {
      const data = {
        roomId: room.id,
        title: taskTitle,
        taskOrder: Number(taskOrder),
        contentMdx: content,
        skillTags,
      };
      const result =
        taskId === 'new'
          ? await creatorApi.createTask(room.id, data, accessToken)
          : await creatorApi.updateTask(
              room.id,
              taskId,
              selectedTask!.updatedAt,
              data,
              accessToken,
            );
      const next =
        result.data.tasks.find((task) => task.id === taskId) ??
        result.data.tasks.find((task) => !room.tasks.some((old) => old.id === task.id));
      setRoom(result.data);
      if (next) selectTask(next.id, result.data.tasks);
      setTest((await creatorApi.testStatus(room.id, accessToken)).data);
      setMessage('Đã lưu task.');
    });
  }
  async function saveQuestion() {
    if (!room || !accessToken || !selectedTask || !editable) return;
    await run(async () => {
      const data = {
        taskId: selectedTask.id,
        questionText,
        flagType,
        pointsReward: Number(points),
        hintTiers: [],
        ...(flagType === 'static' && answer ? { answer } : {}),
        ...(flagType === 'regex' && pattern ? { flagPattern: pattern } : {}),
      };
      const result =
        questionId === 'new'
          ? await creatorApi.createQuestion(room.id, data, accessToken)
          : await creatorApi.updateQuestion(
              room.id,
              questionId,
              selectedQuestion!.updatedAt,
              data,
              accessToken,
            );
      const current = result.data.tasks.find((task) => task.id === selectedTask.id);
      const next =
        current?.questions.find((q) => q.id === questionId) ??
        current?.questions.find((q) => !selectedTask.questions.some((old) => old.id === q.id));
      setRoom(result.data);
      if (next) {
        setQuestionId(next.id);
        setAnswer('');
      }
      setTest((await creatorApi.testStatus(room.id, accessToken)).data);
      setMessage('Đã lưu câu hỏi.');
    });
  }
  async function upload(file: File) {
    if (!room || !accessToken || !editable) return;
    await run(async () => {
      await creatorApi.upload(room.id, file, accessToken);
      setRoom((await creatorApi.get(room.id, accessToken)).data);
      setTest((await creatorApi.testStatus(room.id, accessToken)).data);
      setMessage('Đã tải tệp lên.');
    });
  }
  async function download(fileId: string, name: string) {
    if (!room || !accessToken) return;
    await run(async () => {
      const blob = await creatorApi.download(room.id, fileId, accessToken);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  async function removeFile(fileId: string) {
    if (!room || !accessToken || !window.confirm('Xóa tệp đính kèm này?')) return;
    await run(async () => {
      await creatorApi.removeAttachment(room.id, fileId, accessToken);
      setRoom((await creatorApi.get(room.id, accessToken)).data);
      setTest((await creatorApi.testStatus(room.id, accessToken)).data);
    });
  }
  async function startTest() {
    if (room && accessToken)
      await run(async () => {
        setTest((await creatorApi.startTest(room.id, accessToken)).data);
        setMessage('Máy thử đã sẵn sàng.');
      });
  }
  async function stopTest() {
    if (room && accessToken)
      await run(async () => {
        setTest((await creatorApi.stopTest(room.id, accessToken)).data);
      });
  }
  async function checkFlag(question: CreatorQuestion) {
    if (!room || !accessToken) return;
    await run(async () => {
      const result = (
        await creatorApi.checkFlag(
          room.id,
          question.id,
          flagAnswers[question.id] ?? '',
          accessToken,
        )
      ).data;
      setTest(result);
      setMessage(result.correct ? 'Cờ đúng.' : 'Cờ chưa đúng.');
    });
  }
  async function submitReview() {
    if (!room || !accessToken) return;
    await run(async () => {
      await creatorApi.submit(room.id, accessToken);
      setRoom((await creatorApi.get(room.id, accessToken)).data);
      setMessage('Đã gửi bài vào hàng đợi duyệt.');
    });
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container space-y-6">
        <Link href="/creator" className="text-link">
          ← Bài lab của tôi
        </Link>
        <header>
          <p className="text-sm text-muted-foreground">
            Creator Studio · {room ? reviewLabel[room.reviewStatus] : 'Bài mới'}
          </p>
          <h1 className="text-3xl font-semibold">{room?.title || 'Tạo bài lab'}</h1>
          {room?.reviewFeedback && (
            <p className="mt-2 text-sm text-destructive">Nhận xét: {room.reviewFeedback}</p>
          )}
        </header>
        {authLoading ? (
          <p>Đang kiểm tra quyền…</p>
        ) : !allowed ? (
          <Card className="p-6">Bạn cần quyền Creator hoặc Instructor.</Card>
        ) : loading ? (
          <p>Đang tải…</p>
        ) : (
          <>
            {error && (
              <Card className="border-destructive/50 p-4 text-sm text-destructive" role="alert">
                {error}{' '}
                <button className="text-link" onClick={() => void refresh()}>
                  Tải lại
                </button>
              </Card>
            )}
            {message && (
              <p className="text-sm text-primary" role="status">
                {message}
              </p>
            )}
            <Card className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">Thông tin bài lab</h2>
              <form onSubmit={(event) => void saveRoom(event)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span>Lộ trình</span>
                    <select
                      className="h-10 w-full rounded-btn border border-input bg-background px-3"
                      disabled={!editable || busy}
                      value={form.pathId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          pathId: event.target.value,
                          moduleId: '',
                        }))
                      }
                    >
                      <option value="">Chọn lộ trình…</option>
                      {parents.map((path) => (
                        <option key={path.id} value={path.id}>
                          {path.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Module</span>
                    <select
                      className="h-10 w-full rounded-btn border border-input bg-background px-3"
                      disabled={!editable || busy}
                      value={form.moduleId}
                      onChange={(event) => change('moduleId', event.target.value)}
                    >
                      <option value="">Chọn module…</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  {field('title', 'Tên phòng')}
                  {field('slug', 'Slug')}
                  {field('difficulty', 'Độ khó')}
                  {field('pointsReward', 'EXP phòng', 'number')}
                  {field('estimatedMinutes', 'Phút dự kiến', 'number')}
                  {field('orderIndex', 'Thứ tự', 'number')}
                </div>
                <label className="block space-y-2 text-sm">
                  <span>Mô tả</span>
                  <textarea
                    className="min-h-24 w-full rounded-btn border border-input bg-background p-3"
                    value={form.description}
                    disabled={!editable || busy}
                    onChange={(event) => change('description', event.target.value)}
                  />
                </label>
                {isNew && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {field('image', 'Docker image')}
                    {field('cpuMillicores', 'CPU (250–2000 millicores)', 'number')}
                    {field('memoryMb', 'RAM (256–2048 MB)', 'number')}
                    {field('ports', 'Cổng TCP nội bộ')}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.isFree}
                      disabled={!editable || busy}
                      onChange={(event) => change('isFree', event.target.checked)}
                    />{' '}
                    Miễn phí
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.requiredForCapstone}
                      disabled={!editable || busy}
                      onChange={(event) => change('requiredForCapstone', event.target.checked)}
                    />{' '}
                    Tính vào Capstone
                  </label>
                </div>
                {editable && (
                  <Button type="submit" disabled={busy}>
                    {busy ? 'Đang lưu…' : 'Lưu bản nháp'}
                  </Button>
                )}
              </form>
            </Card>
            {room && (
              <>
                <div
                  className="flex flex-wrap gap-2 border-b pb-3"
                  role="tablist"
                  aria-label="Phần soạn bài"
                >
                  {(['content', 'questions', 'environment', 'test'] as const).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      role="tab"
                      aria-selected={tab === value}
                      variant={tab === value ? 'default' : 'outline'}
                      onClick={() => setTab(value)}
                    >
                      {value === 'content'
                        ? 'Nội dung'
                        : value === 'questions'
                          ? 'Câu hỏi'
                          : value === 'environment'
                            ? 'Môi trường & tệp'
                            : 'Kiểm thử'}
                    </Button>
                  ))}
                </div>
                {tab === 'content' && (
                  <Card className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-semibold">Task</h2>
                      <select
                        className="h-10 rounded-btn border border-input bg-background px-3"
                        value={taskId}
                        onChange={(event) => selectTask(event.target.value, room.tasks)}
                      >
                        <option value="new">+ Task mới</option>
                        {room.tasks.map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm">
                        <span>Tên task</span>
                        <Input
                          value={taskTitle}
                          disabled={!editable || busy}
                          onChange={(event) => setTaskTitle(event.target.value)}
                        />
                      </label>
                      <label className="space-y-2 text-sm">
                        <span>Thứ tự</span>
                        <Input
                          type="number"
                          min={0}
                          value={taskOrder}
                          disabled={!editable || busy}
                          onChange={(event) => setTaskOrder(Number(event.target.value))}
                        />
                      </label>
                    </div>
                    <fieldset className="space-y-2">
                      <legend className="text-sm font-medium">
                        Kỹ năng (để trống nếu là bài General)
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {skillOptions.map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={skillTags.includes(key)}
                              disabled={!editable || busy}
                              onChange={(event) =>
                                setSkillTags((current) =>
                                  event.target.checked
                                    ? [...current, key]
                                    : current.filter((item) => item !== key),
                                )
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <MdxLiveEditor
                      value={content}
                      onChange={setContent}
                      disabled={!editable || busy}
                    />
                    {editable && (
                      <Button
                        disabled={busy || !taskTitle.trim() || Boolean(supportedMdxError(content))}
                        onClick={() => void saveTask()}
                      >
                        Lưu task
                      </Button>
                    )}
                  </Card>
                )}
                {tab === 'questions' && (
                  <Card className="space-y-4 p-6">
                    <h2 className="font-semibold">Câu hỏi và cờ</h2>
                    <label className="block space-y-2 text-sm">
                      <span>Task</span>
                      <select
                        className="h-10 w-full rounded-btn border border-input bg-background px-3"
                        value={taskId}
                        onChange={(event) => selectTask(event.target.value, room.tasks)}
                      >
                        <option value="new">Chọn task…</option>
                        {room.tasks.map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selectedTask && (
                      <>
                        <label className="block space-y-2 text-sm">
                          <span>Câu hỏi</span>
                          <select
                            className="h-10 w-full rounded-btn border border-input bg-background px-3"
                            value={questionId}
                            onChange={(event) => selectQuestion(event.target.value, room.tasks)}
                          >
                            <option value="new">+ Câu hỏi mới</option>
                            {selectedTask.questions.map((question) => (
                              <option key={question.id} value={question.id}>
                                {question.questionText}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block space-y-2 text-sm">
                          <span>Nội dung câu hỏi</span>
                          <textarea
                            className="min-h-24 w-full rounded-btn border border-input bg-background p-3"
                            value={questionText}
                            disabled={!editable || busy}
                            onChange={(event) => setQuestionText(event.target.value)}
                          />
                        </label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm">
                            <span>Loại cờ</span>
                            <select
                              className="h-10 w-full rounded-btn border border-input bg-background px-3"
                              value={flagType}
                              disabled={!editable || busy}
                              onChange={(event) =>
                                setFlagType(event.target.value as typeof flagType)
                              }
                            >
                              <option value="static">Static</option>
                              <option value="regex">Regex</option>
                              <option value="dynamic_hmac">Dynamic Salt</option>
                            </select>
                          </label>
                          <label className="space-y-2 text-sm">
                            <span>EXP câu hỏi</span>
                            <Input
                              type="number"
                              min={1}
                              value={points}
                              disabled={!editable || busy}
                              onChange={(event) => setPoints(Number(event.target.value))}
                            />
                          </label>
                          {flagType === 'static' && (
                            <label className="space-y-2 text-sm">
                              <span>
                                {selectedQuestion?.answerConfigured
                                  ? 'Cờ mới (để trống để giữ cũ)'
                                  : 'Cờ static'}
                              </span>
                              <Input
                                type="password"
                                value={answer}
                                disabled={!editable || busy}
                                onChange={(event) => setAnswer(event.target.value)}
                              />
                            </label>
                          )}
                          {flagType === 'regex' && (
                            <label className="space-y-2 text-sm">
                              <span>Regex pattern</span>
                              <Input
                                value={pattern}
                                disabled={!editable || busy}
                                onChange={(event) => setPattern(event.target.value)}
                              />
                            </label>
                          )}
                        </div>
                        {editable && (
                          <Button
                            disabled={
                              busy ||
                              !questionText.trim() ||
                              points <= 0 ||
                              (flagType === 'static' &&
                                !answer &&
                                !selectedQuestion?.answerConfigured)
                            }
                            onClick={() => void saveQuestion()}
                          >
                            Lưu câu hỏi
                          </Button>
                        )}
                      </>
                    )}
                  </Card>
                )}
                {tab === 'environment' && (
                  <Card className="space-y-5 p-6">
                    <h2 className="font-semibold">Môi trường lab</h2>
                    <p className="text-xs text-muted-foreground">
                      Lưu thông tin bài lab ở trên sau khi sửa môi trường. Image phải có trên
                      orchestrator host khi chạy thử.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {field('image', 'Docker image')}
                      {field('cpuMillicores', 'CPU (250–2000 millicores)', 'number')}
                      {field('memoryMb', 'RAM (256–2048 MB)', 'number')}
                      {field('ports', 'Cổng TCP nội bộ, cách nhau bằng dấu phẩy')}
                    </div>
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="font-medium">Tệp đính kèm</h3>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPEG, PDF, TXT hoặc ZIP · tối đa 10 MB · lưu riêng tư.
                      </p>
                      {editable && (
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf,.txt,.zip"
                          disabled={busy}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void upload(file);
                            event.target.value = '';
                          }}
                        />
                      )}
                      {room.creatorAttachments.length ? (
                        <ul className="divide-y">
                          {room.creatorAttachments.map((file) => (
                            <li
                              key={file.id}
                              className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm"
                            >
                              <span>
                                {file.filename} · {Math.ceil(file.sizeBytes / 1024)} KB
                              </span>
                              <span className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void download(file.id, file.filename)}
                                >
                                  Tải xuống
                                </Button>
                                {editable && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void removeFile(file.id)}
                                  >
                                    Xóa
                                  </Button>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Chưa có tệp.</p>
                      )}
                    </div>
                  </Card>
                )}
                {tab === 'test' && (
                  <Card className="space-y-5 p-6">
                    <h2 className="font-semibold">Kiểm thử bản nháp</h2>
                    <p className="text-sm text-muted-foreground">
                      Chạy thử máy lab và nộp đúng tất cả cờ. Phiên này không cộng EXP hoặc streak.
                    </p>
                    <p className="text-sm">
                      {test?.passed ? 'Đã đạt' : 'Chưa đạt'} · {test?.verifiedCount ?? 0}/
                      {test?.requiredCount ?? 0} cờ ·{' '}
                      {test?.validRevision === false
                        ? 'Nội dung đã đổi, cần chạy lại'
                        : `Máy: ${test?.status ?? 'chưa chạy'}`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {editable && test?.status !== 'running' && (
                        <Button disabled={busy} onClick={() => void startTest()}>
                          Chạy thử lab
                        </Button>
                      )}
                      {test?.status === 'running' && (
                        <Button variant="outline" disabled={busy} onClick={() => void stopTest()}>
                          Dừng máy thử
                        </Button>
                      )}
                      {editable && (
                        <Button
                          variant="outline"
                          disabled={busy || !test?.passed}
                          onClick={() => void submitReview()}
                        >
                          Gửi duyệt
                        </Button>
                      )}
                    </div>
                    {editable && !test?.passed && (
                      <p className="text-xs text-muted-foreground">
                        Chỉ gửi duyệt khi backend xác nhận máy thử và tất cả cờ của phiên bản hiện
                        tại.
                      </p>
                    )}
                    {test?.targetIp && test.status === 'running' && (
                      <>
                        <p className="text-sm">
                          IP máy thử: <code>{test.targetIp}</code>
                        </p>
                        <CreatorTerminal
                          roomId={room.id}
                          instanceId={test.instanceId!}
                          token={accessToken!}
                        />
                      </>
                    )}
                    {test?.status === 'running' && (
                      <div className="space-y-3 border-t pt-4">
                        {room.tasks
                          .flatMap((task) => task.questions)
                          .map((question) => (
                            <div
                              key={question.id}
                              className="grid gap-2 md:grid-cols-[1fr_220px_auto] md:items-end"
                            >
                              <p className="text-sm">
                                {question.questionText}{' '}
                                {test.verifiedQuestionIds.includes(question.id) && '✓'}
                              </p>
                              <Input
                                aria-label={`Cờ cho ${question.questionText}`}
                                placeholder="Nhập cờ thử"
                                value={flagAnswers[question.id] ?? ''}
                                onChange={(event) =>
                                  setFlagAnswers((current) => ({
                                    ...current,
                                    [question.id]: event.target.value,
                                  }))
                                }
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy || !flagAnswers[question.id]}
                                onClick={() => void checkFlag(question)}
                              >
                                Kiểm tra
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
