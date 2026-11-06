# tvall43/Qwen3.6-35B-A3B-heretic-QSA-GGUF

## Resumen
Qwen3.6-35B-A3B-heretic-QSA-GGUF es una reconstrucción en formato GGUF publicada por el usuario tvall43 sobre el modelo base llmfan46/Qwen3.6-35B-A3B-uncensored-heretic, una variante "uncensored" de la familia Qwen3.6 con arquitectura MoE (qwen35moe) de 34.673.721.728 parámetros totales. El autor del GGUF no entrena un modelo nuevo: parte del fichero Qwen3.6-35B-A3B-uncensored-heretic-No-MTP-custom.gguf (BPW 4,75) y le injerta ("grafting") 50 tensores F32 de indexación QSA (Qwen Sparse Attention) más metadatos asociados, sin modificar los 733 tensores originales, que se conservan byte a byte.

La relevancia de esta publicación es fundamentalmente técnica y experimental: demuestra un procedimiento de inyección de tensores en un GGUF ya cuantizado preservando offsets y payloads, e introduce los metadatos necesarios para una atención de bloques dispersa (compress_ratios = 4 en las capas 3, 7, 11, 15, 19, 23, 27, 31, 35 y 39; indexer con 4 cabezas, key_length 128 y top_k 2048). El resultado es un fichero estructuralmente válido pero todavía no ejecutable con atención dispersa en llama.cpp estándar, que carga el modelo con atención densa e ignora los tensores del indexer.

Se trata, por tanto, de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card completa sobre entrenamiento, licencia o idiomas, y cuyo interés real depende de que se complete el port de la ruta qwen35moe en el runtime de referencia. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe (transformer MoE con atención QSA inyectada) |
| Parametros totales | 34.673.721.728 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BPW 4,75 (fichero base); tensores indexer en F32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero único de 22.180.352.608 bytes) |
| SHA-256 del fichero | c3dbe95dc393a709d176e49e83f6071053cfeefdc4bd59342ce461b203d016ff |
| Tensores originales | 733 (preservados byte a byte) |
| Tensores añadidos | 50 F32 (5 por capa de atención completa) |
| Metadatos QSA | indexer.head_count = 4; indexer.key_length = 128; indexer.top_k = 2048 |
| compress_ratios | 4 en capas [3, 7, 11, 15, 19, 23, 27, 31, 35, 39]; 0 en el resto |
| Masa de profesor capturada | 0,9464184045791626 |
| Pérdida final del indexer | 0,38196276128292084 |
| Tamaño del repo | 22,2 GB |

## Arquitectura y entrenamiento
El modelo base pertenece a la familia Qwen3.6 con arquitectura qwen35moe, un transformer con mezcla de expertos (MoE) del que se conoce el total de parámetros (34,67 mil millones) pero no el número de expertos, el número de parámetros activos por token ni la longitud de contexto nativa, datos ausentes en la información disponible. Sobre ese base, el autor del GGUF no realiza un entrenamiento completo: aplica una técnica de grafting que consiste en añadir 50 tensores F32 de indexación (q_proj, k_proj, q_norm, k_norm.pre_weight y k_norm por cada una de las 10 capas de atención completa) junto con metadatos que describen una atención de bloques dispersa con ratio de compresión 4.

Los valores de validación indican que los indexers se destilaron de un profesor: la masa de profesor capturada final es 0,9464 y la pérdida del indexer 0,3819. La validación reportada incluye igualdad byte a byte muestreada de los tensores base contra el fichero fuente, igualdad de payload de los nuevos tensores contra mm1_16k/qsa_indexers.pt (incluida la conversión RMSNorm centrada en cero con +1), tipos F32 en los 50 tensores, offsets alineados a 32 bytes sin solapamiento y reparseo con el lector gguf-py de referencia. No se documentan datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones adicionales como decodificación especulativa; el sufijo "No-MTP" del fichero base sugiere la ausencia de multi-token prediction, pero no se detalla.

## Capacidades
- Generación de texto conversacional: el tag conversational y la pipeline no disponible limitan la descripción, pero el modelo base es un LLM de propósito general.
- Razonamiento y conocimiento general: heredado del base Qwen3.6-35B-A3B, sin benchmarks publicados en esta ficha.
- Generación de código y matemáticas: capacidad esperable en la familia Qwen3.6, no verificada con datos en la información disponible.
- Tool calling / function calling: no disponible en la documentación proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Atención dispersa QSA: capacidad teórica del artefacto, no operativa en llama.cpp estándar; requiere el runtime de referencia con soporte qwen35moe.
- Modo "uncensored": el modelo base está alineado con menos restricciones de rechazo, según el nombre del repositorio de origen; no se detalla el método de desalineación.

## Casos de uso
- Investigación sobre atención dispersa: el artefacto permite estudiar la inyección de indexers QSA en GGUF cuantizados y comparar atención densa frente a block-sparse una vez portado el soporte qwen35moe al runtime.
- Desarrollo de runtimes de inferencia: sirve como caso de prueba para implementar la rama de atención dispersa en llama.cpp o en el fork kuraneko1/Qwen3.8-27B-QSA-llama.cpp, validando offsets, metadatos y carga de tensores F32.
- Validación de pipelines de grafting: el procedimiento byte a byte y el reparseo con gguf-py son reproducibles para auditar herramientas de manipulación de GGUF en CI.
- Experimentación con modelos "uncensored": para equipos que investigan el comportamiento de modelos con alineación reducida en tareas de red teaming controlado, sujeto a la licencia del base (no disponible).
- Evaluación de cuantización BPW 4,75: permite medir la degradación de un MoE de ~35B en 22,2 GB frente al modelo en precisión completa, si se dispone del base original.
- Despliegue local de un MoE de ~35B: una vez funcional, el tamaño de 22,2 GB encaja en estaciones de trabajo con 24 GB de VRAM usando offload parcial, aunque el rendimiento real no está medido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el fichero GGUF ocupa 22,2 GB; con overhead de contexto y caché KV se recomienda al menos 24 GB de VRAM para carga completa, o 16 GB con offload parcial a RAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para carga ajustada; A100 40/80 GB y H100 para mayor margen de contexto y throughput.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con cuantización BPW 4,75; en GPUs de 12-16 GB requeriría offload de capas a RAM del sistema.
- Opciones de despliegue: llama.cpp estándar carga el modelo con atención densa e ignora los tensores del indexer; para atención QSA se necesita el runtime de referencia kuraneko1/Qwen3.8-27B-QSA-llama.cpp con el port de qwen35moe completado. vLLM, TGI y Ollama no están documentados para este artefacto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| tvall43/Qwen3.6-35B-A3B-heretic-QSA-GGUF | 34,67 B (MoE) | no disponible | GGUF BPW 4,75 | no disponible | Experimental, QSA no operativa en llama.cpp estándar |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | 34,67 B (MoE) | no disponible | safetensors/GGUF | no disponible | Modelo base del que deriva este artefacto |
| kuraneko1/Qwen3.8-27B-QSA-llama.cpp | 27 B (dense qwen35) | no disponible | runtime llama.cpp | no disponible | Runtime de referencia con QSA solo para arquitectura dense |

La comparación con alternativas de la misma categoría (otros MoE de ~35B en GGUF) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- El modelo no es ejecutable con atención QSA en llama.cpp estándar: los tensores del indexer se cargan pero se ignoran, por lo que el comportamiento es el de atención densa.
- La ruta qwen35moe del runtime de referencia no está portada; hasta que se complete, no se puede validar el beneficio de la atención dispersa.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución; hay que remitirse a la licencia del modelo base llmfan46/Qwen3.6-35B-A3B-uncensored-heretic, también ausente en la información disponible.
- Modelo "uncensored": mayor riesgo de generar contenido dañino o no alineado; requiere filtros externos en cualquier despliegue.
- Riesgo de alucinación: no evaluado; sin benchmarks publicados no hay evidencia de fiabilidad.
- Idiomas y contexto no documentados: no se puede garantizar soporte multilingüe ni una ventana de contexto concreta.
- Repositorio con 0 descargas y 0 likes: sin validación por la comunidad, sin issues ni reportes de funcionamiento real.
- El artefacto preserva el base byte a byte, pero cualquier modificación posterior del fichero invalida el SHA-256 publicado y la validación reportada.
- La calidad de los indexers destilados (pérdida 0,3819, masa capturada 0,9464) no se traduce necesariamente en mejor calidad de generación; no hay evaluación end-to-end.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/tvall43/Qwen3.6-35B-A3B-heretic-QSA-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Tensores indexer: https://huggingface.co/tvall43/Qwen3.6-35B-A3B-heretic-QSA-indexers
- Runtime de referencia QSA: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
