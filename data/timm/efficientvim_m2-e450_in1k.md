# timm/efficientvim_m2.e450_in1k

## Resumen

EfficientViM m2 (efficientvim_m2.e450_in1k) es un modelo de clasificación de imágenes desarrollado por los autores del artículo EfficientViM: Efficient Vision Mamba with Hidden State Mixer based State Space Duality, publicado en CVPR 2025, y distribuido a través de la librería timm (PyTorch Image Models) de Ross Wightman. Se trata de un backbone de visión de 13,9 millones de parámetros entrenado sobre ImageNet-1k a 224 x 224 píxeles, con solo 0,4 GMACs y 1,9 millones de activaciones, lo que lo sitúa en la gama de modelos ultraligeros para visión.

El problema que resuelve es el de la clasificación y extracción de características de imágenes con un coste computacional muy bajo, manteniendo la arquitectura de espacio de estados (state space duality) característica de la familia EfficientViM. Frente a los transformers de visión convencionales, la propuesta de los autores busca reducir el coste de atención manteniendo capacidad de representación, algo relevante para despliegues en el borde, procesado de grandes volúmenes de imágenes y uso como backbone en tareas de detección o segmentación.

El modelo se publica en formato safetensors bajo licencia MIT, con un tamaño de repositorio de 0,1 GB, y es accesible mediante una única llamada a `timm.create_model`. Su relevancia actual radica en que ofrece un backbone moderno, ligero y con licencia permisiva, integrado en el ecosistema timm, aunque con una adopción comunitaria todavía nula (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientViM (vision Mamba con mezclador de estado oculto basado en dualidad de espacio de estados) |
| Parámetros totales | 13.945.538 (13,9 M) |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 224 x 224 píxeles |
| Tipos de cuantización | no disponible en la información proporcionada (pesos distribuidos en safetensors a precisión completa) |
| Idiomas soportados | no aplica (modelo de clasificación de imágenes, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales aportados por la model card: 0,4 GMACs, 1,9 M de activaciones, tamaño de imagen 224 x 224, dataset ImageNet-1k.

## Arquitectura y entrenamiento

La arquitectura es un EfficientViM, una variante de vision Mamba que sustituye la atención cuadrática de los transformers de visión por mecanismos de espacio de estados, incorporando un mezclador de estado oculto (hidden state mixer) basado en dualidad de espacio de estados (state space duality). Según la model card, el modelo expone mapas de características multi-etapa con 128, 256 y 512 canales, lo que indica una estructura jerárquica con etapas de resolución decreciente, típica de los backbones de visión. No se detallan en la información disponible el número de bloques, las dimensiones internas ni otros hiperparámetros concretos de esta variante.

El entrenamiento se realizó sobre ImageNet-1k por parte de los autores del artículo, con imágenes de 224 x 224 píxeles. El sufijo «e450» del identificador sigue la convención de timm para indicar 450 épocas de entrenamiento. El artículo asociado se publicó en CVPR 2025 (arXiv:2411.15241). No se documentan en la información proporcionada detalles sobre composición exacta del dataset más allá de ImageNet-1k, uso de aumento de datos, destilación, ajuste fino por refuerzo ni técnicas de decodificación especulativa (no aplicables a un clasificador).

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k, con salida de logits y probabilidades top-k.
- Extracción de mapas de características multi-etapa (`features_only=True`), con salidas documentadas de 128 x 14 x 14, 256 x 7 x 7 y 512 x 4 x 4 para una imagen de entrada.
- Extracción de embeddings de imagen (`num_classes=0`), útil para similitud, recuperación y clustering.
- Uso como backbone preentrenado para transfer learning hacia tareas de visión específicas.
- Inferencia muy económica: 0,4 GMACs por imagen a 224 x 224.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), ni de visión-lenguaje, audio o vídeo.

## Casos de uso

- Clasificación de imágenes a gran escala: con 0,4 GMACs por imagen, el modelo permite procesar catálogos completos o archivos fotográficos en lotes, clasificando cada imagen en una de las 1000 categorías de ImageNet-1k con un coste de cómputo muy reducido.
- Moderación de contenido y filtrado previo: puede usarse como primer clasificador de bajo coste para descartar o etiquetar imágenes antes de pasar por modelos más caros, reduciendo el coste total del pipeline.
- Búsqueda visual y deduplicación: extrayendo embeddings con `num_classes=0`, se pueden construir índices vectoriales para búsqueda por similitud, agrupación de imágenes o detección de duplicados.
- Backbone para detección y segmentación: los mapas de características de 128, 256 y 512 canales a tres escalas permiten conectarlo como extractor congelado a cabezas de detección o segmentación, con un coste de entrenamiento bajo.
- Transfer learning a dominios verticales: ajuste fino sobre imágenes médicas, satelitales, agrícolas o de inspección industrial cuando el dominio difiere de ImageNet, aprovechando el preentrenamiento y el reducido tamaño del modelo.
- Despliegue en el borde y dispositivos con recursos limitados: sus 13,9 M de parámetros y 1,9 M de activaciones permiten ejecutarlo en CPU, GPU integradas o dispositivos tipo Jetson, algo inviable con backbones de visión de cientos de millones de parámetros.
- Etiquetado automático de datasets: preetiquetado de grandes volúmenes de imágenes para revisión humana posterior, acelerando la construcción de datasets propios.
- Control de calidad industrial en línea: clasificación por lotes en cadenas de producción, donde la latencia y el consumo energético son restricciones críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la página de resultados de timm (`pytorch-image-models/results`) para consultar métricas de dataset y de tiempo de ejecución, pero no incluye cifras concretas de precisión top-1/top-5, throughput ni latencia. No se deben asumir valores de exactitud sin consultar esa fuente.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 13.945.538 parámetros): aproximadamente 56 MB en fp32, 28 MB en fp16/bf16 y 14 MB en int8, sin contar el lote de activaciones (1,9 M de activaciones por imagen) ni los buffers del framework.
- GPU recomendadas: cabe holgadamente en cualquier GPU, incluidas RTX 4090, RTX 3090, RTX 3060, GTX 1660, Tesla T4 y A100/H100 (en estas últimas el modelo queda muy infrautilizado, por lo que el despliegue óptimo es en GPU pequeñas o CPU).
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU y aceleradores tipo Jetson o Coral, dado su tamaño inferior a 15 M de parámetros.
- Opciones de despliegue: timm/PyTorch nativo, exportación a ONNX, TorchScript y potencialmente TensorRT; servidores de clasificación como TorchServe, Triton Inference Server o un servicio FastAPI propio. Los servidores orientados a modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son el cauce adecuado para un clasificador timm.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas en la información proporcionada. Como referencia de coste relativo, 0,4 GMACs por imagen lo sitúan en el rango de modelos aptos para inferencia en tiempo real, pero esa afirmación es cualitativa y no sustituye a una medición.

## Comparativa con modelos similares

No se dispone en la información proporcionada de los datos necesarios (parámetros, contexto, rendimiento, licencia) de los modelos comparables. La propia familia EfficientViM incluye otras variantes (m1, m3, etc.) y el ecosistema timm ofrece otros backbones ligeros, pero sus cifras no aparecen en la información consultada.

| Modelo | Parámetros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| efficientvim_m2.e450_in1k | 13,9 M | 224 x 224 px | no disponible | MIT | HuggingFace (timm) |
| Otras variantes de EfficientViM (m1, m3, …) | no disponible | no disponible | no disponible | no disponible | Repositorio del artículo |
| Otros backbones ligeros de timm (MobileNet, EfficientNet, etc.) | no disponible | no disponible | no disponible | no disponible | HuggingFace (timm) |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni razonamiento en varios pasos.
- El clasificador estándar está limitado a las 1000 clases de ImageNet-1k; usarlo fuera de ese conjunto de categorías exige eliminar la cabeza (`num_classes=0`) y ajustar una nueva.
- La resolución de entrada documentada es de 224 x 224 píxeles; no se han publicado resultados con otras resoluciones, y forzar entradas distintas requiere interpolar posiciones o transformar, con degradación no cuantificada.
- Sesgos conocidos: al entrenarse sobre ImageNet-1k, hereda los sesgos de representación de ese dataset (clases sobrerrepresentadas, sesgos geográficos y culturales en categorías de objetos, personas y contextos).
- Riesgo de error fuera de distribución: en dominios como imagen médica, satelital o industrial, la precisión caerá sin ajuste fino, y el modelo puede producir clasificaciones erróneas con alta confianza.
- No se han publicado en la información disponible datos de calibración, robustez ante perturbaciones o ataques adversariales.
- Licencia MIT: permite uso comercial y modificación, pero deben revisarse los términos del dataset de entrenamiento (ImageNet-1k) y de cualquier dato propio que se use en el ajuste fino.
- Adopción comunitaria nula en el momento de la consulta (0 descargas, 0 likes), lo que implica poca validación independiente y ausencia de informes de terceros sobre su comportamiento en producción.
- Al ser un modelo de visión, no presenta limitaciones idiomáticas en el sentido habitual, pero tampoco ofrece capacidades multilingües de ningún tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/efficientvim_m2.e450_in1k
- Artículo (arXiv): https://arxiv.org/abs/2411.15241
- Repositorio original de los autores: https://github.com/mlvlab/EfficientViM
- Librería timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Resultados y métricas de modelos timm: https://github.com/huggingface/pytorch-image-models/tree/main/results
- Organización timm en HuggingFace: https://huggingface.co/timm
- Documentación de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
