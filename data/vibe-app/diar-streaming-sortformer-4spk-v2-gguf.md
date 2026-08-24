# vibe-app/diar-streaming-sortformer-4spk-v2-gguf

## Resumen

Este modelo es una conversión a formato GGUF del sistema de diarización de hablantes `diar_streaming_sortformer_4spk-v2` de NVIDIA, publicada por el usuario `vibe-app` para servir como fuente de descarga controlada para la aplicación Vibe. El modelo original es un diarizador neuronal de extremo a extremo diseñado para funcionar en tiempo real (streaming) y separar las voces de hasta cuatro interlocutores simultáneos. La conversión se realizó directamente desde el checkpoint `.nemo` original usando el conversor oficial de NVIDIA (NeMo-Speech.cpp), garantizando que los tensores coinciden con la versión publicada por NVIDIA (971 tensores, mismos nombres y formas). Con 122,8 millones de parámetros y un peso de 147 MB en cuantización Q8_0, es un modelo extremadamente ligero que puede ejecutarse en hardware modesto, lo que lo hace atractivo para integraciones en aplicaciones de escritorio, móviles o sistemas embebidos. Su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-labeler (Sortformer) |
| Parametros totales | 122.862.212 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de diarización de audio, no de texto) |
| Tipos de cuantizacion | Q8_0 (único fichero publicado); se mencionan F32/F16 como seguros, pero no incluidos |
| Idiomas soportados | No aplicable (diarización independiente del idioma) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (fichero `diar_streaming_sortformer_4spk-v2.q8_0.gguf`, 147 MB) |

## Arquitectura y entrenamiento

El modelo base es un **Sortformer**, una arquitectura de diarización de extremo a extremo desarrollada por NVIDIA. Se trata de un transformer con un codificador y un etiquetador (encoder-labeler) que procesa audio en tramas de 80 ms a 16 kHz mono. A diferencia de los sistemas tradicionales que combinan separación de fuentes y clustering, Sortformer aprende directamente a predecir las etiquetas de hablante para cada trama, manteniendo un estado de caché de hablantes para permitir el procesamiento en streaming. La versión v2 reduce los parámetros frente a la v1 (123M → 122,9M) y está optimizada para audio de reuniones. El entrenamiento se basa en el objetivo de clasificación de hablantes con pérdida de entropía cruzada, aunque los detalles exactos del dataset (número de tokens, composición) no se han publicado en la documentación disponible. La conversión a GGUF se hizo con el conversor de NVIDIA (NeMo-Speech.cpp), y la validación contra la salida del modelo ONNX original muestra que las etiquetas de hablante coinciden exactamente tras binarizar a 0,5, y los límites de segmento son idénticos al milisegundo, con una diferencia máxima de probabilidad de 0,018.

## Capacidades

- Diarización de hablantes en tiempo real (streaming) para hasta 4 interlocutores simultáneos.
- Manejo de solapamiento de voz: mantiene precisión en escenarios con solapamiento.
- Procesamiento en tramos de 80 ms, lo que permite baja latencia en aplicaciones en vivo.
- Salida de etiquetas de hablante por trama y segmentación con límites temporales precisos (validado al milisegundo).
- Independiente del idioma: funciona con cualquier idioma, ya que se basa únicamente en características acústicas.
- Compatible con aplicaciones que usan el runtime NeMo-Speech.cpp (por ejemplo, Vibe).
- Cuantización Q8_0 segura para este modelo; las cuantizaciones k-quant no son recomendadas por el autor por riesgo de permutar etiquetas de hablante.

## Casos de uso

- **Transcripción de reuniones con identificación de hablante**: integrar el modelo en un pipeline de transcripción (por ejemplo, junto a un ASR como Whisper) para asignar cada frase a un interlocutor concreto. El streaming permite transcribir la reunión en directo y etiquetar quién habla en cada momento.
- **Atención al cliente y análisis de llamadas**: en centros de contacto, el modelo puede procesar grabaciones o llamadas en vivo para segmentar el diálogo entre agente y cliente, permitiendo análisis de sentimiento por hablante o evaluación de calidad.
- **Subtitulación en directo con identificación de hablante**: en emisiones en vivo (conferencias, webinars, noticias), el modelo puede alimentar un sistema de subtitulado en tiempo real que indica qué persona está hablando, mejorando la accesibilidad.
- **Asistentes de voz y dispositivos domésticos**: en sistemas con varios usuarios, el modelo permite distinguir quién emite una orden, habilitando respuestas personalizadas o control de acceso por voz.
- **Análisis de interacciones en educación**: en clases online o grabaciones de seminarios, el modelo segmenta las intervenciones de profesor y alumnos, facilitando la generación de resúmenes o la detección de participación.
- **Monitorización de llamadas de emergencia o seguridad**: en centros de coordinación, el modelo puede separar las voces de operador y usuario en tiempo real, ayudando a la transcripción y al análisis de la conversación.
- **Investigación en psicolingüística**: para estudiar turnos de habla y solapamientos en conversaciones naturales, el modelo proporciona una segmentación fiable sin requerir anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (como DER, JER, etc.) en la información disponible. La validación mencionada en la model card se limita a comparar la salida GGUF con la del modelo ONNX original en dos clips (12 s y 41 s), obteniendo etiquetas idénticas y límites de segmento idénticos al milisegundo. No se proporcionan métricas de error de diarización (DER) ni comparativas con otros modelos.

## Requisitos de hardware

- El peso del fichero GGUF es de 147 MB, por lo que puede cargarse completamente en memoria RAM o VRAM de cualquier GPU moderna (incluso integradas).
- Inferencia en tiempo real factible en CPU: el modelo es pequeño (122,8M parámetros) y el procesamiento en streaming de 80 ms requiere poco cómputo. Una CPU de gama media (por ejemplo, un Intel i5 o AMD Ryzen 5) puede procesar audio en tiempo real sin problemas.
- Para GPU: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo GTX 1650, RTX 3060, etc.
- Se recomienda el uso del runtime NeMo-Speech.cpp para la inferencia, ya que el modelo fue convertido con esa herramienta y es el que usa la aplicación Vibe.
- No se requiere hardware específico de NVIDIA; puede ejecutarse en hardware genérico con soporte de CPU.
- Latencia: el modelo procesa tramos de 80 ms, por lo que la latencia de salida es de al menos 80 ms, más el tiempo de cómputo. En CPU moderna se espera que el throughput sea superior al tiempo real, permitiendo streaming sin acumulación de retraso.

## Comparativa con modelos similares

| Modelo | Parámetros | Streaming | Máx. hablantes | Licencia | Formato |
|---|---|---|---|---|---|
| `diar_streaming_sortformer_4spk-v2` (este) | 122,8M | Sí | 4 | CC-BY-4.0 | GGUF |
| `diar_sortformer_4spk-v1` (offline) | 123M | No (offline) | 4 | CC-BY-4.0 | .nemo |
| `diar_streaming_sortformer_4spk-v2.1` | No disponible | Sí | 4 | CC-BY-4.0 | .nemo |

La versión v1 (offline) tiene 6M más de parámetros y puede ofrecer mayor precisión al disponer de todo el audio de la grabación, pero no es adecuada para streaming. La v2.1 es una mejora reciente de la v2, con mayor robustez para reuniones, pero no está disponible en formato GGUF en este repositorio. No se dispone de datos de rendimiento comparativo (DER) entre estas versiones.

## Limitaciones y advertencias

- **Máximo de 4 hablantes**: el modelo no puede distinguir más de cuatro interlocutores simultáneos. Si hay más, no se asignarán correctamente.
- **Frecuencia de muestreo fija**: requiere audio de entrada a 16 kHz mono. Cualquier otra frecuencia debe ser remuestreada previamente.
- **Riesgo de errores con cuantizaciones k-quant**: el autor advierte explícitamente que las cuantizaciones k-quant (Q4_K, Q6_K, etc.) pueden provocar errores de permutación en las etiquetas de hablante. Solo se recomiendan F32, F16 y Q8_0.
- **Dependencia de la calidad del audio**: la precisión puede degradarse en ambientes con mucho ruido o con más de 4 hablantes solapados.
- **Licencia CC-BY-4.0**: requiere atribución a NVIDIA como autor del modelo original. El uso comercial está permitido, pero debe indicarse la autoría.
- **No se proporcionan datos de entrenamiento ni de rendimiento en benchmarks**: no se puede evaluar objetivamente su calidad frente a otros diarizadores sin métricas publicadas.
- **El modelo es solo diarización, no transcripción**: no genera texto; necesita un sistema ASR adicional para obtener transcripciones.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/vibe-app/diar-streaming-sortformer-4spk-v2-gguf)
- [Modelo base original de NVIDIA](https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2)
- [Modelo base en HuggingFace de everyscribe](https://huggingface.co/everyscribe/diar_streaming_sortformer_4spk-v2)
- [Descripción del modelo en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/diar-streaming-sortformer-4spk-v2-nvidia)
- [Descripción de la versión v2.1 en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/diar-streaming-sortformer-4spk-v2.1-nvidia)
- [Repositorio de fine-tuning de Sortformer en GitHub](https://github.com/hieuxinloi/Sortformer-Speaker-Diarization)
