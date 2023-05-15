const routes = require('express').Router();
const IndemnizacionesController = require('../../controllers/indemnizaciones');

routes.post('/save', IndemnizacionesController.crearIndemnizacion);
// routes.get('/', controller.obtenerEmpleados);
// routes.get('/:id', controller.obtenerEmpleado);
// routes.post('/update/:id', controller.actualizarEmpleado);
// routes.post('/despedir/:id', controller.despedirEmpleado);

module.exports = routes;