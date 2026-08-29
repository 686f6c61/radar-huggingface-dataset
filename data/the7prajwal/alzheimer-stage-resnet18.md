# the7prajwal/alzheimer-stage-resnet18

## Resumen

El modelo `the7prajwal/alzheimer-stage-resnet18` es un clasificador de imágenes médicas basado en una arquitectura ResNet18, ajustado para identificar cuatro etapas de la enfermedad de Alzheimer a partir de cortes axiales de resonancia magnética (MRI) cerebral. Ha sido desarrollado por el autor `the7prajwal` como parte de un proyecto estudiantil de séptimo semestre (SDP_CISHA_05) y se publica bajo licencia MIT.

El modelo resuelve un problema de clasificación multiclase en el ámbito del diagnóstico asistido por imagen, aunque su autor advierte explícitamente de que no está validado para uso clínico real. Su relevancia radica en ser una demostración práctica de transfer learning aplicado a imágenes médicas, con un pipeline de entrenamiento en dos fases y técnicas de manejo de desbalance de clases. A pesar de sus buenos resultados en el conjunto de test del dataset de Kaggle, la fuga de datos documentada en ese dataset obliga a interpretar las métricas como un límite superior específico del conjunto, no como una medida de generalización a datos clínicos independientes.

El repositorio en HuggingFace no contiene pesos del modelo (tamaño 0.0 GB), solo la model card, por lo que no es posible descargar el modelo directamente desde esa plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (preentrenado en ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (imagenes medicas) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se incluyen pesos en el repo) |

## Arquitectura y entrenamiento

El modelo utiliza una ResNet18 estándar preentrenada en ImageNet como backbone. El proceso de ajuste se realizó en dos fases: primero se congeló la cabeza del modelo (warmup) y posteriormente se descongelaron la capa `layer4` y la capa fully connected (`fc`) para el ajuste fino final. El dataset empleado es el "Alzheimer's Dataset" de Kaggle, con aproximadamente 6400 imágenes de resonancia magnética clasificadas en cuatro categorías: NonDemented, VeryMildDemented, MildDemented y ModerateDemented.

Para abordar el desbalance de clases, se aplicó una aumentación offline (6x) sobre la clase minoritaria (ModerateDemented) y se utilizó una función de pérdida CrossEntropyLoss ponderada. El mejor valor de macro-F1 en validación alcanzó 0.9775, mientras que en el conjunto de test se obtuvo una precisión de 0.9927 y un macro-F1 de 0.9947. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión por computador, no de lenguaje.

## Capacidades

- Clasificación de imágenes médicas: identifica cuatro etapas de Alzheimer (NonDemented, VeryMildDemented, MildDemented, ModerateDemented) a partir de cortes axiales de MRI.
- Transfer learning: aprovecha características preentrenadas en ImageNet para la extracción de características visuales.
- Explicabilidad: el autor menciona el uso de Grad-CAM para visualizar las regiones anatómicas relevantes (ventrículos, corteza periventricular), lo que permite interpretar las decisiones del modelo.
- Manejo de desbalance: incorpora aumentación y pérdida ponderada para mejorar el rendimiento en clases minoritarias.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Investigación académica en imagen médica: el modelo puede utilizarse como referencia en estudios comparativos de clasificación de Alzheimer, siempre que se tenga en cuenta la fuga de datos del dataset original.
- Demostración de transfer learning: sirve como ejemplo didáctico de cómo ajustar un modelo preentrenado en ImageNet para una tarea específica de clasificación médica.
- Enseñanza de técnicas de explicabilidad (XAI): las visualizaciones Grad-CAM permiten a estudiantes e investigadores comprender qué regiones del cerebro influyen en la decisión del modelo.
- Desarrollo de pipelines de preprocesamiento de MRI: puede integrarse en flujos de trabajo que requieran una clasificación rápida y automática de cortes axiales, aunque solo con fines de investigación.
- Evaluación de técnicas de aumentación de datos: el enfoque de aumentación offline aplicado a la clase minoritaria puede servir como caso de estudio para otras tareas de clasificación con desbalance.
- Comparación de arquitecturas: al ser un modelo ligero, puede utilizarse como línea base para comparar con arquitecturas más complejas (por ejemplo, híbridas con segmentación) en el mismo dominio.

## Benchmarks y rendimiento

Los resultados reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Mejor macro-F1 (validacion) | 0.9775 |
| Precision (test) | 0.9927 |
| Macro-F1 (test) | 0.9947 |

Estos valores se obtuvieron sobre el dataset de Kaggle, que presenta fuga de datos documentada (imágenes casi duplicadas o aumentadas compartidas entre entrenamiento y test). Por tanto, deben interpretarse como un límite superior específico del dataset, no como una estimación de rendimiento en datos clínicos independientes. No se han publicado comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al ser una ResNet18, el modelo es relativamente ligero en comparación con arquitecturas modernas de gran tamaño. Sin embargo, no se especifican requisitos concretos de VRAM ni de GPU en la documentación.
- Se puede inferir que es ejecutable en GPUs de consumo (por ejemplo, NVIDIA GTX 1060 o superiores) con al menos 4-8 GB de VRAM, aunque esta estimación no está confirmada por el autor.
- Dado que no se proporcionan pesos en el repositorio, no es posible desplegarlo directamente con herramientas como vLLM, llama.cpp u Ollama. Para su uso, sería necesario obtener los pesos del autor o reentrenar el modelo.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de clasificación de Alzheimer en la documentación proporcionada. Existen en la literatura otros enfoques, como el híbrido MedSAM + ResNet18 (que alcanza un 97.27% de precisión en el mismo dataset) o modelos basados en Inception v3, pero no se han incluido datos cuantitativos comparables en la información disponible.

## Limitaciones y advertencias

- Fuga de datos: el dataset de Kaggle contiene imágenes casi duplicadas o aumentadas compartidas entre los conjuntos de entrenamiento y test, lo que infla artificialmente las métricas reportadas. Los resultados no son representativos de la generalización a datos clínicos reales.
- No apto para uso clínico: el modelo no ha sido validado con datos clínicos independientes, no ha sido revisado por profesionales médicos ni aprobado para diagnóstico. No debe utilizarse para tomar decisiones médicas reales.
- Alcance limitado: solo clasifica cortes axiales de MRI y no maneja otros tipos de imágenes o modalidades.
- Sin pesos disponibles: el repositorio de HuggingFace no contiene los pesos del modelo, lo que impide su uso directo.
- Sesgos potenciales: al entrenarse con un dataset específico, el modelo puede reflejar sesgos demográficos o de adquisición de imágenes presentes en ese conjunto.
- Riesgo de alucinación: no aplica, al ser un modelo de clasificación y no generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the7prajwal/alzheimer-stage-resnet18
- Proyecto relacionado en GitHub (híbrido MedSAM + ResNet18): https://github.com/harshamains-gif/alzheimer-detection
- Artículo en Nature sobre detección de Alzheimer con deep learning: https://www.nature.com/articles/s41598-025-14169-8
- Artículo en Nature sobre enfoque híbrido para detección de Alzheimer: https://www.nature.com/articles/s41598-025-11743-y
- Proyecto de clasificación de Alzheimer con explicabilidad (HiResCAM): https://github.com/codewithadityard/Alzheimers-MRI-Classification
- Publicación en LinkedIn sobre avances en IA para imagen médica: https://www.linkedin.com/posts/midi-medical-imaging_its-always-exciting-when-a-medical-ai-project-activity-7497372190846263296-zJlZ
