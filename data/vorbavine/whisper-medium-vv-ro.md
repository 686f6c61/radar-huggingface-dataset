# VorbaVine/whisper-medium-vv-ro

## Resumen

whisper-medium-vv-ro es un ajuste fino (fine-tuning) del modelo openai/whisper-medium de OpenAI, especializado en reconocimiento automatico del habla (ASR) en rumano. Lo desarrolla VorbaVine, un proyecto centrado en tecnologia del habla para esa lengua, y se publica bajo licencia Apache-2.0. El modelo parte de la arquitectura transformer encoder-decoder de Whisper en su variante medium, con 763.857.920 parametros totales, y mantiene el contexto de audio nativo de Whisper de ventanas de aproximadamente 30 segundos.

El problema que resuelve es la baja precision del Whisper original en rumano: el modelo base obtiene tasas de error de palabra (WER) superiores al 12 % en todos los conjuntos de prueba reportados, mientras que este ajuste las reduce a valores entre el 4,55 % y el 8,44 %. La mejora es especialmente marcada en dominios no vistos durante el entrenamiento, como FLEURS (de 19,45 % a 8,44 %) o Mozilla Common Voice (de 21,25 % a 5,81 %), lo que indica una buena generalizacion y no solo un sobreajuste al conjunto de entrenamiento.

Es relevante ahora porque cubre un hueco concreto: el rumano es una lengua con recursos limitados en comparacion con ingles, frances o aleman, y las alternativas open source con calidad aceptable son escasas. Al estar construido sobre Whisper medium y publicarse en formato safetensors con pesos compatibles con transformers, puede desplegarse directamente en pipelines existentes de transcripcion sin cambiar de ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ventanas de audio de aproximadamente 30 s (nativo de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, inferencia documentada en float16) |
| Idiomas soportados | rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Modelo base | openai/whisper-medium |
| Pipeline | automatic-speech-recognition |
| Frecuencia de muestreo | 16 kHz mono |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura completa de Whisper medium: un transformer encoder-decoder con atencion estandar (no hay atencion lineal ni mecanismos SSM) disenado para mapear espectrogramas Mel de audio a secuencias de tokens de texto. El ajuste fino no modifica la topologia, solo los pesos, por lo que hereda las capacidades y limitaciones estructurales del original: procesamiento de ventanas de audio de hasta unos 30 segundos y decodificacion autoregresiva con tokens especiales de idioma y tarea.

El entrenamiento se realizo sobre un corpus de 143,77 horas repartidas en 86.920 clips (73.174 de entrenamiento, 6.814 de validacion y 6.932 de prueba). Por fuente, el conjunto combina 8,4 h de grabaciones propias, 21,5 h de Common Voice, 5,9 h de FLEURS, 34,4 h de otro habla real y 73,5 h de habla sintetica; es decir, aproximadamente la mitad del material es generado artificialmente, un detalle importante para interpretar los resultados. La configuracion reportada incluye learning rate de 1e-6 con decaimiento lineal, 227 pasos de warmup, batch efectivo de 64, precision bf16 y weight decay de 0,01. Se conservo el checkpoint del paso 7371 de los 22.680 programados, seleccionado por el menor WER de validacion (4,24 %). No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en rumano, con salida de texto plano y soporte de los tokens de idioma y tarea de Whisper (`language="ro"`, `task="transcribe"`).
- Procesamiento de audio de hasta aproximadamente 30 segundos por ventana; para audio mas largo es necesario trocearlo en fragmentos.
- Entrada de audio a 16 kHz mono, con extraccion de caracteristicas Mel mediante `WhisperProcessor`.
- Inferencia en float16 sobre GPU, con el codigo de ejemplo oficial basado en `transformers`, `torch` y `librosa`.
- No se documentan capacidades de traduccion, tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada al rumano: aunque la arquitectura base soporta mas idiomas, este ajuste esta especializado y no se reportan evaluaciones en otras lenguas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en rumano: el modelo procesa fragmentos de hasta 30 segundos y ofrece WER por debajo del 9 % en dominios no vistos, lo que lo hace util para generar actas o resumenes a partir de audio corporativo, troceando las grabaciones largas antes de pasarlas al modelo.
- Subtitulado automatico de contenido audiovisual en rumano: con un WER de 4,55 % en el conjunto de prueba propio y 5,81 % en Common Voice, la calidad es suficiente para subtitulos que requieran revision humana ligera, integrable en pipelines con `transformers`.
- Atencion al cliente y centros de llamadas: transcripcion de conversaciones telefonicas en rumano para analitica, control de calidad o busqueda en grabaciones, aprovechando el rendimiento en habla real (VoxPopuli, 6,68 %).
- Investigacion en linguistica computacional del rumano: como linea base ajustada y reproducible para experimentos de ASR, con un split fijo documentado y resultados comparables frente a Whisper medium original.
- Generacion de datos y aumento de corpus: la propia receta del modelo (casi la mitad de habla sintetica) sugiere su uso como generador de transcripciones para construir o ampliar datasets de habla rumana.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en contenidos rumanos, con un coste de inferencia contenido al tratarse de un modelo de 764 M de parametros.
- Prototipado rapido en entornos con GPU de consumo: el tamano del modelo permite desplegarlo en una sola GPU moderna de gama alta, lo que facilita pruebas locales antes de escalar a produccion.

## Benchmarks y rendimiento

Resultados de WER (%) reportados por el autor; menor es mejor. Las referencias se puntuaron tras normalizacion (minusculas, sin puntuacion, cedilla a coma inferior, abreviaturas expandidas).

| Conjunto de prueba | Whisper medium base | whisper-medium-vv-ro |
|---|---|---|
| VorbaVine test | 16,67 | 4,55 |
| Mozilla (no visto) | 21,25 | 5,81 |
| FLEURS (no visto) | 19,45 | 8,44 |
| VoxPopuli (no visto) | 12,40 | 6,68 |

No se han publicado en la informacion disponible resultados de benchmarks genericos como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR. El WER de validacion del checkpoint retenido fue del 4,24 %.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 1,6-2 GB solo para pesos (764 M de parametros), mas el overhead de activaciones y del procesador; en la practica, entre 2 y 4 GB dependiendo del tamano de lote y de la longitud del audio.
- En float32 la huella de pesos se duplica (unos 3 GB), por lo que se recomienda float16 o bfloat16.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo es pequeno para su categoria y no requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con PyTorch (documentado oficialmente), y por compatibilidad de arquitectura Whisper tambien es plausible su conversion a otros runtimes como llama.cpp u Ollama, aunque no se documenta en la informacion disponible; vLLM y TGI no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER rumano (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-medium-vv-ro | 763.857.920 | ~30 s | 4,55 % (VorbaVine), 8,44 % (FLEURS) | Apache-2.0 | Hugging Face |
| openai/whisper-medium | 763.857.920 | ~30 s | 16,67 % (VorbaVine), 19,45 % (FLEURS) | Apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | ~30 s | no disponible | Apache-2.0 | Hugging Face |

La comparacion directa con whisper-large-v3 o con otros ajustes rumanos (por ejemplo, variantes de Whisper small o large afinadas para rumano) no puede completarse con datos de la informacion proporcionada; los unicos numeros verificables son los del modelo base frente a este ajuste.

## Limitaciones y advertencias

- El modelo solo esta entrenado y evaluado para rumano; no se garantiza su comportamiento en otras lenguas aunque la arquitectura base las soporte.
- Ventana de audio de aproximadamente 30 segundos: el audio mas largo debe trocearse, lo que puede introducir errores en las fronteras entre fragmentos.
- Casi la mitad del entrenamiento (73,5 h de 143,77 h) es habla sintetica, lo que puede sesgar el modelo hacia las caracteristicas acusticas de los sistemas TTS utilizados y afectar a su robustez en condiciones reales no representadas.
- El split de entrenamiento, seleccion y prueba es el mismo dataset fijo de VorbaVine, por lo que los resultados en ese conjunto pueden estar optimistamente sesgados; los conjuntos marcados como "no vistos" mitigan parcialmente este riesgo.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente en silencios, ruido o habla solapada.
- Sesgos conocidos: no se documentan analisis de sesgo por genero, edad, acento o dialecto del rumano; la composicion del corpus (Common Voice, FLEURS, VoxPopuli) condiciona la representatividad.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero se recomienda conservar el aviso de licencia y los creditos a OpenAI y VorbaVine.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.
- No se proporcionan datos de latencia, throughput ni comportamiento con audio de mas de 30 segundos, lo que limita la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VorbaVine/whisper-medium-vv-ro
- Modelo base: https://huggingface.co/openai/whisper-medium
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Common Voice (Mozilla): https://commonvoice.mozilla.org/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- VoxPopuli: https://github.com/facebookresearch/voxpopuli
