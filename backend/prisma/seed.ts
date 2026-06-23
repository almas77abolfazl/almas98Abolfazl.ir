import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.media.deleteMany();
  await prisma.articles.deleteMany();
  await prisma.skills.deleteMany();
  await prisma.educations.deleteMany();
  await prisma.experiences.deleteMany();
  await prisma.aboutMe.deleteMany();

  await prisma.aboutMe.create({
    data: {
      fullName: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate about building scalable web applications and cloud-native systems.',
      avatarUrl: 'https://example.com/avatar.jpg',
      resumeUrl: 'https://example.com/resume.pdf',
    },
  });

  await prisma.experiences.createMany({
    data: [
      {
        role: 'Senior Backend Engineer',
        company: 'Tech Corp',
        startDate: new Date('2021-03-01'),
        description: 'Led a team of 5 engineers building microservices with Node.js and PostgreSQL.',
        technologies: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      },
      {
        role: 'Full Stack Developer',
        company: 'StartupXYZ',
        startDate: new Date('2018-06-01'),
        endDate: new Date('2021-02-28'),
        description: 'Developed and maintained customer-facing web apps.',
        technologies: ['React', 'NestJS', 'MongoDB'],
      },
    ],
  });

  await prisma.educations.createMany({
    data: [
      {
        degree: 'Bachelor of Science',
        institution: 'State University',
        field: 'Computer Science',
        startDate: new Date('2014-09-01'),
        endDate: new Date('2018-05-01'),
        description: 'Focused on software engineering and distributed systems.',
      },
    ],
  });

  await prisma.skills.createMany({
    data: [
      { name: 'TypeScript', category: 'Languages', proficiency: 90 },
      { name: 'Node.js', category: 'Backend', proficiency: 85 },
      { name: 'React', category: 'Frontend', proficiency: 80 },
      { name: 'PostgreSQL', category: 'Databases', proficiency: 85 },
      { name: 'Docker', category: 'DevOps', proficiency: 75 },
    ],
  });

  await prisma.articles.createMany({
    data: [
      {
        title: 'Getting Started with NestJS',
        slug: 'getting-started-with-nestjs',
        content: 'NestJS is a progressive Node.js framework...',
        excerpt: 'A beginner-friendly guide to NestJS.',
        coverUrl: 'https://example.com/nestjs.jpg',
        published: true,
        publishedAt: new Date('2024-01-15'),
      },
      {
        title: 'Draft Article',
        slug: 'draft-article',
        content: 'This is a draft and should not be publicly listed.',
        excerpt: 'Draft post.',
        published: false,
      },
    ],
  });

  await prisma.media.createMany({
    data: [
      {
        filename: 'profile.jpg',
        originalName: 'profile.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 102400,
        url: 'https://example.com/media/profile.jpg',
        alt: 'Profile photo',
      },
      {
        filename: 'project-screenshot.png',
        originalName: 'project-screenshot.png',
        mimeType: 'image/png',
        sizeBytes: 204800,
        url: 'https://example.com/media/project-screenshot.png',
        alt: 'Project screenshot',
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
