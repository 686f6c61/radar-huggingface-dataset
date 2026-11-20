# tencent/WeMM-Video-4B-GGUF

## Resumen

WeMM-Video-4B-GGUF es la distribucion cuantizada en formato GGUF del modelo multimodal WeMM-Video-4B, desarrollado por Tencent. Se trata de una familia bilingue chino-ingles orientada a la comprension y el razonamiento conjunto de audio y video: acepta texto, imagenes, audio y video como entrada, y genera respuestas en texto. Esta variante concreta emplea la receta de cuantizacion Q4_K_M y esta pensada para ejecutarse con el runtime nativo propio del proyecto WeMM, no con llama.cpp generico.

El bundle se reparte en tres ficheros GGUF independientes: el modelo de lenguaje con tokenizador y plantilla de chat (4,90 GiB), el codificador visual con su proyector (0,63 GiB) y el codificador de audio con su proyector (2,00 GiB). La receta Q4_K_M mantiene en BF16 determinados tensores de atencion y de entrada/salida, lo que busca preservar calidad en las partes mas sensibles del modelo a costa de un tamano algo mayor.

Es relevante porque permite desplegar un modelo multimodal audio-visual en entornos con recursos limitados, incluido el runtime de CPU, manteniendo licencia Apache 2.0. El modelo base se apoya en la arquitectura qwen3_5 segun las etiquetas del repositorio, aunque la informacion disponible no detalla la configuracion interna de esa arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tags del repositorio); multimodal audio-visual con codificador visual y codificador de audio separados |
| Parametros totales | 1.072.483.848 (dato de safetensors del modelo base); el nombre comercial indica "4B", discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (con tensores de atencion y entrada/salida seleccionados en BF16) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (language.gguf, mmproj.gguf, audio.gguf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen3_5 y de la estructura del bundle: un modelo de lenguaje principal, un codificador visual con proyector (mmproj) y un codificador de audio con proyector independiente. Esta separacion en tres componentes es la habitual en los modelos multimodales que inyectan representaciones de imagen y audio en el espacio del modelo de lenguaje mediante proyectores. No se especifica si el modelo de lenguaje es denso o MoE, ni el numero de capas, cabezas o dimension oculta.

Tampoco se han publicado en la informacion proporcionada datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente indica que el modelo esta disenado para comprension y razonamiento audio-visual conjunto en chino e ingles. La innovacion tecnica destacable de esta variante es la receta de cuantizacion Q4_K_M con proteccion en BF16 de tensores criticos, documentada en `scope.json` y `manifest.json`, y la existencia de un runtime nativo propio con soporte de offload a CUDA.

## Capacidades

- Generacion de texto a partir de prompts puramente textuales.
- Comprension de imagenes: descripcion de contenido visual y respuesta a preguntas sobre la imagen.
- Comprension de audio: transcripcion de voz y resumen del habla en una grabacion.
- Comprension de video: descripcion de lo que ocurre en pantalla a partir de fotogramas, con control del numero maximo de fotogramas (`--max-frames`).
- Comprension conjunta de video y audio: analisis simultaneo de fotogramas y banda sonora original (`--video-audio`).
- Razonamiento basico sobre el contenido, incluyendo preguntas de calculo sencillo planteadas en texto.
- Bilinguismo chino-ingles en entrada y salida.
- Soporte de plantilla de chat incluida en `language.gguf`.

No se documenta en la informacion disponible soporte de tool calling, function calling, razonamiento multi-paso con agentes, modo thinking explicito ni salida de audio.

## Casos de uso

- Transcripcion y resumen de reuniones o grabaciones: el modelo acepta un fichero de audio y devuelve la transcripcion del habla, lo que permite generar actas o resumenes a partir de la banda sonora de una reunion.
- Analisis de video con narracion: usando `--video-audio`, se pueden procesar grabaciones donde importa tanto lo que se ve como lo que se dice, por ejemplo clases grabadas o demos tecnicas, y obtener una descripcion combinada de escena y discurso.
- Descripcion de imagenes para accesibilidad: a partir de una imagen se genera una descripcion textual del contenido, util para alt-text automatizado o asistencia a personas con discapacidad visual.
- Moderacion de contenido audiovisual: el modelo puede describir que ocurre en un clip y resumir el audio asociado, lo que sirve como primera pasada de revision en plataformas con volumen alto de video.
- Extraccion de informacion de videos de vigilancia o monitorizacion: con un limite de fotogramas configurable, se puede muestrear un clip y pedir una descripcion de los eventos visibles, ajustando el coste computacional al numero de fotogramas.
- Despliegue en entornos con CPU: el runtime nativo incluye una instalacion para CPU (`native/install-cpu`), lo que permite prototipar comprension de imagen, audio y video sin GPU dedicada.
- Procesamiento por lotes de contenido multimedia en pipelines internos: al estar en GGUF y con licencia Apache 2.0, se puede integrar en flujos de enriquecimiento de catalogo o archivo de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que el runtime nativo de CPU cargo el bundle y completo comprobaciones de generacion para texto, imagen, audio y video con banda sonora, sin cifras de calidad ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle completo ocupa aproximadamente 7,5 GiB en disco (4,90 + 0,63 + 2,00 GiB); en memoria, el modelo de lenguaje Q4_K_M ronda los 4,9 GiB y el codificador de audio anade unos 2,0 GiB, por lo que se necesita del orden de 7-8 GiB de memoria para cargar todos los componentes, mas el espacio de trabajo de contexto.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, una GPU consumer con 8-12 GiB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080) seria el minimo razonable para cargar el bundle completo; GPU de datacenter como A100 o H100 no son necesarias por tamano, aunque no hay datos de rendimiento que lo confirmen.
- Cabe en GPU consumer: si, segun el calculo anterior, aunque la informacion disponible no lo verifica explicitamente.
- Opciones de despliegue: runtime nativo de WeMM (`native/run_hf.py`), con soporte de offload a CUDA documentado en la guia nativa. No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI; el uso de llama.cpp generico no esta documentado y el modelo declara `custom_code`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria (multimodal audio-visual bilingue de ~4B) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La discrepancia entre el nombre comercial "4B" y el recuento de parametros de safetensors (1.072.483.848) no se explica en la informacion disponible; conviene verificar el tamano real antes de dimensionar infraestructura.
- El modelo solo soporta ingles y chino; no se documenta cobertura de otros idiomas.
- La longitud de contexto no esta publicada, lo que impide planificar cargas de video o audio largos con garantias.
- No se documentan capacidades de tool calling, agentes ni modo thinking; no deben asumirse.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en descripcion de escenas ambiguas o transcripcion de audio con ruido; no hay evaluaciones publicadas que lo cuantifiquen.
- El bundle requiere los tres ficheros GGUF en la misma revision del Hub; mezclar revisiones puede romper la carga.
- El despliegue esta atado al runtime nativo de WeMM; no se documenta compatibilidad con ecosistemas estandar como llama.cpp u Ollama, lo que limita la portabilidad.
- La licencia Apache 2.0 cubre el modelo, pero los componentes de terceros incluidos siguen sujetos a sus terminos originales, segun indica la model card.
- No se han publicado sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-4B
- Proyecto en GitHub: https://github.com/Tencent/WeMM-Video
- Coleccion de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guia del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
