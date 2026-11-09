# ummjevel/pocket-tts-korean-100m-distilled

## Resumen

Pocket TTS Korean 100M Distilled es un modelo de sintesis de voz (text-to-speech) en coreano desarrollado por el usuario ummjevel, derivado del modelo base `kyutai/pocket-tts` mediante destilacion de conocimiento. Se trata de un modelo de investigacion de la comunidad, no de un lanzamiento oficial de Kyutai, y esta disenado para generar audio a partir de texto en coreano con una huella de parametros reducida: 109.502.146 parametros en total, incluyendo el codec Mimi completo y el codificador de prompt de voz.

El modelo se obtiene por destilacion de un backbone de seis capas a partir de un profesor de 300M (Korean 300M 110k EMA), transfiriendo los embeddings de texto coreano y las cabezas de muestreo/EOS del profesor. El checkpoint seleccionado es el EMA de 6.000 pasos, con un horizonte coseno planificado de 10.000. Emplea un tokenizador SentencePiece coreano de 4.000 tokens y un maximo de 30 segundos por ejemplo (5 segundos de prompt de voz).

Su relevancia radica en ofrecer una alternativa compacta y abierta (licencia CC-BY-4.0) para TTS en coreano con resultados medidos en CER (5,623%), UTMOSv1 (3,1816) y similitud de hablante (0,9317) sobre el conjunto CV3-Eval. Al estar pensado para investigacion y tener un tamano de repo de 0,4 GB, es viable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de seis capas con codec Mimi y codificador de prompt de voz (derivado de kyutai/pocket-tts) |
| Parametros totales | 109.502.146 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Maximo 30 segundos por ejemplo de audio; prompt de voz de 5 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pocket TTS de Kyutai, con un backbone transformer de seis capas inicializado desde el checkpoint ingles de Kyutai (`kyutai/pocket-tts`, rama `languages/english_2026-04`) al que se le transfieren embeddings de texto coreano y cabezas de muestreo/EOS desde el profesor. La destilacion se realiza sobre el objetivo de MSE en el espacio oculto nativo (hidden-z), manteniendo congelados la cabeza de muestreo, la cabeza EOS y el codec Mimi completo.

El entrenamiento emplea AdamW con learning rate 0,0004, schedule coseno con 1.000 pasos de warmup, EMA con decaimiento 0,999, batch global de 64 (microbatch 32 x acumulacion de gradiente 2) y semilla 42. El dataset es `seastar105/emilia-yodas-ko-filtered-pocket-tts`, con 918.609 utterances (2.276,88 horas) en entrenamiento y 9.472 utterances (23,00 horas) en validacion. Se usa CFG 2 para el objetivo del profesor y CFG 1 en inferencia del estudiante. No se aplica dropout de texto ni de voz.

## Capacidades

- Sintesis de voz (text-to-speech) en coreano a partir de texto escrito.
- Clonacion de voz zero-shot mediante prompt de voz de hasta 5 segundos.
- Generacion de audio de hasta 30 segundos por ejemplo.
- Control de similitud de hablante respecto al prompt (0,9317 de similitud coseno medida).
- Generacion con temperatura configurable (evaluado a temperatura 0,3) y umbral EOS ajustable.
- No soporta tool calling ni function calling (es un modelo TTS).
- No soporta razonamiento multi-paso ni agentes.
- Capacidad multilingue limitada al coreano.
- No dispone de vision ni audio de entrada mas alla del prompt de voz.

## Casos de uso

- Audiolibros y narracion automatizada en coreano: el modelo genera hasta 30 segundos por fragmento, lo que permite segmentar textos largos y sintetizar cada trozo con un prompt de voz consistente para mantener la identidad del narrador.
- Asistentes de voz para aplicaciones coreanas: con 109,5M de parametros y repo de 0,4 GB, puede desplegarse en entornos con recursos limitados para respuestas habladas en tiempo cuasi real.
- Clonacion de voz para doblaje: el prompt de 5 segundos permite replicar la voz de un hablante concreto, util para doblar contenido al coreano manteniendo la identidad vocal del original.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad en coreano, con CER del 5,623% que garantiza inteligibilidad razonable.
- Generacion de contenido para formacion y e-learning: sintesis de locuciones para cursos en coreano sin necesidad de grabacion humana.
- Investigacion en TTS: al ser un modelo de destilacion con receta de entrenamiento publicada (`training_recipe.json`) y protocolo de evaluacion reproducible, sirve como base para experimentos de compresion y destilacion en sintesis de voz.
- Prototipado de interfaces conversacionales: integracion en pipelines de voz para pruebas de concepto en coreano antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Configuracion |
|---|---|---|
| CER (↓) | 5,623% | 500 items, CV3-Eval `zero_shot_ko`, CFG 1, temp. 0,3, seed 0 |
| UTMOSv1 (↑) | 3,1816 | Media sobre items audibles, mono 16 kHz sin padding |
| Similitud de hablante (↑) | 0,9317 | Similitud coseno con wavlm-base-plus-sv a 16 kHz |
| Generaciones silenciosas | 0 / 500 | — |
| Generaciones sin EOS | 0 / 500 | — |

No se han publicado resultados comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 109,5M de parametros en safetensors y repo de 0,4 GB, la huella de pesos es inferior a 1 GB, por lo que la VRAM necesaria sera moderada (dependiendo del codec Mimi y del runtime).
- GPU recomendadas: no especificadas; por tamano, cabe en GPUs consumer de gama media (por ejemplo, RTX 3060 o superiores) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: si, dado el reducido numero de parametros.
- Opciones de despliegue: la libreria indicada es `pocket-tts`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el campo `inference: false` en la model card sugiere que el autor no garantiza inferencia directa a traves del pipeline estandar de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Idioma | Disponibilidad |
|---|---|---|---|---|---|
| Pocket TTS Korean 100M Distilled (este) | 109,5M | 30 s por ejemplo, prompt 5 s | CC-BY-4.0 | Coreano | Hugging Face (repo de investigacion) |
| kyutai/pocket-tts (base) | no disponible | no disponible | no disponible en la informacion | Ingles (segun checkpoint de inicializacion) | Hugging Face |
| Korean 300M 110k EMA (profesor) | 300M (aprox.) | no disponible | no disponible en la informacion | Coreano | Hugging Face (ummjevel/pocket-tts-korean-300m-finetuned) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion de la comunidad, no un lanzamiento oficial de Kyutai; no debe tratarse como producto validado para produccion.
- El campo `inference: false` en la model card indica que no se garantiza la inferencia a traves del pipeline estandar; es necesario verificar el runtime `pocket-tts`.
- Limitado exclusivamente al coreano; no soporta otros idiomas.
- Duracion maxima de 30 segundos por generacion y prompt de voz de 5 segundos, lo que limita la sintesis de fragmentos largos sin segmentacion.
- Las metricas de calidad (UTMOSv1 3,1816) son automaticas y no equivalen a MOS humano ni a UTMOSv2; el autor lo advierte explicitamente.
- Riesgo de alucinacion o artefactos en la sintesis no cuantificado mas alla de las metricas de CER y generaciones silenciosas/sin EOS.
- Sesgos de hablante y prosodia no evaluados en la informacion disponible.
- Licencia CC-BY-4.0 permite uso comercial con atribucion, pero al ser un modelo de investigacion conviene revisar las condiciones del modelo base y del dataset de entrenamiento antes de un despliegue comercial.
- Los ejemplos de audio del repositorio son selecciones automaticas por ranking, no juicios de escucha humanos.

## Enlaces

- Hugging Face: https://huggingface.co/ummjevel/pocket-tts-korean-100m-distilled
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Checkpoint de inicializacion (rama inglesa): https://huggingface.co/kyutai/pocket-tts/tree/19f95fe2df36e79fbd9f10008595cc4c977a0fcc/languages/english_2026-04
- Profesor de destilacion: https://huggingface.co/ummjevel/pocket-tts-korean-300m-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/seastar105/emilia-yodas-ko-filtered-pocket-tts/tree/13e9bcb8200f3abf5aa687215f480305619aadd8
- Dataset de evaluacion: https://huggingface.co/datasets/yuekai/CV3-Eval/tree/6ea9d3650fffcbed7c6279e6d1546d01ef1d2796
- Receta de entrenamiento: https://huggingface.co/ummjevel/pocket-tts-korean-100m-distilled/blob/main/training_recipe.json
- Evaluacion: https://huggingface.co/ummjevel/pocket-tts-korean-100m-distilled/blob/main/evaluation.json
- Protocolo de evaluacion y datos: https://huggingface.co/ummjevel/pocket-tts-korean-100m-distilled/blob/main/EVALUATION_AND_DATA.md
- ASR de evaluacion (Whisper large-v3): https://huggingface.co/openai/whisper-large-v3/tree/06f233fe06e710322aca913c1bc4249a0d71fce1
- Modelo de similitud de hablante (WavLM): https://huggingface.co/microsoft/wavlm-base-plus-sv/tree/feb593a6c23c1cc3d9510425c29b0a14d2b07b1e
- Pesos UTMOS: https://huggingface.co/Blinorot/UTMOS-PyTorch/tree/4f2447e519df3b88567b45583d3500006729502b
- Paquete utmos-pytorch: https://pypi.org/project/utmos-pytorch/0.1.0/
