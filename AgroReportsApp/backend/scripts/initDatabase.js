const { sequelize, User } = require('../models');
require('dotenv').config();

const initDatabase = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Forzar recreación de tablas (solo para desarrollo)
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas exitosamente');
    
    // Crear usuario ingeniero por defecto
    const defaultEngineer = await User.create({
      name: 'Ingeniero Principal',
      email: 'ingeniero@agroapp.com',
      password: 'admin123',
      role: 'engineer'
    });
    
    console.log('✅ Usuario ingeniero creado:');
    console.log('   Email: ingeniero@agroapp.com');
    console.log('   Password: admin123');
    
    // Crear empleado de ejemplo
    const defaultEmployee = await User.create({
      name: 'Empleado Ejemplo',
      email: 'empleado@agroapp.com',
      password: 'empleado123',
      role: 'employee',
      createdBy: defaultEngineer.id
    });
    
    console.log('✅ Usuario empleado creado:');
    console.log('   Email: empleado@agroapp.com');
    console.log('   Password: empleado123');
    
    console.log('🎉 Base de datos inicializada correctamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
};

initDatabase();