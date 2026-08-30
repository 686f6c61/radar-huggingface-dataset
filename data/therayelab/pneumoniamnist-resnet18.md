# therayelab/pneumoniamnist-resnet18

## Resumen

El modelo `therayelab/pneumoniamnist-resnet18` es un clasificador de imágenes basado en una arquitectura ResNet-18, ajustado mediante transferencia de aprendizaje para detectar neumonía en radiografías de tórax. Ha sido entrenado con la herramienta AutoTrain sobre el subconjunto PneumoniaMNIST del dataset MedMNIST, que contiene imágenes de rayos X etiquetadas como «normal» o «neumonía». El modelo parte de los pesos preentrenados de `microsoft/resnet-18` y se presenta como un artefacto listo para inferencia en tareas de clasificación binaria de imágenes médicas.

Con 11,2 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto, incluidas GPUs de consumo o incluso CPU. Su relevancia radica en ofrecer una solución accesible y reproducible para un problema clínico concreto, aunque su validación se limita a las métricas reportadas en la model card y no se dispone de información sobre su licencia ni sobre el proceso de entrenamiento más allá de lo publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (red convolucional residual con 18 capas) |
| Parametros totales | 11.187.138 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ResNet-18, una red neuronal convolucional de 18 capas con bloques residuales que facilitan el entrenamiento de redes profundas y mitigan el problema del desvanecimiento del gradiente. Se ha empleado transferencia de aprendizaje partiendo de los pesos preentrenados de `microsoft/resnet-18` sobre ImageNet, seguido de un ajuste fino (fine-tuning) sobre el dataset PneumoniaMNIST, un subconjunto de MedMNIST compuesto por radiografías de tórax.

El entrenamiento se ha realizado con la plataforma AutoTrain de Hugging Face, que automatiza la configuración de hiperparámetros. No se han publicado detalles sobre el número de épocas, el tamaño de lote, la tasa de aprendizaje ni la composición exacta del dataset utilizado. Las métricas de validación reportadas en la model card incluyen una pérdida de 0,1295, F1 de 0,9688, precisión de 0,9790, recall de 0,9589, AUC de 0,9855 y exactitud de 0,9542.

## Capacidades

- Clasificacion binaria de imagenes medicas: distingue entre radiografias de torax normales y casos de neumonia.
- Inferencia rapida gracias a su tamano reducido (11,2 M de parametros).
- Compatible con el ecosistema Transformers de Hugging Face, lo que facilita su integracion en pipelines existentes.
- Puede exportarse a formatos como ONNX para despliegue en entornos de produccion.
- No dispone de capacidades de generacion de texto, tool calling, agentes ni procesamiento multimodal mas alla de la vision.

## Casos de uso

- Asistencia al diagnostico radiologico: el modelo puede preclasificar radiografias de torax para priorizar la revision de casos sospechosos de neumonia por parte de especialistas, reduciendo el tiempo de espera en urgencias.
- Triaje en entornos clinicos: integrado en sistemas de soporte a la decision, permite filtrar rapidamente un gran volumen de imagenes y derivar solo las mas problematicas al radiologo.
- Investigacion en IA medica: sirve como punto de partida para experimentos de transferencia de aprendizaje o como baseline en comparativas de modelos de clasificacion de imagenes medicas.
- Educacion y formacion: su tamano reducido y facilidad de uso lo hacen adecuado para demostraciones docentes sobre clasificacion de imagenes con redes convolucionales.
- Prototipado rapido: al ser un modelo pequeno y entrenado con AutoTrain, puede desplegarse en aplicaciones de demostracion sin requerir hardware especializado.
- Analisis de imagenes en investigacion epidemiologica: permite procesar colecciones de radiografias para estudios retrospectivos sobre prevalencia de neumonia, siempre que se valide su rendimiento en el conjunto de datos especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas son las de validacion reportadas en la model card, obtenidas durante el entrenamiento con AutoTrain:

| Metrica | Valor |
|---|---|
| Loss | 0,1295 |
| F1 | 0,9688 |
| Precision | 0,9790 |
| Recall | 0,9589 |
| AUC | 0,9855 |
| Accuracy | 0,9542 |

Estos valores corresponden a un unico conjunto de validacion (presumiblemente el split de validacion de PneumoniaMNIST) y no se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo ocupa aproximadamente 45 MB en pesos), por lo que cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, etc.) para inferencia en batch.
- En CPU: es viable ejecutar inferencia en un procesador moderno, con una latencia de unos pocos milisegundos por imagen.
- Opciones de despliegue: Transformers (`pipeline("image-classification")`), ONNX Runtime, TorchServe, o exportacion a TensorFlow Lite para dispositivos moviles.
- Latencia y throughput estimados: no disponibles, pero dado el tamano del modelo se espera una inferencia cercana a tiempo real en GPU (decenas de milisegundos por imagen) y de 100-300 ms en CPU.

## Comparativa con modelos similares

Existen otros modelos de deteccion de neumonia basados en ResNet-18 en Hugging Face, como `AventIQ-AI/ResNet-18-pneumonia-detection` o implementaciones en GitHub (p. ej., `Khaleel7-hub/PneumoniaMNIST-resnet18`). Sin embargo, no se dispone de sus metricas ni de sus especificaciones detalladas para realizar una comparacion cuantitativa. En general, todos comparten la misma arquitectura base y el mismo dataset de entrenamiento (PneumoniaMNIST o similares), por lo que se espera un rendimiento comparable, aunque no se puede confirmar sin datos de referencia.

| Modelo | Parametros | Dataset | Metricas publicadas | Licencia |
|---|---|---|---|---|
| therayelab/pneumoniamnist-resnet18 | 11,2 M | PneumoniaMNIST | Accuracy 0,9542, F1 0,9688 | no disponible |
| AventIQ-AI/ResNet-18-pneumonia-detection | no disponible | no especificado | no disponibles | no disponible |
| Khaleel7-hub/PneumoniaMNIST-resnet18 (GitHub) | no disponible | PneumoniaMNIST | no disponibles | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado con un dataset concreto (PneumoniaMNIST) que puede no representar la variabilidad de las radiografias clinicas reales (diferentes equipos, angulos, poblaciones). Su rendimiento en otros dominios no esta garantizado.
- Riesgo de alucinacion: al ser un clasificador de imagenes, no genera texto, pero puede producir falsos positivos o negativos en la deteccion de neumonia, lo que conlleva riesgos clinicos si se usa sin supervision humana.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de vision.
- Restricciones de licencia: no se ha especificado la licencia, por lo que el uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Caveat para produccion: no ha sido validado clinicamente ni aprobado por organismos reguladores. No debe utilizarse como unico criterio para decisiones medicas.
- Reproducibilidad: al no publicarse el codigo de entrenamiento ni los hiperparametros, no es posible replicar exactamente el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/therayelab/pneumoniamnist-resnet18
- Modelo similar de AventIQ-AI: https://huggingface.co/AventIQ-AI/ResNet-18-pneumonia-detection
- Repositorio de Khaleel7-hub: https://github.com/Khaleel7-hub/PneumoniaMNIST-resnet18
- Notebook de entrenamiento ResNet18 (referencia): https://colab.research.google.com/github/kp-algomaster/AIML_Healthcare/blob/main/Labs/Lab3_Pneumonia-Classification/02-Train_ResNet18.ipynb
- Repositorio de ErphanRajai con Grad-CAM: https://github.com/ErphanRajai/pneumonia-resnet18
