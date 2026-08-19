# visible-cx/Gemma-4-12B-CoreAI

## Resumen

Este repositorio aloja un artefacto derivado del modelo Gemma 4 12B de Google, convertido al formato `.aimodel` de Core AI para inferencia on-device en dispositivos Apple. Desarrollado por el usuario `visible-cx`, el bundle incluye varias variantes de cuantización (int4 e int8) y funciones de prefill, con longitudes de contexto de 4096 y 16384 tokens según la configuración. Está pensado para desarrolladores que quieren ejecutar Gemma 4 12B localmente en Mac con memoria unificada, aprovechando el runtime Core AI y el ecosistema de Apple Silicon.

El modelo original, Gemma 4 12B, es un transformer denso encoder-free multimodal, capaz de procesar texto, audio y vídeo, con soporte para más de 140 idiomas y decodificación especulativa mediante un modelo borrador. Este bundle concreto se limita a la inferencia de texto y se distribuye en varios formatos de conversión, todos ellos derivados del checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized`. La relevancia actual radica en la creciente demanda de IA local privada y de bajo coste, especialmente en hardware Apple donde las opciones de ejecución de modelos grandes son limitadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B), encoder-free multimodal en el modelo original; bundle de texto |
| Parametros totales | 12 mil millones (12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (variantes int4) y 16384 tokens (variante int8) |
| Tipos de cuantizacion | int4 (int4linsym) e int8 (int8lin) |
| Idiomas soportados | No disponible para el bundle; el modelo original soporta 140+ idiomas |
| Licencia | No disponible; se indica que las licencias originales del checkpoint fuente se aplican |
| Formato de pesos | `.aimodel` (Core AI bundle) |

## Arquitectura y entrenamiento

El bundle es una conversión del checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized`, una versión con entrenamiento de cuantización (QAT) del modelo instruct Gemma 4 12B. La conversión se realizó con el repositorio `coreai-model-zoo` y las herramientas `coreai-torch 0.4.1`, `coreai-core 1.0.0b2` y `coreai-opt 0.2.1`. El modelo original emplea una arquitectura transformer densa sin encoder, con atención multi-consulta y soporte nativo de system prompt, según la documentación de Google. En el bundle, la inferencia se define con un contrato de dos entradas (`input_ids` y `position_ids`) y una salida de logits, con una función principal de decodificación paso a paso y, en las variantes `dense2in-pf64` e `int8`, una función adicional de prefill con longitud de secuencia 64. No se proporcionan detalles sobre los datos de entrenamiento del modelo original en esta documentación.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo Gemma 4 12B.
- Soporte nativo de system prompt (según la documentación oficial de Gemma 4).
- Decodificación especulativa con modelo borrador (multi-token prediction) en el modelo original; no se confirma si el bundle la incluye.
- Multilingüe (140+ idiomas en el modelo original).
- En el bundle: funciones `main` y `prefill` para procesamiento por lotes en las variantes `dense2in-pf64` e `int8`.
- No se especifica soporte de tool calling o function calling en la documentación del bundle.

## Casos de uso

- Inferencia local en Mac con 16 GB de memoria unificada: la variante `dense2in-pf64` (int4, contexto 4096) cabe en el presupuesto de ~10.7 GB de working-set de Metal, permitiendo ejecutar Gemma 4 12B sin conexión y con privacidad total.
- Desarrollo de aplicaciones on-device para Apple Silicon: el formato `.aimodel` se integra con Core AI, facilitando el despliegue en apps de macOS e iOS mediante el runtime `coreai-core`.
- Chatbots y asistentes privados: al ejecutarse localmente, los datos no salen del dispositivo, ideal para entornos con requisitos estrictos de confidencialidad (sanidad, banca, legal).
- Prototipado rápido de soluciones de IA generativa en entornos Apple, sin depender de APIs en la nube ni de costes por token.
- Procesamiento de documentos y resúmenes de texto con contexto de hasta 4096 tokens (o 16384 en la variante int8), suficiente para análisis de contratos, actas o artículos técnicos.
- Investigación y evaluación de modelos locales en hardware Apple, comparando rendimiento, calidad de generación y consumo de recursos frente a otras alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este artefacto derivado en la información disponible. El modelo original Gemma 4 12B tiene métricas publicadas por Google (por ejemplo, en la model card oficial), pero no se incluyen en la documentación de este repositorio. Se recomienda consultar las fuentes oficiales para obtener datos comparativos.

## Requisitos de hardware

- Mac con 16 GB de memoria unificada: variante `dense2in-pf64` (int4, contexto 4096) con ~10.7 GB de working-set de Metal.
- Mac con 32 GB o más: variante `dense2in-int8` (int8, contexto 16384) con ~14.7 GB de pesos + 12.9 GB de KV, totalizando ~27.6 GB.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con memoria unificada; no se menciona compatibilidad con GPUs NVIDIA o AMD.
- Opciones de despliegue: runtime Core AI (`coreai-core`), probablemente mediante la librería `coreai`. No se mencionan vLLM, llama.cpp ni Ollama en la documentación del bundle.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 12B (original) | 12B | 256K | Gemma license (según Google) | safetensors, GGUF, etc. |
| Gemma 4 26B A4B (MoE) | 26B total, 4B activos | 256K | Gemma license (según Google) | safetensors, GGUF, etc. |
| Este bundle (`visible-cx/Gemma-4-12B-CoreAI`) | 12B | 4096 / 16384 | No disponible | `.aimodel` |

La comparativa se basa en datos públicos de la familia Gemma 4. El bundle se diferencia por su formato específico para Core AI y su limitación de contexto, aunque mantiene la misma arquitectura y capacidades del modelo original.

## Limitaciones y advertencias

- El contexto está limitado a 4096 tokens en las variantes int4, muy por debajo de los 256K del modelo original; la variante int8 llega a 16384, pero requiere 32 GB de RAM.
- Las variantes `dense2in` no utilizan Metal SDPA (según la model card), lo que puede reducir el rendimiento en comparación con implementaciones que sí lo usan.
- El bundle no está "oracle-gated", lo que significa que no se ha validado contra un oráculo para garantizar la fidelidad de la conversión.
- La licencia no está especificada en el repositorio; aunque se afirma que las licencias originales se aplican, no se indica cuál es ni se proporciona el texto de la licencia.
- Riesgo de alucinación y sesgos inherentes al modelo Gemma 4 12B, que deben evaluarse antes de usar en producción.
- Solo funciona en hardware Apple con Core AI; no es portable a otras plataformas (Linux, Windows, GPUs NVIDIA).
- La variante int8 no cabe en Mac de 16 GB a contextos útiles; se recomienda usar la variante int4 en ese hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/visible-cx/Gemma-4-12B-CoreAI
- coreai-model-zoo (herramienta de conversión): https://github.com/john-rocky/coreai-model-zoo
- Documentación oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
