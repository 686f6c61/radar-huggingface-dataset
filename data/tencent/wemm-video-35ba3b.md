# tencent/WeMM-Video-35BA3B

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal de la familia WeMM-Video desarrollado por Tencent, disenado para la comprension y el razonamiento conjuntos de audio y video. Se trata de un modelo de mezcla de expertos (MoE) con 36.177 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, lo que le permite ofrecer la capacidad de un modelo de gran tamano con un coste de inferencia mucho menor. Acepta texto, imagenes, audio y video como entradas, y genera respuestas en texto en ingles o chino.

El modelo resuelve el problema de la comprension audiovisual conjunta: no solo describe lo que se ve en un video, sino que combina los fotogramas con la banda sonora original para transcribir voz, describir eventos y razonar sobre lo que se ve y se oye simultaneamente. Los fotogramas de video llevan marcas de tiempo, lo que permite un razonamiento temporal sobre la secuencia.

Su relevancia actual radica en que combina una arquitectura MoE eficiente (3B activos sobre 35B totales) con soporte nativo de audio y video en un unico modelo, publicado bajo licencia Apache 2.0 y con variantes cuantizadas oficiales (FP8, AWQ, GGUF, NVFP4), lo que facilita su despliegue en distintos entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con codificadores de vision y audio separados que alimentan tokens multimedia al modelo de lenguaje; identificador interno `wemm_qwen3_5_moe` |
| Parametros totales | 36.177.564.536 (aprox. 36,2B) |
| Parametros activos | Aproximadamente 3B (variante A3B) |
| Longitud de contexto | No disponible de forma explicita en la informacion proporcionada (el ejemplo de servicio con vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | BF16 (original), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, 67,39 GiB de archivos de pesos); variantes GGUF y cuantizadas |

## Arquitectura y entrenamiento

WeMM-Video-35B-A3B es un modelo de mezcla de expertos en el que codificadores de vision y audio independientes convierten los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de video incorporan marcas de tiempo, lo que habilita el razonamiento temporal sobre la secuencia audiovisual. El identificador interno de arquitectura es `wemm_qwen3_5_moe`, lo que sugiere una base derivada de la familia Qwen con capa MoE.

La familia se preentreno con aproximadamente 1,2 billones (trillion) de tokens multimodales. Posteriormente se aplico un post-entrenamiento en varias fases: OPD multi-profesor (multi-teacher OPD), MrDPO anti-repeticion y aprendizaje por refuerzo especializado (specialist reinforcement learning). El modelo soporta dos modos de chat: modo instruct (por defecto) y modo razonamiento, activable mediante `enable_thinking=True`.

## Capacidades

- Comprension audiovisual conjunta: combina fotogramas de video con la banda sonora para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye.
- Comprension de video silencioso (solo fotogramas) con marcas de tiempo.
- Comprension de audio independiente (por ejemplo, transcripcion de voz).
- Comprension de imagenes.
- Generacion y razonamiento de texto, incluyendo tareas aritmeticas sencillas (el ejemplo de la model card resuelve un calculo de horarios).
- Modo razonamiento (thinking) opcional frente al modo instruct directo.
- Capacidades multilingues limitadas a ingles y chino.
- Procesamiento de multiples entradas multimedia por peticion (el ejemplo de vLLM limita a 4 imagenes, 2 videos y 2 audios por prompt).

## Casos de uso

- Transcripcion y resumen de reuniones en video: el modelo puede procesar la pista de audio de una grabacion para transcribir la voz y resumir lo tratado, combinando el audio con los fotogramas para identificar ponentes o contenido visual relevante.
- Analisis de contenido audiovisual para moderacion: dado un clip con audio, el modelo describe lo que ocurre en pantalla y transcribe el habla, lo que permite detectar contenido inapropiado en imagen o en audio de forma conjunta.
- Generacion de subtitulos y descripciones accesibles: a partir de un video con banda sonora, produce descripciones textuales de la escena y del dialogo, utiles para subtitulado o audiodescripcion.
- Indexacion y busqueda semantica de archivos multimedia: usando el pipeline de `feature-extraction`, se pueden extraer representaciones de video, audio e imagen para construir indices de busqueda sobre grandes archivos audiovisuales.
- Asistencia en analisis de grabaciones de vigilancia o industria: descripcion de eventos en video silencioso con marcas de tiempo, adecuado para revision de incidencias donde no hay audio.
- Procesamiento de audio independiente: transcripcion de grabaciones de voz o notas de audio en ingles o chino, sin necesidad de video.
- Razonamiento multimodal en agentes: integrado mediante vLLM con soporte de multiples medios por prompt, puede servir como componente de percepcion en pipelines que necesitan interpretar video y audio antes de actuar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los archivos de pesos suman 67,39 GiB, por lo que se necesita al menos esa cantidad mas el espacio para entradas multimedia y cache de generacion; en la practica, un nodo con 80 GB o mas de VRAM.
- Variantes cuantizadas para reducir requisitos: FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16, que reducen el peso de los pesos y permiten ajustar el despliegue a GPUs con menos memoria.
- GPU recomendadas: no disponible de forma explicita; por el tamano en BF16 se orienta a GPUs de centro de datos tipo A100/H100 de 80 GB; las variantes cuantizadas pueden habilitar GPUs de menor memoria, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible. La variante GGUF Q4_K_M sugiere viabilidad en entornos con llama.cpp, pero no se confirma en la informacion.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForImageTextToText` y `AutoProcessor`), vLLM parcheado (0.18.0 y 0.31.0 para BF16) con `--trust-remote-code`, y variantes GGUF. Requiere aplicar el parche de runtime de WeMM y usar `trust_remote_code=True`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, se trata de un MoE multimodal de aproximadamente 36B totales y 3B activos con soporte de audio y video, licencia Apache 2.0 e idiomas ingles y chino; no se aportan alternativas concretas con las que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; no hay soporte confirmado de castellano ni de otros idiomas.
- Riesgo de alucinacion: no se documenta en la informacion disponible; como todo modelo generativo, puede producir descripciones o transcripciones inexactas, especialmente con audio de baja calidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Longitud de contexto: no se declara de forma explicita; el ejemplo de servicio usa 8192 tokens, lo que puede limitar el analisis de videos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo requiere `trust_remote_code=True` y un parche de runtime especifico, lo que anade complejidad de integracion y mantenimiento.
- Dependencia de versiones parcheadas de vLLM: la guia de servicio indica versiones concretas (0.18.0 y 0.31.0), lo que puede complicar el despliegue en produccion.
- Limites de medios por prompt: la configuracion de ejemplo restringe a 4 imagenes, 2 videos y 2 audios por peticion, lo que condiciona casos de uso con muchas entradas simultaneas.
- No se han publicado resultados de benchmarks que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-35BA3B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-35BA3B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-35BA3B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-35BA3B-NVFP4
- Coleccion WeMM-Video en Hugging Face: https://huggingface.co/collections/tencent/wemm-video
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26409
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guia de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
