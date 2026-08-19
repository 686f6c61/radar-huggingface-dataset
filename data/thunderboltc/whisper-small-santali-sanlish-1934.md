# thunderboltc/whisper-small-santali-sanlish-1934

## Resumen

El modelo `thunderboltc/whisper-small-santali-sanlish-1934` es un ajuste fino (fine-tuning) de `openai/whisper-small` orientado al reconocimiento automático del habla (ASR) en santali, una lengua minoritaria hablada principalmente en la India, Bangladés y Nepal. El nombre del repositorio sugiere que el entrenamiento se realizó sobre un corpus en santali, aunque la model card no especifica el dataset utilizado. El autor es el usuario `thunderboltc`, y el modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y modificación.

Con 241,7 millones de parámetros, esta variante conserva la arquitectura encoder-decoder de Whisper-small, diseñada para procesar hasta 30 segundos de audio por pasada. Su relevancia radica en abordar una lengua de bajos recursos, donde los sistemas ASR comerciales suelen fallar. Aunque el WER final (34,5 %) es alto en términos absolutos, representa una mejora sustancial respecto al modelo base sin ajustar en este idioma. El repositorio incluye pesos en formato `safetensors` y ocupa 9,7 GB, lo que sugiere la presencia de múltiples checkpoints o versiones cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | santali (presumible, no confirmado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper-small de OpenAI, un transformer encoder-decoder con normalización de capa y atención multi-cabeza. El encoder procesa espectrogramas Mel de 80 canales a partir de ventanas de 30 segundos de audio, mientras que el decoder genera el texto transcrito de forma autorregresiva. Whisper-small tiene 12 capas en el encoder y 12 en el decoder, con dimensiones ocultas de 768 y 12 cabezas de atención.

El entrenamiento se realizó mediante fine-tuning sobre un dataset no especificado (la model card indica "None"). Se usaron 25 épocas con un tamaño de lote efectivo de 16 (8 con acumulación de gradiente de 2), una tasa de aprendizaje de 2e-5 con scheduler lineal y 153 pasos de calentamiento. Se empleó precisión mixta (AMP) y el optimizador AdamW. No se menciona el uso de técnicas como RLHF o DPO; el proceso es un ajuste supervisado estándar para ASR.

## Capacidades

- Reconocimiento automático del habla (ASR) en santali, con salida de texto transcrito.
- Procesamiento de audio de hasta 30 segundos por pasada, con posibilidad de segmentar audios más largos.
- No se han documentado capacidades adicionales como traducción, identificación de idioma o tool calling, propias del Whisper original, ya que el fine-tuning se centra en transcripción.
- El modelo es monolingüe en la práctica, aunque Whisper base soporta múltiples idiomas; el ajuste fino probablemente degrada el rendimiento en otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en santali: el modelo puede convertir grabaciones de audio en texto, facilitando la documentación y el análisis posterior. Su ventana de 30 segundos permite procesar turnos de habla cortos con precisión aceptable.
- Subtitulado automático de vídeos en santali: integrable en pipelines de generación de subtítulos para contenido audiovisual dirigido a comunidades santali, reduciendo el coste de transcripción manual.
- Archivado y digitalización de material oral: organizaciones culturales o lingüísticas pueden transcribir grabaciones históricas o entrevistas etnográficas, preservando el contenido en formato textual.
- Asistencia a la accesibilidad: personas con discapacidad auditiva que usan santali pueden beneficiarse de transcripciones en tiempo real o diferido de contenido hablado.
- Investigación lingüística: los lingüistas pueden usar el modelo para anotar corpus orales en santali, acelerando el estudio de fonética, morfología o sintaxis.
- Desarrollo de asistentes de voz en santali: aunque el modelo solo transcribe, puede servir como componente inicial de un sistema de diálogo por voz, combinado con un módulo de comprensión del lenguaje.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, etc.), ya que se trata de un modelo de ASR. El autor reporta las siguientes métricas de evaluación durante el entrenamiento:

| Epoca | Loss de validacion | WER (%) | CER (%) |
|---|---|---|---|
| 1 | 0,6553 | 44,33 | 10,35 |
| 2 | 0,5723 | 38,79 | 8,94 |
| 3 | 0,5563 | 38,04 | 8,40 |
| 4 | 0,5620 | 35,89 | 7,90 |
| 5 | 0,5717 | 33,88 | 7,90 |
| 6 | 0,5897 | 34,13 | 7,81 |
| 7 | 0,6306 | 34,89 | 7,88 |
| 8 | 0,6719 | 35,14 | 7,90 |
| 9 | 0,6565 | 35,52 | 7,92 |
| 10 | 0,6691 | 34,51 | 7,66 |

El mejor WER se alcanzó en la época 5 (33,88 %), aunque el valor final es ligeramente superior. No se dispone de comparaciones con otros modelos en santali.

## Requisitos de hardware

- VRAM estimada para inferencia: Whisper-small en FP16 requiere aproximadamente 1,5 GB de VRAM. Con cuantización a 8 bits, puede bajar a ~0,8 GB; en 4 bits, ~0,5 GB. El tamaño del repositorio (9,7 GB) sugiere que se incluyen múltiples versiones, posiblemente cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16. Tarjetas consumer como NVIDIA GTX 1060, RTX 2060 o superiores pueden ejecutarlo sin problemas. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-12 GB (RTX 3080, A10, etc.).
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, así como con `vLLM` (aunque Whisper no es un LLM, puede servirse mediante pipelines de ASR), `llama.cpp` (si se convierte a GGUF) y `Ollama` (con adaptadores). También es compatible con `TGI` (Text Generation Inference) para endpoints de ASR.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3090), Whisper-small procesa un clip de 30 segundos en aproximadamente 1-2 segundos, lo que permite un factor de tiempo real superior a 15x.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `openai/whisper-small` | 244 M | 30 s audio | MIT | Modelo base multilingüe, sin ajuste a santali |
| `thunderboltc/whisper-small-santali-sanlish` | 241 M | 30 s audio | Apache 2.0 | Variante del mismo autor, posiblemente con otro dataset |
| `thunderboltc/whisper-small-santali-sanlish-738-verified` | 241 M | 30 s audio | Apache 2.0 | Otra iteración del autor, con verificación adicional |

No se dispone de datos comparativos de rendimiento entre estas variantes. El modelo base `whisper-small` tiene un WER muy alto en santali (probablemente >80 %), por lo que el fine-tuning mejora sustancialmente, aunque sigue lejos de un rendimiento óptimo.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide evaluar su representatividad y posibles sesgos. Es probable que el corpus sea limitado en tamaño y variedad de hablantes, acentos o condiciones acústicas.
- El WER final (34,5 %) es elevado para aplicaciones críticas; se recomienda validar el modelo en el dominio de uso antes de desplegarlo en producción.
- No se ha verificado el rendimiento en otros idiomas; el fine-tuning puede haber degradado la capacidad multilingüe del Whisper original.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo ni sobre la procedencia de los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validación comunitaria.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en la model card, lo que dificulta su adopción inmediata.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thunderboltc/whisper-small-santali-sanlish-1934
- Modelo base: https://huggingface.co/openai/whisper-small
- Página de FriendliAI para una variante similar: https://friendli.ai/models/thunderboltc/whisper-small-santali-sanlish
- Otras variantes del autor: https://huggingface.co/thunderboltc/whisper-small-santali-sanlish y https://huggingface.co/thunderboltc/whisper-small-santali-sanlish-738-verified
