import { z } from 'zod';

export const cmsKind = z.enum(['paths', 'modules', 'rooms', 'tasks', 'questions']);
export const cmsStatus = z.enum(['draft', 'published', 'archived']);
export const cmsId = z.object({ kind: cmsKind, id: z.uuid() });
export const cmsListQuery = z.object({
  search: z.string().max(100).optional(),
  status: cmsStatus.optional(),
  parentId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
const title = (max: number) => z.string().trim().min(1).max(max);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(255);
const order = z.number().int().min(0).max(100000);
const positive = z.number().int().positive().max(100000);
const image = z.string().regex(/^cyberforce\/[a-z0-9][a-z0-9._/-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
const uuid = z.uuid();

export const pathInput = z
  .object({
    title: title(255),
    slug,
    description: z.string().max(10000).nullable().optional(),
    category: title(50),
    difficultyLevel: title(20),
    estimatedHours: positive,
    orderIndex: order,
  })
  .strict();
export const moduleInput = z
  .object({
    pathId: uuid,
    title: title(150),
    orderIndex: order,
  })
  .strict();
export const roomInput = z
  .object({
    pathId: uuid,
    moduleId: uuid,
    title: title(255),
    slug,
    description: z.string().max(10000).nullable().optional(),
    difficulty: title(20),
    roomType: z.enum(['walkthrough', 'challenge', 'koth', 'exam']),
    isFree: z.boolean(),
    pointsReward: positive,
    estimatedMinutes: positive,
    orderIndex: order,
    prerequisiteRoomId: uuid.nullable().optional(),
    requiredForCapstone: z.boolean(),
    labEnabled: z.boolean(),
    image: image.optional(),
    cpuMillicores: z.number().int().min(250).max(2000).default(2000),
    memoryMb: z.number().int().min(256).max(2048).default(2048),
    ports: z.array(z.number().int().min(1).max(65535)).max(8).default([]),
    starterTask: z
      .object({
        title: title(255),
        contentMdx: z.string().max(100000),
        questionText: title(4000),
        flagType: z.enum(['static', 'regex', 'dynamic_hmac']),
        answer: z.string().min(1).max(4096).optional(),
        flagPattern: z.string().min(1).max(255).optional(),
        pointsReward: positive,
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.labEnabled && !value.image)
      ctx.addIssue({
        code: 'custom',
        path: ['image'],
        message: 'Docker image is required for practical rooms',
      });
    if (new Set(value.ports).size !== value.ports.length)
      ctx.addIssue({ code: 'custom', path: ['ports'], message: 'Ports must be unique' });
    if (value.starterTask?.flagType === 'static' && !value.starterTask.answer)
      ctx.addIssue({
        code: 'custom',
        path: ['starterTask', 'answer'],
        message: 'Static flag is required',
      });
    if (value.starterTask?.flagType === 'regex' && !value.starterTask.flagPattern)
      ctx.addIssue({
        code: 'custom',
        path: ['starterTask', 'flagPattern'],
        message: 'Regex pattern is required',
      });
  });
export const taskInput = z
  .object({
    roomId: uuid,
    title: title(255),
    taskOrder: order,
    contentMdx: z.string().max(100000),
  })
  .strict();
export const questionInput = z
  .object({
    taskId: uuid,
    questionText: title(4000),
    flagType: z.enum(['static', 'regex', 'dynamic_hmac']),
    answer: z.string().min(1).max(4096).optional(),
    flagPattern: z.string().min(1).max(255).optional(),
    hintTiers: z
      .array(
        z
          .object({
            tier: z.number().int().min(1).max(3),
            cost: z.number().int().min(0),
            content: z.string().max(5000),
          })
          .strict(),
      )
      .max(3)
      .default([]),
    pointsReward: positive,
  })
  .strict();
export const updateInput = z.object({ version: z.iso.datetime(), data: z.unknown() }).strict();
export const statusInput = z.object({ version: z.iso.datetime(), status: cmsStatus }).strict();
export const deleteInput = z.object({ version: z.iso.datetime() }).strict();
