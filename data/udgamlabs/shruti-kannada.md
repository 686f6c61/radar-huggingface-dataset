# udgamlabs/shruti-kannada

## Resumen

Shruti Kannada es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado para transcribir audio en kannada, inglés y habla mixta kannada-inglés. Con aproximadamente 56 millones de parámetros, es un modelo compacto que prioriza la eficiencia y el despliegue en dispositivo (on-device) frente a la precisión bruta en dominios de lectura. Forma parte de la familia Shruti, que cubre también hindi, marathi, tamil, bengalí, telugu, guyaratí y odia.

El modelo se distribuye como un único archivo de 29,7 MB en formato `.cact` (pesos de 4 bits, activaciones de 8 bits) para el motor Cactus needle, lo que permite ejecutarlo de forma totalmente offline en un teléfono, un portátil o dentro de una página web mediante WebAssembly. Su propuesta de valor es clara: transcripción de habla real y code-switching en entornos sin conectividad y con recursos muy limitados, a costa de un mayor error en conversaciones espontáneas.

La relevancia actual del modelo radica en su enfoque en el habla conversacional mixta kannada-inglés, un escenario muy común en la India urbana que los modelos ASR multilingües grandes suelen manejar mal. Aunque su tasa de error en conversación es alta (56,6 % con palabras inglesas evaluadas en caracteres latinos), supera a modelos hasta 33 veces más grandes en ese mismo conjunto de prueba, lo que lo convierte en una opción interesante para aplicaciones móviles de bajo consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512) |
| Parámetros totales | ~56M (55.875.913) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de 16 kHz de cualquier longitud) |
| Tipos de cuantización | Pesos de 4 bits y activaciones de 8 bits en formato `.cact` |
| Idiomas soportados | Kannada (kn), inglés (en) y habla mixta kannada-inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

Shruti Kannada es un transformer encoder-decoder compacto con 8 capas en el encoder y 8 en el decoder, con una anchura de 512 dimensiones. Deriva de Shruti Hindi (Udgam Labs), que a su vez se construye sobre Cactus Whistle (Cactus Compute), ambos bajo licencia Apache-2.0. El proceso de adaptación consistió en reentrenar todos los pesos sobre habla abierta en kannada e inglés y ampliar el vocabulario con 700 piezas específicas de kannada.

Los datos de entrenamiento provienen de conjuntos abiertos: IndicVoices y Kathbath (AI4Bharat), SPRING_INX_Kannada_R1 (SPRINGLab), Vaani-transcription-part (ARTPARK-IISc) y LibriSpeech ASR (OpenSLR) para la parte inglesa. La model card no detalla el número total de tokens de audio ni si hubo etapas de ajuste con RLHF o DPO; esa información no está disponible. La innovación principal no está en la arquitectura, sino en el empaquetado: cuantización agresiva (4 bits en pesos) y un motor de inferencia nativo y WebAssembly que permite ejecución offline con 64 MB de memoria en un Samsung Galaxy F62 de 2021, transcribiendo 11,2 veces más rápido que tiempo real.

## Capacidades

- Transcripción de voz a texto en kannada, con salida en escritura kannada.
- Reconocimiento de palabras inglesas dentro de habla kannada, manteniéndolas en caracteres latinos en minúscula (code-switching).
- Detección automática del idioma de entrada (kannada o inglés) sin configuración previa.
- Procesamiento de audio de 16 kHz de cualquier duración.
- Ejecución totalmente offline y on-device, sin servidor ni conexión a internet.
- Despliegue nativo (Mac, Android) y en navegador mediante WebAssembly.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo de razonamiento (thinking), visión ni audio generativo.

## Casos de uso

- Transcripción offline en dispositivos móviles: la aplicación puede convertir notas de voz o conversaciones en texto sin enviar audio a la nube, gracias a los 29,7 MB del archivo y los 64 MB de memoria medidos en un Galaxy F62.
- Subtitulado y actas de reuniones en entornos con conectividad limitada: el modelo procesa audio de cualquier longitud a 16 kHz y funciona en un portátil sin GPU dedicada.
- Aplicaciones web de accesibilidad: mediante la build WebAssembly, se puede integrar un cuadro de transcripción en una página sin backend, útil para personas con dificultades auditivas en contextos kannada.
- Asistentes de voz para atención al cliente en kannada urbano: el modelo maneja code-switching kannada-inglés, frecuente en consultas sobre banca, reservas o comercio, aunque su WER conversacional exige revisión humana.
- Digitalización de entrevistas y encuestas de campo: investigadores que recogen testimonios en kannada pueden transcribir en el dispositivo y revisar después, reduciendo costes de subida de audio y preservando la privacidad.
- Prototipado rápido de pipelines ASR: al ser Apache-2.0 y ejecutable con `pip install cactus-needle`, sirve para validar productos de voz en kannada antes de invertir en modelos mayores.
- Transcripción de comandos cortos en quioscos o electrodomésticos: su latencia (11,2x tiempo real en móvil de 2021) y bajo consumo lo hacen apto para interacciones breves y locales.

## Benchmarks y rendimiento

Tasa de error de palabras (WER, %, menor es mejor), 200 clips por conjunto, mismo evaluador para todos los modelos; Shruti Kannada medido en su motor on-device en un Mac el 2 de noviembre de 2026.

| Modelo | Tamaño | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, inglés en inglés (conversación, held out) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Kannada** | **29,7 MB** | 33,1 | 29,4 | **56,6** | 69,5 |
| Whisper tiny | 43,5 MB | 305,5 | 371,7 | 574,5 | 584,5 |
| Whisper base | 81,8 MB | 179,5 | 178,5 | 248,8 | 252,4 |
| IndicConformer Kannada (int8) | 137,7 MB | 20,4 | 19,8 | 67,1 | 56,7 |
| Whisper-tiny Kannada (vasista22) | 151,1 MB | 29,7 | 34,2 | 91,4 | 90,2 |
| Whisper small | 264,5 MB | 103,0 | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |

En lectura, IndicConformer Kannada es más preciso (20,4 y 19,8 de WER frente a 33,1 y 29,4). En conversación con code-switching, Shruti Kannada obtiene 56,6 frente a 67,1 de IndicConformer y 88,7-91,4 de los fine-tunes de Whisper de vasista22. En la referencia nativa, IndicConformer vuelve a ser mejor (56,7 frente a 69,5).

## Requisitos de hardware

- VRAM/RAM estimada: unos 64 MB de memoria en el dispositivo según la medición del autor en un Samsung Galaxy F62; el archivo pesa 29,7 MB.
- GPU recomendadas: no requiere GPU; está pensado para CPU móvil, CPU de portátil y WebAssembly en navegador.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y también en dispositivos sin GPU dedicada.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle` (`pip install cactus-needle`), binario `needle` para línea de comandos y build WASM para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 11,2x más rápido que tiempo real en un Samsung Galaxy F62 de 2021 con el motor nativo; no se publican cifras de throughput para otros dispositivos.
- El paquete Python envía recuentos anónimos de uso por defecto; se desactiva con `NEEDLE_TELEMETRY=0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER conversación (DiarBench) | Licencia | Formato |
|---|---|---|---|---|---|
| Shruti Kannada | ~56M | Audio de cualquier longitud | 56,6 | Apache-2.0 | `.cact` |
| IndicConformer Kannada | No disponible (archivo int8 de 137,7 MB) | No disponible | 67,1 | No disponible en la información | ONNX int8 |
| Whisper-tiny Kannada (vasista22) | ~39M (Whisper tiny) | 30 s por ventana (Whisper) | 91,4 | No disponible en la información | Whisper (q8_0 en la comparación) |
| Whisper base | ~74M | 30 s por ventana (Whisper) | 248,8 | MIT (Whisper original) | Whisper (q8_0 en la comparación) |

Shruti Kannada es el más pequeño de la comparativa y el mejor en conversación code-switching, pero pierde en lectura frente a IndicConformer. Los datos de licencia y contexto de IndicConformer y de los fine-tunes de vasista22 no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Elevado error en conversación: 56,6 % de WER con inglés en caracteres latinos y 69,5 % contra referencia nativa; más de la mitad de las palabras pueden ser incorrectas en habla espontánea.
- Peor rendimiento en lectura que modelos mayores como IndicConformer Kannada (33,1 frente a 20,4 en FLEURS).
- Ejemplos de errores reales documentados por el autor, como transcribir "parcel" como "ಭಾರಿಸಲ್ಲ" en el motor nativo del teléfono, aunque el navegador del mismo dispositivo lo escribió correctamente.
- Solo cubre kannada e inglés; para otros idiomas indios hay que usar los otros miembros de la familia Shruti.
- No disponible información sobre sesgos demográficos, acentos regionales o variedades dialectales del kannada.
- Riesgo de alucinación en ASR: no se documenta, pero el WER elevado implica sustituciones y omisiones de palabras.
- Licencia Apache-2.0 permite uso comercial, pero el paquete `cactus-needle` envía telemetría anónima por defecto; hay que desactivarla explícitamente para entornos con requisitos de privacidad.
- El formato `.cact` está atado al motor Cactus needle; no hay pesos en safetensors ni GGUF para usar con otros runtimes.
- No se publican datos de entrenamiento en tokens ni detalles de ajuste fino, lo que dificulta evaluar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-kannada
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Prueba en navegador (Udgam Labs): https://udgamlabs.com/models/shruti/kannada
- Código y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/kannada.md
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Shruti Bengali: https://huggingface.co/udgamlabs/shruti-bengali
- Shruti Telugu: https://huggingface.co/udgamlabs/shruti-telugu
- Shruti Gujarati: https://huggingface.co/udgamlabs/shruti-gujarati
- Shruti Odia: https://huggingface.co/udgamlabs/shruti-odia
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Whisper small: https://huggingface.co/openai/whisper-small
- IndicConformer Kannada (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-kn-onnx
- Whisper-tiny Kannada (vasista22): https://huggingface.co/vasista22/whisper-kannada-tiny
