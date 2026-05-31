import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Header from "../components/Header";

import {
  obtenerEmpleados,
  insertarEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
}
from "../services/db";

export default function Empleados() {

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [puesto, setPuesto] = useState("");

  const [editando, setEditando] =
    useState(null);

  const [empleados, setEmpleados] =
    useState([]);

  async function cargar() {

    const datos =
      await obtenerEmpleados();

    setEmpleados(datos);

  }

  useEffect(() => {

    cargar();

  }, []);

  function limpiar() {

    setNombre("");
    setCedula("");
    setPuesto("");

    setEditando(null);

  }

  async function guardar() {

    if (!nombre.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
        text: "Debe ingresar el nombre del empleado.",
        confirmButtonColor: "#2563eb"
      });

      return;
    }

    try {

      if (editando) {

        const confirmar = await Swal.fire({
            title: "Actualizar empleado",
            text: "¿Desea guardar los cambios realizados?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, actualizar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#64748b"
        });

        if (!confirmar.isConfirmed)
            return;

        await actualizarEmpleado(
            editando,
            nombre,
            cedula,
            puesto
        );

        await Swal.fire({
            icon: "success",
            title: "Empleado actualizado",
            text: "Los cambios se guardaron correctamente.",
            confirmButtonColor: "#2563eb"
        });

        } else {

        await insertarEmpleado(
          nombre,
          cedula,
          puesto
        );

        await Swal.fire({
          icon: "success",
          title: "Empleado registrado",
          text: "El empleado fue agregado correctamente.",
          confirmButtonColor: "#2563eb"
        });

      }

      limpiar();

      cargar();

    }
    catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        confirmButtonColor: "#dc2626"
      });

    }

  }

  function editar(emp) {

    setEditando(emp.id);

    setNombre(emp.nombre);
    setCedula(emp.cedula);
    setPuesto(emp.puesto);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }

  async function eliminar(id) {

    const result = await Swal.fire({

      title: "Eliminar empleado",

      text:
        "Esta acción eliminará el empleado permanentemente.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Sí, eliminar",

      cancelButtonText:
        "Cancelar",

      confirmButtonColor:
        "#dc2626",

      cancelButtonColor:
        "#64748b"

    });

    if (!result.isConfirmed)
      return;

    try {

      await eliminarEmpleado(id);

      await Swal.fire({
        icon: "success",
        title: "Empleado eliminado",
        text:
          "El registro fue eliminado correctamente.",
        confirmButtonColor: "#2563eb"
      });

      cargar();

    }
    catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        confirmButtonColor: "#dc2626"
      });

    }

  }

  return (
    <>

      <Header title="Empleados" />

      <div className="form-card">

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={e =>
            setNombre(e.target.value)
          }
        />

        <input
          placeholder="Cédula"
          value={cedula}
          onChange={e =>
            setCedula(e.target.value)
          }
        />

        <input
          placeholder="Puesto"
          value={puesto}
          onChange={e =>
            setPuesto(e.target.value)
          }
        />

        <button
          className="btn-primary"
          onClick={guardar}
        >

          {
            editando
              ? "Actualizar"
              : "Guardar"
          }

        </button>

        {
          editando && (

            <button
              className="btn-secondary"
              onClick={limpiar}
            >
              Cancelar
            </button>

          )
        }

      </div>

      <div className="table-card">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Nombre</th>

              <th>Cédula</th>

              <th>Puesto</th>

              <th>Acciones</th>

            </tr>

          </thead>

          <tbody>

            {
              empleados.map(emp => (

                <tr key={emp.id}>

                  <td>{emp.id}</td>

                  <td>{emp.nombre}</td>

                  <td>{emp.cedula}</td>

                  <td>{emp.puesto}</td>

                  <td>

                    <button
                      className="btn-edit"
                      onClick={() =>
                        editar(emp)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        eliminar(emp.id)
                      }
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

    </>
  );
}