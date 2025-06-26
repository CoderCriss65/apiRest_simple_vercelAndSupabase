require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 80;

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(cors());

// 📌 1️⃣ Obtener todos los empleados
app.get('/empleados', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 2️⃣ Obtener empleado por ID
app.get('/empleados/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    data ? res.json(data) : res.status(404).json({ mensaje: "Empleado no encontrado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 3️⃣ Crear nuevo empleado
app.post('/empleados', async (req, res) => {
  try {
    const { nombre, puesto, salario } = req.body;
    if (!nombre || !puesto || !salario) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const { data, error } = await supabase
      .from('empleados')
      .insert([{ nombre, puesto, salario }]);
    
    if (error) throw error;
    res.status(201).json({ mensaje: "Empleado creado", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 4️⃣ Actualizar empleado
app.put('/empleados/:id', async (req, res) => {
  try {
    const { nombre, puesto, salario } = req.body;
    if (!nombre || !puesto || !salario) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const { data, error } = await supabase
      .from('empleados')
      .update({ nombre, puesto, salario })
      .eq('id', req.params.id);
    
    if (error) throw error;
    data.length
      ? res.json({ mensaje: "Empleado actualizado" })
      : res.status(404).json({ mensaje: "Empleado no encontrado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 5️⃣ Eliminar empleado
app.delete('/empleados/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('empleados')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ mensaje: "Empleado eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});