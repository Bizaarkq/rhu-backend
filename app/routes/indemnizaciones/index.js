const routes = require('express').Router();
const IndemnizacionesController = require('../../controllers/indemnizaciones');

routes.post('/store', IndemnizacionesController.crearIndemnizacion);
routes.get('/:id', IndemnizacionesController.obtenerIndemnizacion);
routes.get('/', IndemnizacionesController.getIndemnizaciones);



module.exports = routes;