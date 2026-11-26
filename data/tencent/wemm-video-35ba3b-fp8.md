# tencent/WeMM-Video-35BA3B-FP8

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal bilingüe (chino-inglés) desarrollado por Tencent para comprensión y razonamiento conjunto de audio y vídeo. Acepta texto, imágenes, audio y vídeo como entradas, y genera respuestas en texto. La variante aquí descrita, FP8 Block128, es una versión cuantizada del checkpoint original `tencent/WeMM-Video-35BA3B`, publicada en Hugging Face con licencia Apache 2.0.

El modelo combina codificadores de visión y audio que convierten los medios en tokens, los cuales el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo llevan marcas temporales, lo que permite alinearlos con la pista de sonido original. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó con técnicas de destilación multi-profesor (OPD), DPO anti-repetición (MrDPO) y aprendizaje por refuerzo especializado.

Con 36.177.564.536 parámetros totales almacenados en safetensors (36,09 GiB de pesos), se trata de un modelo de tipo Mixture of Experts (MoE) con 3B de parámetros activos según su denominación. Su relevancia actual radica en que aborda la comprensión audiovisual conjunta —no solo vídeo silencioso— con soporte nativo de audio y marcas temporales, algo poco común en modelos abiertos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE en el modelo de lenguaje, codificadores separados de visión y audio |
| Parámetros totales | 36.177.564.536 |
| Parámetros activos | 3B (según denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (E4M3FN) con bloques 128×128 y escalado dinámico de activaciones por token en grupos de 128 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8 cuantizado) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores independientes de visión y audio transforman los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite el razonamiento conjunto sobre lo que se ve y lo que se oye. El componente de lenguaje es de tipo Mixture of Experts, con proyecciones de expertos enrutados cuantizadas a FP8.

El preentrenamiento utilizó aproximadamente 1,2 billones de tokens multimodales. El postentrenamiento combinó destilación multi-profesor (OPD), DPO anti-repetición (MrDPO) y aprendizaje por refuerzo con especialistas. La cuantización FP8 Block128 aplica E4M3FN a pesos lineales seleccionados del modelo de lenguaje (incluidos los expertos enrutados), con escalado dinámico por token en grupos de 128; los codificadores de medios y los tensores protegidos del modelo de lenguaje conservan su precisión original.

## Capacidades

- Comprensión audiovisual conjunta: descripción de eventos combinando fotogramas y banda sonora original.
- Transcripción de voz integrada en el análisis de vídeo.
- Razonamiento sobre lo visto y lo oído de forma simultánea.
- Entrada de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo de pensamiento (thinking) configurable mediante `enable_thinking` en la plantilla de chat.
- Procesamiento de vídeo con marcas temporales por fotograma.
- Inferencia con Transformers (validada en una NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129) y con vLLM 0.18.0 parcheado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de contenido audiovisual para moderación: el modelo puede procesar un clip con su pista de audio y describir eventos, transcribir diálogos y detectar contenido sensible combinando ambas modalidades.
- Generación de subtítulos y transcripciones sincronizadas: gracias a las marcas temporales de los fotogramas y a la entrada `video_audio`, puede alinear el habla con lo que ocurre en pantalla para producir subtítulos contextualizados.
- Accesibilidad: descripción automática de vídeos para personas con discapacidad visual, incluyendo información sobre sonidos relevantes de la banda sonora.
- Indexación y búsqueda semántica de archivos de vídeo: extraer descripciones y transcripciones estructuradas que alimenten un motor de búsqueda sobre grandes videotecas.
- Análisis de reuniones y clases grabadas: combinar la transcripción del audio con la interpretación de contenido visual (pizarras, diapositivas, gestos) para generar actas o resúmenes.
- Asistencia en producción de medios: revisión automática de material grabado para detectar problemas de audio, identificar escenas clave o generar metadatos descriptivos.
- Procesamiento por lotes en pipelines de datos: al ser un modelo MoE con 3B de parámetros activos y pesos FP8, puede desplegarse con vLLM parcheado para procesar grandes volúmenes de vídeo con un coste computacional relativamente contenido por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos: 36,09 GiB en FP8, por lo que se necesita al menos esa cantidad de VRAM para cargar el modelo completo en memoria de GPU.
- GPU con soporte FP8: imprescindible para aprovechar la cuantización (el runtime de referencia es vLLM 0.18.0 parcheado sobre una GPU con FP8). La validación con Transformers se realizó en una NVIDIA L20.
- GPU recomendadas: NVIDIA L20 (validada), así como GPUs con soporte FP8 como H100, H200 o L40S; no se especifican otras configuraciones.
- GPU de consumo: no disponible; el tamaño de pesos (más de 36 GiB) excede la VRAM de las GPUs de consumo habituales en su configuración completa.
- Opciones de despliegue: Transformers 5.2.0 con PyTorch 2.10.0+cu129 (con `trust_remote_code`), y vLLM 0.18.0 con el parche de runtime de WeMM. Se ofrecen perfiles de dependencias e imágenes Docker en la guía de serving del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos multimodales; las descripciones de audio o vídeo pueden contener detalles inventados, especialmente con material de baja calidad.
- La cuantización FP8 puede degradar ligeramente la precisión respecto al checkpoint original en bf16; los codificadores de medios conservan su precisión original, pero los pesos del modelo de lenguaje están cuantizados.
- Requiere `trust_remote_code=True` y código personalizado (`wemm_qwen3_5_moe`), lo que implica ejecutar código del autor del modelo.
- El despliegue en producción exige un parche específico de vLLM 0.18.0 y una GPU con soporte FP8; no es un modelo que funcione sin ajustes en stacks estándar.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del runtime parcheado y los términos de los componentes base.
- No se dispone de información sobre longitud de contexto máxima, lo que limita la planificación de cargas con vídeos largos.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B-FP8
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
