# vikeshkansal/smai-a4-ioc-nn

## Resumen

IOC-NN sobre CIFAR-10 es un modelo de clasificación de imágenes de tipo perceptrón multicapa (MLP) con una restricción estructural poco habitual: cada logit de salida es una función convexa de la imagen de entrada. Lo desarrolla el usuario vikeshkansal como parte de la asignación 4 de la asignatura SMAI (sección 1.5), y se inspira en el trabajo de Sivaprasad et al. sobre redes neuronales convexas de entrada-salida (IOC-NN, arXiv:2006.05103).

El modelo resuelve la clasificación de las 10 clases del conjunto CIFAR-10 (32x32 píxeles en color) mediante una red de dos capas: 3072 entradas, 128 unidades ocultas con activación ELU y 10 logits de salida. La innovación no está en el tamaño ni en el rendimiento, sino en la garantía matemática de convexidad respecto a la entrada, lo que lo convierte en una pieza didáctica y de investigación sobre robustez e interpretabilidad, no en un modelo de producción.

Es relevante ahora únicamente como referencia académica: con 394.634 parámetros y una precisión de test del 48,72 %, queda muy por debajo de las CNN modernas sobre CIFAR-10 (que superan el 95 %). Su interés reside en la reproducibilidad del experimento y en la formulación convexa, no en su capacidad bruta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con convexidad de entrada-salida (IOC-NN) |
| Parametros totales | 394.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float64, formato NPZ) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | NPZ (NumPy: `model.npz` y `preprocessing.npz`) |

## Arquitectura y entrenamiento

La red tiene tres capas lineales en secuencia (3072 → 128 → 10) con activación ELU en la capa oculta y salida lineal de 10 logits, seguida de softmax para obtener probabilidades. La restricción clave es que los pesos de las capas segunda y siguientes son no negativos: se inicializan con distribución uniforme en (0, 2/n_in) y, tras cada actualización, cualquier peso negativo w se sustituye por exp(w − 5). Esta combinación de pesos no negativos y activación convexa (ELU es convexa en su tramo negativo y lineal en el positivo) garantiza que cada logit sea una función convexa de la imagen de entrada.

El entrenamiento usa SGD plano con tasa de aprendizaje 0,01, tamaño de lote 64, pérdida de entropía cruzada, 100 épocas sin parada temprana y precisión float64. Se entrena sobre las 50.000 imágenes de entrenamiento de `uoft-cs/cifar10` con etiquetas verdaderas (sin ruido, p = 0). Las semillas son fijas (`torch.manual_seed(1127)` para el modelo y `torch.Generator().manual_seed(1128)` para el orden de los lotes), lo que hace el experimento reproducible. El preprocesado aplana cada imagen a 3072 valores en orden altura-anchura-canal, normaliza a [0,1] dividiendo por 255 y estandariza por columna con media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (guardadas en `preprocessing.npz`).

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en color en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia determinista y reproducible gracias a las semillas fijas y a los pesos en float64.
- Garantía de convexidad de los logits respecto a la entrada, útil para análisis de robustez y propiedades teóricas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni ninguna otra modalidad más allá de la clasificación de imágenes CIFAR-10.
- Implementación en NumPy puro (sin dependencia de frameworks de deep learning en inferencia), lo que facilita su inspección y auditoría.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como ejemplo mínimo y reproducible de una red con restricciones estructurales, con pesos en NPZ y código de inferencia de pocas líneas en NumPy, ideal para asignaturas de aprendizaje profundo.
- Investigación sobre convexidad y robustez: permite estudiar empíricamente cómo la restricción de pesos no negativos afecta a la precisión (48,72 % en test frente a 82,68 % en entrenamiento) y a la sensibilidad frente a perturbaciones de entrada.
- Reproducción de experimentos: las semillas fijas y el preprocesado documentado permiten replicar exactamente los resultados reportados, útil para validar metodologías o comparar variantes del IOC-NN.
- Pruebas de pipelines de clasificación de imágenes a pequeña escala: con 394.634 parámetros y entrada de 3072 valores, se puede desplegar en cualquier entorno con NumPy para verificar flujos de preprocesado, normalización y evaluación.
- Análisis de calibración y métricas por clase: el modelo reporta precisión, pérdida y F1 medio, y su simplicidad permite inspeccionar fácilmente la matriz de confusión y el comportamiento por clase en CIFAR-10.
- Baseline educativo para comparativas: sirve como referencia inferior frente a CNN y transformers de visión en experimentos docentes sobre CIFAR-10, mostrando la brecha entre un MLP restringido y arquitecturas convolucionales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (CIFAR-10, 10.000 imagenes) | 0,4872 |
| Perdida en test | 2,0721 |
| F1 medio en test | 0,4866 |
| Precision en entrenamiento | 0,8268 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB; los pesos ocupan aproximadamente 394.634 × 8 bytes ≈ 3,2 MB en float64, más las matrices de preprocesado (2 × 3072 × 8 bytes).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (Raspberry Pi, portátiles básicos).
- Opciones de despliegue: NumPy directamente (carga de `model.npz` y `preprocessing.npz`); no hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamaño del modelo, la inferencia por imagen en CPU es del orden de microsegundos a milisegundos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (este modelo) | 394.634 | 3072 valores (32x32x3) | 48,72 % | no disponible | Hugging Face |
| MLP estandar sobre CIFAR-10 | no disponible | 3072 valores | no disponible | no disponible | no disponible |
| CNN tipo ResNet sobre CIFAR-10 | no disponible | 32x32x3 | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada; la comparativa queda limitada a la referencia cualitativa de que las CNN modernas superan ampliamente el 95 % en CIFAR-10, sin cifras concretas verificadas en esta ficha.

## Limitaciones y advertencias

- Rendimiento bajo: 48,72 % de precisión en test frente a 82,68 % en entrenamiento, lo que indica sobreajuste y una capacidad muy limitada para la tarea.
- Restricción estructural: los pesos no negativos en las capas ocultas y de salida limitan la expresividad del modelo y explican en parte su baja precisión.
- Sesgos conocidos: no documentados en la model card; al entrenarse solo con CIFAR-10, hereda los sesgos de composición y etiquetado de ese conjunto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir clasificaciones erróneas con alta confianza en clases visualmente ambiguas.
- Limitaciones de contexto e idioma: entrada fija de 32x32x3 píxeles; no procesa imágenes de otra resolución sin remuestreo, y no tiene capacidades lingüísticas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso en producción.
- Caveat para producción: es un artefacto académico (asignación de curso), sin mantenimiento, sin documentación de robustez frente a distribución adversa y sin pruebas de seguridad; no debe desplegarse en sistemas reales de clasificación.
- Dependencia de NumPy y del preprocesado exacto: usar una media y desviación distintas a las de `preprocessing.npz` degrada los resultados de forma significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vikeshkansal/smai-a4-ioc-nn
- Paper de referencia IOC-NN (Sivaprasad et al.): https://arxiv.org/abs/2006.05103
- Dataset CIFAR-10 (uoft-cs/cifar10): https://huggingface.co/datasets/uoft-cs/cifar10
