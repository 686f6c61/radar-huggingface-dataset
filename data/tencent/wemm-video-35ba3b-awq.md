# tencent/WeMM-Video-35BA3B-AWQ

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal bilingue (chino-ingles) desarrollado por Tencent para la comprension y el razonamiento conjunto de audio y video. Acepta texto, imagenes, audio y video como entrada, y genera respuestas de texto en chino o en ingles. La familia WeMM-Video combina codificadores de vision y audio que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto; los fotogramas de video llevan marcas temporales explicitas.

El repositorio que nos ocupa, `tencent/WeMM-Video-35BA3B-AWQ`, es la variante cuantizada en AWQ W4A16 con formato compressed-tensors del modelo base `tencent/WeMM-Video-35BA3B`. Los pesos ocupan 22,69 GiB y el checkpoint cuenta con 36.177.564.536 parametros totales. La cuantizacion se aplica a los pesos feed-forward de los expertos enrutados y compartidos en INT4 grupo-128, mientras que las activaciones y los pesos de atencion se mantienen en BF16.

Su relevancia actual reside en que reduce el coste de despliegue de un modelo multimodal de 35B con capacidad de razonamiento audio-visual, manteniendo una licencia permisiva Apache 2.0 y soporte tanto para Transformers como para un runtime parcheado de vLLM 0.18.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); codificadores separados de vision y audio que alimentan tokens al modelo de lenguaje |
| Parametros totales | 36.177.564.536 |
| Parametros activos | 3B (indicado por el sufijo A3B del nombre; no se detalla el reparto exacto en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 en formato compressed-tensors: INT4 grupo-128 en pesos feed-forward de expertos enrutados y compartidos; BF16 en activaciones y pesos de atencion |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

WeMM-Video es una familia multimodal que combina codificadores de vision y audio con un modelo de lenguaje de tipo mezcla de expertos. Los codificadores convierten imagenes, audio y fotogramas de video en tokens que el modelo de lenguaje procesa junto con los tokens de texto; en el caso del video, los fotogramas incorporan marcas temporales que permiten razonar sobre la secuencia. La variante AWQ mantiene las activaciones y los pesos de atencion en BF16, y cuantiza a INT4 grupo-128 los pesos feed-forward de los expertos enrutados y del experto compartido.

El entrenamiento se realizo en dos fases: un preentrenamiento sobre aproximadamente 1,2 billones de tokens multimodales, seguido de un post-entrenamiento que combina multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo con especialistas. La model card no detalla la composicion exacta del dataset ni el numero de tokens de cada fase de post-entrenamiento.

## Capacidades

- Comprension conjunta de audio y video: describe eventos combinando los fotogramas con la banda sonora original.
- Transcripcion de voz integrada en el razonamiento visual.
- Razonamiento sobre lo que se ve y se oye de forma simultanea.
- Procesamiento de video silencioso, audio independiente, imagenes y texto por separado.
- Generacion de respuestas en chino e ingles.
- Modo de pensamiento (thinking) controlable mediante el parametro `enable_thinking` en la plantilla de chat.
- Soporte de conversaciones multi-turno mediante plantilla de chat.
- Integracion con Transformers (`AutoModelForImageTextToText`, `AutoProcessor`) y con vLLM 0.18.0 parcheado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de reuniones y videoconferencias: el modelo puede procesar el video junto con la pista de audio para generar actas que combinen lo dicho con lo mostrado en pantalla, gracias a la entrada `video_audio` y a las marcas temporales de los fotogramas.
- Moderacion de contenido audiovisual: permite describir y razonar sobre escenas con sonido para detectar situaciones que requieran revision humana, combinando senales visuales y de audio en una sola pasada.
- Accesibilidad: generacion de descripciones de video con sonido para personas con discapacidad auditiva o visual, transcribiendo el habla y describiendo la accion de forma integrada.
- Indexacion y busqueda semantica de archivos multimedia: el modelo puede generar descripciones textuales de clips de video y audio que alimenten un indice de busqueda, aprovechando su capacidad de procesar ambos canales.
- Analisis de contenido deportivo o de vigilancia: descripcion de eventos a partir de video con comentario o sonido ambiente, usando las marcas temporales para ubicar cada suceso.
- Asistencia en atencion al cliente multimodal: atender consultas que incluyan capturas de imagen o audio adjunto, respondiendo en chino o ingles segun el idioma del usuario.
- Investigacion en comprension audiovisual: servir como base cuantizada para experimentos academicos que requieran un modelo de 35B con licencia Apache 2.0 y bajo requisito de VRAM relativo al modelo completo en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan 22,69 GiB; el cargador de Transformers descomprime los tensores a BF16 en memoria, por lo que hay que presupuestar memoria para los pesos descomprimidos. En las pruebas de generacion cortas del autor, las asignaciones pico de PyTorch fueron de 41,13 y 42,19 GiB.
- GPU recomendadas: el autor valido la carga y generacion completas en 2 GPU NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129. El mapa de dispositivos probado asigna las capas 0-18 del decodificador, los embeddings de tokens, los embeddings rotatorios y los codificadores de medios a la GPU 0; las capas 19-39, la normalizacion final y la cabeza de salida a la GPU 1.
- Cabe en consumer GPU: no disponible en la informacion proporcionada; por el tamano de pesos y las asignaciones pico reportadas, no es viable en una unica GPU de consumo.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `compressed-tensors==0.13.0`; vLLM 0.18.0 con el parche de runtime de WeMM. La guia de serving del proyecto lista perfiles de dependencias e imagenes Docker.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Al ser un modelo cuantizado en INT4, puede presentar una degradacion de calidad respecto al modelo base en BF16; el autor no publica metricas de esa perdida.
- El cargador de Transformers descomprime los pesos a BF16 en memoria, lo que anula parte del ahorro de VRAM de la cuantizacion y exige presupuesto de memoria superior al tamano del repositorio.
- Requiere `trust_remote_code=True` y codigo personalizado (`wemm_qwen3_5_moe`), lo que implica ejecutar codigo del autor.
- El despliegue en vLLM exige aplicar un parche de runtime especifico de WeMM; no funciona con vLLM estandar sin ese parche.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en la descripcion de eventos sutiles o en la transcripcion de audio con ruido.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del codigo personalizado y del runtime parcheado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Coleccion de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guia de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#runtime-profiles
- Instalacion del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md#manual-install-and-patch
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers
- Vision general de la familia: https://github.com/Tencent/WeMM-Video#overview
