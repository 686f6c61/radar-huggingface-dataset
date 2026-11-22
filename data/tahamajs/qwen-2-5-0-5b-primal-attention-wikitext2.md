# tahamajs/qwen-2.5-0.5b-primal-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-primal-attention-wikitext2` es un checkpoint experimental publicado por el desarrollador independiente tahamajs dentro de su proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B de Alibaba al que se le han sustituido quirurgicamente 18 de sus 24 capas de atencion por un operador alternativo denominado `primal_attention` (Primal Attention: Self-Attention through Asymmetric Kernel SVD in Primal Representation), manteniendo 6 capas de atencion cuadratica original como anclas.

El objetivo es investigar mecanismos de atencion subcuadratica y su viabilidad en modelos causales pequenos, empleando destilacion de conocimiento en dos etapas sobre WikiText-2 para recuperar la calidad perdida tras la cirugia. El resultado reportado es una perplejidad de validacion de 26.12 en `wikitext-2-raw-v1`, partiendo de una linea base post-cirugia de 139.84.

Es relevante ahora como artefacto de investigacion reproducible: demuestra un pipeline de sustitucion de atencion con adaptador GQA (14 cabezas de consulta, 2 de clave/valor, `head_dim=64`, `hidden_size=896`), entrenamiento en 414 pasos y 180 segundos, y publicacion de pesos solo de atencion (123.89 MB) que se cargan sobre el modelo base. No es un modelo para produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `primal_attention` y 6/24 capas de atencion cuadratica completa en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0.5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`; contexto nativo del base Qwen2.5-0.5B no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 123.89 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. La intervencion aplica el patron `hybrid_3_1`: por cada tres capas se sustituye la atencion por `primal_attention` y se conserva una capa cuadratica como ancla, resultando en 18 capas transplantadas y 6 preservadas. El `QwenAttentionAdapter` gestiona la expansion 14:2 de cabezas KV (7x) y el contrato de `o_proj` unico. `PrimalAttention` soporta modo causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE (marcado como N/A).

El entrenamiento consiste en destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenar) arroja una perplejidad causal de 139.84. La etapa 1 (alineacion con backbone congelado, 126 pasos, 54.5 s) omite `lm_head` y aplica MSE y coseno a nivel de capa con peso 0.25. La etapa 2 (destilacion de representacion multicapa, 288 pasos, 125.4 s) usa MSE y coseno con peso 0.50. En total, 414 pasos en 180.1 s con `seq_len=512`, `grad_accum=4`, `topk=64`, autocast FP16 y parametros maestros en FP32, con un pico de VRAM de 15638 MB. La perplejidad final es 26.12 (delta de -113.71).

## Capacidades

- Generacion de texto causal en ingles, heredada del modelo base Qwen2.5-0.5B.
- Atencion causal autoregresiva con el operador `primal_attention` en 18 capas.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (segun la tabla de capacidades del modulo).
- No soporta GQA nativo en el modulo `primal_attention`; el adaptador realiza la expansion de cabezas.
- No soporta RoPE nativo en el modulo (marcado N/A); la posicion se gestiona via el contrato del adaptador.
- Capacidades multilingues: solo ingles declarado.
- Tool calling, function calling, agentes, vision, audio, thinking mode: no disponible / no declarado para este checkpoint.
- El checkpoint contiene solo pesos de atencion; requiere cargar el base Qwen2.5-0.5B y aplicar la cirugia antes de cargar los pesos.

## Casos de uso

- Investigacion en atencion subcuadratica: banco de pruebas reproducible para comparar `primal_attention` frente a atencion cuadratica en un decoder pequeno, con telemetria de perplejidad y pasos de entrenamiento publicada.
- Experimentos de sustitucion de atencion (attention surgery): validar el pipeline `apply_qwen_attention_surgery` con patrones hibridos y adaptadores GQA sobre Qwen2.5.
- Destilacion de conocimiento: usar la receta de dos etapas (alineacion con backbone congelado + destilacion de representacion multicapa) como referencia para recuperar calidad tras modificar bloques internos.
- Evaluacion de perplejidad en WikiText-2: referencia de 26.12 para comparar variantes del Attention Zoo bajo el mismo protocolo.
- Docencia y formacion: ejemplo didactico de como se sustituye un operador de atencion y se reentrena parcialmente un modelo de 0.5B en menos de 3 minutos de GPU.
- Prototipado de bajo coste: generar texto en ingles con un modelo de 0.5B en GPU consumer para demos internas, asumiendo calidad limitada frente al base sin cirugia.
- No recomendado para produccion, atencion al cliente, generacion de codigo ni tareas que requieran robustez factual.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 26.12 | Resultado final post-destilacion |
| WikiText-2 (Stage 0, post-cirugia) | Perplejidad | 139.84 | Linea base sin entrenar |
| WikiText-2 (delta) | Perplejidad | -113.71 | Recuperacion tras destilacion |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; el checkpoint de atencion anade 123.89 MB. Con overhead de activaciones, cabe holgadamente en GPUs de 4-8 GB.
- VRAM de entrenamiento reportada: pico de 15638 MB (FP16 autocast con maestros FP32, `seq_len=512`, `grad_accum=4`).
- GPU recomendadas: cualquier GPU con al menos 8 GB para inferencia (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento se necesitan al menos 16 GB (RTX 4080, A100, H100).
- Cabe en GPU consumer: si, en RTX 3060/4060/4090 y equivalentes.
- Opciones de despliegue: el modelo usa la libreria `neuralops` y requiere cargar el base Qwen2.5-0.5B con `transformers`, aplicar la cirugia y cargar los pesos de atencion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo (414 pasos) tardo 180.1 s en la GPU usada por el autor (no especificada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-primal-attention-wikitext2` | 0.5B | no disponible (entrenado a 512) | PPL WikiText-2 26.12 (no verificado) | MIT | Hugging Face, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (base) | 0.5B | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (segun el modelo base, no confirmado aqui) | Hugging Face, transformers |
| `Qwen/Qwen2.5-1.5B` | 1.5B | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (segun el modelo base, no confirmado aqui) | Hugging Face, transformers |
| Otros checkpoints del NeuralOps Attention Zoo | 0.5B | no disponible | no disponible | MIT | Hugging Face |

La comparacion directa de rendimiento con el base Qwen2.5-0.5B no esta disponible en la informacion proporcionada; el unico dato es la perplejidad post-destilacion de 26.12 frente a 139.84 post-cirugia, sin valor de referencia del base sin cirugia.

## Limitaciones y advertencias

- Modelo de investigacion: no es un modelo generalista listo para produccion; su calidad depende del base Qwen2.5-0.5B y de la recuperacion parcial tras la cirugia.
- Entrenado exclusivamente en WikiText-2 (ingles); no se ha validado en otros dominios ni idiomas.
- Solo se publican pesos de atencion; es necesario replicar la cirugia con `neuralops` y cargar el base Qwen2.5-0.5B, lo que anade complejidad de despliegue.
- La perplejidad de 26.12 esta marcada como `verified: false`; no ha sido validada de forma independiente.
- Riesgo de alucinacion y sesgos heredados del base Qwen2.5-0.5B, no evaluados en este checkpoint.
- El modulo `primal_attention` no soporta GQA nativo ni RoPE; el adaptador realiza expansion de cabezas, lo que puede introducir ineficiencias o comportamientos no documentados.
- Contexto de entrenamiento limitado a 512 tokens; no se documenta la ventana efectiva en inferencia.
- Licencia MIT declarada, lo que permite uso comercial, pero la ausencia de evaluaciones de seguridad y robustez desaconseja su uso en produccion.
- Dependencia de la libreria `neuralops` (no estandar en el ecosistema transformers) para la carga correcta del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-primal-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de Primal Attention (Self-Attention through Asymmetric Kernel SVD in Primal Representation): no disponible en la informacion proporcionada
