# themohal/trocr-small-saraiki

## Resumen

El modelo `themohal/trocr-small-saraiki` es un adaptación del modelo TrOCR (Transformer-based Optical Character Recognition) en su variante "small", aparentemente entrenado o ajustado para el reconocimiento de texto en idioma saraiki, una lengua indoaria hablada principalmente en la provincia de Punjab (Pakistán). El autor, `themohal`, publicó el modelo en HuggingFace en agosto de 2026, con un tamaño de repositorio de 1,5 GB, lo que sugiere que contiene pesos completos en formato safetensors.

La información pública disponible es muy limitada: no se especifican la licencia, los idiomas soportados, el pipeline ni detalles de entrenamiento. A pesar de ello, por el nombre y la arquitectura típica de TrOCR, se puede inferir que se trata de un modelo encoder-decoder basado en Transformer, diseñado para transcribir imágenes de texto a secuencias de caracteres. Su relevancia radica en la escasez de modelos OCR específicos para lenguas minoritarias como el saraiki, lo que podría facilitar la digitalización de documentos en esa lengua.

No obstante, al carecer de documentación técnica oficial, cualquier uso en producción debe realizarse con cautela y tras una validación empírica del rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente TrOCR, encoder-decoder Transformer) |
| Parametros totales | no disponible (variante "small" de TrOCR, típicamente ~60M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene safetensors) |
| Idiomas soportados | no disponible (presumiblemente saraiki) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura, los datos de entrenamiento o el proceso de ajuste. Por el nombre, se asume que sigue la arquitectura TrOCR original de Microsoft, que combina un encoder de visión (típicamente DeiT o BEiT) con un decoder de texto basado en Transformer, preentrenado en grandes corpus de imágenes de texto impreso y manuscrito. El ajuste para saraiki probablemente se realizó sobre un conjunto de imágenes etiquetadas en ese idioma, pero no se dispone de detalles sobre el número de tokens, la composición del dataset o si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de texto, presumiblemente en idioma saraiki.
- Generación de secuencias de texto a partir de imágenes (transcripción).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión general o capacidades multilingües más allá del saraiki.

## Casos de uso

- Digitalización de documentos históricos o administrativos en saraiki: el modelo puede transcribir escaneos de libros, cartas o formularios escritos en esta lengua, facilitando su búsqueda y archivo.
- Accesibilidad para hablantes de saraiki: conversión de imágenes de texto (carteles, menús, señales) a texto digital legible por lectores de pantalla.
- Investigación lingüística: extracción de corpus textuales en saraiki a partir de imágenes para estudios de morfología, sintaxis o lexicografía.
- Sistemas de traducción automática: como paso previo a la traducción de documentos en saraiki a otros idiomas, el OCR permite obtener el texto fuente.
- Archivado de prensa local: transcripción de periódicos o boletines impresos en saraiki para su indexación en bases de datos.
- Educación: digitalización de libros de texto en saraiki para plataformas de aprendizaje en línea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del repositorio (1,5 GB), se estima que el modelo completo en FP32 ocupa alrededor de 1,5 GB, por lo que podría caber en GPUs con 4 GB de VRAM o más, pero no hay confirmación oficial.
- GPU recomendadas: no disponible. Para inferencia en tiempo real se recomendaría al menos una GPU de gama media (por ejemplo, RTX 3060 o superior), pero no hay datos concretos.
- Si cabe en consumer GPU: probablemente sí, dado el tamaño, pero sin confirmación.
- Opciones de despliegue: al ser un modelo de HuggingFace con pesos en safetensors, se puede cargar con la librería `transformers` de HuggingFace. También podría convertirse a ONNX o GGUF para su uso con llama.cpp u Ollama, aunque no hay guías oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa. Como referencia, existen otros modelos TrOCR publicados por Microsoft (por ejemplo, `microsoft/trocr-small-printed` o `microsoft/trocr-base-handwritten`) que están preentrenados para inglés y otros idiomas, pero no hay datos públicos sobre su rendimiento en saraiki. La comparativa queda pendiente de una evaluación empírica.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información. Al ser un modelo ajustado para un idioma específico, puede presentar sesgos derivados del corpus de entrenamiento.
- Riesgo de alucinacion: como todo modelo OCR, puede generar texto plausible pero incorrecto, especialmente en imágenes de baja calidad o con ruido.
- Limitaciones de contexto o idioma: el modelo está orientado al saraiki; su rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Caveat importante: la falta de documentación técnica y de benchmarks hace que su uso en entornos críticos sea arriesgado sin una validación previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/themohal/trocr-small-saraiki
