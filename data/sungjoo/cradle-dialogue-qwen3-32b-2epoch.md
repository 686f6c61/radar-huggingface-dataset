# SungJoo/cradle-dialogue-qwen3-32b-2epoch

## Resumen

cradle-dialogue-qwen3-32b-2epoch es un ajuste fino completo (full fine-tune, sin LoRA) del modelo Qwen/Qwen3-32B, desarrollado por el usuario SungJoo para la deteccion de crisis de salud mental a nivel de turno en conversaciones multi-turno. El modelo resuelve un problema concreto: dado un dialogo completo junto con las predicciones previas del propio modelo, asigna una etiqueta de crisis unicamente al turno actual del usuario, siguiendo un esquema estructurado de etiquetas Alert-Confirm (alert_ongoing, alert_past, confirm_SI_passive_ongoing, confirm_SH_past, confirm_DV_ongoing, confirm_RA_past, entre otras).

Se trata de un checkpoint intermedio: corresponde a la epoca 2 de un entrenamiento de 3 epocas, seleccionado por ser el de mejor perdida de validacion segun el paper CRADLE-Dialogue. El modelo base Qwen3-32B aporta una arquitectura transformer densa de 32.762.123.264 parametros (aproximadamente 32,8 mil millones), con licencia Apache 2.0 y pesos en formato safetensors. El repositorio ocupa 65,5 GB.

Su relevancia actual radica en que, segun la model card, supera a todos los baselines open source y alcanza resultados competitivos frente a Claude-4.5-Sonnet y GPT-5.1 en la tarea de deteccion de crisis, un ambito donde la precision por turno y la capacidad de mantener contexto conversacional son criticas. El modelo esta orientado exclusivamente a investigacion en NLP clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-32B) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud maxima de secuencia usada en entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer denso de aproximadamente 32,8 mil millones de parametros. El ajuste es completo (full fine-tune, sin LoRA), con precision bfloat16, tasa de aprendizaje de 5e-6, scheduler coseno con warmup (ratio 0,05), tamano de lote 1 por dispositivo y acumulacion de gradientes de 16, sobre una longitud maxima de secuencia de 4.096 tokens. El entrenamiento se ejecuto en 2 GPU NVIDIA H200 durante 3 epocas, y este checkpoint corresponde a la epoca 2, seleccionada por mejor perdida de validacion.

El corpus de entrenamiento es CRADLE-Dialogue, un conjunto sintetico de 3.058 dialogos (48.557 turnos) generado a partir de posts de Reddit mediante GPT-5 y anotado con etiquetas estructuradas Alert-Confirm. La tarea es de clasificacion multi-etiqueta a nivel de turno: el modelo recibe el historial completo del dialogo mas sus propias predicciones anteriores y emite una unica linea con la etiqueta o etiquetas del turno actual del usuario, separadas por "; ". No se documenta en la informacion disponible el uso de RLHF o DPO, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de crisis de salud mental a nivel de turno en dialogos multi-turno.
- Clasificacion multi-etiqueta con salida estructurada en una sola linea (por ejemplo, "confirm_DV_ongoing; confirm_RA_past").
- Categorias cubiertas: ideacion suicida (SI), autolesion (SH), violacion (RA), violencia domestica (DV) y abuso infantil, con estados ongoing y past.
- Etiquetas de alerta (alert_ongoing, alert_past) y de confirmacion (confirm_*).
- Uso del historial conversacional y de las predicciones previas del propio modelo como contexto para la inferencia.
- Generacion determinista (do_sample=False) con max_new_tokens=64, disenada para producir exactamente una linea sin razonamiento ni markdown.
- Modo thinking desactivado en la plantilla de chat (enable_thinking=False).
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Triaje automatizado en plataformas de apoyo entre iguales: el modelo puede procesar cada turno de una conversacion y marcar turnos con riesgo de ideacion suicida o autolesion, permitiendo que moderadores humanos prioricen la revision.
- Investigacion en NLP clinico: sirve como baseline ajustado para experimentos de deteccion de crisis a nivel de turno, comparando con los resultados de Claude-4.5-Sonnet y GPT-5.1 reportados en el paper.
- Analisis retrospectivo de foros y comunidades: dado su soporte de contexto de 4.096 tokens, puede anotar dialogos completos por turnos para estudiar la evolucion de senales de riesgo a lo largo de una conversacion.
- Sistemas de alerta en lineas de ayuda: integrado como capa de clasificacion que emite etiquetas estructuradas que un sistema posterior puede enrutar a recursos de crisis o a personal clinico.
- Deteccion multi-etiqueta de violencia domestica y abuso: el formato de salida con etiquetas separadas por "; " permite identificar simultaneamente multiples categorias en un mismo turno.
- Evaluacion de calidad de respuestas en chatbots de salud mental: las etiquetas por turno permiten auditar si un asistente conversacional detecta y escala adecuadamente las senales de crisis.
- Construccion de datasets anotados: el modelo puede pre-anotar grandes volumenes de dialogos para su posterior revision por clinicos, reduciendo el coste de anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que el modelo se evaluo en el conjunto de test de CRADLE-Dialogue (600 dialogos anotados por clinicos) y que supera a todos los baselines open source y logra resultados competitivos frente a Claude-4.5-Sonnet y GPT-5.1, pero remite al paper para las cifras concretas, que no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 65 GB solo para los pesos, mas memoria para el contexto y las activaciones; en la practica se recomienda al menos 80 GB.
- GPU recomendadas: NVIDIA H100 (80 GB) o H200 para bfloat16; A100 de 80 GB como alternativa.
- En consumer GPU no cabe en bfloat16; seria necesaria cuantizacion (no documentada oficialmente) para intentar desplegarlo en GPUs de 24 GB como la RTX 4090, con riesgo de perdida de calidad en una tarea clinica sensible.
- Opciones de despliegue: transformers con device_map="auto" (metodo documentado en la model card); vLLM, TGI, llama.cpp u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles. La generacion es determinista y limitada a 64 tokens nuevos, lo que reduce el coste por inferencia una vez cargado el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cradle-dialogue-qwen3-32b-2epoch | 32,8 B | 4.096 tokens (entrenamiento) | Deteccion de crisis a nivel de turno | Apache 2.0 | Hugging Face, 20 descargas |
| Qwen/Qwen3-32B (base) | 32,8 B | No disponible | Proposito general | Apache 2.0 | Hugging Face |
| Claude-4.5-Sonnet | No disponible | No disponible | Proposito general | Propietaria | API |
| GPT-5.1 | No disponible | No disponible | Proposito general | Propietaria | API |

La model card afirma que este modelo supera a los baselines open source y es competitivo frente a Claude-4.5-Sonnet y GPT-5.1 en la tarea de deteccion de crisis, pero no se proporcionan cifras comparativas en la informacion disponible. No se conocen otros modelos abiertos especializados en deteccion de crisis a nivel de turno dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo orientado exclusivamente a investigacion en NLP clinico; no sustituye la evaluacion profesional de salud mental ni la intervencion en crisis.
- Entrenado solo en ingles; no se garantiza su comportamiento en castellano u otros idiomas.
- El corpus de entrenamiento es sintetico (generado con GPT-5 a partir de posts de Reddit) y anotado con etiquetas estructuradas; puede no reflejar la distribucion real de conversaciones clinicas.
- Riesgo de falsos negativos y falsos positivos en una tarea de alto impacto; requiere validacion con datos reales y supervision clinica antes de cualquier uso practico.
- La salida esta restringida a un formato de una sola linea; desviaciones del formato pueden romper los pipelines que la consumen.
- El modelo depende de que se le proporcione el historial completo y sus predicciones previas en cada turno; un prompt distinto al del paper puede degradar el rendimiento.
- La model card advierte sobre contenido sensible (ideacion suicida, autolesion, violacion, violencia domestica, abuso infantil).
- Licencia Apache 2.0 permite uso comercial, pero dado el dominio clinico se recomienda revision legal y etica adicional.
- No se documentan cuantizaciones oficiales; usar versiones cuantizadas no validadas en produccion clinica es arriesgado.
- El checkpoint es la epoca 2 de 3, seleccionada por perdida de validacion; no es necesariamente el mejor para todas las metricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SungJoo/cradle-dialogue-qwen3-32b-2epoch
- Dataset CRADLE-Dialogue: https://huggingface.co/datasets/SungJoo/Cradle-Dialogue
- Checkpoint de 3 epocas: https://huggingface.co/SungJoo/cradle-dialogue-qwen3-32b-3epoch
- Benchmark CRADLE-Bench: https://huggingface.co/datasets/SungJoo/CRADLE-Bench
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
