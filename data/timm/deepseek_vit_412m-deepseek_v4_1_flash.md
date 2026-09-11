# timm/deepseek_vit_412m.deepseek_v4_1_flash

## Resumen

`timm/deepseek_vit_412m.deepseek_v4_1_flash` es un codificador de características visuales (image feature encoder) de 411,8 millones de parámetros extraído del modelo multimodal DeepSeek-V4.1-Flash y publicado en formato nativo de la librería timm por Ross Wightman. No se trata de un modelo nuevo ni de un fine-tuning: es un remapeo directo de los pesos de visión originales, sin entrenamiento adicional, que conserva únicamente la torre visual. El checkpoint no incluye pesos del modelo de lenguaje ni ninguna cabeza de clasificación entrenada.

El modelo resuelve un problema concreto: permitir que la torre visual de DeepSeek-V4.1-Flash se use de forma aislada dentro del ecosistema timm, con transformaciones de datos, APIs de mapas intermedios y utilidades de fine-tuning ya integradas. Frente a tener que cargar el código de inferencia propietario del repositorio original, esta versión ofrece `forward()`, `forward_features()`, `forward_intermediates()` y `features_only=True` con la firma estándar de timm.

Técnicamente emplea parches de 14×14, MLP con SwiGLU, RMSNorm y RoPE axial 2D sin embeddings posicionales absolutos aprendidos, con un ancho de backbone de 1024. La resolución de referencia es 546×546 píxeles, lo que produce una rejilla de 39×39 parches (1.521 tokens de parche) y un coste de 777,7 GMACs por imagen. La licencia es MIT, heredada de la revisión concreta del modelo origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) con parches de 14×14, MLP SwiGLU, RMSNorm y RoPE axial 2D; sin embeddings posicionales absolutos aprendidos; proyección lineal de parches reformulada como Conv2d |
| Parámetros totales | 411.842.560 (411,8 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de imagen de 546×546 px con parches de 14×14, equivalentes a 1.521 tokens de parche |
| Tipos de cuantización | No disponible; el repositorio publica pesos en safetensors y no documenta variantes cuantizadas |
| Idiomas soportados | No disponible; es un modelo exclusivamente visual, sin procesamiento de lenguaje |
| Licencia | MIT, heredada de DeepSeek-V4.1-Flash (revisión dba1be0a40aa45a94ad051997016db3960a90277) |
| Formato de pesos | safetensors (formato nativo de timm sobre PyTorch) |
| Tipo de modelo | Image feature encoder |
| Ancho del backbone | 1024 |
| Resolución de entrada de referencia | 546 × 546 |
| GMACs | 777,7 |
| Activaciones | 1.759,2 M |
| Tamaño del repositorio | 1,6 GB |
| Cabeza de clasificación | No incluida; `num_classes` crea una cabeza lineal inicializada aleatoriamente |
| Pesos de modelo de lenguaje | No incluidos |
| Idiomas declarados en la ficha | No disponibles |

## Arquitectura y entrenamiento

El backbone es un transformer de visión puro. Cada imagen se divide en parches de 14×14 píxeles mediante una proyección lineal que se ha reformulado como `Conv2d` sin alterar el cómputo. Los bloques internos usan MLP con activación SwiGLU y normalización RMSNorm, y la información posicional se inyecta con RoPE axial 2D en lugar de embeddings absolutos aprendidos, lo que permite trabajar con rejillas de distinta resolución. El checkpoint se publica en tres variantes funcionales: la variante plana (clasificador listo para añadir cabeza), `_enc` y `_align`. La variante `_align` incorpora el alineador nativo, que agrupa tokens de parche en bloques de 3×3 en orden channel-major y los proyecta al ancho del LLM de origen mediante un MLP GELU de dos capas; los grupos incompletos se rellenan con ceros por abajo y por la derecha.

Sobre el entrenamiento no hay información en la documentación disponible: no se indica número de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO. El propio autor aclara que este checkpoint es un remapeo de los pesos de visión originales sin entrenamiento adicional, por lo que el entrenamiento es el de DeepSeek-V4.1-Flash, descrito únicamente en su informe técnico *DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression*. La innovación destacable de esta ficha es de integración, no de entrenamiento: `forward_features()` devuelve características NHWC con RMSNorm final, `forward()` devuelve tokens NLC en la variante `_enc` o embeddings de imagen con pooling en la variante de clasificador, y `forward_intermediates()` / `features_only=True` exponen mapas intermedios del backbone (sin el alineador), con la opción `norm=True` para aplicar la RMSNorm final del codificador.

## Capacidades

- Extracción de embeddings de imagen globales: `forward()` devuelve un vector de 1024 dimensiones por imagen tras pooling promedio y RMSNorm sin afines.
- Extracción de características densas: `forward_features()` devuelve un tensor NHWC de forma (1, 39, 39, 1024) para una entrada de 546×546, lo que permite usos que requieren información espacial.
- Mapas intermedios multinivel: `forward_intermediates()` y `features_only=True` devuelven mapas por etapa, útiles para detección, segmentación o adaptación con cabezas densas.
- Proyección al espacio del LLM de origen: la variante `_align` transforma los tokens visuales al ancho del modelo de lenguaje de DeepSeek-V4.1-Flash mediante un MLP GELU de dos capas, con agrupación 3×3 y relleno de ceros en grupos incompletos.
- Adaptación a clasificación: se puede instanciar con `num_classes=N` para obtener una cabeza lineal, que se inicializa de forma aleatoria y debe entrenarse.
- Entradas rectangulares: soporta imágenes no cuadradas siempre que las dimensiones sean divisibles por 14; con `dynamic_img_pad=True` se rellena con ceros por abajo y por la derecha hasta un múltiplo del tamaño de parche.
- Preprocesado integrado: normalización con media (0,5, 0,5, 0,5) y desviación (0,5, 0,5, 0,5), redimensionado bicúbico, `crop_mode="border"` y `crop_pct=1.0` en la transformación por defecto de timm, con lienzo gris (128) para preservar la relación de aspecto.
- Soporte de tool calling / function calling: no aplica, el modelo no es generativo ni procesa texto.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo thinking, visión de vídeo o audio: no disponible / no soportado.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: el embedding global de 1024 dimensiones sirve como firma compacta para indexar catálogos de imágenes en bases de datos vectoriales y resolver consultas por similitud, sin necesidad de cargar la torre de lenguaje.
- Re-ranking en pipelines RAG multimodales: con la variante `_align`, los tokens visuales se proyectan al ancho del LLM de origen, lo que permite alimentar un modelo de lenguaje con representaciones visuales ya alineadas y evitar reentrenar el proyector.
- Fine-tuning de clasificación de imágenes: partiendo del backbone preentrenado se añade una cabeza lineal con `num_classes=N` y se entrena sobre el dataset objetivo; el coste de 411,8 M de parámetros permite ajustar en una GPU de gama alta con memoria suficiente.
- Detección y segmentación con cabezas densas: `forward_intermediates()` y `features_only=True` entregan mapas de (1, 1024, 39, 39), adecuados para acoplar cabezas tipo FPN o decodificadores de segmentación que necesitan resolución espacial.
- Deduplicación y clustering de datasets de imagen a gran escala: los embeddings permiten agrupar o detectar casi duplicados antes de entrenar otros modelos, reduciendo coste de anotación y sesgo de repetición.
- Inicialización de modelos visión-lenguaje: al tratarse de la torre visual de un sistema multimodal real, es un punto de partida razonable para experimentos de VLM cuando no se quiere depender del código de inferencia propietario.
- Control de calidad industrial con imágenes de alta resolución: la resolución de 546×546 con parches de 14×14 y el soporte de entradas rectangulares encajan con inspección de superficies donde el detalle fino importa, y el modelo puede desplegarse en una GPU de consumo si se usa precisión reducida.
- Teledetección y análisis de imágenes aéreas: la rejilla de 39×39 parches y la ausencia de embeddings posicionales absolutos facilitan adaptar la entrada a recortes de distinta proporción sin romper el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de ImageNet, zero-shot, recuperación ni ninguna otra tarea estándar. Los únicos datos cuantitativos publicados son de coste computacional:

| Métrica | Valor |
|---|---|
| GMACs (entrada 546×546) | 777,7 |
| Activaciones (M) | 1.759,2 |
| Parámetros (M) | 411,8 |

## Requisitos de hardware

- VRAM para pesos: aproximadamente 1,65 GB en fp32, 0,82 GB en fp16/bf16 y 0,41 GB en int8, calculado a partir de los 411,8 M de parámetros. El tamaño del repositorio (1,6 GB) es coherente con pesos en fp32.
- Activaciones: la ficha declara 1.759,2 M de activaciones para la entrada de referencia de 546×546, un orden de magnitud superior al de los pesos; en fp16 esto supone del orden de 3,5 GB adicionales en inferencia, por lo que la VRAM total práctica es notablemente mayor que la de los pesos.
- GPU recomendadas: no hay recomendaciones oficiales publicadas. Por tamaño, el modelo es holgadamente ejecutable en RTX 4090, RTX 3090, A100, H100 y cualquier GPU con 8 GB o más de VRAM en fp16.
- GPU de consumo: sí cabe. En fp16 cabe en tarjetas de 8 GB; en fp32 conviene disponer de al menos 4-6 GB solo para pesos, más el margen de activaciones.
- Opciones de despliegue: PyTorch y timm de forma nativa (`timm.create_model('hf-hub:timm/...')`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un codificador visual. Para servir en producción se puede exportar a ONNX o TorchScript, aunque no hay recetas publicadas.
- Latencia y throughput: no disponibles. El único indicador de coste es el dato de 777,7 GMACs por imagen a 546×546, que sitúa al modelo en un régimen de cómputo alto para su número de parámetros, debido a la resolución de entrada.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparación se limita a parámetros, tipo de entrada, licencia y disponibilidad. Las cifras de los modelos alternativos son valores de referencia pública y conviene verificarlas en sus fichas originales.

| Modelo | Parámetros | Tipo | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| deepseek_vit_412m.deepseek_v4_1_flash | 411,8 M | ViT encoder con alineador opcional | 546×546, parches 14×14 | No disponible | MIT | timm / HuggingFace |
| CLIP ViT-L/14 | ~304 M | ViT encoder con torre de texto | 224×224, parches 14×14 | No comparable aquí | MIT (verificar) | HuggingFace, ONNX, OpenCLIP |
| SigLIP SO400M | ~877 M | ViT encoder con torre de texto | 384×384, parches 14×14 | No comparable aquí | Apache-2.0 (verificar) | HuggingFace, transformers |
| DINOv2 ViT-L/14 | ~304 M | ViT auto-supervisado, solo visión | 518×518, parches 14×14 | No comparable aquí | Apache-2.0 (verificar) | HuggingFace, torch.hub |

Frente a CLIP y SigLIP, la diferencia principal es que este checkpoint no incluye torre de texto ni espacio de embeddings alineado con lenguaje, salvo por la variante `_align`, que proyecta al ancho del LLM de DeepSeek. Frente a DINOv2, la resolución de entrada es mayor que la de CLIP y comparable a la de DINOv2, pero no hay evaluación pública de calidad de representación.

## Limitaciones y advertencias

- No incluye pesos de modelo de lenguaje ni cabeza de clasificación entrenada; cualquier uso supervisado requiere entrenar la cabeza, que se inicializa aleatoriamente.
- No hay resultados de benchmarks publicados, por lo que no es posible comparar su calidad de representación con alternativas establecidas sin evaluarla uno mismo.
- El modelo no fue entrenado de forma adicional para esta publicación: se trata de un remapeo de pesos, así que las limitaciones del componente visual de DeepSeek-V4.1-Flash se heredan íntegramente.
- Las dimensiones de entrada deben ser divisibles por 14 por defecto. Con `dynamic_img_pad=True` se rellena con ceros normalizados, pero la documentación advierte de que esto no reproduce la política de redimensionado adaptativo del procesador original.
- Diferencias de preprocesado respecto al original: timm usa relleno gris 128 mientras que el procesador original usa gris 127, y el transform por defecto de timm selecciona dimensiones de lienzo fijas frente a las dimensiones variables del procesador original. Esto puede introducir desviaciones si se comparan embeddings entre ambas implementaciones.
- Sesgos conocidos: no disponibles. No hay documentación sobre composición del dataset de entrenamiento, sesgos demográficos ni sesgos de dominio.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de representaciones erróneas o poco informativas en dominios alejados de los datos de entrenamiento; no hay evaluación publicada que lo cuantifique.
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Restricciones de licencia: MIT, lo que permite uso comercial, modificación y redistribución. La licencia se hereda de la revisión concreta dba1be0a40aa45a94ad051997016db3960a90277 del modelo origen; si esa revisión cambia o se retira, la base legal del remapeo debería revisarse.
- Metadatos del repositorio: cero descargas y cero likes en el momento de la consulta, y ausencia total de validación comunitaria de la calidad del remapeo.
- Idoneidad para producción: al no haber latencia, throughput ni evaluación de precisión publicados, desplegarlo en producción exige una batería de pruebas propia contra el caso de uso objetivo.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/timm/deepseek_vit_412m.deepseek_v4_1_flash
- Modelo base DeepSeek-V4.1-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Revisión concreta del modelo origen: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/tree/dba1be0a40aa45a94ad051997016db3960a90277
- Licencia del modelo origen: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/LICENSE
- Código de visión original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/inference/vision.py
- Preprocesado original de imágenes: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/inference/image_processor.py
- Informe técnico de DeepSeek-V4.1-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- DOI de timm: https://doi.org/10.5281/zenodo.4414861
