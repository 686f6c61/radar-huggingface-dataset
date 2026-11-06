# VEdant-2810/smai-ass4-ioc-nn

## Resumen

IOC-NN es un clasificador de imágenes de muy pequeño tamaño desarrollado por VEdant-2810 como parte de la asignatura SMAI (Assignment 4). Se trata de un perceptrón multicapa (MLP) denso implementado desde cero en NumPy, con una única capa oculta, entrenado sobre el conjunto de datos CIFAR-10. El modelo no es un transformer ni un modelo de lenguaje: es un clasificador académico de 98.666 parámetros que recibe imágenes RGB de 32×32 píxeles y las asigna a una de las diez clases de CIFAR-10.

La relevancia del modelo es exclusivamente pedagógica: ilustra el flujo completo de entrenamiento, exportación de pesos y validación de inferencia en un contexto de investigación educativa. La variante IOC (de *Identity Output Constraints*, según el nombre) impone pesos no negativos a partir de la segunda capa lineal, mientras que la primera capa y todos los sesgos permanecen sin restricción. La activación oculta es ELU con alpha = 1 y la salida son logits sin normalizar.

El modelo se distribuye como un *bundle* de ficheros NumPy (`model.npz`, `preprocessing.npz`, `config.json`) junto con scripts de inferencia independientes (uno en NumPy puro y otro que reconstruye la arquitectura original en PyTorch). No dispone de licencia declarada, no soporta idiomas ni texto, y su rendimiento en test es de 41,49 % de precisión, lejos del estado del arte en CIFAR-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso (3072 → 32 → 10), activación oculta ELU (alpha = 1), salida Identity (logits) |
| Parametros totales | 98.666 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, entrada fija de 32×32×3) |
| Tipos de cuantizacion | no disponible (pesos en float64; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`W_0`, `b_0`, `W_1`, `b_1`), float64; también cargable en PyTorch vía helper |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de dos capas lineales: una capa de entrada de 3.072 dimensiones (32×32×3 aplanado en orden HWC), una capa oculta de 32 neuronas con activación ELU (alpha = 1) y una capa de salida de 10 neuronas con activación Identity que produce logits. La restricción IOC impone pesos no negativos desde la segunda capa lineal en adelante; la primera capa y todos los sesgos quedan libres. Todos los pesos, sesgos y operaciones se realizan en float64.

El entrenamiento se llevó a cabo sobre el split de entrenamiento original de CIFAR-10 (50.000 imágenes) durante 100 épocas, con semilla 2003, SGD plano con tasa de aprendizaje 0,03, tamaño de lote 64, acumulación de gradiente 1 y sin parada temprana. La selección de arquitectura se realizó mediante una regla de validación descrita en la sección 1.2.5 del trabajo. El preprocesado aplica división por 255, resta de la media de entrenamiento y división por la desviación estándar poblacional (`ddof=0`), con sustitución de desviaciones nulas por 1. Los pesos exportados provienen de `results/1.4/ioc-p0.pt` (configuración de etiquetas limpias, p = 0) sin reentrenamiento ni selección de un pico de test anterior.

## Capacidades

- Clasificación de imágenes RGB de 32×32 píxeles en las diez clases de CIFAR-10: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck.
- Inferencia en NumPy puro mediante `numpy_inference.py`, sin dependencia de PyTorch.
- Carga de pesos en PyTorch mediante `assignment_model.py`, que reconstruye las arquitecturas originales y valida claves, formas, dtypes y valores finitos antes de aceptar los parámetros.
- Validación de formas de entrada y comprobación de integridad de los arrays.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo reproducible de un pipeline completo (entrenamiento, exportación de pesos, validación y inferencia) en un curso universitario, con scripts autocontenidos y un *bundle* de ficheros bien documentado.
- Reproducción de experimentos académicos: el `config.json` y los ficheros de preprocesado permiten replicar exactamente las mediciones registradas (entropía cruzada, precisión, F1 macro) sin necesidad del cuaderno original.
- Comparación de implementaciones NumPy frente a PyTorch: el mismo modelo puede ejecutarse con dos backends distintos, lo que resulta útil para verificar equivalencias numéricas y validar cargadores de pesos.
- Demostración de restricciones arquitectónicas: el modelo ilustra el efecto de imponer pesos no negativos (IOC) en una red pequeña y su impacto en la precisión y la brecha train-test.
- Pruebas de integración de cargadores de pesos: el helper de PyTorch valida claves, formas, dtypes y valores finitos, por lo que puede usarse como caso de prueba para herramientas de serialización de modelos.
- Ejercicios de análisis de sesgo y generalización: la brecha train-test de 14,24 puntos porcentuales y la precisión de test del 41,49 % permiten discutir sobreajuste, selección de arquitectura y fuga de datos en entornos educativos.

## Benchmarks y rendimiento

Resultados registrados por el autor sobre el split de test original de CIFAR-10 (10.000 imágenes, época 100, etiquetas limpias):

| Metrica | Valor |
|---|---:|
| Parametros | 98.666 |
| Entropia cruzada de entrenamiento | 1,394986 |
| Entropia cruzada de test | 2,105275 |
| Precision de entrenamiento | 55,728 % |
| Precision de test | 41,490 % |
| Brecha train-test | 14,238 puntos porcentuales |
| F1 macro | 0,414555 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (98.666 parámetros en float64 ≈ 0,79 MB), más el espacio para los tensores de entrada y salida. Cabe en cualquier GPU, CPU o incluso en entornos embebidos.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Funciona igualmente en A100, H100, RTX 4090 o GPUs de gama baja.
- Cabe en cualquier GPU de consumo y en CPU sin problemas.
- Opciones de despliegue: ejecución directa con Python y NumPy (`numpy_inference.py`) o con PyTorch (`assignment_model.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo (dos multiplicaciones matriciales de 3.072×32 y 32×10), la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. Como referencia cualitativa, el estado del arte en CIFAR-10 supera el 99 % de precisión con arquitecturas convolucionales profundas y transformers de visión, mientras que este MLP de dos capas alcanza el 41,49 %, lo que refleja su carácter académico y su arquitectura deliberadamente simple. No se dispone de datos de licencia, contexto ni disponibilidad de modelos alternativos comparables en la información consultada.

## Limitaciones y advertencias

- Precisión de test baja (41,49 %) y brecha train-test elevada (14,24 puntos), indicativa de sobreajuste y de capacidad limitada del modelo.
- El split de desarrollo de la sección 1.2 agrupó las particiones originales de train y test antes de crear el split de desarrollo, por lo que la selección de arquitectura tuvo solapamiento con las imágenes de test originales usadas en la sección 1.4. El resultado de test reportado no es una estimación completamente limpia del flujo completo de selección de modelo.
- Entrenado con una sola semilla por configuración, lo que limita la robustez estadística de las conclusiones.
- Rendimiento no establecido fuera de CIFAR-10; no se ha evaluado en otras distribuciones de imágenes.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni restricciones de redistribución.
- Requiere imágenes RGB uint8 de exactamente 32×32 píxeles; no realiza redimensionado ni conversión de color automáticos.
- Es necesario descargar el *bundle* completo (no solo `model.npz`), ya que el modelo depende de la información de activación y preprocesado.
- No es un modelo de lenguaje ni un transformer: no soporta texto, tool calling, agentes ni razonamiento multi-paso.
- Sesgos conocidos: no documentados en la información proporcionada; al ser un clasificador de CIFAR-10, hereda los sesgos y desequilibrios del conjunto de datos original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VEdant-2810/smai-ass4-ioc-nn
- Experimento registrado en WandB: https://forge.coreweave.com/wandb/vedantzope2810/smai-ass4/runs/vwulvrkb
- Dataset CIFAR-10 (referenciado): https://huggingface.co/datasets/uoft-cs/cifar10
