# tencent/WeMM-Video-35BA3B-AWQ

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal bilingüe (chino-inglés) desarrollado por Tencent para la comprensión y el razonamiento conjuntos de audio y vídeo. Acepta texto, imágenes, audio y vídeo como entradas y genera respuestas textuales, combinando fotogramas de vídeo con su banda sonora original para describir eventos, transcribir habla y razonar sobre lo que se ve y se oye. La variante aquí descrita es la cuantizada AWQ W4A16, publicada en formato compressed-tensors y pensada para reducir el coste de despliegue del modelo base.

El modelo es de tipo MoE (Mixture of Experts) con 36.177.564.536 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según indica el sufijo A3B de su denominación. La familia fue preentrenada con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustada mediante multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. La licencia es Apache 2.0.

Su relevancia actual radica en que cubre una modalidad poco frecuente en modelos abiertos: el razonamiento conjunto sobre pista visual y pista sonora, con marcas de tiempo en los fotogramas. La versión AWQ reduce el peso de los ficheros a 22,69 GiB, lo que facilita su ejecución en entornos con dos GPU de gama profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con codificadores separados de visión y audio; arquitectura interna `wemm_qwen3_5_moe` |
| Parametros totales | 36.177.564.536 |
| Parametros activos | Aproximadamente 3.000 millones (denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (INT4 grupo 128 en pesos feed-forward de expertos enrutados y compartidos); activaciones y pesos de atención en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors |
| Tamano del repositorio | 24,4 GB (22,69 GiB de ficheros de pesos) |
| Pipeline | video-text-to-text |
| Libreria | transformers (probado con Transformers 5.2.0 y PyTorch 2.10.0+cu129) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y de audio convierten los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas de tiempo, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. El núcleo lingüístico es un transformer MoE con 40 capas de decodificador, según el mapa de dispositivos del ejemplo de carga (capas 0 a 39). El modelo base se preentrenó con aproximadamente 1,2 billones de tokens multimodales y después se sometió a un post-entrenamiento con multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo con especialistas.

La cuantización AWQ W4A16 aplica INT4 con grupo de 128 a los pesos feed-forward de los expertos enrutados y compartidos, manteniendo en BF16 las activaciones y los pesos de atención. El checkpoint se distribuye en formato compressed-tensors y requiere `compressed-tensors==0.13.0`. El cargador descomprime los tensores empaquetados a BF16 en memoria, por lo que el consumo real de VRAM debe presupuestarse según los pesos descomprimidos, no según el tamaño del repositorio. El runtime de referencia es una versión parcheada de vLLM 0.18.0.

## Capacidades

- Comprensión conjunta de vídeo y audio: describe eventos combinando fotogramas y banda sonora.
- Transcripción de habla a partir de la pista de audio del vídeo o de audio independiente.
- Razonamiento sobre lo visto y lo oído de forma integrada.
- Entrada de vídeo sin sonido (solo fotogramas), audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Procesamiento de vídeo con marcas de tiempo por fotograma.
- Modo thinking configurable mediante `enable_thinking` en la plantilla de chat.
- Extracción de características (`feature-extraction`) además de generación de texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de contenido audiovisual para medios: el modelo recibe un vídeo con su banda sonora y genera descripciones de eventos sincronizadas con las marcas de tiempo de los fotogramas, útil para catalogación y generación de metadatos.
- Subtitulado y transcripción asistida: al aceptar audio independiente y vídeo con pista de sonido, puede transcribir el habla y combinarla con la descripción visual en una sola pasada.
- Moderación de vídeo: la combinación de señales visuales y auditivas permite detectar contenido problemático que solo se manifiesta en una de las dos modalidades.
- Accesibilidad: generación de descripciones textuales de vídeos para personas con discapacidad auditiva o visual, aprovechando tanto la imagen como el sonido.
- Búsqueda y recuperación multimodal: la extracción de características permite indexar vídeos y audios por su contenido semántico conjunto.
- Asistentes bilingües para vídeo: atención en chino e inglés sobre grabaciones de reuniones o clases, con resumen de lo expuesto y de lo mostrado en pantalla.
- Analítica de reuniones y formación: transcripción del habla junto con la interpretación de las diapositivas o demostraciones visuales presentes en la grabación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el ejemplo de carga del autor reporta asignaciones máximas de PyTorch de 41,13 y 42,19 GiB durante comprobaciones cortas de generación con los pesos descomprimidos a BF16 en memoria.
- Configuración validada por el autor: 2 GPU NVIDIA L20, con capas 0 a 18, embeddings de tokens, embeddings rotatorios y codificadores de medios en la GPU 0, y capas 19 a 39, normalización final y cabeza de salida en la GPU 1.
- GPU recomendadas: L20 (validada), y por capacidad de memoria, alternativas de 48 GB o más por dispositivo; no se han validado otras GPU en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el consumo medido de más de 41 GiB con pesos descomprimidos excede la VRAM de las GPU de consumo habituales.
- Opciones de despliegue: vLLM 0.18.0 parcheado con la configuración compressed-tensors del checkpoint; carga directa con Transformers 5.2.0 y PyTorch 2.10.0+cu129 usando `AutoModelForImageTextToText`, `AutoProcessor` y `CompressedTensorsConfig`. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación cuantitativa con alternativas de la misma categoría (modelos multimodales de vídeo y audio de tamaño similar) queda como no disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto: no especificada, lo que impide planificar cargas de vídeo de larga duración sin pruebas previas.
- Riesgo de alucinación: no se documentan evaluaciones específicas de fidelidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- La cuantización AWQ W4A16 puede degradar la precisión respecto al modelo base BF16; el autor no publica comparativas de calidad entre ambas variantes.
- El consumo de memoria en carga con Transformers es elevado (más de 41 GiB medidos) porque los tensores se descomprimen a BF16 en memoria; hay que presupuestar en consecuencia.
- Requiere `trust_remote_code=True` y `compressed-tensors==0.13.0`, además de un vLLM parcheado en la versión 0.18.0; la integración en pilas estándar exige verificación.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros incluidos en el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Descripción general del proyecto: https://github.com/Tencent/WeMM-Video#overview
