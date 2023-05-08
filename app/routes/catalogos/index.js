const routes = require('express').Router();
const controller = require('../../controllers').catalogos;

routes.get('/plazas', controller.obtenerPlazas);

module.exports = routes;