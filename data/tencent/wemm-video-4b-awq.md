# tencent/WeMM-Video-4B-AWQ

## Resumen

WeMM-Video-4B-AWQ es la variante cuantizada del modelo multimodal WeMM-Video-4B de Tencent, una familia bilingüe chino-inglés diseñada para comprensión y razonamiento conjuntos de audio y vídeo. El modelo acepta texto, imágenes, audio y vídeo como entradas y genera respuestas de texto, combinando fotogramas de vídeo con la banda sonora original para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye. Esta versión AWQ W4A16 reduce el peso de los ficheros a 7,32 GiB mediante cuantización INT4 de grupo 128 sobre las proyecciones feed-forward del modelo de lenguaje.

La arquitectura sigue un esquema de codificadores separados de visión y audio que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto, con marcas temporales en los fotogramas de vídeo. El modelo fue preentrenado con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustado mediante multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo especializado. Con 5.611.749.896 parámetros totales, se posiciona en la gama de 4B-6B, adecuada para despliegue en una sola GPU.

La relevancia actual del modelo radica en su enfoque en comprensión audiovisual conjunta con licencia Apache 2.0, lo que facilita su uso comercial e integración en pipelines de producción. Esta variante cuantizada está pensada para servir con una versión parcheada de vLLM 0.18.0 y la configuración compressed-tensors del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores separados de visión y audio que alimentan tokens al modelo de lenguaje (familia qwen3_5) |
| Parametros totales | 5.611.749.896 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | AWQ W4A16: INT4 grupo 128 en pesos feed-forward del modelo de lenguaje; activaciones y pesos de atención en BF16; formato compressed-tensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 7,32 GiB de ficheros de pesos |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y audio independientes transforman los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite razonar sobre la secuencia temporal de los eventos. La familia fue preentrenada con aproximadamente 1,2 billones de tokens multimodales y posteriormente sometida a post-entrenamiento con multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo especializado. Esta variante AWQ aplica cuantización INT4 de grupo 128 en formato compressed-tensors únicamente a las proyecciones feed-forward (gate, up, down) del modelo de lenguaje, manteniendo activaciones y pesos de atención en BF16. El cargador de Transformers descomprime los tensores empaquetados a BF16 en memoria, por lo que el consumo de memoria debe presupuestarse según los pesos descomprimidos.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la banda sonora para describir eventos y razonar sobre lo visto y oído.
- Transcripción de voz en vídeo y audio independiente.
- Procesamiento de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo de pensamiento (thinking) controlable mediante `enable_thinking`, según el ejemplo de uso.
- Conversación multi-turno mediante plantilla de chat.
- Entrada de medios en línea a través de API compatible con OpenAI (endpoint de chat de vLLM).

## Casos de uso

- Análisis de reuniones y videollamadas: el modelo puede transcribir el audio y describir lo que ocurre en pantalla combinando fotogramas y banda sonora, útil para generar actas automáticas con contexto visual.
- Moderación de contenido audiovisual: permite detectar y describir escenas junto con el audio asociado, adecuado por su capacidad de procesar vídeo con sonido en una sola pasada.
- Accesibilidad: generación de descripciones de vídeo para personas con discapacidad auditiva o visual, combinando la transcripción de voz con la descripción de los fotogramas.
- Indexación y búsqueda de archivos multimedia: extracción de descripciones y transcripciones de vídeos y audios para construir índices semánticos, aprovechando el procesamiento conjunto de modalidades.
- Atención al cliente con soporte de vídeo: gestión de conversaciones multi-turno donde el usuario adjunta capturas, clips o notas de voz, con respuestas en inglés o chino.
- Análisis de contenido educativo: descripción y resumen de clases grabadas, combinando pizarra o diapositivas visibles con la explicación hablada.
- Procesamiento por lotes en pipelines de CI/CD de medios: despliegue con vLLM parcheado para servir peticiones con medios en línea mediante API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros de pesos AWQ ocupan 7,32 GiB; el cargador de Transformers descomprime a BF16 en memoria, por lo que hay que presupuestar memoria adicional para los pesos descomprimidos. No se dispone de cifra oficial de VRAM total.
- GPU validadas por el autor: una NVIDIA L20 para carga completa de pesos y generación con Transformers 5.2.0 y PyTorch 2.10.0+cu129.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una GPU de 24 GB o superior es un punto de partida razonable, aunque no está confirmado por el autor.
- Cabe en consumer GPU: no confirmado en la información disponible.
- Opciones de despliegue: Transformers con `compressed-tensors==0.13.0` y `trust_remote_code=True`; vLLM 0.18.0 parcheado con la configuración compressed-tensors del checkpoint y `--trust-remote-code`; guía de servicio con perfiles de dependencias e imágenes Docker en el repositorio del proyecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WeMM-Video-4B-AWQ | 5,61B | no disponible | apache-2.0 | Hugging Face (tencent/WeMM-Video-4B-AWQ) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo bilingüe en/zh, el rendimiento fuera de esos idiomas no está garantizado.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir descripciones o transcripciones inexactas.
- Limitaciones de contexto: la longitud de contexto no está especificada; el ejemplo de servicio usa `--max-model-len 8192`, lo que sugiere un límite práctico en ese rango para el despliegue con vLLM.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Requisitos de despliegue: requiere código remoto (`trust_remote_code=True`) y una versión parcheada de vLLM 0.18.0, lo que añade complejidad operativa frente a modelos estándar.
- Memoria: el cargador descomprime los pesos AWQ a BF16 en memoria, por lo que el ahorro de VRAM en inferencia con Transformers puede ser menor de lo que sugiere el tamaño de los ficheros.
- Idiomas: solo se declaran inglés y chino; no hay soporte documentado de castellano.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-4B
- Proyecto en GitHub: https://github.com/Tencent/WeMM-Video
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers
