const Inscripcion = require('../models/Inscripcion');
const Frecuencia = require('../models/Frecuencia');

// GET ALL - Obtener todas las inscripciones
const getAllInscripciones = async (req, res) => {
  try {
    console.log('📊 GET /api/inscripciones - Obteniendo todas las inscripciones');
    
    const { 
      tripulante, estado, grupo, tipoVehiculo, diaLlegada, experiencia,
      search, limit, page, N_equipo 
    } = req.query;
    
    // Filtros opcionales
    const filter = { activo: true }; // Solo activas por defecto
    
    if (tripulante) filter.tripulante = tripulante;
    if (estado) filter.estado = estado;
    if (grupo) filter.grupo = new RegExp(grupo, 'i');
    if (tipoVehiculo) filter.tipoVehiculo = tipoVehiculo;
    if (diaLlegada) filter.diaLlegada = diaLlegada;
    if (experiencia) filter.experiencia = experiencia;
    if (N_equipo) filter.N_equipo = parseInt(N_equipo);
    
    // Búsqueda por texto (nombres, apellidos, email, dni)
    if (search) {
      filter.$or = [
        { nombres: new RegExp(search, 'i') },
        { apellidos: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { dni: new RegExp(search, 'i') },
        { marca: new RegExp(search, 'i') },
        { modelo: new RegExp(search, 'i') }
      ];
    }
    
    // Configurar paginación
    const limitNum = parseInt(limit) || 50; // Default 50
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;
    
    // Consulta
    const [inscripciones, total] = await Promise.all([
      Inscripcion.find(filter)
        .sort({ N_equipo: 1, tripulante: 1, fechaInscripcion: -1 })
        .skip(skip)
        .limit(limitNum),
      Inscripcion.countDocuments(filter)
    ]);
    
    console.log(`✅ Encontradas ${inscripciones.length} inscripciones de ${total} total`);
    
    // Respuesta con paginación
    res.status(200).json({
      success: true,
      data: inscripciones.map(i => i.toPublicJSON()),
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error('❌ Error en getAllInscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET BY ID - Obtener inscripción por NRO
const getInscripcionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 GET /api/inscripciones/${id} - Buscando inscripción`);
    
    const inscripcion = await Inscripcion.findOne({ NRO: parseInt(id) });
    
    if (!inscripcion) {
      console.log(`❌ Inscripción con NRO ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }
    
    console.log(`✅ Inscripción encontrada: ${inscripcion.nombres} ${inscripcion.apellidos}`);
    
    res.status(200).json({
      success: true,
      data: inscripcion.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Error en getInscripcionById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET EQUIPO - Obtener todos los miembros de un equipo
const getEquipoById = async (req, res) => {
  try {
    const { equipoId } = req.params;
    console.log(`👥 GET /api/inscripciones/equipo/${equipoId} - Buscando equipo`);
    
    const miembros = await Inscripcion.getEquipoMembers(parseInt(equipoId));
    
    if (!miembros || miembros.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    console.log(`✅ Equipo ${equipoId} encontrado con ${miembros.length} miembros`);
    
    res.status(200).json({
      success: true,
      data: {
        N_equipo: parseInt(equipoId),
        miembros: miembros.map(m => m.toPublicJSON()),
        totalMiembros: miembros.length,
        grupo: miembros[0]?.grupo,
        frecuencia: miembros[0]?.frecuencia,
        liderGrupo: miembros[0]?.liderGrupo
      }
    });
    
  } catch (error) {
    console.error('❌ Error en getEquipoById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST - Crear nueva inscripción
const createInscripcion = async (req, res) => {
  try {
    console.log('📝 POST /api/inscripciones - Creando nueva inscripción');
    console.log('Datos recibidos:', { ...req.body, dni: '[OCULTO]' }); // Ocultar DNI en logs
    
    const inscripcion = new Inscripcion(req.body);
    const savedInscripcion = await inscripcion.save();
    
    console.log(`✅ Inscripción creada con NRO: ${savedInscripcion.NRO}, Equipo: ${savedInscripcion.N_equipo}`);
    
    res.status(201).json({
      success: true,
      message: 'Inscripción creada exitosamente',
      data: savedInscripcion.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Error en createInscripcion:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const messages = {
        email: 'Ya existe una inscripción con este email',
        dni: 'Ya existe una inscripción con este DNI'
      };
      
      // Para índices compuestos
      if (error.keyPattern.N_equipo && error.keyPattern.tripulante) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un ${req.body.tripulante} para el equipo ${req.body.N_equipo}`
        });
      }
      
      return res.status(400).json({
        success: false,
        message: messages[field] || 'Ya existe una inscripción con estos datos'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST - Crear equipo completo (piloto + opcionales)
const createEquipo = async (req, res) => {
  try {
    console.log('👥 POST /api/inscripciones/equipo - Creando equipo completo');
    
    const { miembros } = req.body;
    
    if (!miembros || !Array.isArray(miembros) || miembros.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un miembro (piloto) para crear un equipo'
      });
    }
    
    // Validar que hay un piloto
    const piloto = miembros.find(m => m.tripulante === 'piloto');
    if (!piloto) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un piloto para crear el equipo'
      });
    }
    
    // Obtener siguiente número de equipo
    const N_equipo = Inscripcion.getNextEquipoNumber();
    
    // Crear todas las inscripciones del equipo
    const inscripcionesCreadas = [];
    
    for (const miembro of miembros) {
      const inscripcion = new Inscripcion({
        ...miembro,
        N_equipo
      });
      
      const saved = await inscripcion.save();
      inscripcionesCreadas.push(saved);
    }
    
    console.log(`✅ Equipo ${N_equipo} creado con ${inscripcionesCreadas.length} miembros`);
    
    res.status(201).json({
      success: true,
      message: `Equipo ${N_equipo} creado exitosamente con ${inscripcionesCreadas.length} miembros`,
      data: {
        N_equipo,
        miembros: inscripcionesCreadas.map(i => i.toPublicJSON()),
        totalMiembros: inscripcionesCreadas.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error en createEquipo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PUT - Actualizar inscripción
const updateInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 PUT /api/inscripciones/${id} - Actualizando inscripción`);
    console.log('Datos recibidos:', { ...req.body, dni: '[OCULTO]' });
    
    const inscripcion = await Inscripcion.findOne({ NRO: parseInt(id) });
    
    if (!inscripcion) {
      console.log(`❌ Inscripción con NRO ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }
    
    // Actualizar campos permitidos (no permitir cambiar NRO ni N_equipo directamente)
    const allowedFields = [
      'tripulante', 'grupo', 'nombres', 'apellidos',  'experiencia',
      'grupoSanguineo', 'dni', 'email', 'celular', 'personaContacto', 'deseaPolo', 'talla',
      'celularContacto', 'tipoVehiculo', 'marca', 'modelo', 'año',
      'diaLlegada', 'estado', 'observaciones', 'activo'
    ];
    
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        inscripcion[field] = req.body[field];
      }
    });
    
    const updatedInscripcion = await inscripcion.save();
    
    console.log(`✅ Inscripción actualizada: ${updatedInscripcion.nombres} ${updatedInscripcion.apellidos}`);
    
    res.status(200).json({
      success: true,
      message: 'Inscripción actualizada exitosamente',
      data: updatedInscripcion.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Error en updateInscripcion:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const messages = {
        email: 'Ya existe otra inscripción con este email',
        dni: 'Ya existe otra inscripción con este DNI'
      };
      
      return res.status(400).json({
        success: false,
        message: messages[field] || 'Ya existe otra inscripción con estos datos'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE - Eliminar inscripción (soft delete)
const deleteInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query; // ?hard=true para eliminación física
    
    console.log(`🗑️ DELETE /api/inscripciones/${id} - Eliminando inscripción (hard: ${!!hard})`);
    
    let inscripcion;
    
    if (hard === 'true') {
      // Eliminación física (solo para admin)
      inscripcion = await Inscripcion.findOneAndDelete({ NRO: parseInt(id) });
    } else {
      // Soft delete (marcar como inactiva)
      inscripcion = await Inscripcion.findOneAndUpdate(
        { NRO: parseInt(id) },
        { activo: false, estado: 'CANCELADO' },
        { new: true }
      );
    }
    
    if (!inscripcion) {
      console.log(`❌ Inscripción con NRO ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }
    
    console.log(`✅ Inscripción ${hard === 'true' ? 'eliminada' : 'desactivada'}: ${inscripcion.nombres} ${inscripcion.apellidos}`);
    
    res.status(200).json({
      success: true,
      message: `Inscripción ${hard === 'true' ? 'eliminada' : 'desactivada'} exitosamente`,
      data: inscripcion.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Error en deleteInscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET STATS - Estadísticas de inscripciones
const getInscripcionesStats = async (req, res) => {
  try {
    console.log('📊 GET /api/inscripciones/stats - Obteniendo estadísticas');
    
    const [
      total,
      porTripulante,
      porEstado,
      porTipoVehiculo,
      porExperiencia,
      porDiaLlegada,
      porGrupo,
      totalEquipos,
      recientes
    ] = await Promise.all([
      Inscripcion.countDocuments({ activo: true }),
      Inscripcion.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$tripulante', count: { $sum: 1 } } }
      ]),
      Inscripcion.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ]),
      Inscripcion.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$tipoVehiculo', count: { $sum: 1 } } }
      ]),
      Inscripcion.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$experiencia', count: { $sum: 1 } } }
      ]),
      Inscripcion.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$diaLlegada', count: { $sum: 1 } } }
      ]),
      Inscripcion.aggregate([
        { $match: { activo: true } },
        { $group: { _id: '$grupo', count: { $sum: 1 } } }
      ]),
      Inscripcion.distinct('N_equipo', { activo: true }).then(equipos => equipos.length),
      Inscripcion.countDocuments({
        activo: true,
        fechaInscripcion: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        totalEquipos,
        recientes,
        porTripulante: porTripulante.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        porEstado: porEstado.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        porTipoVehiculo: porTipoVehiculo.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        porExperiencia: porExperiencia.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        porDiaLlegada: porDiaLlegada.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        porGrupo: porGrupo.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    console.error('❌ Error en getInscripcionesStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET GRUPOS - Obtener grupos disponibles desde frecuencias
const getGruposDisponibles = async (req, res) => {
  try {
    console.log('📻 GET /api/inscripciones/grupos - Obteniendo grupos disponibles');
    
    const frecuencias = await Frecuencia.find({ activo: true }).select('grupo frecuencia contacto');
    
    const grupos = frecuencias.map(f => ({
      nombre: f.grupo,
      frecuencia: f.frecuencia,
      lider: f.contacto || ''
    }));
    
    res.status(200).json({
      success: true,
      data: grupos
    });
    
  } catch (error) {
    console.error('❌ Error en getGruposDisponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllInscripciones,
  getInscripcionById,
  getEquipoById,
  createInscripcion,
  createEquipo,
  updateInscripcion,
  deleteInscripcion,
  getInscripcionesStats,
  getGruposDisponibles
};