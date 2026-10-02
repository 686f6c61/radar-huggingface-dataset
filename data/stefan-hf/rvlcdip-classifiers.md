# stefan-hf/rvlcdip-classifiers

## Resumen

RVL-CDIP document classifiers es una colección de siete clasificadores de imágenes de documentos entrenados sobre el corpus RVL-CDIP, que distingue 16 categorías documentales (entre ellas facturas, anuncios, informes científicos y notas manuscritas). El autor, stefan-hf, publica cada arquitectura en cuatro variantes que se diferencian en dos ejes: si las etiquetas de entrenamiento son las originales del corpus o una versión corregida, y si las imágenes conservan o no los códigos de identificación (números Bates) estampados en la mayoría de las páginas.

El interés técnico del release es que aborda de forma explícita el aprendizaje de atajos (shortcut learning): los códigos Bates están correlacionados con la categoría documental y actúan como pista artificial, de modo que las variantes `codes-kept` rinden mejor en el dominio original mientras que las variantes `codes-removed` son más robustas cuando esos códigos no existen. Además, todas las variantes se entrenaron sobre una copia anonimizada del corpus, en la que los datos personales fueron sustituidos por valores sintéticos.

Las siete arquitecturas son AlexNet, GoogLeNet, ResNet-50, ResNeXt-50 (32x4d), SqueezeNet 1.0, VGG-16 y DiT-base (un transformer de visión). Los tamaños de los ficheros de pesos van de 3 MB (SqueezeNet) a 537 MB (VGG-16), y el mejor resultado lo obtiene DiT-base, con un 95,94 % de exactitud sobre las etiquetas corregidas con códigos presentes. El repositorio completo ocupa 5,3 GB y, en el momento de la consulta, acumula 0 descargas y 0 "me gusta".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Siete arquitecturas de clasificación de imagen: AlexNet, GoogLeNet, ResNet-50, ResNeXt-50 (32x4d), SqueezeNet 1.0, VGG-16 y DiT-base (vision transformer) |
| Parámetros totales | No disponible (solo se publican los tamaños de los ficheros de pesos) |
| Longitud de contexto | No aplica: clasificación de imagen con entrada fija de 224 × 224 píxeles en escala de grises |
| Tipos de cuantización | No disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible (clasificación de documentos escaneados; los idiomas de la información disponible no se especifican) |
| Licencia | `other` (no se detalla el texto de la licencia; etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors y PyTorch; las carpetas de DiT-base incluyen además el layout de `transformers` con `config.json` / `rvlcdip_config.json` |
| Número de clases | 16 categorías documentales |
| Variantes por arquitectura | 4 (`labels-original_codes-kept`, `labels-original_codes-removed`, `labels-corrected_codes-kept`, `labels-corrected_codes-removed`) |
| Tamaño de los checkpoints | AlexNet 228 MB; GoogLeNet 23 MB; ResNet-50 94 MB; ResNeXt-50 92 MB; SqueezeNet 1.0 3 MB; VGG-16 537 MB; DiT-base 343 MB |
| Tamaño del repositorio | 5,3 GB |
| Preprocesado | Escala de grises, redimensionado bilineal a 224 × 224, replicación a tres canales y normalización |
| Licencia de uso comercial | No disponible; debe verificarse el texto de la licencia `other` antes de cualquier uso en producción |

## Arquitectura y entrenamiento

El release combina seis CNN de `torchvision` preentrenadas en ImageNet con un transformer de visión, DiT-base, partiendo de `microsoft/dit-base`. Las CNN se entrenaron con SGD (learning rate 0,001, momentum 0,9, decaimiento polinómico), tamaño de lote 64, 30 épocas y entropía cruzada. DiT-base se entrenó con AdamW (learning rate 3e-5, schedule coseno con warm-up), tamaño de lote 32 y 10 épocas. En todos los casos el modelo se seleccionó por exactitud de validación tras cada época. La entrada es una página en escala de grises redimensionada a 224 × 224; a esa resolución los códigos de identificación ocupan únicamente dos o tres píxeles de altura.

Los datos de entrenamiento provienen del split de train de RVL-CDIP (319.999 páginas, de las cuales 296.605 tienen las etiquetas corregidas). La innovación metodológica central es el control del atajo: los códigos Bates se localizaron con el detector `stefan-hf/yolov8n-rvlcdip-idcodes` y se generaron versiones del corpus con los códigos blanqueados, de forma que el efecto de esa pista pueda medirse comparando pares de modelos. Adicionalmente, todo el corpus usado es una copia anonimizada con datos personales sustituidos por valores sintéticos. Cada fichero exportado se validó recargándolo con `rvlcdip_models.py` y comparando sus predicciones sobre 512 páginas de test con las del checkpoint original (concordancia del 99,8 % al 100 %). No se documenta RLHF ni DPO (no aplicables a clasificación de imágenes).

## Capacidades

- Clasificación de imágenes de documentos escaneados en 16 categorías, con una única etiqueta de salida por página.
- Predicción robusta en dos condiciones de entrada distintas: páginas con códigos Bates presentes y páginas con los códigos blanqueados.
- Variantes entrenadas con etiquetas originales y con etiquetas corregidas, lo que permite elegir el modelo según la definición de etiqueta que use el pipeline de destino.
- Carga directa de DiT-base mediante `AutoModelForImageClassification.from_pretrained(..., subfolder="dit_base/<variante>")`, con mapa de etiquetas y normalización registrados en `config.json`.
- Carga del resto de arquitecturas mediante el script `rvlcdip_models.py` incluido en el repositorio, que construye la arquitectura, carga los pesos y aplica el preprocesado de entrenamiento.
- No dispone de generación de texto, tool calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo de pensamiento: es un clasificador de imagen puro.
- No se documentan capacidades multilingües distintas de las presentes en los documentos del corpus de entrenamiento.

## Casos de uso

- Triage en e-discovery legal: clasificar automáticamente lotes de páginas escaneadas en las 16 categorías para separar correspondencia, formularios, facturas o informes antes de la revisión humana, usando la variante `codes-removed` si los documentos no llevan numeración Bates.
- Enrutado en pipelines de Intelligent Document Processing: situar el clasificador como primera etapa que decide qué extractor específico aplicar después (por ejemplo, un extractor de líneas de factura frente a un parser de informes), con la garantía de que la entrada ya está normalizada a 224 × 224 en escala de grises.
- Archivística y digitalización masiva: etiquetar fondos documentales históricos escaneados para construir índices de búsqueda por tipo de documento, empleando SqueezeNet 1.0 (3 MB) o GoogLeNet (23 MB) cuando el presupuesto de cómputo es muy limitado.
- Gestión de siniestros y expedientes en seguros o administración pública: separar notas manuscritas, formularios y presupuestos dentro de un expediente para asignarlos a distintas colas de tramitación.
- Investigación sobre sesgos de atajo: usar los pares `codes-kept` / `codes-removed` como banco de pruebas controlado para cuantificar cuánta exactitud de un clasificador de documentos procede de artefactos de digitalización y no del contenido de la página.
- Auditoría de calidad de benchmarks: comparar la caída de rendimiento en RVL-CDIP-N (documentos de otras fuentes) frente al dominio original para decidir si un modelo es apto para producción fuera del corpus de tobacco litigation.
- Preprocesado antes de OCR: descartar o marcar páginas que no pertenecen a las categorías de interés (por ejemplo, publicidad o carpetas de archivo) para no gastar OCR en documentos irrelevantes.
- Docencia y demos de visión por computador: el rango de tamaño de 3 MB a 537 MB y las siete arquitecturas con exactitudes publicadas permiten montar comparativas reproducibles en una sola GPU de consumo.

## Benchmarks y rendimiento

Exactitud (%) del checkpoint liberado (semilla 42) sobre el split de test de su propia condición de entrenamiento; entre paréntesis, la media sobre tres semillas. Los modelos entrenados con etiquetas originales se evalúan sobre las etiquetas originales de test (39.999 páginas) y los entrenados con etiquetas corregidas sobre las corregidas (36.446 páginas), por lo que ambas mitades no son directamente comparables.

| Modelo | Original, códigos presentes | Original, códigos eliminados | Corregidas, códigos presentes | Corregidas, códigos eliminados | Tamaño |
|---|---|---|---|---|---|
| AlexNet | 89,21 (89,30) | 88,41 (88,52) | 92,85 (92,82) | 92,73 (92,73) | 228 MB |
| GoogLeNet | 89,34 (89,25) | 88,52 (88,50) | 93,19 (93,15) | 92,91 (92,97) | 23 MB |
| ResNet-50 | 91,01 (90,85) | 90,21 (90,20) | 94,26 (94,31) | 94,28 (94,19) | 94 MB |
| ResNeXt-50 (32x4d) | 91,48 (91,33) | 90,48 (90,63) | 94,64 (94,69) | 94,56 (94,52) | 92 MB |
| SqueezeNet 1.0 | 88,70 (88,66) | 87,74 (87,69) | 92,46 (92,59) | 92,50 (92,46) | 3 MB |
| VGG-16 | 91,18 (91,27) | 90,74 (90,81) | 94,61 (94,62) | 94,46 (94,42) | 537 MB |
| DiT-base | 92,69 (92,76) | 92,20 (92,19) | 95,94 (95,92) | 95,74 (95,81) | 343 MB |

Modelos de etiquetas corregidas evaluados en las dos condiciones de test y en RVL-CDIP-N (1.002 páginas recopiladas de otras fuentes):

| Modelo | kept → kept | kept → removed | removed → kept | removed → removed | RVL-CDIP-N, kept | RVL-CDIP-N, removed |
|---|---|---|---|---|---|---|
| AlexNet | 92,85 | 91,54 | 92,37 | 92,73 | 73,6 | 69,7 |
| GoogLeNet | 93,19 | 92,62 | 92,72 | 92,91 | 77,9 | 71,5 |
| ResNet-50 | 94,26 | 93,71 | 94,19 | 94,28 | 79,2 | 77,0 |
| ResNeXt-50 (32x4d) | 94,64 | 94,10 | 94,45 | 94,56 | 80,8 | 76,2 |
| SqueezeNet 1.0 | 92,46 | 91,57 | 92,32 | 92,50 | 77,0 | 75,0 |
| VGG-16 | 94,61 | 93,75 | 94,25 | 94,46 | 78,5 | 77,8 |
| DiT-base | 95,94 | 95,37 | 95,71 | 95,74 | 87,1 | 83,9 |

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del tamaño de los pesos, no publicada por el autor): menos de 1 GB para SqueezeNet 1.0, GoogLeNet y ResNet-50/ResNeXt-50 en FP32; en torno a 1–2 GB para VGG-16 y DiT-base, incluyendo activaciones a 224 × 224 y lote pequeño.
- Cualquiera de los siete modelos cabe en GPU de consumo: GTX 1650, RTX 3060, RTX 4090 o incluso iGPU con memoria compartida para las variantes más pequeñas.
- Inferencia en CPU perfectamente viable, especialmente con SqueezeNet 1.0 (3 MB) y GoogLeNet (23 MB), dado el tamaño reducido de los pesos y la resolución de entrada.
- Despliegue documentado: PyTorch + `torchvision` mediante el script `rvlcdip_models.py` del repositorio, y `transformers` (`AutoModelForImageClassification`) para las carpetas de DiT-base.
- vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo y no se documentan; tampoco se documentan exportaciones a ONNX, TensorRT o Core ML.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tiempo de inferencia ni de páginas procesadas por segundo.

## Comparativa con modelos similares

La comparación natural es entre las siete arquitecturas del propio release, ya que comparten datos, preprocesado y protocolo de evaluación. Se toma como referencia la variante `labels-corrected_codes-removed`, que es la más exigente.

| Modelo | Tamaño | Exactitud en dominio (corregidas, sin códigos) | RVL-CDIP-N (sin códigos) | Perfil de uso |
|---|---|---|---|---|
| DiT-base | 343 MB | 95,74 % | 83,9 % | Mejor exactitud y mejor generalización; requiere `transformers` |
| ResNeXt-50 (32x4d) | 92 MB | 94,56 % | 76,2 % | Mejor relación exactitud/tamaño entre las CNN |
| VGG-16 | 537 MB | 94,46 % | 77,8 % | El más pesado, sin ventaja clara de exactitud sobre ResNeXt-50 |
| ResNet-50 | 94 MB | 94,28 % | 77,0 % | Alternativa estándar y bien conocida |
| GoogLeNet | 23 MB | 92,91 % | 71,5 % | Buen equilibrio para entornos con poca memoria |
| SqueezeNet 1.0 | 3 MB | 92,50 % | 75,0 % | El más ligero; generaliza mejor que GoogLeNet en RVL-CDIP-N |
| AlexNet | 228 MB | 92,73 % | 69,7 % | Peor generalización fuera de dominio del conjunto |

No se han identificado en la información disponible otros clasificadores de RVL-CDIP con resultados publicados que puedan compararse directamente con estas cifras. El proyecto `Mauro26-AI/Document_classification` aborda la misma tarea con una CNN y entrenamiento en dos fases, pero no se dispone de sus métricas. El detector `stefan-hf/yolov8n-rvlcdip-idcodes` es un modelo complementario, no comparable: resuelve detección de códigos Bates, no clasificación documental.

## Limitaciones y advertencias

- Entrenados y evaluados únicamente sobre escaneos procedentes del litigio del tabaco: la exactitud sobre otras fuentes documentales cae de forma notable, hasta 69,7 %–87,1 % en RVL-CDIP-N según el modelo.
- Los modelos `codes-kept` pueden apoyarse en los códigos de identificación y pierden precisión cuando estos no están presentes; la caída es de 0,0 a 0,3 puntos en dominio sobre las etiquetas corregidas y de en torno a 3–6 puntos en RVL-CDIP-N.
- La propia model card advierte de que RVL-CDIP presenta un solapamiento sustancial entre sus splits de entrenamiento y de test (la información disponible se corta en ese punto, por lo que no se detalla la magnitud).
- Los modelos entrenados con etiquetas originales y con etiquetas corregidas no son comparables entre sí: se evalúan sobre conjuntos de test distintos (39.999 y 36.446 páginas respectivamente).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificación errónea silenciosa: un documento fuera de las 16 categorías se asignará igualmente a una de ellas, sin opción de "desconocido".
- Sesgos potenciales derivados del dominio de entrenamiento (documentación legal estadounidense) y de los artefactos de digitalización del corpus, que pueden correlacionar con la categoría.
- Licencia `other` sin texto especificado: es imprescindible revisar las condiciones del repositorio antes de un uso comercial.
- Resolución de entrada de 224 × 224 en escala de grises: se pierde detalle fino, incluidos los propios códigos Bates, que quedan en dos o tres píxeles de altura.
- Repositorio con 0 descargas y 0 valoraciones, publicado y actualizado el mismo día (1 de octubre de 2026): no hay evidencia de uso en producción ni validación externa.
- No se documentan cuantizaciones, formatos de exportación alternativos ni mediciones de latencia, lo que limita el dimensionado de despliegues a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefan-hf/rvlcdip-classifiers
- Dataset de códigos de identificación: https://huggingface.co/datasets/stefan-hf/rvlcdip-id-codes
- Detector de códigos Bates usado para localizarlos: https://huggingface.co/stefan-hf/yolov8n-rvlcdip-idcodes
- Ficheros del detector: https://huggingface.co/stefan-hf/yolov8n-rvlcdip-idcodes/tree/main
- Proyecto externo de clasificación documental sobre RVL-CDIP: https://github.com/Mauro26-AI/Document_classification
- Artículo sobre errores y solapamiento train-test en RVL-CDIP: https://arxiv.org/pdf/2606.31446
- Artículo sobre la evaluación de la clasificación documental con RVL-CDIP: https://arxiv.org/html/2306.12550
