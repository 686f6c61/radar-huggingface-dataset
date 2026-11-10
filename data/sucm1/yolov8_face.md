# Sucm1/yolov8_face

## Resumen

`Sucm1/yolov8_face` es un repositorio de Hugging Face publicado por el usuario Sucm1 que, por el nombre y el contenido de su model card, parece contener pesos de un detector de caras basado en la arquitectura YOLOv8, pensado para integrarse en el nodo `comfyui-reactor-node` (ReActor) de ComfyUI. La model card, sin embargo, no describe el modelo en sí: reproduce el README del proyecto ReActor, una extensión de intercambio de caras (face swap) para ComfyUI, e incluye una nota sobre una nueva funcionalidad de detección facial ("si la imagen contiene una cara, se hace el cambio; si no, se devuelve la imagen tal cual").

El repositorio es de tipo `model` en Hugging Face, con un tamaño aproximado de 0,1 GB, cero descargas y cero likes en el momento de la consulta, y sin pipeline, licencia ni idiomas declarados. No hay información sobre arquitectura, número de parámetros, contexto, datos de entrenamiento ni benchmarks. Se trata, por tanto, de un artefacto auxiliar de un pipeline de visión por computador (detección de caras) más que de un modelo de lenguaje, y la ficha debe interpretarse con esa cautela: la mayor parte de los campos técnicos solicitados no están disponibles.

Su relevancia es limitada y muy específica: sirve como pieza de detección previa en flujos de trabajo de ComfyUI/ReActor, donde se necesita localizar rostros antes de aplicar el intercambio. No es un modelo de propósito general ni compite con LLM o modelos multimodales; es un componente de visión integrado en una herramienta de generación de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere YOLOv8, sin confirmación en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica a un detector de caras) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: ~0,1 GB) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna, el número de capas, el backbone, la resolución de entrada, las clases detectadas ni la función de pérdida. El nombre del repositorio (`yolov8_face`) sugiere una variante de YOLOv8 especializada en detección de caras, pero no se confirma en el texto proporcionado. Tampoco se documentan los datos de entrenamiento (número de imágenes, composición del dataset, augmentaciones) ni si hubo ajuste fino desde pesos preentrenados de YOLOv8.

La model card únicamente describe el contexto de uso: el nodo ReActor de ComfyUI, que emplea detección facial para decidir si aplica el intercambio de caras. El README menciona dependencias como InsightFace (para el reconocimiento y el swap), CodeFormer y GFPGAN (para la restauración facial posterior), y soporte de ONNX Runtime con CUDA 12. No se detalla ninguna innovación técnica propia del modelo `yolov8_face`.

## Capacidades

- Detección de caras en imágenes, presumiblemente con salida de cajas delimitadoras (bounding boxes), aunque el formato exacto de salida no está documentado.
- Integración como paso previo en un pipeline de face swap: decide si hay cara antes de aplicar el intercambio.
- Uso dentro de ComfyUI mediante el nodo ReActor, con entrada de imagen y retorno condicional.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo ni modalidades de audio o vídeo.
- No se documenta soporte de "thinking mode" ni de visión más allá de la detección facial.

## Casos de uso

- Preprocesado en flujos de face swap con ComfyUI: el detector localiza rostros en la imagen de entrada y permite que el nodo ReActor aplique el intercambio solo cuando hay una cara válida, evitando errores en imágenes sin rostro.
- Automatización de pipelines de edición de imagen por lotes: filtrar imágenes sin caras antes de ejecutar el resto del grafo de ComfyUI, ahorrando cómputo en el swap y en la restauración facial.
- Moderación y triaje de contenido: detectar la presencia de personas en imágenes subidas por usuarios para enrutarlas a revisiones o flujos específicos.
- Anonimización previa: usar las cajas detectadas para desenfocar o recortar rostros antes de publicar imágenes, en combinación con el resto de herramientas del pipeline.
- Etiquetado y curación de datasets: generar anotaciones preliminares de caras que luego se revisan manualmente, útil para construir datasets de entrenamiento de otros modelos de visión.
- Integración en aplicaciones de creación de contenido con Stable Diffusion: como componente dentro de una cadena de generación y postprocesado de retratos, donde la detección facial condiciona el siguiente paso.
- Prototipado rápido en investigación de visión: al ser un artefacto pequeño (~0,1 GB) y ligero, permite experimentar con detección facial dentro del ecosistema ComfyUI sin montar infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) se trata de un modelo pequeño que previsiblemente cabe en GPUs de consumo, pero no hay cifras oficiales.
- GPU recomendadas: no disponible. El ecosistema ReActor menciona soporte de ONNX Runtime con CUDA 12, lo que sugiere ejecución en GPU NVIDIA, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño, pero no está confirmado en la documentación.
- Opciones de despliegue: el uso previsto es a través del nodo `comfyui-reactor-node` en ComfyUI; también podría ejecutarse con ONNX Runtime si los pesos están en ese formato, aunque el formato no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones que permitan una comparación rigurosa con otros detectores de caras (por ejemplo, RetinaFace, MTCNN, SCRFD o variantes de YOLO para rostros). Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- La model card no describe el modelo: reproduce el README de ReActor, por lo que no hay información verificable sobre arquitectura, entrenamiento o evaluación.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hay que contactar con el autor o asumir riesgo legal.
- El proyecto ReActor del que depende se distribuye sin filtro NSFW según su propio README, lo que implica riesgos de uso indebido en face swap; el autor declara que el uso es responsabilidad del usuario.
- Riesgo de falsos positivos y falsos negativos en la detección facial: no hay métricas publicadas (precisión, recall, mAP) que permitan estimarlas.
- Sin documentación sobre sesgos: no se sabe cómo se comporta con distintos tonos de piel, géneros, edades, oclusiones, ángulos extremos o imágenes de baja resolución.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación y actualización en 2026, lo que dificulta evaluar su vigencia respecto a versiones más recientes de YOLO o detectores faciales especializados.
- Para producción, conviene verificar el formato real de los pesos, la compatibilidad con ONNX Runtime y la versión de CUDA antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sucm1/yolov8_face
- Proyecto ReActor para ComfyUI (referenciado en la model card): https://github.com/Gourieff/comfyui-reactor-node
- ReActor para SD-WebUI: https://github.com/Gourieff/sd-webui-reactor
- CodeFormer (restauración facial): https://github.com/sczhou/CodeFormer
- GFPGAN (restauración facial): https://github.com/TencentARC/GFPGAN
- ONNX Runtime (instalación GPU CUDA 12): https://onnxruntime.ai/docs/install/#install-onnx-runtime-gpu-cuda-12x
