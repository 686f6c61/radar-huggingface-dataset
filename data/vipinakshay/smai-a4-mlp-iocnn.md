# VipinAkshay/smai-a4-mlp-iocnn

## Resumen

`smai-a4-mlp-iocnn` es un repositorio de artefactos de un trabajo academico (SMAI Monsoon 2026, Assignment 4) que contiene tres implementaciones de perceptron multicapa (MLP) entrenadas sobre CIFAR-10: una version en NumPy puro, una replica equivalente en PyTorch y una variante denominada IOC-NN (ELU con pesos no negativos a partir de la segunda capa) tambien en PyTorch. Lo publica el usuario VipinAkshay y no es un modelo de lenguaje ni un modelo fundacional: es un conjunto de pesos de una red densa de tres capas disenada para clasificacion de imagenes de 32x32 pixeles en 10 clases.

La arquitectura es un MLP estandar con entrada aplanada de 3072 valores (3 canales x 32 x 32), una capa oculta de 256 unidades con activacion ReLU (o ELU en la variante IOC-NN) y una capa de salida de 10 clases. Los tres ficheros de pesos declaran exactamente 789.258 parametros, lo que confirma que comparten topologia y solo difieren en el framework y la restriccion de signo de los pesos.

Su relevancia es exclusivamente didactica: sirve como referencia reproducible (semilla 2058) de un flujo de entrenamiento clasico con normalizacion por columna, particion estratificada 60/20/20 y comparacion entre implementaciones artesanales y de alto nivel. No debe confundirse con un modelo generativo ni emplearse en tareas de NLP, razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso (3072-256-10); variante IOC-NN con ELU y pesos no negativos desde la capa 2 |
| Parametros totales | 789.258 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (clasificador de imagenes, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy) y `.pt` (PyTorch); estadisticas de preprocesado en `preprocessing.npz`; configuracion en `config.json` |

## Arquitectura y entrenamiento

El modelo es un perceptron multicapa completamente conectado con una unica capa oculta de 256 neuronas. La entrada es la imagen CIFAR-10 aplanada a 3072 dimensiones, normalizada dividiendo por 255 y aplicando estandarizacion por columna (resta de la media y division por la desviacion tipica). La salida son 10 logits correspondientes a las clases de CIFAR-10. La variante IOC-NN sustituye ReLU por ELU e impone pesos no negativos a partir de la segunda capa, lo que constituye la innovacion tecnica del ejercicio.

El entrenamiento se realizo con semilla 2058 y dos esquemas de preprocesado distintos: el modelo NumPy usa estadisticas ajustadas sobre las 36.000 imagenes de entrenamiento de una particion estratificada 60/20/20, mientras que los dos modelos PyTorch usan estadisticas calculadas sobre las 50.000 imagenes originales de entrenamiento de CIFAR-10. Las columnas con desviacion tipica cero se dividen por 1. No se documenta numero de epochs, optimizador, tasa de aprendizaje ni composicion adicional del dataset mas alla de CIFAR-10.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia en NumPy puro sin dependencia de frameworks de deep learning, util para entornos restringidos.
- Inferencia en PyTorch con pesos cargables mediante `torch.load`.
- Reproducibilidad determinista documentada mediante semilla fija (2058).
- Comparacion controlada entre MLP estandar y MLP con restriccion de signo (IOC-NN).
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni ninguna capacidad generativa.

## Casos de uso

- Docencia de fundamentos de deep learning: el repositorio permite a estudiantes cargar los pesos y reproducir el pipeline completo de preprocesado, entrenamiento y evaluacion sin reentrenar, comparando la implementacion NumPy con la de PyTorch.
- Verificacion de equivalencia entre frameworks: al compartir topologia y numero de parametros, sirve para validar que una implementacion artesanal en NumPy produce resultados coherentes con una implementacion en PyTorch bajo las mismas condiciones.
- Estudio de restricciones estructurales: la variante IOC-NN permite analizar el impacto de imponer pesos no negativos y activacion ELU frente a ReLU sin restriccion, en un entorno controlado y reproducible.
- Baseline de clasificacion de imagenes de baja resolucion: util como referencia inferior de rendimiento frente a CNN o transformers de vision en experimentos academicos sobre CIFAR-10.
- Pruebas de pipelines de preprocesado: las estadisticas separadas (`split_mean`/`split_std` y `full_train_mean`/`full_train_std`) permiten validar implementaciones de normalizacion por columna y manejo de desviaciones cero.
- Inferencia ligera en CPU: con 789.258 parametros, el modelo puede ejecutarse en NumPy en cualquier maquina sin GPU, adecuado para demostraciones en aula o entornos sin acelerador.
- Auditoria de artefactos academicos: sirve como ejemplo de publicacion de pesos, configuracion y estadisticas de preprocesado de forma conjunta para garantizar reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precision en test, perdida, matriz de confusion ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (789.258 parametros x 4 bytes, aproximadamente 3,2 MB de pesos mas buffers intermedios), por lo que cabe en cualquier GPU, incluida una iGPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna ejecuta la inferencia en milisegundos.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) y tambien en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: NumPy directamente para `mlp_numpy.npz`; PyTorch para `mlp_torch.pt` e `iocnn_torch.pt`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera latencia de microsegundos a pocos milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-mlp-iocnn | 789.258 | 3072 valores (32x32x3) | Clasificacion CIFAR-10 | MIT | Hugging Face |
| MLP 3072-256-10 estandar | ~789.000 | 3072 valores | Clasificacion CIFAR-10 | no disponible | Implementacion propia |
| CNN pequena tipo LeNet-5 | ~60.000 | 32x32x3 | Clasificacion CIFAR-10 | no disponible | Implementacion propia |
| ResNet-18 adaptada a CIFAR-10 | ~11,2 M | 32x32x3 | Clasificacion CIFAR-10 | MIT (torchvision) | torchvision |

La comparativa se limita a arquitecturas de clasificacion de imagenes de baja resolucion, ya que el modelo no es comparable con modelos de lenguaje. No se dispone de datos de rendimiento del modelo publicado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de tokenizador, vocabulario y capacidad de generar texto; cualquier uso en NLP, codigo o razonamiento es inviable.
- Dominio restringido: solo clasifica imagenes de 32x32x3 en las 10 clases de CIFAR-10; no generaliza a otras resoluciones ni a otros conjuntos de etiquetas sin reentrenamiento.
- Sin metricas publicadas: no se documenta precision, recall ni matriz de confusion, por lo que no es posible evaluar su calidad real frente a alternativas.
- Riesgo de sobreajuste no cuantificado: al ser un MLP denso sobre 3072 entradas, es propenso a sobreajuste; no se indica regularizacion aplicada.
- Repositorio de 0,0 GB y sin descargas ni likes: los ficheros de pesos podrian no estar efectivamente subidos o ser de tamano despreciable; conviene verificar la integridad antes de usarlo.
- Dependencia de estadisticas de preprocesado concretas: usar medias y desviaciones distintas a las documentadas invalida las predicciones.
- Licencia MIT: permite uso comercial y modificacion, pero al ser un artefacto academico sin garantias, no se recomienda en produccion.
- Sin sesgos documentados ni evaluacion de robustez; no se han analizado sesgos de clase ni comportamiento ante imagenes fuera de distribucion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VipinAkshay/smai-a4-mlp-iocnn
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
