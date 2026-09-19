# wangyuzhe/whisper-small-dv

## Resumen

Whisper Small DV (identificador `wangyuzhe/whisper-small-dv`) es un ajuste fino del modelo `openai/whisper-small` realizado por el usuario wangyuzhe sobre el corpus de conversación en dialecto shanghainés `TingChen-ppmc/Shanghai_Dialect_Conversational_Speech_Corpus`. Se trata, por tanto, de un modelo de reconocimiento automático del habla (ASR) especializado en una variedad dialectal del chino, no de un modelo de propósito general. El nombre interno de la model card es "Whisper Small Fine-tuned on 不懂上海话的老王".

El modelo parte de la arquitectura encoder-decoder de tipo transformer de Whisper, con 241.734.912 parámetros totales (aproximadamente 244 M) y un peso en disco de 1,0 GB en formato safetensors. Whisper procesa audio en ventanas de 30 segundos y fue preentrenado por OpenAI sobre un corpus multilingüe débilmente supervisado de 680.000 horas; este ajuste concreto solo declara el idioma `zh` y está orientado al shanghainés.

Su relevancia es limitada pero concreta: los dialectos chinos distintos del mandarín (wu, yue, min, etc.) están muy poco representados en los corpus ASR públicos, por lo que cualquier ajuste fino sobre ellos aporta recursos escasos. No obstante, el rendimiento reportado por el propio autor es todavía modesto (CER del 32,75 % en el conjunto de evaluación) y el repositorio no tiene descargas ni likes en el momento de la consulta, además de carecer de documentación de uso, limitaciones o descripción del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper del modelo base `openai/whisper-small`) |
| Parametros totales | 241.734.912 (datos reales de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (arquitectura heredada del modelo base); contexto de texto del decoder: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se declaran versiones GGUF, int8 ni otras) |
| Idiomas soportados | `zh` (segun la etiqueta de idioma de la model card); uso previsto para dialecto shanghaines |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tambien compatible con transformers; repo de 1,0 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de `openai/whisper-small`: un transformer encoder-decoder entrenado para transcripcion de audio, donde el encoder consume representaciones log-Mel del audio y el decoder genera texto de forma autorregresiva. El ajuste fino no modifica la arquitectura, solo los pesos, y se ha realizado con la libreria Transformers 5.16.1 y PyTorch 2.11.0+cu128 sobre el corpus `TingChen-ppmc/Shanghai_Dialect_Conversational_Speech_Corpus`, un conjunto de habla conversacional en shanghaines.

Los hiperparametros declarados en la model card son: tasa de aprendizaje 1e-05, tamaño de lote de entrenamiento y evaluacion de 16, semilla 42, optimizador `AdamW` con variante `torch fused` y betas (0,9; 0,999), epsilon 1e-08, planificador `constant_with_warmup` con 50 pasos de calentamiento, 500 pasos de entrenamiento totales y precision mixta nativa (Native AMP). No se documenta el numero exacto de tokens ni de horas de audio utilizadas, ni si hubo etapas de RLHF o DPO (en ASR no son habituales y no se mencionan). No se declara ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni mecanismos similares).

## Capacidades

- Transcripcion de voz a texto (pipeline `automatic-speech-recognition`) para audio en chino, con enfasis en shanghaines conversacional.
- Reconocimiento sobre audio de tipo conversacion espontanea, no solo habla leida o limpia, dado el corpus de ajuste.
- Hereda del modelo base la capacidad de procesar segmentos de audio de hasta 30 segundos y de encadenar segmentos para audios mas largos mediante el pipeline de Transformers.
- Soporte multilingue: el modelo base `openai/whisper-small` es multilingue, pero este ajuste solo declara `zh`; no se garantiza el mantenimiento del rendimiento en otros idiomas tras el ajuste fino.
- Tool calling / function calling: no soportado (no es una capacidad de un modelo ASR).
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades especiales (modo thinking, vision, audio generativo): no disponibles; el modelo solo realiza transcripcion.
- Marcas de tiempo a nivel de segmento: tecnicamente posibles con el pipeline de Whisper, pero no documentadas ni validadas por el autor para este ajuste.

## Casos de uso

- Transcripcion de entrevistas y conversaciones en shanghaines: el modelo esta ajustado especificamente sobre habla conversacional en este dialecto, por lo que es adecuado para digitalizar grabaciones de campo, historia oral o entrevistas donde los hablantes usan shanghaines de forma espontanea.
- Investigacion en dialectologia china: permite generar transcripciones automaticas de corpus dialectales que despues un linguista puede corregir, reduciendo el coste de la anotacion manual frente a transcribir desde cero.
- Preprocesado de datos para entrenar modelos posteriores: las transcripciones generadas pueden servir como pseudoetiquetas para construir corpus mayores de shanghaines, siempre que se revise la calidad dado el CER superior al 30 %.
- Subtitulado de contenido audiovisual local: aplicable a videos o podcasts en shanghaines donde no existe subtitulado previo, con revision humana obligatoria por la tasa de error.
- Base para un ajuste adicional con mas datos: al ser un `whisper-small` ya adaptado al dominio dialectal, puede actuar como punto de partida para un segundo ajuste con un corpus mayor o con vocabulario especifico.
- Prototipado y evaluacion comparativa de ASR dialectal: util como referencia en experimentos academicos que comparen estrategias de adaptacion de Whisper a dialectos chinos, dado que publica las curvas de perdida y CER por paso.
- Sistemas de asistencia a la transcripcion en tiempo casi real en entornos con recursos limitados, ya que el tamaño de 244 M de parametros permite ejecucion en CPU o en GPU de gama baja.

## Benchmarks y rendimiento

El `model-index` de la model card no contiene resultados (`results: []`). Los unicos datos numericos publicados son las metricas de evaluacion y la evolucion del entrenamiento declaradas por el autor:

| Metrica (conjunto de evaluacion) | Valor |
|---|---|
| Loss | 0,6211 |
| CER (character error rate) | 32,7486 |
| CER ortho | 33,3881 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Paso | Validation loss | CER ortho | CER |
|---|---|---|---|---|---|
| 0,9990 | 0,6024 | 100 | 0,9789 | 53,6472 | 53,2233 |
| 0,5426 | 1,2048 | 200 | 0,7389 | 41,0817 | 40,5007 |
| 0,4840 | 1,8072 | 300 | 0,6436 | 38,6281 | 38,0243 |
| 0,2562 | 2,4096 | 400 | 0,6285 | 34,8212 | 34,2246 |
| 0,2487 | 3,0120 | 500 | 0,6211 | 33,3881 | 32,7486 |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar, y no procede aplicarlos a un modelo ASR. No hay datos de WER/CER frente a `openai/whisper-small` sin ajustar en el mismo corpus.

## Requisitos de hardware

- VRAM estimada: en FP16, los 241,7 M de parametros ocupan aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o mas. En cuantizacion int8 el peso baja a alrededor de 0,25 GB, aunque el repositorio no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este modelo. Para lotes grandes, una GPU con 8-16 GB permite un throughput alto.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1060 6 GB en adelante). Tambien es viable en CPU, con mayor latencia.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, vLLM (soporta Whisper), TGI, y mediante conversion a `faster-whisper`/CTranslate2 o `whisper.cpp` si se generan los pesos en el formato correspondiente. No se publican artefactos GGUF ni cuantizados en el repositorio.
- Latencia y throughput: no disponible. El autor no publica mediciones de velocidad ni de RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas declarados | Licencia | Entity/observaciones |
|---|---|---|---|---|---|
| `wangyuzhe/whisper-small-dv` | 241,7 M | 30 s (heredada) | `zh` | apache-2.0 | CER 32,75 en el corpus de evaluacion; 0 descargas |
| `openai/whisper-small` | 244 M | 30 s | Multilingue (segun OpenAI) | apache-2.0 | Modelo base; no ajustado a shanghaines |
| `openai/whisper-medium` | 769 M | 30 s | Multilingue (segun OpenAI) | apache-2.0 | Mayor capacidad, mayor coste de inferencia |
| `openai/whisper-large-v3` | 1.550 M | 30 s | Multilingue (segun OpenAI) | apache-2.0 | Referencia de maxima calidad de la familia; requiere mas VRAM |

Las cifras de parametros de los modelos de OpenAI corresponden a su documentacion publica. No se dispone de comparaciones de CER en el mismo corpus dialectal, por lo que no es posible afirmar si este ajuste supera o no a los modelos base en shanghaines.

## Limitaciones y advertencias

- Tasa de error elevada: un CER de 32,75 % implica aproximadamente un caracter erroneo de cada tres, lo que hace inviable su uso en produccion sin revision humana.
- Documentacion practicamente inexistente: la model card contiene "More information needed" en las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento.
- Alcance idiomatico muy restringido: solo se declara `zh` y el ajuste esta orientado al shanghaines; el comportamiento en mandarin estandar u otros idiomas no esta documentado y probablemente se haya degradado respecto al modelo base.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible cuando el audio es ruidoso, ininteligible o contiene silencios largos; este riesgo no se mitiga ni se documenta en el repositorio.
- Sesgos: no se declara informacion sobre la composicion demografica del corpus (`Shanghai_Dialect_Conversational_Speech_Corpus`), por lo que no puede evaluarse el sesgo por edad, genero, origen o registro de los hablantes.
- Sobreajuste al dominio: con solo 500 pasos de entrenamiento y una tasa de aprendizaje de 1e-05, el modelo puede comportarse mal en audio fuera del dominio conversacional (lectura, discursos, ruido de fondo).
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del dataset de ajuste antes de explotar comercialmente el modelo.
- Versionado de dependencias muy reciente (Transformers 5.16.1, PyTorch 2.11.0): puede requerir entornos actualizados y no esta probado con versiones anteriores.
- Sin validacion externa: cero descargas y cero likes; no hay evidencia de uso independiente ni evaluaciones de terceros.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (tratan sobre la carpeta AppData de Windows), por lo que no aportan enlaces ni datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangyuzhe/whisper-small-dv
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de ajuste: https://huggingface.co/datasets/TingChen-ppmc/Shanghai_Dialect_Conversational_Speech_Corpus
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos tratan sobre la carpeta AppData de Windows y no guardan relacion con esta ficha.
