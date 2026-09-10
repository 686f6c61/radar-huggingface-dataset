# timm/qwen3_vit_306m_enc.qwen3_5_2b

## Resumen

qwen3_vit_306m_enc.qwen3_5_2b es un encoder de visión artificial (ViT) extraído del modelo multimodal Qwen3.5-2B y reempaquetado para la librería timm por Ross Wightman (autor de PyTorch Image Models). No es un modelo de lenguaje ni un modelo generativo: es el torreón visual nativo de Qwen3.5-2B, incluyendo el merger espacial y la proyección a la anchura del LLM de origen. Su función es convertir una imagen RGB en un conjunto de tokens espaciales proyectados, listos para ser consumidos por un transformer de lenguaje o por cualquier pipeline de visión que trabaje con representaciones densas.

El checkpoint contiene 330.630.144 parámetros (330,6 M), una anchura de backbone de 1024 y una anchura de proyección de 2048. Con una entrada de 768 x 768 píxeles produce 576 tokens proyectados de dimensión 2048, además de mapas de características crudos en formato NHWC de 48 x 48 x 1024. Se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un tamaño de repositorio de 1,3 GB.

Su relevancia es doble. Por un lado, permite reutilizar la torre visual de un VLM de última generación de forma aislada y ligera, sin cargar los pesos del modelo de lenguaje. Por otro, al ser un remapeo nativo a timm "sin entrenamiento adicional", ofrece una vía limpia y reproducible para integrar este encoder en ecosistemas de visión existentes, con transformaciones y utilidades ya estandarizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) extraido de Qwen3.5-2B; backbone con MLP GELU-tanh, posiciones absolutas aprendidas e interpoladas, y RoPE 2D axial |
| Parametros totales | 330.630.144 (330,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 768 x 768 px que produce 576 tokens proyectados |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Anchura de backbone | 1024 |
| Anchura de proyeccion | 2048 |
| GMACs | 973,6 |
| Activaciones | 2610,6 M |
| Normalizacion de entrada | mean = (0,5, 0,5, 0,5), std = (0,5, 0,5, 0,5) |
| Restriccion de tamaño de imagen | cada dimension divisible por 16 (por 32 si se usa el merger 2x2) |

## Arquitectura y entrenamiento

Se trata de un backbone de tipo vision transformer con procesamiento por parches y atención sobre tokens espaciales. El modelo utiliza MLP con activación GELU-tanh, posiciones absolutas aprendidas que se interpolan para la rejilla de entrada, y RoPE 2D axial que se regenera para cada resolución. Admite entradas rectangulares, siempre que cada dimensión sea divisible por 16 (o por 32 en variantes con merger 2x2). En esta implementación orientada a imagen, los pesos temporales del Conv3d original se suman en un Conv2d, de modo que la entrada de imagen repite un mismo fotograma a lo largo del kernel temporal original. El modelo expone `forward_features()`, que devuelve características crudas del backbone sin normalizar en formato NHWC (48 x 48 x 1024 para 768 x 768), y `forward()`, que devuelve los tokens espaciales ya fusionados y proyectados (576 x 2048).

El punto crítico es que este checkpoint es un remapeo nativo de los pesos visuales originales de Qwen3.5-2B, sin entrenamiento adicional. No contiene pesos del modelo de lenguaje ni una cabeza de clasificación de imágenes entrenada. La revisión de origen está fijada a `15852e8c16360a2fea060d615a32b45270f8a8fc` del repositorio de Qwen3.5-2B, y la licencia Apache 2.0 procede de ese mismo repositorio. No se documentan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO, ya que todo ello corresponde al entrenamiento original de Qwen3.5-2B, no a este remapeo.

## Capacidades

- Extraccion de características de imagen: genera tokens espaciales proyectados (576 x 2048) y mapas de características crudos del backbone (48 x 48 x 1024) para una imagen de 768 x 768.
- Feature maps intermedios: `forward_intermediates()` permite recuperar mapas de activaciones en distintas profundidades con formato NCHW, útil para tareas densas.
- Fusion espacial y proyeccion: incorpora el merger espacial y la proyeccion a la anchura del LLM de origen, por lo que la salida es directamente compatible con la interfaz de un modelo de lenguaje que espere tokens visuales de dimensión 2048.
- Soporte de entradas rectangulares: acepta imagenes no cuadradas sujetas a la divisibilidad por 16 (o 32) indicada.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un encoder visual.
- No tiene capacidades multilingues ni procesamiento de audio o video (aunque deriva de un componente original con kernel temporal, aqui se ha colapsado a 2D para imagen).
- No incluye cabeza de clasificacion: para clasificar habria que anadir una cabeza propia sobre las características agrupadas.

## Casos de uso

- Busqueda y recuperación visual: los embeddings proyectados de 2048 dimensiones permiten indexar imagenes y hacer busquedas por similitud en bases vectoriales, aprovechando que la salida es un vector denso por token y tambien una representacion agrupable por imagen.
- Preprocesado para tu propio VLM: al ser la torre visual nativa de Qwen3.5-2B, se puede reutilizar en pipelines propios que necesiten alimentar un LLM con tokens visuales compatibles con la anchura 2048 del modelo de origen.
- Segmentacion y deteccion densa: los mapas intermedios de 48 x 48 y la resolucion espacial fija facilitan cabezas de prediccion densa sobre la rejilla de parches, sin reentrenar el backbone.
- Clasificacion con fine-tuning ligero: congelando el encoder y entrenando una cabeza lineal o un MLP sobre las características agrupadas se pueden construir clasificadores de dominio especifico con coste de entrenamiento bajo.
- Deduplicacion y curaduria de datasets: generar embeddings de grandes volumenes de imagenes para detectar duplicados o near-duplicates antes de entrenar otros modelos.
- Control de calidad y deteccion de anomalias industriales: comparar embeddings de piezas correctas frente a piezas defectuosas para senalar desviaciones, con la ventaja de que el encoder cabe en GPU de consumo.
- Extraccion de características para clustering y exploracion: agrupar catalogos de imagenes (productos, satelite, medica) sin etiquetas usando las representaciones del modelo como espacio de embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de clasificacion, recuperacion ni deteccion, y tampoco se aportan comparaciones numericas con otros encoders. Los unicos datos de coste computacional publicados son GMACs (973,6), activaciones (2610,6 M) y parametros (330,6 M) para una entrada de 768 x 768.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: aproximadamente 1,3 GB en fp32, unos 0,66 GB en fp16/bf16 y del orden de 0,33 GB en int8. A esto hay que sumar las activaciones, que segun la model card ascienden a 2610,6 M de elementos y son el factor dominante en memoria para lotes grandes o resoluciones altas.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM para inferencia por lotes pequenos; tarjetas como RTX 3060, RTX 4070, RTX 4090, A100 o H100 son mas que suficientes. El modelo esta muy por debajo del umbral de las GPUs de datacenter.
- Cabe en GPU de consumo: si, holgadamente. Un encoder de 330 M de parametros es viable incluso en GPUs de gama de entrada y en modo CPU para inferencia puntual.
- Opciones de despliegue: la via nativa es timm (`timm.create_model('hf-hub:timm/qwen3_vit_306m_enc.qwen3_5_2b', pretrained=True)`) sobre PyTorch, con soporte de `torch.inference_mode()` y exportacion a ONNX o TorchScript para servir en produccion. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, ya que son runtimes orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa. Cualitativamente, pertenece a la familia de encoders visuales de tipo ViT de ~300 M de parametros con licencia permisiva, categoria en la que se situan alternativas como CLIP ViT-L/14, SigLIP o DINOv2 ViT-L. La diferencia principal es que este checkpoint no busca un objetivo contraste texto-imagen (como CLIP o SigLIP) ni un objetivo de autoaprendizaje puro (como DINOv2), sino que reproduce la torre visual de un VLM concreto y su proyeccion a la anchura del LLM asociado.

| Modelo | Parametros | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3_vit_306m_enc.qwen3_5_2b | 330,6 M | Feature extraction / torre visual de VLM | Apache 2.0 | HuggingFace (timm) |
| CLIP ViT-L/14 | no disponible en la informacion | Contraste imagen-texto | no disponible en la informacion | no disponible en la informacion |
| SigLIP | no disponible en la informacion | Contraste imagen-texto (sigmoide) | no disponible en la informacion | no disponible en la informacion |
| DINOv2 ViT-L | no disponible en la informacion | Autoaprendizaje visual | no disponible en la informacion | no disponible en la informacion |

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto, no razona y no soporta tool calling, agentes ni multi-step reasoning.
- No incluye cabeza de clasificacion entrenada. Para clasificar hay que anadir y entrenar una cabeza propia sobre las características extraidas.
- El checkpoint es un remapeo de pesos sin entrenamiento adicional; su calidad depende enteramente del entrenamiento original de Qwen3.5-2B y no se ha revalidado de forma independiente en esta version.
- Riesgo de sesgos heredados del corpus de entrenamiento original de Qwen3.5-2B, del que no se detalla composicion ni filtrado en la informacion disponible.
- Restricciones de resolucion: cada dimension de la imagen debe ser divisible por 16 (o por 32 si se usa el merger 2x2), lo que obliga a redimensionar o recortar entradas arbitrarias.
- Detalles de implementacion sensibles: los pesos temporales del Conv3d se han colapsado a Conv2d, la normalizacion usa media y desviacion de 0,5, y las posiciones absolutas se interpolan mientras que el RoPE 2D se regenera por tamano. Reutilizar el modelo fuera de estas convenciones puede degradar las representaciones.
- `forward_features()` devuelve características crudas sin normalizar en formato NHWC; si se usan directamente como embeddings conviene aplicar una normalizacion posterior.
- No se documentan variantes cuantizadas oficiales, por lo que cualquier cuantizacion a int8/int4 corre por cuenta del usuario y puede afectar a la fidelidad de las características.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del repositorio de origen de Qwen3.5-2B referenciada en la model card para confirmar que no anade condiciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/timm/qwen3_vit_306m_enc.qwen3_5_2b
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Revision de origen: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Licencia del modelo de origen: https://huggingface.co/Qwen/Qwen3.5-2B/blob/15852e8c16360a2fea060d615a32b45270f8a8fc/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- PyTorch Image Models (timm), repositorio: https://github.com/huggingface/pytorch-image-models
- Organizacion timm en HuggingFace: https://huggingface.co/timm
- Documentacion de timm en HuggingFace: https://huggingface.co/docs/timm/index
- Documentacion de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
