import React from "react";
import "./Dashboard.css"; // crea este archivo si no existe

const Dashboard = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Competency Manager</h1>
        <p>Tu sistema para gestionar talento humano y desarrollo profesional</p>
      </header>

      <section className="dashboard-cards">
        <div className="card blue">
          <h3>Empleados</h3>
          <p>0 registrados</p>
          <button>Ver empleados</button>
        </div>
        <div className="card pink">
          <h3>Observaciones</h3>
          <p>1 registrada</p>
          <button>Ver observaciones</button>
        </div>
        <div className="card cyan">
          <h3>Entrevistas</h3>
          <p>1 programada</p>
          <button>Ver entrevistas</button>
        </div>
        <div className="card orange">
          <h3>Planes de desarrollo</h3>
          <p>0 activos</p>
          <button>Ver planes</button>
        </div>
        <div className="card green">
          <h3>Pruebas Psicométricas</h3>
          <p>Big Five</p>
          <button onClick={() => window.location.href = '/psychometric'}>Ver pruebas</button>
        </div>
        <div className="card purple">
          <h3>Carga Masiva</h3>
          <p>Importar datos</p>
          <button onClick={() => window.location.href = '/bulk-import'}>Cargar datos</button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
