# zeromodels/pvt-v2-b1

## Resumen

PVTv2-B1 es un backbone de visión basado en el Pyramid Vision Transformer v2, desarrollado originalmente por OpenGVLab y convertido a Keras 3 puro por el proyecto ZeroModels. Este modelo resuelve el problema de extracción de características multiescala para tareas de visión por computador, ofreciendo una alternativa ligera a los transformers de visión convencionales con solo 14 millones de parámetros y un rendimiento del 78,7% de top-1 en ImageNet-1k.

La relevancia de esta conversión radica en que permite ejecutar el mismo checkpoint de forma idéntica en TensorFlow, PyTorch y JAX mediante la API de Keras 3, sin necesidad de dependencias específicas de cada framework. El modelo incorpora innovaciones como overlapping patch embeddings, una red feed-forward convolucional y la ausencia de embeddings posicionales, lo que permite procesar imágenes a cualquier resolución de entrada. Está disponible bajo licencia Apache-2.0 y su repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVTv2) |
| Parametros totales | ~14,0 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada variable, tipicamente 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | Keras 3 (weights HDF5) |

## Arquitectura y entrenamiento

PVTv2-B1 es un transformer piramidal jerarquico que combina operaciones de convolucion dentro de sus capas transformer para aprender representaciones de imagen de forma eficiente. Sus innovaciones principales son tres: overlapping patch embeddings que preservan la continuidad espacial entre parches, una red feed-forward convolucional (ConvFFN) que incorpora propiedades de las CNN, y la eliminacion completa de embeddings posicionales, lo que permite que el modelo procese imagenes de cualquier resolucion sin reentrenamiento. Ademas, existe una variante opcional con atencion lineal para reducir el coste computacional.

El modelo fue entrenado en el dataset ImageNet-1k y alcanza un top-1 del 78,7%. La conversion de ZeroModels es una implementacion pura de Keras 3 del checkpoint original de OpenGVLab, con la normalizacion integrada en el grafo, de modo que se pueden pasar pixeles crudos en rango [0, 255] directamente. El checkpoint se puede cargar tanto para clasificacion (`PvtV2ImageClassify`) como para extraccion de caracteristicas (`PvtV2Model` con `as_backbone=True`), devolviendo una piramide de caracteristicas de cuatro etapas.

## Capacidades

- Clasificacion de imagenes: devuelve logits de clases a partir de una imagen de entrada, con soporte para las 1000 clases de ImageNet-1k.
- Extraccion de caracteristicas multiescala: genera una piramide de caracteristicas de cuatro etapas, util como backbone para tareas descendentes.
- Resolucion de entrada variable: al no usar embeddings posicionales, acepta imagenes de cualquier dimension sin necesidad de redimensionar ni reentrenar.
- Multi-backend: la misma implementacion Keras 3 se ejecuta sin modificaciones en TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Normalizacion integrada: el preprocesado de normalizacion esta incluido en el grafo, simplificando el pipeline de inferencia.
- Compatibilidad con checkpoints originales: puede cargar directamente pesos de `OpenGVLab/pvt_v2_b1` mediante el prefijo `hf:`.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede servir como clasificador de imagenes con un coste computacional reducido (14M de parametros), adecuado para entornos con recursos limitados o inferencia en tiempo real.
- Backbone para deteccion de objetos: su piramide de caracteristicas de cuatro etapas se puede integrar en arquitecturas como Faster R-CNN o RetinaNet para detectar objetos a diferentes escalas.
- Backbone para segmentacion semantica: las caracteristicas multiescala alimentan decodificadores como U-Net o DeepLab para segmentar imagenes con detalle espacial.
- Transfer learning en datasets pequenos: al ser un modelo ligero y preentrenado en ImageNet, es ideal para fine-tuning en dominios especificos con pocos datos, reduciendo el riesgo de sobreajuste.
- Prototipado rapido multiplataforma: al funcionar con Keras 3, un mismo codigo puede probarse en JAX, TensorFlow o PyTorch sin cambios, acelerando la experimentacion en equipos heterogeneos.
- Sistemas de vision embebidos: con solo 14M de parametros, el modelo puede exportarse a formatos ligeros (TFLite, ONNX) para su despliegue en dispositivos moviles o perifericos.

## Benchmarks y rendimiento

El modelo reporta un top-1 del 78,7% en ImageNet-1k. La tabla siguiente compara las variantes de PVTv2 disponibles en la coleccion de ZeroModels:

| Variante | ImageNet-1k top-1 |
|---|---|
| pvt-v2-b0 | 70,5% |
| pvt-v2-b1 | 78,7% |
| pvt-v2-b2 | 82,0% |
| pvt-v2-b2-linear | 82,1% |
| pvt-v2-b3 | 83,1% |
| pvt-v2-b4 | 83,6% |
| pvt-v2-b5 | 83,8% |

No se han publicado resultados de benchmarks adicionales (como COCO o ADE20K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para un batch pequeno (por ejemplo, 1 imagen a 224x224) en FP32, dado el tamano de 14M de parametros.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o superior, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna sin necesidad de cuantizacion.
- Opciones de despliegue: al ser Keras 3, se puede exportar a TensorFlow Serving, TFLite, ONNX o ejecutar directamente con el backend de Torch o JAX. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por su tamano se espera una latencia de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | ImageNet-1k top-1 | Licencia | Formato |
|---|---|---|---|---|
| PVTv2-B1 (este) | ~14M | 78,7% | Apache-2.0 | Keras 3 |
| ResNet-50 | ~25M | ~76-77% | Apache-2.0 | Multiples |
| ViT-Base | ~86M | ~84% | Apache-2.0 | Multiples |
| PVTv2-B2 | ~25M | 82,0% | Apache-2.0 | Keras 3 |

PVTv2-B1 ofrece un mejor equilibrio entre tamano y precision que ResNet-50, con menos de la mitad de parametros y mayor top-1. Frente a ViT-Base, es significativamente mas ligero (14M vs 86M) a costa de una precision menor, lo que lo hace preferible en escenarios con restricciones de memoria o computo.

## Limitaciones y advertencias

- Modelo de vision exclusivamente: no procesa texto, audio ni video; su unica entrada son imagenes.
- Sin capacidades generativas: no puede generar contenido, solo clasificar o extraer caracteristicas.
- Sesgos de ImageNet: al estar entrenado en ImageNet-1k, puede presentar sesgos hacia las categorias y distribuciones de ese dataset, con menor rendimiento en dominios muy diferentes.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de licencia en redistribuciones.
- Dependencia de Keras 3: requiere la instalacion de Keras 3 y un backend compatible (TensorFlow, PyTorch o JAX); no es un checkpoint autocontenido en formatos como safetensors o GGUF.
- Sin cuantizaciones precalculadas: no se proporcionan versiones cuantizadas, por lo que la inferencia en CPU puede ser mas lenta que con modelos optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/pvt-v2-b1
- Paper original: https://arxiv.org/abs/2106.13797
- Repositorio oficial de PVT: https://github.com/whai362/PVT
- Documentacion de ZeroModels para PVTv2: https://imvision12.github.io/ZeroModels/pvt_v2/
- Coleccion de variantes PVT/PVTv2: https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
