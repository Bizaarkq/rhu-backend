const { Empleados, Plazas, Prestaciones } = require("../../models");
const moment = require("moment");
const { pagoJson } = require("./pago-format");

const generarBoletaPago = (
  empleado,
  prestaciones,
  cantEmp,
  anio,
  mes,
  quincena
) => {

  // salario quincenal
  const salarioQuincenal = empleado.datos_laborales.cargo.salario / 2;
  const diasQuincena = 15;
  const salario = salarioQuincenal / diasQuincena;
  // inicio de boleta de pago
  let boleta = pagoJson(anio, mes, quincena, "Pago de Salario Quincena");

  // calculo de incapacidades y ausencias de la quincena actual
  boleta.incapacidad = calculoIncapacidades(
    empleado.incapacidades,
    salario,
    anio,
    mes,
    quincena
  );

  boleta.ausencias = calculoAusencias(
    empleado.ausencias,
    salario,
    anio,
    mes,
    quincena
  );
  boleta.dias_trabajados =
    diasQuincena - boleta.incapacidad.dias - boleta.ausencias.dias;

  // calculo de salario quincenal
  boleta.salario_quincenal = boleta.dias_trabajados * salario;
  // calculo de prima de vacaciones
  boleta.vacacion = calculoVacaciones(
    prestaciones.VACACIONES,
    salario,
    anio,
    mes,
    quincena
  );

  //salario bruto
  boleta.salario_bruto =
      boleta.salario_quincenal +
      boleta.incapacidad.obligatorio + 
      boleta.incapacidad.remunerado +
      boleta.vacacion.prima +
      boleta.extraordinarios +
      boleta.otros_ingresos;

  boleta.ingresos_no_gravados =
    boleta.otros_ingresos +
    boleta.incapacidad.remunerado;

  boleta.ss_base_calculo =
    boleta.salario_bruto - boleta.ingresos_no_gravados;

  boleta.insaforp =
    cantEmp > 10
      ? boleta.ss_base_calculo * 0.01
      : 0;

  boleta.isss.patrono = boleta.ss_base_calculo * prestaciones.ISSS.patrono;
  boleta.isss.empleado =
    (boleta.ss_base_calculo *
    prestaciones.ISSS.empleado) > prestaciones.ISSS.limite.quince
      ? prestaciones.ISSS.limite.quince
      : boleta.ss_base_calculo * prestaciones.ISSS.empleado;

  boleta.afp.patrono = boleta.ss_base_calculo * prestaciones.AFP.patrono;
  boleta.afp.empleado = boleta.ss_base_calculo * prestaciones.AFP.empleado;

  boleta.isr_base_calculo = boleta.ss_base_calculo 
  - boleta.isss.empleado 
  - boleta.afp.empleado;

  const tramo = prestaciones.RENTA.tablas_retencion.quince.find((tramo) => {
    return tramo.desde <= salarioQuincenal && tramo.hasta >= salarioQuincenal;
  });

  boleta.renta.isr = tramo ? boleta.isr_base_calculo * tramo.porcentaje : 0;
  boleta.salario_neto =
    boleta.salario_bruto -
    boleta.isss.empleado -
    boleta.afp.empleado -
    boleta.renta.isr -
    boleta.descuentos_ciclicos - 
    boleta.otros_descuentos;

  console.log(boleta);
  return boleta;
};

exports.generarBoletasPago = async (req, res) => {
  const anio = moment().year();
  const mes = moment().month() + 1;
  const quincena = moment().date() <= 15 ? 1 : 2;

  const prestaciones = await Prestaciones.findOne({}).lean();

  let boletas = {
    generadas: [],
    existentes: []
  }

  Empleados.find({
    $or: [
      {
        "datos_laborales.fecha_salida": {
          $exists: false,
        },
      },
      { "datos_laborales.fecha_salida": null },
    ],
  })
    .populate("datos_laborales.cargo")
    .then((empleados) => {
      console.log(typeof empleados)
      const cantEmpleados = empleados.length;
      empleados.forEach((empleado) => {

        let existe = empleado.pagos.find((pago) => {
          return pago.correlativo.anio === anio 
          && pago.correlativo.mes === mes 
          && pago.correlativo.quincena === quincena;
        });
          
        if(existe){
          boletas.existentes.push(empleado.datos_personales.nombres + " " + empleado.datos_personales.apellidos);
          return;
        } else{
          boletas.generadas.push(empleado.datos_personales.nombres + " " + empleado.datos_personales.apellidos);
        }
          
        empleado.pagos.push(
          generarBoletaPago(
            empleado,
            prestaciones,
            cantEmpleados,
            anio,
            mes,
            quincena
          )
        );

        empleado.save();
      });

      return res.status(200).json({
        ok: true,
        message: "Boletas de pago generadas",
        msg: {
          generadas: boletas.generadas.length > 0 
          ? "Boletas generadas en la quincena actual para: " + boletas.generadas.join(", ") 
          : "No se generaron boletas en la quincena actual",
          existentes: boletas.existentes.length > 0
          ? "Boletas ya existentes en la quincena actual para: " + boletas.existentes.join(", ")
          : ""
        }
      });
    });
};

const calculoIncapacidades = (incapacidades, salario, anio, mes, quincena) => {
  
  mes = mes < 10 ? `0${mes}` : mes;
  const fechaInicio = quincena === 1 
  ? moment(`${anio}-${mes}-${25}`).subtract(1, "month")
  : moment(`${anio}-${mes}-${10}`);

  const fechaFin = quincena === 1
  ? moment(`${anio}-${mes}-${9}`)
  : moment(`${anio}-${mes}-${24}`);
  

  const incapa = incapacidades.filter((incapacidad) => {
    const fecha = moment(incapacidad.fecha);
    return (fecha.isBetween(fechaInicio, fechaFin, "days", "[]"));
  });

  const dias = incapa.reduce((total, incapacidad) => {
    return total + incapacidad.dias;
  }, 0);

  const obligatorio = incapa.reduce((total, incapacidad) => {
    return (
      total + (incapacidad.dias > 3 ? 3 * salario : incapacidad.dias * salario)
    );
  }, 0);

  const remunerado = incapa.reduce((total, incapacidad) => {
    return (
      total +
      (incapacidad.dias > 3
        ? incapacidad.remunerado
          ? (incapacidad.dias - 3) * salario * 0.25
          : 0
        : 0)
    );
  }, 0);

  return {
    dias: dias,
    obligatorio: obligatorio,
    remunerado: remunerado,
  };
};

const calculoAusencias = (ausencias, salario, anio, mes, quincena) => {
  mes = mes < 10 ? `0${mes}` : mes;
  const fechaInicio = quincena === 1 
  ? moment(`${anio}-${mes}-${25}`).subtract(1, "month")
  : moment(`${anio}-${mes}-${10}`);

  const fechaFin = quincena === 1
  ? moment(`${anio}-${mes}-${9}`)
  : moment(`${anio}-${mes}-${24}`);

  const aus = ausencias.filter((ausencia) => {
    const fecha = moment(ausencia.fecha);
    return (
      fecha.isBetween(fechaInicio, fechaFin, "days", "[]") 
    );
  });

  const dias = aus.length;

  const descuento = dias * salario;

  return {
    dias: dias,
    descuento: descuento,
  };
};

const calculoVacaciones = (vacas, salario, anio, mes, quincena) => {
  const periodos = vacas.periodos[anio];

  if (!periodos) {
    return {
      dias: 0,
      descuento: 0,
    };
  }

  const fechaPago = moment().year(anio).month(mes - 1).date(quincena === 1 ? 15 : (mes === 2 ? 28 : 30));

  let sigFechaPago = quincena === 1 
  ? fechaPago.date(mes === 2 ? 28 : 30)
  : fechaPago.clone().add(1, "month").date(15);

  let vacaciones = periodos.find((periodo) => {
    let fechaInicio = moment(periodo.desde);
    return fechaInicio.isAfter(fechaPago) && fechaInicio.isBefore(sigFechaPago);
  });
  
  console.log(vacaciones)

  let dias = !!vacaciones 
  ? moment(vacaciones.hasta).diff(moment(vacaciones.desde), "days") + 1
  : 0;

  return !!vacaciones
  ? {
    dias: dias,
    prima: salario * dias * vacas.porcentaje
  } : {
    dias: 0,
    prima: 0
  }
  

};


