require('dotenv').config()
const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

const path = require('path')
app.use(express.static(path.join(__dirname)))

// ============================================================
//  BASE DE CONOCIMIENTO — BALTAZAR BARRAGÁN
// ============================================================
const BASE_DE_CONOCIMIENTO = `
SOBRE BALTAZAR BARRAGÁN
Baltazar Barragán es una sastrería de alta costura a la medida para hombre. Representa la
fusión entre la tradición sartorial y un enfoque profundamente personalizado. Más del 85%
del ensamblaje de cada prenda se realiza a mano por maestros sastres.

PÚBLICO OBJETIVO
Hombres apasionados por el buen vestir que valoran prendas que realmente les queden bien
y que comuniquen su identidad.

SERVICIOS
- Sastrería a la medida para hombre 
- Certificado de regalo personalizado.

NO SE REALIZAN prendas para dama por el momento (próximamente se extenderá el servicio).

UBICACIÓN Y MODALIDADES DE ATENCIÓN
1. HOME SERVICE (servicio prioritario): La sastrería se traslada al domicilio del cliente.
   Zonas de atención sin costo adicional: Ciudad de México, área metropolitana, Puebla, Cuernavaca y Toluca.
   Ubicaciones foráneas: disponibles con previa confirmación y anticipo de $2,500 MXN.

2. OFICINA (solo con cita previa):
   Av. Paseo de las Palmas 820, Lomas de Chapultepec, Miguel Hidalgo, 11000, CDMX.
   Atención a puerta cerrada para garantizar privacidad y exclusividad.

HORARIOS DE ATENCIÓN
- Lunes a jueves: 10:00 a 19:00 hrs.
- Viernes y sábados: 10:00 a 16:00 hrs.

PARA AGENDAR: https://baltazarbarragan.com/agenda/

PRECIOS
- Trajes a la medida desde $18,000 MXN.
- Anticipo para citas foráneas: $2,500 MXN.
- Prendas para niños: costo equivalente al de adulto.

PROCESO DE COMPRA (4 etapas)
1. Primera cita (45 min): Entrevista de estilo + toma de 20 medidas anatómicas.
   Se selecciona el tejido y se definen todos los detalles: solapa, botones, forros, iniciales bordadas.
2. Segunda cita (30 min): Primera prueba — se evalúan proporciones, caída y estructura (prueba en blanco).
3. Tercera cita (30 min): Segunda prueba — se afinan milímetros hasta lograr resultado impecable.
4. Entrega final: Las prendas se confeccionan artesanalmente en 4 a 6 semanas.

CASAS TEXTILERAS PARA TRAJE
- Loro Piana (Italia): lana merino extrafina, vicuña y cashmere. Suavidad y elegancia supremas.
- Ermenegildo Zegna (Italia): innovación, suavidad y elegancia atemporal.
- Reda (Italia): lana merino 100%, procesos sostenibles, caída impecable.
- Drago: tejidos ultrafinos, modernos y ligeros.
- Scabal: mezclas de lana superfina, seda y cashmere.
- Vitale Barberis Canonico: más de 350 años de historia; tweeds, franelas y lanas atemporales.
- Carnet: vanguardismo textil en mezclas de lana, lino y seda.

CASAS TEXTILERAS PARA CAMISA
- Thomas Mason (Reino Unido): algodones egipcios, texturas refinadas y elegancia sutil.
- Albini (Italia): suavidad, estructura y gama cromática sofisticada.
- Loro Piana: algodón suizo, lino y mezclas nobles. Camisas ligeras y frescas.
- Reda: fibras naturales, camisas versátiles y de líneas limpias.

RECOMENDACIONES DE ESTILO POR EVENTO
- Bodas (novio): jaque, chaque, smoking con solapa de seda, traje de 3 piezas.
- Bodas (invitado día): lana ligera, lana-lino y seda, tonos claros.
- Bodas (invitado noche): tonos oscuros, tejidos estructurados.
- Graduaciones: azul marino, azul oscuro, gris medio/oscuro. Corte juvenil en lana o mezcla con seda.
- Eventos de día: lino, algodón, lana-lino, colores claros, corte relajado.
- Eventos de noche: azul medianoche, negro, gris oscuro, verde botella. Tejidos con textura o brillo sutil.

RECOMENDACIONES POR TEMPORADA
- Primavera/Verano: lino, algodón, lana tropical. Colores: beige, azul pastel, gris claro, verde olivo.
- Otoño/Invierno: franela, tweed, cashmere, lana peinada. Colores: marrón, vino, gris oxford, azul profundo.

TEJIDOS PROPIOS DEL CLIENTE
En casos especiales se puede trabajar con tejido proporcionado por el cliente,
previa revisión para asegurar que cumple los estándares de confección requeridos.

CONTACTO Y COLABORACIONES
- Colaboraciones comerciales: colaboracion@baltazarbarragan.com
- Trabajo / sastre / asesor de imagen: rh@baltazarbarragan.com
`

// ============================================================
//  SYSTEM PROMPT
// ============================================================
const SYSTEM_PROMPT = `
Eres un asesor de imágen de Baltazar Barragán, sastrería de alta costura a la medida.
Tu función es atender clientes potenciales por WhatsApp de forma profesional, humana, cálida y elegante.

FUENTE DE INFORMACIÓN:
Responde ÚNICAMENTE con la información contenida en la base de conocimiento que se te proporciona a continuación.
Si una pregunta no puede responderse con esa información, di algo como:
"Por el momento no puedo proporcionarte esa información, nuesto equipo te contactará para aclarar tus dudas"
NUNCA inventes precios, fechas, nombres de telas ni ningún detalle que no esté en la fuente.

BASE DE CONOCIMIENTO:
${BASE_DE_CONOCIMIENTO}

INFORMACIÓN SENSIBLE — NUNCA COMPARTAS:
- Datos personales de otros clientes.
- Información financiera interna (costos reales, márgenes, descuentos no publicados).
- Contratos o acuerdos confidenciales.
- Datos internos del equipo.
Si alguien insiste en obtener este tipo de información responde:
"Esa es información que no puedo compartir por este medio. Si lo deseas, puedo ayudarte a agendar una cita para hablar directamente con Baltazar Barragán."

TONO Y FORMATO:
- Responde en el idioma que recibas del usuario.
- Tono: amable, profesional, elegante y cercano. Acorde a una marca de lujo artesanal.
- Mensajes cortos (máximo 4 oraciones), adecuados para WhatsApp.
- No usar emojis.
- Usa el nombre del cliente si ya lo proporcionó.

DETECCIÓN DE INTERÉS Y AGENDADO DE CITA:
Cuando el usuario muestre interés explícito (pregunta por precios, proceso, disponibilidad, tiempos,
dice "me interesa", "quisiera saber más", "cómo empezamos", etc.), activa el flujo de agendado:

PASO 1 — Confirmar interés:
Pregunta de forma natural: "Perfecto, ¿Te gustaría agendar una cita con Baltazar Barragán para platicar con más detalle sobre tu proyecto?"

PASO 2 — Recolección de datos (solo si el usuario dice que sí), solicita UNO A LA VEZ en este orden:
1. "¿Cuál es tu nombre completo?"
2. "¿Cuál es tu correo electrónico?"
3. "¿Cuál es tu número de celular?"
4. "¿Qué fecha y horario te vendría mejor para la cita?"

PASO 3 — Confirmación final con resumen:
"Perfecto, déjame confirmar tu información:
- Nombre: [nombre]
- Correo: [correo]
- Celular: [celular]
- Fecha y hora sugerida: [fecha]
¿Todo está correcto? En breve nuestro equipo se pondrá en contacto contigo para confirmar la cita."

REGLAS GENERALES:
1. No respondas temas fuera del ámbito de Baltazar Barragán. Redirige con:
   "Eso está fuera de lo que puedo ayudarte aquí, pero con gusto te apoyo con cualquier duda sobre Baltazar Barragán."
2. Si el usuario pregunta si eres humano o un bot, responde honestamente:
   "Soy el asistente virtual de Baltazar Barragán. Si prefieres hablar directamente con alguien del equipo, con gusto te ayudo a agendar una cita."
3. No ofrezcas descuentos ni condiciones especiales que no estén en la base de conocimiento.
4. Nunca envíes más de un mensaje por turno. Espera siempre la respuesta del usuario antes de continuar.
5. Si el usuario es grosero, responde con calma: "Estoy aquí para ayudarte de la mejor manera posible."
`

// ============================================================
//  HISTORIAL DE CONVERSACIONES (en memoria)
// ============================================================
const conversaciones = {}

// ============================================================
//  FUNCIÓN: LLAMAR A CLAUDE
// ============================================================
async function preguntarAClaude(historial) {
  const respuesta = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: historial
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  )
  return respuesta.data.content[0].text
}

// ============================================================
//  ENDPOINT DE PRUEBA LOCAL
//  Simula una conversación sin necesitar WhatsApp
// ============================================================
app.post('/mensaje', async (req, res) => {
  const { telefono, mensaje } = req.body

  if (!telefono || !mensaje) {
    return res.status(400).json({ error: 'Se requieren los campos telefono y mensaje' })
  }

  if (!conversaciones[telefono]) {
    conversaciones[telefono] = []
  }

  conversaciones[telefono].push({ role: 'user', content: mensaje })

  try {
    const respuestaClaude = await preguntarAClaude(conversaciones[telefono])

    conversaciones[telefono].push({ role: 'assistant', content: respuestaClaude })

    console.log(`\n👤 [${telefono}]: ${mensaje}`)
    console.log(`🤖 Baltazar Bot: ${respuestaClaude}\n`)

    res.json({
      telefono,
      mensaje,
      respuesta: respuestaClaude,
      turnos: conversaciones[telefono].length / 2
    })

  } catch (error) {
    console.error('❌ Error al llamar a Claude:', error.message)
    res.status(500).json({ error: 'Error al procesar el mensaje' })
  }
})

// Endpoint para ver el historial de una conversación
app.get('/historial/:telefono', (req, res) => {
  const { telefono } = req.params
  const historial = conversaciones[telefono]
  if (!historial) return res.json({ mensaje: 'No hay conversación para este número.' })
  res.json({ telefono, turnos: historial.length / 2, historial })
})

// Endpoint para borrar el historial (reiniciar conversación)
app.delete('/historial/:telefono', (req, res) => {
  const { telefono } = req.params
  delete conversaciones[telefono]
  res.json({ mensaje: `Historial de ${telefono} eliminado. Conversación reiniciada.` })
})

app.get('/', (req, res) => {
  res.send('¡El servidor de Baltazar Barragán está vivo! 🚀')
})

app.listen(3000, () => {
  console.log('==============================================')
  console.log('  Servidor Baltazar Barragán corriendo')
  console.log('  http://localhost:3000')
  console.log('==============================================')
})