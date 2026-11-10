# zeromodels/conditional-detr-resnet-50

## Resumen

Conditional DETR con backbone ResNet-50 es un modelo de deteccion de objetos desarrollado originalmente por Microsoft Research Asia y publicado en el paper *Conditional DETR for Fast Training Convergence* (arXiv:2108.06152). La version aqui descrita, `zeromodels/conditional-detr-resnet-50`, es una conversion pura a Keras 3 del checkpoint original `microsoft/conditional-detr-resnet-50`, realizada por el proyecto ZeroModels. Su proposito es ofrecer la misma arquitectura y pesos en un formato que se ejecuta sin modificaciones sobre TensorFlow, PyTorch o JAX mediante el backend de Keras 3.

El modelo mantiene la receta de prediccion de conjuntos de DETR, pero desacopla contenido y localizacion en la atencion cruzada del decodificador: cada query predice un punto de referencia 2D y la embedding sinusoidal de ese punto, escalada por una transformacion dependiente del contenido, forma una query espacial que se concatena con la query de contenido. Esto permite que cada cabeza atienda a una banda alrededor del objeto y acelera la convergencia del entrenamiento entre 6,7 y 10 veces respecto a DETR.

Es relevante para desarrolladores que necesitan un detector de objetos COCO con 300 queries, salidas sigmoideas por clase y un pipeline de inferencia portable entre frameworks sin reescribir codigo. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conditional DETR (transformer encoder-decoder) con backbone ResNet-50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; acepta cualquier tamano de imagen de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (compatible con backends TensorFlow, PyTorch y JAX); pesos originales en safetensors accesibles via prefijo `hf:` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conditional DETR: un backbone convolucional ResNet-50 extrae caracteristicas de la imagen, que se procesan mediante un encoder transformer. El decodificador transformer opera con 300 queries de objeto; cada query predice una puntuacion sigmoidea por clase COCO y una caja delimitadora. La innovacion clave respecto a DETR es el mecanismo de atencion cruzada condicional, que separa la query de contenido de la query espacial derivada de un punto de referencia 2D, mejorando la convergencia del entrenamiento.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El modelo original fue entrenado sobre el dataset COCO para deteccion de objetos. La version de ZeroModels es una conversion de pesos sin reentrenamiento: preserva los pesos del checkpoint de Microsoft y los expone mediante una implementacion Keras 3 multiplataforma.

## Capacidades

- Deteccion de objetos sobre imagenes en las clases del dataset COCO (80 categorias).
- Prediccion de 300 queries, cada una con puntuaciones sigmoideas por clase y una caja delimitadora.
- Post-procesado integrado que conserva los 100 mejores pares (query, clase) y aplica un umbral configurable.
- Procesador de imagenes con redimensionado que preserva la relacion de aspecto (lado corto 800, lado largo maximo 1333), aunque el modelo acepta cualquier tamano de entrada.
- Ejecucion unificada sobre TensorFlow, PyTorch y JAX mediante Keras 3, seleccionando el backend con la variable `KERAS_BACKEND`.
- Carga directa de pesos originales en safetensors mediante el prefijo `hf:` (por ejemplo, `hf:microsoft/conditional-detr-resnet-50`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente de vision.

## Casos de uso

- Deteccion de objetos en imagenes de vigilancia: el modelo identifica y localiza objetos COCO en fotogramas, con post-procesado que filtra por umbral de confianza; su backbone ResNet-50 ofrece un equilibrio razonable entre precision y coste computacional.
- Moderacion de contenido visual: integrado en un pipeline que detecta personas, vehiculos u objetos sensibles en imagenes subidas por usuarios, aplicando un umbral de score para decidir la revision manual.
- Anotacion asistida de datasets: el modelo genera cajas candidatas sobre imagenes sin etiquetar, que revisores humanos validan o corrigen, reduciendo el esfuerzo de etiquetado en proyectos de vision.
- Analisis de imagenes en aplicaciones moviles o edge: al poder exportarse a TensorFlow, PyTorch o JAX via Keras 3, permite desplegar el mismo checkpoint en distintos runtimes segun la plataforma objetivo.
- Sistemas de conteo y seguimiento de objetos: combinado con un tracker externo, las detecciones por fotograma sirven para contar vehiculos o personas en secuencias de video.
- Investigacion y prototipado rapido: la implementacion Keras 3 permite comparar el comportamiento del modelo entre backends (TF, Torch, JAX) sin cambiar el codigo de inferencia, util para experimentos de reproducibilidad.
- Automatizacion de inventario en retail: deteccion de productos o estanterias en imagenes de tienda para tareas de control de stock, usando las clases COCO como aproximacion o fine-tuning posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que Conditional DETR entrena entre 6,7 y 10 veces mas rapido que DETR, pero no se proporcionan cifras de mAP, latencia ni throughput para esta conversion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,2 GB, lo que sugiere un modelo ligero que cabe holgadamente en GPUs de consumo, aunque no se confirma el consumo exacto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del checkpoint (ResNet-50 + transformer), es previsible que funcione en GPUs consumer como RTX 3060 o superiores, pero este dato no esta confirmado.
- Cabe en consumer GPU: probable por el tamano del checkpoint, aunque no confirmado en la documentacion.
- Opciones de despliegue: Keras 3 con backends TensorFlow, PyTorch o JAX. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este detector).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/conditional-detr-resnet-50 | no disponible | no aplica | Deteccion de objetos COCO | Apache 2.0 | Hugging Face (Keras 3) |
| microsoft/conditional-detr-resnet-50 | no disponible | no aplica | Deteccion de objetos COCO | Apache 2.0 | Hugging Face (safetensors, transformers) |
| DETR (ResNet-50) | no disponible | no aplica | Deteccion de objetos COCO | Apache 2.0 | Hugging Face |

La diferencia principal frente al checkpoint original de Microsoft es el formato: ZeroModels ofrece una implementacion Keras 3 multiplataforma, mientras que el original esta pensado para la libreria `transformers`. Frente a DETR, Conditional DETR converge mas rapido en entrenamiento segun el paper, aunque no se aportan cifras comparativas de precision en la informacion disponible.

## Limitaciones y advertencias

- Modelo de vision: no procesa texto ni mantiene conversaciones; no debe evaluarse como modelo de lenguaje.
- Limitado a las 80 clases del dataset COCO; no detecta categorias fuera de ese vocabulario sin fine-tuning.
- Riesgo de falsos positivos y negativos segun el umbral de confianza; el post-procesado por defecto conserva los 100 mejores pares, lo que puede requerir ajuste en escenarios con muchos objetos.
- No se dispone de informacion sobre sesgos especificos del checkpoint; al entrenarse sobre COCO, hereda los sesgos de representacion de dicho dataset.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original y del dataset COCO.
- Conversion de pesos sin reentrenamiento: el rendimiento depende de la fidelidad de la conversion Keras 3 respecto al checkpoint original, que no se documenta con metricas en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion comunitaria.
- No se documentan tecnicas de cuantizacion soportadas.

## Enlaces

- Hugging Face: https://huggingface.co/zeromodels/conditional-detr-resnet-50
- Modelo base: https://huggingface.co/microsoft/conditional-detr-resnet-50
- Paper: https://arxiv.org/abs/2108.06152
- HF Papers: https://huggingface.co/papers/2108.06152
- Repositorio GitHub ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion Conditional DETR: https://imvision12.github.io/ZeroModels/conditional_detr/
- Documentacion de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
