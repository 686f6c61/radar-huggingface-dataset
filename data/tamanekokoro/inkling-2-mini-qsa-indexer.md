# tamanekokoro/Inkling-2-Mini-QSA-Indexer

## Resumen

Inkling-2-Mini QSA Indexer (v3) es un conjunto de pesos de indexador de atención dispersa (sparse attention) para el modelo base `thinkingmachines/Inkling-2-Mini`. No se trata de un modelo de lenguaje completo, sino de un componente auxiliar de 22,51 MiB que puntúa bloques de KV de 4 tokens en cada capa de atención completa del modelo base, permitiendo seleccionar los bloques remotos más relevantes y acelerar el prefill y la decodificación en contextos largos. Lo desarrolla el usuario `tamanekokoro` y está destilado específicamente para el motor `strata-inkling2` del proyecto Strata, orientado a GPUs AMD con ROCm/HIP.

El modelo base Inkling-2-Mini emplea 8 capas virtuales de atención completa (vl = 5, 11, 17, 23, 29, 35, 41, 47) intercaladas con capas de atención de ventana deslizante (SWA). El indexador aprende a aproximar la distribución de atención densa del profesor mediante divergencia KL restringida a bloques remotos, manteniendo siempre los bloques sink y locales. Su relevancia radica en que habilita inferencia eficiente en contextos de hasta 256K tokens sobre hardware consumer AMD, con aceleraciones medidas de hasta +124% en prefill y +32% en generación frente a atención densa.

La ficha describe un artefacto de pesos binarios, no un modelo autónomo: requiere el GGUF cuantizado del modelo base y el motor Strata para funcionar. La licencia es MIT, aunque el modelo base queda sujeto a su licencia original de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Indexador de atención dispersa por bloques (QSA, Qwen Sparse Attention) sobre transformer con capas de atención completa y SWA intercaladas |
| Parametros totales | No disponible (pesos binarios de 23.601.344 bytes; 8 capas con tensores `wq` 512×2304, `wk` 128×2304, `q_norm_w` 128, `k_norm_w` 128, `w_head` 4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 262.144 tokens en el motor Strata (probado a 256K); destilado sobre secuencias de 16.384 tokens |
| Tipos de cuantizacion | Pesos del indexador en FP16 (`wq`, `wk`) y FP32 (`q_norm_w`, `k_norm_w`, `w_head`); el modelo base se usa en GGUF Q4_K_M con KV en q8 |
| Idiomas soportados | No disponible de forma oficial; datos de destilación en inglés y japonés |
| Licencia | MIT (modelo base sujeto a licencia original de Thinking Machines) |
| Formato de pesos | Binario propietario `QSAW` v1 (`magic=0x51534157`, `ver=1`); el modelo base en GGUF |

Parámetros internos del indexador: `n_full = 8`, `n_embd = 2304`, `h_idx = 4`, `d_idx = 128`, `blk_sz = 4`, `rope_theta = 0.0` (NoPE).

## Arquitectura y entrenamiento

El indexador es una red ligera de puntuación por capa que opera sobre representaciones de 2304 dimensiones. Para cada capa de atención completa, proyecta queries (`wq`, 512×2304) y keys (`wk`, 128×2304), aplica normalización (`q_norm_w`, `k_norm_w` en FP32) y produce una puntuación por bloque KV de 4 tokens mediante una cabeza de 4 dimensiones (`w_head`). No usa RoPE (`rope_theta = 0.0`), lo que según el autor favorece la generalización a contextos más largos que los vistos en entrenamiento. La selección combina top-K de bloques remotos con bloques sink (16 tokens) y locales (256 tokens) siempre retenidos.

El entrenamiento es una destilación del profesor denso: se volcaron distribuciones de probabilidad de atención completa exactas desde `Inkling-2-Mini-UD-Q4_K_M.gguf` con `--kv-q8` sobre 64 secuencias diversas de 16.384 tokens (56 de entrenamiento, 8 de validación), incluyendo prosa larga en inglés y japonés, QA sobre código fuente, NIAH multi-aguja y QA con citas. La función objetivo es divergencia KL solo sobre bloques remotos (excluyendo sink y locales) más una KL auxiliar agudizada (`sharp_weight=0.30`), con 100 épocas por capa en NVIDIA A100 e inicialización alineada positiva de `wq`/`wk` para evitar ReLU muertas. El script de entrenamiento está publicado en el repositorio Strata.

## Capacidades

- Puntuación de bloques KV para atención dispersa en 8 capas de atención completa del modelo base.
- Selección top-K de bloques remotos con presupuesto configurable (`--qsa-budget`, por ejemplo 4096).
- Retención garantizada de bloques sink (16 tokens) y ventana local (256 tokens).
- Aceleración de prefill y decodificación en contextos largos (hasta 256K tokens).
- Generalización a contextos superiores a los de entrenamiento (16K → 65K–256K) gracias al esquema NoPE.
- Compatibilidad con GGUF alternativos en formato `inkling2_loop` sin re-destilación (probado con una variante abliterated).
- Soporte de ejecución en GPU única y en tensor parallelism de 2 GPUs AMD.
- No incorpora generación de texto, tool calling, agentes ni capacidades multimodales por sí mismo; estas dependen del modelo base.

## Casos de uso

- Inferencia de contexto largo en hardware consumer AMD: desplegar Inkling-2-Mini con 65K–256K tokens en una o dos RX 9060 XT 16 GB usando `strata-inkling2`, donde la atención densa sería inviable por memoria y latencia.
- Recuperación de aguja en pajar (NIAH) a gran escala: el indexador mantiene coincidencia exacta en pruebas de aguja única a 65K y 256K, útil para evaluar y operar pipelines de retrieval sobre documentos extensos.
- Resumen de documentos largos bilingües EN/JP: probado con resúmenes coherentes a 32K tokens con aceleración de prefill del +12%.
- Servicio de chat con historial extenso: la ventana local de 256 tokens más los bloques sink preservan coherencia conversacional mientras el indexador descarta bloques irrelevantes.
- QA sobre bases de código: los datos de destilación incluyen QA de código fuente, permitiendo consultas sobre repositorios largos con coste de atención reducido.
- Aceleración de pipelines de evaluación: integrar el indexador en pruebas de modelos de contexto largo para reducir el tiempo de prefill en un 53–124% según configuración.
- Despliegue en clústeres ROCm: aprovechar tensor parallelism TP=2 en GPUs Radeon para servir contextos de 256K con throughput de 61,1 t/s en generación.

## Benchmarks y rendimiento

Recall de masa de atención remota del profesor (8 secuencias de validación de 16K, excluyendo 4 bloques sink y 64 locales):

| Capa virtual | rem@128 | rem@256 | rem@444 |
|---|---:|---:|---:|
| vl = 5 | 38,18% | 50,27% | 61,89% |
| vl = 11 | 61,89% | 74,00% | 83,06% |
| vl = 17 | 55,75% | 67,72% | 77,46% |
| vl = 23 | 64,07% | 75,69% | 84,21% |
| vl = 29 | 55,95% | 68,11% | 77,86% |
| vl = 35 | 64,66% | 76,00% | 84,30% |
| vl = 41 | 55,49% | 67,86% | 77,85% |
| vl = 47 | 43,90% | 57,00% | 68,70% |

Rendimiento en hardware real (`strata-inkling2`, RX 9060 XT 16 GB, ROCm 10.1.0, `--qsa-budget 4096 --qsa-local 256 --qsa-sink 16`):

| Tarea | Hardware | Denso (PP / TG) | QSA v3 (PP / TG) | Aceleración (PP / TG) | Resultado |
|---|---|---|---|---|---|
| NIAH 65K | 1× RX 9060 XT | 1.057 / 38,4 t/s | 1.614 / 43,8 t/s | +53% / +14% | Coincidencia exacta |
| NIAH 65K | 2× RX 9060 XT | 1.541 / 62,6 t/s | 2.040 / 66,4 t/s | +32% / +6% | Coincidencia exacta |
| NIAH 256K | 2× RX 9060 XT | 821,4 / 46,2 t/s | 1.844 / 61,1 t/s | +124% / +32% | Coincidencia exacta |
| Resumen EN/JP 32K | 2× RX 9060 XT | 1.679 / 68,5 t/s | 1.883 / 68,3 t/s | +12% / ~0% | Resumen coherente |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este artefacto en la información disponible.

## Requisitos de hardware

- VRAM del indexador: 22,51 MiB adicionales sobre el modelo base; el coste dominante es el GGUF Q4_K_M y la KV cache en q8.
- Configuración mínima probada: 1× AMD Radeon RX 9060 XT 16 GB para contexto de 65K.
- Configuración para 256K: 2× RX 9060 XT 16 GB con tensor parallelism TP=2 (`--peer-device 1`).
- GPUs recomendadas: AMD Radeon RX 9060 XT 16 GB; el motor es ROCm/HIP, no se documenta soporte CUDA para inferencia (el entrenamiento se hizo en A100).
- Cabe en GPU consumer AMD de 16 GB; no hay datos de funcionamiento en GPUs NVIDIA consumer con este motor.
- Despliegue: exclusivamente mediante el binario `strata-inkling2` del repositorio Strata (build HIP). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 43,8 t/s en generación a 65K en GPU única; 66,4 t/s a 65K y 61,1 t/s a 256K en dual GPU; prefill de 1.614 a 2.040 t/s según configuración.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini QSA Indexer v3 | Indexador disperso para Inkling-2-Mini | Hasta 256K (motor Strata) | MIT | Hugging Face, 0 descargas, 4 likes | Aceleración +124% PP a 256K |
| Inkling-2-Mini (denso) | Modelo base completo | No disponible en la información | Licencia de Thinking Machines | Hugging Face | Referencia de calidad; sin aceleración dispersa |
| Indexadores sparse de otros modelos (por ejemplo, basados en Qwen Sparse Attention) | Componentes de atención dispersa | Variable | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparativas cuantitativas con alternativas equivalentes en la información disponible.

## Limitaciones y advertencias

- Destilado sobre secuencias de 16K tokens; la precisión en extracción multi-aguja densa y en recuerdo literal de múltiples identificadores de código a 65K+ puede quedar por debajo de la atención densa exacta.
- Entrenado y validado con `Inkling-2-Mini-UD-Q4_K_M.gguf` y `--kv-q8`; otros GGUF solo cuentan con pruebas de humo (3/3 en NIAH de 3 agujas y coincidencia exacta en 127 tokens de decodificación greedy).
- Dependencia estricta del motor `strata-inkling2` (ROCm/HIP); no es portable a otros runtimes sin trabajo adicional.
- No es un modelo autónomo: sin el modelo base y el motor no genera texto ni ofrece tool calling, agentes o visión.
- Idiomas de destilación limitados a inglés y japonés; el rendimiento en castellano u otros idiomas no está documentado.
- El modelo base está sujeto a la licencia original de Thinking Machines, que puede imponer restricciones adicionales al uso comercial aunque el indexador sea MIT.
- Riesgo de degradación en tareas que requieran atención densa exacta sobre todo el contexto, especialmente con presupuestos QSA bajos.
- Repositorio con 0 descargas y 4 likes: madurez y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/tamanekokoro/Inkling-2-Mini-QSA-Indexer
- Repositorio Strata: https://github.com/Tamanekokko/Strata
- Script de entrenamiento: https://github.com/Tamanekokko/Strata/blob/main/tools/qsa/train_qsa_modal_v3.py
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF alternativo probado: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated-GGUF
