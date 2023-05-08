const { Plazas } = require("../../models");

exports.obtenerPlazas = async (req, res) => {
  try {
    let plazas = await Plazas.find({}).populate("departamento");

    let plazaSort = plazas.sort((a, b) => {
      return a.departamento.nombre > b.departamento.nombre ? 1 : 
      a.departamento.nombre < b.departamento.nombre ? -1 : 0;
    });

    return res.status(200).json({
      ok: true,
      plazas,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error,
    });
  }
};
