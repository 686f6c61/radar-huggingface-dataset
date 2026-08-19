# sugam24/geonusaf-unet-r50-random-fold2

## Resumen

El modelo `sugam24/geonusaf-unet-r50-random-fold2` es un checkpoint de segmentación semántica para imágenes de teledetección, desarrollado por Sugam Dahal (usuario `sugam24`) como parte del proyecto GeoNUSAF. Su objetivo es clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo sin uso y agrícola. La arquitectura empleada es una U-Net con encoder ResNet-50 preentrenado en ImageNet, implementada mediante la librería `segmentation-models-pytorch`. El modelo se entrenó con un split aleatorio de los datos, correspondiente al fold 2 de 3, con una semilla fija (42). El repositorio tiene un tamaño de 0.5 GB e incluye el checkpoint `best.pt` con los pesos del modelo, la configuración y las métricas de validación.

Este checkpoint forma parte de una serie de variantes (por ejemplo, `geonusaf-unet-r50-block-fold0`) que exploran diferentes estrategias de partición de datos. Es relevante para investigadores que trabajan en segmentación semántica aplicada a entornos urbanos y rurales, especialmente en regiones con alta densidad de clases desbalanceadas. Sin embargo, las métricas de validación reportadas son extremadamente bajas (mIoU de 0.059), lo que indica que el modelo no ha sido capaz de aprender patrones discriminativos suficientes en este fold concreto, probablemente debido a limitaciones del conjunto de datos o del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (SMP) con encoder ResNet-50 preentrenado en ImageNet |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura U-Net clásica con un encoder ResNet-50 preentrenado en ImageNet, implementado mediante la librería `segmentation-models-pytorch`. La entrada son imágenes de 512x512 píxeles con normalización estándar de ImageNet, y una resolución efectiva de 0.586 metros por píxel (GSD). La salida es un mapa de segmentación con 6 clases más la clase de ignorar (índice 255). El entrenamiento se realizó con un split aleatorio de los datos, asignando el fold 2 de 3 con semilla 42. No se especifican detalles sobre el número de épocas (aunque el mejor epoch reportado es 0, lo que sugiere que el modelo no mejoró durante el entrenamiento), ni sobre el tamaño del conjunto de datos, la función de pérdida o el optimizador. Tampoco se mencionan técnicas como aumento de datos o regularización. La ausencia de progreso en el entrenamiento (epoch 0 como mejor) y las métricas de validación muy bajas indican posibles problemas de convergencia o de calidad del dataset.

## Capacidades

- Segmentación semántica de imágenes de teledetección, específicamente para clasificación de uso del suelo en entornos urbanos y rurales.
- Reconoce seis clases: residencial, carretera, río, bosque, suelo sin uso y agrícola.
- Soporta imágenes de alta resolución (512x512) con normalización ImageNet.
- No tiene capacidades de generación de texto, razonamiento lingüístico, tool calling, agentes ni procesamiento de lenguaje natural.
- No incluye soporte para visión adicional más allá de la segmentación (sin detección de objetos ni clasificación de imágenes).

## Casos de uso

- Investigación académica en segmentación semántica: el modelo sirve como baseline o punto de partida para estudiar el impacto de diferentes estrategias de partición de datos (random vs. block) en el rendimiento de modelos U-Net para teledetección.
- Experimentación con datos de uso del suelo: permite probar pipelines de preprocesado, aumento de datos o técnicas de postprocesado sobre un checkpoint concreto, aunque sus métricas bajas limitan su utilidad práctica.
- Evaluación de métricas de validación: útil para comparar la evolución del entrenamiento entre distintos folds y configuraciones dentro del proyecto GeoNUSAF.
- Prototipado de sistemas de monitoreo ambiental: podría integrarse en un flujo de inferencia para generar mapas preliminares de cobertura del suelo, aunque se requeriría un reentrenamiento o ajuste fino para obtener resultados aceptables.
- Formación y docencia: sirve como ejemplo didáctico de un modelo de segmentación con encoder preentrenado y de cómo interpretar métricas como IoU, F1 y kappa en problemas desbalanceados.
- Análisis de errores: al presentar métricas muy bajas, es útil para estudiar por qué un modelo falla en ciertas clases (por ejemplo, carretera y río) y qué factores contribuyen al bajo rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta las siguientes métricas de validación para este fold:

| Metrica | Valor |
|---|---|
| mIoU | 0.0590 |
| mF1 | 0.1084 |
| Overall Accuracy | 0.1622 |
| Kappa | 0.0302 |

Desglose por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.0613 | 0.1155 |
| Road | 0.0156 | 0.0307 |
| River | 0.0151 | 0.0297 |
| Forest | 0.1466 | 0.2557 |
| UnusedLand | 0.0594 | 0.1121 |
| Agricultural | 0.0563 | 0.1067 |

Estos valores son notablemente bajos, especialmente para las clases Road y River, lo que sugiere que el modelo no logra segmentar correctamente estas categorías en la partición de validación.

## Requisitos de hardware

- El checkpoint ocupa 0.5 GB, lo que indica un modelo de tamaño moderado (ResNet-50 con U-Net).
- Para inferencia con una imagen de 512x512 y batch size 1, se estima un consumo de VRAM de entre 2 y 4 GB, dependiendo de la precisión de los tensores (fp32 o fp16). No se dispone de mediciones exactas.
- Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060 o superiores.
- Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3070, Tesla T4).
- Opciones de despliegue: al ser un modelo PyTorch con `segmentation-models-pytorch`, puede exportarse a ONNX para inferencia con ONNX Runtime, o utilizarse directamente con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicables a visión).
- La latencia de inferencia dependerá del hardware; en una GPU moderna, una imagen 512x512 debería procesarse en decenas de milisegundos, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en el mismo contexto (segmentación de uso del suelo con U-Net y ResNet-50) dentro del proyecto GeoNUSAF. Los otros checkpoints publicados por el mismo autor (`geonusaf-unet-r50-block-fold0`, etc.) son variantes del mismo modelo con diferentes estrategias de partición, pero no se han publicado métricas comparativas consolidadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo: las métricas de validación (mIoU 0.059, kappa 0.030) indican que el modelo no es útil para aplicaciones prácticas sin un reentrenamiento significativo o un ajuste fino sobre datos más representativos.
- Desbalanceo severo de clases: las clases Road y River presentan IoU inferiores a 0.02, lo que sugiere que el modelo apenas las detecta. Esto puede deberse a una representación insuficiente en el conjunto de entrenamiento o a dificultades intrínsecas de segmentación.
- Entrenamiento incompleto: el mejor epoch reportado es 0, lo que implica que el modelo no mejoró durante el entrenamiento. Esto puede indicar problemas de convergencia, tasa de aprendizaje inadecuada o errores en el pipeline de datos.
- Licencia no especificada: al no indicarse licencia, el uso comercial, la redistribución o la modificación del modelo quedan sujetos a restricciones legales inciertas. Se recomienda contactar al autor antes de cualquier uso fuera de investigación.
- Sin documentación sobre el dataset: no se detallan las fuentes de las imágenes, el número de muestras ni el protocolo de anotación, lo que dificulta la reproducibilidad y la evaluación de sesgos geográficos o temporales.
- Es un checkpoint específico de un fold: los resultados no son representativos del rendimiento global del proyecto GeoNUSAF; otros folds podrían comportarse de manera diferente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unet-r50-random-fold2
- Variante con split por bloques (fold 0): https://huggingface.co/sugam24/geonusaf-unet-r50-block-fold0
- Perfil del autor en Hugging Face: https://huggingface.co/sugam24
- Repositorio de ONNX Runtime con modelos (referencia general): https://onnxruntime.ai/models
- Repositorio de PyTorch Image Models (referencia para encoders): https://github.com/huggingface/pytorch-image-models
