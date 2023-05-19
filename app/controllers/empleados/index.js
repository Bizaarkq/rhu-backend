const {Empleados, Plazas, Departamentos} = require('../../models');
const pagoTotal = require('./pago-format').pagoTotal;


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

        datos_laborales = {
            ...datos_laborales,
            cargo: datos_laborales.cargo.value
        }

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

exports.obtenerEmpleados = async (req, res) => {
    try {
        let empleado = await Empleados.find({
            $or: [
                {
                  "datos_laborales.fecha_salida": {
                    $exists: false,
                  },
                },
                { "datos_laborales.fecha_salida": null },
            ]
        }).populate('datos_laborales.cargo');
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

exports.obtenerEmpleadosBoletas = async (req, res) => {
    try {
        let empleados = await Empleados
        .find({})
        .select('datos_personales datos_laborales pagos codigo')
        .populate('datos_laborales.cargo')
        .lean()
        .then(empleados => {
            return empleados.map(empleado => {
                return {
                    ...empleado,
                    estado: empleado.datos_laborales.fecha_salida ? 'Despedido' : 'Activo',
                    pagos : empleado.pagos.map(pago => {
                        return {
                            id: pago._id,
                            fecha: pago.fecha,
                            correlativo: pago.correlativo.anio + ""
                            + `0${pago.correlativo.mes}`.slice(-2) + ""
                            + empleado.codigo + ""
                            + pago.correlativo.quincena,
                            incapacidad: parseFloat(pago.incapacidad.obligatorio).toFixed(2),
                            salario_quincenal: parseFloat(pago.salario_quincenal).toFixed(2),
                            vacacion: parseFloat(pago.vacacion?.prima).toFixed(2),
                            ingresos_no_gravados: parseFloat(pago.ingresos_no_gravados).toFixed(2),
                            isss: parseFloat(pago.isss.empleado).toFixed(2),
                            afp: parseFloat(pago.afp.empleado).toFixed(2),
                            renta: parseFloat(pago.renta.isr).toFixed(2),
                            ausencias: parseFloat(pago.ausencias.descuento).toFixed(2),
                            descuentos_ciclicos: parseFloat(pago.descuentos_ciclicos).toFixed(2),
                            otros_descuentos: parseFloat(pago.otros_descuentos).toFixed(2),
                            total: parseFloat(pago.salario_neto).toFixed(2)
                        }
                    })
                }
            });
        })

        const sortedPagos = empleados.map(empleado => {
            return {
                ...empleado,
                pagos: empleado.pagos.sort((a, b) => {
                    return a.correlativo < b.correlativo ? -1 : 
                    a.correlativo > b.correlativo ? 1 : 0;
                })
            }
        });

        return res.status(200).json({
            ok: true,
            message: 'Empleados encontrados',
            empleados: sortedPagos
        });
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

exports.obtenerBoleta = async (req, res) => {
    try {
        const id_boleta = req.params.id_boleta;
        const id_empleado = req.params.id_empleado;
        let boleta = await Empleados.findById(id_empleado)
          .select("codigo datos_personales pagos codigo")
          .populate("datos_laborales.cargo")
          .lean()
          .then((empleado) => {
            let pago = empleado.pagos.find((pago) => pago._id == id_boleta);

            if (!pago) {
              return res.status(400).json({
                ok: false,
                message: "La boleta no existe",
              });
            }

            return {
              id: pago._id,
              fecha: pago.fecha,
              correlativo:
                pago.correlativo.anio +
                "" +
                `0${pago.correlativo.mes}`.slice(-2) +
                "" +
                empleado.codigo +
                "" +
                pago.correlativo.quincena,
              incapacidad: parseFloat(pago.incapacidad.obligatorio).toFixed(2),
              salario_quincenal: parseFloat(pago.salario_quincenal).toFixed(2),
              vacacion: parseFloat(pago.vacacion?.prima).toFixed(2),
              otros_ingresos: parseFloat(pago.otros_ingresos).toFixed(2),
              isss: parseFloat(pago.isss.empleado).toFixed(2),
              afp: parseFloat(pago.afp.empleado).toFixed(2),
              renta: parseFloat(pago.renta.isr).toFixed(2),
              ausencias: parseFloat(pago.ausencias.descuento).toFixed(2),
              descuentos_ciclicos: parseFloat(pago.descuentos_ciclicos).toFixed(2),
              salario_neto: parseFloat(pago.salario_neto).toFixed(2),
              ingresos_no_gravados: parseFloat(pago.ingresos_no_gravados).toFixed(2),
              otros_descuentos: parseFloat(pago.otros_descuentos).toFixed(2),
              dias_trabajados: pago.dias_trabajados,
              empleado: {
                codigo: empleado.codigo,
                datos_personales: empleado.datos_personales,
                datos_laborales: empleado.datos_laborales,
              },
            };
          });

        return res.status(200).json({
            ok: true,
            message: 'Empleados encontrados',
            boleta: boleta
        });
    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

exports.obtenerPlanilla = async (req, res) => {
    const {
        anio,
        mes,
        quincena
    } = req.params;

    try {

        let totales = {...pagoTotal};

        Empleados.find({
            'pagos.correlativo.anio': anio,
            'pagos.correlativo.mes': mes,
            'pagos.correlativo.quincena': quincena
        })
        .populate('datos_laborales.cargo', 'puesto salario')
        .populate({
            path: 'datos_laborales.cargo',
            populate: {
                path: 'departamento',
                model: 'departamentos',
                select: 'nombre'
            }
        })
        .lean()
        .then(empleados => {

            const empleadosMap = empleados.map(empleado => {
                const pago = empleado.pagos.filter(pago => {
                    return pago.correlativo.anio == anio
                    && pago.correlativo.mes == mes
                    && pago.correlativo.quincena == quincena
                }).map(pago => {
                    return {
                        id: pago._id,
                        fecha: pago.fecha,
                        correlativo: pago.correlativo.anio + ""
                        + `0${pago.correlativo.mes}`.slice(-2) + ""
                        + empleado.codigo + ""
                        + pago.correlativo.quincena,
                        salario_mensual: parseFloat(empleado.datos_laborales.cargo.salario).toFixed(2),
                        dias_trabajados: pago.dias_trabajados,
                        salario_neto: parseFloat(pago.salario_neto).toFixed(2),
                        salario_bruto: parseFloat(pago.salario_bruto).toFixed(2),
                        salario_quincenal: parseFloat(pago.salario_quincenal).toFixed(2),
                        ss_base_calculo: parseFloat(pago.ss_base_calculo).toFixed(2),
                        isr_base_calculo: parseFloat(pago.isr_base_calculo).toFixed(2),
                        incapacidad_dias: pago.incapacidad.dias,
                        incapacidad_obligatorio: parseFloat(pago.incapacidad.obligatorio).toFixed(2),
                        incapacidad_remunerado: parseFloat(pago.incapacidad.remunerado).toFixed(2),
                        ausencias: parseFloat(pago.ausencias.descuento).toFixed(2),
                        ausencias_dias: pago.ausencias.dias,
                        vacacion: parseFloat(pago.vacacion?.prima).toFixed(2),
                        otros_ingresos: parseFloat(pago.otros_ingresos).toFixed(2),
                        ingresos_no_gravados: parseFloat(pago.ingresos_no_gravados).toFixed(2),
                        insaforp: parseFloat(pago.insaforp).toFixed(2),
                        isss: parseFloat(pago.isss.empleado).toFixed(2),
                        isss_patrono: parseFloat(pago.isss.patrono).toFixed(2),
                        afp: parseFloat(pago.afp.empleado).toFixed(2),
                        afp_patrono: parseFloat(pago.afp.patrono).toFixed(2),
                        renta: parseFloat(pago.renta.isr).toFixed(2),
                        renta_devolucion: parseFloat(pago.renta.devolucion).toFixed(2),
                        descuentos_ciclicos: parseFloat(pago.descuentos_ciclicos).toFixed(2),
                        otros_descuentos: parseFloat(pago.otros_descuentos).toFixed(2)
                    }
                })

                const dat_lab = empleado.datos_laborales;

                const emp = {
                    codigo: empleado.codigo,
                    nombre: empleado.datos_personales.nombres + " " + empleado.datos_personales.apellidos,
                    cargo: dat_lab.cargo.plaza,
                    departamento: dat_lab.cargo.departamento.nombre,
                }

                totales = sumarPago(totales, pago[0]);

                return  {
                    ...pago[0],
                    ...emp
                }
            })
            
            
            return res.status(200).json({
                ok: true,
                message: 'Empleados encontrados',
                empleados : empleadosMap,
                totales: totales
            });
        });

    }catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor'
        });
    }
}

const sumarPago = (totales, pago) => {
    Object.keys(totales).forEach(key => {
        totales[key] = (parseFloat(pago[key])
            + parseFloat(totales[key])).toFixed(2);
    });

    return totales;
}