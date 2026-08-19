# swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ4e-mtp

## Resumen

El modelo `swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ4e-mtp` es una cuantización de 4 bits (con group size 64) del modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, realizada con la herramienta oQ (oMLX v0.6.0rc1) en formato MLX safetensors. Está diseñado para ejecutarse en Apple Silicon mediante la librería MLX, lo que permite desplegar un modelo de gran tamaño en hardware de consumo con memoria unificada. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo original es multimodal (procesa imágenes y texto) y conversacional.

A pesar del nombre que sugiere 27 mil millones de parámetros, el archivo safetensors contiene 4.939.569.392 parámetros (aproximadamente 4,94 mil millones). Esta discrepancia puede deberse a un error de nomenclatura o a que el modelo base real tiene ese tamaño. El repositorio ocupa 17,0 GB, coherente con una cuantización 4-bit de un modelo de ~5B parámetros. El modelo fue publicado el 16 de agosto de 2026 y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags; sin detalles adicionales) |
| Parametros totales | 4.939.569.392 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, group size 64 (oQ4e) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5`, que sugiere una variante de la familia Qwen 3.5. El pipeline `image-text-to-text` indica que el modelo original combina un codificador visual con un decodificador de lenguaje, pero no se especifican detalles como el tipo de attention, el número de capas o la estrategia de entrenamiento. La cuantización fue realizada con oQ (oMLX v0.6.0rc1) en modo mixed-precision, reduciendo los pesos a 4 bits con un group size de 64. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas como RLHF o DPO.

## Capacidades

- Procesamiento de imágenes y texto (pipeline `image-text-to-text`), lo que permite tareas como respuesta a preguntas visuales, descripción de imágenes o diálogo multimodal.
- Conversación multi-turno (etiqueta `conversational`), aunque no se detalla la longitud de contexto soportada.
- Compatible con MLX, lo que permite ejecución eficiente en Apple Silicon.
- Al ser un modelo "uncensored" (según el nombre), puede generar contenido sin filtros de seguridad, aunque esto no está confirmado por el autor.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso o capacidades multilingües específicas.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede integrarse en aplicaciones de chat que acepten imágenes como entrada, por ejemplo para responder preguntas sobre fotografías o documentos escaneados.
- Análisis de imágenes en entornos Apple: gracias a MLX, puede ejecutarse localmente en Macs con chip M-series, útil para prototipos o aplicaciones con requisitos de privacidad.
- Generación de descripciones de imágenes para accesibilidad o indexación de contenido.
- Experimentación con cuantización 4-bit en MLX: sirve como referencia para desarrolladores que quieran evaluar el impacto de la cuantización oQ en modelos multimodales.
- Investigación sobre modelos sin censura: el nombre sugiere que el modelo base no tiene restricciones de contenido, lo que podría interesar a investigadores de seguridad o alineación, aunque con precaución.
- Despliegue en edge computing con hardware Apple: su tamaño reducido (~17 GB) permite cargarlo en Macs con 32 GB de memoria unificada o más, evitando dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo está diseñado para MLX, por lo que requiere un Mac con chip Apple Silicon (M1, M2, M3, M4 o posteriores) y memoria unificada suficiente.
- El repositorio ocupa 17,0 GB, por lo que se recomienda al menos 24 GB de RAM unificada para cargar el modelo y dejar espacio para el contexto y los cálculos.
- Con cuantización 4-bit, el tamaño en memoria del modelo es aproximadamente 2,5 GB (4,94B parámetros × 0,5 bytes/parámetro), pero los archivos del repo incluyen otros tensores y metadatos, de ahí el tamaño de 17 GB.
- Para inferencia con contexto largo, se recomienda 32 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería nativa), posiblemente a través de herramientas como `mlx-lm` u otras que soporten el formato MLX safetensors. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la informacion proporcionada. El modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` no tiene ficha pública en HuggingFace, y no se han encontrado alternativas de la misma categoría (multimodal, cuantizado 4-bit, MLX) con datos suficientes para una comparación objetiva.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir pérdida de precisión en tareas complejas como razonamiento matemático o generación de código, aunque no se han evaluado los efectos en este modelo concreto.
- El nombre "UNCENSORED" sugiere que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No se recomienda su uso en producción sin una capa de moderación adicional.
- No se dispone de licencia declarada, lo que genera incertidumbre legal sobre su uso comercial o redistribución.
- Los idiomas soportados no están especificados; es probable que el modelo base esté entrenado principalmente en inglés, pero no se confirma.
- No hay información sobre la longitud de contexto, lo que limita el diseño de aplicaciones que requieran ventanas largas.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad y puede contener errores o problemas de calidad.
- La discrepancia entre el nombre (27B) y el número real de parámetros (~4,94B) indica una posible inconsistencia en la nomenclatura, lo que puede llevar a confusiones sobre el tamaño real del modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ4e-mtp)
- [Repositorio de oQ / oMLX](https://github.com/jundot/omlx) (mencionado en la model card)
