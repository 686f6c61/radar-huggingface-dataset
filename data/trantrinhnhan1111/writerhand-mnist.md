# TranTrinhNhan1111/WriteRHand-MNIST

## Resumen

WriteRHand-MNIST es un conjunto de cuatro clasificadores de dígitos manuscritos publicados en Hugging Face por TranTrinhNhan1111 como parte de un proyecto académico de la asignatura de Reconocimiento de Patrones. No se trata de un modelo de lenguaje ni de una red neuronal profunda moderna, sino de cuatro algoritmos clásicos de aprendizaje automático implementados desde cero con NumPy (PyTorch se usa únicamente como librería de tensores para el perceptrón multicapa, sin autograd): Naive Bayes gaussiano, regresión softmax, perceptrón multicapa y AdaBoost SAMME. El objetivo declarado es educativo, no producción.

El modelo resuelve una única tarea: clasificar una imagen de 28x28 píxeles en escala de grises (dígito blanco sobre fondo negro, centrado, estilo MNIST) en una de las diez clases de dígitos. Los pesos se distribuyen en formato ONNX (tres de los cuatro clasificadores) y JSON (AdaBoost), con tamaños que van desde 31 KiB hasta 15,6 MiB. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es estrictamente didáctica: sirve como referencia reproducible de implementaciones matemáticas correctas y verificables de clasificadores clásicos, con métricas medidas en CPU y comparación de la exportación ONNX frente a la implementación en Python. No compite con modelos de OCR modernos ni con LLM multimodales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro clasificadores independientes: Naive Bayes gaussiano, regresión softmax, perceptrón multicapa (ReLU) y AdaBoost SAMME sobre árboles de decisión histogramados |
| Parametros totales | No disponible (los tamaños de artefacto son 62 KiB, 31 KiB, 2094 KiB y 15607 KiB respectivamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de 784 píxeles, imagen 28x28) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en ONNX y JSON sin cuantización declarada) |
| Idiomas soportados | No disponible (la tarea es clasificación de dígitos, sin procesamiento de lenguaje) |
| Licencia | `other` con nombre `unspecified-educational`; el autor indica que aún no ha elegido licencia |
| Formato de pesos | ONNX (`naive_bayes.onnx`, `softmax.onnx`, `mlp.onnx`) y JSON (`adaboost.json`); también `.npz` en `python/*.npz` |

## Arquitectura y entrenamiento

Los cuatro modelos comparten la misma entrada: un vector de 784 dimensiones con píxeles normalizados a [0, 1] y estandarizados con `mean = 0.130635`, `std = 0.308079`, `eps = 1e-8`, calculados solo sobre la porción de entrenamiento. Los grafos ONNX incluyen este paso de preprocesado, de modo que se alimentan píxeles crudos en [0, 1] con forma `[N, 784]` y se obtienen probabilidades `[N, 10]`.

El Naive Bayes gaussiano modela verosimilitudes por clase y por píxel con parámetros de máxima verosimilitud e inferencia en espacio logarítmico. La regresión softmax usa softmax con entropía cruzada, descenso de gradiente por mini-lotes y regularización L2. El MLP es una red totalmente conectada con activación ReLU, retropropagación escrita a mano, SGD con momento y parada temprana. AdaBoost SAMME combina árboles de decisión histogramados ponderados. Los datos son MNIST (60 000 entrenamiento y 10 000 test), con partición estratificada con semilla 42 en 50 000 entrenamiento y 10 000 validación; el conjunto de test oficial se reserva para la evaluación final. Los hiperparámetros se seleccionaron solo sobre validación. El entrenamiento es reproducible con semillas fijas (commit `fa51c49c8079469287591cbd9b6e9f2186d1ee63`) y se registró con Weights & Biases.

## Capacidades

- Clasificación de un único dígito manuscrito centrado, en blanco sobre negro, con formato MNIST de 28x28 píxeles.
- Salida de diez probabilidades (o puntuaciones de voto en AdaBoost) correspondientes a las clases 0-9.
- Preprocesado integrado en los grafos ONNX: estandarización incluida, entrada directa de píxeles en [0, 1].
- Inferencia en CPU con latencias muy bajas (desde 0,010 ms por imagen en regresión softmax hasta 18,705 ms en AdaBoost).
- Exportación verificada: coincidencia del 100 % en argmax entre ONNX y Python sobre 10 000 imágenes de test (1 000 en AdaBoost), con diferencias máximas de probabilidad de hasta 1,8e-04.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües.

## Casos de uso

- Docencia de reconocimiento de patrones: comparar en una misma tarea cuatro familias de clasificadores clásicos (generativo, lineal, red neuronal y ensemble) con métricas homogéneas y código reproducible.
- Práctica de exportación a ONNX: usar los grafos como ejemplo de conversión verificada de modelos NumPy a un formato portable con preprocesado embebido.
- Demostración interactiva en navegador: el repositorio incluye una demo que ejecuta los modelos en el navegador, útil para ilustrar inferencia en cliente con modelos de pocos KiB.
- Referencia de implementación desde cero: el código de retropropagación manual, SGD con momento y AdaBoost SAMME sirve como material de estudio verificable frente a implementaciones de librería.
- Pruebas de pipelines de preprocesado de imágenes: validar recorte, centrado y estandarización con la receta MNIST usando los vectores de test incluidos (`test_vectors.json`).
- Benchmark educativo de latencia en CPU: comparar coste de entrenamiento e inferencia entre modelos con los tiempos medidos en un i7-13620H (0,4 s a 817,9 s de ajuste).
- No es adecuado para OCR en producción, lectura de formularios, matrículas, documentos escaneados ni imágenes con ruido, múltiples dígitos o dígitos no centrados.

## Benchmarks y rendimiento

Resultados medidos en CPU (13th Gen Intel Core i7-13620H, 16 núcleos lógicos, 8 hilos de PyTorch), según la model card:

| Modelo | Train acc % | Val acc % | Test acc % | Test macro-F1 % | Ajuste (s) | Latencia 1 imagen (ms) |
|---|---|---|---|---|---|---|
| Gaussian NB | 80,13 | 79,67 | 81,32 | 81,16 | 0,4 | 0,076 |
| Softmax regression | 93,62 | 92,15 | 92,52 | 92,42 | 12,7 | 0,010 |
| MLP | 99,87 | 98,18 | 98,24 | 98,23 | 11,0 | 0,042 |
| AdaBoost-SAMME | 100,00 | 97,59 | 97,60 | 97,58 | 817,9 | 18,705 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; los modelos se ejecutan en CPU y el mayor artefacto ocupa 15,6 MiB en disco.
- GPU recomendadas: no disponibles; no se documenta uso de GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; la inferencia está medida en CPU.
- Despliegue: runtime ONNX (ONNX Runtime u otro compatible) para los tres modelos ONNX; el AdaBoost requiere cargar el JSON y ejecutar la lógica de voto correspondiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta tarea.
- Latencia: entre 0,010 ms y 18,705 ms por imagen en CPU según el clasificador. No se proporcionan datos de throughput agregado.
- Entrenamiento: el ajuste completo sobre 50 000 imágenes tarda entre 0,4 s (Naive Bayes) y 817,9 s (AdaBoost) en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros / tamaño | Contexto / entrada | Test acc % | Licencia |
|---|---|---|---|---|---|
| WriteRHand-MNIST (MLP) | MLP totalmente conectado | 2094 KiB (ONNX) | 784 píxeles | 98,24 | `unspecified-educational` |
| WriteRHand-MNIST (AdaBoost) | Ensemble SAMME | 15607 KiB (JSON) | 784 píxeles | 97,60 | `unspecified-educational` |
| WriteRHand-MNIST (Softmax) | Regresión logística multinomial | 31 KiB (ONNX) | 784 píxeles | 92,52 | `unspecified-educational` |
| WriteRHand-MNIST (Naive Bayes) | Generativo gaussiano | 62 KiB (ONNX) | 784 píxeles | 81,32 | `unspecified-educational` |

No se dispone de datos de benchmarks ni de especificaciones de modelos externos comparables en la información proporcionada, por lo que no se incluye una comparación con alternativas de terceros.

## Limitaciones y advertencias

- Modelos educativos explícitamente no aptos para OCR en producción, según el propio autor.
- Solo reconocen un dígito único, centrado, en blanco sobre negro y con formato MNIST; no manejan otros alfabetos, múltiples dígitos, fotografías con ruido ni entradas no centradas.
- El Naive Bayes es débil por diseño debido a la hipótesis de independencia entre píxeles (81,32 % de accuracy en test).
- Las puntuaciones de AdaBoost son proporciones de voto ponderado, no probabilidades calibradas.
- Riesgo de sobreajuste moderado en el MLP (99,87 % en entrenamiento frente a 98,24 % en test) y en AdaBoost (100,00 % en entrenamiento frente a 97,60 % en test).
- Sesgos conocidos: no documentados; el conjunto MNIST tiene una distribución demográfica y de estilos de escritura concreta que puede no representar otros contextos.
- Licencia sin definir: el autor no ha elegido licencia y usa el identificador `unspecified-educational`; el uso comercial queda sin autorización clara.
- El repositorio no registra descargas ni likes y el tamaño declarado es 0,0 GB, lo que sugiere un proyecto recién publicado y sin validación externa.
- Parte del código, los tests, el pipeline de exportación y el sitio web se desarrollaron con asistencia de IA (Claude Code), según se declara en la model card.
- No hay información sobre idiomas soportados ni sobre cuantizaciones, y no se han publicado benchmarks frente a modelos de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TranTrinhNhan1111/WriteRHand-MNIST
- Perfil del autor en Hugging Face: https://huggingface.co/TranTrinhNhan1111/models
- Repositorio del proyecto (código, tests e informe): https://github.com/TranTrinhNhan1/WriteRHand
- Dataset MNIST: https://huggingface.co/datasets/ylecun/mnist
- Referencia del dataset MNIST (LeCun, Bottou, Bengio, Haffner, 1998): https://www.geeksforgeeks.org/machine-learning/mnist-dataset/
- Demo en navegador: indicada en el README del repositorio de GitHub (no se proporciona URL directa en la información disponible)
