# vishwajeet456/NumPy

## Resumen

NumPy (identificador `vishwajeet456/NumPy` en Hugging Face) es una red neuronal fully-connected de cuatro capas implementada exclusivamente con NumPy, sin dependencias de frameworks de deep learning como PyTorch o TensorFlow. La desarrolla Vishwajeet Adkine como proyecto educativo para demostrar de forma transparente como funcionan la propagacion hacia delante, la retropropagacion derivada a mano y el descenso de gradiente estocastico por mini-lotes. Alcanza un 97,83% de exactitud en el conjunto de test de MNIST y entrena en unos 88 segundos sobre CPU de Google Colab.

El modelo resuelve la clasificacion de digitos manuscritos (10 clases) a partir de imagenes de 28x28 pixeles aplanadas a vectores de 784 dimensiones. Su interes no es el rendimiento competitivo sino la claridad pedagogica: el codigo expone cada paso del calculo de gradientes, verificado contra gradientes numericos antes del entrenamiento, lo que lo convierte en un recurso util para quien quiera entender los fundamentos sin abstracciones de framework.

No es un modelo de lenguaje ni un modelo fundacional: no procesa texto, no tiene ventana de contexto y no soporta generacion. Es un artefacto educativo de vision por computador clasica, con licencia MIT, publicado el 13 de noviembre de 2026 y sin descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa fully-connected (784 → 128 → 64 → 32 → 10) |
| Parametros totales | 111.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en NumPy `.npz`, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | `.npz` de NumPy (helper `load_weights` en el notebook) |

## Arquitectura y entrenamiento

La red tiene cuatro capas con pesos: 784 → 128 → 64 → 32 → 10, con activaciones ReLU en las capas ocultas, salida softmax y perdida de entropia cruzada con regularizacion L2 opcional (λ = 1e-4). La inicializacion es He (normal con varianza 2/fan-in). La implementacion es una clase `NeuralNetwork` en NumPy con metodos `forward`, `backward`, `step` y `fit`; la retropropagacion se verifica contra gradientes numericos antes de iniciar el entrenamiento.

El entrenamiento usa el conjunto MNIST con un split 90/10 del conjunto de entrenamiento para validacion y el conjunto de test oficial reservado. Los pixeles se escalan a [0, 1] y se aplanan a 784 dimensiones. El optimizador es SGD por mini-lotes con tamano de lote 128, tasa de aprendizaje 0,1 con decaimiento multiplicativo de 0,95 por epoca, 30 epocas por defecto y ejecucion sobre CPU de Colab. No se emplean momentum, Adam, dropout ni batch normalization.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos MNIST en 10 clases (0-9).
- Inferencia por lotes mediante `net.predict(X_test)` sobre arrays NumPy.
- Entrenamiento reproducible desde cero con SGD y retropropagacion derivada a mano.
- Verificacion de gradientes analiticos frente a gradientes numericos.
- Soporte de regularizacion L2 configurable.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision general mas alla de MNIST.
- No tiene capacidades multilingues ni modo de razonamiento extendido.

## Casos de uso

- Docencia de fundamentos de deep learning: el notebook permite recorrer paso a paso forward, backward y actualizacion de pesos, util en asignaturas introductorias de machine learning.
- Verificacion de implementaciones de retropropagacion: sirve como referencia cruzada para comprobar que los gradientes calculados por un framework coinciden con los derivados a mano.
- Prototipado rapido de clasificadores de digitos en entornos sin GPU ni frameworks: al depender solo de NumPy, se ejecuta en cualquier entorno Python con CPU.
- Experimentos de ablation sobre hiperparametros: la simplicidad del codigo facilita variar tasa de aprendizaje, tamano de lote, numero de capas o regularizacion y medir el efecto en exactitud.
- Base para comparativas pedagogicas frente a modelos convolucionales: el propio autor referencia un proyecto CNN sobre CIFAR-10 como siguiente paso, lo que permite contrastar el impacto de la estructura convolucional.
- Reproduccion de resultados en entornos academicos: los 88 segundos de entrenamiento en CPU de Colab permiten replicar el experimento completo en una sesion de clase o laboratorio.
- Punto de partida para ejercicios de extension: anadir momentum, Adam o dropout sobre esta base para estudiar su efecto en MNIST.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud en test (MNIST) | 97,83% |
| Perdida en test | 0,0824 |
| Tiempo de entrenamiento | 88,2 s (CPU de Colab) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo ocupa unos 111.146 parametros en float, lo que supone del orden de 0,4 MB en precision simple; cabe holgadamente en cualquier CPU moderna.
- Entrenamiento en CPU: 88,2 segundos en CPU de Colab con la configuracion por defecto (30 epocas, lote 128).
- GPU: no requiere GPU; no se han publicado mediciones en GPU.
- Cabe en cualquier GPU consumer, pero no aporta ventaja practica al ser un modelo de 111k parametros.
- Despliegue: script Python con NumPy y carga de pesos `.npz`; no hay integracion publicada con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explicita; el coste por inferencia es despreciable frente al tiempo de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Exactitud MNIST | Licencia | Formato |
|---|---|---|---|---|---|
| NumPy (este modelo) | 111.146 | Clasificacion MNIST | 97,83% | MIT | `.npz` |
| CNN sobre MNIST (referencia del autor) | no disponible | Clasificacion MNIST | no disponible | no disponible | no disponible |
| LeNet-5 (referencia historica) | ~60.000 | Clasificacion MNIST | ~99% (referencia) | no disponible | no disponible |

La comparativa con modelos de la misma categoria es limitada: el autor menciona un proyecto CNN sobre CIFAR-10 en la misma serie, pero no aporta metricas. No se dispone de datos suficientes para una comparacion cuantitativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- Las capas fully-connected ignoran la estructura espacial de la imagen, por lo que la exactitud queda por debajo de modelos convolucionales.
- SGD plano con decaimiento fijo: sin momentum, Adam, dropout ni batch normalization.
- Evaluado unicamente en MNIST, un benchmark limpio y sencillo; no se debe esperar esta exactitud en digitos con otra caligrafia, fondos o condiciones de escaneo.
- No se han realizado analisis de robustez ni de calibracion.
- El propio autor indica que no esta pensado para uso en produccion.
- No apto para tareas de lenguaje, generacion, razonamiento o vision general.
- Licencia MIT para codigo y pesos; MNIST pertenece a LeCun, Cortes y Burges y tiene sus propias condiciones de uso.
- Sin descargas ni validacion externa registradas en Hugging Face en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishwajeet456/NumPy
- Dataset MNIST (referencia del autor): no disponible como enlace en la informacion proporcionada
- Notebook original: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
