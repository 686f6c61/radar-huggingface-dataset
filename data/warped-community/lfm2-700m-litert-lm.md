# warped-community/LFM2-700M-litert-lm

## Resumen

LFM2-700M es un modelo de lenguaje de 742.489.344 parámetros desarrollado por Liquid AI, diseñado específicamente para inferencia en dispositivo (*on-device*) y entornos *edge*. Su arquitectura híbrida combina 10 capas convolucionales con 6 capas de atención en un total de 16 capas, lo que reduce el coste computacional frente a un transformer puro manteniendo capacidad de generación de texto. Esta ficha describe la conversión publicada por el usuario `warped-community` al formato LiteRT-LM (`.litertlm`), pensada para ejecutarse con el runtime de Google LiteRT-LM.

El repositorio no contiene pesos nuevos: es una cuantización del modelo base `LiquidAI/LFM2-700M` empaquetada en varios ficheros `.litertlm` con recetas int4 e int8, orientados a CPU y GPU de dispositivos móviles y portátiles. La relevancia actual radica en que permite ejecutar un modelo de ~700M parámetros en un navegador con WebGPU, en un Android de gama alta (Snapdragon) o en un Mac con GPU integrada, con descargas de entre 480 y 810 MB.

Liquid AI posiciona LFM2 para tareas agénticas, extracción de datos, RAG, escritura creativa y conversaciones multi-turno, y desaconseja explícitamente su uso en tareas intensivas en conocimiento o programación. El contexto nativo del modelo base es de 32.768 tokens, aunque los ficheros de esta conversión están limitados a 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas (10 convolucionales + 6 de atención), transformer con convoluciones |
| Parametros totales | 742.489.344 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; 4.096 tokens en los ficheros `.litertlm` de esta conversión |
| Tipos de cuantizacion | int4 (blockwise-32 + OCTAV en lineales, int8 en lm_head y embedding, convoluciones en float) e int8 (`dynamic_wi8_afp32` en lineales y embedding, filtros de ShortConv en float) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano y español (según Liquid AI) |
| Licencia | `lfm1.0` (etiquetada como `other` en Hugging Face; enlace a la licencia del modelo base) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura de LFM2-700M es híbrida: de sus 16 capas, 10 son convolucionales y 6 son capas de atención. Este diseño reduce el coste de atención sobre secuencias largas y está pensado para cargas de trabajo en dispositivo con presupuesto de cómputo y memoria limitado. El modelo base declara 742.489.344 parámetros y un contexto de 32.768 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de esta conversión tampoco detalla el proceso de entrenamiento; únicamente documenta el proceso de conversión a LiteRT-LM mediante `litert-torch`, con recetas de cuantización int4 e int8 y variantes con *GPU composites* para distintas versiones del runtime. La innovación técnica destacable de esta ficha no está en el entrenamiento, sino en el empaquetado: exportaciones específicas por versión de LiteRT-LM (0.18, 0.19, 0.20) para evitar incompatibilidades de backend GPU.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en los ficheros.
- Extracción de datos estructurados a partir de texto (fechas, entidades), tarea citada explícitamente en los ejemplos de la model card.
- RAG (generación aumentada por recuperación) sobre contextos de hasta 4.096 tokens en esta conversión.
- Escritura creativa y generación de texto libre.
- Tareas agénticas sencillas según Liquid AI, aunque sin detalle de soporte formal de *tool calling* o *function calling* en la información disponible.
- Capacidades multilingües en inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Ejecución en navegador mediante WebGPU (demo de chat de LiteRT-LM) y en Android, macOS y CPU.
- No se documenta soporte de visión, audio ni *thinking mode*.

## Casos de uso

- Extracción de datos en el dispositivo: el modelo puede procesar texto local (por ejemplo, correos o notas) y extraer fechas o entidades sin enviar datos a un servidor, gracias a su tamaño de ~480 MB en int4 y su ejecución en CPU o GPU móvil.
- Asistentes de chat integrados en aplicaciones Android: con 4.096 tokens de contexto y decodificación de decenas de tokens por segundo en GPU de Snapdragon, es adecuado para conversaciones multi-turno breves dentro de una app.
- RAG ligero en el navegador: el demo oficial carga el modelo int4 (481 MB) con WebGPU, lo que permite construir interfaces de consulta sobre documentos locales sin backend.
- Prototipado y demos de IA *on-device*: útil para validar flujos de inferencia local en Mac (M4 Max) o en dispositivos Android antes de invertir en modelos mayores.
- Filtrado y clasificación de texto en *edge*: tareas de extracción y resumen de baja complejidad donde no se requiere conocimiento intensivo y prima la latencia y la privacidad.
- Generación de texto creativo offline: escritura asistida en aplicaciones de escritorio o móviles sin conexión, aprovechando la licencia y el tamaño reducido del modelo.
- No se recomienda para generación de código en producción ni para tareas intensivas en conocimiento, según las propias indicaciones de Liquid AI.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la información disponible son los de IFEval-lite (n=120) y las velocidades de decodificación medidas por el autor de la conversión.

| Metrica | bf16 | int8 | int4 |
|---|---|---|---|
| IFEval-lite (n=120), prompts superados | 77 | 75 y 74 (dos ejecuciones) | 67 |
| Tamano del fichero | no disponible | 808,3 MB / 810,1 MB | 480,9 MB / 482,0 MB |

| Escenario | Fichero | Rendimiento |
|---|---|---|
| Galaxy S26 GPU, LiteRT-LM 0.19.1 (2026-11-14) | `LFM2-700M_int4_gpu_composite_v0190.litertlm` | 86,2 tok/s |
| Galaxy S26 GPU, LiteRT-LM 0.19.1 (2026-11-14) | `LFM2-700M_int4.litertlm` | 70,1 tok/s |
| Snapdragon Galaxy S26 GPU (2026-11-12), 8 preguntas de control | `LFM2-700M_int4_v0200.litertlm` con build main de LiteRT-LM | 7 de 8 correctas |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: entre ~480 MB (int4) y ~810 MB (int8) para los pesos; el consumo real de memoria es superior por estados de convolución, caché KV y overhead del runtime.
- GPU recomendadas: GPU de Snapdragon (probado en Galaxy S26), GPU de Mac M4 Max; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo y en dispositivos móviles; el demo web funciona con WebGPU en navegador.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.18.0, 0.19.0–0.19.2 y 0.20.0 según fichero), CLI `litert-lm` desde PyPI (requiere Python 3.10 o superior), binario Android precompilado y demo web con WebGPU.
- Latencia y throughput: 86,2 tok/s en Galaxy S26 GPU con el fichero `_v0190`; 70,1 tok/s con `LFM2-700M_int4.litertlm` en el mismo dispositivo. Las velocidades en LiteRT-LM 0.20.0 estaban pendientes de medición según la model card.
- Advertencia de compatibilidad: los ficheros `_v0200` producen texto corrupto en GPU con LiteRT-LM 0.19.2 sin error ni código de salida distinto de cero; deben usarse con LiteRT-LM 0.20.0. El fichero `_v0190` es rechazado en GPU por LiteRT-LM 0.20.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| LFM2-700M (esta conversión) | 742.489.344 | 4.096 (32.768 en el base) | `lfm1.0` | `.litertlm`, LiteRT-LM |
| LiquidAI/LFM2-700M (original) | 742.489.344 | 32.768 | `lfm1.0` | Safetensors, transformers |
| Alternativas de ~700M para edge | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El contexto efectivo en esta conversión es de 4.096 tokens, muy inferior a los 32.768 del modelo base; planificar las aplicaciones en consecuencia.
- Liquid AI desaconseja el modelo para tareas intensivas en conocimiento y para programación; el rendimiento en esas áreas será limitado.
- Riesgo de alucinación inherente a un modelo de 700M parámetros; no debe usarse como fuente de verdad sin verificación.
- No se documentan sesgos específicos en la información disponible, pero al tratarse de un modelo entrenado con datos web es esperable que los herede.
- La licencia `lfm1.0` (etiquetada como `other`) impone condiciones que deben revisarse antes de uso comercial; el enlace a la licencia apunta al repositorio del modelo base.
- Compatibilidad frágil entre versiones del runtime: usar el fichero correcto para cada versión de LiteRT-LM; los errores de emparejamiento pueden producir salidas corruptas sin señal de error.
- El autor indica que las pruebas se realizaron en un conjunto limitado de dispositivos (Mac M4 Max, Galaxy S26, Pixel 8a); no hay validación en iOS ni en otras GPUs móviles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-28; se trata de una conversión de la comunidad, no oficial de Liquid AI.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/warped-community/LFM2-700M-litert-lm
- Modelo base: https://huggingface.co/LiquidAI/LFM2-700M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2-700M/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Demo web de chat (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/LFM2-700M
- Pull request de LiteRT citado: https://github.com/google-ai-edge/LiteRT/pull/11565
- Repositorio de referencia con los ficheros citados en los comandos: https://huggingface.co/litert-community/LFM2-700M
