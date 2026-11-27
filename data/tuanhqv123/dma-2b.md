# tuanhqv123/DMA-2B

## Resumen

DMA-2B (Decision Model for Android, 2B) es un modelo de decisión vision-lenguaje de 1.918 millones de parámetros desarrollado por el usuario tuanhqv123 como un ajuste fino completo del modelo base LiquidAI/d1-2B. Su particularidad es que no genera texto: en lugar de escribir la acción como una secuencia de tokens, responde a preguntas tipadas (qué acción, qué elemento de la pantalla, qué aplicación, qué dirección de desplazamiento, qué cadena escribir) y devuelve una probabilidad para cada opción. De este modo, cada acción decodificada es válida por construcción y no requiere ningún paso de parseo posterior.

El modelo está orientado específicamente al control de interfaces gráficas en Android. Dado un pantallazo y el historial de acciones del usuario, predice la siguiente acción en una única pasada hacia delante, sin generar ni un solo token. Según el autor, la latencia mediana es de 123 ms en una RTX 4090 dedicada (144 ms en el percentil 95) y de 255 ms cuando la GPU está ocupada con otro trabajo, lo que lo hace adecuado para agentes móviles que necesitan decidir en tiempo real.

Es relevante ahora porque los agentes de GUI generativos habituales (UI-TARS, InfiGUI-R1, GUI-Owl, etc.) requieren generar texto y parsearlo, con el coste y la fragilidad que ello implica. DMA-2B demuestra que un modelo de 2B puede igualar o superar a modelos de 7B-9B en la tarea de selección de acción sobre AndroidControl, con la ventaja adicional de proporcionar una probabilidad calibrada por decisión que permite abstenerse cuando la confianza es baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (familia lfm3_vl, derivada de LiquidAI/d1-2B) con cabeza de decisión tipada |
| Parametros totales | 1.918.181.888 (1,92B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

DMA-2B es un ajuste fino completo del modelo LiquidAI/d1-2B, un modelo de decisión vision-lenguaje de 1,92B parámetros que, en lugar de generar texto, formula preguntas tipadas y devuelve una distribución de probabilidad sobre un conjunto cerrado de opciones. La arquitectura subyacente pertenece a la familia lfm3_vl de LiquidAI, con pipeline image-text-to-text y soporte de feature-extraction. El modelo conserva la capacidad de visión para procesar capturas de pantalla y el historial de acciones, pero sustituye la generación autoregresiva por una selección single-pass sobre opciones predefinidas (tipo de acción, elemento de la pantalla, aplicación, dirección de scroll, span de texto a escribir).

El entrenamiento se realizó mediante ajuste fino completo sobre el modelo base, con tres semillas de entrenamiento independientes (seed 0, seed 1 y seed 2), de las cuales la seed 0 es la publicada en la rama principal y las otras dos en las ramas `seed1` y `seed2` del repositorio. Los resultados entre semillas varían menos de un punto porcentual (AndroidControl-Low 90,7 ± 0,2%, High 74,0 ± 0,4%). El autor publica todas las predicciones, puntuaciones y logs de entrenamiento en el dataset DMA-2B-results. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal es el enfoque de decisión single-pass con calibración: en lugar de generar tokens y parsearlos, el modelo responde a preguntas tipadas y devuelve una probabilidad por opción. Esto elimina los errores de parseo (toda acción decodificada es válida), reduce la latencia al no haber generación autoregresiva y permite umbralizar la confianza para abstenerse en los pasos de baja certeza. Según el autor, en AndroidControl-High, actuando solo cuando la probabilidad de la acción supera un umbral elegido sobre episodios de validación, se mantiene una tasa de error del 19% actuando en el 80% de los pasos.

## Capacidades

- Selección de la siguiente acción en pantallas de Android en una única pasada hacia delante, sin generación de tokens.
- Predicción tipada de: tipo de acción, elemento de la pantalla sobre el que actuar, aplicación objetivo, dirección de desplazamiento y span de texto a escribir.
- Grounding visual sobre capturas de pantalla (identificación de elementos de la interfaz).
- Procesamiento de historial de acciones previas del usuario para desambiguar el contexto.
- Salida de probabilidad calibrada por decisión, que permite umbralizar y abstenerse.
- Soporte de instrucciones de bajo nivel ("pulsa en la barra de búsqueda") y de alto nivel ("encuentra la nota hello y compártela").
- Capacidad de feature-extraction (según los tags del modelo).
- No soporta tool calling ni function calling de propósito general: su salida es una selección sobre opciones predefinidas, no texto libre.
- No soporta agentes multi-step de propósito general fuera del bucle de decisión de GUI.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Agentes móviles de automatización de tareas en Android: el modelo decide la siguiente acción (pulsar, escribir, desplazar) sobre la pantalla actual en una sola pasada, con latencia de ~123 ms en RTX 4090, lo que permite bucles de interacción fluida en dispositivos reales o emulados.
- Testing automatizado de aplicaciones Android: dado un objetivo de alto nivel ("crea una nota y compártela"), el modelo predice los pasos sobre la interfaz real, útil para generar pruebas de extremo a extremo sin escribir scripts manuales.
- Asistencia a usuarios con discapacidad motriz: traducción de objetivos en lenguaje natural a acciones concretas sobre la pantalla, con la ventaja de que cada acción es válida por construcción (sin errores de parseo).
- Sistemas de atención al cliente basados en GUI: automatización de flujos dentro de aplicaciones móviles de soporte, donde el modelo selecciona el elemento correcto en pantallas cambiantes.
- Investigación en agentes de GUI: el modelo sirve como baseline de decisión single-pass frente a agentes generativos, y su probabilidad calibrada permite estudiar estrategias de abstención y derivación a un humano.
- Despliegue en entornos con GPU limitada: al ser un modelo de 2B que no genera tokens, puede servirse en una única GPU consumer con latencia baja, adecuado para prototipos y demos en tiempo real.
- Automatización de tareas repetitivas en apps móviles corporativas: rellenado de formularios, navegación entre pantallas y ejecución de flujos internos, aprovechando el grounding visual sobre capturas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre AndroidControl test (8.444 pasos), con el scorer de InfiGUI-R1 y en el espacio de acciones propio de AndroidControl (sin acción "done"):

| Modelo | Tamaño | Genera texto | AC-Low SR | AC-High SR |
|---|---|---|---|---|
| Qwen2.5-VL-7B, zero-shot (reportado) | 7B | sí | 62,5 | 47,1 |
| UI-TARS-2B (reportado) | 2B | sí | 89,3 | 68,9 |
| MAI-UI-2B (reportado) | 2B | sí | – | 67,3 |
| InfiGUI-R1-3B (reportado) | 3B | sí | 92,1 | 71,1 |
| GUI-SAGE-3B (reportado) | 3B | sí | 93,4 | 75,4 |
| AgentCPM-GUI-8B (reportado) | 8B | sí | 90,2 | 69,2 |
| OS-Atlas-7B (reportado) | 7B | sí | 85,2 | 71,2 |
| UI-TARS-7B (reportado) | 7B | sí | 90,8 | 72,5 |
| GUI-Owl-7B (reportado) | 7B | sí | – | 72,8 |
| MobileRL-9B (reportado) | 9B | sí | 94,3 | 73,9 |
| UI-Genie-7B (reportado) | 7B | sí | 94,3 | 74,5 |
| UI-Venus-Navi-7B (reportado) | 7B | sí | 92,4 | 76,1 |
| GUI-SAGE-7B (reportado) | 7B | sí | 93,7 | 76,8 |
| UI-Genie-72B (reportado) | 72B | sí | 94,8 | 77,0 |
| d1-2B (base, sin ajuste) | 2B | no | 59,8 | 40,2 |
| **DMA-2B** | **2B** | **no** | **90,5** | **74,2** |

Desglose por tipo de acción y grounding (base / DMA-2B):

| Split | Tipo | Grounding | SR | Episodios totalmente correctos |
|---|---|---|---|---|
| AC-Low | 80,0 / 96,8 | 76,9 / 91,2 | 59,8 / 90,5 | 18,8 / 63,8 |
| AC-High | 63,6 / 87,0 | 63,1 / 80,4 | 40,2 / 74,2 | 9,4 / 30,6 |

AndroidControl-Curated (re-scoring con grounding basado en cajas; DMA-2B re-ejecutado solo en las 527 tareas reescritas):

| Modelo | Easy SR | Hard (Box) SR | Hard SR |
|---|---|---|---|
| GUI-R1-7B (reportado) | 72,7 | 53,2 | 57,5 |
| InfiGUI-R1-3B (reportado) | 87,2 | 67,6 | 70,7 |
| Qwen3-VL-30B (reportado) | 70,5 | – | 70,0 |
| Qwen3-VL-235B (reportado) | 74,5 | 71,7 | 76,5 |
| Magma-R1 (reportado) | 88,0 | 69,1 | 75,3 |
| **DMA-2B** | **89,7** | **73,6** | **77,0** |

Según el autor, en AC-High es el mejor modelo de 2B reportado y supera a varios agentes generativos de 7B-9B; en AC-Low está a la altura de UI-TARS-7B. Las comparaciones entre papers son aproximadas porque los prompts, espacios de acción y scorers difieren.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,92B parámetros en safetensors, el peso en FP16 ronda los 3,8 GB, por lo que en FP16 cabría en GPUs con 8 GB o más (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: RTX 4090 (el autor reporta 123 ms de mediana y 144 ms en el percentil 95 por decisión, batch 1, servido por HTTP sobre 500 pasos de AndroidControl-High); 255 ms cuando la GPU está ocupada con otro trabajo.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 y GPUs con VRAM suficiente para FP16 (estimación no confirmada).
- Opciones de despliegue: transformers con `custom_code` (la librería indicada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 123 ms de mediana por decisión en RTX 4090 dedicada; 144 ms en p95; 255 ms con GPU compartida. No se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Genera texto | Contexto | AC-Low SR | AC-High SR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DMA-2B | 1,92B | no | no disponible | 90,5 | 74,2 | lfm1.0 | Hugging Face (tuanhqv123/DMA-2B) |
| UI-TARS-2B | 2B | sí | no disponible | 89,3 | 68,9 | no disponible | no disponible |
| MAI-UI-2B | 2B | sí | no disponible | – | 67,3 | no disponible | no disponible |
| InfiGUI-R1-3B | 3B | sí | no disponible | 92,1 | 71,1 | no disponible | no disponible |
| UI-TARS-7B | 7B | sí | no disponible | 90,8 | 72,5 | no disponible | no disponible |

DMA-2B destaca frente a UI-TARS-2B y MAI-UI-2B por su mayor SR en AC-High sin generar texto, y frente a UI-TARS-7B por igualar su AC-Low con un tercio de los parámetros. InfiGUI-R1-3B obtiene mejor AC-Low pero peor AC-High. Las cifras de los competidores son reportadas por sus autores y no verificadas de forma independiente.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo etiqueta explícitamente como research model, con una sola semilla publicada en la rama principal (las otras dos en ramas separadas).
- Resultados no verificados de forma independiente (`verified: false` en el model-index); las comparaciones con otros papers son aproximadas por diferencias de prompts, espacios de acción y scorers.
- Espacio de acciones restringido: el modelo solo puede elegir entre opciones predefinidas; no puede generar texto libre ni acciones fuera de ese conjunto, lo que limita su uso general.
- Idioma: solo inglés; no se reporta soporte multilingüe.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al entrenarse sobre AndroidControl, puede heredar los sesgos de las apps y usuarios de ese dataset.
- Riesgo de alucinación: mitigado por el diseño de selección tipada (toda acción es válida), pero persiste el riesgo de seleccionar una acción incorrecta o un elemento equivocado, especialmente en pasos de baja confianza.
- Licencia lfm1.0 (license: other): es necesario revisar los términos del archivo LICENSE del repositorio antes de cualquier uso comercial; no se detallan restricciones en la información disponible.
- Requiere `custom_code` y la librería transformers; no se documentan integraciones con runtimes de inferencia habituales.
- Longitud de contexto no disponible: no se puede evaluar su comportamiento en historiales largos.
- Sin soporte de tool calling ni de agentes multi-step de propósito general fuera del bucle de decisión de GUI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuanhqv123/DMA-2B
- Rama seed1: https://huggingface.co/tuanhqv123/DMA-2B/tree/seed1
- Rama seed2: https://huggingface.co/tuanhqv123/DMA-2B/tree/seed2
- Dataset de resultados: https://huggingface.co/datasets/tuanhqv123/DMA-2B-results
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Paper AndroidControl (arXiv 2406.03679): https://arxiv.org/abs/2406.03679
- Paper AndroidControl-Curated (arXiv 2510.18488): https://arxiv.org/abs/2510.18488
- Paper InfiGUI-R1 (arXiv 2504.14239): https://arxiv.org/abs/2504.14239
- Paper GUI-R1 (arXiv 2504.10458): https://arxiv.org/abs/2504.10458
- Paper MobileRL (arXiv 2509.18119): https://arxiv.org/abs/2509.18119
- Paper MAI-UI (arXiv 2512.22047): https://arxiv.org/abs/2512.22047
- Paper AgentCPM-GUI (arXiv 2506.01391): https://arxiv.org/abs/2506.01391
- Paper OS-Atlas (arXiv 2410.23218): https://arxiv.org/abs/2410.23218
- Paper GUI-Owl (arXiv 2508.15144): https://arxiv.org/abs/2508.15144
- Paper UI-Venus (arXiv 2508.10833): https://arxiv.org/abs/2508.10833
