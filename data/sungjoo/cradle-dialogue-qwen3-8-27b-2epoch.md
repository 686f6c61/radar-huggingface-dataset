# SungJoo/cradle-dialogue-qwen3.8-27b-2epoch

## Resumen

cradle-dialogue-qwen3.8-27b-2epoch es un ajuste fino completo (full fine-tune) del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario SungJoo para la deteccion de crisis de salud mental a nivel de turno en conversaciones multi-turno. El modelo recibe el historial completo de un dialogo junto con sus propias predicciones anteriores y asigna una etiqueta de crisis unicamente al turno actual del usuario, siguiendo un esquema estructurado de etiquetas Alert-Confirm (alert_ongoing, alert_past, confirm_SI_passive_ongoing, confirm_SH_past, confirm_DV_ongoing, confirm_RA_past).

El entrenamiento se realizo sobre el corpus sintetico CRADLE-Dialogue, compuesto por 3.058 dialogos (48.557 turnos) generados a partir de posts de Reddit mediante GPT-5 y anotados con etiquetas estructuradas. Se trata de un checkpoint de la epoca 2 de un entrenamiento de 3 epocas (paso 3208), con los mismos datos, prompt e hiperparametros que la version basada en Qwen3-32B; solo cambia el modelo base.

El modelo es relevante para investigacion en NLP clinico porque aborda una tarea de clasificacion multi-etiqueta sensible al contexto conversacional, donde la prediccion depende del historial previo y de las propias salidas del modelo. Su licencia Apache 2.0 y su naturaleza de pesos abiertos facilitan la reproducibilidad, aunque el autor lo restringe explicitamente a fines de investigacion y lo declara no apto como sustituto de evaluacion o intervencion profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5` en Hugging Face) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso max_sequence_length de 4096 |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Metodo de ajuste | Full fine-tune (sin LoRA) |
| Tamano del repositorio | 54,7 GB |
| Epoca del checkpoint | 2 de 3 (paso 3208) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only de 27,36 mil millones de parametros, y se somete a un ajuste fino completo de todos los pesos, sin LoRA ni adaptadores. El entrenamiento se ejecuto durante 3 epocas, publicandose este checkpoint correspondiente a la epoca 2 (paso 3208), con tasa de aprendizaje 5e-6, scheduler coseno con warmup (ratio 0,05), batch size 1 por dispositivo, acumulacion de gradientes de 16, longitud maxima de secuencia de 4096 tokens y precision bfloat16 sobre 2 GPU NVIDIA H200.

Los datos de entrenamiento son el corpus sintetico CRADLE-Dialogue: 3.058 dialogos y 48.557 turnos generados a partir de posts de Reddit mediante GPT-5 y anotados con etiquetas estructuradas Alert-Confirm. La tarea es de clasificacion multi-etiqueta a nivel de turno: en cada inferencia se proporciona el historial completo del dialogo mas las predicciones previas del propio modelo, y la salida debe ser exactamente una linea con la etiqueta o etiquetas separadas por "; ". El prompt de sistema fuerza al modelo a devolver solo la etiqueta, sin razonamiento ni markdown, aunque la plantilla de chat de Qwen3.8 abre un bloque de pensamiento que debe recortarse tras `</think>` en postprocesado. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni innovaciones de atencion o decodificacion especulativa.

## Capacidades

- Deteccion de crisis de salud mental a nivel de turno en dialogos multi-turno.
- Clasificacion multi-etiqueta con seis categorias: alert_ongoing, alert_past, confirm_SI_passive_ongoing, confirm_SH_past, confirm_DV_ongoing y confirm_RA_past, ademas de la clase `none`.
- Uso del historial conversacional completo y de las predicciones previas del propio modelo como contexto para la etiqueta del turno actual.
- Salida estrictamente controlada: una sola linea por llamada, sin comentarios ni markdown, segun el prompt de sistema.
- Soporte de la plantilla de chat de Qwen3.8 con bloque de pensamiento (`</think>`), que debe eliminarse en postprocesado.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio para este ajuste.

## Casos de uso

- Investigacion en NLP clinico: evaluar la deteccion automatica de senales de crisis en transcripciones de conversaciones, usando el modelo como anotador de referencia frente a anotadores humanos.
- Moderacion de comunidades online: procesar hilos de foros o chats de apoyo entre iguales turno a turno para marcar mensajes que requieran revision humana, aprovechando el contexto acumulado del dialogo.
- Sistemas de triaje en lineas de ayuda: clasificar cada mensaje entrante de un usuario con etiquetas de alerta o confirmacion para priorizar la intervencion de un operador humano.
- Generacion de datos etiquetados: usar las predicciones del modelo para preanotar corpus de dialogos y acelerar la revision manual en proyectos de anotacion clinica.
- Evaluacion de sistemas conversacionales de salud mental: emplear el modelo como componente de evaluacion que detecta si un chatbot genera respuestas ante turnos de riesgo.
- Analisis retrospectivo de conversaciones: aplicar el modelo sobre historiales almacenados para estudiar la evolucion temporal de senales de crisis (etiquetas `_ongoing` frente a `_past`) en un mismo usuario.
- Investigacion comparativa de modelos base: al compartir datos, prompt e hiperparametros con la version Qwen3-32B, permite aislar el efecto del modelo base en el rendimiento de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55 GB solo para pesos (27,36 mil millones de parametros a 2 bytes), mas memoria para el contexto y el estado de activaciones; en la practica requiere GPUs de 80 GB o configuraciones multi-GPU.
- En cuantizacion de 8 bits, estimacion orientativa de unos 28-30 GB de pesos; en 4 bits, unos 14-16 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: NVIDIA H200 (usadas en el entrenamiento), H100 y A100 de 80 GB. El modelo completo no cabe en una RTX 4090 de 24 GB en bfloat16.
- Despliegue: la model card solo documenta inferencia con `transformers` (`AutoModelForCausalLM`, `torch_dtype=bfloat16`, `device_map="auto"`, `trust_remote_code=True`). No se confirman opciones como vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cradle-dialogue-qwen3.8-27b-2epoch | 27,36 mil millones | no disponible (entrenado a 4096) | Deteccion de crisis a nivel de turno | apache-2.0 | Hugging Face |
| SungJoo/cradle-dialogue-qwen3-32b-2epoch | no disponible en la informacion proporcionada | no disponible | Deteccion de crisis a nivel de turno (mismos datos, prompt e hiperparametros) | no disponible en la informacion proporcionada | Hugging Face |
| Qwen/Qwen3.8-27B (modelo base) | 27,36 mil millones | no disponible | Modelo generalista | no disponible en la informacion proporcionada | Hugging Face |

La comparacion con alternativas de la misma categoria fuera del proyecto CRADLE no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo destinado exclusivamente a investigacion en NLP clinico y deteccion de crisis; el autor lo declara no sustituto de evaluacion profesional ni de intervencion en crisis.
- Riesgo de alucinacion y de falsos negativos o positivos en una tarea de alta sensibilidad; cualquier uso real exige supervision humana.
- Entrenado solo en ingles; no se garantiza comportamiento en otros idiomas.
- Datos de entrenamiento sinteticos generados con GPT-5 a partir de Reddit: posibles sesgos de la fuente original y del generador, y posible desajuste con poblaciones clinicas reales.
- La prediccion depende de las propias predicciones anteriores del modelo, por lo que errores tempranos pueden propagarse a lo largo del dialogo.
- Requiere recortar el bloque de pensamiento (`</think>`) en postprocesado; sin ese paso la salida no cumple el formato de una sola linea.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero la intencion declarada del autor restringe el uso a investigacion; conviene revisar las implicaciones eticas y regulatorias antes de cualquier despliegue en produccion.
- No se publican resultados de benchmarks ni evaluaciones independientes, lo que impide verificar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SungJoo/cradle-dialogue-qwen3.8-27b-2epoch
- Dataset CRADLE-Dialogue: https://huggingface.co/datasets/SungJoo/Cradle-Dialogue
- Version basada en Qwen3-32B: https://huggingface.co/SungJoo/cradle-dialogue-qwen3-32b-2epoch
- Benchmark CRADLE-Bench: https://huggingface.co/datasets/SungJoo/CRADLE-Bench
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
