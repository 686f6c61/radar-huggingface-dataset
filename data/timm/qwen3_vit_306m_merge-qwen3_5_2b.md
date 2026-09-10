# timm/qwen3_vit_306m_merge.qwen3_5_2b

## Resumen

`timm/qwen3_vit_306m_merge.qwen3_5_2b` es un encoder de características de imagen publicado por el equipo de PyTorch Image Models (timm) en Hugging Face. No es un modelo de lenguaje ni un modelo multimodal completo: es el codificador visual extraído de Qwen/Qwen3.5-2B, remapeado al formato nativo de timm y publicado como envoltorio listo para extracción de características y para *fine-tuning* de clasificación. Conserva el *merger* espacial nativo y la proyección al ancho del LLM (2048), seguidos de *average pooling* y una LayerNorm sin parámetros afines.

El checkpoint contiene 330.630.144 parámetros (330,6 M), con un ancho de *backbone* de 1024 y un ancho de proyección de 2048. Está pensado para trabajar a 768 x 768 píxeles. Su relevancia práctica es doble: por un lado, permite reutilizar el *encoder* visual de un modelo grande sin cargar los pesos del LLM; por otro, ofrece una vía sencilla para alinear características visuales con el espacio de representación de Qwen3.5-2B en arquitecturas multimodales propias.

El autor advierte explícitamente de que se trata de un remapeo de los pesos visuales originales sin entrenamiento adicional: no incluye pesos del modelo de lenguaje ni una cabeza de clasificación entrenada. Por tanto, cualquier uso discriminativo requiere entrenar la cabeza correspondiente, y la calidad del espacio de *embeddings* como espacio métrico no está validada por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) extraído del codificador visual de Qwen3.5-2B; MLPs con GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial |
| Parametros totales | 330.630.144 (330,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: encoder de imagen, no procesa texto. A 768 x 768 produce 576 tokens espaciales proyectados a 2048 dimensiones |
| Tipos de cuantizacion | no disponible. El repositorio publica pesos en safetensors de ~1,3 GB, magnitud coherente con fp32; no se documentan cuantizaciones oficiales |
| Idiomas soportados | no aplica / no disponible: modelo de visión, sin entrada ni salida de texto |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors (carga mediante `timm.create_model('hf-hub:timm/qwen3_vit_306m_merge.qwen3_5_2b')`) |
| Ancho de backbone | 1024 |
| Ancho de proyeccion | 2048 |
| Tamano de imagen de referencia | 768 x 768 |
| Coste computacional | 973,6 GMACs por imagen |
| Activaciones | 2610,6 M |
| Modelo base | Qwen/Qwen3.5-2B (revision 15852e8c16360a2fea060d615a32b45270f8a8fc) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión que conserva la estructura del codificador visual de Qwen3.5-2B. El *backbone* tiene un ancho de 1024 y emplea MLPs con activación GELU-tanh, posiciones absolutas aprendidas (interpoladas para la rejilla de entrada) y RoPE 2D axial regenerado para cada resolución. Tras el *backbone* se mantiene el *merger* espacial nativo, que proyecta las características a un ancho de 2048, igual al del modelo de lenguaje del que procede; sobre esa salida se aplican *average pooling* y una LayerNorm sin parámetros afines. El método `forward_features()` devuelve los tokens espaciales proyectados en formato NLC (576 x 2048 a 768 x 768) y `encoder.forward_features()` devuelve las características crudas del *backbone* en formato NHWC. `forward()` devuelve el *embedding* pooled de la imagen hasta que se añade una cabeza de clasificación.

No ha habido entrenamiento adicional: el checkpoint es un remapeo de los pesos visuales originales al formato de timm. La adaptación principal es de implementación: las entradas de imagen repiten un fotograma a lo largo del *kernel* de parche temporal original, y los pesos del Conv3d temporal se suman en un Conv2d para esta variante exclusivamente de imagen. Las transformaciones de timm normalizan los píxeles RGB con `mean=(0,5, 0,5, 0,5)` y `std=(0,5, 0,5, 0,5)`. Se admiten entradas rectangulares, siempre que cada dimensión sea divisible por 16 (por 32 si se usa el *merger* 2x2). No se documentan fases de RLHF, DPO ni objetivos contrastivos, y no se especifican los datos de entrenamiento del modelo original en la información disponible.

## Capacidades

- Extracción de características de imagen: devuelve *embeddings* pooled de 2048 dimensiones por imagen a través de `forward()`.
- Tokens espaciales proyectados: `forward_features()` devuelve una rejilla NLC de 576 x 2048 para entradas de 768 x 768, útil para tareas densas.
- Mapas de características intermedios: `forward_intermediates()` permite extraer mapas por etapa, por ejemplo tensores de forma (1, 1024, 48, 48) en la etapa 3.
- Clasificación por *fine-tuning*: admite `num_classes` en `timm.create_model`, añadiendo una cabeza lineal inicializada aleatoriamente que debe entrenarse.
- Entradas rectangulares y multirresolución: soporta rejillas distintas de la de referencia siempre que se respete la divisibilidad por 16 (o 32 con el *merger* 2x2).
- Alineación con el espacio del LLM de origen: el ancho de proyección de 2048 coincide con el del modelo Qwen3.5-2B, lo que facilita integrarlo como torre visual en arquitecturas multimodales propias.
- No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, capacidades de audio ni comprensión multilingüe: es un encoder puramente visual.

## Casos de uso

- Clasificación de imágenes mediante *fine-tuning*: cargar el modelo con `num_classes=N` y entrenar la cabeza lineal sobre el conjunto propio. Es el flujo documentado por el autor y resulta adecuado porque el *backbone* ya aporta representaciones visuales de un modelo multimodal de gran escala.
- Búsqueda y recuperación de imágenes por similitud: los *embeddings* pooled de 2048 dimensiones permiten construir un índice vectorial y resolver consultas por vecino más cercano en catálogos, bancos de imágenes o sistemas de recomendación visual.
- Deduplicación y curación de *datasets*: agrupar imágenes casi idénticas mediante *clustering* sobre los *embeddings* para limpiar corpus de entrenamiento a gran escala.
- Etiquetado automático y *weak labeling*: usar una cabeza lineal ligera entrenada sobre pocas muestras (*linear probing*) para preetiquetar grandes volúmenes de imágenes antes de una revisión humana.
- Control de calidad e inspección visual industrial: con un *classifier* entrenado sobre la cabeza lineal, detectar defectos en línea de producción a 768 x 768, resolución suficiente para muchos defectos superficiales.
- Segmentación y detección densas: emplear `forward_intermediates()` para obtener mapas de características por etapa y alimentar cabezas de segmentación o detección con entradas de 48 x 48 en la etapa intermedia.
- Extracción de características en *pipelines* multimodales: congelar el encoder y entrenar solo un adaptador que conecte con un LLM cuyo ancho de entrada sea 2048, dado que la proyección ya coincide con la de Qwen3.5-2B.
- Destilación y evaluación de representaciones: usar los tokens espaciales como objetivo para destilar modelos visuales más pequeños o para comparar representaciones entre *backbones*.
- *Feature extraction* por lotes en *offline*: precalcular características de un corpus completo una sola vez y reutilizarlas en múltiples cabezas posteriores, dado el coste moderado del modelo (973,6 GMACs por imagen).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona estadísticas estructurales de timm (330,6 M de parámetros, 973,6 GMACs, 2610,6 M de activaciones a 768 x 768) y no incluye métricas de *ImageNet*, *retrieval* ni de ninguna otra tarea, ni comparaciones con otros encoders.

| Metrica | Valor |
|---|---|
| Benchmarks de clasificacion (ImageNet, etc.) | no disponible |
| Benchmarks de recuperacion (Recall@k, mAP) | no disponible |
| Benchmarks de segmentacion o deteccion | no disponible |
| Parametros | 330,6 M |
| GMACs por imagen (768 x 768) | 973,6 |
| Activaciones | 2610,6 M |

## Requisitos de hardware

- VRAM para pesos: unos 1,32 GB en fp32 (coherente con el tamaño del repositorio, 1,3 GB), unos 0,66 GB en fp16/bf16 y unos 0,33 GB en int8. Las cuantizaciones no están publicadas por el autor y requerirían conversión propia.
- Memoria de activaciones: el recuento de 2610,6 M de activaciones por imagen implica que la memoria durante el *forward* puede superar ampliamente a la de los pesos. Se recomienda disponer de al menos 8-16 GB de VRAM para lotes pequeños a 768 x 768 en fp16 (estimación), y reservar más margen si se aumentan resolución o *batch*.
- GPU recomendadas: cualquier GPU con 8 GB o más puede ejecutar inferencia en lotes pequeños; RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 son opciones válidas. Para entrenamiento de cabezas o *fine-tuning* completo conviene una GPU de 16-24 GB o superior.
- Cabe en GPU de consumo: sí. El modelo de 330,6 M de parámetros entra holgadamente en tarjetas de 8-12 GB; el factor limitante es la memoria de activaciones a resoluciones altas y *batch* grande, no los pesos.
- Opciones de despliegue: timm sobre PyTorch (vía principal, con `timm.create_model` y pesos safetensors desde el Hub), exportación a ONNX o TensorRT para inferencia optimizada, y TorchScript. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que están orientados a modelos de lenguaje y este checkpoint no contiene pesos de LLM.
- Latencia y throughput: no disponibles como medición publicada. Como referencia derivada, 973,6 GMACs equivalen a unos 1,95 GFLOPs por imagen a 768 x 768, de modo que en una GPU capaz de ~150 TFLOPS efectivos en fp16 el techo teórico ronda las 75 imágenes por segundo (estimación), muy por encima del rendimiento real alcanzable, que dependerá de la implementación, del *batch* y del cuello de botella de memoria.

## Comparativa con modelos similares

Los datos de parámetros, resolución y licencia de los modelos alternativos son información pública de cada proyecto. La columna de rendimiento comparado se deja como no disponible porque no se han publicado benchmarks de este checkpoint.

| Modelo | Parametros | Resolucion de entrada | Licencia | Objetivo de entrenamiento | Rendimiento comparado |
|---|---|---|---|---|---|
| timm/qwen3_vit_306m_merge.qwen3_5_2b | 330,6 M | 768 x 768 (múltiplos de 16) | Apache 2.0 | Sin entrenamiento adicional; remapeo del encoder visual de Qwen3.5-2B | no disponible |
| DINOv2 ViT-L/14 | 304 M | 224-518 px (parche 14) | Apache 2.0 | Autosupervisado (destilación + autoaprendizaje) | no disponible |
| CLIP ViT-L/14 | ~304 M (torre visual) | 224 px (parche 14) | MIT | Contraste imagen-texto | no disponible |
| SigLIP SoViT-400M/14 | ~428 M (torre visual) | 224-384 px (parche 14) | Apache 2.0 | Contraste sigmoide imagen-texto | no disponible |

Diferencias estructurales relevantes: el modelo de timm no ha sido entrenado con un objetivo contrastivo ni autosupervisado propio, por lo que su comportamiento como espacio de *embeddings* métrico no está garantizado; DINOv2, CLIP y SigLIP sí se optimizaron específicamente para producir representaciones útiles como tales. A cambio, este checkpoint ofrece compatibilidad directa con el ancho de proyección de Qwen3.5-2B, algo que ninguna de las alternativas proporciona. El parche efectivo de 32 píxeles (16 con *merger* 2x2) es mayor que el 14 de las alternativas, lo que reduce el número de tokens de salida (576 a 768 x 768) a costa de granularidad espacial.

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no produce texto, no admite entrada de texto y no soporta tool calling, function calling ni flujos de agentes.
- No incluye cabeza de clasificación entrenada. Las etiquetas que se obtengan con `num_classes` proceden de una cabeza lineal inicializada aleatoriamente que debe entrenarse sobre datos propios.
- Sin entrenamiento adicional: es un remapeo de pesos. No se ha optimizado con objetivos contrastivos ni métricos, por lo que la calidad de los *embeddings* para *retrieval* o *clustering* no está respaldada por ninguna evaluación publicada.
- Restricciones de resolución: cada dimensión de la imagen debe ser divisible por 16, y por 32 si se utiliza el *merger* 2x2. Las entradas que no cumplan esta condición deben redimensionarse o rellenarse.
- Normalización obligatoria: hay que usar `mean=(0,5, 0,5, 0,5)` y `std=(0,5, 0,5, 0,5)`; otras normalizaciones habituales (por ejemplo, las de ImageNet) degradarán las características.
- No procesa vídeo: el eje temporal original se ha colapsado sumando los pesos del Conv3d temporal en un Conv2d, de modo que la información temporal se anula al repetir un único fotograma.
- Sesgos: potencialmente heredados de los datos de entrenamiento del modelo Qwen3.5-2B, no documentados en la información disponible. No hay evaluación de sesgos publicada para este checkpoint.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y de errores de calibración en cualquier cabeza de clasificación entrenada sobre estas características.
- Licencia: Apache 2.0, heredada de Qwen/Qwen3.5-2B. Conviene verificar la licencia y las condiciones del modelo base en el repositorio original antes de un uso comercial.
- Madurez: el modelo registra 0 descargas y 0 *likes*, y fue creado el 10 de septiembre de 2026. No hay validación por parte de la comunidad ni *feedback* de terceros.
- Soporte: al ser un artefacto de conversión, la resolución de problemas depende del ecosistema timm y de la model card, no de un programa de soporte del autor del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_306m_merge.qwen3_5_2b
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión del modelo base utilizada: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/15852e8c16360a2fea060d615a32b45270f8a8fc/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organización timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentación de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
