# tencent/WeMM-Video-9B-FP8

## Resumen

WeMM-Video-9B-FP8 es la variante cuantizada en FP8 del modelo multimodal WeMM-Video-9B, desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés especializado en comprensión y razonamiento audiovisual conjunto: acepta texto, imágenes, audio y vídeo (con o sin pista de sonido) y genera respuestas en texto. La arquitectura combina codificadores de visión y audio independientes que convierten los medios en tokens, los cuales se procesan junto al texto dentro de un modelo de lenguaje de tipo Qwen3.5 con soporte de atención lineal y SSM.

El modelo parte de un preentrenamiento de aproximadamente 1,2 billones de tokens multimodales y un post-entrenamiento con múltiples técnicas (multi-teacher OPD, anti-repetición MrDPO y aprendizaje por refuerzo especializado). Esta versión FP8 reduce el peso de los ficheros a 13,10 GiB manteniendo los codificadores de medios en su precisión original, lo que facilita el despliegue en GPUs con soporte FP8.

Es relevante porque cubre una tarea poco frecuente en modelos abiertos: razonar de forma conjunta sobre lo que se ve y lo que se oye en un vídeo, incluyendo transcripción de voz y descripción de eventos sincronizados. La licencia Apache 2.0 y el soporte de vLLM parcheado lo hacen apto tanto para investigación como para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5) con codificadores de visión y audio separados; atención lineal y SSM |
| Parámetros totales | 10.488.603.384 (10,49 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `max-model-len 8192`) |
| Tipos de cuantización | FP8 E4M3FN en bloques 128 × 128 con escalado dinámico de activaciones por token en grupos de 128; codificadores de medios y tensores protegidos en precisión original |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 Block128), 13,10 GiB de ficheros de pesos; repositorio de 14,1 GB |

## Arquitectura y entrenamiento

WeMM-Video sigue una arquitectura multimodal en la que codificadores de visión y audio transforman los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas temporales (timestamps), lo que permite razonar sobre la secuencia temporal de eventos. El modelo base es de tipo Qwen3.5 e incluye componentes de atención lineal y SSM (el comando de servicio de vLLM incluye `--mamba-ssm-cache-dtype float32`), lo que sugiere un diseño híbrido orientado a eficiencia en contextos largos.

El preentrenamiento se realizó sobre aproximadamente 1,2 billones de tokens multimodales. El post-entrenamiento combinó multi-teacher OPD (destilación desde múltiples profesores), MrDPO con mecanismo anti-repetición y aprendizaje por refuerzo con especialistas. La cuantización FP8 afecta únicamente a determinados pesos lineales del modelo de lenguaje; los codificadores de medios y los tensores protegidos conservan su precisión original, y existe un manifiesto de cuantización (`quantization_manifest.json`) con el alcance exacto de tensores y las comprobaciones de exportación.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la pista de sonido original para describir eventos, transcribir habla y razonar sobre lo visto y lo oído.
- Entrada de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Procesamiento de vídeo con marcas temporales por fotograma.
- Modo de razonamiento configurable (`enable_thinking` en la plantilla de chat).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Despliegue servido con API compatible con OpenAI (endpoint de chat) mediante vLLM parcheado.

## Casos de uso

- Transcripción y análisis de reuniones en vídeo: el modelo recibe el vídeo con su pista de audio y puede transcribir el habla mientras describe elementos visuales (pizarras, presentaciones), útil para generar actas enriquecidas en inglés o chino.
- Moderación de contenido audiovisual: análisis conjunto de imagen y sonido para detectar escenas o discursos inapropiados, aprovechando que procesa vídeo y audio en una sola pasada.
- Accesibilidad: generación de descripciones y subtítulos para vídeos, combinando la transcripción del audio con la descripción de lo que ocurre en pantalla.
- Análisis de contenido multimedia para medios y streaming: indexación semántica de clips mediante descripciones que integran lo visual y lo sonoro, con marcas temporales por fotograma.
- Asistentes de atención al cliente con soporte de vídeo: un usuario puede enviar un clip mostrando un problema (por ejemplo, un producto que hace un ruido) y el modelo razona sobre imagen y sonido para orientar la respuesta.
- Investigación en modelos multimodales: base para experimentos de fusión audio-visual, evaluación de razonamiento temporal y comparación de variantes cuantizadas frente al modelo original.
- Procesamiento de audio independiente: transcripción o análisis de ficheros de voz sueltos en flujos donde no hay vídeo disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los ficheros: 13,10 GiB en FP8; el repositorio completo ocupa 14,1 GB.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de pesos FP8, se requiere previsiblemente una GPU con al menos 16-24 GB de VRAM para cargar el modelo, aunque no se especifica.
- GPU recomendadas: se requiere una GPU con soporte de FP8. La validación oficial de carga y generación se realizó en una NVIDIA L20.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada.
- Despliegue:
  - Transformers 5.2.0 con PyTorch 2.10.0+cu129 (carga directa con `AutoModelForImageTextToText` y `trust_remote_code=True`).
  - vLLM 0.18.0 parcheado (requiere instalar el parche de runtime del proyecto), con `--dtype bfloat16`, `--max-model-len 8192`, `--no-enable-prefix-caching` y `--mamba-ssm-cache-dtype float32`.
  - Límites multimodales por prompt en el ejemplo de servicio: imagen 4, vídeo 2, audio 2.
  - Configuración de vídeo en el ejemplo: `fps` 2, `min_frames` 4, `max_frames` 16, `total_pixels` 262144.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos multimodales de audio y vídeo.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se documentan tasas de error ni evaluaciones de fidelidad.
- Sesgos conocidos: no disponible en la información proporcionada.
- La longitud de contexto no se especifica; el ejemplo de servicio limita `max-model-len` a 8192, lo que puede restringir vídeos largos o conversaciones extensas.
- La cuantización FP8 puede introducir degradación frente al modelo original `tencent/WeMM-Video-9B`; no se publican métricas comparativas.
- Requiere código remoto (`trust_remote_code=True`) y un parche específico de vLLM 0.18.0 para servir el modelo, lo que añade complejidad operativa y dependencia de versiones concretas.
- El modelo base es de tipo Qwen3.5 con componentes SSM; el despliegue en otros motores de inferencia (llama.cpp, Ollama, TGI) no está documentado y podría no ser compatible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los codificadores de medios incluidos.
- El repositorio no registra descargas (0 en el momento de la consulta) y solo 1 like, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-FP8
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Manifiesto de cuantización: https://huggingface.co/tencent/WeMM-Video-9B-FP8/blob/main/quantization_manifest.json
