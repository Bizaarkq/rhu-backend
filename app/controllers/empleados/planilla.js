const { Empleados, Plazas, Prestaciones } = require("../../models");
const xl = require("excel4node");
const pagoTotal = require("./pago-format").pagoTotal;
const path = require("path");
const fs = require("fs");

exports.pdfPlanilla = async (req, res) => {
  const { anio, mes, quincena } = req.params;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=nombre-del-archivo.xlsx');

  const pathExcel = path.join(
    __dirname,
    `../../../public/planillas/Planilla-${anio}-${mes}-${quincena}.xlsx`
  );
  let planilla = await getPlanilla(anio, mes, quincena);

  if (planilla == undefined) {
    return res.status(400).json({
      ok: false,
      msg: "No se encontraron empleados con los parametros ingresados",
    });
  }

  const wb = new xl.Workbook();
  const ws = wb.addWorksheet("Planilla");

  if(wb instanceof xl.Workbook){
    console.log("es instancia de xl.Workbook");
  }else{
    console.log("no es instancia de xl.Workbook");
  }

  const style = wb.createStyle({
    font: {
      color: "#000000",
      size: 12,
    },
    numberFormat: "$#,##0.00; ($#,##0.00); -",
  });

  const styleHeader = wb.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold: true,
    },
  });

  const styleTotal = wb.createStyle({
    font: {
      color: "#000000",
      size: 12,
      bold: true,
    },
    numberFormat: "$#,##0.00; ($#,##0.00); -",
  });

  const styleTitle = wb.createStyle({
    font: {
      color: "#000000",
      size: 16,
      bold: true,
    },
  });

  const styleSubTitle = wb.createStyle({
    font: {
      color: "#000000",
      size: 14,
      bold: true,
    },
  });

  const columnas = columns;

  ws.cell(1, 1, 1, 14, true).string("Planilla de Salarios").style(styleTitle);
  ws.cell(2, 1, 2, 14, true)
    .string(`Quincena ${quincena} del mes de ${mes} del ${anio}`)
    .style(styleSubTitle);

  columnas.forEach((columna, index) => {
    ws.cell(4, index + 1)
      .string(columna.label)
      .style(styleHeader);
  });

  let row = 5;

  planilla.empleados.forEach((empleado) => {
    columnas.forEach((columna, index) => {
      ws.cell(row, index + 1)
        .string(empleado[columna.id].toString())
        .style(style);
    });
    row++;
  });

  if(ws instanceof xl.Workbook){
    console.log("es instancia de xl.Workbook");
  }else{
    console.log("no es instancia de xl.Workbook");
  }

  wb.write(pathExcel, (err, stats) => {
    if (err) {
      console.error("Error al generar el archivo de Excel:", err);
      res.status(500).send("Error al generar el archivo de Excel");
      return;
    }

    // Descargar el archivo de Excel
    res.download(pathExcel, `Planilla-${anio}${mes}${quincena}.xlsx`, (err) => {
      if (err) {
        console.error("Error al descargar el archivo de Excel:", err);
        res.status(500).send("Error al descargar el archivo de Excel");
        return;
      }

      // Eliminar el archivo después de descargarlo
      fs.unlink(pathExcel, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo de Excel:", err);
        }
      });
    });
  });
};

function getPlanilla(anio, mes, quincena) {
  try {

    return new Promise((resolve, reject) => {
    let totales = { ...pagoTotal };

    Empleados.find({
      "pagos.correlativo.anio": anio,
      "pagos.correlativo.mes": mes,
      "pagos.correlativo.quincena": quincena,
    })
      .populate("datos_laborales.cargo", "puesto salario")
      .populate({
        path: "datos_laborales.cargo",
        populate: {
          path: "departamento",
          model: "departamentos",
          select: "nombre",
        },
      })
      .lean()
      .then((empleados) => {
        const empleadosMap = empleados.map((empleado) => {
          const pago = empleado.pagos
            .filter((pago) => {
              return (
                pago.correlativo.anio == anio &&
                pago.correlativo.mes == mes &&
                pago.correlativo.quincena == quincena
              );
              //&& pago.motivo != "Indemnización";
            })
            .map((pago) => {
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
                salario_mensual: parseFloat(
                  empleado.datos_laborales.cargo.salario
                ).toFixed(2),
                dias_trabajados: pago.dias_trabajados,
                salario_neto: parseFloat(pago.salario_neto).toFixed(2),
                salario_bruto: parseFloat(pago.salario_bruto).toFixed(2),
                salario_quincenal: parseFloat(pago.salario_quincenal).toFixed(
                  2
                ),
                ss_base_calculo: parseFloat(pago.ss_base_calculo).toFixed(2),
                isr_base_calculo: parseFloat(pago.isr_base_calculo).toFixed(2),
                incapacidad_dias: pago.incapacidad.dias,
                incapacidad_obligatorio: parseFloat(
                  pago.incapacidad.obligatorio
                ).toFixed(2),
                incapacidad_remunerado: parseFloat(
                  pago.incapacidad.remunerado
                ).toFixed(2),
                ausencias: parseFloat(pago.ausencias.descuento).toFixed(2),
                ausencias_dias: pago.ausencias.dias,
                vacacion: parseFloat(pago.vacacion?.prima).toFixed(2),
                otros_ingresos: parseFloat(pago.otros_ingresos).toFixed(2),
                ingresos_no_gravados: parseFloat(
                  pago.ingresos_no_gravados
                ).toFixed(2),
                insaforp: parseFloat(pago.insaforp).toFixed(2),
                isss: parseFloat(pago.isss.empleado).toFixed(2),
                isss_patrono: parseFloat(pago.isss.patrono).toFixed(2),
                afp: parseFloat(pago.afp.empleado).toFixed(2),
                afp_patrono: parseFloat(pago.afp.patrono).toFixed(2),
                renta: parseFloat(pago.renta.isr).toFixed(2),
                renta_devolucion: parseFloat(pago.renta.devolucion).toFixed(2),
                descuentos_ciclicos: parseFloat(
                  pago.descuentos_ciclicos
                ).toFixed(2),
                otros_descuentos: parseFloat(pago.otros_descuentos).toFixed(2),
              };
            });

          const dat_lab = empleado.datos_laborales;

          const emp = {
            codigo: empleado.codigo,
            nombre:
              empleado.datos_personales.nombres +
              " " +
              empleado.datos_personales.apellidos,
            cargo: dat_lab.cargo.plaza,
            departamento: dat_lab.cargo.departamento.nombre,
          };

          totales = sumarPago(totales, pago[0]);

          return {
            ...pago[0],
            ...emp,
          };
        });
        resolve( {
          empleados: empleadosMap,
          totales: totales,
        });
      });
    });
  } catch (e) {
    console.log(e);
    return {};
  }
}

const sumarPago = (totales, pago) => {
  Object.keys(totales).forEach((key) => {
    totales[key] = (parseFloat(pago[key]) + parseFloat(totales[key])).toFixed(
      2
    );
  });

  return totales;
};

const columns = [
  { id: "codigo", label: "Código", minWidth: 100 },
  { id: "nombre", label: "Nombre", minWidth: 100 },
  { id: "salario_mensual", label: "Salario Mensual", minWidth: 100 },
  { id: "dias_trabajados", label: "Días Trabajados", minWidth: 100 },
  { id: "incapacidad_dias", label: "Días de Incapacidad", minWidth: 100 },
  { id: "incapacidad_obligatorio", label: "Incapacidad", minWidth: 100 },
  {
    id: "incapacidad_remunerado",
    label: "Incapacidad sin descuento",
    minWidth: 100,
  },
  { id: "ausencias_dias", label: "Días de Ausencias", minWidth: 100 },
  { id: "ausencias", label: "Ausencias", minWidth: 100 },
  { id: "salario_quincenal", label: "Salario Quincenal", minWidth: 100 },
  { id: "vacacion", label: "Vacación", minWidth: 100 },
  { id: "otros_ingresos", label: "Otros Ingresos", minWidth: 100 },
  { id: "ingresos_no_gravados", label: "Ingresos No Gravados", minWidth: 100 },
  { id: "salario_bruto", label: "Salario Bruto", minWidth: 100 },
  {
    id: "ss_base_calculo",
    label: "Base de Cálculo para Seguro Social",
    minWidth: 100,
  },
  { id: "insaforp", label: "INSAFORP", minWidth: 100 },
  { id: "isss", label: "ISSS", minWidth: 100 },
  { id: "isss_patrono", label: "ISSS Patrono", minWidth: 100 },
  { id: "afp", label: "AFP", minWidth: 100 },
  { id: "afp_patrono", label: "AFP Patrono", minWidth: 100 },
  { id: "isr_base_calculo", label: "Base de Cálculo para ISR", minWidth: 100 },
  { id: "renta", label: "Renta", minWidth: 100 },
  { id: "renta_devolucion", label: "Devolución de Renta", minWidth: 100 },
  { id: "descuentos_ciclicos", label: "Descuentos Cíclicos", minWidth: 100 },
  { id: "otros_descuentos", label: "Otros Descuentos", minWidth: 100 },
  { id: "salario_neto", label: "Salario Neto", minWidth: 100 },
  { id: "cargo", label: "Cargo", minWidth: 100 },
  { id: "departamento", label: "Departamento", minWidth: 100 },
];
