/**
 * MODELO DE REGISTRO
 * Esquema de MongoDB para registros de participantes
 */

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    // Información básica del equipo
    email: {
        type: String,
        required: [true, 'Email es requerido'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
    },
    password: {
        type: String,
        required: [true, 'Contraseña es requerida'],
        minlength: [6, 'Contraseña debe tener al menos 6 caracteres']
    },
    phone: {
        type: String,
        required: [true, 'Teléfono es requerido'],
        trim: true,
        match: [/^(\+51|51)?[9][0-9]{8}$/, 'Teléfono no válido']
    },
    groupName: {
        type: String,
        required: [true, 'Nombre del grupo es requerido'],
        trim: true,
        maxlength: [100, 'Nombre del grupo no puede exceder 100 caracteres']
    },
    frequency: {
        type: String,
        trim: true,
        maxlength: [50, 'Frecuencia no puede exceder 50 caracteres']
    },
    
    // Líderes del equipo
    leader: {
        name: {
            type: String,
            required: [true, 'Nombre del líder es requerido'],
            trim: true,
            maxlength: [100, 'Nombre no puede exceder 100 caracteres']
        },
        dni: {
            type: String,
            trim: true,
            match: [/^[0-9]{8}$/, 'DNI debe tener 8 dígitos']
        },
        phone: {
            type: String,
            trim: true,
            match: [/^(\+51|51)?[9][0-9]{8}$/, 'Teléfono no válido']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
        },
        license: {
            number: { type: String, trim: true },
            category: { type: String, trim: true },
            expiryDate: { type: Date }
        }
    },
    secondLeader: {
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Nombre no puede exceder 100 caracteres']
        },
        dni: {
            type: String,
            trim: true,
            match: [/^[0-9]{8}$/, 'DNI debe tener 8 dígitos']
        },
        phone: {
            type: String,
            trim: true,
            match: [/^(\+51|51)?[9][0-9]{8}$/, 'Teléfono no válido']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
        },
        license: {
            number: { type: String, trim: true },
            category: { type: String, trim: true },
            expiryDate: { type: Date }
        }
    },
    
    // Miembros adicionales del equipo
    members: [{
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Nombre no puede exceder 100 caracteres']
        },
        dni: {
            type: String,
            trim: true,
            match: [/^[0-9]{8}$/, 'DNI debe tener 8 dígitos']
        },
        phone: {
            type: String,
            trim: true,
            match: [/^(\+51|51)?[9][0-9]{8}$/, 'Teléfono no válido']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
        },
        role: {
            type: String,
            enum: ['driver', 'navigator', 'mechanic', 'support'],
            default: 'support'
        }
    }],
    
    // Información del vehículo
    vehicle: {
        brand: {
            type: String,
            trim: true,
            maxlength: [50, 'Marca no puede exceder 50 caracteres']
        },
        model: {
            type: String,
            trim: true,
            maxlength: [50, 'Modelo no puede exceder 50 caracteres']
        },
        year: {
            type: Number,
            min: [1950, 'Año debe ser mayor a 1950'],
            max: [new Date().getFullYear() + 1, 'Año no puede ser futuro']
        },
        plate: {
            type: String,
            trim: true,
            uppercase: true,
            maxlength: [10, 'Placa no puede exceder 10 caracteres']
        },
        category: {
            type: String,
            enum: ['utv', 'atv', 'moto', 'buggy', '4x4', 'camion'],
            required: [true, 'Categoría del vehículo es requerida']
        },
        engine: {
            type: String,
            trim: true,
            maxlength: [100, 'Información del motor no puede exceder 100 caracteres']
        },
        modifications: {
            type: String,
            trim: true,
            maxlength: [500, 'Modificaciones no pueden exceder 500 caracteres']
        }
    },
    
    // Documentación
    documents: {
        vehicleRegistration: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            filename: { type: String },
            uploadDate: { type: Date }
        },
        soat: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            filename: { type: String },
            uploadDate: { type: Date },
            expiryDate: { type: Date }
        },
        driverLicense: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            filename: { type: String },
            uploadDate: { type: Date }
        },
        medicalCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            filename: { type: String },
            uploadDate: { type: Date }
        }
    },
    
    // Estado del registro
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Información de pago
    payment: {
        amount: {
            type: Number,
            min: [0, 'Monto debe ser positivo']
        },
        method: {
            type: String,
            enum: ['bank_transfer', 'credit_card', 'cash', 'other']
        },
        status: {
            type: String,
            enum: ['pending', 'partial', 'completed', 'refunded'],
            default: 'pending'
        },
        reference: {
            type: String,
            trim: true
        },
        paidAt: {
            type: Date
        },
        receiptUrl: {
            type: String
        }
    },
    
    // Notas y comentarios
    notes: {
        type: String,
        maxlength: [1000, 'Notas no pueden exceder 1000 caracteres']
    },
    adminNotes: {
        type: String,
        maxlength: [1000, 'Notas administrativas no pueden exceder 1000 caracteres']
    },
    
    // Preferencias
    preferences: {
        newsletter: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: true },
        emergencyContact: {
            name: { type: String, trim: true },
            phone: { type: String, trim: true },
            relationship: { type: String, trim: true }
        }
    },
    
    // Metadata
    source: {
        type: String,
        enum: ['web', 'facebook', 'whatsapp', 'referral', 'other'],
        default: 'web'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    
    // Timestamps adicionales
    submittedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// Índices
registrationSchema.index({ email: 1 });
registrationSchema.index({ groupName: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ 'vehicle.category': 1 });
registrationSchema.index({ 'vehicle.plate': 1 });
registrationSchema.index({ createdAt: -1 });
registrationSchema.index({ submittedAt: -1 });
registrationSchema.index({ 'leader.dni': 1 });
registrationSchema.index({ phone: 1 });

// Índice compuesto para búsquedas
registrationSchema.index({ 
    email: 1, 
    groupName: 1, 
    status: 1 
});

// Virtuals
registrationSchema.virtual('totalMembers').get(function() {
    let count = 1; // líder
    if (this.secondLeader && this.secondLeader.name) count++;
    count += this.members.length;
    return count;
});

registrationSchema.virtual('isComplete').get(function() {
    return this.documents.vehicleRegistration.verified &&
           this.documents.soat.verified &&
           this.documents.driverLicense.verified &&
           this.documents.medicalCertificate.verified &&
           this.payment.status === 'completed';
});

registrationSchema.virtual('completionPercentage').get(function() {
    let completed = 0;
    let total = 7; // campos básicos + 4 documentos + pago
    
    // Campos básicos
    if (this.email && this.groupName && this.leader.name) completed++;
    if (this.vehicle.brand && this.vehicle.model && this.vehicle.category) completed++;
    
    // Documentos
    if (this.documents.vehicleRegistration.verified) completed++;
    if (this.documents.soat.verified) completed++;
    if (this.documents.driverLicense.verified) completed++;
    if (this.documents.medicalCertificate.verified) completed++;
    
    // Pago
    if (this.payment.status === 'completed') completed++;
    
    return Math.round((completed / total) * 100);
});

// Middleware pre-save
registrationSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    
    // Actualizar estado de verificación
    if (this.isComplete && !this.isVerified) {
        this.isVerified = true;
        this.verifiedAt = new Date();
    }
    
    next();
});

// Métodos de instancia
registrationSchema.methods.addMember = function(memberData) {
    this.members.push(memberData);
    return this.save();
};

registrationSchema.methods.removeMember = function(memberId) {
    this.members.id(memberId).remove();
    return this.save();
};

registrationSchema.methods.updateDocument = function(docType, data) {
    if (this.documents[docType]) {
        Object.assign(this.documents[docType], data);
        this.documents[docType].uploadDate = new Date();
        return this.save();
    }
    throw new Error('Tipo de documento no válido');
};

registrationSchema.methods.updatePayment = function(paymentData) {
    Object.assign(this.payment, paymentData);
    if (paymentData.status === 'completed') {
        this.payment.paidAt = new Date();
    }
    return this.save();
};

registrationSchema.methods.approve = function(adminId) {
    this.status = 'approved';
    this.verifiedBy = adminId;
    this.verifiedAt = new Date();
    return this.save();
};

registrationSchema.methods.reject = function(adminId, reason) {
    this.status = 'rejected';
    this.verifiedBy = adminId;
    if (reason) {
        this.adminNotes = reason;
    }
    return this.save();
};

// Métodos estáticos
registrationSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

registrationSchema.statics.findByStatus = function(status) {
    return this.find({ status, isActive: true });
};

registrationSchema.statics.findByCategory = function(category) {
    return this.find({ 'vehicle.category': category, isActive: true });
};

registrationSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                pending: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                approved: {
                    $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                },
                rejected: {
                    $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                },
                totalMembers: { $sum: { $add: [1, { $size: '$members' }] } },
                avgCompletionPercentage: { $avg: '$completionPercentage' }
            }
        }
    ]);
    
    const categoryStats = await this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$vehicle.category',
                count: { $sum: 1 }
            }
        }
    ]);
    
    return {
        general: stats[0] || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            totalMembers: 0,
            avgCompletionPercentage: 0
        },
        byCategory: categoryStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {})
    };
};

registrationSchema.statics.getRecentRegistrations = function(days = 7) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    
    return this.find({
        createdAt: { $gte: dateLimit },
        isActive: true
    }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Registration', registrationSchema);