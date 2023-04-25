const routes = require('express').Router();
const empleados = require('./empleados');

routes.use('/empleados', empleados);

routes.get('/', (req, res, next) => {
    res.status(200).json({ err: 0, message: 'Rutas OK' });
});

module.exports = routes;