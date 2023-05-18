const empleados = require('./empleados');
const incapacidades = require('./incapacidades');
const catalogos = require('./catalogos');
const ausencias = require('./ausencias');
const boletasPago = require('./empleados/boletas-pago');

module.exports = {
    empleados,
    incapacidades,
    catalogos,
    ausencias,
    boletasPago
}