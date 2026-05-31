import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportarPDFGerencial(
  resumenGerencial
) {

  const doc =
    new jsPDF();

  // TÍTULO

  doc.setFontSize(20);

  doc.text(
    "REPORTE GERENCIAL",
    14,
    20
  );

  doc.setFontSize(10);

  doc.text(
    `Generado: ${new Date().toLocaleDateString()}`,
    14,
    28
  );

  // TABLA RESUMEN

  autoTable(
    doc,
    {

      startY: 35,

      theme: "grid",

      headStyles: {

        fillColor: [41, 128, 185],

        textColor: 255,

        fontStyle: "bold"

      },

      alternateRowStyles: {

        fillColor: [245, 245, 245]

      },

      head: [[

        "Empleado",
        "Esperadas",
        "Justificadas",
        "Objetivo",
        "Trabajadas",
        "Balance",
        "Incidencias"

      ]],

      body:
        resumenGerencial.map(
          e => [

            e.empleado,

            e.horasEsperadas.toFixed(2),

            e.horasJustificadas.toFixed(2),

            e.horasObjetivo.toFixed(2),

            e.horasTrabajadas.toFixed(2),

            `${e.balance.toFixed(2)}h`,

            e.incidencias.length

          ]
        )

    }
  );

  let y =
    doc.lastAutoTable.finalY + 15;

  resumenGerencial.forEach(
    empleado => {

      if (y > 220) {

        doc.addPage();

        y = 20;

      }

      // NOMBRE

      doc.setFontSize(15);

      doc.text(
        empleado.empleado,
        14,
        y
      );

      y += 8;

      // RESUMEN EMPLEADO

      doc.setFontSize(10);

      doc.text(

        `Esperadas: ${empleado.horasEsperadas.toFixed(2)} | ` +

        `Justificadas: ${empleado.horasJustificadas.toFixed(2)} | ` +

        `Objetivo: ${empleado.horasObjetivo.toFixed(2)} | ` +

        `Trabajadas: ${empleado.horasTrabajadas.toFixed(2)} | ` +

        `Balance: ${empleado.balance.toFixed(2)}h`,

        14,

        y

      );

      y += 8;

      // TABLA DIARIA

      autoTable(
        doc,
        {

          startY: y,

          theme: "grid",

          headStyles: {

            fillColor: [52, 73, 94],

            textColor: 255

          },

          alternateRowStyles: {

            fillColor: [248, 250, 252]

          },

          head: [[

            "Fecha",
            "Entrada",
            "Salida",
            "Diferencia",
            "Estado"

          ]],

          body:
            empleado.marcas.map(
              m => [

                m.fecha,

                m.entrada,

                m.salida,

                `${m.diferencia}h`,

                (m.incidencias || [])
                  .length

                  ? (m.incidencias || [])
                      .map(
                        i =>
                          i.descripcion
                      )
                      .join(", ")

                  : "Sin incidencias"

              ]
            )

        }
      );

      y =
        doc.lastAutoTable.finalY + 10;

      // LÍNEA SEPARADORA

      doc.line(
        14,
        y,
        195,
        y
      );

      y += 10;

    }
  );

  doc.save(
    "Reporte_Gerencial.pdf"
  );

}