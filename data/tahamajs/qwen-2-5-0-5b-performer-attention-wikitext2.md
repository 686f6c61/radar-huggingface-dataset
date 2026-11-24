# tahamajs/qwen-2.5-0.5b-performer-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-performer-attention-wikitext2` es un checkpoint experimental publicado por el desarrollador tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino una intervención quirúrgica sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder original por el operador `PerformerAttention` (atención lineal aproximada mediante FAVOR+, Fast Attention Via Positive Orthogonal Random Features), conservando 6 capas con atención cuadrática estándar como anclas.

El objetivo del artefacto es demostrar la viabilidad del reemplazo modular de mecanismos de atención y de la recuperación de capacidad mediante destilación de conocimiento en dos etapas sobre WikiText-2. Tras la cirugía, la perplejidad causal se dispara a 2549,43 y, después de 336 pasos de destilación (unos 180 segundos), se recupera hasta 102,92 en la partición de validación de `wikitext-2-raw-v1`.

Es relevante como pieza de investigación sobre atención subcuadrática y como ejemplo reproducible de "attention surgery", pero no como modelo de producción: el entrenamiento se limita a WikiText-2 en inglés y el propio autor no verifica la métrica declarada. El modelo base es un transformer de 0,5 mil millones de parámetros con 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión de cabeza 64 y `hidden_size` 896.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con reemplazo híbrido de atención: 18/24 capas con `PerformerAttention` (FAVOR+) y 6/24 capas con atención cuadrática completa en índices [3, 7, 11, 15, 19, 23]; patrón `hybrid_3_1` |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repositorio solo contiene pesos de atención, 124,03 MB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`; no se especifica la ventana máxima soportada) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el ejemplo de uso carga en FP16) |
| Idiomas soportados | Inglés (`en` declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 124,03 MB) más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

La base es Qwen2.5-0.5B, un transformer decoder-only con atención de tipo GQA (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas). Sobre ella se aplica `apply_qwen_attention_surgery` con el patrón `hybrid_3_1`: se intercalan bloques en los que tres capas usan `PerformerAttention` y una conserva la atención cuadrática original, resultando en 18 capas transplantadas y 6 anclas. El `QwenAttentionAdapter` gestiona la expansión de cabezas KV (7x donde es necesario) y mantiene el contrato de un único `o_proj`. El operador Performer implementa FAVOR+ con características ortogonales positivas aleatorias, soporta causalidad, bidireccionalidad, cross-attention y GQA nativo.

El entrenamiento consiste en destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), sin RLHF ni DPO. La etapa 1 (alineación con backbone congelado) ejecuta 102 pasos en 54,4 segundos con `lm_head` desactivado, usando MSE y coseno sobre estados ocultos por capa (peso 0,25). La etapa 2 (destilación multi-capa de representaciones) ejecuta 234 pasos en 125,5 segundos con MSE y coseno (peso 0,50). En total, 336 pasos en 180,3 segundos, con `seq_len=512`, `grad_accum=4` y `topk=64`. El pico de VRAM fue de 13.892 MB en autocast FP16 con parámetros maestros en FP32. La perplejidad pasó de 2549,43 (post-cirugía, zero-shot) a 102,92 tras la destilación.

## Capacidades

- Generación de texto autoregresiva causal en inglés, heredada de Qwen2.5-0.5B y reajustada sobre WikiText-2.
- Atención lineal subcuadrática en 18 de las 24 capas, con coste teórico O(n) en lugar de O(n²) para secuencias largas.
- Soporte de atención causal, bidireccional y cross-attention a nivel de operador (según la tabla de capacidades del módulo).
- Soporte nativo de GQA con expansión automática de cabezas KV.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Capacidad multilingüe: no documentada; el modelo declara únicamente inglés.
- No se documenta un modo "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación sobre atención subcuadrática: banco de pruebas reproducible para medir la degradación y recuperación de perplejidad al sustituir atención cuadrática por Performer con destilación en dos etapas.
- Experimentos de "attention surgery": validar el adaptador `QwenAttentionAdapter` y el patrón `hybrid_3_1` antes de aplicarlos a modelos de mayor tamaño.
- Estudio de destilación de conocimiento: comparar la eficacia de la alineación con backbone congelado (etapa 1) frente a la destilación multi-capa de representaciones (etapa 2) con las métricas de telemetría publicadas.
- Prototipado educativo de FAVOR+: analizar cómo se comportan las características ortogonales positivas aleatorias en un decoder real de 24 capas con GQA.
- Evaluación de eficiencia memoria/tiempo: usar los datos de VRAM (13.892 MB) y tiempo (180,3 s) como referencia para estimar costes de cirugía y destilación en GPUs consumer o de datacenter.
- Generación de texto exploratoria en inglés sobre dominios cercanos a WikiText (texto enciclopédico), asumiendo la calidad limitada que refleja una perplejidad de 102,92.

## Benchmarks y rendimiento

| Modelo | Tarea / dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| qwen-2.5-0.5b-performer-attention-wikitext2 | Causal LM / wikitext-2-raw-v1 (validation) | Perplejidad | 102,92 | No (declarado por el autor) |

Datos de telemetría del entrenamiento declarados por el autor:

| Métrica | Valor |
|---|---|
| Perplejidad causal pre-destilación (etapa 0, post-cirugía) | 2549,43 |
| Perplejidad causal post-destilación | 102,92 |
| Delta de perplejidad | -2446,51 |
| Pasos totales / tiempo | 336 pasos / 180,3 s |
| Pico de VRAM | 13.892 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el pico registrado durante el entrenamiento fue de 13.892 MB en FP16 con parámetros maestros FP32.
- GPU recomendadas: no especificadas por el autor; por tamaño (0,5 B de parámetros) cabría en GPUs consumer, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU consumer: previsiblemente sí por tamaño del modelo base, aunque no se han publicado pruebas específicas.
- Opciones de despliegue: el repositorio usa la librería `neuralops` (`load_surgeried_model`) o la carga manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos no es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-performer-attention-wikitext2 | 0,5 B | No disponible | Híbrida Performer/cuadrática (18/24 + 6/24) | MIT | Hugging Face (383 descargas) |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | No disponible en la información | Cuadrática completa con GQA | No disponible en la información | Hugging Face |
| Alternativas subcuadráticas de 0,5 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre WikiText-2 en inglés: el dominio y el idioma están muy acotados, con riesgo alto de degradación fuera de texto enciclopédico.
- La perplejidad de 102,92 es muy superior a la de un modelo base bien ajustado; la calidad de generación es limitada y no apta para producción.
- La métrica está declarada por el autor y marcada como no verificada (`verified: false`).
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación.
- No se especifica la longitud máxima de contexto soportada; el entrenamiento usó `seq_len=512`.
- El repositorio solo contiene pesos de atención (124,03 MB), no el modelo completo: requiere descargar Qwen2.5-0.5B y aplicar la cirugía con el código de NeuralOps.
- Depende de la librería `neuralops` y de scripts concretos del proyecto (`qwen_zoo_train_mix`), lo que puede dificultar la reproducibilidad si cambian las APIs.
- Licencia MIT declarada, sin restricciones conocidas para uso comercial, aunque la idoneidad técnica para producción es muy baja.
- El checkpoint se publicó en noviembre de 2026 y no ha recibido "likes"; la comunidad de validación es prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-performer-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de Performer (FAVOR+): no disponible en la información proporcionada.
