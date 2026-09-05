# vohoangkh4ng/chinese-clip-ft-sinonom

## Resumen

`chinese-clip-ft-sinonom` es un modelo de extracción de características de imagen desarrollado por `vohoangkh4ng` como parte de un proyecto de curso sobre búsqueda de similitud en un corpus de 26.044 glifos Sino-Nôm (Hán-Nôm). Consiste en un fine-tuning de la torre de imagen del modelo `OFA-Sys/chinese-clip-vit-base-patch16` (Chinese-CLIP ViT-B/16) para lograr invariancia tipográfica: el mismo carácter Unicode renderizado en diferentes fuentes debe mapear al mismo vector.

El problema que resuelve es la recuperación de glifos a partir de escaneos manuscritos, donde la consulta es una imagen manuscrita y el corpus está compuesto por texto impreso en estilo regular. Este desajuste de distribución hace que los modelos zero-shot tengan un rendimiento pobre. El modelo se entrena con un objetivo de aprendizaje métrico supervisado (SupCon), usando únicamente el codepoint Unicode como etiqueta, y consigue un hit@1 de 0.5932 sobre 59 escaneos reales, frente a 0.0169 del modelo base sin ajustar. Los pesos se distribuyen en formato fp16 y el tamaño del repositorio es de 0.2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chinese-CLIP ViT-B/16 (torre de imagen) |
| Parametros totales | no disponible |
| Longitud de contexto | No aplica (modelo de extraccion de caracteristicas de imagen) |
| Tipos de cuantizacion | fp16 (pesos almacenados en fp16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch .pt (best_fp16.pt) |

## Arquitectura y entrenamiento

El modelo parte de la torre de imagen de `ChineseCLIPModel` con backbone ViT-B/16. Durante el fine-tuning se descarta la torre de texto y solo se optimizan los pesos de visión. El objetivo de entrenamiento es SupCon (InfoNCE supervisado) con temperatura 0.07, donde las etiquetas son exclusivamente el codepoint Unicode del carácter. El muestreo por lotes es P×K: 24 clases × 2 vistas por lote, una elección necesaria porque un lote aleatorio de 48 imágenes extraído de 23.440 clases contiene aproximadamente 0.05 pares positivos esperados.

El dataset de entrenamiento consta de 141.981 imágenes distribuidas en 23.440 clases, renderizadas a través de 7 fuentes Hán-Nôm. Se aplica una degradación de escaneo de forma online (probabilidad 0.6, fuerza 1.0), calibrada con medidas de escaneos reales (borde, contraste, grosor de trazo, relleno, ruido, fondo). El optimizador es AdamW con lr 1e-5, warmup de 300 pasos, programación coseno, bf16 y gradient checkpointing. Se entrenó durante 6 épocas, obteniendo el mejor resultado en la época 5, con aproximadamente 4 minutos por época y 3.7 GB de VRAM. También se documenta un intento fallido con una cabeza ArcFace sobre 23.440 clases que colapsó, reduciendo el hit@1 de 0.79 a 0.0035 en clases vistas y de 0.80 a 0.0050 en no vistas tras una época.

## Capacidades

- Recuperación de imágenes de glifos Sino-Nôm (Hán-Nôm) a partir de escaneos manuscritos, con consultas manuscritas semicursivas y corpus impreso en estilo regular.
- Invariancia tipográfica: el mismo codepoint Unicode renderizado en diferentes fuentes produce vectores de características equivalentes.
- Extracción de características de imagen (pipeline `image-feature-extraction`) con salida de embeddings normalizados, de modo que la similitud coseno equivale al producto escalar.
- Generalización a clases no vistas: se evaluó con 2.604 clases retenidas por clase (todas las vistas eliminadas), obteniendo un hit@1 de 0.9939 tras el fine-tuning, prácticamente idéntico al de las clases vistas (0.9954).
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es exclusivamente un extractor de características visuales.
- Compatible con la API de HuggingFace Transformers, cargando el estado directamente en `ChineseCLIPModel`.

## Casos de uso

- Búsqueda de similitud en corpus de glifos Sino-Nôm: dado un escaneo manuscrito de un carácter, el modelo recupera el glifo impreso correspondiente entre los 26.044 caracteres del corpus, con un hit@1 de 0.5932 y un MRR de 0.6691.
- Digitalización de manuscritos históricos: investigadores pueden usar el modelo para asistir en la transcripción de textos Hán-Nôm, comparando cada carácter manuscrito con una base de datos de glifos impresos.
- Verificación de variantes tipográficas: permite comprobar que diferentes fuentes representan el mismo codepoint Unicode, agrupando imágenes por su vector de características.
- Clasificación de caracteres por codepoint: el modelo puede agrupar imágenes de glifos según su valor Unicode, útil para organizar corpus de caracteres antiguos.
- Integración en pipelines de OCR para documentos históricos: como paso de recuperación o verificación, donde se extraen características de regiones de imagen y se comparan con un índice precomputado de glifos.
- Evaluación de sistemas de reconocimiento de escritura: sirve como referencia de rendimiento para tareas de recuperación de caracteres, proporcionando métricas como hit@1, hit@10 y MRR.
- Investigación en aprendizaje métrico: ejemplo práctico de fine-tuning con SupCon para lograr invariancia tipográfica, con documentación de estrategias de muestreo y aumento de datos.

## Benchmarks y rendimiento

La evaluación se realizó sobre 59 escaneos manuscritos reales, cuyas etiquetas se decodifican de los nombres de archivo y se verifican manualmente. Ningún píxel del conjunto de evaluación entró en el entrenamiento, garantizado por una aserción en el código. La recuperación se realiza sobre todo el corpus de 26.044 caracteres.

| Modelo | hit@1 | hit@10 | hit@20 | MRR | IC 95% de hit@1 |
|---|---:|---:|---:|---:|---|
| `chinese-clip` zero-shot (base) | 0.0169 | 0.0678 | — | 0.0327 | — |
| `chinese-clip-large` zero-shot | 0.0847 | 0.1864 | 0.2034 | 0.1143 | [0.028, 0.187] |
| **este modelo** | **0.5932** | **0.7966** | **0.8644** | **0.6691** | **[0.457, 0.719]** |

Los dos intervalos de confianza son disjuntos. La línea base aleatoria es 4.7e-4, por lo que el hit@1 es aproximadamente 1250 veces el azar. En el ranking dentro de un grupo de candidatos con la misma lectura (mediana de 7 candidatos), la precisión top-1 es 0.8136, frente a 0.4746 del modelo large zero-shot y 0.4407 de una línea base basada en histograma de color.

Prueba de no memorización: se retuvieron 2.604 clases Unicode por clase, eliminando todas sus vistas. Los resultados antes y después del fine-tuning son:

| | clases entrenadas | clases retenidas |
|---|---:|---:|
| antes del fine-tuning | 0.7938 | 0.8041 |
| después del fine-tuning | 0.9954 | 0.9939 |

## Requisitos de hardware

- VRAM durante el entrenamiento: 3.7 GB, según el autor, con bf16 y gradient checkpointing.
- VRAM para inferencia: no disponible en la información proporcionada; al ser una torre de imagen ViT-B/16 en fp16, es previsible que quepa en GPUs de consumo, pero no hay cifras oficiales.
- GPU recomendadas: no especificadas por el autor.
- Despliegue: compatible con HuggingFace Transformers mediante `ChineseCLIPModel` y `AutoImageProcessor`. El repositorio está marcado como `endpoints_compatible` en HuggingFace, lo que permite su uso en Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se centra en la tarea de recuperación de glifos Sino-Nôm, ya que no hay otros modelos específicos para este dominio. Se comparan con el modelo base y con la variante large sin ajustar.

| Modelo | Arquitectura | hit@1 | MRR | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `chinese-clip-ft-sinonom` | ViT-B/16 fine-tuned | 0.5932 | 0.6691 | Apache-2.0 | HuggingFace |
| `chinese-clip` zero-shot base | ViT-B/16 | 0.0169 | 0.0327 | Apache-2.0 | HuggingFace |
| `chinese-clip-large` zero-shot | ViT-Large (no especificado) | 0.0847 | 0.1143 | Apache-2.0 | HuggingFace |

Los parámetros totales de cada variante no se indican en la información disponible. La principal ventaja del modelo ajustado es el salto en hit@1, que supera ampliamente a las versiones zero-shot, aunque su rendimiento es específico para la distribución manuscrito-impreso evaluada.

## Limitaciones y advertencias

- Una sola ejecución, una semilla. El hit@1 por época varió entre 0.51 y 0.59, lo que indica que la medición tiene ruido; el valor de 0.5932 debe interpretarse como "alrededor de 0.55".
- El conjunto de evaluación real es pequeño (n=59). Solo la diferencia entre zero-shot y fine-tuned es lo suficientemente grande como para superar el intervalo de confianza; comparaciones más pequeñas no son resolubles.
- El backbone es ViT-B/16, no large, por una restricción de VRAM durante el entrenamiento, no por una elección de modelado. El fine-tuning de la variante large no se ha probado.
- Las imágenes renderizadas no son adecuadas para evaluar este modelo, ya que pertenecen a su distribución de entrenamiento; los renders limpios y degradados saturan por encima de 0.98. Para una evaluación válida se deben usar escaneos reales.
- Las consultas son manuscritas semicursivas y el corpus es impreso regular. Todos los números reportados describen únicamente esa pareja de distribuciones; el comportamiento en otros escenarios puede diferir.
- Las fuentes cubren solo estilos impresos. La caligrafía real con pincel difiere estructuralmente, no solo en ruido, y la degradación de imagen no puede sintetizarla.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con fuentes impresas, su rendimiento puede degradarse con caligrafía artística o variantes no cubiertas.
- La licencia Apache-2.0 permite uso comercial, pero requiere conservar el aviso de licencia y atribución.
- Los pesos no incluyen la torre de texto; al cargar el estado en `ChineseCLIPModel` se debe usar `strict=False` y verificar que no falte ninguna clave de visión, ya que una carga parcial silenciosa sería un fallo crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vohoangkh4ng/chinese-clip-ft-sinonom
- Modelo base: https://huggingface.co/OFA-Sys/chinese-clip-vit-base-patch16
- Repositorio de Chinese-CLIP: https://github.com/OFA-Sys/Chinese-CLIP
