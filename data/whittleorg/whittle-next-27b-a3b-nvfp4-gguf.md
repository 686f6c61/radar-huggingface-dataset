# whittleOrg/Whittle-Next-27B-A3B-NVFP4-GGUF

## Resumen

Whittle-Next-27B-A3B-NVFP4-GGUF es una cuantización en formato NVFP4 (FP4 de NVIDIA/OCP con escalas microscópicas UE4M3 por cada 16 elementos) del modelo Whittle-Next-27B-A3B, un modelo de lenguaje de arquitectura híbrida tipo mixture-of-experts (MoE) desarrollado dentro del proyecto Whittle, atribuido a logic65. El modelo base cuenta con 27.553.461.376 parámetros totales y una arquitectura etiquetada como `qwen4exp`, que combina atención con mecanismos de estado recurrente (SSM), hyper-connections y una tabla de memoria n-gram por capa.

Esta ficha corresponde concretamente al artefacto GGUF cuantizado por phantomic12 (publicado bajo la organización whittleOrg), pensado para su uso con llama.cpp. El archivo pesa 15,92 GiB (17.094.118.432 bytes) con 4,96 bits por peso, lo que lo hace desplegable en GPUs de consumo con suficiente VRAM, a diferencia de los pesos completos en precisión nativa. La cuantización emplea NVFP4 en el cuerpo del modelo pero preserva en Q8_0 la tabla de embeddings n-gram por capa, los embeddings de tokens y la capa de salida, y mantiene en F16 las convoluciones 1D del SSM.

El interés de esta publicación es doble: por un lado, ofrece una vía práctica de ejecutar un modelo MoE de ~27B en hardware modesto; por otro, documenta con detalle el proceso de cuantización NVFP4 en llama.cpp, incluyendo el parche necesario en `llama-quantize` (que en la versión analizada, commit `9fba51d`, no expone `NVFP4` en `QUANT_OPTIONS`) y las mediciones de perplejidad realizadas. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mixture-of-experts (MoE), estado recurrente (SSM), hyper-connections y memoria n-gram por capa; identificador `qwen4_exp` |
| Parametros totales | 27.553.461.376 |
| Parametros activos | 3B (según el sufijo A3B del nombre; no se detalla el reparto exacto por experto en la información disponible) |
| Longitud de contexto | 262.144 tokens (según llmrun.dev; no confirmado en la model card del artefacto) |
| Tipos de cuantizacion | NVFP4 (E2M1 de 4 bits en bloques de 64 con escala UE4M3 por sub-bloque de 16), Q8_0, F16, BF16, F32; existen otras cuantizaciones GGUF del modelo base (Q8_0 a Q3_K_M) en repos de logic65 y mradermacher |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único `Whittle-Next-27B-A3B-v4.4-NVFP4.gguf`); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas de atención con capas de estado recurrente (SSM), siguiendo la tendencia de modelos como los de la familia Mamba o Jamba. Sobre esa base se añaden dos elementos distintivos: hyper-connections (mecanismo de conexión entre capas que generaliza las conexiones residuales) y una tabla de memoria n-gram por capa (`per_layer_token_embd.weight`), con aproximadamente 2.000 millones de filas, que actúa como memoria asociativa de secuencias. El componente MoE reduce el coste de inferencia activando solo ~3B parámetros por token de los ~27,5B totales.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La model card del artefacto cuantizado se centra exclusivamente en el proceso de cuantización: el cuerpo se convierte a NVFP4 con un recetario de tipos por tensor que mantiene en Q8_0 la tabla n-gram (por ser una lectura de RAM, no de VRAM), los embeddings de tokens y la capa de salida, y fuerza F16 en las 31 convoluciones 1D (`ple_conv1d`, `ssm_conv1d`) porque su dimensión `ne0 = 4` no es divisible por el bloque de 64 elementos de NVFP4. El dry run reportó 0 cuantizaciones de reserva (fallback), y el proceso completo tardó 222 segundos en 24 hilos para una fuente de 29,3 GB.

## Capacidades

- Generación de texto conversacional, con plantilla de chat compatible (`--jinja`) y razonamiento aritmético básico verificado en pruebas de humo ("84 * 3 = 252").
- Razonamiento multi-paso y capacidad de "thinking" implícita en el modo de generación con razonamiento mostrado.
- Soporte multilingüe declarado para inglés, chino y otros idiomas (etiqueta `multilingual`).
- Contexto largo de hasta 262.144 tokens según fuentes externas, adecuado para documentos extensos y conversaciones multi-turno.
- Eficiencia de inferencia por su naturaleza MoE: ~3B parámetros activos por token.
- Memoria n-gram por capa que puede mejorar la coherencia en secuencias largas y la recuperación de patrones repetidos.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni agentes en la información disponible.

## Casos de uso

- Asistente conversacional de contexto largo: con una ventana de hasta 262.144 tokens, el modelo puede mantener conversaciones multi-turno sobre documentos extensos (contratos, manuales, bases de código) sin truncar el historial, y su naturaleza MoE mantiene el coste por token bajo.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar 15,92 GiB en NVFP4, cabe en GPUs como la RTX 4090 (24 GB) o la RTX 5090, permitiendo inferencia local de un modelo de 27B sin depender de la nube.
- Procesamiento de documentación técnica en inglés y chino: útil para equipos que trabajan con documentación bilingüe, resúmenes y extracción de información de manuales.
- Generación de código asistida en local: aunque no se documenta tool calling, el modelo puede integrarse en editores y pipelines de revisión como generador de texto y completado, con la ventaja de privacidad de ejecución local.
- Investigación sobre cuantización FP4: el artefacto sirve como referencia reproducible para estudiar el impacto de NVFP4 en arquitecturas híbridas SSM/MoE, gracias al recetario de tipos publicado y a las mediciones de perplejidad.
- Prototipado de agentes y pipelines con llama.cpp: mediante la API compatible con endpoints y el servidor de llama.cpp, se puede exponer el modelo como servicio HTTP para pruebas de integración.
- Análisis de corpus largos sin conexión: con `-ot per_layer_token_embd=CPU` la tabla n-gram reside en RAM, liberando VRAM para el resto de capas y permitiendo procesar lotes grandes en equipos con poca memoria gráfica.

## Benchmarks y rendimiento

La model card solo reporta perplejidad medida con `llama-perplexity` en CPU (Xeon E5-2670 v3, 24 hilos, `-ngl 0`, contexto 4096, `--chunks 2`) sobre un corpus de 900.000 bytes de Gutenberg (Pride & Prejudice, Moby-Dick, Frankenstein):

| Modelo | Perplejidad (--chunks 2) |
|---|---|
| NVFP4 (este artefacto) | 9,1299 ± 0,35318 |
| Q8_0 (fuente) | pendiente; la medición no llegó a completarse (OOM en el primer intento) |

El autor advierte explícitamente que el delta frente a Q8_0 no se conoce y que el error estándar de ±0,35 PPL en esta configuración solo permite detectar diferencias grandes; se necesita una repetición con `--chunks 24` antes de citar cualquier coste de cuantización. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB para el archivo NVFP4 completo; con `-ot per_layer_token_embd=CPU` se liberan ~2 GB de VRAM al mantener la tabla n-gram en RAM del sistema.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090, A100 (40/80 GB), H100. En GPUs con menos de 16 GB habría que recurrir a cuantizaciones menores del modelo base (Q4_K_M, Q3_K_M).
- Cabe en GPU de consumo: sí, en RTX 4090 y superiores; el soporte NVFP4 en CUDA funciona con DP4A en cualquier arquitectura, pero la ruta rápida requiere Blackwell MMA (`BLACKWELL_MMA_AVAILABLE`).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-perplexity`). No se documenta soporte en vLLM, TGI ni Ollama para este formato.
- Compatibilidad de backend: CUDA (sí), Vulkan (sí, con extensión OCP microscaling para ruta rápida), CPU (sí, con SIMD x86 `ggml_vec_dot_nvfp4_q8_0`), Metal (no), ROCm (kernels compilan por la ruta CUDA pero sin verificar en este archivo).
- Latencia y throughput: no disponibles; solo se reporta el tiempo de cuantización (222 s en 24 hilos) y una prueba de humo de generación sin métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/Disponibilidad | Notas |
|---|---|---|---|---|---|
| Whittle-Next-27B-A3B NVFP4 (este) | 27,5B totales / ~3B activos | 262.144 (fuente externa) | Apache-2.0 | GGUF NVFP4, 15,92 GiB | Cuantización FP4 con recetario documentado; soporte Metal ausente |
| Whittle-Next-27B-A3B Q8_0 (logic65) | 27,5B totales / ~3B activos | 262.144 (fuente externa) | Apache-2.0 | GGUF Q8_0, ~29,3 GB | Mayor fidelidad, no cabe en GPU de consumo de 24 GB sin offload |
| Whittle-Next-27B-A3B Q4_K_M / Q3_K_M (logic65, mradermacher) | 27,5B totales / ~3B activos | 262.144 (fuente externa) | Apache-2.0 | GGUF K-quants | Menor tamaño; calidad FP4 frente a K-quants no comparada en la información disponible |
| Modelos MoE de ~30B con ~3B activos (p. ej. familias Qwen MoE) | ~30B totales / ~3B activos | 32K–128K típicamente | variable | safetensors, GGUF | No se dispone de comparación de rendimiento directa en la información proporcionada |

## Limitaciones y advertencias

- El delta de perplejidad frente a la fuente Q8_0 no se ha medido: la model card indica explícitamente que no se reclama ninguna pérdida de calidad y que la comparación está pendiente.
- Los tensores `ssm_out`, `ssm_alpha`, `ssm_beta` y `attn_gate` quedan en NVFP4; en arquitecturas híbridas son los más sensibles a la cuantización según estudios por tensor, y el propio autor señala que si el modelo rinde peor que Q4_K_M, ahí está el primer punto a revisar.
- Sin soporte en Metal: no ejecutable en Apple Silicon con llama.cpp para este formato.
- ROCm sin verificar: los kernels compilan por la ruta CUDA, pero no se ha probado en ninguna tarjeta AMD.
- Requiere un `llama-quantize` parcheado para reproducir la cuantización; el llama.cpp estándar (commit `9fba51d`) rechaza el ftype NVFP4.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo base sin ficha de alineación publicada, deben evaluarse en el caso de uso concreto.
- Idiomas: el soporte declarado se limita a inglés, chino y multilingüe genérico; el rendimiento en castellano no está verificado.
- Uso comercial: la licencia Apache-2.0 lo permite, pero conviene revisar la licencia y condiciones del modelo base y de los datos de entrenamiento, no detalladas aquí.
- La prueba de generación fue solo de humo ("smoke test"), no un benchmark; no hay datos de latencia ni throughput en producción.

## Enlaces

- Repositorio Hugging Face de este artefacto: https://huggingface.co/whittleOrg/Whittle-Next-27B-A3B-NVFP4-GGUF
- Modelo base: https://huggingface.co/whittleOrg/Whittle-Next-27B-A3B
- GGUF Q8_0 de referencia (logic65): https://huggingface.co/logic65/Whittle-Next-27B-A3B-GGUF
- Cuantizaciones GGUF alternativas (mradermacher): https://huggingface.co/mradermacher/Whittle-Next-27B-A3B-GGUF
- Pesos completos en ModelScope: https://www.modelscope.cn/models/logic65/Whittle-Next-27B-A3B
- Requisitos de hardware (llmrun.dev): https://llmrun.dev/model/logic65-whittle-next-27b-a3b
- Estadísticas del modelo (openmodelstats): https://openmodelstats.com/models/mradermacher/whittle-next-27b-a3b-gguf
- Perfil del cuantizador: https://huggingface.co/phantomic12
- Perfil del autor del modelo base: https://huggingface.co/logic65
