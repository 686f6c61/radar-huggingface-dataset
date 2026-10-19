# spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-GGUF

## Resumen

Esta ficha describe la versión cuantizada en GGUF del modelo `spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara`, una variante «decensurada» del modelo multimodal de NVIDIA `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`. El modelo original es un híbrido Mamba-Transformer con mezcla de expertos latente (latent-MoE) de 120.668.707.840 parámetros totales y 12B activos por token, equipado con una torre de visión RADIO y una cabeza de predicción multi-token (MTP). La modificación consiste en una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada con Heretic v2.0.0.dev0, que reduce drásticamente la tasa de rechazos del modelo original.

El repositorio lo publica `spiritfather`, que actúa como cuantizador y responsable del checkpoint modificado; la autoría del modelo base corresponde a NVIDIA y la del método de ablación a p-e-w y a los contribuidores de Heretic. La relevancia práctica de este lanzamiento es doble: por un lado, permite ejecutar un modelo de 120B totales y 12B activos en hardware de gama alta mediante llama.cpp con cuantizaciones de 71,8 GB a 128,5 GB; por otro, incluye la cabeza MTP como sidecar, lo que aporta una aceleración de decodificación de aproximadamente 1,16x en la prueba con Q8_0 del autor.

El pipeline declarado es `image-text-to-text`, de modo que el modelo conserva capacidad multimodal siempre que se cargue el proyector `mmproj-...-Q8_0.gguf` junto con el cuant elegido. La licencia es openmdw-1.1. No se han publicado en la información disponible datos de longitud de contexto, idiomas soportados ni resultados de benchmarks generales (MMLU, HumanEval, GSM8K); las únicas métricas publicadas son perplejidad y divergencia KL de las cuantizaciones, junto con la evaluación de rechazos de Heretic.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba-Transformer con latent-MoE (mezcla de expertos latente), torre de visión RADIO y cabeza MTP (multi-token prediction) |
| Parámetros totales | 120.668.707.840 (≈120,7 B) |
| Parámetros activos | 12 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (estáticas); el autor publica además una familia de cuantizaciones con imatrix en el repositorio `...-i1-GGUF` |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (llama.cpp); los cuants de más de 45 GB se dividen en shards con `llama-gguf-split`. Proyector de visión en GGUF aparte (`mmproj-...-Q8_0.gguf`) |
| Autor del repositorio | spiritfather (cuantización) |
| Modelo base | spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara (a su vez derivado de nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16) |
| Pipeline | image-text-to-text |
| Librería | llama.cpp (requiere build master; versiones antiguas pueden no cargar el proyector de visión ni la cabeza MTP) |
| Tamaño del repositorio | 753,8 GB |
| Descargas / likes | 83 / 1 |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un híbrido Mamba-Transformer con mezcla de expertos latente: 120,7 B de parámetros totales de los que solo 12 B se activan por token, lo que sitúa el coste de cómputo por paso en el rango de un modelo denso de ~12B pese al tamaño del checkpoint. A esto se añade una torre de visión RADIO, que habilita la entrada de imágenes (pipeline `image-text-to-text`), y una cabeza de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. Esta cabeza se distribuye como ficheros `mtp-*.gguf` independientes y se activa con `--spec-type draft-mtp` en llama.cpp.

Sobre el entrenamiento del modelo original no se aporta en la información disponible ningún dato de número de tokens, composición del corpus ni etapas de RLHF o DPO; no se detallan tampoco innovaciones de atención más allá de la combinación Mamba-Transformer y el esquema MoE latente. La modificación respecto al original es una ablación de rango arbitrario (ARA) ejecutada con Heretic v2.0.0.dev0 sobre las capas 41 a 54, con estos hiperparámetros: `start_layer_index` 41, `end_layer_index` 54, `preserve_good_behavior_weight` 0,7358, `steer_bad_behavior_weight` 0,1777, `overcorrect_relative_weight` 0,9892 y `neighbor_count` 2. El resultado declarado es una caída de rechazos de 100/100 a 6/100 en el conjunto de evaluación del autor, con una divergencia KL de 0,1092 respecto al original.

Las cuantizaciones se generaron y evaluaron con llama.cpp: perplejidad y divergencia KL sobre el test de wikitext-2 (100 fragmentos de 512 tokens), tomando como referencia las logits del GGUF BF16 del propio autor.

## Capacidades

- Generación de texto conversacional y escritura creativa; el autor etiqueta el modelo con `creative-writing` y lo evalúa en CaliperBench, un benchmark centrado en calidad de prosa, roleplay y disposición a responder.
- Entrada de imágenes (image-text-to-text) mediante la torre RADIO, siempre que se cargue el proyector `mmproj-NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-Q8_0.gguf` junto al cuant.
- Decodificación especulativa con la cabeza MTP incluida (`--spec-type draft-mtp`), con una aceleración medida de ~1,16x sobre la prueba en Q8_0.
- Modo texto puro sin el proyector de visión, cargando únicamente el cuant elegido.
- Comportamiento «abliterated»/«uncensored»: reducción de rechazos de 100/100 a 6/100 según la regla de palabras clave de Heretic sobre 100 prompts de `mlabonne/harmful_behaviors`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio) y uso conversacional a través de `llama-server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible (el campo de idiomas del repositorio figura como no disponible).

## Casos de uso

- Escritura creativa asistida: el modelo está etiquetado y evaluado específicamente para calidad de prosa (CaliperBench), por lo que encaja en generación de narrativa, diálogos y reescritura estilística con un modelo de 12B activos que mantiene el coste de inferencia acotado.
- Roleplay y construcción de personajes: la evaluación del autor mide explícitamente «roleplay» y «willingness»; la reducción de rechazos a 6/100 permite mantener personajes con guiones y registros que el modelo original bloquearía.
- Análisis de documentos con imágenes: cargando el proyector `mmproj`, se pueden procesar capturas, escaneos o gráficos junto a texto en un mismo prompt a través de `llama-server`.
- Generación de descripciones y texto alternativo: la combinación de torre de visión y capacidad de escritura permite producir descripciones largas y matizadas de imágenes para catálogos, accesibilidad o archivo documental.
- Investigación sobre alineación y red-teaming: al ser una versión ablacionada con métricas publicadas de rechazo y KL, sirve como objeto de estudio para medir el coste de utilidad que impone el alignment, comparando contra el modelo original de NVIDIA.
- Despliegue on-premise en clúster pequeño: con Q4_0 (71,8 GB) o Q4_K_M (86,1 GB) el modelo cabe en 4 GPU de 24 GB, lo que permite servir un 120B-A12B en infraestructura propia sin depender de API externa.
- Evaluación de cuantizaciones y decodificación especulativa: el repositorio publica PPL, KLD y acuerdo de top-token por cuant, además de la cabeza MTP, lo que lo convierte en un banco de pruebas para medir degradación por cuantización en arquitecturas híbridas Mamba-Transformer.
- Prototipado de asistentes conversacionales con contexto multimodal en local mediante llama.cpp, aceptando la penalización de rendimiento de la cuantización Q4 frente a Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las de cuantización y la evaluación de rechazos de Heretic.

| Cuant | Tamaño | PPL (wikitext-2) | KLD vs BF16 | Coincidencia de top token | Notas |
|---|---:|---:|---:|---:|---|
| BF16 | 241,5 GB | 4,8665 | 0 (referencia) | 100 % | precisión completa, referencia de la columna KLD |
| Q8_0 | 128,5 GB | 4,8688 | 0,0021 | 98,3 % | rápido, mejor calidad |
| Q6_K | 112,9 GB | 4,8804 | 0,0054 | 97,0 % | muy buena calidad |
| Q5_K_M | 95,7 GB | 4,9244 | 0,0128 | 95,4 % | — |
| Q4_K_M | 86,1 GB | 4,9515 | 0,0340 | 92,6 % | rápido, recomendado por el autor |
| Q4_0 | 71,8 GB | 4,9556 | 0,0336 | 93,4 % | mezcla ggml-org (ver receta) |

PPL y KLD calculadas sobre el test de wikitext-2, 100 fragmentos de 512 tokens, comparando contra las logits del GGUF BF16 del autor.

| Métrica (evaluación Heretic) | Este modelo | Modelo original NVIDIA |
|---|---:|---:|
| Rechazos | 6/100 | 100/100 |
| Divergencia KL | 0,1092 | 0 (por definición) |

Los rechazos se calculan con la regla de palabras clave de Heretic sobre 100 prompts reservados de `mlabonne/harmful_behaviors`; la KL es la divergencia de primer token frente al modelo original sobre 100 prompts de `mlabonne/harmless_alpaca`, con el modo thinking desactivado. El propio autor advierte que no es una evaluación de seguridad.

| Métrica de decodificación | Valor |
|---|---|
| Aceleración con cabeza MTP (`--spec-type draft-mtp`) | ~1,16x (prueba propia sobre Q8_0) |

## Requisitos de hardware

- VRAM estimada para los pesos (sin caché KV ni overhead del runtime): BF16 241,5 GB; Q8_0 128,5 GB; Q6_K 112,9 GB; Q5_K_M 95,7 GB; Q4_K_M 86,1 GB; Q4_0 71,8 GB. Hay que sumar la caché KV, el proyector de visión (~Q8_0, tamaño no indicado) y los ficheros `mtp-*.gguf` si se usa decodificación especulativa.
- La longitud de contexto no está documentada, por lo que no es posible calcular el tamaño de la caché KV; conviene reservar al menos un 15-20 % de VRAM adicional sobre el tamaño de los pesos.
- BF16 y Q8_0: 4x H100 80 GB o 8x A100 40 GB para BF16; 2x H100 80 GB para Q8_0.
- Q6_K y Q5_K_M: 2x H100 80 GB, o 3-4x A100 40 GB.
- Q4_K_M (86,1 GB): 2x H100 80 GB, 2x A100 80 GB, o 6x RTX 4090 24 GB con margen.
- Q4_0 (71,8 GB): 4x RTX 4090 24 GB (96 GB agregados) es la opción consumer más realista; también 2x A100 40 GB con muy poco margen para caché KV.
- No cabe en una única GPU consumer (RTX 4090 24 GB, RTX 3090 24 GB) en ninguna de las cuantizaciones publicadas; el mínimo práctico es un nodo de 4 GPU.
- Despliegue: llama.cpp (master) es la vía soportada, con `llama-server` para exponer API HTTP y `--mmproj` para multimodal. Los cuants de más de 45 GB se cargan apuntando al primer shard o con `-hf`. No se documentan en la información disponible integraciones con vLLM, TGI u Ollama.
- Latencia y throughput absolutos: no disponibles. El único dato de rendimiento es la mejora relativa de ~1,16x con la cabeza MTP en Q8_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (GGUF, heretic-ara) | 120,7 B | 12 B | no disponible | openmdw-1.1 | GGUF (BF16 a Q4_0), 71,8-241,5 GB | HuggingFace, 83 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (original) | 120,7 B | 12 B | no disponible | no disponible en la información | BF16 (safetensors, presumiblemente) | HuggingFace, oficial de NVIDIA |
| spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara (checkpoint fuente) | 120,7 B | 12 B | no disponible | openmdw-1.1 | safetensors/BF16 | HuggingFace |
| spiritfather/...-heretic-ara-i1-GGUF (imatrix) | 120,7 B | 12 B | no disponible | openmdw-1.1 | GGUF con imatrix | HuggingFace |

Las tres alternativas comparten exactamente la misma arquitectura y el mismo recuento de parámetros; las diferencias reales están en el alignment (el original rechaza 100/100 frente a 6/100 de esta variante), en la cuantización (BF16 de referencia frente a Q8_0-Q4_0) y en el método de calibración (cuants estáticas de este repositorio frente a las imatrix del repositorio i1). No se dispone de información sobre otros modelos comparables de la misma categoría (híbridos Mamba-Transformer multimodales con MoE latente): no disponible.

## Limitaciones y advertencias

- Modelo deliberadamente decensurado: la ablación ARA reduce los rechazos de 100/100 a 6/100. No debe desplegarse en aplicaciones de cara al público sin una capa propia de moderación, filtrado de entrada/salida y revisión de política de contenido.
- La evaluación de Heretic se basa en una regla de palabras clave sobre 100 prompts y el propio autor indica que no constituye una evaluación de seguridad; no cuantifica qué contenidos nocivos puede llegar a producir el modelo.
- Divergencia KL de 0,1092 respecto al original sobre `mlabonne/harmless_alpaca`: la ablación introduce un cambio de distribución medible que puede afectar a la calidad en tareas distintas de las evaluadas.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de razonamiento; no hay datos que permitan acotar la tasa de alucinación en producción.
- Degradación por cuantización: en Q4_0 solo el 93,4 % de los tokens más probables coinciden con BF16, y la PPL sube de 4,8665 a 4,9556; en Q4_K_M la coincidencia es del 92,6 %. Para tareas sensibles a la fidelidad conviene Q6_K o superior.
- Idiomas soportados no documentados: no es posible afirmar cobertura multilingüe ni calidad en castellano sin evaluación propia.
- Longitud de contexto no documentada: impide dimensionar la caché KV y planificar cargas de contexto largo.
- Requiere llama.cpp en versión master: builds antiguos pueden no cargar el proyector de visión ni la cabeza MTP, lo que rompe el uso multimodal y la decodificación especulativa.
- El proyector de visión se distribuye aparte (`mmproj-...-Q8_0.gguf`); sin él el modelo funciona solo como texto. Además, el repositorio pesa 753,8 GB, lo que exige planificación de almacenamiento y ancho de banda de descarga.
- Los cuants de más de 45 GB están fragmentados en shards: hay que apuntar llama.cpp al primer shard o usar `-hf`, y gestionar correctamente el conjunto de ficheros.
- Licencia openmdw-1.1: es una licencia «other» con términos propios; debe revisarse el enlace oficial antes de un uso comercial. La información disponible no detalla restricciones adicionales.
- El modelo base es de NVIDIA, pero esta variante no está publicada ni respaldada por NVIDIA; la responsabilidad del comportamiento del checkpoint modificado recae en quien lo despliega.
- Uso de la cabeza MTP: la mejora de 1,16x se midió en la prueba del autor sobre Q8_0; no hay garantía de que se mantenga en otras cuantizaciones, contextos o GPUs.

## Enlaces

- Repositorio GGUF: https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-GGUF
- Checkpoint fuente (heretic-ara): https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Cuantizaciones con imatrix (i1): https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-i1-GGUF
- Proyector de visión (mmproj Q8_0): https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-GGUF/resolve/main/mmproj-NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-Q8_0.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Heretic (proyecto): https://heretic-project.org
- Heretic (repositorio): https://github.com/p-e-w/heretic
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- CaliperBench: https://caliperbench.com
- Discord del autor: https://discord.gg/rhE9zdKyE4
