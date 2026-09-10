# timm/vit_large_patch16_sapiens2.fb

## Resumen

Sapiens2 es una familia de vision transformers de alta resolución desarrollada por Meta para tareas centradas en la persona, como estimación de pose, segmentación de partes del cuerpo, inferencia de normales superficiales y generación de pointmaps. El repositorio que nos ocupa, `timm/vit_large_patch16_sapiens2.fb`, es un remapeo a la biblioteca timm del checkpoint de preentrenamiento `facebook/sapiens2-pretrain-0.4b`. Las claves de los pesos se han convertido a la nomenclatura de timm, pero no se ha realizado ningún fine-tuning adicional.

El modelo es un backbone de 0.4B parámetros (395.450.368 según el tensor safetensors) con arquitectura Sapiens2 ViT, que incorpora RoPE, GQA, SwiGLU, RMSNorm y QK-norm. Se preentrenó a una resolución de 1024×768 píxeles con un patch size de 16, sobre un dataset de 1000 millones de imágenes humanas. Su salida son características densas por parche, pensadas para ser utilizadas como inicialización en tareas de visión human-centric o como extracción de características en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) |
| Parametros totales | 395.450.368 (0.398B según la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (es un modelo de visión; resolución de preentrenamiento 1024×768) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (backbone de visión, no procesa texto) |
| Licencia | Sapiens2 License (licencia propia de Meta, consultar enlace) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer estándar de 24 capas, con dimensión de embedding de 1024 y 16 cabezas de atención, pero con varias innovaciones incorporadas: position encoding rotatorio (RoPE), grouped query attention (GQA), feed-forward con SwiGLU, normalización RMSNorm y QK-norm. El patch size es de 16 y la resolución de preentrenamiento es 1024×768, lo que genera 3072 tokens de parche más tokens de clasificación y registro. El modelo fue preentrenado por Meta sobre 1000 millones de imágenes humanas, con 1.260 T FLOPs, y no se aplicaron técnicas de alineación como RLHF o DPO al ser un backbone de visión. Este checkpoint es un remapeo de pesos de `facebook/sapiens2-pretrain-0.4b` a la biblioteca timm, por lo que los pesos son idénticos pero las claves se han adaptado a la nomenclatura de timm.

## Capacidades

- Extracción de características densas por parche (tokens de 1024 dimensiones) a partir de imágenes de alta resolución.
- Generación de descriptores globales mediante pooling CLS (por defecto) o pooling medio sobre tokens de parche.
- Adecuado como inicialización para fine-tuning en tareas human-centric: estimación de pose, segmentación de partes del cuerpo, normales superficiales y pointmaps.
- Integración nativa con timm y con el ecosistema Hugging Face Transformers (pipeline `image-feature-extraction`).
- Soporte de `forward_features` en timm para obtener tokens intermedios sin cabeza de clasificación.
- No soporta tool calling, función de llamada, agentes ni razonamiento multi-step, al ser un modelo puramente visual.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Estimación de pose humana: se añade una cabeza de regresión de heatmaps sobre los tokens de la última capa y se entrena con conjuntos de datos anotados. La resolución de preentrenamiento (1024×768) permite capturar articulaciones finas en imágenes de cuerpo completo.
- Segmentación de partes del cuerpo: el backbone puede inicializar una cabeza de segmentación semántica (por ejemplo, UPerNet o Mask2Former) para clasificar píxeles en categorías anatómicas como torso, brazos o cabeza.
- Reconstrucción 3D de humanos: sus características densas se usan para predecir normales superficiales y pointmaps, alimentando un pipeline de reconstrucción 3D a partir de una sola imagen.
- Investigación en visión por computador: sirve como modelo base para estudiar transferencia de aprendizaje en dominios de personas, comparando arquitecturas o evaluando datos de imagen no vistos.
- Recuperación de personas (person re-identification): el token CLS se puede usar como descriptor de imagen para indexar y localizar a una persona en una base de datos de vídeo o imágenes.
- Realidad aumentada y composición: la inferencia de normales y segmentos corporales facilita la integración de elementos virtuales en fotografías o vídeo manteniendo la iluminación y oclusión coherentes.
- Análisis biomecánico en vídeo: extracción de características corporales para cuantificar posturas y ángulos articulares en estudios de movimiento, previo reentrenamiento con datos del dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 1,6 GB (tamaño del repositorio). Con una entrada de 1024×768 y batch 1, las activaciones añaden memoria significativa; se calcula que una GPU con al menos 8 GB de VRAM es suficiente para ejecutar el modelo con margen en FP32.
- GPU recomendadas: se puede ejecutar en tarjetas de consumo como RTX 3060 12GB, RTX 4070 o superiores. Para mayor resolución, batch grande o uso en producción, se recomiendan A100 o H100.
- ¿Cabe en GPU de consumo? Sí, es viable en GPUs de consumo de 8 GB o más, siempre que se respete la resolución de entrada y el tamaño de batch no sea elevado.
- Opciones de despliegue: no es compatible con vLLM ni TGI, que están orientados a modelos de lenguaje. Se puede servir mediante una API con PyTorch y timm, exportar a ONNX o TensorRT para aceleración, o usar la integración con Transformers mediante el pipeline `image-feature-extraction`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La familia Sapiens2 ofrece varias escalas del mismo backbone preentrenado. Esta comparación se basa en los datos de la model card:

| Modelo | Params | FLOPs | Embed dim | Layers | Heads |
|---|---|---|---|---|---|
| Sapiens2-0.1B | 0.114 B | 0.342 T | 768 | 12 | 12 |
| **Sapiens2-0.4B (este)** | 0.398 B | 1.260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0.818 B | 2.592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1.462 B | 4.715 T | 1536 | 40 | 24 |
| Sapiens2-1B-4K | 1.607 B | No disponible | 1536 | 40 | 24 |
| Sapiens2-5B | 5.071 B | 15.722 T | 2432 | 56 | 32 |

Todas las variantes comparten la misma licencia, el mismo dataset de preentrenamiento (1B imágenes humanas) y la misma arquitectura base. La elección depende del presupuesto computacional disponible y del tamaño de las tareas human-centric a resolver. No se dispone de información de modelos comparables de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la Sapiens2 License, una licencia de Meta que probablemente impone restricciones para uso comercial y define fines aceptables. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso en producción.
- Solo visión: no acepta entradas de texto ni instrucciones, por lo que no puede realizar razonamiento simbólico ni generar respuestas.
- Sesgos en datos: al estar preentrenado en 1000 millones de imágenes humanas, puede heredar sesgos demográficos presentes en el dataset, lo que puede afectar el rendimiento en grupos no representados.
- No es un modelo listo para producción: es un backbone pretrainado, no una solución de aplicación directa. Necesita heads de tarea y fine-tuning para obtener resultados útiles.
- Remapeo timm: las claves de los pesos se han convertido a la nomenclatura de timm y los pesos no han sido ajustados. Es posible que algunas utilidades o scripts de la implementación original de Meta no funcionen directamente con este checkpoint.
- Resolución de entrada: el preentrenamiento se realizó a 1024×768; usar resoluciones muy distintas puede degradar la calidad de las características extraídas.
- Sin benchmarks publicados: no se han proporcionado resultados de evaluación en la información disponible, por lo que desconocemos su rendimiento relativo frente a otros modelos human-centric.

## Enlaces

- HuggingFace: https://huggingface.co/timm/vit_large_patch16_sapiens2.fb
- Modelo original en HuggingFace: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Colección de Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Repositorio de código: https://github.com/facebookresearch/sapiens2
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
