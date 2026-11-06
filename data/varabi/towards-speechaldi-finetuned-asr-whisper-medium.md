# VARabi/towards-speechaldi-finetuned-asr-whisper-medium

## Resumen

El modelo `VARabi/towards-speechaldi-finetuned-asr-whisper-medium` es un ajuste fino de `openai/whisper-medium` para reconocimiento automatico del habla (ASR) en arabe, especializado en dialecto saudí. Lo desarrolla el autor identificado como VARabi (el articulo asociado firma como Khadawardi, Keleg y Magdy) y se emplea como "Baseline 2" en experimentos de prediccion del nivel de dialectalidad del arabe (ALDi) directamente desde el habla. La idea es transcribir el audio y alimentar ese texto a un clasificador ALDi basado en texto.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper medium, con aproximadamente 764 millones de parametros, y se ajusta sobre el dataset SADA22, que contiene unas 420-435 horas de habla arabe saudí transcrita manualmente. Se trata de un modelo de una sola tarea (transcripcion) y un solo idioma (arabe), lo que lo hace muy especifico pero potencialmente valido para pipelines de dialectologia computacional y transcripcion de audio saudí.

Es relevante ahora porque la extension de ALDi al habla es un area de investigacion reciente (EMNLP 2023 para el ALDi textual, ArabicNLP 2026 para el enfoque desde habla) y porque demuestra que un ASR ajustado a un dialecto concreto puede servir como componente intermedio en pipelines de clasificacion linguistica. Su licencia Apache 2.0 facilita la reutilizacion, aunque su adopcion es muy baja (20 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana nativa de 30 segundos de audio; audio mas largo se trocea automaticamente |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, entrenamiento en FP16) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-medium`, un transformer encoder-decoder disenado para ASR que procesa espectrogramas mel de 80 canales y genera tokens de texto de forma autoregresiva. La ventana nativa de entrada es de 30 segundos de audio; el pipeline de Transformers trocea automaticamente los audios mas largos. No hay innovaciones arquitectonicas propias: se mantiene la topologia original de Whisper y solo se actualizan los pesos mediante fine-tuning supervisado.

El entrenamiento se realizo sobre la totalidad del dataset SADA22 (aproximadamente 420 horas de habla arabe saudí transcrita manualmente), durante 4 epocas, con learning rate 1e-5, batch size 8, acumulacion de gradientes de 1 paso, warmup ratio de 0.1 y precision FP16. La tarea es `transcribe` y el idioma fijado es arabe. No se menciona uso de RLHF, DPO ni datos sinteticos; es un fine-tuning supervisado clasico sobre pares audio-transcripcion.

## Capacidades

- Transcripcion de voz a texto en arabe, con especializacion en dialecto saudí.
- Procesamiento de segmentos de audio de hasta 30 segundos de forma nativa; troceado automatico de audios mas largos mediante el pipeline.
- Acepta formatos de audio soportados por torchaudio (WAV, FLAC, MP3, entre otros) y los remuestrea a 16 kHz.
- Integracion con la libreria `transformers` mediante `WhisperForConditionalGeneration`, `WhisperProcessor` y el pipeline `automatic-speech-recognition`.
- Uso como componente ASR dentro de un pipeline en cascada de dos etapas: audio, transcripcion y clasificador ALDi (`AMR-KELEG/Sentence-ALDi`).
- No soporta tool calling, function calling, agentes, vision, audio de entrada distinto de voz, ni modos de razonamiento extendido.
- Capacidad multilingue limitada: solo arabe; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Transcripcion de audio saudí en investigacion dialectologica: el modelo genera transcripciones que se alimentan a un clasificador ALDi para estimar el nivel de dialectalidad de un enunciado, tal como se describe en el pipeline Baseline 2 del articulo.
- Construccion de corpus anotados con nivel de dialecto: transcripcion masiva de grabaciones en arabe saudí para etiquetar automaticamente el grado de dialectalidad y entrenar o evaluar modelos de identificacion de dialecto arabe (ADI).
- Analisis de entrevistas y encuestas en dialecto saudí: transcripcion de grabaciones de campo para su posterior analisis cualitativo o cuantitativo, aprovechando el ajuste especifico al dominio.
- Preprocesamiento de datos para modelos de lenguaje arabe: conversion de audio a texto en dialecto saudí para aumentar corpus de entrenamiento o evaluacion de modelos de NLP arabe.
- Investigacion comparativa de enfoques ASR en cascada frente a enfoques directos: el modelo sirve como referencia reproducible (Baseline 2) en experimentos que comparan prediccion desde texto frente a prediccion directa desde audio.
- Transcripcion de contenido audiovisual en dialecto saudí (podcasts, videos, medios locales) para subtitulado o indexacion, siempre que se acepte la degradacion esperada fuera del dominio SADA22.
- Evaluacion de robustez de Whisper en variantes dialectales: al estar ajustado a un unico dialecto, permite medir la brecha de WER entre dialecto saudí y otras variedades o MSA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER ni comparaciones numericas con otros modelos; solo indica cualitativamente que el WER sera mayor en otros dialectos arabes o en emisiones en MSA.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: alrededor de 1,5-2 GB solo para pesos (764 M de parametros), mas overhead de activaciones y del procesador; en la practica, unos 2-3 GB.
- En cuantizacion de 8 bits, la huella de pesos baja a aproximadamente 0,8 GB; en 4 bits, a unos 0,4 GB (estimacion a partir del numero de parametros, no confirmada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Tambien puede ejecutarse en CPU para audios cortos, aunque con mayor latencia.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (referencia en la model card), pipeline `automatic-speech-recognition`; tambien es compatible con stacks que acepten pesos Whisper en safetensors, como vLLM, TGI, llama.cpp u Ollama, aunque estos ultimos no se mencionan en la informacion disponible y requeririan conversion a GGUF u otros formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VARabi/towards-speechaldi-finetuned-asr-whisper-medium | 763.857.920 | 30 s nativos | arabe (saudí) | Apache 2.0 | Hugging Face, 20 descargas |
| openai/whisper-medium | ~764 M | 30 s nativos | multilingue (99 idiomas) | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-large-v3 | ~1,55 B | 30 s nativos | multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos ASR arabes especializados (genericos) | no disponible | no disponible | arabe | no disponible | no disponible |

La comparacion cuantitativa de WER entre estos modelos no esta disponible en la informacion proporcionada. Frente a `openai/whisper-medium`, este ajuste gana especializacion en dialecto saudí a costa de perder cobertura multilingue. Frente a `whisper-large-v3`, ofrece menor coste computacional (la mitad de parametros aproximadamente) pero presumiblemente menor precision general, aunque no hay datos que lo confirmen.

## Limitaciones y advertencias

- El ajuste se realizo exclusivamente sobre arabe saudí (SADA22); el WER en otros dialectos arabes o en MSA sera previsiblemente mayor, segun advierte el propio autor.
- Optimizado para segmentos de hasta 30 segundos; audios mas largos dependen del troceado automatico del pipeline y pueden sufrir perdida de contexto entre fragmentos.
- Modelo de un solo idioma: no debe usarse para transcripcion multilingue ni para otros idiomas distintos del arabe.
- Riesgo de alucinacion tipico de Whisper en segmentos con ruido, silencios o audio de baja calidad; no se documentan mitigaciones especificas.
- No se han publicado evaluaciones de sesgo; al estar entrenado en un unico dialecto, puede infrarepresentar variantes regionales dentro del propio arabe saudí.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y su adopcion es muy baja (20 descargas, 0 likes), lo que reduce la validacion comunitaria.
- La model card contiene ejemplos de codigo que referencian otro identificador (`wageehkhad/whisper-medium-finetuned-sada-asr`) distinto del ID del repositorio; conviene verificar la ruta correcta antes de usarlo en produccion.
- No dispone de soporte de tool calling, agentes ni modos de razonamiento; su uso esta acotado a transcripcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VARabi/towards-speechaldi-finetuned-asr-whisper-medium
- Modelo base: https://huggingface.co/openai/whisper-medium
- Dataset SADA22: https://huggingface.co/datasets/MohamedRashad/SADA22
- Clasificador ALDi textual: https://huggingface.co/AMR-KELEG/Sentence-ALDi
- Paper ALDi original (EMNLP 2023): https://aclanthology.org/2023.emnlp-main.655/
- Paper "Towards Speech ALDi" (ArabicNLP 2026): https://aclanthology.org/2026.arabicnlp-main.28/
- DOI del paper: https://doi.org/10.18653/2026.arabicnlp-main.28
