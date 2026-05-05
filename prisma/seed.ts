/**
 * Seed script — run with:  npm run seed
 *
 * Fictional institution: Meridian Valley Technical University (MVTU)
 * Product name: SummitLink (demo deployment)
 *
 * Accounts:
 *   Admin   → admin@mvtu.demo.edu       / Admin@123456
 *   Faculty → faculty@mvtu.demo.edu     / Faculty@123456
 *   Alumni  → marcus.webb@example.com    / Alumni@123456
 *   Alumni  → elena.marquez@example.com / Alumni@123456
 *   Alumni  → alex.nguyen@example.com    / Alumni@123456  (pending verification)
 *   Student → jordan.hayes@example.com   / Student@123456
 *   Student → casey.flores@example.com   / Student@123456
 *   Student → riley.patel@example.com    / Student@123456
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "3306", 10),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace("/", ""),
  };
}

const adapter = new PrismaMariaDb({
  ...parseDatabaseUrl(process.env.DATABASE_URL!),
  allowPublicKeyRetrieval: true,
});
const db = new PrismaClient({ adapter } as never);

const INSTITUTION = "Meridian Valley Technical University";

async function hashPwd(pwd: string) {
  return bcrypt.hash(pwd, 12);
}

async function upsertSkill(name: string) {
  return db.skill.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function main() {
  console.log("\n🌱  Seeding database…\n");

  const [adminPwd, facultyPwd, alumniPwd, studentPwd] = await Promise.all([
    hashPwd("Admin@123456"),
    hashPwd("Faculty@123456"),
    hashPwd("Alumni@123456"),
    hashPwd("Student@123456"),
  ]);

  const admin = await db.user.upsert({
    where: { email: "admin@mvtu.demo.edu" },
    update: { name: "Morgan Ellis" },
    create: {
      name: "Morgan Ellis",
      email: "admin@mvtu.demo.edu",
      password: adminPwd,
      role: "ADMIN",
    },
  });
  console.log(`✅  ADMIN   : ${admin.email}`);

  await db.staffProfile.upsert({
    where: { userId: admin.id },
    update: {
      title: "Director of Alumni Relations",
      department: "University Advancement",
      phone: "+1 (555) 204-9100",
      officeLocation: "Harrison Hall 312 · North Campus",
      bio: "Leads graduate engagement, employer partnerships, and the SummitLink platform rollout.",
      linkedinUrl: "https://linkedin.com/in/morgan-ellis-demo",
    },
    create: {
      userId: admin.id,
      title: "Director of Alumni Relations",
      department: "University Advancement",
      phone: "+1 (555) 204-9100",
      officeLocation: "Harrison Hall 312 · North Campus",
      bio: "Leads graduate engagement, employer partnerships, and the SummitLink platform rollout.",
      linkedinUrl: "https://linkedin.com/in/morgan-ellis-demo",
    },
  });

  const faculty = await db.user.upsert({
    where: { email: "faculty@mvtu.demo.edu" },
    update: { name: "Dr. Helena Frost" },
    create: {
      name: "Dr. Helena Frost",
      email: "faculty@mvtu.demo.edu",
      password: facultyPwd,
      role: "FACULTY",
    },
  });
  console.log(`✅  FACULTY : ${faculty.email}`);

  await db.staffProfile.upsert({
    where: { userId: faculty.id },
    update: {
      title: "Associate Professor",
      department: "Computer Science & Software Engineering",
      phone: "+1 (555) 204-8821",
      officeLocation: "STEM Complex C · Lab Wing 4",
      bio: "Research interests: distributed systems, human-centered interfaces, and mentoring capstone teams.",
      linkedinUrl: "https://linkedin.com/in/helena-frost-demo",
    },
    create: {
      userId: faculty.id,
      title: "Associate Professor",
      department: "Computer Science & Software Engineering",
      phone: "+1 (555) 204-8821",
      officeLocation: "STEM Complex C · Lab Wing 4",
      bio: "Research interests: distributed systems, human-centered interfaces, and mentoring capstone teams.",
      linkedinUrl: "https://linkedin.com/in/helena-frost-demo",
    },
  });

  await db.facultyManagedProgram.deleteMany({ where: { userId: faculty.id } });
  await db.facultyManagedProgram.createMany({
    data: [
      { userId: faculty.id, program: "BCT" },
      { userId: faculty.id, program: "BIT" },
      { userId: faculty.id, program: "BCE" },
    ],
  });
  console.log(`   → Faculty manages programs: BCT, BIT, BCE`);

  // ── Alumni 1 — Marcus Webb (BCT 2019) ─────────────────────────────────────
  const marcus = await db.user.upsert({
    where: { email: "marcus.webb@example.com" },
    update: { name: "Marcus Webb" },
    create: {
      name: "Marcus Webb",
      email: "marcus.webb@example.com",
      password: alumniPwd,
      role: "ALUMNI",
    },
  });

  const marcusProfile = await db.alumniProfile.upsert({
    where: { userId: marcus.id },
    update: {},
    create: {
      userId: marcus.id,
      batchYear: 2019,
      program: "BCT",
      rollNumber: "MV19-BCT-1042",
      currentCompany: "Arcvolt Labs",
      currentJobTitle: "Staff Software Engineer",
      currentLocation: "Berlin, Germany",
      district: "Mitte",
      province: "",
      country: "Germany",
      linkedinUrl: "https://linkedin.com/in/marcus-webb-demo",
      githubUrl: "https://github.com/marcus-webb-demo",
      bio: `Computer Engineering graduate (${INSTITUTION}, 2019). Builds observability tooling and internal developer platforms. Former teaching assistant for data structures; occasional mentor for MVTU capstone teams.`,
      isVerified: true,
      isEmployed: true,
      verifiedAt: new Date("2024-03-15"),
      verifiedById: admin.id,
    },
  });

  await db.jobHistory.upsert({
    where: { id: "seed-marcus-job-1" },
    update: {},
    create: {
      id: "seed-marcus-job-1",
      profileId: marcusProfile.id,
      company: "Arcvolt Labs",
      jobTitle: "Staff Software Engineer",
      location: "Berlin, Germany",
      startDate: new Date("2022-06-01"),
      isCurrent: true,
      description:
        "Platform engineering for event-driven microservices; TypeScript, Kubernetes, OpenTelemetry.",
    },
  });

  await db.jobHistory.upsert({
    where: { id: "seed-marcus-job-2" },
    update: {},
    create: {
      id: "seed-marcus-job-2",
      profileId: marcusProfile.id,
      company: "Northbridge Apps",
      jobTitle: "Software Engineer II",
      location: "Chicago, IL",
      startDate: new Date("2019-07-15"),
      endDate: new Date("2022-05-20"),
      isCurrent: false,
      description: "Full-stack product squad shipping billing and subscription APIs.",
    },
  });

  await db.education.upsert({
    where: { id: "seed-marcus-edu-1" },
    update: {},
    create: {
      id: "seed-marcus-edu-1",
      profileId: marcusProfile.id,
      institution: INSTITUTION,
      degree: "Bachelor of Science",
      field: "Computer Engineering (BCT)",
      startYear: 2015,
      endYear: 2019,
      isOngoing: false,
    },
  });

  for (const name of ["Go", "Rust", "TypeScript", "Kubernetes", "PostgreSQL", "React"]) {
    const skill = await upsertSkill(name);
    await db.alumniSkill.upsert({
      where: { profileId_skillId: { profileId: marcusProfile.id, skillId: skill.id } },
      update: {},
      create: { profileId: marcusProfile.id, skillId: skill.id },
    });
  }
  console.log(`✅  ALUMNI  : ${marcus.email}  (BCT 2019 · Arcvolt Labs)`);

  // ── Alumni 2 — Elena Marquez (BEX 2020) ───────────────────────────────────
  const elena = await db.user.upsert({
    where: { email: "elena.marquez@example.com" },
    update: { name: "Elena Marquez" },
    create: {
      name: "Elena Marquez",
      email: "elena.marquez@example.com",
      password: alumniPwd,
      role: "ALUMNI",
    },
  });

  const elenaProfile = await db.alumniProfile.upsert({
    where: { userId: elena.id },
    update: {},
    create: {
      userId: elena.id,
      batchYear: 2020,
      program: "BEX",
      rollNumber: "MV20-BEX-0788",
      currentCompany: "Quantiris AI",
      currentJobTitle: "Senior ML Engineer",
      currentLocation: "Toronto, Canada",
      district: "",
      province: "Ontario",
      country: "Canada",
      linkedinUrl: "https://linkedin.com/in/elena-marquez-demo",
      githubUrl: "https://github.com/elena-marquez-demo",
      bio: `Electronics & embedded systems background (${INSTITUTION}, 2020). Now focuses on production ML systems, edge inference, and MLOps with Quantiris AI.`,
      isVerified: true,
      isEmployed: true,
      verifiedAt: new Date("2024-06-01"),
      verifiedById: admin.id,
    },
  });

  await db.jobHistory.upsert({
    where: { id: "seed-elena-job-1" },
    update: {},
    create: {
      id: "seed-elena-job-1",
      profileId: elenaProfile.id,
      company: "Quantiris AI",
      jobTitle: "Senior ML Engineer",
      location: "Toronto, Canada",
      startDate: new Date("2021-09-01"),
      isCurrent: true,
      description: "Deploying vision models for manufacturing QA; ONNX, TensorRT, custom datalakes.",
    },
  });

  await db.jobHistory.upsert({
    where: { id: "seed-elena-job-2" },
    update: {},
    create: {
      id: "seed-elena-job-2",
      profileId: elenaProfile.id,
      company: "Vector Grove Research",
      jobTitle: "Research Engineer",
      location: "Remote · North America",
      startDate: new Date("2020-08-01"),
      endDate: new Date("2021-08-31"),
      isCurrent: false,
      description: "Computer vision prototypes for agriculture robotics pilots.",
    },
  });

  await db.education.upsert({
    where: { id: "seed-elena-edu-1" },
    update: {},
    create: {
      id: "seed-elena-edu-1",
      profileId: elenaProfile.id,
      institution: INSTITUTION,
      degree: "Bachelor of Science",
      field: "Electronics & Communication Engineering (BEX)",
      startYear: 2016,
      endYear: 2020,
      isOngoing: false,
    },
  });

  for (const name of ["Python", "PyTorch", "CUDA", "Docker", "Linux", "C++"]) {
    const skill = await upsertSkill(name);
    await db.alumniSkill.upsert({
      where: { profileId_skillId: { profileId: elenaProfile.id, skillId: skill.id } },
      update: {},
      create: { profileId: elenaProfile.id, skillId: skill.id },
    });
  }
  console.log(`✅  ALUMNI  : ${elena.email}  (BEX 2020 · Quantiris AI)`);

  // ── Alumni 3 — Alex Nguyen (BIT 2021, pending verification) ────────────────
  const alex = await db.user.upsert({
    where: { email: "alex.nguyen@example.com" },
    update: { name: "Alex Nguyen" },
    create: {
      name: "Alex Nguyen",
      email: "alex.nguyen@example.com",
      password: alumniPwd,
      role: "ALUMNI",
    },
  });

  await db.alumniProfile.upsert({
    where: { userId: alex.id },
    update: {},
    create: {
      userId: alex.id,
      batchYear: 2021,
      program: "BIT",
      rollNumber: "MV21-BIT-0321",
      currentCompany: "Cedarbyte Studios",
      currentJobTitle: "Product Engineer",
      currentLocation: "Austin, TX",
      district: "",
      province: "Texas",
      country: "United States",
      linkedinUrl: "https://linkedin.com/in/alex-nguyen-demo",
      bio: `Information Technology graduate (${INSTITUTION}). Previously TA for systems administration labs; exploring cloud-native deployments for creative tooling startups.`,
      isVerified: false,
      isEmployed: true,
      verifiedAt: null,
      verifiedById: null,
    },
  });
  console.log(`✅  ALUMNI  : ${alex.email}  (BIT 2021 · pending verification)`);

  // ── Students ───────────────────────────────────────────────────────────────
  const jordan = await db.user.upsert({
    where: { email: "jordan.hayes@example.com" },
    update: { name: "Jordan Hayes" },
    create: {
      name: "Jordan Hayes",
      email: "jordan.hayes@example.com",
      password: studentPwd,
      role: "STUDENT",
    },
  });
  await db.studentProfile.upsert({
    where: { userId: jordan.id },
    update: {},
    create: {
      userId: jordan.id,
      batchYear: 2024,
      program: "BCT",
      rollNumber: "MV24-BCT-0156",
    },
  });

  const casey = await db.user.upsert({
    where: { email: "casey.flores@example.com" },
    update: { name: "Casey Flores" },
    create: {
      name: "Casey Flores",
      email: "casey.flores@example.com",
      password: studentPwd,
      role: "STUDENT",
    },
  });
  await db.studentProfile.upsert({
    where: { userId: casey.id },
    update: {},
    create: {
      userId: casey.id,
      batchYear: 2024,
      program: "BCE",
      rollNumber: "MV24-BCE-0422",
    },
  });

  const riley = await db.user.upsert({
    where: { email: "riley.patel@example.com" },
    update: { name: "Riley Patel" },
    create: {
      name: "Riley Patel",
      email: "riley.patel@example.com",
      password: studentPwd,
      role: "STUDENT",
    },
  });
  await db.studentProfile.upsert({
    where: { userId: riley.id },
    update: {},
    create: {
      userId: riley.id,
      batchYear: 2025,
      program: "BIT",
      rollNumber: "MV25-BIT-0098",
    },
  });
  console.log(`✅  STUDENTS: ${jordan.email}, ${casey.email}, ${riley.email}`);

  // ── Job postings ───────────────────────────────────────────────────────────
  await db.jobPosting.upsert({
    where: { id: "seed-job-1" },
    update: {},
    create: {
      id: "seed-job-1",
      title: "Senior Frontend Engineer",
      company: "Arcvolt Labs",
      location: "Berlin, Germany · hybrid",
      type: "FULL_TIME",
      description:
        "Design systems-minded frontend engineer for developer tooling. MVTU / SummitLink alumni encouraged to apply. Stack: React, TypeScript, Vite, Playwright.",
      deadline: new Date("2026-06-30"),
      isActive: true,
      postedById: marcus.id,
    },
  });

  await db.jobPosting.upsert({
    where: { id: "seed-job-2" },
    update: {},
    create: {
      id: "seed-job-2",
      title: "Applied Scientist Intern",
      company: "Quantiris AI",
      location: "Toronto, Canada",
      type: "INTERNSHIP",
      description:
        "Summer cohort focused on efficient transformers for sensor fusion. Mentorship from alumni hiring pipeline.",
      deadline: new Date("2026-04-15"),
      isActive: true,
      postedById: faculty.id,
    },
  });

  await db.jobPosting.upsert({
    where: { id: "seed-job-3" },
    update: {},
    create: {
      id: "seed-job-3",
      title: "Staff Backend Engineer — Payments",
      company: "Harborline Commerce",
      location: "Remote · US / EU time zones",
      type: "FULL_TIME",
      description:
        "Own critical paths for checkout and ledger services. Experience with Go or Kotlin and event sourcing preferred.",
      deadline: new Date("2026-05-01"),
      isActive: true,
      postedById: admin.id,
    },
  });

  await db.jobPosting.upsert({
    where: { id: "seed-job-4" },
    update: {},
    create: {
      id: "seed-job-4",
      title: "Graduate Field Engineer",
      company: "Ridgeway Infrastructure Group",
      location: "Denver, CO",
      type: "FULL_TIME",
      description:
        "Rotational program for civil engineering graduates; includes PE exam support and mentorship.",
      deadline: new Date("2026-03-31"),
      isActive: true,
      postedById: admin.id,
    },
  });
  console.log(`✅  JOB POSTINGS : 4 sample postings`);

  // ── Events ─────────────────────────────────────────────────────────────────
  await db.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      title: "SummitLink Alumni Weekend 2026",
      description:
        `Two-day reunion at ${INSTITUTION}: campus tours, innovation showcase, alumni–student mentoring café, and evening gala at the Riverbend Conference Center.`,
      eventType: "REUNION",
      venue: `${INSTITUTION} · Riverbend Conference Center`,
      startDate: new Date("2026-09-18T15:00:00"),
      endDate: new Date("2026-09-19T22:00:00"),
      isPublished: true,
      createdById: admin.id,
    },
  });

  await db.event.upsert({
    where: { id: "seed-event-2" },
    update: {},
    create: {
      id: "seed-event-2",
      title: "Fireside: Building an International Tech Career",
      description:
        "Panel with graduates working across North America and Europe—visa realities, remote leadership, and negotiating compensation.",
      eventType: "GUEST_LECTURE",
      venue: `Sterling Auditorium · ${INSTITUTION}`,
      startDate: new Date("2026-02-12T17:30:00"),
      endDate: new Date("2026-02-12T19:00:00"),
      isPublished: true,
      createdById: faculty.id,
    },
  });

  await db.event.upsert({
    where: { id: "seed-event-3" },
    update: {},
    create: {
      id: "seed-event-3",
      title: "Virtual Tech Mixer — Winter",
      description:
        "Speed-networking rooms by industry (software, civil, architecture). RSVP required for breakout assignments.",
      eventType: "WEBINAR",
      venue: null,
      onlineLink: "https://example.org/summitlink-mixer-winter",
      startDate: new Date("2026-01-22T23:00:00"),
      endDate: new Date("2026-01-23T01:00:00"),
      isPublished: true,
      createdById: admin.id,
    },
  });
  console.log(`✅  EVENTS   : 3 sample events`);

  // ── Announcements ──────────────────────────────────────────────────────────
  await db.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {},
    create: {
      id: "seed-announcement-1",
      title: "Welcome to SummitLink",
      content: `<p>${INSTITUTION} has launched <strong>SummitLink</strong> as the official alumni and career hub. Complete your profile, explore jobs, and RSVP for upcoming events.</p>`,
      isPublished: true,
      createdById: admin.id,
    },
  });

  await db.announcement.upsert({
    where: { id: "seed-announcement-2" },
    update: {},
    create: {
      id: "seed-announcement-2",
      title: "Employer registration — Spring career forum",
      content:
        "<p>Employer registration opens February 1 for the Spring Career Forum. Interested partners should contact Alumni Relations through SummitLink.</p>",
      isPublished: true,
      createdById: admin.id,
    },
  });
  console.log(`✅  ANNOUNCEMENTS : 2 posts`);

  console.log(`
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Seed complete 🎉                                       │
├───────────┬───────────────────────────────────────────────┬─────────────────┤
│  Role     │  Email                                        │  Password       │
├───────────┼───────────────────────────────────────────────┼─────────────────┤
│  ADMIN    │  admin@mvtu.demo.edu                          │  Admin@123456   │
│  FACULTY  │  faculty@mvtu.demo.edu                        │  Faculty@123456 │
│  ALUMNI ✓ │  marcus.webb@example.com                      │  Alumni@123456  │
│  ALUMNI ✓ │  elena.marquez@example.com                    │  Alumni@123456  │
│  ALUMNI ? │  alex.nguyen@example.com (pending)            │  Alumni@123456  │
│  STUDENT  │  jordan.hayes@example.com                     │  Student@123456 │
│  STUDENT  │  casey.flores@example.com                     │  Student@123456 │
│  STUDENT  │  riley.patel@example.com                      │  Student@123456 │
└───────────┴───────────────────────────────────────────────┴─────────────────┘
`);
}

main()
  .catch((e) => {
    console.error("\n❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
