const routes = require('express').Router();
const controller = require('../../controllers').incapacidades;

routes.post('/add', controller.registrarIncapacidad);
routes.get('/:id_empleado', controller.obtenerIncapacidadesPorEmpleado);
routes.get('/', controller.obtenerIncapacidades);
routes.post('/edit', controller.editarIncapacidad);

module.exports = routes;