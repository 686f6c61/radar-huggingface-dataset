# wesjos/vggface2-mobilenetv4-31attr-224

## Resumen

HoneyDog es un modelo de clasificación de imágenes especializado en atributos faciales, desarrollado por el usuario wesjos y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un checkpoint de PyTorch basado en el backbone MobileNetV4-Conv-Medium (9,11 millones de parámetros), inicializado con pesos de ImageNet-1K y afinado de extremo a extremo sobre el conjunto completo VGGFace2, que comprende 3.057.398 imágenes de 8.414 identidades.

El modelo resuelve una tarea de predicción multi-atributo en una sola pasada forward: devuelve tres grupos softmax mutuamente excluyentes (edad, raza y forma de la cara, con cuatro clases cada uno) más 22 atributos binarios con activación sigmoide. En total, 25 cabezas de salida sobre una única red compacta, lo que lo hace adecuado para escenarios de análisis de datos faciales a gran escala donde el coste computacional por imagen es un factor crítico.

Su relevancia actual radica en la combinación de un backbone de última generación para entornos móviles (MobileNetV4, paper arXiv:2404.10518) con un conjunto de anotaciones masivo (MAAD-Face sobre VGGFace2), logrando un 95,45 % de balanced accuracy macro y un 94,01 % de F1 macro en un split de test congelado de 25.401 imágenes. No es un modelo de `transformers`, sino un checkpoint plano cargado mediante el script `inference.py` incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-Medium (`mobilenetv4_conv_medium`, timm) |
| Parametros totales | 9.108.850 (medidos sobre el checkpoint liberado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en FP32; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`, 70,4 MiB / 73.801.483 bytes, pesos EMA) |

## Arquitectura y entrenamiento

El modelo emplea una CNN MobileNetV4-Conv-Medium como extractor de características, con 9.108.850 parámetros nominales. La entrada es una imagen RGB redimensionada a 224x224 con interpolación BICUBIC y normalización ImageNet (media y desviación estándar estándar). Sobre el backbone se montan 25 cabezas de salida: tres cabezas softmax de cuatro clases cada una (edad, raza, forma de la cara) y 22 cabezas binarias con activación sigmoide y umbral 0,5.

El entrenamiento parte de pesos preentrenados en ImageNet-1K y se afina de extremo a extremo sobre el conjunto completo VGGFace2 (3.057.398 imágenes, 8.414 identidades), utilizando anotaciones de atributos de MAAD-Face. El mejor epoch fue el 7 dentro de una ejecución de 12 epochs sobre el conjunto completo. El checkpoint liberado contiene los pesos EMA (medias móviles exponenciales) en la clave `ema`. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo por otra parte esperable en un modelo discriminativo de visión.

## Capacidades

- Clasificación de atributos faciales en una sola pasada forward: tres grupos softmax (edad, raza, forma de la cara) más 22 atributos binarios.
- Predicción de edad en cuatro clases: `Young`, `Middle_Aged`, `Senior`, `OTHER`.
- Predicción de raza en cuatro clases: `Asian`, `White`, `Black`, `OTHER`.
- Predicción de forma de la cara en cuatro clases: `Oval_Face`, `Square_Face`, `Round_Face`, `OTHER`.
- 22 atributos binarios: `Beard`, `Eyeglasses`, `Obstructed_Forehead`, `Arched_Eyebrows`, `Male`, `Rosy_Cheeks`, `Wavy_Hair`, `Receding_Hairline`, `Bangs`, `Double_Chin`, `High_Cheekbones`, `Chubby`, `Brown_Eyes`, `Bags_Under_Eyes`, `Mouth_Closed`, `Smiling`, `Big_Nose`, `Heavy_Makeup`, `Wearing_Hat`, `Wearing_Earrings`, `Wearing_Necktie`, `Wearing_Lipstick`.
- Salida con confianza por clase y vector de probabilidad completo para los grupos softmax; confianza por atributo para las binarias.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un clasificador de imagen, no un modelo generativo).
- No realiza detección, alineación ni reconocimiento de identidad: es un clasificador de un solo rostro por imagen.

## Casos de uso

- Análisis de datasets faciales a gran escala: el modelo permite etiquetar automáticamente millones de imágenes con 25 atributos en una sola pasada, lo que resulta idóneo para auditar sesgos demográficos en conjuntos de datos de reconocimiento facial antes de entrenar otros sistemas.
- Moderación de contenido y filtrado por atributos: dado su bajo coste (9,11 M de parámetros), puede integrarse en pipelines de preprocesado para filtrar imágenes por presencia de gafas, sombrero, barba o sonrisa antes de tareas posteriores más costosas.
- Indexación y búsqueda semántica de archivos fotográficos: los 22 atributos binarios y los tres grupos categóricos permiten construir metadatos consultables para bibliotecas de imágenes, archivos periodísticos o colecciones de investigación.
- Investigación en demografía visual: los grupos de edad y raza, pese a sus limitaciones, permiten estudios agregados sobre representación demográfica en medios o repositorios de imágenes.
- Preprocesado para sistemas de reconocimiento facial: la predicción de pose, oclusión (`Obstructed_Forehead`, `Wearing_Hat`) y atributos de calidad puede usarse para descartar imágenes no aptas antes de un pipeline de verificación de identidad.
- Análisis de tendencias estéticas o de moda: la detección de `Heavy_Makeup`, `Wearing_Lipstick`, `Wearing_Earrings` o `Wearing_Necktie` permite estudios de caracterización visual en series temporales de imágenes.
- Prototipado en dispositivos de borde: al ser un MobileNetV4-Medium, cabe en CPU y GPUs de consumo, lo que facilita demos y pruebas de concepto en entornos con recursos limitados.

## Benchmarks y rendimiento

Evaluación sobre un split de test retenido y completamente congelado de 25.401 imágenes (nunca vistas durante el entrenamiento), según `metrics.json` del repositorio:

| Metrica | Valor |
|---|---:|
| Balanced accuracy macro | 95,45 % |
| F1 macro | 94,01 % |
| Atributo mas debil (balanced accuracy) | 89,44 % (`age`) |
| Atributos por debajo del 60 % balanced accuracy | 0 |
| Atributos por debajo del 80 % balanced accuracy | 0 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint de 70,4 MiB; el modelo completo con activaciones en 224x224 requiere muy poca memoria adicional.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo está pensado para eficiencia, por lo que una NVIDIA T4, RTX 3060 o superior es más que suficiente. En A100 o H100 el cuello de botella será el preprocesado de imágenes, no la red.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el repositorio proporciona `inference.py` autocontenido con `load()` y `predict()`, más un modo CLI (`python inference.py face_example.jpg`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión de este tipo). Es posible exportarlo a TorchScript u ONNX, aunque no se proporcionan scripts para ello.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoneyDog (este modelo) | 9,11 M | 25 atributos faciales (3 grupos + 22 binarios) | 224x224 RGB | Apache 2.0 | Hugging Face (wesjos) |
| MobileNetV4-Conv-Medium (ImageNet-1K) | 9,11 M | Clasificacion ImageNet (1.000 clases) | 224x224 RGB | Apache 2.0 (timm) | timm / Hugging Face |
| Modelos de atributos faciales basados en ResNet-50 sobre CelebA | ~25 M | 40 atributos binarios | 224x224 RGB | variable | Multiples en Hugging Face |

La comparación con alternativas específicas de atributos faciales no está disponible en la información proporcionada. Frente al backbone base de ImageNet-1K, la diferencia es la especialización: este modelo sustituye las 1.000 clases genéricas por 25 cabezas específicas de rostro. Frente a alternativas tipo ResNet-50 sobre CelebA, ofrece menor tamaño (9,11 M frente a ~25 M) y una combinación de grupos softmax y atributos binarios, aunque con un conjunto de atributos distinto y sin datos comparativos directos publicados.

## Limitaciones y advertencias

- Las etiquetas de atributos provienen de la anotación del dataset (imágenes VGGFace2 con anotaciones MAAD-Face); son gruesas, parcialmente ruidosas, y la clase `OTHER` absorbe cualquier categoría fuera de las tres nombradas.
- VGGFace2 está sesgado hacia celebridades, por lo que las predicciones de edad, raza y forma de la cara heredan ese sesgo demográfico y de dominio.
- La precisión cae en rostros ocluidos, de muy baja resolución o fuertemente rotados; el modelo se entrenó sobre recortes de 224x224.
- Es un clasificador de un solo rostro y una sola imagen: no realiza detección, alineación ni reconocimiento de identidad.
- Los atributos demográficos son sensibles: deben tratarse como estimaciones ruidosas para investigación o analítica de datasets, nunca como base para decisiones sobre personas individuales.
- La licencia Apache 2.0 del modelo no exime de cumplir las licencias de los datasets subyacentes (VGGFace2 y MAAD-Face), que el autor indica expresamente que deben respetarse.
- El modelo solo declara soporte de inglés en sus etiquetas; no hay evaluación multilingüe ni de robustez cross-domain documentada.
- No se documentan cuantizaciones ni formatos alternativos (GGUF, ONNX), lo que limita el despliegue en algunos runtimes de producción sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/vggface2-mobilenetv4-31attr-224
- Paper MobileNetV4: https://arxiv.org/abs/2404.10518
- Paper VGGFace2 (Cao et al., 2018): https://arxiv.org/abs/1710.08092
- Paper MAAD-Face (Terhorst et al., 2021): https://arxiv.org/abs/2105.01480
- Repositorio timm (backbone `mobilenetv4_conv_medium`): https://github.com/huggingface/pytorch-image-models
