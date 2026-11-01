# ThakiCloud/Thaki-FacilityVision-CrackSeg-E2

## Resumen

Thaki-FacilityVision-CrackSeg-E2 es un modelo de segmentación de imágenes especializado en la detección de grietas en superficies de hormigón. Lo desarrolla ThakiCloud y emplea una arquitectura U-Net con codificador ResNet-34 preentrenado en ImageNet, adaptada para producir una máscara por píxel a resolución nativa de la fotografía mediante inferencia por teselas solapadas de 768 × 768 píxeles con stride 512.

El modelo resuelve un problema concreto de inspección de infraestructuras: la detección de fisuras capilares que se pierden cuando la imagen se reescala a una resolución menor. Su innovación principal no está en la arquitectura, sino en el pipeline de inferencia: procesa la imagen a resolución nativa con solapamiento y promediado ponderado por ventana de Hann, lo que según el autor eleva la recall de grietas finas de 0,7358 a 0,9139 frente a una línea base de 1024 píxeles.

Se publica como "research preview" con 24,4 millones de parámetros en fp32 y licencia CC BY 4.0. Es relevante para equipos que necesiten un componente de visión por computador ligero y desplegable en GPU de consumo para tareas de mantenimiento predictivo, aunque sus métricas proceden únicamente de un split de desarrollo y no de un conjunto de test independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con codificador ResNet-34 (torchvision IMAGENET1K_V1) |
| Parametros totales | 24.453.121 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, ko (etiquetas de la model card; la tarea es de segmentación visual, no lingüística) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con codificador ResNet-34 inicializado con pesos de ImageNet (torchvision `IMAGENET1K_V1`, BSD-3-Clause). El modelo opera sobre imágenes RGB normalizadas con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`, tras aplicar `exif_transpose` para corregir la orientación. La inferencia se realiza a resolución nativa, sin reescalado, mediante teselas de 768 × 768 con stride 512, relleno reflectante y promedio ponderado por ventana de Hann. La salida es una probabilidad sigmoide por píxel y la máscara binaria se obtiene con umbral 0,95, ajustado para favorecer la precisión.

El entrenamiento se realizó sobre el *Concrete Crack Segmentation Dataset* de Ç. F. Özgenel (Mendeley Data, doi:10.17632/jwsn7tfbrp.1, CC BY 4.0), con un split de 337 imágenes de entrenamiento, 60 de desarrollo y 61 de test, manteniendo los grupos de casi-duplicados dentro de un mismo split. No se especifica en la información disponible el número de tokens ni si hubo etapas de RLHF o DPO, algo que no aplica a un modelo de segmentación. Como corrección técnica destacable, el autor re-alineó 194 pares imagen/máscara afectados por discrepancias de orientación EXIF, conservando solo aquellos en los que la evidencia de contraste confirmaba la corrección.

## Capacidades

- Segmentación semántica binaria de grietas en fotografías de superficies de hormigón, con salida de máscara por píxel a resolución nativa.
- Detección de grietas capilares finas gracias al procesamiento por teselas solapadas, con recall específica de 0,9139 en el split de desarrollo.
- Obtención de mapas de probabilidad continuos (`float32` en `[0,1]`) que permiten ajustar el umbral de decisión según el equilibrio precisión/recall deseado.
- Inferencia en CPU y GPU (CUDA si está disponible), con autocast en bf16 en GPU.
- Ejecución tanto mediante API de Python (`CrackSeg.predict`) como desde línea de comandos (`python crackseg.py wall.jpg`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de generación de texto: es exclusivamente un modelo de visión.
- No dispone de modo "thinking", visión general, audio ni otras modalidades más allá de la segmentación de imágenes.

## Casos de uso

- Inspección de fachadas y muros de hormigón: el modelo procesa fotografías a resolución nativa y devuelve una máscara de grietas que puede superponerse sobre la imagen original para priorizar revisiones manuales en edificios e infraestructuras.
- Mantenimiento predictivo de puentes y túneles: integrado en un pipeline de captura periódica, permite comparar máscaras entre inspecciones y detectar la progresión de fisuras a lo largo del tiempo.
- Procesamiento por lotes en servidores sin GPU: con inferencia en CPU a 4 hilos y aproximadamente 28 segundos por fotografía de 3024 × 4032, es viable para lotes nocturnos de inspección donde la latencia no es crítica.
- Análisis en GPU de consumo: con un pico de 2,79 GiB en bf16 para imágenes de 12 MP, cabe en tarjetas de gama media y permite procesar lotes con latencia de aproximadamente 0,75 s por imagen en una B200.
- Preetiquetado para anotación humana: el mapa de probabilidad continuo sirve como propuesta inicial que un anotador revisa y corrige, reduciendo el coste de crear nuevos datasets de grietas en otros materiales.
- Investigación en segmentación de defectos: al ser un research preview con código de inferencia autocontenido y pesos en safetensors, es una base reproducible para comparar estrategias de teselado, umbrales y aumentos de datos.
- Control de calidad en prefabricados de hormigón: en una línea de producción, la máscara generada puede alimentar un criterio automático de aceptación o rechazo de piezas antes del envío.

## Benchmarks y rendimiento

Resultados en el split de desarrollo (60 imágenes, 33 grupos de casi-duplicados). La línea base es una ejecución previa interna de U-Net R34 a 1024 píxeles de lado largo (`seg-1031`) con umbral 0,55 elegido también en desarrollo.

| Métrica (dev) | Línea base 1024 px, umbral 0,55 | E2 teselado nativo, umbral 0,95 |
|---|---|---|
| Dice medio | 0,8957 | 0,8983 |
| IoU medio | 0,8136 | 0,8187 |
| Precisión por píxel | 0,8911 | 0,8936 |
| Recall por píxel | 0,9037 | 0,9004 |
| Recall de grietas finas | 0,7358 | 0,9139 |
| Recall de línea central | 0,8917 | 0,9505 |

Bootstrap agrupado por pares (33 grupos), diferencia E2 − línea base:

| Δ | media | IC 95 % |
|---|---|---|
| Dice | +0,0027 | [−0,0134, +0,0186] |
| Precisión por píxel | +0,0025 | [−0,0322, +0,0358] |
| Recall de grietas finas | +0,178 | [+0,126, +0,233] |

El autor define "fina" como anchura de esqueleto ≤ 16 px (percentil 33 de las máscaras de entrenamiento) con tolerancia de 2 px. El split de test (61 imágenes) no ha sido evaluado. No se han publicado resultados de benchmarks en la información disponible más allá de estos datos de desarrollo.

## Requisitos de hardware

- VRAM estimada: pico de 2,79 GiB en bf16 para una fotografía de 3024 × 4032 en una B200; en fp32 el consumo será mayor, aunque no se documenta la cifra exacta.
- GPU recomendadas: cualquier GPU con al menos 4-6 GiB de VRAM para imágenes de alta resolución en bf16; el autor reporta mediciones en una B200.
- GPU de consumo: cabe en tarjetas de gama media y alta (por ejemplo, RTX 3060 en adelante) para imágenes de resolución moderada; no se documentan pruebas específicas en modelos concretos de consumo.
- CPU: inferencia viable con 4 hilos, aproximadamente 28 s por fotografía de 3024 × 4032 (n = 2).
- Opciones de despliegue: el repositorio incluye `crackseg.py` como inferencia autónoma (PyTorch); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Tampoco se documenta exportación a ONNX ni TensorRT.
- Latencia y throughput: en GPU, p50 de 0,75 s por imagen de 3024 × 4032 con teselado; la línea base a 1024 px tarda 0,13 s en la misma GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-FacilityVision-CrackSeg-E2 | 24,4 M | Resolución nativa, teselas 768 px | Dice dev 0,8983; recall grietas finas 0,9139 | CC BY 4.0 | HuggingFace |
| Línea base interna U-Net R34 `seg-1031` | no disponible | 1024 px lado largo | Dice dev 0,8957; recall grietas finas 0,7358 | no disponible | no distribuida públicamente |
| Otros modelos de segmentación de grietas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas públicas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Métricas exclusivamente de desarrollo y umbral elegido en el mismo split: el barrido de umbrales (0,20–0,95) alcanzó su mejor valor en el extremo superior, por lo que el óptimo real podría estar por encima de 0,95. No se reclama ninguna cifra de test.
- Correcciones de orientación en las etiquetas: 194 pares imagen/máscara se re-alinearon por discrepancias EXIF; en las 36 imágenes de desarrollo que no requirieron corrección el Dice es 0,8937, y en las 24 corregidas es 0,9054.
- Una sola fuente de datos: entrenamiento, desarrollo y test proceden del mismo dataset de fotografías de hormigón. Materiales como asfalto, acero o baldosas, así como otras condiciones de iluminación, cámaras o imágenes de dron, no han sido probados.
- Las imágenes más difíciles del split de desarrollo se sitúan en Dice 0,76–0,81, principalmente grietas anchas con bordes irregulares.
- Es un research preview, no una herramienta certificada para inspección: una máscara no constituye un juicio de seguridad estructural.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en la segmentación; el umbral 0,95 favorece la precisión y puede reducir la recall en escenarios distintos a los del dataset original.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero obliga a citar la autoría y la fuente de los datos según lo indicado en `LICENSE`.
- No se redistribuyen imágenes, máscaras ni predicciones sobre el dataset original en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-FacilityVision-CrackSeg-E2
- Dataset de entrenamiento (Özgenel, Mendeley Data): https://doi.org/10.17632/jwsn7tfbrp.1
- Pesos del codificador (torchvision ResNet-34 IMAGENET1K_V1): https://pytorch.org/vision/stable/models/generated/torchvision.models.resnet34.html
- Model card en coreano: incluida en el repositorio como `MODEL_CARD.ko.md`
