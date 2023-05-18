const routes = require('express').Router();
const empleados = require('./empleados');
const incapacidades = require('./incapacidades');
const catalogos = require('./catalogos');
const ausencias = require('./ausencias');
const indemnizaciones = require('./indemnizaciones');
const boletasPago = require('./empleados/boletas-pago');

routes.use('/empleados', empleados);
routes.use('/incapacidades', incapacidades);
routes.use('/catalogos', catalogos);
routes.use('/ausencias', ausencias);
routes.use('/indemnizaciones', indemnizaciones);
routes.use('/boletas', boletasPago);

routes.get('/', (req, res, next) => {
    res.status(200).json({ err: 0, message: 'Rutas OK' });
});

module.exports = routes;