# wirkung/origami1.1_27b

## Resumen

origami1.1_27b es una release incremental (v1.1) del modelo Origami-27B, desarrollada por el usuario wirkung. Se trata de una reempaquetación de cuantización de alta fidelidad del checkpoint Qwen/Qwen3.8-27B, sin pasos de reentrenamiento (0 retraining steps). El modelo conserva los 27.800 millones de parámetros del modelo base y se distribuye en un formato propietario de pesos denominado `.o3f`, junto con un runtime propio (`wirkung`) que permite inferencia en CPU con memoria constante.

La propuesta diferencial del modelo no es tanto la calidad del checkpoint subyacente como el mecanismo de inferencia: el runtime mantiene un estado de memoria constante (sidecar de 10,29 MB, con un slot de estado en tiempo de ejecución de 61,00 MiB) que no crece con la longitud del contexto. Según la model card, el crecimiento de la asignación KV es de 0,0 B/token desde 1K hasta 128K tokens, lo que lo hace apto para despliegues en CPU sin VRAM dedicada.

Respecto a la versión v1.0, la v1.1 corrige la procedencia del checkpoint base (de Qwen3.5-27B a Qwen3.8-27B) y mejora sustancialmente la fidelidad: el ΔNLL frente al modelo base pasa de +0,4268 a +0,01147, y la concordancia top-1 sube del 76,17% al 93,74%. El bundle crece de 7,44 GB a 11,728 GB. La licencia es propietaria (`wirkung-model-and-runtime-1.0`), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM/atención (GDN/attention), transformer con MTP nativo; 64 capas |
| Parametros totales | 27.800.000.000 (27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128K tokens verificados en modo constante |
| Tipos de cuantizacion | formato propietario `.o3f` (400 operadores híbridos GDN/attention); no se detallan otros formatos |
| Idiomas soportados | en, de |
| Licencia | wirkung-model-and-runtime-1.0 (propietaria, `other`) |
| Formato de pesos | `.o3f` (capas, vocab, MTP) + `exact_core.safetensors` + sidecar `o1_crystal_v2_27b.bin` |

## Arquitectura y entrenamiento

El modelo deriva directamente de Qwen/Qwen3.8-27B, un checkpoint de 64 capas con MTP (multi-token prediction) nativo. Origami no reentrena: la model card indica explícitamente `0` retraining steps. Lo que hace wirkung es recomprimir y reempaquetar los pesos en su formato `.o3f`, separando las 400 matrices de los operadores híbridos GDN/atención en ficheros por capa (`layer-000` a `layer-063`), más `embed_tokens.o3f`, `lm_head.o3f` y `vocab_utf8.bin`. El bloque `mtp/` contiene 8 operadores `.o3f` y un `mtp_exact.safetensors`.

La innovación técnica central es el "constant-memory state": un sidecar de 10,29 MB (`assets/o1_crystal_v2_27b.bin`) que se materializa en un slot de estado fijo de 61,00 MiB durante la inferencia. Según las métricas reportadas, esto permite que la asignación KV crezca 0,0 B/token entre 1K y 128K tokens (ΔRSS = 0,0 MB), a costa de una pérdida de fidelidad medida como ΔNLL constante de +0,01827 ± 0,00962 frente al modo exacto (KL = 0,02009, 96,68% de concordancia top-1). El runtime también implementa decodificación especulativa mediante MTP, con una media de aceptación de 3,706 tokens. No se documentan datos de entrenamiento propios (número de tokens, composición del dataset, RLHF/DPO), ya que el modelo no se entrena.

## Capacidades

- Generación de texto conversacional y continuaciones de texto, heredadas del checkpoint Qwen3.8-27B.
- Razonamiento multi-paso y predicción multi-token (MTP) con decodificación especulativa integrada en el runtime.
- Inferencia en CPU sin VRAM dedicada, con estado de memoria constante independiente de la longitud del contexto.
- Recuperación de información en contexto largo (passkey recall) hasta T=2048 en modo constante (2/3 aciertos) y 3/3 en modo exacto.
- Soporte multilingüe limitado a inglés y alemán según los metadatos de la model card.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en servidores sin GPU: el runtime `wirkung` permite ejecutar un modelo de 27,8B en CPU con un pico de RSS de aproximadamente 14,7 GB, adecuado para entornos virtualizados o bare-metal sin aceleradores.
- Procesamiento de documentos largos en CPU: gracias al estado de memoria constante verificado hasta 128K tokens, se pueden procesar contratos, informes o expedientes extensos sin que el consumo de memoria crezca con la longitud de la entrada.
- Asistentes conversacionales en inglés o alemán: el modelo hereda las capacidades conversacionales de Qwen3.8-27B y puede mantener diálogos multi-turno, aunque el soporte de idiomas se limita a en/de.
- Inferencia en el borde o en dispositivos con restricciones de memoria: el slot de estado fijo de 61,00 MiB y la asignación KV de 0,0 B/token facilitan despliegues con presupuesto de memoria acotado y predecible.
- Evaluación e investigación de técnicas de compresión: el bundle incluye métricas reproducibles de ΔNLL, KL y concordancia top-1 frente al modelo base, útil para estudiar el compromiso fidelidad/memoria en cuantización híbrida.
- Prototipado de pipelines de decodificación especulativa: el bloque MTP y el runtime permiten medir tasas de aceptación (mean_accept = 3,706) y throughput especulativo (6,974 tok/s en EPYC de 16 núcleos) en entornos CPU.

## Benchmarks y rendimiento

| Métrica | v1.0 (Origami-27B) | v1.1 (origami1.1_27b) |
|---|---|---|
| ΔNLL extremo a extremo vs Qwen/Qwen3.8-27B | +0,4268 / +0,5881 | +0,01147 ± 0,01518 (511 tok) |
| Concordancia top-1 vs base | 76,17% | 93,74% (98,63% solo `lm_head`) |
| ΔNLL estado constante vs exacto (1.024 tok) | +0,02462 (KL = 0,02094) | +0,01827 ± 0,00962 (KL = 0,02009; 96,68% top-1) |
| Passkey recall constante (T=640 y T=2048) | 2/3 | 2/3 (3/3 en modo exacto) |
| Crecimiento de asignación KV (T=1K..128K) | constante (34,24 MB) | 0,0 B/tok (ΔRSS = 0,0 MB; 61,00 MiB fijos) |
| Decode en EPYC de 16 núcleos (AVX2) | 4,541 tok/s | hasta 4,737 tok/s (baseline 4,438 tok/s) |
| Prefill | no disponible | 15,102 tok/s |
| Decode especulativo MTP | no disponible | 6,974 tok/s (mean_accept = 3,706) |
| Pico de RSS | no disponible | ~14,7 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU sin VRAM dedicada.
- Memoria RAM: pico de RSS de aproximadamente 14,7 GB en las pruebas reportadas con EPYC de 16 núcleos; el bundle ocupa 11,728 GB en disco.
- GPU recomendadas: no se documentan; el runtime `wirkung` está orientado a CPU con instrucciones AVX2.
- Cabe en hardware de consumo: sí, siempre que se disponga de al menos ~15 GB de RAM libre; no requiere GPU.
- Opciones de despliegue: runtime propietario `wirkung` (instalación vía `pip install -U wirkung`, comandos `wkng pull` y `wkng run`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: decode de 4,737 tok/s, prefill de 15,102 tok/s y decode especulativo de 6,974 tok/s en un EPYC-Rome de 16 núcleos; no se reportan cifras para otras CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| origami1.1_27b | 27,8B | 128K (estado constante) | `.o3f` + safetensors | Propietaria (wirkung) | Runtime `wirkung`, CPU |
| Qwen/Qwen3.8-27B (base) | 27,8B | no disponible en la información | safetensors | no disponible en la información | Frameworks estándar (no confirmado) |
| wirkung/Origami-27B (v1.0) | 27,8B | no disponible en la información | `.o3f` | Propietaria (wirkung) | Runtime `wirkung`, CPU |

No se dispone de datos de benchmarks estándar ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Licencia propietaria `wirkung-model-and-runtime-1.0`: es necesario revisar los términos del fichero LICENSE antes de cualquier uso comercial; no es una licencia open source estándar.
- El modelo no se reentrena: cualquier sesgo, alucinación o limitación del checkpoint Qwen3.8-27B se hereda sin corrección.
- El modo de estado constante introduce una pérdida de fidelidad medible (ΔNLL +0,01827, KL = 0,02009) y reduce la concordancia top-1 al 96,68% frente al modo exacto.
- El passkey recall en modo constante es de 2/3 tanto a T=640 como a T=2048, lo que indica que la recuperación de información en contexto largo no es perfecta.
- Idiomas soportados limitados a inglés y alemán según los metadatos; no se garantiza un rendimiento adecuado en castellano.
- Dependencia de un runtime propietario (`wirkung`) y de un formato de pesos no estándar (`.o3f`), lo que dificulta la portabilidad a otros ecosistemas de inferencia.
- El throughput en CPU es bajo (4,737 tok/s de decode), insuficiente para aplicaciones interactivas de alta concurrencia.
- No se documentan mecanismos de tool calling, agentes ni modo thinking; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirkung/origami1.1_27b
- Release anterior (v1.0): https://huggingface.co/wirkung/Origami-27B
- Checkpoint base: https://huggingface.co/Qwen/Qwen3.8-27B
