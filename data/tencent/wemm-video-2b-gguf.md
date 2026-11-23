# tencent/WeMM-Video-2B-GGUF

## Resumen

WeMM-Video-2B es un modelo multimodal ómnibus desarrollado por Tencent que aborda la comprensión y el razonamiento conjuntos de audio y vídeo. Forma parte de la familia WeMM-Video, una línea de modelos bilingües chino-inglés que aceptan texto, imágenes, audio y vídeo como entrada y generan respuestas textuales. El modelo se presenta como una solución de extremo a extremo para tareas de video-text-to-text, con capacidad de procesar la pista de audio original junto con los fotogramas del vídeo.

Esta ficha corresponde específicamente al bundle GGUF Q4_K_M de WeMM-Video-2B, una versión cuantizada del modelo base `tencent/WeMM-Video-2B` destinada al runtime nativo WeMM. El bundle se compone de tres archivos GGUF (modelo de lenguaje, codificador visual y codificador de audio) que deben mantenerse en la misma revisión del Hub. El repositorio tiene 1.070.382.088 parámetros según los pesos en safetensors del modelo base y un tamaño total de 5,3 GB.

La relevancia de esta versión radica en que permite ejecutar un modelo multimodal de audio y vídeo en CPU mediante el runtime nativo de WeMM, con opción de offload a CUDA, lo que reduce la barrera de hardware para tareas de comprensión audiovisual. La licencia Apache 2.0 facilita su adopción en entornos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en el repo; familia WeMM-Video) |
| Parámetros totales | 1.070.382.088 (según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (con tensores de atención y entrada/salida seleccionados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tres archivos: `language.gguf`, `mmproj.gguf`, `audio.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5` asociada al repositorio y de su pertenencia a la familia WeMM-Video. El bundle GGUF se organiza en tres componentes diferenciados: un modelo de lenguaje con tokenizador y plantilla de chat (`language.gguf`, 2,34 GiB), un codificador visual con proyector (`mmproj.gguf`, 0,62 GiB) y un codificador de audio con proyector (`audio.gguf`, 1,99 GiB). Esta separación refleja una arquitectura multimodal con torres especializadas para visión y audio conectadas al modelo de lenguaje mediante proyectores.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card remite al informe técnico (arXiv:2611.26409) y a la página de evaluación de WeMM-Video-35B-A3B para obtener los resultados comparativos de benchmarks. La receta de cuantización Q4_K_M protege determinados tensores de atención y de entrada/salida en BF16, lo que preserva precisión en capas críticas.

## Capacidades

- Comprensión conjunta de audio y vídeo: procesa fotogramas de vídeo junto con la pista de sonido original para tareas de descripción y resumen combinados.
- Comprensión de imágenes: acepta imágenes estáticas y genera descripciones textuales.
- Transcripción y comprensión de audio: procesa grabaciones de audio para transcripción y análisis del habla.
- Generación de texto y razonamiento: responde a prompts textuales, incluyendo problemas aritméticos y de razonamiento (el ejemplo de la model card plantea un cálculo de horarios).
- Procesamiento de vídeo con control de fotogramas: permite limitar el número de frames procesados mediante el parámetro `--max-frames`.
- Modalidad bilingüe chino-inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio especial: no disponible en la información proporcionada más allá de las capacidades multimodales descritas.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar el vídeo de una reunión junto con su audio para generar resúmenes de lo tratado y de lo dicho, combinando la descripción visual de la escena con la transcripción del habla.
- Accesibilidad audiovisual: generación de descripciones de escenas y subtitulado combinado para contenido de vídeo, útil para personas con discapacidad visual o auditiva, aprovechando el procesamiento simultáneo de fotogramas y sonido.
- Moderación de contenido multimedia: análisis de vídeos subidos por usuarios para detectar y describir contenido relevante a partir de las imágenes y del audio, con despliegue en CPU mediante el runtime nativo.
- Indexación y búsqueda de archivos de vídeo: generación de descripciones textuales de fragmentos de vídeo que alimenten un índice de búsqueda semántica, controlando el número de fotogramas por fragmento para ajustar el coste computacional.
- Transcripción y análisis de grabaciones de audio: procesamiento de entrevistas, ponencias o notas de voz para obtener transcripciones y resúmenes, en inglés o chino.
- Asistencia en entornos con hardware limitado: al ejecutarse con el runtime nativo en CPU y con un bundle de 5,3 GB, permite prototipar pipelines de comprensión audiovisual sin GPU dedicada, con offload opcional a CUDA.
- Descripción de imágenes para catalogación: generación automática de metadatos textuales para bibliotecas de imágenes, como en el ejemplo de la model card sobre una fotografía de la Tierra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la página de evaluación de WeMM-Video-35B-A3B y al informe técnico (arXiv:2611.26409) para los resultados comparativos, pero no incluye cifras en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El bundle completo ocupa 5,3 GB en disco (2,34 GiB de lenguaje + 0,62 GiB de visión + 1,99 GiB de audio), por lo que la memoria necesaria en inferencia será del orden de varios gigabytes, dependiendo del runtime y del offload.
- GPU recomendadas: no disponible. La model card menciona offload a CUDA mediante el runtime nativo, pero no especifica modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el runtime nativo está diseñado para ejecución en CPU.
- Opciones de despliegue: runtime nativo WeMM (build CPU con offload CUDA opcional) a través de `native/run_hf.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoría que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano u otras lenguas.
- Longitud de contexto no documentada en la información disponible, lo que impide planificar tareas con ventanas largas.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se han publicado evaluaciones específicas de fidelidad en esta ficha.
- Sesgos conocidos: no documentados en la información disponible.
- El bundle GGUF requiere el runtime nativo WeMM y que los tres archivos (`language.gguf`, `mmproj.gguf`, `audio.gguf`) permanezcan en la misma revisión del Hub; mezclar revisiones puede producir fallos.
- La validación reportada por el autor se limita a comprobaciones de generación en CPU para texto, imagen, audio y vídeo con banda sonora; no se detallan métricas de calidad.
- Licencia Apache 2.0 para el modelo, pero los componentes de terceros incluidos quedan sujetos a sus términos originales, según se indica en el repositorio GitHub del proyecto.
- El número de parámetros indicado (1.070.382.088) corresponde a los safetensors del modelo base; el bundle GGUF puede presentar un recuento distinto tras la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Evaluación de WeMM-Video-35B-A3B: https://huggingface.co/tencent/WeMM-Video-35BA3B#evaluation
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
