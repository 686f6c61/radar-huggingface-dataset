# tahamajs/qwen-2.5-0.5b-mixattention-moska-wikitext2

## Resumen

`qwen-2.5-0.5b-mixattention-moska-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Attention Zoo). Se trata de un fine-tuning por destilación de conocimiento sobre el modelo base Qwen2.5-0.5B de Alibaba, en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el módulo `MixAttentionMoSKA`, una atención dispersa consciente de frecuencia y varianza (FASA) registrada en el `ATTENTION_REGISTRY` de NeuralOps. El objetivo no es tanto ofrecer un modelo de producción como demostrar que es posible transplantar mecanismos de atención subcuadrática en un transformer preentrenado y recuperar buena parte de la calidad original mediante destilación en dos etapas.

El modelo conserva la arquitectura general de Qwen2.5-0.5B (transformer decoder-only con GQA, 14 cabezas de consulta y 2 de clave/valor, `head_dim=64`, `hidden_size=896`) y añade un patrón híbrido `hybrid_3_1`: tres capas con atención MixAttention-MoSKA por cada capa con atención cuadrática completa, manteniendo anclas densas en los índices `[3, 7, 11, 15, 19, 23]`. Tras el transplante, la perplejidad en WikiText-2 pasó de 139,83 (sin entrenamiento) a 25,97 tras 374 pasos de destilación en dos fases, lo que supone una recuperación de 113,86 puntos de perplejidad en unos 180 segundos de entrenamiento.

Su relevancia es fundamentalmente investigadora: sirve como referencia reproducible de cómo evaluar mecanismos de atención alternativos sobre modelos pequeños y como banco de pruebas para técnicas de destilación post-surgery. No está pensado como sustituto de Qwen2.5-0.5B en aplicaciones conversacionales reales, y su model card lo presenta explícitamente como un artefacto del Attention Zoo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `MixAttentionMoSKA` (FASA dispersa) y 6/24 capas con atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica recuento exacto en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés, según el campo `language` de la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,44 MB + `attention_weights.safetensors` 86,23 MB), `config.json`, `tokenizer.json` |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-0.5B, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con GQA (14 cabezas Q, 2 cabezas KV, `head_dim=64`, `hidden_size=896`). Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye las proyecciones de atención en 18 de las 24 capas por el módulo `MixAttentionMoSKA`, que implementa una atención dispersa consciente de frecuencia y varianza (FASA): en modo no causal poda las claves y valores a los `top fasa_keep_ratio` tokens según importancia por varianza/L2, preservando siempre el token 0 (habitualmente `[CLS]`). En decodificación causal, cross-attention o decodificación incremental con `past_key_value`, el módulo omite la poda y ejecuta atención densa exacta, de modo que el comportamiento autoregresivo no se degrada por la dispersión. Las seis capas restantes (índices 3, 7, 11, 15, 19 y 23) mantienen atención cuadrática completa como anclas.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`, split de validación), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado) ejecuta 113 pasos en 54,2 s con `lm_head` desactivado y una pérdida combinada de MSE y coseno a nivel de capa con peso 0,25. La etapa 2 (destilación multi-capa de representaciones) ejecuta 261 pasos en 125,8 s con peso 0,50. El total son 374 pasos en 180,3 s, con un pico de VRAM de 17 902 MB en FP16 autocast y parámetros maestros del estudiante en FP32. La perplejidad causal pasó de 139,83 (baseline post-surgery sin entrenamiento) a 25,97 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención con soporte causal, bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del módulo `MixAttentionMoSKA`).
- Soporte nativo de GQA (14 cabezas Q, 2 cabezas KV) y expansión automática 7x de cabezas KV cuando el patrón lo requiere.
- Poda dispersa de K/V en contextos no causales (encoder-style, clasificación, `[CLS]`-style), con preservación garantizada del token 0.
- Ejecución densa exacta en decodificación incremental con caché (`past_key_value`), lo que preserva la corrección del modo generativo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la model card.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card; no se declaran otros idiomas.

## Casos de uso

- Investigación en mecanismos de atención subcuadrática: el checkpoint sirve como referencia reproducible para comparar `MixAttentionMoSKA` frente a atención cuadrática estándar en un transformer decoder-only pequeño, con una perplejidad de 25,97 en WikiText-2 como línea base medible.
- Estudio de destilación post-surgery: permite reproducir el pipeline de dos etapas (alineación con backbone congelado + destilación multi-capa) y medir la recuperación de perplejidad (de 139,83 a 25,97) en función de pasos, `topk` y pesos de pérdida.
- Benchmarking de atención dispersa en tareas de modelado de lenguaje: al mantener seis capas densas como anclas, es útil para analizar el equilibrio entre coste computacional y calidad en patrones híbridos `3:1`.
- Experimentos de pruning de K/V en contextos no causales: el módulo `MixAttentionMoSKA` permite probar estrategias de poda por varianza/L2 en tareas encoder-style o de clasificación con token `[CLS]`.
- Docencia y divulgación técnica: modelo pequeño (0,5 B parámetros, ~1 GB de pesos en FP16) que cabe en GPU de consumo y permite ilustrar en un portátil o en una RTX 4090 conceptos de GQA, atención dispersa y destilación.
- Reproducción de experimentos del Attention Zoo de NeuralOps: la API `load_surgeried_model` y el script `qwen_zoo_train_mix.py` permiten cargar y reentrenar el checkpoint de forma directa desde el Hub.
- Validación de pipelines de carga con `transformers` y `neuralops`: útil para verificar que el adapter `QwenAttentionAdapter` y el contrato de `o_proj` único funcionan correctamente antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 25,97 |
| WikiText-2, baseline post-surgery sin KD | Perplejidad | 139,83 |
| Delta de perplejidad tras KD | Perplejidad | -113,86 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la perplejidad en WikiText-2.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 1,03 GB (`model.safetensors` 944,44 MB + `attention_weights.safetensors` 86,23 MB), por lo que la inferencia cabe holgadamente en GPUs de consumo con 4-6 GB de VRAM.
- VRAM para entrenamiento/destilación: el autor reporta un pico de 17 902 MB en FP16 autocast con parámetros maestros en FP32, es decir, una GPU de 24 GB o superior (RTX 3090/4090, A10, L4, A100).
- GPU recomendadas: para inferencia, cualquier GPU consumer con ≥6 GB (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento, A100, H100, L40S o RTX 4090 con 24 GB.
- Cabe en GPU de consumo: sí, tanto en inferencia como, con ajustes, en entrenamiento en GPUs de 24 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y el script `apply_qwen_attention_surgery` de NeuralOps, o la API `neuralops.hub.load_surgeried_model`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. El autor solo reporta tiempos de entrenamiento (180,3 s para 374 pasos con `seq_len=512`), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-mixattention-moska-wikitext2` | 0,5 B | no disponible | MIT | Qwen2.5-0.5B con atencion hibrida `MixAttentionMoSKA` + KD en WikiText-2 | Hugging Face (`tahamajs/...`) |
| `Qwen/Qwen2.5-0.5B` | 0,5 B | 32 768 tokens | Apache 2.0 | Transformer decoder-only con GQA y atencion cuadratica estandar | Hugging Face, muy extendido |
| `Qwen/Qwen2.5-1.5B` | 1,5 B | 32 768 tokens | Apache 2.0 | Misma familia, mayor tamano y calidad | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1,2 B | 131 072 tokens | Llama 3.2 Community License | Transformer decoder-only con GQA | Hugging Face |

La comparación directa con Qwen2.5-0.5B es la más relevante: comparten pesos base y arquitectura, pero el checkpoint de tahamajs sustituye 18 capas de atención por un módulo disperso y ha sido destilado únicamente sobre WikiText-2, por lo que su perplejidad (25,97) no es directamente comparable con la del modelo original sin ejecutar la misma evaluación. No se dispone de datos de benchmarks del modelo base en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo experimental de investigación: la model card lo presenta como un artefacto del Attention Zoo, no como un modelo listo para producción.
- Entrenamiento limitado a WikiText-2: la destilación se realizó únicamente sobre `wikitext-2-raw-v1` (374 pasos, 180,3 s), lo que restringe la distribución de dominio y aumenta el riesgo de degradación fuera de ese corpus.
- Perplejidad elevada en términos absolutos: 25,97 en WikiText-2 es alta para un modelo de 0,5 B; el propio autor reporta un baseline post-surgery de 139,83 antes de la destilación, lo que evidencia la agresividad del transplante.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: no se especifica la longitud de contexto efectiva tras el transplante; el módulo disperso opera en modo denso en decodificación causal, pero no se documenta el comportamiento con `past_key_value` a longitudes largas.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 0,5 B destilado sobre un corpus enciclopédico, es esperable una tasa alta de alucinación en dominios abiertos.
- Sesgos: no documentados; hereda los sesgos de Qwen2.5-0.5B y de WikiText-2, sin que el autor reporte evaluaciones de sesgo.
- Licencia MIT: permisiva para uso comercial, pero al derivar de Qwen2.5-0.5B (Apache 2.0) conviene verificar la compatibilidad de obligaciones de atribución al redistribuir.
- Dependencia de código externo: la carga requiere el paquete `neuralops` y el script `apply_qwen_attention_surgery`; no es un checkpoint cargable con `transformers` estándar sin ese código.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones INT8/INT4, lo que limita el despliegue en entornos sin GPU o con `llama.cpp`.
- Benchmarks no verificados: el único resultado (perplejidad 25,97) está marcado como `verified: false` en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-mixattention-moska-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2 (`Salesforce/wikitext`): https://huggingface.co/datasets/Salesforce/wikitext
- Script de entrenamiento referenciado: `scripts/benchmarks/qwen_zoo_train_mix.py` dentro del repositorio NeuralOps
