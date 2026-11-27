# tencent/WeMM-Video-9B-AWQ

## Resumen

WeMM-Video-9B-AWQ es la variante cuantizada en AWQ W4A16 del modelo WeMM-Video-9B, desarrollado por Tencent. Se trata de una familia multimodal bilingüe chino-inglés orientada a la comprensión y el razonamiento conjunto de audio y vídeo. El modelo acepta texto, imágenes, audio y vídeo como entradas, y genera respuestas de texto en inglés o chino. Su propuesta diferencial es la integración de la banda sonora original del vídeo junto con los fotogramas, lo que permite describir eventos, transcribir voz y razonar sobre lo que se ve y se oye en una misma pasada.

La arquitectura combina codificadores de visión y audio que convierten el material multimedia en tokens que el modelo de lenguaje procesa junto al texto; los fotogramas de vídeo incorporan marcas temporales. El modelo base se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó con técnicas de multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. Esta variante AWQ reduce el peso de los ficheros a 12,86 GiB aplicando INT4 de grupo 128 sobre las proyecciones feed-forward del modelo de lenguaje, mientras que las activaciones y los pesos de atención se mantienen en BF16.

La relevancia de esta versión cuantizada reside en que facilita el despliegue en hardware más modesto que el modelo completo, manteniendo la pila de inferencia sobre transformers y vLLM parcheado. Está pensada para escenarios de producción que requieren comprensión audiovisual conjunta, como análisis de vídeo con audio, transcripción contextual o asistentes multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal con codificadores de visión y audio separados que alimentan tokens al modelo de lenguaje; base qwen3_5 |
| Parametros totales | 10.488.603.384 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la receta de vLLM de ejemplo usa `--max-model-len 8192`) |
| Tipos de cuantizacion | AWQ W4A16 (INT4 grupo 128 en pesos feed-forward del modelo de lenguaje, formato compressed-tensors); activaciones y pesos de atención en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); 12,86 GiB de ficheros de pesos; repo de 13,8 GB |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y de audio independientes transforman el material de entrada en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo llevan asociadas marcas temporales, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó mediante multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo con especialistas, según la model card.

La variante AWQ aplica cuantización INT4 de grupo 128 en formato compressed-tensors sobre las proyecciones `gate`, `up` y `down` de las capas feed-forward del modelo de lenguaje (incluidos expertos y shared expert cuando aplica). Las activaciones y los pesos de atención permanecen en BF16. El cargador de transformers descomprime los tensores empaquetados a BF16 en memoria, por lo que es necesario presupuestar la memoria de los pesos descomprimidos. El checkpoint fue validado con carga completa y generación en una NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129, cubriendo texto, imagen, audio, fotogramas de vídeo y vídeo con banda sonora.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la banda sonora original para describir eventos, transcribir habla y razonar sobre lo que se ve y se oye.
- Procesamiento de vídeo silencioso, audio independiente, imágenes y texto como entradas individuales.
- Generación de respuestas en chino e inglés.
- Marcas temporales en los fotogramas de vídeo para razonamiento sobre secuencia temporal.
- Modo thinking opcional mediante `enable_thinking` en la plantilla de chat.
- Extracción de características (pipeline `feature-extraction` en los tags del modelo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: transcripción de habla y razonamiento sobre audio.

## Casos de uso

- Análisis de vídeo con audio para monitorización de medios: el modelo puede describir eventos combinando fotogramas y banda sonora, útil para catalogación automática de archivos audiovisuales o generación de metadatos.
- Transcripción contextual de reuniones y clases grabadas: al procesar vídeo con su pista de audio, transcribe el habla y la relaciona con lo que ocurre visualmente en cada momento.
- Accesibilidad audiovisual: generación de descripciones y subtítulos enriquecidos para contenido en chino o inglés, aprovechando la comprensión conjunta de imagen y sonido.
- Moderación de contenido multimedia: detección de eventos relevantes en vídeos combinando señales visuales y sonoras, con respuestas en texto para revisión humana.
- Asistentes multimodales bilingües: integración en interfaces conversacionales que reciben imágenes, audio o vídeo y responden en inglés o chino, con marcas temporales para referencias precisas.
- Análisis de audio independiente: transcripción y razonamiento sobre ficheros de voz sin necesidad de vídeo, útil en pipelines de atención al cliente o análisis de llamadas.
- Extracción de características multimedia: uso del modelo como extractor para tareas downstream que requieran representaciones conjuntas de audio y vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros de pesos AWQ ocupan 12,86 GiB; al cargar con transformers, los tensores feed-forward se descomprimen a BF16 en memoria, por lo que hay que presupuestar la memoria de los pesos descomprimidos, superior a la del checkpoint en disco.
- GPU validadas: el checkpoint pasó carga completa y generación en una NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129.
- GPU recomendadas: no disponible de forma explícita; por tamaño, se requiere una GPU con suficiente VRAM para los pesos descomprimidos y los codificadores de visión y audio.
- ¿Cabe en GPU consumer? No disponible en la información proporcionada.
- Despliegue: transformers con `compressed-tensors==0.13.0` y `trust_remote_code=True`; vLLM 0.18.0 parcheado con la configuración compressed-tensors del checkpoint (receta de ejemplo con `--max-model-len 8192`, `--no-enable-prefix-caching` y `--mamba-ssm-cache-dtype float32`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con modelos de la misma categoría. Como referencia estructural, esta variante AWQ se diferencia de su modelo base `tencent/WeMM-Video-9B` únicamente en la cuantización de los pesos feed-forward (INT4 grupo 128 frente a los pesos originales), manteniendo el mismo pipeline y capacidades.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| WeMM-Video-9B-AWQ | 10.488.603.384 | no disponible | AWQ W4A16 | apache-2.0 |
| WeMM-Video-9B (base) | no disponible | no disponible | sin cuantizar | apache-2.0 |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte para castellano ni otras lenguas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no documentado explícitamente en la model card; aplicable el riesgo habitual de los modelos generativos multimodales.
- La cuantización AWQ puede introducir degradación de calidad respecto al modelo base; no se publican métricas comparativas.
- El cargador de transformers descomprime los pesos a BF16 en memoria, lo que puede provocar picos de VRAM superiores al tamaño del checkpoint en disco.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del autor del modelo.
- El despliegue con vLLM exige una versión parcheada (0.18.0) y perfiles de dependencias específicos; no es un despliegue estándar sin ajustes.
- Restricciones de licencia para uso comercial: la licencia es apache-2.0, que permite uso comercial, pero conviene revisar los términos del modelo base y de los componentes de terceros.
- No se documentan límites de longitud de contexto ni de duración de vídeo o audio en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Hugging Face Paper: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
