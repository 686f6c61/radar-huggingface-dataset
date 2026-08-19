# tonghahaha/trashnet-resnet18

## Resumen

El modelo `tonghahaha/trashnet-resnet18` es un clasificador de imágenes de residuos desarrollado por tonghahaha. Se basa en una arquitectura ResNet18 preentrenada en ImageNet, a la que se le ha sustituido la cabeza de clasificación por una red personalizada de dos capas totalmente conectadas. El modelo se ha ajustado (fine-tuning) sobre el dataset TrashNet, que contiene imágenes de seis categorías de residuos: cartón, vidrio, metal, papel, plástico y basura general. Su propósito es servir como componente de un sistema de clasificación automática de residuos, integrado en una aplicación FastAPI y Streamlit para inferencia en tiempo real.

La relevancia de este modelo radica en su aplicación práctica para el reciclaje automatizado, un área con creciente demanda en entornos industriales y domésticos. Al ser un modelo ligero (ResNet18), puede desplegarse en hardware modesto, lo que facilita su adopción en sistemas embebidos o de bajo coste. El autor ha documentado el proceso de entrenamiento, incluyendo la selección de hiperparámetros mediante Optuna y el uso de pérdida ponderada por clase para mitigar el desequilibrio del dataset. No se especifican el número total de parámetros ni la longitud de contexto, ya que se trata de un modelo de visión y no de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (torchvision) con cabeza personalizada: Linear(64) -> ReLU -> Dropout(0.5) -> Linear(6) |
| Parametros totales | no disponible |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo utiliza como backbone una ResNet18 de `torchvision` con pesos preentrenados en ImageNet (IMAGENET1K_V1). La capa fully connected original se sustituye por una secuencia de capas: `Linear(512, 64)`, `ReLU`, `Dropout(0.5)` y `Linear(64, 6)`, donde 6 es el número de clases. El entrenamiento se realizó sobre el dataset TrashNet, que contiene imágenes de residuos en seis categorías. Se empleó el optimizador AdamW con un scheduler de tasa de aprendizaje por coseno (CosineAnnealingLR) y una función de pérdida de entropía cruzada ponderada por clase, dado que la clase `trash` está subrepresentada aproximadamente 3.6 veces en comparación con `paper`. Los hiperparámetros (tasa de aprendizaje, weight decay, tamaño de batch) se seleccionaron mediante una búsqueda con Optuna (25 trials) y posteriormente se entrenó el modelo durante 30 épocas con la configuración ganadora. El entrenamiento se ejecutó en el clúster HPC CSF3 de la Universidad de Manchester, utilizando GPUs NVIDIA L40S.

## Capacidades

- Clasificación de imágenes en 6 clases de residuos: cartón, vidrio, metal, papel, plástico y basura general.
- Inferencia en tiempo real, adecuada para aplicaciones de visión por computador en sistemas de reciclaje.
- Modelo ligero (ResNet18) que puede ejecutarse en CPU o GPU con recursos limitados.
- No soporta procesamiento de lenguaje natural, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto; es exclusivamente un clasificador de imágenes.

## Casos de uso

- Clasificación automática de residuos en plantas de reciclaje: el modelo puede integrarse en un sistema de cinta transportadora con cámara para etiquetar cada objeto y dirigirlo al contenedor correspondiente.
- Aplicación móvil de escaneo de residuos: los usuarios fotografían un objeto y la app le indica a qué categoría de reciclaje pertenece, usando el modelo en el backend.
- Educación ambiental: herramienta interactiva para enseñar a niños y adultos a separar correctamente los residuos, mostrando la clase predicha y explicaciones.
- Asistente en puntos de recogida selectiva: un dispositivo con cámara que valida si el residuo depositado coincide con el contenedor, reduciendo errores de reciclaje.
- Integración en sistemas de gestión de residuos inteligentes: el modelo puede alimentar dashboards de análisis de composición de residuos en tiempo real.
- Prototipo de investigación en visión por computador aplicada a sostenibilidad: sirve como base para comparar arquitecturas o técnicas de aumento de datos en tareas de clasificación de residuos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni GPU en la documentación del modelo.
- Al tratarse de una ResNet18, es un modelo ligero que puede ejecutarse en CPU para inferencia, aunque se recomienda una GPU para mayor velocidad.
- Para despliegue en producción, se puede usar cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior), aunque no hay datos oficiales.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch, por lo que puede servirse con frameworks como TorchServe, FastAPI (como en el sistema de referencia) o mediante ONNX para optimización.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en el dataset TrashNet, que puede no representar la variabilidad de residuos en entornos reales (iluminación, ángulos, tipos de objetos no incluidos).
- La clase `trash` está subrepresentada, lo que puede provocar un sesgo hacia las clases más frecuentes a pesar de la ponderación.
- No se han evaluado sesgos demográficos o geográficos; el dataset proviene de la región de Estados Unidos (etiqueta `region:us`).
- Al ser un modelo de clasificación de imágenes, no es adecuado para tareas de generación de texto o razonamiento.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que el dataset TrashNet tenga una licencia compatible con su caso de uso.
- No se proporcionan métricas de rendimiento (precisión, recall, F1) en la documentación, por lo que se desconoce su eficacia real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tonghahaha/trashnet-resnet18
- Dataset TrashNet: https://github.com/garythung/trashnet
- Sistema de clasificación de residuos (FastAPI + Streamlit): https://github.com/yutongyu-ai/Trash_Classification_System
