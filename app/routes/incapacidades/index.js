const routes = require('express').Router();
const controller = require('../../controllers').incapacidades;

routes.post('/add', controller.registrarIncapacidad);
routes.get('/byEmpleado/:id_empleado', controller.obtenerIncapacidadesPorEmpleado);
routes.get('/', controller.obtenerIncapacidades);
routes.post('/edit', controller.editarIncapacidad);
routes.get('/eventos', controller.obtenerIncPorFecha);
routes.post('/delete', controller.eliminarIncapacidad);

module.exports = routes;