# tahamajs/qwen-2.5-0.5b-landmark-local-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-landmark-local-attention-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención de 18 de las 24 capas del decodificador por el operador `LandmarkLocalAttention` del registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo no es ofrecer un modelo de propósito general, sino validar una técnica de atención subcuadrática (denominada LEKAv2, Linear-time Efficient Kernel Attention with Landmark Distillation) mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only con GQA: 14 cabezas de consulta y 2 de clave/valor, `head_dim=64`, `hidden_size=896`) y aplica un patrón híbrido 3:1 en el que se conservan 6 capas de atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19 y 23). Tras la cirugía, la perplejidad inicial se dispara a 49261,89 y se recupera hasta 242,57 mediante 294 pasos de destilación (180,6 segundos en total), lo que demuestra la viabilidad del reemplazo pero deja un modelo con calidad de lenguaje muy degradada respecto al original.

Es relevante ahora porque forma parte del "Qwen Attention Zoo" de NeuralOps, una línea de investigación sobre operadores de atención eficientes que buscan reducir el coste cuadrático de la atención estándar. No obstante, debe interpretarse como un artefacto de investigación reproducible, no como un modelo listo para producción: la perplejidad de 242,57 en WikiText-2 está muy lejos de los valores típicos de un modelo de 0,5B bien entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas usando `LandmarkLocalAttention` (híbrido 3:1, LEKAv2) y 6 capas de atención cuadrática completa como anclas |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B; no se especifica recuento exacto en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento usa `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16: `pytorch_model.bin` y `attention_weights.safetensors`) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (920,90 MB) y `attention_weights.safetensors` (73,14 MB) |

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-0.5B modificado mediante "attention surgery": el adaptador `QwenAttentionAdapter` mapea las proyecciones originales de `Qwen2Attention` (14 cabezas de consulta, 2 de clave/valor, `head_dim=64`, `hidden_size=896`) y aplica una expansión automática de cabezas KV de 7x donde es necesario, respetando el contrato de bypass de una única `o_proj`. El patrón `hybrid_3_1` sustituye la atención en 18 de las 24 capas y mantiene 6 capas con atención cuadrática completa en los índices [3, 7, 11, 15, 19, 23] para preservar capacidad de modelado global.

El operador `LandmarkLocalAttention` (LEKAv2) es una atención de kernel lineal con destilación de landmarks, con soporte para modo causal, bidireccional, cross-attention y GQA nativa; no soporta RoPE de forma nativa según la tabla de capacidades del módulo. El entrenamiento se realizó en dos etapas de destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`): una primera etapa de alineación con backbone congelado (89 pasos, 54,2 s, MSE y coseno por capa con peso 0,25 y `lm_head` desactivado) y una segunda de destilación multi-capa de representaciones (205 pasos, 126,0 s, pesos 0,50). En total, 294 pasos de optimización con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 21885 MB en FP16 autocast con parámetros maestros en FP32.

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- Soporte de atención causal, bidireccional y cross-attention a nivel del operador `LandmarkLocalAttention`.
- Soporte nativo de GQA (agrupación de cabezas clave/valor) en el operador sustituido.
- Integración con el ecosistema NeuralOps mediante `load_surgeried_model` y `apply_qwen_attention_surgery`.
- Compatibilidad con la API estándar de `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) tras aplicar la cirugía.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Investigación sobre atención subcuadrática: el modelo sirve como banco de pruebas reproducible para evaluar el operador `LandmarkLocalAttention` frente a atención cuadrática en un transformer pequeño, con métricas de perplejidad y telemetría de destilación publicadas.
- Reproducción de experimentos de attention surgery: permite replicar el pipeline `apply_qwen_attention_surgery` con patrón `hybrid_3_1` sobre Qwen2.5-0.5B y comparar perplejidades antes y después de la destilación.
- Estudio de destilación de conocimiento en dos etapas: la model card documenta pasos, tiempos y funciones de pérdida, lo que facilita analizar la recuperación de perplejidad tras una cirugía agresiva de atención.
- Benchmarking de operadores en el Attention Zoo: útil para comparar `landmark_local_attention` con otros operadores del registro NeuralOps bajo el mismo protocolo (WikiText-2, `seq_len=512`).
- Docencia y divulgación técnica: ejemplo didáctico de cómo sustituir módulos de atención en un LLM y medir el impacto en calidad con una métrica objetiva como la perplejidad.
- Pruebas de integración del framework NeuralOps: validación de la API `load_surgeried_model` y del contrato de adaptadores `QwenAttentionAdapter` en pipelines de CI.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 242,57 | No (declarado por el autor) |

Telemetría de entrenamiento declarada por el autor:

| Etapa | Valor |
|---|---|
| PPL causal previa a destilación (Stage 0) | 49261,89 |
| PPL causal posterior a destilación | 242,57 |
| Delta de perplejidad | -49019,32 |
| Stage 1 (alineación con backbone congelado) | 89 pasos (54,2 s) |
| Stage 2 (destilación multi-capa de representaciones) | 205 pasos (126,0 s) |
| Pasos totales / tiempo | 294 pasos / 180,6 s |
| VRAM pico en GPU | 21885 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1-2 GB para los pesos (0,5B parámetros) más overhead de activaciones; la telemetría de entrenamiento reporta 21885 MB de pico, pero corresponde al proceso de destilación con parámetros maestros en FP32, no a inferencia.
- GPU recomendadas para entrenamiento/reproducción: se requiere una GPU con al menos ~22 GB de VRAM para replicar el pipeline de destilación tal como se documenta (por ejemplo, A100 40 GB, H100, RTX 3090/4090 de 24 GB).
- GPU para inferencia: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs de 4-8 GB en FP16.
- Despliegue: la model card documenta el uso con `transformers` y con la API `neuralops.hub.load_surgeried_model`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos en GGUF, el despliegue con llama.cpp/Ollama no está soportado de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-landmark-local-attention-wikitext2` | 0,5B | no disponible | 242,57 (declarado) | MIT | Hugging Face (315 descargas) |
| `Qwen/Qwen2.5-0.5B` (modelo base) | 0,5B | 32768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 (según Qwen) | Hugging Face |
| Otros checkpoints del NeuralOps Qwen Attention Zoo | 0,5B | no disponible | no disponible | MIT (según repo NeuralOps) | Hugging Face |

La comparación directa con el modelo base no puede completarse porque la información proporcionada no incluye la perplejidad de `Qwen/Qwen2.5-0.5B` en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0 del base) es un dato relevante para integraciones.

## Limitaciones y advertencias

- Calidad de lenguaje muy degradada: la perplejidad de 242,57 en WikiText-2 es órdenes de magnitud superior a la de un modelo de 0,5B bien entrenado, lo que indica que el checkpoint no es apto para uso en producción.
- Modelo de investigación: el propósito declarado es validar el operador `LandmarkLocalAttention`, no servir como asistente conversacional.
- Solo inglés: la model card declara únicamente `en` como idioma soportado.
- Contexto de entrenamiento corto: la destilación se realizó con `seq_len=512`, por lo que el comportamiento en contextos largos no está validado.
- Riesgo de alucinación elevado: al tratarse de un modelo con perplejidad alta, la generación puede ser incoherente o repetitiva.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5-0.5B y entrenarse solo en WikiText-2, puede heredar sesgos del corpus y del modelo base.
- Dependencia del framework NeuralOps: la carga requiere aplicar la cirugía con `apply_qwen_attention_surgery` o usar `load_surgeried_model`; no es un checkpoint estándar de `transformers` sin ese paso.
- Sin soporte nativo de RoPE en el operador sustituido (`supports_rope: N/A`), lo que puede afectar a la extrapolación posicional.
- Licencia MIT: permite uso comercial, pero la ausencia de garantías y la baja calidad del checkpoint desaconsejan cualquier despliegue real.
- No se publican pesos en GGUF ni cuantizaciones, lo que limita el despliegue en entornos de bajo consumo.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-landmark-local-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
