import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSync } from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    const existing = await prisma.user.findUnique({
        where: { username: 'admin' },
    });

    if (!existing) {
        await prisma.user.create({
            data: {
                username: 'admin',
                password: hashSync('admin123', 10),
                role: Role.ADMIN,
            },
        });
        console.log('Default admin user created (admin / admin123)');
    } else {
        console.log('Admin user already exists, skipping seed');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
