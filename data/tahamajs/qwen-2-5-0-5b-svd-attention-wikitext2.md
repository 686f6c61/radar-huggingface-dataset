# tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decoder por un mecanismo de atención lineal comprimido mediante SVD de bajo rango, denominado `SVDLinearAttention` y registrado como `svd_attention` dentro del catálogo `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es `tahamajs`, y el modelo se distribuye con licencia MIT.

El objetivo del experimento es evaluar la viabilidad de sustituir atención cuadrática por atención subcuadrática en un transformer preentrenado pequeño, midiendo la degradación y la recuperación mediante destilación de conocimiento en dos etapas. La topología de sustitución es híbrida `hybrid_3_1`: 18 de las 24 capas del decoder se reemplazan por `svd_attention`, mientras que 6 capas cuadráticas completas se conservan como anclas en los índices `[3, 7, 11, 15, 19, 23]`.

El resultado es un artefacto de investigación, no un modelo listo para producción: la perplejidad final en WikiText-2 es de 7538.02, órdenes de magnitud por encima de la del modelo base, lo que refleja que la destilación solo ha recuperado parcialmente la capacidad perdida tras la cirugía (partiendo de 7.751.147,47). Es relevante como referencia metodológica para quienes investigan atención eficiente y transferencia de atención en modelos ya entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SVDLinearAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados del base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero la model card no declara contexto efectivo tras la cirugia) |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 en el script de ejemplo) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 88,25 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA 14:2) y `head_dim=64`. Sobre esa base se aplica una cirugía de atención mediante `QwenAttentionAdapter`, que sustituye 18 capas por `SVDLinearAttention` (atención lineal comprimida por SVD de bajo rango) y conserva 6 capas cuadráticas completas como anclas en los índices `[3, 7, 11, 15, 19, 23]`. El módulo declara soporte de atención causal, bidireccional, cross-attention y GQA nativo, pero no de RoPE.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (baseline cero-shot tras la cirugía) arroja una perplejidad causal de 7.751.147,47. La etapa 1 (alineación con backbone congelado) ejecuta 139 pasos en 54,2 s con `lm_head` desactivado y pérdida MSE/coseno por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa) ejecuta 319 pasos en 125,6 s con pesos MSE/coseno de 0,50. En total: 458 pasos, 180,1 s, `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 12.969 MB en FP16 con parámetros maestros en FP32.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada estructuralmente del base Qwen2.5-0.5B.
- Atención causal, bidireccional y cross-attention a nivel de módulo (`SVDLinearAttention`).
- Soporte nativo de GQA con expansión automática 7x de cabezas KV en el adaptador.
- Compatibilidad con el contrato de bypass de `o_proj` único.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe: limitada a inglés según la model card.
- Capacidad generativa práctica severamente degradada por la perplejidad final (7538.02).

## Casos de uso

- Investigación en atención eficiente: el checkpoint sirve como referencia reproducible para medir el coste de sustituir atención cuadrática por atención lineal SVD en un transformer preentrenado, con telemetría completa de perplejidad antes y después de la destilación.
- Estudio de destilación de conocimiento post-cirugía: las dos etapas documentadas (alineación con backbone congelado y destilación multicapa) permiten replicar el protocolo sobre otros modelos y comparar deltas de perplejidad.
- Benchmark de módulos de atención: al integrarse en el `ATTENTION_REGISTRY` de NeuralOps, el artefacto permite comparar `svd_attention` frente a otros mecanismos del catálogo bajo la misma topología `hybrid_3_1`.
- Validación de adaptadores GQA: el `QwenAttentionAdapter` con expansión 7x de cabezas KV y contrato de `o_proj` único puede probarse de forma aislada sobre este checkpoint antes de aplicarlo a modelos mayores.
- Docencia y divulgación: ilustra de forma cuantitativa qué ocurre al trasplantar atención en un modelo entrenado sin reentrenamiento completo, con cifras concretas de perplejidad y coste de cómputo (458 pasos, 180 s, 12,9 GB de VRAM).
- Pruebas de integración de la librería `neuralops`: el script de inicio rápido del README permite verificar la carga de pesos safetensors y la aplicación de la cirugía en pipelines de CI.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad causal | 7538.02 |
| WikiText-2 (baseline cero-shot post-cirugia, etapa 0) | Perplejidad causal | 7.751.147,47 |
| WikiText-2 (delta de recuperacion) | Δ perplejidad | -7.743.609,45 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. No se dispone de comparación numérica con el modelo base Qwen2.5-0.5B en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió un pico de 12.969 MB con FP16 y parámetros maestros FP32; en inferencia pura en FP16 el modelo de 0,5B requiere aproximadamente 1-2 GB, aunque no se documenta una medición específica.
- GPU recomendadas para entrenamiento/replicación: cualquier GPU con al menos 16 GB de VRAM (el pico registrado fue de 12,9 GB).
- GPU para inferencia: cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090; también en CPU.
- Opciones de despliegue: el README documenta carga mediante `transformers` + `safetensors` + `huggingface_hub`, con la función `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato temporal es el entrenamiento (458 pasos en 180,1 s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2` | 0,5B | no disponible | 7538.02 (declarada, no verificada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens | no disponible en la informacion | Apache 2.0 | Hugging Face |
| Otros modelos de ~0,5B (p. ej. `TinyLlama-1.1B`, `SmolLM-360M`) | 0,36-1,1B | 2.048-8.192 tokens | no disponible en la informacion | Apache 2.0 / MIT | Hugging Face |

La comparación cuantitativa con el base Qwen2.5-0.5B no es posible con los datos aportados: la model card no incluye la perplejidad del base en WikiText-2, por lo que no puede calcularse la brecha exacta. La perplejidad de 7538.02 es indicativa de un modelo no apto para generación de calidad.

## Limitaciones y advertencias

- Perplejidad final de 7538.02 en WikiText-2: el modelo genera texto de muy baja calidad y no es apto para uso en producción.
- La cirugía de atención destruye gran parte de la capacidad del modelo base; la destilación solo recupera parcialmente (de 7,75M a 7.538 de perplejidad).
- Solo soporta inglés según la model card.
- No se documenta la longitud de contexto efectiva tras la sustitución de atención; el soporte de RoPE del módulo figura como `N/A`, lo que puede afectar a la extrapolación posicional.
- Los resultados de benchmark están marcados como `verified: false`; no han sido validados de forma independiente.
- Riesgo elevado de alucinación y salidas incoherentes dada la perplejidad.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B hereda los del modelo base.
- Licencia MIT: permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue real.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en la comunidad.
- Requiere la librería `neuralops` y scripts del repositorio del autor para cargar los pesos correctamente; no es un checkpoint estándar de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
