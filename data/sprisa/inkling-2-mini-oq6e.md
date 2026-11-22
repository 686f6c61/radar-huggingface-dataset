# sprisa/Inkling-2-Mini-oQ6e

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: asistentes de código, sistemas agénticos con uso de herramientas, chatbots y pipelines de generación aumentada por recuperación (RAG). Su principal singularidad arquitectónica es ser un transformer "looped": 24 capas de pesos reales, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, produciendo 48 aplicaciones de capa por token.

El modelo combina un decoder-only transformer con capas feed-forward de mezcla dispersa de expertos (MoE): cada token se enruta a 8 de 128 expertos por capa. La atención es híbrida, alternando capas locales y globales, y la modalidad visual se integra de forma nativa mediante un vision transformer que proyecta imágenes y texto a un espacio oculto compartido. El checkpoint distribuido en este repositorio es una cuantización de 6 bits (oQ6e) del modelo original, con un tamaño de 17,9 GB y 26.388.646.400 parámetros totales según los safetensors.

La relevancia actual del modelo reside en su relación entre tamaño y capacidades: 26,4B parámetros totales con solo 3,4B activos por paso (5,4B efectivos por token al ejecutarse tres pasadas por las capas looped), una ventana de contexto de hasta 1M tokens y soporte de cuantizaciones de 4 y 8 bits (NVFP4 y MXFP8) que permiten inferencia local en hardware de consumo. Esta ficha documenta la variante oQ6e alojada por el usuario sprisa, derivada del checkpoint oficial de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas MoE dispersas y bucle de capas (looped transformer); atención híbrida local/global; vision transformer nativo |
| Parametros totales | 26.388.646.400 (26,4B) |
| Parametros activos | 3,4B por paso; 5,4B efectivos por token (tres pasadas por las 12 capas centrales) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 en el checkpoint oficial; esta variante es una cuantización de 6 bits (oQ6e); existen versiones GGUF cuantizadas |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF disponible mediante Unsloth y llama.cpp |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autorregresivo multimodal de 24 capas con capas feed-forward de mezcla de expertos dispersa: cada token se enruta a 8 de 128 expertos en cada capa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que el modelo realiza 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada pasada adicional por las capas looped añade aproximadamente 1,0B de parámetros activos efectivos, lo que resulta en 5,4B efectivos por token con las tres pasadas. La atención es híbrida, combinando capas locales y globales, lo que permite sostener una ventana de contexto de hasta 1M tokens.

El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las entradas de imagen como las de texto se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente. El entrenamiento utilizó datos de texto, imágenes y vídeo procedentes de fuentes públicas de internet, repositorios accesibles públicamente, datos generados internamente y datos sintéticos o aumentados; el pipeline de curación incluyó deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones conversacionales multi-turno.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 px y 4096 px.
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Capacidades multilingües generales, con inglés como idioma principal.
- Contexto largo de hasta 1M tokens para documentos extensos y conversaciones prolongadas.
- Integración con plataformas de post-entrenamiento (Miles, SkyRL) y de ajuste fino (Tinker).

## Casos de uso

- Asistencia de código en producción: el modelo genera y revisa código en varios lenguajes y admite tool calling, lo que permite integrarlo en pipelines de CI/CD como revisor automatizado o generador de parches.
- Sistemas agénticos con herramientas: su soporte de function calling y razonamiento multi-paso lo hace adecuado para agentes que consultan APIs, ejecutan comandos y encadenan acciones sobre un estado persistente.
- Generación aumentada por recuperación (RAG): con 1M tokens de contexto puede ingerir corpus documentales extensos y responder preguntas con grounding sobre el material recuperado.
- Análisis de documentos con imágenes: al aceptar entradas visuales y de texto conjuntamente, puede procesar facturas, capturas de pantalla, diagramas o páginas escaneadas junto a instrucciones textuales.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo, manteniendo el hilo de la conversación durante sesiones extensas sin truncar el historial.
- Asistentes de accesibilidad: descripción de imágenes y respuesta a preguntas visuales en aplicaciones que requieren interpretar contenido gráfico en tiempo real.
- Ajuste fino específico de dominio: al publicarse con pesos abiertos y soporte en Tinker, Miles y SkyRL, puede post-entrenarse para tareas verticales (legal, médico, soporte interno) sin partir de cero.
- Inferencia local en estaciones de trabajo: su tamaño compacto y las cuantizaciones NVFP4/MXFP8 permiten desplegarlo en un DGX Spark o en Apple Silicon con 32 GB o más de memoria.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos de las celdas no están presentes en la información proporcionada (solo se incluyen las cabeceras y la estructura de la tabla). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint oficial se distribuye como un único archivo de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- Esta variante oQ6e ocupa 17,9 GB en el repositorio de Hugging Face.
- Hardware validado por el autor: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Se recomiendan 32 GB o más de VRAM en otras GPU; no se especifican modelos concretos como A100, H100 o RTX 4090 en la documentación disponible.
- Frameworks de inferencia soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp, Llama App, Ollama y Exo Labs (estos dos últimos en Apple Silicon).
- Frameworks de post-entrenamiento: Miles y SkyRL.
- No se proporcionan datos de latencia ni throughput estimados en la información disponible.

## Comparativa con modelos similares

La model card compara Inkling 2 Mini con cuatro alternativas, aunque sin valores numéricos de rendimiento en la información disponible. La comparación se limita a lo que se puede inferir de los datos aportados:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en HF; API vía Tinker |
| Gemma 4 31B | 31B (según nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparados en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad específicas; el autor indica que el filtrado de datos incluyó objetivos de seguridad, pero no se detallan resultados.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado métricas de fidelidad factual en la información disponible.
- El soporte multilingüe se describe como "general", con el inglés como idioma principal; no hay evaluación por idioma.
- Aunque la licencia es Apache 2.0, el autor remite a una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales al uso comercial; conviene revisarla antes de desplegar en producción.
- Esta variante concreta (oQ6e) es una cuantización de 6 bits realizada por un tercero (sprisa), no el checkpoint oficial; puede presentar degradación de calidad respecto al original en precisiones NVFP4/MXFP8.
- El repositorio no registra descargas ni interacciones y fue creado y actualizado el mismo día; no hay evidencia de validación comunitaria de esta cuantización.
- El contexto de 1M tokens puede implicar costes de memoria y latencia elevados en inferencia local; no se aportan cifras de rendimiento a esa longitud.
- No se especifican los tokens de entrenamiento ni la composición exacta del dataset, lo que dificulta evaluar la cobertura y los posibles sesgos de los datos.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/sprisa/Inkling-2-Mini-oQ6e
- Checkpoint oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
