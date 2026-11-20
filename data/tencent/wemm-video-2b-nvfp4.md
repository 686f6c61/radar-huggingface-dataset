# tencent/WeMM-Video-2B-NVFP4

## Resumen

WeMM-Video-2B-NVFP4 es la variante cuantizada en NVFP4 (W4A16) del modelo multimodal WeMM-Video-2B desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés diseñado para comprensión y razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo como entradas y genera respuestas de texto. El modelo combina codificadores de visión y audio que convierten los medios en tokens que el modelo de lenguaje procesa junto con el texto, incorporando marcas temporales en los fotogramas de vídeo.

La relevancia de esta variante concreta reside en su cuantización NVFP4, que reduce el peso de los ficheros a 4,90 GiB (frente al checkpoint BF16 original) manteniendo las activaciones en BF16. Esto permite desplegar un modelo multimodal de 3.283 millones de parámetros totales en hardware más modesto, a costa de requerir un runtime específico: vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin (configuración de referencia SM120).

El modelo base fue preentrenado con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustado mediante multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo especializado. Está publicado bajo licencia Apache 2.0 y soporta modos Instruct y Thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal con codificadores de visión y audio separados que alimentan tokens al modelo de lenguaje (tag `qwen3_5`); pesos cuantizados NVFP4 W4A16 |
| Parametros totales | 3.283.624.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | NVFP4 W4A16 (grupo 16) en pesos feed-forward del LM; activaciones en BF16; pesos de atención y normas en precisión original |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ModelOpt `MIXED_PRECISION`) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y audio independientes transforman imágenes, vídeo y audio en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite razonar sobre la secuencia temporal de los eventos. El tag `qwen3_5` sugiere que el backbone lingüístico deriva de la familia Qwen 3.5, aunque no se detalla más en la información disponible.

El entrenamiento consta de un preentrenamiento con aproximadamente 1,2 billones de tokens multimodales, seguido de un post-entrenamiento con multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo especializado. En esta variante concreta, la cuantización NVFP4 se aplica únicamente a los pesos feed-forward del modelo de lenguaje con grupo 16, mientras que las activaciones permanecen en BF16 y otros tensores (atención, normas) conservan su precisión original. El checkpoint usa ModelOpt `MIXED_PRECISION` y requiere el runtime parcheado de vLLM con backend Marlin.

## Capacidades

- Comprensión conjunta de audio y vídeo: describe eventos combinando fotogramas y banda sonora original.
- Transcripción de voz presente en el audio del vídeo.
- Razonamiento sobre lo que se ve y se oye de forma simultánea.
- Acepta vídeo sin audio (silencioso), audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo Thinking opcional mediante `chat_template_kwargs.enable_thinking=True`; por defecto opera en modo Instruct.
- Procesamiento de vídeo con control de muestreo mediante `fps`, `min_frames`, `max_frames` y `total_pixels`.
- API compatible con OpenAI Chat Completions a través de vLLM, con soporte de `image_url`, `audio_url` y `video_url` (con `use_audio` configurable).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente en la información proporcionada (el modo Thinking está disponible).

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede transcribir el audio y, al mismo tiempo, describir lo que se muestra en pantalla (diapositivas, gestos), combinando ambas señales en un único resumen.
- Accesibilidad de contenido audiovisual: generación de descripciones enriquecidas para vídeos que incluyan tanto la narración como los elementos visuales relevantes, útil para subtitulado descriptivo.
- Moderación de contenido multimedia: revisión de vídeos con audio para detectar eventos visuales y verbales de forma conjunta, aprovechando la capacidad de procesar ambos canales en una sola pasada.
- Indexación y búsqueda de archivos de vídeo: extracción de descripciones y transcripciones estructuradas que alimenten un índice de búsqueda semántica sobre bibliotecas de vídeo.
- Análisis de contenido educativo o divulgativo: resumen de tutoriales y clases grabadas donde el audio explica y la imagen muestra procedimientos, permitiendo responder preguntas sobre el material.
- Asistentes de atención al cliente con soporte de vídeo: un usuario puede enviar un clip mostrando un problema (por ejemplo, un defecto en un producto) y el modelo describe lo observado y lo que se dice en el audio para guiar la resolución.
- Despliegue en hardware limitado: gracias a la cuantización NVFP4 (4,90 GiB de pesos) puede servirse en GPUs con menos memoria que el checkpoint BF16, manteniendo el pipeline multimodal completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: 4,90 GiB en NVFP4 W4A16, lo que reduce sustancialmente los requisitos de memoria frente al checkpoint BF16.
- VRAM estimada para inferencia: no disponible de forma oficial; además de los pesos hay que contabilizar el caché KV, el procesador multimodal y las activaciones en BF16. El ejemplo de servicio limita `--max-model-len 8192`, `--max-num-seqs 1` y `--max-num-batched-tokens 8192`, lo que sugiere un perfil de despliegue contenido.
- GPU recomendadas: la configuración de referencia es SM120 (arquitectura Blackwell) con backend Marlin; el soporte en otras arquitecturas no está confirmado en la información proporcionada.
- ¿Cabe en GPU consumer? No confirmado; el requisito de SM120 y del runtime parcheado limita el despliegue a GPUs compatibles con esa configuración.
- Opciones de despliegue: vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin (`--quantization modelopt_mixed --linear-backend marlin --moe-backend marlin`). El checkpoint BF16 correspondiente tiene un ejemplo de carga directa con Transformers; esta variante NVFP4 no.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Video-2B-NVFP4 (este) | 3.283 M | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | safetensors NVFP4 |
| WeMM-Video-2B (BF16) | 3.283 M | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | safetensors BF16 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje y multimodales; las descripciones de audio y vídeo deben validarse en aplicaciones críticas.
- La cuantización NVFP4 puede introducir degradación de calidad frente al checkpoint BF16 original; no se han publicado evaluaciones comparativas.
- Requiere un runtime específico (vLLM 0.31.0 parcheado) y configuración de referencia SM120 con Marlin; no es cargable directamente con Transformers, a diferencia del checkpoint BF16.
- El ejemplo de servicio restringe `--max-num-seqs 1` y desactiva el caché de prefijos, lo que limita el throughput en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero los componentes de terceros quedan sujetos a sus términos originales (ver atribución en el repositorio del proyecto).
- El modelo fue creado en noviembre de 2026 según los metadatos del repositorio; verificar la vigencia de las dependencias del runtime parcheado.

## Enlaces

- [Hugging Face: tencent/WeMM-Video-2B-NVFP4](https://huggingface.co/tencent/WeMM-Video-2B-NVFP4)
- [Modelo base BF16: tencent/WeMM-Video-2B](https://huggingface.co/tencent/WeMM-Video-2B)
- [Colección WeMM-Video en Hugging Face](https://huggingface.co/collections/tencent/wemm-video)
- [Repositorio del proyecto en GitHub](https://github.com/Tencent/WeMM-Video)
- [Guía de serving](https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md)
- [Instalación y parche del runtime](https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md)
- [Licencia y atribución de terceros](https://github.com/Tencent/WeMM-Video/blob/main/LICENSE)
