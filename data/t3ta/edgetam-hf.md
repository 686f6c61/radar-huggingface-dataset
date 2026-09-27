# t3ta/EdgeTAM-hf

## Resumen

EdgeTAM es un modelo de segmentación e seguimiento de objetos en vídeo, variante ejecutable en dispositivo («on-device») de SAM 2. Lo desarrolla Meta (facebookresearch) y el puerto a la librería Transformers lo firma el usuario yonigozlan. Resuelve segmentación promptable: dado un clic, varios puntos o una caja delimitadora sobre una imagen, devuelve máscaras del objeto; en vídeo, propaga esas máscaras entre fotogramas. Su relevancia actual es de eficiencia: según el propio proyecto, es 22 veces más rápido que SAM 2 y alcanza 16 FPS en un iPhone 15 Pro Max sin cuantización, lo que lo hace apto para despliegue móvil y de borde.

La arquitectura es una adaptación eficiente de SAM 2 que introduce un «2D Spatial Perceiver» para optimizar el mecanismo de atención de memoria, pensado para segmentación de vídeo en tiempo real en dispositivos móviles. El modelo de este repositorio tiene 13.943.298 parámetros en total, un tamaño muy contenido que explica su viabilidad en hardware limitado.

El repositorio analizado, `t3ta/EdgeTAM-hf`, no es el original: es una réplica sin modificaciones («mirror») de `yonigozlan/EdgeTAM-hf`, creada para que el nodo de propagación de máscaras de vídeo (`flow_gap_fill="tracker"`) del proyecto ComfyUI-Auto-Mosaic no dependa de un repositorio personal de terceros. El repositorio tiene 0 descargas y 0 «likes», y su licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación eficiente de SAM 2 con arquitectura 2D Spatial Perceiver para atención de memoria |
| Parámetros totales | 13.943.298 (13,9 M) |
| Longitud de contexto | No aplica: modelo de visión, no procesa texto |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones publicadas en la información proporcionada) |
| Idiomas soportados | No aplica: modelo de segmentación de imagen y vídeo, sin entrada ni salida de texto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (peso `model.safetensors`, sha256 `8858f8e4757b0b96dab8763f296ecffd845efbbbf698f64163cfa20a63d5fff4`) |

Datos adicionales del repositorio: pipeline `mask-generation`, etiquetas `transformers`, `edgetam_video`, `feature-extraction`, `mask-generation`, `endpoints_compatible`, tamaño del repositorio 0,1 GB, creado el 2026-09-27 y actualizado el 2026-09-27.

## Arquitectura y entrenamiento

EdgeTAM es una adaptación eficiente de SAM 2 (Segment Anything Model 2) orientada a ejecución en dispositivo. Su innovación técnica principal es la arquitectura 2D Spatial Perceiver, que optimiza el mecanismo de atención de memoria del seguimiento de vídeo para permitir segmentación en tiempo real en hardware móvil. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; se sabe que el paper evalúa sobre el conjunto SA-V val.

El modelo base fue propuesto en el artículo «EdgeTAM: On-Device Track Anything Model» por Chong Zhou, Chenchen Zhu, Yunyang Xiong, Saksham Suri, Fanyi Xiao, Lemeng Wu, Raghuraman Krishnamoorthi, Bo Dai, Chen Change Loy, Vikas Chandra y Bilge Soran. Este repositorio concreto no contiene pesos entrenados desde cero: es una réplica byte a byte del puerto a Transformers de yonigozlan, que a su vez parte de la implementación original de facebookresearch/EdgeTAM. La réplica declara haber verificado que el hash sha256 de `model.safetensors` coincide con el del repositorio de origen, en la revisión `c266ce53b3fc00f0f495b583f6a116c4e57f53bb` (modificada por última vez el 2025-11-06).

## Capacidades

- Segmentación de imagen promptable mediante un único clic (punto positivo o negativo).
- Refinamiento de máscaras con múltiples puntos, incluidos puntos negativos para excluir regiones.
- Segmentación a partir de cajas delimitadoras en formato `[x_min, y_min, x_max, y_max]`.
- Segmentación simultánea de varios objetos dentro de una misma imagen (una máscara por objeto).
- Generación automática de máscaras para todos los objetos de una imagen mediante el pipeline `mask-generation` (parámetro `points_per_batch`).
- Salida multimáscara: el modelo devuelve varias predicciones de máscara ordenadas por puntuación de calidad, y admite desactivarlas con `multimask_output=False`.
- Inferencia por lotes de imágenes para mejorar la eficiencia.
- Seguimiento y propagación de máscaras en vídeo (etiqueta `edgetam_video`), que es el uso para el que se creó esta réplica.
- Ejecución en dispositivo: 16 FPS en iPhone 15 Pro Max sin cuantización, según el proyecto.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento: es un modelo puramente visual.

## Casos de uso

- Propagación de máscaras en vídeo dentro de ComfyUI-Auto-Mosaic: es el caso real que motivó este repositorio; el nodo con `flow_gap_fill="tracker"` usa estos pesos para mantener la máscara de un objeto estable a lo largo de los fotogramas, sin depender de un repositorio de terceros.
- Mosaico automático y censura de contenido: el pipeline de ComfyUI-Auto-Mosaic lo emplea para generar máscaras que después se difuminan o pixelan, de modo que rostros, matrículas u otros elementos sensibles quedan ocultos de forma consistente en un vídeo completo.
- Rotoscopia y postproducción audiovisual: un operador marca el objeto con un clic o una caja en el primer fotograma y el modelo propaga el recorte, reduciendo el trabajo fotograma a fotograma de horas a minutos.
- Segmentación interactiva en herramientas de edición: integrado vía Transformers con `Sam2Processor` y `EdgeTamModel`, permite construir interfaces donde el usuario refina la máscara añadiendo puntos positivos y negativos hasta obtener el contorno deseado.
- Anotación automática de datasets de visión por computador: el pipeline `mask-generation` con `points_per_batch` genera máscaras de todos los objetos de una imagen, aprovechables como preetiquetado de conjuntos de segmentación o para recortar instancias antes de entrenar clasificadores y detectores.
- Segmentación y seguimiento en aplicaciones móviles: gracias a su tamaño de 13,9 M de parámetros y a los 16 FPS declarados en iPhone 15 Pro Max sin cuantización, es viable ejecutarlo en el propio dispositivo, con la ventaja de privacidad que supone no enviar el vídeo a un servidor.
- Visión embarcada y robótica de bajo consumo: al requerir muy poca memoria y admitir procesamiento de vídeo en tiempo real, encaja en drones, cámaras inteligentes o sistemas de control que necesitan aislar objetos sin una GPU de centro de datos.
- Procesado por lotes de grandes volúmenes de imágenes: el soporte de inferencia por lotes permite segmentar catálogos de imágenes en servidor con un coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. Lo único cuantificado que aporta la documentación consultada es la comparación de velocidad: EdgeTAM se ejecuta 22 veces más rápido que SAM 2 y alcanza 16 FPS en iPhone 15 Pro Max sin cuantización. El proyecto publica la métrica J&F sobre el conjunto SA-V val para los compromisos velocidad-rendimiento frente a otros modelos, pero los valores concretos no figuran en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 13,9 M de parámetros, los pesos ocupan aproximadamente 56 MB en fp32 y 28 MB en fp16. La memoria total necesaria la dominan las activaciones, que escalan con la resolución de la imagen de entrada, pero en cualquier caso se mantiene muy por debajo de 1 GB en configuraciones habituales.
- GPU recomendadas: no requiere GPU de gama alta. Funciona en CPU, en GPU de consumo (por ejemplo cualquier RTX con soporte CUDA) y en hardware móvil; el resultado declarado de 16 FPS está medido en un iPhone 15 Pro Max y el proyecto compara también con NVIDIA A100.
- Sí cabe en GPU de consumo, y de hecho está diseñado para ejecutarse incluso en un teléfono móvil sin cuantización.
- Opciones de despliegue: librería Transformers de Hugging Face (clases `EdgeTamModel` y `Sam2Processor`, pipeline `mask-generation` con `device=0`), e integración en ComfyUI a través del nodo de ComfyUI-Auto-Mosaic. Para el despliegue móvil nativo, la información apunta al repositorio original facebookresearch/EdgeTAM.
- Latencia y throughput estimados: 16 FPS en iPhone 15 Pro Max sin cuantización; el modelo es 22 veces más rápido que SAM 2 según el proyecto. No se proporcionan cifras de latencia en GPU de servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeTAM (este modelo) | 13.943.298 | Imagen y vídeo, con prompts de punto o caja | 16 FPS en iPhone 15 Pro Max sin cuantización; 22× más rápido que SAM 2 | Apache-2.0 | Hugging Face (Transformers), GitHub de Meta, demo en Spaces |
| SAM 2 | No disponible en la información proporcionada | Imagen y vídeo, con prompts | Referencia de la que deriva EdgeTAM; 22 veces más lento que EdgeTAM según el proyecto | No disponible en la información proporcionada | Repositorio de Meta |
| Alternativas de segmentación eficiente para dispositivo (MobileSAM, EfficientSAM y similares) | No disponible | Imagen | No disponible | No disponible | No disponible |

No se dispone en la información consultada de parámetros, contexto ni resultados de benchmark de SAM 2 ni de otras alternativas de segmentación eficiente, por lo que la comparación cuantitativa queda limitada al factor de velocidad declarado por el propio proyecto de EdgeTAM.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa ni genera texto, por lo que no tiene sesgos lingüísticos ni capacidades multilingües, pero tampoco puede usarse para tareas de lenguaje.
- Este repositorio es una réplica de terceros (`t3ta`), no el repositorio oficial. La cadena de custodia es: facebookresearch/EdgeTAM → yonigozlan/EdgeTAM-hf → t3ta/EdgeTAM-hf. Conviene fijar el hash sha256 documentado para verificar la integridad de los pesos.
- Sin tracción comunitaria: 0 descargas y 0 «likes» en el momento de la consulta, y solo 0,1 GB de repositorio; no hay historial de uso en producción más allá del propio ComfyUI-Auto-Mosaic.
- La model card está redactada en japonés y es, en su mayor parte, una copia de la model card del repositorio de origen; no aporta documentación propia adicional.
- No se documentan cuantizaciones publicadas, ni datos sobre el dataset de entrenamiento, composición, número de tokens o etapas de alineación.
- No se publican cifras de sesgo, robustez frente a dominios no vistos ni tasas de fallo en escenarios difíciles (oclusiones prolongadas, objetos que desaparecen y reaparecen, cambios bruscos de iluminación).
- En seguimiento de vídeo, los errores de máscara pueden acumularse a lo largo de los fotogramas por la naturaleza autorregresiva de la propagación; conviene validar el resultado en vídeos largos.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de licencia y atribución a los autores originales.

## Enlaces

- Repositorio en Hugging Face (este modelo): https://huggingface.co/t3ta/EdgeTAM-hf
- Repositorio de origen del puerto a Transformers: https://huggingface.co/yonigozlan/EdgeTAM-hf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/yonigozlan/EdgeTAM-hf
- Artículo técnico (arXiv:2501.07256): https://arxiv.org/abs/2501.07256
- Repositorio original de Meta: https://github.com/facebookresearch/EdgeTAM
- Documentación de EdgeTAM en Transformers: https://huggingface.co/docs/transformers/v5.2.0/en/model_doc/edgetam
- Documentación de EdgeTAM en el repositorio de Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/edgetam.md
- Proyecto que usa estos pesos en producción (ComfyUI-Auto-Mosaic): https://github.com/t3ta/ComfyUI-Auto-Mosaic
- Ficha de referencia en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/edgetam-hf-yonigozlan
