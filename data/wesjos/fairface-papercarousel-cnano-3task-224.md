# wesjos/fairface-papercarousel-cnano-3task-224

## Resumen

FairFace-PaperCarousel-CNano-3Task-224 es un modelo de clasificación de imágenes especializado en atributos faciales, desarrollado por el usuario wesjos. Se trata de un fine-tuning del backbone ConvNeXt-Nano (timm/convnext_nano.in12k_ft_in1k) sobre el conjunto de datos FairFace, y predice simultáneamente tres atributos demográficos: raza (7 clases), género (2 clases) y edad (8 umbrales ordinales que generan 9 rangos).

El modelo responde a una necesidad concreta en el ámbito de la auditoría de sesgos algorítmicos: disponer de un clasificador ligero y reproducible que permita medir disparidades demográficas en sistemas de visión por computador. Con 14,96 millones de parámetros y una resolución de entrada de 224x224 píxeles, está diseñado para ser desplegado con un coste computacional bajo, lo que lo hace adecuado para pipelines de evaluación a gran escala.

Es relevante ahora porque la comunidad investigadora demanda herramientas abiertas para cuantificar sesgos en modelos de reconocimiento facial y demografía, y este checkpoint se publica bajo licencia CC BY 4.0 con métricas detalladas por tarea y por clase. El autor lo presenta como el mejor modelo dentro de su presupuesto computacional en las tres tareas, con una mejora media de 1,15 puntos porcentuales, y lo recomienda como candidato de despliegue por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Nano (backbone timm/convnext_nano.in12k_ft_in1k), cabeza multi-tarea |
| Parametros totales | 14.963.457 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; metadatos del modelo) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo emplea una red convolucional ConvNeXt-Nano como extractor de características, preentrenada en ImageNet-12k y afinada en ImageNet-1k (timm/convnext_nano.in12k_ft_in1k), sobre la que se añade una cabeza multi-tarea que produce simultáneamente las predicciones de raza, género y edad. La entrada es RGB a 224x224 píxeles con normalización estándar (media 0,485/0,456/0,406; desviación 0,229/0,224/0,225). La tarea de edad se formula como 8 umbrales ordinales que generan 9 rangos.

El entrenamiento se realizó sobre el dataset FairFace (Karkkainen & Joo, WACV 2021), que contiene 97.698 imágenes originales. Para este proyecto se deduplicaron por contenido mediante SHA-256, resultando en 77.926 imágenes de entrenamiento, 8.659 de selección/validación y 10.931 de test. El autor indica que todas las intersecciones entre conjuntos son cero y que ninguna imagen de la partición oficial de entrenamiento entró en el conjunto de evaluación. No se especifica en la información disponible el número de tokens ni detalles sobre RLHF/DPO (no aplica a este tipo de modelo), ni innovaciones técnicas adicionales más allá del enfoque multi-tarea.

## Capacidades

- Clasificación simultánea de tres atributos faciales: raza (7 clases), género (2 clases) y edad (9 rangos derivados de 8 umbrales ordinales).
- Predicción de edad con métrica ordinal: MAE de 0,4370 rangos y precisión +/-1 rango del 96,83%.
- Clasificación de género con alta precisión (95,57% de accuracy).
- Clasificación de raza en 7 clases con accuracy del 74,92%.
- Inferencia ligera sobre imágenes RGB de 224x224 con normalización ImageNet.
- Integración con el ecosistema timm y PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un clasificador de visión, no un modelo generativo).

## Casos de uso

- Auditoría de sesgos en sistemas de visión: el modelo permite medir disparidades de rendimiento entre subgrupos demográficos (género x raza) en pipelines de reconocimiento facial, gracias a sus métricas por clase y matrices de confusión publicadas.
- Evaluación de fairness en datasets: se puede usar para etiquetar automáticamente atributos demográficos en grandes conjuntos de imágenes y comparar la distribución resultante con anotaciones humanas, aprovechando su bajo coste computacional (14,96 M de parámetros).
- Investigación académica sobre demografía facial: sirve como línea base reproducible para comparar nuevos métodos de clasificación de atributos, dado que el autor publica particiones deduplicadas y métricas detalladas.
- Filtrado y estratificación de datasets de entrenamiento: permite agrupar imágenes por rango de edad, género y raza para construir particiones balanceadas antes de entrenar otros modelos.
- Monitorización de deriva en producción de sistemas demográficos: al ser ligero, puede desplegarse como clasificador auxiliar que detecte cambios en la distribución de atributos de las imágenes de entrada.
- Docencia y experimentación: su tamaño reducido y su licencia CC BY 4.0 lo hacen adecuado para prácticas de fine-tuning, evaluación de modelos y análisis de sesgos en cursos de visión por computador.
- Medición de edad aproximada en estudios poblacionales: con un MAE de 0,437 rangos y 96,83% de acierto a +/-1 rango, puede emplearse para estimar distribuciones de edad en conjuntos de imágenes controlados.

## Benchmarks y rendimiento

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 74,92% | 74,74% | 10.931 |
| Género (2 clases) | 95,57% | 95,56% | 10.931 |
| Edad (9 rangos ordinales) | 59,77% | 56,82% | 10.931 |

Media de accuracy en las 3 tareas: 76,76%. MAE de edad: 0,4370 rangos; precisión +/-1 rango: 96,83%. El autor indica una mejora media de +1,15 puntos porcentuales respecto a otros modelos dentro del mismo presupuesto, aunque no se proporcionan en la información disponible los resultados de los modelos comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo (14,96 M de parámetros, aproximadamente 60 MB de pesos), más el espacio de activaciones para lotes pequeños a 224x224.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, así como en A100 y H100 para despliegues a gran escala.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con la función `inference.load` y `inference.predict` proporcionada por el autor; también es integrable en TorchServe, ONNX Runtime o TensorRT tras conversión (no documentado en la información disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-PaperCarousel-CNano-3Task-224 | 14,96 M | 224x224 RGB | Raza + género + edad | CC BY 4.0 | HuggingFace |
| timm/convnext_nano.in12k_ft_in1k (backbone base) | aprox. 15 M | 224x224 RGB | Clasificación ImageNet | Apache-2.0 | HuggingFace |
| FairFace (dataset original) | no aplica | imágenes variables | Anotaciones de raza, género y edad | CC BY 4.0 | HuggingFace |

No se dispone en la información proporcionada de resultados de benchmarks de otros clasificadores de atributos faciales comparables, por lo que la comparativa de rendimiento cuantitativa no está disponible.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor prohíbe explícitamente su uso para vigilancia, verificación de identidad, reclutamiento, evaluación crediticia o cualquier toma de decisiones automatizada de alto riesgo.
- Reutilización del conjunto de evaluación: el test fijo se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas reportadas son descriptivas y no una estimación limpia e independiente.
- Semilla única: el entrenamiento se realizó con una sola semilla; las diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico.
- Disparidades demográficas: los límites entre grupos (especialmente entre latino/hispano, Oriente Medio, indio y blanco) no son discretos; la estimación de edad presenta mayores tasas de error y algunos subgrupos interseccionales género x raza muestran disparidades superiores.
- Atribución de etiquetas: las etiquetas reflejan las anotaciones categóricas de FairFace y no representan la autoidentificación personal ni la ascendencia real de las personas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en rostros con iluminación, oclusión o ángulos no representativos del dataset.
- Licencia: CC BY 4.0 permite uso comercial con atribución, pero las restricciones éticas del autor limitan de facto los usos de alto riesgo; el backbone base es Apache-2.0.
- Idiomas: el modelo no procesa texto; la etiqueta de idioma "en" se refiere a los metadatos, no a capacidades lingüísticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesjos/fairface-papercarousel-cnano-3task-224
- Dataset FairFace en HuggingFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Backbone base en HuggingFace: https://huggingface.co/timm/convnext_nano.in12k_ft_in1k
- Paper FairFace (Karkkainen & Joo, WACV 2021): no disponible en la información proporcionada como enlace directo.
