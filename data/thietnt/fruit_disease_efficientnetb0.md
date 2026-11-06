# thietnt/Fruit_Disease_EfficientNetB0

## Resumen

Fruit Disease EfficientNetB0 es un clasificador de imágenes especializado en la detección y diagnóstico de enfermedades en cuatro cultivos frutales: manzana, guayaba, mango y granada. Lo desarrolla el usuario thietnt y se distribuye en Hugging Face bajo licencia MIT. El modelo parte de EfficientNetB0 preentrenado y se ha ajustado mediante transfer learning para resolver un problema de clasificación de 17 clases que combinan estados sanos y distintas patologías fúngicas y bacterianas.

El modelo se publica en formato TensorFlow Lite, lo que indica que su orientación principal es el despliegue en entornos con recursos limitados, como dispositivos móviles o CPU estándar. El autor declara una precisión de test del 88,61 % y un F1-Score del 88,48 % sobre el conjunto de evaluación, aunque no se detalla la composición de dicho conjunto.

Su relevancia práctica reside en el ámbito agrotecnológico: permite construir aplicaciones de diagnóstico fitosanitario accesibles, con inferencia declarada por debajo de 50 ms en CPU y una interfaz Gradio de demostración que incluye carga de imágenes y captura por webcam. No obstante, la documentación disponible es escasa en cuanto a datos de entrenamiento, procedencia del dataset y evaluación comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetB0 (transfer learning, fine-tuning) |
| Parametros totales | no disponible (EfficientNetB0 base ronda los 5,3 M, dato no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en TensorFlow Lite (la cuantización concreta no se especifica) |
| Idiomas soportados | no disponible (la interfaz y las descripciones de diagnóstico están en vietnamita) |
| Licencia | MIT |
| Formato de pesos | TensorFlow Lite (tflite) |

## Arquitectura y entrenamiento

El modelo se basa en EfficientNetB0, una red convolucional con escalado compuesto de profundidad, anchura y resolución. Sobre esa base se aplica transfer learning con fine-tuning para una tarea de clasificación de imágenes en 17 clases. La salida es una etiqueta discreta entre las 17 categorías definidas (manzana, guayaba, mango y granada, cada una con sus estados sanos y patológicos).

La información disponible no detalla el número de imágenes de entrenamiento, la composición del dataset, el esquema de aumentación de datos, la estrategia de congelación de capas ni los hiperparámetros de entrenamiento. Tampoco se indica si se aplicó regularización específica, balanceo de clases o validación cruzada. El autor reporta una precisión de test del 88,61 % y un F1-Score del 88,48 %, pero no se especifica el tamaño ni la procedencia del conjunto de test, lo que limita la interpretación de esas métricas.

## Capacidades

- Clasificación de imágenes de frutas en 17 clases que combinan cuatro especies (manzana, guayaba, mango, granada) y sus estados sanos o enfermos.
- Diagnóstico de enfermedades fúngicas y bacterianas concretas: sarna, podredumbre amarga, antracnosis, mosca de la fruta, Alternaria, podredumbre por Aspergillus, Lasiodiplodia, mancha bacteriana y Cercospora, entre otras.
- Generación de descripciones de síntomas y protocolos de tratamiento agrícola en vietnamita para cada clase detectada (según la model card).
- Inferencia optimizada para CPU mediante TensorFlow Lite, con latencia declarada inferior a 50 ms.
- Integración en interfaz Gradio con carga de imagen estática y captura por webcam.
- No dispone de capacidades de generación de texto libre, tool calling, agentes ni razonamiento multi-paso; es un clasificador de visión puro.

## Casos de uso

- Aplicación móvil de diagnóstico en campo: el modelo en formato TFLite puede embeberse en una app Android o iOS para que el agricultor fotografíe una hoja o fruto y obtenga la clase de enfermedad en menos de 50 ms sin conexión a internet.
- Estación de inspección en central hortofrutícola: integrado en una cámara fija sobre la línea de clasificación, permite descartar automáticamente piezas con signos visibles de podredumbre o antracnosis antes del envasado.
- Sistema de alerta temprana en invernadero: combinado con captura periódica de imágenes, el clasificador puede señalar la aparición de focos de sarna o mancha bacteriana y activar protocolos de tratamiento.
- Asistente de extensión agraria: la interfaz Gradio con descripciones de síntomas y tratamientos en vietnamita sirve como herramienta de formación para técnicos agrícolas que necesitan identificar patologías en cultivos de mango o guayaba.
- Investigación fitosanitaria: el modelo puede emplearse como línea base para experimentos de clasificación de enfermedades en frutales, comparando su rendimiento con arquitecturas más recientes sobre el mismo conjunto de 17 clases.
- Filtrado previo en pipelines de anotación: al ser un clasificador ligero, puede preetiquetar grandes lotes de imágenes de campo y reducir el trabajo manual de revisión en la construcción de nuevos datasets.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | 88,61 % |
| F1-Score | 88,48 % |
| Latencia de inferencia | < 50 ms en CPU estándar (declarado, TFLite) |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un clasificador de imágenes y no de un modelo de lenguaje. Tampoco se detalla el desglose por clase ni la matriz de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de CPU; en GPU, EfficientNetB0 en TFLite requiere muy poca memoria (del orden de cientos de MB, sin cifra oficial disponible).
- GPU recomendadas: no es necesario GPU; el modelo está optimizado para CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede ejecutarlo con holgura, pero no aporta ventaja significativa frente a CPU para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, e incluso en dispositivos móviles y sistemas embebidos.
- Opciones de despliegue: TensorFlow Lite (interpreter), TensorFlow Serving, Gradio (demo incluida), y potencialmente conversión a ONNX Runtime o ejecución en Android/iOS mediante los runtimes TFLite correspondientes.
- Latencia y throughput estimados: latencia declarada inferior a 50 ms por imagen en CPU estándar; el throughput dependerá del hardware y del número de hilos, sin datos oficiales publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Formato | Licencia | Precisión declarada |
|---|---|---|---|---|---|
| Fruit Disease EfficientNetB0 (thietnt) | EfficientNetB0 | 17 | TFLite | MIT | 88,61 % |
| EfficientNetB0 base (ImageNet) | EfficientNetB0 | 1000 | SavedModel/TFLite | Apache 2.0 | no aplica a esta tarea |
| MobileNetV2 (clasificación genérica) | MobileNetV2 | 1000 | TFLite/ONNX | Apache 2.0 | no aplica a esta tarea |
| ResNet50 (clasificación genérica) | ResNet50 | 1000 | SavedModel/ONNX | Apache 2.0 | no aplica a esta tarea |

No se dispone de comparativas publicadas frente a otros clasificadores específicos de enfermedades de frutales en la información proporcionada. Las alternativas genéricas citadas requerirían fine-tuning para la misma tarea, por lo que la comparación directa de precisión no es posible con los datos disponibles.

## Limitaciones y advertencias

- Solo cubre cuatro especies frutales (manzana, guayaba, mango, granada) y 17 clases; no generaliza a otros cultivos ni a enfermedades no incluidas en el conjunto de entrenamiento.
- La precisión del 88,61 % se declara sin detallar el conjunto de test, su tamaño ni su procedencia, lo que impide evaluar el riesgo de sobreajuste o de sesgo por clase.
- No se documenta la composición del dataset de entrenamiento: pueden existir desequilibrios entre clases, sesgos de iluminación, fondo o variedad de fruto que degraden el rendimiento en condiciones de campo reales.
- La salida de diagnóstico y tratamiento está en vietnamita; no hay soporte multilingüe documentado.
- Riesgo de clasificación errónea ante imágenes de baja calidad, frutos parcialmente ocultos o patologías en fase temprana no representadas en el entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la procedencia del dataset subyacente, no documentada, por posibles restricciones adicionales.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; cualquier explicación diagnóstica proviene de texto predefinido asociado a cada clase.
- El repositorio tiene 0,0 GB declarados y 36 descargas, lo que sugiere que los pesos pueden no estar incluidos o que el contenido es mínimo; conviene verificar la disponibilidad real de los archivos antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/thietnt/Fruit_Disease_EfficientNetB0
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos distintos de la propia página del modelo en Hugging Face.
