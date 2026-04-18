import Clientes from "./pages/Clientes";
import "./styles/App.css";
import MainLayout from "./layouts/MainLayout";
import "./styles/index.css";

function App() {
  return (
    <div className="app-container">
      <MainLayout />
      <div className="content">
        <Clientes />
      </div>
    </div>
  );
}

export default App;
