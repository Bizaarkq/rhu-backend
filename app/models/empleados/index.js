const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ausenciasSchema = new Schema({
    fecha: Date,
    motivo: String,
    observaciones: String
});

const incapacidadSchema = new Schema({
    fecha: Date,
    motivo: String,
    observaciones: String,
    dias: Number,
    remunerado: Boolean
});

const pagoSchema = new Schema({
    fecha: Date,
    correlativo: {
        anio: Number,
        mes: Number,
        quincena: Number
    },
    motivo: String,
    dias_trabajados: Number,
    salario_neto: mongoose.Types.Decimal128,
    salario_bruto: mongoose.Types.Decimal128,
    salario_quincenal: mongoose.Types.Decimal128,
    ss_base_calculo: mongoose.Types.Decimal128,
    isr_base_calculo: mongoose.Types.Decimal128,
    incapacidad: {
        dias: Number,
        remunerado: mongoose.Types.Decimal128,
        obligatorio: mongoose.Types.Decimal128
    },
    ausencias: {
        dias: Number,
        descuento: mongoose.Types.Decimal128
    },
    extra: mongoose.Types.Decimal128,
    vacacion: {
        dias: Number,
        prima: mongoose.Types.Decimal128
    },
    otros_ingresos: mongoose.Types.Decimal128,
    ingresos_no_gravados: mongoose.Types.Decimal128,
    insaforp: mongoose.Types.Decimal128,
    isss: {
        patrono: mongoose.Types.Decimal128,
        empleado: mongoose.Types.Decimal128
    },
    afp: {
        patrono: mongoose.Types.Decimal128,
        empleado: mongoose.Types.Decimal128
    },
    renta: {
        devolucion: mongoose.Types.Decimal128,
        isr: mongoose.Types.Decimal128
    },
    descuentos_ciclicos: mongoose.Types.Decimal128,
    otros_descuentos: mongoose.Types.Decimal128
});

const empleadoSchema = new Schema({
    codigo: String,
    datos_personales: {
        nombres: {
            type: String,
            required: true
        },
        apellidos: {
            type: String,
            required: true
        },
        fecha_nacimiento: Date,
        sexo: String,
        estado_civil: String,
        nacionalidad: String,
        dui: {
            type: String,
            required: true
        },
        direccion: String,
        telefono: String,
        correo: String
    },
    datos_laborales: {
        fecha_ingreso: {
            type: Date,
            required: true,
            default: Date.now
        },
        fecha_salida: Date,
        cargo: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'plazas'
        },
        salario: mongoose.Types.Decimal128,
        tipo_contrato: String
    },
    datos_bancarios: {
        banco: String,
        cuenta: String,
        tipo_cuenta: String
    },
    datos_afiliacion: {
        afp: {
            afiliacion: String,
            numero: String
        },
        isss: String
    },
    ausencias: [ausenciasSchema],
    incapacidades: [incapacidadSchema],
    pagos: [pagoSchema]
});

module.exports = empleadoSchema;