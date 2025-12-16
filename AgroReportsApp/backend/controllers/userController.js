const { User } = require('../models');

const getEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: { 
        createdBy: req.user.id,
        role: 'employee'
      },
      attributes: ['id', 'name', 'email', 'isActive', 'createdAt']
    });

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados: ' + error.message });
  }
};

const toggleEmployeeStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await User.findOne({
      where: { 
        id: employeeId,
        createdBy: req.user.id,
        role: 'employee'
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    res.json({ 
      message: `Empleado ${employee.isActive ? 'activado' : 'desactivado'} exitosamente`,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        isActive: employee.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado del empleado: ' + error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await User.findOne({
      where: { 
        id: employeeId,
        createdBy: req.user.id,
        role: 'employee'
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    await employee.destroy();

    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empleado: ' + error.message });
  }
};

module.exports = { getEmployees, toggleEmployeeStatus, deleteEmployee };