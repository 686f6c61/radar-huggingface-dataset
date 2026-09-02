# TontonTremblay/doper2-handal-obj000031

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000031` es un sistema de estimación de pose 6D (posición y orientación) para un objeto concreto: la manija de puerta identificada como `obj_000031` dentro del conjunto de datos HANDal. Ha sido desarrollado por Jonathan Tremblay (usuario TontonTremblay) utilizando el pipeline DOPER2, una metodología de entrenamiento que combina datos sintéticos, renderizados fotorrealistas y pseudo-etiquetado para mejorar la precisión en la estimación de pose de objetos industriales.

El modelo emplea un backbone ConvNeXt-Tiny preentrenado con DINOv3 y una cabeza de detección de 64 keypoints 3D, que posteriormente se resuelven mediante PnP para obtener la pose completa. Está diseñado para integrarse en sistemas de robótica, automatización industrial o realidad aumentada donde se requiera localizar con precisión una manija en el espacio 3D. Su relevancia radica en que es un ejemplo de modelo especializado y entrenado con datos sintéticos, una tendencia creciente para reducir la dependencia de anotaciones manuales.

El repositorio tiene un tamaño de 0,3 GB e incluye el checkpoint del modelo, la configuración de entrenamiento, las posiciones 3D de los keypoints y un archivo de procedencia de datos. No se dispone de información sobre licencia ni sobre el número total de parámetros, aunque por el tamaño del archivo y la arquitectura se estima que es un modelo ligero, adecuado para inferencia en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (preentrenado con DINOv3) + cabeza de heatmap para 64 keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (checkpoint `best.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de detección de keypoints 2D/3D. El backbone es un ConvNeXt-Tiny preentrenado con DINOv3 (un método de aprendizaje autosupervisado), que extrae características de la imagen de entrada. Sobre estas características se aplica una cabeza de tipo *heatmap* que predice la ubicación de 64 keypoints 3D del objeto. La pose final se obtiene resolviendo el problema PnP (Perspective-n-Point) con los keypoints 2D detectados y sus correspondencias 3D conocidas.

El entrenamiento se realizó con el pipeline DOPER2 en su etapa V5, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes fotorrealistas del conjunto BOP PBR y pseudo-etiquetas generadas durante el *onboarding* del objeto. El tamaño de entrada es de 224 píxeles para el detector y 256 píxeles para el recorte centrado en el objeto. No se dispone de detalles sobre el número de épocas, la función de pérdida o el optimizador, aunque el archivo `training_provenance.json` incluido en el repositorio contiene los argumentos completos de entrenamiento.

## Capacidades

- Estimación de pose 6D (traslación y rotación) de un objeto específico: la manija de puerta `obj_000031` del conjunto HANDal.
- Detección de 64 keypoints 3D del objeto, con coordenadas expresadas en metros.
- Inferencia sobre imágenes RGB estándar, con soporte para cámaras calibradas (se requiere la matriz intrínseca K).
- Integración con OpenCV para resolver PnP y obtener la pose final.
- Diseñado para funcionar con el pipeline DOPER2, que permite cargar el modelo y realizar inferencia con pocas líneas de código.
- No incluye capacidades de lenguaje, generación de texto, tool calling ni razonamiento multimodal.

## Casos de uso

- **Robótica de manipulación**: un brazo robótico puede localizar la manija de una puerta en el espacio 3D para agarrarla o accionarla. El modelo proporciona la pose 6D necesaria para planificar la trayectoria del efector final.
- **Automatización de inspección visual**: en una línea de montaje, el modelo puede verificar que una manija esté correctamente colocada comparando la pose estimada con la esperada, detectando desviaciones milimétricas.
- **Realidad aumentada industrial**: superponer instrucciones de montaje o información técnica sobre una manija real en una vista de cámara, utilizando la pose estimada para anclar el contenido virtual.
- **Teleoperación asistida**: en entornos de teleoperación, el modelo ayuda a un operador humano a alinear herramientas o actuadores con la manija, mostrando la orientación estimada en tiempo real.
- **Generación de datos de entrenamiento**: el modelo puede utilizarse para pseudo-etiquetar nuevas imágenes de manijas, reduciendo el coste de anotación manual en futuros conjuntos de datos.
- **Investigación en estimación de pose**: sirve como referencia para comparar métodos de entrenamiento con datos sintéticos o para estudiar la transferencia de modelos entre objetos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor referencia un dataset de resultados en [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results) donde se incluyen tablas de evaluación y rejillas de inferencia para el objeto `obj_000031`, pero no se proporcionan métricas concretas (como error de keypoint, ADD o AUC) en la model card.

## Requisitos de hardware

- **VRAM estimada**: no especificada por el autor. Dado el tamaño del repositorio (0,3 GB) y la arquitectura ConvNeXt-Tiny, se estima que la inferencia requiere entre 2 y 4 GB de VRAM en FP32, y menos si se aplica cuantización (aunque no se ofrecen versiones cuantizadas).
- **GPU recomendada**: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA GTX 1660 (6 GB), RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- **Compatibilidad con GPU de consumo**: sí, el modelo es ligero y cabe en GPUs de gama media de consumo.
- **Opciones de despliegue**: el código de inferencia está pensado para PyTorch con CUDA. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Puede integrarse en un servicio propio con FastAPI o en un contenedor Docker.
- **Latencia y throughput**: no disponibles. Se espera una latencia de decenas de milisegundos por imagen en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es específico para un único objeto y no se han publicado comparativas con otras arquitecturas de estimación de pose (como PVNet, PoseCNN o DeepIM) en la model card. Por tanto, no se puede ofrecer una tabla comparativa fiable.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo reconoce la manija `obj_000031` del conjunto HANDal. No es generalizable a otros objetos ni a otras variantes de manijas sin reentrenamiento.
- **Dependencia de la calibración**: para obtener la pose en unidades métricas, es imprescindible proporcionar la matriz intrínseca de la cámara. Un error en la calibración degrada directamente la precisión de la pose.
- **Riesgo de sobreajuste**: al entrenarse con datos sintéticos y pseudo-etiquetas, puede haber un sesgo hacia las condiciones de los datos de entrenamiento (iluminación, fondo, textura). El rendimiento en entornos muy diferentes podría verse reducido.
- **Licencia no especificada**: no se indica la licencia del modelo ni de los pesos. Esto impide conocer las restricciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- **Sin soporte para otros idiomas ni texto**: al ser un modelo de visión, no procesa lenguaje natural. Cualquier integración con sistemas de texto requiere un componente adicional.
- **Formato de pesos propietario**: el checkpoint está en formato `.pth` de PyTorch, lo que limita su uso a entornos que soporten este framework. No se ofrecen conversiones a ONNX, TensorRT ni otros formatos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000031)
- [Dataset de resultados BOP val](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
- [Perfil del autor en GitHub](https://github.com/TontonTremblay)
