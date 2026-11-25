# tahamajs/qwen-2.5-0.5b-svd-compressed-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-svd-compressed-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el módulo `svd_compressed` (`SVDCompressedAttention`) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo desarrolla el usuario tahamajs como parte del "Qwen Attention Zoo", una línea de trabajo centrada en explorar arquitecturas de atención subcuadrática y su viabilidad mediante destilación de conocimiento. No es un modelo entrenado desde cero, sino un injerto de atención sobre un backbone preentrenado.

El modelo parte de los 0,5 mil millones de parámetros del Qwen2.5-0.5B original (arquitectura transformer decoder-only con GQA, 24 capas, 14 cabezas de consulta y 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y reemplaza 18 de las 24 capas de atención por proyecciones SVD truncadas con adaptadores LoRA entrenables, conservando 6 capas cuadráticas completas como anclas. El proceso de recuperación se realiza en dos etapas de destilación de conocimiento sobre WikiText-2, partiendo de una perplejidad catastrófica tras la cirugía (335030,92) y llegando a 195,39 en validación.

Su relevancia es fundamentalmente metodológica: demuestra que es posible sustituir mecánicamente módulos de atención en un LLM preentrenado y recuperar un comportamiento lingüístico mínimamente funcional con un coste de entrenamiento muy bajo (291 pasos, 180 segundos, 17,7 GB de VRAM pico). No obstante, la perplejidad final está muy lejos de la del modelo base, por lo que debe considerarse una prueba de concepto de investigación, no un modelo listo para producción. El repositorio solo contiene los pesos de atención (64,25 MB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `SVDCompressedAttention` (SVD truncada + LoRA + GQA + RoPE) y 6/24 capas con atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados del base Qwen2.5-0.5B); el repo solo distribuye pesos de atención (64,25 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el base Qwen2.5-0.5B soporta hasta 32 768 tokens, pero no se declara para este checkpoint) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`); requiere el base Qwen2.5-0.5B en `transformers` para cargarse |

## Arquitectura y entrenamiento

El modelo mantiene la topología del Qwen2.5-0.5B (24 capas, GQA con 14 cabezas de consulta y 2 cabezas KV, `head_dim=64`, `hidden_size=896`, RoPE) pero aplica un patrón de cirugía `hybrid_3_1`: por cada tres capas consecutivas, una conserva atención cuadrática completa y las otras dos se sustituyen por `SVDCompressedAttention`. Las capas ancla son las de índices `[3, 7, 11, 15, 19, 23]`. El módulo `SVDCompressedAttention` implementa atención multi-cabeza con proyecciones SVD truncadas, adaptadores LoRA entrenables, soporte nativo de GQA (con expansión automática 7x de cabezas KV cuando es necesario), soporte de RoPE y residuales dispersos opcionales. El `QwenAttentionAdapter` garantiza el contrato de bypass de `o_proj` único.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado) ejecuta 88 pasos en 54,4 s con `lm_head` desactivado y pérdida MSE + coseno a nivel de capa (peso 0,25). La etapa 2 (destilación de representaciones multicapa) ejecuta 203 pasos en 125,4 s con peso 0,50. En total, 291 pasos y 180,2 s de optimización, con 17 729 MB de VRAM pico en FP16 autocast y parámetros maestros del estudiante en FP32. La perplejidad causal pasa de 335030,92 (baseline cero tras la cirugía) a 195,39 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva en inglés, condicionada al backbone Qwen2.5-0.5B subyacente.
- El módulo de atención soporta atención causal, bidireccional y cross-attention a nivel de implementación.
- Soporte nativo de GQA y RoPE en el módulo `SVDCompressedAttention`.
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo "thinking", visión, audio ni otras capacidades especiales.
- Capacidad multilingüe: solo inglés declarado.
- No se declara soporte de decodificación especulativa ni otras optimizaciones de inferencia.

## Casos de uso

- Investigación en eficiencia de atención: servir como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por proyecciones SVD truncadas en un transformer preentrenado, comparando perplejidad antes y después de la cirugía.
- Estudio de destilación de conocimiento post-cirugía: el par de etapas (alineación con backbone congelado y destilación multicapa) es un protocolo replicable para otros modelos y patrones de atención del `ATTENTION_REGISTRY`.
- Experimentos académicos de atención subcuadrática: permite evaluar empíricamente si un patrón híbrido 3:1 con anclas cuadráticas preserva suficiente capacidad lingüística frente a una sustitución total.
- Generación de texto de baja exigencia en inglés: dado su tamaño (0,5 B) y su perplejidad de 195,39, puede usarse para prototipos de completado de texto donde la calidad no sea crítica y el objetivo sea validar un pipeline de inferencia con pesos quirúrgicos.
- Validación de la API `neuralops.hub.load_surgeried_model`: sirve como caso de prueba para el cargador universal del ecosistema NeuralOps y para verificar la compatibilidad del `QwenAttentionAdapter`.
- Reproducción de telemetría de entrenamiento: los artefactos (`training_metrics.json`, 372 B) y los tiempos declarados permiten reproducir el experimento en una sola GPU consumer de gama alta con ~18 GB de VRAM.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validación) | Perplejidad | 195,39 |
| WikiText-2 (baseline tras cirugía, etapa 0) | Perplejidad | 335030,92 |
| Delta de perplejidad tras destilación | Δ PPL | -334835,54 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento requirió 17 729 MB en FP16 con parámetros maestros FP32, por lo que la inferencia en FP16 debería caber holgadamente en GPUs con 8-12 GB.
- GPU recomendadas para entrenamiento: una GPU con al menos ~18 GB de VRAM (RTX 4090, A100, H100). Para inferencia, cualquier GPU consumer moderna con 8 GB o más.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` (requerido para cargar el base Qwen2.5-0.5B y aplicar la cirugía), `neuralops.hub.load_surgeried_model`, y el script `scripts.benchmarks.qwen_zoo_train_mix.apply_qwen_attention_surgery`. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el módulo de atención es personalizado (`is_custom_attention: Yes`) y no está integrado en esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-compressed-wikitext2` | 0,5 B | No disponible | MIT | safetensors (solo atención) | Checkpoint experimental con atención SVD comprimida; PPL 195,39 en WikiText-2 |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32 768 tokens (según Qwen2.5) | Apache 2.0 (según Qwen2.5) | safetensors, GGUF | Modelo base original, sin cirugía; PPL en WikiText-2 no disponible en la información proporcionada |
| Otros checkpoints del "Qwen Attention Zoo" (NeuralOps) | 0,5 B | No disponible | MIT (presumible) | safetensors | No se dispone de datos concretos en la información proporcionada |

No se dispone de datos de benchmarks comparativos directos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad de 195,39 en WikiText-2 es muy superior a la de un modelo de 0,5 B bien entrenado, lo que indica una calidad de generación degradada respecto al base Qwen2.5-0.5B.
- El repositorio solo contiene los pesos de atención (64,25 MB); es imprescindible descargar el base `Qwen/Qwen2.5-0.5B` y aplicar la cirugía con el script de NeuralOps para poder ejecutarlo.
- Requiere la librería `neuralops` y código personalizado (`apply_qwen_attention_surgery`), lo que limita su portabilidad a runtimes estándar como vLLM, llama.cpp u Ollama.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No se declaran capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse que las herede del base.
- Riesgo elevado de alucinación y de texto incoherente dada la perplejidad reportada.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B y entrenarse solo en WikiText-2, puede heredar sesgos del base y del corpus.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según Qwen2.5) que debe respetarse por separado.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-compressed-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
