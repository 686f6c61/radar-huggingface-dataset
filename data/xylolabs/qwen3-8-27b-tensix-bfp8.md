# Xylolabs/Qwen3.8-27B-Tensix-BFP8

## Resumen

Qwen3.8-27B-Tensix-BFP8 es una cuantización del modelo multimodal Qwen3.8-27B de Qwen, publicada por Xylolabs y orientada específicamente al hardware de aceleración de Tenstorrent (NPUs Tensix, familias Wormhole y Blackhole). El trabajo no consiste en un checkpoint de propósito general, sino en un artefacto de despliegue: las capas lineales del modelo base se han redondeado a la rejilla numérica `bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, de forma que el empaquetador de TT-NN pueda cargarlas sin volver a redondear. Los tensores se almacenan en bf16, pero cada valor ya está alineado a la rejilla BFP8.

El modelo conserva la arquitectura híbrida del Qwen3.8-27B original: 16 capas con atención clásica (q, k, v, o), 48 capas con Gated DeltaNet y 64 capas MLP, además de un módulo MTP (multi-token prediction) y una torre visual, ambos mantenidos en bf16 sin cambios. El resultado son 27.781.427.952 parámetros totales, un peso medio de 9,21 bits por parámetro y un tamaño empaquetado de 30,96 GB, frente a los 55,6 GB del repositorio en disco.

La relevancia de esta ficha es acotada pero clara: es uno de los pocos artefactos públicos que traduce un modelo frontera de Qwen al stack de Tenstorrent con una política de precisión explícita y verificable. Su utilidad práctica depende de disponer de hardware Tensix, y el propio autor advierte que las pruebas se han hecho sobre el simulador `ttsim` de Blackhole con ttnn 0.81.1, no sobre silicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención clásica + 48 capas Gated DeltaNet + 64 capas MLP, con módulo MTP y torre visual |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits por peso) en capas lineales; bf16 en embeddings, LM head, normas, MTP y visión |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP8), más `quant4.json` e índice de shards |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: cuantiza el Qwen3.8-27B base. La arquitectura combina atención estándar en 16 capas con Gated DeltaNet en 48 capas, un mecanismo de estado recurrente lineal que reduce el coste de las secuencias largas frente a la atención cuadrática, y añade 64 capas MLP. Incorpora además un módulo de predicción multi-token (MTP) y una torre visual, lo que explica la etiqueta `image-text-to-text` y el pipeline multimodal. Solo el modelo de lenguaje fue cuantizado y evaluado; los módulos `mtp` y `visual` permanecen en bf16 sin tocar.

El proceso de cuantización es GPTQ sobre la rejilla `bfloat8_b` de TT-NN, con el exponente compartido de cada bloque fijado por el empaquetador de Tenstorrent. La calibración se realizó con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores resultantes se guardan en bf16 para que la conversión a BFP8 en TT-NN sea exacta y no introduzca un segundo redondeo. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban matriz a matriz que ningún valor cambia tras el empaquetado, leyendo los pesos en orden `[in, out]` como espera TT-NN.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat propia (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`), heredado de la torre visual del modelo base.
- Razonamiento y matemáticas, en la medida en que lo soporte el Qwen3.8-27B subyacente.
- Generación de código y uso como modelo de lenguaje en pipelines de transformers.
- Predicción multi-token mediante el módulo MTP, conservado en bf16.
- Despliegue en NPUs Tensix (Wormhole, Blackhole) a través de TT-NN y del demo `qwen38_27b_qb2` de tt-metal.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (la calibración incluyó coreano, pero no se documenta el soporte de idiomas).

## Casos de uso

- Despliegue en clústeres Tenstorrent: el caso principal. El checkpoint está pensado para ejecutarse en cuatro chips Blackhole (QuietBox 2) con el demo `qwen38_27b_qb2` de tt-metal v0.81.1, en paralelismo tensorial, sustituyendo el `precision.json` por defecto por una política que mantenga `bfloat8_b` en todas las proyecciones.
- Evaluación de precisión en hardware emergente: sirve para medir la degradación real de un modelo de 27B al pasar a BFP8 sobre NPUs, con una referencia exacta de qué matrices se redondearon y con qué calibración.
- Investigación en cuantización block floating point: el repositorio documenta la rejilla, el número de bits por peso y los scripts de verificación, lo que lo convierte en material útil para estudiar GPTQ sobre formatos BFP.
- Inferencia multimodal en entornos con NPU: al conservar la torre visual en bf16, permite experimentar con tareas imagen-texto en el stack de Tenstorrent sin reentrenar.
- Serving con transformers en GPU: aunque no es su destino, el checkpoint carga con `AutoModelForCausalLM` en bf16 y `device_map="auto"`, útil para validar salidas antes de portarlas a Tensix.
- Reproducibilidad de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar que el empaquetado no altera ningún valor, un paso necesario en flujos de certificación de modelos cuantizados.

## Benchmarks y rendimiento

La model card incluye una sección de evaluación que comienza con una tabla de bits por peso, pero el contenido de resultados no está disponible en la información proporcionada. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint empaquetado ocupa 30,96 GB con 9,21 bits por peso; en bf16 completo, el repositorio pesa 55,6 GB.
- Hardware objetivo: NPUs Tensix de Tenstorrent, familias Wormhole y Blackhole. El demo oficial requiere cuatro chips Blackhole (QuietBox 2) y rechaza cualquier otra configuración.
- GPU convencionales: no se documenta soporte optimizado; la carga vía transformers en bf16 requiere del orden de 56 GB de memoria, lo que exige A100 80 GB, H100 o varias GPU con `device_map`.
- Consumer GPU: no cabe en tarjetas de 24 GB en bf16; no se proporcionan cuantizaciones GGUF ni versiones de 4 bits para este checkpoint.
- Opciones de despliegue: TT-NN (ttnn 0.81.1) y tt-metal con el demo `qwen38_27b_qb2`; tt-transformers no soporta esta arquitectura; tt-forge (tt-xla) no se ha probado con este checkpoint; transformers funciona para validación en GPU.
- Latencia y throughput: no disponibles. Las pruebas se realizaron sobre el simulador `ttsim`, no sobre hardware, y el autor indica que la cabeza del modelo y una ejecución completa no se probaron.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-Tensix-BFP8 | 27,78 B | no disponible | BFP8 sobre safetensors | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | bf16 safetensors | Apache-2.0 | Hugging Face |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | 27,78 B | no disponible | 4-8 bits | Apache-2.0 | no disponible en la información proporcionada |

La comparación relevante es con el modelo base: este checkpoint reduce el peso de 55,6 GB a 30,96 GB y fija 9,21 bits por peso, a cambio de atarse a la rejilla numérica de TT-NN y de no haber sido validado en hardware real. Frente a cuantizaciones de propósito general, la diferencia es el destino: aquí el formato no busca compatibilidad con llama.cpp o vLLM, sino que el empaquetador de Tenstorrent lo consuma sin redondeo adicional.

## Limitaciones y advertencias

- No probado en hardware: las verificaciones se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole. El autor indica explícitamente que la cabeza del modelo y una ejecución completa requieren los cuatro chips y no se han probado.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el módulo MTP quedan en bf16 y no se han validado en su versión cuantizada.
- El demo oficial `qwen38_27b_qb2` empaqueta por defecto en `bfloat4_b`, lo que volvería a redondear estos pesos; es obligatorio escribir una política de precisión propia y apuntar `QWEN_PRECISION_CONFIG` a ella.
- El demo `blackhole/qwen36` de tt-metal también ejecuta Qwen3.8-27B, pero fija el MLP gate y up en `bfloat4_b`, por lo que no respeta la precisión de este checkpoint.
- tt-transformers no soporta esta arquitectura y tt-forge no se ha probado con este checkpoint.
- La cabeza LM en bf16 no es exacta en el demo, que la envía a `bfloat8_b`.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son los heredados del Qwen3.8-27B base, no evaluados aquí.
- Idiomas soportados: no disponibles. La calibración usó WikiText-2 y Wikipedia en coreano, lo que no implica cobertura lingüística.
- Licencia Apache-2.0, permisiva para uso comercial, pero sin garantías por parte del autor de la cuantización.
- El repositorio registra 0 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal qwen38_27b_qb2 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tensix-BFP8/blob/main/LICENSE
