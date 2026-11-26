# wrbycker93/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones conversacionales, asistentes de código, sistemas agénticos con uso de herramientas y pipelines de generación aumentada por recuperación (RAG). Su relevancia actual radica en que combina un tamaño compacto (26.400 millones de parámetros totales, con un tamaño de repositorio de unos 20 GB) con una ventana de contexto de hasta 1 millón de tokens, lo que lo sitúa en una categoría poco habitual para modelos de su escala.

Arquitectónicamente es un transformer decodificador de 24 capas con capas de alimentación directa de tipo Mixture-of-Experts (MoE) disperso y un esquema de "looping" en el que las 12 capas centrales se ejecutan tres veces compartiendo pesos, lo que da 48 aplicaciones de capa por token. Es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio latente compartido que procesa el decodificador.

El modelo se distribuye con cuantización mixta NVFP4 y MXFP8, lo que permite ejecutarlo en hardware de consumo y en estaciones de trabajo compactas (una NVIDIA DGX Spark, Apple Silicon con 32 GB o más de memoria, o GPUs con 32 GB o más de VRAM recomendados), algo relevante para desarrolladores que necesitan desplegar un modelo multimodal grande en local sin infraestructura de centro de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con MoE disperso y capas centrales reutilizadas en bucle (looped transformer), atención híbrida local/global, vision transformer para imágenes |
| Parametros totales | 26.400 millones (26.388.646.440 según safetensors) |
| Parametros activos | 3.400 millones por paso; 5.400 millones efectivos por token (tres pasadas por las capas en bucle, ~1.000 millones adicionales por pasada) |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 en el checkpoint oficial; versiones GGUF cuantizadas disponibles vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (lista explícita de idiomas no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers); GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de 24 capas con capas MoE dispersas en las que cada token se enruta a 8 de 128 expertos. La innovación principal es el esquema de bucle: las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que un token atraviesa 48 aplicaciones de capa a partir de solo 24 capas de pesos. Esto incrementa la capacidad efectiva sin aumentar proporcionalmente el número de parámetros almacenados, y cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos. La atención combina capas locales y globales, lo que probablemente contribuye a sostener la ventana de contexto de 1 millón de tokens. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto con el texto a un espacio oculto compartido.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios públicos, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. Las precisiones numéricas soportadas son NVFP4 y MXFP8.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones y uso conversacional.
- Procesamiento de imágenes: acepta cualquier imagen basada en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 y 4096 píxeles.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y uso de herramientas (tool use / function calling), según la orientación de uso indicada por el autor.
- Soporte multilingüe general, con inglés como idioma principal.
- Ventana de contexto de hasta 1 millón de tokens, apta para documentos y conversaciones extensas.
- Capacidad de ajuste fino posterior (post-training) mediante las plataformas Miles y SkyRL.

## Casos de uso

- Asistentes conversacionales de atención al cliente: el modelo puede mantener conversaciones multi-turno con contexto muy largo gracias a su ventana de 1 millón de tokens, lo que permite arrastrar historiales extensos y documentación de producto sin truncar.
- Asistentes de código en producción: con soporte de tool calling y generación en múltiples lenguajes, puede integrarse en pipelines de CI/CD para revisión de código, generación de parches y explicación de errores.
- RAG multimodal: al procesar conjuntamente texto e imágenes en un espacio compartido, es adecuado para responder preguntas sobre documentos escaneados, capturas de pantalla o informes con gráficos.
- Agentes multi-paso: su orientación explícita a sistemas agénticos y tool use permite construir flujos que consultan APIs, ejecutan acciones y razonan sobre resultados intermedios.
- Despliegue local en estación de trabajo: con unos 20 GB de checkpoint en NVFP4/MXFP8, puede ejecutarse en una NVIDIA DGX Spark o en Apple Silicon con 32 GB o más, útil para prototipado y entornos con requisitos de privacidad.
- Análisis de imágenes en aplicaciones de accesibilidad o documentación técnica: descripción y extracción de información de imágenes dentro del rango de 40 a 4096 píxeles por dimensión.
- Ajuste fino para dominios verticales: la disponibilidad de pesos abiertos y el soporte de Miles y SkyRL permiten adaptar el modelo a tareas especializadas con datos propios.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones que compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de dicha tabla no están disponibles en la información proporcionada (el contenido se corta antes de mostrar los valores). Por tanto:

No se han publicado resultados de benchmarks utilizables en la información disponible.

## Requisitos de hardware

- Checkpoint oficial de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para inferencia con el checkpoint oficial.
- Hardware soportado oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- Otras GPUs y plataformas son posibles con 32 GB o más de VRAM recomendados; no se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Frameworks de inferencia soportados: Hugging Face (transformers), SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Llama App; en Apple Silicon, Ollama y Exo Labs.
- Frameworks de post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card proporciona una tabla comparativa con los siguientes modelos, aunque sin los valores numéricos de rendimiento:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 5,4B activos efectivos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face y Tinker |
| Gemma 4 31B | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los datos de parámetros, contexto, licencia y disponibilidad de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos ni evaluaciones de seguridad específicas; el autor indica que aplica filtrado de datos con objetivos de seguridad, pero no se publican resultados.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de alucinación ni evaluaciones específicas.
- El soporte de idiomas se describe de forma genérica ("inglés y soporte multilingüe general") sin lista explícita; el rendimiento en idiomas distintos del inglés no está cuantificado.
- Aunque la licencia es Apache 2.0, el autor enlaza una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales al uso; conviene revisarla antes de un despliegue comercial.
- El modelo se distribuye en precisiones NVFP4 y MXFP8; el comportamiento en otras precisiones (por ejemplo, FP16 o BF16) no está documentado en la información disponible.
- El rendimiento óptimo con imágenes requiere dimensiones entre 40 y 4096 píxeles; fuera de ese rango no se garantiza la calidad.
- El modelo tiene 0 descargas y 0 likes en el repositorio de Hugging Face en el momento de la consulta, y fue creado y actualizado el mismo día, por lo que no hay evidencia de adopción ni validación por parte de la comunidad.
- El ID del repositorio en Hugging Face (wrbycker93/Inkling-2-Mini) no coincide con el indicado en la model card (thinkingmachines/Inkling-2-Mini), lo que conviene verificar antes de descargar pesos para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wrbycker93/Inkling-2-Mini
- Repositorio indicado en la model card: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers (PyPI): https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
