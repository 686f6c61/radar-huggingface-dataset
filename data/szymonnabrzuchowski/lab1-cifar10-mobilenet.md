# SzymonNabrzuchowski/lab1-cifar10-mobilenet

## Resumen

SzymonNabrzuchowski/lab1-cifar10-mobilenet es un clasificador de imagenes de 10 clases entrenado sobre el conjunto de datos CIFAR-10. Se trata de un modelo docente o de laboratorio: el propio autor lo presenta como un ejercicio de fine-tuning de una MobileNetV3 Small de torchvision, inicializada con pesos preentrenados en ImageNet y ajustada en una GPU de Google Colab. El repositorio no incluye pesos en formatos de despliegue habituales ni una licencia declarada, y acumula cero descargas y cero likes en HuggingFace.

La arquitectura es una red neuronal convolucional MobileNetV3 Small, con la capa clasificadora final sustituida por una capa lineal de 10 salidas correspondientes a las clases airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck. El entrenamiento se realizo durante 5 epocas con AdamW y una tasa de aprendizaje de 0,001, seleccionando el checkpoint por precision de validacion.

Su relevancia es limitada fuera del ambito academico: no es un modelo de proposito general, no soporta texto, tool calling ni multiples idiomas, y su dominio esta restringido a las 10 clases de CIFAR-10. Resulta util como referencia reproducible de un flujo de transfer learning en vision por computador y como punto de partida para experimentos de fine-tuning sobre datasets de 10 clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3 Small (CNN, implementacion de torchvision) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible (solo se publica el state dict en precision original) |
| Idiomas soportados | en (segun las etiquetas de HuggingFace; las etiquetas de clase estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dictionary (`model.pth`) |
| Numero de clases | 10 (airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck) |
| Resolucion de entrada | 128 x 128 RGB, normalizada con media y desviacion tipica de `config.json` |
| Fecha de creacion | 2026-10-09 |
| Fecha de actualizacion | 2026-10-09 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo parte de `torchvision.models.mobilenet_v3_small` con pesos preentrenados en ImageNet. La capa clasificadora final se reemplaza por una capa lineal de 10 unidades y se ajusta el conjunto de pesos sobre CIFAR-10. MobileNetV3 Small es una CNN disenada para eficiencia computacional en dispositivos con recursos limitados; incorpora bloques con activaciones tipo Squeeze-and-Excitation y funciones de activacion aproximadas (h-swish), segun la implementacion estandar de torchvision. La model card no detalla la configuracion exacta de bloques ni el numero de parametros, por lo que esos datos se marcan como no disponibles.

Los datos de entrenamiento citados son 45.000 imagenes de entrenamiento, 5.000 de validacion y 10.000 de test. Se realizaron 5 epocas con tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,001 y semilla 42. El checkpoint se selecciono mediante la precision de validacion y el conjunto de test se evaluo despues de esa seleccion, lo que evita fuga de datos del test en la eleccion del modelo. No se menciona el uso de tecnicas de aumento de datos, regularizacion adicional, RLHF ni DPO (no aplicables a un clasificador de imagenes). El preprocesado de inferencia consiste en convertir a RGB, redimensionar a 128 x 128, transformar a tensor y normalizar con la media y la desviacion tipica indicadas en `config.json`.

## Capacidades

- Clasificacion de imagenes en 10 categorias cerradas: airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck.
- Salida de una unica etiqueta por imagen; no genera texto ni descripciones.
- Inferencia en modo evaluacion (`eval()`) con imagenes RGB redimensionadas a 128 x 128 y normalizadas.
- Integrable en `torchvision` mediante `mobilenet_v3_small(weights=None)` y carga del state dict con `load_state_dict`.
- Adecuado para ejecucion en CPU y en GPU de gama baja gracias al diseno eficiente de MobileNetV3 Small.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modo de pensamiento. Es un clasificador puro de vision.

## Casos de uso

- Clasificacion rapida en el borde (edge computing): el modelo clasifica imagenes de baja resolucion en 10 categorias y, por su tamano reducido, puede desplegarse en dispositivos con recursos limitados para tareas de etiquetado automatico.
- Docencia y aprendizaje de transfer learning: sirve como ejemplo reproducible de fine-tuning de un backbone preentrenado en ImageNet sobre un dataset pequeno, con hiperparametros y semilla documentados.
- Pre-etiquetado en pipelines de anotacion: puede generar etiquetas preliminares para imagenes que encajen en las 10 clases de CIFAR-10, reduciendo el trabajo manual de anotadores, siempre con revision humana posterior.
- Filtrado de miniaturas o imagenes de baja resolucion: en un pipeline de datos, permite clasificar rapidamente imagenes pequenas antes de aplicar modelos mas costosos.
- Punto de partida para fine-tuning en otros datasets de 10 clases: la capa clasificadora es facilmente sustituible y los pesos del backbone pueden reutilizarse para dominios de imagen similares.
- Experimentos comparativos de eficiencia: util como linea base de bajo coste frente a arquitecturas mas grandes (ResNet, EfficientNet) en estudios de precision frente a latencia.
- Clasificacion por lotes en CPU: al ser un modelo pequeno, permite procesar lotes grandes sin GPU en entornos de servidor convencionales.
- Deteccion de deriva en produccion: puede emplearse como clasificador de referencia para monitorizar cambios en la distribucion de imagenes de entrada en un sistema mayor.

## Benchmarks y rendimiento

Unicos resultados publicados en la model card, medidos sobre las 10.000 imagenes del conjunto de test de CIFAR-10 despues de la seleccion del checkpoint por validacion:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9039 |
| Macro F1 | 0,9035 |
| Mejor epoca | 4 |

No se han publicado mas resultados de benchmarks en la informacion disponible. La model card indica que las metricas por clase y la matriz de confusion estan disponibles en el directorio `eval/`, pero no se incluyen sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Dado que se trata de una MobileNetV3 Small, la huella de memoria es reducida (del orden de decenas de MB en precision completa), pero este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: la model card solo indica que el entrenamiento se realizo en una GPU de Google Colab. No se especifica modelo concreto de GPU para entrenamiento ni para inferencia.
- Compatibilidad con GPU de consumo: muy probable en cualquier GPU de consumo actual e incluso en CPU, segun el diseno de MobileNetV3 Small, aunque no se aportan mediciones concretas.
- Opciones de despliegue: al publicarse solo un state dict de PyTorch (`model.pth`) y un `config.json`, el despliegue natural es PyTorch con `torchvision`. No se proporcionan pesos en formatos ONNX, GGUF, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este clasificador).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Accuracy en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SzymonNabrzuchowski/lab1-cifar10-mobilenet | MobileNetV3 Small | no disponible | 128 x 128 RGB | 0,9039 (test) | no disponible | HuggingFace, 0 descargas |
| MobileNetV3 Small (torchvision, preentrenado en ImageNet) | MobileNetV3 Small | no disponible en esta ficha | variable | no evaluado en CIFAR-10 en la informacion disponible | licencia de torchvision (no indicada aqui) | torchvision |
| ResNet-18 fine-tuned en CIFAR-10 | CNN residual | no disponible | normalmente 32 x 32 o superior | no disponible | no disponible | multiples repositorios publicos |

No se dispone de datos de rendimiento homogeneos de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no puede completarse.

## Limitaciones y advertencias

- El modelo siempre elige entre las 10 clases de CIFAR-10: no detecta clases desconocidas ni devuelve una opcion de "ninguna de las anteriores".
- No realiza localizacion ni deteccion de objetos; solo clasifica la imagen completa.
- Los resultados sobre fotografias arbitrarias de alta resolucion pueden diferir de los obtenidos en el conjunto de test de CIFAR-10, tal y como advierte el autor.
- Solo 5 epocas de entrenamiento y un unico checkpoint seleccionado por precision de validacion: el margen de mejora y la robustez no estan caracterizados.
- Licencia no declarada: no se puede confirmar la legalidad del uso comercial ni las condiciones de redistribucion. Conviene contactar con el autor o asumir que no es apto para produccion hasta aclararlo.
- Riesgo de sesgos y de alucinacion: como clasificador, el riesgo de alucinacion se traduce en falsos positivos confiados; no se documenta ningun analisis de sesgo por clase ni de rendimiento por subgrupos.
- Idiomas: la etiqueta de idioma es `en` y las etiquetas de clase estan en ingles; no hay soporte multilingue porque el modelo no procesa texto.
- El repositorio no incluye pesos en formatos estandar de despliegue ni una model card con informacion de hardware, por lo que la integracion en produccion requiere trabajo adicional.
- Sin descargas ni likes en HuggingFace y con fechas de creacion y actualizacion identicas: no hay evidencia de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SzymonNabrzuchowski/lab1-cifar10-mobilenet
- No se han encontrado otros enlaces (papers, blogs, repositorios de codigo o demos) en la informacion proporcionada.
