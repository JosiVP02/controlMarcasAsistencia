import {
  FaChartBar,
  FaUsers,
  FaClock,
  FaFileImport,
  FaExclamationTriangle,
  FaFileAlt,
  FaCog
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

const MENU = [
  {
    path: "/",
    label: "Empleados",
    icon: <FaUsers />
  },
  {
    path: "/horarios",
    label: "Horarios",
    icon: <FaClock />
  },
  {
    path: "/importar",
    label: "Generar Reporte",
    icon: <FaFileImport />
  },
  {
    path: "/reportes",
    label: "Reportes",
    icon: <FaFileAlt />
  }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">

        <h2>Control Marcas</h2>

        <span>
          Gestión de Personal
        </span>

      </div>

      <nav>

        {MENU.map(item => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "menu-link active"
                : "menu-link"
            }
          >

            {item.icon}

            <span>
              {item.label}
            </span>

          </NavLink>

        ))}

      </nav>

    </aside>
  );
}