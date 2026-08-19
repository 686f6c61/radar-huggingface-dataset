# VishavGupta01/MRBEAN_Vision

## Resumen

MRBEAN Vision Engine es un modelo de visión por computadora multitarea desarrollado por VishavGupta01 como parte del proyecto MRBEAN (Mobile Resilient Broadcast for Emergency Ad-hoc Networks). Su objetivo es clasificar simultáneamente el tipo de desastre y la severidad del daño en imágenes capturadas por cámaras de dispositivos Android, funcionando completamente offline para entornos de emergencia donde la conectividad puede ser limitada o inexistente.

El modelo utiliza un backbone MobileNetV3 Large preentrenado en ImageNet y ajustado sobre el dataset MEDIC (CrisisNLP), que contiene 71.198 imágenes etiquetadas. Se divide en dos cabezas de clasificación densas: una para el tipo de desastre (6 clases: terremoto, incendio, inundación, huracán, deslizamiento de tierra y no desastre) y otra para la severidad del daño (3 niveles: poco o ninguno, leve, severo). Está exportado en formatos PyTorch (.pth), TensorFlow Lite (float32 y float16) y ONNX, lo que facilita su integración en aplicaciones móviles multiplataforma.

La relevancia de este modelo radica en su diseño ligero y orientado a despliegue en dispositivos de borde, lo que permite análisis de imágenes en tiempo real sin depender de servidores externos. Aunque se encuentra en una fase inicial de desarrollo, su arquitectura multitarea y su compatibilidad con TFLite lo convierten en una opción práctica para sistemas de respuesta ante emergencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3 Large (backbone) con dos cabezas de clasificación densas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | float32, float16 (TFLite) |
| Idiomas soportados | no aplica (procesamiento de imágenes) |
| Licencia | no disponible |
| Formato de pesos | .pth, .tflite (float32 y float16), .onnx |

## Arquitectura y entrenamiento

El modelo emplea un backbone MobileNetV3 Large preentrenado en ImageNet, que se ajusta finamente sobre el dataset MEDIC. La arquitectura se divide en dos cabezas de clasificación independientes que comparten el mismo extractor de características: la primera predice el tipo de desastre entre 6 categorías y la segunda predice la severidad del daño entre 3 niveles. Esta estructura multitarea permite que el modelo aprenda representaciones compartidas relevantes para ambas tareas, reduciendo el coste computacional en comparación con dos modelos separados.

El entrenamiento se realiza sobre imágenes de 224x224 píxeles en RGB, normalizadas con la media y desviación estándar de ImageNet. El dataset MEDIC, procedente de CrisisNLP, contiene imágenes etiquetadas de desastres reales, lo que proporciona al modelo exposición a escenarios variados. No se especifican detalles sobre el número de épocas, la función de pérdida o el optimizador utilizado. Tampoco se menciona el uso de técnicas como aumento de datos o regularización adicional.

## Capacidades

- Clasificación de tipo de desastre en 6 categorías: terremoto, incendio, inundación, huracán, deslizamiento de tierra y no desastre.
- Clasificación de severidad del daño en 3 niveles: poco o ninguno, leve y severo.
- Inferencia simultánea de ambas tareas mediante una única pasada del modelo.
- Ejecución completamente offline, sin necesidad de conexión a internet.
- Compatibilidad con dispositivos Android mediante TensorFlow Lite, con versiones float32 y float16 para equilibrar precisión y tamaño.
- Formato ONNX disponible para integración en otros entornos de inferencia.
- Preprocesamiento de entrada estándar (224x224, RGB, normalización ImageNet) que facilita su uso con pipelines existentes.

## Casos de uso

- Respuesta a emergencias en zonas sin cobertura: el modelo puede ejecutarse en un teléfono Android de un primer interviniente para clasificar imágenes de un desastre y priorizar la asignación de recursos, gracias a su funcionamiento offline y su bajo consumo de memoria.
- Evaluación rápida de daños tras un terremoto: un equipo de rescate captura fotos de edificios colapsados y el modelo identifica si hay daño severo, leve o ninguno, permitiendo una triage visual inmediato en el campo.
- Monitorización de incendios forestales: drones o cámaras fijas envían imágenes a una aplicación móvil que utiliza el modelo para detectar fuego y estimar la severidad, ayudando a coordinar la extinción.
- Gestión de inundaciones urbanas: los ciudadanos pueden reportar imágenes de calles anegadas a través de una app; el modelo clasifica el tipo de desastre (inundación) y la severidad, generando un mapa de zonas críticas para las autoridades.
- Verificación de alertas en redes sociales: durante un desastre, se pueden analizar imágenes compartidas en plataformas sociales para filtrar las que realmente muestran daños y descartar las que no son relevantes, reduciendo el ruido informativo.
- Entrenamiento de modelos más complejos: el archivo .pth permite usar el modelo como extractor de características o para fine-tuning en tareas relacionadas con análisis de desastres, aprovechando su backbone preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de precisión, recall, F1 u otras sobre el dataset MEDIC o conjuntos de validación externos. Tampoco se comparan los resultados con otros modelos de clasificación de desastres.

## Requisitos de hardware

- Modelo ligero diseñado para dispositivos de borde, especialmente Android.
- El archivo TFLite float32 ocupa 12.7 MB y el float16 6.39 MB, lo que indica un consumo de memoria reducido.
- No se especifican requisitos de VRAM ni GPU concretos, pero por su tamaño y arquitectura (MobileNetV3) es adecuado para ejecutarse en CPUs de smartphones y en GPUs de gama baja.
- Compatible con TensorFlow Lite para despliegue en Android, y con ONNX Runtime para otros entornos.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparaciones objetivas con otras arquitecturas de clasificación de desastres sin datos de rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con el dataset MEDIC, que puede no cubrir todos los tipos de desastres o variaciones geográficas, lo que podría limitar su generalización a escenarios no representados.
- Las clases de severidad son subjetivas y dependen de las etiquetas del dataset; la distinción entre "leve" y "severo" puede ser ambigua en algunos casos.
- No se ha evaluado el modelo en condiciones de iluminación variable, ángulos de cámara o resoluciones diferentes a las de entrenamiento, lo que podría afectar su precisión en entornos reales.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en producción.
- El modelo no es generativo ni multimodal; solo realiza clasificación de imágenes y no puede interpretar texto ni audio.
- Al ser un proyecto en fase inicial, no hay garantías de soporte o mantenimiento continuo.

## Enlaces

- [HuggingFace - MRBEAN Vision](https://huggingface.co/VishavGupta01/MRBEAN_Vision)
- [GitHub - Disaster-Classification-and-Severity-Classification-Engine](https://github.com/VishavGupta01/Disaster-Classification-and-Severity-Classification-Engine)
- [Dataset MEDIC (CrisisNLP)](https://crisisnlp.qcri.org/medic/)
