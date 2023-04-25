const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plazaSchema = new Schema({
    puesto: {
        type: String,
        required: true
    },
    salario: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    departamento: {
        type: Schema.Types.ObjectId,
        ref: 'departamentos',
    }
});

module.exports = plazaSchema;