# trinityomnis/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines y publicado en Hugging Face bajo la cuenta `trinityomnis`. Acepta entradas de texto, imagen y audio, y genera salidas de texto. Está diseñado para desarrolladores que construyen aplicaciones de IA, incluyendo sistemas agénticos con tool use, asistentes de codificación, chatbots y sistemas de retrieval-augmented generation. El modelo se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite investigación, fine-tuning e integración en productos de terceros.

Arquitectónicamente, Inkling es un transformer autoregresivo decoder-only con una espina dorsal de Mixture-of-Experts (MoE) dispersa. Tiene 66 capas, 256 expertos en total, de los cuales 6 se activan por token, más 2 expertos compartidos activos en cada token. La atención es híbrida, combinando capas locales y globales. El modelo es multimodal nativo: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación por tokens discretos, proyectando todas las modalidades a un espacio oculto compartido que procesa el decoder. Según el README, el modelo tiene 975B parámetros totales y 41B activos; el peso real en safetensors es de 952.377.623.626 parámetros. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE) dispersa; 66 capas; 256 expertos, 6 activos por token + 2 compartidos; atención híbrida local/global; multimodal nativo (texto, imagen, audio) |
| Parametros totales | 952.377.623.626 según safetensors; el README declara 975B total |
| Parametros activos | 41B activos (según README) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; disponible en BF16 y NVFP4 |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo decoder-only con una espina dorsal de Mixture-of-Experts (MoE) dispersa. Cada token se enruta a 6 de los 256 expertos, más 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida, alternando capas locales y globales. El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación por tokens discretos. Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. El modelo genera texto en UTF-8.

Los datos de entrenamiento incluyen una amplia variedad de tipos de contenido: texto, imágenes, audio y vídeo. Se obtuvieron de fuentes públicas, de terceros o se generaron sintéticamente. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad o avanzar en objetivos de seguridad. No se especifica si se aplicaron técnicas de RLHF o DPO. El modelo soporta numéricos en BF16 y NVFP4.

## Capacidades

- Generación de texto multimodal: acepta texto, imagen y audio como entrada, y genera texto como salida.
- Razonamiento y matemáticas: obtiene un 97.1% en AIME 2026 y un 87.2% en GPQA Diamond.
- Razonamiento con herramientas: alcanza un 46.0% en HLE con herramientas, frente al 29.7% en HLE solo con texto.
- Codificación y agentes: logra un 77.6% en SWEBench Verified y un 54.3% en SWEBench Pro (Public).
- Tool calling y function calling: el modelo está diseñado para sistemas agénticos y de tool use, como se indica en el README.
- Soporte de agentes y razonamiento multi-paso: habilitado para aplicaciones agénticas y sistemas de retrieval-augmented generation.
- Capacidades multilingües: el idioma principal es el inglés, con capacidades multilingües generales en otros idiomas.
- Procesamiento de audio: acepta audio en formato WAV a 16 kHz, idealmente con duración inferior a 20 minutos.
- Procesamiento de imagen: acepta imágenes en cualquier formato basado en píxeles, con dimensiones recomendadas entre 40 px y 4096 px por lado.

## Casos de uso

- Asistentes conversacionales multimodales: Inkling puede gestionar conversaciones que incluyen imágenes y audio, permitiendo a un chatbot analizar adjuntos o entradas de voz y responder con texto. Es adecuado para soporte al cliente con tickets que incluyen capturas de pantalla o mensajes de voz.
- Agentes con tool use: el modelo soporta tool calling y razonamiento multi-paso, por lo que puede integrarse en pipelines agénticos que necesitan llamar funciones, consultar bases de datos o ejecutar acciones en sistemas externos.
- Asistentes de codificación: con resultados de 77.6% en SWEBench Verified, Inkling es útil para sugerencias de código, revisión de cambios y resolución de issues en repositorios, integrándose en IDEs o pipelines de CI/CD.
- RAG con documentos multimodales: al aceptar texto, imagen y audio, puede indexar y recuperar información de documentos que incluyen diagramas, capturas o grabaciones, generando respuestas contextualizadas.
- Transcripción y análisis de audio: la entrada de audio WAV a 16 kHz permite generar texto a partir de voz, pudiendo usarse para transcripción de reuniones, análisis de llamadas o generación de resúmenes.
- Análisis de imágenes en producción: la entrada de imágenes en formatos basados en píxeles permite descripción de imágenes, extracción de texto (OCR) o clasificación visual, con aplicaciones en moderación de contenido o inspección visual.
- Investigación y fine-tuning: al ser open weights bajo Apache 2.0, el modelo puede ajustarse para dominios específicos, como medicina legal o análisis financiero, sin coste de licencia.

## Benchmarks y rendimiento

Los resultados reportados se obtuvieron con `effort=0.99` y la comparación se generó el 14 de julio de 2026. Los modelos open weights comparados son Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro. Los valores se expresan en porcentaje.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro |
|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | no disponible | 80.6% |
| SWEBench Pro (Public) | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | 55.4% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. Dado el tamaño total de ~952B parámetros en BF16, el modelo completo requiere infraestructura de múltiples GPU de alta capacidad; la cuantización NVFP4 reduce el footprint, pero no se ofrecen cifras oficiales.
- Capacidad en GPU de consumo: no disponible; el tamaño del repositorio es de 1904.8 GB, lo que sugiere que el modelo en BF16 ocupa aproximadamente 1.9 TB, fuera del alcance de hardware de consumo.
- Opciones de despliegue: se recomiendan las recetas de SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face, tal como se indica en el README. También hay acceso vía API a través de proveedores de inferencia de terceros.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara Inkling con tres alternativas open weights de tamaño similar según los benchmarks disponibles. Los parámetros y contexto de los modelos alternativos no se especifican en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento (GPQA Diamond) |
|---|---|---|---|---|---|
| Inkling | 975B total / 41B activos | no disponible | Apache 2.0 | Open weights en Hugging Face | 87.2% |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | Open weights | 86.7% |
| Kimi K2.5 | no disponible | no disponible | no disponible | Open weights | 87.9% |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | Open weights | 88.8% |

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible. Como cualquier modelo entrenado en datos públicos, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: no se ha cuantificado en la documentación. Al ser un modelo generativo, existe riesgo inherente de generar contenido plausible pero incorrecto.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica. El idioma principal es el inglés; las capacidades multilingües son generales y no están garantizadas para todos los idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el README enlaza una política de uso aceptable en `https://thinkingmachines.ai/model-acceptable-use-policy` que debe revisarse antes de desplegar en producción.
- Consideraciones para producción: el modelo es extremadamente grande (~952B parámetros), lo que implica requisitos de infraestructura significativos. No se proporcionan datos de latencia ni throughput. La información disponible proviene de un repositorio espejo (`trinityomnis`), mientras que el modelo original parece estar publicado por `thinkingmachines`.

## Enlaces

- Hugging Face: https://huggingface.co/trinityomnis/Inkling
- Modelo BF16: https://huggingface.co/thinkingmachines/Inkling
- Modelo NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
