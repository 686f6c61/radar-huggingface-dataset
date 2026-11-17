# zephel01/Ornith-1.5-9B-QSA-GGUF

## Resumen
Ornith-1.5-9B QSA GGUF es una cuantización del modelo Ornith-1.5-9B (desarrollado por ornith-ai) publicada por el usuario zephel01, que incorpora un indexador de atención dispersa (QSA, del inglés *Query Sparse Attention*) sobre las capas de atención completa del modelo base. El objetivo es mantener velocidades de decodificación altas en contextos largos: según el autor, alcanza 215 tok/s de decodificación con una ventana de 128K tokens en una única RTX 5090, con un consumo medido de 14,9 GB de VRAM y 7 GB de RAM de sistema.

El modelo base tiene 9.215.446.656 parámetros (aproximadamente 9,2B) y una arquitectura híbrida de 32 capas: 24 capas Gated DeltaNet y 8 capas de atención completa (en las posiciones 3, 7, ..., 31), con un diseño heredado de Qwen3.5-9B. El indexador QSA, de solo 21M parámetros, se entrenó durante 3 h 45 min en una RTX 5090 alquilada, con un consumo de 2,16 kWh. Los pesos del modelo base se mantienen sin cambios salvo por la cuantización.

La relevancia de esta ficha radica en que demuestra una técnica práctica para extender contexto largo en GPUs de consumo (objetivo declarado: 12 GB o más de VRAM), aunque con limitaciones importantes: requiere el motor propietario Abyss (llama.cpp no puede cargar estos ficheros) y está marcada como BETA con una nota de calidad (KL) que el propio autor advierte que debe leerse con atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet + 8 capas de atención completa; QSA (atención dispersa) en 7 de las 8 capas de atención completa (la capa 3 permanece densa) |
| Parametros totales | 9.215.446.656 (9,2B); indexador QSA: 21M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (medido en RTX 5090) |
| Tipos de cuantizacion | Q4_K_M (con indexador en FP32) y Q8_0 (con indexador en FP32) |
| Idiomas soportados | en, ja |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tamano del repo | 15,7 GB |
| Ficheros publicados | `Ornith-1.5-9B-QSA-Q4_K_M.gguf` (5,85 GB), `Ornith-1.5-9B-QSA-Q8_0.gguf` (9,86 GB) |
| Motor de inferencia | Abyss v1.3.162 o superior (solo CUDA; en AMD funciona en modo denso) |
| Modelo base | ornith-ai/Ornith-1.5-9B |

## Arquitectura y entrenamiento
El modelo base sigue el diseño de Qwen3.5-9B: 32 capas en total, de las cuales 24 son Gated DeltaNet (una variante de atención lineal con estado recurrente) y 8 son de atención completa estándar, situadas en las capas 3, 7, ..., 31. Sobre esa estructura, la cuantización añade un indexador QSA de 21M parámetros que se ejecuta en 7 de las 8 capas de atención completa. Cuando la caché KV supera los 4.099 tokens, cada token atiende únicamente a los 1.024 mejores bloques de 4 tokens seleccionados por el indexador, más su propio bloque (equivalente a `top_k` 4096). La capa 3 se mantiene densa, decisión heredada del trabajo previo sobre Qwen3.5-9B QSA, donde mantenerla densa redujo a la mitad la KL a 128K.

Es importante subrayar que QSA reduce el trabajo de atención y las lecturas de KV, pero no el almacenamiento: toda la caché KV permanece en memoria. El indexador se entrenó en 3 h 45 min sobre una RTX 5090 alquilada, con el mismo tokenizador, datos y ajustes que el trabajo previo del autor sobre Qwen3.5-9B. Los pesos del modelo base no se modificaron más allá de la cuantización. Los ficheros conservan el bloque NextN (MTP) del modelo, que Abyss utiliza para el borrador de tokens en decodificación especulativa. También se incrustó la plantilla de chat propia de Ornith (`chat_template.jinja`), que renderiza `<think>…</think>` en turnos previos del asistente, en lugar de la plantilla de Qwen3.5 que arrastra el `tokenizer_config.json` original. No se usó imatrix.

## Capacidades
- Generación de texto conversacional en inglés y japonés.
- Razonamiento con modo *thinking*: la plantilla de chat renderiza bloques `<think>…</think>` en turnos previos del asistente.
- Decodificación especulativa mediante el bloque NextN (MTP) incluido en los ficheros, aprovechado por el motor Abyss.
- Procesamiento de contextos largos (hasta 128K tokens) con atención dispersa selectiva, lo que permite mantener velocidad de decodificación a medida que crece el contexto.
- Inferencia local en GPU de consumo (objetivo: 12 GB de VRAM o más).
- Compatibilidad con endpoints tipo OpenAI (`/v1/chat/completions`) a través de Abyss.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso
- Análisis de documentos largos en local: con 128K tokens de contexto y decodificación rápida, el modelo puede resumir o extraer información de informes extensos en una única GPU de consumo, sin depender de servicios en la nube.
- Asistencia conversacional en japonés e inglés: la plantilla de chat con modo *thinking* y el soporte nativo de ambos idiomas lo hacen adecuado para asistentes bilingües desplegados en estaciones de trabajo locales.
- Procesamiento de bases de código o logs extensos: el contexto de 128K permite cargar ficheros grandes o trazas completas y mantener la velocidad de generación gracias a QSA.
- Investigación sobre atención dispersa: el propio autor documenta la comparación entre modo denso y QSA (`STRATA_Q35_QSA=0`), lo que convierte este modelo en una herramienta para estudiar el impacto de la atención selectiva en la calidad a contexto largo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con licencia MIT, es apto para escenarios donde los datos no pueden salir de la máquina.
- Prototipado de pipelines de generación de texto con API compatible con OpenAI: Abyss expone un endpoint `/v1/chat/completions`, lo que facilita integrar el modelo en aplicaciones existentes que ya usan ese formato.
- Evaluación comparativa de cuantizaciones: los ficheros Q4_K_M y Q8_0 permiten medir el compromiso entre tamaño (5,85 GB frente a 9,86 GB) y calidad en el mismo hardware.

## Benchmarks y rendimiento
El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí presenta mediciones de calidad y rendimiento propias:

| Metrica | Valor |
|---|---|
| Decodificacion a 128K de contexto | 215 tok/s en una RTX 5090 |
| VRAM a 128K (Q4_K_M) | 14,9 GB |
| RAM de sistema a 128K | 7 GB |
| VRAM estimada con limite de 11 GB | no medida en este modelo (estimada a partir de Qwen3.5-9B QSA, que logro 128K en 10,7 GB) |
| Tamano Q4_K_M | 5,85 GB |
| Tamano Q8_0 | 9,86 GB |

Comparación de calidad QSA frente a atención densa a 128K (Q4_K_M, evaluado sobre los últimos 1.024 tokens de 8 muestras de ~128K):

| Muestra | NLL densa | NLL QSA | Cambio | KL | KL max | Mismo token top |
|---|---:|---:|---:|---:|---:|---:|
| code 0 | 1,0689 | 1,0781 | +0,9% | 0,014 | 0,51 | 96,7% |
| ja 1 | 0,9444 | 0,9596 | +1,6% | 0,047 | 1,47 | 94,0% |
| en 2 | 1,6266 | 1,5577 | −4,2% | 0,342 | 27,50 | 90,9% |
| agent 3 | 1,4287 | 1,4406 | (datos truncados en la model card) | no disponible | no disponible | no disponible |

El autor advierte explícitamente en la model card que las predicciones a 128K de este modelo se desvían más que las de Qwen, con y sin QSA, y que la muestra `en 2` presenta una KL de 0,342 con un máximo de 27,50, un dato que debe considerarse al evaluar la calidad en inglés a contexto largo.

## Requisitos de hardware
- VRAM: 14,9 GB medidos con Q4_K_M a 128K de contexto en una RTX 5090; 7 GB adicionales de RAM de sistema. El objetivo declarado por el autor es una GPU con 12 GB o más.
- GPU recomendadas: RTX 5090 (medida); se espera que GPUs de 11 GB o más soporten 128K según la experiencia con Qwen3.5-9B QSA, aunque no se ha medido en este modelo.
- GPU de consumo: sí, el modelo está diseñado para ello; la RTX 5090 es la referencia medida.
- Opciones de despliegue: exclusivamente el motor Abyss (v1.3.162 o superior) en CUDA; en AMD funciona en modo denso. llama.cpp no puede cargar estos ficheros porque su cargador qwen35 no reconoce los tensores del indexador (error `wrong number of tensors; expected 477, got 442`).
- Latencia y throughput: 215 tok/s de decodificación a 128K de contexto en RTX 5090.
- Instalación: `setup-deepseek.sh --model ornith-9b-qsa --download-model` (disponible desde Abyss v1.3.166), con verificación SHA-256 incluida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B QSA GGUF (este) | 9,2B | 128K | MIT | GGUF (solo Abyss) | 215 tok/s a 128K en RTX 5090; indexador QSA de 21M |
| Qwen3.5-9B QSA GGUF (zephel01) | ~9B | 128K | no disponible en la informacion | GGUF (solo Abyss) | Misma receta; 128K en 10,7 GB con VRAM limitada a 11 GB |
| Ornith-1.5-9B (base, ornith-ai) | 9,2B | no disponible en la informacion | MIT | safetensors (presumiblemente) | Modelo original sin QSA; admite conversión a GGUF estándar para llama.cpp |
| Qwen3.8-27B QSA GGUF (higa2515) | 27B | no disponible en la informacion | no disponible en la informacion | GGUF | Origen de la idea QSA citada por el autor |

## Limitaciones y advertencias
- Marcada como BETA por el autor: las mediciones provienen de un único PC y se invita a enviar resultados de otras GPUs.
- Calidad a 128K: el autor señala que las predicciones a 128K se desvían más que las de Qwen, con y sin QSA; la muestra en inglés presenta una KL de 0,342 y un máximo de 27,50, lo que indica riesgo de degradación en contextos largos en inglés.
- Compatibilidad restringida: solo funciona con el motor Abyss; llama.cpp rechaza los ficheros por el número de tensores. Para llama.cpp debe usarse un GGUF estándar de Ornith-1.5-9B.
- Solo CUDA: en AMD el modelo se ejecuta en modo denso, perdiendo las ventajas de QSA.
- Idiomas limitados a inglés y japonés; no se documenta soporte de otros idiomas.
- QSA no reduce el almacenamiento de la caché KV, solo el trabajo de atención y las lecturas; la VRAM sigue creciendo con el contexto.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las advertencias habituales de los modelos de 9B.
- Sesgos: no documentados en la información disponible.
- Licencia MIT, lo que permite uso comercial, pero el modelo base es de ornith-ai y conviene verificar los términos del modelo original.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/zephel01/Ornith-1.5-9B-QSA-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Motor Abyss: https://github.com/zephel01/Abyss
- Qwen3.5-9B QSA GGUF (misma receta): https://huggingface.co/zephel01/Qwen3.5-9B-QSA-GGUF
- Idea QSA original: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Enviar resultados de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Ornith-1.5-9B+QSA
