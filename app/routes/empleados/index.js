const routes = require('express').Router();
const controller = require('../../controllers').empleados;
const planilla = require('../../controllers').pdfPlanilla;

routes.post('/save', controller.crearEmpleado);
routes.get('/', controller.obtenerEmpleados);
routes.get('/detalle/:id', controller.obtenerEmpleado);
routes.post('/update/:id', controller.actualizarEmpleado);
routes.post('/despedir/:id', controller.despedirEmpleado);
routes.get('/boletas', controller.obtenerEmpleadosBoletas);
routes.get('/boletas/:id_empleado/:id_boleta', controller.obtenerBoleta);
routes.get('/planilla/get/:anio/:mes/:quincena', controller.obtenerPlanilla);
routes.post('/planilla/generar/:anio/:mes/:quincena', planilla.pdfPlanilla );


module.exports = routes;