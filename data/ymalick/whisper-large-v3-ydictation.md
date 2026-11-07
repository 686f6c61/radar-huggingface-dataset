# ymalick/whisper-large-v3-ydictation

## Resumen

whisper-large-v3-ydictation es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla Whisper large-v3 de OpenAI, publicado por el usuario ymalick en Hugging Face. El modelo parte de la version intermedia `unsloth/whisper-large-v3` y se ha entrenado con la libreria Unsloth junto con TRL de Hugging Face, lo que segun el autor permitio un entrenamiento el doble de rapido que el flujo convencional. El resultado es un checkpoint de 1.543.490.560 parametros en formato safetensors, con un repositorio de 3,1 GB.

La relevancia de esta publicacion es limitada pero ilustrativa: se trata de un ejemplo de ajuste fino eficiente de un modelo ASR de gran tamano sobre un dominio concreto (la model card no documenta el dataset utilizado, aunque el sufijo "ydictation" sugiere datos de dictado). El modelo conserva la arquitectura encoder-decoder transformer de Whisper large-v3, con 1.550 millones de parametros y una ventana de audio de 30 segundos por inferencia, y mantiene la licencia Apache 2.0 del modelo original.

Conviene subrayar que la model card es minima: no incluye detalles del corpus de entrenamiento, hiperparametros, metricas de evaluacion ni resultados de benchmarks. El modelo declara unicamente el idioma ingles y no cuenta con descargas ni likes en el momento de la consulta, por lo que debe considerarse un experimento de ajuste fino y no un modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3: un transformer encoder-decoder entrenado para transcripcion de audio, con 1.550 millones de parametros y una entrada de audio segmentada en ventanas de 30 segundos convertidas a espectrogramas mel. Whisper large-v3 es la variante mas grande de la familia Whisper de OpenAI y, en su version original, soporta transcripcion multilingue y traduccion al ingles; en este ajuste fino el autor declara unicamente el idioma ingles.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, partiendo de `unsloth/whisper-large-v3`. El autor afirma que el entrenamiento fue 2 veces mas rapido gracias a Unsloth, pero no se documentan el numero de tokens de audio, la composicion del dataset, la duracion del entrenamiento, los hiperparametros ni si se aplicaron tecnicas de RLHF o DPO. No hay informacion sobre innovaciones tecnicas adicionales mas alla del uso de Unsloth para acelerar el ajuste fino.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto.
- Procesamiento de audio en ventanas de 30 segundos, con capacidad de encadenar ventanas para audios mas largos mediante el pipeline de transformers.
- Integracion con el pipeline `automatic-speech-recognition` de la libreria transformers.
- Compatibilidad declarada con text-generation-inference (tag `text-generation-inference`) y endpoints compatibles.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue: no disponible en este ajuste (solo ingles declarado).

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo puede procesar audio de hasta 30 segundos por ventana y encadenar segmentos para actas o resumenes posteriores, aprovechando la arquitectura de Whisper large-v3.
- Dictado por voz en herramientas de productividad: el sufijo "ydictation" sugiere un ajuste orientado a dictado, por lo que encaja en flujos de escritura asistida por voz en ingles.
- Generacion de subtitulos para contenido audiovisual en ingles: el pipeline ASR de transformers permite producir transcripciones con marcas de tiempo para videos y podcasts.
- Preprocesamiento de audio para pipelines de NLP: transcripcion de llamadas o entrevistas antes de aplicar analisis de sentimiento o extraccion de entidades.
- Prototipado e investigacion en ASR: sirve como punto de partida para experimentos de ajuste fino con Unsloth, dado que el autor documenta ese flujo de entrenamiento.
- Indexacion y busqueda de archivos de audio: convertir grabaciones a texto para alimentar motores de busqueda o sistemas RAG sobre transcripciones.
- Evaluacion comparativa de ajustes finos de Whisper: util como referencia para medir el efecto de un fine-tuning ligero frente al modelo base en dominios de dictado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para los pesos (1.543.490.560 parametros x 2 bytes), mas memoria para activaciones y buffers de audio; en la practica se recomienda al menos 6-8 GB de VRAM.
- En cuantizacion de 8 bits, los pesos ocuparian alrededor de 1,5 GB; en 4 bits, alrededor de 0,8 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: NVIDIA A100 o H100 para lotes grandes y throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16 (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 3070); en cuantizacion podria caber en GPUs de 4-6 GB.
- Opciones de despliegue: pipeline de transformers, text-generation-inference (declarado compatible), y en principio llama.cpp u Ollama solo si se generan conversiones GGUF, que no se documentan en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ymalick/whisper-large-v3-ydictation | 1.543.490.560 | ventanas de 30 s | en | apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550 millones (aprox.) | ventanas de 30 s | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-large | 1.550 millones (aprox.) | ventanas de 30 s | multilingue | apache-2.0 | Hugging Face |
| unsloth/whisper-large-v3 | 1.550 millones (aprox.) | ventanas de 30 s | multilingue | no disponible en la informacion | Hugging Face |

La diferencia principal frente a los modelos base es el ajuste fino sobre datos no documentados y la restriccion declarada al ingles; en parametros y arquitectura es practicamente identico a whisper-large-v3.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce el dominio exacto y los posibles sesgos introducidos por el ajuste fino.
- Riesgo de alucinacion en transcripciones: Whisper puede generar texto plausible en segmentos con ruido o silencio, y el ajuste fino no corrige necesariamente este comportamiento.
- Solo se declara soporte de ingles; el uso con otros idiomas no esta garantizado y puede degradar la calidad frente al modelo base multilingue.
- Ventana de audio de 30 segundos por inferencia; audios mas largos requieren segmentacion y pueden acumular errores en las fronteras.
- No hay benchmarks publicados, por lo que no se puede verificar que el ajuste fino mejore al modelo base en ninguna metrica.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de Whisper large-v3 conviene revisar las condiciones del modelo original y de `unsloth/whisper-large-v3`.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Para produccion se recomienda evaluar con un conjunto propio antes de sustituir al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ymalick/whisper-large-v3-ydictation
- Modelo base intermedio: https://huggingface.co/unsloth/whisper-large-v3
- Whisper large-v3 original: https://huggingface.co/openai/whisper-large-v3
- Whisper large original: https://huggingface.co/openai/whisper-large
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
