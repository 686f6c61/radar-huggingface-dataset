# YuCollection/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto, imagen y audio, y genera texto. Se trata de un transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, además de 2 expertos compartidos activos en todos los tokens. El modelo tiene 975.000 millones de parámetros totales, con 41.000 millones activos por token, lo que lo sitúa en la categoría de modelos frontera de pesos abiertos.

La relevancia de Inkling radica en su combinación de escala masiva con activación dispersa, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño, junto con capacidades nativas multimodales (texto, imagen y audio) integradas en un único decoder. Está pensado para aplicaciones agénticas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se distribuye con pesos abiertos bajo licencia Apache 2.0.

El modelo se publica en BF16 y NVFP4, con soporte para despliegue local mediante SGLang, vLLM, TokenSpeed, Unsloth y la pila de Hugging Face, además de acceso vía API a través de proveedores de inferencia y el playground Tinker. La fecha de creación del repositorio es el 23 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only multimodal con MoE dispersa (66 capas; atención híbrida local/global) |
| Parámetros totales | 975.000 millones (952.377.623.626 según safetensors) |
| Parámetros activos | 41.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 y NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y NVFP4) |

## Arquitectura y entrenamiento

Inkling es un transformer decoder-only de 66 capas con una columna vertebral feed-forward de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos que se activan en todos los tokens. La atención combina capas locales y globales (híbrido). El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, terceros y generación o aumento sintético. El proceso de curación incluye limpieza, procesamiento, deduplicación y filtrado para eliminar datos de baja calidad y avanzar en objetivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. Las entradas admiten texto UTF-8, imágenes en cualquier formato de píxeles (idealmente entre 40 y 4096 px por dimensión) y audio WAV a 16 kHz (idealmente menos de 20 minutos).

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de esfuerzo configurable (los resultados se reportan a effort=0.99).
- Comprensión de imágenes y vídeo mediante codificador jerárquico de parches.
- Comprensión de audio (entrada WAV a 16 kHz).
- Razonamiento con uso de herramientas (HLE with tools reportado).
- Capacidades agénticas de codificación (SWEBench Verified y SWEBench Pro).
- Razonamiento matemático (AIME 2026, GPQA Diamond).
- Soporte multilingüe general, con inglés como idioma principal.
- Uso conversacional multi-turno e instrucciones.
- Integración en sistemas RAG y asistentes de código.

## Casos de uso

- Asistentes de código agénticos: el modelo obtiene un 77,6 % en SWEBench Verified y un 54,3 % en SWEBench Pro (público), lo que lo hace adecuado para pipelines de resolución automática de incidencias, refactorización y generación de parches en repositorios reales.
- Atención al cliente multimodal: puede procesar texto, imágenes (capturas, productos) y audio (mensajes de voz) en una misma conversación, lo que permite gestionar tickets con adjuntos heterogéneos.
- RAG sobre documentación técnica con imágenes y audio: al aceptar entradas multimodales y generar texto, puede responder preguntas sobre manuales que combinan diagramas y notas de voz transcritas.
- Análisis de reuniones y contenido audiovisual: la entrada de audio WAV de hasta 20 minutos permite resumir, extraer acciones y responder preguntas sobre grabaciones.
- Evaluación de imágenes en flujos de moderación o control de calidad: el codificador de parches admite imágenes de hasta 4096 px por dimensión, útil para inspección visual automatizada.
- Razonamiento matemático y científico asistido: con un 97,1 % en AIME 2026 y un 87,2 % en GPQA Diamond, es apto para tutores y asistentes de investigación que requieren cadena de razonamiento.
- Despliegue en producción con cuantización NVFP4: permite servir el modelo en infraestructura con menor huella de memoria que BF16, manteniendo el formato de pesos soportado por vLLM y SGLang.

## Benchmarks y rendimiento

Resultados reportados por el autor a effort=0.99, con comparativas generadas el 14 de julio de 2026.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| HLE (with tools) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | 6 (dato truncado en la fuente) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 975.000 millones de parámetros totales, en BF16 los pesos ocupan aproximadamente 1,95 TB; en NVFP4 la huella se reduce sustancialmente, pero no se publica una cifra oficial.
- GPU recomendadas: no disponible. Por escala, requiere clústeres multi-GPU de clase centro de datos (A100, H100, H200 o superiores); no cabe en una GPU de consumo.
- Cabe en GPU de consumo: no.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth, Hugging Face Transformers, además de API vía proveedores de inferencia y el playground Tinker.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | HLE (tools) | SWEBench Verified |
|---|---|---|---|---|---|---|
| Inkling | 975 B | 41 B | no disponible | Apache 2.0 | 46,0 % | 77,6 % |
| Kimi K2.6 | no disponible | no disponible | no disponible | pesos abiertos | 54,0 % | 80,2 % |
| GLM 5.2 | no disponible | no disponible | no disponible | pesos abiertos | 54,7 % | – |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | pesos abiertos | 48,2 % | 80,6 % |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | pesos abiertos | 37,4 % | 70,7 % |

Los datos de parámetros y contexto de los modelos comparables no se detallan en la información disponible.

## Limitaciones y advertencias

- El idioma principal es el inglés; las capacidades multilingües se describen como generales, sin garantías específicas por idioma.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan tasas específicas.
- No se publican detalles sobre sesgos conocidos ni sobre evaluaciones de seguridad más allá de las menciones genéricas al filtrado de datos.
- La longitud de contexto no se especifica, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio tiene 1.904,8 GB de tamaño, lo que exige infraestructura de almacenamiento y transferencia considerable.
- Aunque la licencia es Apache 2.0, el autor remite a una política de uso aceptable separada que conviene revisar antes de un uso comercial.
- Los benchmarks se reportan a effort=0.99; el rendimiento en configuraciones de esfuerzo menores no se documenta.
- El dato de SWEBench Pro de GPT 5.6 Sol aparece truncado en la fuente.

## Enlaces

- Hugging Face: https://huggingface.co/YuCollection/Inkling
- BF16 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling
- NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
