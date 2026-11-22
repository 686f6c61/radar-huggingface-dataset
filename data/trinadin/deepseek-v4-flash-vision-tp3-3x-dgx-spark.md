# trinadin/DeepSeek-V4-Flash-Vision-TP3-3x-DGX-Spark

## Resumen

Este repositorio no contiene un modelo nuevo, sino una **receta de despliegue** (serving recipe) para servir el checkpoint `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` en paralelismo de tensor de grado 3 (TP=3) sobre tres nodos NVIDIA DGX Spark con GPU GB10, interconectados mediante un triángulo RoCE CX-7. Lo publica el usuario `trinadin` bajo licencia MIT y su valor reside en hacer viable el reparto del checkpoint —de pesos mixtos nativos FP4+FP8, aproximadamente 170 GB— entre tres aceleradores, algo que el diseño original del modelo (con 8 grupos de atención) no permite de forma directa.

La receta incluye parches propios: un kit de adaptación del pad de atención de 8 a 9 grupos, un port de prefill con paralelismo de secuencia, una cadencia de cesión prefill-decode y un cierre del JIT de geometría de chunk. Sobre esa base se habilita la torre de visión nativa (ViT + Aligner) y el módulo de decodificación especulativa DSpark con k=5. El autor reporta cifras en caliente de ~99 tok/s en un solo stream, ~1K tok/s agregados con 32 streams, una reserva de KV de ~4,1M tokens y verificación de recall instruido palabra a palabra hasta ~950K tokens.

Es relevante ahora porque documenta una metodología de medición reproducible (needle de recall instruido, etiquetado frío/caliente y solo/mixto, disciplina A/B en el mismo arranque, puerta de inactividad) y porque expone los riesgos heredados del motor vLLM subyacente, en lugar de ocultarlos. No obstante, conviene subrayar que las cifras proceden del autor y no de una evaluación independiente, y que el repositorio no publica benchmarks estándar del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión nativa (ViT + Aligner) y módulo de decodificación especulativa DSpark; pesos mixtos FP4+FP8 |
| Parametros totales | no disponible (pesos del checkpoint ~170 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (configurada en la receta); reserva KV de ~4,1M tokens ≈ 3,9 sesiones simultáneas a contexto completo de 1M |
| Tipos de cuantizacion | Pesos nativos mixtos FP4+FP8; no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (receta); licencia del modelo base no especificada en la información disponible |
| Formato de pesos | Pesos nativos del checkpoint DeepSeek-V4-Flash-Vision-Exp (no se detalla safetensors/GGUF en la información disponible) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia DeepSeek-V4-Flash con capacidades de visión, cuyos pesos nativos combinan FP4 y FP8 y suman aproximadamente 170 GB. La torre de visión es local al checkpoint (ViT + Aligner) y procesa únicamente imágenes adjuntas en mensajes de usuario; el número de imágenes por petición lo acota un flag del motor (por defecto 8, validado muy por encima), no el modelo. El checkpoint incorpora además un módulo borrador entrenado para decodificación especulativa DSpark.

La receta no entrena nada: adapta el checkpoint para TP=3. El obstáculo principal es que la atención del modelo define 8 grupos (o_group), un número no divisible por 3; el kit de pad 8→9 mantiene constante el número de cabezas por grupo para que TP=3 divida limpiamente. Sobre esa base se aplica un port por etapas de semántica de prefill con paralelismo de secuencia sobre el árbol V4.0-vision del runtime, más el encadenado del kit de pad. La configuración de servicio registrada incluye DSpark k=5, 32 secuencias (captura 192), MNBT 8192, umbral de prefill largo de 1024, chunk adaptativo activado, cadencia de cesión prefill-decode N=2, admisión interactiva prioritaria, etapa SP 3, gmu 0.80 (sin inquilinos) y contexto de 1M. El arranque tarda unos 5 minutos con formas precalentadas de clase ~110.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base DeepSeek-V4-Flash-Vision-Exp.
- Procesamiento de visión nativa mediante ViT + Aligner, con imágenes adjuntas en mensajes de usuario.
- Decodificación especulativa DSpark con k=5 para reducir latencia de generación.
- Servicio multi-stream: hasta 32 secuencias concurrentes según la configuración de referencia.
- Manejo de contexto muy largo: 1M tokens por sesión, con ~3,9 sesiones simultáneas a contexto completo en la reserva KV.
- Prefill con paralelismo de secuencia para prefijos profundos (chunks de ~8K en modo solo).
- Admisión interactiva prioritaria para proteger chats que llegan durante trabajo en lote.
- Soporte de tool calling, function calling o modo de razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia con visión en clúster pequeño: desplegar el checkpoint con la torre de visión activa sobre tres DGX Spark para aplicaciones que combinan imagen y texto, aprovechando los ~0,7 s de TTFT de imagen por petición reportados.
- Análisis de documentos e imágenes de gran extensión: con 1M tokens de contexto y verificación de recall instruido hasta ~950K tokens, resulta adecuado para tareas que requieren localizar información precisa en corpus muy largos.
- Asistentes conversacionales de baja latencia: la decodificación especulativa DSpark k=5 y los ~99 tok/s en un solo stream permiten respuestas interactivas en flujos de chat.
- Procesamiento por lotes de alto rendimiento: los ~1K tok/s agregados con 32 streams encajan en pipelines de generación masiva donde el throughput prima sobre la latencia individual.
- Evaluación y experimentación con decodificación especulativa: el repositorio documenta la metodología de medición y la configuración, lo que lo hace útil como banco de pruebas reproducible para investigar TP y SP.
- Prototipado de despliegues multi-nodo en hardware compacto: sirve como referencia para equipos que quieran replicar un clúster de tres nodos con interconexión RoCE y validar sus propios parches.
- Investigación sobre alineación y refusal: la receta indica que se validó sobre una derivación abliterada (proyección de dirección de rechazo de rango 1), útil para estudiar comportamiento de rechazo, con la advertencia de reejecutar la sonda de sanidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas son las de servicio reportadas por el autor:

| Metrica | Valor reportado |
|---|---|
| Throughput single-stream (streams de clase código, en caliente) | ~99 tok/s |
| Throughput agregado (32 streams) | ~1K tok/s |
| Reserva KV | ~4,1M tokens |
| Sesiones simultáneas a contexto completo de 1M | ~3,9 |
| Recall instruido verificado | palabra a palabra hasta ~950K tokens |
| Imágenes por petición | 8/8 validadas |
| TTFT de imagen | ~0,7 s |
| Mejora efectiva de TTFT en prefijos calientes replicados | ~14× |
| Tiempo de arranque | ~5 min |
| Headroom por nodo | ~8–11 GiB (gmu 0.80 sin inquilinos; 0.78 con inquilinos) |

## Requisitos de hardware

- Tres nodos NVIDIA DGX Spark con GPU GB10, interconectados en triángulo mediante CX-7 RoCE.
- Checkpoint de ~170 GB en pesos mixtos FP4+FP8, repartido en TP=3.
- Memoria por nodo: la configuración de referencia usa gmu 0.80 sin inquilinos GPU/CPU, dejando ~8–11 GiB de headroom por caja; con inquilinos se recomienda 0.78.
- No cabe en una GPU de consumo individual: requiere el clúster de tres nodos descrito.
- Despliegue mediante vLLM con la imagen fijada `dspark-vllm-gx10` (la mayoría de forks de esta línea solo sirven texto) y los parches del repositorio.
- Arranque de ~5 minutos con formas precalentadas de clase ~110 (C=1–32 más combinaciones de sampler); el JIT de geometría de chunk queda cerrado a nivel de motor, sin JIT a mitad de servicio.
- Latencia y throughput estimados: los indicados en la tabla de rendimiento; no hay mediciones independientes disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (mismo tamaño o misma tarea) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Las cifras de rendimiento son autoinformadas por el autor y no han sido verificadas de forma independiente.
- El repositorio es una receta de servicio, no un modelo: hereda el comportamiento, sesgos y alucinaciones del checkpoint base DeepSeek-V4-Flash-Vision-Exp, sobre los que no se aporta información.
- La validación se ejecutó sobre una derivación abliterada del modelo base (proyección de dirección de rechazo de rango 1); el autor recomienda elegir los pesos con cautela y reejecutar la sonda de rechazo y sanidad.
- Los parches editan el árbol del motor de una imagen de terceros: al re-fijar la imagen hay que revalidar los parches, y un rechazo de los appliers es una señal de parada, no una revalidación.
- Riesgo heredado de la incidencia upstream de vLLM #53051 (uniform-decode misdispatch): cuando el número de tokens programados coincide con `uniform_decode_query_len * num_reqs`, un prefill puede despacharse al grafo CUDA capturado para decodificación especulativa; afecta a modelos híbridos con estado recurrente. No está establecido en este checkpoint, pero se hereda como clase de fallo.
- La información disponible menciona dos incidencias upstream abiertas, pero solo detalla una; la segunda no se describe.
- El headroom de ~8–11 GiB asume ausencia de inquilinos GPU/CPU junto a los rangos; con inquilinos debe usarse gmu 0.78.
- La licencia MIT se aplica a la receta; la licencia del modelo base no se especifica en la información disponible, por lo que el uso comercial del checkpoint debe verificarse en su origen.
- Idiomas soportados y capacidades de tool calling no están documentados en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/trinadin/DeepSeek-V4-Flash-Vision-TP3-3x-DGX-Spark
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Kit de pad de atención TP=3 (localaiguyy, MIT): https://github.com/localaiguyy/DeepSeek-V4-Flash-DSpark-3x-DGX-Spark
- Incidencia upstream de vLLM #53051: https://github.com/vllm-project/vllm/issues/53051
