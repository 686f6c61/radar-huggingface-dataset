# zeromodels/regnet-y-320

## Resumen

`zeromodels/regnet-y-320` es una conversión a Keras 3 del modelo `facebook/regnet-y-320`, un clasificador de imágenes basado en la arquitectura RegNet-Y desarrollada por Facebook AI Research. El modelo original, presentado en el artículo "Designing Network Design Spaces" (arXiv:2003.13678), pertenece a la familia RegNet, cuyas anchuras y profundidades por etapa siguen una regla cuantizada-lineal. La variante Y incorpora bloques de Squeeze-and-Excitation (SE) dentro de sus bloques residuales.

Esta versión de `zeromodels` permite ejecutar el mismo checkpoint de forma nativa en tres backends de Keras 3 (JAX, PyTorch y TensorFlow) sin modificar el código, lo que facilita su integración en pipelines existentes. El modelo puede usarse tanto como clasificador de ImageNet-1K como backbone de extracción de características multi-escala. Según fuentes externas, el modelo original tiene 320 millones de parámetros y fue preentrenado con el método auto-supervisado SEER antes de un ajuste fino en ImageNet-1K. El repositorio ocupa 0,6 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNet-Y (ConvNet con bloques residuales y Squeeze-and-Excitation) |
| Parametros totales | 320 millones (segun fuentes externas; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repositorio de 0,6 GB; el modelo original de Facebook usa safetensors) |

## Arquitectura y entrenamiento

La arquitectura RegNet-Y se compone de un stem de convolucion 3x3 con stride 2, seguido de cuatro etapas de bloques residuales con la estructura `1x1 -> 3x3 grouped -> SE -> 1x1`. La variante Y anade el bloque Squeeze-and-Excitation, que recalibra los canales de forma adaptativa. El diseno de la red sigue una regla cuantizada-lineal para determinar la anchura y profundidad de cada etapa, lo que permite explorar sistematicamente el espacio de diseno de redes convolucionales.

El checkpoint original de Facebook fue preentrenado con el metodo auto-supervisado SEER (Self-supervised) y posteriormente ajustado en ImageNet-1K, segun informacion de fuentes externas. La conversion de `zeromodels` no modifica los pesos, sino que los transpila a un formato compatible con Keras 3, manteniendo la normalizacion integrada (los valores de entrada deben estar en el rango [0, 255] sin preprocesado adicional). La implementacion soporta tanto `channels_last` como `channels_first` con resultados identicos bit a bit.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1K.
- Extraccion de caracteristicas multi-escala como backbone, con salidas en strides 4, 8, 16 y 32.
- Ejecucion sin cambios en tres backends de Keras 3: JAX, PyTorch y TensorFlow.
- Normalizacion de entrada integrada en el modelo (no requiere preprocesado externo).
- Soporte de formatos de tensor `channels_last` y `channels_first`.
- Carga de pesos desde el checkpoint original de Hugging Face (`hf:facebook/regnet-y-320`) o desde la version convertida.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede servir como clasificador directo de imagenes en aplicaciones web o moviles, devolviendo logits sobre las clases de ImageNet. Su tamano moderado (320M parametros) permite inferencia en GPU de consumo.
- Extraccion de caracteristicas para transfer learning: usando `RegNetModel` como backbone, se pueden obtener representaciones multi-escala (strides 4, 8, 16, 32) para entrenar cabezales personalizados en tareas como clasificacion fina o recuperacion de imagenes.
- Deteccion de objetos: las caracteristicas de las cuatro etapas pueden alimentar detectores como Faster R-CNN o RetinaNet, aprovechando la jerarquia espacial del backbone.
- Segmentacion semantica: los mapas de caracteristicas multi-escala son adecuados como encoder en arquitecturas tipo U-Net o DeepLab, donde se requiere informacion contextual de distintas resoluciones.
- Busqueda visual por similitud: las embeddings extraidas de la ultima etapa pueden indexarse en bases vectoriales para sistemas de busqueda por contenido visual.
- Moderacion de contenido: el clasificador puede utilizarse para filtrar imagenes en plataformas sociales, detectando categorias problematicas (violencia, contenido explicito, etc.) con un umbral de confianza configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de Facebook reporta metricas en ImageNet-1K, pero no se incluyen en la model card de `zeromodels` ni en los resultados de busqueda web. No se proporcionan datos de exactitud, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 320 millones de parametros, el modelo en FP32 ocupa aproximadamente 1,3 GB y en FP16 unos 0,65 GB, por lo que es viable en GPUs de consumo con 4 GB o mas de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 2060 o superior) o Apple Silicon para inferencia local. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs como RTX 3060, RTX 4060 o similares.
- Opciones de despliegue: al ser una implementacion Keras 3, puede ejecutarse con TensorFlow Serving, TorchServe o JAX, asi como en entornos personalizados. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/regnet-y-320 | 320M | RegNet-Y (ConvNet + SE) | No aplica | Apache-2.0 | Hugging Face |
| facebook/regnet-y-320 | 320M | RegNet-Y (ConvNet + SE) | No aplica | Apache-2.0 | Hugging Face |
| zeromodels/regnet-y-160 | 160M | RegNet-Y (ConvNet + SE) | No aplica | Apache-2.0 | Hugging Face |
| ResNet-50 (referencia) | 25M | ResNet (ConvNet) | No aplica | Varias | Ampliamente disponible |

La diferencia principal entre `zeromodels/regnet-y-320` y `facebook/regnet-y-320` es el formato de pesos y la portabilidad a Keras 3. Frente a RegNet-Y-160, el modelo de 320M ofrece mayor capacidad a costa de mas parametros. ResNet-50 es una alternativa mas ligera pero con menor capacidad de representacion.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado en ImageNet-1K, que contiene sesgos inherentes en la distribucion de clases y puede reflejar estereotipos culturales o geograficos en sus predicciones.
- Riesgo de alucinacion: no aplica, al ser un modelo discriminativo de clasificacion, no genera contenido.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje natural; solo imagenes de entrada.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright.
- Caveat para produccion: al ser una conversion de pesos, se recomienda verificar la equivalencia de resultados con el checkpoint original antes de desplegar en entornos criticos. La normalizacion esta integrada, por lo que no debe aplicarse preprocesado adicional.
- El modelo no incluye soporte para cuantizacion oficial ni optimizaciones de inferencia especificas (como TensorRT), aunque puede cuantizarse con herramientas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/regnet-y-320
- Modelo original de Facebook: https://huggingface.co/facebook/regnet-y-320
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de RegNet en ZeroModels: https://imvision12.github.io/ZeroModels/regnet/
- Coleccion de variantes RegNet: https://huggingface.co/collections/zeromodels/regnet-6a9270a4e723a861ea988d0b
- Paper "Designing Network Design Spaces": https://arxiv.org/abs/2003.13678
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2003.13678
