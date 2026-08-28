# zeromodels/pvt-v2-b3

## Resumen

PVTv2 (Pyramid Vision Transformer v2) es un modelo de visión por computador basado en transformers, presentado en el artículo "PVTv2: Improved Baselines with Pyramid Vision Transformer" (arXiv:2106.13797). Esta versión concreta, `zeromodels/pvt-v2-b3`, es una conversión a Keras 3 del checkpoint original de OpenGVLab, lo que permite ejecutar el mismo modelo en TensorFlow, PyTorch y JAX sin modificar el código. El modelo tiene aproximadamente 45,2 millones de parámetros y alcanza un 83,1 % de top-1 en ImageNet-1k.

La relevancia de este modelo radica en su arquitectura piramidal eficiente, que combina la capacidad de los transformers con un diseño pensado para tareas densas como detección o segmentación. Al eliminar los position embeddings, acepta cualquier resolución de entrada, y su variante de atención lineal reduce el coste computacional. Esta conversión a Keras 3 facilita su integración en entornos que ya utilizan este framework, manteniendo compatibilidad con los pesos originales de PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVTv2) |
| Parametros totales | ~45,2 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (formato de pesos de la libreria zeromodels) |

## Arquitectura y entrenamiento

PVTv2 es un transformer piramidal con cuatro etapas que reducen progresivamente la resolucion espacial de los mapas de caracteristicas. Incorpora tres innovaciones principales respecto a PVT original: *overlapping patch embeddings* para preservar la continuidad local, una red *feed-forward* convolucional que mejora la extraccion de caracteristicas, y la eliminacion completa de los *position embeddings*, lo que permite procesar imagenes de cualquier resolucion sin reentrenamiento. Ademas, ofrece una variante opcional de atencion lineal que reduce la complejidad de O(n²) a O(n).

El modelo fue entrenado en ImageNet-1k, que contiene aproximadamente 1,28 millones de imagenes y 1000 clases. No se ha publicado informacion sobre el numero exacto de epocas, el optimizador utilizado ni si se aplicaron tecnicas de regularizacion adicionales. Al ser un modelo de vision, no se aplicaron tecnicas como RLHF o DPO. La conversion a Keras 3 mantiene los pesos originales de PyTorch, garantizando resultados identicos.

## Capacidades

- Clasificacion de imagenes: devuelve logits de clase a traves de `PvtV2ImageClassify`.
- Extraccion de caracteristicas multiescala: `PvtV2Model` con `as_backbone=True` genera una piramide de caracteristicas de cuatro etapas, util para tareas densas.
- Soporte multi-backend: la implementacion Keras 3 funciona sin cambios en TensorFlow, PyTorch y JAX.
- Resolucion de entrada flexible: al no usar *position embeddings*, acepta imagenes de cualquier dimension.
- Normalizacion integrada: el grafo incluye la normalizacion, por lo que se pueden pasar pixeles crudos en rango [0, 255].
- Compatibilidad con pesos originales: se pueden cargar directamente los checkpoints de `OpenGVLab/pvt_v2_b3` mediante `from_weights("hf:OpenGVLab/pvt_v2_b3")`.

## Casos de uso

- Clasificacion de imagenes en produccion: `PvtV2ImageClassify` permite clasificar imagenes en tiempo real con un coste computacional moderado, adecuado para aplicaciones de moderacion de contenido o etiquetado automatico.
- Backbone para deteccion de objetos: las caracteristicas piramidales de `PvtV2Model` pueden alimentar detectores como Faster R-CNN o RetinaNet, aprovechando la informacion multiescala para localizar objetos de distintos tamanos.
- Segmentacion semantica: los mapas de caracteristicas de las cuatro etapas son adecuados como encoder en arquitecturas tipo U-Net o DeepLab, mejorando la precision en bordes y regiones pequenas.
- Extraccion de embeddings para busqueda visual: las caracteristicas de la ultima etapa pueden usarse como descriptor global para sistemas de recuperacion de imagenes por similitud.
- Fine-tuning en dominios especificos: con 45 millones de parametros, el modelo se puede ajustar en datasets propios (medico, industrial, agricola) con recursos limitados, manteniendo un rendimiento competitivo.
- Prototipado rapido con Keras: al ser una implementacion Keras 3, se integra directamente en pipelines existentes de TensorFlow o JAX, reduciendo el tiempo de desarrollo en entornos que ya usan estas herramientas.

## Benchmarks y rendimiento

La informacion disponible incluye los resultados de top-1 en ImageNet-1k para las distintas variantes de PVTv2, publicados en la model card:

| Variante | Parametros | ImageNet-1k top-1 |
|---|---|---|
| pvt-v2-b0 | ~3,4 M | 70,5 % |
| pvt-v2-b1 | ~13,2 M | 78,7 % |
| pvt-v2-b2 | ~25,1 M | 82,0 % |
| pvt-v2-b2-linear | ~25,1 M | 82,1 % |
| pvt-v2-b3 | ~45,2 M | 83,1 % |
| pvt-v2-b4 | ~60,3 M | 83,6 % |
| pvt-v2-b5 | ~81,9 M | 83,8 % |

No se han publicado resultados de benchmarks comparativos con otros modelos (como ResNet o ViT) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 45,2 millones de parametros, en FP32 ocupa aproximadamente 180 MB, y en FP16 unos 90 MB. La VRAM total necesaria, incluyendo activaciones, es inferior a 1 GB para una resolucion de 224x224.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Tambien puede ejecutarse en CPU para inferencia por lotes pequenos.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual, incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser Keras 3, se puede servir con TensorFlow Serving, o exportar a TensorFlow Lite para dispositivos moviles. Tambien es posible convertirlo a ONNX para usar con otros runtime.
- Latencia y throughput: no se han publicado datos especificos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

Dentro de la familia PVTv2, el modelo b3 se situa en un punto intermedio entre eficiencia y rendimiento. La siguiente tabla compara las variantes disponibles:

| Modelo | Parametros | ImageNet-1k top-1 | Licencia |
|---|---|---|---|
| pvt-v2-b2 | ~25,1 M | 82,0 % | Apache 2.0 |
| pvt-v2-b3 | ~45,2 M | 83,1 % | Apache 2.0 |
| pvt-v2-b4 | ~60,3 M | 83,6 % | Apache 2.0 |

No se dispone de datos comparativos con modelos de otras familias (ResNet, EfficientNet, ViT) en la informacion proporcionada. Para una comparativa exhaustiva, se recomienda consultar el articulo original o los benchmarks publicos de ImageNet.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse en ImageNet-1k, el modelo puede heredar sesgos presentes en ese dataset, como sobrerrepresentacion de ciertas categorias o regiones geograficas.
- Riesgo de alucinacion: no aplica directamente, al ser un modelo de vision sin generacion de texto, pero las predicciones pueden ser incorrectas en imagenes fuera de la distribucion de entrenamiento.
- Limitaciones de contexto: no tiene ventana de contexto textual; su entrada son imagenes, y la resolucion maxima depende de la memoria disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Caveat para produccion: la normalizacion esta integrada en el grafo, por lo que no se debe aplicar una normalizacion adicional en el preprocesado. Ademas, es necesario configurar `KERAS_BACKEND` antes de importar Keras o zeromodels.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/pvt-v2-b3
- Modelo original (OpenGVLab): https://huggingface.co/OpenGVLab/pvt_v2_b3
- Articulo arXiv: https://arxiv.org/abs/2106.13797
- Repositorio oficial de PVT: https://github.com/whai362/PVT
- Repositorio de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de PVTv2 en ZeroModels: https://imvision12.github.io/ZeroModels/pvt_v2/
