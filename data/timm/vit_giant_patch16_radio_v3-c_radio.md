# timm/vit_giant_patch16_radio_v3.c_radio

## Resumen

`timm/vit_giant_patch16_radio_v3.c_radio` es un codificador de características visuales (image feature encoder) publicado por el equipo de PyTorch Image Models (timm). No es un modelo nuevo entrenado por timm, sino un remapeo nativo a timm de los pesos originales de `nvidia/C-RADIOv3-g`, sin entrenamiento adicional. C-RADIOv3 es un modelo fundacional de visión aglomerativo de NVIDIA, entrenado por destilación multi-profesor a partir de DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 (con registers) y SAM ViT-H. El resultado es un único encoder que aglutina las capacidades de sus profesores: alineamiento texto-imagen, features densas de alta calidad y segmentación.

La variante aquí publicada es la VisionTransformer clásica con patch de 16 píxeles y 1136 millones de parámetros, pensada para trabajar a 512x512 (rejilla de 32x32 parches, 1024 tokens de parche más 8 tokens de prefijo). Su relevancia práctica es doble: por un lado ofrece features de estado del arte para tareas densas (segmentación semántica, detección) y para clasificación con sondas lineales o kNN; por otro, su integración en timm permite resolver la carga, las transformaciones de datos y la extracción de tokens intermedios en tres líneas de código, algo que en el repositorio original requiere más fontanería.

Conviene tener claro qué no es: no incluye las cabezas adaptadoras de los profesores ni el codificador de texto, por lo que no permite alineamiento texto-imagen zero-shot ni clasificación zero-shot directa. Es un extractor de embeddings y de mapas de características espaciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con patch 16 y tokens de prefijo (CLS por profesor + registers); destilación multi-profesor |
| Parametros totales | 1.136.027.136 (1136,0 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica a texto; entrada de imagen 512x512 que produce 1032 tokens (8 de prefijo + 1024 de parche) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar; no hay variantes GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | no disponible (modelo puramente visual, sin cabezas de texto ni tokenizador) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (checkpoint timm, PyTorch); repo de 4,5 GB |

Otros datos técnicos declarados por el autor: 1301,4 GMACs por imagen de 512x512, 1658,1 M de activaciones, tamaño de imagen nativo 512x512. Revisión del modelo fuente: `28e70735780c22cd7fca20f0c509cb9fc3893aeb`.

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión estándar con patch embedding de 16x16, adaptado del esquema RADIO. La innovación principal de RADIO es la "aglomeración": un único encoder se entrena para reproducir simultáneamente las representaciones de varios profesores heterogéneos, de modo que las features resultantes sirven tanto para tareas que requieren alineamiento semántico global (tipo CLIP) como para tareas densas (tipo DINOv2 o SAM). Los 8 tokens de prefijo corresponden a un token CLS por profesor (DFN CLIP, SigLIP2, DINOv2) más tokens de registro; timm los modela como `cls_token` y `reg_token`, y el `global_pool='token'` por defecto usa únicamente el primer CLS.

El entrenamiento se realizó por destilación multi-profesor con las técnicas descritas en RADIOv2.5 y PHI-S (balanceo de distribuciones para destilación sin etiquetas), sobre el dataset NV-CC-Img-Text-Dataset según la model card de NVIDIA. En este checkpoint concreto no hay entrenamiento adicional: es un remapeo de pesos. Los cambios aplicados son de índole de implementación: la proyección lineal del patch embedding sin sesgo se remapea a una convolución con sesgo cero, la rejilla de posiciones se remuestrea una sola vez de 128x128 a 32x32 (512x512) con el método de resize de RADIO, y la normalización `[0,1]` con media/desviación de OpenAI CLIP se aplica desde el `pretrained_cfg` de timm.

## Capacidades

- Extracción de embeddings globales de imagen: `forward_head(tokens, pre_logits=True)` devuelve un vector de 1536 dimensiones a partir del primer token CLS.
- Resumen estilo RADIO: concatenación de los tres primeros CLS `tokens[:, [0, 1, 2]]` para obtener un vector de 4608 dimensiones (DFN CLIP + SigLIP2 + DINOv2).
- Features espaciales densas: `tokens[:, model.num_prefix_tokens:]` devuelve un tensor de 1024x1536, equivalente a una rejilla 32x32 de features.
- Mapas de características intermedios: `forward_intermediates(x, indices=4, output_fmt='NCHW')` devuelve mapas 1536x32x32, útiles para segmentación y detección.
- Clasificación mediante sonda lineal o kNN sobre las features congeladas.
- Segmentación semántica y transferencia densa (resultados reportados en ADE20k y Pascal VOC para la familia C-RADIOv3/v4).
- Capacidad de servir como profesor en destilación hacia modelos más pequeños.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión-lenguaje zero-shot en este checkpoint, al no incluir cabezas adaptadoras ni codificador de texto.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: usar el embedding global de 1536 dimensiones (o el resumen de 4608) como vector de índice en una base de datos vectorial; la ventana de 1032 tokens no limita porque cada imagen se codifica de forma independiente.
- Segmentación semántica en producción: extraer los mapas intermedios con `forward_intermediates` y acoplar una cabeza ligera de segmentación; los 32x32 de resolución de feature facilitan la interpolación a la máscara final.
- Etiquetado y curación de datasets: clusterizar los embeddings de un corpus de imágenes para detectar duplicados, clases desbalanceadas o contenido atípico antes de entrenar otro modelo.
- Sonda lineal para clasificación de dominio específico: congelar el encoder y entrenar una regresión logística sobre las features, un procedimiento barato que evita el ajuste fino de 1136 M de parámetros.
- Destilación de conocimiento: emplear las features de este ViT-g como objetivo para entrenar un encoder pequeño que se despliegue en dispositivos con menos VRAM.
- Control de calidad industrial o inspección visual: comparar embeddings de piezas contra una referencia para detectar desviaciones, usando las features densas para localizar la región anómala.
- Indexación de vídeo: codificar fotogramas muestreados a 512x512 y almacenar embeddings para búsqueda temporal o resumen de contenido.
- Base visual para pipelines multimodales: conectar las features espaciales a un LLM o a una cabeza de detección en arquitecturas tipo encoder-proyector-decodificador.

## Benchmarks y rendimiento

La model card reproduce la tabla de comparación publicada por NVIDIA para la familia C-RADIO. Importante: la tabla no incluye una fila para la variante giant (g) que corresponde a este checkpoint, por lo que no hay resultados publicados específicos para `vit_giant_patch16_radio_v3.c_radio` en la información disponible. Los resultados zero-shot emplean el adaptador SigLIP2 y el codificador de texto originales, que no se incluyen en este repositorio.

| Benchmark | C-RADIOv3-B | C-RADIOv3-L | C-RADIOv4-SO400M | C-RADIOv3-H | C-RADIOv4-H |
|---|---|---|---|---|---|
| ImageNet zero-shot (Top-1) | 71,30 | 79,95 | 82,01 | 82,65 | 83,09 |
| ImageNet kNN (Top-1) | 81,22 | 84,33 | 85,75 | 86,23 | 86,68 |
| ADE20k segmentación semántica (mIoU) | 49,79 | 51,87 | 55,14 | 52,75 | 55,20 |
| Pascal VOC segmentación semántica (mIoU) | 84,68 | 86,12 | 87,22 | 86,41 | 87,24 |

No se han publicado resultados de benchmarks de esta variante giant en la información disponible.

## Requisitos de hardware

- Pesos en FP32: 1136 M de parámetros, aproximadamente 4,5 GB (coincide con el tamaño del repo).
- Pesos en FP16/BF16: aproximadamente 2,3 GB, si se convierte el checkpoint manualmente.
- Activaciones declaradas: 1658,1 M de elementos; del orden de 3,3 GB en FP16 si se retienen todas las activaciones. En inferencia con `torch.inference_mode()` el consumo real es bastante menor, pero conviene reservar holgura.
- Cabe en GPU de consumo: sí en términos de pesos (RTX 4090 de 24 GB, RTX 4080 de 16 GB, e incluso tarjetas de 8-12 GB en FP16 con batch pequeño). El coste computacional es el factor limitante, no la VRAM: 1301,4 GMACs por imagen de 512x512.
- GPU recomendadas: A100 40/80 GB o H100 para procesar lotes grandes y para ajuste fino; L40S o RTX 4090 para inferencia y extracción de features a escala media.
- Opciones de despliegue: timm + PyTorch es la vía nativa; exportación a ONNX o TensorRT para servir; también se puede usar dentro de `transformers` vía `timm` (tag `transformers`). No hay soporte GGUF ni llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de coste, cada imagen supone 1301,4 GMACs (aproximadamente 2,6 TFLOPs en FP16).
- Memoria para entrenamiento: ajustar el encoder completo requiere optimizador y estados intermedios; en la práctica es más habitual congelar el backbone y entrenar una cabeza, lo que reduce los requisitos a los de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit_giant_patch16_radio_v3.c_radio (este) | 1136,0 M | 512x512, 1032 tokens | no publicado para la variante g | NVIDIA Open Model License | HuggingFace (timm), pesos safetensors |
| nvidia/C-RADIOv3-g (original) | no disponible en la información | rejilla 128x128, salida equivalente a 512x512 | no publicado | NVIDIA Open Model License | HuggingFace (repo original de NVIDIA) |
| timm/naflexvit_giant_patch16_radio_v3 | no disponible | resolución flexible nativa | mismo comportamiento original a cualquier resolución | NVIDIA Open Model License | HuggingFace (timm) |
| C-RADIOv3-H | no disponible | no disponible | ImageNet kNN 86,23; ADE20k 52,75 | NVIDIA Open Model License | HuggingFace |
| C-RADIOv4-H | no disponible | no disponible | ImageNet kNN 86,68; ADE20k 55,20 | NVIDIA Open Model License | HuggingFace |

Frente a alternativas fuera de la familia, los profesores declarados (DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registers y SAM ViT-H) cubren por separado alineamiento texto-imagen, features densas y segmentación; la propuesta de RADIO es sustituir ese conjunto por un solo encoder. No se dispone en la información proporcionada de datos de parámetros ni de benchmarks de esos profesores para una comparación numérica directa.

## Limitaciones y advertencias

- No incluye cabezas adaptadoras ni codificador de texto: no hay clasificación zero-shot ni recuperación texto-imagen sin entrenar una cabeza propia.
- Al haberse remuestreado la rejilla de posiciones de 128x128 a 32x32, las salidas solo coinciden con el modelo original a 512x512. Otras resoluciones (vía `img_size` o `dynamic_img_size=True`) se remuestrean desde esa rejilla reducida y se desvían del comportamiento original; para resolución variable hay que usar `naflexvit_giant_patch16_radio_v3`.
- El remuestreo de posiciones usa interpolación bilineal sin antialiasing, recorte superior-izquierdo y `align_corners=False`; cualquier reimplementación debe replicar exactamente ese procedimiento para reproducir resultados.
- Normalización interna `[0,1]` con media y desviación de OpenAI CLIP; pasar imágenes ya normalizadas de otra forma degrada las features.
- Sesgos: heredados de los datos NV-CC-Img-Text-Dataset y de los profesores (DFN5B, SigLIP2, DINOv2, SAM). No se documentan evaluaciones de sesgo geográfico, demográfico o cultural en la información disponible.
- Riesgo de alucinación en sentido estricto: no aplica, al no generar texto; el riesgo equivalente es la mala calibración de las features en dominios alejados de la distribución de entrenamiento (imágenes médicas, satelitales de alta resolución, microscopía), donde conviene validar antes de desplegar.
- Licencia NVIDIA Open Model License: permite uso comercial pero con obligaciones (atribución, inclusión del aviso, restricciones sobre uso malicioso y sobre reclamaciones de patentes). Revisar el texto completo antes de integrar en producto.
- Coste computacional alto: 1301,4 GMACs por imagen de 512x512; para procesar millones de imágenes conviene planificar GPU de datacenter o reducir resolución asumiendo la desviación mencionada.
- Repo sin descargas ni likes y creado en 2026-10-19: ecosistema y validación comunitaria aún inexistentes; conviene verificar los pesos contra el original de NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/vit_giant_patch16_radio_v3.c_radio
- Variante de resolución flexible: https://huggingface.co/timm/naflexvit_giant_patch16_radio_v3.c_radio
- Pesos originales de NVIDIA: https://huggingface.co/nvidia/C-RADIOv3-g
- Repositorio original RADIO (NVlabs): https://github.com/NVlabs/RADIO
- PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Paper RADIOv2.5: https://arxiv.org/abs/2412.07679
- Paper FeatSharp: https://arxiv.org/abs/2502.16025
- Paper PHI-S: https://arxiv.org/abs/2410.01680
- Paper AM-RADIO: https://arxiv.org/abs/2312.06709
