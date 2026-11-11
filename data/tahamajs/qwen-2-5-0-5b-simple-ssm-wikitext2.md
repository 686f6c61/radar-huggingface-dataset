# tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por bloques `simple_ssm` (Simplified State Space Attention Block) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de propósito general competitivo, sino servir como banco de pruebas reproducible para estudiar la viabilidad de arquitecturas de atención subcuadrática mediante destilación de conocimiento sobre un modelo denso ya entrenado.

El autor es `tahamajs`, desarrollador del framework NeuralOps, y el ajuste se ha realizado exclusivamente sobre WikiText-2 (`wikitext-2-raw-v1`), con un proceso de destilación en dos etapas de solo 53 pasos de optimización y 181,1 segundos de cómputo total. El resultado es un modelo de 0,5 mil millones de parámetros con licencia MIT, pensado para investigación en eficiencia de atención y no para despliegue en producción.

La relevancia actual radica en que documenta de forma transparente la penalización de perplejidad asociada al reemplazo de atención cuadrática por SSM: la perplejidad final en validación es de 12.092,24, muy lejos de la del modelo base, lo que ilustra tanto el potencial del enfoque como sus limitaciones con un presupuesto de entrenamiento tan reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Qwen2 con 18/24 capas reemplazadas por `simple_ssm`, patrón `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 77,26 MB) |
| Hidden size | 896 |
| Cabeceras de atención | 14 query heads, 2 KV heads, `head_dim=64` |
| Capas con atención completa preservada | 6/24 (índices 3, 7, 11, 15, 19, 23) |
| Librería | `neuralops` |
| Modelo base | `Qwen/Qwen2.5-0.5B` |

## Arquitectura y entrenamiento

La arquitectura parte del decoder Qwen2.5-0.5B y aplica una "cirugía" de atención mediante `QwenAttentionAdapter`: se sustituyen 18 de las 24 capas de atención cuadrática por bloques `simple_ssm`, manteniendo 6 capas de anclaje con atención completa en los índices `[3, 7, 11, 15, 19, 23]` bajo el patrón intercalado `hybrid_3_1`. El adaptador mapea las proyecciones originales (14 cabeceras query, 2 KV, `head_dim=64`, `hidden_size=896`) con expansión automática 7x de las cabeceras KV y respeta el contrato de un único `o_proj`. `SimpleSSM` soporta causalidad, bidireccionalidad y cross-attention, pero no GQA nativo ni RoPE (marcado como `N/A`).

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2. La etapa 0 (post-cirugía, sin ajuste) arroja una perplejidad causal de 912.875,13. La etapa 1 (alineación con backbone congelado, `lm_head` desactivado, MSE + coseno por capa con peso 0,25) ejecuta 16 pasos en 54,7 s. La etapa 2 (destilación de representaciones multicapa, MSE + coseno con peso 0,50) ejecuta 37 pasos en 126,1 s. En total, 53 pasos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando una VRAM pico de 11.207 MB en FP16 con autocast y parámetros maestros en FP32. El resultado final es una perplejidad de 12.092,24, una reducción de 900.782,89 puntos respecto al estado post-cirugía.

## Capacidades

- Generación de texto autoregresiva causal (tarea declarada: `text-generation`).
- Soporte bidireccional a nivel de módulo `simple_ssm` (aunque el checkpoint se distribuye para uso causal).
- Soporte de cross-attention a nivel de módulo.
- Conversación: el pipeline declarado incluye la etiqueta `conversational`, aunque no hay evidencia de ajuste conversacional específico.
- Capacidad multilingüe: limitada a inglés según la model card.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Modo thinking, visión o audio: no disponible.
- Conocimiento general: severamente degradado por la perplejidad de 12.092,24 en WikiText-2; no es fiable para tareas de conocimiento factual.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint sirve como referencia reproducible para medir el coste de sustituir atención cuadrática por SSM en un modelo denso ya entrenado, con telemetría detallada de perplejidad antes y después de la destilación.
- Reproducción de experimentos de destilación: los scripts y métricas (`training_metrics.json`, 368 B) permiten replicar las dos etapas de KD con 53 pasos y ~11 GB de VRAM, útil para validar metodologías de alineación de capas.
- Benchmark de frameworks de atención: integrable en el `ATTENTION_REGISTRY` de NeuralOps para comparar `simple_ssm` frente a otras alternativas (lineal, sparse, etc.) bajo el mismo protocolo de cirugía.
- Estudio de patrones híbridos: el layout `hybrid_3_1` con 6 capas de anclaje permite analizar el equilibrio entre atención completa y SSM en modelos pequeños.
- Docencia y divulgación: ejemplo didáctico de cómo se degrada y recupera la perplejidad al reemplazar bloques de atención, con cifras concretas y pasos reproducibles.
- Prototipado de pipelines de generación con `transformers`: el snippet de la model card permite cargar el modelo base, aplicar la cirugía y ejecutar `generate` en pocas líneas, útil para pruebas de integración.
- Validación de infraestructura de entrenamiento: el consumo pico de 11.207 MB permite probar flujos de KD en GPUs de gama media-alta antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-simple-ssm-wikitext2 | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplejidad | 12.092,24 |
| qwen-2.5-0.5b-simple-ssm-wikitext2 (post-cirugía, pre-KD) | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplejidad | 912.875,13 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El único dato verificado es la perplejidad en WikiText-2, marcada como `verified: false` en el model-index.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint de atención pesa 77,26 MB, pero requiere cargar el modelo base Qwen2.5-0.5B completo (aproximadamente 1 GB en FP16). La inferencia completa en FP16 requiere del orden de 2-3 GB de VRAM incluyendo activaciones y caché KV.
- VRAM para entrenamiento/destilación: 11.207 MB pico según la telemetría del autor (FP16 autocast con parámetros maestros FP32).
- GPU recomendadas para entrenamiento: cualquier GPU con ≥12 GB de VRAM; una RTX 3090, RTX 4090, A10G o A100 son suficientes.
- GPU para inferencia: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores; también en GPUs con 4-6 GB si se cuantiza el modelo base (aunque no se distribuyen pesos cuantizados).
- Opciones de despliegue: `transformers` con el script de cirugía de NeuralOps es la vía documentada. No hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura híbrida requiere el adaptador `QwenAttentionAdapter` y no es un transformer estándar.
- Latencia y throughput: no disponibles. La arquitectura híbrida con SSM podría reducir el coste de atención en secuencias largas, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-simple-ssm-wikitext2 | 0,5 B | No disponible | 12.092,24 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 tokens (según ficha oficial de Qwen) | No disponible en esta información | Apache 2.0 | Hugging Face |
| Modelos SSM puros tipo Mamba-130M/370M | 0,13-0,37 B | No disponible | No disponible | Apache 2.0 | Hugging Face |

La comparación directa con el modelo base Qwen2.5-0.5B no es posible con los datos aportados, ya que no se incluye su perplejidad en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0 del base) y la naturaleza experimental del checkpoint lo sitúan en una categoría distinta: no compite como modelo de propósito general, sino como artefacto de investigación.

## Limitaciones y advertencias

- Perplejidad de 12.092,24 en WikiText-2: órdenes de magnitud por encima de lo esperable en un modelo de 0,5 B bien ajustado, lo que indica una calidad de generación muy baja y alto riesgo de texto incoherente.
- Entrenamiento limitado a 53 pasos y 181,1 s: el presupuesto de optimización es mínimo, por lo que la destilación no recupera la mayor parte de la capacidad perdida en la cirugía.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Contexto de entrenamiento de 512 tokens: no se documenta la longitud de contexto efectiva en inferencia; usar secuencias largas puede degradar aún más la calidad.
- Sin datos de sesgos, alucinación o robustez: no se han publicado evaluaciones de seguridad, sesgo o fidelidad factual.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B está bajo Apache 2.0, por lo que conviene verificar la compatibilidad de ambas licencias en un despliegue derivado.
- Dependencia del framework NeuralOps: la carga requiere `apply_qwen_attention_surgery` del repositorio `tahamajs/NeuralOps`; no es un checkpoint autónomo cargable con `AutoModelForCausalLM.from_pretrained` directamente.
- Solo se distribuyen pesos de atención (`attention_weights.safetensors`); el resto de pesos debe tomarse del modelo base, lo que añade un paso de integración y posibles incompatibilidades de versión.
- No apto para producción: sin benchmarks de tareas, sin evaluación de tool calling ni de agentes, y con calidad de generación no validada.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
