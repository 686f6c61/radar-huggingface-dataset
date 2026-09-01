# wyattearp/Gemma-4-26B-A4B-it-NVFP4

## Resumen

Gemma-4-26B-A4B-it-NVFP4 es una versión cuantizada en precisión mixta del modelo MoE de Google DeepMind Gemma-4-26B-A4B-it, publicada por el usuario wyattearp. El checkpoint original en BF16 ocupa 49,2 GiB; esta versión reduce el footprint a 16,07 GiB (una reducción del 67,3 %) mediante cuantización NVFP4 de los bloques de expertos, manteniendo atención, routers, embeddings y cabeza de salida en BF16. Está diseñado específicamente para ejecutarse en hardware NVIDIA Blackwell con instrucciones nativas de tensor core FP4, como DGX Spark, GB200, B200 o la serie RTX 50.

El modelo base es un MoE con 26 000 millones de parámetros totales y aproximadamente 4 000 millones activos por token, con 128 expertos y enrutamiento top-4 (según la model card del autor; otras fuentes indican top-8). Soporta una ventana de contexto de hasta 262 144 tokens y, en su versión original, es multimodal (texto e imagen), aunque este checkpoint cuantizado se publica como generador de texto. La relevancia de esta versión radica en que permite desplegar un modelo de 26B en una GPU de consumo de gama alta (RTX 5090) o en una DGX Spark de 128 GB, con una huella de memoria muy reducida y aceleración nativa FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 128 expertos, enrutamiento top-4 por token (segun la model card del autor; otras fuentes indican top-8) |
| Parametros totales | 13 564 218 672 (parametros almacenados en el checkpoint cuantizado NVFP4); el modelo base tiene 26B |
| Parametros activos | ~4B por token (modelo base) |
| Longitud de contexto | 262 144 tokens (segun la model card; el modelo base soporta hasta 256K segun otras fuentes) |
| Tipos de cuantizacion | NVFP4 (E2M1, block size 16) para los MLP de los 128 expertos; BF16 para atencion, routers, embeddings y LM head; escalares FP8 por bloque |
| Idiomas soportados | Ingles (segun la model card); el modelo base soporta mas de 140 idiomas |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors, formato compressed-tensors / modelopt |

## Arquitectura y entrenamiento

El modelo base Gemma-4-26B-A4B-it es un transformer MoE con 128 expertos enrutados por token (top-4 según la model card del autor, aunque la documentación de vLLM indica top-8). La cuantización NVFP4 aplica una partición por bloques de 16 elementos a lo largo de la dimensión interna de las capas lineales de los expertos, con un escalar FP8 por bloque calculado a partir del máximo absoluto de cada bloque. Los componentes sensibles a la precisión —atención (q, k, v, o), routers, embeddings y la cabeza de salida— se mantienen en BF16 para preservar la geometría de RoPE, la dinámica de los logits de enrutamiento y la entropía del vocabulario de 256 000 tokens.

No se dispone de información detallada sobre el entrenamiento del modelo base en la documentación proporcionada. Se sabe que es un modelo de Google DeepMind, con capacidades multimodales (texto e imagen) en su versión original, y que ha pasado por los mismos protocolos de seguridad que los modelos propietarios de Google. Esta versión cuantizada es un ajuste posterior (PTQ) realizado con NVIDIA ModelOpt, sin entrenamiento adicional.

## Capacidades

- Generación de texto conversacional y de larga forma, con soporte de modo de razonamiento (thinking mode) integrado.
- Razonamiento complejo y matemático, gracias a la arquitectura MoE con 4B activos y 128 expertos especializados.
- Generación de código y comprensión de lenguajes de programación, con soporte de tool calling / function calling mediante el parser `gemma4` en vLLM.
- Capacidades multilingües en el modelo base (más de 140 idiomas), aunque este checkpoint se publica con etiqueta de inglés.
- Soporte de agentes y razonamiento multi-paso, con protocolo de tool-use y transiciones entre canales de pensamiento y llamadas a herramientas.
- No se indica soporte de visión en esta versión cuantizada; el pipeline declarado es text-generation.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262 144 tokens) gracias a su ventana amplia, manteniendo el historial completo de la interacción y generando respuestas coherentes con herramientas de consulta a bases de conocimiento.
- Generación de código en producción: con soporte de tool calling y el parser `gemma4`, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, ejecutando llamadas a funciones externas (por ejemplo, APIs de compilación o pruebas).
- Asistente de razonamiento para análisis de documentos extensos: su modo de pensamiento permite descomponer problemas complejos y procesar documentos de gran tamaño (informes, contratos, artículos) dentro de la ventana de contexto.
- Chatbot de soporte técnico especializado: al ser un MoE con 4B activos, ofrece baja latencia en inferencia, adecuado para entornos interactivos donde se requiere respuesta rápida sin sacrificar calidad.
- Despliegue en edge o estaciones de trabajo con GPU Blackwell: su footprint de 16,07 GiB permite ejecutarlo en una RTX 5090 (32 GB) o DGX Spark (128 GB) con amplio margen para KV cache, ideal para prototipado local y experimentación.
- Automatización de tareas de agente con razonamiento multi-paso: el modelo puede encadenar llamadas a herramientas, razonar sobre los resultados y continuar la ejecución, útil para flujos de trabajo de automatización de procesos (RPA) o investigación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan comparativas con el modelo base en BF16 o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 16,07 GiB en disco; en memoria, con overhead de runtime y KV cache, se recomienda al menos 24 GB de VRAM para contextos moderados. La model card indica que cabe en una DGX Spark de 128 GB o RTX 5090 (32 GB) con espacio suficiente para contextos de hasta 262 144 tokens.
- GPU recomendadas: arquitectura NVIDIA Blackwell con soporte nativo NVFP4 (GB10 / DGX Spark, GB200, B200, RTX 50-series). No se garantiza funcionamiento en GPUs Ampere o Ada sin emulación FP4.
- Opciones de despliegue: vLLM (comando `vllm serve` con `--dtype auto` y `--tool-call-parser gemma4`). También es compatible con el ecosistema compressed-tensors / modelopt.
- Latencia y throughput: no se proporcionan cifras concretas. La model card menciona aceleración de decode y prefill mediante kernels CUTLASS y FlashInfer FP4 MoE, pero sin valores numéricos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos MoE de tamaño similar (por ejemplo, Qwen2.5-32B-A4B o DeepSeek-V3-Lite) en la información proporcionada. La comparativa requeriría ejecutar benchmarks estandarizados en el mismo hardware, lo cual no se ha documentado. Se puede señalar que, frente al modelo base en BF16, esta versión reduce el footprint en un 67,3 % con una pérdida de calidad presumiblemente mínima (no cuantificada), a costa de requerir hardware Blackwell específico.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell con soporte NVFP4; no funcionará en GPUs más antiguas sin emulación, lo que limita su portabilidad.
- La model card advierte de un bug en el parser de tool calling de vLLM (issue #54256) que puede provocar llamadas a herramientas truncadas o fragmentadas al transicionar desde el canal de pensamiento. Se recomienda aplicar el parche del PR #54257 hasta que se incluya en una release oficial.
- El modelo base es multimodal, pero esta versión cuantizada se publica como text-generation; no se garantiza el soporte de entrada de imágenes.
- La licencia Gemma Terms of Use impone restricciones de uso comercial; es necesario revisar los términos antes de desplegar en producción.
- No se han publicado evaluaciones de sesgos, alucinación o robustez para esta versión cuantizada. Como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- El idioma declarado es inglés; aunque el modelo base soporta más de 140 idiomas, esta versión no documenta el rendimiento multilingüe tras la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyattearp/Gemma-4-26B-A4B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Bug report de vLLM: https://github.com/vllm-project/vllm/issues/54256
- Pull request de corrección: https://github.com/vllm-project/vllm/pull/54257
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentación de vLLM para Gemma 4: https://recipes.vllm.ai/Google/gemma-4-26B-A4B-it
