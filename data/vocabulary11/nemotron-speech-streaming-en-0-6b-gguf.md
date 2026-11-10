# vocabulary11/nemotron-speech-streaming-en-0.6b-gguf

## Resumen

`vocabulary11/nemotron-speech-streaming-en-0.6b-gguf` es una conversión al formato GGUF (cuantización Q8_0) del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-speech-streaming-en-0.6b` de NVIDIA, publicada por el usuario `vocabulary11`. El modelo original está diseñado para transcripción en streaming en inglés, con un tamaño compacto de aproximadamente 618 millones de parámetros, lo que lo hace adecuado para despliegues con requisitos moderados de cómputo y latencia.

La relevancia de esta ficha radica en que el GGUF permite ejecutar el modelo fuera del ecosistema NeMo de NVIDIA, concretamente mediante `transcribe.cpp`, una implementación en C++ orientada a inferencia local. Esto abre la puerta a despliegues en CPU y en entornos sin CUDA, algo que no es posible con los pesos originales en `.nemo` o `safetensors` sin depender del stack de NVIDIA.

No obstante, la información pública disponible sobre esta conversión concreta es muy limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card se limita a describir el proceso de conversión y cuantización. Los datos sobre arquitectura interna, datos de entrenamiento, benchmarks y capacidades multilingües del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de NVIDIA; arquitectura interna no especificada en la informacion proporcionada) |
| Parametros totales | 618.079.745 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica disponible en este repo); el modelo base admite otras conversiones no documentadas aqui |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (`nemotron-speech-streaming-en-0.6b-Q8_0.gguf`, 729.650.304 bytes) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y el pipeline (`automatic-speech-recognition`), se trata de un modelo de ASR de NVIDIA orientado a streaming, con 618 millones de parámetros. El checkpoint del que se parte es el de fecha 2026-03-13 (commit `2ea504fb`), según indica la model card de la conversión.

El proceso de conversión documentado es el siguiente: los pesos originales en formato `.nemo` se convierten mediante el script `scripts/convert-parakeet.py` de `transcribe.cpp`, y posteriormente se cuantizan con `transcribe-quantize --quant Q8_0`. La model card afirma que los tensores F32 del GGUF coinciden exactamente con el `model.safetensors` de NVIDIA, lo que sugiere una conversión fiel sin pérdida en precisión completa y una cuantización posterior a 8 bits. No hay información sobre el número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, orientado a transcripción en streaming según el nombre del modelo base.
- Conversión de audio a texto con un modelo de 618 millones de parámetros, adecuado para despliegues ligeros.
- Ejecución mediante `transcribe.cpp`, lo que permite inferencia en C++ sin dependencia del stack NeMo.
- Soporte de cuantización Q8_0, que reduce el tamaño del archivo a aproximadamente 730 MB.
- No hay información disponible sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio adicional (más allá de la entrada de voz) ni modos de "thinking".
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.

## Casos de uso

- Transcripción local en tiempo real: el modelo, al estar en formato GGUF y orientado a streaming, puede integrarse en aplicaciones de escritorio o embebidas que transcriban audio en directo sin enviar datos a la nube, usando `transcribe.cpp` como motor de inferencia.
- Subtitulado automático de vídeo o reuniones: con 618 millones de parámetros y cuantización Q8_0, el modelo puede ejecutarse en hardware modesto para generar subtítulos en inglés con latencia aceptable.
- Asistentes de voz en dispositivos edge: al caber en menos de 1 GB en disco y no requerir GPU dedicada necesariamente, es apto para dispositivos con recursos limitados que necesiten reconocimiento de voz en inglés.
- Pipeline de transcripción por lotes: para procesar archivos de audio ya grabados en servidores sin GPU, aprovechando la implementación en C++ de `transcribe.cpp`.
- Prototipado de aplicaciones de voz: desarrolladores que quieran experimentar con ASR en streaming sin depender de APIs comerciales ni del stack NeMo de NVIDIA.
- Integración en herramientas de accesibilidad: transcripción de voz a texto para personas con dificultades auditivas en entornos locales y con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo GGUF Q8_0 ocupa aproximadamente 730 MB, por lo que la huella en memoria debería ser del orden de 1 GB o algo superior, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado, pero por tamaño (618 M de parámetros, Q8_0) es plausible que quepa en GPUs de consumo con suficiente VRAM; no obstante, la información proporcionada no lo especifica.
- Opciones de despliegue: `transcribe.cpp` (motor para el que se ha convertido el modelo). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`), lo que limita su uso en entornos multilingües.
- La licencia es `nvidia-open-model-license`, que no es una licencia de código abierto estándar; es necesario revisar sus términos para uso comercial y redistribución.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-10), lo que indica que es una conversión reciente y sin validación comunitaria.
- No hay información sobre sesgos, riesgo de alucinación o comportamiento en dominios específicos (acentos, ruido de fondo, jerga técnica).
- Al ser una conversión de terceros, no está respaldada oficialmente por NVIDIA; la fidelidad de la conversión se afirma en la model card, pero no se ha verificado de forma independiente en la información disponible.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de audio.
- El motor `transcribe.cpp` es un proyecto independiente; su madurez y soporte no están documentados en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vocabulary11/nemotron-speech-streaming-en-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Motor de inferencia `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
