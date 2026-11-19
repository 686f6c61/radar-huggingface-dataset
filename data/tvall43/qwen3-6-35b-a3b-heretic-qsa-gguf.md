# tvall43/Qwen3.6-35B-A3B-heretic-QSA-GGUF

## Resumen

Qwen3.6-35B-A3B-heretic-QSA-GGUF es una compilación cuantizada en formato GGUF de un modelo derivado de la familia Qwen3.6, publicada por el usuario tvall43. Parte del checkpoint base `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF`, una variante "uncensored" y "heretic" (con los mecanismos de rechazo atenuados) del modelo Qwen3.6-35B-A3B. El resultado es un modelo de arquitectura `qwen35moe` (mezcla de expertos) con 35.518.362.496 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según la nomenclatura A3B.

La contribución técnica principal de esta publicación es el injerto de un mecanismo QSA (Qwen Sparse Attention) con indexadores de atención dispersa sobre el backbone original, preservado byte a byte. Se publican cuatro ficheros GGUF que combinan distintas configuraciones de indexador (multimodal de 64k, solo texto de 64k o multimodal de 16k) y la presencia o ausencia de una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. El fichero recomendado incorpora tanto el indexador `mm_64k` como la cabeza MTP.

El modelo es relevante para desarrolladores que necesitan ejecutar localmente un MoE de 35B con contexto largo (hasta 125.536 tokens configurados en llama.cpp) en hardware de consumo o servidor, con soporte de visión, decodificación especulativa y un sesgo hacia contenido sin filtros. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque las implicaciones de la naturaleza "uncensored" deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (transformer MoE con atención dispersa QSA e indexadores) |
| Parametros totales | 35.518.362.496 (35,5B) |
| Parametros activos | ~3B (nomenclatura A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | 125.536 tokens configurados en llama.cpp; indexadores de 64k (`mm_64k`) o 16k (`mm1_16k`) |
| Tipos de cuantizacion | GGUF BPW4.75 (base) y BPW5 (donante MTP); no se detallan otros niveles |
| Idiomas soportados | `en` (ingles) segun la model card; el resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con arquitectura `qwen35moe`. El backbone original se conserva intacto: los 733 tensores base mantienen su payload y offset exactos. Sobre esa base se añaden 50 tensores F32 de indexador (5 por capa de atención completa): `blk.{N}.indexer.q_proj.weight`, `k_proj.weight`, `q_norm.weight`, `k_norm.pre_weight` y `k_norm.weight`. Los metadatos QSA incluyen `head_count = 4`, `key_length = 128`, `top_k = 2048` y ratios de compresión de 4 en las capas [3, 7, 11, 15, 19, 23, 27, 31, 35, 39], con 0 en el resto. Esta configuración implementa una atención dispersa con pooling de claves que reduce el coste computacional en contextos largos.

El proceso de entrenamiento de los indexadores se documenta por etapas: 300 pasos de texto a 16k, 300 pasos multimodales a 16k, 200 pasos de texto OpenCode a 64k y 100 pasos multimodales a 64k para la variante `mm_64k`. La masa de profesor capturada final es de 0,8914 (train, K=2048/64k) y la pérdida del indexador de 0,3348. Para la variante `text_64k`, la masa capturada es de 0,9464 y la pérdida de 0,3820. La cabeza MTP se injerta desde el donante BPW5 como capa 40, con 20 tensores (bloque `blk.40` completo más las cuatro cabezas `nextn.*`), y se usa exclusivamente para decodificación especulativa, no en la ruta de atención principal. No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de propósito general en inglés.
- Razonamiento de múltiples pasos y cadenas de pensamiento (heredado de la familia Qwen3.6; no verificado en la información disponible).
- Procesamiento multimodal (visión) en las variantes `mm_64k` y `mm1_16k`; la variante `text_64k` es solo texto.
- Contexto largo efectivo gracias a los indexadores QSA de 64k y a la configuración de 125.536 tokens en llama.cpp.
- Decodificación especulativa mediante cabeza MTP (fichero recomendado), con `--spec-type draft-mtp` y `--spec-draft-n-max 2`.
- Ajuste del presupuesto de atención dispersa mediante `LLAMA_QSA_TOP_K` (2048 por defecto, 4096 recomendado para documentos largos).
- Comportamiento "uncensored": menor tendencia a rechazar peticiones, lo que amplía el rango de respuestas pero incrementa el riesgo de contenido inapropiado.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno extensas gracias a la ventana de 125.536 tokens y a los indexadores QSA, que reducen el coste de atención en diálogos largos sin degradar la coherencia.
- Análisis de documentos extensos: informes, contratos o artículos de decenas de miles de tokens pueden procesarse en una sola pasada; para ello se recomienda elevar `LLAMA_QSA_TOP_K` por encima del valor por defecto (2048) y usar el fichero `mm_64k`.
- Procesamiento de imágenes y texto combinados: la variante multimodal `mm_64k` permite describir imágenes, extraer información de capturas o responder preguntas sobre diagramas dentro de un flujo conversacional.
- Generación de código en pipelines locales: el modelo base Qwen3.6 tiene buen desempeño en código; esta variante puede integrarse en entornos de desarrollo con llama.cpp y usarse para autocompletado o revisión, aunque no se han publicado benchmarks específicos de esta compilación.
- Investigación sobre alineación y filtros de seguridad: al ser una variante "uncensored" y "heretic", resulta útil para estudiar el comportamiento de modelos sin rechazo y comparar respuestas frente a versiones alineadas.
- Despliegue en hardware de consumo con cuantización GGUF: los ficheros de ~22-23 GB caben en GPUs con 24 GB de VRAM (RTX 3090/4090) usando offloading parcial o en configuraciones multi-GPU, lo que permite ejecutar un MoE de 35B en estaciones de trabajo.
- Servicio de inferencia con decodificación especulativa: el fichero con MTP reduce la latencia de generación de tokens al usar un borrador autospeculativo, adecuado para aplicaciones interactivas con requisitos de tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros GGUF pesan entre 22,18 GB (`text_64k` y `mm_64k` sin MTP) y 23,08 GB (`mm_64k` con MTP); se necesita al menos esa cantidad de VRAM para carga completa en GPU, más overhead de contexto KV.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para carga completa ajustada, o RTX 3090 (24 GB) con offloading parcial.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con 24 GB, aunque el contexto largo puede requerir reducir `--ctx-size` o usar offloading a CPU.
- Opciones de despliegue: llama.cpp con la rama `qwen35moe-qsa` del fork `tvall43/llama.cpp` (obligatorio para el soporte QSA); compilación con `-DGGML_VULKAN=ON` documentada. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La cabeza MTP ofrece "una pequeña ganancia en coste de procesamiento de prompt a cambio de una gran ganancia en generación de tokens", según la model card, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-heretic-QSA-GGUF (este) | 35,5B totales / ~3B activos | 125.536 (config. llama.cpp) | Apache 2.0 | GGUF | MoE con QSA, visión y MTP opcional |
| Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF (base) | 35,5B totales | no disponible | Apache 2.0 | GGUF | Modelo base sin injerto QSA |
| Qwen3.6-35B-A3B (original, si disponible) | 35,5B totales | no disponible | no disponible | safetensors/GGUF | Versión alineada de referencia |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una variante "uncensored" y "heretic": presenta menor tendencia a rechazar peticiones, lo que puede producir contenido inapropiado, ofensivo o inseguro; no es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta compilación.
- Idiomas: la model card solo declara inglés (`en`); el soporte multilingüe no está confirmado y podría ser limitado.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo base y los posibles sesgos heredados deben evaluarse legal y éticamente antes de desplegarlo en producción.
- Requiere una rama específica de llama.cpp (`qwen35moe-qsa`); las compilaciones estándar no soportan los indexadores QSA y podrían fallar al cargar el modelo.
- El flag `--spec-type draft-mtp` necesita una compilación reciente de llama.cpp; si no se reconoce, debe usarse el fichero sin MTP.
- El parámetro `LLAMA_QSA_TOP_K` debe ajustarse según la longitud del prompt; el valor por defecto (2048) es adecuado para chat, pero para documentos largos conviene elevarlo (por ejemplo, 4096).
- No se dispone de información sobre sesgos específicos, composición del dataset de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/tvall43/Qwen3.6-35B-A3B-heretic-QSA-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF
- Indexadores QSA: https://huggingface.co/tvall43/Qwen3.6-35B-A3B-heretic-QSA-indexers
- Fork de llama.cpp con soporte QSA: https://github.com/tvall43/llama.cpp/tree/qwen35moe-qsa
