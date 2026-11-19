# VorbaVine/whisper-tiny-vv-ro

## Resumen

`whisper-tiny-vv-ro` es un ajuste fino (fine-tuning) del modelo `openai/whisper-tiny` de OpenAI, especializado en reconocimiento automático del habla (ASR) en rumano. Lo publica el usuario VorbaVine bajo licencia Apache-2.0 y su propósito es corregir el bajo rendimiento del modelo base en este idioma: Whisper tiny, entrenado de forma multilingüe, obtiene tasas de error de palabra (WER) superiores al 75 % en rumano, mientras que este ajuste las reduce hasta el 18,63 % en su conjunto de prueba propio y por debajo del 33 % en conjuntos no vistos.

El modelo mantiene la arquitectura original de Whisper tiny, un transformer encoder-decoder con aproximadamente 37,76 millones de parámetros, y un tamaño de repositorio de 0,2 GB en formato safetensors. Su ventana de contexto de audio es de unos 30 segundos por clip, por lo que el audio más largo debe segmentarse antes de la transcripción.

Es relevante porque demuestra que un modelo extremadamente pequeño, desplegable en CPU o en GPU de gama baja, puede alcanzar una precisión útil para un idioma concreto cuando se entrena con datos dirigidos. El entrenamiento combina unas 144 horas de audio (aproximadamente 70 h reales y 74 h sintéticas) procedentes de Common Voice, VoxPopuli, FLEURS, grabaciones propias y datos sintéticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de hasta ~30 s por clip |
| Tipos de cuantización | no disponible |
| Idiomas soportados | rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder con 37,76 millones de parámetros que procesa espectrogramas mel de 16 kHz en mono y genera tokens de texto de forma autorregresiva. No se trata de un modelo MoE ni híbrido; conserva la arquitectura estándar de la familia Whisper, incluida la tarea y el idioma como tokens de control en la generación.

El ajuste fino se realizó sobre un conjunto de aproximadamente 143,77 horas distribuidas en 86.920 clips: 121,78 h de entrenamiento (73.174 clips), 10,91 h de validación (6.814 clips) y 11,08 h de prueba (6.932 clips). Por fuente, el corpus incluye 8,4 h de grabaciones propias, 21,5 h de Common Voice, 5,9 h de FLEURS, 34,4 h de otro habla real y 73,5 h de habla sintética. La configuración de entrenamiento usó learning rate de 1e-5 con decaimiento lineal, 227 pasos de warmup, batch efectivo de 64, precisión bf16 y weight decay de 0,01. El checkpoint retenido corresponde al paso 21.546 de 22.680 programados, con un WER de validación del 18,12 %.

El autor advierte de que el mismo split fijo del dataset VorbaVine se empleó para entrenamiento, selección de modelo y prueba, lo que puede inflar ligeramente las métricas del conjunto propio. Los resultados marcados como "unseen" agrupan clips de Common Voice y FLEURS que no están en el split de entrenamiento; VoxPopuli no tiene clips en entrenamiento.

## Capacidades

- Transcripción de voz a texto en rumano con audio de 16 kHz en mono.
- Reconocimiento automático del habla en clips de hasta aproximadamente 30 segundos.
- Generación de transcripciones con token de idioma fijado explícitamente (`language="ro"`) y tarea `transcribe`.
- No se documenta soporte de traducción a otros idiomas, tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio más allá de ASR ni modo de pensamiento (thinking).
- Capacidad multilingüe limitada al rumano según la model card; no se garantiza calidad en otros idiomas.

## Casos de uso

- Subtitulado automático de contenido en rumano: el modelo transcribe clips cortos con un WER de aproximadamente 18-20 % en dominios cercanos al entrenamiento, adecuado para generar subtítulos preliminares que después se revisan manualmente.
- Transcripción de reuniones y entrevistas: segmentando el audio en bloques de hasta 30 s, puede procesar conversaciones largas en CPU o GPU de gama baja, lo que lo hace útil para herramientas de actas internas.
- Asistentes de voz para aplicaciones rumanas: al ser un modelo de 37,76 M de parámetros, puede integrarse en servicios con latencia baja y bajo coste de infraestructura para comandos y dictado.
- Archivado y búsqueda de audio: transcripción masiva de grabaciones históricas o de atención al cliente en rumano para indexar y buscar por texto.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos de habla rumana, siempre con revisión humana por el riesgo de error.
- Evaluación y prototipado de pipelines ASR: sirve como línea base ligera para comparar mejoras de preprocesado, normalización o datos antes de escalar a modelos mayores.
- Investigación en ASR de bajos recursos: su receta de entrenamiento con datos sintéticos (73,5 h) y reales es un punto de partida reproducible para otros idiomas.

## Benchmarks y rendimiento

Resultados de WER (%) publicados en la model card; menor es mejor.

| Conjunto de prueba | Modelo base (whisper-tiny) | Este modelo |
|---|---|---|
| VorbaVine test | 76,73 | 18,63 |
| Mozilla (unseen) | 81,84 | 20,28 |
| FLEURS (unseen) | 75,27 | 32,00 |
| VoxPopuli (unseen) | 75,42 | 23,86 |

Las métricas se calcularon sobre referencias curadas tras normalización (minúsculas, eliminación de puntuación, conversión de cedilla a coma inferior y expansión de abreviaturas). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16; el modelo pesa unos 0,2 GB en safetensors y puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: `transformers` con PyTorch (requiere `torch` y `librosa`), y previsiblemente `whisper.cpp`, `faster-whisper` u Ollama si se convierten los pesos, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VorbaVine/whisper-tiny-vv-ro | 37,76 M | ~30 s de audio | rumano | Apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ~30 s de audio | multilingüe | Apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | ~30 s de audio | multilingüe | Apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | ~30 s de audio | multilingüe | Apache-2.0 | Hugging Face |

Frente al modelo base, la mejora es sustancial en rumano (de 76,73 a 18,63 de WER en el test propio). No se dispone de datos de WER de `whisper-base` o `whisper-small` en rumano dentro de la información proporcionada, por lo que no se puede comparar su rendimiento en este idioma.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenar con datos de Common Voice, FLEURS y grabaciones propias, puede heredar sesgos de acento, género y dominio de esas fuentes.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente en segmentos ruidosos o silenciosos.
- Limitación de contexto: solo procesa clips de hasta aproximadamente 30 s; el audio más largo debe segmentarse, lo que puede degradar la coherencia en los cortes.
- Limitación de idioma: está especializado únicamente en rumano; no se garantiza su comportamiento en otros idiomas.
- Riesgo de sobreajuste al split: el mismo split fijo se usó para entrenamiento, selección y prueba, por lo que las métricas del conjunto VorbaVine pueden ser optimistas.
- Dependencia de datos sintéticos: 73,5 h de las 143,77 h son sintéticas, lo que puede introducir artefactos o un dominio acústico poco representativo del habla real.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio de producción antes de desplegarlo.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/VorbaVine/whisper-tiny-vv-ro
- Modelo base: https://huggingface.co/openai/whisper-tiny
- OpenAI Whisper (paper/repositorio): https://github.com/openai/whisper
