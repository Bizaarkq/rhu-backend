const routes = require('express').Router();

routes.get('/', (req, res, next) => {
    res.status(200).json({ err: 0, message: 'Rutas OK' });
});

module.exports = routes;