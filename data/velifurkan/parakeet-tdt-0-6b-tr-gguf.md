# velifurkan/parakeet-tdt-0.6b-tr-gguf

## Resumen

Parakeet TDT 0.6B Turkish (GGUF) es la versión cuantizada en formato GGUF del modelo velifurkan/parakeet-tdt-0.6b-tr, un ajuste fino sobre el modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, especializado en turco. Lo desarrolla el usuario velifurkan y resuelve el problema de la transcripción de voz en turco con puntuación y mayúsculas automáticas, algo que los modelos ASR genéricos no suelen ofrecer con calidad en este idioma.

El modelo cuenta con 617.869.958 parámetros (aproximadamente 0,6 mil millones) y se distribuye en un único archivo GGUF Q8_0 de 0,73 GB. Está diseñado específicamente para ejecutarse en CPU mediante transcribe.cpp, lo que lo hace relevante para despliegues ligeros, sin GPU y en entornos con recursos limitados.

La relevancia actual radica en su licencia permisiva (CC BY 4.0), su tamaño reducido y su rendimiento en turco: un WER del 10,6 % y un CER del 2,6 % sobre el conjunto de test de FLEURS tr_tr (743 clips), prácticamente idéntico al modelo original en precisión completa (10,5 %), lo que demuestra que la cuantización Q8_0 apenas degrada la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), no disponible el detalle interno |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo base también se distribuye en F16 |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Parakeet TDT 0.6B v3 de NVIDIA, que emplea una arquitectura Token-and-Duration Transducer (TDT). Esta familia de modelos combina un encoder acústico con un decodificador transducer que predice conjuntamente tokens y duraciones, lo que permite una transcripción eficiente y alineada temporalmente. La información disponible no detalla la composición interna de capas, dimensión de embeddings ni mecanismos de atención.

El ajuste fino se entrenó sobre el corpus Turkish Speech Corpus de ISSAI (CC BY 4.0), Mozilla Common Voice (CC0), Google FLEURS (CC BY 4.0) y ESPnet YODAS (CC BY 3.0). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Una innovación destacable es que el modelo genera mayúsculas, puntuación y signos de interrogación de forma automática, y que la versión GGUF está optimizada para transcribe.cpp con ejecución en CPU.

## Capacidades

- Reconocimiento automático del habla (ASR) en turco con transcripción de audio a texto.
- Generación automática de mayúsculas y puntuación, incluidos signos de interrogación en preguntas.
- Ejecución en CPU mediante transcribe.cpp, sin necesidad de GPU.
- Modelo especializado en un único idioma (turco), no multilingüe.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR ni modo thinking.
- No se dispone de información sobre capacidades de diarización de hablantes o marcas de tiempo.

## Casos de uso

- Transcripción de reuniones y entrevistas en turco: el modelo convierte audio en texto con puntuación y mayúsculas, adecuado para actas y notas automáticas en entornos corporativos turcos.
- Subtitulado de vídeo y audio: al generar puntuación y signos de interrogación, facilita la creación de subtítulos legibles para contenido en turco.
- Atención al cliente y centros de llamadas: permite transcribir conversaciones telefónicas en turco para análisis de calidad, búsqueda de texto y cumplimiento normativo, ejecutándose en CPU en servidores sin GPU.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos de audio históricos o grabaciones para indexación y recuperación de texto en bibliotecas y medios turcos.
- Asistentes de voz y dictado: integración en aplicaciones de dictado por voz para usuarios turcos, con la ventaja de un modelo de 0,73 GB que cabe en dispositivos de bajos recursos.
- Investigación lingüística y creación de corpus: generación de transcripciones para estudios del turco hablado, con la ventaja de una licencia CC BY 4.0 que permite su uso en investigación y productos comerciales con atribución.
- Despliegue en entornos edge o sin GPU: al ejecutarse en CPU con transcribe.cpp, es adecuado para dispositivos embebidos, servidores modestos o pipelines por lotes donde no hay aceleradores disponibles.

## Benchmarks y rendimiento

| Modelo / archivo | WER (FLEURS tr_tr) | CER (FLEURS tr_tr) |
|---|---|---|
| parakeet-tdt-0.6b-tr-Q8_0.gguf | 10,6 % | 2,6 % |
| parakeet-tdt-0.6b-tr F16 (referencia) | 10,5 % | no disponible |
| Modelo NeMo original | 10,5 % | no disponible |

Los resultados se obtuvieron con transcribe.cpp sobre los 743 clips de test de FLEURS tr_tr. El WER se calcula tras convertir a minúsculas, eliminar puntuación y escribir los números como palabras. No se han publicado en la información disponible resultados de benchmarks comparativos con Whisper u otros modelos; la model card remite a la ficha del modelo principal para más comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración principal, ya que el modelo está pensado para ejecutarse en CPU; el archivo Q8_0 ocupa 0,73 GB en disco y requiere una cantidad de RAM similar para cargarse.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU mediante transcribe.cpp. No se dispone de datos sobre rendimiento en GPU.
- ¿Cabe en GPU de consumo? No se dispone de información; el tamaño (0,73 GB) sugiere que cabría en cualquier GPU de consumo, pero no hay datos oficiales de soporte.
- Opciones de despliegue: transcribe.cpp (soporte oficial); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER turco (FLEURS) | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-tr-gguf (este) | 617,9 M | no disponible | 10,6 % (Q8_0) | CC BY 4.0 | GGUF |
| parakeet-tdt-0.6b-tr (base) | 617,9 M | no disponible | 10,5 % (F16) | CC BY 4.0 | safetensors / NeMo |
| Whisper (variantes) | no disponible | no disponible | no disponible | MIT (según variante) | no disponible |

No se dispone de datos comparativos con Whisper ni con otros modelos ASR en la información proporcionada; la model card remite a la ficha del modelo principal para una comparación detallada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en turco; no soporta otros idiomas.
- No se dispone de información sobre sesgos conocidos, pero al entrenarse con corpus como Common Voice y FLEURS puede heredar sesgos de acento, género o registro de esas fuentes.
- Riesgo de alucinación en pasajes de audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; el WER del 10,6 % indica que aproximadamente una de cada diez palabras puede ser incorrecta en condiciones de test.
- Limitaciones de contexto: no se especifica la duración máxima de audio soportada ni la ventana de contexto.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y respetar las licencias de los datos de entrenamiento subyacentes.
- El modelo está pensado para transcribe.cpp; no se garantiza su funcionamiento en otros runners GGUF.
- No se dispone de información sobre el rendimiento en audio de larga duración, diarización o marcas de tiempo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/velifurkan/parakeet-tdt-0.6b-tr-gguf
- Modelo base (ajuste fino turco): https://huggingface.co/velifurkan/parakeet-tdt-0.6b-tr
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Modelo original de NVIDIA: parakeet-tdt-0.6b-v3 (no se proporciona URL directa en la información disponible)
- Corpus ISSAI Turkish Speech Corpus, Mozilla Common Voice, Google FLEURS y ESPnet YODAS: mencionados como fuentes de entrenamiento, sin URL directa en la información disponible.
