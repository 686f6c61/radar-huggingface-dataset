# vllm-sr/vela3-turbo

## Resumen

vela3-turbo es un modelo de decisión y extracción de 26,09B de parámetros publicado por vLLM Semantic Router (vllm-sr) en colaboración con KR Labs, como miembro de referencia de la familia Vela 3.0. Se construye sobre el modelo base d3-turbo v1.0 (revisión `da17b5d0c860f7e5be6e2afebe67228b4bd24d0c`, congelada) y añade adaptadores LoRA con compuertas para resolver tareas de enrutamiento semántico y guardarraíles en una sola llamada `system_one`: clasificación zero-shot, extracción de entidades y relaciones, detección de PII, detección de afirmaciones no respaldadas y señales de router.

El modelo no genera texto: devuelve elecciones, sí/no, puntuaciones y spans con offsets de caracteres y probabilidades. Esta orientación lo hace adecuado como componente de infraestructura para sistemas de enrutamiento de LLM y filtros de seguridad, en lugar de como modelo conversacional. Su pipeline declarado en Hugging Face es `zero-shot-classification` y la licencia es Apache-2.0.

La relevancia actual reside en que cubre tareas de extracción y clasificación con resultados que el autor sitúa por encima de modelos mayores en los mismos conjuntos de evaluación, manteniendo las decisiones ordinarias bit a bit idénticas al modelo base d3-turbo gracias a que este permanece congelado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base d3-turbo) con adaptadores LoRA con compuertas y cabezas de extracción |
| Parámetros totales | 26,09B (incluye codificador de visión) + 5044 MB de adaptadores y cabezas |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 6,2 GB; `custom_code` en transformers) |

## Arquitectura y entrenamiento

vela3-turbo mantiene congelado el modelo base d3-turbo v1.0 y añade pequeños adaptadores LoRA con compuertas, uno por tarea: spans (afirmaciones no respaldadas, datos personales, evidencia), entidades, relaciones y señales de router. Cada adaptador se activa únicamente para su tipo de pregunta, de modo que las decisiones ordinarias las responde d3-turbo sin adaptadores, bit a bit (561 de 561 idénticas en la comprobación del autor). El modelo base incorpora codificador de visión, por lo que acepta texto, JSON, imágenes y vídeo para los tipos de pregunta propios de d3-turbo.

Los adaptadores se entrenaron con la receta de vela3-flash y se portaron a d3-turbo: los de spans, entidades y router se reajustaron en umbral, y el de relaciones se reentrenó. Las señales de router se entrenaron de forma supervisada sobre los mismos conjuntos públicos que Vela 2.0 (AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 para seguridad; Global-MMLU para dominio; WildFeedback para feedback; DiffusionDB para modalidad; MASSIVE para intenciones), además del split de entrenamiento de la suite pública de señales de router. Otros datos incluyen conjuntos públicos de NER, relaciones, alucinación, evidencia y PII, junto con texto web y de documentos etiquetado por un modelo profesor grande. No se entrena con ningún test split ni con elementos del Decision Index; el autor advierte que algunas filas de test de la suite de señales de router aparecen también en fuentes públicas de entrenamiento, por lo que la tabla de router reporta además las filas sin esa superposición.

## Capacidades

- Clasificación zero-shot: 81,4 en la suite de clasificación de 13 conjuntos de GLiFormer.
- Extracción de relaciones zero-shot: 35,9 end-to-end en el protocolo de GLiFormer (media de 4 conjuntos) y 51,7 en CoNLL04 con entidad cabeza dada.
- NER zero-shot: 64,6 en OOD-7 (CrossNER + MIT) a partir de nombres de etiqueta.
- Detección de afirmaciones no respaldadas: 0,900 de example-F1 en el test de LettuceDetect v2.
- Señales de router: mejor que Vela 2.0 9B en 20 de los 24 ficheros de test de la suite pública, igual en 4 y peor en ninguno (IC del 95% emparejado).
- Decisiones ordinarias (elección, sí/no, puntuación) respondidas por d3-turbo con adaptadores desactivados.
- Soporte de entrada multimodal (imágenes y vídeo) para los tipos de pregunta de d3-turbo.
- Capacidades declaradas por etiquetas: detección de PII, detección de alucinaciones, seguridad de contenido, extracción de relaciones y NER.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Enrutamiento de peticiones entre LLM: el modelo devuelve una probabilidad por opción para clasificar la consulta (por ejemplo, facturación frente a soporte técnico) y decidir a qué modelo o servicio derivarla, sin generar texto y con coste de latencia bajo.
- Guardarraíl de seguridad de contenido: las señales de router entrenadas sobre AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 permiten clasificar entradas potencialmente dañinas antes de que lleguen al modelo generativo.
- Detección de PII en pipelines de datos: el adaptador de spans localiza datos personales con offsets de caracteres, útil para anonimizar documentos antes de almacenarlos o enviarlos a terceros.
- Verificación de respuestas en sistemas RAG: el adaptador de afirmaciones no respaldadas detecta fragmentos sin evidencia en la respuesta generada, con 0,900 de example-F1 en LettuceDetect v2, para activar una revisión o un reintento.
- Extracción de entidades y relaciones en documentos: NER zero-shot a partir de nombres de etiqueta y extracción de relaciones con entidad cabeza dada, aplicable a construcción de grafos de conocimiento o indexación semántica sin entrenamiento específico por dominio.
- Clasificación de feedback de usuario: la señal de feedback (entrenada sobre WildFeedback) permite etiquetar opiniones y priorizar colas de atención al cliente.
- Detección de modalidad de entrada: la señal entrenada sobre DiffusionDB clasifica el tipo de contenido (texto, imagen, vídeo) para enrutar peticiones multimodales al modelo adecuado.
- Clasificación de intenciones en asistentes: la señal entrenada sobre MASSIVE permite asignar la intención de una consulta en un sistema de diálogo sin un modelo generativo adicional.

## Benchmarks y rendimiento

| Benchmark | vela3-turbo | Referencia comparada | Fuente |
|---|---|---|---|
| Suite de clasificación GLiFormer (13 conjuntos) | 81,4 | GPT-5-mini: 79,8; Gemma-4-31B-IT: 79,69 | GLiFormer paper, Tab. 5 |
| Relaciones end-to-end (protocolo GLiFormer, media de 4) | 35,9 | Qwen3.5-9B con prompting: 25,7 (mejor reportado) | GLiFormer paper, Tab. 4 |
| CoNLL04 con entidad cabeza dada | 51,7 | GLiFormer-base: 8,6 (ejecución propia, mismo harness) | model card |
| NER zero-shot OOD-7 (CrossNER + MIT) | 64,6 | gliner-multitask-large-v0.5: 62,76 (mejor reportado) | model card |
| LettuceDetect v2 (example-F1) | 0,900 | LettuceDetect v2 mmBERT-base: 0,869; Vela 2.0 9B: 0,885 | model card |
| Suite pública de señales de router (24 ficheros) | Mejor en 20, igual en 4, peor en 0 | Vela 2.0 9B | model card (IC 95% emparejado) |
| Decisiones ordinarias (561 comprobaciones) | 561/561 idénticas a d3-turbo | d3-turbo v1.0 sin adaptadores | model card |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 6,2 GB, lo que sugiere pesos en precisión reducida o cuantización, pero el tamaño real en memoria para 26,09B de parámetros más adaptadores no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño (26B), un despliegue en FP16 requeriría del orden de 52 GB de VRAM, lo que implica A100 80GB, H100 o múltiples GPU; esta estimación es orientativa y no procede de la documentación del autor.
- ¿Cabe en GPU de consumo? No disponible. Con cuantización de 4 bits podría situarse en el entorno de 13-16 GB, pero el autor no publica cuantizaciones ni requisitos verificados.
- Opciones de despliegue: la librería declarada es `transformers` con `custom_code`, por lo que requiere cargar código personalizado del repositorio. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vela3-turbo | 26,09B + adaptadores | no disponible | Decisión y extracción (router y guardarraíles) | Apache-2.0 | Hugging Face (vllm-sr) |
| Vela 2.0 9B | 9B | no disponible | Decisión y señales de router | no disponible | Referenciado en la model card |
| d3-turbo v1.0 | no disponible (modelo base) | no disponible | Decisiones ordinarias | no disponible | Hugging Face (vllm-sr/d3-turbo) |
| GLiFormer-base | no disponible | no disponible | NER y relaciones | no disponible | Referenciado en el paper GLiFormer |
| gliner-multitask-large-v0.5 | no disponible | no disponible | NER zero-shot | no disponible | Referenciado en la model card |

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve elecciones, sí/no, puntuaciones y spans. No es adecuado como modelo conversacional ni para generación libre.
- Sesgos conocidos: no disponibles de forma explícita; al entrenarse con conjuntos públicos y etiquetado de un modelo profesor, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: el modelo está diseñado para detectar afirmaciones no respaldadas, pero sus propias salidas de clasificación y spans pueden contener errores, especialmente en dominios alejados de los datos de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se declaran en la información disponible.
- Superposición de datos: algunas filas de test de la suite pública de señales de router aparecen en fuentes públicas de entrenamiento, lo que puede inflar las métricas de router; el autor reporta también las filas sin solapamiento.
- Dependencia del modelo base: las decisiones ordinarias dependen de d3-turbo v1.0 fijado; actualizar a d3-turbo v1.1 requiere revalidar los adaptadores.
- Requiere `custom_code` en transformers, lo que añade complejidad de despliegue y riesgos de seguridad al cargar código del repositorio.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben verificarse las licencias de los conjuntos de datos de entrenamiento y del modelo base d3-turbo.
- Los benchmarks comparados con otros modelos proceden de cifras reportadas por sus autores o ejecuciones propias del autor, no de evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/vela3-turbo
- Modelo base d3-turbo: https://huggingface.co/vllm-sr/d3-turbo
- Colección Vela 3.0: https://huggingface.co/collections/vllm-sr/vela-30-6ad1c430eb1718eb4754edcd
- Paper GLiFormer: no disponible (referenciado en la model card sin enlace)
- Repositorio vLLM Semantic Router: no disponible
- Demo: no disponible
