# wesjos/fairface-pocketowl-a-3task-224

## Resumen

FairFace-PocketOwl-A-3Task-224 es un modelo de clasificación de atributos faciales desarrollado por el usuario wesjos. Se trata de un fine-tuning del backbone EfficientNetV2-S (`timm/tf_efficientnetv2_s.in21k_ft_in1k`) sobre el conjunto de datos FairFace, con el objetivo de predecir simultáneamente tres atributos demográficos: raza (7 clases), género (2 clases) y edad (9 rangos). El modelo tiene 20.199.265 parámetros y opera sobre imágenes RGB de 224x224 píxeles.

El modelo se presenta como una versión compacta y destilada que logra mejoras notables en las tareas de raza y género manteniendo una precisión de edad comparable a la línea base. Está pensado exclusivamente para investigación sobre sesgos algorítmicos y auditoría de equidad, no para aplicaciones de producción de alto riesgo.

Su relevancia radica en que ofrece un punto de partida ligero y reproducible para medir disparidades demográficas en sistemas de visión por computador, con un conjunto de test congelado y deduplicado de 10.931 imágenes. La licencia CC BY 4.0 facilita su uso en contextos académicos y de auditoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (CNN, backbone `timm/tf_efficientnetv2_s.in21k_ft_in1k`) |
| Parámetros totales | 20.199.265 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 224x224 RGB) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`), según la model card |
| Resolución de entrada | 224x224 RGB |
| Normalización | mean=(0.5, 0.5, 0.5), std=(0.5, 0.5, 0.5) |
| Tareas de salida | raza (7 clases), género (2 clases), edad (9 rangos / 8 umbrales ordinales) |
| Tamaño del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

El modelo emplea como backbone EfficientNetV2-S, una red convolucional con bloques de convolución fusionada (Fused-MBConv) y MBConv, preentrenada en ImageNet-21k y afinada en ImageNet-1k (`in21k_ft_in1k`). Sobre este backbone se añaden cabeceras de clasificación para las tres tareas: raza con 7 clases, género con 2 clases y edad con 9 rangos (modelada como 8 umbrales ordinales). La entrada es una imagen RGB de 224x224 normalizada con media y desviación estándar de 0.5.

El entrenamiento se realizó sobre el dataset FairFace (Karkkainen & Joo, WACV 2021), que contiene 97.698 imágenes crudas. Para este proyecto se deduplicó por contenido mediante SHA-256, resultando en 77.926 imágenes de entrenamiento, 8.659 de selección/validación y 10.931 de test. La model card indica que las intersecciones entre particiones son nulas y que ninguna imagen del split oficial de entrenamiento entró en el conjunto de evaluación. El autor describe el modelo como "destilado compacto" con mejoras marcadas en raza y género dentro del presupuesto, y precisión de edad a la par con la línea base. No se detalla en la información disponible si se emplearon técnicas de RLHF, DPO u otras, ni el número exacto de épocas o tokens de entrenamiento.

## Capacidades

- Clasificación de atributos faciales demográficos: raza (7 clases), género (2 clases) y edad (9 rangos) en una sola pasada.
- Predicción de edad como problema ordinal (8 umbrales), lo que permite estimar el rango etario y calcular el error absoluto medio en brackets.
- Procesamiento de imágenes RGB de 224x224 con normalización fija (0.5/0.5).
- Salida multi-tarea simultánea, útil para auditorías de equidad que requieren cruzar atributos.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un clasificador de visión, no un LLM).
- Capacidades multilingües: no aplica; las etiquetas están en inglés.
- No dispone de modo "thinking", visión general, audio ni otras capacidades más allá de la clasificación facial.

## Casos de uso

- Auditoría de sesgos en sistemas de visión: el modelo permite medir disparidades de precisión entre subgrupos de raza, género y edad sobre un conjunto de test congelado, sirviendo como referencia para evaluar otros clasificadores faciales.
- Investigación académica sobre atributos faciales: al estar entrenado sobre FairFace con particiones deduplicadas, es adecuado para reproducir experimentos de clasificación multi-tarea y comparar con la línea base EfficientNetV2-S.
- Medición de rendimiento por subgrupo interseccional: la salida simultánea de raza y género permite calcular métricas cruzadas (por ejemplo, recall por combinación género x raza) y detectar brechas de equidad.
- Prototipado de pipelines de análisis demográfico en investigación: con 20M de parámetros y pesos de 0.2 GB, se puede desplegar en una GPU de consumo para experimentos rápidos de clasificación por lotes.
- Evaluación de técnicas de destilación o compresión: al ser un modelo "destilado compacto", sirve como caso de estudio para comparar el equilibrio entre tamaño y precisión en tareas multi-atributo.
- Docencia y formación en ética de IA: permite ilustrar de forma práctica cómo un clasificador demográfico puede presentar sesgos y por qué no debe usarse en decisiones de alto riesgo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test congelado de 10.931 imágenes:

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 74,53% | 74,24% | 10.931 |
| Género (2 clases) | 95,46% | 95,45% | 10.931 |
| Edad (9 rangos ordinales) | 60,43% | 57,27% | 10.931 |

- Precisión media de las 3 tareas: **76,81%**.
- MAE de edad: **0,4315 brackets**.
- Precisión con tolerancia de +/-1 bracket: **96,95%**.

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un lote pequeño; el checkpoint ocupa 0.2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `timm` y `torchvision`; exportación a TorchScript u ONNX posible (no documentada en la model card); no se mencionan vLLM, llama.cpp ni Ollama (no aplican a CNN de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tareas | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-PocketOwl-A-3Task-224 | 20,2M | raza + género + edad | 224x224 RGB | CC BY 4.0 | HuggingFace |
| Backbone `timm/tf_efficientnetv2_s.in21k_ft_in1k` | ~20M | clasificación ImageNet | 224x224 RGB | Apache-2.0 | HuggingFace |
| FairFace (modelos de referencia del paper) | no disponible | raza + género + edad | no disponible | no disponible | no disponible |

La información disponible no incluye resultados de otros modelos de atributos faciales comparables, por lo que no es posible establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor prohíbe explícitamente su uso para vigilancia, verificación de identidad, reclutamiento, evaluación crediticia o cualquier decisión automatizada de alto riesgo.
- Reutilización del conjunto de evaluación: el test congelado se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas son descriptivas y no una estimación imparcial.
- Semilla única: el entrenamiento se realizó con una sola semilla; diferencias inferiores a 0,3 pp deben considerarse ruido estadístico.
- Disparidades demográficas: los límites entre grupos (latino/hispano, Oriente Medio, indio y blanco) no son discretos; la estimación de edad presenta mayores tasas de error y algunos subgrupos interseccionales género x raza muestran disparidades elevadas.
- Atribución de etiquetas: las etiquetas reflejan las anotaciones categóricas de FairFace y no la autoidentificación personal ni el origen real de las personas.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de clasificación errónea en rostros fuera de la distribución del dataset.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero las restricciones éticas del autor y el origen de las imágenes (YFCC100M) deben considerarse.
- Limitación de idioma: etiquetas solo en inglés; no hay soporte multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesjos/fairface-pocketowl-a-3task-224
- Backbone base: https://huggingface.co/timm/tf_efficientnetv2_s.in21k_ft_in1k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): no disponible como enlace directo en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
