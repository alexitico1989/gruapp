import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creando usuario administrador...');

    // Datos del administrador
    const adminData = {
      email: 'admin@gruaschile.com',
      password: 'Admin123!',
      nombre: 'Administrador',
      apellido: 'Sistema',
    };

    // Verificar si ya existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      console.log('⚠️  El administrador ya existe');
      console.log('📧 Email:', adminData.email);
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Crear administrador
    const admin = await prisma.admin.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        nombre: adminData.nombre,
        apellido: adminData.apellido,
      },
    });

    console.log('✅ Administrador creado exitosamente');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Contraseña:', adminData.password);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error al crear administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();