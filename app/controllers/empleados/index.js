const {Empleados, plazas} = require('../../models');

exports.crearEmpleado = async (req, res) => {

    try {

        let existsEmpleado = await Empleados.find({ 'datos_personales.dui': req.body.datos_personales.dui });
        
        if (existsEmpleado.length > 0) {
            return res.status(400).json({
                ok: false,
                message: 'El empleado ya existe'
            });
        }

        let {
            datos_personales,
            datos_laborales,
            datos_bancarios,
            datos_afiliacion
        } = req.body;

        const last_codigo = await Empleados.find({}).sort({codigo: -1}).limit(1);

        let empleado = new Empleados({
            codigo: last_codigo.length > 0 ? 
                (parseInt(last_codigo[0].codigo) + 1).toString().padStart(3, '0')
                : '001',
            datos_personales: {
                nombres: datos_personales.nombres,
                apellidos: datos_personales.apellidos,
                fecha_nacimiento: datos_personales.fecha_nacimiento,
                sexo: datos_personales.sexo,
                estado_civil: datos_personales.estado_civil,
                nacionalidad: datos_personales.nacionalidad,
                dui: datos_personales.dui,
                nit: datos_personales.nit,
                direccion: datos_personales.direccion,
                telefono: datos_personales.telefono,
                correo: datos_personales.correo
            },
            datos_laborales: {
                fecha_ingreso: datos_laborales.fecha_ingreso,
                cargo: datos_laborales.cargo,
                tipo_contrato: datos_laborales.tipo_contrato
            },
            datos_bancarios: {
                banco: datos_bancarios.banco,
                cuenta: datos_bancarios.cuenta,
                tipo_cuenta: datos_bancarios.tipo_cuenta
            },
            datos_afiliacion: {
                afp: {
                    afiliacion: datos_afiliacion.afp.afiliacion,
                    numero: datos_afiliacion.afp.numero
                },
                isss: datos_afiliacion.isss
            }
        });
        empleado.save();
        return res.status(200).json({
            ok: true,
            message: 'Empleado creado con éxito',
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

exports.obtenerEmpleado = async (req, res) => {
    const id = req.params.id;
    try {
        let empleado = await Empleados.find({ codigo: id }).populate('datos_laborales.cargo');

        empleado = empleado.length === 0 ?  await Empleados.find({ 'datos_personales.dui': id }).populate('datos_laborales.cargo') : empleado;
        empleado = empleado.length === 0 ?  await Empleados.find({ 'datos_personales.nit': id }).populate('datos_laborales.cargo') : empleado;

        if (empleado.length > 0) {
            return res.status(200).json({
                ok: true,
                message: 'Empleado encontrado',
                empleado
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

exports.obtenerEmpleados = async (req, res) => {
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

exports.actualizarEmpleado = async (req, res) => {
    try{

        let empleado = await Empleados.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});

        return res.status(200).json({
            ok: true,
            message: 'Empleado actualizado con éxito',
            empleado
        });
        
    }catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

exports.despedirEmpleado = async (req, res) => {
    try{
        let emp = await Empleados.findOne({_id: req.params.id});

        if(emp.datos_laborales.fecha_salida){
            return res.status(400).json({
                ok: false,
                message: 'El empleado ya fue despedido'
            });
        }else{
            let empleado = await Empleados.findOneAndUpdate(
                {
                    _id: req.params.id
                }, 
                {
                    'datos_laborales.fecha_salida': Date.now(),
                    estado: "Despedido"
                }, 
                {
                    new: true
                }
            );
            return res.status(200).json({
                ok: true,
                message: empleado ? 
                    'Empleado despedido con éxito' 
                    : 'El Empleado no existe',
                empleado
            });
        }
        
    }catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}