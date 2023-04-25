const routes = require('express').Router();
const controller = require('../../controllers').empleados;

routes.post('/save', controller.crearEmpleado);
routes.get('/', controller.obtenerEmpleados);
routes.get('/:id', controller.obtenerEmpleado);
routes.post('/update/:id', controller.actualizarEmpleado);
routes.post('/despedir/:id', controller.despedirEmpleado);

module.exports = routes;