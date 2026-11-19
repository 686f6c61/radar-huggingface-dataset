# vllm-sr/Decision-2.0-Nox-4B

## Resumen

Decision-2.0-Nox-4B es un modelo de decisión estructurada desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo al uso: recibe una entrada (texto o JSON) junto con un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una sola pasada hacia delante, una probabilidad para cada respuesta posible sin generar texto. Está afinado a partir de Qwen/Qwen3.5-4B-Base y cuenta con 4,21 mil millones de parámetros y una ventana de contexto de 16.384 tokens.

El modelo se enmarca en la familia Decision 2.0 y se posiciona como una pieza de enrutamiento y clasificación de baja latencia para sistemas de IA, con una mediana de 12,9 ms por petición de una sola pregunta en una única GPU. Su relevancia actual radica en que sustituye a clasificadores ad hoc y a llamadas a LLM generativos para tareas de decisión repetitivas, ofreciendo salidas calibradas (probabilidades) en lugar de texto libre, lo que facilita su integración en pipelines deterministas.

Frente a su predecesor Decision 1.0 Nox mejora +7,1 puntos en JevArena y +9,4 en el Jev Decision Index, y lidera su categoría de tamaño con 63,6 en JevArena entre cuatro modelos comparables. Se distribuye con licencia Apache-2.0 y pesos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B-Base), con código personalizado (`custom_code`) para la interfaz de decisión |
| Parámetros totales | 4,21B |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | zero-shot-classification / feature-extraction |
| Tamaño del repositorio | 9,7 GB |
| Tipos de decisión | Choice (elección), Yes/No (sí/no), Score (puntuación en escala) |
| Librería | transformers (>= 5.17) |

## Arquitectura y entrenamiento

El modelo parte de la base Qwen/Qwen3.5-4B-Base, un transformer denso de 4,21B parámetros, y se afina como modelo de decisión con una interfaz propietaria expuesta mediante `trust_remote_code`. La innovación principal es la cabeza de decisión `system_one`: en lugar de generar tokens, el modelo procesa el estado de entrada junto con un diccionario de preguntas tipificadas y emite directamente una distribución de probabilidad sobre las opciones de cada pregunta. Todas las preguntas sobre una misma entrada se resuelven en una única pasada hacia delante, lo que explica la baja latencia reportada.

El autor declara que los datos de entrenamiento fueron auditados a nivel de fila contra todos los ítems de test del Jev Decision Index, lo que aporta garantías sobre la ausencia de contaminación en la evaluación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla la naturaleza exacta del código personalizado más allá de la API `system_one` y del pipeline `decision`.

## Capacidades

- Decisión estructurada en tres modalidades: elección entre opciones con criterios descritos, respuesta binaria sí/no y puntuación en una escala ordenada.
- Salida probabilística por cada opción, sin generación de texto, lo que permite umbrales y calibración aguas abajo.
- Resolución de múltiples preguntas heterogéneas sobre una misma entrada en una sola pasada (por ejemplo, ruta, comprobación de un hecho y urgencia simultáneamente).
- Entrada en texto plano o JSON, adecuada para estados estructurados de sistemas y agentes.
- Clasificación zero-shot mediante criterios en lenguaje natural, sin necesidad de reentrenamiento por tarea.
- Extracción de características (tag `feature-extraction`) además de la clasificación.
- Integración como pipeline de transformers (`pipeline("decision", ...)`).
- No disponible: soporte de tool calling, capacidades multimodales (visión o audio), modo de razonamiento extendido y cobertura multilingüe declarada.

## Casos de uso

- Enrutamiento de tickets en atención al cliente: dado el texto de la reclamación, el modelo decide en una sola pasada a qué equipo corresponde (devoluciones, facturación, técnico) y con qué urgencia, usando las modalidades Choice y Score. Su latencia de 12,9 ms permite clasificar en tiempo real dentro del flujo de entrada.
- Enrutamiento semántico de peticiones a modelos en vLLM Semantic Router: el modelo actúa como clasificador previo que decide qué LLM o herramienta debe atender cada consulta, sustituyendo llamadas generativas por una inferencia barata y determinista.
- Moderación y filtrado binario: preguntas de tipo sí/no sobre si una entrada cumple una política concreta (por ejemplo, "¿contiene datos personales?"), con probabilidad asociada para fijar umbrales de revisión humana.
- Triaje de incidencias en soporte técnico: combinación de preguntas de elección (categoría del fallo) y de puntuación (severidad) sobre el mismo estado JSON del ticket, en una única llamada.
- Clasificación de documentos y correos: asignación de etiquetas predefinidas descritas en lenguaje natural mediante la modalidad Choice, sin entrenamiento específico por dominio.
- Validación de estados en agentes: comprobaciones binarias encadenadas (¿se ha cumplido el objetivo?, ¿falta algún dato?) para decidir el siguiente paso de un flujo multi-etapa sin invocar un LLM generativo.
- Priorización de colas de trabajo: puntuación en escala ordenada (rutina, pronto, hoy) sobre descripciones de tareas para ordenar backlog automáticamente.

## Benchmarks y rendimiento

| Modelo | JevArena ↑ | Human-labelled transfer ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| Decision-2.0-Nox-4B | 63,6 | 52,3 | 43,8 |
| Decider 4B | 61,9 | 55,5 | no disponible |
| Jet v6.2 | 60,4 | 53,8 | no disponible |
| Decision 1.0 Nox | 56,5 | 51,9 | 34,4 |

Notas de la evaluación según el autor: todos los modelos responden a los mismos prompts congelados y se puntúan del mismo modo, contando como error las respuestas ausentes o inválidas. La métrica Human-labelled transfer es la macro-F1 mediana sobre 15 tareas etiquetadas por humanos (multiplicada por 100). El Jev Decision Index de Decision 2.0 procede de una reproducción independiente con el kit oficial 0.2.1 sobre los pesos publicados; el resto de valores provienen de una instantánea pública del board del 28 de septiembre de 2026. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos, coherentemente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,7 GB en safetensors; en precisión de 16 bits se requiere aproximadamente 8,5-9 GB de VRAM para los pesos, más memoria para activaciones y contexto. En cuantizaciones de 8 bits cabría en torno a 4,5-5 GB y en 4 bits alrededor de 2,5-3 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegues de alta concurrencia; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en FP16 con contexto completo.
- GPU de consumo: cabe en tarjetas con 12 GB o más en FP16; en cuantización de 8 bits podría ejecutarse en GPUs de 8 GB, si bien no hay pesos cuantizados publicados.
- Opciones de despliegue: transformers >= 5.17 con `trust_remote_code=True`, el pipeline `decision` y, dado el ecosistema del autor (vLLM Semantic Router), integración en despliegues vLLM. No se documentan soportes para llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 12,9 ms por petición de una sola pregunta en una única GPU. El throughput agregado y el comportamiento con lotes grandes no están disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevArena ↑ | Human-labelled transfer ↑ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-2.0-Nox-4B | 4,21B | 16.384 | 63,6 | 52,3 | Apache-2.0 | Hugging Face (transformers) |
| Decider 4B | 4B | no disponible | 61,9 | 55,5 | no disponible | board público |
| Jet v6.2 | no disponible | no disponible | 60,4 | 53,8 | no disponible | board público |
| Decision 1.0 Nox | no disponible | no disponible | 56,5 | 51,9 | no disponible | Hugging Face |

Decision-2.0-Nox-4B lidera en JevArena y en el Jev Decision Index, aunque Decider 4B obtiene mejor transferencia a tareas etiquetadas por humanos (55,5 frente a 52,3). La ventaja del modelo de vLLM Semantic Router es la latencia declarada y la resolución de múltiples preguntas en una sola pasada. No hay datos públicos de parámetros, contexto ni licencia de Decider 4B y Jet v6.2 en la información disponible.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre ni razonamiento explícito; no sirve para tareas de generación, resumen, traducción o diálogo abierto.
- Dependencia de `trust_remote_code=True`: la arquitectura requiere ejecutar código personalizado del autor, lo que implica revisión de seguridad antes de desplegar en producción.
- Idiomas soportados no declarados: no hay garantía documentada de rendimiento fuera del inglés; conviene validar con datos propios antes de usarlo en castellano.
- Riesgo de calibración: las probabilidades de salida no están validadas de forma independiente más allá del kit del autor; los umbrales deben ajustarse con datos del dominio.
- Sesgos: no se documentan evaluaciones de sesgo, equidad o toxicidad; al derivar de Qwen3.5-4B-Base hereda los sesgos del corpus de preentrenamiento, no especificado.
- Contaminación: el autor afirma auditar los datos de entrenamiento contra el test del Jev Decision Index, pero no se detalla la metodología de auditoría.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero no cubre las dependencias de código personalizado ni los términos de la base Qwen.
- Contexto limitado a 16.384 tokens: insuficiente para documentos largos o historiales de conversación extensos sin truncado o segmentación.
- Sin cuantizaciones oficiales publicadas: el despliegue en hardware limitado requiere generar pesos cuantizados por cuenta propia, con posible degradación no medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/Decision-2.0-Nox-4B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
