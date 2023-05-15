const {Indemnizaciones, Empleados, Plazas} = require('../../models');
const moment = require('moment');

exports.crearIndemnizacion = async (req, res) => {
    try {
        const { empleado: { value } } = req.body;
        // validamos que el empleado exista
        const empleado = await Empleados.findOne({_id: value})
        if (!empleado) {
            return res.status(400).json({
                ok: false,
                message: 'El empleado no existe'
            });
        }
        // obtenemos la plaza y el sario
        const idCargo = empleado.datos_laborales.cargo;
        const plaza = await Plazas.findOne({ _id: idCargo});
        const salario = parseInt(plaza.salario);
        // logica indemnizacion
        const anioActual = moment().format('YYYY');
        const finAnio = moment(`${anioActual}-12-31`);
        const inicioAnio = moment(`${anioActual}-01-01`);
        const fecha_contratacion = moment(empleado.datos_laborales.fecha_ingreso);
        // caso de despido
        if( empleado.datos_laborales.fecha_salida != null ){
            const salida = moment(empleado.datos_laborales.fecha_salida);
            const mesesTrabajados = salida.diff(fecha_contratacion, 'months');
            if(mesesTrabajados < 12){
                return res.status(400).json({
                    ok: false,
                    message: 'El empleado no cumple con el requisito del año para la indemnización'
                });
            }
            const diasTrabajados = salida.diff(inicioAnio, 'days');
            const salarioPorDia = salario/360;
            const indemnizacionCalculada = salarioPorDia*diasTrabajados;

            let indemnizacion = new Indemnizaciones({
                fecha_contratacion,
                fecha_finalizacion: salida,
                indemnizacion: indemnizacionCalculada.toFixed(2),
                empleado: empleado._id,
            });

            // guardamos la indemnizacion
            indemnizacion.save();

            return res.status(200).json({
                ok: true,
                message: 'Indemnizacion aprobada',
                indemnizacion: indemnizacionCalculada.toFixed(2),
            });
        }
        // caso: pago indemnizacion anual
        const mesesTrabajados = finAnio.diff(fecha_contratacion, 'months');
        const aniosTrabajados = finAnio.diff(fecha_contratacion, 'years');
        let indemnizacionCalculada;
        if(mesesTrabajados < 12){
            return res.status(400).json({
                ok: false,
                message: 'El empleado no cumple con el requisito del año para la indemnización'
            });
        }
        if(aniosTrabajados >= 2){
            indemnizacionCalculada = salario;
        }else{
            const salarioPorDia = salario/360;
            const anio = fecha_contratacion.add(1, 'year');
            const diasRestantesDelAnio = finAnio.diff(anio, 'days');
            indemnizacionCalculada = salario +  ( salarioPorDia * diasRestantesDelAnio );
        }

        let indemnizacion = new Indemnizaciones({
            fecha_contratacion,
            indemnizacion: indemnizacionCalculada.toFixed(2),
            empleado: empleado._id,
        });

        // guardamos la indemnizacion
        indemnizacion.save();

        return res.status(200).json({
            ok: true,
            message: 'Indemnizacion aprobada',
            indemnizacion: indemnizacionCalculada.toFixed(2),
        });
        

    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: `Error interno del servidor: ${e}`
        });
    }
    
}

exports.obtenerIndemnizacion = async (req, res) => {
    const id = req.params.id;
    try {
        const indemnizacion = await Indemnizaciones.findOne({ _id : id }).populate('empleado');
        return res.status(200).json({
            ok: true,
            message: 'Indemnización encontrada',
            indemnizacion
        });
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

exports.getIndemnizaciones = async (req, res) => {
    try {
        let indemnizaciones = await Indemnizaciones.find({}).populate('empleado');
        return res.status(200).json({
            ok: true,
            message: 'Indemnizaciones encontradas',
            indemnizaciones
        });
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

