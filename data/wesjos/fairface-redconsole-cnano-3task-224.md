# wesjos/fairface-redconsole-cnano-3task-224

## Resumen

FairFace-RedConsole-CNano-3Task-224 es un modelo de clasificación de imágenes especializado en la estimación de atributos faciales. Desarrollado por el usuario wesjos, se construye sobre el backbone ConvNeXt-Nano de la librería timm y resuelve una tarea de clasificación múltiple: predice simultáneamente la categoría racial (7 clases), el género (2 clases) y el grupo de edad (9 buckets ordinales) de un rostro recortado. Su relevancia radica en que demuestra que un preentrenamiento específico de dominio facial mejora la transferencia frente a pesos genéricos de ImageNet en un backbone de apenas 14,96 millones de parámetros.

El modelo parte de un backbone adaptado al dominio facial mediante VGGFace2 y MAAD-Face (3,06 millones de imágenes reales con supervisión multi-tarea sobre 31 atributos faciales, etapa denominada Honeycomb v3), y posteriormente se afina sobre el dataset FairFace con destilación de profesor. Esta combinación permite que un modelo de tamaño reducido supere, en la tarea de edad, la línea base oficial de ResNet34 publicada con FairFace.

La entrada es una imagen RGB de 224×224 con normalización ImageNet estándar, y la salida consiste en tres cabezas lineales independientes sobre el tronco ConvNeXt-Nano. El repositorio ocupa 0,2 GB e incluye pesos en formato PyTorch (`model.pt`), código de inferencia autocontenido y métricas detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Nano (timm `convnext_nano`) con tres cabezas lineales |
| Parametros totales | 14.963.457 (14,96 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`model.pt`, 114,28 MB) |

## Arquitectura y entrenamiento

El modelo emplea un tronco ConvNeXt-Nano, una red convolucional moderna con bloques inspirados en transformadores, inicializada desde el checkpoint `timm/convnext_nano.in12k_ft_in1k`. Sobre este tronco se añaden tres cabezas de clasificación: una softmax de 7 vías para raza, una softmax de 2 vías para género y una regresión ordinal con 8 umbrales que definen 9 buckets de edad.

El entrenamiento se realizó en dos fases. Primero, el backbone se adaptó al dominio facial sobre VGGFace2 más MAAD-Face, un conjunto de 3,06 millones de imágenes reales con supervisión multi-tarea sobre 31 atributos faciales (etapa Honeycomb v3, con pesos EMA). Después, el modelo se afinó sobre FairFace con destilación de profesor. El conjunto de test es el split de validación oficial de FairFace, deduplicado y congelado contra fuga de entrenamiento, compuesto por 10.931 imágenes. La entrada se redimensiona con BICUBIC a 224×224 y se normaliza con media (0,485, 0,456, 0,406) y desviación (0,229, 0,224, 0,225).

## Capacidades

- Clasificación de raza en 7 categorías según la taxonomía FairFace.
- Clasificación de género binaria.
- Estimación de edad ordinal en 9 buckets (regresión sobre 8 umbrales).
- Inferencia multi-tarea en una sola pasada sobre rostros recortados y aproximadamente frontales.
- Ejecución en CPU o GPU mediante un script de inferencia autocontenido.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües: las etiquetas de salida están en inglés.
- No incluye detección facial, reconocimiento de identidad ni anti-spoofing.

## Casos de uso

- Análisis demográfico agregado en estudios de sesgo: el modelo permite etiquetar grandes lotes de rostros por raza, género y edad para medir la representación de distintos grupos en datasets o sistemas, aprovechando su bajo coste computacional (14,96 M de parámetros).
- Moderación y auditoría de contenido: clasificación automática de atributos faciales en imágenes subidas a plataformas para detectar desequilibrios o validar políticas de contenido, con la advertencia de que las etiquetas son convenciones del dataset y no afirmaciones sobre identidad.
- Investigación en visión por computador: servir como línea base ligera y reproducible para experimentos de preentrenamiento de dominio facial, dado que el repositorio incluye métricas, intervalos de confianza bootstrap y código de inferencia.
- Preprocesado en pipelines de análisis de imágenes: etiquetado rápido de rostros recortados antes de etapas posteriores (por ejemplo, agrupación o filtrado), ejecutable en CPU para entornos sin GPU.
- Evaluación comparativa de backbones: uso como referencia para comparar el efecto del preentrenamiento específico de dominio frente a pesos ImageNet en arquitecturas pequeñas, con resultados publicados en la model card.
- Docencia y prototipado: ejemplo completo y autocontenido de clasificación multi-tarea con tres cabezas sobre un backbone timm, útil para demostrar técnicas de destilación y regresión ordinal en cursos prácticos.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test congelado de 10.931 imágenes (FairFace val), con bootstrap pareado de 10.000 remuestreos e intervalos de confianza del 98,75%.

| Tarea | ResNet34 oficial | cnano @ ImageNet | cnano @ Honeycomb (este modelo) | Ganancia vs ImageNet |
|---|---:|---:|---:|---:|
| Raza (7 clases) | 71,96% | 74,92% | 75,28% | +0,36 pp |
| Género (2 clases) | 94,40% | 95,57% | 95,56% | -0,01 pp |
| Edad (9 buckets) | 60,47% | 59,77% | 60,80% | +1,02 pp |
| Media 3 tareas | 75,61% | 76,76% | 77,21% | +0,46 pp |

La mejora en edad es la única estadísticamente significativa (IC [+0,09, +1,94]). En raza el intervalo incluye el cero (no peor) y en género el rendimiento es equivalente. No se han publicado resultados de MMLU, HumanEval ni GSM8K por tratarse de un modelo de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 para el modelo (114,28 MB de pesos) más el espacio de activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes moderados.
- Opciones de despliegue: PyTorch nativo con el script `inference.py` incluido; al ser un modelo timm, puede exportarse a TorchScript u ONNX para servir con ONNX Runtime o TensorRT, aunque estas rutas no están documentadas en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-RedConsole-CNano-3Task-224 | 14,96 M | 224×224 | Raza, género, edad | CC-BY-4.0 | Hugging Face |
| ResNet34 (línea base FairFace) | no disponible | no disponible | Raza, género, edad | no disponible | Referencia en paper FairFace |
| ConvNeXt-Nano @ ImageNet (misma arquitectura) | 14,96 M | 224×224 | Raza, género, edad | CC-BY-4.0 (timm) | timm |

La comparativa se limita a la línea base oficial de FairFace y al mismo backbone sin preentrenamiento facial, que son los únicos términos de comparación documentados en la información disponible.

## Limitaciones y advertencias

- Las etiquetas siguen la taxonomía de FairFace (7 grupos raciales, 2 géneros, 9 buckets de edad), que es una convención del dataset y no una afirmación sobre la identidad de las personas.
- La cabeza de edad es ordinal: la salida son buckets ordenados, no una edad continua.
- Diseñado para rostros recortados y aproximadamente frontales a 224×224; no es un modelo de reconocimiento facial ni de verificación de identidad.
- No incorpora componente de liveness ni anti-spoofing; no debe usarse en sistemas de autenticación.
- No fue evaluado con entradas no fotográficas o con oclusión severa.
- Los resultados reportados provienen del split de validación congelado de FairFace; se esperan cifras distintas en otras poblaciones, cámaras y recortes.
- Riesgo de sesgo: al derivar de FairFace y VGGFace2, puede heredar los sesgos de representación de dichos datasets.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en rostros fuera de distribución.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el uso para inferir atributos sensibles de personas está sujeto a la normativa aplicable (por ejemplo, RGPD en la UE).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/fairface-redconsole-cnano-3task-224
- Árbol de archivos: https://huggingface.co/wesjos/fairface-redconsole-cnano-3task-224/tree/main
- Modelo base en timm: https://huggingface.co/timm/convnext_nano.in12k_ft_in1k
- Dataset FairFace (paper): Karkkainen y Joo, WACV 2021, "FairFace: Face Attribute Dataset for Balanced Race, Gender, and Age for Bias Measurement and Mitigation"
- Dataset VGGFace2 (paper): Cao et al., FG 2018, "VGGFace2: A dataset for recognising faces across pose and age"
