# wanda2626/smai-a4-ioc-p0

## Resumen

IOC-NN sobre CIFAR-10 es un clasificador de imagenes de pequeno tamano desarrollado por el usuario wanda2626 como parte de la asignatura SMAI (Assignment 4, Task 1.5). Se trata de una red neuronal completamente conectada que mapea las 3072 dimensiones de una imagen CIFAR-10 (32x32x3 aplanada) a 10 clases mediante una capa oculta de 256 unidades con activacion ELU. Su interes no reside en el rendimiento, sino en la restriccion arquitectonica que impone: los pesos de la segunda capa son no negativos, lo que convierte cada logit en una funcion convexa de la entrada.

El modelo se entrena sobre las etiquetas verdaderas de CIFAR-10 (sin ruido, p = 0) y sirve como referencia de comparacion frente a variantes con etiquetas ruidosas dentro del mismo trabajo academico. Con 789.258 parametros, es un artefacto docente de alcance limitado, no un modelo de produccion.

Es relevante unicamente en el contexto de investigacion sobre redes con restricciones de convexidad (IOC-NN, Input Output Convex Neural Networks) y como ejemplo reproducible de un pipeline minimo de clasificacion de imagenes con PyTorch y el dataset `uoft-cs/cifar10` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) completamente conectado, 3072 → 256 → 10, activacion ELU en la capa oculta, salida lineal (logits) |
| Parametros totales | 789.258 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes de 32x32x3) |
| Tipos de cuantizacion | No disponible (pesos en float32, `state_dict` de PyTorch) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch); preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La red es un `nn.Sequential` con dos capas lineales: `Linear(3072, 256)`, `ELU()` y `Linear(256, 10)`. La innovacion tecnica es la restriccion IOC-NN sobre la segunda capa: sus pesos se inicializan uniformemente en (0, 2/256) y, tras cada paso de SGD, cualquier peso negativo se reemplaza por exp(w - 5), garantizando no negatividad. Como consecuencia, cada logit es una funcion convexa de la entrada. La primera capa y todos los sesgos quedan sin restringir.

El entrenamiento usa la particion de entrenamiento de `uoft-cs/cifar10` (50.000 imagenes), SGD plano con learning rate 0.02, tamano de lote 64, sin acumulacion de gradientes, perdida de entropia cruzada, 100 epocas sin parada temprana y semilla `torch.manual_seed(1034)`. El preprocesado aplana cada imagen a 3072 valores en orden channel-last, normaliza a [0, 1] dividiendo por 255 y estandariza cada columna con la media y desviacion tipica del conjunto de entrenamiento (guardadas en `preprocessing.npz`).

## Capacidades

- Clasificacion de imagenes CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Salida de 10 logits por imagen; la clase predicha se obtiene con `argmax` y las probabilidades con softmax.
- Inferencia por lotes sobre arrays de forma (n, 32, 32, 3) en uint8.
- Modelo convexo por construccion respecto a la entrada en cada logit, util para analisis teorico de robustez y convexidad.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues.
- No dispone de modo thinking ni de generacion de texto.

## Casos de uso

- Docencia y reproduccion academica: sirve como referencia base en la comparacion de la Task 1.5 entre entrenamiento con etiquetas limpias y con etiquetas ruidosas, permitiendo replicar exactamente el experimento con la semilla y los hiperparametros documentados.
- Estudio de redes convexas (IOC-NN): permite analizar empiricamente como la restriccion de no negatividad en la segunda capa afecta a la precision y a la forma de las fronteras de decision en un problema de 10 clases.
- Baseline minimo para CIFAR-10: con 789.258 parametros y un MLP simple, ofrece un punto de comparacion barato frente a CNN y modelos mas complejos en experimentos de ablacion.
- Pruebas de pipelines de preprocesado: el par `model.pt` + `preprocessing.npz` permite validar implementaciones de normalizacion por columna y de aplanado channel-last antes de escalar a modelos mayores.
- Experimentos de sensibilidad al ruido de etiquetas: al estar entrenado con p = 0, sirve como control limpio frente a variantes entrenadas con etiquetas corruptas en estudios de tolerancia al ruido.
- Inferencia en CPU para demostraciones: el tamano reducido del modelo permite ejecutar clasificacion en entornos sin GPU, por ejemplo en cuadernos docentes o tests de integracion.

## Benchmarks y rendimiento

Resultados publicados en la model card (epoca 100):

| Metrica | Valor |
|---|---:|
| Precision de entrenamiento | 0,7940 |
| Precision de test (10.000 imagenes) | 0,4328 |
| Perdida de test | 4,4236 |
| Mejor precision de test | 0,5124 (epoca 34) |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (789.258 parametros, unos 3,2 MB de pesos, mas activaciones minimas por lote).
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte CUDA o incluso CPU es suficiente.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060 o superiores, y en CPU sin problemas.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), exportacion a TorchScript u ONNX si se necesita servir en produccion. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera del orden de microsegundos a milisegundos por lote en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| IOC-NN CIFAR-10 (este) | 789.258 | Imagen 32x32x3 | No disponible | Hugging Face |
| MLP estandar CIFAR-10 | No disponible | Imagen 32x32x3 | No disponible | No disponible |
| CNN pequena CIFAR-10 | No disponible | Imagen 32x32x3 | No disponible | No disponible |

No disponible para comparaciones cuantitativas de precision, contexto o licencia.

## Limitaciones y advertencias

- Precision de test baja (0,4328 en la epoca 100) y sobreajuste claro: la precision de entrenamiento (0,7940) supera ampliamente la de test, y la mejor precision de test se alcanzo en la epoca 34 (0,5124), lo que indica deterioro posterior.
- Restriccion IOC-NN: la no negatividad de la segunda capa limita la expresividad del modelo y contribuye a la brecha entre entrenamiento y test.
- Alcance limitado a CIFAR-10 con entrada fija de 32x32x3; no admite otras resoluciones ni dominios sin reentrenamiento.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni atribucion. Conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Sin idiomas ni capacidades de lenguaje: no es adecuado para tareas de texto, tool calling ni agentes.
- Riesgo de sesgos inhererentes al dataset CIFAR-10, que no esta documentado en la model card.
- No hay informacion sobre robustez frente a perturbaciones adversariales, a pesar de la motivacion teorica de convexidad.
- Artefacto academico sin mantenimiento declarado; no recomendado como componente de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wanda2626/smai-a4-ioc-p0
- Dataset utilizado: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
