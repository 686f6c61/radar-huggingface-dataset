# user06958409348/whisper-tiny-ko-vietnamese-accent

## Resumen

`user06958409348/whisper-tiny-ko-vietnamese-accent` es un ajuste fino de `openai/whisper-tiny` orientado al reconocimiento automatico del habla (ASR) en coreano cuando el hablante es nativo de vietnamita. Lo publica el usuario de HuggingFace `user06958409348` como parte de un proyecto de investigacion sobre equidad e inclusividad en ASR para hablantes no nativos de coreano, un colectivo numeroso en Corea del Sur pero escasamente representado en los corpus de entrenamiento habituales.

El modelo parte de un corpus pequeno y muy especifico: 1.366 enunciados de entrenamiento y 341 de validacion procedentes del conjunto "AI Training Data for Foreign Korean Speech" de AI Hub, restringidos a la subtarea de lectura de textos guiados y con hablantes disjuntos entre train y validacion. El ajuste consistio en 500 pasos con batch size 8 y learning rate 1e-5, seleccionando el checkpoint con menor WER de validacion.

Su relevancia es metodologica mas que de producto: demuestra que un ajuste fino muy corto sobre un modelo tiny puede reducir el WER en validacion del 58,27% al 18,21% en un dominio concreto, aunque la mejora se diluye en el conjunto de test independiente (del 52,73% al 44,27%). El propio autor lo declara no apto para produccion sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con preprocesado log-Mel, heredada de `openai/whisper-tiny` |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base `openai/whisper-tiny` tiene del orden de 39 M de parametros, dato externo a la ficha) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (idioma objetivo del ajuste fino); el modelo base es multilingue, pero la ficha del autor no detalla la cobertura resultante |
| Licencia | No disponible |
| Formato de pesos | No disponible (libreria `transformers`) |

Otros metadatos: pipeline no declarado, 0 descargas y 0 likes en el momento de la consulta, tags `transformers`, `endpoints_compatible`, `region:us`. Fecha de creacion registrada: 2026-09-13; ultima actualizacion: 2026-09-13.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `openai/whisper-tiny`: un transformer encoder-decoder para speech-to-text que consume representaciones log-Mel y genera texto autoregresivamente. El ajuste fino no introduce cambios estructurales; se aplica sobre los pesos preentrenados de Whisper mediante `transformers` (`WhisperProcessor` + `WhisperForConditionalGeneration`).

Los datos proceden del subconjunto de vietnamita (particion de validacion del recurso original) de "AI Training Data for Foreign Korean Speech" de AI Hub. Solo se utilizaron enunciados de tipo "Reading" (lectura de un texto guiado), excluyendo las respuestas libres, y las transcripciones de referencia se tomaron de la columna `ReadingLabelText`. El conjunto de entrenamiento tiene 1.366 enunciados y el de validacion 341, sin solapamiento de hablantes entre ambos. El entrenamiento consta de 500 pasos, batch size 8, learning rate 1e-5 y 50 pasos de warmup, con seleccion del mejor checkpoint por WER de validacion (`load_best_model_at_end=True`, `metric_for_best_model="wer"`). La evaluacion se realizo con inferencia directa mediante `WhisperProcessor` + `WhisperForConditionalGeneration`, no con la API `pipeline()`, para garantizar consistencia entre la linea base y el modelo ajustado. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en coreano para hablantes nativos de vietnamita, en contexto de lectura de textos guiados.
- Reduccion sustancial del error en el dominio de entrenamiento: WER del 18,21% y CER del 9,33% en validacion, frente al 58,27% y 34,97% de la linea base.
- Inferencia compatible con la libreria `transformers` y con el tag `endpoints_compatible` (despliegue via HuggingFace Endpoints).
- Evaluacion reproducible con `WhisperProcessor` y `WhisperForConditionalGeneration`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio mas alla de ASR, ni modo de razonamiento explicito.
- La cobertura multilingue no se detalla en la informacion proporcionada; el ajuste esta especializado en coreano con acento vietnamita.

## Casos de uso

- Investigacion sobre equidad en ASR: medir el WER desagregado por acento y origen del hablante para cuantificar la brecha entre hablantes nativos y no nativos de coreano, usando este modelo como punto de referencia ajustado.
- Transcripcion de llamadas de pedido telefonico: el conjunto de test del propio autor reproduce un escenario de pedidos de pizza y pollo por telefono, de modo que el modelo puede emplearse para prototipar transcripcion en ese dominio, siempre con revision humana dado su 44,27% de WER en test.
- Generacion de pseudo-etiquetas para ampliar corpus: usar las transcripciones del modelo como preanotacion de audios con acento vietnamita y revisarlas despues, reduciendo el coste de anotacion manual antes de entrenar un modelo mayor.
- Herramientas de apoyo a la lectura para aprendices: al estar entrenado especificamente con enunciados de lectura guiada, encaja en aplicaciones que verifican si un estudiante vietnamita de coreano ha leido correctamente un texto pautado.
- Estudio de eficiencia del ajuste fino: servir como caso controlado para comparar tecnicas de adaptacion al acento (fine-tuning completo, adapters, LoRA) partiendo de una linea base tiny y un presupuesto de 500 pasos.
- Componente de investigacion en pipelines de `transformers`: integracion en scripts de evaluacion automatizada de ASR con `WhisperProcessor` para generar transcripciones y calcular WER y CER contra referencias.
- Analisis de sesgo en servicios de voz: auditar si un sistema de dictado o subtitulado funciona peor con acento vietnamita y documentar la mejora alcanzable con un ajuste fino de bajo coste.
- No se recomienda su uso directo en produccion orientada al cliente sin una evaluacion adicional en el dominio destino, tal como advierte el propio autor.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (WER y CER en porcentaje):

| Conjunto | Modelo | WER | CER |
|---|---|---|---|
| Validacion | Linea base (`openai/whisper-tiny`) | 58,27% | 34,97% |
| Validacion | Ajustado | 18,21% | 9,33% |
| Test (pedidos por telefono) | Linea base | 52,73% | 22,49% |
| Test (pedidos por telefono) | Ajustado | 44,27% | 21,06% |

Notas sobre la evaluacion: el conjunto de test consta de 77 enunciados de un escenario de pedidos de pizza y pollo por telefono, completamente separado de entrenamiento y validacion (sin solapamiento de frases ni de hablantes). La mejora es notablemente mayor en validacion que en test, lo que sugiere capacidad de generalizacion limitada a contextos nuevos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y ninguno de ellos seria aplicable a un modelo exclusivamente de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa basada en el tamano del modelo base, un modelo de este orden cabria en menos de 1 GB en fp32 y en unos cientos de MB en fp16 o int8; se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer reciente es sobradamente suficiente y una GPU dedicada no es un requisito practico.
- Compatibilidad con GPU consumer: si, previsiblemente en cualquier GPU consumer e incluso en CPU, dado el tamano reducido del modelo base; no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: `transformers` (confirmado por el autor, con `WhisperProcessor` y `WhisperForConditionalGeneration`), HuggingFace Endpoints (tag `endpoints_compatible`), y formatos derivados habituales de Whisper como `whisper.cpp`, `faster-whisper` o `ctranslate2`, siempre que se realice previamente la conversion de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER en el test del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `user06958409348/whisper-tiny-ko-vietnamese-accent` | No disponible (base tiny) | Ventana de audio del modelo base (30 s), no confirmado en la ficha | 44,27% | No disponible | HuggingFace, 0 descargas |
| `openai/whisper-tiny` (linea base) | Orden de 39 M (dato externo a la ficha) | 30 s | 52,73% | Licencia de OpenAI, no indicada en esta ficha | Ampliamente disponible |
| Otros ajustes de Whisper para coreano con acento no nativo | No disponible | No disponible | No disponible | No disponible | No se han identificado referencias en la busqueda realizada |
| `openai/whisper-base` / `openai/whisper-small` como alternativas de mayor tamano | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Disponibles en HuggingFace |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables: los enlaces recuperados corresponden a la cadena de cines alemana Kinopolis y no guardan relacion con el modelo. Por tanto, no es posible establecer una comparativa documentada con otros ajustes de ASR para acento vietnamita en coreano.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 1.366 enunciados, insuficiente para generalizar a vocabularios, dominios acusticos o condiciones de grabacion distintos de los del corpus original.
- Sesgo de acento y de origen: el ajuste cubre exclusivamente hablantes nativos de vietnamita; no hay evidencia de comportamiento con otros acentos no nativos ni con hablantes nativos de coreano.
- Sesgo de tarea: solo se usaron enunciados de lectura guiada ("Reading"), excluyendo respuestas libres; el rendimiento en habla espontanea no esta caracterizado.
- Generalizacion limitada: la mejora cae del 40,06 puntos de WER en validacion a 8,46 puntos en el conjunto de test, segun los propios datos del autor.
- Riesgo de alucinacion: no cuantificado en la ficha; es un fenomeno conocido en modelos Whisper pequenos y conviene validar las transcripciones en cualquier uso real.
- WER en test del 44,27%: inaceptable para la mayoria de aplicaciones en produccion sin supervision humana.
- Restricciones de licencia: no disponibles. Al derivar de `openai/whisper-tiny`, es imprescindible verificar la licencia del modelo base y la del corpus de AI Hub antes de cualquier uso comercial; esta ficha no permite confirmarlo.
- Uso previsto declarado por el autor: exclusivamente investigacion. No destinado a produccion sin evaluacion adicional.
- Idiomas: aunque el modelo base es multilingue, el ajuste puede degradar el rendimiento en idiomas distintos del coreano; no hay evaluacion al respecto.
- Metadatos incompletos: sin pipeline declarado, sin licencia, sin idiomas y sin tipos de cuantizacion documentados, lo que dificulta la trazabilidad y la reutilizacion.
- Anomalia en los metadatos: la fecha de creacion registrada (2026-09-13) y la de actualizacion son posteriores a la fecha de consulta habitual, lo que sugiere un error de metadatos o una carga programada; conviene tratarlas con cautela.
- Sin traccion en la plataforma: 0 descargas y 0 likes, sin issues ni discusion publica que permita contrastar la reproducibilidad de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/user06958409348/whisper-tiny-ko-vietnamese-accent
- Modelo base: `openai/whisper-tiny` (referenciado en la model card; no se proporciono URL directa)
- Corpus de entrenamiento: AI Hub, "AI Training Data for Foreign Korean Speech" (referenciado en la model card; no se proporciono URL directa)
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su arquitectura o sus resultados; los resultados obtenidos eran de tematica ajena (cadena de cines Kinopolis) y se han descartado.
