import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Header from "../components/Header";

import {
  obtenerEmpleados,
  obtenerHorariosEmpleado,
  guardarHorario
} from "../services/db";

const DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo"
];

const horarioInicial = () =>
  DIAS.map(() => ({
    activo: false,
    entrada: "",
    salida: ""
  }));

export default function Horarios() {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoId, setEmpleadoId] = useState("");
  const [horarios, setHorarios] = useState(horarioInicial());

  useEffect(() => {
    cargarEmpleados();
  }, []);

  async function cargarEmpleados() {
    const datos = await obtenerEmpleados();
    setEmpleados(datos);
  }

  async function seleccionarEmpleado(id) {
    setEmpleadoId(id);

    if (!id) {
      setHorarios(horarioInicial());
      return;
    }

    const datos = await obtenerHorariosEmpleado(id);
    const nuevos = horarioInicial();

    datos.forEach((h) => {
      nuevos[h.dia_semana] = {
        activo: Boolean(h.hora_entrada || h.hora_salida),
        entrada: h.hora_entrada || "",
        salida: h.hora_salida || ""
      };
    });

    setHorarios(nuevos);
  }

  function actualizarHorario(index, campo, valor) {
    const copia = [...horarios];
    copia[index][campo] = valor;
    setHorarios(copia);
  }

  function alternarDia(index) {
    const copia = [...horarios];

    copia[index].activo = !copia[index].activo;

    if (!copia[index].activo) {
      copia[index].entrada = "";
      copia[index].salida = "";
    } else {
      copia[index].entrada = copia[index].entrada || "07:00";
      copia[index].salida = copia[index].salida || "16:00";
    }

    setHorarios(copia);
  }

  function copiarLunes() {
    const lunes = horarios[0];

    if (!lunes.activo || !lunes.entrada || !lunes.salida) {
      Swal.fire({
        icon: "warning",
        title: "Horario de lunes incompleto",
        text: "Debe activar el lunes y definir hora de entrada y salida.",
        confirmButtonColor: "#2563eb"
      });
      return;
    }

    const copia = horarios.map((_, index) => ({
      activo: index < 5,
      entrada: index < 5 ? lunes.entrada : "",
      salida: index < 5 ? lunes.salida : ""
    }));

    setHorarios(copia);
  }

  function jornadaEstandar() {
    const copia = DIAS.map((_, index) => ({
      activo: index < 5,
      entrada: index < 5 ? "07:00" : "",
      salida: index < 5 ? "16:00" : ""
    }));

    setHorarios(copia);
  }

  async function guardar() {
    if (!empleadoId) {
      Swal.fire({
        icon: "warning",
        title: "Seleccione un empleado",
        text: "Debe seleccionar un empleado antes de guardar el horario.",
        confirmButtonColor: "#2563eb"
      });
      return;
    }

    const diasActivos = horarios.filter((h) => h.activo);

    if (diasActivos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Horario vacío",
        text: "Debe activar al menos un día laboral.",
        confirmButtonColor: "#2563eb"
      });
      return;
    }

    const incompletos = horarios.some(
      (h) => h.activo && (!h.entrada || !h.salida)
    );

    if (incompletos) {
      Swal.fire({
        icon: "warning",
        title: "Horario incompleto",
        text: "Todos los días activos deben tener hora de entrada y salida.",
        confirmButtonColor: "#2563eb"
      });
      return;
    }

    const confirmar = await Swal.fire({
      title: "Guardar horario",
      text: "¿Desea guardar el horario semanal de este empleado?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b"
    });

    if (!confirmar.isConfirmed) return;

    for (let i = 0; i < horarios.length; i++) {
      await guardarHorario(
        empleadoId,
        i,
        horarios[i].activo ? horarios[i].entrada : "",
        horarios[i].activo ? horarios[i].salida : ""
      );
    }

    Swal.fire({
      icon: "success",
      title: "Horario guardado",
      text: "El horario fue almacenado correctamente.",
      confirmButtonColor: "#2563eb"
    });
  }

  return (
    <>
      <Header title="Horarios" />

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>Asignación de horario</h2>
            <p>Seleccione un empleado y configure sus días laborales.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Empleado</label>

            <select
              value={empleadoId}
              onChange={(e) => seleccionarEmpleado(e.target.value)}
            >
              <option value="">Seleccione un empleado...</option>

              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {empleadoId && (
        <>
          <div className="toolbar-card">
            <button className="btn-primary" onClick={jornadaEstandar}>
              Jornada estándar L-V
            </button>

            <button className="btn-secondary" onClick={copiarLunes}>
              Copiar lunes a viernes
            </button>
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Labora</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                </tr>
              </thead>

              <tbody>
                {DIAS.map((dia, index) => (
                  <tr
                    key={dia}
                    className={!horarios[index].activo ? "row-disabled" : ""}
                  >
                    <td>
                      <strong>{dia}</strong>
                    </td>

                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={horarios[index].activo}
                          onChange={() => alternarDia(index)}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>

                    <td>
                      <input
                        type="time"
                        disabled={!horarios[index].activo}
                        value={horarios[index].entrada}
                        onChange={(e) =>
                          actualizarHorario(index, "entrada", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="time"
                        disabled={!horarios[index].activo}
                        value={horarios[index].salida}
                        onChange={(e) =>
                          actualizarHorario(index, "salida", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="actions-footer">
            <button className="btn-primary" onClick={guardar}>
              Guardar horario
            </button>
          </div>
        </>
      )}
    </>
  );
}