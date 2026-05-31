import Database from "@tauri-apps/plugin-sql";

let db = null;

export async function getDB() {

  return await initDB();

}

export async function initDB() {

  if (db) return db;

  db = await Database.load(
    "sqlite:control_marcas.db"
  );

  await crearTablas();

  return db;
}

async function crearTablas() {

  await db.execute(`
    CREATE TABLE IF NOT EXISTS empleados(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cedula TEXT,
      puesto TEXT,
      activo INTEGER DEFAULT 1
    )
  `);


  await db.execute(`
    CREATE TABLE IF NOT EXISTS horarios(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empleado_id INTEGER,
  dia_semana INTEGER,
  hora_entrada TEXT,
  hora_salida TEXT,
  UNIQUE(empleado_id,dia_semana)
  )`
  );



    await db.execute(`

    CREATE TABLE IF NOT EXISTS reportes(

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nombre TEXT,

    fecha_generacion TEXT,

    periodo_inicio TEXT,

    periodo_fin TEXT,

    documento TEXT,

    resumen TEXT

    )

    `);


}

/* ===========================
   EMPLEADOS
=========================== */

export async function obtenerEmpleados() {

  const db = await initDB();

  return await db.select(
    "SELECT * FROM empleados ORDER BY nombre"
  );
}

export async function insertarEmpleado(
  nombre,
  cedula,
  puesto
) {

  const db = await initDB();

  await db.execute(
    `
      INSERT INTO empleados
      (nombre, cedula, puesto)
      VALUES (?, ?, ?)
    `,
    [nombre, cedula, puesto]
  );
}

export async function actualizarEmpleado(
  id,
  nombre,
  cedula,
  puesto
) {

  const db = await initDB();

  await db.execute(
    `
      UPDATE empleados
      SET nombre = ?,
          cedula = ?,
          puesto = ?
      WHERE id = ?
    `,
    [
      nombre,
      cedula,
      puesto,
      id
    ]
  );
}

export async function eliminarEmpleado(id) {

  const db = await initDB();

  await db.execute(
    "DELETE FROM empleados WHERE id = ?",
    [id]
  );
}




export async function guardarHorario(
  empleadoId,
  dia,
  entrada,
  salida
) {
  const db = await initDB();

  await db.execute(
    `
      DELETE FROM horarios
      WHERE empleado_id = ?
      AND dia_semana = ?
    `,
    [empleadoId, dia]
  );

  await db.execute(
    `
      INSERT INTO horarios
      (
        empleado_id,
        dia_semana,
        hora_entrada,
        hora_salida
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      empleadoId,
      dia,
      entrada,
      salida
    ]
  );
}




export async function obtenerHorariosEmpleado(
  empleadoId
) {

  const db = await initDB();

  return await db.select(
    `
      SELECT *
      FROM horarios
      WHERE empleado_id = ?
      ORDER BY dia_semana
    `,
    [empleadoId]
  );

}


export async function obtenerTodosHorarios() {

  const db =
    await initDB();

  return await db.select(
    `
      SELECT
        h.*,
        e.nombre
      FROM horarios h
      INNER JOIN empleados e
        ON e.id =
           h.empleado_id
    `
  );

}