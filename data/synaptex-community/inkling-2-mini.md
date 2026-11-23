# synaptex-community/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera salidas de texto. Se publica con pesos abiertos bajo licencia Apache 2.0 y está orientado a desarrolladores que construyen aplicaciones de IA, incluyendo sistemas agénticos con uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). La versión distribuida en Hugging Face bajo el identificador `synaptex-community/Inkling-2-Mini` es un espejo comunitario del checkpoint oficial alojado en `thinkingmachines/Inkling-2-Mini`.

Arquitectónicamente es un transformer decodificador de 24 capas con capas de alimentación directa de tipo Mixture-of-Experts (MoE) disperso: cada token se enruta a 8 de 128 expertos. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. El modelo cuenta con 26,4 mil millones de parámetros totales y 3,4 mil millones de parámetros activos por pasada, lo que se traduce en aproximadamente 5,4 mil millones de parámetros activos efectivos por token al ejecutarse con tres pasadas. La atención es un híbrido de capas locales y globales, y la modalidad de imagen se procesa mediante un vision transformer que proyecta las representaciones al mismo espacio oculto que el texto.

Su relevancia actual radica en la combinación de ventana de contexto de hasta 1 millón de tokens, naturaleza multimodal nativa y un tamaño que permite inferencia en hardware de consumo (32 GB o más de memoria unificada o VRAM), con soporte declarado en ecosistemas como Hugging Face, SGLang, vLLM, llama.cpp, Ollama y Unsloth. La fecha de publicación indicada es el 20 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con MoE disperso y capas centrales repetidas (looped transformer) |
| Parámetros totales | 26.388.646.440 (26,4 B) |
| Parámetros activos | 3,4 B por pasada; ~5,4 B efectivos por token con tres pasadas |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 y MXFP8 nativos; GGUF cuantizado vía llama.cpp y Unsloth; etiqueta 8-bit / modelopt |
| Idiomas soportados | Inglés y soporte multilingüe general (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB en precisión mixta NVFP4/MXFP8) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas de pesos, de las cuales las 12 centrales se reutilizan tres veces, produciendo 48 aplicaciones de capa por token. Cada capa emplea capas de alimentación directa MoE con 128 expertos y enrutamiento de 8 expertos por token. La atención combina capas locales y globales, un patrón habitual para extender contexto manteniendo coste computacional acotado. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto con el texto a un espacio oculto compartido que procesa el decodificador. El modelo admite imágenes de cualquier tipo basado en píxeles, con un rango óptimo de 40 a 4096 píxeles por dimensión.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles públicamente, datos adquiridos a terceros, generados internamente o sintéticos y aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema de capas repetidas y atención híbrida.

## Capacidades

- Generación de texto y razonamiento de propósito general, con instrucciones y conversación multi-turno.
- Comprensión de imágenes: entrada de texto e imagen con salida de texto (pipeline `image-text-to-text`).
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte declarado para sistemas agénticos y uso de herramientas (tool calling / function calling) según la model card.
- Integración en sistemas de generación aumentada por recuperación (RAG).
- Soporte multilingüe general, con inglés como idioma principal.
- Ventana de contexto de hasta 1 millón de tokens para documentos y conversaciones extensas.
- Capacidad de ajuste fino posterior (post-training) mediante plataformas como Miles y SkyRL, y acceso a fine-tuning vía Tinker.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de hasta 1 millón de tokens, manteniendo el contexto de interacciones previas y documentación de producto adjunta.
- Asistentes de código en producción: su soporte de tool calling y su entrenamiento en múltiples lenguajes de programación permiten integrarlo en pipelines de CI/CD para revisión de código, generación de parches y explicación de errores.
- Sistemas RAG sobre documentación extensa: la combinación de contexto de 1M tokens y multimodalidad permite recuperar y razonar sobre manuales, capturas de pantalla y tablas en un mismo flujo.
- Análisis de documentos con imágenes: extracción de información de facturas, informes escaneados o diagramas combinando la entrada visual con texto, con salida estructurada.
- Agentes autónomos multi-paso: el modelo puede encadenar llamadas a herramientas y razonamiento intermedio en tareas de automatización de flujos de trabajo.
- Despliegue en dispositivo local: con ~20 GB en precisión mixta, puede ejecutarse en un DGX Spark o en equipos Apple Silicon con 32 GB o más, habilitando asistentes privados sin conexión.
- Fine-tuning especializado: al publicarse con pesos abiertos y licencia Apache 2.0, equipos de investigación pueden adaptarlo a dominios concretos mediante Tinker, Miles o SkyRL.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de esa tabla no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- Checkpoint único de aproximadamente 20 GB en precisión mixta NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para inferencia.
- Soporte declarado en 1x NVIDIA DGX Spark.
- Soporte en Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Otras GPU con 32 GB o más de VRAM son compatibles según el autor.
- Frameworks de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, llama.cpp (GGUF), Unsloth (incluye GGUF cuantizado), Ollama y Exo Labs en Apple Silicon.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4 B totales / 3,4 B activos | 1M tokens | Apache 2.0 | Pesos abiertos en HF, Tinker |
| Gemma 4 31B | 31 B (según denominación) | no disponible | no disponible | no disponible en la información |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible en la información |
| Qwen3.8-27B | 27 B (según denominación) | no disponible | no disponible | no disponible en la información |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible en la información |

Los modelos de comparación aparecen únicamente citados en la tabla de evaluaciones de la model card; no se dispone de sus especificaciones ni de los resultados numéricos de la comparación.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; al entrenarse con datos de internet y sintéticos, es previsible que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación más allá del filtrado de datos.
- La lista concreta de idiomas soportados no está disponible; el inglés es el idioma principal y el soporte multilingüe se describe como general.
- Aunque la licencia es Apache 2.0, el autor remite a una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales al uso.
- El repositorio analizado (`synaptex-community/Inkling-2-Mini`) es un espejo comunitario con 0 descargas y 0 likes; el checkpoint oficial es `thinkingmachines/Inkling-2-Mini`, por lo que conviene verificar la integridad de los pesos antes de usarlo en producción.
- No se especifican el número de tokens de entrenamiento ni los detalles de alineación (RLHF/DPO), lo que limita la evaluación de su comportamiento en dominios sensibles.
- El rendimiento óptimo con imágenes requiere dimensiones entre 40 y 4096 píxeles por lado.

## Enlaces

- Modelo en Hugging Face (espejo comunitario): https://huggingface.co/synaptex-community/Inkling-2-Mini
- Modelo oficial en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
