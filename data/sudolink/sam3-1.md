# sudolink/sam3.1

## Resumen

SAM 3.1 es la actualización del modelo Segment Anything Model 3 (SAM 3) desarrollado por Meta AI. Esta versión se presenta como un reemplazo directo de SAM 3 que mejora significativamente la eficiencia del procesamiento de video mediante la introducción de *object multiplexing*, una técnica que permite procesar múltiples objetos de manera simultánea en flujos de video. El modelo mantiene las capacidades de segmentación de imágenes y video por prompts de texto o imagen, y está diseñado para aplicaciones de tiempo real.

El repositorio `sudolink/sam3.1` es un espejo público del checkpoint `sam3.1_multiplex_fp16.safetensors` publicado originalmente por Comfy-Org, pensado para facilitar su descarga en máquinas con acceso limitado a Hugging Face (como instancias de RunPod o similares). El archivo está preparado para integrarse directamente en ComfyUI, donde se utiliza en nodos como `SAM3_VideoTrack` y `SAM3_TrackToMask` para seguimiento de objetos en video mediante prompts. La licencia corresponde a los términos de Meta para modelos SAM, y el tamaño del repositorio es de 1,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM (Segment Anything Model) v3.1, basada en transformers de visión (detalles no publicados) |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | fp16 (archivo `sam3.1_multiplex_fp16.safetensors`) |
| Idiomas soportados | no aplica (procesamiento de imágenes/video, no texto) |
| Licencia | sam-license (términos de Meta para modelos SAM) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SAM 3.1 hereda la arquitectura base de SAM 3, un modelo de segmentación basado en transformers de visión con un codificador de imágenes, un codificador de prompts y un decodificador de máscaras. La innovación principal de esta versión es el **object multiplexing**, que permite procesar múltiples objetos en un mismo paso de inferencia sobre video, reduciendo la carga computacional frente al procesamiento secuencial. Según el blog oficial de Meta, el modelo es un "drop-in replacement" de SAM 3, por lo que mantiene compatibilidad con las mismas entradas y salidas, pero con una mejora notable en velocidad para tareas de video.

Los detalles del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se han publicado en la información disponible. El checkpoint distribuido es una conversión a fp16 del modelo original de Meta, preparado para su uso en ComfyUI.

## Capacidades

- Segmentación de imágenes y video en tiempo real con prompts de texto o imagen.
- Seguimiento de objetos en video mediante prompts de texto o selección de región (`SAM3_VideoTrack` en ComfyUI).
- Conversión de resultados de seguimiento en máscaras utilizables para inpainting o composición (`SAM3_TrackToMask`).
- Procesamiento simultáneo de múltiples objetos gracias al multiplexing.
- Integración nativa con el ecosistema ComfyUI, incluida la compatibilidad con nodos de terceros como `MiniMax H3 LatentMaskInpainting`.
- Capacidad de segmentación de objetos en imágenes estáticas, similar a versiones anteriores de SAM.

## Casos de uso

- **Edición de video con máscaras dinámicas**: el modelo puede generar máscaras de objetos en movimiento en tiempo real, lo que permite aplicar efectos, difuminados o reemplazos de fondo en postproducción sin intervención manual.
- **Seguimiento de objetos para VFX**: en producción audiovisual, `SAM3_VideoTrack` permite aislar un objeto a lo largo de un clip de video usando solo un prompt de texto, simplificando el trabajo de rotoscopia.
- **Inpainting de video**: combinado con nodos de inpainting (como `MiniMax H3 LatentMaskInpainting`), permite eliminar objetos o personajes de un video y rellenar el fondo de forma coherente.
- **Segmentación de imágenes para datasets**: se puede usar para generar máscaras de segmentación de imágenes de forma rápida, útil para preparar datos de entrenamiento o anotaciones.
- **Automatización de flujos de trabajo en ComfyUI**: al ser un checkpoint directo para ComfyUI, permite construir pipelines visuales de edición de video y imagen sin escribir código.
- **Interacción en tiempo real en aplicaciones de realidad aumentada**: gracias al multiplexing, puede seguir varios objetos simultáneamente, lo que habilita aplicaciones de RA que necesitan segmentación en vivo con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de Meta menciona una mejora en la eficiencia de video frente a SAM 3, pero no proporciona métricas cuantitativas. No se dispone de datos de MMLU, HumanEval u otros tests estándar, ya que el modelo no es de lenguaje natural.

## Requisitos de hardware

- **Tamaño del checkpoint**: 1,7 GB en fp16, lo que sugiere un modelo de aproximadamente 850 M de parámetros (estimación basada en la relación típica de peso fp16).
- **VRAM estimada para inferencia**: al menos 4 GB para imágenes de resolución moderada; para video de alta resolución se recomienda 8 GB o más.
- **GPU recomendadas**: RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB) o GPU de centro de datos como A10/A100 para lotes grandes.
- **Compatibilidad con GPU consumer**: sí, cabe en la mayoría de tarjetas modernas con 6 GB o más.
- **Opciones de despliegue**: el checkpoint está diseñado para ComfyUI, pero también se puede usar con el repositorio oficial de SAM 3 (Facebook Research) en Python. No se menciona soporte para vLLM o llama.cpp, que son específicos de modelos de lenguaje.
- **Latencia y throughput**: no se han publicado cifras oficiales. La optimización de multiplexing debería reducir el tiempo de procesamiento de video en comparación con SAM 3, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño (aprox.) | Contexto | Capacidades | Licencia |
|---|---|---|---|---|---|
| SAM 3.1 (este) | Segmentación imagen/video | 1,7 GB fp16 | N/A | Segmentación, seguimiento de objetos, multiplexing | Términos de Meta |
| SAM 3 (Meta) | Segmentación imagen/video | ~1,7 GB | N/A | Segmentación, seguimiento, sin multiplexing | Términos de Meta |
| SAM 2.5 (Meta) | Segmentación de imagen | ~2 GB | N/A | Segmentación de imágenes, no video | Términos de Meta |
| CLIPSeg | Segmentación de imagen | ~1 GB | N/A | Segmentación con prompts de texto | MIT |

La comparación se basa en información pública de cada modelo. SAM 3.1 es la única versión que ofrece multiplexing de objetos en video, lo que la hace especialmente adecuada para tareas de seguimiento en tiempo real. Las versiones anteriores carecen de esta optimización.

## Limitaciones y advertencias

- No se han publicado análisis de sesgos para este modelo, pero como modelo de visión puede tener errores en objetos poco frecuentes o en escenas con oclusiones complejas.
- El riesgo de alucinación no aplica al ser un modelo de segmentación, pero puede generar máscaras incorrectas en regiones ambiguas.
- La licencia es `sam-license`, que corresponde a los términos de Meta para modelos SAM. Es una licencia personalizada que permite uso comercial bajo ciertas condiciones, pero debe revisarse el texto completo para verificar restricciones de redistribución o uso en productos finales.
- El modelo está pensado para uso en ComfyUI y no incluye una API de inferencia independiente. Su integración en producción requiere desarrollar un entorno propio.
- No se dispone de documentación técnica detallada sobre el entrenamiento o el dataset, lo que limita la reproducibilidad.
- El archivo es un mirror de un checkpoint de terceros; el autor del repositorio no es el desarrollador original, por lo que no se puede garantizar la integridad del archivo si se descarga de fuentes no oficiales.

## Enlaces

- [Repositorio en Hugging Face: sudolink/sam3.1](https://huggingface.co/sudolink/sam3.1)
- [Repositorio original de Comfy-Org/sam3.1](https://huggingface.co/Comfy-Org/sam3.1)
- [Blog oficial de Meta sobre SAM 3.1](https://ai.meta.com/blog/segment-anything-model-3/)
- [Repositorio oficial de SAM 3 en GitHub](https://github.com/facebookresearch/sam3)
- [Nota de release SAM 3.1 en repositorio comunitario](https://github.com/dreamfarwhb/ai_sam3/blob/main/RELEASE_SAM3p1.md)
