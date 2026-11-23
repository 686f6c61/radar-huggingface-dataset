# StrandsAgents/strands-decider-12B-gemma4-v2-2611

## Resumen

Strands Decider 12B (gemma4-v2-2611) es un modelo de decisión especializado, desarrollado por el equipo Strands Decider dentro de Strands Labs. No es un modelo generativo al uso: parte de `google/gemma-4-12B-it` (11.959.730.224 parámetros) y se ha reajustado para recibir un estado (texto o JSON, con imágenes opcionales) junto con una o varias preguntas tipadas, y devolver en una sola pasada una probabilidad calibrada por cada opción, sin generar texto libre.

Resuelve un problema concreto en pipelines agénticos: sustituir la generación abierta por clasificación y puntuación controladas con confianza calibrada. Admite tres tipos de pregunta: `choice` (entre 2 y 255 opciones), `noul` (sí/no) y `score` (escala ordenada de 2 a 10 niveles). Las preguntas y opciones viajan en la petición, de modo que el mismo modelo responde a decisiones nuevas sin reentrenamiento.

Es relevante por su eficiencia y su calibración: 24 GB de pesos en bf16, una sola GPU de 48 GB, y 80 ms por pregunta sobre una NVIDIA H100 (261 ms para 30 preguntas sobre un mismo estado). Declara una brecha media de 1,5 puntos entre confianza y precisión, lo que lo hace apto para enrutado y triaje donde la incertidumbre debe ser explícita. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), reajustado como cabecera de clasificación/decisión sobre el modelo base |
| Parametros totales | 11.959.730.224 (11,95B) |
| Parametros activos | No aplica (modelo denso; la variante MoE del catálogo es la 26B-A4B) |
| Longitud de contexto | 32.768 tokens validados (límite por defecto); hasta 131.072 |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 47,9 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Gemma 4 y se ha ajustado de forma supervisada para una tarea de clasificación multiopción y regresión ordinal, en lugar de decodificación autorregresiva de texto. La salida es una distribución de probabilidad sobre las opciones de cada pregunta, calculada en un único forward pass sin generación de tokens. La model card indica que acepta estado en texto o JSON y, opcionalmente, imágenes, lo que sugiere que conserva las capacidades multimodales del base.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO. Sí se especifica que es un finetune de `google/gemma-4-12B-it` y que sucede a `strands-decider-12B-gemma4-v1-2610` sobre la misma base. La innovación destacable es el formato de decisión tipado con calibración explícita de confianza y la reutilización del mismo modelo para decisiones nuevas sin reentrenamiento, ya que las preguntas y opciones se pasan en la petición.

## Capacidades

- Clasificación por elección entre 2 y 255 opciones (`choice`), con probabilidad por opción.
- Preguntas de sí/no (`noul`) con probabilidad calibrada.
- Puntuación ordinal (`score`) en escalas de 2 a 10 niveles.
- Procesamiento de estado en texto plano o JSON.
- Entrada opcional de imágenes junto al estado (según la model card).
- Respuesta en una sola pasada, sin generación de texto, con latencia baja.
- Confianza calibrada por respuesta (brecha media declarada de 1,5 puntos frente a la precisión).
- Multitud de preguntas sobre un mismo estado en una sola llamada (30 preguntas en 261 ms en H100).
- Interfaz de línea de comandos (`strands-decider ask`) y librería `strands-decider`.
- No soporta tool calling ni razonamiento multi-paso generativo: su función es decidir, no actuar.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como estado y preguntar `choice` por el equipo responsable (facturación, ventas, retail) y `score` por el nivel de frustración del cliente; la confianza calibrada permite derivar a revisión humana los casos dudosos.
- Enrutado en pipelines agénticos: usar el modelo como decisor entre acciones o herramientas disponibles, con `choice` sobre el conjunto de opciones y umbral de confianza para escalar al LLM generativo cuando la probabilidad sea baja.
- Moderación y control de calidad: preguntas `noul` encadenadas sobre un mismo estado (¿es spam?, ¿contiene datos personales?, ¿es urgente?) en una sola pasada, con 30 preguntas en 261 ms sobre H100.
- Clasificación de documentos JSON: procesar registros estructurados como estado y puntuar con `score` la severidad o prioridad, integrándolo en colas de procesamiento por lotes.
- Evaluación de respuestas de otros modelos: puntuar con `score` la calidad, toxicidad o corrección de una salida generada, aprovechando la calibración para filtrar automáticamente.
- Análisis de imágenes con decisión asociada: pasar una imagen junto al estado y preguntar `choice` o `noul` sobre su contenido, por ejemplo para triaje visual en atención al cliente.
- Selección de modelo o configuración en producción: decidir entre variantes del catálogo Strands Decider (E2B, E4B, 12B, 26B-A4B, 31B) según coste y precisión requeridos; el mismo formato de petición permite cambiar solo el nombre del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Benchmark | Tarea | Puntuación |
|---|---|---|
| Decision Index 0.3 | text-classification | 64,1 |
| JevBench | text-classification | 92,2 |
| OpenDecisions | text-classification | 85,7 |
| DecisionPivot | text-classification | 58,9 |
| BEV | text-classification | 79,0 |

La model card indica además 17,7 puntos de mejora en Decision Index 0.3 respecto a Strands Decider v1 12B y una brecha media de 1,5 puntos entre confianza y precisión. En latencia: 80 ms por pregunta y 261 ms para 30 preguntas sobre un estado, en una NVIDIA H100.

## Requisitos de hardware

- VRAM para inferencia: 24 GB de pesos en bf16; se recomienda una GPU con 48 GB de memoria para margen de activaciones y contexto.
- GPU recomendadas: NVIDIA H100 (48 GB o 80 GB), A100 80 GB; una GPU de 48 GB es el mínimo indicado por el autor.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16 sin cuantización; no se han publicado pesos cuantizados.
- Despliegue: librería `strands-decider` (pip) y CLI `strands-decider ask`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 80 ms por pregunta en H100; 261 ms para 30 preguntas sobre un mismo estado.
- Requisitos de entorno: Python 3.11 o superior y 24 GB de disco para los pesos.

## Comparativa con modelos similares

Comparación dentro de la familia Strands Decider v2 (mismo formato de petición y respuesta):

| Modelo | Base | Parámetros | Pesos bf16 | GPU recomendada |
|---|---|---|---|---|
| E2B | gemma-4-E2B-it | 2,3B efectivos (5,1B con embeddings) | 10,3 GB | Una GPU de 24 GB o sin GPU |
| E4B | gemma-4-E4B-it | 4,5B efectivos (8B con embeddings) | 16 GB | Una GPU de 40 GB |
| 12B (este modelo) | gemma-4-12B-it | 11,95B | 24 GB | Una GPU de 48 GB |
| 26B-A4B | gemma-4-26B-A4B-it | 25,2B, 3,8B activos (128 expertos) | 52 GB | Una GPU de 80 GB, muchas preguntas por estado |
| 31B | gemma-4-31B-it | 30,7B | 63 GB | Una GPU de 80 GB, máxima precisión |

Frente a modelos generativos de tamaño similar (por ejemplo, el propio `google/gemma-4-12B-it`), la diferencia es funcional: el base genera texto y no ofrece probabilidades calibradas por opción ni latencia de 80 ms por decisión. No se dispone de comparativas publicadas con otros modelos de decisión de terceros en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés de forma declarada; el rendimiento en castellano u otros idiomas no está validado.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso; usarlo fuera de su formato de preguntas tipadas dará resultados no fiables.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`); tómense como orientativos.
- La calibración puede degradarse fuera de la distribución de entrenamiento; conviene monitorizar la brecha confianza-precisión en producción.
- Riesgo de alucinación mitigado pero no eliminado: al devolver probabilidades, una opción puede recibir alta confianza de forma errónea ante estados ambiguos o adversariales.
- Contexto por defecto de 32.768 tokens; el límite de 131.072 no está validado por el autor.
- Requiere una GPU de 48 GB en bf16; no hay cuantizaciones publicadas para hardware de consumo.
- Sesgos heredados de Gemma 4 y de los datos de ajuste, no documentados en detalle.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-12B-gemma4-v2-2611
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Versión anterior v1 12B: https://huggingface.co/StrandsAgents/strands-decider-12B-gemma4-v1-2610
- Repositorio de código: https://github.com/strands-labs/strands-decider
- Documentación: https://strandsagents.com/docs/labs/strands-decider/overview/
- Regla de nombres: https://github.com/strands-labs/strands-decider/blob/main/docs/naming.md
- Organización en Hugging Face: https://huggingface.co/StrandsAgents
- Variante E2B: https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v2-2611
- Variante E4B: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v2-2611
- Variante 26B-A4B: https://huggingface.co/StrandsAgents/strands-decider-26B-A4B-gemma4-v2-2611
- Variante 31B: https://huggingface.co/StrandsAgents/strands-decider-31B-gemma4-v2-2611
