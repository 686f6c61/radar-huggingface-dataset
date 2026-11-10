# unveroleone/flix-swissgerman-full-gguf

## Resumen

flix-swissgerman-full-gguf es la conversión a formato GGUF del modelo Flix-AI/flix-swissgerman-full, un ajuste fino de Whisper large-v3 desarrollado por Flix-AI para transcribir habla en alemán suizo (Schwyzerdütsch) y generar la transcripción en alemán estándar. El repositorio lo publica el usuario unveroleone, que se limita a convertir los pesos originales (publicados solo en safetensors) al formato GGUF cuantizado para que puedan ejecutarse en aplicaciones basadas en transcribe.cpp, como Handy.

El modelo resuelve un problema concreto: el reconocimiento automático de habla para las variedades dialectales del alemán suizo, que los modelos Whisper genéricos transcriben con dificultad. En lugar de producir texto en dialecto, el modelo traduce el contenido hablado a alemán estándar, lo que facilita su uso en subtitulado, actas y sistemas de documentación. Cuenta con aproximadamente 1.543 millones de parámetros, derivados de la arquitectura Whisper large-v3, y el repositorio ocupa 1,7 GB.

La relevancia actual del repositorio es práctica: el modelo original solo estaba disponible en safetensors, lo que limitaba su despliegue en herramientas de inferencia ligera. Esta conversión, cuantizada a Q8_0, permite ejecutar el modelo en ordenadores personales con Apple Silicon o GPU NVIDIA, con un consumo de memoria de aproximadamente 3 GB. No se han retocado los pesos más allá de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) large-v3, ajuste fino |
| Parametros totales | 1.543.516.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper large-v3) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | de (alemán estándar), gsw (alemán suizo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Tamano del archivo | 1,67 GB (Q8_0) |
| Modelo base | Flix-AI/flix-swissgerman-full |
| Pipeline | automatic-speech-recognition |
| Repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de Whisper large-v3, un transformer encoder-decoder con extractor de características de 128 bins mel, el mismo que utiliza openai/whisper-large-v3. La conversión a GGUF se realizó en dos pasos: primero se transformaron los safetensors originales a un GGUF en F16 mediante `convert-whisper.py` de transcribe.cpp, tomando la configuración del preprocesador de openai/whisper-large-v3, y después se cuantizó de F16 a Q8_0 con `transcribe-quantize`. No se reentrenaron ni modificaron pesos más allá de la cuantización.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada; la model card remite a la ficha de Flix-AI/flix-swissgerman-full. Sí se indica que el modelo original se entrenó en parte con datos de emisiones de SRF bajo la excepción suiza de minería de textos y datos para investigación (Art. 24d URG). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático de habla (ASR) para alemán suizo, con salida en alemán estándar.
- Transcripción de audio de hasta 30 segundos por segmento, según la arquitectura Whisper large-v3.
- Soporte de los idiomas de y gsw, con orientación específica a la traducción implícita dialecto a estándar.
- Ejecución en aplicaciones basadas en transcribe.cpp, como Handy.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se documenta modo de pensamiento (thinking mode) ni capacidades multimodales adicionales.

## Casos de uso

- Subtitulado de contenido audiovisual en alemán suizo: el modelo transcribe entrevistas, reportajes o vídeos en dialecto y devuelve texto en alemán estándar, lo que simplifica la revisión y la publicación sin necesidad de traducción posterior.
- Actas y documentación de reuniones: en entornos empresariales suizos donde se habla dialecto, el modelo permite generar transcripciones legibles en alemán estándar para archivo o búsqueda.
- Atención al cliente y análisis de llamadas: se puede integrar en pipelines de grabación de llamadas para obtener transcripciones normalizadas en alemán estándar y aplicar después análisis de sentimiento o extracción de entidades.
- Accesibilidad: generación de subtítulos para personas con discapacidad auditiva en emisiones o vídeos en dialecto suizo, con salida en alemán estándar.
- Archivística y preservación oral: transcripción de entrevistas históricas o grabaciones dialectales para su catalogación y consulta textual.
- Herramientas de escritorio de dictado: gracias al formato GGUF y a su consumo de unos 3 GB de RAM, puede ejecutarse localmente en aplicaciones como Handy en un Apple M1 Pro o en una GPU NVIDIA, sin enviar audio a servicios en la nube.
- Investigación lingüística: generación de corpus alineados audio-texto para estudiar la relación entre variedades dialectales y alemán estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo original (Flix-AI/flix-swissgerman-full) para los resultados de evaluación, que no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3 GB mientras el modelo está cargado, según la model card.
- GPU recomendadas: Apple Silicon (probado en un Apple M1 Pro con Handy 0.10.0) o GPU NVIDIA; no se especifican modelos concretos.
- En CPU sin GPU funciona, pero de forma lenta según el autor.
- Cabe en GPU de consumo con al menos 3-4 GB de memoria disponible; no se detallan modelos concretos.
- Opciones de despliegue: aplicaciones basadas en transcribe.cpp, como Handy. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| flix-swissgerman-full-gguf | 1.543.516.688 | no disponible (30 s de audio) | de, gsw | Apache-2.0 | GGUF (Q8_0) | Ajuste fino de Whisper large-v3 para dialecto suizo |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible (30 s de audio) | multilingue | Apache-2.0 | safetensors, GGUF (conversiones de la comunidad) | Modelo base; menor especialización en dialecto suizo |
| Flix-AI/flix-swissgerman-full | 1.543.516.688 | no disponible (30 s de audio) | de, gsw | Apache-2.0 | safetensors | Modelo original; mismas capacidades, sin cuantización GGUF |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en alemán suizo y alemán estándar; su uso en otros idiomas no está documentado.
- Al ser un ajuste fino de Whisper, hereda los riesgos de alucinación típicos de los modelos de transcripción, especialmente en audio con ruido o solapamiento de voces.
- La ventana de audio por segmento es de 30 segundos, propia de Whisper large-v3; no se documenta una longitud de contexto mayor.
- El modelo original se entrenó en parte con datos de emisiones de SRF bajo la excepción suiza de minería de textos y datos para investigación (Art. 24d URG), lo que puede condicionar el uso comercial de los datos subyacentes; la licencia del repositorio es Apache-2.0, pero conviene revisar la ficha del modelo original.
- Solo se publica una cuantización Q8_0; no hay versiones más ligeras (Q4, Q5) para entornos con menos memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- El rendimiento en CPU es lento según el autor; para producción se recomienda GPU o Apple Silicon.
- No se documentan sesgos específicos más allá de los inherentes al corpus de entrenamiento original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unveroleone/flix-swissgerman-full-gguf
- Modelo original: https://huggingface.co/Flix-AI/flix-swissgerman-full
- Handy (aplicación de escritorio): https://github.com/cjpais/Handy
- Preprocesador de referencia: https://huggingface.co/openai/whisper-large-v3
