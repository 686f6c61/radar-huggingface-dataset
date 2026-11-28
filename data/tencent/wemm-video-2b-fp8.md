# tencent/WeMM-Video-2B-FP8

## Resumen

WeMM-Video-2B-FP8 es la variante cuantizada en FP8 del modelo WeMM-Video-2B, desarrollado por Tencent. Se trata de una familia bilingüe chino-inglés orientada a la comprensión y el razonamiento conjunto de audio y vídeo. El modelo acepta texto, imágenes, audio y vídeo como entradas y genera respuestas en texto, combinando los fotogramas de vídeo con su banda sonora original para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye.

Arquitectónicamente, el modelo integra codificadores de visión y audio que convierten los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo llevan marcas temporales. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales y después se ajustó con multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. El checkpoint contiene 3.283.624.264 parámetros reales según los safetensors y ocupa 5,2 GB en el repositorio.

Esta variante FP8 cuantiza determinados pesos lineales del modelo de lenguaje en E4M3FN con bloques de 128 × 128 y escalado dinámico de activaciones por token en grupos de 128, mientras que los codificadores de medios y los tensores protegidos del lenguaje conservan su precisión original. Está pensada para despliegue en GPUs con soporte FP8 mediante una versión parcheada de vLLM 0.18.0, lo que reduce los requisitos de memoria frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores separados de visión y audio que alimentan tokens de medios al modelo de lenguaje (etiqueta de arquitectura: qwen3_5) |
| Parametros totales | 3.283.624.264 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | FP8 E4M3FN en bloques de 128 × 128 con escalado dinámico de activaciones por token en grupos de 128; codificadores de medios y tensores protegidos en precisión original |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4,84 GiB de archivos de pesos; repositorio de 5,2 GB) |

## Arquitectura y entrenamiento

WeMM-Video sigue una arquitectura multimodal en la que codificadores de visión y audio independientes transforman los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. El modelo acepta vídeo con y sin banda sonora, audio independiente, imágenes y texto.

El preentrenamiento se realizó sobre aproximadamente 1,2 billones de tokens multimodales. La fase de post-entrenamiento combinó multi-teacher OPD (destilación desde múltiples profesores), MrDPO anti-repetición y aprendizaje por refuerzo con especialistas. La variante FP8 aplica cuantización de bloques de 128 × 128 en E4M3FN sobre pesos lineales seleccionados del modelo de lenguaje, con escalado dinámico de activaciones por token en grupos de 128, manteniendo los codificadores de medios y los tensores protegidos en su precisión de origen. El manifiesto de cuantización (`quantization_manifest.json`) documenta el alcance de los tensores y las comprobaciones de exportación.

## Capacidades

- Comprensión conjunta de audio y vídeo: describe eventos combinando fotogramas y banda sonora.
- Transcripción de voz presente en el audio o en la pista sonora del vídeo.
- Razonamiento sobre lo que se ve y se oye de forma simultánea.
- Procesamiento de vídeo silencioso (solo fotogramas) y de audio independiente.
- Comprensión de imágenes y generación de texto a partir de ellas.
- Generación de texto y razonamiento general en inglés y chino.
- Modo de pensamiento (thinking) controlable mediante `enable_thinking` en la plantilla de chat.
- Entrada multimodal combinada en un mismo mensaje (elemento de medios antes del texto).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar la pista de audio junto con los fotogramas para transcribir intervenciones y asociarlas a los hablantes visibles, aprovechando su capacidad de combinar audio y vídeo con marcas temporales.
- Moderación de contenido audiovisual: permite describir y razonar sobre lo que ocurre en un clip (acciones, objetos, diálogos) para clasificar o revisar material subido por usuarios.
- Accesibilidad: generación de descripciones de vídeo y subtitulado automático a partir de la banda sonora, útil para crear pistas descriptivas para personas con discapacidad auditiva o visual.
- Indexación y búsqueda de archivos multimedia: extracción de descripciones textuales de vídeos y audios para alimentar motores de búsqueda o sistemas de recomendación.
- Análisis de contenido en redes sociales: procesamiento de clips cortos con audio para detectar temas, tono o eventos relevantes en flujos de moderación y analítica.
- Asistencia en entornos educativos: descripción y explicación de vídeos didácticos, con transcripción de la narración y resumen del contenido visual.
- Procesamiento de audio independiente: transcripción y análisis de grabaciones de voz o reuniones cuando no hay vídeo disponible.
- Despliegue en producción con vLLM: el checkpoint FP8 está pensado para servirse con vLLM 0.18.0 parcheado en GPUs con soporte FP8, con límites configurables de elementos multimedia por prompt (4 imágenes, 2 vídeos, 2 audios en el ejemplo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan 4,84 GiB; el repositorio completo son 5,2 GB. A ello hay que sumar la memoria de activaciones, caché KV y codificadores de medios en su precisión original, por lo que el consumo total será superior al tamaño de los pesos.
- El checkpoint se validó con carga completa de pesos y generación en una única NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129.
- Para servicio con vLLM se requiere una GPU con soporte FP8 y la versión parcheada de vLLM 0.18.0.
- Cabe en GPU de consumo: no disponible en la información proporcionada (no se especifican modelos concretos de consumo).
- Opciones de despliegue: Transformers (con `trust_remote_code=True`) y vLLM 0.18.0 parcheado. El ejemplo de vLLM usa `--dtype bfloat16`, `--max-model-len 8192`, `--no-enable-prefix-caching` y `--mamba-ssm-cache-dtype float32`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| WeMM-Video-2B-FP8 | 3.283.624.264 | no disponible | apache-2.0 | en, zh |
| WeMM-Video-2B (base) | no disponible | no disponible | apache-2.0 | en, zh |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al describir contenido audiovisual ambiguo o de baja calidad.
- La cuantización FP8 puede introducir degradación de precisión respecto al modelo base en determinadas tareas; los codificadores de medios y los tensores protegidos se mantienen en precisión original para mitigarlo.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del autor del modelo.
- El servicio con vLLM requiere una versión parcheada específica (0.18.0) y una GPU con soporte FP8; no funciona con instalaciones estándar sin el parche.
- El ejemplo de servicio desactiva la caché de prefijos (`--no-enable-prefix-caching`) y fija la caché SSM en float32, lo que condiciona el rendimiento y el consumo de memoria.
- Los límites de elementos multimedia por prompt deben configurarse explícitamente; el ejemplo fija 4 imágenes, 2 vídeos y 2 audios.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los codificadores de medios incluidos.
- No se han publicado benchmarks en la información disponible, por lo que no es posible validar el rendimiento frente a alternativas.

## Enlaces

- [Hugging Face: tencent/WeMM-Video-2B-FP8](https://huggingface.co/tencent/WeMM-Video-2B-FP8)
- [Modelo base: tencent/WeMM-Video-2B](https://huggingface.co/tencent/WeMM-Video-2B)
- [Colección WeMM-Video en Hugging Face](https://huggingface.co/collections/tencent/wemm-video)
- [Informe técnico (arXiv 2611.26409)](https://arxiv.org/abs/2611.26409)
- [Página del paper en Hugging Face](https://huggingface.co/papers/2611.26409)
- [Repositorio GitHub: Tencent/WeMM-Video](https://github.com/Tencent/WeMM-Video)
- [Guía de servicio (serving.md)](https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md)
- [Instalación y parche del runtime](https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md)
