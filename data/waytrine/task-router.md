# Waytrine/task-router

## Resumen

Task Router v4 es un clasificador de 322 millones de parámetros desarrollado por Waytrine que resuelve, en un único forward pass, diez preguntas de enrutamiento sobre una petición dirigida a un sistema de agentes de IA: qué tipo de tarea es, qué dificultad tiene, qué herramientas necesita y quién debería ejecutarla. Está construido sobre el encoder `jhu-clsp/mmBERT-base` (arquitectura ModernBERT, 22 capas, tamaño oculto 768, vocabulario de 256.000 tokens) y afinado desde `convaiinnovations/laya-multilingual` con el framework Laya, añadiendo diez cabezas de clasificación de elección única.

El modelo es relevante porque aborda una pieza concreta y a menudo infravalorada de las arquitecturas multiagente: la decisión de enrutamiento previa a la ejecución. En lugar de delegar esa decisión a un LLM juez (con su coste y latencia), Task Router la convierte en una tarea de clasificación ligera con un límite de 1.024 tokens de entrada. Está desplegado en producción en PugPort, una aplicación de escritorio multiagente, y se publica con licencia Apache 2.0.

La versión publicada (v4) se entrenó exclusivamente con datos sintéticos bilingües (inglés y chino) y reporta un 72,0% de precisión media sobre 30 peticiones reales selladas, frente al 97,8% en el conjunto de test sintético. Los pesos de la versión v5, con datos reales privados y 91,0% en el mismo conjunto sellado, no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (mmBERT-base) con 10 cabezas de clasificación de elección única; modelo de decisión tipado Laya |
| Parametros totales | 321.908.998 (encoder 306.939.648; cabezas de decisión 14.175.744; scorer 592.897; cabeza de acción 198.402) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (límite de entrada del estado de cinco partes) |
| Tipos de cuantizacion | No disponible (pesos almacenados en FP16) |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 (pesos); código del repositorio GitHub bajo MIT |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo parte del encoder `jhu-clsp/mmBERT-base` (ModernBERT, 22 capas, hidden size 768, vocabulario de 256.000 tokens) a través del checkpoint `convaiinnovations/laya-multilingual` (revisión `1720e3e3357cfe1e281542e223f8273b0890ca34`), afinado con el framework Laya en el commit `b9fe351ce81e2d974bca2bf219c1e4030c0a05ea`. Sobre el encoder se montan diez cabezas de clasificación de elección única que responden simultáneamente a las diez preguntas de enrutamiento. La entrada es un "estado" acotado de cinco partes: mensaje, contexto reciente, texto de referencia citado, metadatos de adjuntos (solo tipo, nombre y MIME, nunca contenido) y la lista de ejecutores candidatos. El límite es de 1.024 tokens y las definiciones completas de las etiquetas están en `questions.json` del repositorio.

El entrenamiento usó únicamente datos sintéticos del conjunto bilingüe `pugport-routing-synthetic-v1` (720 filas para v4), escritas por un asistente de IA y revisadas por un segundo agente; no se emplearon peticiones reales de usuarios. Se optimizó con entropía cruzada suave, 4 épocas, batch 8 con acumulación de gradiente 2, learning rate de 2,5e-5 para el encoder y 1e-4 para las cabezas, weight decay 0,01, gradient clipping 1,0 y precisión mixta bf16, sin congelar el encoder. La calibración se realizó a posteriori con temperature scaling (T = 3,51) ajustado sobre un split de calibración separado de 60 filas.

## Capacidades

- Clasificación multi-cabeza de peticiones en un solo forward pass: tipo de tarea (10 clases), dificultad (4 clases), necesidad de herramientas y modalidades.
- Detección de tipo de tarea: conversation, coding, research, writing, translation, data_analysis, media, automation, mixed, unclear.
- Estimación de dificultad: simple, standard, complex, unclear.
- Predicción de necesidades de herramientas: `web_search`, `document_read`, `run_commands`, `browser_use` (cada una con yes/no/unclear).
- Detección de modalidad de entrada: text, image, audio, video, mixed, unclear.
- Predicción de salida multimedia: none, image_create, image_edit, speech, music, video_generate, video_render, mixed, unclear.
- Clasificación de acceso a proyecto: none, read, write, unclear.
- Intención de ejecutor: none, assign, exclude, reassign, mention_only, unclear.
- Soporte bilingüe inglés-chino.
- No genera texto, no razona de forma generativa ni ejecuta herramientas: solo clasifica la petición.

## Casos de uso

- Enrutamiento de peticiones en sistemas multiagente: el modelo decide en una sola pasada qué agente debe atender una solicitud y con qué herramientas, sustituyendo a un LLM juez con menor coste y latencia. Es el uso para el que se diseñó y el que se emplea en producción en PugPort.
- Triaje de dificultad en pipelines de agentes: clasificar si una petición es simple, estándar o compleja permite asignar modelos pequeños a tareas sencillas y modelos grandes a las complejas, reduciendo coste por consulta.
- Detección de necesidad de búsqueda web o lectura de documentos: la cabeza `web_search` y `document_read` permiten activar herramientas de forma condicional en lugar de exponerlas siempre al agente.
- Control de acceso a proyecto: la cabeza `project_access` (none/read/write) permite decidir si una petición requiere permisos de escritura sobre el proyecto antes de ejecutar acciones, como paso previo de una política de autorización.
- Filtrado de modalidad y salida multimedia: identificar si la entrada contiene imagen, audio o vídeo, o si la respuesta esperada requiere generación de imagen, voz o vídeo, para derivar la petición al servicio adecuado.
- Preprocesado en aplicaciones de escritorio con agentes: al ejecutarse en CPU, CUDA o MPS y con un límite de 1.024 tokens, puede correr localmente en el cliente sin depender de una API externa, como hace PugPort.
- Análisis de intención de mención y reasignación: la cabeza `executor_intent` distingue si el usuario menciona a un ejecutor para asignarle la tarea, para excluirlo, para reasignarla o solo de forma referencial.

## Benchmarks y rendimiento

| Evaluación | Precisión media sobre las diez cabezas |
|---|---|
| Modelo base sin afinar, test sintético (60 filas) | 44,0% |
| Task Router v4, test sintético (60 filas) | 97,8% |
| Task Router v4, 30 peticiones reales selladas | 72,0% |
| Task Router v5 (no publicado), mismas 30 peticiones reales | 91,0% |

El propio autor advierte que el 97,8% es una cifra de regresión porque el test sintético se reutilizó entre rondas, y que la medida más honesta es el 72,0% sobre peticiones reales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparación extremo a extremo con un LLM juez o con el router basado en reglas de PugPort.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 321,9 millones de parámetros en FP16 el peso ronda los 0,64 GB (el repositorio ocupa 0,7 GB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el servicio admite `TASK_ROUTER_DEVICE` con valores `cpu`, `cuda` o `mps`.
- Cabe en GPU consumer: sí, por tamaño (menos de 1 GB en FP16); no se detallan modelos concretos.
- Opciones de despliegue: servicio de inferencia propio del repositorio GitHub (`service/app.py`) con endpoint `POST /v1/judge` y descripción OpenAPI; carga mediante el framework Laya. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Task Router v4 (Waytrine) | 321,9 M | 1.024 tokens | Clasificación multi-cabeza de enrutamiento | Apache 2.0 | Pesos publicados en HF |
| Task Router v5 (Waytrine) | No disponible | No disponible | Igual, con datos reales | No disponible | Pesos no publicados (datos privados) |
| Modelo base `convaiinnovations/laya-multilingual` | No disponible | No disponible | Modelo de decisión Laya | Apache 2.0 | Público en HF |
| Encoder `jhu-clsp/mmBERT-base` | No disponible | No disponible | Encoder multilingüe | MIT | Público en HF |

No se dispone de comparación con routers basados en LLM juez ni con alternativas de clasificación de enrutamiento en la información proporcionada.

## Limitaciones y advertencias

- La evaluación con tráfico real es muy pequeña: 30 ítems sellados, donde un solo ítem mueve una cabeza 3,3 puntos; 26 de los 30 son peticiones de código y ninguna solicita salida multimedia, por lo que la cobertura por tipo de tarea es muy desigual.
- Brecha sintético-real: v4 subestima la dificultad de trabajo de código real largo que requiere acceso de escritura al proyecto y ejecución de comandos.
- La confianza no es una salvaguarda: las confidencias sin calibrar se mantienen altas incluso en respuestas incorrectas; la calibración con temperature scaling (T = 3,51) se ajustó sobre solo 60 filas.
- El modelo clasifica una petición; no autoriza herramientas, escrituras de ficheros ni gasto. Cualquier decisión de permisos debe implementarse aparte.
- Solo soporta inglés y chino; no hay soporte declarado de castellano.
- Entrenado exclusivamente con datos sintéticos, con el riesgo de sesgos y artefactos propios del generador y revisor automáticos.
- El límite de 1.024 tokens puede truncar peticiones largas o contextos extensos.
- No se ha comparado extremo a extremo con un LLM juez ni con el router basado en reglas de PugPort, por lo que no hay evidencia de que sea mejor que alternativas más simples.
- Los pesos son un derivado afinado de `convaiinnovations/laya-multilingual` (Apache 2.0), cuyo encoder es `jhu-clsp/mmBERT-base` (MIT); es un proyecto independiente de Waytrine, no un fork de Laya ni un producto oficial de Convai Innovations.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Waytrine/task-router
- Repositorio GitHub (código, datos y evaluación): https://github.com/Waytrine/task-router
- Caso de estudio: https://wyt.si/task-router/
- Referencia de la API: https://wyt.si/task-router/api/
- Datos de entrenamiento: https://github.com/Waytrine/task-router/tree/main/data
- Scripts de evaluación: https://github.com/Waytrine/task-router/tree/main/eval
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Encoder base: https://huggingface.co/jhu-clsp/mmBERT-base
- Framework Laya: https://github.com/NandhaKishorM/laya
- PugPort: https://pugport.com
- Waytrine: https://wyt.si
