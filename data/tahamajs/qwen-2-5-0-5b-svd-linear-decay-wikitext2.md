# tahamajs/qwen-2.5-0.5b-svd-linear-decay-wikitext2

## Resumen

`qwen-2.5-0.5b-svd-linear-decay-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino una cirugía arquitectónica sobre `Qwen/Qwen2.5-0.5B`: se sustituyen los bloques de atención cuadrática de 18 de sus 24 capas por un módulo de atención lineal denominado `svd_linear_decay` (`DecayDecayLinearAttention`), que combina una factorización de bajo rango por descomposición en valores singulares con un núcleo de decaimiento temporal exponencial. Las 6 capas restantes conservan la atención completa original como anclas.

El objetivo del experimento es evaluar si es posible convertir un transformer causal estándar en un híbrido subcuadrático manteniendo cierta capacidad de modelado, mediante destilación de conocimiento en dos etapas sobre WikiText-2. El resultado es un modelo de investigación con una perplejidad de validación de 3008,38 en `wikitext-2-raw-v1`, muy lejos de la del modelo base original, lo que lo sitúa como una prueba de concepto más que como un modelo apto para producción.

El modelo se distribuye únicamente como pesos de atención (`attention_weights.safetensors`, 76,62 MB) que deben aplicarse sobre el Qwen2.5-0.5B original mediante la función `apply_qwen_attention_surgery` del repositorio NeuralOps. Requiere la librería `neuralops` y una topología de cirugía concreta (`hybrid_3_1`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con atención lineal `svd_linear_decay` (`DecayDecayLinearAttention`) y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | No disponible de forma explícita; derivado del base Qwen2.5-0.5B (~0,49B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors, presumiblemente FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 76,62 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA), con `head_dim=64`. La cirugía `hybrid_3_1` reemplaza la atención de 18 capas por el módulo `svd_linear_decay`, que implementa una recurrencia lineal en tiempo O(N): `S_t = λ S_{t-1} + K_t^T V_t`, `O_t = Q_t S_t`, con escaneo de prefijos de decaimiento acumulado por chunks y sin materializar matrices N×N. El adaptador `QwenAttentionAdapter` gestiona la expansión 7x de cabezas KV cuando es necesario y respeta el contrato de `o_proj` único. El módulo declara soporte de atención causal, bidireccional, cross-attention, GQA y operador de atención personalizado; el soporte de RoPE aparece como no aplicable.

El entrenamiento consistió en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado, `lm_head` puenteado, MSE y coseno por capa a 0,25) duró 69 pasos (54,6 s); la etapa 2 (KD de representación multicapa, MSE y coseno a 0,50) duró 156 pasos (125,9 s). En total, 225 pasos de optimización en 180,8 s, con un pico de VRAM de 12 935 MB en autocast FP16 con parámetros maestros en FP32. La perplejidad causal pasó de 406 957,26 antes de la destilación a 3008,38 después.

## Capacidades

- Generación de texto causal autorregresiva en inglés (pipeline `text-generation`).
- Conversación: el tag `conversational` sugiere compatibilidad con el formato de chat heredado de Qwen2.5, aunque no se detalla en la model card.
- Atención lineal subcuadrática en 18 de las 24 capas, lo que en teoría reduce el coste computacional en secuencias largas.
- Soporte declarado de atención bidireccional y cross-attention a nivel de módulo (no necesariamente expuesto en el uso causal estándar).
- Soporte de GQA nativo en el módulo de atención.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según los metadatos.

## Casos de uso

- Investigación en atención subcuadrática: sirve como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por atención lineal con decaimiento en un modelo pequeño, usando la perplejidad de WikiText-2 como métrica de referencia.
- Estudio de destilación de conocimiento post-cirugía: el par de etapas (alineación de backbone y KD de representación multicapa) es un ejemplo concreto y medible para investigar cómo recuperar capacidad tras reemplazar módulos de atención.
- Experimentos de eficiencia en secuencias largas: al evitar la materialización de matrices N×N, el módulo permite probar regímenes de contexto extendido en hardware modesto, aunque la calidad del modelo no sea apta para producción.
- Docencia y divulgación: ilustra de forma práctica cómo se modifica un transformer existente a nivel de módulo de atención mediante adaptadores y contratos de proyección.
- Evaluación de adaptadores GQA: el `QwenAttentionAdapter` con expansión 7x de cabezas KV es un caso de estudio para ingeniería de compatibilidad entre arquitecturas de atención.
- Reproducción de pipelines de cirugía: el script `apply_qwen_attention_surgery` permite replicar el proceso sobre otras variantes de Qwen y comparar topologías híbridas (por ejemplo, distintas proporciones de capas lineales frente a cuadráticas).
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas de razonamiento, dada su perplejidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 3008,38 |
| WikiText-2, baseline post-cirugía sin KD (Stage 0) | Perplejidad | 406 957,26 |
| Delta tras destilación | Perplejidad | -403 948,87 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: 12 935 MB de pico (FP16 autocast con parámetros maestros FP32) para `seq_len=512` y `grad_accum=4`.
- VRAM de inferencia estimada: no disponible de forma explícita; por el tamaño del base (~0,5B parámetros) cabría en GPUs de consumo con 8 GB o menos en FP16, aunque no se han publicado medidas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB (RTX 3060/4060, RTX 4090, A100, H100) debería poder cargar el modelo en FP16; no hay datos de latencia ni throughput.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del base, pero no confirmado por el autor.
- Opciones de despliegue: requiere `neuralops` y el script `apply_qwen_attention_surgery` para reconstruir el modelo; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-linear-decay-wikitext2` | ~0,49B (base) | No disponible | 3008,38 (declarada) | MIT | Pesos de atención únicamente |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,49B | 32 768 tokens (según especificaciones públicas de Qwen2.5) | No disponible en esta ficha | Apache 2.0 (según el modelo base) | Pesos completos |
| Otros modelos del Attention Zoo de NeuralOps | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de perplejidad del modelo base en la información proporcionada, por lo que no es posible cuantificar la degradación exacta respecto al original.

## Limitaciones y advertencias

- Perplejidad de validación muy elevada (3008,38) en WikiText-2, lo que indica una calidad de modelado del lenguaje muy inferior a la del Qwen2.5-0.5B original; no es apto para uso en producción.
- El modelo se distribuye solo como pesos de atención parciales; requiere el base Qwen2.5-0.5B y la librería `neuralops` más el script de cirugía para funcionar. No es un checkpoint autónomo.
- Entrenado exclusivamente sobre WikiText-2 en inglés; no hay evidencia de generalización a otros dominios ni idiomas.
- Riesgo elevado de alucinación y de generación incoherente dada la perplejidad reportada.
- No se documentan evaluaciones de sesgo, seguridad ni alineación (RLHF/DPO no mencionados).
- La licencia MIT aplica a los pesos publicados; conviene verificar la licencia del modelo base Qwen2.5-0.5B (Apache 2.0 según su card pública) antes de cualquier uso derivado.
- El soporte de RoPE aparece como no aplicable en el módulo, lo que puede afectar a la extrapolación de contexto; no se especifica longitud de contexto efectiva.
- Sin descargas ni likes en el momento de la consulta; sin validación independiente de los resultados declarados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-linear-decay-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
