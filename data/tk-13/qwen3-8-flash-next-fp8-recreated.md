# TK-13/Qwen3.8-Flash-Next-FP8-Recreated

## Resumen

Qwen3.8-Flash-Next-FP8-Recreated es una recreación independiente del checkpoint FP8 oficial de Qwen3.8-Flash-Next, publicada por el usuario TK-13. El modelo base es un transformer de tipo mezcla de expertos (MoE) desarrollado por Qwen, con 179.999.981.459 parámetros totales según los pesos en safetensors, orientado a tareas multimodales de imagen-texto a texto. Esta recreación no es un modelo nuevo: es una reproducción bit a bit del FP8 oficial a partir del release en BF16, con el objetivo de documentar la receta de cuantización.

La relevancia de esta ficha es doble. Por un lado, permite entender las características del modelo subyacente (arquitectura MoE, pipeline image-text-to-text, licencia comunitaria de Qwen). Por otro, aclara que para servir en producción debe usarse el repositorio oficial, ya que esta copia existe principalmente como artefacto de reproducibilidad y verificación.

El autor declara que los 152.089 tensores son idénticos bit a bit al checkpoint FP8 oficial (rev `236dfdf2`), derivados del release BF16 (rev `de4b8e4d`). No hay afiliación ni respaldo por parte de Qwen. La model card completa con la receta y los detalles de verificación está anunciada pero no publicada en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), multimodal imagen-texto a texto |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint publicado); el base BF16 permite otras cuantizaciones no documentadas aquí |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), tal como indican las etiquetas `moe` y `qwen3_8`, y está configurado para el pipeline `image-text-to-text`, lo que implica un codificador visual acoplado a un decodificador de lenguaje. Los pesos suman aproximadamente 180.000 millones de parámetros totales. No se dispone de información sobre el número de parámetros activos por token, el número de expertos, la longitud de contexto nativa ni la composición del dataset de entrenamiento en la información proporcionada.

Esta recreación concreta no ha sido entrenada: es el resultado de cuantizar el release BF16 a FP8 siguiendo la receta oficial, con un `quantization_config` idéntico al del checkpoint oficial. El autor afirma que los 152.089 tensores resultantes son bit a bit idénticos al FP8 oficial. Los únicos archivos modificados respecto al release de Qwen son los `model-*.safetensors`, el `config.json` (con el bloque `quantization_config` añadido) y el `README.md`; el resto de archivos permanece sin cambios. No hay información disponible sobre RLHF, DPO ni otras etapas de alineamiento en la documentación accesible.

## Capacidades

- Generación de texto y razonamiento conversacional, según la etiqueta `conversational` y el pipeline declarado.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`), lo que permite tareas de comprensión visual y respuesta en lenguaje natural.
- Arquitectura MoE, que en la familia Qwen suele asociarse a un buen equilibrio entre capacidad total y coste de inferencia por token, aunque no se detallan los parámetros activos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue en infraestructuras de inferencia gestionadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, modo thinking o soporte de agentes: no disponibles en la información proporcionada.

## Casos de uso

- Reproducibilidad y auditoría de cuantización: el caso de uso principal de este repositorio es verificar que una receta FP8 reproduce exactamente el checkpoint oficial. Un equipo de infraestructura puede comparar hashes tensor a tensor para validar su propio pipeline de cuantización antes de aplicarlo a otros modelos.
- Investigación sobre cuantización FP8 en modelos MoE: al ser una reproducción bit a bit, sirve como referencia para estudiar cómo se comporta la cuantización FP8 en un modelo de ~180.000 millones de parámetros con arquitectura de expertos.
- Evaluación de modelos multimodales: el pipeline image-text-to-text permite integrar el modelo en bancos de pruebas de comprensión de imágenes, comparando la versión FP8 con el base BF16 en tareas de descripción, VQA o extracción de información de documentos.
- Despliegue en entornos con memoria limitada: el formato FP8 reduce a la mitad el espacio frente a BF16, lo que facilita servir un modelo de este tamaño en clústeres con GPUs de 80 GB, aunque para producción se recomienda el repositorio oficial.
- Docencia y formación técnica: el repositorio documenta de forma explícita qué archivos cambian en una cuantización FP8, lo que lo convierte en material útil para explicar el proceso en cursos de ingeniería de ML.
- Base para experimentos de ajuste fino: al mantener la estructura de `transformers` y safetensors, puede cargarse con las herramientas habituales para probar técnicas de adaptación sobre un checkpoint FP8, siempre respetando la licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 180 GB solo para pesos (179.999.981.459 parámetros a 1 byte por parámetro), más overhead de activaciones, caché KV y buffers. En BF16 serían unos 360 GB.
- GPU recomendadas: para FP8 se necesitan al menos 3 GPUs de 80 GB (H100, H200, A100 80 GB no soporta FP8 nativo de forma óptima) o configuraciones multi-GPU equivalentes. Para BF16, al menos 5 GPUs de 80 GB.
- No cabe en GPUs de consumo: una RTX 4090 con 24 GB no puede alojar el modelo completo ni siquiera en cuantizaciones agresivas de 4 bits sin descarga a CPU, lo que haría la inferencia inviable en producción.
- Opciones de despliegue: `transformers` con aceleración FP8, vLLM (soporte FP8 en H100/H200), TGI y endpoints compatibles. llama.cpp y Ollama no están orientados a este tamaño ni a FP8 en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8-Recreated (TK-13) | ~180.000 M | no disponible | imagen-texto | Qwen Community 1.0 | HuggingFace (este repo) |
| Qwen/Qwen3.8-Flash-Next-FP8 (oficial) | ~180.000 M | no disponible | imagen-texto | Qwen Community 1.0 | HuggingFace (recomendado para servir) |
| Qwen/Qwen3.8-Flash-Next (BF16) | ~180.000 M | no disponible | imagen-texto | Qwen Community 1.0 | HuggingFace |

No se dispone de información sobre modelos de otros fabricantes comparables en tamaño, contexto o rendimiento dentro de la documentación proporcionada.

## Limitaciones y advertencias

- Este repositorio no está pensado para servir en producción: el propio autor indica que debe usarse el repositorio oficial para despliegue.
- No hay afiliación ni respaldo de Qwen; se trata de una recreación de terceros.
- La model card completa con la receta de cuantización y los detalles de verificación está pendiente de publicación, por lo que la reproducibilidad no puede auditarse todavía a partir de la documentación.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base.
- No se detallan los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas distintas del inglés sin pruebas propias.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE antes de cualquier despliegue productivo.
- El tamaño del repositorio (185,6 GB) y del modelo (~180.000 M de parámetros) exigen infraestructura multi-GPU; no es viable en hardware de consumo.
- El modelo tiene muy poca tracción (76 descargas, 0 likes) y una única revisión, lo que reduce la confianza en su mantenimiento a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TK-13/Qwen3.8-Flash-Next-FP8-Recreated
- Checkpoint FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Release BF16 base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: archivo LICENSE dentro del repositorio (Qwen Community License 1.0)
