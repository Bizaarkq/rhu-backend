const routes = require('express').Router();
const empleados = require('./empleados');
const incapacidades = require('./incapacidades');
const catalogos = require('./catalogos');
const indemnizaciones = require('./indemnizaciones');

routes.use('/empleados', empleados);
routes.use('/incapacidades', incapacidades);
routes.use('/catalogos', catalogos);
routes.use('/indemnizaciones', indemnizaciones);

routes.get('/', (req, res, next) => {
    res.status(200).json({ err: 0, message: 'Rutas OK' });
});

module.exports = routes;