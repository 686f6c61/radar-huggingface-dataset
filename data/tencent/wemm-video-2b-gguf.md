# tencent/WeMM-Video-2B-GGUF

## Resumen

WeMM-Video-2B es un modelo multimodal bilingüe chino-inglés desarrollado por Tencent para comprensión y razonamiento conjunto de audio y vídeo. Acepta texto, imágenes, audio y vídeo como entrada y genera respuestas en texto, lo que lo sitúa en la categoría de modelos image-text-to-text con extensión a modalidades audiovisuales. El repositorio aquí descrito es la variante cuantizada en formato GGUF Q4_K_M del modelo base `tencent/WeMM-Video-2B`.

La relevancia de esta ficha concreta reside en el formato: se distribuye como un paquete de tres ficheros GGUF (`language.gguf`, `mmproj.gguf` y `audio.gguf`) pensados para el runtime nativo de WeMM, lo que permite ejecución en CPU con offload opcional a CUDA. Esto facilita el despliegue en entornos sin GPU de gran capacidad, algo poco habitual en modelos que combinan vídeo y audio.

El modelo base declara 1.070.382.088 parámetros según los pesos en safetensors, pese a la nomenclatura comercial "2B". La licencia es Apache 2.0 y los idiomas soportados declarados son inglés y chino. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en los tags del repositorio; requiere `custom_code`) |
| Parametros totales | 1.070.382.088 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (tensores seleccionados de atención y entrada/salida en BF16) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres ficheros: `language.gguf` 2,34 GiB, `mmproj.gguf` 0,62 GiB, `audio.gguf` 1,99 GiB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` asociada al repositorio y de la presencia de tres componentes separados: un modelo de lenguaje con tokenizador y plantilla de chat, un codificador visual con proyector (`mmproj.gguf`) y un codificador de audio con proyector (`audio.gguf`). Esta separación en módulos independientes es típica de las arquitecturas multimodales con encoders especializados conectados a un LLM mediante proyectores.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card únicamente indica que el runtime nativo de WeMM validó la generación en texto, imagen, audio y vídeo con pista de sonido sobre el bundle cuantizado.

## Capacidades

- Generación de texto a partir de entradas multimodales: texto, imagen, audio y vídeo.
- Comprensión de vídeo por fotogramas (parámetro `--max-frames`, con ejemplo de 16 fotogramas) y de vídeo con banda sonora original (`--video-audio`).
- Transcripción de voz en audio (el ejemplo de la model card pide transcribir discurso en inglés).
- Descripción de imágenes (ejemplo con una fotografía de la Tierra del Apolo 11).
- Razonamiento aritmético simple en texto (ejemplo de cálculo de hora de fin de reunión).
- Procesamiento conjunto de escena visual y discurso para resumen simultáneo.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Análisis de reuniones grabadas: el modelo puede procesar vídeo con audio (`--video-audio`) para describir la escena y resumir el discurso, útil en herramientas de actas automáticas donde se necesita contexto visual y transcripción en una sola pasada.
- Indexación y descripción de archivos audiovisuales: con `--video` y un límite de fotogramas configurable, permite generar descripciones textuales de material de archivo para catálogos y sistemas de búsqueda.
- Transcripción de audio en inglés o chino: el componente `audio.gguf` permite convertir grabaciones a texto, adecuado para subtitulado o documentación de entrevistas en entornos bilingües.
- Accesibilidad de contenido visual: descripción de imágenes y escenas de vídeo para generar texto alternativo o narraciones, aprovechando el codificador visual separado.
- Despliegue en CPU sin GPU: al distribuirse como GGUF con runtime nativo y offload opcional a CUDA, encaja en estaciones de trabajo sin acelerador o en servidores con GPUs modestas para tareas de procesamiento por lotes.
- Prototipado e investigación multimodal: al ser un paquete de ~5 GB con licencia Apache 2.0, es viable para experimentación académica con vídeo y audio sin infraestructura de gran escala.
- Verificación de contenido audiovisual: combinación de descripción de escena y resumen de discurso para moderación o auditoría de material grabado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona comprobaciones de generación completadas por el runtime nativo en CPU para texto, imagen, audio y vídeo con banda sonora, sin cifras de latencia ni throughput.

## Requisitos de hardware

- Tamaño total del bundle: aproximadamente 4,95 GiB sumando los tres ficheros GGUF (2,34 + 0,62 + 1,99 GiB), más overhead del runtime.
- VRAM estimada: no disponible de forma explícita; por el tamaño del paquete, el offload completo a GPU requeriría del orden de 5-6 GB de VRAM, aunque no se documenta oficialmente.
- El runtime nativo está validado en CPU (`native/install-cpu/bin`), por lo que puede ejecutarse sin GPU.
- GPU recomendadas: no disponible. La model card solo menciona offload opcional a CUDA sin especificar modelos.
- Cabe en GPUs de consumo con 8 GB o más de VRAM si se realiza offload completo, aunque este dato es una estimación basada en el tamaño de los ficheros y no está confirmado por el autor.
- Opciones de despliegue: runtime nativo de WeMM (`native/run_hf.py` con `huggingface_hub`). No se menciona compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de información sobre alternativas comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con cifras. Como referencia estructural, el modelo se posiciona en la categoría de modelos multimodales pequeños (en torno a 1.000 millones de parámetros efectivos) con soporte de vídeo y audio, un nicho con pocos competidores de este tamaño y licencia permisiva. Cualquier comparación cuantitativa quedaría fuera de la información disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, transcripción o descripción visual es desconocido.
- Riesgo de alucinación inherente a los modelos generativos; sin datos de evaluación no puede acotarse.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo base en BF16, aunque se preservan tensores críticos de atención y E/S en BF16.
- El repositorio requiere `custom_code` y el runtime nativo propio; no es un GGUF estándar cargable directamente en llama.cpp u Ollama según la información disponible.
- Deben mantenerse los tres ficheros GGUF en la misma revisión del Hub; mezclar revisiones puede romper la carga.
- La nomenclatura "2B" del nombre no coincide con los 1.070.382.088 parámetros declarados en safetensors, lo que puede generar confusión sobre el tamaño real.
- Licencia Apache 2.0 para el modelo, pero los componentes de terceros quedan sujetos a sus propios términos, según indica la model card.
- No se documentan sesgos específicos ni limitaciones de longitud de contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Proyecto en GitHub: https://github.com/Tencent/WeMM-Video
- Guía del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Colección de modelos WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
