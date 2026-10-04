import { PrismaClient, UserRole, RoomType, FlagType } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for CyberForce Learning Paths & Interactive Rooms...');

  // 1. Password hashing with Argon2id
  const defaultPassword = 'Password123!';
  const passwordHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 2. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyberforce.io' },
    update: {},
    create: {
      email: 'admin@cyberforce.io',
      username: 'cyber_admin',
      passwordHash,
      role: UserRole.superadmin,
      expPoints: 9999,
      rankTier: 'Master',
      streakDays: 30,
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: 'creator@cyberforce.io' },
    update: {},
    create: {
      email: 'creator@cyberforce.io',
      username: 'forge_creator',
      passwordHash,
      role: UserRole.creator,
      expPoints: 5000,
      rankTier: 'Expert',
      streakDays: 14,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@cyberforce.io' },
    update: {},
    create: {
      email: 'student@cyberforce.io',
      username: 'novice_hacker',
      passwordHash,
      role: UserRole.student,
      expPoints: 1250,
      rankTier: 'Apprentice',
      streakDays: 5,
    },
  });

  console.log(
    `👤 Users seeded: admin (${admin.username}), creator (${creator.username}), student (${student.username})`,
  );

  // ---------------------------------------------------------------------------
  // PATH 1: Offensive Web Associate (Wireframes 2.1 & 2.2)
  // ---------------------------------------------------------------------------
  const offensiveWebPath = await prisma.learningPath.upsert({
    where: { slug: 'offensive-web-associate' },
    update: {
      category: 'Offense',
      difficultyLevel: 'Intermediate',
      estimatedHours: 36,
      orderIndex: 1,
      isPublished: true,
      description:
        'Master offensive web exploitation from SQL Injection, Blind SQLi to Second-Order attacks and OAST exfiltration.',
      iconUrl: 'ShieldAlert',
    },
    create: {
      title: 'Offensive Web Associate',
      slug: 'offensive-web-associate',
      category: 'Offense',
      difficultyLevel: 'Intermediate',
      estimatedHours: 36,
      orderIndex: 1,
      isPublished: true,
      description:
        'Master offensive web exploitation from SQL Injection, Blind SQLi to Second-Order attacks and OAST exfiltration.',
      iconUrl: 'ShieldAlert',
    },
  });

  // Rooms for Offensive Web Associate
  // Room 20: SQL Injection Fundamentals
  const room20 = await prisma.room.upsert({
    where: { slug: 'sql-injection-fundamentals' },
    update: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 20,
      title: 'Room 20: SQL Injection Fundamentals',
      difficulty: 'Easy',
      pointsReward: 150,
      estimatedMinutes: 30,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 20,
      title: 'Room 20: SQL Injection Fundamentals',
      slug: 'sql-injection-fundamentals',
      description:
        'Understand classic in-band SQL Injection, authentication bypass vectors, and data extraction.',
      difficulty: 'Easy',
      pointsReward: 150,
      estimatedMinutes: 30,
      roomType: RoomType.walkthrough,
      targetTemplateSpec: { image: 'cyberforce/sqli-basics:latest', port: 80 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  // Room 21: Blind & Time-Based SQLi (Prerequisite: Room 20)
  const room21 = await prisma.room.upsert({
    where: { slug: 'blind-time-based-sqli' },
    update: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 21,
      title: 'Room 21: Blind & Time-Based SQLi',
      difficulty: 'Intermediate',
      pointsReward: 200,
      estimatedMinutes: 45,
      prerequisiteRoomId: room20.id,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 21,
      title: 'Room 21: Blind & Time-Based SQLi',
      slug: 'blind-time-based-sqli',
      description:
        'Extract data character-by-character when queries return no output on screen using boolean logic and time delays.',
      difficulty: 'Intermediate',
      pointsReward: 200,
      estimatedMinutes: 45,
      prerequisiteRoomId: room20.id,
      roomType: RoomType.walkthrough,
      targetTemplateSpec: { image: 'cyberforce/blind-sqli:latest', port: 80 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  // Room 22: Second-Order SQLi & WAF Bypassing (Prerequisite: Room 21)
  const room22 = await prisma.room.upsert({
    where: { slug: 'second-order-sqli-waf-bypassing' },
    update: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 22,
      title: 'Room 22: Second-Order SQLi & WAF Bypassing',
      difficulty: 'Intermediate',
      pointsReward: 250,
      estimatedMinutes: 60,
      prerequisiteRoomId: room21.id,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 22,
      title: 'Room 22: Second-Order SQLi & WAF Bypassing',
      slug: 'second-order-sqli-waf-bypassing',
      description:
        'Exploit delayed execution payloads stored in database tables and bypass modern web application firewalls.',
      difficulty: 'Intermediate',
      pointsReward: 250,
      estimatedMinutes: 60,
      prerequisiteRoomId: room21.id,
      roomType: RoomType.challenge,
      targetTemplateSpec: { image: 'cyberforce/second-order:latest', port: 80 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  // Room 23: Out-of-Band (OAST) Exfiltration (Prerequisite: Room 22)
  const room23 = await prisma.room.upsert({
    where: { slug: 'oast-exfiltration' },
    update: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 23,
      title: 'Room 23: Out-of-Band (OAST) Exfiltration',
      difficulty: 'Advanced',
      pointsReward: 250,
      estimatedMinutes: 50,
      prerequisiteRoomId: room22.id,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 4: Advanced Database Exploitation',
      moduleOrder: 4,
      orderIndex: 23,
      title: 'Room 23: Out-of-Band (OAST) Exfiltration',
      slug: 'oast-exfiltration',
      description:
        'Trigger DNS and HTTP callbacks from database server functions to exfiltrate blind records.',
      difficulty: 'Advanced',
      pointsReward: 250,
      estimatedMinutes: 50,
      prerequisiteRoomId: room22.id,
      roomType: RoomType.challenge,
      targetTemplateSpec: { image: 'cyberforce/oast-db:latest', port: 80 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  // Room 24: Module 5 Room
  await prisma.room.upsert({
    where: { slug: 'insecure-deserialization-ssrf' },
    update: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 5: Insecure Deserialization & SSRF',
      moduleOrder: 5,
      orderIndex: 24,
      title: 'Room 24: Server-Side Request Forgery (SSRF) Mastery',
      difficulty: 'Advanced',
      pointsReward: 300,
      estimatedMinutes: 60,
      prerequisiteRoomId: room23.id,
      isFree: false,
      publishedAt: new Date(),
    },
    create: {
      pathId: offensiveWebPath.id,
      moduleName: 'Module 5: Insecure Deserialization & SSRF',
      moduleOrder: 5,
      orderIndex: 24,
      title: 'Room 24: Server-Side Request Forgery (SSRF) Mastery',
      slug: 'insecure-deserialization-ssrf',
      description:
        'Pivot into internal cloud metadata endpoints and microservices via vulnerable web webhooks.',
      difficulty: 'Advanced',
      pointsReward: 300,
      estimatedMinutes: 60,
      prerequisiteRoomId: room23.id,
      roomType: RoomType.challenge,
      targetTemplateSpec: { image: 'cyberforce/ssrf-cloud:latest', port: 80 },
      isFree: false,
      publishedAt: new Date(),
    },
  });

  // ---------------------------------------------------------------------------
  // PATH 2: SOC Analyst Level 1 (Wireframe 2.1)
  // ---------------------------------------------------------------------------
  const socPath = await prisma.learningPath.upsert({
    where: { slug: 'soc-analyst-level-1' },
    update: {
      category: 'Defense',
      difficultyLevel: 'Beginner',
      estimatedHours: 32,
      orderIndex: 2,
      isPublished: true,
      description:
        'Learn log aggregation, threat hunting with SIEM, incident response triage, and malware traffic analysis.',
      iconUrl: 'Radar',
    },
    create: {
      title: 'SOC Analyst Level 1',
      slug: 'soc-analyst-level-1',
      category: 'Defense',
      difficultyLevel: 'Beginner',
      estimatedHours: 32,
      orderIndex: 2,
      isPublished: true,
      description:
        'Learn log aggregation, threat hunting with SIEM, incident response triage, and malware traffic analysis.',
      iconUrl: 'Radar',
    },
  });

  const socRoom1 = await prisma.room.upsert({
    where: { slug: 'splunk-fundamentals' },
    update: {
      pathId: socPath.id,
      moduleName: 'Module 1: SIEM & Log Analysis',
      moduleOrder: 1,
      orderIndex: 1,
      title: 'Room 1: Splunk Fundamentals & Search Processing Language',
      difficulty: 'Easy',
      pointsReward: 150,
      estimatedMinutes: 40,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: socPath.id,
      moduleName: 'Module 1: SIEM & Log Analysis',
      moduleOrder: 1,
      orderIndex: 1,
      title: 'Room 1: Splunk Fundamentals & Search Processing Language',
      slug: 'splunk-fundamentals',
      description:
        'Master SPL queries, field extractions, and timeline correlation across Windows Event Logs.',
      difficulty: 'Easy',
      pointsReward: 150,
      estimatedMinutes: 40,
      roomType: RoomType.walkthrough,
      targetTemplateSpec: { image: 'cyberforce/splunk-siem:latest', port: 8000 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  await prisma.room.upsert({
    where: { slug: 'wireshark-pcap-analysis' },
    update: {
      pathId: socPath.id,
      moduleName: 'Module 1: SIEM & Log Analysis',
      moduleOrder: 1,
      orderIndex: 2,
      title: 'Room 2: Network Forensics with Wireshark',
      difficulty: 'Easy',
      pointsReward: 150,
      estimatedMinutes: 45,
      prerequisiteRoomId: socRoom1.id,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: socPath.id,
      moduleName: 'Module 1: SIEM & Log Analysis',
      moduleOrder: 1,
      orderIndex: 2,
      title: 'Room 2: Network Forensics with Wireshark',
      slug: 'wireshark-pcap-analysis',
      description:
        'Inspect TCP handshakes, TLS certificates, DNS exfiltration, and HTTP streams in packet captures.',
      difficulty: 'Easy',
      pointsReward: 150,
      estimatedMinutes: 45,
      prerequisiteRoomId: socRoom1.id,
      roomType: RoomType.walkthrough,
      targetTemplateSpec: { image: 'cyberforce/wireshark-lab:latest', port: 3000 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  // ---------------------------------------------------------------------------
  // PATH 3: Cloud Defense & DevSecOps (Wireframe 2.1)
  // ---------------------------------------------------------------------------
  const cloudPath = await prisma.learningPath.upsert({
    where: { slug: 'cloud-defense-devsecops' },
    update: {
      category: 'Cloud',
      difficultyLevel: 'Advanced',
      estimatedHours: 40,
      orderIndex: 3,
      isPublished: true,
      description:
        'Harden Kubernetes clusters, audit AWS IAM policies, secure Docker supply chains, and build automated CI/CD guardrails.',
      iconUrl: 'Cloud',
    },
    create: {
      title: 'Cloud Defense & DevSecOps',
      slug: 'cloud-defense-devsecops',
      category: 'Cloud',
      difficultyLevel: 'Advanced',
      estimatedHours: 40,
      orderIndex: 3,
      isPublished: true,
      description:
        'Harden Kubernetes clusters, audit AWS IAM policies, secure Docker supply chains, and build automated CI/CD guardrails.',
      iconUrl: 'Cloud',
    },
  });

  await prisma.room.upsert({
    where: { slug: 'k8s-network-policies' },
    update: {
      pathId: cloudPath.id,
      moduleName: 'Module 1: Container & K8s Security',
      moduleOrder: 1,
      orderIndex: 32,
      title: 'Room 32: Kubernetes Network Policies & Zero Trust',
      difficulty: 'Advanced',
      pointsReward: 300,
      estimatedMinutes: 60,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: cloudPath.id,
      moduleName: 'Module 1: Container & K8s Security',
      moduleOrder: 1,
      orderIndex: 32,
      title: 'Room 32: Kubernetes Network Policies & Zero Trust',
      slug: 'k8s-network-policies',
      description:
        'Implement namespace isolation, Calico CNI rules, and pod-to-pod ingress/egress filtering.',
      difficulty: 'Advanced',
      pointsReward: 300,
      estimatedMinutes: 60,
      roomType: RoomType.challenge,
      targetTemplateSpec: { image: 'cyberforce/k8s-calico:latest', port: 6443 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  // ---------------------------------------------------------------------------
  // PATH 4: Junior Penetration Tester (Wireframe 2.1)
  // ---------------------------------------------------------------------------
  const pentestPath = await prisma.learningPath.upsert({
    where: { slug: 'junior-penetration-tester' },
    update: {
      category: 'Pentest',
      difficultyLevel: 'Intermediate',
      estimatedHours: 30,
      orderIndex: 4,
      isPublished: true,
      description:
        'Conduct comprehensive internal network assessments, enumerate Active Directory, and pivot across compromised subnets.',
      iconUrl: 'Terminal',
    },
    create: {
      title: 'Junior Penetration Tester',
      slug: 'junior-penetration-tester',
      category: 'Pentest',
      difficultyLevel: 'Intermediate',
      estimatedHours: 30,
      orderIndex: 4,
      isPublished: true,
      description:
        'Conduct comprehensive internal network assessments, enumerate Active Directory, and pivot across compromised subnets.',
      iconUrl: 'Terminal',
    },
  });

  await prisma.room.upsert({
    where: { slug: 'kerberos-roasting-ad' },
    update: {
      pathId: pentestPath.id,
      moduleName: 'Module 1: Active Directory Exploitation',
      moduleOrder: 1,
      orderIndex: 10,
      title: 'Room 10: Kerberos Roasting & Ticket Forgery',
      difficulty: 'Intermediate',
      pointsReward: 250,
      estimatedMinutes: 50,
      isFree: true,
      publishedAt: new Date(),
    },
    create: {
      pathId: pentestPath.id,
      moduleName: 'Module 1: Active Directory Exploitation',
      moduleOrder: 1,
      orderIndex: 10,
      title: 'Room 10: Kerberos Roasting & Ticket Forgery',
      slug: 'kerberos-roasting-ad',
      description:
        'Request Service Principal Name (SPN) tickets, crack TGS tickets offline with Hashcat, and forge Golden Tickets.',
      difficulty: 'Intermediate',
      pointsReward: 250,
      estimatedMinutes: 50,
      roomType: RoomType.challenge,
      targetTemplateSpec: { image: 'cyberforce/kerberos-lab:latest', port: 88 },
      isFree: true,
      publishedAt: new Date(),
    },
  });

  // ---------------------------------------------------------------------------
  // SEED TASKS & QUESTIONS FOR ROOM 20, 21, 22
  // ---------------------------------------------------------------------------
  // Clean existing tasks for these rooms to avoid duplicate key issues on re-seed
  await prisma.task.deleteMany({
    where: { roomId: { in: [room20.id, room21.id, room22.id, room23.id] } },
  });

  // Room 20 Tasks
  const r20Task1 = await prisma.task.create({
    data: {
      roomId: room20.id,
      taskOrder: 1,
      title: 'Classic In-Band SQL Injection',
      contentMdx:
        '### In-Band SQLi Basics\nExplore vulnerability vectors where user input affects the query logic directly.',
      questions: {
        create: [
          {
            questionText: 'What is the boolean true condition payload?',
            flagPattern: "' OR 1=1 --",
            flagType: FlagType.static,
            pointsReward: 75,
          },
          {
            questionText: 'Submit the extracted admin password hash.',
            flagPattern: 'CF{sqli_admin_hash_99a8}',
            flagType: FlagType.static,
            pointsReward: 75,
          },
        ],
      },
    },
    include: { questions: true },
  });

  // Room 21 Tasks
  const r21Task1 = await prisma.task.create({
    data: {
      roomId: room21.id,
      taskOrder: 1,
      title: 'Time-Based Data Extraction',
      contentMdx:
        '### Time Delays in SQL\nUsing pg_sleep() or SLEEP() functions to exfiltrate database contents.',
      questions: {
        create: [
          {
            questionText: 'What function pauses execution in PostgreSQL?',
            flagPattern: 'pg_sleep',
            flagType: FlagType.static,
            pointsReward: 100,
          },
          {
            questionText: 'Submit the blind flag extracted from the database table.',
            flagPattern: 'CF{blind_time_delay_success}',
            flagType: FlagType.static,
            pointsReward: 100,
          },
        ],
      },
    },
    include: { questions: true },
  });

  // Room 22 Tasks
  const r22Task1 = await prisma.task.create({
    data: {
      roomId: room22.id,
      taskOrder: 1,
      title: 'Second-Order Stored Payloads',
      contentMdx:
        '### Second-Order Attack Chain\nPayload is stored safely in phase 1, executed in phase 2.',
      questions: {
        create: [
          {
            questionText:
              'Identify the vulnerable user registration field that stores the malicious payload.',
            flagPattern: 'username',
            flagType: FlagType.static,
            pointsReward: 125,
          },
          {
            questionText: 'Submit the flag from the administrative logs table.',
            flagPattern: 'CF{sqli_2nd_order_waf_bypassed}',
            flagType: FlagType.static,
            pointsReward: 125,
          },
        ],
      },
    },
    include: { questions: true },
  });

  // Room 23 Tasks
  await prisma.task.create({
    data: {
      roomId: room23.id,
      taskOrder: 1,
      title: 'OAST Exfiltration via DNS',
      contentMdx:
        '### Out-of-Band Attack Vectors\nTriggering DNS resolution to an external Burp Collaborator or Interactsh server.',
      questions: {
        create: [
          {
            questionText: 'Submit the captured DNS exfiltration token.',
            flagPattern: 'CF{oast_dns_callback_received}',
            flagType: FlagType.static,
            pointsReward: 250,
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // SEED SUBMISSIONS FOR STUDENT NOVICE_HACKER (Simulating Wireframe 2.1 & 2.2)
  // Student completed Room 20 & 21, and completed 1/2 questions in Room 22!
  // Room 23 is LOCKED for student because Room 22 is only 50% completed!
  // ---------------------------------------------------------------------------
  await prisma.submission.deleteMany({
    where: { userId: student.id },
  });

  // Solved all questions of Room 20
  for (const q of r20Task1.questions) {
    await prisma.submission.create({
      data: {
        userId: student.id,
        questionId: q.id,
        submittedValue: q.flagPattern || 'flag',
        isCorrect: true,
        pointsEarned: q.pointsReward,
      },
    });
  }

  // Solved all questions of Room 21
  for (const q of r21Task1.questions) {
    await prisma.submission.create({
      data: {
        userId: student.id,
        questionId: q.id,
        submittedValue: q.flagPattern || 'flag',
        isCorrect: true,
        pointsEarned: q.pointsReward,
      },
    });
  }

  // Solved Question 1 of Room 22 (leaving Question 2 unsolved => 50% progress)
  const q22First = r22Task1.questions[0];
  if (q22First) {
    await prisma.submission.create({
      data: {
        userId: student.id,
        questionId: q22First.id,
        submittedValue: q22First.flagPattern || 'flag',
        isCorrect: true,
        pointsEarned: q22First.pointsReward,
      },
    });
  }

  console.log('✅ Learning Paths, Rooms, Tasks, and Student Submissions seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
