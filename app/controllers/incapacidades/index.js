const Empleados = require('../../models').Empleados;
const moment = require('moment');

exports.registrarIncapacidad = (req, res) => {
    const {
      empleado: { value },
      fecha,
      dias,
      motivo,
      observaciones,
      remunerado
    } = req.body;

    Empleados.findOne({_id: value}).then((empleado) => {
        if(!empleado) return res.status(404).json({ ok: false, message: 'Empleado no encontrado' });

        empleado.incapacidades.push({
            fecha,
            dias,
            motivo,
            observaciones,
            remunerado
        });

        empleado.save().then((empleado) => {
            return res.status(200).json({ ok: true, message: 'Incapacidad registrada con éxito', empleado });
        }).catch((err) => {
            return res.status(500).json({ ok: false, message: 'Error interno del servidor', err });
        });
    });
}

exports.obtenerIncapacidadesPorEmpleado = (req, res) => {
    const { id_empleado } = req.params;

    Empleados.findOne({_id: id_empleado}).then((empleado) => {
        if(!empleado) return res.status(404).json({ ok: false, message: 'Empleado no encontrado' });

        return res.status(200).json({ ok: true, message: 'Incapacidades encontradas', incapacidades: empleado.incapacidades });
    }).catch((err) => {
        return res.status(500).json({ ok: false, message: 'Error interno del servidor', err });
    });
}

exports.obtenerIncapacidades = (req, res) => {
    Empleados.find({}).then((empleados) => {
        let incapacidades = empleados.map((empleado) => {
            return {
                id_empleado: empleado._id,
                codigo: empleado.codigo,
                nombre: empleado.datos_personales.nombre,
                apellidos: empleado.datos_personales.apellidos,
                incapacidades: empleado.incapacidades.map((incapacidad) => {
                    return {
                        id_incapacidad: incapacidad._id,
                        fecha: incapacidad.fecha,
                        fecha_fin: new Date(incapacidad.fecha.getTime() + ((incapacidad.dias - 1) * 24 * 60 * 60 * 1000)),
                        dias: incapacidad.dias,
                        motivo: incapacidad.motivo
                    }
                })
            }
        });

        return res.status(200).json({ ok: true, message: 'Incapacidades encontradas', incapacidades });
    }).catch((err) => {
        return res.status(500).json({ ok: false, message: 'Error interno del servidor', err });
    });
}

exports.editarIncapacidad = (req, res) => {
    try {
        let { 
            empleado: {value},
            fecha,
            dias,
            motivo,
            observaciones,
            remunerado,
            id_incapacidad
         } = req.body;
    
        Empleados.findOne({_id: value}).then((empleado) => {
    
            if(!empleado) return res.status(404).json({ 
                ok: false, 
                message: 'Empleado no encontrado' 
            });
    
            let incapacidad = empleado.incapacidades.id(id_incapacidad);
    
            if(!incapacidad) return res.status(404).json({ 
                ok: false, 
                message: 'Incapacidad no encontrada' 
            });
    
            incapacidad.fecha = fecha ?? incapacidad.fecha;
            incapacidad.dias = dias ?? incapacidad.dias;
            incapacidad.motivo = motivo ?? incapacidad.motivo;
            incapacidad.observaciones = observaciones ?? incapacidad.observaciones;
            incapacidad.remunerado = remunerado ?? incapacidad.remunerado;
    
            empleado.save().then((empleado) => {
                return res.status(200).json({ 
                    ok: true, 
                    message: 'Incapacidad editada con éxito', 
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

exports.obtenerIncPorFecha = (req, res) => {
    
    try{
        Empleados.find({}).then((empleados) => {
            let eventos = [];
            empleados.forEach((empleado) => {
                empleado.incapacidades.forEach((incapacidad) => {
                    eventos.push({
                        title: empleado.codigo + ': ' + empleado.datos_personales.nombres + ' ' + empleado.datos_personales.apellidos,
                        start: incapacidad.fecha,
                        end: new Date(incapacidad.fecha.getTime() + ((incapacidad.dias -1) * 24 * 60 * 60 * 1000)),
                        allDay: true,
                        resource: {
                            id_empleado: empleado._id,
                            id_incapacidad: incapacidad._id,
                            codigo: empleado.codigo,
                            observaciones: incapacidad.observaciones,
                            remunerado: incapacidad.remunerado,
                            dias: incapacidad.dias,
                            motivo: incapacidad.motivo,
                            fecha_inicio: moment(incapacidad.fecha).format('DD/MM/YYYY'),
                            fecha_fin: moment(incapacidad.fecha).add(incapacidad.dias - 1, 'days').format('DD/MM/YYYY'),
                            fecha: moment(incapacidad.fecha).add(1, 'days').format('YYYY-MM-DD'),
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
                message: 'Incapacidades encontradas',
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

exports.eliminarIncapacidad = (req, res) => {
    try{
        const { id_empleado, id_incapacidad } = req.body;

        Empleados.findOne({_id: id_empleado}).then((empleado) => {
            if(!empleado) return res.status(404).json({ 
                ok: false, 
                message: 'Empleado no encontrado' 
            });

            empleado.incapacidades.pull({_id: id_incapacidad});

            empleado.save().then((empleado) => {
                return res.status(200).json({ 
                    ok: true, 
                    message: 'Incapacidad eliminada con éxito', 
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