# StrandsAgents/strands-decider-E4B-gemma4-v2-2611

## Resumen

Strands Decider E4B es un modelo de decisión especializado, derivado mediante fine-tuning de `google/gemma-4-E4B-it`. Lo desarrolla el equipo Strands Decider dentro de Strands Labs. A diferencia de un LLM generativo, no produce texto libre: recibe un *estado* (texto o JSON, opcionalmente con imágenes) y una o varias preguntas tipadas —`choice` (entre 2 y 255 opciones), `noul` (sí/no) y `score` (escala ordenada de 2 a 10 niveles)— y devuelve en una sola pasada una distribución de probabilidad sobre cada opción, junto con una confianza calibrada.

El modelo resuelve el problema de la toma de decisiones estructurada dentro de sistemas agénticos: en lugar de pedir a un LLM que "elija" mediante generación de texto (con el coste de latencia, no determinismo y calibración pobre que ello implica), este modelo clasifica directamente. Las preguntas y opciones viajan en la petición, de modo que un mismo checkpoint responde a decisiones nuevas sin reentrenamiento.

Esta versión v2 (noviembre de 2026) sustituye a la v1 sobre la misma base y declara 63,2 en el Decision Index 0.3, 24,6 puntos por encima de la v1 E4B, con una brecha media de 2,8 puntos entre confianza y precisión. Con 7.996.156.490 parámetros reales en safetensors (4,5B efectivos, 8B con embeddings), 32.768 tokens de contexto validado y licencia Apache-2.0, se posiciona como la opción intermedia de una familia de cinco modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) fine-tuneado para clasificación de decisiones; sin generación de texto |
| Parametros totales | 7.996.156.490 (4,5B efectivos; 8B contando embeddings) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 32.768 tokens validados (límite por defecto); hasta 131.072 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | google/gemma-4-E4B-it |
| Tipo de pipeline | text-classification |
| Tipos de decisión | choice (2-255 opciones), noul (sí/no), score (2-10 niveles) |
| Entradas | Estado en texto o JSON, con imágenes opcionales, y N preguntas tipadas |
| Tamano del repo | 32,0 GB (16 GB de pesos en bf16) |
| Libreria | strands-decider |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer de la familia Gemma 4 con 4,5B parámetros efectivos (8B incluyendo embeddings), y se somete a un fine-tuning orientado a decisión en lugar de a generación. La cabeza funcional no emite tokens: en una única pasada forward calcula una probabilidad por cada opción de cada pregunta incluida en la petición. Esto elimina la decodificación autoregresiva y explica la latencia declarada de 78 ms para una pregunta y 138 ms para 30 preguntas sobre un mismo estado en una NVIDIA H100.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esa información figura como no disponible. Sí se declara explícitamente el objetivo de calibración: la salida incorpora una confianza cuya desviación media respecto a la precisión es de 2,8 puntos, lo que permite umbralizar decisiones en producción (por ejemplo, derivar a revisión humana cuando la confianza cae por debajo de un valor). Las preguntas y opciones se definen en tiempo de inferencia, por lo que el modelo generaliza a decisiones no vistas durante el entrenamiento sin ajuste adicional.

## Capacidades

- Clasificación de decisión multi-pregunta en una sola pasada: varias preguntas tipadas sobre un mismo estado, con distribución de probabilidad por opción.
- Preguntas de elección (`choice`) con entre 2 y 255 opciones.
- Preguntas booleanas (`noul`) de sí/no.
- Preguntas de puntuación (`score`) sobre escalas ordenadas de 2 a 10 niveles.
- Confianza calibrada por respuesta, con una brecha media de 2,8 puntos frente a la precisión.
- Acepta estados en texto plano o JSON, con soporte opcional de imágenes como parte del estado.
- Definición dinámica de preguntas y opciones en la petición: no requiere reentrenamiento para decisiones nuevas.
- Integración en pipelines agénticos mediante la librería `strands-decider` y su CLI (`strands-decider ask`).
- Capacidades multilingües: limitadas al inglés según la model card.
- No genera texto libre; no es un modelo de razonamiento conversacional ni de código.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como estado y preguntas `choice` para asignar equipo (facturación, ventas, retail) y `score` para medir frustración del usuario; la confianza calibrada permite enrutar a revisión humana los casos dudosos.
- Moderación y clasificación de contenido: preguntas `noul` encadenadas ("¿conlleva urgencia?", "¿contiene datos personales?") sobre el mismo estado en una sola pasada de 138 ms para 30 preguntas, lo que abarata el filtrado por ítem.
- Enrutamiento en agentes autónomos: el modelo decide qué herramienta o subagente debe manejar una petición (pregunta `choice` con las herramientas disponibles como opciones), sustituyendo la selección por generación de texto por una clasificación determinista y calibrada.
- Priorización de colas de trabajo: puntuar incidencias con preguntas `score` de 2 a 10 niveles (severidad, impacto) y ordenar la cola según la probabilidad asignada a los niveles altos.
- Evaluación de calidad en pipelines de datos: clasificar pares pregunta-respuesta o resúmenes con escalas ordenadas, usando la confianza para descartar automáticamente las evaluaciones poco fiables.
- Control de salida de otros LLM: verificar con preguntas `noul` si una respuesta generada cumple políticas (tono, seguridad, formato) antes de entregarla, aprovechando la latencia baja frente a un segundo LLM juez.
- Extracción de señales estructuradas de documentos JSON: dado un estado en JSON con metadatos de un pedido o una cuenta, responder varias preguntas de decisión en una sola llamada con contexto de hasta 32.768 tokens.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Resultado |
|---|---|---|
| Decision Index 0.3 | text-classification | 63,2 |
| JevBench | text-classification | 88,3 |
| OpenDecisions | text-classification | 83,9 |
| DecisionPivot | text-classification | 45,2 |
| BEV | text-classification | 78,9 |

Datos adicionales declarados: mejora de 24,6 puntos en el Decision Index 0.3 respecto a Strands Decider v1 E4B, brecha media de calibración de 2,8 puntos, latencia de 78 ms para una pregunta y 138 ms para 30 preguntas sobre un mismo estado en una NVIDIA H100. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos en la información disponible, y no serían aplicables dado que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada: 16 GB de pesos en bf16; se recomienda una GPU con 40 GB de memoria para inferencia con contexto completo, según la model card.
- GPU recomendadas: NVIDIA H100 (latencia declarada de 78 ms por pregunta); cualquier GPU con 40 GB o más (A100 40GB, A100 80GB, H100).
- GPU de consumo: no se declara soporte; los 16 GB en bf16 más overhead de activaciones y contexto de 32.768 tokens exceden con holgura las GPU de consumo habituales (RTX 4090 con 24 GB queda por debajo del requisito recomendado de 40 GB).
- Opciones de despliegue: librería `strands-decider` (Python 3.11 o superior) y su CLI; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, coherente con que el modelo no es generativo.
- Almacenamiento: 16 GB de disco para los pesos; el repositorio completo ocupa 32,0 GB.
- Throughput: 30 preguntas sobre un mismo estado en 138 ms en H100, lo que permite reutilizar el coste del forward sobre el estado para muchas decisiones.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos bf16 | Contexto | Licencia | Orientación |
|---|---|---|---|---|---|---|
| strands-decider-E4B-gemma4-v2-2611 (este) | gemma-4-E4B-it | 4,5B efectivos (8B con embeddings) | 16 GB | 32.768 (hasta 131.072) | Apache-2.0 | Una GPU de 40 GB |
| strands-decider-E2B-gemma4-v2-2611 | gemma-4-E2B-it | 2,3B efectivos (5,1B con embeddings) | 10,3 GB | no disponible | Apache-2.0 | GPU de 24 GB o sin GPU |
| strands-decider-12B-gemma4-v2-2611 | gemma-4-12B-it | 11,95B | 24 GB | no disponible | Apache-2.0 | Una GPU de 48 GB |
| strands-decider-26B-A4B-gemma4-v2-2611 | gemma-4-26B-A4B-it | 25,2B, 3,8B activos (128 expertos) | 52 GB | no disponible | Apache-2.0 | GPU de 80 GB, muchas preguntas por estado |
| strands-decider-31B-gemma4-v2-2611 | gemma-4-31B-it | 30,7B | 63 GB | no disponible | Apache-2.0 | Máxima precisión, GPU de 80 GB |

Los cinco modelos v2 aceptan la misma petición y devuelven el mismo tipo de respuesta, por lo que cambiar de tamaño implica solo cambiar el identificador del modelo. No se dispone de datos de benchmarks de los modelos hermanos en la información proporcionada para comparar su precisión relativa.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está validado.
- No es un modelo generativo: no puede usarse para chat, redacción, código ni razonamiento en texto libre.
- Sesgos: no se documentan análisis de sesgo; al derivar de Gemma 4, puede heredar sesgos del modelo base y de los datos de fine-tuning.
- Alucinación: al no generar texto, el riesgo se traslada a clasificaciones erróneas con confianza alta; la calibración declarada (brecha media de 2,8 puntos) es un agregado y no garantiza calibración por dominio.
- Resultados no verificados: los cinco benchmarks del model-index están marcados como no verificados y proceden del propio autor; DecisionPivot (45,2) indica un rendimiento débil en ese conjunto concreto.
- Contexto: 32.768 tokens es el límite validado; el soporte hasta 131.072 no está garantizado.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo base Gemma 4 de Google de los que deriva.
- Madurez: repositorio con 3 descargas y 1 like en el momento de la consulta; ecosistema de despliegue limitado a la librería propia `strands-decider`, sin soporte documentado en servidores de inferencia estándar.
- Preguntas y opciones deben definirse con cuidado: la calidad de la decisión depende de la formulación de las opciones, y no se documentan guías de prompt engineering específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v2-2611
- Versión anterior v1: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v1-2610
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de código: https://github.com/strands-labs/strands-decider
- Documentación: https://strandsagents.com/docs/labs/strands-decider/overview/
- Regla de nombrado: https://github.com/strands-labs/strands-decider/blob/main/docs/naming.md
- Organización en Hugging Face: https://huggingface.co/StrandsAgents
- Strands Labs: https://github.com/strands-labs
