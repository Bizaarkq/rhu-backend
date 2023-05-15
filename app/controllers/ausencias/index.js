const Empleados = require('../../models').Empleados;
const moment = require('moment');

exports.crearAusencia = (req, res) => {
    const {
      empleado: { value },
      fecha,
      motivo,
      observaciones
    } = req.body;

    Empleados.findOne({_id: value}).then((empleado) => {
        if(!empleado) return res.status(404).json({ ok: false, message: 'Empleado no encontrado' });

        empleado.ausencias.push({
            fecha,
            motivo,
            observaciones
        });

        empleado.save().then((empleado) => {
            return res.status(200).json({ ok: true, message: 'Ausencias registrada con éxito', empleado });
        }).catch((err) => {
            return res.status(500).json({ ok: false, message: 'Error interno del servidor', err });
        });
    });
}

exports.obtenerAusPorFecha = (req, res) => {
    
    try{
        Empleados.find({}).then((empleados) => {
            let eventos = [];
            empleados.forEach((empleado) => {
                empleado.ausencias.forEach((elem) => {
                    eventos.push({
                        title: empleado.codigo + ': ' + empleado.datos_personales.nombres + ' ' + empleado.datos_personales.apellidos,
                        start: elem.fecha,
                        end: elem.fecha,
                        allDay: true,
                        resource: {
                            id_empleado: empleado._id,
                            id_ausencia: elem._id,
                            codigo: empleado.codigo,
                            observaciones: elem.observaciones,
                            motivo: elem.motivo,
                            fecha_inicio: moment(elem.fecha).format('DD/MM/YYYY'),
                            fecha_fin: moment(elem.fecha).format('DD/MM/YYYY'),
                            fecha: moment(elem.fecha).add(1, 'days').format('YYYY-MM-DD'),
                            empleado: {
                                label: empleado.datos_personales.nombres + ' ' + empleado.datos_personales.apellidos,
                                value: empleado._id
                            }
                        }
                    })
                });
            });

            return res.status(200).json({
                ok: true,
                message: 'Ausencias encontradas',
                eventos
            });
        });
    }catch(e){
        console.log(e);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error interno del servidor', 
            err 
        });
    }
}

exports.editarAusencia = (req, res) => {
    try {
        let { 
            empleado: {value},
            fecha,
            motivo,
            observaciones,
            id_ausencia
         } = req.body;
    
        Empleados.findOne({_id: value}).then((empleado) => {
    
            if(!empleado) return res.status(404).json({ 
                ok: false, 
                message: 'Empleado no encontrado' 
            });
    
            let ausencia = empleado.ausencias.id(id_ausencia);
    
            if(!ausencia) return res.status(404).json({ 
                ok: false, 
                message: 'Ausencia no encontrada' 
            });
    
            ausencia.fecha = fecha ?? ausencia.fecha;
            ausencia.motivo = motivo ?? ausencia.motivo;
            ausencia.observaciones = observaciones ?? ausencia.observaciones;
    
            empleado.save().then((empleado) => {
                return res.status(200).json({ 
                    ok: true, 
                    message: 'Ausencia editada con éxito', 
                    empleado 
                });
            }).catch((err) => {
                return res.status(500).json({ 
                    ok: false, 
                    message: 'Error interno del servidor', 
                    err 
                });
            });
    
        });
    }catch(e){
        console.log(e);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error interno del servidor', 
            err 
        });
    }
}

exports.eliminarAusencia = (req, res) => {
    try{
        const { id_empleado, id_ausencia } = req.body;

        Empleados.findOne({_id: id_empleado}).then((empleado) => {
            if(!empleado) return res.status(404).json({ 
                ok: false, 
                message: 'Empleado no encontrado' 
            });

            empleado.ausencias.pull({_id: id_ausencia});

            empleado.save().then((empleado) => {
                return res.status(200).json({ 
                    ok: true, 
                    message: 'Ausencia eliminada con éxito', 
                    empleado 
                });
            }).catch((err) => {
                return res.status(500).json({ 
                    ok: false, 
                    message: 'Error interno del servidor', 
                    err 
                });
            });
        });
    }catch(e){
        console.log(e);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error interno del servidor', 
            err 
        });
    }
}
