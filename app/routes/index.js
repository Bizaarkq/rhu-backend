const routes = require('express').Router();
const empleados = require('./empleados');
const incapacidades = require('./incapacidades');

routes.use('/empleados', empleados);
routes.use('/incapacidades', incapacidades);

routes.get('/', (req, res, next) => {
    res.status(200).json({ err: 0, message: 'Rutas OK' });
});

module.exports = routes;