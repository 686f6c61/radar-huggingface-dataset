# Xylolabs/GLM-4.7-Flash-Tenstorrent-Tensix-BFP4

## Resumen

GLM-4.7-Flash-Tenstorrent-Tensix-BFP4 es una cuantización del modelo zai-org/GLM-4.7-Flash realizada por Xylolabs para su ejecución en aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). El modelo base es un transformer de tipo MoE ligero (clase `glm4_moe_lite` en Transformers) con 31.221.488.576 parámetros totales. Esta exportación cuantiza las capas lineales del decodificador a `ttnn.bfloat4_b` (block floating point de 4 bits) mediante GPTQ, manteniendo el resto de tensores en bf16 y el módulo MTP en su precisión original.

El problema que resuelve es doble: por un lado, reduce el peso del modelo de 59,89 GB en BF16 a 17,76 GB empaquetados (4,75 bits por peso de media), lo que permite desplegar un modelo de 31B en memoria de dispositivo limitada; por otro, produce pesos que se empaquetan bit a bit en el formato nativo de las NPU Tensix, de modo que la inferencia se ejecuta directamente sobre hardware de Tenstorrent sin conversiones en tiempo de ejecución.

Es relevante ahora porque el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge) está madurando como alternativa abierta a las GPU, y este checkpoint demuestra una ruta de cuantización GPTQ específica para su formato de bloque. La licencia MIT del modelo base se mantiene, lo que facilita su uso comercial. Las comprobaciones de empaquetado se realizaron sobre simulador (ttsim) con ttnn 0.81.1, no sobre silicio real, y tt-transformers y tt-forge no se han probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE ligero (`glm4_moe_lite`), con capas de atención MLA y capa MTP adicional |
| Parametros totales | 31.221.488.576 (31,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`) con GPTQ para proyecciones MLA y MLP; bf16 para el resto; float32 para `mlp.gate.e_score_correction_bias`; MTP sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 62,5 GB; pesos empaquetados 17,76 GB en dispositivo) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia GLM-4.7-Flash, identificado en Transformers como `glm4_moe_lite`. Emplea atención multi-cabeza latente (MLA) con proyecciones `q_b_proj` y `kv_a_proj_with_mqa`, capas MLP densas, enrutadas y compartidas, y una capa MTP (multi-token prediction) adicional en `model.layers.47`. El checkpoint contiene 47 capas de decodificador con 9.208 matrices cuantizadas: proyecciones MLA y pesos gate/up/down de las MLP densas, enrutadas y compartidas.

La cuantización se aplica solo a las capas lineales del decodificador, usando GPTQ con búsqueda de exponente por bloque (offsets -1 y 0, damping 0,1). Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, con 4,5 bits por peso en esas capas y 4,75 bits de media. El LM head, los embeddings, los pesos del router, las normas y demás tensores no cuantizados permanecen en bf16; la capa MTP se conserva intacta en bf16 y float32 y no se evaluó. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO.

Una particularidad técnica importante: las 94 matrices `self_attn.q_b_proj` y `self_attn.kv_a_proj_with_mqa` conservan el orden de filas original de Hugging Face y solo caen en la rejilla BFP4 tras una permutación específica (mantener las primeras 192 filas de cada cabeza de `q_b_proj` y reordenar las últimas 64 en filas pares seguidas de impares; en `kv_a_proj_with_mqa`, mantener las primeras 512 filas y aplicar la misma permutación a las últimas 64). Cualquier implementación debe alinear sus pares rotatorios con este orden de empaquetado.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat propia (`apply_chat_template`).
- Razonamiento y respuesta a preguntas de conocimiento general, según la evaluación cualitativa publicada (38 de 40 respuestas correctas en la comparativa frente a BF16).
- Capacidades de código y matemáticas: no se documentan explícitamente en la información disponible del checkpoint cuantizado.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Capa MTP (predicción multi-token) presente en el checkpoint, aunque no cuantizada ni evaluada, y no utilizada por el quickstart de Transformers.
- Ejecución nativa en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn, con empaquetado bit a bit verificado.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. Un modelo de 31B con pesos empaquetados de 17,76 GB cabe en la memoria de dispositivo de una NPU Tensix, lo que permite servir generación de texto en infraestructura no-GPU con el formato nativo `bfloat4_b` y sin conversiones en tiempo de ejecución.
- Sustitución de GPU en entornos con restricciones de suministro: organizaciones que ya operan aceleradores Wormhole o Blackhole pueden ejecutar un modelo conversacional de 31B en su parque existente, manteniendo la licencia MIT para uso comercial.
- Asistentes conversacionales en inglés y chino: el modelo conserva la plantilla de chat del base y puede gestionar diálogos multi-turno; la ventana de contexto no está documentada, por lo que debe validarse empíricamente antes de fijar límites de conversación.
- Prototipado e investigación en cuantización de bajo bit: el checkpoint sirve como referencia reproducible de GPTQ con búsqueda de exponente por bloque sobre BFP4, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban las 9.208 matrices declaradas.
- Evaluación de fidelidad de cuantización: la model card publica la comparativa contra BF16 (KL medio, top-1, respuestas correctas), útil para medir la degradación introducida por 4,75 bits por peso antes de adoptar el modelo en producción.
- Inferencia en CPU para validación: el quickstart con Transformers 5.22.2 se comprobó en CPU, lo que permite validar prompts y plantillas de chat sin disponer de hardware Tensix, aunque con latencia muy superior.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (zai-org/GLM-4.7-Flash) | 16 | 59,89 | 0 | 100 | 38 de 40 | - |
| BFP4 (este checkpoint) | 4,75 | 17,76 | no disponible | no disponible | no disponible | no disponible |

La información disponible solo incluye la fila BF16 completa; los valores de la fila BFP4 no se recogen en los datos proporcionados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 17,76 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers. El repo completo ocupa 62,5 GB en disco.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante ttnn (verificado con ttnn 0.81.1 sobre el simulador Blackhole `ttsim`).
- GPU consumer: no es el objetivo del checkpoint; el formato `bfloat4_b` es específico de Tensix y no se ejecuta de forma nativa en GPU. El quickstart de Transformers funciona en CPU en bf16, pero requiere memoria suficiente para los pesos sin empaquetar.
- Opciones de despliegue: Transformers 5.22.2 o superior (necesario para la clase nativa `glm4_moe_lite`; versiones anteriores no cargan el modelo), ttnn para ejecución en Tensix y los scripts `pack_tensix.py` y `verify_grid.py` del repositorio de código. tt-transformers y tt-forge no se han probado con este checkpoint.
- Latencia y throughput: no disponible. Las comprobaciones se realizaron en simulador, no en silicio, por lo que no hay cifras de rendimiento reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.7-Flash-Tenstorrent-Tensix-BFP4 (este) | 31,2 B | no disponible | BFP4 GPTQ (4,75 bits/peso) | MIT | Hugging Face, 52 descargas |
| zai-org/GLM-4.7-Flash (base) | 31,2 B | no disponible | BF16 (59,89 GB) | MIT | Hugging Face |
| Alternativas de mismo tamano en formato GGUF/AWQ | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada; la única comparación documentada es contra el modelo base en BF16.

## Limitaciones y advertencias

- Solo se han publicado métricas de fidelidad de cuantización para el modelo base en BF16; el rendimiento del checkpoint BFP4 en benchmarks estándar no está documentado.
- Las 94 matrices `q_b_proj` y `kv_a_proj_with_mqa` no están en la rejilla BFP4 tal como se almacenan; requieren la permutación descrita en la model card. Una implementación que no la aplique obtendrá resultados incorrectos.
- Las comprobaciones de empaquetado se hicieron en el simulador `ttsim`, no en silicio Wormhole o Blackhole real; el comportamiento en hardware físico no está verificado por el autor.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, lo que limita las rutas de despliegue probadas.
- La capa MTP se conserva sin cuantizar y sin evaluar; no debe asumirse su calidad.
- El modelo solo declara soporte de inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y sesgos: no hay información específica publicada para este checkpoint; deben evaluarse antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y de los pesos derivados.
- La longitud de contexto no está disponible en la información proporcionada, lo que impide dimensionar la caché KV y planificar cargas de trabajo con documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/GLM-4.7-Flash-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia: arXiv:2508.06471 (https://arxiv.org/abs/2508.06471)
- Licencia: https://huggingface.co/Xylolabs/GLM-4.7-Flash-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
