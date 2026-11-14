# Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal Qwen3.6-35B-A3B de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer híbrido con mezcla de expertos (MoE) de 35.951.822.704 parámetros totales y 3.000 millones de parámetros activos por token, con capacidad de entrada imagen-texto. Esta exportación sustituye las capas lineales del modelo de lenguaje por matrices cuantizadas a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ, manteniendo el resto de tensores en bf16.

La motivación de esta variante es puramente de despliegue: el formato BFP4 es nativo en TT-NN, de modo que los pesos se empaquetan en la NPU sin conversión ni pérdida adicional de valores. El resultado es un checkpoint de aproximadamente 20,99 GB para los pesos del modelo de lenguaje, lo que permite ejecutar un MoE de 35B en hardware Tensix con un consumo de memoria muy inferior al de bf16. La licencia es Apache 2.0 y el formato de pesos es safetensors con indexado `model.safetensors.index.json` y un mapa de formatos por proyección en `quant4.json`.

Es relevante ahora porque el soporte de Qwen3.6 en el ecosistema Tenstorrent es incipiente: tt-transformers no soporta esta arquitectura y el demo oficial de tt-metal para Qwen3.5/3.6 requiere cuatro chips Blackhole P150 en paralelo de tensor. Este checkpoint ofrece una vía cuantizada y verificable para ese mismo hardware, con scripts de comprobación incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención completa y Gated DeltaNet (capas lineales); multimodal imagen-texto |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en LM head, embeddings, normas, `mtp` y `visual`; media de 4,84 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B combina capas de atención completa con capas de Gated DeltaNet, un mecanismo de atención lineal recurrente. Según el mapa de formatos del checkpoint, la atención q/k/v/o aparece en 10 capas, mientras que las proyecciones de Gated DeltaNet (q, k, v, z, a, b y salida) aparecen en 30 capas, y los expertos enrutados (gate, up, down) junto con el experto compartido se distribuyen en 40 capas. El modelo incluye además un bloque MTP (multi-token prediction) y una torre visual, ambos conservados en bf16 sin cuantizar.

Esta exportación no entrena el modelo: aplica GPTQ sobre las capas lineales con una búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los expertos enrutados comparten una única matriz de Hessian por capa para gate y up, mientras que la proyección down de cada experto usa su propio Hessian o, si vio pocos tokens de calibración, redondeo al más cercano. Los pesos cuantizados se almacenan como valores bf16 sobre la retícula BFP4, de forma que TT-NN los empaqueta sin alterar su valor. Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el bloque MTP quedan intactos en bf16.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), aunque la evaluación publicada cubre solo el modelo de lenguaje.
- Razonamiento y respuesta a preguntas de conocimiento general (el ejemplo de la model card es una pregunta de cultura general).
- Mezcla de expertos con 3.000 millones de parámetros activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Predicción multi-token (bloque `mtp`), desactivada por defecto en el demo de tt-metal para este modelo.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Blackhole: el checkpoint está pensado para ejecutarse en TT-NN sobre hardware Tensix; el demo oficial de tt-metal ejecuta el modelo en paralelo de tensor sobre cuatro Blackhole P150, y esta exportación reduce los pesos del modelo de lenguaje a 20,99 GB, lo que hace viable el reparto entre chips.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible de GPTQ a BFP4 con búsqueda de exponente por bloque, con scripts (`pack_tensix.py`, `verify_grid.py`) que verifican que ningún valor cambia al empaquetar.
- Validación de pipelines de compilación TT-NN: el script `pack_tensix.py` con `--device` hace un round-trip por la DRAM del dispositivo, útil para comprobar la ruta de carga de pesos antes de desplegar en producción.
- Prototipado de asistentes multimodales en hardware de inferencia dedicado: al conservar la torre visual en bf16 y el pipeline `image-text-to-text`, permite experimentar con entrada de imagen en entornos Tensix sin reentrenar.
- Evaluación comparativa de precisión bajo cuantización: la model card publica métricas de divergencia KL frente a bf16 y tasa de aciertos, lo que permite medir la pérdida de calidad de un MoE de 35B a 4,84 bits por peso.
- Simulación y desarrollo sin hardware físico: verificado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, lo que facilita el desarrollo de kernels y demos antes de disponer de la NPU.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con columnas de bits por peso, tamaño en GB, KL medio frente a BF16, Top-1 (%) y respuestas correctas/perdidas. Los valores numéricos de esa tabla no están disponibles en la información proporcionada (el contenido se trunca en la fila de BF16), por lo que no se reproducen.

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Correctas / perdidas |
|---|---|---|---|---|---|
| BF16 (Qwen/Qwen3.6-35B-A3B) | no disponible | no disponible | no disponible | no disponible | no disponible |
| BFP4 (esta exportación) | 4,84 | 20,99 (pesos del LM) | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 20,99 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Configuración de referencia del demo: cuatro Blackhole P150 en paralelo de tensor (`MESH_DEVICE=P150x4`); el demo no se ejecuta en un solo chip.
- Verificación realizada en una única chip simulada (ttsim, ttnn 0.81.1); el reparto entre cuatro chips no se ejecutó.
- Cabe en GPU de consumo: no disponible; el checkpoint está empaquetado en BFP4 para TT-NN y no se documenta su uso en GPU.
- Despliegue: TT-NN / tt-metal v0.81.1 (demo `models/demos/blackhole/qwen36`); tt-forge (tt-xla) no probado con este checkpoint; tt-transformers no soporta la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4 | 35,95B / 3B | no disponible | BFP4 (4,84 bits/peso) | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B / 3B | no disponible | bf16 | Apache 2.0 | GPU / genérico |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 35,95B / 3B | no disponible | no disponible | Apache 2.0 | CPU / GPU |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; no hay evaluación publicada de la torre visual ni del bloque MTP en esta exportación.
- El checkpoint está diseñado para TT-NN y Tensix; no es un artefacto portable a otros backends sin conversión.
- El demo de tt-metal requiere cuatro Blackhole P150 y solo se verificó el empaquetado exacto de las proyecciones de las capas 0 a 3 en un chip simulado; el reparto multi-chip no se ejecutó.
- El LM head se re-cuantiza a bfloat8_b en el demo, aunque el checkpoint lo conserva en bf16, lo que introduce una discrepancia entre el checkpoint y la ejecución de referencia.
- El bloque MTP está desactivado por defecto para este modelo en el demo.
- tt-forge (tt-xla) no se ha probado con este checkpoint y tt-transformers no soporta la arquitectura.
- La cuantización a 4,84 bits por peso implica pérdida de precisión frente a bf16; la magnitud exacta (KL, Top-1) no está disponible en la información proporcionada.
- Sesgos conocidos, riesgo de alucinación e idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de tt-metal para Qwen3.5/3.6 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del checkpoint: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
