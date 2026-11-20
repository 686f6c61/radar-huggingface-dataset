# vGassen/afribase-speech-whisper-small

## Resumen

AfriBase-Speech Whisper-small es un conjunto de cinco modelos de reconocimiento automatico del habla (ASR) derivados de `openai/whisper-small`, uno por idioma, afinados por Ernst van Gassen (Arktos AI Lab) sobre el corpus AfriBase-Speech. Los idiomas cubiertos son amharico (am), hausa (ha), lingala (ln), swahili (sw) y yoruba (yo), todos ellos lenguas africanas de bajos recursos. El modelo se publica como artefacto de investigacion asociado al articulo presentado en DHASA 2026, con el objetivo de que los resultados sean verificables y reproducibles.

Tecnicamente es un transformer encoder-decoder de tipo Whisper con 244 millones de parametros, entrenado originalmente por OpenAI sobre 680 000 horas de audio supervisado debilmente y afinado aqui con entre 0,36 y 4,97 horas de audio por idioma. La innovacion metodologica no esta en la arquitectura sino en el proceso: las etiquetas de entrenamiento son pseudo-etiquetas generadas por Whisper large-v3, sin transcripciones humanas, lo que convierte al modelo en una destilacion efectiva del profesor sobre datos de dominio muy restringido.

Su relevancia es doble. Por un lado, documenta de forma honesta y cuantificada los limites del afinado con pocos datos y pseudo-etiquetas en lenguas de bajos recursos: mejora Swahili (WER 50,9 %), Yoruba (109,3 %) y Lingala (76,5 %) respecto al modelo base, pero empeora el amharico (176,4 %) y no mejora el hausa. Por otro, libera pesos, pipeline y evaluacion bajo licencia MIT, lo que permite auditar la metodologia y reutilizarla como linea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con convoluciones iniciales y atencion multi-cabeza |
| Parametros totales | 244 millones (whisper-small) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos por segmento, propia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | am (amharico), ha (hausa), ln (lingala), sw (swahili), yo (yoruba) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-small` sin modificaciones: un encoder que procesa espectrogramas mel de 80 canales y un decoder autorregresivo que genera tokens de texto, con 12 capas en cada torre y atencion multi-cabeza. El repositorio contiene cinco subcarpetas (`amh`, `hau`, `lin`, `swh`, `yor`), cada una con su propio checkpoint afinado de forma independiente. Se conservan la configuracion, el tokenizer y el extractor de caracteristicas del modelo base.

El entrenamiento usa los segmentos Tier 1a de AfriBase-Speech (audio de lecciones gubernamentales estadounidenses, de dominio publico en EE. UU.), con separacion 95/5 entre entrenamiento y validacion y filtrado de ingles mediante identificacion automatica de idioma. Las etiquetas son pseudo-etiquetas de Whisper large-v3 con el idioma fijado de antemano; no hay transcripciones humanas. Se entrenaron 10 epocas con batch de 8, tasa de aprendizaje 1e-5, warm-up de hasta 200 pasos y precision mixta, seleccionando el checkpoint con menor WER de validacion frente a las pseudo-etiquetas. El coste total fue de 16 minutos (hausa) a 3,1 horas (amharico) en una unica GPU de portatil RTX 5090 con 24 GB. El volumen de audio por idioma fue de 4,97 h (amharico), 0,36 h (hausa), 1,61 h (lingala), 1,50 h (swahili) y 1,33 h (yoruba).

## Capacidades

- Transcripcion de voz a texto en amharico, hausa, lingala, swahili y yoruba, con el idioma fijado en la configuracion de generacion.
- Procesamiento de audio mono a 16 kHz con el `WhisperProcessor` estandar.
- Generacion de transcripciones con puntuacion y mayusculas heredadas del formato de Whisper large-v3.
- Integracion directa con `transformers` mediante `WhisperForConditionalGeneration` y `WhisperProcessor`, con soporte de subcarpetas por idioma.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio multimodal.
- No es un modelo multilingue simultaneo: cada checkpoint esta especializado en un unico idioma.

## Casos de uso

- Linea base academica para investigacion en ASR de bajos recursos: sirve para comparar metodologias de pseudo-etiquetado y cuantificar el efecto de pocos datos por idioma, gracias a que el pipeline y los pesos son publicos y reproducibles.
- Transcripcion de material didactico de dominio controlado en swahili o yoruba: con WER de 50,9 % y 109,3 % respectivamente, puede usarse para indexar o buscar en audio de lecciones claras y lentas, siempre con revision humana.
- Prototipado rapido de interfaces de voz en swahili: el modelo cabe en una GPU de consumo y se carga con tres lineas de codigo, lo que permite validar un producto antes de invertir en un modelo mayor.
- Generacion de transcripciones aproximadas para anotacion asistida: las salidas pueden servir como preanotaciones que un humano corrige, reduciendo el coste frente a transcribir desde cero en lingala o yoruba.
- Experimentos de destilacion de Whisper large-v3: el repositorio documenta el efecto de propagar errores del profesor, util para disenar estrategias de filtrado de pseudo-etiquetas.
- Evaluacion de robustez frente a dominio: al estar entrenado solo con habla de estudio, sirve como caso de estudio de degradacion en audio conversacional o con ruido.
- No recomendado para transcripcion en produccion de amharico ni hausa: el propio autor desaconseja explicitamente el uso del checkpoint amharico.

## Benchmarks y rendimiento

WER (%) sobre el split de test de FLEURS con el idioma fijado de antemano, segun los datos declarados por el autor (no verificados de forma independiente):

| Idioma | Whisper-small zero-shot | Este modelo | Cambio |
|---|---:|---:|---:|
| Amharico (am_et) | 115,7 | 176,4 | +60,7 |
| Hausa (ha_ng) | 90,6 | 91,2 | +0,6 |
| Lingala (ln_cd) | 89,9 | 76,5 | -13,4 |
| Swahili (sw_ke) | 73,2 | 50,9 | -22,3 |
| Yoruba (yo_ng) | 166,0 | 109,3 | -56,7 |

El autor indica que la reevaluacion del checkpoint de hausa ensamblado reproduce el resultado del articulo con exactitud: WER 91,24 %, CER 32,87 % sobre 621 enunciados. Valores superiores al 100 % implican mas errores que palabras de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB de pesos mas activaciones; en la practica, menos de 2 GB para audio de 30 segundos.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o superiores; el autor entreno cada checkpoint en una RTX 5090 Laptop de 24 GB.
- Tambien puede ejecutarse en CPU para inferencia por lotes pequenos, con latencia mayor.
- Opciones de despliegue: `transformers` (referencia oficial), y en general los runners compatibles con Whisper como vLLM, llama.cpp u Ollama, aunque la informacion proporcionada solo documenta el uso via `transformers`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tiempo de entrenamiento por idioma (16 minutos a 3,1 horas) da una idea del orden de magnitud del coste computacional, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER Swahili (FLEURS) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| AfriBase-Speech Whisper-small (este) | 244 M | 5 (uno por checkpoint) | 50,9 | MIT | Hugging Face |
| openai/whisper-small | 244 M | ~99 | 73,2 | MIT | Hugging Face |
| openai/whisper-large-v3 | 1550 M | ~99 | no disponible en la informacion | MIT | Hugging Face |

El modelo base zero-shot supera a este checkpoint en amharico y hausa, y es superado en lingala, swahili y yoruba. Para comparaciones con modelos especializados en lenguas africanas (por ejemplo, variantes de MMS o Seamless) no hay datos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con entre 0,36 y 4,97 horas de habla de estudio por idioma: lenta, clara y con frases repetidas. El rendimiento en audio conversacional, de difusion o con ruido sera notablemente peor.
- Las etiquetas son pseudo-etiquetas de Whisper large-v3; sus errores estan incorporados al modelo. En amharico, el profesor tiene un WER superior al 100 % en FLEURS, por lo que el alumno aprende secuencias en geez plausibles pero incorrectas.
- El checkpoint amharico no debe usarse para transcripcion, segun advertencia explicita del autor.
- El checkpoint hausa apenas mejora al modelo base (+0,6 puntos de WER) por falta de datos.
- FLEURS es habla de noticias leida, un dominio distinto al de entrenamiento; los numeros de benchmark no reflejan el rendimiento en el dominio real de uso.
- No hay transcripciones humanas de referencia: la validacion se hace contra las propias pseudo-etiquetas, lo que puede enmascarar errores sistematicos.
- Los resultados de benchmark estan declarados por el autor y no han sido verificados de forma independiente.
- Licencia MIT, que permite uso comercial, pero el audio de entrenamiento es de dominio publico solo en EE. UU.; conviene revisar la ficha del dataset para otros territorios.
- No dispone de deteccion automatica de idioma fiable entre los cinco cubiertos: el idioma se fija manualmente en la configuracion de generacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vGassen/afribase-speech-whisper-small
- Dataset AfriBase-Speech: https://huggingface.co/datasets/vGassen/afribase-speech
- Coleccion AfriBase-Speech: https://huggingface.co/collections/vGassen/afribase-speech-6b001c6a16e93128db1f5e5c
- Codigo del pipeline: https://github.com/arktos-ai-lab/afribase-speech-pipeline
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- ORCID del autor: https://orcid.org/0009-0000-0314-6441
- DOI del dataset: 10.57967/hf/11727
