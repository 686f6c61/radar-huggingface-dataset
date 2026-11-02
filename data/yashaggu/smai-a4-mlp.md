# yashaggu/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un perceptrón multicapa (MLP) entrenado sobre CIFAR-10 y publicado en HuggingFace por el usuario `yashaggu` como parte de la asignatura SMAI (Assignment 4). No se trata de un modelo de lenguaje ni de un modelo fundacional: es una red neuronal totalmente conectada de tres capas (3072-256-128-10) pensada para clasificación de imágenes de 32x32x3 en las diez clases de CIFAR-10. El repositorio tiene un tamaño declarado de 0.0 GB y no incluye pipeline, licencia ni idiomas especificados.

El modelo no resuelve tareas de generación de texto, razonamiento, código ni visión general; su alcance es estrictamente académico y demostrativo. La relevancia es, por tanto, limitada a contextos docentes o como referencia de implementación de un MLP con normalización de entradas y entrenamiento con SGD. No hay información sobre métricas de evaluación, por lo que no es posible valorar su rendimiento frente a alternativas.

Dado que el repositorio no contiene una model card con resultados, licencia o detalles de publicación más allá de la descripción del entrenamiento, esta ficha se limita a los datos disponibles y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) totalmente conectado, 3072-256-128-10 |
| Parametros totales | no disponible (deducible de las capas: 3072×256 + 256 + 256×128 + 128 + 128×10 + 10 = 819.466) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `.npz` con arrays `W{i}`, `b{i}`, `mean` y `std` |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas con activación ReLU en las capas ocultas y salida de 10 unidades (una por clase de CIFAR-10). La entrada se aplana de 32x32x3 a un vector de 3072 dimensiones, se divide por 255 y se estandariza con la media y la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento de CIFAR-10; ambos vectores se almacenan en el `.npz` junto con los pesos.

El entrenamiento se realizó con entropía cruzada como función de pérdida, SGD con tasa de aprendizaje 0.05, tamaño de lote 64 y 100 épocas, usando etiquetas verdaderas (p = 0, es decir, sin label smoothing ni ruido en las etiquetas). No se documenta el uso de aumentación de datos, regularización, momentum, decaimiento de la tasa de aprendizaje ni validación cruzada. Tampoco se indica el hardware ni el tiempo de entrenamiento.

## Capacidades

- Clasificación de imágenes de 32x32x3 en las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia por lotes mediante operaciones matriciales estándar sobre vectores aplanados y normalizados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación.

## Casos de uso

- Docencia de fundamentos de deep learning: sirve como ejemplo mínimo de MLP con normalización de entradas y entrenamiento con SGD para explicar retropropagación y ajuste de hiperparámetros en un curso introductorio.
- Referencia de implementación en NumPy: al publicarse los pesos en `.npz` con nombres `W{i}` y `b{i}`, permite reconstruir la inferencia sin frameworks y verificar cálculos manualmente.
- Pruebas de pipelines de preprocesado: útil para validar que el aplanado, la división por 255 y la estandarización con `mean`/`std` se aplican correctamente antes de alimentar un clasificador.
- Baseline de comparación en experimentos académicos: puede servir como cota inferior frente a CNN o transformers de visión en tareas de CIFAR-10, siempre que se documente su origen.
- Ejercicios de análisis de errores: al ser un modelo pequeño y sin regularización explícita, permite estudiar sobreajuste y sensibilidad a hiperparámetros en un entorno controlado.
- Prototipado rápido de clasificadores de bajo coste: para entornos sin GPU y con requisitos mínimos de memoria, el modelo cabe holgadamente en CPU y puede ejecutarse en milisegundos por lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB para los pesos en precisión de 32 bits (819.466 parámetros × 4 bytes ≈ 3,3 MB), más el espacio para activaciones por lote.
- GPU recomendadas: no aplica; el modelo es ejecutable en CPU sin problemas. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobredimensionada.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna.
- Opciones de despliegue: inferencia directa con NumPy a partir del `.npz`, o reimplementación en PyTorch/JAX cargando los arrays. No se proporcionan scripts de carga ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; al tratarse de una multiplicación de matrices de 3072×256, 256×128 y 128×10, la latencia por muestra en CPU es del orden de microsegundos, pero no se ha publicado una medición.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smai-a4-mlp` (este) | MLP 3072-256-128-10 | ≈819.466 | no aplica | no disponible | HuggingFace, `.npz` |
| LeNet-5 (referencia clásica) | CNN | ≈61.706 | no aplica | dominio público (arquitectura) | múltiples implementaciones |
| ResNet-20 para CIFAR-10 | CNN con conexiones residuales | ≈272.474 | no aplica | múltiples (MIT/Apache en implementaciones) | múltiples repositorios |
| ViT pequeño para CIFAR-10 | Transformer de visión | millones | no aplica | múltiples | múltiples repositorios |

La comparación es orientativa: LeNet-5 y ResNet-20 son alternativas canónicas para CIFAR-10 con resultados publicados, mientras que para este MLP no se dispone de métricas. No se conocen modelos comparables publicados por el mismo autor.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso fuera del ámbito académico.
- No se han publicado métricas de precisión, pérdida ni curvas de entrenamiento, por lo que no es posible evaluar su calidad.
- El modelo no generaliza fuera de CIFAR-10: la entrada debe ser exactamente 32x32x3 y normalizarse con el `mean` y `std` almacenados en el `.npz`.
- Al ser un MLP sin convoluciones, es sensible a traslaciones y no aprovecha la estructura espacial de las imágenes; su precisión esperada es baja en comparación con CNN.
- Riesgo de sobreajuste: 100 épocas con SGD sin regularización documentada sobre 50.000 imágenes.
- No procesa texto, audio ni vídeo; no es un modelo generativo.
- No se documentan sesgos del dataset más allá de los inherentes a CIFAR-10 (clases desbalanceadas en la práctica, etiquetas ruidosas en algunos casos).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/yashaggu/smai-a4-mlp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
