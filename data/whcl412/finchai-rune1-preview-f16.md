# whcl412/FinchAI-Rune1-Preview-f16

tags, Chinese/English only, hallucination of tool params, licence Apache 2.0 (commercial allowed), etc.

Capacidades: tool calling with XML format, agent judgement, multimodal vision (base supports but LoRA only text backbone), reasoning_content thinking mode, bilingual zh/en, short non-sycophantic answers.

Casos de uso: at least 6 concrete ones.

Careful on headings capitalization: only first word capitalized. "Especificaciones tecnicas" — should I use accents? Spanish of Spain — yes use accents, but headings rule about capitals doesn't prohibit accents. "Especificaciones técnicas". Yes, proper Spanish with accents.

Let me write.

Note: 1.554.476.272 parameters ≈ 1.55B.

Context length: not given. MiniCPM-V 4.7-1B presumably 32k? Not in info — say no disponible.

Let me write the ficha.

For enlaces: HuggingFace, ModelScope (https://modelscope.cn/models/whcl412/FinchAI-Rune1-Preview-f16 — hmm, the model card says ModelScope whcl412/FinchAI-Rune1-Preview-f16; I could give the generic link but constructing may be risky. I'll give it as given: ModelScope: whcl412/FinchAI-Rune1-Preview-f16, and mention the base model link. GitHub: hwc-cell/FinchAI-Rune1-Preview → https://github.com/hwc-cell/FinchAI-Rune1-Preview. Base model https://huggingface.co/openbmb/MiniCPM-V-4.7-1B.

Also note: results of web search did not return relevant links (anime content), so no additional links.

Now write.## Resumen

FinchAI-Rune1-Preview-f16 es un modelo multimodal de tipo image-text-to-text de 1.554.476.272 parámetros (aproximadamente 1,55B) desarrollado por el usuario whcl412 dentro de la serie FinchAI. Se construye mediante ajuste fino con LoRA sobre el modelo base openbmb/MiniCPM-V-4.7-1B de OpenBMB, y su objetivo declarado no es el rendimiento generalista, sino la "capacidad de juicio" en la invocación de herramientas: decidir si hay que llamar a una función, cuál de las disponibles elegir, si los parámetros obligatorios están completos y cómo recuperarse de un error de llamada.

El problema que aborda es concreto: los modelos pequeños de tool calling tienden a invocar herramientas de forma indiscriminada o a copiar literalmente nombres vistos en entrenamiento. Rune1-Preview se entrena con datos programáticamente sintéticos generados en "sandboxes" con espacios de nombres aislados, lo que permite medir la fuga de datos con un conjunto de retención estructuralmente imposible de generar durante el entrenamiento. El autor reporta una mejora de 21/27 a 27/27 en su batería interna de 27 sondas tras el ajuste.

Es relevante ahora porque se publica como una versión Preview bajo licencia Apache 2.0, en formato bfloat16 completo (2,9 GB), pensada para ejecutarse en local y actuar como "cerebro de selección de herramientas" en agentes pequeños. No se publican versiones GGUF ni MLX 4bit, y la validación completa se ha hecho exclusivamente sobre Apple Silicon con MPS, no en CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | minicpmv4_7 (clase `MiniCPMV4_7ForConditionalGeneration`); transformer multimodal con torre de visión, ajustado con LoRA sobre el backbone de texto |
| Parametros totales | 1.554.476.272 (aprox. 1,55B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el modelo base; el entrenamiento del LoRA usó secuencias de hasta 950 tokens |
| Tipos de cuantizacion | no disponible en este repositorio; solo se publican pesos bfloat16 ("f16"). La model card indica que el modelo admite cuantización posterior y que la conversión a GGUF está verificada como viable en llama.cpp |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (bfloat16), 2,9 GB; repositorio total de 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base MiniCPM-V 4.7-1B de OpenBMB, un transformer multimodal con torre de visión que acepta entrada de imagen y texto (pipeline `image-text-to-text`). Sobre esa base se aplica un ajuste fino con LoRA usando transformers, PEFT y el backend MPS de Apple Silicon. Los pesos publicados son el resultado de la fusión del adaptador en el backbone, en bfloat16, con un total de 1,55B de parámetros. La carga se realiza mediante `AutoModelForImageTextToText` con transformers >= 5.18.0.

El entrenamiento se basa en 600 muestras sintéticas generadas programáticamente por sandboxes, sin uso de datos reales de usuarios. Cada muestra contiene nombres de herramientas, esquemas de parámetros, estilos de rutas y mensajes de error propios, de modo que resolver la tarea exige leer la definición de la herramienta en lugar de memorizar identificadores. La distribución de subtipos de agente es: `single` (llamada estándar en dos pasos) 25 %, `recover` (fallo, lectura del error y reintento corregido) 20 %, `disambig` (selección semántica entre dos herramientas parecidas) 20 %, `no_tool` (pregunta que no requiere herramienta) 20 % y `ask_back`/`ask_direct` (repreguntar por parámetros faltantes frente a invocar directamente cuando ya están dados) 15 %. No se menciona uso de RLHF ni DPO; el método es supervisión sobre datos sintéticos con LoRA.

El aspecto técnico más destacable es el esquema de "siete capas" antileakage: aislamiento físico de espacios de nombres, bloqueo por excepción en el generador para el sandbox de retención, presupuesto de tokens tras el renderizado, auditoría de texto tras el renderizado, prohibición de identificadores de sandbox en muestras no-agent, y la restricción de que todo nombre de parámetro debe pertenecer a la definición de su herramienta. La estrategia antiforgotten en entrenamiento incremental consiste en mantener la proporción completa de las seis categorías, reducir a la mitad la tasa de aprendizaje y entrenar solo 0,5 épocas. La salida de las llamadas a herramienta usa un formato XML con etiquetas `<tool_call>`, `<function=...>` y `<parameter=...>`.

## Capacidades

- Generación de texto conversacional breve y en chino e inglés, con respuesta directa cuando no procede usar herramientas.
- Tool calling y function calling: emite llamadas en formato XML estructurado siguiendo el esquema JSON declarado en la plantilla de chat.
- Juicio de invocación: decide no llamar cuando la pregunta no requiere herramienta y repregunta cuando faltan parámetros obligatorios en lugar de inventarlos.
- Selección semántica entre herramientas de función parecida (por ejemplo, listar directorio frente a buscar contenido en ficheros).
- Recuperación de errores: interpreta el mensaje de error devuelto por la herramienta y reintenta con parámetros corregidos.
- Generalización a herramientas no vistas: según el autor, resuelve correctamente 6/6 sondas sobre un sandbox de retención cuyos nombres, rutas y esquemas nunca aparecieron en entrenamiento.
- Modo de razonamiento: el contenido de pensamiento se expone en el campo `reasoning_content`, separado de `content`.
- Capacidad multimodal heredada del modelo base MiniCPM-V 4.7-1B (entrada de imagen), si bien el LoRA de esta versión solo se entrenó sobre el tronco de texto, por lo que la visión no está reforzada.

## Casos de uso

- Enrutador de herramientas en agentes locales: el modelo actúa como "cerebro de selección" que recibe la lista de funciones disponibles y decide cuál invocar y con qué argumentos, dejando la ejecución real al host. Es adecuado por su tamaño (1,55B) y por su entrenamiento específico en desambiguación entre herramientas similares.
- Asistentes de escritorio con acceso a ficheros: integrarlo en un agente que opera sobre rutas locales del usuario; el modelo repregunta la ruta cuando no se ha especificado, en lugar de adivinar y ejecutar sobre un directorio arbitrario.
- Automatización de soporte técnico con repreguntas: gestionar conversaciones en las que faltan datos del cliente, forzando una pregunta aclaratoria antes de lanzar la acción, lo que evita ejecuciones destructivas con parámetros por defecto.
- Pipelines de agentes con recuperación de errores: en flujos donde las llamadas a API pueden fallar, el subtipo `recover` permite leer el código de error y reintentar con el esquema corregido, reduciendo la necesidad de lógica de reintento codificada a mano.
- Preprocesado y clasificación de peticiones en un sistema mayor: usado como primera etapa que determina si una consulta requiere herramienta, permite filtrar y enrutar consultas antes de invocar un modelo mayor, reduciendo coste por petición.
- Prototipado e investigación sobre generalización de tool calling: el conjunto de retención y el generador de datos sintéticos publicados en el repositorio de GitHub permiten reproducir experimentos de fuga de datos y evaluar generalización a esquemas nuevos.
- Despliegue en hardware de consumo para demos offline: con 2,9 GB de pesos puede ejecutarse íntegramente en un portátil con 16 GB de memoria unificada, sin dependencia de API externa ni conexión de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor aporta únicamente una batería interna de aceptación de 27 sondas comparando el modelo ajustado (con adaptador) frente al modelo base con el adaptador desactivado:

| Grupo de sondas | Ajustado | Base |
|---|---|---|
| Juicio (¿debe llamar?, ¿debe repreguntar?, ¿cuál elegir?) | 9/9 | 3/9 |
| Identidad | 3/3 | 0/3 |
| Sandbox de retención (herramientas nunca vistas) | 6/6 | 6/6 |
| Sandbox entrenado | 6/6 | 6/6 |
| General (preguntas, código, rechazo) | 3/3 | 3/3 |
| Total | 27/27 | 21/27 |

Datos de ejecución medidos por el autor (MacBook Pro M4, 16 GB, backend MPS):

| Métrica | Valor |
|---|---|
| Volumen de pesos | 2,9 GB (bfloat16) |
| Memoria residente tras cargar | ~3,1 GB |
| Pico de memoria en entrenamiento e inferencia | ~6,5 GB |
| Velocidad de entrenamiento | 2,2 a 3,5 s por muestra (secuencias de hasta 950 tokens) |

Estos datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3,1 GB de memoria residente según la medición del autor, más el espacio de activaciones y caché KV, que depende de la longitud de secuencia.
- GPU recomendadas: no hay datos publicados para CUDA. El autor no ha validado el modelo en CUDA ni en GPU de centro de datos (A100, H100) ni en RTX 4090.
- Hardware validado: Apple Silicon con backend MPS, probado en un MacBook Pro M4 con 16 GB de memoria unificada. La carga, el ajuste fino y la fusión de pesos se verificaron únicamente en MPS.
- GPU de consumo: por tamaño de pesos, cabe con holgura en cualquier GPU con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, entre otras), aunque sin validación publicada en esas plataformas.
- Opciones de despliegue: transformers >= 5.18.0 con `AutoModelForImageTextToText` y `AutoProcessor` es la vía soportada. La conversión a GGUF es viable (llama.cpp soporta `MiniCPMV4_7ForConditionalGeneration` desde el 17 de octubre de 2026), pero el autor no publica el GGUF porque el resultado perdería la torre de visión. No hay versión para Ollama ni llama.cpp publicada. No hay soporte en `mlx_lm`, ni siquiera en la rama main, por lo que los usuarios de Apple Silicon deben usar transformers sobre MPS.
- Latencia y throughput: no disponibles. Solo se informa de 2,2 a 3,5 segundos por muestra en fase de entrenamiento, dato no extrapolable a inferencia.

## Comparativa con modelos similares

La información disponible solo permite comparar de forma fiable con el modelo base del que deriva. No se han proporcionado datos de benchmarks ni especificaciones de alternativas equivalentes en la misma categoría de tool calling para modelos pequeños.

| Modelo | Parametros | Contexto | Tool calling | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FinchAI-Rune1-Preview-f16 | 1,554B | no disponible (entrenamiento ≤950 tokens) | Sí, con juicio de invocación entrenado específicamente | Heredada del base, sin reforzar por el LoRA | Apache 2.0 | HuggingFace y ModelScope; sin GGUF ni MLX |
| openbmb/MiniCPM-V-4.7-1B (base) | 1B (según nomenclatura del autor) | no disponible | Sí, pero sin el entrenamiento de juicio (3/9 en el grupo de sondas de juicio) | Sí | Apache 2.0 | HuggingFace |
| Otras alternativas de tool calling de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo en estado Preview: el propio autor indica que el juicio está validado (9/9), pero la generalización de estructuras de frase y los escenarios de rechazo siguen en desarrollo.
- Datos de entrenamiento íntegramente sintéticos (600 muestras), sin datos reales de usuarios. El autor recomienda autoevaluar antes de usar en producción.
- Capacidad limitada por el tamaño: razonamiento de múltiples pasos y diseño de algoritmos quedan fuera del alcance esperado de un modelo de 1,55B.
- Comprensión de documentos largos limitada: el entrenamiento usó secuencias de hasta 950 tokens, muy por debajo de ventanas de contexto habituales en modelos actuales.
- La visión no está reforzada: aunque el modelo base acepta imágenes, esta versión del LoRA se entrenó solo sobre el tronco de texto, por lo que el rendimiento en tareas visuales no está garantizado ni evaluado.
- Etiquetas residuales: la model card advierte de la aparición ocasional de etiquetas `</think>` sueltas en la salida; el sistema anfitrión debería filtrarlas.
- Trazas de razonamiento poco naturales: el autor reconoce que el texto de pensamiento muestra artefactos de plantilla, incluida mezcla de chino e inglés.
- Riesgo de alucinación de parámetros: aunque el entrenamiento penaliza inventar argumentos faltantes, se trata de un comportamiento estadístico, no de una garantía; conviene validar los parámetros de las herramientas antes de ejecutar acciones con efectos secundarios.
- Idiomas: solo chino e inglés. No hay soporte declarado para castellano ni otras lenguas.
- Sin validación en CUDA: no se ha probado el modelo en GPU NVIDIA, por lo que el comportamiento en esos entornos es desconocido.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ, GPTQ ni MLX 4bit en el repositorio; desplegar en entornos de bajos recursos exige convertir los pesos por cuenta propia.
- Licencia Apache 2.0, heredada del modelo base, que permite uso comercial sin restricciones adicionales de licencia, aunque el autor no ofrece garantías sobre el modelo.
- Cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whcl412/FinchAI-Rune1-Preview-f16
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio en ModelScope (referenciado en la model card): whcl412/FinchAI-Rune1-Preview-f16
- Repositorio de código en GitHub (scripts de entrenamiento, generador de datos, scripts de evaluación y adaptador LoRA): https://github.com/hwc-cell/FinchAI-Rune1-Preview
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las únicas URLs devueltas corresponden a contenidos sin relación con inteligencia artificial (páginas de un anime, galerías de arte y fondos de pantalla) y se descartan por no ser fuentes válidas sobre este modelo.
