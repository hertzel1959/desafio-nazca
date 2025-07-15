// ===== INSCRIPCIONES CRUD - DESAFÍO NAZCA =====
// Archivo: public/js/inscripciones-crud.js

class InscripcionesCRUD {
    constructor() {
        this.inscripciones = [];
        this.frecuenciasDB = [];
        this.editingId = null;
        
        this.init();
    }

    // Inicializar la aplicación
    init() {
        this.setupEventListeners();
        this.cargarDatos();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botones principales
        document.getElementById('btnNuevaInscripcion').addEventListener('click', () => this.abrirModal());
        document.getElementById('btnVerFrecuencias').addEventListener('click', () => this.mostrarFrecuencias());
        
        // Modales
        document.getElementById('cerrarModal').addEventListener('click', () => this.cerrarModal());
        document.getElementById('btnCancelar').addEventListener('click', () => this.cerrarModal());
        document.getElementById('cerrarModalFrecuencias').addEventListener('click', () => this.cerrarModalFrecuencias());
        document.getElementById('cerrarFrecuencias').addEventListener('click', () => this.cerrarModalFrecuencias());
        
        // Formulario
        document.getElementById('formularioInscripcion').addEventListener('submit', (e) => this.guardarInscripcion(e));
        
        // Búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => this.filtrarInscripciones(e.target.value));
        
        // Auto-completado de grupo
        document.getElementById('grupo').addEventListener('change', (e) => this.autoCompletarGrupo(e.target.value));
        
        // Cerrar modales con clic fuera
        document.getElementById('modalFormulario').addEventListener('click', (e) => {
            if (e.target.id === 'modalFormulario') this.cerrarModal();
        });
        
        document.getElementById('modalFrecuencias').addEventListener('click', (e) => {
            if (e.target.id === 'modalFrecuencias') this.cerrarModalFrecuencias();
        });
    }

    // Cargar datos iniciales
    async cargarDatos() {
        this.showLoading(true);
        try {
            await Promise.all([
                this.cargarInscripciones(),
                this.cargarFrecuencias()
            ]);
            this.actualizarEstadisticas();
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.showError('Error cargando datos del servidor');
        } finally {
            this.showLoading(false);
        }
    }

    // Cargar inscripciones desde la API
    async cargarInscripciones() {
        try {
            const response = await fetch('/api/inscripciones');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            this.inscripciones = await response.json();
            this.renderInscripciones();
        } catch (error) {
            console.error('Error cargando inscripciones:', error);
            this.inscripciones = [];
        }
    }

    // Cargar frecuencias desde la API
    async cargarFrecuencias() {
        try {
            const response = await fetch('/api/frecuencias');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            this.frecuenciasDB = await response.json();
            this.llenarOpcionesGrupos();
        } catch (error) {
            console.error('Error cargando frecuencias:', error);
            this.frecuenciasDB = [];
        }
    }

    // Llenar opciones de grupos en el select
    llenarOpcionesGrupos() {
        const select = document.getElementById('grupo');
        select.innerHTML = '<option value="">Seleccionar...</option>';
        
        this.frecuenciasDB.forEach(frecuencia => {
            const option = document.createElement('option');
            option.value = frecuencia.grupo;
            option.textContent = frecuencia.grupo;
            select.appendChild(option);
        });
        
        // Agregar opción "OTRO"
        const optionOtro = document.createElement('option');
        optionOtro.value = 'OTRO';
        optionOtro.textContent = 'OTRO';
        select.appendChild(optionOtro);
    }

    // Auto-completar datos del grupo
    autoCompletarGrupo(nombreGrupo) {
        const contactoInput = document.getElementById('contacto');
        const frecuenciaInput = document.getElementById('frecuencia');
        const contenedorNuevoGrupo = document.getElementById('contenedorNuevoGrupo');
        
        if (nombreGrupo === 'OTRO') {
            // Mostrar campo para nuevo grupo
            contenedorNuevoGrupo.classList.remove('hidden');
            contactoInput.disabled = false;
            frecuenciaInput.disabled = false;
            contactoInput.value = '';
            frecuenciaInput.value = '';
        } else {
            // Ocultar campo para nuevo grupo
            contenedorNuevoGrupo.classList.add('hidden');
            
            // Buscar datos del grupo en la BD
            const grupoData = this.frecuenciasDB.find(g => g.grupo === nombreGrupo);
            
            if (grupoData) {
                contactoInput.value = grupoData.contacto || '';
                frecuenciaInput.value = grupoData.frecuencia || '';
                contactoInput.disabled = true;
                frecuenciaInput.disabled = true;
            } else {
                contactoInput.disabled = false;
                frecuenciaInput.disabled = false;
                contactoInput.value = '';
                frecuenciaInput.value = '';
            }
        }
    }

    // Renderizar inscripciones en la tabla
    renderInscripciones(inscripcionesFiltradas = null) {
        const tbody = document.getElementById('tablaInscripciones');
        const emptyState = document.getElementById('emptyState');
        const inscripciones = inscripcionesFiltradas || this.inscripciones;
        
        tbody.innerHTML = '';
        
        if (inscripciones.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        inscripciones.forEach(inscripcion => {
            const row = this.crearFilaInscripcion(inscripcion);
            tbody.appendChild(row);
        });
    }

    // Crear fila de inscripción
    crearFilaInscripcion(inscripcion) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm font-medium text-gray-900">${inscripcion.nombres} ${inscripcion.apellidos}</div>
                    <div class="text-sm text-gray-500">${inscripcion.tripulante} • ${inscripcion.experiencia} • ${inscripcion.edad} años</div>
                    <div class="text-xs text-gray-400">DNI: ${inscripcion.dni} • ${inscripcion.grupoSanguineo}</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${inscripcion.grupo}</div>
                <div class="text-sm text-gray-500">N° ${inscripcion.numeroGrupo}</div>
                <div class="text-xs text-gray-400">Contacto: ${inscripcion.contacto}</div>
                <div class="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                    📻 ${inscripcion.frecuencia} MHz
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${inscripcion.email}</div>
                <div class="text-sm text-gray-500">${inscripcion.celular}</div>
                <div class="text-xs text-gray-400">
                    Emergencia: ${inscripcion.personaContacto} (${inscripcion.celularContacto})
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${inscripcion.tipoVehiculo}</div>
                <div class="text-sm text-gray-500">${inscripcion.marca} ${inscripcion.modelo} (${inscripcion.año})</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${inscripcion.diaLlegada}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="inscripcionesCRUD.editarInscripcion('${inscripcion._id}')" class="text-orange-600 hover:text-orange-900">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="inscripcionesCRUD.eliminarInscripcion('${inscripcion._id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        return row;
    }

    // Abrir modal para nueva inscripción
    abrirModal(inscripcion = null) {
        this.editingId = inscripcion ? inscripcion._id : null;
        
        document.getElementById('tituloModal').textContent = 
            inscripcion ? 'Editar Inscripción' : 'Nueva Inscripción';
        
        if (inscripcion) {
            this.llenarFormulario(inscripcion);
        } else {
            this.limpiarFormulario();
            document.getElementById('numeroGrupo').value = this.generarNumeroGrupo();
        }
        
        document.getElementById('modalFormulario').classList.remove('hidden');
    }

    // Cerrar modal de formulario
    cerrarModal() {
        document.getElementById('modalFormulario').classList.add('hidden');
        this.editingId = null;
        this.limpiarFormulario();
    }

    // Mostrar modal de frecuencias
    mostrarFrecuencias() {
        this.renderFrecuencias();
        document.getElementById('modalFrecuencias').classList.remove('hidden');
    }

    // Cerrar modal de frecuencias
    cerrarModalFrecuencias() {
        document.getElementById('modalFrecuencias').classList.add('hidden');
    }

    // Renderizar tabla de frecuencias
    renderFrecuencias() {
        const tbody = document.getElementById('tablaFrecuenciasBody');
        tbody.innerHTML = '';
        
        this.frecuenciasDB.forEach(frecuencia => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${frecuencia.grupo}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${frecuencia.contacto || 'N/A'}</td>
                <td class="px-4 py-3">
                    <span class="px-3 py-1 text-sm font-mono bg-blue-100 text-blue-800 rounded-full">
                        📻 ${frecuencia.frecuencia} MHz
                    </span>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Llenar formulario con datos de inscripción
    llenarFormulario(inscripcion) {
        const campos = [
            'tripulante', 'nombres', 'apellidos', 'edad', 'experiencia', 'grupoSanguineo',
            'dni', 'email', 'celular', 'personaContacto', 'celularContacto',
            'grupo', 'contacto', 'numeroGrupo', 'frecuencia',
            'tipoVehiculo', 'marca', 'modelo', 'año', 'diaLlegada'
        ];
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.value = inscripcion[campo] || '';
            }
        });
        
        // Trigger auto-completado de grupo
        this.autoCompletarGrupo(inscripcion.grupo);
    }

    // Limpiar formulario
    limpiarFormulario() {
        document.getElementById('formularioInscripcion').reset();
        document.getElementById('contenedorNuevoGrupo').classList.add('hidden');
        document.getElementById('contacto').disabled = false;
        document.getElementById('frecuencia').disabled = false;
    }

    // Generar número de grupo automáticamente
    generarNumeroGrupo() {
        return this.inscripciones.length + 1;
    }

    // Guardar inscripción
    async guardarInscripcion(e) {
        e.preventDefault();
        
        if (!this.validarFormulario()) return;
        
        this.showLoading(true);
        
        try {
            const datos = this.obtenerDatosFormulario();
            
            let response;
            if (this.editingId) {
                response = await fetch(`/api/inscripciones/${this.editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });
            } else {
                response = await fetch('/api/inscripciones', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error guardando inscripción');
            }
            
            await this.cargarInscripciones();
            this.cerrarModal();
            this.showSuccess(this.editingId ? 'Inscripción actualizada' : 'Inscripción guardada');
            
        } catch (error) {
            console.error('Error guardando inscripción:', error);
            this.showError('Error guardando inscripción: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // Obtener datos del formulario
    obtenerDatosFormulario() {
        const datos = {};
        
        // Obtener valores de todos los campos
        const campos = [
            'tripulante', 'nombres', 'apellidos', 'edad', 'experiencia', 'grupoSanguineo',
            'dni', 'email', 'celular', 'personaContacto', 'celularContacto',
            'grupo', 'contacto', 'frecuencia',
            'tipoVehiculo', 'marca', 'modelo', 'año', 'diaLlegada'
        ];
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                let valor = elemento.value.trim();
                
                // Conversiones de tipo
                if (campo === 'edad' || campo === 'año') {
                    valor = parseInt(valor);
                } else if (campo === 'frecuencia') {
                    valor = parseFloat(valor);
                }
                
                datos[campo] = valor;
            }
        });
        
        // Si es grupo nuevo, usar el valor del campo nuevoGrupo
        if (datos.grupo === 'OTRO') {
            const nuevoGrupo = document.getElementById('nuevoGrupo').value.trim();
            if (nuevoGrupo) {
                datos.grupo = nuevoGrupo;
            }
        }
        
        // Generar número de grupo si es nueva inscripción
        if (!this.editingId) {
            datos.numeroGrupo = this.generarNumeroGrupo();
        } else {
            datos.numeroGrupo = parseInt(document.getElementById('numeroGrupo').value);
        }
        
        return datos;
    }

    // Validar formulario
    validarFormulario() {
        const datos = this.obtenerDatosFormulario();
        
        // Validar campos obligatorios
        const requeridos = [
            'tripulante', 'nombres', 'apellidos', 'edad', 'experiencia', 'grupoSanguineo',
            'dni', 'email', 'celular', 'personaContacto', 'celularContacto',
            'grupo', 'contacto', 'frecuencia',
            'tipoVehiculo', 'marca', 'modelo', 'año', 'diaLlegada'
        ];
        
        for (let campo of requeridos) {
            if (!datos[campo]) {
                this.showError(`El campo ${campo.replace(/([A-Z])/g, ' $1').toLowerCase()} es obligatorio`);
                return false;
            }
        }
        
        // Validaciones específicas
        if (datos.edad < 1 || datos.edad > 120) {
            this.showError('La edad debe estar entre 1 y 120 años');
            return false;
        }
        
        if (!/^\d{8}$/.test(datos.dni)) {
            this.showError('El DNI debe tener exactamente 8 dígitos');
            return false;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
            this.showError('El email debe tener un formato válido');
            return false;
        }
        
        if (!/^\d{9}$/.test(datos.celular)) {
            this.showError('El celular debe tener exactamente 9 dígitos');
            return false;
        }
        
        if (datos.frecuencia < 144 || datos.frecuencia > 148) {
            this.showError('La frecuencia debe estar entre 144.000 y 148.000 MHz');
            return false;
        }
        
        if (datos.año < 1900 || datos.año > new Date().getFullYear() + 1) {
            this.showError('El año del vehículo debe ser válido');
            return false;
        }
        
        return true;
    }

    // Editar inscripción
    editarInscripcion(id) {
        const inscripcion = this.inscripciones.find(ins => ins._id === id);
        if (inscripcion) {
            this.abrirModal(inscripcion);
        }
    }

    // Eliminar inscripción
    async eliminarInscripcion(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta inscripción?')) {
            return;
        }
        
        this.showLoading(true);
        
        try {
            const response = await fetch(`/api/inscripciones/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Error eliminando inscripción');
            }
            
            await this.cargarInscripciones();
            this.showSuccess('Inscripción eliminada correctamente');
            
        } catch (error) {
            console.error('Error eliminando inscripción:', error);
            this.showError('Error eliminando inscripción');
        } finally {
            this.showLoading(false);
        }
    }

    // Filtrar inscripciones
    filtrarInscripciones(termino) {
        if (!termino.trim()) {
            this.renderInscripciones();
            return;
        }
        
        const filtradas = this.inscripciones.filter(ins =>
            ins.nombres?.toLowerCase().includes(termino.toLowerCase()) ||
            ins.apellidos?.toLowerCase().includes(termino.toLowerCase()) ||
            ins.dni?.includes(termino) ||
            ins.grupo?.toLowerCase().includes(termino.toLowerCase()) ||
            ins.email?.toLowerCase().includes(termino.toLowerCase())
        );
        
        this.renderInscripciones(filtradas);
    }

    // Actualizar estadísticas
    actualizarEstadisticas() {
        document.getElementById('totalInscripciones').textContent = this.inscripciones.length;
        document.getElementById('totalPilotos').textContent = 
            this.inscripciones.filter(i => i.tripulante === 'PILOTO').length;
        document.getElementById('totalGrupos').textContent = 
            new Set(this.inscripciones.map(i => i.grupo)).size;
        document.getElementById('totalFrecuencias').textContent = this.frecuenciasDB.length;
    }

    // Mostrar indicador de carga
    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (show) {
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    }

    // Mostrar mensaje de éxito
    showSuccess(mensaje) {
        this.showNotification(mensaje, 'success');
    }

    // Mostrar mensaje de error
    showError(mensaje) {
        this.showNotification(mensaje, 'error');
    }

    // Mostrar notificación
    showNotification(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            tipo === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
                ${mensaje}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar la aplicación cuando se carga la página
let inscripcionesCRUD;

document.addEventListener('DOMContentLoaded', () => {
    inscripcionesCRUD = new InscripcionesCRUD();
});