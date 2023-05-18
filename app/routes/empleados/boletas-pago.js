const routes = require('express').Router();
const controller = require('../../controllers').boletasPago;

routes.post('/generar', controller.generarBoletasPago);

module.exports = routes;