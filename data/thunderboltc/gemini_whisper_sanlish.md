# thunderboltc/gemini_whisper_sanlish

## Resumen

El modelo `thunderboltc/gemini_whisper_sanlish` es un fine-tuning de `openai/whisper-small` orientado a la transcripción automática de voz (ASR) en santali, una lengua austroasiática hablada principalmente en la India, Bangladesh y Nepal. El modelo convierte audio en texto transcrito a alfabeto IPA o en escritura Sanlish (romanización del santali). Lo desarrolla el usuario `thunderboltc` y se publica en Hugging Face con el pipeline de reconocimiento automático del habla.

Con 241,7 millones de parámetros, corresponde a la arquitectura Whisper-small, un transformer encoder-decoder entrenado originalmente por OpenAI sobre 680 000 horas de audio multilingüe. Este fine-tuning se ha realizado sobre un conjunto de datos reducido (1547 muestras de entrenamiento) y alcanza un WER del 34,67 % y un CER del 8,27 % en el conjunto de test. Su relevancia radica en ser uno de los pocos modelos específicos para santali, una lengua con escasos recursos digitales, y en ofrecer una salida en notación fonética (IPA) que facilita su uso en estudios lingüísticos y herramientas de accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (encoder-decoder transformer) |
| Parametros totales | 241 734 912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ASR, ventana de audio de 30 segundos por defecto en Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Santali (transcripción a IPA/Sanlish) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-small`, un transformer encoder-decoder con 12 capas en cada bloque, atención multi-cabeza y normalización pre-layer. Whisper procesa audio muestreado a 16 kHz, lo convierte en espectrogramas log-Mel de 80 canales y genera texto de forma autorregresiva. Este fine-tuning adapta los pesos del modelo base para transcribir santali a notación IPA o Sanlish, en lugar de la salida estándar en escritura Ol Chiki.

El entrenamiento se realizó sobre un conjunto de datos dividido en 80/10/10 (1547 train, 193 validación, 194 test). Se usaron 10 épocas con un tamaño de batch efectivo de 16 (batch por dispositivo de 8 con acumulación de gradientes de 2), tasa de aprendizaje de 3e-5, 100 pasos de warmup, gradient checkpointing y precisión mixta fp16. La selección del mejor modelo se basó en el WER de validación. No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado estándar.

## Capacidades

- Transcripción de voz en santali a texto en alfabeto IPA o en Sanlish (romanización).
- Reconocimiento automático del habla con entrada de audio de hasta 30 segundos por segmento (limitación de Whisper).
- Generación de transcripciones con marcas de tiempo a nivel de segmento (heredado de Whisper).
- Soporte multilingüe limitado: el modelo base Whisper-small es multilingüe, pero este fine-tuning está especializado en santali y puede degradar su rendimiento en otros idiomas.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de entrevistas y grabaciones de campo en santali: el modelo permite convertir audio en texto IPA, útil para lingüistas y antropólogos que documentan lenguas minoritarias.
- Subtitulado automático de vídeos en santali: se puede integrar en pipelines de generación de subtítulos para contenido audiovisual en esta lengua.
- Accesibilidad para hablantes de santali: transcripción de contenido hablado a texto legible, facilitando el acceso a información a personas con discapacidad auditiva.
- Creación de corpus lingüísticos: al generar transcripciones IPA, el modelo ayuda a construir bases de datos anotadas para investigación fonética y fonológica.
- Asistente de aprendizaje de idiomas: los estudiantes de santali pueden practicar pronunciación comparando su habla con la transcripción IPA generada.
- Archivado digital de patrimonio oral: digitalización de grabaciones históricas en santali mediante transcripción automática, preservando el contenido en formato textual.

## Benchmarks y rendimiento

Según la model card, tras la época 10 se obtuvieron los siguientes resultados en el conjunto de test:

| Metrica | Valor |
|---|---|
| test_loss | 0,9323 |
| test_wer | 34,67 % |
| test_cer | 8,27 % |

No se han publicado comparaciones con otros modelos en la información disponible. El WER del 34,67 % indica que aproximadamente una de cada tres palabras se transcribe incorrectamente, lo que sugiere que el modelo es útil para tareas de transcripción asistida, pero no para producción automática sin revisión humana.

## Requisitos de hardware

- VRAM estimada para inferencia: Whisper-small en fp16 requiere aproximadamente 1 GB de VRAM para una entrada de 30 segundos. El tamaño del repositorio (13,5 GB) sugiere que incluye múltiples checkpoints o archivos adicionales, pero la inferencia con safetensors del modelo final es ligera.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, o superiores. También funciona en CPU con mayor latencia.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: se puede servir con `transformers` (pipeline `automatic-speech-recognition`), `faster-whisper`, `whisper.cpp` (si se convierte a GGUF), o mediante `vLLM` (aunque no es el caso típico para ASR). También es compatible con `Ollama` si se convierte a formato GGUF.
- Latencia y throughput: no se han publicado mediciones específicas. En una GPU RTX 3090, Whisper-small procesa un segmento de 30 segundos en aproximadamente 0,5-1 segundo en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (santali) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thunderboltc/gemini_whisper_sanlish | 241,7 M | 30 s audio | 34,67 % | no disponible | Hugging Face |
| thunderboltc/whisper-small-santali-sanlish | 241,7 M | 30 s audio | no disponible | no disponible | Hugging Face |
| thunderboltc/whisper-small-santali-sanlish-1207 | 241,7 M | 30 s audio | no disponible | no disponible | Hugging Face |
| openai/whisper-small (base) | 241,7 M | 30 s audio | no disponible (no entrenado para santali) | MIT | Hugging Face |

Los tres modelos de `thunderboltc` son fine-tunings del mismo base, probablemente con variaciones en el dataset o hiperparámetros. No hay datos comparativos públicos entre ellos.

## Limitaciones y advertencias

- El WER del 34,67 % es alto; el modelo no es fiable para transcripción automática sin supervisión humana en entornos de producción.
- El conjunto de entrenamiento es muy reducido (1547 muestras), lo que limita la generalización a diferentes acentos, ruido de fondo y condiciones de grabación.
- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de utilizarlo en aplicaciones comerciales.
- La salida en IPA/Sanlish puede no ser consistente si el dataset de entrenamiento no estaba estandarizado; se recomienda validar la calidad de las transcripciones en casos reales.
- El modelo base Whisper-small tiene un límite de 30 segundos de audio por segmento; audios más largos requieren segmentación previa.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos limitados, puede reflejar sesgos del corpus de entrenamiento (por ejemplo, variedades dialectales concretas del santali).
- No hay información sobre la procedencia ni la licencia de los datos de audio utilizados para el fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/gemini_whisper_sanlish
- Modelo relacionado (whisper-small-santali-sanlish): https://huggingface.co/thunderboltc/whisper-small-santali-sanlish
- Modelo relacionado (whisper-small-santali-sanlish-1207): https://huggingface.co/thunderboltc/whisper-small-santali-sanlish-1207
- Página de inferencia en FriendliAI: https://friendli.ai/models/thunderboltc/whisper-small-santali-sanlish
- Documentación de modelos Gemini API (referencia externa, no relacionada directamente): https://ai.google.dev/gemini-api/docs/models
