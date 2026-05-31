import { getDB } from "./db";

export async function guardarReporte(
  reporte
) {

  const db =
    await getDB();

  await db.execute(

`
INSERT INTO reportes (

  nombre,

  fecha_generacion,

  periodo_inicio,

  periodo_fin,

  documento,

  resumen

)

VALUES (

  ?, ?, ?, ?, ?, ?

)
`,

[
  reporte.nombre,

  reporte.fecha_generacion,

  reporte.periodo_inicio,

  reporte.periodo_fin,

  reporte.documento,

  JSON.stringify(
    reporte.resumen
  )

]

);

}

export async function obtenerReportes() {

  const db =
    await getDB();

  return await db.select(

`
SELECT *
FROM reportes
ORDER BY id DESC
`

  );

}

export async function eliminarReporte(
  id
) {

  const db =
    await getDB();

  await db.execute(

`
DELETE FROM reportes
WHERE id = ?
`,

[id]

  );

}