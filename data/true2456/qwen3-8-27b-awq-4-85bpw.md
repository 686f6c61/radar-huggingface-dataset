# True2456/Qwen3.8-27B-AWQ-4.85bpw

## Resumen

El modelo `True2456/Qwen3.8-27B-AWQ-4.85bpw` es una cuantización AWQ del modelo Qwen3.8-27B de Qwen, adaptada específicamente para Apple Silicon mediante la librería oMLX. El modelo base es un transformer denso de 27.8 mil millones de parámetros con 64 capas, que combina una arquitectura híbrida GatedDeltaNet con atención completa, una ventana de contexto de 256K tokens, una cabeza de decodificación especulativa MTP (Multi-Token Prediction) y un codificador visual de tipo SigLIP, lo que lo convierte en un modelo de visión-lenguaje (image-text-to-text).

Esta versión cuantizada reduce el peso del modelo de aproximadamente 55 GB en bf16 a 16.83 GB, un factor de 3.3×, manteniendo una calidad muy cercana al original: en las pruebas reportadas por el autor, la diferencia agregada es de solo 4 preguntas sobre 564 en tres benchmarks (HumanEval, GSM8K y MMLU). La cuantización emplea un esquema mixto de bits por componente, con 4 bits en la mayor parte del MLP, 5 bits en las proyecciones de GatedDeltaNet, 8 bits en las proyecciones de atención y 6 bits en la cabeza de salida, alcanzando un promedio de 4.85 bits por peso.

La relevancia de este modelo radica en que permite ejecutar un modelo de 27B con capacidades de visión, razonamiento y código en hardware de Apple Silicon con memoria unificada moderada (entre 17 y 33 GB según la longitud de contexto), con velocidades de generación de 55-65 tokens por segundo en un M5 Max, gracias a la decodificación especulativa MTP que acelera la generación entre 1.8 y 2.1 veces. Es una opción práctica para desarrolladores que necesitan un modelo local potente en Mac, aunque está restringido a oMLX y requiere una variable de entorno para el prefill hasta que se fusione un pull request pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: GatedDeltaNet + atención completa, con codificador visual SigLIP y cabeza MTP |
| Parametros totales | 27.8 mil millones (dense) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (262144, según fuentes externas) |
| Tipos de cuantizacion | AWQ 4.85 bpw (mixto: 4/5/6/8 bits por componente) |
| Idiomas soportados | No disponible (no especificado en la documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors, compatible con oMLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas GatedDeltaNet (una variante de redes de estado lineal con compuertas) con capas de atención completa, lo que permite manejar secuencias largas de hasta 256K tokens con un equilibrio entre eficiencia y capacidad de atención global. Incluye una cabeza MTP (Multi-Token Prediction) para decodificación especulativa, que predice varios tokens por pasada y acelera la generación. El codificador visual es de tipo SigLIP, lo que habilita capacidades de comprensión de imágenes.

El proceso de cuantización, descrito por el autor, consiste en AWQ secuencial sobre el MLP denso: cada capa se calibra sobre las activaciones producidas por las capas ya cuantizadas, de modo que el error acumulado se tiene en cuenta. El resto de componentes (fuera del MLP) se cuantizan con RTN (round-to-nearest) a los anchos de bits indicados. La calibración se realizó con 192 prompts de 1024 tokens de conversaciones de código, uso de herramientas y agentes, re-renderizadas con la plantilla de chat de Qwen con una división 50/50 entre modos de pensamiento y no pensamiento. La asignación de bits se basó en una matriz de importancia calculada sobre el mismo corpus, utilizando la razón de participación (qué fracción de canales de entrada concentran la energía). Los resultados muestran que las proyecciones de atención q/k/v son las más concentradas (razón de participación 0.0022) y por eso reciben 8 bits, mientras que las proyecciones del MLP son más planas y se quedan en 4 bits.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de modo de pensamiento (thinking mode) configurable mediante el parámetro `reasoning_effort` en la plantilla de chat (valores `xhigh`, `medium`, `low`).
- Comprensión de imágenes (visión-lenguaje) gracias al codificador visual SigLIP integrado, lo que permite tareas de image-text-to-text.
- Generación de código: obtiene un 93.3% en HumanEval en esta cuantización, prácticamente igual al modelo bf16 (93.9%).
- Capacidades matemáticas: 92.0% en GSM8K, con una pérdida de solo una pregunta respecto al original.
- Conocimiento general: 83.0% en MMLU, dos preguntas menos que el bf16.
- Soporte de tool calling y uso de agentes: la calibración se realizó con conversaciones de tool-use y agentes, lo que indica que el modelo está optimizado para estas tareas.
- Decodificación especulativa MTP nativa: acelera la generación entre 1.8 y 2.1 veces con una tasa de aceptación de borradores del 88.7% y 3.05 tokens por forward del modelo principal.
- Capacidades multilingües: no especificadas en la documentación disponible, aunque los modelos Qwen suelen ser multilingües; no se puede confirmar para esta versión.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está diseñado para ejecutarse en Mac con oMLX. Con un M5 Max de 128 GB, alcanza 65.5 tokens por segundo de generación a 1K de contexto y 57.2 tokens por segundo a 32K, con un pico de memoria de 25 GB. Es adecuado para desarrolladores que necesitan un LLM local potente sin depender de la nube.
- Asistente de programación con visión: al combinar generación de código (93.3% en HumanEval) con comprensión de imágenes, puede analizar capturas de pantalla de errores, diagramas o bocetos de interfaz y generar código o sugerencias de corrección.
- Análisis de documentos largos con imágenes: gracias a la ventana de 256K tokens, puede procesar documentos extensos que incluyan figuras, tablas o gráficos, manteniendo el contexto completo. El uso de cuantización de caché KV es recomendable para esta tarea.
- Agentes autónomos con tool calling: el modelo fue calibrado con conversaciones de uso de herramientas y agentes, por lo que puede integrarse en pipelines que requieran llamadas a funciones, razonamiento multi-paso y planificación. La decodificación especulativa reduce la latencia en tareas interactivas.
- Prototipado rápido de aplicaciones de visión-lenguaje: al ser Apache 2.0 y caber en 17-33 GB de memoria, permite iterar localmente en una Mac sin necesidad de GPU dedicada, ideal para startups o equipos pequeños que quieran validar ideas antes de escalar a la nube.
- Despliegue en entornos con restricciones de privacidad: al ser un modelo local, los datos no salen del dispositivo, lo que lo hace adecuado para aplicaciones que manejan información sensible en sectores como salud, legal o financiero, siempre que se cumplan los requisitos de hardware.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados medidos con el harness `omlx.eval` sobre prompts idénticos, comparando esta cuantización con el modelo bf16 original:

| Benchmark | Este build (AWQ 4.85 bpw) | bf16 original | Delta |
|---|---|---|---|
| HumanEval | 93.3% (153/164) | 93.9% (154/164) | -1 pregunta |
| GSM8K | 92.0% (184/200) | 92.5% (185/200) | -1 pregunta |
| MMLU | 83.0% (166/200) | 84.0% (168/200) | -2 preguntas |

La diferencia agregada es de 89.2% frente a 89.9%, que el autor considera dentro del ruido estadístico para estos tamaños de muestra. No se han publicado resultados de benchmarks adicionales (como MT-Bench, Arena-Hard u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pico de memoria varía según la longitud de contexto. En un M5 Max con 128 GB, se midieron los siguientes consumos: 17.0 GB a 1K, 18.5 GB a 4K, 19.4 GB a 8K, 21.3 GB a 16K, 25.0 GB a 32K y 32.6 GB a 64K. El modelo cabe en Macs con memoria unificada de 32 GB o más, aunque para contextos largos se recomienda 64 GB o superior.
- GPU recomendadas: el checkpoint está diseñado exclusivamente para Apple Silicon (oMLX). No es compatible con GPUs NVIDIA o AMD sin una conversión previa del formato de pesos. En Mac, se recomienda un chip M-series con al menos 32 GB de memoria unificada; el autor probó en un M5 Max de 128 GB.
- Si cabe en consumer GPU: no aplica directamente, ya que el formato es MLX. Sin embargo, el modelo base Qwen3.8-27B en bf16 requeriría alrededor de 55 GB de VRAM, lo que excede las GPUs de consumo actuales. Esta versión cuantizada, si se convirtiera a otro formato, podría caber en GPUs de 24 GB (por ejemplo, RTX 4090) con cuantización adicional, pero no se proporcionan datos al respecto.
- Opciones de despliegue: exclusivamente mediante oMLX (librería MLX optimizada para Qwen3.5/3.8). No es compatible con vLLM, TGI, llama.cpp u Ollama sin conversión previa. El autor advierte explícitamente que cargar el checkpoint fuera de oMLX produce texto fluido pero incorrecto debido a un problema con el desplazamiento de las normativas de peso.
- Latencia y throughput: en un M5 Max de 128 GB con oMLX, MTP habilitado y `pp N / tg 128`, se midieron: TTFT de 1.16 s a 1K de contexto, 4.4 s a 4K, 10.0 s a 8K, 21.4 s a 16K, 53.3 s a 32K y 119.8 s a 64K. El throughput de prefill varía entre 547 y 931 tokens/s, y la generación entre 41.7 y 65.5 tokens/s. Sin la variable de entorno de prefill, el TTFT a 4K se duplica (8.0 s).

## Comparativa con modelos similares

La comparación más directa es con el modelo base sin cuantizar y con otras cuantizaciones del mismo modelo. No se dispone de datos de modelos comparables de otros fabricantes con la misma configuración de hardware.

| Modelo | Parametros | Contexto | HumanEval | GSM8K | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27.8B | 256K | 93.9% | 92.5% | 84.0% | Apache 2.0 | bf16 |
| True2456/Qwen3.8-27B-AWQ-4.85bpw | 27.8B | 256K | 93.3% | 92.0% | 83.0% | Apache 2.0 | MLX/AWQ |
| Qwen3-8B (referencia, no comparable directamente) | 8B | 32K | no disponible | no disponible | no disponible | Apache 2.0 | varios |

La ventaja principal de esta cuantización frente al bf16 es la reducción de memoria (3.3×) y el aumento de velocidad de generación (3.9×, de 14 a 55-65 tok/s) en Apple Silicon, con una pérdida de calidad mínima. Frente a modelos más pequeños como Qwen3-8B, ofrece capacidades de visión y un contexto mucho mayor, aunque requiere más memoria.

## Limitaciones y advertencias

- El checkpoint es exclusivo de oMLX. Cargarlo con `mlx_vlm` estándar produce texto fluido pero incorrecto, debido a un problema con la heurística de desplazamiento de normativas de peso. No debe usarse fuera de oMLX.
- Hasta que se fusione el pull request [jundot/omlx#2657](https://github.com/jundot/omlx/pull/2657), es necesario establecer las variables de entorno `OMLX_QWEN35_Q4_MLP_MIN_TOKENS=999999999` y `OMLX_QWEN35_Q4_LINEAR_MIN_TOKENS=999999999` para evitar una degradación del prefill (de 931 a 513 tok/s a 4K de contexto).
- La cuantización del codificador visual (8 bits) no está validada con benchmarks específicos de visión; el autor menciona una "caveat" sin detallar. Se recomienda probar en tareas de visión antes de usarlo en producción.
- No se han documentado sesgos específicos de este modelo. Como cualquier LLM, puede generar contenido alucinado o incorrecto, especialmente en tareas de razonamiento complejo o con información poco común.
- El rendimiento de generación depende de la activación de MTP. Sin MTP, la velocidad se reduce significativamente (el autor no proporciona cifras sin MTP, pero indica que MTP es responsable de 1.8-2.1× de aceleración).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha. Se recomienda revisar los términos del modelo original Qwen3.8-27B.
- Para contextos largos (más de 32K), el consumo de memoria crece notablemente (32.6 GB a 64K), lo que puede superar la memoria disponible en Macs con menos de 64 GB.

## Enlaces

- HuggingFace: https://huggingface.co/True2456/Qwen3.8-27B-AWQ-4.85bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request pendiente para prefill: https://github.com/jundot/omlx/pull/2657
- Artículo con especificaciones del Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Repositorio de la familia Qwen3: https://github.com/QwenLM/Qwen3
