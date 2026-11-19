# VorbaVine/qwen3-asr-0.6b-vv-ro

## Resumen

qwen3-asr-0.6b-vv-ro es un ajuste fino del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-0.6B, desarrollado por VorbaVine para transcripcion de voz en rumano. El modelo parte de la arquitectura Qwen3-ASR de 0,6B parametros (782.426.112 parametros reales segun los pesos en safetensors) publicada por el equipo Qwen bajo licencia Apache-2.0, y se ha reentrenado especificamente para reducir la tasa de error de palabra (WER) en rumano, un idioma con escasa representacion en los modelos ASR multilingues genericos.

El problema que resuelve es concreto: el modelo base presenta un WER muy elevado en rumano (entre el 30,59 % y el 41,15 % en los conjuntos de evaluacion reportados), lo que lo hace poco util para produccion en ese idioma. Tras el ajuste fino, el WER baja a valores de entre el 4,89 % y el 10,10 % en los mismos conjuntos, una mejora de entre 24 y 36 puntos porcentuales. Es relevante ahora porque demuestra que un modelo ASR pequeno (0,6B) puede alcanzar calidad de produccion en un idioma de recursos medios mediante ajuste fino con datos reales y sinteticos, sin necesidad de recurrir a modelos mucho mayores.

El modelo se distribuye en formato safetensors, con un tamano de repositorio de 1,6 GB, y requiere el paquete oficial `qwen-asr` para su carga e inferencia. Esta pensado para audio de 16 kHz mono y transcripcion en rumano, con la etiqueta de idioma especificada explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder para reconocimiento automatico del habla) |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; los pesos se publican en safetensors en bf16) |
| Idiomas soportados | rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-ASR del modelo base Qwen/Qwen3-ASR-0.6B, un sistema de reconocimiento automatico del habla de tipo encoder-decoder basado en transformer. El ajuste fino se realizo sobre ese checkpoint con un total de aproximadamente 144 horas de audio (143,77 h exactas en el split completo), de las cuales unas 70 h son habla real y 73,5 h son habla sintetica. La composicion por fuente es: 8,4 h de grabaciones propias de VorbaVine, 21,5 h de Common Voice, 5,9 h de FLEURS, 34,4 h de otro habla real y 73,5 h de habla sintetica.

El entrenamiento uso una tasa de aprendizaje de 5e-5 con decaimiento lineal y un 2 % de warmup, batch efectivo de 64, precision bf16 y sin weight decay. Se ejecutaron 5 epocas y se conservo el checkpoint del paso 4536 (epoca 4), que obtuvo un WER de validacion del 5,14 %. El split de datos es fijo y compartido entre entrenamiento, seleccion de modelo y test (dataset VorbaVine): 73.174 clips de entrenamiento (121,78 h), 6.814 de validacion (10,91 h) y 6.932 de test (11,08 h). Para este modelo concreto, los ficheros de entrenamiento contienen 72.546 clips de train y 6.786 de validacion. No se documenta el uso de RLHF ni DPO; se trata de un ajuste fino supervisado clasico sobre transcripciones.

## Capacidades

- Transcripcion de voz a texto en rumano, con audio de entrada a 16 kHz mono.
- Reconocimiento automatico del habla sobre audio de distintas fuentes (lectura, habla espontanea, dominio publico) gracias a la diversidad del dataset de entrenamiento.
- Manejo de habla sintetica y real mezclada, lo que aporta robustez frente a variaciones de canal y locutor.
- Especificacion explicita de idioma mediante el parametro `language="Romanian"` en la API de inferencia.
- Inferencia por lotes configurable (`max_inference_batch_size`) y limite de tokens generados (`max_new_tokens=440`).
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma automatica, tool calling ni razonamiento multi-paso; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y actas en rumano: el modelo convierte audio de reuniones en texto con un WER en torno al 5 % en dominios cercanos al entrenamiento, adecuado para generar actas automaticas y busqueda sobre el contenido.
- Subtitulado de video en rumano: con 1,6 GB de pesos y 0,6B parametros, se puede desplegar en una GPU consumer para generar subtitulos de forma local, sin enviar audio a servicios externos.
- Atencion al cliente y centros de llamadas: transcripcion de grabaciones de llamadas en rumano para analitica, control de calidad y extraccion de motivos de contacto, con la ventaja de que el modelo cabe en una sola GPU.
- Archivado y digitalizacion de audio historico o institucional en rumano: el modelo maneja habla de distintas fuentes (Common Voice, VoxPopuli, grabaciones propias), lo que lo hace util para digitalizar archivos con condiciones variables.
- Investigacion en ASR de bajos recursos: sirve como referencia de ajuste fino de un modelo de 0,6B para un idioma concreto, con splits y metricas documentados, para comparar estrategias de aumento de datos reales frente a sinteticos.
- Asistentes de voz y dictado en aplicaciones rumanas: integrable en pipelines de reconocimiento de voz en tiempo casi real dado el reducido tamano del modelo, siempre que se disponga del paquete `qwen-asr`.
- Generacion de datos etiquetados: al tener un WER bajo en rumano, puede usarse para pre-etiquetar audio y acelerar la creacion de corpus de entrenamiento para otros modelos.

## Benchmarks y rendimiento

Resultados de WER (%) reportados por el autor (menor es mejor):

| Conjunto de test | Modelo base | Este modelo |
|---|---|---|
| VorbaVine test | 36,84 | 5,13 |
| Mozilla (no visto) | 41,15 | 4,89 |
| FLEURS (no visto) | 34,58 | 10,10 |
| VoxPopuli (no visto) | 30,59 | 7,50 |

Las metricas se calcularon sobre referencias curadas tras normalizacion. Los conjuntos marcados como "no vistos" agrupan clips de test y validacion de Common Voice/FLEURS que no estan en el split de entrenamiento; VoxPopuli no tiene clips en el split de entrenamiento. No se han publicado otros benchmarks (por ejemplo, comparativas con Whisper u otros ASR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 782 millones de parametros en bf16, los pesos ocupan aproximadamente 1,6 GB; con overhead de activaciones y buffers de audio, se estima un consumo en torno a 3-5 GB de VRAM, aunque el autor no publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en la practica; una RTX 4090, A100 o H100 ofrecen margen de sobra y permiten mayor throughput por lotes.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: el autor indica que se requiere el paquete oficial `qwen-asr` junto con `torch` y `librosa`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el autor solo documenta parametros de inferencia (`max_inference_batch_size=1`, `max_new_tokens=440`) sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | WER rumano reportado |
|---|---|---|---|---|---|
| VorbaVine/qwen3-asr-0.6b-vv-ro | 782 M | no disponible | rumano | Apache-2.0 | 4,89-10,10 % (segun conjunto) |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6B (aprox.) | no disponible | multilingue | Apache-2.0 | 30,59-41,15 % (segun conjunto) |
| Whisper large-v3 | no disponible en la informacion | no disponible | multilingue | MIT (segun conocimiento general, no verificado en la fuente) | no disponible |

La comparacion directa con alternativas como Whisper no esta documentada por el autor, por lo que no se dispone de cifras verificables de WER en rumano para esos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en rumano; no se debe esperar un rendimiento correcto en otros idiomas.
- El split de datos es fijo y compartido entre entrenamiento, seleccion y test, por lo que las metricas de "VorbaVine test" no son una evaluacion completamente independiente; los resultados en conjuntos no vistos (Mozilla, FLEURS, VoxPopuli) son mas representativos de la generalizacion.
- Una parte importante del entrenamiento (73,5 h de 143,77 h) es habla sintetica, lo que puede introducir sesgos hacia las caracteristicas acusticas del sistema de sintesis utilizado.
- Riesgo de alucinacion en segmentos de silencio, ruido o audio musical, comun en modelos ASR; no se documenta mitigacion especifica.
- Requiere el paquete `qwen-asr` y audio a 16 kHz mono; no se documenta soporte para otras frecuencias de muestreo o formatos sin remuestreo previo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado; el autor no detalla restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en produccion ni validacion independiente por terceros.
- No se documentan sesgos demograficos ni de acento; dado el origen de los datos (Common Voice, FLEURS, VoxPopuli y grabaciones propias), el rendimiento puede degradarse con acentos regionales rumanos poco representados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VorbaVine/qwen3-asr-0.6b-vv-ro
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio del paquete qwen-asr: https://github.com/QwenLM/Qwen3-ASR
