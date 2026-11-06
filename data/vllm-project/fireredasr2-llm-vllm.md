# vllm-project/FireRedASR2-LLM-vllm

## Resumen

FireRedASR2-LLM es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo FireRed (FireRedTeam), que forma parte del sistema integral FireRedASR2S, una suite industrial de ASR que incluye módulos de detección de actividad vocal (VAD), identificación de idioma hablado (LID) y predicción de puntuación. Este repositorio concreto es una copia del checkpoint original alojada en la organización vllm-project para uso en la integración continua de vLLM, lo que reduce el riesgo de cadena de suministro al no depender de una cuenta personal.

El modelo adopta una arquitectura Encoder-Adapter-LLM: un codificador de audio se conecta mediante un adaptador a un modelo de lenguaje basado en Qwen2, lo que permite un reconocimiento de voz de extremo a extremo con capacidades lingüísticas heredadas del LLM. Está diseñado para ofrecer el máximo rendimiento en reconocimiento de chino mandarín, más de 20 dialectos y acentos chinos, inglés y conmutación de código (code-switching), así como reconocimiento de letras cantadas.

Su relevancia radica en que, según los datos publicados por el autor, supera a alternativas industriales como Doubao-ASR, Qwen3-ASR-1.7B, Fun-ASR y Fun-ASR-Nano-2512 tanto en mandarín como en dialectos, con un CER medio del 2,89 % en mandarín (4 conjuntos de prueba) y del 11,55 % en dialectos (19 conjuntos de prueba). La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Adapter-LLM (codificador de audio + adaptador + LLM basado en Qwen2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (mandarín y más de 20 dialectos/acentos), inglés, code-switching |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 33,4 GB; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

FireRedASR2-LLM se enmarca en el sistema FireRedASR2, que es la segunda generación del proyecto FireRedASR. La variante LLM utiliza un esquema Encoder-Adapter-LLM en el que un codificador de audio procesa la señal y un adaptador proyecta las representaciones hacia un modelo de lenguaje basado en Qwen2 (según los tags del repositorio), lo que permite aprovechar las capacidades lingüísticas del LLM para la transcripción de extremo a extremo y la interacción por voz. La variante hermana FireRedASR2-AED emplea una arquitectura Attention-based Encoder-Decoder (AED) orientada a eficiencia computacional y representación del habla para modelos basados en LLM.

El sistema completo FireRedASR2S incluye además FireRedVAD (detección de actividad vocal basada en DFSMN, en modo streaming y no streaming, con detección de eventos de audio), FireRedLID (identificación de idioma hablado basada en FireRedASR2) y FireRedPunc (predicción de puntuación basada en BERT). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El informe técnico y el código de fine-tuning estaban anunciados como pendientes de publicación en la model card.

## Capacidades

- Reconocimiento automático del habla (ASR) en chino mandarín, más de 20 dialectos y acentos chinos (cantonés de Hong Kong y Guangdong, sichuanés, shanghainés, wu, minnan, anhui, fujian, gansu, guizhou, hebei, henan, hubei, hunan, jiangxi, liaoning, ningxia, shaanxi, shanxi, shandong, tianjin, yunnan, entre otros) e inglés.
- Reconocimiento de conmutación de código (code-switching) entre chino e inglés.
- Reconocimiento de letras cantadas (singing lyrics recognition).
- Integración con el ecosistema vLLM para inferencia acelerada.
- La variante AED del mismo sistema soporta marcas de tiempo a nivel de palabra y puntuaciones de confianza; no se confirma que la variante LLM las soporte.
- Capacidades multilingües limitadas a chino e inglés según los tags del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento multi-paso orientadas a agentes.

## Casos de uso

- Subtitulado automático de vídeo y audio en chino e inglés: el modelo transcribe audio con alta precisión (2,89 % CER medio en mandarín) y puede combinarse con FireRedPunc para generar subtítulos puntuados listos para publicación.
- Transcripción de reuniones y conversaciones: el soporte de dialectos y code-switching permite transcribir reuniones con hablantes de distintas regiones chinas que alternan inglés y chino, un escenario frecuente en entornos corporativos internacionales.
- Atención al cliente por voz: integrado con vLLM para inferencia de baja latencia, el modelo puede alimentar pipelines de transcripción en tiempo real de llamadas telefónicas, incluyendo hablantes con acentos marcados.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio y vídeo para indexación y búsqueda textual, aprovechando el rendimiento en dialectos (11,55 % CER medio en 19 conjuntos de prueba) que supera a alternativas como Doubao-ASR o Fun-ASR.
- Reconocimiento de letras de canciones: aplicación específica para plataformas de música o karaoke que necesitan transcribir letras cantadas, una capacidad poco común en sistemas ASR generalistas.
- Investigación en lingüística y dialectología: el modelo permite transcribir corpus de dialectos chinos con una precisión significativamente superior a la de sistemas generalistas, facilitando estudios comparativos y creación de datasets anotados.
- Integración en asistentes de voz end-to-end: la arquitectura Encoder-Adapter-LLM está diseñada para interacción por voz de extremo a extremo, lo que permite construir asistentes que transcriben y comprenden en un único pipeline.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan FireRedASR2-LLM y FireRedASR2-AED con Doubao-ASR, Qwen3-ASR, Fun-ASR y Fun-ASR-Nano en CER (%) para chino y WER (%) para inglés. Menor es mejor.

| Conjunto de prueba | FireRedASR2-LLM | FireRedASR2-AED | Doubao-ASR | Qwen3-ASR | Fun-ASR | Fun-ASR-Nano |
|---|---|---|---|---|---|---|
| Media CER (mandarín, 4 conjuntos) | 2,89 | 3,05 | 3,69 | 3,76 | 4,16 | 4,55 |
| Media CER (dialectos, 19 conjuntos) | 11,55 | 11,67 | 15,39 | 11,85 | 12,76 | 15,07 |
| Media CER (todos, 1-24) | 9,67 | 9,80 | 12,98 | 10,12 | 10,92 | 12,81 |

Los resultados del conjunto completo (24 conjuntos de prueba) confirman que FireRedASR2-LLM obtiene el mejor CER medio global (9,67 %) frente a todos los competidores listados. No se han publicado en la información disponible resultados de benchmarks de otros tipos (MMLU, HumanEval, GSM8K) por tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 33,4 GB, lo que sugiere que los pesos en precisión completa o media precisión requieren al menos esa cantidad de memoria, aunque no se confirma el número exacto de parámetros.
- GPU recomendadas: no disponible de forma específica para este modelo. El sistema FireRedASR2-AED reporta una aceleración de 12,7x con TensorRT-LLM frente a la línea base de PyTorch en una sola GPU H20 (según NVIDIA), dato que corresponde a la variante AED, no a la LLM.
- ¿Cabe en GPU de consumo? No confirmado. Dado el tamaño del repositorio (33,4 GB), sería necesario cuantizar para caber en GPUs de consumo con 24 GB de VRAM o menos, pero no se documentan formatos de cuantización disponibles.
- Opciones de despliegue: el repositorio está específicamente preparado para vLLM (organización vllm-project, etiqueta vllm-ci-copy). También se menciona soporte de TensorRT-LLM para la variante AED. No se documenta soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput estimados: no disponibles para la variante LLM.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | CER mandarín (media) | CER dialectos (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FireRedASR2-LLM | Encoder-Adapter-LLM (Qwen2) | Chino (mandarín + 20 dialectos), inglés, code-switching | 2,89 | 11,55 | Apache 2.0 | Hugging Face, ModelScope |
| FireRedASR2-AED | Attention-based Encoder-Decoder | Chino (mandarín + 20 dialectos), inglés, code-switching | 3,05 | 11,67 | no disponible | Hugging Face, ModelScope |
| Qwen3-ASR-1.7B | no disponible | no disponible | 3,76 | 11,85 | no disponible | no disponible |
| Doubao-ASR | no disponible | no disponible | 3,69 | 15,39 | no disponible (propietario) | no disponible |
| Fun-ASR | no disponible | no disponible | 4,16 | 12,76 | no disponible | no disponible |

FireRedASR2-LLM lidera tanto en mandarín como en dialectos entre los modelos comparados en la información disponible. La comparativa se limita a métricas de error de transcripción; no se dispone de datos de parámetros, contexto ni latencia de los competidores.

## Limitaciones y advertencias

- El modelo está especializado en ASR y limitado a chino (mandarín y dialectos) e inglés; no cubre otros idiomas según los tags del repositorio.
- No se documentan en la información disponible los sesgos conocidos del modelo, pero al estar entrenado principalmente con datos de chino e inglés, es previsible un rendimiento inferior con hablantes de otras lenguas o acentos no representados.
- Riesgo de alucinación: como modelo basado en LLM, existe el riesgo de que genere texto no presente en el audio, especialmente en segmentos con ruido o silencios; no se documenta ninguna mitigación específica.
- El repositorio es una copia de CI (vllm-ci-copy) del checkpoint original alojado en una cuenta personal (allendou/FireRedASR2-LLM-vllm); para producción se recomienda verificar el checkpoint original de FireRedTeam.
- No se dispone de información sobre el número de parámetros, la longitud de contexto ni los formatos de cuantización, lo que dificulta la planificación de despliegues con restricciones de memoria.
- El informe técnico y el código de fine-tuning estaban pendientes de publicación en el momento de la model card, lo que limita la reproducibilidad y la adaptación a dominios específicos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los modelos base subyacentes (Qwen2) y de los datasets de entrenamiento, no detallados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vllm-project/FireRedASR2-LLM-vllm
- Checkpoint original: https://huggingface.co/allendou/FireRedASR2-LLM-vllm
- Modelo oficial FireRedASR2-LLM: https://huggingface.co/FireRedTeam/FireRedASR2-LLM
- Modelo en ModelScope: https://www.modelscope.cn/models/xukaituo/FireRedASR2-LLM/
- Código: https://github.com/FireRedTeam/FireRedASR2S
- Paper: https://arxiv.org/pdf/2501.14350
- Organización en Hugging Face: https://huggingface.co/FireRedTeam
- Blog: https://fireredteam.github.io/demos/firered_asr/
- Demo: https://huggingface.co/spaces/FireRedTeam/FireRedASR
- FireRedASR (generación anterior): https://github.com/FireRedTeam/FireRedASR
