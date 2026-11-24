# unsloth/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera salidas de texto. Se publicó el 20 de noviembre de 2026 con pesos abiertos bajo licencia Apache 2.0, lo que lo hace apto tanto para investigación como para integración en productos comerciales de terceros. El repositorio analizado es la cuantización GGUF realizada por Unsloth a partir del checkpoint original `thinkingmachines/Inkling-2-Mini`.

Arquitectónicamente es un transformer decoder-only de 24 capas con capas de feed-forward MoE dispersas: cada token se enruta a 8 de 128 expertos por capa. Una innovación destacable es el bucle de pesos: las 12 capas centrales se ejecutan tres veces con pesos compartidos, produciendo 48 aplicaciones de capa por token a partir de 24 capas de pesos. El modelo tiene 26.200 millones de parámetros totales y aproximadamente 3.400 millones de parámetros activos, que ascienden a unos 5.400 millones efectivos por token debido a las tres pasadas por las capas bucleadas.

Su relevancia actual radica en la combinación de multimodalidad nativa (visión mediante vision transformer), eficiencia MoE y un tamaño que permite ejecución local en hardware de consumo alto o estaciones de trabajo. El checkpoint original se distribuye en unas 20 GB con precisión mixta NVFP4 y MXFP8, y las cuantizaciones GGUF de Unsloth permiten bajarlo hasta 7,76 GB con la variante UD-IQ1_S.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas (looped transformer) |
| Parámetros totales | 26.070.390.272 (26,2B) |
| Parámetros activos | 3,4B (5,4B efectivos por token con las tres pasadas) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Unsloth Dynamic 3.1: UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_M, UD-Q4_K_XL, UD-Q8_K_XL; checkpoint original en NVFP4 y MXFP8 |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el checkpoint original |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas decoder-only. Las capas de feed-forward son Mixture-of-Experts dispersas: cada token se enruta a 8 de 128 expertos. La atención es híbrida, combinando capas locales y globales. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa efectivas a partir de 24 capas de pesos; según la model card, cada pasada adicional por las capas bucleadas añade aproximadamente 1.000 millones de parámetros activos efectivos.

La multimodalidad es nativa: las imágenes se codifican mediante un vision transformer y tanto las entradas de imagen como las de texto se proyectan a un espacio oculto compartido que procesa conjuntamente el decoder. El checkpoint original se distribuye en precisión mixta NVFP4 y MXFP8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con instrucciones.
- Comprensión de imágenes y razonamiento conjunto sobre imagen y texto (pipeline image-text-to-text).
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Razonamiento multi-paso para agentes y asistentes de código.
- Capacidades multilingües generales, con inglés como idioma principal.
- Uso en sistemas RAG y chatbots.
- Fine-tuning disponible mediante la plataforma Tinker y mediante Unsloth.

## Casos de uso

- Asistentes de código en producción: el modelo soporta tool calling y múltiples lenguajes de programación, por lo que puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests y explicación de errores de compilación.
- Agentes autónomos con uso de herramientas: su soporte de function calling y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten comandos y encadenen acciones con verificación intermedia.
- Automatización de atención al cliente: puede gestionar conversaciones multi-turno con contexto conversacional, aunque la longitud exacta de contexto no está publicada.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma nativa, sirve para extraer información de capturas, diagramas o interfaces y responder preguntas sobre ellos.
- Generación aumentada por recuperación (RAG): adecuado para asistentes internos que combinan recuperación de documentos con generación, gracias a su tamaño contenido y licencia permisiva.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 7,76 a 17,63 GB puede ejecutarse en Apple Silicon de 32 GB o más y en GPUs con 32 GB de VRAM, lo que facilita prototipos y entornos con requisitos de privacidad.
- Fine-tuning específico de dominio: la licencia Apache 2.0 y las herramientas de Unsloth y Tinker permiten adaptar el modelo a verticales concretas sin restricciones de uso comercial.

## Benchmarks y rendimiento

La model card de Unsloth publica métricas de calidad de cuantización frente a UD-Q8_K_XL, no benchmarks de tareas:

| Cuantización | Tamaño (GB) | KLD media vs UD-Q8_K_XL | Mismo token top-1 |
|---|---|---|---|
| UD-IQ1_S | 7,76 | 0,0911 | 89,4% |
| UD-IQ1_M | 8,02 | 0,0867 | 90,2% |
| UD-IQ2_XXS | 8,49 | 0,0726 | 90,6% |
| UD-Q2_K_XL | 9,14 | 0,0595 | 91,6% |
| UD-IQ3_XXS | 11,66 | 0,0269 | 94,7% |
| UD-Q3_K_XL | 13,63 | 0,0174 | 96,3% |
| UD-IQ4_XS | 15,73 | 0,0109 | 97,7% |
| UD-Q4_K_M | 16,61 | 0,0108 | 97,9% |
| UD-Q4_K_XL | 17,63 | 0,0107 | 98,0% |
| UD-Q8_K_XL | 22,87 | referencia | — |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 8 GB con UD-IQ1_S (7,76 GB de pesos) hasta unos 23 GB con UD-Q8_K_XL (22,87 GB); las variantes Q4 rondan los 16-18 GB.
- Hardware soportado oficialmente por el autor del modelo: 1x NVIDIA DGX Spark, dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio) y otras GPUs con 32 GB o más de VRAM recomendados.
- GPU consumer: las cuantizaciones Q4 y Q3 caben en GPUs de 24 GB como la RTX 4090; las variantes IQ1/IQ2 podrían caber en GPUs de 12-16 GB, aunque con pérdida de calidad medible (KLD de hasta 0,09).
- Opciones de despliegue: llama.cpp (soportado explícitamente), Unsloth Desktop GUI (hasta 1,9x más rápido según el autor de la cuantización), endpoints compatibles según los tags del repo, y la plataforma Tinker para inferencia y fine-tuning vía API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural, el propio checkpoint original `thinkingmachines/Inkling-2-Mini` es la alternativa directa en safetensors y precisión NVFP4/MXFP8, con menor portabilidad pero mayor fidelidad que las cuantizaciones GGUF.

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling 2 Mini (este repo, GGUF) | 26,2B | 3,4B (5,4B efectivos) | no disponible | Apache 2.0 | GGUF |
| Inkling 2 Mini (original) | 26,2B | 3,4B (5,4B efectivos) | no disponible | Apache 2.0 | safetensors, NVFP4/MXFP8 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos; debe evaluarse empíricamente antes de desplegar en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluaciones publicadas de fidelidad factual.
- La longitud de contexto no está documentada, lo que impide planificar con precisión cargas de contexto largo.
- El idioma principal es el inglés; el soporte multilingüe es genérico y no está cuantificado.
- Las cuantizaciones agresivas (IQ1, IQ2) degradan la calidad de forma medible: KLD de 0,09 y solo un 89-91% de coincidencia en el token top-1 frente a Q8.
- La licencia Apache 2.0 permite uso comercial, pero el autor publica una Model Acceptable Use Policy que debe revisarse y respetarse.
- El checkpoint original requiere precisión NVFP4/MXFP8 y hardware específico; el uso de GGUF es la vía práctica para hardware convencional.
- No hay información sobre latencia ni throughput en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Guía de ejecución de Unsloth: https://unsloth.ai/docs/models/inkling-2-mini
- Benchmarks de cuantización Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
