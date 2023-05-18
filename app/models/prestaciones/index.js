const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tablaRetencionSchema = new Schema({
    desde: mongoose.Types.Decimal128,
    hasta: mongoose.Types.Decimal128,
    porcentaje: mongoose.Types.Decimal128,
    
});

const prestacionSchema = new Schema({
    ISSS : {
        patrono: mongoose.Types.Decimal128,
        empleado: mongoose.Types.Decimal128,
        limite: Number
    },
    AFP : {
        patrono: mongoose.Types.Decimal128,
        empleado: mongoose.Types.Decimal128
    },
    RENTA: [tablaRetencionSchema] 
});

module.exports = prestacionSchema;