# y-k1n9/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un perceptrón multicapa (MLP) entrenado sobre el conjunto de datos CIFAR-10, publicado en HuggingFace por el usuario `y-k1n9` como parte de una asignatura o práctica académica (la nomenclatura "SMAI A4, Q1" sugiere un trabajo de evaluación trimestral). No se trata de un modelo de lenguaje: es un clasificador de imágenes de propósito muy acotado que recibe un vector de 3072 dimensiones (una imagen de 32x32x3 aplanada y normalizada) y devuelve 10 logits correspondientes a las clases de CIFAR-10.

Arquitectura y entrenamiento están completamente especificados en la model card: una única capa oculta de 128 neuronas con activación ReLU, inicialización normal con varianza 2/n_in, sesgos a cero, optimizador SGD con learning rate 0,03, batch size de 64 y 100 épocas sobre etiquetas verdaderas (sin ruido de etiqueta, p = 0). El preprocesado incluye normalización por media y desviación típica calculadas sobre las 50.000 imágenes del split de entrenamiento.

Es relevante únicamente como artefacto didáctico o como línea base trivial para experimentos de clasificación en CIFAR-10. No dispone de pipeline declarado, licencia, idiomas ni documentación de benchmarks más allá de la configuración de entrenamiento. Su interés práctico en producción es prácticamente nulo, pero sirve para ilustrar el flujo completo de entrenamiento y publicación de un clasificador sencillo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con una capa oculta |
| Parametros totales | 3072×128 + 128 + 128×10 + 10 = 394.634 (calculado a partir de las dimensiones indicadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card no especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas lineales: entrada de 3072 dimensiones (32×32×3 aplanado), capa oculta de 128 neuronas con ReLU y capa de salida de 10 logits sin activación, entrenado con `CrossEntropyLoss`. La inicialización es normal con varianza 2/n_in para las capas ReLU (1/n_in en caso contrario) y sesgos inicializados a cero, una heurística tipo He/Kaiming.

El entrenamiento usa SGD puro (sin momentum ni weight decay declarados) con learning rate 0,03, batch size 64, acumulación de gradiente de 1 paso y 100 épocas. Las etiquetas son las verdaderas (sin label smoothing ni ruido, p = 0) y la semilla es 2035. El preprocesado aplana la imagen, la convierte a float64, divide por 255 y normaliza con la media y desviación típica almacenadas en `cifar10_standardisation.npz`, calculadas sobre las 50.000 imágenes del split de entrenamiento de CIFAR-10. No se menciona aumento de datos, regularización, validación cruzada ni búsqueda de hiperparámetros.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija: vector de 3072 valores float, correspondiente a una imagen RGB de 32×32 píxeles aplanada y normalizada.
- Salida: 10 logits sin activación; para obtener probabilidades hay que aplicar softmax externamente.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni ninguna otra capacidad especial.
- No es reutilizable como extractor de características genérico sin modificar la cabeza de clasificación.

## Casos de uso

- Línea base académica en CIFAR-10: sirve como referencia mínima para comparar con CNN, ResNet o ViT en prácticas de aprendizaje automático; su configuración de entrenamiento está completamente documentada y es reproducible con la semilla 2035.
- Demostración de pipeline de entrenamiento: útil para ilustrar el flujo carga de datos, normalización, definición del modelo, bucle de entrenamiento con SGD y evaluación, en un curso introductorio.
- Pruebas de infraestructura de inferencia: al ser un modelo diminuto (menos de 400.000 parámetros), permite validar endpoints, contenedores o scripts de serving sin coste de GPU.
- Experimentos de cuantización o pruning didácticos: su tamaño reducido facilita medir el impacto de técnicas de compresión en precisión y latencia sobre un clasificador conocido.
- Clasificación rápida de miniaturas de 32×32 en entornos con recursos extremadamente limitados (microcontroladores, CPUs embebidas), siempre que la precisión obtenida sea aceptable para el caso concreto.
- Reproducción de resultados de una asignatura: permite verificar el comportamiento declarado en la model card (arquitectura, inicialización, hiperparámetros) sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión en test, matriz de confusión ni comparación con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (394.634 parámetros × 4 bytes ≈ 1,6 MB de pesos, más buffers de activación mínimos). Cabe holgadamente en cualquier GPU, incluso integrada.
- GPU recomendadas: no requiere GPU; una CPU convencional es suficiente. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) ejecuta la inferencia con latencias despreciables.
- Cabe en cualquier GPU consumer y en la mayoría de microcontroladores con suficiente RAM.
- Opciones de despliegue: al no especificarse el formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje). Lo habitual sería cargar los pesos con PyTorch o NumPy y servir el modelo con FastAPI, TorchServe o un script propio.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput muy alto en CPU y prácticamente limitado por el I/O en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de rendimiento ni referencias a otras implementaciones de MLP sobre CIFAR-10 con las que comparar parámetros, precisión o licencia. Como referencia cualitativa, las CNN pequeñas (p. ej. LeNet o un MLP más profundo) suelen superar a un MLP de una sola capa oculta en CIFAR-10, pero no se dispone de cifras verificables en esta ficha.

## Limitaciones y advertencias

- Modelo de propósito muy restringido: solo clasifica imágenes de 32×32 píxeles en las 10 clases de CIFAR-10; no acepta entradas de otro tamaño ni de otro dominio sin reentrenamiento.
- Sin métricas publicadas: no se conoce la precisión en test, por lo que no se puede evaluar su calidad real.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de reutilizarlo.
- Riesgo de sobreajuste: 100 épocas con SGD sin regularización declarada sobre un MLP de 128 neuronas ocultas es una configuración propensa a sobreajuste; no se documenta validación ni early stopping.
- Sesgos desconocidos: no se ha analizado el rendimiento por clase ni por subgrupos; CIFAR-10 tiene desequilibrios y sesgos conocidos en sus imágenes.
- Sin soporte de texto, tool calling, agentes ni multimodalidad: no es adecuado para ninguna tarea de lenguaje.
- Formato de pesos no especificado: la integración en producción requiere inspeccionar el repositorio para determinar cómo cargar el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin comunidad ni mantenimiento conocido.

## Enlaces

- HuggingFace: https://huggingface.co/y-k1n9/smai-a4-cifar10-mlp
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
