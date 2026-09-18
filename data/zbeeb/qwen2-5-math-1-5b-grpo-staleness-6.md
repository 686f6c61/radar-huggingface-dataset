# zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-6

## Resumen

Qwen2.5-Math-1.5B-GRPO-Staleness-6 es un ajuste fino del modelo Qwen/Qwen2.5-Math-1.5B mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). Lo publica el usuario zbeeb en HuggingFace y está pensado como artefacto de investigación sobre entrenamiento con datos off-policy: la variable experimental es el límite de "staleness" (max_off_policy_steps) fijado en 6, es decir, la antigüedad máxima de la política que genera los rollouts respecto a la política que se optimiza.

El modelo conserva la arquitectura del base: un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros totales (aproximadamente 1,5B), embeddings atados (tied embeddings) y ventana de contexto nativa de 4.096 tokens según la configuración de entrenamiento. Se entrenó sobre el subconjunto DAPO de matemáticas de 17.005 filas del autor, con 1.000 actualizaciones y una recompensa determinista que puntúa la equivalencia matemática de la respuesta final.

Su relevancia es doble. Por un lado, documenta de forma inusualmente detallada una ablación de RL para matemáticas a pequeña escala, con configuraciones, manifiestos de exportación y resultados de evaluación en formato legible por máquina. Por otro, es un modelo pequeño y de licencia Apache 2.0, lo que lo hace utilizable en una única GPU de consumo para reproducir experimentos, generar trazas de razonamiento matemático o actuar como componente de verificación en pipelines de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (pesos derivados de Qwen2.5-Math-1.5B) |
| Parametros totales | 1.543.714.304 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de contexto total en entrenamiento; la configuracion posicional nativa se conserva y esta release no configura ni valida extension a 8K. El ejemplo de uso de la model card asume prompts <= 1.024 tokens |
| Tipos de cuantizacion | No disponible: solo se publican pesos completos en safetensors en el dtype guardado (bfloat16 en el ejemplo de uso). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (la licencia del modelo base se incluye sin cambios) |
| Formato de pesos | Safetensors, sharded, exportados sin perdida desde el checkpoint de entrenamiento |
| Tokens de finalizacion (EOS) | 151645 (`<\|im_end\|>`) y 151643 (`<\|endoftext\|>`) configurados en `generation_config.json` |
| Tamano del repositorio | 6,2 GB |
| Modelo base | Qwen/Qwen2.5-Math-1.5B (relacion: finetune) |
| Dataset de entrenamiento | zbeeb/Staleness-GRPO-DAPO-Math-17k (17.005 filas) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: un transformer decoder-only autorregresivo de Qwen2, con embeddings de entrada y salida atados (tied embeddings, verificados en el proceso de exportacion). El checkpoint es un ajuste de parametros completos (full-parameter) partiendo de la revision fijada del base con estado del optimizador nuevo, no una continuacion de ejecuciones con limites de staleness distintos.

El entrenamiento uso GRPO con PrimeRL v0.9.0: 1.000 actualizaciones, batch size 64, group size 8, semilla 42, optimizador AdamW con learning rate 1e-6, 30 actualizaciones de warmup, PPO clip 0.2 y sin penalizacion KL de referencia. El limite de staleness es 6 (`max_off_policy_steps`), un parametro que acota la edad de la politica de rollout durante el entrenamiento y que no afecta a la longitud de decodificacion en inferencia. La topologia de GPUs fue de 2 GPUs de entrenamiento y 1 GPU de inferencia, y el propio autor advierte que la topologia varia entre brazos experimentales, por lo que las comparaciones no son ablaciones puras de staleness.

El contexto de entrenamiento es de 4.096 tokens totales, con hasta 3.072 tokens de completion. La recompensa es determinista y puntua la equivalencia matematica de la respuesta terminal. La exportacion a safetensors se valido con comprobaciones de procedencia del paso 1.000, tensores finitos, recarga estricta, embeddings atados, ida y vuelta del tokenizer y logits de sonda en CPU identicos antes y despues de serializar; el estado del optimizador permanece en el checkpoint de origen.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos con razonamiento paso a paso en formato de conversacion (chat template de Qwen).
- Produccion de respuestas finales en formato `\boxed{...}` o con linea final `Final answer: ...`, tal como se entreno la recompensa.
- Cadenas de razonamiento largas: hasta 3.072 tokens de completion, con decodificacion greedy o por muestreo.
- Capacidad multilingue limitada a ingles y chino, siguiendo al modelo base.
- Uso como generador en pipelines de RL o destilacion de trazas matematicas (generacion de multiples completions por problema a temperatura configurable).
- No hay soporte documentado de tool calling, function calling ni uso de agentes en la informacion disponible.
- No hay capacidades de vision, audio ni modo "thinking" explicito documentado; el razonamiento se emite como texto plano en la completion.

## Casos de uso

- Reproduccion de experimentos de RL con GRPO: sirve como brazo de staleness cap 6 en estudios sobre datos off-policy, ya que el autor publica configuracion de entrenamiento, manifiesto de exportacion y resultados de evaluacion en JSON.
- Generacion de trazas de razonamiento matematico a escala: con vLLM o TGI se pueden muestrear 8 completions por problema (group size 8) a temperatura 0,6 para construir datasets de soluciones o para destilacion.
- Verificacion de respuestas en pipelines de datos: la recompensa de entrenamiento puntua equivalencia matematica del resultado final, por lo que el modelo puede usarse como generador de candidatos que despues se filtran por equivalencia simbolica.
- Evaluacion offline de conjuntos tipo MATH500, AMC o AIME: el modelo esta ajustado especificamente a esos formatos y permite medir exactitud por pregunta o muestreada en un solo nodo.
- Tutoria matematica en ingles o chino: conversaciones de un solo turno o multi-turno corto que caben en 4.096 tokens, con explicacion intermedia y respuesta final marcada.
- Ajuste fino posterior para dominios acotados: al ser un checkpoint de 1,5B con licencia Apache 2.0, es viable reentrenarlo para un temario concreto (calculo, algebra, olimpiadas) en hardware modesto.
- Investigacion educativa sobre RLHF/RLVR a pequena escala: permite estudiar el efecto del tamano del modelo y del limite de staleness sin el coste de un modelo de 7B o mayor.

## Benchmarks y rendimiento

Datos de la ejecucion final de entrenamiento (politica del paso 1.000). Las filas `pass1` usan una unica completion por pregunta (greedy); las filas `sampled` usan 8 completions por pregunta a temperatura 0,6 y reportan exactitud media, no pass@8. MATH500, AMC y AIME usan 3.072 tokens de salida; Minerva y OlympiadBench usan 2.048.

| Benchmark | Completions | Exactitud | Truncado |
|---|---:|---:|---:|
| aime24-pass1 | 30 | 13,33 % | 16,67 % |
| aime24-sampled | 240 | 10,42 % | 10,00 % |
| aime25-pass1 | 30 | 6,67 % | 20,00 % |
| aime25-sampled | 240 | 5,00 % | 5,00 % |
| aime26-sampled | 240 | 7,50 % | 11,25 % |
| amc23-pass1 | 40 | 45,00 % | 2,50 % |
| math500-pass1 | 500 | 62,40 % | 2,40 % |
| minerva-pass1 | 272 | 15,44 % | 19,85 % |
| olympiadbench-pass1 | 675 | 29,63 % | 8,00 % |

Advertencias del propio autor: son resultados de la ejecucion de entrenamiento, no un benchmark nuevo del artefacto exportado ni una comparacion a 8K; los nueve conjuntos finales registran cero errores de evaluacion; los datos de entrenamiento se filtraron contra estas evaluaciones, lo que no descarta contaminacion de preentrenamiento ni duplicados cercanos. No se proporcionan datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB solo de pesos en bfloat16 o float16 (1.543.714.304 parametros x 2 bytes). Hay que sumar activaciones y cache KV; en la practica, entre 4 y 6 GB en bf16 para prompts y salidas dentro del contexto entrenado.
- Cuantizacion estimada por calculo a partir del numero de parametros (no hay ficheros cuantizados publicados): unos 1,6 GB en 8 bits y unos 0,8 GB en 4 bits si se convierte el modelo con herramientas externas.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente en bf16 para una sola secuencia con 3.072 tokens de completion. Para lotes grandes o servidor, A100 40/80 GB, H100 o L40S.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 8 GB o mas y en cuantizacion de 4 bits en tarjetas de 6 GB.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, conversion no publicada por el autor.
- Parada de generacion: si el motor de servicio ignora `generation_config.json`, hay que fijar explicitamente `eos_token_id=[151645, 151643]` y el `pad_token_id` del tokenizer.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-6 | 1,543B | 4.096 tokens de entrenamiento; sin extension 8K validada | Apache 2.0 | Safetensors en HuggingFace; 0 descargas y 0 likes en el momento de la consulta | Tabla de benchmarks de la ejecucion de entrenamiento (ver arriba) |
| Qwen/Qwen2.5-Math-1.5B (modelo base) | 1,5B | Configuracion posicional nativa de Qwen2.5-Math | Apache 2.0 | Safetensors en HuggingFace | No disponible en la informacion proporcionada para comparar directamente |
| Qwen2.5-Math-7B (misma familia, mayor tamano) | 7,6B (aproximado, no verificado en esta busqueda) | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors en HuggingFace | No disponible en la informacion proporcionada |
| DeepSeek-R1-Distill-Qwen-1.5B (alternativa de razonamiento de 1,5B) | 1,5B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Safetensors en HuggingFace | No disponible en la informacion proporcionada |

El autor advierte que el modelo de 3B de la comparativa interna usa Qwen2.5 general, mientras que el de 1,5B usa Qwen2.5-Math, por lo que las diferencias entre familias no son atribuibles solo al tamano. No se han publicado resultados de benchmarks comparativos con otras alternativas en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion sobre matemáticas: no ha pasado por RLHF de seguridad ni por alineamiento conversacional general; no es un asistente de proposito general.
- Idiomas restringidos a ingles y chino; no hay evaluacion publicada en castellano ni en otras lenguas.
- Contexto limitado a 4.096 tokens y sin validacion de extension a 8K. El propio ejemplo oficial asume prompts de 1.024 tokens o menos, lo que deja el resto del presupuesto para la completion.
- Tasas de truncado altas en tareas de razonamiento largo: 16,67 % en aime24-pass1, 20,00 % en aime25-pass1 y 19,85 % en minerva-pass1, lo que indica que muchas respuestas se cortan antes de emitir la respuesta final.
- Exactitud baja en competicion: 6,67 % en aime25-pass1 y 5,00 % en aime25-sampled; apto para investigacion, no para uso en produccion con requisitos de fiabilidad.
- Riesgo de alucinacion en cadenas de razonamiento: el modelo puede producir pasos intermedios plausibles pero incorrectos y llegar a una respuesta mal formada o no comparable.
- Los resultados publicados son de la ejecucion de entrenamiento, no de una reevaluacion del artefacto exportado; el autor lo indica explicitamente.
- Los datos de entrenamiento se filtraron contra los conjuntos de evaluacion, pero esto no establece la ausencia de contaminacion de preentrenamiento ni de todos los duplicados cercanos.
- El limite de staleness 6 solo acota la edad de la politica de rollout durante el entrenamiento; no tiene efecto sobre la decodificacion ni sobre el comportamiento en inferencia.
- Las comparaciones entre brazos experimentales no son ablaciones puras de staleness porque la topologia de GPUs varia entre algunos brazos.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones y avisos del modelo base, cuya licencia se incluye sin cambios en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Revision fijada del modelo base usada en el entrenamiento: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B/tree/4a83ca6e4526a4f2da3aa259ec36c259f66b2ab2
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Configuracion de entrenamiento: training-config.json (en el repositorio de HuggingFace)
- Manifiesto de exportacion: export-manifest.json (en el repositorio de HuggingFace)
- Resultados de evaluacion en formato legible por maquina: evaluation-results.json (en el repositorio de HuggingFace)
- Licencia incluida en el repositorio: LICENSE (en el repositorio de HuggingFace)
- La busqueda web no ha devuelto enlaces relevantes: los unicos resultados obtenidos son paginas genericas de GitHub (inicio de sesion, escritorio, documentacion de integraciones y una lista de nombres turcos) sin relacion con este modelo. No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales.
