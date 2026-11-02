# vamsi10052005/smai-assignment-4-mlp

## Resumen

`smai-assignment-4-mlp` es un modelo de clasificación de imágenes muy pequeño publicado en HuggingFace por el usuario `vamsi10052005` como parte de una asignación académica de la materia SMAI (presumiblemente "Statistical Methods in Artificial Intelligence"). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un perceptrón multicapa (MLP) de dos capas que clasifica imágenes de CIFAR-10 en una de sus 10 categorías.

La arquitectura es explícita en la model card: una capa de entrada de 3072 dimensiones (imágenes de 32x32x3 aplanadas), una capa oculta de 64 neuronas con activación ReLU y una capa de salida de 10 logits. El recuento total de parámetros es de 197.322, lo que lo sitúa en el rango de los modelos de juguete o didácticos, no de producción.

El repositorio tiene un tamaño de 0.0 GB (es decir, menos de 1 MB en la práctica) y no registra descargas ni likes en el momento de la consulta. Su relevancia es exclusivamente educativa: sirve como ejemplo mínimo de pipeline de entrenamiento y evaluación sobre CIFAR-10, no como componente para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) de dos capas: 3072 → 64 (ReLU) → 10 |
| Parametros totales | 197.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch nativo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), checkpoint `mlp_clean.pt` |

## Arquitectura y entrenamiento

La arquitectura es un MLP completamente conectado con una única capa oculta de 64 unidades y activación ReLU. La entrada son imágenes CIFAR-10 aplanadas a un vector de 3072 componentes; la salida son 10 logits correspondientes a las clases del dataset. El checkpoint `mlp_clean.pt` corresponde a la época final del entrenamiento con etiquetas limpias (sin ruido añadido), según indica la model card.

La model card menciona que `config.json` registra los detalles de entrenamiento y preprocesamiento, pero no se proporcionan en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de batch ni la composición exacta del conjunto de entrenamiento. Tampoco se documenta el uso de técnicas como data augmentation, regularización, RLHF o DPO, que en un modelo de esta naturaleza no serían de aplicación. La única indicación técnica relevante es que las entradas deben aplanarse, escalarse a [0,1] y estandarizarse con las estadísticas del conjunto de entrenamiento original.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles RGB en 10 categorías (las clases de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).
- Inferencia sobre un único ejemplo o sobre lotes, siempre que se respete el preprocesamiento indicado (aplanado, escalado a [0,1] y estandarización).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión avanzada, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes pequeñas.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como referencia mínima para ilustrar el ciclo completo de entrenamiento, validación y evaluación de un clasificador sobre CIFAR-10, con un coste computacional despreciable.
- Baseline de comparación en experimentos académicos: permite contrastar el rendimiento de arquitecturas más complejas (CNN, ViT) frente a un MLP trivial de 197.322 parámetros sobre el mismo dataset.
- Pruebas de pipelines de preprocesamiento: útil para validar que un flujo de aplanado, escalado y estandarización de imágenes produce las formas y estadísticas esperadas antes de entrenar modelos mayores.
- Demostraciones de inferencia en CPU: al ser un modelo de menos de 1 MB, puede ejecutarse en cualquier portátil sin GPU y sirve para enseñar el ciclo de carga de pesos, `eval()` y `argmax`.
- Ejercicios de cuantización y poda: su reducido tamaño lo hace adecuado para experimentos didácticos de compresión de modelos sin necesidad de infraestructura.
- Test de integración en sistemas de serving: puede usarse como modelo "dummy" para verificar que un endpoint de inferencia, un contenedor o un pipeline de CI/CD funciona correctamente antes de desplegar modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión en test, matriz de confusión ni comparación con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en FP32 (197.322 parámetros × 4 bytes ≈ 0,79 MB, más overhead de activaciones y framework).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, e incluso iGPU).
- Opciones de despliegue: PyTorch nativo (`torch.load` + `model.eval()`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, la inferencia en CPU debería ser del orden de microsegundos a milisegundos por muestra, pero no se aporta ninguna medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-assignment-4-mlp | 197.322 | Imagen 32x32x3 aplanada | Clasificación CIFAR-10 | no disponible | HuggingFace |
| LeNet-5 (referencia histórica) | ~60.000 | Imagen 32x32 | Clasificación MNIST/CIFAR | no disponible | Referencia académica |
| ResNet-18 (adaptado a CIFAR) | ~11,2 M | Imagen 32x32 | Clasificación CIFAR-10/100 | MIT (implementaciones comunes) | Ampliamente disponible |
| ViT-Small (patch 4, CIFAR) | ~22 M | Imagen 32x32 | Clasificación CIFAR-10/100 | según implementación | Ampliamente disponible |

La comparación es orientativa: no se dispone de resultados de rendimiento del modelo evaluado, por lo que no es posible establecer una comparación cuantitativa de precisión frente a estas alternativas.

## Limitaciones y advertencias

- Modelo de carácter académico y didáctico: no está pensado para uso en producción ni para tareas fuera de CIFAR-10.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial o redistribución; debe contactarse con el autor antes de cualquier uso más allá del educativo.
- Sesgos: al entrenarse sobre CIFAR-10, hereda los sesgos y desequilibrios de ese dataset (clases desbalanceadas, imágenes de baja resolución, contexto limitado a objetos centrados).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas con alta confianza sobre imágenes fuera de distribución.
- Limitación de entrada: solo acepta imágenes de 32x32x3 correctamente preprocesadas; cualquier otra resolución o canal requiere un pipeline externo.
- Sin información sobre el proceso de entrenamiento (épocas, optimizador, métricas): difícil de reproducir y de auditar.
- No apto para texto, código, razonamiento, agentes ni tareas multimodales más allá de la clasificación de imágenes pequeñas.
- El repositorio no registra descargas ni validación por parte de la comunidad; no hay garantía de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/vamsi10052005/smai-assignment-4-mlp
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
