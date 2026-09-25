# violetxi/qwen35-9b-equational-theory-sair-mix100m

## Resumen

Qwen3.5-9B equational-theory SAIR — 100M mixture es un ajuste fino completo (full fine-tuning, no un adaptador LoRA) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi. El modelo está especializado en teoría de ecuaciones y en el protocolo SAIR (resolución de problemas con veredicto binario y razonamiento extenso), y se distribuye como checkpoint nativo en formato `Qwen3_5ForConditionalGeneration`, con tokenizador, plantilla de chat, configuración y procesadores incluidos. No requiere fusión de adaptadores ni conversión de checkpoint.

El entrenamiento consumió 199.999.848 exposiciones de tokens supervisados (99.999.924 por época, dos épocas) sobre una mezcla de 103.276 notas (60,9273 % de los tokens) y 42.013 trayectorias condicionadas por nota (39,0727 %). Se trata de un modelo denso de 9.653.104.368 parámetros (9,65 B), con pesos publicados en BF16 y licencia Apache 2.0. El repositorio ocupa 19,3 GB.

Su relevancia es acotada pero clara: es un ejemplo reproducible de ajuste fino completo a escala de ~10 B sobre datos muy específicos, con log de entrenamiento público, datasets publicados y trazabilidad de revisiones del modelo base. La contrapartida es que, en la fecha de publicación (24 de septiembre de 2026), no existe ninguna puntuación SAIR Stage 1 completada: el trabajo de inferencia inicial falló durante el enlazado de librerías CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (modelo denso, con torre de visión y componentes MTP heredados del base) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Longitud de contexto | no disponible en la informacion proporcionada; el protocolo de evaluacion SAIR Stage 1 previsto usa 32.768 tokens de contexto y 24.576 tokens de salida (incluido thinking) |
| Tipos de cuantizacion | no disponible; solo se publican pesos BF16 en safetensors, sin GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, BF16, fragmentado (sharded); 427 tensores de lenguaje convertidos desde FP32 y 348 tensores de vision/MTP heredados del base fijado |

## Arquitectura y entrenamiento

La arquitectura es la nativa de Qwen3.5 para generación condicional, `Qwen3_5ForConditionalGeneration`, que combina un decodificador de lenguaje con componentes de visión y MTP. El checkpoint contiene 427 tensores de lenguaje (los entrenados) y 348 tensores de visión/MTP que se heredan sin cambios del base fijado en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. Los pesos de lenguaje entrenados en FP32 se convirtieron a BF16 y se mapearon al layout nativo; la carga con Transformers estándar pasó sin claves ausentes, inesperadas ni con desajustes.

El ajuste fue un SFT de modelo completo con FSDP2 sobre ocho GPU GH200, tasa de aprendizaje 5e-6, scheduler coseno con 3 % de warmup, cómputo en BF16, checkpointing de activaciones y entropía cruzada con media global de tokens supervisados, sin término KL. Se usó empaquetado sin padding con ejemplos aislados y los prompts quedaron enmascarados en la pérdida de las trayectorias. El resultado final es el checkpoint de época 2, paso 1.846, del trabajo de entrenamiento 1020938. La NLL de tokens en el conjunto reservado es 0,2791766 (notas 0,3221392; trayectorias 0,1792197).

## Capacidades

- Generación de texto y conversación multi-turno, según los tags `text-generation` y `conversational`.
- Razonamiento extendido con modo thinking: el protocolo de evaluación previsto contempla 24.576 tokens de salida que incluyen el bloque de pensamiento.
- Resolución de problemas de teoría de ecuaciones, dominio central de los datasets de entrenamiento.
- Respuestas con veredicto binario evaluable mediante reglas, tal como define el protocolo SAIR Stage 1.
- Entrada de imagen y texto (tag `image-text-to-text`), aunque los tensores de visión no fueron entrenados en este ajuste.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- No se documenta soporte explícito de tool calling, function calling, uso de agentes ni capacidades de audio.
- No se declaran idiomas soportados.

## Casos de uso

- Investigación en teoría de ecuaciones: el modelo puede asistir en la exploración de identidades y leyes ecuacionales, ya que se ajustó sobre 103.276 notas del dominio con 60,9 M de tokens por época.
- Evaluación de protocolos de razonamiento largo: sirve como sujeto de prueba para protocolos con presupuestos de 24.576 tokens de salida y grading binario basado en reglas, como el SAIR Stage 1.
- Generación de trayectorias condicionadas por nota: puede producir cadenas de resolución a partir de un enunciado dado, reproduciendo el formato de las 42.013 trayectorias de entrenamiento.
- Estudio de ajuste fino completo a escala 10 B: el modelo es un caso reproducible de SFT con FSDP2, con log de W&B público, hiperparámetros documentados y datasets publicados, útil para comparar recetas de entrenamiento.
- Base para experimentos de destilación o evaluación de olvido catastrófico: al derivar de Qwen3.5-9B, permite medir cuánto se degrada el rendimiento general tras dos épocas sobre un corpus estrecho.
- Prototipado de asistentes especializados en dominios formales: con licencia Apache 2.0 y pesos completos, se puede integrar en un pipeline de Transformers para tareas de razonamiento simbólico acotado.
- Reproducción de resultados: los datasets y revisiones están fijados, por lo que un tercero puede replicar el entrenamiento o auditar la composición de la mezcla 60,9273 % / 39,0727 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que, a fecha de publicación (24 de septiembre de 2026), no hay ninguna puntuación SAIR Stage 1 completada para este checkpoint: el trabajo de inferencia inicial falló durante el enlazado de librerías CUDA y la evaluación corregida quedó en cola. No se reporta ningún resultado de Stage 2.

Los únicos números de calidad disponibles son de pérdida sobre datos reservados:

| Metrica | Valor |
|---|---|
| NLL de tokens en held-out (global) | 0,2791766 |
| NLL de tokens en held-out (notas) | 0,3221392 |
| NLL de tokens en held-out (trayectorias) | 0,1792197 |
| Exposiciones de tokens supervisados (2 epocas) | 199.999.848 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo de pesos (9,653 B x 2 bytes), que con cache KV y activaciones se traduce en un uso práctico del orden de 22-26 GB. Es una estimación derivada del recuento de parámetros, no un dato publicado.
- VRAM estimada en FP32: unos 38,6 GB solo de pesos; no recomendable para despliegue.
- VRAM estimada con cuantización de 8 bits: alrededor de 9,7 GB de pesos y 12-14 GB en uso práctico (estimación; no hay cuantizaciones publicadas por el autor).
- VRAM estimada con cuantización de 4 bits: alrededor de 5,5-6,5 GB de pesos y 8-10 GB en uso práctico (estimación; requeriría generar el GGUF por cuenta propia).
- GPU recomendadas: A100 40/80 GB, H100, L40S o GH200 para BF16 sin compromisos. El entrenamiento se realizó sobre ocho GH200 con FSDP2.
- GPU de consumo: una RTX 4090 (24 GB) queda en el límite para BF16 y probablemente exija `device_map="auto"` con offload a CPU; una RTX 3090 (24 GB) está en la misma situación. Tarjetas de 16 GB o menos solo son viables con cuantización.
- Opciones de despliegue: Transformers con soporte para Qwen3.5 (`Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="auto", device_map="auto")`), y servidores compatibles con endpoints. vLLM, TGI o SGLang serían viables si soportan la arquitectura Qwen3.5. llama.cpp y Ollama requieren una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-mix100m | 9,65 B | no disponible | Sin puntuacion SAIR Stage 1 publicada; NLL held-out 0,2791766 | apache-2.0 | Pesos BF16 completos en safetensors, 19,3 GB |
| Qwen/Qwen3.5-9B (modelo base) | ~9,65 B (heredados; no confirmado en la informacion) | no disponible | No reportado en la informacion disponible | no disponible en la informacion | Base publico en HuggingFace |

No se han identificado en la información proporcionada otros ajustes finos comparables de la misma categoría (mismo tamaño o misma tarea) con datos publicados de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no existe puntuación SAIR Stage 1 ni Stage 2, por lo que el rendimiento real en la tarea objetivo es desconocido.
- Riesgo de sobreajuste al dominio: 200 M de exposiciones de tokens supervisados sobre un corpus muy estrecho (notas y trayectorias de teoría de ecuaciones) pueden degradar capacidades generales respecto al base Qwen3.5-9B. No hay datos que cuantifiquen ese olvido.
- Riesgo de alucinación: el ajuste con pérdida enmascarada sobre trayectorias optimiza la imitación de cadenas de razonamiento; no se documenta ningún mecanismo de verificación o RLHF/DPO que penalice afirmaciones falsas. En un dominio formal, un veredicto binario incorrecto puede ser difícil de detectar sin grading automático.
- Idiomas no declarados: no se especifica qué lenguas soporta el ajuste ni si el castellano está cubierto con calidad.
- Contexto no declarado: aunque el protocolo de evaluación usa 32.768 tokens, la model card no confirma la ventana de contexto efectiva del checkpoint.
- Componentes de visión no entrenados: los 348 tensores de visión/MTP se heredan intactos del base, de modo que las capacidades de imagen no mejoran con este ajuste y no están evaluadas.
- Sin cuantizaciones publicadas: no hay GGUF ni pesos de 8/4 bits, lo que encarece el despliegue en hardware de consumo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar del base Qwen3.5-9B conviene verificar las condiciones del modelo original, que no se detallan en la información proporcionada.
- Trazabilidad limitada del autor: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin otros modelos ni historial verificable en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-mix100m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (revision fijada `c202236235762e1c871ad0ccb60c8ee5ba337b9a`)
- Dataset de notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-notes (revision `fbc728524ae3a2c8cc6a8806830698d3878fac7c`)
- Dataset de trayectorias condicionadas por nota: https://huggingface.co/datasets/violetxi/equational-theory-sair-note-conditioned-rollouts (revision `19e5d3ec82bf73b89feb436cfe54ff87f4c1c106`)
- Log de entrenamiento en W&B: https://wandb.ai/stanford_autonomous_agent/equational-theory-curated-r3-20260923/runs/eqall100m20260924
- Busquedas web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos correspondian a una pelicula homonima y no guardan relacion con el repositorio.
