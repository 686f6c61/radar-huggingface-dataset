# tryambientai/moonshine-base-gguf

## Resumen

Moonshine Base es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors, distribuido aquí en formato GGUF por tryambientai para su uso con la librería transcribe.cpp. Se trata de un transformer encoder-decoder de 61,5 millones de parámetros especializado en transcripción de inglés, que procesa audio PCM crudo a 16 kHz directamente mediante un stem de tres capas Conv1d, sin STFT ni mel-spectrogramas, y emite únicamente el texto de la transcripción.

La relevancia de esta conversión reside en su empaquetado ligero: los ficheros GGUF van de 74 MB (Q8_0) a 236 MB (F32), lo que permite ejecutar ASR en CPU, Metal o Vulkan sin dependencias pesadas. El modelo mantiene un WER del 3,26-3,28 % en LibriSpeech test-clean, prácticamente idéntico al 3,27 % reportado por el modelo original, lo que demuestra que la cuantización Q8_0 no degrada la calidad de forma medible.

Esta variante está pensada para despliegues de transcripción local y de borde (edge), donde el coste computacional y el tamaño del binario importan más que las capacidades multilingües o la funcionalidad de streaming, que este modelo no ofrece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de 3 capas (sin STFT ni mel) |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de generación: 194 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

Moonshine Base es un transformer encoder-decoder con 8 capas en el encoder y 8 en el decoder, tamaño oculto de 416 y RoPE parcial con factor 0,62. La innovación principal frente a Whisper es la eliminación del preprocesado espectral: el modelo consume directamente PCM de 16 kHz a través de un stem de tres capas Conv1d, lo que reduce el coste de preprocesado y permite longitudes de entrada variables sin padding fijo a 30 segundos. El modelo es más ancho y profundo que moonshine-tiny.

Los detalles concretos sobre el volumen de datos de entrenamiento, la composición del dataset y si se aplicaron técnicas de RLHF o DPO no están disponibles en la información proporcionada. El modelo base fue portado desde el commit 7a73d8d de UsefulSensors/moonshine-base (fijado el 2026-05-05) y validado contra la referencia de transformers en el commit 07a8a84 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio crudo sin necesidad de extracción de características mel ni STFT.
- Generación de salida solo de transcripción (transcript-only), sin etiquetas adicionales.
- Ejecución en CPU, Metal y Vulkan mediante transcribe.cpp.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No realiza detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No dispone de tool calling ni capacidades de agente.
- No dispone de modo thinking ni capacidades de visión o audio más allá del ASR.

## Casos de uso

- Transcripción local en dispositivos de borde: con 74 MB en Q8_0 y ejecución en CPU, el modelo puede integrarse en aplicaciones de escritorio o dispositivos embebidos para dictado y notas de voz sin conexión a la nube.
- Subtitulado de reuniones y entrevistas en inglés: el modelo transcribe audio mono a 16 kHz con un WER del 3,26 % en LibriSpeech test-clean, adecuado para generar actas automáticas en herramientas internas.
- Preprocesado de pipelines de NLP: conversión de grabaciones a texto antes de análisis de sentimiento, resumen o indexación de búsqueda, aprovechando el reducido tamaño del binario.
- Aplicaciones de accesibilidad: dictado por voz en tiempo casi real en hardware modesto, con latencia medida de RTF 22 en CPU Ryzen 4750U y 34,5 en Vulkan sobre el mismo equipo.
- Integración en herramientas CLI y scripts: el binario transcribe-cli permite procesar ficheros WAV en lote dentro de flujos de automatización sin dependencias de Python.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con licencia MIT, el audio no sale del dispositivo, lo que facilita el cumplimiento en sectores regulados.
- Prototipado rápido de ASR: los tres niveles de cuantización permiten ajustar el equilibrio entre tamaño (74-236 MB) y precisión (3,26-3,28 % WER) según las restricciones del entorno.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Referencia upstream |
|---|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 3,28 | 3,28 | 3,26 | 3,27 |
| RTF M4 Max (Metal) | no disponible | no disponible | 79,5 | no disponible |
| RTF M4 Max (CPU) | no disponible | no disponible | 80,5 | no disponible |
| RTF Ryzen 4750U (Vulkan) | no disponible | no disponible | 34,5 | no disponible |
| RTF Ryzen 4750U (CPU) | no disponible | no disponible | 22 | no disponible |

El WER se midió sobre la totalidad de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=194). La diferencia entre Q8_0 y F32 (0,02 puntos porcentuales) queda dentro del intervalo de confianza bootstrap del 95 % y se considera ruido. Los valores de RTF corresponden a las plataformas indicadas en la model card y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero Q8_0 ocupa 74 MB y el F32 236 MB.
- GPU recomendadas: no se requieren GPU; el modelo está diseñado para CPU y aceleración integrada (Metal en Apple Silicon, Vulkan en GPUs integradas o discretas).
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o superior, y en iGPUs con soporte Vulkan.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), y el modelo base es compatible con transformers mediante `MoonshineForConditionalGeneration`.
- Latencia y throughput: RTF de 79,5 (Metal) y 80,5 (CPU) en M4 Max; 34,5 (Vulkan) y 22 (CPU) en Ryzen 4750U. Un RTF superior a 1 implica procesamiento más rápido que tiempo real.
- Conversión de audio previa requerida: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| Moonshine Base (esta ficha) | 61,5 M | no disponible | inglés | 3,26-3,28 % | MIT | GGUF, safetensors |
| Moonshine Tiny | no disponible | no disponible | inglés | no disponible | MIT | safetensors, GGUF |
| Whisper Base | 74 M | 30 s fijo | multilingüe | no disponible en la información | MIT | safetensors, GGUF |
| Whisper Small | 244 M | 30 s fijo | multilingüe | no disponible en la información | MIT | safetensors, GGUF |

La comparación con Whisper se basa en características conocidas de la familia (tamaño y licencia); los valores de WER de Whisper no se han incluido por no estar disponibles en la información proporcionada. Moonshine Base se distingue por su procesamiento de audio crudo sin mel, su menor tamaño relativo y su soporte nativo en transcribe.cpp.

## Limitaciones y advertencias

- Solo admite inglés; no traduce ni detecta idioma.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado.
- No soporta streaming; requiere ficheros completos o segmentos cerrados.
- Riesgo de bucles de alucinación en silencios o audio ruidoso; la model card recomienda limitar la longitud generada (max_length=194) para mitigarlo.
- El WER de 3,26 % corresponde a LibriSpeech test-clean, un conjunto de lectura limpia; el rendimiento en audio real con ruido, acentos o solapamientos será peor y no está cuantificado en la información disponible.
- Licencia MIT heredada del modelo base, permisiva para uso comercial, pero sujeta a los términos del modelo original.
- La conversión GGUF es de un tercero (tryambientai) y las descargas apuntan a ficheros alojados en handy-computer/moonshine-base-gguf; conviene verificar la integridad y la procedencia antes de usarla en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- [Hugging Face: tryambientai/moonshine-base-gguf](https://huggingface.co/tryambientai/moonshine-base-gguf)
- [Modelo base: UsefulSensors/moonshine-base](https://huggingface.co/UsefulSensors/moonshine-base)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentación del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-base.md)
- [Commit de validación 07a8a84](https://github.com/handy-computer/transcribe.cpp/tree/07a8a84)
- [Paper de Moonshine (arXiv:2410.15608)](https://arxiv.org/abs/2410.15608)
- [Blog de presentación de Moonshine](https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/)
- [Repositorio oficial de Moonshine](https://github.com/usefulsensors/moonshine)
- [Model Cards for Model Reporting (Mitchell et al.)](https://arxiv.org/abs/1810.03993)
