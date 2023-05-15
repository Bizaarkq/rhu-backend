const {Indemnizaciones, Empleados, Plazas} = require('../../models');
const moment = require('moment');

exports.crearIndemnizacion = async (req, res) => {

    try {
        const { dui } = req.body;
        // validamos que el empleado exista
        const empleado = await Empleados.findOne({ 'datos_personales.dui': dui });
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
        console.log(salario)
        // logica indemnizacion
        const anioActual = moment().format('YYYY');
        const finAnio = moment(`${anioActual}-12-31`);
        const inicioAnio = moment(`${anioActual}-01-01`);
        const fecha_contratacion = moment(empleado.datos_laborales.fecha_ingreso);
        // caso de despido
        if( empleado.datos_laborales.fecha_salida != null ){
            console.log('xxxxxxxxxxxxxxx');
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
                indemnizacion: indemnizacionCalculada,
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
            console.log('aaaaaaaaaaaaaaaaa')
            indemnizacionCalculada = salario;
        }else{
            console.log('bbbbbbbbbbbbbbbbbb');
            const salarioPorDia = salario/360;
            const anio = fecha_contratacion.add(1, 'year');
            const diasRestantesDelAnio = finAnio.diff(anio, 'days');
            indemnizacionCalculada = salario +  ( salarioPorDia * diasRestantesDelAnio );
        }

        let indemnizacion = new Indemnizaciones({
            fecha_contratacion,
            indemnizacion: indemnizacionCalculada,
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
        let empleado = await Empleados.find({ _id : id }).populate('datos_laborales.cargo');

        empleado = empleado.length === 0 ?  await Empleados.find({ codigo: id }).populate('datos_laborales.cargo') : empleado;
        empleado = empleado.length === 0 ?  await Empleados.find({ 'datos_personales.dui': id }).populate('datos_laborales.cargo') : empleado;
        empleado = empleado.length === 0 ?  await Empleados.find({ 'datos_personales.nit': id }).populate('datos_laborales.cargo') : empleado;

        if (empleado.length > 0) {
            return res.status(200).json({
                ok: true,
                message: 'Empleado encontrado',
                empleado: empleado[0],
            });
        }else{
            return res.status(404).json({
                ok: false,
                message: 'Empleado no encontrado'
            });
        }
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

exports.obtenerIndemnizaciones = async (req, res) => {
    try {
        let empleado = await Empleados.find({}).populate('datos_laborales.cargo');
        return res.status(200).json({
            ok: true,
            message: 'Empleados encontrados',
            empleado
        });
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

exports.actualizarIndemnizacion = async (req, res) => {
    try{
        const peticion = {
            ...req.body,
            datos_laborales: {
                ...req.body.datos_laborales,
                cargo: req.body.datos_laborales.cargo.value
            }
        }

        let empleado = await Empleados.findOneAndUpdate({_id: req.params.id}, peticion, {new: true});

        return res.status(200).json({
            ok: true,
            message: 'Empleado actualizado con éxito',
            empleado
        });
        
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

