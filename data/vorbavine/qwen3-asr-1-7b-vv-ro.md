# VorbaVine/qwen3-asr-1.7b-vv-ro

## Resumen

qwen3-asr-1.7b-vv-ro es un ajuste fino del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-1.7B, desarrollado por el equipo de VorbaVine para transcripcion de audio en rumano. El modelo parte de la arquitectura Qwen3-ASR, un transformer de 2.038.052.480 parametros (aproximadamente 1,7 mil millones en su denominacion comercial) publicado por el equipo Qwen bajo licencia Apache-2.0, y ha sido reentrenado sobre un corpus especifico de rumano que combina datos publicos y propios.

El problema que resuelve es la baja precision del modelo base en rumano: segun la model card, el WER del modelo original se situa entre el 13,95 % y el 22,68 % en distintos conjuntos de evaluacion, mientras que este ajuste lo reduce a un rango del 3,54 % al 6,74 %. Es relevante para desarrolladores que necesiten transcripcion automatica de calidad en rumano sin depender de servicios propietarios, ya que la licencia Apache-2.0 permite uso comercial y despliegue local.

El modelo se distribuye en formato safetensors con un tamano de repositorio de 4,1 GB y requiere el paquete oficial `qwen-asr` para su carga. Su ambito es monoproposito: reconocimiento de voz en rumano, sin capacidades multimodales mas alla del audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer para reconocimiento automatico del habla) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-ASR del modelo base Qwen/Qwen3-ASR-1.7B, un transformer disenado para transcripcion de audio. La model card no detalla la composicion interna de la arquitectura (encoder de audio, decoder de texto, mecanismos de atencion), por lo que esos extremos deben consultarse en la documentacion del modelo base. El audio de entrada debe ser mono a 16 kHz.

El ajuste fino se realizo sobre un corpus de aproximadamente 143,77 horas repartidas en 86.920 clips, con un split fijo: 73.174 clips (121,78 h) de entrenamiento, 6.814 clips (10,91 h) de validacion y 6.932 clips (11,08 h) de test. Por fuente, el corpus combina 8,4 h de grabaciones propias, 21,5 h de Common Voice, 5,9 h de FLEURS, 34,4 h de otro habla real y 73,5 h de habla sintetica, es decir, aproximadamente un 51 % de datos sinteticos. Para este modelo concreto, los ficheros de entrenamiento contienen 72.546 clips de train y 6.786 de validacion.

Los hiperparametros de entrenamiento fueron: learning rate 5e-5 con decaimiento lineal y un 2 % de warmup, batch efectivo de 64, precision bf16, sin weight decay, y 5 epocas. El checkpoint retenido es el paso 4536 (epoca 4 de 5), con un WER de validacion del 3,80 %. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en rumano con precision alta (WER entre 3,54 % y 6,74 % en los conjuntos evaluados).
- Procesamiento de audio mono a 16 kHz mediante el paquete oficial `qwen-asr`, con `torch` y `librosa`.
- Seleccion explicita de idioma mediante el parametro `language="Romanian"`, recomendada por el autor para reproducir los resultados de benchmark.
- Inferencia por lotes configurable (`max_inference_batch_size`) y limite de tokens generados (`max_new_tokens`, 440 en el ejemplo del autor).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y actas en empresas rumanas: el modelo convierte grabaciones de audio en texto con un WER inferior al 7 % en dominios cercanos a los datos de entrenamiento, lo que permite generar actas automaticas con revision humana ligera.
- Subtitulado de video y contenido audiovisual en rumano: el modelo puede procesar pistas de audio de 16 kHz y generar subtitulos con una tasa de error baja, integrable en pipelines de postproduccion.
- Atencion al cliente basada en voz: transcripcion de llamadas o mensajes de voz para su analisis posterior, clasificacion de incidencias o alimentacion de sistemas de analitica conversacional.
- Archivado y busqueda de audio historico: conversion de archivos de audio en rumano a texto indexable, lo que permite busqueda por palabras clave en fondos documentales sonoros.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones para estudios de fonetica, dialectologia o analisis de discurso en rumano, con licencia permisiva para publicar los resultados.
- Accesibilidad: transcripcion en tiempo casi real de contenido hablado para personas con discapacidad auditiva, desplegable en infraestructura propia sin dependencia de APIs externas.
- Preprocesamiento para pipelines de NLP en rumano: conversion de audio a texto como paso previo a sistemas de resumen, traduccion o analisis de sentimiento, aprovechando la licencia Apache-2.0 para uso comercial.

## Benchmarks y rendimiento

Resultados de WER (%) publicados en la model card; menor es mejor. Las columnas "Base" y "This model" corresponden al modelo base Qwen/Qwen3-ASR-1.7B y a este ajuste fino.

| Conjunto de test | Base | Este modelo |
|---|---|---|
| VorbaVine test | 18,58 | 3,66 |
| Mozilla (no visto) | 22,68 | 3,54 |
| FLEURS (no visto) | 16,10 | 6,74 |
| VoxPopuli (no visto) | 13,95 | 5,30 |

Los resultados "no vistos" agrupan clips de test y validacion de Common Voice/FLEURS que no estan en el split de entrenamiento; VoxPopuli no tiene clips en el split de entrenamiento. Las puntuaciones se calcularon sobre referencias curadas tras normalizacion. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable en un modelo especializado en ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4-5 GB solo para los pesos (2.038 millones de parametros a 2 bytes por parametro), mas overhead de activaciones y del encoder de audio; no se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o L40S para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; no se confirma oficialmente.
- Opciones de despliegue: el autor indica el paquete oficial `qwen-asr` con `torch` y `librosa`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos de ASR en rumano en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A continuacion se comparan caracteristicas estructurales con el modelo base y con la alternativa generica mas cercana documentada.

| Modelo | Parametros | Idiomas | Licencia | WER en rumano (referencia) |
|---|---|---|---|---|
| VorbaVine/qwen3-asr-1.7b-vv-ro | 2.038 M | rumano | Apache-2.0 | 3,54-6,74 % (segun conjunto) |
| Qwen/Qwen3-ASR-1.7B (base) | 1,7 B (aprox.) | multilingue | Apache-2.0 | 13,95-22,68 % (segun conjunto) |
| Whisper large-v3 (OpenAI) | 1,55 B | multilingue | MIT | no disponible en la informacion |
| Alternativas ASR en rumano | no disponible | no disponible | no disponible | no disponible |

La comparacion con Whisper large-v3 se incluye por ser el referente habitual en ASR multilingue, pero no se han proporcionado cifras de WER en rumano para ese modelo en la informacion disponible.

## Limitaciones y advertencias

- Ambito limitado al rumano: el modelo esta ajustado exclusivamente para `language="Romanian"`; su comportamiento en otros idiomas no esta documentado y probablemente degrade respecto al modelo base.
- Sesgo de dominio: aproximadamente el 51 % del corpus de entrenamiento es habla sintetica y una parte relevante procede de Common Voice y FLEURS; el rendimiento en dominios muy distintos (jerga tecnica, acentos regionales no representados, audio con ruido) puede ser peor que el reportado.
- Riesgo de alucinacion en transcripcion: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente en segmentos con silencio, ruido o habla solapada.
- Split fijo compartido: el mismo split de VorbaVine se uso para entrenamiento, seleccion de modelo y test, lo que puede inflar ligeramente la metrica en ese conjunto respecto a una evaluacion totalmente independiente.
- Requisito de formato de audio: solo se documenta soporte para audio mono a 16 kHz; no se indica resampling automatico.
- Dependencia de un paquete especifico: la carga requiere el paquete `qwen-asr`, lo que limita la portabilidad a otros runtimes de inferencia.
- Sin datos de cuantizacion: no se documentan versiones GGUF, AWQ ni GPTQ, lo que dificulta el despliegue en entornos con poca VRAM.
- Licencia Apache-2.0: permisiva para uso comercial, pero conviene conservar los avisos de atribucion al modelo base Qwen y verificar las licencias de los datos de entrenamiento subyacentes (Common Voice, FLEURS, VoxPopuli) si se redistribuye el modelo.
- Modelo con cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VorbaVine/qwen3-asr-1.7b-vv-ro
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio del paquete oficial qwen-asr: https://github.com/QwenLM/Qwen3-ASR
