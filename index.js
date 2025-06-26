require('dotenv').config({ path: '.env' });
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require("path");

// Debugging: Verificar variables de entorno
console.log('=== ENV VARIABLES ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'UNDEFINED!');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '*** Exists ***' : 'MISSING!');
console.log('PORT:', process.env.PORT || 80);

// Verificar credenciales de Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR: Faltan credenciales de Supabase!');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 88;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(cors());

// Middleware para loggear solicitudes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});



// Servir archivos estáticos desde la carpeta "src"
app.use(express.static(path.join(__dirname, "src")));

// Ruta principal para servir "index.html"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "cliente.html"));
})


// Ruta de prueba mejorada
app.get('/test', async (req, res) => {
  try {
    // Verificar conexión a Supabase
    const { data, error } = await supabase
      .from('empleados')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      message: 'API funcionando correctamente!',
      supabase: 'Conectado correctamente',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error conectando a Supabase',
      error: error.message
    });
  }
});

// 📌 1️⃣ Obtener todos los empleados
app.get('/empleados', async (req, res) => {
  try {
    console.log('Consultando todos los empleados...');
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    console.log(`Encontrados ${data.length} empleados`);
    res.json(data);
  } catch (error) {
    console.error('Error en GET /empleados:', error);
    res.status(500).json({ 
      error: error.message,
      solution: "Verifica la tabla 'empleados' en Supabase"
    });
  }
});

// 📌 2️⃣ Obtener empleado por ID (CORREGIDO)
app.get('/empleados/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Consultando empleado con ID: ${id}`);
    
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', id)
      .maybeSingle();  // Usar maybeSingle en lugar de single
    
    if (error) throw error;
    
    if (data) {
      console.log(`Empleado encontrado: ${data.nombre}`);
      res.json(data);
    } else {
      console.log(`Empleado no encontrado: ${id}`);
      res.status(404).json({ mensaje: "Empleado no encontrado" });
    }
  } catch (error) {
    console.error(`Error en GET /empleados/${req.params.id}:`, error);
    res.status(500).json({ 
      error: error.message,
      details: `Verifica el ID ${req.params.id}`
    });
  }
});

// 📌 3️⃣ Crear nuevo empleado
app.post('/empleados', async (req, res) => {
  try {
    const { nombre, puesto, salario } = req.body;
    console.log('Creando nuevo empleado:', { nombre, puesto, salario });
    
    // Validación de campos
    if (!nombre || !puesto || !salario) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Insertar con retorno de datos
    const { data, error } = await supabase
      .from('empleados')
      .insert([{ nombre, puesto, salario }])
      .select();
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log('Empleado creado con ID:', data[0].id);
      res.status(201).json({ 
        mensaje: "Empleado creado", 
        data: data[0] 
      });
    } else {
      console.log('Empleado creado pero no se devolvió el registro');
      res.status(201).json({ 
        mensaje: "Empleado creado (pero no se obtuvo respuesta)" 
      });
    }
  } catch (error) {
    console.error('Error en POST /empleados:', error);
    res.status(500).json({ 
      error: error.message,
      details: "Verifica los datos enviados"
    });
  }
});

// 📌 4️⃣ Actualizar empleado
app.put('/empleados/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, puesto, salario } = req.body;
    console.log(`Actualizando empleado ${id}:`, { nombre, puesto, salario });
    
    // Validación de campos
    if (!nombre || !puesto || !salario) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Actualizar con retorno de datos
    const { data, error } = await supabase
      .from('empleados')
      .update({ nombre, puesto, salario })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log(`Empleado actualizado: ${id}`);
      res.json({ 
        mensaje: "Empleado actualizado", 
        data: data[0] 
      });
    } else {
      console.log(`No se encontró empleado para actualizar: ${id}`);
      res.status(404).json({ mensaje: "Empleado no encontrado" });
    }
  } catch (error) {
    console.error(`Error en PUT /empleados/${req.params.id}:`, error);
    res.status(500).json({ 
      error: error.message,
      details: `Error actualizando empleado ${req.params.id}`
    });
  }
});

// 📌 5️⃣ Eliminar empleado
app.delete('/empleados/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Eliminando empleado: ${id}`);
    
    // Verificar existencia usando maybeSingle
    const { data: empleado, error: fetchError } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    if (!empleado) {
      console.log(`Empleado no encontrado: ${id}`);
      return res.status(404).json({ mensaje: "Empleado no encontrado" });
    }

    // Eliminar
    const { error: deleteError } = await supabase
      .from('empleados')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    console.log(`Empleado eliminado: ${id} - ${empleado.nombre}`);
    res.json({ 
      mensaje: "Empleado eliminado", 
      empleado 
    });
  } catch (error) {
    console.error(`Error en DELETE /empleados/${req.params.id}:`, error);
    res.status(500).json({ 
      error: error.message,
      details: `Error eliminando empleado ${req.params.id}`
    });
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: `La ruta ${req.method} ${req.path} no existe`
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Servidor activo en http://localhost:${PORT}`);
  console.log(`🔍 Prueba: curl http://localhost:${PORT}/test`);
  console.log(`👥 Empleados: curl http://localhost:${PORT}/empleados`);
  console.log(`🚀 Listo para deploy en Vercel!`);
});