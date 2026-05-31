import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Empleados from "./pages/Empleados";
import Horarios from "./pages/Horarios";
import GenerarReporte from "./pages/GenerarReporte";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

export default function App() {

  return (
    <div className="app">

      <Sidebar />

      <main className="content">

        <Routes>


          <Route path="/" element={<Empleados />} />

          <Route path="/horarios" element={<Horarios />} />

          <Route path="/importar" element={<GenerarReporte />} />

          <Route path="/reportes" element={<Reportes />} />

          <Route
            path="/configuracion"
            element={<Configuracion />}
          />

        </Routes>

      </main>

    </div>
  );
}