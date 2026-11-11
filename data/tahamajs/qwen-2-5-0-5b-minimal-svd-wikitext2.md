# tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención del decoder por el módulo `MinimalSVDAttention`, una atención factorizada de bajo rango basada en SVD, perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de propósito general competitivo, sino servir como banco de pruebas reproducible para investigar atenciones subcuadráticas y técnicas de destilación de conocimiento sobre arquitecturas transformer estándar.

El modelo conserva el tokenizador, el `lm_head` y el resto de pesos del Qwen2.5-0.5B original, y solo reemplaza 18 de las 24 capas de atención (patrón híbrido 3:1), manteniendo 6 capas con atención cuadrática completa como anclas en los índices `[3, 7, 11, 15, 19, 23]`. Tras el reemplazo, el modelo colapsa (perplejidad de 510 683 en WikiText-2) y se recupera mediante un pipeline de destilación de conocimiento en dos etapas hasta alcanzar una perplejidad de 242,01 en el split de validación de `wikitext-2-raw-v1`.

Es relevante ahora como ejemplo abierto y ligero (menos de 1 GB de pesos) de cómo evaluar el coste y la recuperabilidad de intervenciones arquitectónicas en modelos pequeños, con telemetría completa de entrenamiento (pasos, tiempos, VRAM pico) publicada por el autor. No debe confundirse con un modelo listo para producción: la perplejidad final es muy superior a la del Qwen2.5-0.5B base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion `MinimalSVDAttention` (SVD-factorizada de bajo rango) en 18/24 capas; 6 capas con atencion cuadratica completa como anclas |
| Parametros totales | no disponible (heredados de Qwen2.5-0.5B, ~0,49 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 917,45 MB + `attention_weights.safetensors` 59,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de query, 2 cabezas KV (GQA 14:2) y `head_dim=64`. Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye las proyecciones de atención por el módulo `MinimalSVDAttention` en 18 de las 24 capas, siguiendo el patrón `hybrid_3_1` (3 capas transplantadas por cada capa cuadrática preservada). El módulo soporta atención causal, bidireccional, cross-attention y GQA nativo, e impone un contrato de `o_proj` única. Se conservan como anclas cuadráticas las capas `[3, 7, 11, 15, 19, 23]`.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineamiento con backbone congelado) dura 130 pasos (54,4 s) y usa MSE + coseno sobre estados ocultos por capa con peso 0,25, con el `lm_head` puenteado. La etapa 2 (destilación multi-capa de representaciones) dura 298 pasos (125,8 s) con peso 0,50. En total, 428 pasos en 180,5 s con un pico de VRAM de 15 507 MB en FP16 autocast con parámetros maestros del estudiante en FP32. La perplejidad causal pasa de 510 683,39 (post-cirugía, zero-shot) a 242,01 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del Qwen2.5-0.5B base.
- Atención causal, bidireccional y cross-attention a nivel de módulo (`MinimalSVDAttention`).
- Soporte nativo de GQA (14 cabezas query, 2 cabezas KV) con expansión automática 7x donde se requiere.
- Compatible con `transformers` mediante `AutoModelForCausalLM` tras aplicar la cirugía con `apply_qwen_attention_surgery`.
- Capacidad de servir como banco de pruebas para comparar atenciones subcuadráticas frente a atención cuadrática estándar.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en atenciones subcuadráticas: el checkpoint permite medir el coste real (en perplejidad) de sustituir atención cuadrática por `MinimalSVDAttention` en un modelo pequeño, usando la telemetría publicada como referencia reproducible.
- Estudio de destilación de conocimiento post-cirugía: la separación en dos etapas (alineamiento con backbone congelado y destilación multi-capa) sirve para evaluar qué técnicas recuperan mejor el rendimiento tras una intervención arquitectónica agresiva.
- Benchmark de recuperabilidad arquitectónica: útil para comparar distintos patrones de hibridación (por ejemplo, `hybrid_3_1` frente a otros) midiendo perplejidad en WikiText-2 con el mismo pipeline.
- Prototipado de módulos de atención en el ecosistema NeuralOps: el modelo actúa como referencia para validar `QwenAttentionAdapter` y el contrato de `o_proj` única antes de escalar a modelos mayores.
- Docencia y divulgación: ejemplo ligero (menos de 1 GB) que ilustra cómo una intervención quirúrgica en atención degrada y luego recupera parcialmente un modelo, con métricas completas de entrenamiento.
- Pruebas de integración en pipelines de `transformers`: sirve para verificar que el flujo de carga (`from_pretrained` + cirugía) funciona en entornos de CI antes de aplicarlo a checkpoints más grandes.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 242,01 |
| WikiText-2 (post-cirugia, zero-shot) | Perplejidad | 510 683,39 |
| WikiText-2 (tras KD) | Delta de perplejidad | -510 441,38 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 15 507 MB de pico en FP16 con parámetros maestros en FP32. Para inferencia en FP16 el modelo (~0,5 B parámetros) debería caber holgadamente en GPUs de consumo, pero no se ha publicado una medición específica.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente en FP16, aunque no está verificado por el autor.
- Cabe en GPU de consumo: previsiblemente sí (tamaño de pesos de ~977 MB en safetensors), pero no confirmado.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` tras aplicar `apply_qwen_attention_surgery`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2` | ~0,49 B (heredados) | no disponible | 242,01 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,49 B | 32 768 tokens (según ficha oficial de Qwen) | no disponible en esta busqueda | Apache 2.0 | Hugging Face |
| Otros checkpoints del Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (según repo) | Hugging Face |

La comparación directa con el Qwen2.5-0.5B original no es posible con los datos proporcionados, ya que no se incluye su perplejidad en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0 del base) es relevante para uso comercial.

## Limitaciones y advertencias

- La perplejidad de 242,01 en WikiText-2 es muy alta para un modelo de este tamaño; el checkpoint no es apto para uso en producción como generador de texto.
- El modelo solo declara soporte de inglés (`en`); no se garantiza calidad en otros idiomas.
- Entrenado exclusivamente sobre WikiText-2, un corpus pequeño y de dominio limitado; el riesgo de sobreajuste a ese dominio y de alucinación fuera de él es elevado.
- La cirugía reemplaza 18 de 24 capas de atención; el comportamiento puede divergir del Qwen2.5-0.5B base de forma no trivial.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.
- Aunque la licencia es MIT, el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0; conviene revisar la compatibilidad de ambas para uso comercial.
- La librería declarada (`neuralops`) no es estándar; la carga requiere `transformers` más el código de cirugía del repositorio NeuralOps, lo que añade fricción de integración.
- Los resultados de benchmarks están marcados como `verified: false` en el `model-index`; no han sido validados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
