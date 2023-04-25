const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departamentosSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
});

module.exports = departamentosSchema;