# WalidAlHassan/twilio-voice-agent

## Resumen

El repositorio `WalidAlHassan/twilio-voice-agent` no contiene un modelo de inteligencia artificial, sino una plataforma de software de código abierto para realizar llamadas de voz salientes automatizadas con agentes conversacionales de IA. El sistema orquesta un pipeline completo: un backend recibe una petición API, Twilio establece la llamada telefónica real, y un agente de voz compuesto por ElevenLabs (reconocimiento y síntesis de voz) y Gemini (modelo de lenguaje) mantiene una conversación dinámica guiada por un prompt configurable por llamada. Al finalizar, se genera un resumen estructurado que se envía de vuelta al backend.

La relevancia de este proyecto radica en su enfoque de producción: incluye autenticación por API key, validación de firmas de Twilio, despliegue mediante Docker y Kubernetes, y una arquitectura desacoplada que permite intercambiar proveedores de STT, LLM y TTS cambiando una variable de entorno. Está diseñado para casos de uso como recordatorios de citas, cobros, encuestas o atención al cliente, sin necesidad de modificar código para cambiar el objetivo de la conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (aplicacion backend en Python, no un modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del LLM subyacente, Gemini por defecto) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende de los proveedores de STT/TTS/LLM configurados) |
| Licencia | No disponible |
| Formato de pesos | No aplica (codigo fuente Python, sin pesos de modelo) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una aplicacion de software que integra servicios externos. La arquitectura se compone de un servicio FastAPI (`app/main.py`) que expone endpoints REST para iniciar llamadas y consultar su estado, y un worker independiente (`app/workers/callback_worker.py`) que procesa el envio de resumenes al backend del cliente. Ambos procesos comparten una base de datos SQLite por defecto, con soporte para Postgres via Docker Compose.

El flujo de una llamada es: el backend recibe una peticion `POST /api/v1/calls/outbound` con el numero de telefono, un prompt que define el objetivo del agente y metadatos opcionales. Twilio establece la llamada y abre un stream de medios WebSocket (`wss://`) hacia el servicio. El audio se envia a ElevenLabs para transcripcion (STT), el texto resultante se pasa a Gemini como LLM, y la respuesta se sintetiza con ElevenLabs (TTS) y se reproduce al interlocutor. Al colgar, se genera un resumen estructurado y se entrega al backend via callback HTTP.

El diseño incluye interfaces abstractas en `app/domain/interfaces/` para STT, LLM y TTS, con implementaciones concretas en `app/providers/` y un patron factory para seleccionar el proveedor activo mediante variables de entorno (`STT_PROVIDER`, `LLM_PROVIDER`, `TTS_PROVIDER`). Esto permite anadir nuevos proveedores sin tocar la logica de negocio.

## Capacidades

- Realiza llamadas telefonicas salientes reales a numeros de cualquier pais (el ejemplo usa Bangladesh, +880).
- Mantiene conversaciones de voz bidireccionales en tiempo real con baja latencia gracias al streaming de Twilio Media Streams.
- El objetivo de la conversacion se define por llamada mediante el campo `prompt`, sin necesidad de recompilar ni cambiar codigo.
- Genera un resumen estructurado de la llamada al finalizar, accesible via API o enviado por callback al backend del cliente.
- Permite adjuntar metadatos arbitrarios (por ejemplo, `policy_id`, `renewal_date`) que pueden usarse en el prompt o en el resumen.
- Soporta intercambio de proveedores de STT, LLM y TTS mediante variables de entorno, con extensiones planificadas para Deepgram, AssemblyAI, Whisper, OpenAI, Claude, Grok, Azure y Polly.
- Incluye autenticacion por API key en todos los endpoints `/api/v1/*` y validacion de firmas de Twilio para entornos de produccion.
- Proporciona despliegue reproducible mediante Docker, Docker Compose y manifiestos de Kubernetes con autoescalado horizontal (HPA).

## Casos de uso

- Recordatorios de citas y renovaciones: una clinica o aseguradora puede lanzar una campana de llamadas automaticas con un prompt como "You are calling to discuss a pending insurance renewal" y adjuntar el identificador de poliza en los metadatos. El agente confirma la fecha, resuelve dudas y el resumen final se guarda en el CRM.
- Encuestas de satisfaccion postventa: tras una compra, el sistema llama al cliente con un prompt de recogida de feedback. El resumen estructurado permite clasificar respuestas y detectar incidencias sin intervencion humana.
- Gestion de cobros y recordatorios de pago: una empresa de servicios puede llamar a morosos con un prompt de negociacion de pago. El agente ofrece opciones, registra compromisos y el callback actualiza el sistema de facturacion.
- Verificacion de identidad y confirmacion de pedidos: en comercio electronico, el agente confirma datos del pedido y valida la identidad del cliente mediante preguntas generadas por el LLM, reduciendo fraude en entregas.
- Atencion al cliente de nivel 1: el sistema puede derivar llamadas entrantes (si se anade el flujo entrante) a un agente de voz que resuelve consultas frecuentes usando el prompt como guia, y escala a un humano si el LLM detecta que no puede resolver.
- Campanas de marketing y reactivacion: una empresa puede llamar a clientes inactivos con ofertas personalizadas. El prompt incluye el historial de compras en los metadatos, y el resumen permite medir la tasa de exito de la campana.
- Automatizacion de procesos de back-office: el resumen generado al final de cada llamada puede alimentar sistemas de tickets, CRMs o ERPs mediante el callback, eliminando la transcripcion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una aplicacion que orquesta servicios externos, el rendimiento depende de la latencia de Twilio, ElevenLabs y Gemini, y no de un modelo local. No hay metricas de calidad de conversacion ni de precision de resumenes publicadas por el autor.

## Requisitos de hardware

- No requiere GPU ni hardware especializado: es una aplicacion Python que se ejecuta en CPU.
- Requisitos minimos: Python 3.11+, una maquina con al menos 1 GB de RAM para el proceso FastAPI y el worker.
- Para produccion se recomienda un VPS o contenedor con 2 vCPU y 2 GB de RAM, suficiente para manejar varias llamadas concurrentes.
- El despliegue en Kubernetes requiere un cluster con ingress controller que soporte websockets de larga duracion (anotaciones especificas en el Ingress).
- Para desarrollo local se necesita `ngrok` o `cloudflared` para exponer el servicio a Twilio via HTTPS.
- No hay latencia ni throughput estimados publicados; dependen de los proveedores externos.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros modelos de lenguaje o de voz. Existen proyectos similares en el ecosistema Twilio, como el tutorial oficial de Twilio Conversation Relay con OpenAI, o el repositorio `hassan1030/ai-voice-agent` que usa OpenAI Realtime API y LiveKit, pero no son modelos sino aplicaciones. No se dispone de datos objetivos para una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede descargar ni ejecutar como un modelo de lenguaje. Requiere cuentas de pago en Twilio, ElevenLabs y Google AI Studio.
- La calidad de la conversacion depende enteramente de los proveedores externos; Gemini puede alucinar datos o desviarse del prompt si no se disena cuidadosamente.
- El prompt es la unica guia del agente: si es ambiguo o incompleto, la conversacion puede derivar en respuestas incorrectas o inapropiadas.
- La autenticacion por API key es opcional por defecto: si `API_KEYS` no esta definida, los endpoints `/api/v1/*` quedan abiertos, lo que supone un riesgo de abuso en despliegues publicos.
- La validacion de firmas de Twilio (`TWILIO_VALIDATE_SIGNATURES`) debe activarse en produccion; si se desactiva, un atacante podria falsificar webhooks.
- No hay soporte para llamadas entrantes en el codigo actual; solo salientes.
- La base de datos SQLite por defecto no es adecuada para multiples instancias en produccion; se recomienda Postgres via Docker Compose.
- No se especifica la licencia del repositorio, lo que limita su uso comercial sin autorizacion explicita del autor.
- El proyecto parece estar en fase inicial (creado en agosto de 2026) y no tiene descargas ni valoraciones en HuggingFace, por lo que su madurez no esta contrastada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WalidAlHassan/twilio-voice-agent
- Documentacion de Twilio Virtual Agent: https://www.twilio.com/docs/voice/virtual-agent
- Tutorial de Twilio Conversation Relay con OpenAI: https://www.twilio.com/en-us/blog/developers/tutorials/product/ai-phone-agent-twilio-conversation-relay
- Repositorio relacionado del mismo autor: https://huggingface.co/WalidAlHassan/AI-AGENTS
- Proyecto similar en GitHub (ai-voice-agent): https://github.com/hassan1030/ai-voice-agent
- Proyecto similar en GitHub (twilio-agentic-voice-assistant): https://github.com/pBread/twilio-agentic-voice-assistant
