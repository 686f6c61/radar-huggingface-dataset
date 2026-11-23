# tencent/WeMM-Video-4B-GGUF

## Resumen

WeMM-Video-4B-GGUF es la distribucion cuantizada en formato GGUF (receta Q4_K_M) del modelo multimodal WeMM-Video-4B, desarrollado por Tencent. Se trata de un modelo bilingue chino-ingles disenado para comprension y razonamiento conjunto de audio y video: acepta texto, imagenes, audio y video como entrada y genera respuestas de texto. Forma parte de la familia WeMM-Video, que incluye variantes de mayor tamano como WeMM-Video-35B-A3B.

El bundle GGUF no es un unico archivo, sino un conjunto de tres componentes que deben mantenerse en la misma revision del Hub: `language.gguf` (modelo de lenguaje, tokenizer y plantilla de chat, 4,90 GiB), `mmproj.gguf` (codificador visual y proyector, 0,63 GiB) y `audio.gguf` (codificador de audio y proyector, 2,00 GiB). La receta Q4_K_M preserva en BF16 determinados tensores de atencion y de entrada/salida, segun el alcance de precision declarado en `scope.json`.

El modelo esta pensado para ejecutarse con el runtime nativo propio de WeMM (WeMM native runtime), que soporta offload a CUDA, y esta publicado bajo licencia Apache 2.0. Su relevancia actual radica en que ofrece comprension omni-modal (video con banda sonora, audio e imagen) en un tamano contenido y con cuantizacion de 4 bits, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en el Hub; runtime nativo WeMM) |
| Parametros totales | 1.072.483.848 (safetensors del modelo base); el nombre comercial indica 4B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (tensores seleccionados de atencion y entrada/salida en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (componentes de terceros sujetos a sus terminos originales) |
| Formato de pesos | GGUF (`language.gguf`, `mmproj.gguf`, `audio.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base WeMM-Video-4B mas alla de su caracter multimodal: combina un modelo de lenguaje con un codificador visual y proyector (`mmproj`) y un codificador de audio y proyector (`audio`), empaquetados como componentes GGUF separados. La etiqueta del repositorio en Hugging Face incluye `qwen3_5`, lo que sugiere una base de la familia Qwen 3.5, pero no se confirma en la model card. El modelo pertenece a la familia WeMM-Video, descrita como bilingue chino-ingles para comprension y razonamiento audio-visual conjunto.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card remite al informe tecnico (arXiv 2611.26409) y a la pagina de evaluacion de WeMM-Video-35B-A3B para los detalles de entrenamiento y comparativas de benchmark. La validacion declarada por el autor consiste en que el runtime nativo de CPU cargo el bundle y completo comprobaciones de generacion para texto, imagen, audio y video con banda sonora.

## Capacidades

- Generacion de texto a partir de prompts unicamente textuales (por ejemplo, razonamiento aritmetico simple: "A 20-minute meeting starts at 09:45. When does it end?").
- Comprension de imagen: descripcion de contenido visual a partir de una imagen de entrada.
- Comprension de audio: transcripcion de voz, como se muestra en el ejemplo con una grabacion en ingles.
- Comprension de video: descripcion de lo que ocurre en pantalla a partir de fotogramas (`--video`, con control del numero de fotogramas via `--max-frames`).
- Comprension conjunta de video y audio: descripcion de la escena y resumen del habla a partir de los fotogramas y la banda sonora original (`--video-audio`).
- Modalidad de salida exclusivamente textual (pipeline `video-text-to-text`).
- Capacidades multilingues limitadas a ingles y chino.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Transcripcion y resumen de reuniones grabadas: el modelo puede procesar el video de una reunion junto con su banda sonora mediante `--video-audio` para describir la escena y resumir el habla, lo que resulta adecuado para generar actas automaticas a partir de grabaciones.
- Indexacion y descripcion de archivos audiovisuales: uso de `--video` con un numero controlado de fotogramas (`--max-frames`) para producir descripciones textuales de cada clip, utiles como metadatos en un sistema de busqueda o catalogo de medios.
- Accesibilidad: generacion de descripciones textuales de contenido visual y resumen del audio para personas con discapacidad auditiva o visual, aprovechando la entrada conjunta de video y sonido.
- Transcripcion de audio en ingles y chino: el componente `audio.gguf` permite transcribir grabaciones de voz, como se demuestra en el ejemplo de la model card con una grabacion en ingles.
- Analisis de contenido en redes sociales o plataformas de video: procesamiento de clips cortos para clasificacion tematica, moderacion asistida o generacion de resumenes, en un tamano que cabe en el repo de 8,1 GB y puede ejecutarse con offload a CUDA.
- Asistencia en entornos con recursos limitados: al estar cuantizado en Q4_K_M y contar con un runtime de CPU validado, es viable para prototipos en estaciones de trabajo sin GPU dedicada o para despliegues de borde con offload parcial.
- Descripcion de imagenes sueltas: uso con `--image` para generar pies de foto o descripciones de contenido visual en pipelines de documentacion o catalogacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de evaluacion de WeMM-Video-35B-A3B y al informe tecnico (arXiv 2611.26409) para las comparativas de benchmark, pero no incluye cifras concretas para esta variante de 4B ni para su cuantizacion GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de tamano, el bundle Q4_K_M suma aproximadamente 7,5 GiB en disco (4,90 + 0,63 + 2,00 GiB), por lo que la inferencia completa requiere al menos ese orden de memoria si se cargan los tres componentes.
- GPU recomendadas: no disponible. El runtime nativo documenta offload a CUDA, pero la model card no especifica modelos de GPU soportados ni minimos.
- Ajuste en GPU de consumo: no confirmado en la informacion disponible; el tamano del bundle sugiere que podria requerir GPUs con 8-12 GB de VRAM o mas si se cargan todos los componentes, pero es una estimacion no verificada.
- Opciones de despliegue: runtime nativo WeMM (build de CPU en `native/install-cpu/bin`, con offload a CUDA segun la guia nativa) y `huggingface_hub` para la descarga de componentes. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Video-4B-GGUF | 1.072.483.848 (safetensors del base); nombre comercial 4B | no disponible | texto, imagen, audio, video -> texto | Apache 2.0 | GGUF Q4_K_M |
| WeMM-Video-35B-A3B | no disponible en la informacion | no disponible | omni-modal (familia WeMM-Video) | no disponible en la informacion | no disponible |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con la variante mayor de la propia familia, WeMM-Video-35B-A3B, para la que la model card remite a su pagina de evaluacion sin ofrecer cifras en este repositorio. No se dispone de datos de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; no hay soporte documentado de castellano ni de otros idiomas.
- Modalidad de salida limitada a texto; no genera imagen, audio ni video.
- No se documenta soporte de tool calling, function calling ni uso agentico, lo que limita su integracion en pipelines que requieran invocacion de herramientas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo multimodal, puede producir descripciones o transcripciones inexactas, especialmente en audio con ruido o video de baja calidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Longitud de contexto: no disponible, lo que impide planificar el procesamiento de videos largos sin validacion previa.
- Dependencia de runtime propio: el bundle esta pensado para el WeMM native runtime y no se confirma compatibilidad con ecosistemas estandar como llama.cpp, Ollama o vLLM, lo que puede complicar el despliegue en infraestructura existente.
- Integridad del bundle: los tres archivos GGUF (`language.gguf`, `mmproj.gguf`, `audio.gguf`) deben mantenerse en la misma revision del Hub; mezclar revisiones puede romper la inferencia.
- Licencia: Apache 2.0 para el modelo, pero los componentes de terceros quedan sujetos a sus terminos originales, que deben revisarse antes de un uso comercial.
- Precision: la cuantizacion Q4_K_M con tensores de atencion y entrada/salida en BF16 puede degradar ligeramente la calidad frente al modelo base en tareas exigentes; no se han publicado metricas de esa degradacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-4B
- Coleccion WeMM-Video en Hugging Face: https://huggingface.co/collections/tencent/wemm-video
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26409
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guia del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Evaluacion de WeMM-Video-35B-A3B: https://huggingface.co/tencent/WeMM-Video-35BA3B#evaluation
- Licencia y atribucion de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
