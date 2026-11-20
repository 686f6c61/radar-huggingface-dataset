# tencent/WeMM-Video-4B-NVFP4

## Resumen

WeMM-Video-4B-NVFP4 es la variante cuantizada en NVFP4 (W4A16) del modelo multimodal WeMM-Video-4B desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés orientado a la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo como entrada y genera respuestas textuales. La familia WeMM-Video está pensada para tareas que combinan lo que se ve con lo que se oye, como describir eventos a partir de fotogramas y banda sonora, transcribir voz o razonar sobre contenido audiovisual.

El checkpoint aquí descrito no es un modelo nuevo, sino una exportación cuantizada del modelo base `tencent/WeMM-Video-4B`. Los pesos de las capas feed-forward del modelo de lenguaje se comprimen a NVFP4 con grupos de 16, mientras que las activaciones se mantienen en BF16 y el resto de tensores (atención, normalizaciones) conservan su precisión original. El resultado son aproximadamente 7,42 GiB de pesos, lo que reduce de forma notable los requisitos de memoria frente al checkpoint BF16.

La relevancia de esta variante es fundamentalmente de despliegue: permite servir un modelo audiovisual de 5.611.749.896 parámetros totales en hardware más modesto, a costa de requerir un runtime específico (vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin). La licencia es Apache 2.0 y el modelo está publicado en Hugging Face bajo el identificador `tencent/WeMM-Video-4B-NVFP4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de visión y audio separados que alimentan tokens al modelo de lenguaje (tag `qwen3_5`); pesos feed-forward cuantizados en NVFP4 |
| Parametros totales | 5.611.749.896 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | NVFP4 W4A16 (grupo 16 en pesos feed-forward del LLM; activaciones en BF16; atención y normas en precisión original) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ModelOpt `MIXED_PRECISION`) |

## Arquitectura y entrenamiento

WeMM-Video combina codificadores de visión y de audio que convierten los medios en tokens, los cuales el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. La familia fue preentrenada con aproximadamente 1,2 billones de tokens multimodales y posteriormente sometida a un post-entrenamiento que incluye multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo con especialistas.

Esta variante concreta aplica cuantización NVFP4 de grupo 16 únicamente a los pesos feed-forward del modelo de lenguaje, manteniendo las activaciones en BF16 y el resto de tensores (incluidos pesos de atención y normalizaciones) en su precisión de origen. El manifiesto de cuantización (`quantization_manifest.json`) documenta el alcance por tensor y las comprobaciones de exportación. El checkpoint emplea el formato `MIXED_PRECISION` de ModelOpt, por lo que no carga directamente en Transformers sin el runtime adecuado; para ello existe el checkpoint BF16 correspondiente.

## Capacidades

- Comprensión audiovisual conjunta: describe eventos combinando fotogramas de vídeo y banda sonora original.
- Transcripción de voz a partir del audio del vídeo o de audio independiente.
- Razonamiento sobre lo visto y lo oído de forma integrada.
- Procesamiento de vídeo sin audio (silencioso), audio suelto, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo Thinking opcional mediante `chat_template_kwargs.enable_thinking=true`.
- Entrada de vídeo configurable con control de `fps`, `min_frames`, `max_frames` y `total_pixels` por petición.
- API compatible con OpenAI Chat Completions a través del servidor vLLM parcheado (contenido `image_url`, `audio_url`, `video_url`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de vídeo con audio: el modelo recibe fotogramas con marcas temporales y la pista de sonido para generar resúmenes de eventos, útil en catalogación de archivos audiovisuales y generación de metadatos.
- Transcripción y subtitulado: al aceptar audio independiente o la banda sonora del vídeo, puede generar transcripciones en chino o inglés para pipelines de subtitulado.
- Moderación y análisis de contenido audiovisual: combinando lo que se ve y lo que se oye, permite detectar incoherencias o contenido sensible en clips, con control de muestreo de fotogramas por petición.
- Asistentes de accesibilidad: descripción de escenas y audio para usuarios con discapacidad visual o auditiva, aprovechando la capacidad de razonar sobre imagen, vídeo y sonido.
- Análisis de reuniones y clases grabadas: procesamiento de vídeo con audio para extraer temas, transcribir intervenciones y resumir, con el modo Thinking activable para razonamiento más elaborado.
- Búsqueda y enriquecimiento de archivos multimedia: generación de descripciones textuales indexables a partir de vídeo, audio e imagen para motores de búsqueda internos.
- Despliegue en hardware limitado: gracias a la cuantización NVFP4 (≈7,42 GiB de pesos), permite servir el modelo en GPUs con menos memoria que las necesarias para el checkpoint BF16, siempre con el runtime vLLM parcheado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta una validación funcional: vLLM 0.31.0 parcheado cargó y ejecutó los pesos de referencia con ModelOpt Mixed Precision y Marlin, cubriendo cinco comprobaciones de generación (texto, imagen, audio, vídeo silencioso y vídeo con banda sonora). No se aportan métricas cuantitativas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 7,42 GiB; a ello hay que sumar el coste de activaciones BF16, caché KV y procesadores multimodales, por lo que el total supera los pesos solos (cifra exacta de VRAM total no disponible).
- GPU recomendadas: la configuración de referencia del autor es SM120 (arquitectura Blackwell) con Marlin; el backend de atención indicado es FLASH_ATTN v2.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el requisito de SM120 y el runtime parcheado limitan los entornos validados.
- Opciones de despliegue: vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin (única vía documentada para estos pesos). El checkpoint BF16 equivalente sí dispone de ejemplo directo de carga en Transformers. No se documenta soporte de llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput estimados: no disponible. El ejemplo de servicio fija `--max-num-seqs 1` y `--max-num-batched-tokens 8192`, lo que sugiere una configuración conservadora de una sola secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Video-4B-NVFP4 (este) | 5.611.749.896 | no disponible (ejemplo a 8192) | texto, imagen, audio, vídeo | Apache 2.0 | safetensors NVFP4 W4A16 |
| WeMM-Video-4B (BF16) | no disponible | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | safetensors BF16 |
| Otros modelos audiovisuales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar esta variante con su modelo base BF16: misma familia y licencia, pero menor huella de pesos (≈7,42 GiB frente al checkpoint completo) y requisito de runtime específico. No se dispone de datos de benchmarks ni de especificaciones de terceros comparables en la información disponible.

## Limitaciones y advertencias

- Requiere un runtime específico: vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin; no carga directamente en Transformers sin adaptación.
- Configuración de referencia validada en SM120; el comportamiento en otras arquitecturas de GPU no está documentado.
- Solo soporta inglés y chino; no se documenta cobertura de otros idiomas.
- Longitud de contexto no especificada en la model card; el ejemplo de servicio limita a 8192 tokens.
- La cuantización NVFP4 puede introducir degradación de calidad frente al checkpoint BF16; no se publican métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad en tareas audiovisuales.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero los componentes de terceros quedan sujetos a sus propios términos (ver atribución en el repositorio del proyecto).
- El modo Thinking está desactivado por defecto (plantilla en modo Instruct); debe activarse explícitamente.
- El ejemplo de servicio desactiva la caché de prefijos y limita a una secuencia concurrente, lo que condiciona el throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B-NVFP4
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Video-4B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Colección de modelos WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Guía de servicio (perfiles de runtime, NVFP4): https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Manifiesto de cuantización: https://huggingface.co/tencent/WeMM-Video-4B-NVFP4/blob/main/quantization_manifest.json
- Licencia del proyecto y atribución de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
