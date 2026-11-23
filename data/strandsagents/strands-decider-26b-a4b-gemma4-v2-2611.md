# StrandsAgents/strands-decider-26B-A4B-gemma4-v2-2611

## Resumen

Strands Decider 26B-A4B Gemma4 v2 (2611) es un modelo de decisión para IA agéntica desarrollado por el equipo Strands Decider de Strands Labs. No es un modelo generativo al uso: en lugar de producir texto libre, recibe un *estado* (texto o JSON, opcionalmente con imágenes) y una o varias preguntas tipadas —`choice` (entre 2 y 255 opciones), `noul` (sí/no) o `score` (escala ordenada de 2 a 10 niveles)— y devuelve, en una sola pasada y sin generar texto, una probabilidad para cada opción junto con una confianza calibrada. Esto lo convierte en una pieza específica para orquestación de agentes: seleccionar herramientas, clasificar intenciones, priorizar tickets o enrutar decisiones con una señal probabilística explícita.

El modelo parte de `google/gemma-4-26B-A4B-it`, un transformer de mezcla de expertos (MoE) con 25,2B parámetros totales y 3,8B activos por token (8 de 128 expertos). Strands Labs lo ha afinado para la tarea de decisión y lo publica bajo licencia Apache-2.0, con pesos en safetensors (52 GB en bf16) y un repositorio de 103,3 GB. Es la variante de mayor tamaño junto a la de 31B dentro de la familia v2, que incluye también E2B, E4B y 12B con la misma interfaz de petición.

Su relevancia actual radica en dos puntos: primero, separa la decisión de la generación, de modo que un agente puede delegar la elección entre opciones a un modelo calibrado en lugar de parsear texto libre de un LLM; segundo, su calibración declarada (una brecha media de 0,9 puntos entre confianza y precisión) y su latencia (86 ms por pregunta en una H100, 220 ms para 30 preguntas sobre un mismo estado) lo hacen viable en bucles agénticos con muchas decisiones por turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 8 de 128 expertos activos por token; fine-tune de `google/gemma-4-26B-A4B-it` |
| Parametros totales | 25.805.936.206 (25,2B segun model card; 25,8B en safetensors) |
| Parametros activos | 3,8B por token |
| Longitud de contexto | 32.768 tokens validados (limite por defecto); hasta 131.072 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 52 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 26B-A4B: un transformer de mezcla de expertos en el que cada token activa 8 de los 128 expertos, de modo que solo 3,8B de los 25,2B parámetros intervienen en cada paso. Sobre esa base, Strands Labs ha realizado un fine-tune orientado a clasificación y calibración de decisiones, no a generación de texto: la salida es una distribución de probabilidad sobre las opciones de cada pregunta incluida en la petición, sin decodificación autoregresiva de texto. Esto explica que la latencia sea muy inferior a la de un LLM generativo del mismo tamaño y que el modelo pueda responder varias preguntas sobre un mismo estado en una sola pasada.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Sí indica que las preguntas y opciones viajan en la petición, por lo que el modelo puede responder a una decisión nueva sin reentrenamiento, y que la versión v2 mejora a v1 sobre el mismo modelo base. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación por elección: selecciona entre 2 y 255 opciones con una probabilidad por opción.
- Preguntas binarias (`noul`): respuesta sí/no con probabilidad asociada.
- Puntuación en escala ordenada (`score`): asigna un nivel entre 2 y 10 con distribución de probabilidad.
- Confianza calibrada: cada respuesta incorpora una confianza cuya desviación respecto a la precisión real se declara en 0,9 puntos de media.
- Múltiples preguntas por estado: puede resolver varias preguntas tipadas sobre el mismo estado en una sola pasada (hasta 30 preguntas en 220 ms en H100).
- Entrada multimodal parcial: acepta estado en texto o JSON con imágenes opcionales.
- Contexto largo: 32.768 tokens validados, ampliable hasta 131.072.
- Sin generación de texto: no produce explicaciones ni razonamiento en lenguaje natural; solo probabilidades sobre opciones.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo responde a una pregunta `choice` con los equipos disponibles (por ejemplo, facturación, infraestructura, producto) y devuelve la probabilidad de cada uno; la confianza calibrada permite derivar a revisión humana cuando baja de un umbral.
- Selección de herramientas en agentes: en un bucle agéntico, el estado es el historial de conversación y la pregunta `choice` enumera las herramientas disponibles; el modelo elige la siguiente acción en 86 ms por pregunta en H100, lo que permite muchos ciclos por turno.
- Triaje de urgencia: preguntas `noul` como "¿transmite urgencia?" sobre mensajes entrantes, con probabilidad para priorizar la cola de atención.
- Moderación y política de contenido: preguntas `score` de 2 a 10 niveles sobre categorías de riesgo, usando la distribución para fijar umbrales de escalado.
- Validación de salidas de LLM: dado un texto generado y un conjunto de criterios, el modelo puntúa cada criterio y permite aceptar, regenerar o marcar para revisión con una señal numérica en lugar de un juicio en texto libre.
- Extracción de decisiones en pipelines de datos: clasificar documentos JSON (por ejemplo, registros de eventos) con preguntas tipadas sobre categoría y severidad, sin coste de generación.
- Orquestación multi-pregunta: sobre un mismo estado largo (hasta 32.768 tokens), lanzar decenas de preguntas en una pasada para poblar un vector de decisión completo en unos 220 ms.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Resultado |
|---|---|---|
| Decision Index 0.3 | text-classification | 69,0 |
| JevBench | text-classification | 92,6 |
| OpenDecisions | text-classification | 88,6 |
| DecisionPivot | text-classification | 69,2 |
| BEV | text-classification | 81,4 |

Segun la model card, el resultado de 69,0 en Decision Index 0.3 supone 20,2 puntos por encima de Strands Decider v1 26B-A4B, con una brecha media de 0,9 puntos entre confianza y precisión. No se han publicado en la información disponible resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos de decisión de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: 52 GB de pesos en bf16, por lo que se recomienda una GPU con 80 GB de memoria; no se documentan requisitos para cuantizaciones inferiores.
- GPU recomendadas: una NVIDIA H100 de 80 GB (referencia de latencia declarada: 86 ms por pregunta, 220 ms para 30 preguntas sobre un estado).
- GPU de consumo: no cabe en GPUs de consumo convencionales (24 GB o menos) en bf16; no se dispone de datos sobre cuantización para reducir huella.
- Almacenamiento: 52 GB de pesos; el repositorio completo ocupa 103,3 GB.
- Opciones de despliegue: el modelo se sirve mediante la librería `strands-decider` (`pip install strands-decider`) y su CLI `strands-decider ask`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno: Python 3.11 o superior.
- Latencia y throughput: 86 ms por pregunta y 220 ms para 30 preguntas sobre un mismo estado en una H100, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Pesos bf16 | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| strands-decider-26B-A4B-gemma4-v2-2611 | 25,2B | 3,8B (MoE) | 32.768 (hasta 131.072) | 52 GB | Apache-2.0 | Decision (choice/noul/score) |
| strands-decider-31B-gemma4-v2-2611 | 30,7B | no disponible | no disponible | 63 GB | Apache-2.0 | Decision, maxima precision de la familia |
| strands-decider-12B-gemma4-v2-2611 | 11,95B | no disponible | no disponible | 24 GB | Apache-2.0 | Decision, una GPU de 48 GB |
| strands-decider-E4B-gemma4-v2-2611 | 4,5B efectivos (8B con embeddings) | no disponible | no disponible | 16 GB | Apache-2.0 | Decision, una GPU de 40 GB |

Las alternativas de otros fabricantes para clasificación calibrada no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo declara únicamente el idioma `en`, por lo que su uso en castellano u otros idiomas no está validado.
- No genera texto: no sirve como LLM conversacional ni produce justificaciones; cualquier explicación debe construirla el sistema que lo envuelve.
- Riesgo de calibración fuera de distribución: la brecha de 0,9 puntos es una media declarada por el autor; en dominios alejados de los datos de entrenamiento la confianza puede no reflejar la precisión real.
- Benchmarks no verificados: los resultados del model-index están marcados como no verificados y pertenecen a conjuntos propios (Decision Index, JevBench, OpenDecisions, DecisionPivot, BEV), no a estándares externos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de un modelo base entrenado con datos web, puede heredar sesgos de ese corpus.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `google/gemma-4-26B-A4B-it` y de sus pesos derivados.
- Requisito de hardware elevado: 80 GB de VRAM en bf16 limita el despliegue a infraestructura profesional; no hay datos publicados sobre cuantización.
- Madurez: el repositorio registra 3 descargas y 1 like en el momento de la consulta, lo que indica adopción muy temprana y poca validación externa.
- Idiomas de la interfaz: las preguntas y opciones se envían en la petición, pero el modelo solo fue ajustado para inglés; mezclar idiomas puede degradar la calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-26B-A4B-gemma4-v2-2611
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Versión anterior v1: https://huggingface.co/StrandsAgents/strands-decider-26B-A4B-gemma4-v1-2610
- Familia completa: https://huggingface.co/StrandsAgents
- Variante E2B: https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v2-2611
- Variante E4B: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v2-2611
- Variante 12B: https://huggingface.co/StrandsAgents/strands-decider-12B-gemma4-v2-2611
- Variante 31B: https://huggingface.co/StrandsAgents/strands-decider-31B-gemma4-v2-2611
- Codigo: https://github.com/strands-labs/strands-decider
- Regla de nombrado: https://github.com/strands-labs/strands-decider/blob/main/docs/naming.md
- Documentacion: https://strandsagents.com/docs/labs/strands-decider/overview/
- Organizacion: https://github.com/strands-labs
