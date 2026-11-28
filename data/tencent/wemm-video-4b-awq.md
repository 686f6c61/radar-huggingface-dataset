# tencent/WeMM-Video-4B-AWQ

## Resumen

WeMM-Video-4B-AWQ es la variante cuantizada en AWQ W4A16 del modelo WeMM-Video-4B, desarrollado por Tencent. Se trata de un modelo multimodal bilingue chino-ingles disenado para comprension y razonamiento conjunto de audio y video: acepta texto, imagenes, audio y video (con o sin pista de sonido) y genera respuestas de texto. La familia WeMM-Video combina codificadores de vision y audio que convierten el material multimedia en tokens que el modelo de lenguaje procesa junto al texto.

El modelo se apoya en una arquitectura de tipo `qwen3_5` (segun el tag de Hugging Face) con pesos en formato safetensors y un total de 5.611.749.896 parametros reales, pese a la denominacion comercial "4B". Esta version AWQ aplica cuantizacion INT4 por grupos de 128 a los pesos feed-forward del modelo de lenguaje, manteniendo activaciones y pesos de atencion en BF16, lo que reduce el peso a 7,32 GiB de ficheros de pesos (7,9 GB de repositorio).

Su relevancia actual radica en que permite desplegar un modelo audiovisual de razonamiento en hardware mas modesto que la version completa, con soporte de vLLM parcheado 0.18.0 y de Transformers 5.2.0, y con una licencia Apache 2.0 que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + audio + LLM); familia `qwen3_5` |
| Parametros totales | 5.611.749.896 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | AWQ W4A16 (INT4 grupo-128 en pesos FFN del LLM; activaciones y atencion en BF16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

WeMM-Video emplea codificadores separados de vision y audio que transforman el material multimedia en tokens; estos se inyectan en el modelo de lenguaje junto con los tokens de texto. Los fotogramas de video llevan marcas de tiempo. La cuantizacion AWQ se aplica exclusivamente a los pesos feed-forward del modelo de lenguaje (proyecciones `gate`, `up` y `down`, incluyendo expertos y `shared_expert` si existen), en formato compressed-tensors INT4 grupo-128, mientras que las activaciones y los pesos de atencion permanecen en BF16.

El entrenamiento de la familia incluyo un preentrenamiento de aproximadamente 1,2 billones de tokens multimodales, seguido de post-entrenamiento con multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo especializado. La model card no detalla la composicion exacta del dataset ni el numero de pasos de RLHF/DPO mas alla de estas referencias.

## Capacidades

- Comprension conjunta de video y audio: describir eventos, transcribir habla y razonar sobre lo visto y lo escuchado.
- Procesamiento de video silencioso, audio independiente, imagenes y texto.
- Generacion de respuestas en chino e ingles.
- Razonamiento multimodal multi-paso sobre contenido audiovisual.
- Modo thinking configurable (`enable_thinking` en la plantilla de chat).
- Integracion con tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion y analisis de reuniones: el modelo puede procesar el video de una reunion con su pista de audio para transcribir el habla y resumir lo discutido, combinando la informacion visual (comparticion de pantalla) con la auditiva.
- Moderacion de contenido audiovisual: analizar clips subidos por usuarios para detectar lenguaje o escenas inapropiadas, aprovechando la comprension conjunta de imagen y sonido.
- Accesibilidad: generar descripciones y subtitulos enriquecidos de videos que combinen lo que se ve con lo que se dice, util para personas con discapacidad visual o auditiva.
- Analisis de clases y formaciones grabadas: extraer resumenes y puntos clave de videos educativos con audio, respondiendo preguntas sobre el contenido.
- Indexado y busqueda semantica de archivos multimedia: generar descripciones textuales de videos y audios para alimentar un motor de busqueda interno.
- Asistencia en atencion al cliente con contenido multimedia: el usuario envia un video o audio de un problema y el modelo lo describe y razona para guiar la resolucion, desplegado con vLLM parcheado.
- Analisis de contenido en redes sociales: clasificar y describir clips cortos con sonido para tareas de catalogacion o recomendacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los ficheros de pesos: 7,32 GiB (repositorio de 7,9 GB).
- La carga en Transformers descomprime los tensores FFN a BF16 en memoria, por lo que hay que presupuestar memoria para los pesos descomprimidos, no solo para el checkpoint cuantizado.
- Validacion oficial realizada en una unica NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129.
- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint AWQ esta pensado para reducir el consumo frente a la version BF16.
- GPU recomendadas: NVIDIA L20 (validada); GPUs profesionales con suficiente VRAM para los pesos descomprimidos. Cabe en GPU de consumo solo si la VRAM disponible cubre los pesos descomprimidos; no se especifica.
- Despliegue: vLLM parcheado 0.18.0 con configuracion compressed-tensors; Transformers con `compressed-tensors==0.13.0`; se requieren parches de runtime del repositorio WeMM-Video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| WeMM-Video-4B-AWQ | 5.611.749.896 | no disponible | en, zh | apache-2.0 | Version cuantizada AWQ W4A16 |
| WeMM-Video-4B | no disponible | no disponible | en, zh | apache-2.0 | Modelo base sin cuantizar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables |

## Limitaciones y advertencias

- Solo soporta ingles y chino; no se garantiza calidad en otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje multimodales; las descripciones de audio o video pueden ser incorrectas.
- La cuantizacion AWQ INT4 puede degradar ligeramente la calidad frente al modelo base BF16; no se aportan metricas de la perdida.
- Requiere parches especificos de runtime (vLLM 0.18.0 parcheado, `compressed-tensors==0.13.0`, `trust_remote_code=True`), lo que complica el despliegue en produccion.
- La carga en Transformers descomprime los pesos a BF16, aumentando el consumo de memoria respecto al tamano del checkpoint.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del modelo base y de los codificadores incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-4B
- Coleccion WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26409
- Paper en Hugging Face: https://huggingface.co/papers/2611.26409
- GitHub: https://github.com/Tencent/WeMM-Video
- Guia de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
