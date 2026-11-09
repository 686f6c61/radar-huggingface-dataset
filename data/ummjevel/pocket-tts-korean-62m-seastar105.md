# ummjevel/pocket-tts-korean-62m-seastar105

## Resumen

Pocket TTS Korean 62M es un modelo de sintesis de voz (text-to-speech) en coreano, desarrollado por el usuario ummjevel como modelo de investigacion comunitario. Se trata de una destilacion de anchura (width distillation) del checkpoint publico `seastar105/pocket-tts-korean-100m`, que a su vez deriva de la arquitectura original `kyutai/pocket-tts`. El modelo comprime la representacion interna de 1024 a 768 dimensiones y reduce las cabezas de atencion de 16 a 12, manteniendo seis capas y el codec Mimi completo, lo que da un total de aproximadamente 62 millones de parametros.

La relevancia de este modelo radica en su tamano reducido (62M de parametros, repositorio de 0,3 GB) combinado con un rendimiento medido en el conjunto de evaluacion CV3-Eval `zero_shot_ko`: CER del 6,328%, UTMOSv1 de 3,1089 y similitud de hablante de 0,9266 sobre 500 elementos. Es un modelo de sintesis zero-shot con clonacion de voz a partir de un prompt de hasta 5 segundos, orientado a entornos con recursos limitados.

No es un lanzamiento oficial de Kyutai ni de seastar105, sino un trabajo derivado de la comunidad. El modelo declara `inference: false` en su model card, lo que indica que no se ha validado para inferencia directa a traves de la infraestructura de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (transformer con codec Mimi), destilacion de anchura sobre kyutai/pocket-tts |
| Parametros totales | 62.055.106 (incluye codec Mimi completo y encoder de prompt) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (maximo de ejemplo 30 s, prompt de voz 5 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |
| Libreria | pocket-tts |
| Tamano del repositorio | 0,3 GB |
| Tokenizer | SentencePiece coreano, 4.000 tokens |
| Modelo base | seastar105/pocket-tts-korean-100m (revision 487e8440e4b5ff67ef58d0d100cd2335234d6c2f) |
| Checkpoint seleccionado | 20.000 pasos, EMA |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Pocket TTS de Kyutai, que combina un transformer con el codec neuronal Mimi para la generacion de audio. Sobre el checkpoint coreano de 100M de seastar105 se aplico un proceso de destilacion de anchura: la dimension del modelo se reduce de 1024 a 768, las cabezas de atencion de 16 a 12 y la escala oculta de la FFN de 4 a 2, conservando seis capas, la interfaz z de 1024 dimensiones, el tokenizer coreano, las cabezas originales de muestreo y EOS, y el codec Mimi completo. Antes de la destilacion se anadio una proyeccion de identidad z para adaptar la interfaz. La inicializacion se realizo mediante PCA del flujo residual, calibrada con 32 lotes del manifiesto de validacion del corpus de entrenamiento.

El entrenamiento uso el objetivo de MSE sobre el estado oculto z del profesor fijo (seastar105/pocket-tts-korean-100m), con optimizador AdamW, tasa de aprendizaje 0,0004, schedule coseno con 1.000 pasos de calentamiento, decaimiento EMA de 0,999, lote global de 64 (micro-lote 32 x acumulacion 2) y semilla 42. El dataset es `seastar105/emilia-yodas-ko-filtered-pocket-tts`, con 918.609 enunciados (2.276,88 horas) en entrenamiento y 9.472 enunciados (23,00 horas) en validacion. La guia CFG objetivo y de inferencia es 1. No hubo dropout de texto ni de voz.

## Capacidades

- Sintesis de voz en coreano a partir de texto, con salida de audio mediante el codec Mimi.
- Clonacion de voz zero-shot: genera habla imitando la voz de un prompt de audio de hasta 5 segundos.
- Generacion de enunciados de hasta 30 segundos por ejemplo.
- Control de muestreo mediante temperatura y umbral EOS (configurado a -1 en la evaluacion).
- Soporte de CFG (classifier-free guidance), con valor objetivo 1.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada mas alla del prompt de voz, ni razonamiento multi-paso.
- Capacidad multilingue limitada al coreano; no se declaran otros idiomas.

## Casos de uso

- Audiolibros y narracion en coreano: el modelo puede generar locuciones de hasta 30 segundos por fragmento con una calidad medida de UTMOSv1 3,1089, adecuada para prototipos de narracion automatizada.
- Clonacion de voz para doblaje: con un prompt de 5 segundos y una similitud de hablante de 0,9266, permite generar voces personalizadas para contenido en coreano.
- Asistentes de voz embebidos: sus 62M de parametros y 0,3 GB de repositorio lo hacen viable en dispositivos con recursos limitados para respuestas habladas en coreano.
- Accesibilidad: conversion de texto a voz para lectores de pantalla en coreano, con latencia potencialmente baja al ser un modelo pequeno.
- Investigacion en destilacion de modelos TTS: sirve como caso de estudio reproducible de width distillation sobre arquitecturas Pocket TTS, con receta de entrenamiento publicada.
- Generacion de contenido para videojuegos o aplicaciones interactivas: sintesis de dialogos en coreano con voces clonadas para personajes, siempre que la licencia CC-BY-4.0 y los derechos de las voces lo permitan.
- Pruebas de pipelines TTS en produccion: integracion en flujos de generacion de audio por lotes donde el coste computacional es critico.

## Benchmarks y rendimiento

| Metrica | Valor | Configuracion |
|---|---|---|
| CER (menor es mejor) | 6,328% | 500 items, CV3-Eval `zero_shot_ko`, CFG 1 |
| UTMOSv1 (mayor es mejor) | 3,1089 | Media sobre items audibles, mono 16 kHz |
| Similitud de hablante | 0,9266 | Cosine similarity con wavlm-base-plus-sv |
| Generaciones silenciosas | 0 / 500 | — |
| Generaciones sin EOS | 0 / 500 | — |

La evaluacion se realizo con semilla 0, temperatura 0,3, un paso de decodificacion, umbral EOS -1 y maximo de 30 segundos. El CER se midio con whisper-large-v3 forzado a coreano, decodificacion greedy de un beam y maximo de 256 tokens nuevos, aplicando normalizacion NFC y limpieza de puntuacion. UTMOSv1 se calculo con utmos-pytorch 0.1.0 y los pesos de Blinorot/UTMOS-PyTorch. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 62M de parametros en safetensors y un repositorio de 0,3 GB, la huella es inferior a 1 GB en precision completa, aunque el codec Mimi y el encoder de prompt anaden overhead no cuantificado.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente, pero no se confirma.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, aunque no se documenta oficialmente.
- Opciones de despliegue: la libreria declarada es `pocket-tts`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La model card indica `inference: false`.
- Latencia y throughput: no disponibles; la evaluacion no registro tiempos de generacion por enunciado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | CER | UTMOSv1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pocket-tts-korean-62m-seastar105 | 62,1M | 30 s por ejemplo, prompt 5 s | 6,328% | 3,1089 | CC-BY-4.0 | Publico en HF |
| seastar105/pocket-tts-korean-100m | ~100M | no disponible | no disponible | no disponible | no disponible | Publico en HF |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | no disponible | no disponible | Publico en HF |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y linaje.

## Limitaciones y advertencias

- Modelo de investigacion comunitario, no un lanzamiento oficial de Kyutai ni de seastar105; la calidad puede no estar validada fuera del conjunto de evaluacion.
- La model card declara `inference: false`, lo que sugiere que no se ha verificado su funcionamiento en la infraestructura de inferencia de Hugging Face.
- Solo soporta coreano; no hay capacidades multilingues declaradas.
- Riesgo de alucinacion en la sintesis: el CER del 6,328% implica errores de pronunciacion o contenido en aproximadamente 1 de cada 16 caracteres evaluados.
- La similitud de hablante y la clonacion de voz plantean riesgos de suplantacion y requieren consentimiento explicito de las voces de referencia.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero no se detallan restricciones adicionales sobre las voces o los datos de entrenamiento (Emilia/YODAS).
- No se documentan sesgos especificos; el corpus de entrenamiento (Emilia-YODAS filtrado) puede introducir sesgos de dominio y de hablantes.
- La evaluacion usa UTMOSv1, no MOS humano ni UTMOSv2, y la similitud de hablante se mide con un modelo automatico, no con juicio humano.
- No hay datos de latencia ni throughput, lo que dificulta estimar su idoneidad en produccion en tiempo real.
- El repositorio podria ser privado en el momento de la consulta (la model card menciona acceso restringido a las muestras de audio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ummjevel/pocket-tts-korean-62m-seastar105
- Modelo base: https://huggingface.co/seastar105/pocket-tts-korean-100m/tree/487e8440e4b5ff67ef58d0d100cd2335234d6c2f
- Arquitectura upstream: https://huggingface.co/kyutai/pocket-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/seastar105/emilia-yodas-ko-filtered-pocket-tts/tree/13e9bcb8200f3abf5aa687215f480305619aadd8
- Dataset de evaluacion: https://huggingface.co/datasets/yuekai/CV3-Eval/tree/6ea9d3650fffcbed7c6279e6d1546d01ef1d2796
- Pesos UTMOS: https://huggingface.co/Blinorot/UTMOS-PyTorch/tree/4f2447e519df3b88567b45583d3500006729502b
- utmos-pytorch: https://pypi.org/project/utmos-pytorch/0.1.0/
- Whisper large v3: https://huggingface.co/openai/whisper-large-v3/tree/06f233fe06e710322aca913c1bc4249a0d71fce1
- WavLM base plus SV: https://huggingface.co/microsoft/wavlm-base-plus-sv/tree/feb593a6c23c1cc3d9510425c29b0a14d2b07b1e
- Receta de entrenamiento: https://huggingface.co/ummjevel/pocket-tts-korean-62m-seastar105/blob/main/training_recipe.json
- Evaluacion: https://huggingface.co/ummjevel/pocket-tts-korean-62m-seastar105/blob/main/evaluation.json
- Protocolo de evaluacion y datos: https://huggingface.co/ummjevel/pocket-tts-korean-62m-seastar105/blob/main/EVALUATION_AND_DATA.md
