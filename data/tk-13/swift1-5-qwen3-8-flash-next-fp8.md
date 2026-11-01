# TK-13/Swift1.5-Qwen3.8-Flash-Next-FP8

## Resumen

Swift1.5-Qwen3.8-Flash-Next-FP8 es una cuantización no oficial en FP8 del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario TK-13 en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (MoE), construido sobre la familia Qwen3.8 y con 179.999.981.459 parámetros totales según los pesos en safetensors. El repositorio ocupa 185,6 GB y se distribuye bajo la licencia Swift Open License 1.0, que limita el uso comercial.

La relevancia de esta publicación es fundamentalmente técnica: el autor replica la receta exacta de cuantización FP8 empleada por Qwen en su checkpoint oficial Qwen3.8-Flash-Next-FP8, con expertos enrutados cuantizados en bloques de 128 x 128, escalas en BF16, activaciones dinámicas y sin calibración. Para validar la receta, el autor recreó bit a bit el checkpoint FP8 de Qwen a partir de su release en BF16, lo que aporta cierta garantía metodológica sobre el proceso.

No obstante, la información pública disponible es muy limitada: la model card indica explícitamente que la ficha completa con receta, validación y evaluación "llegará pronto", y no se han publicado resultados de benchmarks ni detalles sobre datos de entrenamiento, idiomas soportados o longitudes de contexto. Esta ficha recoge únicamente lo que puede confirmarse a partir de los metadatos y el README.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer; etiquetado como qwen3_8 / qwen4_exp |
| Parámetros totales | 179.999.981.459 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (expertos enrutados en bloques 128 x 128, escalas BF16, activaciones dinámicas, sin calibración); pesos base en BF16 para el resto |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License 1.0 (uso comercial limitado, sección 5), sobre Qwen Community License 1.0 |
| Formato de pesos | safetensors (model-*.safetensors con índice model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo es una cuantización FP8 del checkpoint ukisai/Swift1.5-Qwen3.8-Flash-Next, que a su vez deriva de la familia Qwen3.8-Flash-Next. La arquitectura es Mixture of Experts, con expertos enrutados y pesos de n-gram embedding PLE (probablemente "Parallel Lookup Embedding" o similar, aunque el autor no lo desarrolla) que en esta versión se han cuantizado a FP8. Los expertos fusionados del checkpoint original se han dividido por experto para permitir la cuantización individual.

La receta de cuantización replica la de Qwen/Qwen3.8-Flash-Next-FP8: cuantización por bloques de 128 x 128 en los expertos enrutados, escalas almacenadas en BF16, activaciones dinámicas y ausencia de calibración. El autor verificó la receta recreando de forma bit a bit el checkpoint FP8 oficial de Qwen a partir de su versión BF16, lo que constituye la principal garantía técnica del proceso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que esos datos corresponden al modelo base y no se detallan en esta model card.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta "conversational").
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text), lo que implica capacidad de visión.
- Razonamiento y matemáticas: capacidad esperable por herencia de la familia Qwen, aunque no se documenta explícitamente en esta ficha.
- Generación de código: no documentado en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo "thinking" u otras capacidades especiales: no documentado.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede recibir capturas de pantalla o imágenes de producto junto con texto y mantener conversaciones multi-turno, aprovechando su naturaleza image-text-to-text para resolver dudas que requieran interpretar imágenes.
- Análisis de documentos escaneados: extracción y razonamiento sobre contenido visual (facturas, formularios, gráficos) combinado con generación de respuestas textuales.
- Investigación sobre cuantización FP8: el repositorio sirve como referencia reproducible para estudiar el impacto de la receta de Qwen (bloques 128 x 128, escalas BF16) en modelos MoE de gran tamaño, gracias a la validación bit a bit documentada.
- Despliegue de inferencia multimodal en infraestructura con memoria limitada: al reducir el peso a FP8, permite servir un modelo de ~180B parámetros en menos GPUs que la versión BF16, siempre que se cumplan los requisitos de memoria.
- Evaluación comparativa de checkpoints cuantizados: útil para medir degradación de calidad frente al BF16 en tareas de visión y lenguaje.
- Prototipado de asistentes visuales en entornos de investigación: el modelo puede integrarse en pipelines de transformers para experimentar con razonamiento sobre imágenes antes de pasar a producción con un checkpoint oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 180B parámetros en FP8, el peso ocupa aproximadamente 180 GB; se necesita al menos esa cantidad de memoria agregada, más overhead de activaciones y KV cache. En BF16 serían ~360 GB.
- GPU recomendadas: clústeres de H100 80 GB (mínimo 3-4 GPUs para el peso en FP8, más margen para activaciones), A100 80 GB en configuraciones multi-GPU, o GPUs con mayor memoria (H200, B200) para reducir el número de nodos.
- ¿Cabe en consumer GPU? No. Un modelo de 180B parámetros en FP8 no cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo actual; requeriría offloading masivo a CPU/RAM, con latencia muy alta.
- Opciones de despliegue: transformers (librería declarada), con soporte de FP8 nativo en GPUs Hopper o mediante kernels compatibles; vLLM, TGI o SGLang podrían soportarlo si implementan la receta de bloques 128 x 128, aunque no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TK-13/Swift1.5-Qwen3.8-Flash-Next-FP8 | 180B (MoE) | no disponible | Swift Open License 1.0 (uso comercial limitado) | HuggingFace, 86 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base BF16) | 180B (MoE) | no disponible | Swift Open License 1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next-FP8 (oficial) | no disponible en esta ficha | no disponible | Qwen Community License 1.0 | HuggingFace |
| TK-13/Qwen3.8-Flash-Next-FP8-Recreated | no disponible en esta ficha | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Cuantización no oficial: el autor no está afiliado ni respaldado por UkisAI ni por Qwen; la calidad final puede diferir del checkpoint BF16 original, y no se han publicado evaluaciones que lo cuantifiquen.
- Ausencia de benchmarks: no hay datos que permitan estimar la degradación por la cuantización FP8 en tareas de visión, razonamiento o código.
- Licencia restrictiva: la Swift Open License 1.0 limita el uso comercial (sección 5), y se superpone a la Qwen Community License 1.0; es imprescindible revisar ambas antes de cualquier despliegue productivo.
- Idiomas no especificados: se desconoce el soporte real multilingüe y el comportamiento en castellano.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluaciones específicas de fidelidad.
- Sesgos: no documentados; al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos conocidos.
- Madurez del repositorio: la model card completa está pendiente ("coming soon"), con solo 86 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.
- Requisitos de hardware muy elevados: no apto para entornos con GPUs de consumo; el coste de inferencia en producción es significativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TK-13/Swift1.5-Qwen3.8-Flash-Next-FP8
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Checkpoint FP8 oficial de referencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Recreación bit a bit de la receta: https://huggingface.co/TK-13/Qwen3.8-Flash-Next-FP8-Recreated
- Licencia Swift Open License 1.0: LICENSE (en el repositorio)
- Licencia Qwen Community License 1.0: LICENSE-QWEN (en el repositorio)
- Aviso legal: NOTICE (en el repositorio)
