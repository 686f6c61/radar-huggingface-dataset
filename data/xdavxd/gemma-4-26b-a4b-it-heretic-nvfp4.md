# xdavxd/gemma-4-26B-A4B-it-heretic-NVFP4

## Resumen

Este modelo es una versión cuantizada en NVFP4 de `coder3101/gemma-4-26B-A4B-it-heretic`, que a su vez es una variante "heretic" de `google/gemma-4-26B-A4B-it`. La cuantización ha sido realizada por xdavxd con LLM Compressor, la herramienta de compresión de vLLM. El principal problema que resuelve es el despliegue de modelos grandes en entornos con memoria limitada: al convertir de 16 bits a 4 bits tanto los pesos como las activaciones de los operadores lineales, el tamaño en disco y el consumo de VRAM se reducen aproximadamente un 68% respecto a la variante sin cuantizar.

Arquitectónicamente es un modelo Gemma 4 de tipo mixture-of-experts con 25.805.936.206 parámetros totales y, según su nombre, unos 4 mil millones de parámetros activos por token. Su entrada acepta texto e imágenes y su salida es texto (pipeline image-text-to-text), por lo que es multimodal. En el ejemplo de despliegue vLLM se utiliza una ventana de contexto de 32768 tokens, aunque la ficha no especifica el máximo oficial. Es un modelo de instrucción con soporte de razonamiento ("thinking") y tool calling.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer con mixture-of-experts y encoder de visión) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4.000 millones (inferido del nombre "A4B"; no especificado oficialmente) |
| Longitud de contexto | No especificada oficialmente; el ejemplo de vLLM usa 32768 tokens |
| Tipos de cuantizacion | NVFP4: pesos y activaciones en FP4 para operadores lineales; la torre de visión, embeddings, lm_head y routers MoE se mantienen en precisión original |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (según la model card); enlace a la licencia Gemma 4 en https://ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | safetensors con cuantización NVFP4 (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4, un transformer con mixture-of-experts en el que se activan aproximadamente 4 mil millones de parámetros por token. Además del módulo de texto, incorpora un encoder de visión, por lo que puede procesar imágenes como entrada. La variante "heretic" aplica Arbitrary-Rank Ablation (ARA), una técnica de compresión de rangos desarrollada por RedHatAI, que reduce el tamaño del modelo manteniendo en lo posible su precisión.

Posteriormente, esta variante se ha cuantizado con LLM Compressor: todos los operadores lineales dentro de los bloques transformer (proyecciones de atención, capas MLP compartidas y capas de expertos MoE) se convierten a NVFP4, excepto la torre de visión, los embeddings, la cabeza de salida y los routers MoE. Para la calibración se utilizó el dataset Ultrachat 200k con 512 muestras y una longitud máxima de secuencia de 2048 tokens.

## Capacidades

- Generación de texto con modo de razonamiento ("thinking") activable por defecto en el chat template (`enable_thinking: true`).
- Entrada multimodal: texto e imágenes; el ejemplo de vLLM permite hasta 4 imágenes y 1 audio por petición.
- Tool calling y function calling soportados, con parser específico `gemma4`.
- Compatible con agentes y razonamiento multi-paso, gracias al modo thinking y al soporte de herramientas.
- Integración con vLLM, incluyendo multi-GPU, precaching de prefijos y API compatible con OpenAI.
- Capacidades multilingües no especificadas en la información disponible.

## Casos de uso

- **Atención al cliente automatizada**: permite gestionar conversaciones multi-turno con un contexto de hasta 32768 tokens, y puede consultar bases de datos externas mediante tool calling. El modo thinking le permite razonar sobre el problema antes de responder.
- **Asistencia técnica multimodal**: al recibir capturas de pantalla o imágenes de documentos, puede explicar errores de software, instrucciones de montaje o resúmenes de informes, lo que resulta útil en mesas de ayuda.
- **Generación de documentación técnica**: redacción de manuales, fichas de producto o documentación de API, aprovechando la ventana larga de contexto para mantener coherencia a lo largo de documentos extensos.
- **Análisis de informes escaneados**: extracción de datos de documentos con tablas o diagramas (entrada por imagen) y posterior elaboración de resúmenes razonados, sin necesidad de OCR previo.
- **Desarrollo de agentes de software**: integración en pipelines de CI/CD para revisar código, generar tests o automatizar tareas que requieren llamadas a funciones; el soporte de tool calling permite interacciones estructuradas con APIs.
- **Razonamiento matemático y científico**: resolución de problemas de tipo MATH-500 o AIME 2025 gracias al modo thinking, útil en entornos educativos o de investigación que necesiten explicaciones paso a paso.
- **Despliegue en equipos con VRAM limitada**: la cuantización NVFP4 reduce los requisitos de memoria, permitiendo ejecutar el modelo en una GPU de consumo de 24GB (por ejemplo, RTX 4090) con configuraciones de contexto ajustadas.

## Benchmarks y rendimiento

Según la información disponible, el modelo ha sido evaluado con `lm-evaluation-harness` y `lighteval` en GSM8K Platinum, MMLU-Pro, IFEval, MATH-500, AIME 2025, GPQA Diamond y LiveCodeBench v6, con el modo thinking activado. No obstante, los resultados numéricos completos no han sido publicados en la información proporcionada. Solo se ha reportado la divergencia KL respecto al modelo original (google/gemma-4-26B-A4B-it):

| Métrica | Este modelo | Original (google/gemma-4-26B-A4B-it) |
|---|---|---|
| KL divergence | 0.0499 | 0 |

Los valores del resto de las métricas no están disponibles.

## Requisitos de hardware

- **VRAM estimada**: los pesos en FP4 suponen aproximadamente 12.9 GB (25.8B parámetros × 4 bits), más activaciones, KV-cache y overhead. El tamaño del repositorio es de 16.5 GB, por lo que en la práctica se recomienda una VRAM de 18 a 24 GB para contextos moderados.
- **GPU recomendada**: RTX 4090 (24GB) para una sola GPU con contexto de 32768 tokens; A100 40GB o H100 80GB para contextos más largos o mayor throughput.
- **Compatibilidad con GPUs de consumo**: es viable en RTX 3090/4090 de 24GB si se ajusta el tamaño de contexto y la utilización de memoria.
- **Opciones de despliegue**: vLLM con los argumentos `--max-model-len 32768 --gpu-memory-utilization 0.90`. Para razonamiento y tool calling: `--enable-auto-tool-choice --reasoning-parser gemma4 --tool-call-parser gemma4 --chat-template examples/tool_chat_template_gemma4.jinja`. También soporta API compatible con OpenAI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it | 25.8B | No especificado | No (modelo original) | No especificada en la información disponible | HuggingFace |
| coder3101/gemma-4-26B-A4B-it-heretic | 25.8B | No especificado | No (variante ARA) | Apache-2.0 (según model card) | HuggingFace |
| xdavxd/gemma-4-26B-A4B-it-heretic-NVFP4 (este modelo) | 25.8B | 32768 (ejemplo) | NVFP4 | Apache-2.0 (según model card) | HuggingFace |
| xdavxd/gemma-4-26B-A4B-it-heretic-v2-NVFP4 | 25.8B | No especificado | NVFP4 mejorada | Apache-2.0 (según model card) | HuggingFace |

## Limitaciones y advertencias

- La información sobre idiomas soportados no está disponible; la cobertura multilingüe no puede confirmarse.
- La cuantización FP4 puede degradar ligeramente la precisión en comparación con el modelo en 16 bits. Se ha reportado una KL divergence de 0.0499, pero debe validarse en las tareas concretas de interés.
- El modelo hereda de su variante "heretic" la técnica ARA, que puede afectar la fidelidad en algunos casos; no se han publicado estudios de sesgos específicos.
- El contexto máximo oficial no está especificado; el límite de 32768 tokens es solo un ejemplo de despliegue en vLLM.
- El uso de tool calling y modo thinking requiere configuraciones concretas en vLLM (parsers `gemma4`); sin ellas, estas capacidades pueden no funcionar correctamente.
- Para despliegues comerciales, la licencia debe revisarse en el enlace oficial de Gemma 4, dado que la etiqueta Apache-2.0 puede no reflejar todas las condiciones.

## Enlaces

- Modelo NVFP4: https://huggingface.co/xdavxd/gemma-4-26B-A4B-it-heretic-NVFP4
- Versión v2 NVFP4: https://huggingface.co/xdavxd/gemma-4-26B-A4B-it-heretic-v2-NVFP4
- Modelo base (heretic): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo original (google): https://huggingface.co/google/gemma-4-26B-A4B-it
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Guía de uso de Gemma 4 con vLLM: https://recipes.vllm.ai/Google/gemma-4-26B-A4B-it
