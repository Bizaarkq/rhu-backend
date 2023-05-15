const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const indemnizacionesSchema = new Schema({
    fecha_contratacion: {
        type: Date,
        required: true,
    },
    fecha_finalizacion: {
        type: Date,
        required: false,
    },
    indemnizacion: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    empleado: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'empleados'
    }
});

module.exports = indemnizacionesSchema;