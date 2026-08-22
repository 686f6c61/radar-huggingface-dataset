# yrlyrl/plangen-mmoct-coord-bbox-vq-20k

## Resumen

PlanGen es un modelo de lenguaje visual auto-regresivo desarrollado por el grupo 360CVGroup, presentado en el paper "PlanGen: Towards Unified Layout Planning and Image Generation in Auto-Regressive Vision Language Models". Este modelo unifica la planificación de diseño (layout planning) y la generación de imágenes en un solo sistema, permitiendo que ambas tareas se realicen de forma conjunta y coherente. La versión alojada en este repositorio corresponde a los checkpoints intermedios del experimento "highlighted-bbox full-image-VQ" sobre el dataset SA-1B, con pasos de entrenamiento de 205K, 210K, 215K y 220K.

La relevancia actual de PlanGen radica en su enfoque innovador: integra las condiciones de diseño (bounding boxes y descripciones locales) como parte del contexto del modelo, en lugar de codificarlas por separado. Esto simplifica el manejo de diseños complejos y mejora la coherencia entre la comprensión y la generación de imágenes. El repositorio contiene los parámetros entrenables de PlanGen/MMCoT junto con un manifiesto SHA-256, pero no incluye el código de inferencia ni documentación adicional sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Language Model auto-regresivo (basado en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (posiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

PlanGen se basa en un modelo de lenguaje visual auto-regresivo que trata la planificacion de diseño como una tarea de generacion de texto estructurado. La arquitectura integra las condiciones de diseño (bounding boxes y descripciones locales) directamente como tokens de contexto, en lugar de usar operaciones de embed-and-pool como los modelos anteriores. Esto permite que el modelo procese diseños con muchas cajas sin degradar el rendimiento.

El entrenamiento de este repositorio se realizo sobre el dataset SA-1B, un conjunto de imagenes segmentadas a gran escala. El experimento concreto es el de "highlighted-bbox full-image-VQ" con 20.000 pasos de entrenamiento. Los checkpoints guardados (205K, 210K, 215K, 220K) son puntos intermedios que contienen los parametros entrenables de PlanGen/MMCoC. No se especifica la cantidad total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion conjunta de diseño e imagen: puede generar una imagen y su diseño de forma simultanea.
- Generacion de imagen a partir de un diseño: dado un conjunto de cajas delimitadoras y descripciones, genera la imagen correspondiente.
- Comprension de diseño de imagen: analiza una imagen y extrae la estructura de diseño (bounding boxes y categorias).
- Manipulacion guiada por diseño: modifica una imagen existente siguiendo instrucciones de diseño (por ejemplo, cambiar la posicion de un objeto).
- Integracion de condiciones de diseño como contexto: no requiere codificacion especial de las cajas, lo que facilita el manejo de diseños complejos.
- Capacidades multimodales: trabaja con texto e imagenes de forma conjunta, aunque no se especifican las capacidades de audio o video.

## Casos de uso

- Generacion de imagenes de producto para e-commerce: un diseñador puede definir el diseño de una escena (posicion y tamaño de los objetos) y el modelo genera la imagen final, acelerando el proceso creativo.
- Edicion de imagenes por diseño: un usuario puede cargar una imagen y especificar un nuevo diseño (por ejemplo, mover un objeto a otra posicion) y el modelo modifica la imagen manteniendo la coherencia.
- Creacion de datasets sinteticos: permite generar imagenes con diseños controlados para entrenar otros modelos de vision, ya que se puede especificar exactamente que objetos aparecen y donde.
- Asistencia en diseno grafico: un diseñador puede esbozar un diseño aproximado y el modelo lo convierte en una imagen realista, sirviendo como herramienta de prototipado rapido.
- Analisis de diseño de imagenes existentes: se puede usar para extraer la estructura de diseño de una imagen, lo que es util para indexacion visual o para modificar diseños en imagenes de referencia.
- Generacion de variantes de diseño: dado un diseño inicial, el modelo puede generar multiples variaciones de imagen cambiando el estilo o los detalles, manteniendo la estructura de diseño.
- Automatizacion de layout en publicidad: para crear banners o anuncios donde los elementos deben estar en posiciones especificas, el modelo puede generar el diseño y la imagen final de forma conjunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de PlanGen (arxiv 2503.10127) puede contener evaluaciones comparativas, pero no se incluyen en este repositorio.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware especificos para este modelo. Dado que se trata de un modelo vision-language auto-regional de tamano no especificado, se recomienda:

- GPU con al menos 16 GB de VRAM para inferencia basica (estimacion orientativa).
- Para despliegue en produccion, se recomienda usar vLLM o TGI si se dispone de los pesos en formato adecuado.
- El tamaño de los checkpoints (205K, 210K, 215K, 220K) sugiere que cada uno podria ser de varios gigabytes, aunque no se confirma.
- No se indica si es compatible con consumer GPUs como RTX 4090 o si requiere hardware profesional (A100/H100).

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con otros modelos. PlanGen se presenta como una alternativa a los modelos de generacion de imagen con control de diseño, como los basados en Stable Diffusion con ControlNet o los modelos de layout-to-image como LayoutTransformer. Sin embargo, no se proporcionan datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- Este repositorio contiene checkpoints intermedios de un experimento de investigacion, no un modelo final optimizado para produccion.
- No se especifica la licencia de uso, por lo que se recomienda contactar con el autor antes de cualquier uso comercial.
- El modelo se entrena sobre SA-1B, un dataset de imagenes de Internet, por lo que puede heredar sesgos en la generacion de imagenes (por ejemplo, representaciones estereotipadas de personas).
- No se ha publicado informacion sobre la seguridad del modelo frente a generacion de contenido inapropiado o alucinaciones visuales.
- La longitud de contexto no se especifica, lo que limita la capacidad de manejar diseños con muchas cajas.
- Los checkpoints estan pensados para continuar el entrenamiento, no para inferencia directa. Requieren el codigo fuente del repositorio original para su uso.

## Enlaces

- HuggingFace: https://huggingface.co/yrlyrl/plangen-mmoct-coord-bbox-vq-20k
- GitHub (fuente): https://github.com/yangruoliu/plangen_mmoct
- Pagina del proyecto: https://360cvgroup.github.io/PlanGen/
- Paper: https://arxiv.org/html/2503.10127v1
