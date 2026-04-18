import Clientes from "./pages/Clientes";
import Categorias from "./pages/Categorias";
import "./styles/App.css";
import MainLayout from "./layouts/MainLayout";
import "./styles/index.css";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <div className="app-container">
      <MainLayout />
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/clientes" />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/categorias" element={<Categorias />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
