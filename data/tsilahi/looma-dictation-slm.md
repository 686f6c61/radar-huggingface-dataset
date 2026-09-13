# tsilahi/looma-dictation-slm

## Resumen

Looma Dictation SLM es un modelo de lenguaje pequeno (SLM) de tipo secuencia-a-secuencia, ajustado especificamente para normalizar texto dictado y eliminar disfluencias del habla. Lo desarrolla Twashin Ilahi, del equipo de Looma AI, y se distribuye desde la cuenta `tsilahi` en HuggingFace. El problema que resuelve es concreto: cuando un usuario dicta una frase con un sistema de reconocimiento automatico del habla (ASR), la transcripcion bruta llega llena de muletillas ("um", "uh", "basically"), repeticiones por tartamudeo ("the the"), ausencia de puntuacion y capitalizacion incorrecta. Los LLM conversacionales convencionales, al recibir una pregunta dictada, la responden en lugar de limitarse a limpiarla. Este modelo esta afinado para no hacer eso: actua como un motor de reestructuracion de texto no conversacional.

Tecnicamente parte de `google/flan-t5-small`, un transformer encoder-decoder T5 de la familia Text-to-Text Transfer Transformer. El repositorio declara unos 60 millones de parametros, aunque los pesos en safetensors suman 76.961.152 parametros (~77 M), una discrepancia habitual entre la ficha del autor y el recuento real del checkpoint. El objetivo declarado de despliegue es 100 % local y sin coste de nube: navegador via WebAssembly/ONNX con Transformers.js, ademas de escritorio y movil.

Su relevancia actual esta en el nicho de dictado privado y post-procesado de ASR en el propio dispositivo. Con menos de 80 M de parametros, cuantizacion a INT8 y licencia Apache 2.0, es un candidato realista para integrarse en productos de dictado donde no se puede enviar audio ni transcripciones a un servidor externo. El modelo es muy reciente (creado el 13 de septiembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (familia T5, Text-to-Text Transfer Transformer) |
| Parametros totales | 76.961.152 (~77 M) segun safetensors; la model card declara ~60 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base `google/flan-t5-small` trabaja habitualmente con 512 tokens de entrada y salida |
| Tipos de cuantizacion | FP32 (pesos publicados en safetensors); la model card indica cuantizacion a ~35 MB en INT8. No se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via `transformers`); despliegue objetivo adicional en ONNX / WebAssembly |
| Modelo base | `google/flan-t5-small` (fine-tune) |
| Prefijo de tarea | `fix grammar: ` |
| Pipeline declarado | `text2text-generation` (metadata del repo: `text-generation`) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un T5 completo encoder-decoder, no un decoder-only. Se hereda de `google/flan-t5-small`, de modo que el modelo ya parte de un preentrenamiento masivo y de un ajuste por instrucciones previo (FLAN) que aqui se redirige hacia una tarea unica de reescritura de texto. El objetivo de entrenamiento es entropia cruzada seq2seq sobre tokens objetivo, con teacher forcing. La innovacion practica no esta en la arquitectura, sino en el comportamiento: el ajuste busca neutralizar los pesos dialogicos heredados del RLHF de FLAN para que una pregunta dictada se puntue y capitalice en lugar de ser respondida.

Los detalles de entrenamiento declarados son escasos pero cuantificados: optimizador AdamW, 5 epocas, batch size de 8, learning rate 3e-4 con decaimiento lineal, precision FP32 sobre Apple Silicon con aceleracion MPS. La perdida final de entrenamiento reportada es 0,0080, partiendo de 0,3228. El coste computacional declarado es de aproximadamente 0,02 horas (unos 72 segundos) de entrenamiento, con una huella de carbono estimada por debajo de 0,001 kg de CO2 equivalente. Los datos de entrenamiento son un dataset propio no publicado ("custom-speech-dictation"), descrito como pares de transcripciones ASR conversacionales emparejadas con objetivos limpios, puntuados y gramaticalmente reestructurados, con ejemplos explicitos de formato interrogativo para forzar el comportamiento no conversacional. No se indica numero de tokens, composicion exacta del corpus ni si hubo etapas adicionales de DPO o RLHF sobre el fine-tune.

## Capacidades

- Normalizacion de dictado: convierte transcripciones ASR brutas en frases limpias, puntuadas y con mayusculas correctas.
- Eliminacion de disfluencias: retira muletillas ("um", "uh", "er", "like", "you know", "basically") y repeticiones por tartamudeo ("the the", "we we").
- Puntuacion sin respuesta: estructura preguntas dictadas ("how can we solve this" -> "How can we solve this?") sin generar una contestacion conversacional, que es la diferencia clave frente a un LLM de instrucciones estandar.
- Reescritura gramatical: corrige concordancia, tiempos verbales y orden sintactico dentro de la frase dictada.
- Conservacion de la intencion del hablante: la model card insiste en que el modelo reestructura, no reinterpreta ni resume.
- Control mediante prefijo de tarea: la entrada se formatea como `fix grammar: <texto>`.
- Capacidad multilingue: no disponible; solo ingles.
- Tool calling / function calling: no soportado, no documentado.
- Modo agente o razonamiento multi-paso: no soportado, fuera de alcance declarado.
- Vision, audio nativo o modo "thinking": no soportado; el modelo es exclusivamente texto-a-texto y no procesa audio (el ASR queda a cargo de un sistema externo).

## Casos de uso

- Dictado privado en navegador: un editor web puede ejecutar el modelo via Transformers.js y ONNX/WASM sobre el texto que devuelve la Web Speech API, limpiando la transcripcion en local sin enviar nada a un servidor. Encaja por su tamano (pesos de decenas de MB) y su licencia permisiva.
- Post-procesado de ASR embebido en aplicaciones moviles: en un teclado o app de notas de voz, el modelo recibe la hipotesis bruta del reconocedor y devuelve la frase puntuada, aportando calidad de transcripcion sin depender de conectividad.
- Notas clinicas o legales dictadas: el modelo elimina muletillas y repeticiones propias del habla espontanea y restaura la puntuacion, produciendo un borrador legible para revision humana. El procesamiento en local es relevante aqui por confidencialidad.
- Accesibilidad y dictado asistido: usuarios con habla disfluente o tartamudeo obtienen un texto escrito limpio; el modelo esta explicitamente entrenado para colapsar repeticiones de palabras y silencios vocalicos.
- Integracion en transcripcion de reuniones: tras un ASR en tiempo real, una pasada por el modelo por segmento restaura mayusculas, comas y signos de interrogacion, mejorando la legibilidad del acta antes de pasarla a un resumidor posterior.
- Normalizacion de comandos de voz en interfaces de producto: frases dictadas como busquedas o instrucciones se convierten en texto canonico ("um find the invoice from last march" -> "Find the invoice from last March."), util como preprocesado antes de un parser o de un motor de intenciones.
- Limpieza de corpus de habla para entrenamiento: se puede usar como paso de normalizacion sobre transcripciones ASR antes de alimentar un dataset de ajuste fino, ya que su objetivo es precisamente alinear habla bruta con texto escrito correcto.
- Correccion de subtitulos generados automaticamente: aplicado sobre segmentos de subtitulado automatico, recupera capitalizacion y puntuacion basica; requiere segmentacion previa, dado el contexto limitado tipico de T5-small.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica numerica aportada por el autor es la perdida de entrenamiento, que no es comparable con MMLU, HumanEval, GSM8K ni con metricas de ASR como WER.

| Metrica reportada | Valor |
|---|---|
| Perdida final de entrenamiento | 0,0080 (desde 0,3228) |
| Epocas | 5 |
| Batch size | 8 |
| Learning rate | 3e-4 con decaimiento lineal |
| Tiempo de entrenamiento | ~0,02 h (72 s) |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,31 GB solo para pesos (77 M parametros x 4 bytes), mas activaciones.
- VRAM estimada en FP16: aproximadamente 0,15 GB.
- VRAM estimada en INT8: aproximadamente 0,08 GB segun el recuento real de parametros; la model card afirma unos 35 MB cuantizado, cifra coherente con ~60 M de parametros pero inferior al recuento de safetensors.
- GPU recomendadas: cualquier GPU con 2 GB o mas, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores; tambien funciona en CPU. No requiere A100, H100 ni GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en muchas integradas. Tambien es viable en CPU y en movil.
- Opciones de despliegue: `transformers` (PyTorch sobre CPU, CUDA o MPS), ONNX Runtime, Transformers.js en navegador via WebAssembly. vLLM, TGI, llama.cpp y Ollama no estan documentados para este checkpoint; el soporte de encoder-decoder T5 en esos motores es limitado o inexistente, por lo que debe tratarse como "no disponible".
- Latencia y throughput estimados: no disponibles. Dado el tamano (menos de 80 M de parametros) y el tipo de salida (frases cortas de decenas de tokens), la inferencia en CPU deberia ser del orden de milisegundos a pocas decenas de milisegundos por frase, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Rendimiento |
|---|---|---|---|---|---|
| tsilahi/looma-dictation-slm | ~77 M (safetensors) | No disponible | Normalizacion de dictado y eliminacion de disfluencias | Apache 2.0 | Sin benchmarks publicados; perdida de entrenamiento 0,0080 |
| google/flan-t5-small | ~77 M | 512 tokens | Instrucciones generales texto-a-texto | Apache 2.0 | Benchmark publico disponible en la model card original de Google; no replicado aqui |
| google/flan-t5-base | ~248 M | 512 tokens | Instrucciones generales texto-a-texto | Apache 2.0 | Benchmark publico disponible en la model card original de Google |
| openai/whisper-small | ~244 M | Ventana de audio de 30 s | ASR multilingue con puntuacion | Apache 2.0 | WER publico en la model card original; no comparable en tarea de reescritura |

La comparacion con los modelos T5 de Google es la mas directa: Looma Dictation SLM es un fine-tune de `flan-t5-small` especializado, que sacrifica generalidad conversacional a cambio de un comportamiento predecible y no dialogico. Frente a soluciones de restauracion de puntuacion basadas en BERT (por ejemplo modelos de puntuacion multilingue), la ventaja declarada es un unico modelo seq2seq que resuelve puntuacion, capitalizacion y limpieza de disfluencias en una sola pasada. No hay datos publicos que permitan comparar calidad de salida entre estas alternativas.

## Limitaciones y advertencias

- Solo ingles. Cualquier transcripcion en otro idioma requiere un ajuste fino adicional segun la propia model card.
- Fuera de alcance el uso conversacional, el QA y la generacion creativa larga. Forzar estos usos produce salidas degradadas.
- Riesgo de alucinacion: aunque el objetivo es preservar la intencion, es un modelo generativo seq2seq y puede alterar, omitir o inventar contenido al reescribir, especialmente en entradas muy largas, ambiguas o con vocabulario tecnico fuera de dominio.
- Contexto limitado: no se documenta la ventana, y T5-small trabaja tipicamente con 512 tokens. Entradas largas deben segmentarse por frase, con el riesgo de perder cohesion entre segmentos.
- Datos de entrenamiento no publicados: el dataset "custom-speech-dictation" no esta disponible, por lo que no se puede auditar la composicion, el dominio cubierto ni los sesgos presentes. Al ser un corpus de habla, es esperable que herede sesgos dialectales y de registro del ASR de origen.
- Recuento de parametros inconsistente entre la model card (~60 M) y safetensors (76.961.152). Conviene verificar el consumo real de memoria antes de dimensionar un despliegue.
- Metricas ausentes: no hay WER, exact match, BLEU, ROUGE ni evaluacion humana publicada, ni comparacion contra baselines de restauracion de puntuacion. La perdida de entrenamiento no mide calidad de salida.
- Madurez muy baja: repositorio creado y actualizado el 13 de septiembre de 2026, con 0 descargas y 0 valoraciones en el momento de la consulta. No hay garantia de mantenimiento.
- Licencia Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia y los ficheros NOTICE correspondientes. Al derivar de `google/flan-t5-small`, se heredan las condiciones de su licencia Apache 2.0.
- Caveat de integracion: el pipeline de HuggingFace declarado en la model card es `text2text-generation`, pero la metadata del repo figura como `text-generation`; hay que instanciar `AutoModelForSeq2SeqLM`, no un modelo causal.
- Dependencia del prefijo: el rendimiento optimo se obtiene formateando la entrada como `fix grammar: <texto>`. Omitir el prefijo puede degradar la salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsilahi/looma-dictation-slm
- Modelo base: https://huggingface.co/google/flan-t5-small
- Organizacion Looma AI: https://loomaai.antailabs.com

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre Looma AI; los resultados obtenidos correspondian a temas sin relacion (Pinterest y comunidades de imagenes), por lo que no se incluyen como fuentes.
