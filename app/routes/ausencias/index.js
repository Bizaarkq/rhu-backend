const routes = require('express').Router();
const controller = require('../../controllers').ausencias;

routes.post('/add', controller.crearAusencia);
routes.post('/edit', controller.editarAusencia);
routes.get('/eventos', controller.obtenerAusPorFecha);
routes.post('/delete', controller.eliminarAusencia);

module.exports = routes;