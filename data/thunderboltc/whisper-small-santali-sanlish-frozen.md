# thunderboltc/whisper-small-santali-sanlish-frozen

## Resumen

El modelo `thunderboltc/whisper-small-santali-sanlish-frozen` es un ajuste fino (fine-tune) de `openai/whisper-small` orientado al reconocimiento automático de voz (ASR) para el idioma santali, una lengua minoritaria hablada principalmente en la India. Lo desarrolla el usuario `thunderboltc` y se distribuye bajo licencia Apache 2.0, con un total de 241.734.912 parámetros. El nombre "frozen" sugiere que parte de los pesos del modelo base se mantuvieron congelados durante el entrenamiento, aunque no se especifica qué capas exactamente.

Este modelo es relevante porque aborda una lengua con escasos recursos digitales, y su publicación contribuye a la diversidad lingüística en ASR. Sin embargo, la model card es muy escueta: no se indica el dataset de entrenamiento, los idiomas soportados ni se aportan benchmarks comparativos. Los únicos datos de evaluación declarados por el autor son una pérdida de 0,8507, un WER de 45,28 y un CER de 13,05 sobre el conjunto de validación, lo que indica una precisión limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Whisper small, 30 segundos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente santali, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper small de OpenAI, un transformer encoder-decoder diseñado para ASR multilingüe. El ajuste fino se realizó con el framework Transformers, utilizando los siguientes hiperparámetros: learning rate de 2e-05, batch de entrenamiento de 16, batch de evaluación de 8, 25 épocas, optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 240 pasos de warm-up y precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card (aparece como "None"), lo que impide conocer la composición y el volumen de datos utilizados. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El término "frozen" en el nombre sugiere que se congelaron ciertos parámetros del modelo base, pero no se detalla cuáles.

## Capacidades

- Reconocimiento automático de voz (ASR) para el idioma santali, según el propósito declarado del fine-tune.
- Al estar basado en Whisper small, hereda la arquitectura de codificación de audio y decodificación de texto, aunque no se garantiza que las capacidades multilingües del modelo base se mantengan tras el ajuste.
- No se documentan capacidades adicionales como traducción de voz, identificación de idioma o tool calling.
- No se especifica soporte para agentes ni razonamiento multi-paso, ya que es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y conversaciones en santali: el modelo puede convertir audio en texto para actas o subtítulos, aunque su WER del 45% limita su uso en contextos que requieran alta precisión.
- Subtitulado de vídeos en santali: se puede integrar en pipelines de generación de subtítulos para contenido audiovisual dirigido a hablantes de esta lengua.
- Archivado de material oral: digitalización de grabaciones históricas o entrevistas en santali para su preservación y búsqueda textual.
- Asistencia a la traducción: el texto transcrito puede servir como entrada para sistemas de traducción automática, facilitando la accesibilidad a otros idiomas.
- Investigación lingüística: apoyo a estudios sobre la lengua santali mediante la generación de corpus transcritos.
- Desarrollo de asistentes de voz: integración en aplicaciones de voz para hablantes de santali, aunque con las limitaciones de precisión mencionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. El autor declara los siguientes valores de evaluación sobre su conjunto de validación:

| Metrica | Valor |
|---|---|
| Loss | 0,8507 |
| WER | 45,2756 |
| CER | 13,0534 |

Estos datos provienen de la model card y no se comparan con otros modelos. El WER del 45% es elevado, lo que sugiere que el modelo tiene margen de mejora para uso en producción.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware en la documentación del modelo.
- Dado que el modelo tiene 241,7 millones de parámetros, es razonable estimar que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no se proporcionan datos concretos de VRAM ni de latencia.
- Para despliegue, se puede usar la librería Transformers de Hugging Face, así como soluciones compatibles con el ecosistema (vLLM, TGI, etc.), aunque no se confirma su compatibilidad explícita.
- No se indican opciones de cuantización ni formatos GGUF.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR para santali. El autor ha publicado otros fine-tunes similares (por ejemplo, `whisper-small-santali-sanlish` y `whisper-small-santali-sanlish-738-verified`), pero no se aportan especificaciones ni resultados que permitan una comparación objetiva. Frente al modelo base `openai/whisper-small`, este fine-tune comparte arquitectura y número de parámetros, pero su rendimiento específico en santali no está documentado más allá de los valores de evaluación mencionados.

## Limitaciones y advertencias

- El WER del 45% indica una precisión limitada, por lo que no es recomendable para tareas que requieran transcripciones exactas sin revisión humana.
- El dataset de entrenamiento no está especificado, lo que impide evaluar posibles sesgos o cobertura limitada de acentos, dialectos o condiciones de audio.
- No se documentan limitaciones de contexto ni de idioma; se asume que hereda las del modelo base, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de Whisper (que tiene su propia licencia MIT), se debe verificar la compatibilidad de licencias en el uso final.
- La model card es generada automáticamente y carece de información sobre usos previstos, limitaciones y datos de entrenamiento, lo que dificulta su evaluación rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/whisper-small-santali-sanlish-frozen
- Modelo relacionado (sin "frozen"): https://huggingface.co/thunderboltc/whisper-small-santali-sanlish
- Modelo relacionado (738-verified): https://huggingface.co/thunderboltc/whisper-small-santali-sanlish-738-verified
- Página de inferencia en FriendliAI: https://friendli.ai/models/thunderboltc/whisper-small-santali-sanlish
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
