# wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-MC

## Resumen

Muse Spark Open EXL3 K4 - MC es una cuantización comunitaria del modelo multimodal Muse-Spark-Open-816B-A42B, desarrollada por el usuario wrldsuksgo2mars. Se trata de una mezcla de expertos (MoE) de gran escala en la que los expertos enrutados se han cuantizado a 4 bits mediante EXL3 MCG, mientras que el núcleo denso (atención, proyecciones densas y cabeza de salida) se ofrece en tres variantes seleccionables en tiempo de carga: BF16 original, EXL3 8 bits y EXL3 6 bits. El checkpoint real en safetensors contiene 228.975.372.160 parámetros.

La relevancia de esta ficha radica en que demuestra una técnica de empaquetado "multi-core" que comparte los pesos de los expertos entre varias vistas de núcleo, reduciendo el espacio en disco y permitiendo elegir el equilibrio entre fidelidad y tamaño sin duplicar los 372,7 GiB de expertos. Está pensada para el motor de inferencia cuteafd, no para ecosistemas estándar como vLLM o llama.cpp.

El modelo base es multimodal (image-text-to-text) e incluye torres de visión y audio que se mantienen en formato nativo. La licencia es la muse-model-license del modelo original, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer multimodal con torres de visión y audio |
| Parametros totales | 228.975.372.160 (según safetensors del checkpoint) |
| Parametros activos | 42B (según el nombre del modelo base: A42B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados EXL3 MCG K4; núcleo denso en BF16, EXL3 K8 o EXL3 K6 |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (other) |
| Formato de pesos | safetensors (con metadatos EXL3 MCG); requiere runtime cuteafd |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con 228.975 millones de parámetros totales y aproximadamente 42B activos por token, con capacidades multimodales de imagen-texto y audio. La cuantización preserva en formato nativo las compuertas de salida de atención, los routers, las normas, las compuertas residuales, los embeddings y las torres completas de visión y audio con sus proyectores; estos tensores nativos se comparten entre las tres vistas. No incluye MTP ni experto compartido empaquetado.

El proceso de cuantización utilizó GPTQModel (fork de tpurtell, commits `05689b25` para K4/K6 y `1f920091` para K8) con captura causal capa por capa. Los expertos enrutados (47.616 matrices gate/up/down) se cuantizaron a EXL3 MCG K4 con codebook de multiplicador `0xCBAC1FED`, semilla 787 y regularización de Hessian 0,025. Las matrices de atención q/k/v/o, pre/post-experto y cabeza de vocabulario se cuantizaron a K8 o K6. La calibración empleó 1.426 prompts (1.248.980 tokens) del dataset agentic-quant-panel-v1, orientado a código, matemáticas, esquemas de llamadas a funciones y texto multilingüe. Se aplicó una técnica de recuperación para expertos raramente enrutados con suelo de 1.024 filas y rangos 9 y 16.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Procesamiento de audio, según la presencia de torres de audio nativas en el checkpoint.
- Razonamiento y matemáticas, dado el dataset de calibración orientado a matemáticas trabajadas.
- Generación de código, con calibración específica sobre código fuente real.
- Tool calling y function calling, con calibración sobre esquemas de llamadas a funciones.
- Uso en flujos agénticos de múltiples pasos, por el panel de calibración agentic.
- Capacidades multilingües, con calibración sobre texto multilingüe (idiomas concretos no disponibles).

## Casos de uso

- Asistencia de código en producción: el modelo se calibró sobre código fuente real y esquemas de funciones, por lo que puede integrarse en pipelines de revisión y generación de parches con soporte de tool calling.
- Agentes autónomos multi-paso: el dataset de calibración agentic-quant-panel-v1 está diseñado para modelos MoE usados en tool use, lo que lo hace adecuado para orquestación de llamadas encadenadas.
- Razonamiento matemático asistido: la calibración incluye matemáticas trabajadas, útil para tutoría o verificación de cálculos paso a paso.
- Análisis de documentos con imagen: la torre de visión nativa permite responder preguntas sobre capturas, diagramas o documentos escaneados.
- Transcripción y comprensión de audio: las torres de audio nativas habilitan tareas de speech-to-text y análisis de audio conversacional.
- Atención al cliente multilingüe: la calibración multilingüe permite gestionar conversaciones en varios idiomas, aunque la lista exacta de idiomas no está documentada.
- Investigación en cuantización MoE: el checkpoint sirve como referencia reproducible para estudiar el impacto de EXL3 K4/K6/K8 en expertos y núcleo denso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 473,6 GB; la vista `original` tiene 416,1 GiB de payload de tensores, `k8-compact` 402,0 GiB y `k6-compact` 398,5 GiB. Son tamaños de almacenamiento, no requisitos de VRAM.
- No se dispone de estimaciones de VRAM para inferencia en la información proporcionada.
- No se dispone de GPU recomendadas ni confirmación de que quepa en GPUs de consumo; por el tamaño (cientos de GiB), es previsible que requiera múltiples aceleradores de datacenter (A100/H100), pero este dato no está confirmado.
- Motor de despliegue: cuteafd (con selección de vista mediante `CORE_VIEW=original|k8-compact|k6-compact`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Muse-Spark-Open-816B-A42B (base) | 228,98B | 42B | no disponible | BF16 nativo | muse-model-license | Hugging Face |
| Muse Spark Open EXL3 K4 - MC (este) | 228,98B | 42B | no disponible | EXL3 K4 expertos + núcleo BF16/K8/K6 | muse-model-license | Hugging Face, runtime cuteafd |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia muse-model-license es de tipo "other" y condiciona el uso comercial; es necesario revisar el texto enlazado en la model card antes de desplegar en producción.
- Al ser una cuantización a 4 bits de los expertos, es previsible cierta degradación de calidad frente al modelo BF16 original, especialmente en expertos raramente enrutados.
- El checkpoint solo está pensado para el motor cuteafd; no hay garantía de compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros runtimes estándar.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues multilingües o de contexto largo.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; no se han publicado evaluaciones específicas de fiabilidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El dataset de calibración no registra revisión ni split en los metadatos del repositorio, lo que limita la reproducibilidad exacta de la cuantización.
- El proceso de cuantización depende de código específico del motor (adaptadores Muse en cuteafd) y no está completamente upstream en GPTQModel, por lo que la receta no es portable tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-MC
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia del modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/0fb02478b02565b2ce7fc57e6051c91172774ac9/LICENSE.md
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Motor cuteafd: https://github.com/tpurtell/cuteafd
- Formato MC en cuteafd: https://github.com/tpurtell/cuteafd/blob/dev/docs/mc-checkpoints.md
- Adaptadores de cuantización Muse en cuteafd: https://github.com/tpurtell/cuteafd/blob/dev/quantization/muse_spark/
- GPTQModel (fork): https://github.com/tpurtell/GPTQModel
- PR upstream GPTQModel #3587: https://github.com/ModelCloud/GPTQModel/pull/3587
- PR upstream GPTQModel #3591: https://github.com/ModelCloud/GPTQModel/pull/3591
- PR fork GPTQModel #5: https://github.com/tpurtell/GPTQModel/pull/5
