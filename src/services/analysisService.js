const LIMITE_INCIDENCIA = 10;

function normalizarNombre(nombre) {
  return String(nombre || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function convertirMinutos(hora) {
  if (!hora || typeof hora !== "string") return null;

  const partes = hora.split(":");
  if (partes.length !== 2) return null;

  const h = Number(partes[0]);
  const m = Number(partes[1]);

  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  return h * 60 + m;
}

function diferenciaHoras(entrada, salida) {
  const minEntrada = convertirMinutos(entrada);
  const minSalida = convertirMinutos(salida);

  if (minEntrada === null || minSalida === null) return 0;

  return Number(((minSalida - minEntrada) / 60).toFixed(2));
}

function fechaExcelAISO(fecha) {
  const partes = String(fecha).split("/");

  const dia = String(partes[0]).padStart(2, "0");
  const mes = String(partes[1]).padStart(2, "0");
  const anio = partes[2];

  return `${anio}-${mes}-${dia}`;
}

function fechaISOAExcel(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${Number(dia)}/${Number(mes)}/${anio}`;
}

function obtenerDiaSemanaDesdeISO(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);

  const diaJS = fecha.getDay();

  return diaJS === 0 ? 6 : diaJS - 1;
}

function listarFechas(inicio, fin) {
  const fechas = [];

  const actual = new Date(`${inicio}T00:00:00`);
  const limite = new Date(`${fin}T00:00:00`);

  while (actual <= limite) {
    fechas.push(actual.toISOString().slice(0, 10));
    actual.setDate(actual.getDate() + 1);
  }

  return fechas;
}

export function agruparMarcas(rows) {
  const resultado = {};

  rows.forEach((row) => {
    const empleado = row["Marc."];
    const fechaHora = row["Estado"];

    if (!empleado || !fechaHora) return;

    const partes = String(fechaHora).trim().split(" ");
    if (partes.length < 2) return;

    const fecha = partes[0];
    const hora = partes[1];

    const key = `${normalizarNombre(empleado)}_${fecha}`;

    if (!resultado[key]) {
      resultado[key] = {
        empleado,
        fecha,
        marcas: []
      };
    }

    resultado[key].marcas.push(hora);
  });

  return Object.values(resultado);
}

export function normalizarMarcas(grupos) {
  return grupos.map((grupo) => {
    const marcasUnicas = [...new Set(grupo.marcas)].sort();

    return {
      empleado: grupo.empleado,
      fecha: grupo.fecha,
      fechaISO: fechaExcelAISO(grupo.fecha),
      entrada: marcasUnicas[0] || null,
      salida:
        marcasUnicas.length > 1
          ? marcasUnicas[marcasUnicas.length - 1]
          : null,
      marcaUnica: marcasUnicas.length === 1
    };
  });
}

function analizarRegistro(registro, horario) {
  const entradaEsperada = horario.hora_entrada;
  const salidaEsperada = horario.hora_salida;

  const entradaReal = registro.entrada;
  const salidaReal = registro.salida;

  let incidencias = [];

  let tardia = 0;
  let salidaTemprana = 0;

  if (registro.marcaUnica) {
    incidencias.push({
      tipo: "Marca única",
      minutos: null,
      descripcion: `Marca única registrada: ${entradaReal}`
    });
  }

  if (entradaReal && entradaEsperada) {
    tardia = convertirMinutos(entradaReal) - convertirMinutos(entradaEsperada);

    if (tardia >= LIMITE_INCIDENCIA) {
      incidencias.push({
        tipo: "Tardía",
        minutos: tardia,
        descripcion: `Tardía ${tardia} min`
      });
    }
  }

  if (salidaReal && salidaEsperada) {
    salidaTemprana =
      convertirMinutos(salidaEsperada) - convertirMinutos(salidaReal);

    if (salidaTemprana >= LIMITE_INCIDENCIA) {
      incidencias.push({
        tipo: "Salida anticipada",
        minutos: salidaTemprana,
        descripcion: `Salida anticipada ${salidaTemprana} min`
      });
    }
  }

  const horasEsperadas = diferenciaHoras(entradaEsperada, salidaEsperada);
  const horasTrabajadas =
    entradaReal && salidaReal ? diferenciaHoras(entradaReal, salidaReal) : 0;

  return {
    empleado: registro.empleado,
    fecha: registro.fecha,
    fechaISO: registro.fechaISO,
    entrada: entradaReal,
    salida: salidaReal,
    marcaUnica: registro.marcaUnica,
    entradaEsperada,
    salidaEsperada,
    tardia,
    salidaTemprana,
    horasEsperadas,
    horasTrabajadas,
    diferencia: Number((horasTrabajadas - horasEsperadas).toFixed(2)),
    incidencias
  };
}

export function analizarAsistencia(
  marcas,
  horarios,
  empleados,
  fechaInicio,
  fechaFin
) {
  const resultados = [];

  const marcasPorEmpleadoFecha = new Map();

  marcas.forEach((marca) => {
    const key = `${normalizarNombre(marca.empleado)}_${marca.fechaISO}`;
    marcasPorEmpleadoFecha.set(key, marca);
  });

  marcas.forEach((registro) => {
    const diaSemana = obtenerDiaSemanaDesdeISO(registro.fechaISO);

    const horario = horarios.find(
      (h) =>
        normalizarNombre(h.nombre) === normalizarNombre(registro.empleado) &&
        Number(h.dia_semana) === diaSemana
    );

    if (!horario || !horario.hora_entrada || !horario.hora_salida) return;

    resultados.push(analizarRegistro(registro, horario));
  });

  const fechasPeriodo = listarFechas(fechaInicio, fechaFin);

  empleados.forEach((empleado) => {
    fechasPeriodo.forEach((fechaISO) => {
      const diaSemana = obtenerDiaSemanaDesdeISO(fechaISO);

      const horario = horarios.find(
        (h) =>
          Number(h.empleado_id) === Number(empleado.id) &&
          Number(h.dia_semana) === diaSemana
      );

      if (!horario || !horario.hora_entrada || !horario.hora_salida) return;

      const key = `${normalizarNombre(empleado.nombre)}_${fechaISO}`;

      if (marcasPorEmpleadoFecha.has(key)) return;

      const horasEsperadas = diferenciaHoras(
        horario.hora_entrada,
        horario.hora_salida
      );

      resultados.push({
        empleado: empleado.nombre,
        fecha: fechaISOAExcel(fechaISO),
        fechaISO,
        entrada: null,
        salida: null,
        marcaUnica: false,
        entradaEsperada: horario.hora_entrada,
        salidaEsperada: horario.hora_salida,
        tardia: 0,
        salidaTemprana: 0,
        horasEsperadas,
        horasTrabajadas: 0,
        diferencia: Number((0 - horasEsperadas).toFixed(2)),
        incidencias: [
          {
            tipo: "Ausencia",
            minutos: null,
            descripcion: "No hay marcas registradas"
          }
        ]
      });
    });
  });

  return resultados.sort((a, b) => {
    if (a.empleado !== b.empleado) {
      return a.empleado.localeCompare(b.empleado);
    }

    return a.fechaISO.localeCompare(b.fechaISO);
  });
}



export function aplicarExcepciones(
  analisis,
  registros
) {

  return analisis.map(
    item => {

      const excepcion =
        registros.find(
          r => {

            if (
              r.tipo !==
              "excepcion"
            ) {
              return false;
            }

            const fecha =
              item.fechaISO;

            const dentroRango =
              fecha >=
                r.fechaInicio &&
              fecha <=
                r.fechaFin;

            if (
              !dentroRango
            ) {
              return false;
            }

            if (
              r.aplicaTodos
            ) {
              return true;
            }

            return (
              r.empleados?.some(
                emp =>
                  emp.nombre
                    .trim()
                    .toUpperCase() ===
                  item.empleado
                    .trim()
                    .toUpperCase()
              )
            );

          }
        );

      if (!excepcion) {
        return item;
      }

      const tieneAusencia =
        item.incidencias.some(
          inc =>
            inc.tipo ===
            "Ausencia"
        );

      if (
        !tieneAusencia
      ) {
        return item;
      }

      return {

        ...item,

        incidencias: [
          {
            tipo:
              "Ausencia justificada",

            minutos:
              null,

            descripcion:
              `No hay marcas por ${excepcion.justificacion}`
          }
        ]

      };

    }
  );

}




export function aplicarRegistros(analisis, registros) {
  return analisis.map((item) => {
    let nuevoItem = { ...item };

    const registrosAplicables = registros.filter((r) => {
      const dentroRango =
        item.fechaISO >= r.fechaInicio &&
        item.fechaISO <= r.fechaFin;

      if (!dentroRango) return false;

      if (r.aplicaTodos) return true;

      return r.empleados?.some(
        (emp) =>
          emp.nombre.trim().toUpperCase() ===
          item.empleado.trim().toUpperCase()
      );
    });

    const horarioEspecial = registrosAplicables.find(
      (r) => r.tipo === "horario"
    );

    if (horarioEspecial) {
      const entradaEsperada = horarioEspecial.horaEntrada;
      const salidaEsperada = horarioEspecial.horaSalida;

      let incidencias = [

        {
                tipo: "Horario especial",

                minutos: null,

                descripcion:
                `Horario especial ${entradaEsperada} - ${salidaEsperada}`
            }

            ];

      if (item.marcaUnica) {
        incidencias.push({
          tipo: "Marca única",
          minutos: null,
          descripcion: `Marca única registrada: ${item.entrada}`
        });
      }

      const entradaRealMin = convertirMinutos(item.entrada);
      const entradaEspMin = convertirMinutos(entradaEsperada);

      const salidaRealMin = convertirMinutos(item.salida);
      const salidaEspMin = convertirMinutos(salidaEsperada);

      let tardia = 0;
      let salidaTemprana = 0;

      if (entradaRealMin !== null && entradaEspMin !== null) {
        tardia = entradaRealMin - entradaEspMin;

        if (tardia >= 10) {
          incidencias.push({
            tipo: "Tardía",
            minutos: tardia,
            descripcion: `Tardía ${tardia} min`
          });
        }
      }

      if (salidaRealMin !== null && salidaEspMin !== null) {
        salidaTemprana = salidaEspMin - salidaRealMin;

        if (salidaTemprana >= 10) {
          incidencias.push({
            tipo: "Salida anticipada",
            minutos: salidaTemprana,
            descripcion: `Salida anticipada ${salidaTemprana} min`
          });
        }
      }

      const horasEsperadas = diferenciaHoras(
        entradaEsperada,
        salidaEsperada
      );

      const horasTrabajadas =
        item.entrada && item.salida
          ? diferenciaHoras(item.entrada, item.salida)
          : 0;

      nuevoItem = {
        ...nuevoItem,
        entradaEsperada,
        salidaEsperada,
        tardia,
        salidaTemprana,
        horasEsperadas,
        horasTrabajadas,
        diferencia: Number((horasTrabajadas - horasEsperadas).toFixed(2)),
        incidencias
      };
    }

    const excepcion = registrosAplicables.find(
      (r) => r.tipo === "excepcion"
    );

    if (excepcion) {
      const tieneAusencia = nuevoItem.incidencias.some(
        (inc) => inc.tipo === "Ausencia"
      );

      if (tieneAusencia) {
        nuevoItem = {
          ...nuevoItem,
          incidencias: [
            {
              tipo: "Ausencia justificada",
              minutos: null,
              descripcion: `No hay marcas por ${excepcion.justificacion}`
            }
          ]
        };
      }
    }

    return nuevoItem;
  });
}








export function generarResumenGerencial(
  analisis
) {

  const resumen = {};

  analisis.forEach(item => {

    if (!resumen[item.empleado]) {

      resumen[item.empleado] = {

        empleado: item.empleado,

        horasEsperadas: 0,
        horasJustificadas: 0,
        horasReducidasHorarioEspecial: 0,
        horasObjetivo: 0,
        horasTrabajadas: 0,
        balance: 0,

        tardias: 0,
        salidasAnticipadas: 0,
        ausenciasJustificadas: 0,
        ausenciasInjustificadas: 0,
        marcasUnicas: 0,

        marcas: [],
        justificaciones: [],
        horariosEspeciales: [],
        incidencias: [],
        incidenciasDetalle: []

      };

    }

    const r =
      resumen[item.empleado];

    r.horasEsperadas +=
      item.horasEsperadas || 0;

    r.horasTrabajadas +=
      item.horasTrabajadas || 0;

    r.marcas.push({

    fecha:
        item.fecha,

    entrada:
        item.entrada || "-",

    salida:
        item.salida || "-",

    horasEsperadas:
        item.horasEsperadas || 0,

    horasTrabajadas:
        item.horasTrabajadas || 0,

    diferencia:
        item.diferencia || 0,

    incidencias:
        item.incidencias || []

    });

    (item.incidencias || []).forEach(
      inc => {

        r.incidenciasDetalle.push({

          fecha:
            item.fecha,

          tipo:
            inc.tipo,

          descripcion:
            inc.descripcion

        });

        r.incidencias.push({

          fecha:
            item.fecha,

          ...inc

        });

        if (
          inc.tipo ===
          "Tardía"
        ) {
          r.tardias++;
        }

        if (
          inc.tipo ===
          "Salida anticipada"
        ) {
          r.salidasAnticipadas++;
        }

        if (
          inc.tipo ===
          "Marca única"
        ) {
          r.marcasUnicas++;
        }

        if (
          inc.tipo ===
          "Ausencia"
        ) {
          r.ausenciasInjustificadas++;
        }

        if (
          inc.tipo ===
          "Ausencia justificada"
        ) {

          r.ausenciasJustificadas++;

          r.horasJustificadas +=
            item.horasEsperadas || 0;

          r.justificaciones.push({

            fecha:
              item.fecha,

            detalle:
              inc.descripcion

          });

        }

        if (
          inc.tipo ===
          "Horario especial"
        ) {

          r.horariosEspeciales.push({

            fecha:
              item.fecha,

            detalle:
              inc.descripcion

          });

        }

      }
    );

  });

  Object.values(
    resumen
  ).forEach(r => {

    r.horasObjetivo =
      Number(
        (
          r.horasEsperadas -
          r.horasJustificadas -
          r.horasReducidasHorarioEspecial
        ).toFixed(2)
      );

    r.balance =
      Number(
        (
          r.horasTrabajadas -
          r.horasObjetivo
        ).toFixed(2)
      );

  });

  return Object.values(
    resumen
  );

}