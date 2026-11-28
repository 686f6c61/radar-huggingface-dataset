# vezilka-ai/vezilka-whisper-large-v3-turbo-mk-lora

## Resumen

Vezilka Whisper Large V3 Turbo LoRA (Macedonian) es un adaptador LoRA de tipo PEFT sobre el modelo de reconocimiento automático del habla `openai/whisper-large-v3-turbo`, especializado en macedonio. Lo desarrolla el equipo Vezilka (vezilka-ai), en el marco de un proyecto financiado por el Ministerio de Educación y Ciencia de Macedonia del Norte, el programa EuroHPC JU y la Facultad de Ingeniería Informática (FINKI) de Skopje. El problema que resuelve es la baja cobertura del macedonio en los sistemas ASR multilingües genéricos: en lugar de reentrenar el modelo completo, se inyecta capacidad específica de idioma mediante un adaptador de bajo rango.

El adaptador tiene rango r=64, alpha=128, dropout 0.05 y se aplica sobre las proyecciones q/k/v/o del transformer encoder-decoder de Whisper. El repositorio pesa solo 0,1 GB, lo que lo hace muy ligero de distribuir y de combinar con el modelo base. Según la model card, es el mejor sistema evaluado en el benchmark Vezilka FINKI Lecture ASR, con un WER del 4,51 % y un CER del 1,52 % en la vista completa.

Su relevancia actual es doble: por un lado, demuestra que un adaptador LoRA pequeño puede llevar un modelo ASR de propósito general a un rendimiento competitivo en un idioma de bajos recursos; por otro, publica un benchmark con referencias revisadas manualmente y declara explícitamente que el audio y las transcripciones de evaluación no se usaron en entrenamiento, lo que permite reproducir la medición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Whisper large-v3-turbo (transformer encoder-decoder) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base no se especifica en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Macedonio (mk) |
| Licencia | Apache-2.0 (modelo base: MIT) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-large-v3-turbo`, un modelo ASR de arquitectura transformer encoder-decoder con decodificacion autoregresiva. La adaptacion se realiza exclusivamente mediante LoRA con r=64, alpha=128, dropout 0.05 sobre las proyecciones de query, key, value y output. El adaptador se puede fusionar con el modelo base mediante `merge_and_unload()` para obtener un modelo único sin coste de inferencia adicional.

El entrenamiento parte de un adaptador anterior del mismo proyecto (r=64, q/k/v/o, schedule coseno, LR 5e-4) y continúa durante 5 épocas con LR pico de 5e-4 sobre tres fuentes: donaciones aceptadas del proyecto Doniraj (submissions-20260831), el dataset interno `prvatv_dataset` y un subconjunto de replay de 15 horas de `videa_so_transkript_od_yt`. La model card no detalla el volumen total de horas ni la composición exacta del corpus, ni menciona fases de RLHF o DPO (no aplicables a un modelo ASR).

## Capacidades

- Transcripcion de audio a texto en macedonio con salida de texto plano.
- Soporte de decodificacion por haces (`num_beams=4`) y seleccion explicita de idioma (`language="macedonian"`) y tarea (`task="transcribe"`).
- Manejo de audio de conferencias y clases magistrales, segun el benchmark de evaluacion (cinco clases de FINKI).
- Integracion con el ecosistema Hugging Face `transformers` y `peft` mediante `PeftModel.from_pretrained`.
- Capacidad de fusion con el modelo base (`merge_and_unload`) para despliegue como modelo unico.
- No se documentan capacidades de traduccion, diarizacion, timestamps por palabra ni tool calling.

## Casos de uso

- Transcripcion de clases universitarias: el adaptador esta entrenado y evaluado sobre grabaciones de clases de FINKI, por lo que es adecuado para generar apuntes y subtitulos de docencia en macedonio con un WER cercano al 4 %.
- Subtitulado de contenido audiovisual macedonio: permite generar subtitulos para videos de YouTube y archivos de video con transcripcion previa, aprovechando el subconjunto de replay usado en entrenamiento.
- Archivado y busqueda de material audiovisual: transcribir fondos de video o radio en macedonio para indexarlos y hacerlos consultables por texto.
- Accesibilidad: generar transcripciones para personas con discapacidad auditiva en contenidos educativos o institucionales en macedonio.
- Investigacion lingueistica y creacion de corpus: producir transcripciones a escala para anotacion posterior o para construir datasets de habla macedonia.
- Prototipado rapido en produccion: al ser un adaptador de 0,1 GB sobre un modelo base estandar, se puede desplegar con la pila `transformers` sin infraestructura adicional y fusionarse para simplificar el pipeline.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Benchmark Vezilka FINKI Lecture ASR (`finki-benchmark` de `vezilka-ai/macedonian-speech`), cinco clases reservadas con referencias revisadas manualmente; WER/CER normalizados en % (NFC, minusculas, sin puntuacion); CUDA, float32, batch 1, beam 4.

| Vista | Clips | WER | CER | S | I | D |
|---|---:|---:|---:|---:|---:|---:|
| full | 1.406 | 4,51 | 1,52 | 1.712 | 298 | 425 |
| speaker_balanced | 892 | 4,15 | 1,36 | 1.012 | 169 | 239 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el requisito real lo determina el modelo base `whisper-large-v3-turbo`, cuyas necesidades de VRAM no se detallan en la informacion disponible.
- La evaluacion reportada se ejecuto en CUDA con precision float32 y batch 1, lo que sugiere que el modelo base cabe en GPU de gama alta; no se especifica el modelo de GPU utilizado.
- No se dispone de datos de VRAM por cuantizacion ni de si cabe en GPU de consumo (RTX 4090 u otras).
- Opciones de despliegue: `transformers` + `peft` (probado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos sobre el mismo benchmark ni de adaptadores LoRA comparables para macedonio. La unica referencia es el modelo base `openai/whisper-large-v3-turbo` (licencia MIT), sobre el que este adaptador anade capacidad especifica de macedonio, pero no se aportan sus metricas en el benchmark Vezilka.

| Modelo | Parametros | Contexto | WER (Vezilka FINKI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vezilka-whisper-large-v3-turbo-mk-lora | No disponible (adaptador de 0,1 GB) | No disponible | 4,51 (full) / 4,15 (speaker_balanced) | Apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | No disponible | No disponible | No disponible | MIT | Hugging Face |
| Otros modelos ASR para macedonio | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especializado exclusivamente en macedonio; no se garantiza un comportamiento correcto en otros idiomas.
- Los resultados de WER/CER son declarados por el autor y estan marcados como no verificados (`verified: false`); conviene reproducirlos antes de tomar decisiones de produccion.
- El benchmark de evaluacion son clases magistrales de informatica de FINKI; el rendimiento puede degradarse en dominios acusticos distintos (conversacion espontanea, ruido, telefonia, acentos regionales).
- No se documentan sesgos conocidos ni tasas de alucinacion; en ASR, los errores de sustitucion e insercion observados (298 inserciones y 425 eliminaciones en la vista completa) pueden generar texto inventado en segmentos con ruido.
- La licencia Apache-2.0 aplica al adaptador; el modelo base se distribuye bajo MIT, por lo que el uso comercial combinado debe respetar ambas.
- Requiere descargar y cargar el modelo base completo ademas del adaptador, lo que condiciona el coste de despliegue.
- No se detalla la composicion completa del corpus de entrenamiento ni el volumen total de horas, lo que limita la evaluacion de posibles sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vezilka-ai/vezilka-whisper-large-v3-turbo-mk-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de evaluacion: https://huggingface.co/datasets/vezilka-ai/macedonian-speech
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
