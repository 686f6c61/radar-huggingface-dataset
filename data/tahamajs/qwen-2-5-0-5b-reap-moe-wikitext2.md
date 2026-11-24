# tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que el autor (tahamajs) ha sustituido quirurgicamente los bloques de atencion del decodificador por un modulo propio llamado `REAPMoEAttention` (REAP-MoE: Robust Expert Allocation and Pruning Mixture of Experts Attention), registrado en el framework NeuralOps. No es un modelo entrenado desde cero ni un MoE nativo: es un ejercicio de "cirugia de atencion" con destilacion de conocimiento en dos etapas sobre WikiText-2, orientado a explorar alternativas subcuadraticas a la atencion cuadratica clasica.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only con 24 capas, hidden size 896, 14 cabezas de consulta y 2 cabezas KV con GQA, head_dim 64) pero reemplaza 18 de las 24 capas de atencion por el operador REAP-MoE, manteniendo 6 capas de atencion cuadratica completa como "anclas" en los indices [3, 7, 11, 15, 19, 23] (patron `hybrid_3_1`). El resultado es un modelo hibrido de investigacion con un unico artefacto de pesos de atencion de 193,45 MB.

Su relevancia es acotada: sirve como banco de pruebas reproducible para estudiar si modulos de atencion alternativos pueden recuperar calidad tras una sustitucion agresiva mediante destilacion por capas. El autor declara una perplejidad de validacion de 24,89 en WikiText-2 tras la destilacion, partiendo de 139,79 en el estado post-cirugia sin entrenar. No es un modelo pensado para produccion ni para uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `REAPMoEAttention` y 6/24 capas con atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | No disponible (el modelo base Qwen2.5-0.5B tiene 0,49B; el checkpoint solo publica pesos de atencion de 193,45 MB) |
| Parametros activos | No disponible (REAP-MoE se describe como modulo de atencion con enrutado de expertos, pero no se publica el numero de expertos ni de parametros activos) |
| Longitud de contexto | No disponible (el entrenamiento de destilacion uso `seq_len=512`; no se declara contexto maximo de inferencia) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; el ejemplo de carga usa `torch.float16`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 193,45 MB) mas `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 capas de decodificador, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64`. Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye los bloques de atencion por `REAPMoEAttention` en 18 de las 24 capas, con una expansion automatica de cabezas KV de 7x cuando el modulo lo requiere y un contrato de "Single-`o_proj`" (una unica proyeccion de salida). Las 6 capas restantes conservan atencion cuadratica completa y actuan como anclas. El modulo declara soporte causal, bidireccional y cross-attention, pero no soporte nativo de GQA ni de RoPE (marcado como N/A).

El entrenamiento es una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), sin RLHF ni DPO. Etapa 1 (alineacion con backbone congelado): 135 pasos en 54,1 s, con `lm_head` puenteado y MSE/coseno por capa con peso 0,25. Etapa 2 (destilacion de representaciones multicapa): 312 pasos en 125,8 s, con MSE/coseno por capa con peso 0,50. Total: 447 pasos en 180,2 s, con `seq_len=512`, `grad_accum=4` y `topk=64`. La VRAM pico fue de 16.196 MB en FP16 autocast con parametros maestros en FP32. La perplejidad causal paso de 139,79 (post-cirugia, sin entrenar) a 24,89 tras la destilacion, una delta de -114,90.

## Capacidades

- Generacion de texto autoregresiva causal (declarada en `pipeline_tag: text-generation`).
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (segun la tabla de capacidades del autor).
- Destilacion por capas verificada: recupera calidad de perplejidad en WikiText-2 tras la sustitucion de atencion.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en atencion subcuadratica: usar el checkpoint como banco de pruebas reproducible para comparar el operador `REAPMoEAttention` frente a atencion cuadratica en las mismas capas y con el mismo dataset, midiendo perplejidad y coste.
- Estudio de destilacion post-cirugia: replicar el pipeline de dos etapas (alineacion con backbone congelado + destilacion de representaciones multicapa) para evaluar tecnicas de recuperacion tras sustituciones agresivas de modulo.
- Prototipado de modulos MoE en atencion: el `QwenAttentionAdapter` y el patron `hybrid_3_1` permiten experimentar con layouts hibridos (por ejemplo, variar el numero de capas ancla) sin reentrenar desde cero.
- Validacion de frameworks: comprobar la integracion de `neuralops.hub.load_surgeried_model` y el registro `ATTENTION_REGISTRY` en pipelines propios de evaluacion.
- Docencia y divulgacion: ejemplo didactico de cirugia de atencion y destilacion de conocimiento con metricas de perplejidad antes y despues (139,79 -> 24,89).
- Benchmarking de perplejidad en WikiText-2: usar el valor declarado (24,89) como referencia para comparar variantes del operador o configuraciones de destilacion.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, split validation) | Perplejidad | 24,89 |

Telemetria de entrenamiento declarada:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, sin KD) | Perplejidad causal | 139,79 |
| Post-KD | Perplejidad de validacion | 24,89 |
| Delta | Perplejidad | -114,90 |
| Stage 1 | Pasos / tiempo | 135 / 54,1 s |
| Stage 2 | Pasos / tiempo | 312 / 125,8 s |
| Total | Pasos / tiempo | 447 / 180,2 s |
| Pico VRAM | Memoria | 16.196 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta 16.196 MB de pico durante el entrenamiento de destilacion (FP16 autocast con maestros FP32). Para inferencia del modelo completo en FP16 se puede estimar en torno a 1-2 GB por el tamano del base (0,5B), pero no hay medicion publicada de inferencia.
- GPU recomendadas: no disponible de forma explicita. El entrenamiento cupo en una GPU con al menos 16 GB de VRAM.
- Cabe en consumer GPU: probablemente si en GPUs con 8 GB o mas (RTX 3060/4060, RTX 3070/4070), dado el tamano del base; sin confirmacion oficial.
- Opciones de despliegue: el autor documenta carga via `transformers` + `safetensors` con `apply_qwen_attention_surgery`, y via `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2` | No disponible (base 0,49B) | No disponible | 24,89 (declarada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,49B | 32.768 tokens (segun Qwen) | No disponible en la informacion | Apache 2.0 | Hugging Face |
| Alternativas de 0,5B con atencion hibrida/MoE | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados de benchmarks comparables para modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el checkpoint solo contiene pesos de atencion (`attention_weights.safetensors`); requiere cargar el base `Qwen/Qwen2.5-0.5B` y aplicar la cirugia con `apply_qwen_attention_surgery` antes de usar.
- Entrenado unicamente sobre WikiText-2 en ingles: no hay evidencia de calidad en otros dominios ni idiomas.
- Perplejidad declarada no verificada (`verified: false` en el model-index).
- No soporta GQA nativo ni RoPE en el modulo REAP-MoE (marcado como N/A), lo que puede limitar la extension de contexto.
- Sin datos publicados sobre sesgos, alucinacion o robustez en produccion.
- No se documenta soporte para tool calling, agentes ni modos de razonamiento.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) que debe respetarse.
- Fecha de creacion declarada en 2026-11-10, posterior a la fecha actual de referencia; conviene verificar la integridad del repositorio antes de usarlo.
- Sin likes ni verificacion de la comunidad (0 likes, 384 descargas); trazabilidad limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
