# txchmechanicus/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. (publicado bajo el identificador `txchmechanicus/Inkling-2-Mini` en Hugging Face). Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: asistentes de código, sistemas agénticos con uso de herramientas, chatbots y pipelines de generación aumentada por recuperación (RAG). Su relevancia actual radica en que combina una arquitectura poco habitual —un transformer con bucles de pesos compartidos y MoE disperso— con un tamaño total de 26.400 millones de parámetros que cabe en hardware de consumo alto o en un único acelerador profesional.

La arquitectura es un transformer decodificador de 24 capas con capas feed-forward de mezcla de expertos (MoE) dispersa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos por capa. La atención es híbrida, combinando capas locales y globales, y la multimodalidad es nativa: un vision transformer proyecta las imágenes al mismo espacio oculto que el texto.

El modelo se distribuye como un único checkpoint de unos 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite inferencia local en un DGX Spark, en Apple Silicon con 32 GB o más de memoria unificada, o en GPUs con 32 GB o más de VRAM. La ventana de contexto anunciada alcanza 1.000.000 de tokens, un dato destacable para su rango de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con bucles de pesos compartidos y MoE disperso (24 capas, 12 centrales ejecutadas 3 veces) |
| Parametros totales | 26.388.646.440 (26,4 B) |
| Parametros activos | 3,4 B nominales; 5,4 B efectivos por token con tres pasadas (cada pasada adicional añade ~1,0 B) |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 en el checkpoint oficial; GGUF cuantizado vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 (con política de uso aceptable adicional) |
| Formato de pesos | safetensors (checkpoint único de ~20 GB), GGUF para cuantización |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con una innovación estructural central: el bucle de capas. De las 24 capas del decodificador, las 12 intermedias se aplican tres veces reutilizando los mismos pesos, de modo que cada token atraviesa 48 aplicaciones de capa efectivas con solo 24 conjuntos de pesos. Esto incrementa la profundidad efectiva sin aumentar el número de parámetros almacenados, y el autor cuantifica el efecto: cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos, resultando en 5.400 millones por token con las tres pasadas. Las capas feed-forward son de mezcla de expertos dispersa, con enrutamiento de cada token a 8 de 128 expertos por capa. La atención combina capas locales y globales de forma híbrida. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto con el texto a un espacio oculto compartido que procesa el decodificador de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El soporte numérico nativo es NVFP4 y MXFP8, lo que explica el tamaño compacto del checkpoint oficial.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones en lenguaje natural.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 px y 4096 px.
- Razonamiento y resolución de tareas de lenguaje natural de propósito general.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling), según la orientación de uso declarada por el autor.
- Integración en pipelines de generación aumentada por recuperación (RAG).
- Capacidades multilingües generales, con inglés como idioma principal.
- Procesamiento conjunto de imagen y texto en un único decodificador (no es un pipeline de dos modelos separados en inferencia).

## Casos de uso

- Asistencia de código en producción: el modelo puede integrarse en asistentes de IDE o pipelines de revisión para generar, completar y explicar código en varios lenguajes, aprovechando su soporte de tool calling para consultar documentación o ejecutar pruebas.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto muy largo (hasta 1 M de tokens), lo que permite mantener el historial completo de una sesión o de un cliente sin truncar.
- Sistemas agénticos con herramientas: su orientación declarada a agentes y tool-use permite construir flujos de varios pasos donde el modelo decide qué herramienta invocar y encadena resultados.
- RAG sobre documentación extensa: con una ventana de 1 M de tokens puede ingerir manuales, contratos o bases de conocimiento completas y responder preguntas con el contexto íntegro, reduciendo la dependencia de recuperación fragmentada.
- Análisis de documentos con imágenes: al aceptar imagen y texto conjuntamente, puede procesar capturas, diagramas, formularios escaneados o gráficos junto con texto explicativo en una sola pasada.
- Despliegue local y en el borde: el checkpoint de ~20 GB en NVFP4/MXFP8 cabe en un DGX Spark o en Apple Silicon con 32 GB, lo que habilita asistentes privados sin conexión a la nube.
- Fine-tuning por desarrolladores: la licencia Apache 2.0 y el soporte de Tinker, Miles y SkyRL permiten adaptar el modelo a dominios concretos y redistribuir los pesos ajustados.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero el contenido proporcionado está truncado y no incluye los valores numéricos de los benchmarks. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Checkpoint oficial: ~20 GB en precisiones mixtas NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para el checkpoint oficial.
- Hardware validado por el autor: 1x NVIDIA DGX Spark; Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Otras GPUs: posibles con 32 GB o más de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo de gama alta con 32 GB o más de VRAM; en configuraciones de 24 GB requeriría cuantización GGUF adicional.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizados), llama.cpp (GGUF), Llama App, y en Apple Silicon Ollama y Exo Labs.
- Post-entrenamiento soportado: Miles y SkyRL, además de la plataforma Tinker.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4 B totales / 5,4 B activos efectivos | 1 M tokens | Apache 2.0 | Pesos abiertos en Hugging Face, Tinker, playground |
| Gemma 4 31B | 31 B (según denominación) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27 B (según denominación) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos de comparación aparecen citados en la tabla de evaluaciones de la model card, pero la información proporcionada no incluye sus especificaciones detalladas ni sus resultados numéricos, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni resultados de evaluaciones de seguridad o sesgo.
- Riesgo de alucinación inherente a los modelos generativos; no se publican tasas de error ni evaluaciones de fidelidad.
- Aunque declara soporte multilingüe general, el foco principal es el inglés; el rendimiento en otros idiomas no está cuantificado.
- La ventana de 1 M de tokens es una capacidad anunciada; no se documenta el rendimiento efectivo (calidad de recuperación) a longitudes máximas.
- La licencia es Apache 2.0, pero se añade una Política de Uso Aceptable del proveedor que puede imponer restricciones adicionales al uso comercial; conviene revisarla antes de desplegar en producción.
- El checkpoint oficial usa precisiones NVFP4 y MXFP8, lo que puede degradar ligeramente la calidad frente a una versión en BF16/FP16 no distribuida.
- El modelo está alojado bajo el identificador `txchmechanicus/Inkling-2-Mini`, mientras que la model card referencia `thinkingmachines/Inkling-2-Mini`; verificar la procedencia y autenticidad de los pesos antes de usarlos en producción.
- No se especifican el número de tokens de entrenamiento ni las etapas de alineación (RLHF/DPO), lo que limita la evaluación de su comportamiento en dominios sensibles.
- Fecha de creación del repositorio en Hugging Face: 23 de noviembre de 2026; sin descargas ni likes registrados en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/txchmechanicus/Inkling-2-Mini
- Modelo referenciado en la model card: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
