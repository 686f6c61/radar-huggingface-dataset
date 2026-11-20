# tencent/WeMM-Video-35BA3B

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal de la familia WeMM-Video, desarrollado por Tencent, disenado para la comprension y el razonamiento conjuntos de audio y video. Acepta texto, imagenes, audio y video como entradas, y genera respuestas de texto en chino o ingles. Se trata de un modelo de mezcla de expertos (MoE) con 35B parametros totales y aproximadamente 3B activos, lo que permite un equilibrio entre capacidad y coste de inferencia.

El modelo resuelve el problema de la comprension audiovisual unificada: combina fotogramas de video con su pista de audio original para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye. Tambien acepta video mudo, audio independiente, imagenes y texto. Su relevancia actual radica en que integra en un unico checkpoint tareas que tradicionalmente requerian pipelines separados de vision, ASR y razonamiento linguistico.

La familia fue preentrenada con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustada con tecnicas de post-entrenamiento como OPD multi-profesor, MrDPO anti-repeticion y aprendizaje por refuerzo especializado. Los pesos se distribuyen en BF16 Safetensors (67,39 GiB) y existen variantes cuantizadas FP8, AWQ, GGUF y NVFP4. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer multimodal con codificadores de vision y audio separados |
| Parametros totales | 36.177.564.536 (aprox. 35B) |
| Parametros activos | Aproximadamente 3B |
| Longitud de contexto | No disponible (la receta de vLLM usa `--max-model-len 8192`, pero no se confirma como contexto maximo oficial) |
| Tipos de cuantizacion | BF16, FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes GGUF, AWQ, FP8 y NVFP4 |

## Arquitectura y entrenamiento

WeMM-Video-35B-A3B emplea una arquitectura MoE en la que codificadores de vision y audio independientes convierten los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de video llevan marcas de tiempo, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. La receta de servicio de vLLM incluye `--mamba-ssm-cache-dtype float32`, lo que sugiere la presencia de componentes de estado (SSM o hibridos) en la pila, aunque la model card no detalla la composicion exacta de la arquitectura.

El preentrenamiento se realizo sobre aproximadamente 1,2 billones de tokens multimodales. El post-entrenamiento combino OPD multi-profesor (destilacion de multiples profesores), MrDPO con penalizacion anti-repeticion y aprendizaje por refuerzo con especialistas. El modelo soporta dos modos de chat: instruct (por defecto) y thinking, activable mediante `enable_thinking=True` en la plantilla de chat.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre audio, imagen y video.
- Comprension audiovisual conjunta: descripcion de eventos combinando fotogramas y banda sonora.
- Transcripcion de voz (ASR) integrada en la respuesta.
- Razonamiento temporal sobre video mediante marcas de tiempo en los fotogramas.
- Procesamiento de video mudo, audio independiente, imagenes y texto puro.
- Modo thinking para respuestas de razonamiento extendido.
- Respuestas en chino e ingles.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.

## Casos de uso

- Analisis de reuniones y videollamadas: el modelo puede procesar la pista de audio y los fotogramas de una grabacion para transcribir la conversacion, identificar a los participantes y resumir los temas tratados, aprovechando su capacidad de combinar voz y contenido visual.
- Moderacion de contenido audiovisual: clasificacion de clips que requieren entender tanto lo que se ve como lo que se dice, por ejemplo para detectar discursos de odio acompanados de imagenes contextuales.
- Accesibilidad: generacion de descripciones y subtitulos enriquecidos para contenido de video, incluyendo la transcripcion del habla y la descripcion de la escena en una sola pasada.
- Indexacion y busqueda semantica de archivos multimedia: extraccion de descripciones y transcripciones estructuradas de grandes volumenes de video para alimentar motores de busqueda internos.
- Analisis de contenido deportivo o de vigilancia: descripcion de eventos en secuencias de video con audio ambiente, con marcas de tiempo que permiten localizar momentos concretos.
- Asistentes de analisis de medios para investigacion: preguntas en lenguaje natural sobre clips (por ejemplo, "que se dice y que se ve en el minuto 3"), utiles en estudios de comunicacion o periodismo.
- Procesamiento de audio independiente: transcripcion y resumen de grabaciones de voz o podcasts sin necesidad de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan 67,39 GiB, por lo que la inferencia en BF16 requiere al menos 80 GB de VRAM mas memoria para entradas multimedia y cache de generacion.
- Variantes cuantizadas: FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16 reducen el requisito de memoria; la model card no publica cifras exactas de VRAM por variante.
- GPU recomendadas: la receta oficial de vLLM usa `--tensor-parallel-size 2` con BF16, lo que apunta a configuraciones multi-GPU (por ejemplo, 2x A100 80GB o 2x H100). No se confirma el soporte en GPU de consumo para BF16.
- GPU de consumo: no disponible de forma confirmada; la variante GGUF Q4_K_M sugiere viabilidad en entornos con menos VRAM, pero no se publican requisitos minimos.
- Opciones de despliegue: vLLM parcheado (0.18.0 y 0.31.0 para BF16), SGLang parcheado (0.5.16 o 0.5.19), Transformers con `trust_remote_code=True`. Requiere aplicar el parche de runtime WeMM disponible en el repositorio del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (multimodal audio-video MoE).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; como modelo generativo multimodal, puede producir descripciones o transcripciones inexactas, especialmente con audio de baja calidad.
- Limitaciones de idioma: solo se declaran soporte para ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Longitud de contexto: no se especifica el maximo oficial; la receta de vLLM usa 8192 tokens, lo que puede limitar el analisis de videos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion.
- Dependencia de parches: el despliegue en vLLM y SGLang requiere versiones parcheadas y `trust_remote_code=True`, lo que anade complejidad operativa y riesgos de seguridad al ejecutar codigo remoto.
- Idiomas y sesgos culturales: al estar entrenado principalmente con datos en chino e ingles, puede presentar sesgos culturales en la interpretacion de contenido audiovisual.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Coleccion de modelos: https://huggingface.co/collections/tencent/wemm-video
- Variante FP8: https://huggingface.co/tencent/WeMM-Video-35BA3B-FP8
- Variante AWQ: https://huggingface.co/tencent/WeMM-Video-35BA3B-AWQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Video-35BA3B-GGUF
- Variante NVFP4: https://huggingface.co/tencent/WeMM-Video-35BA3B-NVFP4
- Guia de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Vision general del proyecto: https://github.com/Tencent/WeMM-Video#overview
