# violetxi/qwen35-9b-harvey-v4-notes-conditioned-1m

## Resumen

qwen35-9b-harvey-v4-notes-conditioned-1m es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi (Violet Xiang) en Hugging Face. Se trata de un checkpoint de servicio derivado del experimento "1M notes + note-conditioned trajectory" del linaje de trabajo Harvey, centrado en el estudio de internalizacion de conocimiento en un corpus sintetico de despacho de abogados (Calderwood & Harkness). El modelo no es un lanzamiento de proposito general, sino un artefacto de investigacion que documenta una configuracion concreta de entrenamiento supervisado.

El checkpoint publicado corresponde a checkpoint-60, tras 2 epocas y 60 actualizaciones del optimizador. La mezcla de tokens supervisados es 70% notas y 30% trayectorias condicionadas por notas, sin regularizacion KL: 700.033 etiquetas de notas y 299.587 etiquetas de asistente, un total de 999.620 tokens supervisados antes del desplazamiento causal (999.558 despues) por epoca. El modelo tiene 9.653.104.368 parametros y se distribuye en safetensors con licencia Apache 2.0.

Su relevancia es acotada y muy especifica: sirve como punto de comparacion dentro de una familia de variantes (30M y 100M de notas, con distintos coeficientes KL) para medir como la internalizacion de notas afecta al comportamiento de un agente con presupuesto limitado de turnos. Los resultados publicados son deliberadamente bajos y se presentan como material de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (etiquetada como qwen3_5; carga mediante AutoModelForImageTextToText) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; la secuencia empaquetada usada en entrenamiento fue de 16.384 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors; no se listan GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards composites, 775 tensores) |
| Modelo base | Qwen/Qwen3.5-9B, revision c202236235762e1c871ad0ccb60c8ee5ba337b9a |
| Tamano del repositorio | 38,6 GB |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna mas alla de la etiqueta qwen3_5 y de que la carga se realiza con AutoModelForImageTextToText, lo que sugiere una clase de modelo multimodal heredada del base. El ajuste es un full fine-tune: se entrenan 427 tensores de texto, mientras que 348 tensores auxiliares del modelo base se preservan sin modificar. El export final contiene 775 tensores distribuidos en cuatro shards, verificados como finitos y reconstruidos a partir del checkpoint de servicio empleado en las generaciones historicas de evaluacion.

El entrenamiento usa prediccion causal de siguiente token para las notas y aplica la perdida de trayectoria sobre las etiquetas del asistente. La configuracion concreta es: secuencia empaquetada de 16.384 tokens, batch global de 4 filas empaquetadas, acumulacion de gradiente de 2, tasa de aprendizaje de 5e-06 y un schedule total de 2 epocas / 60 actualizaciones. La exposicion acumulada de tokens en este checkpoint, tras el desplazamiento causal, es de 1.999.116. La innovacion metodologica del linaje es el condicionamiento por notas combinado con trayectorias de agente, en lugar de un simple ajuste sobre texto plano; en esta revision se elimina la regularizacion KL presente en variantes hermanas.

## Capacidades

- Generacion de texto conversacional en ingles, con el pipeline declarado como text-generation.
- Razonamiento de agente multiturno bajo un protocolo historico de herramientas glob/grep/read, con presupuestos de 5 y 20 turnos en la evaluacion publicada.
- Condicionamiento por notas: el modelo fue entrenado para producir y explotar notas internas como parte de su proceso de razonamiento.
- Internalizacion de un corpus especifico (corpus sintetico de despacho de abogados, linaje Harvey LAB), objeto del estudio.
- Tareas de recuperacion cerrada (closed-book recall): se publicaron 7.933 sondas de recuperacion evaluadas de forma determinista.
- Soporte de imagenes: la etiqueta image-text-to-text y la clase AutoModelForImageTextToText apuntan a entrada multimodal, aunque no se documentan capacidades de vision en la model card.
- Soporte de tool calling / function calling: no disponible como capacidad declarada explicitamente; el protocolo de evaluacion usa herramientas de lectura de ficheros (glob/grep/read).
- Capacidades multilingues: solo ingles declarado.
- Modo thinking: la evaluacion historica se etiqueta como think, con generaciones habilitadas para razonamiento extendido.
- Capacidades de codigo, matematicas o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: el modelo es un punto de medida dentro de un barrido controlado (variantes de 30M y 100M de notas, con KL 0,01 y 0,1). Se usaria para comparar como el volumen de notas supervisadas y la regularizacion cambian la tasa de acierto de un agente.
- Evaluacion de agentes con presupuesto de turnos: al estar evaluado con presupuestos de 5 y 20 turnos bajo un protocolo de lectura de ficheros, sirve como referencia para estudiar el coste marginal de turnos adicionales (2,30% frente a 3,10%).
- Analisis de documentos legales sinteticos: el entrenamiento se realizo sobre un corpus de despacho de abogados, por lo que puede emplearse en prototipos de recuperacion y sintesis sobre ese dominio, siempre como banco de pruebas.
- Recuperacion cerrada como sonda de memorizacion: las 7.933 sondas de recall permiten medir cuanto del corpus se ha memorizado frente a cuanto se recupera por contexto.
- Destilacion y generacion de datos sinteticos: los checkpoints intermedios (epoch1, checkpoint-30) y finales pueden usarse para producir trayectorias etiquetadas que alimenten experimentos posteriores.
- Base para estudios de ablacion de hiperparametros: al publicarse el schedule exacto (5e-06, 60 updates, batch 4x2), es replicable para comparar con las variantes kl-0p01 y kl-0p1.
- Servicio interno de bajo riesgo: con las tasas de exito publicadas (2,30%-3,10% pasando todos los criterios), solo seria defendible en entornos internos de investigacion donde el fallo sea tolerable.

## Benchmarks y rendimiento

La evaluacion publicada no usa benchmarks estandar como MMLU, HumanEval o GSM8K. Se trata de una regradacion historica con gpt-5.6-sol sobre la rubrica original de Harvey por criterio. La metrica es la fraccion de intentos que superan todos los criterios (250 tareas, 4 muestras por tarea).

| Presupuesto de turnos | Tasa de exito en todos los criterios | Conjunto de evaluacion |
|---|---:|---|
| 5 | 2,30% | violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-1m-historical-5t-think |
| 20 | 3,10% | violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-1m-historical-20t-think |

No se ejecuto nueva inferencia de benchmark para esta publicacion; los resultados proceden de generaciones historicas regradadas con el protocolo de 5/20 turnos. Ademas, existen 7.933 sondas de recuperacion cerrada con puntuacion determinista y sin juez GPT, pero los resultados numericos de esas sondas no se recogen en la informacion disponible. La procedencia completa y la incertidumbre estan en evaluation_summary.json.

## Requisitos de hardware

- VRAM estimada para los pesos en precision completa: en BF16/FP16, los 9.653 millones de parametros ocupan aproximadamente 19,3 GB, por lo que se necesitan al menos 24 GB de VRAM contando cache KV y activaciones.
- Cuantizacion a 8 bits: alrededor de 9,7 GB de pesos, viable en GPU de 16 GB con margen limitado.
- Cuantizacion a 4 bits: alrededor de 5,5-6,0 GB de pesos, viable en GPU consumer de 8-12 GB, sujeto a que exista una conversion GGUF, que no se publica en este repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090, 4080 o A6000 para INT8; GPU de 8-12 GB solo en INT4.
- Cabe en GPU consumer: si, en BF16 en una RTX 4090 o RTX 3090 de 24 GB; en INT4 en tarjetas de 8 GB o mas.
- Opciones de despliegue: la carga oficial documentada es transformers (AutoTokenizer + AutoModelForImageTextToText, con dtype="auto" y device_map="auto"). El repositorio esta marcado como endpoints_compatible, por lo que es desplegable en Inference Endpoints. No se publican artefactos GGUF, por lo que llama.cpp y Ollama requeririan conversion propia. vLLM y TGI no estan documentados en la model card.
- Latencia y throughput: no disponible. La secuencia empaquetada de entrenamiento fue de 16.384 tokens, dato que no debe confundirse con la longitud de contexto de inferencia.

## Comparativa con modelos similares

La informacion disponible describe una familia de variantes del mismo linaje, pero no aporta sus numeros de parametros ni resultados de benchmark, salvo la coincidencia de tamano del modelo base.

| Modelo | Base | Enfoque | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| violetxi/qwen35-9b-harvey-v4-notes-conditioned-1m (este) | Qwen3.5-9B | 1M notas + trayectorias condicionadas, sin KL | apache-2.0 | 2,30% (5 turnos) / 3,10% (20 turnos) |
| violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p01 | Qwen3.5-9B | 30M notas con KL 0,01 | apache-2.0 | no disponible |
| violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01 | Qwen3.5-9B | 100M notas con KL 0,01 | apache-2.0 | no disponible |
| violetxi/qwen35-9b-wmrl-v4-kl-mix30m | Qwen3.5-9B | Internalizacion world-model, mezcla KL 30M, full fine-tune sobre corpus Calderwood & Harkness | apache-2.0 | no disponible |
| Qwen/Qwen3.5-9B (base) | - | Modelo base sin ajuste | no disponible | no disponible |

No se dispone de datos comparativos frente a modelos de otras familias del mismo rango de tamano (por ejemplo, alternativas de ~9B de otros desarrolladores), ya que la informacion proporcionada no los incluye.

## Limitaciones y advertencias

- Tasas de exito muy bajas: 2,30% a 5 turnos y 3,10% a 20 turnos pasando todos los criterios. No es un modelo apto para tareas de produccion sin validacion exhaustiva.
- Especificidad extrema del dominio: entrenado sobre un corpus sintetico de despacho de abogados; el comportamiento fuera de ese dominio no esta caracterizado.
- Monolingue: solo ingles declarado. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera pobre.
- Riesgo de alucinacion: no se publican medidas de calibracion ni de fidelidad factual mas alla de las sondas de recuperacion cerrada, cuyos resultados numericos no se detallan.
- Sesgos conocidos: no disponible. El corpus de entrenamiento es sintetico y no se documenta su composicion demografica o tematica.
- Longitud de contexto de inferencia no disponible: no debe asumirse que los 16.384 tokens del empaquetado de entrenamiento sean la ventana de servicio.
- Fecha de creacion indicada como 2026-09-23, posterior a la fecha de referencia habitual; la model card menciona un juez gpt-5.6-sol y un modelo base Qwen3.5-9B. Conviene verificar la procedencia y las revisiones SHA-256 antes de cualquier uso.
- Evaluacion regradada con juez automatico: los resultados dependen de gpt-5.6-sol y de la rubrica Harvey, no de una evaluacion humana independiente.
- Procedencia incompleta: las trazas de open-book en bruto permanecen en local y no se publican.
- Licencia: apache-2.0 para este repositorio, lo que en principio permite uso comercial, pero la licencia del modelo base Qwen3.5-9B no se detalla en la informacion proporcionada y debe comprobarse por separado.
- No se publican pesos cuantizados ni formatos alternativos, lo que obliga a convertir si se quiere desplegar en entornos con poca VRAM.
- Very pocas descargas (15) y cero likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-1m
- README de evaluaciones Harvey (2026-09-23): https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-1m/blob/main/evals/harvey-20260923/README.md
- Dataset de sondas de recuperacion cerrada: https://huggingface.co/datasets/violetxi/harvey-eval-recall-qwen35-9b-notes70-notecondtraj30-1m-think
- Dataset de evaluacion historica a 5 turnos: https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-1m-historical-5t-think/tree/8ed4fdec5853366efdcdde5ec4ad1d73e1ae9c82
- Dataset de evaluacion historica a 20 turnos: https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-1m-historical-20t-think/tree/7abd1786d6007678982818d0ac3420d4829aec8a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante hermana 30M con KL 0,01: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p01
- Variante hermana 100M con KL 0,01: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01
- Variante hermana 30M con KL 0,1 (FriendliAI): https://friendli.ai/models/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p1
- Variante hermana 100M con KL 0,1 (FriendliAI): https://friendli.ai/models/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p1
- Variante wmrl-v4-kl-mix30m (ficha en Savrn): https://savrn.com/models/qwen35-9b-wmrl-v4-kl-mix30m
