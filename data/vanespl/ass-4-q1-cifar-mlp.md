# Vanespl/ass-4-q1-cifar-mlp

## Resumen

`Vanespl/ass-4-q1-cifar-mlp` es un perceptrón multicapa (MLP) entrenado desde cero para una asignación académica (Q1) sobre el conjunto de datos CIFAR-10. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un clasificador de imágenes de 10 clases con una arquitectura extremadamente sencilla, `3072 -> 32 -> 10`, con activación ReLU en la capa oculta y 10 logits de salida.

El modelo recibe imágenes de 32x32 píxeles con 3 canales (RGB) aplanadas en un vector de 3072 dimensiones y produce una distribución sobre las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). El repositorio incluye el state dictionary en formato PyTorch (`model.pt`), un fichero `metadata.json` con detalles de preprocesado y un `preprocessing.npz` con la media y desviación típica usadas durante el entrenamiento.

Su relevancia es puramente didáctica y de reproducibilidad: sirve como referencia mínima de un pipeline de clasificación de imágenes con PyTorch, no como componente para producción. El repositorio ocupa 0.0 GB (tamaño despreciable), no tiene descargas ni likes, y la model card es mínima, sin información sobre licencia, idiomas ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) `3072 -> 32 -> 10` |
| Parametros totales | 98.634 (3072×32 + 32 + 32×10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, entrada fija 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos en precision original de PyTorch) |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dictionary (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas completamente conectadas: una capa de entrada de 3072 unidades (32×32×3 píxeles aplanados), una capa oculta de 32 unidades con activación ReLU y una capa de salida de 10 logits correspondientes a las clases de CIFAR-10. Con 32 unidades ocultas, la capacidad del modelo es muy reducida: los 98.634 parámetros totales sitúan este modelo muy por debajo de cualquier CNN moderna para CIFAR-10 (una ResNet-18 tiene del orden de 11 millones de parámetros).

El entrenamiento se realizó desde cero sobre las etiquetas originales de CIFAR-10 (el autor indica `p=0`, probablemente refiriéndose a ausencia de label noise o de mezcla con etiquetas sintéticas). El preprocesado se documenta en `metadata.json` y la normalización (media y desviación típica por canal) se guarda en `preprocessing.npz`, lo que permite reproducir la inferencia de forma consistente. No se especifican en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de batch ni si hubo aumento de datos. Tampoco se documenta ninguna innovación técnica: no hay atención, no hay convoluciones, no hay regularización declarada ni destilación.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles RGB en una de las 10 clases de CIFAR-10.
- Salida de 10 logits crudos (sin softmax incorporado en el state dictionary; la capa softmax debe aplicarse externamente si se desean probabilidades).
- Entrada fija: requiere aplanar la imagen a un vector de 3072 dimensiones y aplicar la normalización de `preprocessing.npz`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión de alta resolución, audio ni multimodalidad.
- No es un modelo generativo: no produce texto ni imágenes.

## Casos de uso

- Docencia y prácticas de deep learning: sirve como ejemplo mínimo reproducible de un pipeline completo (carga de CIFAR-10, normalización, definición del MLP, entrenamiento y evaluación) para comparar contra una CNN y mostrar la brecha de rendimiento entre un MLP y una red convolucional.
- Baseline de referencia en experimentos académicos: al tener solo 98.634 parámetros, es útil como cota inferior de rendimiento cuando se evalúan técnicas de aumento de datos, inicialización o regularización sobre CIFAR-10.
- Pruebas de infraestructura de inferencia: su tamaño ínfimo (0.0 GB) permite validar pipelines de serving, serialización y carga de `model.pt` sin consumir recursos de GPU.
- Verificación de preprocesado: el par `metadata.json` + `preprocessing.npz` permite comprobar que una implementación de normalización coincide con la usada en entrenamiento, útil en tests de regresión de código de visión.
- Ejercicios de cuantización y pruning: con 32 unidades ocultas, es un banco de pruebas rápido para medir el impacto de recortar parámetros o reducir precisión en un clasificador pequeño.
- Demostraciones educativas de sobreajuste: la baja capacidad del modelo frente a la complejidad de CIFAR-10 lo convierte en un caso claro para ilustrar curvas de aprendizaje y límites de un MLP plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye accuracy en test, matriz de confusión ni comparación con baselines.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en FP32 (98.634 parámetros × 4 bytes ≈ 0,4 MB de pesos, más overhead de runtime de PyTorch).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o inferior; también funciona en CPU sin penalización apreciable.
- Cabe en cualquier GPU de consumo, e incluso en Raspberry Pi o dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load`), TorchScript, ONNX Runtime tras exportación, o conversión manual a NumPy. No hay soporte directo documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia por muestra sería del orden de microsegundos en GPU y de décimas de milisegundo en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Vanespl/ass-4-q1-cifar-mlp` | 98.634 | 32x32x3 fijo | Clasificacion CIFAR-10 | no disponible | Hugging Face |
| MLP CIFAR-10 tipico (512 ocultas) | ~1,6 M | 32x32x3 fijo | Clasificacion CIFAR-10 | variable | Implementaciones publicas |
| LeNet-5 adaptada a CIFAR-10 | ~60 K | 32x32x3 fijo | Clasificacion CIFAR-10 | variable | Referencias academicas |
| ResNet-18 para CIFAR-10 | ~11 M | 32x32x3 fijo | Clasificacion CIFAR-10 | variable (MIT en torchvision) | torchvision |

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, tipo de entrada y licencia. Las alternativas citadas son referencias genéricas de la literatura, no modelos concretos con repositorio verificado en la información proporcionada.

## Limitaciones y advertencias

- Capacidad muy limitada: 32 unidades ocultas son insuficientes para capturar la variabilidad de CIFAR-10; se espera un rendimiento bajo en comparación con CNN.
- Sin métricas publicadas: no hay accuracy, loss ni curvas de entrenamiento en la model card, lo que impide evaluar su calidad real.
- Licencia no especificada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Sin información sobre sesgos: no se documenta el comportamiento por clase ni posibles desequilibrios en el conjunto de entrenamiento.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificaciones erróneas con alta confianza en clases visualmente similares (gato/perro, ciervo/caballo).
- Dependencia estricta del preprocesado: usar otra normalización distinta a `preprocessing.npz` degradará las predicciones.
- Entrada fija de 32x32: no admite imágenes de otra resolución sin redimensionado previo.
- Repositorio de 0.0 GB y sin descargas: no hay garantía de mantenimiento ni de soporte por parte del autor.
- No apto para producción: es un artefacto académico sin validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vanespl/ass-4-q1-cifar-mlp
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
