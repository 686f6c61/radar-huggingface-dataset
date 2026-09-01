# theoriclabs/not-hotdog-cnn

## Resumen

El modelo `theoriclabs/not-hotdog-cnn` es un clasificador binario de imágenes desarrollado por el equipo de theoriclabs, que distingue entre imágenes de hotdogs y de cualquier otra cosa. Se trata de una red neuronal convolucional (CNN) extremadamente pequeña, con aproximadamente 93 000 parámetros, entrenada sobre el dataset `theoriclabs/hot-dog-not-hot-dog`. Su propósito principal es servir como ejemplo didáctico de entrenamiento de un modelo de visión en la nube, utilizando una GPU NVIDIA A100 a través de la plataforma compute.cx / RunPod.

El modelo resuelve un problema clásico de clasificación de imágenes en un escenario binario, inspirado en la conocida aplicación "Not Hotdog" de la serie *Silicon Valley*. Aunque su precisión final en test es de 0.576, apenas superior al azar (0.5), su relevancia radica en su simplicidad y en el flujo de trabajo reproducible que documenta: desde el entrenamiento en GPU hasta la subida automática a HuggingFace mediante scripts. Es un punto de partida útil para quienes quieren entender cómo construir y desplegar un clasificador CNN básico sin infraestructura compleja.

La arquitectura es una CNN de tres bloques convolucionales seguidos de un *adaptive pooling* y una capa lineal. El modelo se distribuye como un archivo `model.pt` en formato PyTorch, con una licencia "other" no especificada en detalle. No se proporcionan datos sobre cuantización, idiomas soportados ni contexto, ya que se trata de un modelo de visión sin capacidades de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (3 bloques convolucionales → adaptive pool → lineal) |
| Parametros totales | ~93 000 (aproximado, según el autor) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (no especificada) |
| Formato de pesos | `model.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional clásica para clasificación de imágenes. Consta de tres bloques convolucionales, cada uno probablemente con capas de convolución, activación y pooling, seguidos de un *adaptive average pooling* que reduce la salida a un tamaño fijo, y finalmente una capa lineal que produce la salida binaria (hotdog o no hotdog). El modelo se entrenó con función de pérdida de entropía cruzada (*cross-entropy*), sobre imágenes redimensionadas a 128×128 píxeles, durante 5 épocas.

El entrenamiento se realizó en una GPU NVIDIA A100 de 80 GB PCIe, utilizando la infraestructura de compute.cx / RunPod. El dataset de entrenamiento es `theoriclabs/hot-dog-not-hot-dog`, del cual no se especifican el número de muestras ni la composición exacta. El proceso de entrenamiento se automatizó mediante un script `train.py` que, al finalizar, sube el modelo a HuggingFace usando credenciales almacenadas con `compute secrets set hf`. No se menciona el uso de técnicas como RLHF, DPO o aumentación de datos.

## Capacidades

- Clasificación binaria de imágenes: distingue entre "hotdog" y "no hotdog".
- Procesamiento de imágenes de entrada de tamaño 128×128 píxeles.
- Inferencia en tiempo real en hardware modesto debido a su pequeño tamaño.
- Capacidad de exportación a otros formatos (ONNX, TorchScript) si se convierte desde PyTorch.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión más allá de la clasificación simple.

## Casos de uso

- **Demostración educativa de CNN**: el modelo es ideal para cursos o tutoriales que expliquen el funcionamiento de las redes convolucionales, ya que su tamaño reducido permite inspeccionar cada capa y entender el flujo de datos.
- **Prototipo de clasificador de alimentos**: puede servir como base para una aplicación que identifique si un plato contiene un hotdog, útil en contextos de demostración o humor (referencia a *Silicon Valley*).
- **Ejemplo de entrenamiento en GPU en la nube**: el flujo de trabajo documentado (entrenamiento en A100, subida automática a HuggingFace) es un caso práctico para desarrolladores que quieran aprender a usar infraestructura cloud para ML.
- **Prueba de concepto de despliegue en edge**: al ser tan pequeño, puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, móviles) para validar la viabilidad de un clasificador en tiempo real.
- **Experimento de fine-tuning**: se puede tomar este modelo preentrenado y ajustarlo con un dataset más amplio o con otras categorías de comida, aunque su baja precisión inicial limita su utilidad como punto de partida.
- **Integración en pipelines de visión por computador**: puede usarse como un componente rápido de preclasificación en un sistema mayor, por ejemplo, para filtrar imágenes antes de un análisis más complejo.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es la precisión final en el conjunto de test, reportada por el autor: **0.576**. No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar como ImageNet o CIFAR. Dado que el modelo es extremadamente pequeño y entrenado en un dataset específico, su rendimiento es esperablemente bajo en tareas generales.

| Métrica | Valor |
|---|---|
| Precisión en test | 0.576 |

No se dispone de más métricas (F1, recall, precisión por clase) en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 1 GB, dado el tamaño del modelo (~93k parámetros). Puede ejecutarse en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, etc.). El entrenamiento se realizó en una A100 80 GB, pero no es necesaria para inferencia.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU moderna, incluso integradas.
- **Opciones de despliegue**: PyTorch (carga directa del `model.pt`), conversión a ONNX para uso con TensorRT u OpenVINO, o exportación a TorchScript. También puede servirse con frameworks como FastAPI o TorchServe.
- **Latencia y throughput**: al ser un modelo minúsculo, la inferencia es prácticamente instantánea en GPU (menos de 1 ms) y en CPU (pocos milisegundos). No se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Existen otros clasificadores hotdog/no-hotdog en GitHub (por ejemplo, `MackTr/not-hotdog` o `tsunghao-huang/Not_Hotdog_CNN`), pero no se han encontrado datos cuantitativos de rendimiento ni especificaciones técnicas comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Precisión baja**: con un 0.576 de precisión en test, el modelo apenas supera el azar (0.5), lo que lo hace inadecuado para uso en producción real.
- **Sobreajuste potencial**: al entrenar solo 5 épocas con un dataset presumiblemente pequeño, es probable que el modelo no generalice bien a imágenes fuera del conjunto de entrenamiento.
- **Licencia ambigua**: la licencia "other" no especifica términos de uso comercial, redistribución o modificación. Se recomienda contactar con el autor antes de cualquier uso comercial.
- **Limitaciones de entrada**: el modelo espera imágenes de 128×128 píxeles; imágenes de mayor resolución requieren redimensionamiento, lo que puede degradar la calidad.
- **Sin soporte de texto ni otros idiomas**: al ser un modelo de visión puro, no procesa lenguaje natural.
- **Riesgo de alucinación**: no aplica, ya que no genera texto; sin embargo, puede clasificar erróneamente imágenes ambiguas (por ejemplo, un pan con salchicha que no es un hotdog).

## Enlaces

- Modelo en HuggingFace: [theoriclabs/not-hotdog-cnn](https://huggingface.co/theoriclabs/not-hotdog-cnn)
- Dataset de entrenamiento: [theoriclabs/hot-dog-not-hot-dog](https://huggingface.co/datasets/theoriclabs/hot-dog-not-hot-dog)
- Guía de uso: [https://letsusecompute.com/posts/not-hotdog/](https://letsusecompute.com/posts/not-hotdog/)
- Script de entrenamiento: [https://github.com/theoriclabs/letsusecompute-not-hotdog](https://github.com/theoriclabs/letsusecompute-not-hotdog)
- Artículo relacionado (Towards Data Science): [Hot dog or Not Hot dog](https://towardsdatascience.com/hot-dog-or-not-hot-dog-ab9d67f20674/)
- Proyecto similar en GitHub: [MackTr/not-hotdog](https://github.com/MackTr/not-hotdog)
- Proyecto similar en GitHub: [tsunghao-huang/Not_Hotdog_CNN](https://github.com/tsunghao-huang/Not_Hotdog_CNN)
