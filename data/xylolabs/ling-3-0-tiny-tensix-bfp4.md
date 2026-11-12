# Xylolabs/Ling-3.0-tiny-Tensix-BFP4

## Resumen

Ling-3.0-tiny-Tensix-BFP4 es una cuantización del modelo inclusionAI/Ling-3.0-tiny, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). No es un modelo nuevo: es un checkpoint derivado en el que las capas lineales del modelo base se han cuantizado a `ttnn.bfloat4_b` (BFP4, formato de bloque en coma flotante) mediante GPTQ, con el objetivo de reducir la huella de memoria y encajar el modelo en la jerarquía de memoria de los NPU de Tenstorrent.

El modelo base es un transformer híbrido de la familia `bailing_hybrid`, con 7.893.392.800 parámetros totales, que combina atención lineal (KDA), atención multi-cabeza latente (MLA) y capas MLP con mezcla de expertos. La cuantización empaqueta 9.067 matrices a 4,5 bits por peso, con un promedio de 4,86 bits por peso y un tamaño empaquetado de 4,79 GB, frente a los 15,8 GB del repositorio. El resto de tensores (embeddings, router, normalizaciones, convoluciones y algunos sesgos de atención) se mantienen en bf16 o float32.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización de bajo nivel orientada a hardware específico (no a GPU convencional); por otro, advierte de que el checkpoint no incluye implementación de inferencia y de que solo se ha validado el empaquetado de pesos en simulación (ttsim), no en hardware real. Es, por tanto, un artefacto de investigación y despliegue experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `bailing_hybrid` (atención lineal KDA + MLA + MLP con mezcla de expertos) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso), GPTQ con búsqueda de exponente por bloque (offsets -1 y 0, damping 0,1); embeddings, router, normas y convoluciones en bf16; `A_log`, `dt_bias` y `expert_bias` en float32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (valores bf16 para matrices cuantizadas), con `quant4.json` y `model.safetensors.index.json`; código custom vía `trust_remote_code=True` |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `inclusionAI/Ling-3.0-tiny`, etiquetada como `bailing_hybrid`. Según los tensores presentes, combina capas de atención lineal KDA, proyecciones MLA (`q_b_proj`, `kv_a_proj_with_mqa`) y bloques MLP con expertos enrutados y compartidos, además de una cabeza LM. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación técnica de esta release es el pipeline de cuantización `tensix-bfp-gptq`: las capas lineales se cuantizan a BFP4 con GPTQ y una búsqueda de exponente por bloque, y los pesos resultantes se empaquetan para que coincidan bit a bit con la representación `ttnn.bfloat4_b` de TT-NN. Se cuantizan 9.067 matrices, incluida la cabeza LM, con un promedio de 4,86 bits por peso. Doce matrices de atención (`attention.q_b_proj` y `attention.kv_a_proj_with_mqa` en las capas 3, 7, 11, 15, 19 y 23) requieren una permutación de filas (pares par/impar sobre el sufijo rotatorio) para caer en la rejilla BFP4; los ficheros conservan el orden original de Hugging Face. La validación se ha hecho con `pack_tensix.py` y `verify_grid.py`, y con TT-NN 0.81.1 sobre `ttsim` (simulador de Blackhole), no sobre hardware. `tt-transformers` y `tt-forge` no se han probado con este checkpoint.

## Capacidades

- Generación de texto conversacional, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y generación de código y matemáticas: capacidades heredadas del modelo base, no verificadas de forma independiente en esta cuantización.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo base no declara idiomas en esta ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante empaquetado BFP4 compatible con TT-NN.

## Casos de uso

- Despliegue experimental en NPU Tenstorrent: el checkpoint está pensado para cargarse en Wormhole o Blackhole con TT-NN, empaquetando las matrices BFP4 directamente en DRAM del dispositivo; adecuado para equipos que evalúan la viabilidad de inferencia de un modelo de ~7,9 mil millones de parámetros en aceleradores Tensix.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible de GPTQ a BFP4 con búsqueda de exponente por bloque, útil para comparar la degradación de calidad (KL frente a BF16) de distintos esquemas de cuantización.
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar bit a bit que los pesos empaquetados coinciden con la rejilla BFP4 antes de desplegar en hardware.
- Generación de texto en entornos con memoria limitada: con 4,79 GB empaquetados, el modelo cabe en presupuestos de memoria reducidos, lo que facilita prototipos de chat y asistentes conversacionales en placas Tensix.
- Pruebas de integración con `tt-transformers` y `tt-forge`: aunque no se han ejecutado con este checkpoint, el artefacto sirve para preparar la integración futura de modelos híbridos cuantizados en esos stacks.
- Benchmarking de inferencia en simulador: útil para medir latencias y throughput estimados en `ttsim` antes de disponer de hardware, como paso previo a la validación en silicio.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial (la información proporcionada se corta en la fila BF16). Los datos disponibles son:

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (inclusionAI/Ling-3.0-tiny) | 16 | no disponible | referencia | no disponible | no disponible | no disponible |
| Ling-3.0-tiny-Tensix-BFP4 | 4,86 (4,5 en matrices cuantizadas) | 4,79 empaquetado | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para esta cuantización. Los valores de calidad (KL, Top-1) de la fila BFP4 no están incluidos en el fragmento de model card proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,79 GB de pesos empaquetados en BFP4; el repositorio completo ocupa 15,8 GB. La memoria adicional para activaciones y caché KV no está especificada.
- GPU recomendadas: el checkpoint no está pensado para GPU convencional; su destino son NPU Tenstorrent Tensix (Wormhole y Blackhole). Para cargarlo en GPU se necesitaría el código custom del modelo base y sus dependencias CUDA/FLA, sin garantías de que la cuantización BFP4 funcione fuera de TT-NN.
- ¿Cabe en GPU de consumo? No disponible; el formato BFP4 es específico de TT-NN y no se ha validado en GPU de consumo.
- Opciones de despliegue: TT-NN 0.81.1 (probado en `ttsim`, simulador de Blackhole); `tt-transformers` y `tt-forge` no se han probado con este checkpoint. Para carga en PyTorch, Transformers 4.57.1 con `trust_remote_code=True` y flash-linear-attention 0.4.2; no usar Transformers 5.x, cuya arquitectura nativa `bailing_hybrid` es distinta.
- Latencia y throughput: no disponibles; no se han publicado mediciones en hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-Tensix-BFP4 | 7.893.392.800 | no disponible | BFP4 (4,5 bits/peso), GPTQ | MIT | Hugging Face, orientado a Tensix |
| inclusionAI/Ling-3.0-tiny (base) | 7.893.392.800 | no disponible | BF16 | no disponible en esta ficha | Hugging Face |
| Alternativas de ~7-8B en BFP4 para Tensix | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos cuantizados a BFP4 para Tensix con los que comparar directamente. La comparación más directa es con el modelo base en BF16, del que este checkpoint es una derivación cuantizada.

## Limitaciones y advertencias

- No incluye implementación de inferencia: la release solo aporta pesos empaquetados y scripts de verificación; la ejecución requiere el código custom del modelo base.
- Validación solo en simulador: las comprobaciones TT-NN se han hecho con `ttsim` (Blackhole), no en hardware real; el rendimiento en silicio no está verificado.
- Doce matrices de atención (`q_b_proj` y `kv_a_proj_with_mqa` en capas 3, 7, 11, 15, 19 y 23) no caen en la rejilla BFP4 tal como se almacenan; requieren una permutación de filas documentada. Una implementación debe ordenar sus pares rotatorios de forma coherente con ese empaquetado.
- Incompatibilidad con Transformers 5.x: la arquitectura nativa `bailing_hybrid` de esa versión difiere y no debe usarse para cargar el checkpoint.
- Dependencias frágiles: el entorno de referencia usa Transformers 4.57.1 y flash-linear-attention 0.4.2, mientras que el config original registra Transformers 4.45.0.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas y contexto: no declarados; no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad de la cuantización ni sobre su idoneidad en producción.
- `tt-transformers` y `tt-forge` no se han ejecutado con este checkpoint, por lo que la integración con esos stacks está sin validar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ling-3.0-tiny-Tensix-BFP4
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia MIT del checkpoint: https://huggingface.co/Xylolabs/Ling-3.0-tiny-Tensix-BFP4/blob/main/LICENSE
