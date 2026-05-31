import { useEffect, useState } from "react";

import Swal from "sweetalert2";

import {
  obtenerReportes,
  eliminarReporte
}
from "../services/reportesService";

import {
  exportarPDFGerencial
}
from "../services/exportPdfGerencial";

import {
  exportarDOCX
}
from "../services/exportDocx";

export default function Reportes() {

  const [
    reportes,
    setReportes
  ] = useState([]);

  const [
    reporteSeleccionado,
    setReporteSeleccionado
  ] = useState(null);

  async function cargar() {

    const datos =
      await obtenerReportes();

    setReportes(datos);

  }



  

  useEffect(() => {

    cargar();

  }, []);

  async function eliminar(id) {

    const resp =
      await Swal.fire({

        title:
          "Eliminar reporte",

        text:
          "¿Desea eliminar este reporte?",

        icon:
          "warning",

        showCancelButton:
          true,

        confirmButtonText:
          "Eliminar"

      });

    if (!resp.isConfirmed)
      return;

    await eliminarReporte(id);

    cargar();

  }

  return (

    <div className="reportes-page">

      <h2>
        Reportes Generados
      </h2>

      <table className="tabla-reportes">

        <thead>

          <tr>

            <th>
              Fecha
            </th>

            <th>
              Nombre
            </th>

            <th>
              Periodo
            </th>

            <th>
              Acciones
            </th>

          </tr>

        </thead>

        <tbody>

          {
            reportes.map(r => (

              <tr
                key={r.id}
              >

                <td>

                  {
                    new Date(
                      r.fecha_generacion
                    ).toLocaleString()
                  }

                </td>

                <td>
                  {r.nombre}
                </td>

                <td>

                  {r.periodo_inicio}

                  {" - "}

                  {r.periodo_fin}

                </td>

                <td>

                  <button
                    onClick={() =>
                      setReporteSeleccionado(
                        r
                      )
                    }
                  >
                    👁 Ver
                  </button>

                  <button
                    onClick={() =>
                      exportarDOCX(
                        r.documento
                      )
                    }
                  >
                    📄 DOCX
                  </button>

                  <button
                    onClick={() =>
                      exportarPDFGerencial(
                        JSON.parse(
                          r.resumen
                        )
                      )
                    }
                  >
                    📊 PDF
                  </button>

                  <button
                    onClick={() =>
                      eliminar(
                        r.id
                      )
                    }
                  >
                    🗑
                  </button>

                </td>

              </tr>

            ))
          }

        </tbody>

      </table>

      {

        reporteSeleccionado && (

          <div
            className="modal-reporte"
          >

            <div
              className="modal-contenido"
            >

              <h3>

                {
                  reporteSeleccionado.nombre
                }

              </h3>

              <textarea

                readOnly

                value={
                  reporteSeleccionado.documento
                }

                rows={25}

                style={{

                  width:
                    "100%"

                }}

              />

              <button

                onClick={() =>
                  setReporteSeleccionado(
                    null
                  )
                }

              >

                Cerrar

              </button>

            </div>

          </div>

        )

      }

    </div>

  );

}