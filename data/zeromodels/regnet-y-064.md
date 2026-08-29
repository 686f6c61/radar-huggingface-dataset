# zeromodels/regnet-y-064

## Resumen

El modelo `zeromodels/regnet-y-064` es una conversión pura en Keras 3 del checkpoint original `facebook/regnet-y-064`, desarrollado por el equipo de ZeroModels. RegNet es una familia de redes convolucionales (ConvNets) propuesta en el artículo "Designing Network Design Spaces" (arXiv:2003.13678), donde los anchos y profundidades de cada etapa siguen una regla lineal cuantizada simple, en lugar de depender de búsqueda de arquitectura manual. La variante Y incorpora bloques Squeeze-and-Excitation (SE), lo que mejora la representación de canales.

Este modelo concreto, RegNet-Y-064, tiene aproximadamente 64 millones de parámetros (según la nomenclatura del nombre, aunque no se confirma en la documentación) y fue entrenado en ImageNet-1k para clasificación de imágenes. La conversión de ZeroModels permite ejecutar el mismo checkpoint de forma idéntica en tres backends de Keras 3: TensorFlow, PyTorch y JAX, lo que facilita su integración en entornos heterogéneos. Además, puede usarse como clasificador de imágenes o como backbone de extracción de características multi-escala (strides 4, 8, 16 y 32), lo que lo hace relevante para tareas de visión por computador como detección de objetos, segmentación o transferencia de aprendizaje.

La relevancia actual de este modelo radica en su eficiencia: a pesar de ser una arquitectura de 2020, sigue siendo competitiva en entornos con recursos limitados, y la conversión a Keras 3 amplía su portabilidad a ecosistemas modernos de deep learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNet-Y (ConvNet con bloques residuales 1x1 -> 3x3 grouped -> SE -> 1x1, 4 etapas) |
| Parametros totales | Aproximadamente 64 millones (según nomenclatura, no confirmado en la documentación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa secuencias) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se carga mediante `from_weights` de zeromodels; probablemente formato Keras nativo) |

## Arquitectura y entrenamiento

RegNet-Y-064 sigue la arquitectura RegNet-Y: un stem de convolución 3x3 con stride 2, seguido de cuatro etapas de bloques residuales compuestos por una convolución 1x1, una convolución 3x3 agrupada (grouped), un bloque Squeeze-and-Excitation (SE) y una convolución 1x1 final. La variante Y se distingue de la X por la inclusión de SE, que recalibra los canales de forma adaptativa. El modelo fue entrenado en ImageNet-1k, un conjunto de datos de clasificación de imágenes con 1.000 clases, mediante entrenamiento supervisado estándar. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo generativo.

La conversión de ZeroModels mantiene los pesos originales de `facebook/regnet-y-064` y los reimplementa en Keras 3, permitiendo que la misma arquitectura se ejecute sin modificaciones en TensorFlow, PyTorch o JAX. La normalización de imágenes está integrada en el modelo (`include_normalization=True`), por lo que acepta píxeles en el rango [0, 255] directamente. También soporta tanto el formato de canales `channels_last` como `channels_first`, con resultados bit-exactos entre ambos.

## Capacidades

- Clasificación de imágenes: devuelve logits de clase para las 1.000 categorías de ImageNet-1k.
- Extracción de características multi-escala: como backbone (`RegNetModel` con `as_backbone=True`), produce mapas de características en cuatro resoluciones (strides 4, 8, 16 y 32), útiles para detección y segmentación.
- Portabilidad entre backends: funciona sin cambios en TensorFlow, PyTorch y JAX mediante Keras 3.
- Normalización integrada: acepta píxeles sin preprocesar (rango 0-255), simplificando el pipeline de inferencia.
- Soporte de canales primero y último: permite adaptarse a diferentes frameworks y formatos de datos.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto, al ser un modelo puramente visual.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede servir como clasificador de imágenes de propósito general, por ejemplo en sistemas de moderación de contenido, identificación de objetos o análisis de imágenes médicas (con fine-tuning). Su tamaño moderado (64M) permite inferencia en tiempo real en GPUs consumer.
- Backbone para detección de objetos: al extraer características en cuatro escalas, puede integrarse en arquitecturas como Faster R-CNN o YOLO como extractor de características, aprovechando su eficiencia computacional.
- Segmentación semántica: los mapas de características multi-escala son adecuados para decodificadores de segmentación (por ejemplo, U-Net o DeepLab), permitiendo segmentar imágenes con precisión en entornos con recursos limitados.
- Transferencia de aprendizaje: sus pesos preentrenados en ImageNet-1k sirven como punto de partida para fine-tuning en dominios específicos (detección de defectos industriales, clasificación de cultivos, etc.), reduciendo el tiempo de entrenamiento y los datos necesarios.
- Sistemas de visión embebidos: al ser una CNN compacta, puede desplegarse en dispositivos con poca memoria (Raspberry Pi, Jetson Nano) mediante conversión a TensorFlow Lite o TorchScript, manteniendo un rendimiento razonable.
- Investigación en arquitecturas eficientes: sirve como referencia para comparar el rendimiento de ConvNets frente a transformers de visión, especialmente en escenarios de baja latencia o consumo energético reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo hereda los pesos de `facebook/regnet-y-064`, cuyo rendimiento en ImageNet-1k se documenta en el artículo original, pero no se proporcionan métricas concretas (top-1, top-5) en la model card de ZeroModels ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 64M de parámetros, en FP32 los pesos ocupan unos 256 MB. Con activaciones y overhead, la inferencia requiere menos de 1 GB de VRAM, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, GTX 1060 6GB, RTX 2060, RTX 3060, etc.).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lote pequeño. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB (RTX 3070, RTX 4080, A100, etc.).
- Opciones de despliegue: al ser Keras 3, puede ejecutarse con TensorFlow Serving, TorchServe, o mediante exportación a TensorFlow Lite o TorchScript para entornos embebidos. También es compatible con JAX para aceleración en TPU.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser una CNN de 64M, la inferencia en una GPU moderna (RTX 3090) suele estar en el rango de 1-5 ms por imagen a resolución 224x224, dependiendo del backend y la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RegNet-Y-064 (este) | ~64M | ConvNet con SE | No aplica | Apache-2.0 | HuggingFace, Keras 3 |
| RegNet-X-064 | ~64M | ConvNet sin SE | No aplica | Apache-2.0 | HuggingFace, Keras 3 |
| ResNet-50 | ~25M | ConvNet residual | No aplica | Apache-2.0 (variantes) | Ampliamente disponible |
| EfficientNet-B4 | ~19M | ConvNet con MBConv | No aplica | Apache-2.0 | Ampliamente disponible |

La comparativa se basa en arquitecturas similares de la misma época. RegNet-Y-064 ofrece un mejor equilibrio entre precisión y coste computacional que ResNet-50, aunque no se dispone de métricas exactas en la información proporcionada. La ventaja principal de esta conversión es la portabilidad entre backends, algo que no ofrecen las implementaciones nativas de torchvision o TensorFlow.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en ImageNet-1k, el modelo puede presentar sesgos hacia las categorías y estilos de imagen de ese conjunto de datos, lo que puede afectar a su rendimiento en dominios muy diferentes (por ejemplo, imágenes médicas o satelitales).
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de visión.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Caveat para producción: la conversión a Keras 3 es reciente (creada en agosto de 2026) y el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción. Se recomienda validar el modelo en el entorno objetivo antes de desplegarlo.
- Dependencia de la librería `zeromodels`: para cargar los pesos es necesario instalar la librería ZeroModels, que puede no estar disponible en todos los entornos o tener dependencias específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/regnet-y-064
- Modelo original de Facebook: https://huggingface.co/facebook/regnet-y-064
- Paper "Designing Network Design Spaces": https://arxiv.org/abs/2003.13678
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentación de RegNet en ZeroModels: https://imvision12.github.io/ZeroModels/regnet/
- Colección de variantes RegNet en HuggingFace: https://huggingface.co/collections/zeromodels/regnet-6a9270a4e723a861ea988d0b
- Documentación de Torchvision sobre RegNet: https://docs.pytorch.org/vision/main/models/regnet.html
