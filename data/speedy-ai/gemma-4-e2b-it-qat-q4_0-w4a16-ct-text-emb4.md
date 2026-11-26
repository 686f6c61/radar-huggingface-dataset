# speedy-ai/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4

## Resumen

Este repositorio contiene un repack no oficial de Gemma 4 E2B-it, la variante instruct de 2B efectivos de la familia Gemma 4 de Google DeepMind. El trabajo lo publica el usuario independiente speedy-ai (a partir del repack previo de xbill9) y consiste en llevar a int4 las tres tablas de embeddings del modelo, de modo que todas las matrices grandes del checkpoint queden en 4 bits. El modelo base es `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text`, que a su vez deriva de la versión QAT oficial de Google en formato compressed-tensors w4a16.

La relevancia de este repack es de infraestructura más que de modelado: al empaquetar `embed_tokens_per_layer` (PLE, 262144 × 8960), `embed_tokens` (262144 × 1536) y `lm_head` como int4 simétrico con grupos de 32 y escalas fp16, el checkpoint baja de 6,11 GiB a 2,64 GiB y la carga en vLLM sobre una Tesla T4 pasa de 6,33 GiB a 2,86 GiB. Según el autor, esto libera memoria para caché KV (de 711.539 a 1.099.362 tokens en su configuración) y acelera la decodificación un 34% (de 81,6 a 109,7 tok/s en un solo stream), manteniendo salidas idénticas en modo greedy en 8 de 8 prompts de prueba.

El modelo es exclusivamente de texto: no admite imagen ni audio. Está pensado para servir en GPUs modestas (Turing o superiores) con vLLM 0.29 o posterior, que es la primera versión con soporte de embeddings int4 de compressed-tensors. La licencia declarada es Apache 2.0, la misma que Google aplica a los pesos de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E2B con embeddings por capa PLE); detalles completos de atención y FFN no disponibles en la información proporcionada |
| Parametros totales | 5.031.222.563 (según safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor nominal; el autor sirve con `--max-model-len 16384` y reporta capacidad de caché KV de hasta 1.099.362 tokens en una T4 |
| Tipos de cuantizacion | QAT int4 (w4a16) en capas lineales; en este repack también embeddings y `lm_head` en int4 simétrico, grupo 32, escalas fp16, formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); pensado para vLLM |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E2B-it, un transformer decoder-only de la familia Gemma 4 de Google DeepMind. La variante E2B incorpora una tabla de embeddings por capa (`embed_tokens_per_layer`, PLE) de 262144 × 8960, además de la tabla `embed_tokens` estándar de 262144 × 1536. Google aplicó entrenamiento con cuantización consciente (QAT) que sitúa tanto las capas lineales como las tablas de embeddings sobre la misma rejilla de 4 bits: dentro de cada grupo de 32 valores a lo largo de una fila, cada valor es `step × level` con nivel entre −8 y 7. El autor del repack verifica este hecho midiendo sobre `google/gemma-4-E2B-it-qat-q4_0-unquantized`: 0 de 73.400.320 grupos de la tabla PLE y 0 grupos de `embed_tokens` quedan fuera de la rejilla, mientras que en el modelo bf16 `google/gemma-4-E2B-it` ningún grupo está en ella.

El repack no elige nuevos niveles de cuantización: recupera el `step` de cada grupo y almacena los niveles, con escalas en fp16 y el mismo layout que las capas lineales. Como vLLM empata la capa de salida copiando el `.weight` del embedding, y un embedding empaquetado no tiene ese tensor, se desempata `lm_head` (`tie_word_embeddings: false`) escribiendo una segunda copia de los mismos niveles y escalas; el modelo original se entrenó con pesos empatados, por lo que ambas copias contienen los valores entrenados. La fidelidad reportada es del 74,3% de valores PLE y 74,0% de `embed_tokens` reconstruidos de forma bit a bit; el resto difiere como máximo 1,25 ulps de bf16 del valor fuente (99,9% dentro de un ulp). El resto de tensores del checkpoint permanece byte a byte igual. No se dispone de información sobre el volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones en la variante `-it` (instruct) de Gemma 4.
- Capacidades multilingües: no disponibles como lista concreta en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Visión y audio: no soportados; el repack es solo texto.
- Salida determinista en modo greedy verificada contra el build `-text` en 8 prompts de 160 tokens (8 de 8 idénticos a nivel de token).

## Casos de uso

- Despliegue en GPUs de gama baja para inferencia de un modelo de 2B efectivos: con 2,86 GiB de carga y 1.099.362 tokens de caché KV en una Tesla T4, cabe holgadamente en 16 GB y permite servir conversaciones con contexto largo sin cuantización adicional.
- Servicio de chat multi-turno con contexto extendido: la ventana de servicio de 16.384 tokens configurada por el autor y la caché KV ampliada permiten mantener historiales largos en atención al cliente o asistentes internos.
- Prototipado y evaluación de pipelines de agentes en local: al ser un modelo instruct de texto con licencia Apache 2.0, se puede integrar en flujos de razonamiento multi-paso y tool calling (si el modelo base lo soporta) sin coste de licencia.
- Generación de texto por lotes en entornos con presupuesto de VRAM ajustado: el throughput de 109,7 tok/s en un solo stream sobre T4 lo hace adecuado para tareas de resumen, clasificación o extracción de información en volúmenes moderados.
- Sustitución de despliegues del build `-text` en vLLM: al mantener salidas greedy idénticas y reducir memoria, sirve como reemplazo directo en infraestructuras ya montadas con vLLM 0.29 o superior.
- Investigación sobre cuantización QAT y embeddings int4: el repositorio incluye las herramientas de repack (`embed_int4.py`) y evidencia de fidelidad, útil para estudiar el impacto de cuantizar tablas de embeddings en modelos con PLE.
- Entornos educativos y de laboratorio con GPUs Turing (T4) o superiores: permite experimentar con un modelo de la familia Gemma 4 sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta métricas de servicio medidas en una Tesla T4 con vLLM 0.29.0, `--dtype float16 --gpu-memory-utilization 0.90 --max-model-len 16384 --max-num-seqs 8` y caché de compilación caliente:

| Metrica | `-text` (base) | Este repack |
|---|---:|---:|
| Memoria de carga del modelo | 6,33 GiB | 2,86 GiB |
| Capacidad de cache KV | 711.539 tokens | 1.099.362 tokens |
| Decodificacion, un stream, 256 tokens | 81,6 tok/s | 109,7 tok/s |
| Salida greedy, 8 prompts × 160 tokens | referencia | 8 de 8 identicos a nivel de token |

El propio autor advierte que la comprobación de 8 prompts es una prueba puntual, no una suite de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,86 GiB de carga del modelo en fp16 sobre T4; el checkpoint en disco ocupa 2,64 GiB (repo de 2,9 GB).
- GPU recomendadas: Tesla T4 (probada), y por extensión cualquier GPU con soporte de fp16 y suficiente VRAM; el autor indica que en GPUs bf16 vLLM convierte las escalas fp16 a bf16, lo que no empeora el resultado.
- Cabe en GPU de consumo: sí, con 2,86 GiB de carga más caché KV y activaciones; cualquier GPU consumer con 8 GB o más debería ser suficiente para contextos moderados, aunque no se aportan medidas específicas en tarjetas consumer.
- Opciones de despliegue: vLLM 0.29 o posterior (obligatorio, por el soporte de `CompressedTensorsEmbeddingWNA16Int`); otros runtimes pueden no cargar los embeddings int4. Comando de ejemplo: `vllm serve xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4 --dtype float16 --max-model-len 16384`.
- Notas de despliegue: tras el primer arranque hay que reiniciar una vez, porque vLLM contabiliza la memoria del compilador como activación al dimensionar la caché KV (980.210 tokens en ese primer arranque); la caché se indexa por identificador de modelo, por lo que el efecto se repite si cambia el nombre o la ruta. En Turing, la atención Triton de vLLM requiere un clamp de memoria compartida (`patch_triton_turing.py` en el rig de servicio).
- Latencia y throughput: 109,7 tok/s en decodificación de un solo stream con 256 tokens generados en T4; no se reportan métricas de prefill ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repack (speedy-ai/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4) | 5.031.222.563 | servicio a 16.384; caché KV hasta 1.099.362 tokens en T4 | int4 w4a16 + embeddings int4 | Apache 2.0 | Hugging Face, requiere vLLM ≥ 0.29 |
| xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text (base directo) | mismo modelo | servicio a 16.384; caché KV 711.539 tokens en T4 | int4 w4a16, embeddings bf16 | Apache 2.0 | Hugging Face, vLLM ≥ 0.29 |
| google/gemma-4-E2B-it (bf16) | mismo modelo | no disponible | bf16 | Apache 2.0 (Gemma 4) | Hugging Face |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | mismo modelo | no disponible | QAT sin empaquetar | Apache 2.0 (Gemma 4) | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de otros fabricantes; la comparación anterior se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo solo texto: no admite entradas de imagen ni audio.
- Repack no oficial, hecho y publicado de forma independiente a Google; los problemas deben reportarse al autor del repositorio, no a Google DeepMind.
- Probado únicamente en una Tesla T4 con fp16 y vLLM 0.29.0; el comportamiento en otras GPUs, precisiones o versiones de vLLM no está verificado.
- Requiere vLLM 0.29 o posterior; versiones anteriores rechazan la configuración por los embeddings int4.
- Otros runtimes (llama.cpp, Ollama, TGI u otros) pueden no cargar los embeddings int4 de compressed-tensors.
- Fidelidad de reconstrucción no perfecta: 74,3% de valores PLE y 74,0% de `embed_tokens` se reconstruyen bit a bit; el resto difiere hasta 1,25 ulps de bf16. La comprobación de equivalencia se limita a 8 prompts en modo greedy.
- `lm_head` se almacena como copia desempatada del embedding; aunque contiene los valores entrenados, el grafo difiere del modelo original con pesos empatados.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; son los inherentes al modelo base Gemma 4 E2B-it de Google.
- Idiomas soportados y limitaciones idiomáticas: no disponibles.
- Licencia Apache 2.0 según la model card, con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de uso de Gemma 4 para uso comercial en producción.
- El primer arranque en vLLM dimensiona mal la caché KV y exige un reinicio; hay que tenerlo en cuenta en despliegues automatizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/speedy-ai/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4
- Modelo base del repack: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text
- Rig de servicio y herramientas de repack: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16
- Copia mantenida del rig en GitHub: https://github.com/xbill9/gemma4-dev/tree/main/gpu-vllm-t4-2b-w4a16
- Script de repack `embed_int4.py`: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16/blob/main/repack/embed_int4.py
- Evidencia de mediciones: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16/tree/main/evidence
- Modelo QAT sin empaquetar de referencia: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Modelo bf16 de referencia: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
