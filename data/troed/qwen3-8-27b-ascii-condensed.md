# troed/Qwen3.8-27B-ASCII-Condensed

## Resumen

Qwen3.8-27B-ASCII-Condensed es una variante podada del vocabulario del modelo Qwen3.8-27B, publicada por el usuario troed en HuggingFace. No es un modelo reentrenado: se parte de la cuantización IQ4_XS de 3.84 bits por peso de byteshape/Qwen3.8-27B-GGUF y se eliminan filas de la matriz de embeddings y de la cabeza de salida, reduciendo el vocabulario de 248.320 a 129.006 entradas. El tokenizador se reescribe para coincidir con el subconjunto resultante y todos los pesos supervivientes son bit a bit idénticos a los del fichero de origen, sin desquantizar ni recuantizar.

El objetivo del podado es liberar memoria de vídeo: la VRAM que ocupaban las filas de vocabulario descartadas se reasigna a la caché KV, lo que permite alcanzar 160.000 tokens de contexto en una GPU de 16 GB. El repositorio incluye además un modelo borrador DFlash2 (Q2_K_S-MIX, 511 MiB) para decodificación especulativa, pensado para usarse con el fork de llama.cpp del mismo autor, que añade streaming adaptativo de caché KV.

Es relevante para quienes ejecutan modelos grandes en hardware de consumo y necesitan contexto largo sin escalar a GPUs de 80 GB, a costa de restringir el vocabulario a ASCII y de depender de un fork no estándar para aprovechar las funciones de streaming y borrador fijado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (Qwen3.8), inferencia sobre GGUF; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 1.863.315.712 según el recuento de safetensors facilitado; el nombre del modelo indica 27B. Dato inconsistente y no confirmado por la model card |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 160.000 tokens en GPU de 16 GB con la configuración indicada; máximo nativo del modelo base no disponible |
| Tipos de cuantización | IQ4_XS 3.84 bpw (modelo objetivo), Q2_K_S-MIX (borrador DFlash2); caché KV configurable en q8_0 / q4_0 |
| Idiomas soportados | no disponible. El vocabulario es únicamente ASCII; se conservan los 256 tokens de fallback a nivel de byte, por lo que el texto no ASCII se decodifica pero consume más tokens por carácter |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (fichero objetivo de 11,4 GiB y borrador de 511 MiB); repositorio de 12,8 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de la familia Qwen3.8. Esta ficha no describe cambios en la arquitectura ni en los pesos: el proceso aplicado es exclusivamente una condensación de vocabulario. Partiendo del GGUF IQ4_XS-3.84bpw de byteshape, se recopilan directamente en espacio cuantizado las filas de la matriz de embeddings y de la cabeza de salida que se desean conservar, y se reescribe el tokenizador para que coincida con ese subconjunto. No hay desquantización, recuantización ni reentrenamiento: los pesos que sobreviven son bit a bit idénticos al origen. La reducción va de 248.320 a 129.006 filas, y la VRAM liberada se destina a caché KV.

El segundo componente es un modelo borrador DFlash2 derivado de HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF, al que se aplica la misma condensación de vocabulario y tokenizador, también sin modificar pesos más allá del subconjunto de filas. Este borrador se usa para decodificación especulativa con `spec-type = draft-dflash` y un máximo de 5 tokens especulados (`spec-draft-n-max = 5`). El fork de llama.cpp del autor añade, sobre el trabajo de streaming de caché KV de Raymond Huang, soporte de borrador fijado y opciones de gestión dinámica de páginas de caché (`kv-stream-arena-mib`, `kv-stream-spec-dynamic`, `kv-stream-spec-keep-pages`, `kv-stream-spec-reenable-pages`, `kv-stream-spec-stable-decodes`). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation), con plantilla de chat de Qwen 3.8.
- Modo de razonamiento activable (`reasoning = on`, `reasoning-preserve = on` en la configuración de referencia).
- Contexto largo: hasta 160.000 tokens en una GPU de 16 GB con el fork y la configuración indicados.
- Decodificación especulativa mediante el borrador DFlash2 incluido.
- Soporte multimodal condicionado: la configuración de ejemplo carga un `mmproj` (por ejemplo `Qwen3.8-mmproj-BF16.gguf` de byteshape), por lo que se puede habilitar entrada visual si se aporta ese proyector; el repositorio no lo incluye y basta con omitir las líneas `mmproj` para uso solo de texto.
- Vocabulario ASCII: cubre texto en inglés y símbolos ASCII estándar; el resto de caracteres se resuelve con los 256 tokens de fallback a nivel de byte.
- Compatibilidad con endpoints HTTP mediante `llama-server` del fork.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistencia sobre documentos largos en una sola pasada: con 160.000 tokens de contexto en 16 GB de VRAM se pueden cargar manuales técnicos, expedientes o bases de código extensas sin troceado ni recuperación externa, manteniendo coherencia entre secciones distantes.
- Chat local con historial prolongado: conversaciones multi-turno de muchas horas sin perder el hilo, gracias a la ventana de 160K y a la caché KV cuantizada en q8_0/q4_0.
- Generación de código en inglés sobre repositorios medianos: el vocabulario ASCII cubre sin penalización la sintaxis de lenguajes de programación, identificadores en inglés y símbolos de herramientas; útil para refactorizaciones guiadas por contexto amplio.
- Resumen y extracción de datos de registros y logs: los ficheros de log en ASCII se procesan con una ratio de tokens por carácter óptima, y el contexto largo permite analizar series completas de eventos.
- Despliegue en estaciones de trabajo con una sola GPU de 16 GB: sustituye a configuraciones multi-GPU para cargas interactivas donde el coste de hardware es la restricción principal.
- Evaluación e investigación de podado de vocabulario: sirve como referencia reproducible para medir el impacto de reducir el vocabulario en la calidad de decodificación y en el uso de memoria, ya que los pesos son idénticos al origen.
- Prototipado de decodificación especulativa: el par objetivo + borrador DFlash2 permite experimentar con `spec-draft-n-max` y con la gestión dinámica de páginas de caché en el fork.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor únicamente reporta métricas de inferencia en un RTX 5060 Ti de 16 GB con 96 GB de DDR5 y la configuración indicada:

| Métrica | Valor reportado |
|---|---|
| Procesamiento de prompt | ~600-900 t/s |
| Generación de tokens | ~15-50 t/s |
| Contexto alcanzado | 160.000 tokens |
| VRAM de GPU | 16 GB |

## Requisitos de hardware

- VRAM estimada para el modelo objetivo: 11,4 GiB en IQ4_XS 3.84 bpw, más 511 MiB del borrador DFlash2 (unos 11,9 GiB de pesos en total), más la caché KV.
- Cabe en GPU de consumo de 16 GB (el autor lo valida en una RTX 5060 Ti de 16 GB) siempre que se use el fork con streaming de caché KV; sin esas opciones, el contexto útil será mucho menor.
- Memoria de sistema: el autor reporta 96 GB de DDR5 en su banco de pruebas; el streaming de caché KV descarga páginas a RAM, por lo que conviene disponer de bastante memoria del sistema y de ancho de banda razonable.
- GPU recomendadas: no hay lista publicada. Por tamaño de pesos, cualquier GPU con 16 GB o más de VRAM es candidata; con 24 GB (RTX 4090, A5000) o 40-80 GB (A100, H100) se puede prescindir del streaming agresivo y ampliar el contexto o la precisión de la caché.
- Opciones de despliegue: llama.cpp del fork troed/llama.cpp-adaptive-kv-streaming para todas las funciones (`kv-stream-*`, borrador fijado). Los GGUF son estándar y cargan en cualquier llama.cpp reciente, pero sin las opciones de streaming ni el comportamiento de borrador fijado. No se documenta soporte para vLLM, TGI, Ollama ni otros motores.
- Compilación de referencia: `cmake -B build -DGGML_NATIVE=ON -DLLAMA_BUILD_EXAMPLES=OFF -DLLAMA_BUILD_TESTS=OFF -DGGML_CUDA_FA_ALL_QUANTS=ON -DGGML_CUDA=ON`, con `device-draft = CUDA0` y todas las capas del borrador en GPU.
- Latencia y throughput: ver tabla de la sección anterior (~600-900 t/s de prefill, ~15-50 t/s de generación).
- Ajuste de caché en la configuración de referencia: `cache-type-k = q8_0`, `cache-type-v = q4_0`, `kv-stream-arena-mib = 4352`, `parallel = 1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| troed/Qwen3.8-27B-ASCII-Condensed | 1.863.315.712 según safetensors (el nombre indica 27B) | 160.000 tokens en 16 GB con el fork | 129.006 filas | Apache-2.0 | GGUF | HuggingFace |
| byteshape/Qwen3.8-27B-GGUF (origen del objetivo) | no disponible | no disponible | 248.320 filas en el GGUF de origen | Apache-2.0 (heredada del base) | GGUF | HuggingFace |
| HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF (origen del borrador) | no disponible | no aplica (modelo borrador) | no disponible | no disponible | GGUF | HuggingFace |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | no disponible | Apache-2.0 | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes: la única diferencia documentada y verificable es la reducción de vocabulario, el tamaño de fichero resultante y el contexto alcanzable en 16 GB de VRAM.

## Limitaciones y advertencias

- Vocabulario restringido a ASCII: el texto en idiomas con caracteres no ASCII (acentos, griego, cirílico, CJK, símbolos de divisa o de dibujo de cajas) se decodifica por los 256 tokens de fallback a nivel de byte, con un coste mayor de tokens por carácter, lo que reduce el contexto efectivo y puede degradar la calidad en esos idiomas. Se puede regenerar con los prune tools usando una política más amplia.
- Dependencia de un fork no oficial de llama.cpp para las funciones clave (streaming de caché KV y borrador fijado). En llama.cpp estándar los ficheros cargan, pero sin esas prestaciones.
- El repositorio no incluye el proyector multimodal (`mmproj`); hay que obtenerlo aparte (por ejemplo, de byteshape/Qwen3.8-27B-GGUF) si se quiere entrada de imagen.
- Inconsistencia de metadatos: el recuento de safetensors facilitado (1.863.315.712) no cuadra con la denominación 27B del nombre del modelo. Conviene verificar el dato antes de planificar el despliegue.
- Sin datos de benchmarks publicados: no hay evidencia en la información disponible sobre el impacto del podado de vocabulario en la perplejidad, el razonamiento o la calidad de generación. Aunque los pesos son idénticos, el tokenizador sí cambia, lo que puede afectar a tareas sensibles a la tokenización.
- Riesgo de alucinación: no se documenta ningún ajuste específico; el modelo hereda las limitaciones del base, no evaluadas en esta ficha.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero conviene revisar las condiciones que Qwen aplique al modelo original y las licencias de los artefactos derivados (cuantización de byteshape, borrador de HermiHg).
- Contexto de 160.000 tokens condicionado a la configuración exacta del autor (16 GB de VRAM, `parallel = 1`, caché cuantizada, arena de streaming de 4352 MiB). Reducir la RAM del sistema, aumentar el paralelismo o cambiar los tipos de caché alterará ese límite.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y sin validación comunitaria independiente.
- Fechas de creación y actualización en los metadatos: 2026-09-19, con una ventana de actualización de unos 24 minutos.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/troed/Qwen3.8-27B-ASCII-Condensed
- Fork de llama.cpp con streaming de caché KV y borrador especulativo: https://github.com/troed/llama.cpp-adaptive-kv-streaming
- Trabajo original de streaming de caché KV (Raymond Huang): https://github.com/RaymondHuang210129/llama.cpp-adaptive-kv-streaming
- Herramientas de podado de vocabulario ASCII-Condensed (bsaleh03): https://github.com/bsaleh03/ASCII-Condensed-prune-tools
- Cuantización de origen del modelo objetivo: https://huggingface.co/byteshape/Qwen3.8-27B-GGUF
- Borrador DFlash2 de origen: https://huggingface.co/HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF
- Guía de configuración de llama-server con 16 GB de VRAM: https://blog.troed.se/projects/llama-server-16gb-vram-configs/
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- La búsqueda web realizada no devolvió resultados relevantes: únicamente aparecieron páginas de soporte de Microsoft sin relación con el modelo.
