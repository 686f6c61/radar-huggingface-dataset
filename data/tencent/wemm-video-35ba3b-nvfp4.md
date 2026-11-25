# tencent/WeMM-Video-35BA3B-NVFP4

## Resumen

WeMM-Video-35BA3B-NVFP4 es la variante cuantizada en NVFP4 (W4A16) del modelo multimodal WeMM-Video-35B-A3B, desarrollado por Tencent. Se trata de una familia bilingüe chino-inglés orientada a la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo como entrada y genera respuestas en texto. El checkpoint que nos ocupa es una versión de pesos cuantizados pensada para servir el modelo con vLLM parcheado y el backend Marlin, reduciendo el espacio de pesos a unos 24,11 GiB.

La arquitectura combina codificadores de visión y audio que convierten el material multimedia en tokens que el modelo de lenguaje procesa junto al texto, con marcas de tiempo en los fotogramas de vídeo. El modelo base se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó con técnicas de multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. El checkpoint declara 36.177.564.536 parámetros totales en safetensors y una ventana de contexto de servicio de 8.192 tokens según la receta de despliegue.

Su relevancia actual radica en que ofrece comprensión audiovisual conjunta (no solo vídeo silencioso) en un tamaño de 35B con licencia Apache 2.0 y una ruta de cuantización NVFP4 de 4 bits para pesos de expertos, lo que facilita el despliegue en GPUs con soporte de FP4 (arquitecturas SM120). Es, por tanto, una opción a considerar para pipelines de análisis de vídeo con banda sonora en entornos de producción con hardware moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); codificadores separados de visión y audio que alimentan tokens al modelo de lenguaje |
| Parametros totales | 36.177.564.536 |
| Parametros activos | 3B (según la nomenclatura A3B del modelo base) |
| Longitud de contexto | 8.192 tokens (configuración de servicio `--max-model-len 8192` en la receta oficial) |
| Tipos de cuantizacion | NVFP4 W4A16 (grupo 16) en pesos de expertos enrutados y compartidos; activaciones en BF16; resto de tensores en precisión original |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ModelOpt `MIXED_PRECISION`), 8 bits declarados en metadatos; ~24,11 GiB de pesos, repo de 25,9 GB |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y audio independientes transforman imágenes, vídeo y pistas de audio en tokens que el modelo de lenguaje procesa junto a los tokens de texto. Los fotogramas de vídeo incorporan marcas de tiempo, lo que permite razonar sobre la secuencia temporal. La nomenclatura A3B indica una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos sobre un total de 36.177 millones.

El preentrenamiento se realizó sobre aproximadamente 1,2 billones de tokens multimodales. El postentrenamiento incluyó multi-teacher OPD, MrDPO (una variante de DPO orientada a mitigar repeticiones) y aprendizaje por refuerzo con especialistas. La variante NVFP4 cuantiza únicamente los pesos feed-forward de expertos enrutados y compartidos con NVFP4 de grupo 16, manteniendo las activaciones en BF16 y el resto de tensores (atención, normalizaciones) en su precisión original; el manifiesto de cuantización del repositorio detalla el alcance por tensor y las comprobaciones de exportación.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la banda sonora original para describir eventos, transcribir habla y razonar sobre lo visto y lo escuchado.
- Procesamiento de vídeo silencioso, audio independiente, imágenes y texto como entradas independientes.
- Generación de texto en inglés y chino.
- Modo Thinking opcional (`enable_thinking=True`) además del modo Instruct por defecto.
- Control de muestreo de vídeo mediante `fps`, `min_frames`, `max_frames` y `total_pixels` en la petición.
- API compatible con OpenAI Chat Completions a través de vLLM, con entrada de medios en línea (`image_url`, `audio_url`, `video_url`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Análisis de vídeo con audio para moderación de contenido: el modelo puede describir eventos y transcribir el habla de un clip en una sola pasada, lo que permite clasificar material audiovisual con una única llamada en lugar de encadenar ASR y análisis de vídeo por separado.
- Transcripción y comprensión de reuniones o clases grabadas: con vídeo y pista de audio conjuntos, el modelo puede resumir lo dicho y relacionarlo con lo mostrado en pantalla, útil para generar actas enriquecidas.
- Indexación y búsqueda semántica de archivos audiovisuales: generar descripciones textuales de clips (con marcas de tiempo en los fotogramas) para alimentar un índice de búsqueda sobre una videoteca.
- Accesibilidad: generación de descripciones de escenas y subtitulado asistido para contenido en inglés o chino, combinando la información visual y sonora.
- Análisis de audio independiente: clasificación y descripción de fragmentos de audio (por ejemplo, para detectar contenido relevante en un archivo de llamadas o podcasts) sin necesidad de vídeo.
- Asistencia sobre imágenes y texto en flujos de documentación técnica: el modelo acepta imágenes y texto y responde en inglés o chino, adecuado para tareas de descripción de capturas o diagramas en entornos bilingües.
- Despliegue en infraestructura con GPUs SM120: la variante NVFP4 reduce los pesos a ~24,11 GiB y está pensada para servirse con vLLM 0.31.0 parcheado y backend Marlin, lo que encaja en clústeres con ese perfil de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 ocupan aproximadamente 24,11 GiB; a ello hay que sumar el coste de las activaciones en BF16, la caché KV y los buffers de los codificadores de visión y audio, por lo que se recomienda holgura por encima de los 24 GiB (no se especifica una cifra total en la información disponible).
- GPU recomendadas: la configuración de referencia es SM120 con vLLM 0.31.0 parcheado, ModelOpt Mixed Precision y backend Marlin; requiere hardware con soporte de NVFP4.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo en la información disponible; el requisito de soporte FP4 y el backend Marlin limitan los modelos válidos.
- Opciones de despliegue: vLLM 0.31.0 parcheado con el parche de runtime de WeMM (obligatorio); el checkpoint no carga directamente en Transformers (para ello debe usarse el checkpoint BF16 del modelo base). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Configuración de servicio de referencia: `--max-model-len 8192`, `--max-num-seqs 1`, `--max-num-batched-tokens 8192`, `--limit-mm-per-prompt '{"image":4,"video":2,"audio":2}'`, muestreo de vídeo a 2 fps con 4-16 fotogramas y `total_pixels` 262144.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, la alternativa directa es el propio checkpoint BF16 del mismo modelo:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Carga en Transformers |
|---|---|---|---|---|---|
| WeMM-Video-35BA3B-NVFP4 | 36.177.564.536 | 8.192 (servicio) | NVFP4 W4A16 | Apache 2.0 | No (requiere vLLM parcheado) |
| WeMM-Video-35BA3B (BF16) | no disponible | no disponible | BF16 | Apache 2.0 | Sí |

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se documentan otros idiomas.
- La ventana de contexto configurada en la receta oficial es de 8.192 tokens, relativamente corta para documentos o vídeos largos.
- El checkpoint NVFP4 no es cargable directamente en Transformers: exige vLLM 0.31.0 parcheado con el parche de WeMM y el backend Marlin, lo que añade complejidad operativa y ata el despliegue a una versión concreta.
- La configuración de referencia limita a una secuencia por lote (`--max-num-seqs 1`), lo que restringe el throughput en producción.
- El muestreo de vídeo está acotado (2 fps, 4-16 fotogramas, 262144 píxeles totales) en la receta publicada; clips largos o de alta densidad visual pueden perder información.
- La cuantización NVFP4 afecta a los pesos de expertos; aunque el resto de tensores conserva su precisión, puede haber degradación respecto al checkpoint BF16 (no se publican métricas comparativas).
- Riesgo de alucinación inherente a los modelos de lenguaje multimodales: las descripciones de escenas o transcripciones pueden contener errores, especialmente con audio de baja calidad.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con datos web multilingües es previsible que herede sesgos de esos corpus.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del runtime parcheado y los términos del modelo base.

## Enlaces

- [Hugging Face: tencent/WeMM-Video-35BA3B-NVFP4](https://huggingface.co/tencent/WeMM-Video-35BA3B-NVFP4)
- [Modelo base BF16: tencent/WeMM-Video-35BA3B](https://huggingface.co/tencent/WeMM-Video-35BA3B)
- [Colección WeMM-Video en Hugging Face](https://huggingface.co/collections/tencent/wemm-video)
- [Informe técnico (arXiv:2611.26409)](https://arxiv.org/abs/2611.26409)
- [Paper en Hugging Face](https://huggingface.co/papers/2611.26409)
- [Repositorio GitHub: Tencent/WeMM-Video](https://github.com/Tencent/WeMM-Video)
- [Guía de servicio](https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md)
- [Instalación manual del parche de runtime](https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md#manual-install-and-patch)
- [Visión general del proyecto](https://github.com/Tencent/WeMM-Video#overview)
