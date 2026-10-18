# voicetide/whisper-phone

## Resumen

voicetide/whisper-phone es un fichero GGML para whisper.cpp destinado al reconocimiento automático del habla, publicado por voicetide. Se trata de una cuantización q4_0 del modelo openai/whisper-large-v3-turbo de OpenAI, no de un modelo entrenado desde cero. El artefacto ocupa 473.992.235 bytes (aproximadamente 474 MB) y se distribuye como un único fichero `ggml-large-v3-turbo-q4_0.bin`.

Su función es proporcionar transcripción de voz a texto multilingüe en local. La app iPhone de Voice Tide lo descarga de forma opcional como modelo de voz para idiomas de dictado adicionales; según la model card, la descarga no requiere cuenta y no se envía nada de vuelta. Esto lo hace relevante para dictado y ASR offline en dispositivos, donde el tamaño y la privacidad son críticos.

El modelo base es Whisper Large v3 Turbo, con arquitectura Whisper y cobertura de 100 etiquetas de idioma en la ficha. La licencia es MIT. No se publican en la información disponible parámetros totales, longitud de contexto, benchmarks ni requisitos de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper Large v3 Turbo (encoder-decoder de tipo Transformer, según el modelo base); no se detalla en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ASR; la ficha no especifica ventana de audio) |
| Tipos de cuantización | q4_0 (GGML); no se distribuyen otros tipos |
| Idiomas soportados | 100 etiquetas de idioma listadas en la model card, incluyendo es, en, zh, de, fr, ja, pt, ar, hi, ru, ko y yue |
| Licencia | MIT |
| Formato de pesos | GGML `.bin` para whisper.cpp; fichero único `ggml-large-v3-turbo-q4_0.bin` |
| Modelo base | openai/whisper-large-v3-turbo |
| Tamaño del fichero | 473.992.235 bytes (aproximadamente 452 MiB o 474 MB) |
| SHA-256 | `2ceb779ca61ce46ed6e9aa43c4a0f8a89a37f683df3c0ba3119238fcd5852155` |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Large v3 Turbo, el modelo de reconocimiento automático del habla de OpenAI. La model card no especifica número de capas, dimensión del modelo, mecanismo de atención ni otros detalles internos. No es un modelo MoE. El artefacto publicado por voicetide no introduce cambios arquitectónicos: es una versión cuantizada del modelo base.

No se ha entrenado desde cero. La única transformación documentada es la cuantización post-entrenamiento a q4_0 mediante `whisper-quantize` de whisper.cpp v1.9.4 (commit `927cfce`), a partir de `ggml-large-v3-turbo.bin` del repositorio ggerganov/whisper.cpp en la revisión `5359861c`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) y transcripción de voz a texto en las 100 etiquetas de idioma listadas en la model card.
- Ejecución local y offline mediante whisper.cpp, sin depender de una API externa.
- Integración en la app iPhone de Voice Tide como modelo opcional para idiomas de dictado adicionales.
- Formato cuantizado q4_0 orientado a reducir el tamaño del modelo base para su descarga y uso en dispositivos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de generación de texto general, código, matemáticas o visión.
- No se documentan en la model card marcas de tiempo, diarización de hablantes, traducción ni detección automática de idioma.

## Casos de uso

- Dictado multilingüe en iPhone: la app Voice Tide descarga este fichero de forma opcional como modelo de voz para idiomas de dictado adicionales. Es adecuado porque el artefacto pesa unos 474 MB, funciona con whisper.cpp y, según la model card, no requiere cuenta ni envía datos de vuelta.
- Transcripción local de notas de voz y reuniones: se puede ejecutar en el dispositivo con whisper.cpp para convertir audio en texto sin subir grabaciones a un servidor. El tamaño cuantizado reduce el espacio de almacenamiento frente al modelo original.
- Subtitulado de contenido audiovisual en diversos idiomas: permite procesar audio en los idiomas cubiertos por la ficha mediante un pipeline local de ASR. Es adecuado para flujos por lotes donde la cobertura lingüística es más importante que la latencia en tiempo real.
- Aplicaciones de campo sin conectividad: periodismo, inspecciones técnicas o asistencia sanitaria en entornos rurales pueden transcribir entrevistas y notas en local. La inferencia con whisper.cpp evita depender de red y mantiene el audio en el dispositivo.
- Prototipos de ASR en dispositivos con recursos limitados: el fichero de 474 MB puede integrarse en equipos ARM o sistemas sin GPU dedicada si el runtime whisper.cpp está disponible. El rendimiento real debe validarse, porque la model card no publica latencia ni throughput.
- Transcripción por lotes en servidor con CPU: whisper.cpp puede ejecutar el modelo cuantizado en infraestructura sin GPU, lo que reduce requisitos de memoria y almacenamiento frente a versiones de mayor precisión. No se documentan cifras de rendimiento.
- Accesibilidad y dictado por voz: usuarios con movilidad reducida pueden dictar texto en local desde una aplicación móvil. El procesamiento en el dispositivo evita enviar audio a servicios externos.
- Evaluación de cuantización: investigadores pueden comparar la precisión de esta versión q4_0 frente al modelo original o frente a otras cuantizaciones de whisper.cpp. La model card no incluye resultados de WER, por lo que la comparación debe realizarse con una evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible. El fichero q4_0 ocupa 473.992.235 bytes (aproximadamente 452 MiB); hay que añadir el overhead de whisper.cpp y los buffers de audio, que no se cuantifican en la información proporcionada.
- GPU recomendadas: no disponibles. El caso de uso documentado es la app iPhone de Voice Tide; no se especifican A100, H100, RTX 4090 ni otras GPU.
- ¿Cabe en GPU de consumo? No se documenta. El tamaño del fichero es inferior a 0,5 GB, pero no se confirma compatibilidad ni rendimiento en GPU de consumo.
- Opciones de despliegue: whisper.cpp con el fichero GGML. No se documentan vLLM, TGI, Ollama ni llama.cpp para este artefacto.
- Latencia y throughput: no disponibles.
- El modelo se distribuye como un único fichero `.bin`; no requiere múltiples shards.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| voicetide/whisper-phone | no disponible | no disponible | no disponible | MIT | GGML q4_0, 474 MB, HuggingFace |
| openai/whisper-large-v3-turbo | no disponible | no disponible | no disponible | MIT | Modelo base en HuggingFace; formato no detallado en la información |
| ggerganov/whisper.cpp (`ggml-large-v3-turbo.bin`, rev. `5359861c`) | no disponible | no disponible | no disponible | no disponible | Fichero GGML de origen en HuggingFace; cuantización no especificada |

No se dispone de datos de benchmarks ni de especificaciones de parámetros en la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La cuantización q4_0 puede degradar la precisión frente al modelo original. La model card no proporciona WER ni ninguna comparación de calidad.
- Es un modelo exclusivamente de ASR: no genera texto libre, no razona, no usa herramientas y no soporta agentes.
- La cobertura de 100 etiquetas de idioma no implica la misma calidad en todos ellos. No se documenta el rendimiento por idioma ni para idiomas de bajos recursos.
- Riesgo de alucinación propio de los modelos Whisper: puede producir texto plausible en silencios, ruido o audio ambiguo. La model card no cuantifica este riesgo.
- No se documentan sesgos específicos. Al ser un modelo ASR, puede reflejar sesgos acústicos y lingüísticos de los datos de entrenamiento de Whisper, no detallados en la ficha.
- La licencia MIT permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia. Al ser una versión modificada mediante cuantización, debe mantenerse la licencia del modelo original.
- La afirmación de que no se envía nada de vuelta corresponde a la app Voice Tide, no al modelo en sí. Si se integra en otra aplicación, la privacidad depende de la implementación.
- No hay benchmarks publicados ni validación comunitaria documentada: el repositorio no tiene descargas ni likes en la información consultada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voicetide/whisper-phone
- Modelo base openai/whisper-large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Fichero de origen en ggerganov/whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- Repositorio whisper.cpp en GitHub: https://github.com/ggerganov/whisper.cpp
- App Voice Tide: no se proporciona URL en la model card.
- Papers, blogs o demos adicionales: no se han proporcionado en la información disponible.
