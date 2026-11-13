# xix3r/voxix-moonshine-base-ar-gguf

## Resumen

voxix-moonshine-base-ar-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-base-ar, un sistema de reconocimiento automático del habla (ASR) para árabe desarrollado por Useful Sensors a partir de la arquitectura Moonshine. El modelo original es un transformer encoder-decoder de 61,5 millones de parámetros (aproximadamente 62M), diseñado para transcripción de audio en tiempo real con un coste computacional muy bajo. Esta versión GGUF la publica el usuario xix3r para su uso con transcribe.cpp, una implementación en C++ pensada para despliegue local y en dispositivos con recursos limitados.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y de licencia MIT para transcripción de árabe, un idioma con menos cobertura en herramientas ASR de código abierto que el inglés o el español. El modelo consume audio PCM crudo a 16 kHz mediante un stem convolucional de tres capas, sin STFT ni banco de filtros mel, lo que reduce el preprocesado y facilita su integración en pipelines embebidos. La conversión incluye tres cuantizaciones (F32, F16 y Q8_0) con una degradación de WER prácticamente nula respecto al modelo de referencia en fp32.

El repo tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,1 GB. La model card del autor incluye métricas de WER sobre FLEURS árabe y datos de rendimiento en tiempo real (RTF) sobre hardware Apple y AMD, lo que permite evaluar su viabilidad en producción sin necesidad de ejecutar pruebas adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine), stem Conv1d de 3 capas sin STFT ni mel |
| Parámetros totales | 61.513.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; max_length de decodificación = 192 tokens) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | árabe (ar) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine base, un transformer encoder-decoder de 62M parámetros orientado a ASR. La entrada es audio PCM crudo a 16 kHz procesado por un stem convolucional de tres capas Conv1d, que sustituye al preprocesado clásico basado en STFT y banco de filtros mel. La salida es únicamente texto transcrito, sin marcas de tiempo, sin detección de idioma y sin traducción. El modelo es monoidioma (árabe) y fue afinado por Useful Sensors sobre la base Moonshine; la model card original de Hugging Face está generada automáticamente y no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

La conversión GGUF se realizó a partir del commit upstream 264cc18 (fijado el 2026-05-12) y se validó contra la referencia de transformers en el commit 90bf720 de transcribe.cpp el 2026-05-12. La decodificación por defecto es greedy con num_beams=1 y max_length=192, coincidiendo con la generation_config original. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en árabe a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado espectral (sin STFT ni mel filterbank), lo que simplifica el pipeline de inferencia.
- Generación de transcripciones sin marcas de tiempo (timestamps: none).
- Sin detección automática de idioma (lang_detect: false): asume entrada en árabe.
- Sin traducción (translate: false): no convierte árabe a otro idioma.
- Sin soporte de streaming (streaming: false): procesa el audio completo por lotes.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No es multimodal más allá del audio de entrada; no procesa visión ni vídeo.

## Casos de uso

- Transcripción de reuniones y entrevistas en árabe: el modelo convierte grabaciones de audio mono a 16 kHz en texto plano, adecuado para actas y archivos documentales donde no se requieren marcas de tiempo.
- Subtitulado offline de contenido audiovisual en árabe: al no soportar streaming, se usa sobre fragmentos ya segmentados o sobre el archivo completo, con conversión previa a WAV 16 kHz mono mediante ffmpeg.
- Indexación y búsqueda de archivos de audio en árabe: la transcripción resultante alimenta motores de búsqueda o sistemas RAG para recuperar contenido hablado por texto.
- Asistentes de voz embebidos en dispositivos de bajo consumo: con 62M parámetros y cuantización Q8_0 (74 MB), cabe en hardware modesto y puede ejecutarse en CPU o GPU integrada mediante transcribe.cpp.
- Documentación clínica o legal dictada en árabe: transcripción por lotes de notas de voz para su revisión y archivo, con la advertencia de que el WER del 24,5% exige revisión humana.
- Investigación en ASR para árabe: sirve como línea base ligera y de licencia MIT para comparar técnicas de cuantización o de adaptación al dominio sin coste de licencia.
- Prototipado de pipelines ASR en C++: la integración con transcribe.cpp permite incrustar el modelo en aplicaciones nativas sin dependencias de Python ni de frameworks de deep learning.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 | Referencia transformers F32 |
|---|---:|---:|---:|---:|
| WER FLEURS ar test (428 utterances) | 24,45% | 24,45% | 24,50% | 24,51% |
| RTF Apple M4 Max (Metal) | no disponible | no disponible | 79,5 | no disponible |
| RTF Apple M4 Max (CPU) | no disponible | no disponible | 80,5 | no disponible |
| RTF Ryzen 4750U (Vulkan) | no disponible | no disponible | 34,5 | no disponible |
| RTF Ryzen 4750U (CPU) | no disponible | no disponible | 22 | no disponible |

El WER se midió con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). La referencia en transformers se ejecutó en fp32 sobre MPS. Las cifras de RTF corresponden a la cuantización Q8_0 según la model card; no se publican RTF para F32 ni F16.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones. F32 ocupa 236 MB, F16 126 MB y Q8_0 74 MB en disco; el consumo en memoria es del mismo orden.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU y en GPUs integradas; se han validado Metal en Apple M4 Max y Vulkan en AMD Ryzen 4750U.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: transcribe.cpp (CLI y librería C++). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 79,5 en Metal (M4 Max), 80,5 en CPU (M4 Max), 34,5 en Vulkan (Ryzen 4750U) y 22 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real; los valores publicados sugieren un margen amplio, aunque la model card no aclara la unidad exacta ni el tamaño de audio de prueba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|
| voxix-moonshine-base-ar-gguf | 61,5M | audio 16 kHz, max_length 192 | árabe | MIT | GGUF |
| UsefulSensors/moonshine-base-ar | 61,5M | audio 16 kHz | árabe | MIT | safetensors (transformers) |
| Whisper base | 74M | audio 16 kHz, ventana de 30 s | multilingüe | MIT | safetensors, GGUF |
| Whisper small | 244M | audio 16 kHz, ventana de 30 s | multilingüe | MIT | safetensors, GGUF |

No se dispone de cifras de WER comparables de Whisper base o small sobre FLEURS árabe en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento. La ventaja principal de este modelo frente a Whisper es su menor tamaño y la ausencia de preprocesado mel, junto con la licencia MIT; su desventaja es la ausencia de multilingüismo, marcas de tiempo y streaming.

## Limitaciones y advertencias

- WER del 24,5% en FLEURS árabe: es un error elevado para producción sin revisión humana, especialmente en dominios con vocabulario técnico o acentos no representados.
- Modelo monoidioma: no detecta idioma ni traduce; audio en otro idioma producirá transcripciones incorrectas o vacías.
- Sin marcas de tiempo: no apto para subtitulado sincronizado ni para alineación temporal sin un paso posterior.
- Sin streaming: requiere el audio completo o segmentos predefinidos, lo que añade latencia en aplicaciones en vivo.
- Model card upstream generada automáticamente: no se documentan sesgos, composición del dataset ni procedencia de los datos de entrenamiento, lo que dificulta evaluar sesgos dialectales o de género.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada; la decodificación greedy sin beams puede amplificar errores.
- Licencia MIT permite uso comercial, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo base original.
- Repo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de mantenimiento continuado por parte del autor de la conversión.
- La cuantización Q8_0 introduce una deriva de WER de hasta 0,1 puntos porcentuales respecto a F16, aceptable pero no nula.

## Enlaces

- Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-base-ar-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-ar
- Commit upstream fijado: https://huggingface.co/UsefulSensors/moonshine-base-ar/commit/264cc18
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-ar-gguf/resolve/main/moonshine-base-ar-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-ar-gguf/resolve/main/moonshine-base-ar-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-ar-gguf/resolve/main/moonshine-base-ar-Q8_0.gguf
- Paper de referencia citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
