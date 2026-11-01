# tryambientai/moonshine-tiny-gguf

## Resumen

Moonshine-tiny es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por Useful Sensors, disenado para transcripcion de voz a texto en dispositivos con recursos limitados. Con solo 27 millones de parametros, emplea una arquitectura encoder-decoder transformer que consume directamente audio PCM a 16 kHz mediante un stem convolucional de tres capas Conv1d, eliminando la necesidad de STFT o calculo de mel-espectrogramas. Esta ficha documenta la conversion a formato GGUF realizada por tryambientai para su uso con transcribe.cpp.

La relevancia de este modelo radica en su eficiencia extrema: el archivo cuantizado Q8_0 ocupa solo 34 MB y mantiene un WER del 4,60% en LibriSpeech test-clean, practicamente identico al 4,58% de la version F32. Esto lo posiciona como una opcion viable para transcripcion en tiempo real en hardware de consumo, incluyendo CPUs y GPUs integradas, con tasas de tiempo real (RTF) de 127x en Metal sobre un M4 Max y 45,5x en CPU Ryzen 4750U.

El modelo esta disenado exclusivamente para ingles, sin soporte de traduccion, deteccion de idioma ni marcas de tiempo. Su licencia MIT permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones en productos de consumo, dispositivos IoT y aplicaciones de borde donde el coste computacional y el tamano del modelo son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con stem Conv1d de tres capas |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificacion: 194 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

Moonshine-tiny es un transformer encoder-decoder disenado especificamente para ASR. A diferencia de Whisper, que procesa espectrogramas mel de 80 canales, Moonshine consume directamente audio PCM crudo a 16 kHz a traves de un stem convolucional de tres capas Conv1d. Esta eleccion elimina el preprocesamiento STFT y el calculo de mel-espectrogramas, reduciendo la latencia y el coste computacional en el preprocesamiento. El modelo genera unicamente la transcripcion como salida, sin tokens especiales de idioma, timestamps ni traduccion.

Los detalles completos de entrenamiento se documentan en el paper arXiv:2410.15608. El modelo base fue entrenado por Useful Sensors y posteriormente convertido a GGUF por tryambientai, validado contra la referencia de transformers en el commit 07a8a84 de transcribe.cpp. La decodificacion por defecto es greedy (num_beams=1) con max_length=194, y se recomienda limitar la longitud maxima de generacion a 6,5 tokens por segundo de audio para evitar bucles de alucinacion, segun la model card original.

## Capacidades

- Transcripcion de voz a texto en ingles a partir de audio PCM mono a 16 kHz.
- Procesamiento directo de audio sin preprocesamiento STFT ni mel-espectrograma.
- Generacion de transcripciones con limite de longitud configurable para evitar alucinaciones.
- Inferencia eficiente en CPU y GPU mediante transcribe.cpp.
- No soporta traduccion, deteccion de idioma ni marcas de tiempo (streaming: false, translate: false, lang_detect: false, timestamps: none).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo thinking.
- No soporta vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion en tiempo real en dispositivos de borde: el modelo Q8_0 de 34 MB puede ejecutarse en CPUs de consumo con RTF de 45,5x en un Ryzen 4750U, permitiendo transcripcion continua sin GPU dedicada en dispositivos IoT o Raspberry Pi.
- Subtitulado local de reuniones y videollamadas: con RTF de 127x en Metal sobre M4 Max, el modelo puede transcribir audio en tiempo real en portatiles Apple Silicon sin enviar datos a la nube, preservando la privacidad.
- Dictado por voz en aplicaciones de escritorio: la integracion via transcribe.cpp permite anadir dictado offline a editores de texto o IDE, con latencia minima gracias al procesamiento directo de PCM sin preprocesamiento mel.
- Transcripcion de notas de voz en aplicaciones moviles: el tamano reducido del modelo (34 MB en Q8_0) permite empaquetarlo en apps moviles para transcripcion offline de grabaciones, sin dependencia de conectividad.
- Automatizacion de transcripcion de archivos de audio en pipelines batch: el modelo puede procesar lotes de WAV de 16 kHz mono mediante la CLI de transcribe.cpp, con WER del 4,60% en LibriSpeech test-clean, adecuado para archivado y busqueda de contenido.
- Asistencia por voz en entornos sin conectividad: en aplicaciones de campo, vehiculos o dispositivos industriales, el modelo ofrece transcripcion local en ingles sin necesidad de red, con licencia MIT que permite integracion comercial sin restricciones.
- Prototipado rapido de sistemas ASR: investigadores pueden usar la version F32 (105 MB) como referencia y comparar con Q8_0 para evaluar el impacto de la cuantizacion, con una deriva de solo +0,02 pp en WER.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean | 4,58% | 4,58% | 4,60% |
| Tamano del archivo | 105 MB | 57 MB | 34 MB |
| RTF en M4 Max (Metal) | no disponible | no disponible | 127x |
| RTF en M4 Max (CPU) | no disponible | no disponible | 153,5x |
| RTF en Ryzen 4750U (Vulkan) | no disponible | no disponible | 56x |
| RTF en Ryzen 4750U (CPU) | no disponible | no disponible | 45,5x |

El WER se midio sobre el split completo de LibriSpeech test-clean (2620 enunciados) con decodificacion greedy por defecto de transcribe.cpp. El dato auto-reportado por Useful Sensors en la model card original es 4,55% para el mismo split. La deriva de Q8_0 respecto a F32 es de +0,02 pp, dentro del ruido del intervalo de confianza bootstrap.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el archivo Q8_0 ocupa 34 MB en disco y requiere memoria proporcional durante la inferencia.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M1/M2/M3/M4) o Vulkan (AMD, Intel); no requiere GPU dedicada de datacenter.
- Cabe en GPU de consumo: si, en cualquier GPU integrada o dedicada, incluyendo iGPU Intel/AMD y Apple Silicon.
- Cabe en CPU: si, con rendimiento en tiempo real (RTF 45,5x en Ryzen 4750U, 153,5x en M4 Max CPU).
- Opciones de despliegue: transcribe.cpp (CLI y libreria); el modelo base es compatible con Hugging Face Transformers mediante MoonshineForConditionalGeneration.
- Latencia y throughput: RTF de 127x en Metal (M4 Max), 153,5x en CPU (M4 Max), 56x en Vulkan (Ryzen 4750U), 45,5x en CPU (Ryzen 4750U). Un RTF de 127x implica procesar 127 segundos de audio por segundo de computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---:|---|---:|---|---|
| moonshine-tiny (este) | 27M | no disponible | 4,58% (F32) | MIT | GGUF, safetensors |
| Whisper tiny | 39M | 30 s audio | no disponible en la informacion | MIT | safetensors, GGUF |
| Whisper base | 74M | 30 s audio | no disponible en la informacion | MIT | safetensors, GGUF |

No se dispone de datos de WER para Whisper tiny o base en la informacion proporcionada, por lo que la comparacion numerica de rendimiento no esta disponible. La ventaja principal de Moonshine-tiny frente a Whisper radica en el procesamiento directo de PCM sin mel-espectrograma y en su menor numero de parametros, lo que reduce latencia y requisitos de memoria.

## Limitaciones y advertencias

- Solo soporta ingles; no traduce ni detecta idioma automaticamente.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado.
- No soporta streaming nativo (streaming: false); requiere audio completo o segmentacion manual.
- Riesgo de alucinacion en audio con ruido o silencios prolongados; se recomienda limitar la generacion a 6,5 tokens por segundo de audio.
- WER del 4,58% en LibriSpeech test-clean implica errores en condiciones limpias; el rendimiento degradara en audio con ruido, acentos o dominio especifico.
- Sesgos conocidos: no documentados en la informacion disponible; el modelo base hereda riesgos de Whisper segun la model card original.
- Licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar la model card del modelo base para terminos completos.
- La conversion GGUF esta validada contra transformers en un commit especifico; cambios en transcribe.cpp pueden afectar la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria independiente.

## Enlaces

- HuggingFace (esta conversion GGUF): https://huggingface.co/tryambientai/moonshine-tiny-gguf
- Modelo base en HuggingFace: https://huggingface.co/UsefulSensors/moonshine-tiny
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-tiny.md
- Paper Moonshine (arXiv:2410.15608): https://arxiv.org/abs/2410.15608
- Blog de introduccion a Moonshine: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio oficial de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Paper Model Cards for Model Reporting (arXiv:1810.03993): https://arxiv.org/abs/1810.03993
- Podcast de presentacion: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/07a8a84
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny/commit/390624e
