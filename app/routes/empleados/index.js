const routes = require('express').Router();
const controller = require('../../controllers').empleados;

routes.post('/save', controller.crearEmpleado);
routes.get('/', controller.obtenerEmpleados);
routes.get('/detalle/:id', controller.obtenerEmpleado);
routes.post('/update/:id', controller.actualizarEmpleado);
routes.post('/despedir/:id', controller.despedirEmpleado);
routes.get('/boletas', controller.obtenerEmpleadosBoletas);
routes.get('/boletas/:id_empleado/:id_boleta', controller.obtenerBoleta);


module.exports = routes;