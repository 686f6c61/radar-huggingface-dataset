# vikeshkansal/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un perceptrón multicapa (MLP) entrenado en PyTorch sobre el conjunto de datos CIFAR-10, publicado por el usuario de Hugging Face `vikeshkansal` como parte de la asignación 4 de la asignatura SMAI (sección 1.5). No se trata de un modelo de lenguaje ni de un modelo generativo: es un clasificador de imágenes de propósito académico que asigna una de las 10 clases de CIFAR-10 a imágenes de 32x32 píxeles en color.

El modelo tiene una arquitectura trivial de dos capas densas (3072 → 128 → 10) con activación ReLU en la capa oculta y salida lineal de 10 logits, sumando 394.634 parámetros. Se entrenó con SGD plano (learning rate 0.01, batch size 64, 100 épocas) sobre las 50.000 imágenes de entrenamiento de CIFAR-10, sin data augmentation ni early stopping.

Su relevancia es exclusivamente didáctica: sirve como referencia de un baseline MLP para CIFAR-10 y como ejemplo de pipeline de preprocesado (flatten, normalización y estandarización por columna). No está pensado para producción, no tiene licencia declarada y no soporta texto, código ni ninguna de las capacidades típicas de los modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) denso: 3072 → 128 → 10, activación ReLU en capa oculta, salida lineal |
| Parametros totales | 394.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos almacenados en float64 dentro de `model.npz`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz` con arrays `W0, b0, W1, b1`; `preprocessing.npz` con `mean` y `std`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas completamente conectadas. La entrada son 3072 valores correspondientes a la imagen aplanada (32x32x3 en orden altura, anchura, canal). La capa oculta tiene 128 neuronas con activación ReLU y la capa de salida es lineal con 10 logits, sobre los que se aplica softmax para obtener probabilidades por clase. El total de parámetros es 394.634 (3072·128 + 128 + 128·10 + 10).

El entrenamiento usó las 50.000 imágenes de entrenamiento de `uoft-cs/cifar10` con etiquetas verdaderas (sin ruido, p = 0). Se empleó SGD plano con learning rate 0.01, batch size 64, una iteración de acumulación de gradiente, pérdida de entropía cruzada, 100 épocas sin early stopping y precisión float64. Las semillas fueron `torch.manual_seed(1127)` para la construcción del modelo y `torch.Generator().manual_seed(1128)` para el orden de los batches. El preprocesado consiste en aplanar la imagen a 3072 valores, convertir a float64, dividir por 255 y estandarizar cada columna con la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (desviación poblacional, con sustitución por 1 cuando es cero). No se documenta uso de RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en color en una de las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Salida de 10 logits que, tras softmax, se interpretan como probabilidades por clase.
- Preprocesado reproducible incluido: parámetros de estandarización por columna en `preprocessing.npz`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades especiales más allá de la clasificación de imágenes de 32x32.
- Inferencia implementable con NumPy puro, sin dependencia de frameworks de deep learning (véase el ejemplo de la model card).

## Casos de uso

- Baseline académico para CIFAR-10: sirve como referencia mínima contra la que comparar arquitecturas convolucionales o transformers de visión en trabajos docentes o experimentos iniciales.
- Docencia de pipelines de preprocesado: el par `model.npz` + `preprocessing.npz` ilustra de forma completa el flujo flatten → normalización → estandarización por columna, reutilizable como material de clase.
- Inferencia sin framework: al poder ejecutarse con NumPy puro (multiplicaciones matriciales y ReLU), es adecuado para entornos restringidos donde no se pueden instalar PyTorch o TensorFlow.
- Pruebas de integración de extremo a extremo: útil para validar un pipeline de carga de imágenes, preprocesado y clasificación en un sistema mayor antes de sustituir el clasificador por uno más potente.
- Reproducibilidad de experimentos: las semillas y hiperparámetros documentados permiten reproducir el entrenamiento y verificar resultados (accuracy 0.4770 en test).
- Ejemplo de clasificación de baja resolución: para tareas donde la imagen de entrada ya es de 32x32 o se puede reducir a ese tamaño y solo se necesita una etiqueta aproximada entre 10 clases genéricas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card sobre el conjunto de test de CIFAR-10 (10.000 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy en test | 0.4770 |
| Loss en test | 2.6550 |
| F1 medio en test | 0.4772 |
| Accuracy en entrenamiento | 0.8840 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB (394.634 parámetros en float64 ocupan aproximadamente 3,2 MB, más los arrays de preprocesado de 3072 valores cada uno).
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU, incluida una GTX 1050 o inferior.
- Cabe en cualquier GPU de consumo e incluso se ejecuta en CPU sin problema.
- Opciones de despliegue: inferencia directa con NumPy (según el ejemplo de la model card), o reimplementación en PyTorch cargando los arrays de `model.npz`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste despreciable por imagen en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, un MLP de este tamaño sobre CIFAR-10 suele quedar por debajo de arquitecturas convolucionales en accuracy, pero no se aportan datos numéricos de terceros que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Accuracy test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-mlp | 394.634 | no aplica | 0.4770 | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo puramente académico: entrenado como parte de una asignación, sin validación más allá del conjunto de test de CIFAR-10.
- Accuracy en test de 0.4770, muy por debajo de lo que se considera estado del arte en CIFAR-10; no apto para aplicaciones reales de clasificación de imágenes.
- Fuerte sobreajuste aparente: 0.8840 en entrenamiento frente a 0.4770 en test.
- Solo acepta imágenes de 32x32 píxeles en color; no generaliza a otras resoluciones sin redimensionado previo.
- Solo cubre 10 clases genéricas de CIFAR-10; no reconoce categorías fuera de ese conjunto.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier uso más allá de lo académico.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene sesgos lingüísticos que evaluar, pero sí puede heredar los sesgos presentes en CIFAR-10 (por ejemplo, desequilibrios de representación entre clases).
- Riesgo de alucinación no aplicable en el sentido habitual; sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes ambiguas.
- Pesos en float64: si se reimplementa en otro framework, hay que respetar el orden de ejes (altura, anchura, canal) y la estandarización exacta para reproducir los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vikeshkansal/smai-a4-mlp
- Dataset CIFAR-10 en Hugging Face: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
