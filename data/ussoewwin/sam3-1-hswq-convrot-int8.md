# ussoewwin/SAM3.1-HSWQ-ConvRot-INT8

## Resumen

SAM3.1-HSWQ-ConvRot-INT8 es una versión cuantizada del modelo de segmentación Segment Anything Model 3.1 (SAM 3.1) en su variante Multiplex, publicada por el usuario ussoewwin. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos del checkpoint original de Comfy-Org/sam3.1 (derivado a su vez de facebook/sam3.1) aplicando el pipeline de cuantización HSWQ (Hybrid-Sensitivity-Weighted-Quantization) con esquema ConvRot INT8. El resultado es un checkpoint de aproximadamente 1,74 GB en formato safetensors, cargable de forma nativa en ComfyUI mediante el nodo `UNetLoader`.

El modelo resuelve la tarea de segmentación de imágenes y vídeo, incluyendo segmentación guiada por prompts y el modo Multiplex que permite gestionar múltiples objetos o entidades en una misma inferencia. Su relevancia actual radica en que reduce el peso del checkpoint frente al original FP16 y habilita operaciones INT8 Tensor Core en hardware compatible, manteniendo el resto del checkpoint en FP16. La reducción de tamaño es, sin embargo, modesta: según la propia model card, apenas un 0,4 % respecto al fichero FP16 de origen, porque solo 41 de las 221 capas Linear activas en tiempo de ejecución se cuantizan.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en los repositorios enlazados por el autor. No hay datos de benchmarks, composición del dataset de entrenamiento ni detalles de arquitectura interna más allá de la referencia a SAM 3.1 y al esquema de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3.1 Multiplex (Segment Anything Model 3.1), transformer de segmentación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HSWQ ConvRot INT8 (`int8_tensorwise`); 41 de 221 capas Linear cuantizadas, resto en FP16 |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | SAM License (Meta SAM License), etiquetada como `other` / `sam-license` |
| Formato de pesos | safetensors (`sam3.1_multiplex_hswq_convrot_int8.safetensors`, ~1.738,2 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SAM 3.1 en variante Multiplex, orientada a segmentación de imágenes y vídeo con soporte para múltiples entidades. No se dispone de información publicada sobre el número de parámetros totales, la composición del dataset de entrenamiento, el número de tokens de imagen procesados ni sobre si hubo fases de ajuste fino con refuerzo o preferencias. La model card no documenta innovaciones arquitectónicas propias más allá de las del SAM 3.1 original.

La contribución técnica de esta publicación es el pipeline de cuantización HSWQ ConvRot INT8. Se trata de una cuantización híbrida ponderada por sensibilidad: solo se convierten a INT8 aquellas capas Linear consideradas seguras según el criterio del framework (41 de 221 capas activas en runtime), mientras el resto del checkpoint permanece en FP16. El fichero incluye metadatos de cabecera `comfy_quant` que ComfyUI detecta automáticamente para ejecutar operaciones INT8 Tensor Core. El autor publica además una auditoría de backdoor con veredictos, cobertura de pesos y procedimiento en el repositorio del framework; los límites de esa medición se detallan en el mismo documento.

## Capacidades

- Segmentación de imágenes con prompts (puntos, cajas, máscaras) al estilo Segment Anything.
- Segmentación de vídeo, según la etiqueta `video-segmentation` del repositorio.
- Modo Multiplex: gestión de múltiples objetos o entidades en una misma inferencia.
- Integración nativa en ComfyUI mediante `UNetLoader` o `Load Diffusion Model`, con detección automática de la cabecera de cuantización.
- Carga alternativa mediante el nodo `HSWQ SAM3 Loader` del repositorio ComfyUI-HSWQ-Loader-and-Tools.
- Ejecución de capas cuantizadas con INT8 Tensor Core en hardware compatible.
- No se documentan capacidades de generación de texto, tool calling, agentes ni procesamiento de audio.

## Casos de uso

- Segmentación interactiva en flujos de edición de imagen: el modelo recibe puntos o cajas del usuario y devuelve máscaras precisas, integrándose en nodos de ComfyUI para retoque y composición.
- Rotoscopia y segmentación de vídeo: la etiqueta `video-segmentation` y el modo Multiplex permiten seguir varias entidades a lo largo de fotogramas, útil en postproducción y efectos visuales.
- Aislado de objetos para pipelines de generación aumentada: generar máscaras que alimenten inpainting o outpainting en ComfyUI, separando sujeto y fondo antes de la difusión.
- Preprocesado de datasets de visión: extracción automatizada de máscaras para etiquetado semiautomático en proyectos de investigación, reduciendo el trabajo manual de anotación.
- Segmentación en entornos con VRAM limitada: al ocupar el checkpoint ~1,74 GB y ejecutar parte de las capas en INT8, es viable en GPUs de consumo que no admitirían variantes de mayor tamaño.
- Despliegue en nodos de automatización con ComfyUI: uso del loader estándar para encadenar segmentación con otros modelos en flujos de producción por lotes.
- Evaluación de técnicas de cuantización: sirve como referencia práctica para comparar HSWQ ConvRot INT8 frente al checkpoint FP16 en tareas de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint ocupa ~1,74 GB en disco, por lo que se requiere al menos esa cantidad más el overhead de activaciones y del runtime.
- GPU recomendadas: no especificadas por el autor. Las capas INT8 Tensor Core requieren hardware con soporte de INT8 (generaciones recientes de NVIDIA, entre otras).
- Compatibilidad con GPU de consumo: el tamaño del checkpoint (~1,74 GB) sugiere que cabe en GPUs de consumo con suficiente VRAM libre, aunque no hay cifras oficiales de consumo en inferencia.
- Opciones de despliegue: ComfyUI mediante `UNetLoader` / `Load Diffusion Model` o el nodo `HSWQ SAM3 Loader`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM3.1-HSWQ-ConvRot-INT8 (este) | no disponible | no disponible | safetensors INT8/FP16 híbrido, ~1,74 GB | SAM License | Hugging Face, 0 descargas, 5 likes |
| Comfy-Org/sam3.1 (base) | no disponible | no disponible | safetensors FP16, ~1,75 GB | SAM License | Hugging Face |
| facebook/sam3.1 (original) | no disponible | no disponible | no disponible en la información | SAM License | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La reducción de tamaño frente al FP16 es de solo ~0,4 %, ya que únicamente 41 de 221 capas Linear se cuantizan; el beneficio en memoria es marginal.
- Solo las capas cuantizadas aprovechan INT8 Tensor Core; el resto del checkpoint sigue ejecutándose en FP16.
- La licencia SAM License impone condiciones específicas de uso; debe revisarse antes de cualquier uso comercial.
- No hay información sobre sesgos, tasas de alucinación de máscaras ni límites de resolución o duración de vídeo.
- El modelo tiene 0 descargas y 5 likes en el momento de la consulta, por lo que carece de validación comunitaria extensa.
- La auditoría de backdoor publicada por el autor tiene límites explícitos que deben consultarse en el documento de veredictos.
- No se documentan idiomas soportados ni capacidades lingüísticas, al ser un modelo de visión.
- El repositorio depende de herramientas externas del mismo autor (framework HSWQ y loader de ComfyUI), lo que añade dependencias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ussoewwin/SAM3.1-HSWQ-ConvRot-INT8
- Framework HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Loader y herramientas ComfyUI: https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools
- Auditoría de backdoor: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/Backdoor_Audit_Verdicts.md
- Modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/sam3.1
- Modelo original de Meta: https://huggingface.co/facebook/sam3.1
- Licencia SAM: https://github.com/facebookresearch/segment-anything/blob/main/LICENSE
