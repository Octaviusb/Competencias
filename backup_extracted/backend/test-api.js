import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🔍 Probando endpoint de organizaciones...');
    
    const response = await fetch('http://localhost:4000/api/organizations');
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Error en respuesta:');
      console.log(error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('💡 ¿Está el servidor corriendo en puerto 4000?');
  }
}

testAPI();