# v0l/route96-nsfw-vit224

## Resumen

route96-nsfw-vit224 es un clasificador de imágenes binario especializado en la detección de contenido para adultos (NSFW), desarrollado por el usuario v0l para su uso en el servidor de medios route96. Se trata de un fine-tune del modelo Falconsai/nsfw_image_detection, que a su vez es un Vision Transformer ViT-B/16 que opera a resolución de 224x224 píxeles. El modelo clasifica cada imagen en una de dos etiquetas: `normal` o `nsfw`.

El problema que resuelve es el filtrado automático de contenido explícito en plataformas de compartición de imágenes, con un enfoque particular en reducir los falsos positivos sobre capturas de pantalla, documentos, memes y arte no explícito, que el autor incluyó explícitamente como *hard negatives* durante el entrenamiento. Esto lo diferencia de clasificadores más permisivos que tienden a marcar en exceso contenido ambiguo.

Con 85,8 millones de parámetros y un tamaño de repositorio de 0,7 GB, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en que, según la evaluación publicada por el autor, supera en F1 a alternativas establecidas como el modelo base Falconsai y a otros detectores populares, manteniendo una licencia Apache 2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16), 224x224 px |
| Parametros totales | 85.800.194 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de ViT vía transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | no aplica (clasificación visual; sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer ViT-B/16, es decir, un transformer de 12 capas con parches de 16x16 píxeles sobre imágenes de 224x224, adaptado a clasificación binaria mediante una cabeza de clasificación de dos clases (`normal`, `nsfw`). Parte de los pesos de Falconsai/nsfw_image_detection, que ya era un ViT-B/16 afinado para la misma tarea.

El entrenamiento se realizó sobre aproximadamente 12.700 imágenes procedentes de nostr.download, etiquetadas inicialmente por un LLM de visión (Qwen 3.5) y corregidas manualmente. Los positivos incluyen imágenes con etiquetas explícitas (desnudez, genitales, actos sexuales, bondage) más imágenes confirmadas visualmente por el autor. Los negativos incluyen fotos y arte ordinarios, además de capturas de pantalla, interfaces, documentos y memes como *hard negatives*. Las imágenes con etiquetas meramente sugerentes (lencería, ropa interior, bikini) se excluyeron del conjunto, dejando indefinida la frontera para esos casos. Cualquier negativo puntuado con 0,5 o más por este modelo, por Falconsai o por nostrbuild fue revisado manualmente y reetiquetado si era explícito.

La configuración de entrenamiento fue de 5 épocas con AdamW, learning rate 2e-5, muestreo balanceado por clase, precisión bf16 y resolución 224 px. Se publicaron los pesos de la época 4. No se documentan técnicas como RLHF, DPO ni decodificación especulativa, al no ser aplicables a un clasificador de imágenes.

## Capacidades

- Clasificación binaria de imágenes en `normal` o `nsfw`.
- Detección de contenido explícito: desnudez, genitales, actos sexuales y bondage.
- Discriminación reforzada frente a *hard negatives*: capturas de pantalla, interfaces de usuario, documentos y memes.
- Salida de probabilidad por clase, lo que permite ajustar el umbral de decisión según la política de moderación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo *thinking*, visión generativa ni audio.

## Casos de uso

- Moderación automática en servidores de medios: integrado en el pipeline de subida de route96 u otras plataformas para rechazar o marcar imágenes explícitas antes de publicarlas, con umbral ajustable según la tolerancia del servicio.
- Filtrado previo en CDNs y almacenamiento de imágenes: clasificación por lotes de imágenes ya almacenadas para etiquetar y aislar contenido explícito, aprovechando el bajo coste computacional de un ViT-B/16.
- Protección de comunidades y foros: bloqueo de avatares, adjuntos o galerías con contenido para adultos en plataformas dirigidas a público general o menores.
- Moderación de contenido generado por usuarios en apps móviles: el tamaño reducido (85,8 M de parámetros) permite despliegue en servidores modestos o incluso en el borde con cuantización.
- Detección de *hard negatives* en pipelines existentes: sustituir o complementar clasificadores que generan demasiados falsos positivos sobre capturas de pantalla y documentos, un problema habitual en moderación.
- Investigación sobre sesgos y calibración de clasificadores NSFW: su licencia Apache 2.0 y sus scripts de entrenamiento y evaluación públicos facilitan reproducir y auditar el comportamiento del modelo.
- Enrutado de contenido en agregadores tipo nostr: clasificar imágenes de redes descentralizadas antes de mostrarlas en clientes con filtros configurables por el usuario.

## Benchmarks y rendimiento

Resultados publicados por el autor. Umbral por defecto de 0,5. AP = average precision (independiente del umbral).

Conjunto retenido de nostr.download (1.908 imágenes, 209 NSFW):

| Modelo | AP | Precision | Recall | F1 | Falsos positivos | Fallos |
|---|---|---|---|---|---|---|
| route96-nsfw-vit224 (este modelo) | 0,984 | 0,917 | 0,957 | 0,937 | 18 | 9 |
| Falconsai/nsfw_image_detection | 0,921 | 0,850 | 0,871 | 0,861 | 32 | 27 |
| nostrbuild/nsfw-image-detection-large | 0,973 | 0,735 | 0,981 | 0,840 | 74 | 4 |
| carbon225/vit-base-patch16-224-hentai | 0,963 | 0,773 | 0,947 | 0,852 | 58 | 11 |
| umairrkhn/fine-tuned-nsfw-classification | 0,913 | 0,958 | 0,756 | 0,845 | 7 | 51 |
| giacomoarienti/nsfw-classifier | 0,865 | 0,791 | 0,871 | 0,829 | 48 | 27 |
| AdamCodd/vit-base-nsfw-detector | 0,922 | 0,690 | 0,957 | 0,802 | 90 | 9 |
| LukeJacob2023/nsfw-image-detector | 0,815 | 0,635 | 0,914 | 0,749 | 110 | 18 |
| Parveshiiii/SafeScan | 0,855 | 0,674 | 0,900 | 0,770 | 91 | 21 |
| JanadaSroor/vit-nsfw-classifier | 0,775 | 0,271 | 0,995 | 0,426 | 559 | 1 |

Mezcla pública (6.592 imágenes, 3.592 NSFW), no vista en entrenamiento:

| Modelo | AP | Precision | Recall | F1 | Falsos positivos | Fallos |
|---|---|---|---|---|---|---|
| route96-nsfw-vit224 (este modelo) | 0,976 | 0,938 | 0,927 | 0,932 | 222 | 261 |
| Falconsai/nsfw_image_detection | 0,972 | 0,922 | 0,905 | 0,913 | 275 | 343 |
| nostrbuild/nsfw-image-detection-large | 0,979 | 0,809 | 0,978 | 0,886 | 827 | 78 |
| carbon225/vit-base-patch16-224-hentai | 0,968 | 0,855 | 0,941 | 0,896 | 573 | 211 |
| umairrkhn/fine-tuned-nsfw-classification | 0,963 | 0,976 | 0,743 | 0,843 | 67 | 924 |
| giacomoarienti/nsfw-classifier | 0,951 | 0,888 | 0,882 | 0,885 | 398 | 423 |
| AdamCodd/vit-base-nsfw-detector | 0,952 | 0,834 | 0,954 | 0,890 | 681 | 165 |
| LukeJacob2023/nsfw-image-detector | 0,890 | 0,827 | 0,923 | 0,872 | 694 | 278 |
| Parveshiiii/SafeScan | 0,940 | 0,829 | 0,946 | 0,884 | 700 | 193 |
| JanadaSroor/vit-nsfw-classifier | 0,869 | 0,652 | 0,995 | 0,788 | 1909 | 19 |

El autor advierte que los conjuntos de la mezcla pública definen NSFW de forma distinta a los datos de entrenamiento, por lo que esa tabla debe interpretarse con cautela. También señala que nostrbuild/nsfw-image-detection-large obtiene la mejor AP en la mezcla pública y detecta más contenido NSFW, pero requiere un umbral cercano a 0,95 para evitar marcar imágenes seguras, y su licencia es CC BY-NC-SA 4.0 (no comercial).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (85,8 M de parámetros); en torno a 0,3-0,5 GB en fp16/bf16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También funciona en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU dedicadas modernas e incluso en iGPU y en CPU.
- Opciones de despliegue: transformers con pipeline `image-classification`, exportación a ONNX Runtime, TorchScript o TensorRT para mayor throughput; no aplica vLLM, llama.cpp ni Ollama (no es un modelo generativo).
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera procesamiento por lotes en milisegundos por imagen en GPU moderna, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | F1 (ret.) | F1 (mix púb.) | Licencia |
|---|---|---|---|---|---|---|
| route96-nsfw-vit224 | 85,8 M | ViT-B/16 | no aplica | 0,937 | 0,932 | Apache 2.0 |
| Falconsai/nsfw_image_detection | no disponible | ViT-B/16 | no aplica | 0,861 | 0,913 | Apache 2.0 |
| nostrbuild/nsfw-image-detection-large | no disponible | FocalNet | no aplica | 0,840 | 0,886 | CC BY-NC-SA 4.0 |
| carbon225/vit-base-patch16-224-hentai | no disponible | ViT-B/16 | no aplica | 0,852 | 0,896 | no disponible |

## Limitaciones y advertencias

- La frontera para contenido sugerente (lencería, ropa interior, bikini) es indefinida: esas imágenes se excluyeron del entrenamiento, por lo que el modelo puede clasificarlas de forma inconsistente.
- El conjunto de entrenamiento es reducido (unas 12.700 imágenes) y procede de una única fuente (nostr.download), lo que puede introducir sesgos hacia ese tipo de contenido y reducir la generalización a otros dominios.
- Riesgo de falsos positivos y negativos: en la mezcla pública registra 222 falsos positivos y 261 fallos, con un umbral de 0,5; el umbral debe calibrarse según la política de cada servicio.
- El etiquetado inicial lo realizó un LLM de visión (Qwen 3.5) con corrección manual parcial, por lo que pueden persistir errores de etiqueta.
- No detecta ni clasifica categorías específicas (desnudez, violencia, drogas): solo distingue `normal` frente a `nsfw`.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al evaluado.
- Modelo pequeño y sin contexto textual: no debe usarse como única capa de moderación en entornos de alto riesgo; se recomienda combinarlo con revisión humana o con clasificadores complementarios.
- El contenido citado de la model card es material de referencia del autor; no debe interpretarse como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/v0l/route96-nsfw-vit224
- Modelo base: https://huggingface.co/Falconsai/nsfw_image_detection
- Scripts de entrenamiento y evaluación: https://github.com/v0l/route96/tree/main/training
- Modelo comparado nostrbuild/nsfw-image-detection-large: https://huggingface.co/nostrbuild/nsfw-image-detection-large
- Modelo comparado carbon225/vit-base-patch16-224-hentai: https://huggingface.co/carbon225/vit-base-patch16-224-hentai
- Modelo comparado AdamCodd/vit-base-nsfw-detector: https://huggingface.co/AdamCodd/vit-base-nsfw-detector
