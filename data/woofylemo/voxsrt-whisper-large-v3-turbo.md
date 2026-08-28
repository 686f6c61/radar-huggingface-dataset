# WoofyLemo/VoxSRT-whisper-large-v3-turbo

## Resumen

VoxSRT Whisper large-v3-turbo es una conversión a formato CTranslate2 del modelo oficial `openai/whisper-large-v3-turbo`, publicada por WoofyLemo. El modelo está diseñado para su uso en VoxSRT, una aplicación de subtitulado en tiempo real que ejecuta transcripción de voz a texto de forma local. No se ha realizado ningún entrenamiento, fine-tuning o fusión adicional: los pesos oficiales se han convertido desde el layout de Transformers `safetensors` al layout CTranslate2 esperado por faster-whisper, manteniendo el tokenizador y los metadatos de preprocesado.

El modelo base, whisper-large-v3-turbo, es una versión podada de whisper-large-v3 con solo 4 capas de decodificación (frente a las 32 del original), lo que lo hace significativamente más rápido manteniendo una precisión alta en reconocimiento de voz multilingüe. Esta conversión permite desplegar el modelo en entornos locales con faster-whisper, optimizando el rendimiento en CPU y GPU sin depender de la nube. Su relevancia radica en que ofrece una alternativa ligera y eficiente para transcripción y traducción de audio en tiempo real, con licencia MIT y sin costes de API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | float16 (CTranslate2) |
| Idiomas soportados | multilingue (lista no especificada) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin) |

## Arquitectura y entrenamiento

El modelo es una conversión exacta de los pesos de `openai/whisper-large-v3-turbo` al formato CTranslate2, sin ninguna modificación en la arquitectura. El modelo original es un transformer encoder-decoder con 4 capas de decodificación, resultado de podar las 32 capas de whisper-large-v3. Esta reducción acelera la inferencia manteniendo la calidad del reconocimiento. El proceso de conversión se realizó con CTranslate2 4.8.1, Transformers 4.57.6 y Torch 2.13.0+cpu. No se aplicó ningún entrenamiento adicional ni fine-tuning; los pesos se convirtieron directamente y se preservaron el tokenizador y los metadatos de preprocesado. El repositorio incluye un `conversion-record.json` que documenta el inventario de archivos fuente y las versiones de las herramientas.

## Capacidades

- Transcripción de voz a texto en múltiples idiomas (el modelo base soporta 99 idiomas, aunque la conversión no especifica la lista).
- Traducción de audio a texto en inglés (función nativa de Whisper).
- Generación de subtítulos con marcas de tiempo, gracias a la salida de segmentos temporales.
- Inferencia local eficiente mediante faster-whisper, con soporte para CPU y GPU.
- Compatible con el pipeline `automatic-speech-recognition` de HuggingFace.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Subtitulado en tiempo real para reuniones virtuales: VoxSRT utiliza este modelo para transcribir la voz del micrófono y generar subtítulos en vivo, aprovechando la ventana de 30 segundos y la baja latencia del modelo turbo.
- Transcripción de podcasts y entrevistas: el modelo puede procesar audio largo mediante el algoritmo de chunking de faster-whisper, generando transcripciones completas con marcas de tiempo.
- Generación de subtítulos para vídeos: integrado en flujos de edición, convierte el audio de un vídeo en archivos SRT o VTT de forma local, sin enviar datos a la nube.
- Transcripción de llamadas y grabaciones de soporte: en entornos empresariales, se puede desplegar en un servidor interno para transcribir llamadas de atención al cliente, preservando la privacidad.
- Asistente de accesibilidad: para personas con discapacidad auditiva, el modelo permite mostrar subtítulos en tiempo real en presentaciones o eventos, ejecutándose en un ordenador personal.
- Traducción automática de audio: aunque la salida es en inglés, se puede combinar con un traductor posterior para generar subtítulos en otros idiomas, útil en producción de contenidos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que se realizó una prueba de humo en CPU que confirmó que faster-whisper podía cargar el paquete y producir una transcripción, pero no se proporcionan métricas de precisión, velocidad ni comparativas con otros modelos.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 1.6 GB en float16 (CTranslate2).
- VRAM estimada: no disponible, pero al ser float16, se espera que requiera menos de 2 GB de VRAM en GPU para inferencia básica (estimación orientativa).
- GPU recomendadas: no se especifican, pero modelos de gama media como RTX 3060 o superiores pueden ejecutarlo sin problemas. También funciona en CPU (según la prueba de humo).
- Opciones de despliegue: compatible con faster-whisper, que a su vez se integra con vLLM, llama.cpp (a través de CTranslate2) y otras herramientas. También puede usarse con el paquete `faster-whisper` directamente en Python.
- Latencia y throughput: no disponibles, pero al ser una versión turbo, se espera una inferencia más rápida que whisper-large-v3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| VoxSRT Whisper large-v3-turbo (este) | no disponible | 30 s audio | MIT | CTranslate2 |
| openai/whisper-large-v3-turbo | no disponible | 30 s audio | MIT | safetensors |
| openai/whisper-large-v3 | 1.55B (aprox.) | 30 s audio | MIT | safetensors |

La conversión es funcionalmente equivalente al modelo original en términos de capacidades, pero está optimizada para el runtime de faster-whisper. Comparado con whisper-large-v3, el turbo tiene menos capas de decodificación, lo que reduce la latencia a costa de una ligera pérdida de precisión en algunos idiomas, aunque no se dispone de datos cuantitativos.

## Limitaciones y advertencias

- La model card advierte que la conversión no ha sido evaluada en cuanto a calidad multilingüe, requisitos mínimos de hardware, rendimiento ni compatibilidad con entornos limpios.
- El modelo original de Whisper puede presentar alucinaciones en audio con silencios prolongados o ruido de fondo, generando texto inventado.
- No se garantiza una precisión uniforme en todos los idiomas; algunos pueden tener tasas de error más altas.
- La licencia MIT permite uso comercial, pero se deben respetar las licencias de los runtimes de terceros (CTranslate2, faster-whisper).
- El modelo está diseñado para audio de hasta 30 segundos por ventana; audios más largos requieren algoritmos de chunking que pueden introducir errores en los límites.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor de la conversión.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/WoofyLemo/VoxSRT-whisper-large-v3-turbo)
- [Modelo base openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Modelo openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [Documentación de Groq sobre Whisper Large v3 Turbo](https://console.groq.com/docs/model/whisper-large-v3-turbo)
- [Qualcomm AI Hub - Whisper-Large-V3-Turbo](https://aihub.qualcomm.com/models/whisper_large_v3_turbo)
- [Together AI - Whisper Large v3 Streaming](https://www.together.ai/models/whisper-large-v3-streaming)
