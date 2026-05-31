import { useState, useEffect } from "react";
import Header from "../components/Header";
import Swal from "sweetalert2";


import {
  leerExcel
}
from "../services/excelService";

import {
  agruparMarcas,
  normalizarMarcas,
  analizarAsistencia,
  aplicarRegistros,
  generarResumenGerencial
}
from "../services/analysisService";

import { obtenerEmpleados, obtenerTodosHorarios } from "../services/db";


import {
  exportarPDFGerencial
}
from "../services/exportPdfGerencial";

import {
  exportarDOCX
}
from "../services/exportDocx";


import {

  guardarReporte

}
from "../services/reportesService";




export default function GenerarReporte() {
  const [empleados, setEmpleados] = useState([]);
const [fechaInicioPE, setFechaInicioPE] = useState("");
const [fechaFinPE, setFechaFinPE] = useState("");

  const [archivo, setArchivo] = useState(null);

  const [tipo, setTipo] = useState("excepcion");
  const [aplicaTodos, setAplicaTodos] = useState(true);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");

  const [justificacion, setJustificacion] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [registros, setRegistros] = useState([]);


  const [analisis, setAnalisis] = useState([]);

    const [
      textoDocumentoEditable,
      setTextoDocumentoEditable
    ] = useState("");



const [
  incidenciasSeleccionadas,
  setIncidenciasSeleccionadas
] = useState([]);


const [
  resumenGerencial,
  setResumenGerencial
] = useState([]);



useEffect(() => {

  const texto =
    generarTextoDocumento();

  setTextoDocumentoEditable(
    texto
  );

}, [
  incidenciasSeleccionadas,
  analisis
]);




const [
  analisisOriginal,
  setAnalisisOriginal
] = useState([]);



useEffect(() => {

  if (
    analisisOriginal.length === 0
  ) {
    return;
  }

  const analisisProcesado =
    aplicarRegistros(
      analisisOriginal,
      registros
    );

  setAnalisis(
    analisisProcesado
  );

  const resumen =
    generarResumenGerencial(
      analisisProcesado
    );

  setResumenGerencial(
    resumen
  );

}, [
  registros,
  analisisOriginal
]);






  const [filtroTexto, setFiltroTexto] =
  useState("");

const [filtroTipo, setFiltroTipo] =
  useState("todos");

const [filtroMinutos, setFiltroMinutos] =
  useState(0);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  async function cargarEmpleados() {
    const datos = await obtenerEmpleados();
    setEmpleados(datos);
  }

  function seleccionarArchivo(e) {
    const file = e.target.files[0];

    if (!file) return;

    setArchivo(file);
  }

  function toggleEmpleado(id) {
    setEmpleadosSeleccionados((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }

      return [...prev, id];
    });
  }

  function limpiarFormulario() {
    setAplicaTodos(true);
    setEmpleadosSeleccionados([]);
    setFechaInicio("");
    setFechaFin("");
    setHoraEntrada("");
    setHoraSalida("");
    setJustificacion("");
    setBusqueda("");
  }

  function validarRegistro() {
    if (!fechaInicio) {
      Swal.fire({
        icon: "warning",
        title: "Fecha requerida",
        text: "Debe indicar la fecha del registro.",
        confirmButtonColor: "#2563eb"
      });

      return false;
    }

    if (!aplicaTodos && empleadosSeleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Seleccione empleados",
        text: "Debe seleccionar al menos un empleado o aplicar el registro a todos.",
        confirmButtonColor: "#2563eb"
      });

      return false;
    }

    if (tipo === "horario" && (!horaEntrada || !horaSalida)) {
      Swal.fire({
        icon: "warning",
        title: "Horario incompleto",
        text: "Debe indicar hora de entrada y salida para el horario especial.",
        confirmButtonColor: "#2563eb"
      });

      return false;
    }

    if (!justificacion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Detalle requerido",
        text: "Debe ingresar una justificación o motivo.",
        confirmButtonColor: "#2563eb"
      });

      return false;
    }

    return true;
  }

  function agregarRegistro() {
    if (!validarRegistro()) return;

    const seleccionados = empleados.filter((emp) =>
      empleadosSeleccionados.includes(emp.id)
    );

    const nuevoRegistro = {
      id: Date.now(),
      tipo,
      aplicaTodos,
      empleados: aplicaTodos ? [] : seleccionados,
      fechaInicio,
      fechaFin: fechaFin || fechaInicio,
      horaEntrada,
      horaSalida,
      justificacion: justificacion.trim()
    };

    setRegistros((prev) => [...prev, nuevoRegistro]);

    limpiarFormulario();

    Swal.fire({
      icon: "success",
      title: "Registro agregado",
      text: "El registro fue agregado correctamente al reporte.",
      timer: 1400,
      showConfirmButton: false
    });
  }

  async function eliminarRegistro(id) {
    const result = await Swal.fire({
      title: "Eliminar registro",
      text: "¿Desea eliminar este registro del reporte?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b"
    });

    if (!result.isConfirmed) return;

    setRegistros((prev) => prev.filter((x) => x.id !== id));
  }






async function procesar() {
  if (!fechaInicioPE || !fechaFinPE) {
    Swal.fire({
      icon: "warning",
      title: "Fechas requeridas",
      text: "Debe seleccionar la fecha de inicio y la fecha de fin del reporte.",
      confirmButtonColor: "#2563eb"
    });

    return;
  }

  if (!archivo) {
    Swal.fire({
      icon: "warning",
      title: "Archivo requerido",
      text: "Debe seleccionar el archivo Excel de marcas.",
      confirmButtonColor: "#2563eb"
    });

    return;
  }

  try {
    const datos = await leerExcel(archivo);

    const grupos = agruparMarcas(datos);
    const marcas = normalizarMarcas(grupos);

    const horarios = await obtenerTodosHorarios();

    const analisisFinal = analizarAsistencia(
      marcas,
      horarios,
      empleados,
      fechaInicioPE,
      fechaFinPE
    );

    setAnalisisOriginal(
        analisisFinal
      );

    const analisisProcesado =
      aplicarRegistros(
        analisisFinal,
        registros
      );

    setAnalisis(
      analisisProcesado
    );

    const resumen =
      generarResumenGerencial(
        analisisProcesado,
        registros
      );

setResumenGerencial(
  resumen
);

const incidencias =
  analisisProcesado.flatMap(
    item =>
      item.incidencias.map(
        inc => ({
          ...inc,
          empleado: item.empleado,
          fecha: item.fecha
        })
      )
  );

    Swal.fire({
      icon: "success",
      title: "Análisis completado",
      html: `
        <div style="text-align:left">
          <b>Registros Excel:</b> ${datos.length}<br>
          <b>Días analizados:</b> ${analisisFinal.length}<br>
          <b>Incidencias detectadas:</b> ${incidencias.length}
        </div>
      `,
      confirmButtonColor: "#2563eb"
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error procesando reporte",
      text: error.message || "No fue posible analizar el archivo."
    });
  }
}




function toggleIncidencia(id) {

  setIncidenciasSeleccionadas(
    prev => {

      if (
        prev.includes(id)
      ) {
        return prev.filter(
          x => x !== id
        );
      }

      return [
        ...prev,
        id
      ];

    }
  );

}






  const empleadosFiltrados = empleados.filter((emp) =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalExcepciones = registros.filter(
    (r) => r.tipo === "excepcion"
  ).length;

  const totalHorariosEspeciales = registros.filter(
    (r) => r.tipo === "horario"
  ).length;

  function textoTipo(tipo) {
    return tipo === "excepcion" ? "Excepción" : "Horario especial";
  }

  function textoAplicacion(registro) {
    if (registro.aplicaTodos) return "Todos";

    return registro.empleados.map((e) => e.nombre).join(", ");
  }

  function textoPeriodo(registro) {
    if (registro.fechaInicio === registro.fechaFin) {
      return registro.fechaInicio;
    }

    return `${registro.fechaInicio} - ${registro.fechaFin}`;
  }

  function textoDetalle(registro) {
    if (registro.tipo === "horario") {
      return `${registro.horaEntrada} - ${registro.horaSalida} | ${registro.justificacion}`;
    }

    return registro.justificacion;
  }




const incidenciasTabla =
  analisis.flatMap(
    item => {

      if (
        !Array.isArray(
          item.incidencias
        )
      ) {
        return [];
      }

      return item.incidencias.map(
        inc => ({

          id:
            `${item.empleado}_${item.fecha}_${inc.tipo}`,

          empleado:
            item.empleado,

          fecha:
            item.fecha,

          entrada:
            item.entrada,

          salida:
            item.salida,

          diferencia:
            item.diferencia,

          tipo:
            inc.tipo,

          minutos:
            inc.minutos,

          descripcion:
            inc.descripcion

        })
      );

    }
  );

  

const incidenciasFiltradas =
  incidenciasTabla.filter(
    item => {

      const coincideNombre =
        item.empleado
          ?.toLowerCase()
          .includes(
            filtroTexto
              .toLowerCase()
          );

      const coincideTipo =
        filtroTipo === "todos"
          ? true
          : item.tipo === filtroTipo;

      const coincideTiempo =
        filtroMinutos === 0
          ? true
          : (
              item.minutos ?? 0
            ) >= filtroMinutos;

      return (
        coincideNombre &&
        coincideTipo &&
        coincideTiempo
      );

    }
  );




const TIPOS_AUTOMATICOS = [
  "Ausencia",
  "Ausencia justificada",
  "Marca única",
  "Horario especial"
];

function textoDocumento(item) {
  if (item.tipo === "Ausencia") {
    return `El día ${item.fecha} no hay marcas por ausencia injustificada.`;
  }

  if (item.tipo === "Ausencia justificada") {
    return `El día ${item.fecha} ${item.descripcion}.`;
  }

  if (item.tipo === "Marca única") {
    return `El día ${item.fecha} ${item.descripcion}.`;
  }

  if (item.tipo === "Horario especial") {
    return `El día ${item.fecha} ${item.descripcion}.`;
  }

  if (item.tipo === "Tardía") {
    return `El día ${item.fecha} presentó ingreso tardío de ${item.minutos} minutos.`;
  }

  if (item.tipo === "Salida anticipada") {
    return `El día ${item.fecha} presentó salida anticipada de ${item.minutos} minutos.`;
  }

  return item.descripcion || "Sin detalle.";
}

const incidenciasParaDoc = incidenciasTabla.filter((item) => {
  if (TIPOS_AUTOMATICOS.includes(item.tipo)) {
    return true;
  }

  return incidenciasSeleccionadas.includes(item.id);
});

const empleadosDoc = {};

incidenciasParaDoc.forEach((item) => {
  if (!empleadosDoc[item.empleado]) {
    empleadosDoc[item.empleado] = [];
  }

  empleadosDoc[item.empleado].push({
    ...item,
    texto: textoDocumento(item)
  });
});


const textoGenerado =
  generarTextoDocumento();


function generarTextoDocumento() {

  let tituloPeriodo = "";

  if (fechaInicioPE) {

    const [
      anio,
      mes
    ] = fechaInicioPE.split("-");

    const meses = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE"
    ];

    tituloPeriodo =
      `${meses[
        Number(mes) - 1
      ]} ${anio}`;

  }

  let texto = `

CENTRO DIURNO ASOCIACIÓN CORAJE Y ESPERANZA

INFORME DE REPORTE Y JUSTIFICACIÓN DE AUSENCIAS DE MARCAS DE PERSONAL

${tituloPeriodo}


`;

  Object.entries(
    empleadosDoc
  ).forEach(
    ([empleado, eventos]) => {

      texto += `${empleado}\n\n`;

      eventos.forEach(
        evento => {

          texto += `• ${evento.texto}\n`;

        }
      );

      texto += "\n\n";

    }
  );

  return texto;

}




async function finalizarReporte() {

  if (
    !fechaInicioPE ||
    !fechaFinPE
  ) {

    Swal.fire({

      icon: "warning",

      title: "Periodo requerido",

      text:
        "Debe procesar un reporte antes de guardarlo."

    });

    return;

  }

  const [
    anio,
    mes
  ] = fechaInicioPE.split("-");

  const meses = [

    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE"

  ];

  const nombrePeriodo =

    `${meses[
      Number(mes) - 1
    ]} ${anio}`;



  await guardarReporte({

    nombre:
      `Reporte ${nombrePeriodo}`,

    fecha_generacion:
      new Date()
        .toISOString(),

    periodo_inicio:
      fechaInicioPE,

    periodo_fin:
      fechaFinPE,

    documento:
      textoDocumentoEditable,

    resumen:
      resumenGerencial

  });

await Swal.fire({
  title: "Reporte finalizado",
  text: "Los datos se han guardado correctamente.",
  icon: "success",
  confirmButtonText: "OK"
}).then(() => {
  window.location.reload();
});

  setFechaInicioPE("");
  setFechaFinPE("");
  setArchivo(null);
  setRegistros([]);
  setAnalisis([]);
  setIncidenciasSeleccionadas([]);
  setResumenGerencial([]);
  setTextoDocumentoEditable("");

}




  return (
    <>
      <Header title="Generar Reporte" />

      <div className="report-layout">
        <section className="section-card">
          <div className="section-header">
            <h2>Información del reporte</h2>
            <p>Defina el período y cargue el archivo de marcas.</p>
          </div>

          <div className="form-grid">
            <div className="form-grid">

               <div className="periodo-container">

                  <div className="periodo-card">

                    <span>📅</span>

                    <div>

                      <label>
                        Fecha inicio
                      </label>

                      <input
                        type="date"
                        value={fechaInicioPE}
                        onChange={(e) =>
                          setFechaInicioPE(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                  <div className="periodo-card">

                    <span>📅</span>

                    <div>

                      <label>
                        Fecha fin
                      </label>

                      <input
                        type="date"
                        value={fechaFinPE}
                        onChange={(e) =>
                          setFechaFinPE(
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

              </div>

            <div className="field">
            <label className="file-upload">

          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={seleccionarArchivo}
            hidden
          />

          <div>

            <div className="upload-icon">
              📊
            </div>

            <h3>
              Archivo Excel
            </h3>

            <p>
              Seleccione el reporte de marcas
            </p>

          </div>

        </label>
        
            </div>
          </div>

          {archivo && (
          <div className="archivo-cargado">

            <span>
              ✅ Archivo cargado
            </span>

            <strong>
              {archivo.name}
            </strong>

          </div>
          )}
        </section>

        <section className="section-card">
          <div className="section-header">
            <h2>Registros previos al procesamiento</h2>
            <p>
              Agregue excepciones o cambios de horario antes de procesar el Excel.
            </p>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Tipo de registro</label>

              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="excepcion">Excepción / Justificación</option>
                <option value="horario">Horario especial</option>
              </select>
            </div>

            <div className="field">
              <label>Aplicar a</label>

              <select
                value={aplicaTodos ? "todos" : "empleados"}
                onChange={(e) => {
                  const todos = e.target.value === "todos";
                  setAplicaTodos(todos);

                  if (todos) {
                    setEmpleadosSeleccionados([]);
                  }
                }}
              >
                <option value="todos">Todos los empleados</option>
                <option value="empleados">Empleados específicos</option>
              </select>
            </div>

            <div className="field">
              <label>Fecha inicio</label>

              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Fecha fin</label>

              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            {tipo === "horario" && (
              <>
                <div className="field">
                  <label>Hora entrada</label>

                  <input
                    type="time"
                    value={horaEntrada}
                    onChange={(e) => setHoraEntrada(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Hora salida</label>

                  <input
                    type="time"
                    value={horaSalida}
                    onChange={(e) => setHoraSalida(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {!aplicaTodos && (
            <div className="employee-selector">
              <div className="selector-header">
                <div>
                  <h3>Seleccionar empleados</h3>
                  <p>
                    {empleadosSeleccionados.length} empleado(s) seleccionado(s)
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar empleado..."
                />
              </div>

              <div className="employee-list">
                {empleadosFiltrados.map((emp) => (
                  <label key={emp.id} className="employee-option">
                    <input
                      type="checkbox"
                      checked={empleadosSeleccionados.includes(emp.id)}
                      onChange={() => toggleEmpleado(emp.id)}
                    />

                    <span>{emp.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="field" style={{ marginTop: 20 }}>
            <label>{tipo === "horario" ? "Motivo" : "Justificación"}</label>

            <textarea
              rows="4"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder={
                tipo === "horario"
                  ? "Ej. Horario especial por capacitación"
                  : "Ej. Incapacidad INS, teletrabajo, feriado, permiso..."
              }
            />
          </div>

          <div className="actions-footer">
            <button className="btn-secondary" onClick={limpiarFormulario}>
              Limpiar
            </button>

            <button className="btn-primary" onClick={agregarRegistro}>
              Agregar registro
            </button>
          </div>
        </section>

        <section className="cards">
          <div className="card">
            <h3>Empleados</h3>
            <p>{empleados.length}</p>
          </div>

          <div className="card">
            <h3>Excepciones</h3>
            <p>{totalExcepciones}</p>
          </div>

          <div className="card">
            <h3>Horarios especiales</h3>
            <p>{totalHorariosEspeciales}</p>
          </div>
        </section>

        <section className="table-card">
          <div className="section-header">
            <h2>Registros agregados</h2>
            <p>Estos registros se aplicarán al procesar el reporte actual.</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Aplica a</th>
                <th>Período</th>
                <th>Detalle</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {registros.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No hay registros agregados.
                  </td>
                </tr>
              )}

              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td>{textoTipo(registro.tipo)}</td>

                  <td>{textoAplicacion(registro)}</td>

                  <td>{textoPeriodo(registro)}</td>

                  <td>{textoDetalle(registro)}</td>

                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => eliminarRegistro(registro.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

         

          {
            
          analisis.length > 0 && (

            <section className="table-card">

              <div className="section-header">

                {
                  resumenGerencial.length > 0 && (

                    <section className="table-card">

                      <div className="section-header">

                        <h2>
                          📊 Resumen Gerencial
                        </h2>

                        <p>
                          Balance general del período.
                        </p>

                      </div>

                      <table>

                        <thead>

                          <tr>

                           <th>Empleado</th>
                            <th>Esperadas</th>
                            <th>Justificadas</th>
                            <th>Objetivo</th>
                            <th>Trabajadas</th>
                            <th>Balance</th>
                            <th>Incidencias</th>

                          </tr>

                        </thead>

                        <tbody>

                          {
                            resumenGerencial.map(
                              item => (

                                <tr
                                  key={item.empleado}
                                >

                                  <td>
                                    {item.empleado}
                                  </td>

                                  <td>
                                  {item.horasEsperadas.toFixed(2)}
                                </td>

                                <td>
                                  {item.horasJustificadas.toFixed(2)}
                                </td>

                                <td>
                                  {item.horasObjetivo.toFixed(2)}
                                </td>

                                <td>
                                  {item.horasTrabajadas.toFixed(2)}
                                </td>

                                <td>

                                  {
                                    item.balance > 0
                                      ? `+${item.balance}`
                                      : item.balance
                                  }

                                  

                                </td>

                                <td>

                                  {
                                    item.tardias +
                                    item.salidasAnticipadas +
                                    item.ausenciasJustificadas +
                                    item.ausenciasInjustificadas +
                                    item.marcasUnicas
                                  }

                                </td>

                                </tr>

                              )
                            )
                          }

                        </tbody>

                      </table>

                      <div
                  style={{
                    marginTop: 40
                  }}
                >

                  {
                    resumenGerencial.map(
                      empleado => (

                            <div
                              key={empleado.empleado}
                              className="empleado-card"
                            >

                        <h3>
                          {empleado.empleado}
                        </h3>

                        <div className="empleado-kpis">

                          <div className="mini-kpi">
                            <small>Esperadas</small>
                            <strong>
                              {empleado.horasEsperadas.toFixed(2)}
                            </strong>
                          </div>

                          <div className="mini-kpi">
                            <small>Justificadas</small>
                            <strong>
                              {empleado.horasJustificadas.toFixed(2)}
                            </strong>
                          </div>

                          <div className="mini-kpi">
                            <small>Objetivo</small>
                            <strong>
                              {empleado.horasObjetivo.toFixed(2)}
                            </strong>
                          </div>

                          <div className="mini-kpi">
                            <small>Trabajadas</small>
                            <strong>
                              {empleado.horasTrabajadas.toFixed(2)}
                            </strong>
                          </div>

                          <div
                            className={
                              empleado.balance >= 0
                                ? "mini-kpi positivo"
                                : "mini-kpi negativo"
                            }
                          >
                            <small>Balance</small>

                            <strong>
                              {empleado.balance.toFixed(2)}h
                            </strong>

                          </div>

                        </div>



                        <h4>
                  Detalle diario
                </h4>

                <table className="detalle-empleado-table">

                  <thead>

                    <tr>

                      <th>Fecha</th>

                      <th>Entrada</th>

                      <th>Salida</th>

                      <th>Diferencia</th>

                      <th>Estado</th>

                    </tr>

                  </thead>

                  <tbody>

                    {(empleado.marcas || []).map(
                      (dia, i) => (

                        <tr key={i}>

                          <td>
                            {dia.fecha}
                          </td>

                          <td>
                            {dia.entrada}
                          </td>

                          <td>
                            {dia.salida}
                          </td>

                          <td>

                            {
                              dia.diferencia > 0
                                ? `+${dia.diferencia}`
                                : dia.diferencia
                            }

                            h

                          </td>

                        <td>

                          <span
                            className={

                              !dia.incidencias?.length
                                ? "estado-ok"

                              : dia.incidencias.some(
                                  x =>
                                    x.tipo ===
                                    "Ausencia"
                                )
                                ? "estado-error"

                              : dia.incidencias.some(
                                  x =>
                                    x.tipo ===
                                    "Horario especial"
                                )
                                ? "estado-info"

                              : "estado-warning"

                            }
                          >

                            {
                              dia.incidencias?.length
                                ? dia.incidencias
                                    .map(
                                      x =>
                                        x.descripcion
                                    )
                                    .join(", ")

                                : "Sin incidencias"
                            }

                          </span>

                        </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

        </div>

      )
    )
  }

</div>

                    </section>

                  )
                }
                
                <h2>
                  Incidencias detectadas
                </h2>

                

                <p>
                  Revise antes de generar
                  el informe final.
                </p>
              </div>


                <div className="incidencias-resumen">

                  <div className="mini-stat">
                    🟡 {incidenciasTabla.filter(i => i.tipo === "Tardía").length}
                    <span>Tardías</span>
                  </div>

                  <div className="mini-stat">
                    🟠 {incidenciasTabla.filter(i => i.tipo === "Salida anticipada").length}
                    <span>Salidas anticipadas</span>
                  </div>

                  <div className="mini-stat">
                    🔴 {incidenciasTabla.filter(i => i.tipo.includes("Ausencia")).length}
                    <span>Ausencias</span>
                  </div>

                  <div className="mini-stat">
                    🔵 {incidenciasTabla.filter(i => i.tipo === "Horario especial").length}
                    <span>Horarios</span>
                  </div>

                </div>


                <div className="filtros-card">

                <div className="filtro-grupo">

                  <label>
                    Empleado
                  </label>

                  <input
                    placeholder="Buscar empleado..."
                    value={filtroTexto}
                    onChange={(e) =>
                      setFiltroTexto(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="filtro-grupo">

                  <label>
                    Tipo de incidencia
                  </label>

                  <select
                    value={filtroTipo}
                    onChange={(e) =>
                      setFiltroTipo(
                        e.target.value
                      )
                    }
                  >
                    <option value="todos">
                      Todas
                    </option>

                    <option value="Tardía">
                      Tardías
                    </option>

                    <option value="Salida anticipada">
                      Salidas anticipadas
                    </option>

                    <option value="Marca única">
                      Marcas únicas
                    </option>

                    <option value="Ausencia">
                      Ausencias
                    </option>

                    <option value="Horario especial">
                      Horarios especiales
                    </option>

                  </select>

                </div>

                <div className="filtro-grupo">

                  <label>
                    Tiempo mínimo
                  </label>

                  <select
                    value={filtroMinutos}
                    onChange={(e) =>
                      setFiltroMinutos(
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >

                    <option value={0}>
                      Todos
                    </option>

                    <option value={10}>
                      10+ min
                    </option>

                    <option value={15}>
                      15+ min
                    </option>

                    <option value={30}>
                      30+ min
                    </option>

                    <option value={60}>
                      60+ min
                    </option>

                  </select>

                </div>

              </div>

             

              <table>

                <thead>

                  <tr>

                    <th>
                      Incluir
                    </th>
                    <th>
                      Empleado
                    </th>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Entrada
                    </th>

                    <th>
                      Salida
                    </th>

                    <th>
                      Diferencia
                    </th>

                    <th>
                      Incidencias
                    </th>

                  </tr>

                </thead>

                <tbody>

                    {incidenciasFiltradas.map(
                     (item, index) => (

                      <tr key={index}>

                        <td>

                        {
                          item.tipo ===
                            "Tardía" ||

                          item.tipo ===
                            "Salida anticipada"
                            ? (

                            <input
                              type="checkbox"

                              checked={
                                incidenciasSeleccionadas.includes(
                                  item.id
                                )
                              }

                              onChange={() =>
                                toggleIncidencia(
                                  item.id
                                )
                              }
                            />

                          ) : (

                            <span>
                              🔒
                            </span>

                          )
                        }

                      </td>

                        <td>
                          {item.empleado}
                        </td>

                        <td>
                          {item.fecha}
                        </td>

                        <td>
                          {item.entrada}
                        </td>

                        <td>
                          {item.salida || "-"}
                        </td>

                        <td>

                          {item.diferencia > 0
                            ? `+${item.diferencia}`
                            : item.diferencia}

                          h

                        </td>

                        <td>

                        <div
                          className="incidencia-tag"
                        >
                          {item.descripcion}
                        </div>

                      </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>


            <section className="table-card">

          <div className="section-header">

            <h2>
              Documento editable
            </h2>

            <p>
              Puede modificar el contenido antes de generar el DOC.
            </p>

          </div>

        <textarea
          value={textoDocumentoEditable}
          onChange={(e) =>
            setTextoDocumentoEditable(
              e.target.value
            )
          }
          className="document-editor"
        />

        </section>

            </section>

          )
        }
        </section>

        {analisis.length > 0 && (

          <div className="acciones-exportacion">

            <button
              className="btn-pdf"
              onClick={() =>
                exportarPDFGerencial(
                  resumenGerencial
                )
              }
            >
              📊 Exportar PDF
            </button>

            <button
              className="btn-docx"
              onClick={() =>
                exportarDOCX(
                  textoDocumentoEditable
                )
              }
            >
              📄 Exportar DOCX
            </button>

            <button

              className="btn-finalizar"

              onClick={
                finalizarReporte
              }

            >

              ✅ Finalizar Reporte

            </button>

          </div>




        )}



        <div className="process-footer">
          <button className="btn-primary process-btn" onClick={procesar}>
            📄 Procesar Reporte
          </button>
        </div>
      </div>
    </>
  );
}