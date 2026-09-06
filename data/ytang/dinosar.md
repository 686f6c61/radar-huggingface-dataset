# YTang/DINOSAR

## Resumen

DINOSAR es un conjunto de encoders de imagen SAR (radar de apertura sintética) preentrenados mediante aprendizaje autosupervisado a gran escala. Ha sido desarrollado por YTang y se publica bajo el identificador `YTang/DINOSAR` en HuggingFace. El modelo aborda el problema de la extracción de características en imágenes de teledetección SAR, que presentan propiedades distintas a las imágenes ópticas, y permite inicializar tareas downstream sin necesidad de grandes volúmenes de datos etiquetados. La relevancia actual radica en la escasez de datasets anotados para SAR y en la utilidad de representaciones preentrenadas para clasificación, detección y segmentación.

La arquitectura se basa en Vision Transformers (ViT) con dos variantes: ViT-S/16 y ViT-B/16, ambas con patch size 16, un canal de entrada y cuatro register tokens. Los pesos se distribuyen en formato PyTorch state dict (`.pth`) y ocupan un repositorio de 0.4 GB. No se especifica la longitud de contexto, ya que se trata de un modelo de visión, no de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/16 y ViT-B/16 (Vision Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; no aplica a un modelo de vision) |
| Licencia | no disponible (pendiente de revision de procedencia; no se afirma licencia MIT) |
| Formato de pesos | PyTorch state dict (.pth) |

## Arquitectura y entrenamiento

Los modelos DINOSAR son Vision Transformers con patch size 16 y una sola canal de entrada. Incluyen cuatro register tokens, un componente que se ha mostrado util para reducir artefactos en las representaciones de ViT. Se ofrecen dos tamanos: ViT-S/16, con dimension de CLS de 384, y ViT-B/16, con dimension de CLS de 768. Ambos se preentrenaron sobre el dataset UniSAR-7M, compuesto por 7.047.666 imagenes SAR, durante 60 epocas. El metodo de preentrenamiento emplea CAMC (Content-Aware View Construction), una estrategia de construccion de vistas conscientes del contenido para aprendizaje autosupervisado.

Los checkpoints publicados contienen exclusivamente el backbone del teacher, sin cabezas de proyeccion ni estados del optimizador. Esto los hace adecuados para extraccion de caracteristicas e inicializacion de tareas posteriores, pero no para reanudar el entrenamiento de forma exacta. Los tamanos de batch efectivos fueron 1280 para ViT-S y 1536 para ViT-B, lo que explica los distintos numeros de pasos de entrenamiento (330360 y 275340, respectivamente). No se menciona ningun proceso de RLHF o DPO, al tratarse de un modelo de vision.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de imagenes SAR, devolviendo tanto el token CLS normalizado (`x_norm_clstoken`) como los tokens de parches normalizados (`x_norm_patchtokens`).
- Inicializacion de modelos para tareas downstream de vision por computador aplicadas a SAR.
- Soporte de preprocesamiento especifico para clasificacion: imagenes en escala de grises, redimensionado preservando la relacion de aspecto y relleno con ceros hasta 224x224, conversion a tensor en [0, 1] y normalizacion con media 0.219 y desviacion estandar 0.220.
- No es un modelo generativo de texto, por lo que no soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades de vision en el sentido de un modelo vision-language; es exclusivamente un encoder de imagenes SAR.
- Las capacidades multilingues no aplican, aunque los metadatos del repositorio indican `language: en` en la model card.

## Casos de uso

- Clasificacion de cobertura terrestre en imagenes SAR: se puede utilizar el encoder para extraer caracteristicas de una imagen y entrenar un clasificador lineal o un MLP sobre el token CLS. Es adecuado porque el preentrenamiento autosupervisado proporciona representaciones robustas sin necesidad de etiquetas.
- Deteccion de cambios en la superficie terrestre: comparar los embeddings de dos imagenes SAR de la misma zona adquiridas en fechas distintas permite identificar areas alteradas. La capacidad de generar tokens de parches facilita el analisis a nivel de region.
- Deteccion de objetos en imagenes SAR (barcos, vehiculos, infraestructuras): emplear el backbone DINOSAR como base para modelos de deteccion como Faster R-CNN o DETR. El preentrenamiento en un gran corpus SAR reduce la necesidad de datos anotados.
- Segmentacion semantica de imagenes SAR: usar los tokens de parches como entrada a un decodificador denso (por ejemplo, U-Net o FPN). La representacion por parches se alinea bien con tareas por pixel.
- Inicializacion de modelos en escenarios con pocos datos etiquetados: el preentrenamiento en 7 millones de imagenes permite transferir conocimiento a dominios SAR especificos con conjuntos pequenos de anotaciones.
- Investigacion en aprendizaje autosupervisado para teledeteccion: comparar DINOSAR con otros encoders SAR preentrenados o con modelos de imagenes opticas para estudiar la transferibilidad de representaciones entre dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este upload no constituye una nueva evaluacion de benchmarks y que se necesitan ajustes de preprocesamiento y evaluacion especificos para reproducir los resultados del paper original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio tiene un tamano de 0.4 GB, lo que sugiere que los pesos son relativamente pequenos, pero no se proporcionan datos de consumo de memoria.
- GPU recomendadas: no disponibles en la informacion.
- Capacidad para ejecutarse en GPUs de consumo: probablemente si, dado el tamano del repositorio, pero no se confirma.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo requiere el paquete Python DINOSAR del repositorio fuente y PyTorch para cargar los pesos. La inferencia se puede realizar en GPU o CPU usando el codigo proporcionado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Por tanto, esta seccion se indica como no disponible.

## Limitaciones y advertencias

- La licencia de los pesos no esta resuelta. La model card indica que no se afirma ninguna licencia MIT y que la declaracion de licencia esta pendiente de revision de procedencia. El uso comercial es incierto.
- Los checkpoints contienen solo el backbone del teacher, sin cabezas de proyeccion ni estados del optimizador. No se puede reanudar el entrenamiento de forma exacta.
- No se ha realizado una evaluacion de benchmarks en este repositorio. Para reproducir los resultados del paper se requieren configuraciones de preprocesamiento y evaluacion especificas.
- La convencion de entrada es estricta: un canal, patch size 16, redimensionado y relleno a 224x224, normalizacion con media 0.219 y desviacion 0.220. No se deben usar valores SAR complejos sin el preprocesamiento adecuado.
- No se mencionan sesgos conocidos, pero al estar entrenado en el dataset UniSAR-7M, el modelo puede presentar limitaciones en regiones o tipos de escenas no representadas en dicho corpus.
- El riesgo de alucinacion no aplica, ya que no es un modelo generativo de texto.
- Las limitaciones de contexto o idioma no aplican al tratarse de un modelo de vision.

## Enlaces

- HuggingFace: https://huggingface.co/YTang/DINOSAR
- Repositorio de codigo fuente: mencionado en la model card como `DINOSAR_official/DINOSAR`, pero no se proporciona URL. Enlace no disponible.
