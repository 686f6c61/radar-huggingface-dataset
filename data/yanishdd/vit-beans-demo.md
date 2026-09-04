# Yanishdd/vit-beans-demo

## Resumen

vit-beans-demo es un modelo de clasificación de imágenes desarrollado por Yanishdd, fine-tuneado a partir de google/vit-base-patch16-224-in21k. Se trata de un Vision Transformer (ViT) base con 85,8 millones de parámetros, entrenado para tareas de clasificación de imágenes. La model card no especifica el dataset de entrenamiento, aunque el nombre del modelo y la existencia de otros modelos similares en la comunidad sugieren que podría tratarse del dataset Beans de HuggingFace, que contiene imágenes de hojas de frijol. Está publicado bajo licencia Apache 2.0 y disponible en formato safetensors y ONNX. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo ViT preentrenado en ImageNet-21k, con resultados de evaluación de accuracy 0.9688 y loss 0.1288.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, patch 16, resolución 224 |
| Parametros totales | 85.800.963 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ViT-base de Google, con parches de 16x16 y resolución de entrada de 224x224. Se parte de los pesos preentrenados en ImageNet-21k y se realiza un fine-tuning sobre un dataset no especificado en la model card. Los hiperparámetros de entrenamiento incluyen learning rate de 5e-5, batch size de 16, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y 4 épocas. No se indica si se emplearon técnicas de RLHF o DPO, lo cual no es habitual en modelos de visión. El modelo no presenta innovaciones técnicas destacables más allá de ser un fine-tuning estándar.

## Capacidades

- Clasificación de imágenes: el modelo asigna una etiqueta de clase a una imagen de entrada. Según el nombre del modelo y modelos similares de la comunidad, probablemente esté entrenado sobre el dataset Beans, que contiene imágenes de hojas de frijol con tres categorías (angular leaf spot, bean rust y healthy).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni agentes.
- No tiene capacidades multilingües, al ser un modelo de visión.
- No dispone de modo de pensamiento ni capacidades de visión adicionales (audio, video).
- Compatible con pipelines de transformers para image-classification.

## Casos de uso

- Control de calidad en agricultura: si el modelo está entrenado en el dataset Beans, puede clasificar hojas de frijol para detectar enfermedades como la mancha angular y la roya del frijol. Se integraría en una aplicación de análisis de imágenes para agricultores, permitiendo un diagnóstico rápido.
- Clasificación de imágenes en producción: al ser un modelo ViT-base con 85,8 millones de parámetros, es ligero y puede desplegarse en servicios de inferencia con baja latencia, por ejemplo en una API REST para clasificar imágenes.
- Demo educativa de fine-tuning: sirve como ejemplo de cómo ajustar un modelo preentrenado de HuggingFace con el Trainer, útil para aprender sobre transfer learning en clasificación de imágenes.
- Investigación en visión por computador: puede usarse como baseline para comparar técnicas de fine-tuning o para probar métodos de interpretabilidad (saliency maps) en modelos ViT.
- Aplicaciones móviles: el modelo puede exportarse a ONNX y ejecutarse en dispositivos móviles para clasificación de imágenes en tiempo real, gracias a su tamaño reducido.
- Sistemas de recomendación de tratamiento: en un sistema de apoyo a la decisión, el modelo puede clasificar el estado de las plantas y sugerir acciones de tratamiento según la enfermedad detectada.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0.1288 |
| Accuracy | 0.9688 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, etc.) en la información disponible. El model-index de la model card no incluye resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene 85,8 millones de parámetros, en FP32 los pesos ocupan aproximadamente 344 MB. Con batch pequeño, la VRAM necesaria se estima en torno a 1-2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (RTX 3060, GTX 1660, etc.) o CPUs modernas, gracias a la optimización ONNX.
- Sí cabe en GPUs consumer y en dispositivos edge.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime, HuggingFace Inference Endpoints. vLLM y Ollama no son aplicables por ser un modelo de visión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy (evaluación) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yanishdd/vit-beans-demo | 85.800.963 | 0.9688 | Apache 2.0 | HuggingFace |
| ScatterRaven/vit-base-beans-demo-v5 | No especificado (ViT-base, ~86M) | 0.9688 | No especificada | HuggingFace |
| sonde8/vit-base-beans-demo-v5 | No especificado (ViT-base, ~86M) | 0.9925 | No especificada | HuggingFace |
| google/vit-base-patch16-224-in21k | No especificado (ViT-base, ~86M) | No reportada | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- La documentación del modelo es incompleta: la model card indica "More information needed" en varias secciones, por lo que no se dispone de información detallada sobre el dataset de entrenamiento, la composición de los datos ni los sesgos.
- El dataset de entrenamiento no está especificado. El nombre del modelo sugiere que podría ser el dataset Beans, pero no está confirmado.
- No se han publicado benchmarks comparativos ni evaluaciones independientes.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de visión.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y las atribuciones.

## Enlaces

- https://huggingface.co/Yanishdd/vit-beans-demo
- https://huggingface.co/google/vit-base-patch16-224-in21k
- https://huggingface.co/ScatterRaven/vit-base-beans-demo-v5
- https://huggingface.co/sonde8/vit-base-beans-demo-v5
