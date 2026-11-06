# wesjos/fairface-halfpint-cnano-3task-112

## Resumen

FairFace-HalfPint-CNano-3Task-112 es un modelo de clasificación de imágenes especializado en atributos faciales, desarrollado por el usuario wesjos. Se trata de un fine-tuning del backbone ConvNeXt-Nano de timm sobre el conjunto de datos FairFace, y predice de forma simultánea tres atributos demográficos: raza (7 clases), género (2 clases) y edad (9 rangos ordinales). El modelo está pensado como herramienta de investigación para medir sesgos algorítmicos y auditar sistemas de visión por computador, no para uso en producción de alto riesgo.

La arquitectura es una red neuronal convolucional ConvNeXt-Nano con 14.963.457 parámetros y una resolución de entrada reducida a 112x112 píxeles, lo que lo convierte en una variante de alto rendimiento (el autor reporta 10.994 imágenes por segundo). Esta resolución reducida sacrifica precisión en la estimación de edad (aproximadamente 1,4 puntos porcentuales menos que la variante de 224x224), por lo que el propio autor desaconseja su uso cuando la edad sea el atributo crítico.

El modelo es relevante en el contexto actual de auditoría de sesgos en sistemas biométricos y de reconocimiento facial, ya que proporciona una línea base ligera y reproducible sobre FairFace, un dataset diseñado explícitamente para medir disparidades demográficas. Su licencia CC BY 4.0 y su reducido tamaño (0,1 GB) facilitan su integración en pipelines de evaluación de equidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Nano (CNN) |
| Parámetros totales | 14.963.457 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 112x112 RGB) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo emplea el backbone ConvNeXt-Nano `timm/convnext_nano.in12k_ft_in1k`, una red convolucional moderna con bloques ConvNeXt y normalización LayerNorm, preentrenada en ImageNet-12k y afinada en ImageNet-1k. Sobre este backbone se añaden tres cabezas de clasificación independientes: una para raza (7 clases), otra para género (2 clases) y otra para edad modelada como 8 umbrales ordinales que producen 9 rangos. La entrada es RGB a 112x112 con normalización estándar de ImageNet (mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)).

El entrenamiento se realizó sobre el dataset FairFace (Karkkainen & Joo, WACV 2021), que contiene 97.698 imágenes originales. El autor deduplicó por contenido (SHA-256) y dividió en 77.926 imágenes de entrenamiento, 8.659 de selección/validación y 10.931 de test, con intersecciones vacías entre conjuntos. No se menciona el uso de RLHF, DPO ni técnicas de alineación; se trata de un fine-tuning supervisado multi-tarea con una única semilla aleatoria, por lo que el autor advierte que diferencias inferiores a 0,3 pp deben considerarse ruido estadístico.

## Capacidades

- Clasificación simultánea de tres atributos faciales: raza (7 clases), género (2 clases) y edad (9 rangos ordinales).
- Predicción de edad con umbrales ordinales, lo que permite obtener tanto la clase como la distancia esperada (MAE de 0,4583 rangos).
- Inferencia de alto rendimiento: 10.994 imágenes por segundo según el autor, adecuada para procesar grandes lotes en auditorías.
- Integración con el ecosistema timm y PyTorch, lo que facilita su uso como extractor de características o como base para fine-tuning adicional.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente de visión y clasificación.
- No dispone de modo "thinking", visión extendida, audio ni otras capacidades generativas.

## Casos de uso

- Auditoría de sesgos en sistemas de reconocimiento facial: el modelo permite medir disparidades de precisión entre grupos demográficos sobre un conjunto de test congelado, sirviendo como referencia reproducible en informes de equidad algorítmica.
- Evaluación de equidad en datasets de visión: se puede usar para etiquetar automáticamente atributos demográficos en grandes corpus de imágenes y detectar desequilibrios de representación antes de entrenar otros modelos.
- Investigación académica sobre atributos faciales: su licencia CC BY 4.0 y su reducido tamaño facilitan la replicación de experimentos y la comparación con otras variantes de FairFace.
- Prototipado rápido de pipelines de clasificación demográfica: al procesar 10.994 imágenes por segundo, es adecuado para pruebas de concepto que requieran etiquetar lotes masivos sin infraestructura pesada.
- Filtrado y análisis de contenido en repositorios de imágenes: permite segmentar colecciones por rango de edad o género para estudios de composición demográfica.
- Docencia y formación en ética de IA: sirve como ejemplo práctico de modelo con advertencias explícitas de uso responsable y de las limitaciones de las etiquetas categóricas.
- Benchmarking de backbones ligeros: al ser un fine-tuning de ConvNeXt-Nano, puede emplearse para comparar el rendimiento de arquitecturas pequeñas en tareas de clasificación multi-tarea.

## Benchmarks y rendimiento

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 74,13% | 73,99% | 10.931 |
| Género (2 clases) | 94,87% | 94,85% | 10.931 |
| Edad (9 rangos ordinales) | 58,35% | 54,92% | 10.931 |

Precisión media de las tres tareas: 75,78%. MAE de edad: 0,4583 rangos; precisión ±1 rango: 96,29%. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el reducido tamaño del modelo (14,96 M de parámetros) y la entrada de 112x112.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también puede ejecutarse en CPU para lotes pequeños.
- Cabe en GPU consumer y en hardware de gama baja, incluidas GPUs integradas y dispositivos edge.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, o integración con timm; no se mencionan soportes específicos para vLLM, llama.cpp ni Ollama (no aplicables a modelos de visión de este tipo).
- Latencia y throughput: el autor reporta 10.994 imágenes por segundo, aunque no especifica la GPU utilizada para esa medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-HalfPint-CNano-3Task-112 | 14,96 M | 112x112 | Raza, género, edad | CC BY 4.0 | Hugging Face |
| Variante 224 del mismo proyecto | no disponible | 224x224 | Raza, género, edad | CC BY 4.0 | Hugging Face (referenciada por el autor) |
| Otros modelos FairFace | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada. La única comparación explícita es con la variante de 224x224 del mismo proyecto, que según el autor obtiene aproximadamente 1,4 pp más de precisión en edad.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor prohíbe explícitamente su uso para vigilancia, verificación de identidad, reclutamiento, evaluación crediticia o cualquier decisión automatizada de alto riesgo.
- Reutilización del conjunto de test: el test congelado se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas reportadas son descriptivas y no una estimación imparcial del rendimiento en producción.
- Una única semilla de entrenamiento: diferencias inferiores a 0,3 pp deben considerarse ruido estadístico.
- Disparidades demográficas: los límites entre grupos (especialmente Latino/Hispano, Oriente Medio, Indio y Blanco) no son discretos; la estimación de edad presenta mayor tasa de error y algunos subgrupos interseccionales género x raza muestran disparidades elevadas.
- Etiquetas categóricas: las etiquetas reflejan anotaciones del dataset FairFace y no representan la autoidentificación personal ni el origen real de las personas.
- Riesgo de alucinación no aplica (modelo de clasificación), pero sí riesgo de clasificación errónea en rostros con iluminación adversa, oclusiones o resoluciones muy bajas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero las restricciones éticas del autor y el origen de las imágenes (YFCC100M) deben respetarse.
- Modelo entrenado solo con etiquetas en inglés; no se reportan evaluaciones en otros idiomas o contextos culturales.

## Enlaces

- [Hugging Face: wesjos/fairface-halfpint-cnano-3task-112](https://huggingface.co/wesjos/fairface-halfpint-cnano-3task-112)
- [Backbone: timm/convnext_nano.in12k_ft_in1k](https://huggingface.co/timm/convnext_nano.in12k_ft_in1k)
- [Dataset: HuggingFaceM4/FairFace](https://huggingface.co/datasets/HuggingFaceM4/FairFace)
- [Paper FairFace (Karkkainen & Joo, WACV 2021)](https://arxiv.org/abs/1908.04913)
