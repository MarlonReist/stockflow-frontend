import Clientes from "./pages/Clientes";
import Categorias from "./pages/Categorias";
import Almoxarifado from "./pages/Almoxarifado";
import Fornecedor from "./pages/Fornecedor";
import Colaborador from "./pages/Colaborador";
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
          <Route path="/almoxarifados" element={<Almoxarifado />} />
          <Route path="/fornecedores" element={<Fornecedor />} />
          <Route path="/colaboradores" element={<Colaborador />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
