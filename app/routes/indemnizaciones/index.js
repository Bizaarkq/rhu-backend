const routes = require('express').Router();
const IndemnizacionesController = require('../../controllers/indemnizaciones');

routes.get('/empleados-activos', IndemnizacionesController.obtenerEmpleadosActivos);
routes.post('/store', IndemnizacionesController.crearIndemnizacion);
routes.get('/:id', IndemnizacionesController.obtenerIndemnizacion);
routes.get('/', IndemnizacionesController.getIndemnizaciones);

module.exports = routes;