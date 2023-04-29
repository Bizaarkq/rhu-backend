const Empleados = require('../../models').Empleados;

exports.registrarIncapacidad = (req, res) => {
    const { id_empleado, fecha, dias, motivo } = req.body;

    Empleados.findOne({_id: id_empleado}).then((empleado) => {
        if(!empleado) return res.status(404).json({ ok: false, message: 'Empleado no encontrado' });

        empleado.incapacidades.push({
            fecha,
            dias,
            motivo
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
                        fecha_fin: new Date(incapacidad.fecha.getTime() + (incapacidad.dias * 24 * 60 * 60 * 1000)),
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
            id_empleado,
            id_incapacidad,
            fecha,
            dias,
            motivo,
            observaciones,
            remunerado
         } = req.body;
    
        Empleados.findOne({_id: id_empleado}).then((empleado) => {
    
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