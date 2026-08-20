# wirthual/rf-detr-executorch

## Resumen

RF-DETR es un modelo de detección de objetos en tiempo real desarrollado por Roboflow y publicado en ICLR 2026. Este repositorio contiene la exportación del modelo a formato ExecuTorch sin lowering, lo que permite su ejecución en dispositivos edge y móviles mediante el runtime de ExecuTorch. La arquitectura se basa en DETR (Detection Transformer) y se ofrecen cuatro variantes (Nano, Small, Medium y Large) con tamaños de entrada de 384, 512, 576 y 704 píxeles respectivamente. La relevancia del modelo radica en su rendimiento SOTA en el conjunto de datos COCO y su diseño orientado a fine-tuning, además de su compatibilidad con múltiples formatos de exportación (ONNX, TensorRT, TFLite, ExecuTorch y CoreML) para despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer) |
| Parametros totales | no disponible (4 variantes: Nano, Small, Medium, Large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch (.pte) |

## Arquitectura y entrenamiento

RF-DETR se basa en la arquitectura DETR (Detection Transformer), que emplea un transformer para la detección de objetos sin necesidad de regiones propuestas ni anclas. El modelo está diseñado para fine-tuning y alcanza un rendimiento SOTA en COCO, aunque los detalles concretos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se especifican en la información disponible. La exportación a ExecuTorch se ha realizado sin lowering, es decir, utilizando las operaciones estándar de PyTorch ejecutadas directamente en el runtime de ExecuTorch, lo que facilita la portabilidad pero podría no aprovechar al máximo las optimizaciones específicas del hardware.

## Capacidades

- Detección de objetos en tiempo real con alta precisión.
- Segmentación de objetos (según el repositorio oficial de Roboflow).
- Soporte para fine-tuning en conjuntos de datos personalizados.
- Ejecución en dispositivos edge y móviles mediante ExecuTorch.
- Cuatro variantes con diferentes equilibrios entre velocidad y precisión (Nano, Small, Medium y Large).
- Procesamiento de imágenes con resoluciones de 384×384, 512×512, 576×576 y 704×704 píxeles según la variante.

## Casos de uso

- Detección de objetos en tiempo real en dispositivos móviles: el modelo exportado a ExecuTorch puede integrarse en aplicaciones Android o iOS para tareas como análisis de imágenes médicas o asistencia visual, con latencia baja y sin dependencia de la nube.
- Robótica industrial: integración en sistemas de visión para localizar y clasificar piezas en líneas de producción, aprovechando la capacidad de fine-tuning para adaptarse a entornos específicos.
- Vigilancia y seguridad: despliegue en cámaras edge para detectar personas, vehículos o anomalías con inferencia local y privacidad de datos.
- Asistencia a la conducción: detección de peatones, señales de tráfico y otros vehículos en sistemas ADAS, gracias a la variante Nano que puede ejecutarse en hardware de automoción.
- Agricultura de precisión: análisis de imágenes capturadas por drones para detectar plagas, malezas o estados de maduración de cultivos, con la posibilidad de fine-tuning con imágenes propias.
- Control de calidad en fabricación: inspección visual de productos en líneas de producción para detectar defectos o irregularidades, con la ventaja de poder ejecutarse en dispositivos de bajo consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio oficial de Roboflow indica que el modelo es SOTA en COCO, pero no se proporcionan cifras concretas en la documentación de este repositorio.

## Requisitos de hardware

- El formato ExecuTorch permite ejecución en CPU, GPU y NPU de dispositivos móviles y edge.
- El tamaño del repositorio es de 0.5 GB, con archivos individuales como model_large.pte de aproximadamente 125 MB.
- No se especifican requisitos de VRAM, pero los modelos de tamaño moderado pueden ejecutarse en GPUs de consumo como la serie RTX 3060 o superiores, así como en dispositivos móviles de gama media.
- Opciones de despliegue: runtime de ExecuTorch en Python, integración en aplicaciones Android/iOS mediante las bibliotecas de ExecuTorch, y soporte para plataformas como vLLM o llama.cpp no son aplicables al ser un modelo de visión.
- La latencia y el throughput dependen de la variante y el hardware; las variantes Nano y Small son adecuadas para aplicaciones en tiempo real, mientras que Medium y Large requieren hardware más potente.

## Comparativa con modelos similares

No se dispone de una comparativa con modelos similares en la información proporcionada. RF-DETR compite en el ámbito de detectores en tiempo real con modelos como YOLOv8 o DETR original, pero no se han aportado datos de comparación concretos en este repositorio.

## Limitaciones y advertencias

- No se han identificado sesgos conocidos en la información disponible, pero al ser un modelo de visión puede presentar falsos positivos o negativos en entornos no representados en el entrenamiento.
- El riesgo de alucinación es bajo en modelos de detección, aunque pueden existir errores de clasificación en objetos similares.
- La entrada está limitada a tamaños de imagen fijos (384-704 píxeles), lo que puede ser una restricción para imágenes de alta resolución o con objetos muy pequeños.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero no se especifican cláusulas adicionales sobre atribución o uso de marcas.
- La exportación sin lowering puede implicar un rendimiento inferior respecto a versiones optimizadas con cuantización o fusión de operaciones, lo que debe considerarse para despliegues de producción.

## Enlaces

- HuggingFace: https://huggingface.co/wirthual/rf-detr-executorch
- Repositorio RF-DETR: https://github.com/roboflow/rf-detr
- Documentación de exportación: https://rfdetr.roboflow.com/develop/learn/export/
