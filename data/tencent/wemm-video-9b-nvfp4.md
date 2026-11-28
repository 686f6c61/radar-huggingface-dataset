# tencent/WeMM-Video-9B-NVFP4

## Resumen

WeMM-Video-9B-NVFP4 es la variante cuantizada en NVFP4 W4A16 del modelo multimodal WeMM-Video-9B, desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés diseñado para la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo como entrada, y genera respuestas en texto. Su relevancia radica en que unifica la comprensión audiovisual (pistas de vídeo y banda sonora original) en un único modelo de aproximadamente 10.500 millones de parámetros, algo poco habitual en modelos de este tamaño.

La arquitectura combina codificadores de visión y audio independientes que convierten los medios en tokens, los cuales el modelo de lenguaje procesa junto al texto; los fotogramas de vídeo llevan marcas temporales. El modelo base se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó con técnicas de multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado.

Esta versión NVFP4 cuantiza los pesos feed-forward del modelo de lenguaje a NVFP4 de grupo 16 con activaciones en BF16, manteniendo el resto de tensores (atención, normas) en su precisión original. El resultado son 13,07 GiB de pesos que requieren un runtime específico: vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin. Es relevante ahora porque reduce el coste de despliegue de un modelo audiovisual de 9B sin recurrir a cuantizaciones de menor fidelidad como INT4 clásico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal con codificadores de visión y audio separados que alimentan tokens al modelo de lenguaje; familia qwen3_5 según tags |
| Parámetros totales | 10.488.603.384 (≈10,5B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantización | NVFP4 W4A16 (pesos FFN en NVFP4 grupo 16, activaciones BF16); checkpoint base BF16 disponible por separado |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ModelOpt MIXED_PRECISION); repo de 14,1 GB, pesos de 13,07 GiB |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y audio convierten imágenes, vídeo y sonido en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite razonar sobre la secuencia de eventos. El modelo base se preentrenó con aproximadamente 1,2 billones de tokens multimodales y después se postentrenó con multi-teacher OPD, MrDPO (diseñado para mitigar la repetición) y aprendizaje por refuerzo con especialistas.

La variante NVFP4 aplica cuantización de grupo 16 a los pesos feed-forward del modelo de lenguaje, manteniendo las activaciones en BF16 y el resto de tensores (pesos de atención y normas) en su precisión de origen. El checkpoint usa el formato `MIXED_PRECISION` de ModelOpt y requiere el backend Marlin en vLLM para su ejecución; no es cargable directamente con Transformers (para ello existe el checkpoint BF16 correspondiente). El manifiesto de cuantización del repositorio documenta el alcance de los tensores y las comprobaciones de exportación.

## Capacidades

- Comprensión audiovisual conjunta: describe eventos combinando fotogramas de vídeo y banda sonora original.
- Transcripción de voz presente en el audio del vídeo.
- Razonamiento sobre lo visto y lo escuchado de forma integrada.
- Entrada de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo Thinking opcional (`enable_thinking=True` en el chat template) además del modo Instruct por defecto.
- Procesamiento de vídeo con control de muestreo (`fps`, `min_frames`, `max_frames`, `total_pixels`) y marcas temporales por fotograma.
- Soporte de múltiples entradas multimedia por prompt (configuración de ejemplo: hasta 4 imágenes, 2 vídeos y 2 audios).
- API compatible con OpenAI a través de vLLM parcheado.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar el vídeo junto con la pista de audio para transcribir intervenciones y resumir lo discutido, combinando reconocimiento de habla y comprensión visual de lo compartido en pantalla.
- Moderación de contenido audiovisual: permite detectar incoherencias entre lo que se muestra y lo que se dice en un vídeo, útil en plataformas que necesitan revisar grandes volúmenes de contenido subido por usuarios.
- Indexación y búsqueda semántica de archivos multimedia: genera descripciones textuales de vídeos y audios que después alimentan un motor de búsqueda o un sistema RAG sobre la videoteca de una organización.
- Accesibilidad: producción de descripciones de vídeo para personas con discapacidad auditiva o visual, integrando la transcripción del audio con la descripción de la escena.
- Documentación automática de material audiovisual: etiquetado de clips, generación de metadatos y resúmenes para archivos de medios o productoras.
- Asistencia en análisis de contenido formativo: revisión de cursos en vídeo para extraer puntos clave, preguntas frecuentes o transcripciones bilingües chino-inglés.
- Investigación en comprensión multimodal: base para experimentar con razonamiento audio-visual en entornos académicos, con licencia Apache 2.0 y pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una validación de carga y ejecución de los pesos de referencia con vLLM 0.31.0 parcheado y ModelOpt, sin cifras de calidad.

## Requisitos de hardware

- Pesos en disco: 13,07 GiB (repositorio de 14,1 GB).
- VRAM estimada: no disponible de forma explícita; los pesos NVFP4 ocupan aproximadamente 13 GiB, por lo que se necesita margen adicional para activaciones BF16, caché KV y codificadores de visión/audio.
- GPU recomendadas: la configuración de referencia del autor es SM120 (arquitectura Blackwell); no se documentan otras configuraciones validadas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; queda condicionada al soporte de NVFP4 y del backend Marlin en la GPU concreta.
- Despliegue: exclusivamente mediante vLLM 0.31.0 parcheado con el runtime de WeMM, `--quantization modelopt_mixed --linear-backend marlin --moe-backend marlin` y `--trust-remote-code`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración de ejemplo limita `--max-num-seqs 1`, lo que sugiere un enfoque de baja concurrencia por defecto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia interna de la propia familia, existe el checkpoint BF16 `tencent/WeMM-Video-9B`, con la misma arquitectura y capacidades pero sin cuantizar, cargable directamente con Transformers.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| WeMM-Video-9B-NVFP4 | ≈10,5B | No disponible | Apache 2.0 | safetensors NVFP4 (ModelOpt) |
| WeMM-Video-9B (BF16) | ≈10,5B | No disponible | Apache 2.0 | safetensors BF16 |

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se documentan otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de transcripción y descripción audiovisual conviene validar las salidas.
- No se han publicado evaluaciones de sesgo ni de robustez en la información disponible.
- El checkpoint NVFP4 no es cargable con Transformers estándar: requiere vLLM parcheado y el runtime de WeMM, lo que limita la portabilidad y complica el despliegue en producción.
- La configuración de referencia está validada para SM120 (Blackwell); el comportamiento en otras arquitecturas de GPU no está confirmado.
- La cuantización NVFP4 puede introducir degradación de calidad respecto al checkpoint BF16; no se aportan métricas comparativas.
- El ejemplo de servicio limita la concurrencia (`--max-num-seqs 1`), lo que puede restringir el throughput en cargas de producción.
- Aunque la licencia es Apache 2.0, el uso de `--trust-remote-code` implica ejecutar código del repositorio, con el riesgo de seguridad asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-NVFP4
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Video-9B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
