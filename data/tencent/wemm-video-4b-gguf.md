# tencent/WeMM-Video-4B-GGUF

## Resumen

WeMM-Video-4B-GGUF es la distribucion cuantizada en formato GGUF (receta Q4_K_M) del modelo multimodal WeMM-Video-4B, desarrollado por Tencent. Se trata de un modelo bilingue chino-ingles disenado para comprension y razonamiento conjunto de audio y video: acepta texto, imagenes, audio y video como entrada y genera respuestas de texto. La familia WeMM-Video se presenta como una apuesta por la comprension omni-modal de video en codigo abierto, con un informe tecnico publicado en arXiv (2611.26409).

El bundle GGUF se compone de tres ficheros complementarios: `language.gguf` (modelo de lenguaje, tokenizer y plantilla de chat, 4,90 GiB), `mmproj.gguf` (codificador visual y proyector, 0,63 GiB) y `audio.gguf` (codificador de audio y proyector, 2,00 GiB). La receta Q4_K_M preserva en BF16 determinados tensores de atencion y de entrada/salida, y esta pensada para ejecutarse con el runtime nativo propio de WeMM, no con llama.cpp generico.

La relevancia de esta ficha radica en que ofrece una via de despliegue compacta (unos 7,5 GiB de pesos en total) para un modelo que combina vision, audio y video, con licencia Apache 2.0 y soporte de modos thinking e instruct. El numero de parametros reportado en safetensors para el modelo base es de 1.072.483.848, dato que conviene contrastar con la denominacion comercial "4B" del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal basada en Qwen3.5 (tag `qwen3_5`), con codificador visual, codificador de audio y proyectores; requiere `custom_code` |
| Parametros totales | 1.072.483.848 (segun safetensors del modelo base); la denominacion comercial es "4B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repositorio), con tensores selectos de atencion y entrada/salida en BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (componentes de terceros sujetos a sus terminos originales) |
| Formato de pesos | GGUF (tres ficheros: `language.gguf`, `mmproj.gguf`, `audio.gguf`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por un modelo de lenguaje base de la familia Qwen3.5 (identificado por el tag `qwen3_5`), un codificador visual con su proyector (`mmproj.gguf`) y un codificador de audio con su proyector (`audio.gguf`). El pipeline declarado es `video-text-to-text`, lo que indica que la salida es siempre texto aunque la entrada combine imagen, audio y video. El repositorio incluye codigo personalizado (`custom_code`), de modo que la carga no es posible con runtimes estandar sin adaptacion.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. El informe tecnico citado (arXiv 2611.26409, "WeMM-Video: Pushing the Frontiers of Open-Source Omni-Modal Video Understanding") es la referencia para esos detalles. La model card menciona dos modos de operacion, thinking e instruct, con parametros de muestreo recomendados distintos por modalidad, lo que sugiere un entrenamiento orientado a razonamiento explicito en el modo thinking.

## Capacidades

- Generacion de texto a partir de entradas de solo texto, con soporte de tareas aritmeticas y de razonamiento (el ejemplo oficial resuelve un calculo de horarios).
- Comprension de imagenes: descripcion de contenido visual, con codificador visual dedicado.
- Comprension de audio: transcripcion de voz y resumen de contenido hablado.
- Comprension de video silencioso: descripcion de lo que ocurre en pantalla a partir de fotogramas muestreados (`--max-frames`).
- Comprension de video con banda sonora (`--video-audio`): combina analisis visual y de audio en una misma respuesta.
- Modo thinking: razonamiento explicito con parametros de muestreo propios (temperature 0,6-1,0 segun modalidad, top_p 0,95, top_k 20).
- Modo instruct: respuestas directas para tareas generales.
- Bilinguismo chino-ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.

## Casos de uso

- Analisis de reuniones y videollamadas: el modelo puede procesar el video y la pista de audio de una reunion para resumir lo tratado y transcribir las intervenciones, usando la modalidad `--video-audio` con un limite de fotogramas configurable.
- Moderacion y catalogacion de contenido audiovisual: descripcion automatica de escenas y deteccion de contenido hablado para generar metadatos de bibliotecas de video, aprovechando la salida de texto estructurada.
- Subtitulado y transcripcion asistida: la modalidad de audio permite transcribir discursos en ingles o chino, y la de video anade contexto visual a la transcripcion.
- Asistencia a personas con discapacidad visual: descripcion de imagenes y videos en tiempo de ejecucion sobre el runtime nativo, con un bundle de menos de 8 GiB que cabe en equipos modestos.
- Analisis de material de vigilancia o deportivo: descripcion de eventos en secuencias de video muestreadas por fotogramas, util para preetiquetado de clips antes de revision humana.
- Procesamiento por lotes en CPU: el runtime nativo de WeMM valida la generacion en CPU para texto, imagen, audio y video, lo que permite desplegar el modelo en servidores sin GPU para tareas de volumen medio.
- Investigacion en comprension omni-modal: punto de partida reproducible (licencia Apache 2.0, pesos GGUF) para experimentos academicos con audio y video conjuntos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de evaluacion de WeMM-Video-35B-A3B para la comparativa del informe tecnico, pero no incluye cifras propias de este bundle de 4B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 7,5 GiB (4,90 + 0,63 + 2,00 GiB), por lo que se necesita un minimo de unos 8-10 GiB de VRAM para cargar el bundle completo en GPU, mas el espacio de cache KV segun la longitud de contexto.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permiten cargar el bundle con holgura; una GPU de 12 GB podria ser suficiente con contexto corto.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 12 GB o mas; el codificador de audio (2,00 GiB) es el componente mas pesado despues del modelo de lenguaje.
- Opciones de despliegue: runtime nativo de WeMM (con soporte de offload a CUDA segun la guia `native/README.md`) y `native/run_hf.py` para descarga desde el Hub. No se indica compatibilidad con llama.cpp, Ollama, vLLM o TGI; el uso de `custom_code` y de tres ficheros GGUF separados sugiere que los runtimes genericos no son compatibles sin adaptacion.
- Latencia y throughput: no disponible. La validacion oficial se limita a comprobar que el runtime nativo en CPU completa la generacion para las cuatro modalidades.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-4B-GGUF (este) | 1.072.483.848 en safetensors (denominacion 4B) | no disponible | texto, imagen, audio, video | Apache 2.0 | GGUF Q4_K_M en Hugging Face |
| WeMM-Video-35B-A3B | no disponible | no disponible | texto, imagen, audio, video | no disponible | Hugging Face (referenciado en la model card) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada en la informacion proporcionada es con el modelo hermano WeMM-Video-35B-A3B, de mayor tamano y con arquitectura MoE segun su denominacion (A3B). No se dispone de datos de benchmarks ni de especificaciones completas de ese modelo en esta ficha.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- No se han publicado resultados de benchmarks para este bundle, por lo que el rendimiento real en tareas de video y audio no esta cuantificado.
- El modelo requiere el runtime nativo de WeMM y codigo personalizado; no es directamente compatible con llama.cpp, Ollama, vLLM ni TGI, lo que limita las opciones de despliegue estandar.
- Los tres ficheros GGUF deben mantenerse en la misma revision del Hub; mezclar revisiones puede producir fallos de carga o resultados incorrectos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo multimodal, es esperable en descripciones de contenido visual o audiovisual ambiguo.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache 2.0 cubre el modelo, pero los componentes de terceros (codificadores, modelo base Qwen3.5) quedan sujetos a sus terminos originales, que deben revisarse antes de uso comercial.
- La discrepancia entre la denominacion "4B" y los 1.072.483.848 parametros reportados en safetensors conviene verificarla en el repositorio del modelo base antes de dimensionar infraestructura.
- La validacion oficial del bundle se limita a comprobar que la generacion se completa; no se documentan pruebas de calidad ni de robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-4B
- Coleccion WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26409
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guia del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Ejecucion desde el Hub: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md#run-from-the-hub
- Licencia y atribucion de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
- Evaluacion de WeMM-Video-35B-A3B: https://huggingface.co/tencent/WeMM-Video-35BA3B#evaluation
