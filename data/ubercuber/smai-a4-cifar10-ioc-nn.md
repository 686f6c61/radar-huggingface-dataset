# UberCuber/smai-a4-cifar10-ioc-nn

## Resumen

`UberCuber/smai-a4-cifar10-ioc-nn` es un modelo de clasificación de imágenes desarrollado por el usuario UberCuber como entrega de la asignación 4 de la asignatura SMAI (Statistical Methods and Artificial Intelligence). No es un modelo de lenguaje: se trata de un perceptrón multicapa (MLP) con restricción de convexidad entrada-salida (IOC-NN, Input-Output Convex Neural Network) entrenado sobre el conjunto de datos CIFAR-10 para clasificar imágenes de 32x32 píxeles en diez categorías.

La arquitectura es un MLP de cuatro capas con dimensiones `[3072, 128, 64, 10]` y 402.250 parámetros totales. La innovación principal es la restricción de convexidad: tras la primera capa, los pesos de las capas siguientes se fuerzan a ser no negativos mediante una proyección exponencial, lo que convierte la función en convexa respecto a la entrada y permite, en teoría, certificar robustez frente a perturbaciones adversariales.

El modelo es relevante únicamente como material didáctico o como referencia para experimentos con redes convexas. Su rendimiento es modesto (46,70 % de precisión en test) y su licencia MIT permite reutilización sin restricciones, pero no está pensado para producción ni para tareas reales de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con restriccion de convexidad entrada-salida (IOC-NN) |
| Parametros totales | 402.250 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de imagenes, no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas del modelo; la tarea es clasificacion visual) |
| Licencia | MIT |
| Formato de pesos | PyTorch (state_dict, presumiblemente `.pt`/`.pth`; el repo pesa 0,0 GB) |

## Arquitectura y entrenamiento

El modelo es un perceptron multicapa con capas de dimensiones 3072 (entrada aplanada de 32x32x3), 128, 64 y 10 (salida). Usa activacion ELU en las capas ocultas y logits lineales en la salida, entrenado con perdida de entropia cruzada categorial (CCE). La primera capa se inicializa como un MLP convencional; a partir de la segunda, los pesos se proyectan a valores no negativos mediante la transformacion `W <- exp(W - 5.0)` para los pesos negativos, lo que preserva la convexidad de la funcion respecto a la entrada.

El entrenamiento se realizo con SGD (learning rate 0,05, batch size 64, 100 epocas) sobre CIFAR-10, con un split propio de 70 % entrenamiento (35.000 imagenes), 15 % validacion (7.500) y 15 % test (7.500), usando la semilla 1114. Las imagenes se aplanan a 3072 dimensiones y se estandarizan por caracteristica (media cero, varianza unitaria) calculadas sobre el conjunto de entrenamiento en `float64`. No se menciona uso de RLHF, DPO ni tecnicas de aumento de datos.

## Capacidades

- Clasificacion de imagenes de 32x32 píxeles en las diez clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre entradas aplanadas y estandarizadas con la misma transformacion usada en entrenamiento.
- Restriccion de convexidad que, en principio, permite certificar robustez frente a perturbaciones adversariales acotadas.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision de alta resolucion, audio ni capacidades multilingues.
- No dispone de modo thinking ni de decodificacion especulativa.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: sirve como ejemplo reproducible de red convexa con restricciones de pesos para asignaturas de metodos estadisticos o deep learning.
- Investigacion en robustez adversarial: la restriccion IOC permite estudiar cotas de robustez certificada en un modelo pequeno y de bajo coste computacional.
- Comparativa de arquitecturas en CIFAR-10: util como linea base (baseline) convexa frente a MLPs convencionales o CNN en experimentos academicos.
- Pruebas de pipelines de preprocesado: permite validar flujos de estandarizacion por caracteristica y aplanado de imagenes antes de escalar a modelos mayores.
- Experimentos de inicializacion y proyeccion de pesos: el esquema `exp(W - 5.0)` puede replicarse para estudiar el efecto de restricciones de no negatividad en el entrenamiento.
- Reproducibilidad de resultados academicos: con la semilla 1114 y el split documentado, otro investigador puede replicar exactamente las cifras de entrenamiento y test.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en entrenamiento | 0,8167 |
| Precision en test | 0,4670 |
| Precision en validacion | no disponible |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que el modelo no es un modelo de lenguaje. La unica metrica reportada es la precision en CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (402.250 parametros x 4 bytes), mas el buffer de entrada de 3072 floats.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o incluso CPU; no requiere aceleracion dedicada.
- Cabe en cualquier GPU de consumo e integrada; tambien se ejecuta en CPU sin problema.
- Opciones de despliegue: PyTorch nativo; no hay versiones GGUF, ONNX ni integracion con vLLM, llama.cpp, Ollama o TGI documentadas.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de microsegundos por muestra en GPU moderna y de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UberCuber/smai-a4-cifar10-ioc-nn | 402.250 | no aplica | 46,70 % (test) | MIT | Hugging Face |
| MLP convencional de referencia en CIFAR-10 | ~400.000 | no aplica | no disponible en la informacion | variable | no disponible |
| CNN pequena tipo LeNet en CIFAR-10 | ~60.000 | no aplica | no disponible en la informacion | variable | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparativa se limita a la arquitectura y al tamano.

## Limitaciones y advertencias

- Precision en test limitada (46,70 %), muy por debajo de lo esperado en CIFAR-10 para modelos modernos (superior al 90 % en CNN).
- Brecha grande entre entrenamiento (81,67 %) y test (46,70 %), indicativa de sobreajuste.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo procesa imagenes de 32x32x3 aplanadas y estandarizadas con la transformacion exacta del entrenamiento; cualquier otra entrada produce resultados invalidos.
- El vocabulario de etiquetas esta limitado a las diez clases de CIFAR-10.
- Aunque la restriccion de convexidad ofrece garantias teoricas de robustez, no se han publicado evaluaciones adversariales que las cuantifiquen.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no es adecuado para produccion por su bajo rendimiento.
- El repositorio pesa 0,0 GB y tiene 0 descargas y 0 likes, lo que sugiere que los pesos podrian no estar subidos o ser de acceso muy reciente.

## Enlaces

- Hugging Face: https://huggingface.co/UberCuber/smai-a4-cifar10-ioc-nn
- Dataset CIFAR-10 en Hugging Face: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
