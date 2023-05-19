const moment = require("moment");

exports.pagoJson = (anio, mes,quincena, motivo) => {
    return {
      fecha: moment().format("YYYY-MM-DD"),
      correlativo: {
        anio: anio,
        mes: mes,
        quincena: quincena,
      },
      motivo: motivo,
      dias_trabajados: 0,
      salario_neto: 0,
      salario_bruto: 0,
      salario_quincenal: 0,
      ss_base_calculo: 0,
      isr_base_calculo: 0,
      incapacidad: {
        dias: 0,
        obligatorio: 0,
        remunerado: 0
      },
      ausencias: {
        dias: 0,
        descuento: 0
      },
      extraordinarios: 0,
      vacacion: {
        dias: 0,
        prima: 0
      },
      otros_ingresos: 0,
      ingresos_no_gravados: 0,
      insaforp: 0,
      isss: {
        patrono: 0,
        empleado: 0
      },
      afp: {
        patrono: 0,
        empleado: 0
      },
      renta: {
        isr: 0,
        devolucion: 0,
      },
      descuentos_ciclicos: 0,
      otros_descuentos: 0,
    }
  }


exports.pagoTotal = {
    salario_neto: 0,
    salario_bruto: 0,
    salario_quincenal: 0,
    incapacidad_obligatorio: 0,
    incapacidad_remunerado: 0,
    ausencias: 0,
    vacacion: 0,
    otros_ingresos: 0,
    ingresos_no_gravados: 0,
    insaforp: 0,
    isss: 0,
    isss_patrono: 0,
    afp: 0,
    afp_patrono: 0,
    renta: 0,
    renta_devolucion: 0,
    descuentos_ciclicos: 0,
    otros_descuentos: 0
}