# warped-community/LFM2.5-350M-litert-lm

## Resumen

LFM2.5-350M-litert-lm es una conversión del modelo base LiquidAI/LFM2.5-350M al formato LiteRT-LM (`.litertlm`), realizada por el usuario warped-community mediante la herramienta litert-torch. El modelo original lo desarrolla Liquid AI y está pensado como un modelo de texto generalista de pequeno tamano (350M parámetros) orientado a ejecución en dispositivo (on-device) y entornos edge. Esta conversión concreta permite ejecutar el modelo en el runtime LiteRT-LM de Google, que soporta aceleración por GPU y CPU en dispositivos móviles y equipos de escritorio.

El modelo base emplea una arquitectura híbrida de 16 capas que combina 10 bloques de convolución de doble compuerta (double-gated convolution) con 6 bloques de atención con consultas agrupadas (grouped-query attention), además de embeddings atados y un vocabulario de 65.536 tokens. Liquid AI lo describe como un modelo generalista de solo texto, recomendado para extracción de datos, salidas estructuradas y uso de herramientas, pero no para tareas intensivas en conocimiento ni programación.

La relevancia de esta ficha radica en que el repositorio no es un modelo nuevo, sino un artefacto de despliegue: ofrece múltiples variantes cuantizadas (int4 e int8) optimizadas para distintas versiones del runtime LiteRT-LM, con compatibilidad diferenciada para GPU y CPU. Esto lo convierte en un recurso práctico para desarrolladores que quieran desplegar un modelo de 350M en teléfonos Android o equipos con Apple Silicon sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 10 bloques de convolución de doble compuerta + 6 bloques de atención con consultas agrupadas (GQA), 16 capas |
| Parametros totales | 350M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens según Liquid AI; 4.096 tokens en estos archivos |
| Tipos de cuantizacion | int4 (blockwise-32 + OCTAV en linears, int8 en lm_head y embedding), int8 (dynamic en linears + int8 embedding) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano, portugués y español (según Liquid AI) |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Vocabulario | 65.536 tokens |
| Embeddings | Atados (tied embeddings) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M de Liquid AI utiliza una arquitectura híbrida que alterna bloques de convolución de doble compuerta con bloques de atención con consultas agrupadas. Esta combinación busca reducir el coste computacional de la atención completa manteniendo capacidad de modelado de secuencias, algo especialmente relevante en despliegues on-device donde el presupuesto de cómputo y memoria es limitado. El modelo cuenta con 16 capas en total, de las cuales 10 son bloques convolucionales y 6 son bloques de atención, con embeddings atados y un vocabulario de 65.536 tokens.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión no incluye esos datos, y la información se limita a la descripción de Liquid AI sobre el uso recomendado del modelo. La innovación técnica destacable de esta ficha no está en el entrenamiento, sino en la conversión: el uso de litert-torch para exportar el modelo a LiteRT-LM, con variantes que incluyen composites de GPU, canales en formato channels-last para el estado de ShortConv, y recetas de cuantización específicas (int4 blockwise-32 con OCTAV, int8 dynamic) para equilibrar tamano y precisión en distintos backends.

## Capacidades

- Generación de texto generalista en nueve idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, portugués y español.
- Extracción de datos y salidas estructuradas, uso recomendado explícitamente por Liquid AI.
- Uso de herramientas (tool use / function calling), también recomendado por el autor del modelo base.
- Ejecución on-device en GPU y CPU mediante el runtime LiteRT-LM, con variantes optimizadas para cada backend y versión del runtime.
- Soporte de contexto de 4.096 tokens en estos archivos (frente a los 32.768 del modelo original).
- No está recomendado para tareas intensivas en conocimiento ni para programación, según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Extracción de datos en dispositivo: el modelo puede procesar texto localmente para extraer entidades, fechas o campos estructurados, como demuestra el ejemplo de la model card ("Extract the dates from: The meeting moved from May 3 to May 17"). Es adecuado porque Liquid AI lo recomienda para esta tarea y el tamano de 350M permite ejecución en teléfonos.
- Salidas estructuradas en aplicaciones móviles: integrable en apps Android o iOS para generar JSON u otros formatos estructurados sin enviar datos a la nube, gracias a su ejecución vía LiteRT-LM en GPU o CPU.
- Asistentes de voz o texto en edge: con contexto de 4.096 tokens y latencias de decodificación de hasta 148,7 tok/s en GPU de Galaxy S26 (variante `_v0190`), puede sostener conversaciones multi-turno breves en dispositivos móviles.
- Automatización de tareas con tool calling: el modelo puede invocar funciones locales en un agente on-device, adecuado para flujos de automatización que requieren privacidad y baja latencia.
- Procesamiento de texto multilingüe en dispositivo: cubre nueve idiomas, útil para aplicaciones de traducción o clasificación local en mercados con varios idiomas.
- Prototipado y experimentación con LiteRT-LM: el repositorio ofrece múltiples variantes para distintas versiones del runtime (0.19.0 a 0.20.0) y backends (GPU/CPU), lo que facilita probar el pipeline de despliegue antes de pasar a producción.
- Filtrado y clasificación de contenido local: con 350M parámetros y cuantización int4 de 247,8 MB, puede desplegarse en dispositivos con recursos limitados para tareas de moderación o etiquetado.

## Benchmarks y rendimiento

La model card incluye datos de precisión y rendimiento medidos por el autor de la conversión. Se presentan a continuación los datos disponibles:

| Metrica | Valor |
|---|---|
| IFEval-lite (n=120) | Las tres puntuaciones están dentro de tres prompts entre sí; int4 es un 38,6 % más pequeno (no se dan los valores absolutos) |
| Correctness en Galaxy S26 GPU (2026-11-12, build LiteRT-LM main) | 7 de 8 preguntas de verificación respondidas correctamente |
| Decodificación en Galaxy S26 GPU (LiteRT-LM 0.19.1, 2026-11-14) | 148,7 tok/s con `_v0190` frente a 107,1 tok/s con `LFM2.5-350M_int4.litertlm` |

Tiempos para 1.024 tokens de prefill más 256 tokens decodificados, contexto 2.048:

| Segundos | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int8 GPU | 0,68 | 2,94 | 5,77 |
| int4 GPU | 0,67 | 2,63 | 5,94 |
| int8 CPU | 2,38 | 3,77 | 8,13 |
| int4 CPU | 2,94 | 3,99 | 7,97 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica VRAM, pero los tamanos de archivo son de 247,8 MB (int4) y 403,5 MB (int8), lo que implica requisitos de memoria muy bajos.
- GPU recomendadas: no se listan GPU de escritorio; las pruebas se realizaron en Mac M4 Max (GPU), Galaxy S26 (GPU Snapdragon) y Pixel 8a.
- Cabe en GPU consumer y en dispositivos móviles: sí, con 247,8 MB en int4 y 403,5 MB en int8, es apto para telefonos Android y equipos Apple Silicon.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.17.1 a 0.20.0), con backends GPU y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Galaxy S26 GPU con LiteRT-LM 0.19.1, 148,7 tok/s (variante `_v0190`); en Mac M4 Max GPU, 0,68 s para prefill de 1.024 tokens + 256 decodificados (int8). Se requieren versiones específicas del runtime según el archivo: los `_v0200` solo funcionan en GPU con LiteRT-LM 0.20.0; los `_v0190` en GPU con 0.19.0 a 0.19.2.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoria (350M on-device) para establecer una comparativa con parámetros, contexto, rendimiento y licencia. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- No recomendado para tareas intensivas en conocimiento ni programación, según Liquid AI.
- Contexto limitado a 4.096 tokens en estos archivos, frente a los 32.768 del modelo original.
- Riesgo de alucinación inherente a un modelo de 350M; no se documentan mitigaciones específicas.
- Compatibilidad estricta con versiones del runtime: los archivos `_v0200` fallan silenciosamente (solo imprimen saltos de línea, sin error) en GPU con LiteRT-LM 0.19.2; los `_v0190` son rechazados en GPU por 0.20.0.
- El archivo int8 en litert-lm 0.17.1 respondió como si no se hubiera hecho la pregunta (prefill de 9 tokens frente a 16 en 0.18.0).
- Los archivos `_v0200` no se probaron en iOS ni en telefonos con LiteRT-LM 0.20.0.
- Licencia lfm1.0: es necesario revisar los términos en el enlace de licencia para uso comercial; la model card no detalla restricciones.
- Los resultados de precisión y rendimiento de int8 e int4 se midieron en versiones anteriores de los archivos; los archivos actuales tienen los mismos pesos, plantilla de chat y tokenizer.
- Idiomas soportados según Liquid AI, pero no se documenta calidad por idioma ni evaluación específica en espanol.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/warped-community/LFM2.5-350M-litert-lm
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Pull request LiteRT #11565: https://github.com/google-ai-edge/LiteRT/pull/11565
