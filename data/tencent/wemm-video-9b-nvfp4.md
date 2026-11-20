# tencent/WeMM-Video-9B-NVFP4

## Resumen

WeMM-Video-9B-NVFP4 es la variante cuantizada en NVFP4 (W4A16) del modelo multimodal WeMM-Video-9B desarrollado por Tencent. Se trata de un modelo de la familia WeMM-Video, disenada para la comprension y el razonamiento conjuntos de audio y video, que acepta texto, imagenes, audio y video como entrada y genera respuestas de texto. Esta version concreta emplea cuantizacion NVFP4 con grupo de 16 en los pesos de las capas feed-forward del modelo de lenguaje, manteniendo las activaciones en BF16 y el resto de tensores (attention, norms) en su precision original.

El modelo cuenta con 10.488.603.384 parametros reales segun los pesos en safetensors y un repositorio de 14,1 GB, con archivos de pesos que suman 13,07 GiB. Esta construido sobre una arquitectura que combina codificadores de vision y audio que convierten el contenido multimedia en tokens, los cuales el modelo de lenguaje procesa junto al texto, incorporando marcas temporales en los fotogramas de video.

La relevancia de esta ficha radica en que ofrece una via de despliegue eficiente en memoria del modelo base, pensada para runtime vLLM parcheado (version 0.31.0) con ModelOpt Mixed Precision y Marlin en configuracion de referencia SM120. No obstante, al ser una variante cuantizada, no es cargable directamente con Transformers, sino que requiere el stack de serving especifico documentado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de vision y audio separados que alimentan tokens multimedia al modelo de lenguaje (familia qwen3_5 segun tags) |
| Parametros totales | 10.488.603.384 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de serving usa max-model-len 8192) |
| Tipos de cuantizacion | NVFP4 W4A16 con grupo de 16 en pesos feed-forward; activaciones en BF16; attention y norms en precision original |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (ModelOpt MIXED_PRECISION) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de vision y audio independientes transforman el contenido multimedia en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de video incorporan marcas temporales, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. La familia fue preentrenada con aproximadamente 1,2 billones de tokens multimodales y posteriormente sometida a un post-entrenamiento que incluye multi-teacher OPD, MrDPO anti-repeticion y aprendizaje por refuerzo especializado.

En esta variante concreta, la cuantizacion NVFP4 se aplica exclusivamente a los pesos de las capas feed-forward del modelo de lenguaje con granularidad de grupo 16, mientras que las activaciones se mantienen en BF16 y el resto de tensores conservan su precision de origen. El checkpoint usa ModelOpt MIXED_PRECISION y requiere el runtime vLLM parcheado con soporte de Marlin para su carga y ejecucion.

## Capacidades

- Comprension conjunta de audio y video: combina fotogramas de video con la banda sonora original para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye.
- Procesamiento de video silencioso, audio independiente, imagenes y texto como entradas individuales.
- Generacion de respuestas en chino e ingles.
- Modo Thinking opcional, activable mediante `enable_thinking=True` en las opciones de chat template del runtime.
- API compatible con OpenAI para peticiones de chat con medios en linea (imagen, audio, video con o sin audio).
- Control de muestreo de video mediante parametros `fps` y `max_frames` dentro de la peticion.
- Soporte de multiples entradas multimedia por prompt, con limites configurables (por ejemplo, hasta 4 imagenes, 2 videos y 2 audios en el ejemplo de serving).
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Analisis de reuniones y videoconferencias: el modelo puede procesar el video junto con el audio para transcribir intervenciones y describir eventos visuales, aprovechando las marcas temporales de los fotogramas y el procesamiento conjunto de audio y video.
- Moderacion de contenido audiovisual: combinando la comprension de lo que se ve y lo que se dice, permite detectar contenido inapropiado en videos con banda sonora, algo que un modelo solo de vision o solo de audio no cubriria.
- Accesibilidad y subtitulado enriquecido: generacion de descripciones de video que integran dialogo transcrito y descripcion visual de escenas, util para crear subtitulos descriptivos para personas con discapacidad auditiva o visual.
- Analisis de contenido en redes sociales y plataformas de video: extraccion de resumenes y descripciones de clips cortos muestreando fotogramas a una tasa controlada (por ejemplo, fps 2 con 4 a 16 fotogramas), lo que encaja con el perfil de serving documentado.
- Investigacion en comprension multimodal audio-visual: el modelo sirve como base para experimentos que requieren razonamiento conjunto sobre modalidades, con la ventaja de una variante cuantizada que reduce el consumo de memoria en el despliegue.
- Procesamiento de audio independiente: transcripcion y analisis de contenido hablado en ingles o chino sin necesidad de video, usando la entrada de audio del modelo.
- Descripcion de imagenes y respuesta a preguntas visuales: uso del modo imagen para tareas de image-text-to-text en ingles y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos de pesos suman 13,07 GiB, por lo que se necesita al menos esa cantidad mas el overhead de activaciones en BF16, cache KV y buffers del runtime. El ejemplo de serving fija `max-num-seqs 1` y `max-num-batched-tokens 8192`, lo que sugiere un perfil de concurrencia bajo.
- GPU recomendadas: la configuracion de referencia documentada es SM120 con Marlin, lo que apunta a GPUs de la generacion Blackwell (por ejemplo, RTX 50 series o equivalentes profesionales). No se documentan otras arquitecturas de GPU soportadas.
- Cabe en consumer GPU: no confirmado en la informacion disponible; el perfil SM120 de referencia sugiere compatibilidad con GPUs consumer de arquitectura Blackwell, pero no se detalla.
- Opciones de despliegue: vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin, con backend de atencion FLASH_ATTN version 2. No se documenta soporte de llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput estimados: no disponibles; el ejemplo de serving limita a `max-num-seqs 1`, lo que indica un escenario de baja concurrencia sin datos de rendimiento publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Video-9B-NVFP4 (este) | 10.488.603.384 | no disponible | texto, imagen, audio, video | apache-2.0 | safetensors NVFP4 |
| WeMM-Video-9B (base) | no disponible | no disponible | texto, imagen, audio, video | apache-2.0 | safetensors BF16 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada. La comparativa directa mas relevante es con el checkpoint base BF16, que ofrece carga directa con Transformers y mayor precision a cambio de mayor consumo de memoria, mientras que esta variante NVFP4 prioriza eficiencia de memoria a costa de requerir un runtime parcheado especifico.

## Limitaciones y advertencias

- Modelo cuantizado: la cuantizacion NVFP4 puede introducir perdida de precision respecto al checkpoint BF16; no se han publicado evaluaciones comparativas de calidad entre ambas variantes.
- No cargable directamente con Transformers: requiere vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin, lo que limita la portabilidad y complica el despliegue.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada; el ejemplo de serving usa 8192 tokens, lo que puede ser insuficiente para videos largos o conversaciones extensas.
- Concurrencia baja en la configuracion de referencia (`max-num-seqs 1`), lo que puede limitar el throughput en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje multimodales; no se documentan evaluaciones de fidelidad en transcripcion o descripcion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero los componentes de terceros quedan sujetos a sus terminos originales, segun se indica en la documentacion del proyecto.
- Requiere el parche de runtime de WeMM y las imagenes Docker del proyecto para un despliegue correcto; no se garantiza funcionamiento con versiones estandar de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-NVFP4
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Video-9B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Coleccion de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guia de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalacion del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Licencia del proyecto y atribuciones: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
