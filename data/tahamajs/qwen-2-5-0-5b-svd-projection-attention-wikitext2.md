# tahamajs/qwen-2.5-0.5b-svd-projection-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-svd-projection-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Zoo. No es un modelo nuevo entrenado desde cero, sino un Qwen2.5-0.5B original de Alibaba cuyo mecanismo de atencion en el decodificador ha sido sustituido quirurgicamente por un modulo denominado `SVDProjectionAttention`, que factoriza las proyecciones lineales de atencion mediante descomposicion en valores singulares (SVD) para reducir el coste computacional. El checkpoint resultante se ha reentrenado sobre WikiText-2 mediante destilacion de conocimiento en dos etapas.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`), pero en 18 de las 24 capas la atencion cuadratica original ha sido reemplazada por la variante SVD, manteniendo 6 capas ancla cuadraticas en los indices [3, 7, 11, 15, 19, 23] bajo un patron híbrido 3:1. El objetivo es demostrar que es posible reducir el coste de atencion sin destruir por completo la capacidad de modelado del lenguaje, midiendo la recuperacion de perplejidad tras la cirugia.

Su relevancia es fundamentalmente de investigacion: sirve como banco de pruebas reproducible para estudiar la viabilidad de mecanismos de atencion subcuadraticos en modelos ya entrenados. La perplejidad final en WikiText-2 es de 296,08, muy superior a la del Qwen2.5-0.5B original, lo que refleja que la sustitucion degrada sustancialmente la calidad del modelo pese a la recuperacion lograda frente al estado post-cirugia inicial (54.523,92).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SVDProjectionAttention` y 6/24 capas cuadraticas ancla |
| Parametros totales | no disponible (deriva de Qwen2.5-0.5B, ~0,5 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 55,07 MB) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: un transformer decoder-only con atencion multi-cabeza con Grouped Query Attention (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y 24 capas. Sobre esta base se aplica una "cirugia" que sustituye el modulo de atencion por `SVDProjectionAttention`, una implementacion que factoriza las proyecciones lineales de atencion mediante SVD para aproximar las matrices de proyeccion con menor rango. El patron `hybrid_3_1` intercala tres capas con atencion SVD por cada capa cuadratica completa, dejando intactas 6 capas ancla. El adaptador `QwenAttentionAdapter` gestiona la expansion de cabezas KV (7x cuando es necesario) y respeta el contrato de proyeccion de salida unica (`o_proj`).

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenamiento) arroja una perplejidad de 54.523,92, lo que evidencia la destruccion inicial de la capacidad del modelo. La etapa 1 (alineacion con backbone congelado, `lm_head` eludido, MSE y coseno por capas con peso 0,25) se ejecuta durante 125 pasos en 54,4 s. La etapa 2 (destilacion de representacion multicapa, peso coseno 0,50) requiere 286 pasos en 125,4 s. En total, 411 pasos de optimizacion en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando una VRAM pico de 17.489 MB en FP16 con parametros maestros en FP32. La perplejidad final se reduce a 296,08, una mejora de 54.227,84 puntos respecto al estado post-cirugia.

## Capacidades

- Generacion de texto autoregresiva causal, heredada de la arquitectura Qwen2.5-0.5B.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (segun la tabla de capacidades del autor).
- Soporte nativo de GQA (Grouped Query Attention) mediante SDPA cuando es posible.
- Compatibilidad con RoPE marcada como "N/A" en la tabla del autor (no se especifica soporte explicito de rotary position embeddings en el modulo SVD).
- Capacidad multilingue limitada: el modelo declara unicamente ingles (`en`) en sus metadatos.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atencion cuadratica por proyecciones SVD factorizadas en un transformer ya entrenado, comparando perplejidad antes y despues de la cirugia.
- Experimentos de destilacion de conocimiento: el pipeline de dos etapas (alineacion con backbone congelado y destilacion de representacion multicapa) puede replicarse sobre otros modelos base para evaluar estrategias de recuperacion tras modificaciones arquitectonicas agresivas.
- Benchmarking de modulos de atencion: al formar parte del Attention Zoo de NeuralOps, permite comparar `SVDProjectionAttention` frente a otros mecanismos del registro bajo condiciones controladas (mismo dataset, mismo esquema de entrenamiento).
- Prototipado de bajo coste en CPU/MPS: el modulo incluye fallback Triton para CPU y MPS, lo que facilita ejecutar inferencia en entornos sin GPU dedicada para pruebas de concepto.
- Estudio de degradacion controlada: la perplejidad de 296,08 frente a la del modelo base permite analizar curvas de degradacion y limites practicos de las aproximaciones de bajo rango en atencion.
- Docencia y divulgacion: ejemplo didactico de cirugia arquitectonica, adaptadores de atencion y destilacion en dos fases con telemetria detallada (pasos, tiempos, VRAM, delta de perplejidad).

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 296,08 | No |
| WikiText-2 (estado post-cirugia, etapa 0) | Perplejidad | 54.523,92 | No |
| WikiText-2 (delta tras destilacion) | Perplejidad | -54.227,84 | No |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los valores anteriores son los declarados por el autor en la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 17.489 MB pico en FP16 con parametros maestros en FP32. Para inferencia en FP16 de un modelo de ~0,5B se espera un consumo muy inferior, pero no se documenta.
- GPU recomendadas: no disponible. El autor menciona soporte de fallback Triton para CPU y MPS, lo que sugiere ejecucion en hardware sin CUDA.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano (~0,5B) y el artefacto de pesos de 55,07 MB, pero no se confirma en la informacion disponible.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria `neuralops` y `transformers` con `apply_qwen_attention_surgery`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se reportan tiempos de entrenamiento (180,1 s para 411 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen-2.5-0.5b-svd-projection-attention-wikitext2` | ~0,5B (derivado) | no disponible | 296,08 (no verificado) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos verificados de perplejidad del modelo base ni de otros checkpoints comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Perplejidad muy elevada (296,08) en WikiText-2, lo que indica una calidad de modelado del lenguaje sustancialmente inferior a la del Qwen2.5-0.5B original.
- El checkpoint contiene unicamente los pesos de atencion (`attention_weights.safetensors`, 55,07 MB); requiere descargar el modelo base Qwen2.5-0.5B y aplicar la cirugia con `apply_qwen_attention_surgery` antes de cargar los pesos.
- La carga de pesos se realiza con `strict=False`, lo que puede ocultar desajustes silenciosos entre el estado guardado y la arquitectura reconstruida.
- Idioma limitado al ingles segun los metadatos; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinacion; al ser un checkpoint de investigacion, no se recomienda su uso en produccion.
- El entrenamiento se limita a WikiText-2 con `seq_len=512`; no se valida el comportamiento en contextos largos ni en dominios distintos al corpus de entrenamiento.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y la calidad degradada del modelo desaconsejan cualquier despliegue productivo.
- No se han verificado de forma independiente los resultados de perplejidad declarados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-projection-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
