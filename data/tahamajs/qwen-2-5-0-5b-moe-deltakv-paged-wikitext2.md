# tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B de Alibaba cuyo bloque de atención de decodificador ha sido sustituido quirúrgicamente por el módulo `MoEDeltaKVPagedAttention` (clave de registro `moe_deltakv_paged`) y posteriormente destilado sobre WikiText-2. El objetivo es servir de banco de pruebas reproducible para comparar mecanismos de atención subcuadrática frente a la atención cuadrática estándar de Qwen2.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only, hidden_size 896, 14 cabezas de consulta, 2 cabezas KV, head_dim 64) y aplica un patrón híbrido `hybrid_3_1`: 18 de las 24 capas usan el módulo MoE-DeltaKV-Paged y 6 capas ancla (índices 3, 7, 11, 15, 19 y 23) mantienen atención cuadrática completa. La destilación de conocimiento en dos etapas se ejecutó en 284 pasos y 180,3 segundos, con 15.119 MB de VRAM pico.

Su relevancia es fundamentalmente metodológica: demuestra un flujo de "cirugía de atención" más destilación reproducible, con telemetría detallada. Sin embargo, la perplejidad declarada en WikiText-2 (1745,31) es extremadamente alta para un modelo de este tamaño, lo que sugiere que el checkpoint no es apto para uso generativo en producción y debe interpretarse como un artefacto de investigación sobre atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida: 18/24 capas con `MoEDeltaKVPagedAttention` y 6 capas ancla cuadráticas (patrón `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el autor no declara recuento exacto tras la cirugía) |
| Parametros activos | no disponible (el módulo se denomina MoE, pero no se publica número de expertos ni parámetros activos) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`; no se declara ventana máxima) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP16; no hay GGUF ni AWQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,59 MB; `attention_weights.safetensors` 86,38 MB) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA 7:1), `head_dim=64`. Sobre esa base se aplica `QwenAttentionAdapter`, que sustituye las proyecciones `Qwen2Attention` por el módulo `MoEDeltaKVPagedAttention`, con expansión automática de cabezas KV (7x) donde es necesario y un contrato de "Single-`o_proj` bypass". El módulo soporta atención causal, bidireccional, cross-attention, GQA nativa y operador de atención personalizado; no declara soporte RoPE explícito. Tiene dos rutas de ejecución: atención densa completa cuando `num_pages <= 1` (o `page_size >= seq_len`) o cuando `enable_moe=False`, y atención MoE paginada en caso contrario.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado, `lm_head` bypassado) usó MSE y coseno sobre estados ocultos con peso 0,25 durante 86 pasos (54,5 s); la etapa 2 (destilación de representación multicapa) usó MSE y coseno con peso 0,50 durante 198 pasos (125,4 s). En total, 284 pasos y 180,3 s con FP16 autocast y parámetros maestros en FP32, alcanzando 15.119 MB de VRAM pico. La perplejidad pre-KD y post-KD es idéntica (1745,31, delta +0,00), lo que indica que la destilación no mejoró la métrica declarada.

## Capacidades

- Generación de texto causal autorregresiva (pipeline `text-generation`).
- Soporte de atención bidireccional y cross-attention a nivel de módulo.
- Soporte nativo de GQA con expansión de cabezas KV.
- Operador de atención personalizado (`is_custom_attention=True`) con paginación y ruta MoE opcional.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en mecanismos de atención subcuadrática: sirve como referencia reproducible para comparar `moe_deltakv_paged` frente a atención cuadrática estándar bajo el mismo backbone y dataset.
- Reproducción de experimentos de cirugía de atención: el flujo `apply_qwen_attention_surgery` con patrón `hybrid_3_1` permite replicar la sustitución capa a capa y validar la telemetría publicada.
- Estudio de destilación de conocimiento en dos etapas: la separación entre alineación con backbone congelado y destilación multicapa es un caso práctico para analizar estrategias de KD con presupuesto reducido (284 pasos, 180 s).
- Benchmark de eficiencia de memoria: con 15.119 MB de VRAM pico en FP16, es útil para calibrar requisitos de memoria de atención paginada en GPUs de gama media.
- Docencia y formación técnica: ejemplo didáctico de cómo se sustituye un módulo de atención en un transformer existente sin reentrenar desde cero.
- Validación de contratos de adaptadores (`QwenAttentionAdapter`, Single-`o_proj` bypass): útil para desarrolladores que implementen adaptadores propios en el registro `ATTENTION_REGISTRY` de NeuralOps.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext, wikitext-2-raw-v1, validation | Perplexity | 1745,31 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras tareas en la informacion disponible. La telemetría de entrenamiento indica perplejidad pre-KD de 1745,31 y post-KD de 1745,31 (delta +0,00), es decir, sin mejora medible tras la destilación.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento usó 15.119 MB en FP16 con parámetros maestros FP32; para inferencia pura en FP16 se espera un consumo notablemente inferior (el checkpoint pesa ~1 GB), aunque el autor no publica cifra de inferencia.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder cargar los pesos en FP16.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, dado el tamaño de ~1 GB de pesos.
- Opciones de despliegue: el modelo requiere la librería `neuralops` y el flujo `apply_qwen_attention_surgery`; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2` | 0,5 B | no disponible | 1745,31 (declarada) | MIT | Hugging Face, libreria `neuralops` |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32.768 tokens (según ficha oficial de Qwen) | no disponible en la informacion proporcionada | Apache 2.0 (según ficha oficial de Qwen) | Hugging Face, transformers |
| Otros checkpoints del "Attention Zoo" de NeuralOps | no disponible | no disponible | no disponible | MIT (presumible por el repo) | Hugging Face |

La comparativa se limita al modelo base por falta de datos publicados de alternativas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- Perplejidad extremadamente alta (1745,31) en WikiText-2: indica una calidad generativa muy pobre, no apta para producción.
- La destilación no mejoró la métrica (delta +0,00), lo que cuestiona la eficacia del pipeline de KD en esta configuración.
- Solo soporta inglés según la model card.
- No se declara longitud de contexto máxima; el entrenamiento usó `seq_len=512`.
- Requiere la librería `neuralops` y el flujo de cirugía de atención; no es un checkpoint estándar cargable solo con `transformers` sin aplicar la sustitución.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Uso comercial: la licencia MIT lo permite, pero el estado experimental y la baja calidad desaconsejan su uso en producción.
- El módulo se etiqueta como MoE pero no se publican número de expertos ni parámetros activos, lo que impide auditar su comportamiento real.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
