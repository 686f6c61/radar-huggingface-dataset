# thinkingmachines/TML-d24-varloop-research

## Resumen

TML-d24-varloop-research es un modelo multimodal de investigación desarrollado por Thinking Machines Lab (Thinking Machines) que acepta entradas de texto e imagen y genera texto. Se trata de la variante de bucle variable (variable-loop) de Inkling 2 Mini: mientras que Inkling 2 Mini ejecuta sus capas con bucle un número fijo de veces (3 pasadas), en este modelo el número de pasadas por las capas con bucle puede elegirse en tiempo de inferencia sobre un único conjunto de pesos. Se publica con pesos abiertos para facilitar la investigación sobre modelos con bucles.

Arquitectónicamente es un transformer decoder-only de 24 capas con capas feed-forward de tipo Mixture-of-Experts (MoE) disperso. Las 12 capas centrales se ejecutan un número variable de veces con pesos compartidos, y el modelo se entrenó con entre 1 y 5 pasadas. En cada capa, cada token se enruta a 8 de 128 expertos. La atención es híbrida, combinando capas locales y globales. Es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decoder.

El modelo cuenta con 26.2B parámetros totales y 3.4B activos, con una ventana de contexto de hasta 1M tokens. Su relevancia radica en que, al poder variar el número de pasadas sobre los mismos pesos, permite comparaciones más limpias sobre cómo el cómputo adicional en bucle afecta al cómputo interno y a las capacidades globales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas con bucle variable (12 capas centrales con pesos compartidos) |
| Parametros totales | 26.2B (26.388.646.440 según safetensors) |
| Parametros activos | 3.4B a 1 pasada; 5.4B a 3 pasadas; 7.4B a 5 pasadas (cada pasada adicional añade ~1.0B de parámetros activos efectivos por token) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | Pesos nativos en NVFP4 (capas de expertos), MXFP8 (últimas cuatro capas) y BF16 (resto); versiones GGUF cuantizadas disponibles vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint único de ~20 GB); GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con bucle. Consta de 24 capas decoder-only con capas feed-forward MoE dispersas: cada token se enruta a 8 de 128 expertos por capa. Las 12 capas centrales se ejecutan un número variable de veces compartiendo pesos, con un rango de 1 a 5 pasadas elegible en inferencia. La atención es híbrida (capas locales y globales). La multimodalidad es nativa: un vision transformer codifica las imágenes, que se proyectan junto al texto a un espacio oculto compartido procesado conjuntamente por el decoder.

En cuanto al entrenamiento, comparte preentrenamiento y la primera etapa de midtraining con Inkling 2 Mini. Para el resto del midtraining se entrenó con 1 a 5 pasadas por las capas con bucle, muestreadas en proporción 1:2:6:2:1, y después se hizo post-entrenamiento con 3 pasadas. Dado que las 3 pasadas dominaron el entrenamiento una vez introducido el bucle, el rendimiento en otros recuentos de pasadas puede subestimar lo que lograrían modelos entrenados específicamente para esos recuentos. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas, de terceros, generados internamente o sintéticos, con procesos de limpieza, deduplicación y filtrado.

## Capacidades

- Generación de texto conversacional y autorregresiva.
- Comprensión multimodal de imágenes (image-text-to-text) con entradas de píxeles entre 40px y 4096px por dimensión para rendimiento óptimo.
- Razonamiento con cómputo ajustable: el número de pasadas por las capas con bucle (1 a 5) se elige en inferencia, permitiendo más cómputo por token a costa de mayor latencia.
- Soporte multilingüe general (inglés como idioma principal).
- Contexto largo de hasta 1M tokens.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad de post-entrenamiento con frameworks como Miles y SkyRL.

## Casos de uso

- Investigación sobre modelos con bucles: el caso de uso central. Permite estudiar sobre un mismo conjunto de pesos cómo el cómputo adicional en bucle afecta al cómputo interno y a las capacidades, con comparaciones más limpias que con modelos de bucle fijo.
- Análisis de eficiencia computacional: ajustar el número de pasadas (1 a 5) para trazar curvas de rendimiento frente a coste por token, útil para decidir configuraciones de despliegue.
- Procesamiento de documentos largos con imágenes: gracias a su contexto de 1M tokens y su naturaleza multimodal, puede procesar grandes volúmenes de texto e imágenes conjuntamente en una sola pasada.
- Experimentos de destilación y post-entrenamiento: al distribuirse pesos abiertos y soportar frameworks como Miles y SkyRL, sirve como base para investigación de RL y ajuste fino.
- Evaluación comparativa de precisión numérica: su checkpoint nativo en NVFP4/MXFP8/BF16 permite estudiar el impacto de formatos de baja precisión en modelos MoE con bucle.
- Prototipado en hardware de consumo: con ~20 GB y requisitos de 32 GB de memoria, puede ejecutarse en una RTX 5090, RTX PRO 6000 Blackwell, DGX Spark o Mac con silicio Apple de 32 GB o más para experimentación local.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones con una puntuación por benchmark para TML-d24-varloop-research ejecutado a 1-5 pasadas, junto a Inkling 2 Mini (siempre 3 pasadas). Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada (la tabla aparece truncada y sin cifras). No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al menos 32 GB de GPU o memoria unificada para el checkpoint nativo (~20 GB).
- Configuraciones de ejemplo indicadas por el autor: 1x NVIDIA DGX Spark; 1x GPU NVIDIA con 32 GB o más de VRAM (por ejemplo, GeForce RTX 5090 o RTX PRO 6000 Blackwell); Mac con silicio Apple y 32 GB o más de memoria unificada (por ejemplo, Mac mini).
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) y en Apple silicon de 32 GB o más.
- Precisión nativa: NVFP4 y MXFP8, por lo que el checkpoint no requiere cuantización adicional.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, NVIDIA Dynamo, TokenSpeed, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Ollama y Exo Labs en Apple silicon.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Bucle | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TML-d24-varloop-research | 26.2B | 3.4B (1 pasada) a 7.4B (5 pasadas) | 1M tokens | Variable (1-5) | Apache 2.0 | Pesos abiertos |
| Inkling 2 Mini | No disponible en la información | No disponible en la información | No disponible en la información | Fijo (3 pasadas) | No disponible en la información | No disponible en la información |

El autor advierte explícitamente de que las etapas posteriores de entrenamiento de ambos modelos difieren, por lo que no debe compararse directamente TML-d24-varloop-research con Inkling 2 Mini. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: se publica para apoyar la investigación sobre modelos con bucles, no como producto listo para producción.
- El post-entrenamiento se hizo con 3 pasadas, que dominaron el entrenamiento; el rendimiento a otros recuentos de pasadas puede subestimar lo alcanzable por modelos entrenados específicamente para esos recuentos.
- No debe compararse directamente con Inkling 2 Mini porque sus etapas posteriores de entrenamiento difieren.
- No está disponible a través de API (incluido Tinker); solo se distribuye como pesos abiertos.
- Idiomas: inglés como principal, con soporte multilingüe general; no se detallan idiomas concretos.
- Riesgo de sesgos y alucinaciones inherente a los modelos de lenguaje; no se documentan sesgos específicos en la información disponible.
- Requiere al menos 32 GB de memoria, lo que excluye muchas GPU de consumo de gama media.
- Sujeto a la Política de Uso Aceptable del modelo de Thinking Machines además de la licencia Apache 2.0.
- Solo 15 descargas y 0 likes en el momento de la consulta, lo que refleja un modelo muy reciente (publicado el 20 de noviembre de 2026) con escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Blog de Inkling 2 Mini en Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang para Inkling 2 Mini: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM para Inkling 2 Mini: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Documentación de Unsloth para Inkling 2 Mini: https://unsloth.ai/docs/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
