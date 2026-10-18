# swordenamine/TahkiGPT

## Resumen

`swordenamine/TahkiGPT` es un repositorio de HuggingFace que no contiene un modelo de lenguaje: aloja **شاشتي تحكي** ("mi pantalla habla"), una aplicación web de un único archivo HTML que captura la pantalla del usuario a intervalos configurables y envía cada fotograma a la API de visión de Claude (familia `claude-sonnet-4-*`) para generar comentarios en voz de cinco personajes argelinos. El repositorio declara 0 descargas y 0 likes, no tiene pipeline asignado, ni licencia, ni idiomas en los metadatos, y no publica pesos, tokenizador, configuración ni código de entrenamiento.

El problema que aborda es de producto, no de modelado: adaptar el concepto de *screen-commentator* de Cheng Xiaohua (original en chino) a un registro cultural argelino, con conmutación de dialecto entre darja, árabe estándar, francés y mezcla, y salida de voz mediante la Web Speech API del navegador. Toda la capacidad lingüística y visual reside en el modelo remoto de Anthropic; la capa propia del repositorio son *system prompts* por personaje y la fontanería de captura de pantalla en el navegador.

Su relevancia es, por tanto, la de un artefacto de demostración de ingeniería de prompts sobre API de visión, útil como referencia para prototipos de asistentes de pantalla y para estudiar cómo se instruye a un LLM en variación dialectal. No es evaluable como modelo: no hay arquitectura, parámetros, contexto ni benchmarks propios. Las fechas de los metadatos son inconsistentes (creación registrada el 2026-10-17, actualización el 2026-03-14).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio no publica pesos ni arquitectura de modelo; contiene una aplicación web de un solo archivo HTML que invoca por HTTP la API de visión de Claude Sonnet |
| Parametros totales | No disponible (no hay pesos publicados) |
| Parametros activos | No aplica: no es un modelo MoE y no hay pesos |
| Longitud de contexto | No disponible. Depende del modelo Claude Sonnet invocado por API; la model card no especifica versión exacta ni ventana |
| Tipos de cuantizacion | No disponible. No existen pesos locales que cuantizar; la inferencia ocurre en el servicio remoto |
| Idiomas soportados | En la aplicación: darja argelina, árabe estándar moderno, francés y mezcla de códigos (cuatro modos de dialecto). Los metadatos de HuggingFace no declaran idiomas |
| Licencia | MIT según la model card (aplicable al código de la aplicación). El campo de licencia de HuggingFace figura como no disponible y no hay pesos que licenciar |
| Formato de pesos | No disponible. El repositorio contiene un único archivo HTML (`shaashti-tahki.html`); no hay safetensors, GGUF ni ningún otro artefacto de pesos |

## Arquitectura y entrenamiento

No hay arquitectura propia ni proceso de entrenamiento. El pipeline descrito en la model card es: captura de pantalla mediante *screen share* del navegador, renderizado a canvas, codificación JPEG en base64 cada N segundos, y petición `fetch()` a la API de Anthropic con `anthropic-version: 2023-06-01`. El comportamiento de cada personaje se implementa como un *system prompt* distinto (ال حاج عمار, زكرياء من بلوزداد, البروفيسور بلحاج, عمو يحيى من تيزي وزو, معلّق الخضر), y el selector de dialecto añade una instrucción adicional que ajusta el registro lingüístico. No se documenta temperatura, límite de tokens de salida ni versión concreta del modelo remoto.

Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque no existen: el repositorio es un cliente de API. Las únicas innovaciones técnicas destacables son de integración: captura periódica con intervalos de 3, 5, 10, 15 y 30 segundos, *snapshot* manual, atajos de teclado (`Ctrl+Space` para iniciar/detener, `Ctrl+S` para captura manual), salida de voz opcional con selección de idioma árabe/francés y estadísticas de sesión (capturas analizadas, comentarios totales, duración). La distribución es un HTML estático sin build ni servidor; el autor advierte que la clave de API la gestiona el entorno de *artifacts* de Claude.ai y que, fuera de él, hay que añadirla manualmente en las cabeceras de la petición.

## Capacidades

- Generación de comentarios en tiempo casi real a partir de capturas de pantalla, delegando la percepción visual y el lenguaje en la API de Claude Sonnet Vision.
- Cinco personalidades con *system prompt* propio: anciano sabio de la Casbah (darja clásica y refranes), joven de Argel (argot moderno), profesor académico (registro analítico, mezcla árabe-francés), filósofo cabilio (toques de tamazight) y comentarista deportivo (tono de retransmisión de partido de la selección argelina).
- Cuatro modos de dialecto: darja pura, árabe estándar, francés con sabor argelino y mezcla natural.
- Salida de voz mediante Web Speech API, con selección de idioma árabe o francés; la disponibilidad y calidad dependen de las voces instaladas en el navegador.
- Control de cadencia de captura (3/5/10/15/30 s), captura manual bajo demanda y panel de estadísticas de sesión.
- No incluye *tool calling*, *function calling*, soporte de agentes, razonamiento multi-paso, visión local, audio de entrada ni ejecución *offline*. Todas esas capacidades, si aparecen, provienen del modelo remoto y no están expuestas por la aplicación.
- Interfaz únicamente en árabe/francés, con tipografías Scheherazade New, Cairo e IBM Plex Mono y paleta de la bandera argelina.

## Casos de uso

- **Demostración docente de ingeniería de prompts sobre API de visión**: el archivo HTML sirve como ejemplo mínimo, legible y sin dependencias de cómo se estructura un *system prompt* por personaje y cómo se añade una instrucción de registro lingüístico encima; adecuado para talleres donde se quiera mostrar la diferencia entre "envoltorio de API" y "modelo".
- **Prototipado rápido de asistentes de pantalla**: permite validar en minutos si un comentario contextual sobre lo que ocurre en pantalla aporta valor antes de invertir en un pipeline propio; el intervalo configurable de 3 a 30 segundos deja ajustar la relación entre frescura y coste.
- **Creación de contenido para audiencias argelinas**: un creador puede emitir con comentario continuo en darja o en mezcla árabe-francés, con voz sintetizada, sin escribir guion; el tono de comentarista deportivo encaja con retransmisiones informales de fútbol o de partidas.
- **Recogida de ejemplos de variación dialectal**: ejecutar la aplicación con los cuatro modos y las cinco personalidades produce un corpus de salidas en darja, árabe estándar y code-switching que puede usarse como material ilustrativo o como semilla para diseñar taxonomías de evaluación dialectal.
- **Pruebas de coste y latencia de pipelines de visión por API**: la captura periódica emite una imagen por intervalo, lo que permite medir empíricamente gasto por minuto, latencia extremo a extremo y fiabilidad de la API bajo un patrón de llamadas repetidas con JPEG comprimido.
- **Base para un comentarista de eventos en directo** (deportes, eSports, clases grabadas): el bucle captura → prompt → texto → TTS es reutilizable cambiando el *system prompt* y el origen de los fotogramas; la arquitectura de un solo archivo facilita el fork y el despliegue en cualquier servidor estático.
- **Evaluación cualitativa de TTS árabe en navegador**: comparar la salida de voz de Chrome y Edge en árabe y francés sobre un mismo flujo de texto permite decidir si la síntesis nativa del navegador basta para un producto o hace falta un servicio dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de calidad de comentario, fidelidad descriptiva de la captura, corrección en darja ni comparaciones con otros sistemas. Cualquier cifra de rendimiento lingüístico correspondería al modelo Claude Sonnet subyacente, cuyos resultados no se aportan en la información disponible, y no al repositorio. Tampoco se documentan latencias medidas, tasa de error de la API ni consumo por sesión.

## Requisitos de hardware

- **VRAM local: 0 GB.** No hay pesos; la inferencia se ejecuta en la infraestructura de Anthropic. No es posible ejecutar el modelo en local con esta información.
- **Cliente**: un navegador de escritorio moderno con soporte de *screen capture*; el autor recomienda Chrome o Edge. Cualquier portátil o equipo de sobremesa de la última década es suficiente, ya que solo codifica JPEG y hace peticiones HTTP.
- **Requisito crítico**: una clave de API de Anthropic con acceso a `claude-sonnet-4-*`. Sin ella la aplicación no produce ningún comentario.
- **GPU dedicada**: innecesaria. No aplican A100, H100 ni RTX 4090, salvo que se reimplemente el sistema con un modelo de visión local, escenario no cubierto por el repositorio.
- **Despliegue**: servir un HTML estático (o abrirlo como archivo local). No aplican vLLM, llama.cpp, Ollama ni TGI porque no existen pesos; el "servidor" es la API externa.
- **Latencia y throughput**: no disponibles como medida publicada. Cualitativamente, el límite inferior lo fija el intervalo mínimo de captura de 3 segundos y el límite superior la latencia de la API de visión; no hay datos de sesiones reales.
- **Red**: un JPEG por captura, más el texto de respuesta. El coste por token de imagen crece de forma proporcional a la frecuencia de captura elegida.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `swordenamine/TahkiGPT` (شاشتي تحكي) | Aplicación web de un archivo que envuelve la API de Claude Sonnet Vision | No disponible (sin pesos) | No disponible (depende del modelo remoto) | Darja, árabe estándar, francés, mezcla | MIT según model card; campo de licencia de HF vacío | Repositorio público con 0 descargas y 0 likes |
| `scavin/screen-commentator` (original de Cheng Xiaohua) | Proyecto multifichero con npm/Node.js, comentarista de pantalla | No disponible | No disponible | Chino | No disponible en la información proporcionada | Repositorio público en GitHub; se cita como inspiración |
| Claude Sonnet (API de Anthropic) | Modelo multimodal propietario, acceso por API | No disponible | No disponible | No disponible | Propietaria, servicio de pago | Comercial, requiere clave de API |

La comparación relevante no es de parámetros ni de benchmarks, sino de arquitectura de producto: el original es un proyecto Node multifichero en chino con una sola personalidad y sin voz; `TahkiGPT` es un HTML único con cinco personajes, cuatro modos de dialecto y salida TTS, a costa de una dependencia total de la API y de la ausencia de cualquier artefacto de modelo reutilizable.

## Limitaciones y advertencias

- **No es un modelo descargable.** No hay pesos, tokenizador, configuración ni ONNX; no puede ejecutarse en local, ni evaluarse con arneses estándar, ni compararse por parámetros o contexto.
- **Dependencia total de un servicio propietario.** Sin clave de API de Anthropic y sin acceso a `claude-sonnet-4-*` la aplicación no funciona; cambios de precio, de versión o de política de uso del proveedor afectan directamente al comportamiento.
- **Riesgo de alucinación visual.** El comentario lo genera un LLM de visión a partir de un JPEG recomprimido y posiblemente a baja resolución; puede describir mal el contenido, inventar detalles o confundir elementos de la interfaz. No hay verificación posterior ni *grounding* contra el fotograma.
- **Privacidad.** Cada captura envía la pantalla completa a un servicio externo. No hay recorte de región (está en el *roadmap*), ni ofuscación, ni filtro de contenido sensible: correos, mensajes, credenciales o datos de terceros pueden salir del equipo. Inadecuado en entornos con requisitos de confidencialidad sin controles adicionales.
- **Estereotipos culturales y regionales.** Los personajes se apoyan en arquetipos marcados (anciano de la Casbah, joven de Belouizdad, cabilio de Tizi Uzu); el prompt puede producir generalizaciones o caricaturas, y no se documenta ninguna revisión de sesgos.
- **Calidad dialectal no evaluada.** No hay métricas de corrección en darja, ni de naturalidad, ni de consistencia entre el modo "darja pura" y la mezcla real; el.TTS depende de las voces árabes instaladas en el navegador, cuya disponibilidad varía por sistema operativo.
- **Sin control de costes.** Un intervalo de 3 segundos genera del orden de veinte llamadas por minuto, cada una con una imagen; no hay presupuesto, límite de gasto ni caché.
- **Licencia ambigua en los metadatos.** La model card declara MIT, pero el campo de licencia de HuggingFace está vacío; conviene confirmar con el autor antes de un uso comercial. Además, el uso del modelo subyacente se rige por los términos de Anthropic, no por la MIT del código.
- **Metadatos inconsistentes.** Fechas de creación y actualización incoherentes (2026-10-17 frente a 2026-03-14), sin pipeline, sin idiomas, con 0 descargas y 0 likes: el repositorio no ha pasado ninguna revisión de la comunidad.
- **Funcionalidad incompleta.** Exportación de transcripción, constructor de personalidades, modo tamazight en tifinague, recorte de región, compartir clips y soporte móvil figuran como pendientes en el *roadmap*; no deben asumirse como disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/TahkiGPT
- Proyecto original `screen-commentator` de Cheng Xiaohua: https://github.com/scavin/screen-commentator
- Anthropic (proveedor del modelo de visión): https://anthropic.com
- Google Fonts (Cairo y Scheherazade New): https://fonts.google.com
