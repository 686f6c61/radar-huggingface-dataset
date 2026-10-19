# timm/naflexvit_so400m_patch16_radio_v4.c_radio

## Resumen

C-RADIOv4 SO400M es un codificador de características de imagen (image feature encoder) desarrollado por NVIDIA, publicado originalmente como `nvidia/C-RADIOv4-SO400M` y redistribuido aquí como un remapeo nativo a `timm` sin entrenamiento adicional. Pertenece a la familia RADIO (Agglomerative Vision Foundation Model), cuyo objetivo es agregar en un único espacio de características las representaciones de varios modelos profesores de visión, de modo que un solo backbone sirva tanto para tareas semánticas (clasificación, recuperación) como para tareas densas (segmentación, detección). El entrenamiento se realizó por destilación multi-profesor a partir de SigLIP2-g, DINOv3-7B y SAM3.

La variante publicada aquí es **NaFlexViT**, que admite resolución y relación de aspecto variables en entrenamiento e inferencia mediante el pipeline NaFlex de `timm`, conservando la rejilla completa de posiciones de 128×128 parches (hasta 2048 px) del RADIO original y replicando su esquema de redimensionado de embeddings posicionales. Existe una variante de resolución fija, `vit_so400m_patch16_radio_v4.c_radio`, con los mismos pesos en un VisionTransformer clásico.

Con 431,2 M de parámetros y un coste de 492,8 GMACs por imagen a 512×512, el modelo se sitúa en la gama media-alta de encoders visuales y es relevante ahora porque ofrece, en un único checkpoint, características alineadas con SigLIP2 (semántica texto-imagen vía destilación), con DINOv3 (features densas de alta calidad) y con SAM3 (promptabilidad para segmentación), con licencia NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer con parches de 16×16, variante NaFlexViT (resolución y relación de aspecto variables); prefijo de 10 tokens (CLS + registros), dimensión oculta 1152 |
| Parametros totales | 431.238.384 (431,2 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (encoder de visión). Resolución nativa 512×512; resolución y aspecto variables vía NaFlex, con rejilla de posiciones de hasta 128×128 parches (2048 px) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en safetensors, precisión original no indicada) |
| Idiomas soportados | no aplica: el modelo no procesa texto (solo imagen). No se dispone de evaluación multilingüe |
| Licencia | NVIDIA Open Model License (`license: other`, con `LICENSE.pdf` y `NOTICE` en el repositorio) |
| Formato de pesos | safetensors, cargable con `timm` y `transformers`; tamaño del repositorio 1,7 GB |

Datos adicionales de la model card: 492,8 GMACs e 776,2 M de activaciones a 512×512; dimensión de embedding 1152; 1024 tokens de parche a 512×512 (rejilla 32×32); salida de resumen estilo RADIO de 2304 dimensiones (concatenación de los dos tokens CLS).

## Arquitectura y entrenamiento

El modelo es un transformer de visión tipo ViT con patch embedding de 16×16 y anchura 1152 (configuración SoViT-400M). La innovación principal es el esquema de posiciones de RADIO: se mantiene una rejilla de embeddings posicionales de 128×128 parches y, para cualquier resolución o relación de aspecto de entrada, se redimensiona mediante interpolación bilineal sin antialiasing a un cuadrado del lado mayor y se recorta desde la esquina superior izquierda con `align_corners=False`, replicando el código del Hub original para este checkpoint. La proyección lineal del patch embedding sin sesgo se ha remapeado a una proyección lineal con sesgo a cero. Los 10 tokens de prefijo corresponden a un token CLS por profesor con cabeza de resumen (SigLIP2-g y DINOv3-7B) más tokens de registro; la model card no detalla cuántos registros hay, aunque por diferencia con los 1024 tokens de parche a 512×512 se deducen 8. `timm` los modela como `cls_token` más `reg_token`, y `global_pool='token'` usa únicamente el primer CLS.

El entrenamiento es una destilación multi-profesor (sin datos supervisados etiquetados de las tareas finales) sobre el dataset NV-CC-Img-Text-Dataset, según la model card de NVIDIA. Los profesores son SigLIP2-g (alineamiento semántico global), DINOv3-7B (features densas de alta calidad) y SAM3 (capacidades de segmentación/promptabilidad). Las innovaciones metodológicas asociadas están descritas en los trabajos AM-RADIO, RADIOv2.5, PHI-S (balanceo de distribuciones para destilación multi-profesor sin etiquetas) y FeatSharp. Un detalle relevante para producción: las cabezas adaptadoras de los profesores **no** se incluyen en este checkpoint, por lo que no hay torre de texto ni alineamiento texto-imagen zero-shot disponible de forma directa. La normalización es interna sobre entradas en `[0, 1]` con media y desviación típica de OpenAI CLIP, y el `pretrained_cfg` de `timm` aplica esa misma normalización en las transformaciones de datos.

## Capacidades

- Extracción de embeddings globales de imagen: `forward_head(..., pre_logits=True)` devuelve un vector de 1152 dimensiones (primer token CLS); la salida de resumen estilo RADIO concatenando los CLS [0, 1] da 2304 dimensiones.
- Extracción de características espaciales densas: a 512×512 se obtienen 1024 tokens de parche de 1152 dimensiones (rejilla 32×32), adecuados para tareas densas.
- Soporte de resolución y relación de aspecto arbitrarias mediante el pipeline NaFlex de `timm`, manteniendo el esquema de redimensionado de posiciones de RADIO.
- Acceso a mapas de características intermedios con `forward_intermediates(..., output_fmt='NCHW')`, por ejemplo `(1, 1152, 32, 32)`.
- Destilación multi-profesor: representa en un solo espacio características semánticas tipo SigLIP2, densas tipo DINOv3 y orientadas a segmentación tipo SAM3.
- Uso como backbone congelado para cabezas lineales, kNN, atención o decodificadores ligeros de segmentación.
- Compatible con el ecosistema `timm` (creación por `hf-hub:`, `resolve_model_data_config`, transformaciones estándar) y exportable a TorchScript/ONNX mediante utilidades de `timm`.
- No soporta generación de texto, tool calling, uso como agente, razonamiento multi-paso ni procesamiento de lenguaje natural; no incluye torre de texto ni adaptadores de texto.
- No dispone de modo "thinking", visión-a-texto, audio ni ninguna capacidad generativa.

## Casos de uso

- Segmentación semántica con backbone congelado: usar los tokens de parche como entrada a un decodificador ligero (lineal o tipo FPN); NVIDIA reporta 55,14 mIoU en ADE20k y 87,22 mIoU en Pascal VOC con este tamaño, lo que lo hace competitivo sin reentrenar el encoder.
- Recuperación de imágenes a escala (image-to-image retrieval): indexar los embeddings de 2304 dimensiones en un motor ANN (FAISS, Qdrant, Milvus) para búsqueda por similitud, deduplicación de datasets o sistemas de recomendación visual.
- Sustitución del encoder visual en pipelines de VLM: el modelo entrega tokens densos de 1152 dimensiones compatibles con decodificadores multimodales, y su coste de 492,8 GMACs por imagen a 512×512 es contenido frente a encoders de mayor tamaño.
- Preprocesado para modelos de segmentación promptables: las características densas destiladas de SAM3 sirven como entrada a cabezas de segmentación por puntos o cajas, útil en anotación semiautomática de datasets.
- Clasificación few-shot o por prototipos: con los embeddings globales y distancia coseno se obtienen clasificadores sin entrenamiento; el rendimiento kNN reportado en ImageNet (85,75 top-1) da una referencia del poder discriminativo de las features.
- Inspección visual automatizada en líneas de producción: extracción de embeddings en tiempo casi real para detección de defectos mediante clasificador lineal entrenado sobre las features congeladas, con la ventaja de no requerir grandes volúmenes de datos etiquetados.
- Imágenes de aspecto extremo (satélite, panorámicas, documentos largos): la variante NaFlex procesa entradas no cuadradas sin deformarlas, algo que un ViT de resolución fija no permite.
- Investigación en destilación multi-profesor: punto de partida para ablaciones sobre PHI-S y FeatSharp, ya que el checkpoint es un remapeo exacto de los pesos originales de NVIDIA.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA en las model cards originales de C-RADIOv4. Los resultados zero-shot emplean el adaptador SigLIP2 y el codificador de texto originales, que **no** están incluidos en este checkpoint.

| Benchmark | C-RADIOv3-B | C-RADIOv3-L | C-RADIOv4-SO400M | C-RADIOv3-H | C-RADIOv4-H |
|---|---|---|---|---|---|
| ImageNet zero-shot (top-1) | 71,30 | 79,95 | 82,01 | 82,65 | 83,09 |
| ImageNet kNN (top-1) | 81,22 | 84,33 | 85,75 | 86,23 | 86,68 |
| ADE20k segmentación semántica (mIoU) | 49,79 | 51,87 | 55,14 | 52,75 | 55,20 |
| Pascal VOC segmentación semántica (mIoU) | 84,68 | 86,12 | 87,22 | 86,41 | 87,24 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que el modelo no procesa texto.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 0,86 GB en bf16/fp16 y 1,72 GB en fp32 (estimación calculada a partir de los 431,2 M de parámetros; la precisión exacta de los pesos publicados no se indica).
- VRAM total en inferencia: los pesos son una parte menor del consumo; la model card declara 776,2 M de activaciones a 512×512, de modo que el grueso del uso de memoria depende del tamaño de lote y de la resolución. Como orientación, un lote pequeño a 512×512 debería manejarse con holgura en GPUs de 8-12 GB, aunque no se dispone de mediciones publicadas.
- Cabe en GPU de consumo: sí, por tamaño de parámetros (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.); a resoluciones muy altas con NaFlex el coste de atención y activaciones crece de forma cuadrática con el número de parches y puede requerir GPUs de 24 GB o más.
- GPU de数据中心 recomendadas: A100, H100 o L40S para procesado por lotes a gran escala; también es viable en GPUs consumer para inferencia interactiva.
- Coste computacional por imagen: 492,8 GMACs a 512×512, es decir, aproximadamente 0,99 GFLOPs por imagen (2 × MACs). A partir de este dato puede estimarse el throughput en una GPU concreta, pero no se han publicado cifras de latencia o imágenes por segundo.
- Despliegue: `timm` sobre PyTorch (ruta recomendada, con `torch.compile` y exportación a TorchScript/ONNX); servidores de inferencia genéricos como Triton Inference Server, TorchServe o Ray Serve. No está pensado para vLLM, TGI, llama.cpp ni Ollama, que son servidores de modelos generativos de texto.
- Memoria de almacenamiento: 1,7 GB de repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| C-RADIOv4-SO400M NaFlex (este) | 431,2 M | Resolución y aspecto variables, rejilla hasta 2048 px | ImageNet kNN 85,75; ADE20k 55,14; VOC 87,22 | NVIDIA Open Model License | HuggingFace (timm) |
| C-RADIOv4-SO400M resolución fija (`vit_so400m_patch16_radio_v4.c_radio`) | 431,2 M (mismos pesos) | Resolución fija 512×512 | Los mismos valores reportados para C-RADIOv4-SO400M | NVIDIA Open Model License | HuggingFace (timm) |
| C-RADIOv4-H | no disponible | no disponible | ImageNet kNN 86,68; ADE20k 55,20; VOC 87,24 | NVIDIA Open Model License (según familia) | HuggingFace (NVIDIA) |
| C-RADIOv3-H | no disponible | no disponible | ImageNet kNN 86,23; ADE20k 52,75; VOC 86,41 | no disponible en la información proporcionada | HuggingFace (NVIDIA) |
| C-RADIOv3-L | no disponible | no disponible | ImageNet kNN 84,33; ADE20k 51,87; VOC 86,12 | no disponible en la información proporcionada | HuggingFace (NVIDIA) |
| SigLIP2-g (profesor) | no disponible | no disponible | no disponible | no disponible | HuggingFace (Google) |
| DINOv3-7B (profesor) | 7 B (por nombre) | no disponible | no disponible | no disponible | HuggingFace (Meta) |

Lectura de la comparativa: dentro de la familia, C-RADIOv4-SO400M iguala o supera a C-RADIOv3-H en segmentación (55,14 frente a 52,75 en ADE20k) con un modelo presumiblemente mucho menor, y queda a menos de un punto de C-RADIOv4-H en kNN de ImageNet (85,75 frente a 86,68). No se dispone de datos de parámetros de las variantes v3 ni v4-H en la información proporcionada.

## Limitaciones y advertencias

- No incluye las cabezas adaptadoras de los profesores: no hay torre de texto ni clasificación zero-shot directa con vocabulario abierto; los resultados zero-shot de la tabla requieren el adaptador SigLIP2 original.
- Licencia NVIDIA Open Model License (no es una licencia OSI): es necesario revisar `LICENSE.pdf` y `NOTICE` en el repositorio antes de un uso comercial o de redistribución; las condiciones de uso aceptable de NVIDIA aplican.
- El prefijo contiene varios tokens CLS: usar `global_pool='token'` devuelve solo el CLS de SigLIP2 (1152 dimensiones). Para reproducir el resumen de RADIO hay que concatenar los tokens [0, 1] (2304 dimensiones); mezclar ambos modos produce comparaciones inválidas.
- La normalización de entrada es obligatoria (media y desviación típica de OpenAI CLIP sobre `[0, 1]`, aplicada internamente). Si se saltan las transformaciones de `timm` y se normaliza dos veces, las features se degradan sin aviso.
- El redimensionado de posiciones usa interpolación bilineal sin antialiasing, a un cuadrado del lado mayor y recorte superior-izquierdo. En relaciones de aspecto extremas esto puede introducir desalineamientos espaciales y un peor comportamiento en objetos cercanos al borde inferior o derecho.
- No hay evaluaciones de sesgo publicadas. El entrenamiento usa NV-CC-Img-Text-Dataset, un corpus web a gran escala, por lo que son esperables sesgos de representación geográfica y cultural; conviene auditar el modelo en dominios sensibles antes de desplegarlo.
- Riesgo de alucinación en el sentido generativo: no aplica, porque el modelo no genera texto. Sí existe riesgo de features poco informativas o espurias en dominios fuera de distribución (imágenes médicas, térmicas, microscopía), donde el rendimiento de los profesores es menor.
- Idiomas: el modelo no procesa lenguaje; no se puede usar para tareas multilingües ni de texto.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 "likes" en la información consultada, y se creó el 2026-10-19, por lo que no hay evidencia de terceros sobre su robustez en producción.
- El checkpoint es un remapeo de pesos sin entrenamiento adicional; cualquier mejora o error respecto al original debe atribuirse a `nvidia/C-RADIOv4-SO400M`.
- Coste cuadrático con la resolución en la variante NaFlex: procesar imágenes muy grandes (por encima de 1024 px de lado) multiplica el número de tokens y la memoria de activaciones; conviene validar los límites prácticos antes de fijar una resolución de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/naflexvit_so400m_patch16_radio_v4.c_radio
- Modelo original de NVIDIA: https://huggingface.co/nvidia/C-RADIOv4-SO400M
- Revisión de código fuente de los pesos originales: https://huggingface.co/nvidia/C-RADIOv4-SO400M/tree/c0457f5dc26ca145f954cd4fc5bb6114e5705ad8
- Repositorio oficial RADIO (NVlabs): https://github.com/NVlabs/RADIO
- Variante de resolución fija: https://huggingface.co/timm/vit_so400m_patch16_radio_v4.c_radio
- PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- C-RADIOv4 (Tech Report): https://arxiv.org/abs/2601.17237
- RADIOv2.5, Improved Baselines for Agglomerative Vision Foundation Models: https://arxiv.org/abs/2412.07679
- FeatSharp, Your Vision Model Features, Sharper: https://arxiv.org/abs/2502.16025
- PHI-S, Distribution Balancing for Label-Free Multi-Teacher Distillation: https://arxiv.org/abs/2410.01680
- AM-RADIO, Agglomerative Vision Foundation Model: https://arxiv.org/abs/2312.06709
- Profesor SigLIP2-g: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Profesor DINOv3-7B: https://huggingface.co/facebook/dinov3-vit7b16-pretrain-lvd1689m
- Profesor SAM3: https://huggingface.co/facebook/sam3
- Nota: los resultados de la búsqueda web realizada no contenían enlaces relacionados con este modelo (devolvieron contenido de un sitio de adultos ajeno al tema), por lo que no se han incorporado.
