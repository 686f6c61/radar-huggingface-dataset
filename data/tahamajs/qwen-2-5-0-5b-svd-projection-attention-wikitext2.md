# tahamajs/qwen-2.5-0.5b-svd-projection-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint experimental de Qwen2.5-0.5B en el que las capas de atención del decodificador han sido sustituidas quirúrgicamente por el módulo `svd_projection_attention`, perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo desarrolla el usuario tahamajs como parte del denominado "Qwen Attention Zoo", una línea de trabajo centrada en evaluar variantes de atención subcuadrática mediante destilación de conocimiento sobre un backbone preentrenado. El modelo base es Qwen/Qwen2.5-0.5B, un transformer denso de 0,5 mil millones de parámetros desarrollado por Alibaba Qwen.

El problema que aborda es la sustitución de mecanismos de atención estándar por alternativas factorizadas (proyecciones lineales SVD) preservando la funcionalidad del modelo original, un patrón habitual en investigación sobre eficiencia de atención. Tras la cirugía, el modelo sufre un colapso severo (perplejidad de 54523,92 en WikiText-2) que se recupera parcialmente mediante un proceso de destilación en dos etapas hasta alcanzar una perplejidad de 296,08 en el conjunto de validación.

Es relevante ahora como artefacto de investigación reproducible: publica la telemetría completa del entrenamiento (411 pasos, 180,1 segundos, 17489 MB de VRAM pico), los pesos de atención en safetensors (55,07 MB) y el contrato del adaptador `QwenAttentionAdapter`. No es un modelo listo para producción, sino una pieza de un banco de pruebas comparativo de mecanismos de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `svd_projection_attention` y 6/24 capas cuadraticas completas (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors; el ejemplo de carga usa FP16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 55,07 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre ese backbone se aplica un patron de cirugia `hybrid_3_1`: 18 de las 24 capas se sustituyen por `SVDProjectionAttention` mediante el adaptador `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de una unica `o_proj`. Las 6 capas restantes conservan atención cuadrática completa como anclas. El módulo soporta atención causal, bidireccional, cross-attention y GQA nativo vía SDPA, con fallback a Triton en CPU/MPS.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenar) arroja una perplejidad de 54523,92. La etapa 1 (alineación con backbone congelado, 125 pasos, 54,4 s) usa MSE y coseno sobre estados ocultos por capa con `lm_head` desactivado y peso 0,25. La etapa 2 (destilación de representación multicapa, 286 pasos, 125,4 s) repite el esquema con peso 0,50. En total, 411 pasos y 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 17489 MB de VRAM pico en FP16 con parámetros maestros en FP32.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del backbone Qwen2.5-0.5B.
- Atención causal y bidireccional soportada de forma nativa por el módulo `SVDProjectionAttention`.
- Soporte de cross-attention a nivel de módulo (aunque el checkpoint es decoder-only).
- Soporte nativo de GQA mediante SDPA, sin repetición redundante de cabezas KV.
- Compatibilidad con RoPE a través del backbone Qwen2 (el módulo declara `supports_rope: N/A`).
- Carga mediante la API universal `neuralops.hub.load_surgeried_model` o mediante `apply_qwen_attention_surgery` + carga manual de pesos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación comparativa de mecanismos de atención: sirve como punto de datos en el "Attention Zoo" para medir el coste de recuperación (perplejidad) al sustituir atención cuadrática por proyecciones SVD factorizadas sobre un backbone fijo.
- Reproducción de experimentos de cirugía de atención: el repositorio publica el patrón `hybrid_3_1`, los índices de las capas ancla y el contrato del adaptador, lo que permite replicar el pipeline completo con `apply_qwen_attention_surgery`.
- Validación de pipelines de destilación de conocimiento en dos etapas: la telemetría detallada (pasos, tiempos, VRAM pico, delta de perplejidad) permite contrastar implementaciones propias de KD por capas.
- Pruebas de integración con la librería NeuralOps: útil para desarrolladores que quieran verificar la API `load_surgeried_model` y el registro `ATTENTION_REGISTRY` en un caso real.
- Benchmark de eficiencia de atención en hardware limitado: con 0,5B parámetros y pesos de atención de 55 MB, cabe en GPUs de consumo para experimentos de latencia y memoria frente al modelo base.
- Docencia y divulgación técnica: ejemplo compacto y reproducible de sustitución de módulos en transformers preentrenados con métricas antes/después documentadas.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / notas |
|---|---|---|
| Perplejidad causal post-cirugia (etapa 0) | 54523,92 | WikiText-2 raw v1, validacion, sin destilar |
| Perplejidad causal final | 296,08 | WikiText-2 raw v1, validacion, tras KD en 2 etapas |
| Delta de perplejidad | -54227,84 | Recuperacion tras destilacion |
| Pasos totales / tiempo | 411 pasos / 180,1 s | `seq_len=512`, `grad_accum=4`, `topk=64` |
| VRAM pico | 17489 MB | FP16 autocast con maestros FP32 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El único dato verificado es la perplejidad en WikiText-2, declarada por el autor y marcada como no verificada (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 1 GB (0,5B parámetros); los pesos de atención publicados son 55,07 MB.
- VRAM para reproducir el entrenamiento: 17489 MB pico en FP16 autocast con maestros FP32.
- GPU recomendadas para entrenamiento: una GPU con al menos 18 GB, como A100 40GB, L40S o RTX 4090 (24 GB).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores para inferencia.
- Opciones de despliegue: carga mediante `neuralops.hub.load_surgeried_model` o el flujo manual con `transformers` + `apply_qwen_attention_surgery`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-svd-projection-attention-wikitext2 | 0,5B | no disponible | 296,08 (validacion) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en la informacion | no disponible en la informacion | Apache 2.0 (Qwen2.5) | Hugging Face |
| Alternativas de atencion subcuadratica sobre backbones pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos del mismo "Attention Zoo" ni de variantes equivalentes de atención factorizada en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la perplejidad final (296,08) es muy superior a la de un Qwen2.5-0.5B intacto, por lo que la calidad de generación es previsiblemente pobre.
- El autor marca la métrica como no verificada (`verified: false`); no hay validación independiente.
- Entrenado únicamente sobre WikiText-2 en inglés; el dominio y el idioma están muy acotados.
- Solo se publican los pesos de atención (`attention_weights.safetensors`); es necesario descargar el backbone Qwen2.5-0.5B y aplicar la cirugía antes de cargar el estado, lo que añade pasos y dependencias.
- Requiere la librería `neuralops` y el script `apply_qwen_attention_surgery`, lo que limita la portabilidad frente a un checkpoint estándar de `transformers`.
- Riesgo de alucinación elevado por la degradación de perplejidad y el dominio restringido de entrenamiento.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.
- La licencia MIT del repositorio aplica a los pesos publicados; conviene revisar la licencia del modelo base Qwen2.5-0.5B para uso comercial combinado.
- No apto para producción sin una evaluación adicional exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-projection-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
