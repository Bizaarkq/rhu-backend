const mongoose = require('mongoose');
const departamentosSchema = require('./departamentos');
const empleadoSchema = require('./empleados');
const plazaSchema = require('./plazas');
const indemnizacionSchema = require('./Indemnizaciones');

const Departamentos = mongoose.model('departamentos', departamentosSchema);
const Plazas = mongoose.model('plazas', plazaSchema);
const Empleados = mongoose.model('empleados', empleadoSchema);
const Indemnizaciones = mongoose.model('indemnizaciones', indemnizacionSchema);

console.log('Models loaded');
console.log(mongoose.modelNames());

module.exports = {
    Empleados,
    Departamentos,
    Plazas,
    Indemnizaciones,
};