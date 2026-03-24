/**
 * Seed script — run with:  npm run seed
 *
 * Accounts created:
 *   Admin   → admin@ioepurwanchal.edu.np       / Admin@123456
 *   Faculty → faculty@ioepurwanchal.edu.np     / Faculty@123456
 *   Alumni  → aarav.sharma@example.com    / Alumni@123456
 *   Alumni  → priya.thapa@example.com     / Alumni@123456
 *   Student → bibek.adhikari@example.com  / Student@123456
 *   Student → sita.rai@example.com        / Student@123456
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

// ─── helpers ────────────────────────────────────────────────────────────────
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

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱  Seeding database…\n");

  const [adminPwd, facultyPwd, alumniPwd, studentPwd] = await Promise.all([
    hashPwd("Admin@123456"),
    hashPwd("Faculty@123456"),
    hashPwd("Alumni@123456"),
    hashPwd("Student@123456"),
  ]);

  // ── 1. Admin ──────────────────────────────────────────────────────────────
  const admin = await db.user.upsert({
    where: { email: "admin@ioepurwanchal.edu.np" },
    update: {},
    create: {
      name: "Department Admin",
      email: "admin@ioepurwanchal.edu.np",
      password: adminPwd,
      role: "ADMIN",
    },
  });
  console.log(`✅  ADMIN   : ${admin.email}`);

  // ── 2. Faculty ────────────────────────────────────────────────────────────
  const faculty = await db.user.upsert({
    where: { email: "faculty@ioepurwanchal.edu.np" },
    update: {},
    create: {
      name: "Dr. Ramesh Pokhrel",
      email: "faculty@ioepurwanchal.edu.np",
      password: facultyPwd,
      role: "FACULTY",
    },
  });
  console.log(`✅  FACULTY : ${faculty.email}`);

  await db.facultyManagedProgram.deleteMany({ where: { userId: faculty.id } });
  await db.facultyManagedProgram.createMany({
    data: [
      { userId: faculty.id, program: "BCT" },
      { userId: faculty.id, program: "BIT" },
    ],
  });
  console.log(`   → Faculty manages programs: BCT, BIT (directory & admin scoped)`);

  // ── 3. Alumni 1 — Aarav Sharma (BCT 2019, Software Engineer at Leapfrog) ──
  const aarav = await db.user.upsert({
    where: { email: "aarav.sharma@example.com" },
    update: {},
    create: {
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      password: alumniPwd,
      role: "ALUMNI",
    },
  });

  const aaravProfile = await db.alumniProfile.upsert({
    where: { userId: aarav.id },
    update: {},
    create: {
      userId: aarav.id,
      batchYear: 2019,
      program: "BCT",
      rollNumber: "074BCT012",
      currentCompany: "Leapfrog Technology",
      currentJobTitle: "Senior Software Engineer",
      currentLocation: "Kathmandu",
      district: "Kathmandu",
      province: "Bagmati",
      country: "Nepal",
      linkedinUrl: "https://linkedin.com/in/aarav-sharma",
      githubUrl: "https://github.com/aarav-sharma",
      bio: "Full-stack engineer passionate about building scalable web apps. BCT graduate from IOE Purwanchal Campus (2019). Currently working at Leapfrog Technology on React and Node.js projects. Open source contributor and tech community enthusiast.",
      isVerified: true,
      isEmployed: true,
      verifiedAt: new Date("2024-03-15"),
      verifiedById: admin.id,
    },
  });

  // Job history
  await db.jobHistory.upsert({
    where: { id: "seed-aarav-job-1" },
    update: {},
    create: {
      id: "seed-aarav-job-1",
      profileId: aaravProfile.id,
      company: "Leapfrog Technology",
      jobTitle: "Senior Software Engineer",
      location: "Kathmandu, Nepal",
      startDate: new Date("2022-01-10"),
      isCurrent: true,
      description: "Leading frontend development for a US-based SaaS product using React, TypeScript, and GraphQL.",
    },
  });

  await db.jobHistory.upsert({
    where: { id: "seed-aarav-job-2" },
    update: {},
    create: {
      id: "seed-aarav-job-2",
      profileId: aaravProfile.id,
      company: "Innovate Tech",
      jobTitle: "Junior Software Developer",
      location: "Kathmandu, Nepal",
      startDate: new Date("2019-08-01"),
      endDate: new Date("2021-12-31"),
      isCurrent: false,
      description: "Developed REST APIs with Node.js and Express. Worked on internal ERP tools.",
    },
  });

  // Education
  await db.education.upsert({
    where: { id: "seed-aarav-edu-1" },
    update: {},
    create: {
      id: "seed-aarav-edu-1",
      profileId: aaravProfile.id,
      institution: "IOE Purwanchal Campus, TU",
      degree: "Bachelor of Engineering",
      field: "Computer Engineering (BCT)",
      startYear: 2015,
      endYear: 2019,
      isOngoing: false,
    },
  });

  // Skills
  const aaravSkills = ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "GraphQL"];
  for (const name of aaravSkills) {
    const skill = await upsertSkill(name);
    await db.alumniSkill.upsert({
      where: { profileId_skillId: { profileId: aaravProfile.id, skillId: skill.id } },
      update: {},
      create: { profileId: aaravProfile.id, skillId: skill.id },
    });
  }
  console.log(`✅  ALUMNI  : ${aarav.email}  (BCT 2019 · Leapfrog Technology)`);

  // ── 4. Alumni 2 — Priya Thapa (BEX 2020, ML Engineer at CloudFactory) ────
  const priya = await db.user.upsert({
    where: { email: "priya.thapa@example.com" },
    update: {},
    create: {
      name: "Priya Thapa",
      email: "priya.thapa@example.com",
      password: alumniPwd,
      role: "ALUMNI",
    },
  });

  const priyaProfile = await db.alumniProfile.upsert({
    where: { userId: priya.id },
    update: {},
    create: {
      userId: priya.id,
      batchYear: 2020,
      program: "BEX",
      rollNumber: "075BEX031",
      currentCompany: "CloudFactory",
      currentJobTitle: "Machine Learning Engineer",
      currentLocation: "Kathmandu",
      district: "Sunsari",
      province: "Koshi",
      country: "Nepal",
      linkedinUrl: "https://linkedin.com/in/priya-thapa",
      githubUrl: "https://github.com/priya-thapa",
      bio: "Electronics & Communication Engineering graduate from IOE Purwanchal Campus (2020). Passionate about machine learning and computer vision. Currently building data annotation pipelines at CloudFactory. Winner of Nepal AI Hackathon 2022.",
      isVerified: true,
      isEmployed: true,
      verifiedAt: new Date("2024-06-01"),
      verifiedById: admin.id,
    },
  });

  await db.jobHistory.upsert({
    where: { id: "seed-priya-job-1" },
    update: {},
    create: {
      id: "seed-priya-job-1",
      profileId: priyaProfile.id,
      company: "CloudFactory",
      jobTitle: "Machine Learning Engineer",
      location: "Dharan, Nepal",
      startDate: new Date("2021-06-15"),
      isCurrent: true,
      description: "Designing and deploying ML pipelines for image classification and NLP tasks. Mentoring junior ML engineers.",
    },
  });

  await db.jobHistory.upsert({
    where: { id: "seed-priya-job-2" },
    update: {},
    create: {
      id: "seed-priya-job-2",
      profileId: priyaProfile.id,
      company: "Fusemachines Nepal",
      jobTitle: "AI Intern",
      location: "Kathmandu, Nepal",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2021-05-31"),
      isCurrent: false,
      description: "Research internship in NLP — built a sentiment analysis model for Nepali text.",
    },
  });

  await db.education.upsert({
    where: { id: "seed-priya-edu-1" },
    update: {},
    create: {
      id: "seed-priya-edu-1",
      profileId: priyaProfile.id,
      institution: "IOE Purwanchal Campus, TU",
      degree: "Bachelor of Engineering",
      field: "Electronics, Communication & Information Engineering (BEX)",
      startYear: 2016,
      endYear: 2020,
      isOngoing: false,
    },
  });

  const priyaSkills = ["Python", "TensorFlow", "PyTorch", "OpenCV", "SQL", "Linux"];
  for (const name of priyaSkills) {
    const skill = await upsertSkill(name);
    await db.alumniSkill.upsert({
      where: { profileId_skillId: { profileId: priyaProfile.id, skillId: skill.id } },
      update: {},
      create: { profileId: priyaProfile.id, skillId: skill.id },
    });
  }
  console.log(`✅  ALUMNI  : ${priya.email}  (BEX 2020 · CloudFactory)`);

  // ── 5. Student 1 — Bibek Adhikari (BCT 2022) ─────────────────────────────
  const bibek = await db.user.upsert({
    where: { email: "bibek.adhikari@example.com" },
    update: {},
    create: {
      name: "Bibek Adhikari",
      email: "bibek.adhikari@example.com",
      password: studentPwd,
      role: "STUDENT",
    },
  });

  await db.studentProfile.upsert({
    where: { userId: bibek.id },
    update: {},
    create: {
      userId: bibek.id,
      batchYear: 2022,
      program: "BCT",
      rollNumber: "079BCT008",
    },
  });
  console.log(`✅  STUDENT : ${bibek.email}  (BCT 2022)`);

  // ── 6. Student 2 — Sita Rai (BCE 2023) ───────────────────────────────────
  const sita = await db.user.upsert({
    where: { email: "sita.rai@example.com" },
    update: {},
    create: {
      name: "Sita Rai",
      email: "sita.rai@example.com",
      password: studentPwd,
      role: "STUDENT",
    },
  });

  await db.studentProfile.upsert({
    where: { userId: sita.id },
    update: {},
    create: {
      userId: sita.id,
      batchYear: 2023,
      program: "BCE",
      rollNumber: "080BCE019",
    },
  });
  console.log(`✅  STUDENT : ${sita.email}  (BCE 2023)`);

  // ── 7. Sample job posting (posted by admin) ───────────────────────────────
  await db.jobPosting.upsert({
    where: { id: "seed-job-1" },
    update: {},
    create: {
      id: "seed-job-1",
      title: "Junior Frontend Developer",
      company: "Leapfrog Technology",
      location: "Kathmandu, Nepal",
      type: "FULL_TIME",
      description:
        "We are looking for a junior frontend developer with React experience. Fresh graduates from IOE Purwanchal Campus are welcome to apply. You will work with a great team building products for US clients.",
      deadline: new Date("2025-08-31"),
      isActive: true,
      postedById: admin.id,
    },
  });

  await db.jobPosting.upsert({
    where: { id: "seed-job-2" },
    update: {},
    create: {
      id: "seed-job-2",
      title: "Machine Learning Internship",
      company: "Fusemachines Nepal",
      location: "Kathmandu, Nepal",
      type: "INTERNSHIP",
      description:
        "6-month paid ML internship. Work on real NLP and computer vision projects. Must know Python and have basic knowledge of scikit-learn or TensorFlow. Final-year students preferred.",
      deadline: new Date("2025-07-15"),
      isActive: true,
      postedById: faculty.id,
    },
  });
  console.log(`✅  JOB POSTINGS : 2 sample postings created`);

  // ── 8. Sample event ───────────────────────────────────────────────────────
  await db.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      title: "Alumni Reunion 2025",
      description:
        "Annual alumni reunion at IOE Purwanchal Campus. Meet your batchmates, network with seniors, and hear inspiring stories from alumni working across Nepal and abroad. Dinner and cultural program included.",
      eventType: "REUNION",
      venue: "IOE Purwanchal Campus, Main Hall, Dharan",
      startDate: new Date("2025-09-20T10:00:00"),
      endDate: new Date("2025-09-20T18:00:00"),
      isPublished: true,
      createdById: admin.id,
    },
  });

  await db.event.upsert({
    where: { id: "seed-event-2" },
    update: {},
    create: {
      id: "seed-event-2",
      title: "Career Guidance: Life After IOE Purwanchal",
      description:
        "A guest lecture by industry veterans sharing their journey from IOE Purwanchal Campus to top tech companies. Topics include resume building, interview prep, and working abroad vs staying in Nepal.",
      eventType: "GUEST_LECTURE",
      venue: "Seminar Hall, Academic Block, IOE Purwanchal Campus",
      startDate: new Date("2025-08-05T14:00:00"),
      endDate: new Date("2025-08-05T17:00:00"),
      isPublished: true,
      createdById: faculty.id,
    },
  });
  console.log(`✅  EVENTS   : 2 sample events created`);

  // ─────────────────────────────────────────────────────────────────────────
  console.log(`
┌───────────────────────────────────────────────────────────────────┐
│                        Seed complete 🎉                            │
├───────────┬──────────────────────────────────────────┬────────────────┤
│  Role     │  Email                                   │  Password      │
├───────────┼──────────────────────────────────────────┼────────────────┤
│  ADMIN    │  admin@ioepurwanchal.edu.np              │  Admin@123456  │
│  FACULTY  │  faculty@ioepurwanchal.edu.np            │  Faculty@123456│
│  ALUMNI   │  aarav.sharma@example.com                │  Alumni@123456 │
│  ALUMNI   │  priya.thapa@example.com                 │  Alumni@123456 │
│  STUDENT  │  bibek.adhikari@example.com              │  Student@123456│
│  STUDENT  │  sita.rai@example.com                    │  Student@123456│
└───────────┴──────────────────────────────────────────┴────────────────┘
`);
}

main()
  .catch((e) => {
    console.error("\n❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
