# violetxi/qwen35-9b-harvey-v4-notes-conditioned-10m

## Resumen

qwen35-9b-harvey-v4-notes-conditioned-10m es un ajuste fino completo (full-model) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi. Se trata de un checkpoint de servicio orientado a un experimento muy concreto: internalizacion de notas mediante un entrenamiento condicionado por notas, con una mezcla de tokens supervisados del 70 % procedentes de etiquetas de notas y del 30 % de etiquetas de asistente en trayectorias condicionadas por esas notas, y sin regularizacion KL. El modelo tiene 9.653.104.368 parametros y se distribuye en safetensors dentro de un repositorio de 38,6 GB.

El checkpoint publicado es checkpoint-612, resultado de 2 epocas y 612 actualizaciones del optimizador, con una exposicion total de 20.001.676 tokens supervisados tras el desplazamiento causal. La relevancia del modelo es principalmente de investigacion: documenta de forma inusualmente detallada la procedencia del entrenamiento, la verificacion de la exportacion (775 tensores en 4 shards, 427 tensores de texto entrenados y 348 tensores auxiliares del modelo base preservados) y los artefactos de evaluacion, entre ellos sondas de recuerdo cerradas con puntuacion determinista.

Se trata de un artefacto experimental con un volumen de descargas muy bajo (8 descargas, 0 likes en el momento de la consulta) y con tasas de exito bajas en su propia evaluacion de agente. El autor solo declara soporte de ingles y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; checkpoint completo de Qwen3.5-9B (tags `qwen3_5`, `image-text-to-text`, `text-generation`) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; el entrenamiento uso secuencias empaquetadas de 16.384 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards compuestos, 775 tensores) |
| Modelo base | Qwen/Qwen3.5-9B, revision c202236235762e1c871ad0ccb60c8ee5ba337b9a |
| Revisiones publicadas | `main`, `final`, `checkpoint-612` (epoca 2); `epoch1`, `checkpoint-306` (epoca 1) |
| Libreria | transformers |
| Tamano del repositorio | 38,6 GB |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base mas alla de su identificacion como Qwen3.5-9B y de las etiquetas asociadas (`qwen3_5`, `image-text-to-text`), que apuntan a una familia transformer con capacidad multimodal de entrada imagen-texto. El ajuste publicado es un checkpoint completo: se entrenaron 427 tensores de texto y se preservaron 348 tensores auxiliares del modelo base, manteniendo el dtype de servicio fijado. La carga verificada por el autor se realiza con `AutoModelForImageTextToText.from_pretrained`.

El entrenamiento uso 10.001.435 tokens supervisados antes del desplazamiento causal, de los cuales 7.000.049 corresponden a etiquetas de notas y 3.001.386 a etiquetas de asistente procedentes de trayectorias condicionadas por notas; tras el desplazamiento causal quedan 10.000.838 tokens supervisados por epoca. Las notas se entrenan con prediccion causal del siguiente token y la perdida de trayectoria se aplica a las etiquetas de asistente. La configuracion incluye longitud de secuencia empaquetada de 16.384, lote global de 4 filas empaquetadas, acumulacion de gradiente de 2, tasa de aprendizaje 5e-06 y un calendario de 2 epocas / 612 actualizaciones, sin regularizacion KL. El autor verifica que todos los valores tensoriales son finitos y que la exportacion final conserva los pesos de servicio usados en las generaciones de evaluacion historicas.

## Capacidades

- Generacion de texto conversacional en ingles (`text-generation`, `conversational`).
- Ejecucion de tareas de agente sobre repositorios de archivos mediante el protocolo historico `glob` / `grep` / `read`, con presupuestos de 5 y 20 turnos.
- Internalizacion de notas: el modelo se entreno de forma condicionada por notas, con el objetivo declarado de internalizar ese conocimiento.
- Recuerdo en libro cerrado, evaluado con 7.933 sondas de recuerdo y puntuacion determinista sin juez GPT.
- Entrada imagen-texto segun la etiqueta `image-text-to-text` del repositorio y la clase de carga `AutoModelForImageTextToText`; no se documenta en la model card un uso de vision especifico ni su rendimiento.
- No se documenta soporte explicito de function calling, thinking mode, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: reproducir el experimento de mezcla 70/30 de notas y trayectorias condicionadas para estudiar como un ajuste fino completo asimila informacion de notas frente a un condicionamiento en contexto.
- Estudio de olvido catastrofico y preservacion de pesos base: el checkpoint conserva 348 tensores auxiliares del modelo base, lo que permite analizar que componentes se entrenaron y cuales se mantuvieron intactos.
- Evaluacion de agentes de exploracion de codigo: el modelo esta entrenado y evaluado con el protocolo `glob` / `grep` / `read`, por lo que sirve como linea base de bajo presupuesto (5 y 20 turnos) para tareas de localizacion de informacion en repositorios.
- Sondas de recuerdo en libro cerrado: las 7.933 sondas con puntuacion determinista permiten medir memorizacion de contenido inyectado sin depender de un juez externo.
- Comparacion de metodologias de ajuste: sirve como punto de referencia frente a variantes con y sin regularizacion KL, dado que esta revision declara ausencia de KL.
- Auditoria de exportacion de checkpoints: el procedimiento documentado (comparacion de los 427 tensores entrenados contra el checkpoint guardado convertido al dtype de servicio, verificacion de finitud y hashes remotos) es reutilizable como plantilla para validar publicaciones de modelos.
- Analisis de sensibilidad al presupuesto de turnos: con datos a 5 y 20 turnos, permite estudiar como escala el exito de la tarea al aumentar las interacciones, aunque el rendimiento absoluto es bajo.

## Benchmarks y rendimiento

Las generaciones historicas de agente con thinking habilitado se recalificaron con gpt-5.6-sol usando la rubrica original de Harvey por criterio. La metrica es la fraccion de intentos que superan **todos** los criterios, sobre 250 tareas con 4 muestras cada una.

| Presupuesto de turnos | Tasa de paso de todos los criterios | Conjunto de evaluacion |
|---|---:|---|
| 5 | 3,30 % | violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-10m-historical-5t-think |
| 20 | 6,20 % | violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-10m-historical-20t-think |

La generacion uso el protocolo historico de 5/20 turnos con `glob` / `grep` / `read`. El autor indica que no se ejecuto nueva inferencia de benchmark para esta publicacion y que la procedencia completa y la incertidumbre estan en `evaluation_summary.json`. Ademas, se completaron 7.933 sondas de recuerdo en libro cerrado con puntuacion determinista, sin juez GPT; los resultados numericos de esas sondas no se reproducen en la informacion proporcionada. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Pesos completos publicados: 38,6 GB de repositorio en safetensors. Los 9,65 B de parametros en fp32 equivalen a unos 38,6 GB, coherente con el tamano del repositorio; en bf16/fp16 serian aproximadamente 19,3 GB (estimacion).
- VRAM estimada para inferencia (estimaciones a partir del numero de parametros, sin medir por el autor): unos 20 GB en bf16/fp16 solo para pesos, mas cache KV y activaciones; unos 39 GB en fp32.
- GPU de datacenter: A100 40 GB, A100 80 GB y H100 son opciones razonables; con 80 GB se puede cargar en fp32 sin cuantizacion.
- GPU de consumo: una RTX 4090 de 24 GB queda muy justa en bf16 (unos 19,3 GB de pesos), con poco margen para cache KV a contexto largo; seria necesario cuantizar u offload.
- Opciones de despliegue: la ruta verificada en la model card es transformers con `AutoTokenizer` y `AutoModelForImageTextToText`, `dtype="auto"` y `device_map="auto"`. No se documenta compatibilidad verificada con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento documentado |
|---|---|---|---|---|---|
| qwen35-9b-harvey-v4-notes-conditioned-10m | 9,65 B | no disponible (entrenamiento con 16.384 tokens empaquetados) | apache-2.0 | en | 3,30 % a 5 turnos y 6,20 % a 20 turnos (Harvey, todos los criterios) |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |

No se dispone de datos en la informacion proporcionada para comparar con otras alternativas de la misma categoria (por ejemplo, otros modelos abiertos de 8-9 B orientados a agentes o a generacion de texto). No se han incluido cifras de terceros para no introducir datos no verificados.

## Limitaciones y advertencias

- Rendimiento absoluto bajo en la propia evaluacion del autor: 3,30 % de paso de todos los criterios a 5 turnos y 6,20 % a 20 turnos. No es un modelo apto para produccion en tareas de agente sin un ajuste o filtrado adicional.
- La evaluacion se recalifico con gpt-5.6-sol sobre generaciones historicas; no se ejecuto inferencia nueva para esta publicacion, por lo que las cifras describen un checkpoint previo reconstruido, no una medicion fresca.
- La rubrica exige superar todos los criterios de cada tarea, una metrica muy estricta que no equivale a utilidad parcial; un 6,20 % no implica necesariamente un fallo total en el 93,80 % restante.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- No se documentan sesgos conocidos, comportamiento de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- No se publican datos de contexto maximo del modelo; el valor de 16.384 corresponde a la longitud de secuencia empaquetada del entrenamiento, no necesariamente a la ventana de inferencia.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que el usuario debe verificar por separado.
- Volumen de adopcion muy bajo (8 descargas, 0 likes en el momento de la consulta) y creado en septiembre de 2026; no hay comunidad que haya validado el artefacto.
- Es un artefacto de investigacion con nomenclatura especifica de un experimento interno (notas, trayectorias condicionadas, presupuestos de turnos); reutilizarlo fuera de ese contexto requiere validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-10m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Indice de evaluaciones y enlaces: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-10m/blob/main/evals/harvey-20260923/README.md
- Dataset de evaluacion (5 turnos): https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-10m-historical-5t-think/tree/9e6707acf9c0bd72813dbc929e7c7d0953114f98
- Dataset de evaluacion (20 turnos): https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-10m-historical-20t-think/tree/2c11d425532674b8073437c165ff584b65b5c288
- Dataset de sondas de recuerdo: https://huggingface.co/datasets/violetxi/harvey-eval-recall-qwen35-9b-notes70-notecondtraj30-10m-think

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion del repositorio en HuggingFace.
