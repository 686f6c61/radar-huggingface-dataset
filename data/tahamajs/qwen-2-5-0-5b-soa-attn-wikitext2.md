# tahamajs/qwen-2.5-0.5b-soa-attn-wikitext2

## Resumen

`qwen-2.5-0.5b-soa-attn-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Qwen Attention Zoo. No es un modelo nuevo entrenado desde cero, sino un Qwen2.5-0.5B (Qwen) cuya atención de decodificador ha sido quirúrgicamente sustituida por el módulo `soa_attn` (Shared Orthogonal Attention) del registro `ATTENTION_REGISTRY` de NeuralOps, un mecanismo de atención subcuadrática con cuellos de botella latentes por proyección.

El objetivo del experimento es demostrar que es posible reemplazar la atención cuadrática estándar de un transformer preentrenado por una alternativa subcuadrática y recuperar buena parte de la calidad original mediante destilación de conocimiento en dos etapas, usando únicamente WikiText-2 como corpus de ajuste. Tras la cirugía, la perplejidad causal se dispara a 231381,18 y, después de 451 pasos de destilación (unos 180 segundos), se recupera hasta 108,86 en la validación de `wikitext-2-raw-v1`.

Es relevante para investigadores que trabajan en eficiencia de atención: ofrece un artefacto reproducible (solo pesos de atención, 79,27 MB) que permite estudiar el impacto de la atención subcuadrática en un modelo pequeño y bien conocido. No es un modelo listo para producción: es un checkpoint de investigación con capacidades degradadas respecto al Qwen2.5-0.5B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `soa_attn` y 6/24 capas con atención cuadrática completa |
| Parametros totales | no disponible (el modelo base Qwen2.5-0.5B tiene 0,49B; el repo solo publica pesos de atención de 79,27 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors FP16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` y aplica una cirugía de atención con patrón `hybrid_3_1`: se sustituyen 18 de las 24 capas del decodificador por `soa_attn`, conservando 6 capas ancla con atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]`. El adaptador `QwenAttentionAdapter` mapea las proyecciones originales (14 cabezas de query, 2 de KV, `head_dim=64`, `hidden_size=896`) con expansión 7x de cabezas KV donde es necesario y un contrato de `o_proj` único. `SOAAttention` factoriza las proyecciones densas Q, K y V en pares de cuello de botella de bajo rango inicializados mediante SVD truncada a partir de los pesos preentrenados. El módulo soporta atención causal, bidireccional, cross-attention y GQA nativo.

El entrenamiento consiste en destilación de conocimiento en dos etapas sobre WikiText-2: una primera etapa de alineación con backbone congelado (137 pasos, 54,4 s) con MSE y coseno sobre estados ocultos por capa (peso 0,25) y `lm_head` desactivado, y una segunda de destilación multi-capa (314 pasos, 125,7 s, peso 0,50). En total, 451 pasos en 180,4 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 15788 MB en FP16 autocast con parámetros maestros FP32. La perplejidad pasa de 231381,18 (etapa 0, cero-shot tras la cirugía) a 108,86.

## Capacidades

- Generación de texto causal autorregresiva en inglés, con calidad degradada respecto al modelo base.
- Atención subcuadrática en 18 de 24 capas, lo que reduce el coste teórico frente a atención cuadrática completa en secuencias largas.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (`SOAAttention`), aunque el checkpoint se distribuye para uso causal.
- Soporte nativo de GQA (14 cabezas de query, 2 de KV) en las capas adaptadas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Multilingüe: no disponible; el modelo declara únicamente `en`.
- No es un modelo instruct ni chat: el checkpoint no incluye ajuste conversacional específico más allá del heredado del base.

## Casos de uso

- Investigación en atención eficiente: permite medir empíricamente el coste de sustituir atención cuadrática por `soa_attn` en un transformer preentrenado, comparando perplejidad y comportamiento con el Qwen2.5-0.5B original.
- Reproducción de experimentos de cirugía de atención: el script de quick start y los pesos de 79,27 MB permiten replicar el pipeline de sustitución y destilación en una GPU de consumo.
- Estudio de destilación de conocimiento post-cirugía: sirve para analizar cómo la destilación por capas (MSE + coseno sobre estados ocultos) recupera calidad tras una modificación arquitectónica agresiva.
- Benchmarking de módulos de atención: útil como punto de comparación dentro del Attention Zoo de NeuralOps frente a otros mecanismos del registro.
- Prototipado de modelos pequeños para generación de texto en inglés con requisitos de memoria reducidos: el checkpoint completo cabe en GPUs de consumo, aunque la calidad es limitada.
- Docencia y divulgación: ejemplo didáctico de cómo se aplica SVD truncada para inicializar proyecciones de bajo rango y cómo se mide la recuperación vía perplejidad en WikiText-2.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 108,86 |

Telemetría de entrenamiento reportada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Etapa 0 (post-cirugía, cero-shot) | Perplejidad causal | 231381,18 |
| Etapa 1 (alineación, backbone congelado) | Pasos / tiempo | 137 / 54,4 s |
| Etapa 2 (destilación multi-capa) | Pasos / tiempo | 314 / 125,7 s |
| Total | Pasos / tiempo | 451 / 180,4 s |
| Total | VRAM pico | 15788 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en GPUs de 4-8 GB. El entrenamiento reportado usó 15788 MB por el estado del optimizador y parámetros maestros FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16 (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para reproducir el entrenamiento se necesitan al menos 16 GB.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores.
- Opciones de despliegue: el modelo requiere la librería `neuralops` y el script `apply_qwen_attention_surgery` para reconstruir la arquitectura; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin portar el módulo `SOAAttention`. El quick start usa `transformers` + `safetensors` + `huggingface_hub`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-soa-attn-wikitext2` | ~0,49B (base) | no disponible | 108,86 | MIT | Hugging Face (pesos de atención) |
| `Qwen/Qwen2.5-0.5B` | 0,49B | 32768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,49B | 32768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa de perplejidad con el base no es posible con los datos proporcionados, ya que no se incluye la perplejidad del Qwen2.5-0.5B original en WikiText-2. El checkpoint destilado presenta una perplejidad de 108,86, valor que en modelos de este tamaño sugiere una calidad de modelado de lenguaje claramente inferior a la del base original.

## Limitaciones y advertencias

- Checkpoint de investigación, no de producción: la perplejidad de 108,86 en WikiText-2 indica una calidad de generación degradada frente al Qwen2.5-0.5B original.
- Solo se ha ajustado sobre WikiText-2, un corpus enciclopédico en inglés; el dominio y el idioma están muy acotados.
- El modelo declara únicamente inglés (`en`); no hay evidencia de capacidades multilingües.
- No incluye ajuste instruct ni de preferencias (RLHF/DPO) específico; el uso conversacional no está garantizado.
- Requiere la librería `neuralops` y aplicar la cirugía de atención antes de cargar los pesos; no es plug-and-play con `transformers` estándar.
- Riesgo de alucinación elevado por el tamaño reducido y la degradación post-cirugía.
- Sesgos: no documentados por el autor; hereda los del corpus WikiText-2 y del base Qwen2.5-0.5B.
- Licencia MIT permite uso comercial, pero la calidad y la naturaleza experimental del checkpoint desaconsejan su uso en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- Los benchmarks están marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-soa-attn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o demo adicionales: no disponible
