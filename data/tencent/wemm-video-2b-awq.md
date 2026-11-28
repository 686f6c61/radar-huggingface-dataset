# tencent/WeMM-Video-2B-AWQ

## Resumen

WeMM-Video-2B-AWQ es la variante cuantizada en AWQ W4A16 del modelo multimodal WeMM-Video-2B, desarrollado por Tencent. Se trata de una familia bilingue chino-ingles orientada a la comprension y el razonamiento conjunto de audio y video: acepta texto, imagenes, audio y video, y genera respuestas de texto en chino o ingles. El modelo combina codificadores de vision y audio que transforman los medios en tokens que el modelo de lenguaje procesa junto al texto, incorporando marcas temporales en los fotogramas de video.

La relevancia de esta variante concreta reside en su cuantizacion: los pesos de las capas feed-forward del modelo de lenguaje usan INT4 AWQ con grupo de 128 en formato compressed-tensors, mientras que las activaciones y los pesos de atencion se mantienen en BF16. Esto reduce el peso de los ficheros a 4,86 GiB, lo que facilita el despliegue en hardware mas modesto sin renunciar a las capacidades multimodales del modelo base.

El modelo base fue preentrenado con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustado mediante multi-teacher OPD, MrDPO anti-repeticion y aprendizaje por refuerzo especializado. La licencia es Apache 2.0 y el pipeline declarado es video-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de vision y audio separados que alimentan tokens al modelo de lenguaje (familia qwen3_5) |
| Parametros totales | 3.283.624.264 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servicio vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | AWQ W4A16 (INT4 con grupo de 128 en capas feed-forward del modelo de lenguaje; activaciones y atencion en BF16) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano de los pesos | 4,86 GiB |
| Modelo base | tencent/WeMM-Video-2B |
| Libreria | transformers (con `trust_remote_code`) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de vision y audio independientes convierten imagenes, audio y fotogramas de video en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de video llevan marcas temporales, lo que permite razonar sobre la secuencia temporal de los eventos. El modelo acepta tambien video silencioso, audio independiente, imagenes y texto, con respuestas en chino o ingles.

El preentrenamiento se realizo sobre aproximadamente 1,2 billones de tokens multimodales. La fase de post-entrenamiento incluyo multi-teacher OPD, MrDPO anti-repeticion y aprendizaje por refuerzo con especialistas. La variante AWQ aplica cuantizacion INT4 con grupo de 128 a los pesos feed-forward del modelo de lenguaje en formato compressed-tensors, manteniendo activaciones y pesos de atencion en BF16; el manifiesto de cuantizacion (`quantization_manifest.json`) documenta el alcance de los tensores y las comprobaciones de exportacion. El checkpoint se valido con carga completa de pesos y generacion en una NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129, cubriendo texto, imagen, audio, fotogramas de video y video con banda sonora.

## Capacidades

- Comprension conjunta de audio y video: describe eventos combinando fotogramas y banda sonora original.
- Transcripcion de voz integrada en el analisis de video.
- Razonamiento sobre lo que se ve y se oye de forma simultanea.
- Acepta video silencioso, audio independiente, imagenes y texto como entradas.
- Generacion de texto en chino e ingles.
- Soporte de modo thinking (parametro `enable_thinking` en la plantilla de chat).
- Procesamiento de video con marcas temporales en los fotogramas.
- Integracion con Transformers mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Despliegue en servicio mediante vLLM parcheado (version 0.18.0).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de video con audio para descripcion de eventos: el modelo combina fotogramas con marcas temporales y la banda sonora para describir que ocurre y cuando, adecuado para indexacion y catalogacion de archivos audiovisuales.
- Transcripcion y comprension de reuniones o clases grabadas: al aceptar video con banda sonora, puede transcribir el habla y razonar sobre el contenido visual de la presentacion de forma conjunta.
- Moderacion de contenido audiovisual: permite evaluar simultaneamente lo que se muestra y lo que se dice en un clip, detectando incoherencias entre imagen y audio.
- Accesibilidad: generacion de descripciones textuales de videos para personas con discapacidad auditiva o visual, aprovechando la doble modalidad de entrada.
- Analisis de audio independiente: al aceptar audio suelto, sirve para tareas de comprension de habla en ingles o chino sin necesidad de video.
- Procesamiento de imagenes con contexto textual: al aceptar imagenes y texto, puede emplearse en tareas de VQA (preguntas y respuestas sobre imagenes) en entornos bilingues chino-ingles.
- Despliegue en hardware limitado: gracias a la cuantizacion AWQ W4A16 (4,86 GiB de pesos), es viable en GPUs de gama media para prototipos y pruebas de concepto de pipelines multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan 4,86 GiB; debe presupuestarse memoria adicional para los pesos descomprimidos a BF16 durante la carga con Transformers, ya que el loader descomprime los tensores empaquetados.
- GPU validadas: el checkpoint paso las pruebas de carga y generacion en una NVIDIA L20.
- GPU recomendadas: no disponible de forma explicita; por el tamano de pesos, GPUs con 16 GB o mas de VRAM son un punto de partida razonable, aunque no esta confirmado en la informacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: Transformers 5.2.0 con `compressed-tensors==0.13.0` y PyTorch 2.10.0+cu129; vLLM 0.18.0 parcheado con la configuracion compressed-tensors del checkpoint (requiere instalar el parche de runtime de WeMM).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-2B-AWQ | 3.283.624.264 | no disponible | texto, imagen, audio, video | Apache 2.0 | Hugging Face (tencent) |
| WeMM-Video-2B (base) | no disponible | no disponible | texto, imagen, audio, video | Apache 2.0 | Hugging Face (tencent) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos multimodales de audio y video en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado.
- La cuantizacion AWQ puede introducir una perdida de calidad respecto al modelo base BF16; no se han publicado metricas que cuantifiquen esa degradacion.
- La carga con Transformers requiere `trust_remote_code=True` y `compressed-tensors==0.13.0`, ademas de un override en memoria de los tensores objetivo; el despliegue en vLLM exige un parche de runtime especifico, lo que anade complejidad operativa.
- El ejemplo de servicio con vLLM desactiva el prefix caching y fija `--mamba-ssm-cache-dtype float32`, lo que sugiere restricciones de configuracion a tener en cuenta en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir descripciones inexactas de contenido audiovisual.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del runtime parcheado y las condiciones de los codificadores multimodales.
- Contexto maximo: no declarado de forma oficial; el ejemplo de vLLM usa 8192 tokens, por lo que no debe asumirse una ventana mayor sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Coleccion WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26409
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Vision general del proyecto: https://github.com/Tencent/WeMM-Video#overview
- Guia de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#runtime-profiles
- Receta de vLLM: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#serve-with-vllm
- Instalacion del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md#manual-install-and-patch
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers
