import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Conectando...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Probar conexión con backend
    axios.get('http://localhost:5000/api/health')
      .then(response => {
        setBackendStatus('✅ ' + response.data.mensaje);
        setLoading(false);
      })
      .catch(error => {
        setBackendStatus('❌ Error: No se puede conectar al servidor');
        setLoading(false);
        console.error('Error:', error);
      });
  }, []);

  return (
    <div className="App">
      <header style={{
        backgroundColor: '#ff6b35',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1>🏎️ Desafío Dunas de Nazca</h1>
        <p>Sistema de Inscripciones Off Road</p>
        <p style={{
          background: loading ? '#ffa500' : backendStatus.includes('✅') ? '#28a745' : '#dc3545',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          {backendStatus}
        </p>
      </header>
      
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>🚧 En Desarrollo</h2>
        <p>Tu aplicación está lista para empezar a desarrollar.</p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '40px',
          maxWidth: '800px',
          margin: '40px auto'
        }}>
          <div style={{
            border: '2px solid #ff6b35',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <h3>📝 Inscripciones</h3>
            <p>Sistema de registro de equipos</p>
          </div>
          
          <div style={{
            border: '2px solid #ff6b35',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <h3>📅 Cronograma</h3>
            <p>Horarios y actividades</p>
          </div>
          
          <div style={{
            border: '2px solid #ff6b35',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <h3>⚙️ Administración</h3>
            <p>Panel de control</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;