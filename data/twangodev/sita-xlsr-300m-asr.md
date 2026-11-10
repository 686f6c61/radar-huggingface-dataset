# twangodev/sita-xlsr-300m-asr

## Resumen

Sita XLS-R 300M ASR es un modelo de reconocimiento automático del habla (ASR) especializado en hmong (código ISO `hmn`), desarrollado por twangodev. Se trata de un ajuste fino del modelo preentrenado multilingüe `facebook/wav2vec2-xls-r-300m` de Meta, adaptado mediante el paquete SITA del propio autor para realizar decodificación CTC sobre audio en hmong. Con 315.467.420 parámetros, el modelo parte de un backbone wav2vec2 de 300M y añade la cabeza CTC necesaria para la transcripción carácter a carácter.

El modelo resuelve un problema de baja cobertura: el hmong es una lengua con recursos limitados y escasa representación en los sistemas ASR comerciales. Al fine-tunear un modelo XLS-R multilingüe sobre el dataset `twangodev/sita`, el autor ofrece un punto de partida reproducible para transcripción en esta lengua. La evaluación publicada reporta un WER codicioso del 40,94 % y un CER del 12,23 % sobre validación disjunta por hablante, lo que sitúa al modelo en un rango de utilidad para prototipos y experimentación, pero lejos de calidad de producción.

Es relevante ahora porque demuestra un flujo completo de adaptación de XLS-R a una lengua de bajos recursos con licencia Apache 2.0, pesos en safetensors y un runtime Python propio (`sita_runtime-0.1.0`), lo que facilita su replicación y su integración en pipelines de investigación. El modelo está pensado para audio mono a 16 kHz y decodificación CTC greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 XLS-R (transformer convolucional + encoder transformer) con cabeza CTC |
| Parametros totales | 315.467.420 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrada de audio; XLS-R procesa ventanas de audio, sin contexto de texto definido) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | hmong (`hmn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2 XLS-R: un extractor de características convolucional que convierte la forma de onda de audio en representaciones latentes, seguido de un encoder transformer que modela el contexto temporal. Sobre el encoder se sitúa una cabeza lineal de clasificación CTC que emite directamente la secuencia de caracteres o tokens del hmong. El backbone base es `facebook/wav2vec2-xls-r-300m`, preentrenado por Meta sobre audio multilingüe de 128 idiomas; el ajuste fino se realiza con el paquete SITA del autor.

El entrenamiento se llevó a cabo sobre el dataset `twangodev/sita`, con audio mono a 16 kHz. La model card no detalla el número de horas de audio, la composición del dataset ni si se aplicaron técnicas de aumento de datos, regularización o ajuste de hiperparámetros específicos. Tampoco se indica si hubo etapas de RLHF o DPO, algo poco habitual en ASR CTC. La innovación principal es el propio flujo SITA, que empaqueta el fine-tuning y un runtime de inferencia (`sita_runtime-0.1.0-py3-none-any.whl`) con una API `load_pretrained` y `transcribe`.

## Capacidades

- Reconocimiento automático del habla en hmong a partir de audio mono a 16 kHz.
- Decodificación CTC greedy, tal como se reporta en la evaluación (WER y CER codiciosos).
- Transcripción carácter a carácter (el CER del 12,23 % sugiere un vocabulario a nivel de carácter o subpalabra).
- Integración mediante el runtime SITA en Python, con carga directa desde Hugging Face y ejecución en CPU o CUDA (`device="cuda"`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documenta capacidad multilingüe más allá del hmong, pese a que el backbone XLS-R sea multilingüe.
- No se documenta visión, audio de salida ni otras modalidades.

## Casos de uso

- Transcripción de entrevistas y testimonios en hmong para proyectos de documentación lingüística: el modelo acepta audio mono a 16 kHz y produce transcripción CTC, adecuado para generar borradores que un hablante nativo revise después, dado el WER del 40,94 %.
- Subtitulado asistido de vídeo en hmong: se puede segmentar el audio en ventanas de pocos segundos, transcribir con el runtime SITA y combinar los resultados con marcas de tiempo externas; el CER del 12,23 % permite alinear subtítulos aproximados.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible para comparar técnicas de adaptación (más datos, data augmentation, decodificación con LM) sobre XLS-R en hmong.
- Prototipos de asistentes de voz para comunidades hmong: el modelo puede integrarse en un pipeline de reconocimiento de comandos o dictado, siempre con revisión humana por la tasa de error.
- Indexación y búsqueda de archivos de audio en hmong: transcribir un corpus para habilitar búsqueda por texto sobre grabaciones, aceptando la imprecisión del WER actual.
- Evaluación comparativa de backbones ASR: al estar disponible en safetensors y con licencia Apache 2.0, se puede desplegar junto a otros modelos XLS-R fine-tuneados para medir diferencias en hmong dentro de un mismo entorno de inferencia.

## Benchmarks y rendimiento

| Evaluación | Greedy WER | Greedy CER |
|---|---:|---:|
| Validación disjunta por hablante | 40,94 % | 12,23 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos ASR en hmong.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB de pesos más activaciones y buffers de audio; en la práctica, unos 2-3 GB de VRAM.
- En fp16/bf16, los pesos ocupan unos 0,65 GB; la VRAM total estimada ronda 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 4090, A100 o H100; el modelo es pequeño y no requiere GPUs de centro de datos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más; también puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el runtime oficial SITA (`sita_runtime-0.1.0-py3-none-any.whl`) con `load_pretrained` y `transcribe`; al ser un modelo wav2vec2 estándar en safetensors, también puede cargarse con `transformers` (Wav2Vec2ForCTC) y servirse con TGI o un servidor FastAPI propio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Rendimiento |
|---|---|---|---|---|---|
| twangodev/sita-xlsr-300m-asr | 315,4 M | no disponible | hmong | Apache 2.0 | WER 40,94 %, CER 12,23 % |
| facebook/wav2vec2-xls-r-300m | 315,4 M | no disponible | 128 idiomas (preentrenamiento) | Apache 2.0 | no disponible para hmong |
| whisper-small | 244 M | 30 s de audio | multilingüe | MIT | no disponible para hmong |
| whisper-large-v3 | 1,55 B | 30 s de audio | multilingüe | MIT | no disponible para hmong |

No se dispone de resultados publicados de los modelos alternativos sobre hmong en la información proporcionada, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- WER del 40,94 % en validación disjunta por hablante: la tasa de error es alta y el modelo no es adecuado para producción sin revisión humana.
- CER del 12,23 %: incluso a nivel de carácter se producen errores frecuentes, lo que afecta a la legibilidad de las transcripciones.
- Entrenado únicamente en hmong; no se garantiza un comportamiento correcto en otras lenguas pese al backbone multilingüe.
- El dataset de entrenamiento (`twangodev/sita`) no está descrito en detalle, por lo que se desconoce su cobertura dialectal, de género, de edad y de condiciones acústicas; es probable un sesgo hacia las condiciones de grabación del corpus.
- Riesgo de alucinación y de transcripciones plausibles pero incorrectas, especialmente en audio ruidoso o con habla solapada.
- Requiere audio mono a 16 kHz; otras frecuencias de muestreo o canales múltiples deben remuestrearse y convertirse previamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base XLS-R y el dataset de origen deben verificarse por separado; el autor no ofrece garantías.
- Dependencia del runtime SITA propietario del autor para la carga simplificada; su mantenimiento y compatibilidad futura no están garantizados.
- Sin datos publicados sobre latencia, throughput ni comportamiento en dominios distintos al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twangodev/sita-xlsr-300m-asr
- Paper: https://arxiv.org/abs/2601.09050
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset: https://huggingface.co/datasets/twangodev/sita
- Runtime SITA: `sita_runtime-0.1.0-py3-none-any.whl` (incluido en el repositorio del modelo)
