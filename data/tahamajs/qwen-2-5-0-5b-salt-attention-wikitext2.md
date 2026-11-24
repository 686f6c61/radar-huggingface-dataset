# tahamajs/qwen-2.5-0.5b-salt-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-salt-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Zoo. No es un modelo entrenado desde cero, sino el modelo base Qwen2.5-0.5B de Alibaba cuyo mecanismo de atencion en el decodificador ha sido sustituido quirurgicamente por el modulo `salt_attention` (SALTAttention) del registro de atencion de NeuralOps, que implementa atencion subcuadratica. El objetivo es evaluar variantes de atencion eficiente sobre un transformer preentrenado mediante destilacion de conocimiento en dos etapas.

El checkpoint resultante se ha ajustado sobre WikiText-2 (`wikitext-2-raw-v1`) y publica una perplejidad de validacion de 310,59, obtenida tras recuperar un colapso inicial de 270.320,78 puntos de perplejidad inmediatamente despues de la cirugia de atencion. Se trata por tanto de un artefacto de investigacion sobre eficiencia de atencion, no de un modelo listo para produccion: los pesos publicados son solo las proyecciones de atencion sustituidas (55,10 MB en `attention_weights.safetensors`), no el modelo completo.

La relevancia actual radica en el interes por arquitecturas de atencion subcuadraticas (lineales, dispersas, hibridas) que reduzcan el coste cuadratico del contexto largo. Este repositorio ofrece una receta reproducible de sustitucion de atencion y destilacion sobre un modelo pequeno y abierto, con telemetria de entrenamiento detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion sustituida por SALTAttention en patron hibrido 3:1 |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica recuento tras la cirugia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de carga usa FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 55,10 MB), mas `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA, `head_dim=64`). Sobre esa base se aplica el patron de cirugia `hybrid_3_1`: 18 de las 24 capas se transplantan con `salt_attention` mediante el `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de un unico `o_proj`; las 6 capas restantes conservan atencion cuadratica completa como anclas, en los indices `[3, 7, 11, 15, 19, 23]`. El modulo SALTAttention declara soporte causal, bidireccional, cross-attention y GQA nativo.

El ajuste se realiza en dos etapas de destilacion de conocimiento sobre WikiText-2 con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineacion con backbone congelado) ejecuta 127 pasos en 54,4 s con MSE y coseno por capa a peso 0,25, con `lm_head` puenteado. La etapa 2 (destilacion de representacion multicapa) ejecuta 290 pasos en 125,5 s con pesos de 0,50. En total, 417 pasos y 180,1 s de optimizacion, con un pico de VRAM de 17.085 MB en autocast FP16 y parametros maestros en FP32. La perplejidad causal pasa de 270.320,78 (etapa 0, tras la cirugia) a 310,59 final.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada de Qwen2.5-0.5B y ajustada sobre WikiText-2.
- Modelado de lenguaje de dominio general (perplejidad medida en validacion de WikiText-2).
- Soporte declarado de atencion causal, bidireccional y cross-attention a nivel de modulo SALTAttention.
- Soporte nativo de GQA en el adaptador de atencion.
- Capacidades conversacionales y de tool calling de Qwen2.5-0.5B: no verificadas en este checkpoint; el ajuste se limita a WikiText-2 y no se documenta evaluacion de instrucciones.
- Capacidades multilingues: solo ingles declarado.
- No se documentan modo thinking, vision ni audio.

## Casos de uso

- Investigacion en atencion subcuadratica: sirve como banco de pruebas reproducible para comparar SALTAttention frente a atencion cuadratica completa sobre un mismo backbone, con telemetria de perplejidad antes y despues de la cirugia.
- Estudio de destilacion de conocimiento post-cirugia: el repositorio documenta la recuperacion desde un colapso de perplejidad de 270.320,78 hasta 310,59 en 417 pasos, util para calibrar recetas de recuperacion en sustituciones de atencion.
- Prototipado de arquitecturas hibridas 3:1: permite analizar el equilibrio entre capas subcuadraticas y capas ancla cuadraticas en un modelo de 24 capas.
- Evaluacion de eficiencia en hardware modesto: con 0,5 mil millones de parametros y pesos de atencion de 55,10 MB, cabe en GPUs de consumo para experimentos de perplejidad y generacion corta.
- Generacion de texto de baja latencia en ingles para demos internas: el modelo base Qwen2.5-0.5B es rapido, aunque la calidad tras el ajuste sobre WikiText-2 no esta evaluada fuera de dominio.
- Integracion en pipelines de investigacion con la API `neuralops.hub.load_surgeried_model`: carga en una linea del modelo con pesos quirurgicos para experimentos automatizados de ablation.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad | 310,59 |

Telemetria de entrenamiento declarada:

| Etapa | Metrica | Valor |
|---|---|---|
| Etapa 0 (post-cirugia, zero-shot) | Perplejidad causal | 270.320,78 |
| Etapa 2 (final) | Perplejidad causal | 310,59 |
| Delta total | Reduccion de perplejidad | -270.010,19 |
| Optimizacion total | Pasos / tiempo | 417 / 180,1 s |
| Pico de VRAM | Memoria | 17.085 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (0,5 mil millones de parametros) se situa en torno a 1-2 GB en FP16, estimacion no confirmada por el autor.
- VRAM de entrenamiento declarada: 17.085 MB de pico en autocast FP16 con parametros maestros FP32.
- GPU recomendadas: no especificadas; el pico de entrenamiento de 17 GB encaja en A100 40 GB, H100 o RTX 4090 (24 GB).
- GPU de consumo: el modelo base de 0,5 mil millones cabe con holgura en GPUs consumer de 8 GB o mas; no verificado para este checkpoint concreto.
- Opciones de despliegue: la carga oficial requiere la libreria `neuralops` (`load_surgeried_model`) o el script `apply_qwen_attention_surgery` de NeuralOps; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-salt-attention-wikitext2 | 0,5 mil millones | no disponible | Hibrida 3:1 con SALTAttention | MIT | Hugging Face (pesos de atencion) |
| Qwen/Qwen2.5-0.5B | 0,5 mil millones | 32.768 tokens (segun Qwen2.5) | Cuadratica completa con GQA | Apache 2.0 | Hugging Face |
| Modelos de atencion lineal tipo Mamba o RWKV | variable | variable | SSM / lineal | variable | Hugging Face |

La comparacion directa de rendimiento con Qwen2.5-0.5B original no esta disponible en la informacion proporcionada: no se publica la perplejidad del base en WikiText-2 con la misma receta de evaluacion.

## Limitaciones y advertencias

- Perplejidad de 310,59 en WikiText-2: muy superior a la de modelos de 0,5 mil millones bien ajustados, lo que indica degradacion sustancial respecto al base; no es un modelo util para generacion de calidad.
- El repositorio contiene solo los pesos de atencion sustituidos (`attention_weights.safetensors`), no el modelo completo; requiere descargar Qwen2.5-0.5B y aplicar la cirugia antes de cargar.
- Dependencia de la libreria `neuralops` y del script `apply_qwen_attention_surgery`, lo que limita la portabilidad frente a formatos estandar (GGUF, ONNX).
- Entrenado unicamente sobre WikiText-2 en ingles; no hay evaluacion de instrucciones, tool calling ni agentes, aunque el base las soporte.
- Riesgo de alucinacion y sesgos: no evaluados; el ajuste sobre un corpus enciclopedico pequeno no corrige los sesgos del base.
- Benchmark de perplejidad marcado como no verificado por el propio autor.
- Licencia MIT declarada para el checkpoint; el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, por lo que conviene revisar ambas condiciones para uso comercial.
- Fecha de creacion en el repositorio (2026-11-10) posterior a la fecha de referencia habitual; verificar la integridad y procedencia del artefacto antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-salt-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
