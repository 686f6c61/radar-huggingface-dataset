# vaquero-labs/DeepSeek-V4.1-Flash-1017-Abliterated-MLX

## Resumen

DeepSeek-V4.1-Flash-1017-Abliterated-MLX es un checkpoint derivado del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicado por el usuario vaquero-labs en Hugging Face. Se trata de una versión "abliterated" (con las direcciones de rechazo eliminadas de los pesos) y cuantizada en formato mixto oQ2.5e para Apple Silicon, empaquetada en MLX y pensada para servirse con el runtime oMLX. El modelo base es un transformer de gran escala con 262.182.120.658 parámetros totales y una ventana de contexto nativa de 1.048.576 tokens.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras distribuciones prácticas de un modelo de más de 260.000 millones de parámetros ejecutable en hardware de consumo de gama alta (un Mac con 256 GiB de memoria unificada); por otro, ilustra una técnica de despliegue poco habitual, el offload de las tablas Engram a SSD local, que permite reducir la huella residente en memoria a unos 204,7 GiB manteniendo las tablas de embedding en precisión nativa FP8/E8M0.

El repositorio ocupa 422,6 GB e incluye 51 shards del modelo más dos ficheros Engram nativos. La licencia es MIT. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia DeepSeek V4.1), pesos en formato MLX con cuantización mixta afín y MXFP |
| Parametros totales | 262.182.120.658 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens nativos; la receta recomendada usa 262.144 como optimización de velocidad y memoria |
| Tipos de cuantizacion | oQ2.5e (mixta, no uniforme de 2,5 bits); tablas Engram en FP8/E8M0 nativo sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en layout MLX (51 shards + layer1.safetensors y layer14.safetensors Engram) |
| Tamano del repositorio | 422,6 GB (393,5 GiB) |
| Huella en memoria con Engram offloaded | 204,73 GiB de pesos residentes |
| Tamano de tablas Engram en SSD | 202,8 GB (188,8 GiB) en FP8/E8M0 |
| Vision tower + proyector de imagen | 0,767 + 0,137 GiB (incluidos en los pesos residentes) |
| Tensores MTP / DSpark | 7,49 GiB (borrador completo retenido) |
| Estimacion de KV cache en crecimiento | 890 bytes/token (222,50 MiB a 256K; 890,00 MiB a 1M) |
| Runtime recomendado | oMLX 0.7.3 (commit 9de79bc39a01c1f3fec1e849903aaf0dd5478d7a) |
| Pins de motor | MLX 0.32.4; mlx-vlm 0.7.11; mlx-lm 0.32.3.dev8; mlx-audio 0.6.3; transformers 5.14–5.20 |
| Hardware de referencia | Apple Silicon con 256 GiB de memoria unificada y SSD PCIe local |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia DeepSeek-V4.1 y de la presencia de un vision tower, un proyector de imagen, tensores MTP (multi-token prediction) y las tablas Engram. Estas últimas son tablas de embedding de gran tamaño (202,8 GB en FP8/E8M0) que en esta distribución se descargan a SSD y se consultan bajo demanda, lo que constituye la innovación técnica central de la receta de despliegue. El checkpoint incorpora además decodificación especulativa mediante el borrador MTP con profundidad 1, y un mecanismo denominado CED (decoder skip) junto con prefill A8 (a partir de 128 tokens) que acelera la fase de prefill.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF o DPO. La modificación "abliterated" elimina las direcciones de rechazo directamente en los pesos, de modo que no requiere un adaptador de steering en tiempo de ejecución; el autor advierte explícitamente de que no debe reaplicarse el parche de escritura. El modelo deriva de dos linajes: deepseek-ai/DeepSeek-V4.1-Flash-1017 y pqhaz/DeepSeek-V4.1-Flash-1017-heretic.

## Capacidades

- Generación de texto y razonamiento de propósito general, con pipeline declarado text-generation.
- Procesamiento de imagen: el checkpoint incluye vision tower y proyector de imagen (0,90 GiB en total), lo que habilita entrada multimodal.
- Decodificación especulativa mediante MTP con profundidad 1, orientada a reducir la latencia de decodificación.
- Prefill acelerado con kernels nativos A8 a partir de 128 tokens y skip de decoder CED.
- Contexto largo: ventana nativa de 1.048.576 tokens, configurable hasta ese límite.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Audio: el pin de mlx-audio 0.6.3 aparece en la receta, pero no se documenta una capacidad de audio en la model card.

## Casos de uso

- Investigación sobre alineación y refusal: al estar abliterated, el modelo permite estudiar cómo se comportan los pesos sin las direcciones de rechazo, útil para analizar mecanismos de seguridad en modelos de gran escala y para experimentos de interpretabilidad comparando con el modelo base.
- Procesamiento de documentos largos en local: con 262.144 tokens configurados (y hasta 1.048.576 nativos), un Mac de 256 GiB puede analizar contratos, expedientes o bases de código completas sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos estrictos de confidencialidad.
- Análisis multimodal de imágenes: la presencia del vision tower permite tareas de descripción, extracción de información y respuesta a preguntas sobre imágenes dentro de un flujo puramente local en Apple Silicon.
- Evaluación de cuantización extrema: el checkpoint oQ2.5e sirve como banco de pruebas para medir la degradación de calidad de un modelo de 262.000 millones de parámetros comprimido a una precisión mixta efectiva de unos 2,5 bits, comparándolo con el modelo original en FP8 o BF16.
- Servicio de inferencia personal con oMLX: la receta documenta una configuración completa (límite wired de 228 GiB, guard de 232 GiB, caché SSD paginada de 100 GiB, tres peticiones activas con chunked prefill) que permite levantar un endpoint de generación de texto en un único equipo de sobremesa.
- Pruebas de decodificación especulativa: el borrador MTP de 7,49 GiB y el pipeline CED permiten medir ganancias de throughput en decodificación sobre hardware Apple, un escenario poco cubierto por los benchmarks habituales de GPU.
- Desarrollo de aplicaciones con contexto masivo y datos sensibles: investigadores que necesiten resumir o razonar sobre corpus de cientos de miles de tokens pueden desplegar el modelo en local sin depender de APIs externas, con la ventaja de la licencia MIT para integrarlo en productos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta cifras de despliegue (huella de memoria, tamaño de KV cache de 890 bytes/token, límites de wired memory), no métricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria unificada: 256 GiB en Apple Silicon es la clase de máquina probada; los pesos residentes con Engram offloaded suman 204,73 GiB.
- Límite wired de Metal: `iogpu.wired_limit_mb=237568` (232 GiB), necesario para el wiring de 228 GiB de MLX.
- Petición de referencia de MLX: `mx.set_wired_limit(228 * 2**30)`; oMLX puede ajustar el asignador en tiempo de ejecución.
- Guard de oMLX: `--memory-guard-gb 232`.
- Almacenamiento: SSD PCIe local rápido para las tablas Engram (188,8 GiB) y caché SSD paginada de 100 GiB sin caché caliente en RAM.
- VRAM dedicada: no aplica en el sentido tradicional; Apple Silicon usa memoria unificada. No cabe en GPU de consumo con VRAM discreta (RTX 4090, 24 GB) ni en configuraciones de 128 GiB.
- Opciones de despliegue: oMLX 0.7.3 con kernels nativos; requiere MLX 0.32.4, mlx-vlm 0.7.11, mlx-lm 0.32.3.dev8, mlx-audio 0.6.3 y transformers 5.14–5.20. No es compatible con GGUF, llama.cpp, vLLM ni Ollama en esta distribución.
- Ajustes de rendimiento: `deepseek_v41_ced_prefill_enabled: true`, `a8_prefill_enabled: true`, `a8_prefill_min_tokens: 128`, `deepseek_v41_engram_ssd_offload: true`, MTP activo con profundidad 1, `MLX_METAL_RESIDENCY_REFRESH_INTERVAL_MS=1000`, tres peticiones activas con chunked prefill y `prefill_priority: context`.
- Latencia y throughput: no disponibles en la información proporcionada; la model card no publica tokens por segundo.
- Recomendación operativa: excluir del indexado de Spotlight los directorios del modelo y de caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Abliterated-MLX (este) | 262,2 B | 1.048.576 nativo (256K en la receta) | MLX safetensors oQ2.5e | MIT | Hugging Face, requiere 256 GiB Apple Silicon |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible en la información | 1.048.576 nativo | no disponible | no disponible | Hugging Face |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos base y heretic en la información proporcionada, por lo que la comparación se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo en los pesos: el modelo puede generar contenido que el modelo base rechazaría. No es adecuado para aplicaciones orientadas al público sin capas de filtrado externas.
- La cuantización oQ2.5e es extremadamente agresiva para un modelo de 262.000 millones de parámetros; cabe esperar degradación de calidad respecto al modelo original, aunque la model card no cuantifica esa pérdida.
- El autor advierte de que no debe reaplicarse el parche de escritura ni un adaptador de steering en tiempo de ejecución.
- El offload de Engram a SSD introduce dependencia de la latencia del almacenamiento; un SSD lento degradará el rendimiento de forma notable.
- La ventana de 1.048.576 tokens es nativa, pero la receta recomienda 262.144 por velocidad y precisión; el autor señala que la caída de precisión en contextos muy largos es una característica general de DeepSeek-V4.1-Flash, no un efecto de esta cuantización.
- El despliegue exige hardware muy específico (Apple Silicon de 256 GiB) y una pila de versiones fijadas; no hay soporte para CUDA, llama.cpp ni vLLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe equilibrado.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado por un modelo sin rechazos.
- La huella de memoria deja solo 24–28 GiB fuera de los presupuestos de wired memory, lo que limita la ejecución concurrente de otras aplicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vaquero-labs/DeepSeek-V4.1-Flash-1017-Abliterated-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Linaje heretic: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Variante oQ2.5e-mtp referenciada: https://huggingface.co/apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX/tree/main
- Artículo sobre memoria Engram en SSD: https://capacity.at/blog/deepseek-engram-memory-on-ssd/
- Hilo de benchmarks de M5 Ultra 64 núcleos y 256 GB: https://www.reddit.com/r/MacStudio/comments/1xk5ffv/m5_ultra_64_core_256gb_benchmark/
- Papers, blogs y repositorios adicionales: no disponibles en la información proporcionada.
