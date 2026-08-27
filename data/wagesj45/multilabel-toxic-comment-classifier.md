# wagesj45/multilabel-toxic-comment-classifier

## Resumen

El modelo `wagesj45/multilabel-toxic-comment-classifier` es un clasificador de texto multi-etiqueta diseñado para moderación de contenido. Desarrollado por wagesj45, se trata de un fine-tune del modelo base `datalama/mmBERT-small`, una variante multilingüe de ModernBERT. El modelo produce siete puntuaciones independientes de toxicidad para comentarios en inglés: `toxicity`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack` y `sexual_explicit`. Cada salida es un valor sigmoide, lo que permite que un mismo comentario obtenga puntuaciones altas en varias dimensiones simultáneamente.

El modelo se entrenó sobre los conjuntos de datos `google/civil_comments` y `Heliosoph/Jigsaw-Toxic-Comments`, combinando anotaciones continuas y binarias. Con 140,6 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia actual radica en la creciente necesidad de herramientas de moderación automática que sean transparentes, ligeras y fáciles de integrar en flujos de trabajo existentes, sin depender de APIs propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) fine-tune de `datalama/mmBERT-small` |
| Parametros totales | 140.644.231 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (límite de entrada usado en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (entrenamiento); base multilingüe sin validación para otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `datalama/mmBERT-small`, una versión compacta de ModernBERT con arquitectura transformer encoder. Sobre esta base se añadió una cabeza de clasificación de secuencia con siete salidas independientes, cada una con activación sigmoide. El entrenamiento se realizó con `transformers` sobre una combinación de los datasets `google/civil_comments` (que proporciona siete objetivos continuos de fracción de anotación) y `Heliosoph/Jigsaw-Toxic-Comments` (con objetivos binarios para las seis primeras dimensiones; la etiqueta `sexual_explicit` no disponible en este dataset se enmascaró en la pérdida en lugar de tratarse como negativa).

El corpus combinado se barajó y dividió de forma determinista 90/10 con semilla 42. Se usaron tres épocas, una tasa de aprendizaje de `2e-5`, tamaños de lote 16/32, weight decay de `0.01` y un límite de 256 tokens por entrada. Los pesos exportados corresponden al mejor checkpoint, seleccionado por ROC-AUC macro en validación en la época 2. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es supervisado clásico.

## Capacidades

- Clasificación multi-etiqueta de toxicidad en siete dimensiones independientes: toxicidad, toxicidad severa, obsceno, amenaza, insulto, ataque a la identidad y contenido sexual explícito.
- Cada salida es una puntuación sigmoide entre 0 y 1, interpretable como intensidad de la etiqueta, no como probabilidad calibrada.
- El modelo distingue entre toxicidad general y subtipos específicos, lo que permite políticas de moderación diferenciadas.
- Soporta entrada de texto en inglés con truncamiento a 256 tokens.
- Compatible con la librería `transformers` y con `text-embeddings-inference` (TEI) para despliegue en endpoints.
- No requiere GPU de alta gama; puede ejecutarse en CPU o GPUs de consumo.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Moderación de comentarios en foros y blogs: el modelo puede puntuar cada comentario en las siete dimensiones y aplicar umbrales específicos por etiqueta para decidir si se publica, se envía a revisión humana o se bloquea. Su tamaño reducido permite procesar grandes volúmenes en tiempo real.
- Filtrado de contenido en redes sociales: integrable en pipelines de pre-publicación para detectar insultos, amenazas o ataques a la identidad antes de que el contenido sea visible para otros usuarios.
- Análisis retrospectivo de comentarios históricos: permite auditar archivos de comentarios para identificar patrones de abuso o medir la evolución de la toxicidad en una comunidad.
- Asistencia a moderadores humanos: en lugar de decisiones automáticas, el modelo puede priorizar la cola de moderación, mostrando primero los comentarios con mayor probabilidad de ser tóxicos según las puntuaciones.
- Detección de acoso en plataformas de juegos o chats: con umbrales ajustados, puede señalar mensajes que contengan amenazas o insultos, ayudando a proteger a los usuarios vulnerables.
- Investigación académica en NLP: sirve como punto de partida para estudiar la toxicidad multi-etiqueta, comparar arquitecturas o desarrollar sistemas de moderación más robustos, gracias a su licencia Apache-2.0 y su tamaño manejable.

## Benchmarks y rendimiento

La model card reporta métricas sobre un split de validación reservado (10% del corpus combinado). El F1 se calcula umbralizando las anotaciones continuas a 0.5; el ROC-AUC usa las puntuaciones continuas del modelo.

| Etiqueta | ROC-AUC | F1 a 0.5 |
| --- | ---: | ---: |
| toxicity | 0.9744 | 0.6992 |
| severe_toxicity | 0.9991 | 0.4085 |
| obscene | 0.9936 | 0.7141 |
| threat | 0.9894 | 0.4847 |
| insult | 0.9802 | 0.6959 |
| identity_attack | 0.9873 | 0.3902 |
| sexual_explicit | 0.9967 | 0.5075 |
| **Macro promedio** | **0.9887** | **0.5571** |

Estos resultados no son indicativos del rendimiento en datos de producción arbitrarios ni en idiomas distintos del inglés. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140,6 millones de parámetros, en fp32 se requieren aproximadamente 560 MB; en fp16 unos 280 MB; con cuantización a 8 bits se reduce a unos 140 MB. Estas cifras son estimaciones basadas en el tamaño del modelo, no mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para fp16. Una RTX 3060, RTX 4060 o similar puede ejecutar el modelo con holgura. También funciona en CPU para inferencia por lotes pequeños.
- Sí cabe en GPUs de consumo: es un modelo pequeño, adecuado para entornos con recursos limitados.
- Opciones de despliegue: `transformers` (Python), `text-embeddings-inference` (TEI) para endpoints de alta concurrencia, y cualquier framework compatible con safetensors (ONNX, TensorRT, etc.).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de milisegundos por muestra en GPU moderna y throughput de cientos de muestras por segundo en batch.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Existen otros clasificadores de toxicidad basados en BERT (por ejemplo, fine-tunes de `bert-base-uncased` sobre Jigsaw), pero no se han incluido métricas comparables en la documentación de este modelo. Se recomienda evaluar el modelo frente a alternativas en el propio conjunto de datos de producción antes de elegir.

## Limitaciones y advertencias

- El modelo solo ha sido validado en inglés; el uso en otros idiomas no está respaldado por métricas, aunque la base multilingüe podría ofrecer resultados no verificados.
- Las etiquetas de toxicidad son subjetivas y ruidosas; los datos de entrenamiento pueden contener sesgos históricos o culturales.
- Puede producir falsos positivos con lenguaje soez, lenguaje reivindicado por comunidades, términos de identidad, citas, discusiones sobre abuso o críticas con palabras fuertes.
- Puede no detectar abuso implícito, codificado, contextual o escrito de forma adversaria.
- Las puntuaciones no son probabilidades calibradas; es necesario elegir umbrales específicos para cada aplicación y monitorizarlos tras el despliegue.
- No debe usarse como única base para decisiones de alto impacto sobre personas; se recomienda revisión humana y mecanismos de apelación.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento tienen sus propias licencias (CC0-1.0 y Apache-2.0); el repositorio no redistribuye filas de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wagesj45/multilabel-toxic-comment-classifier
- Modelo base `datalama/mmBERT-small`: https://huggingface.co/datalama/mmBERT-small
- Dataset `google/civil_comments`: https://huggingface.co/datasets/google/civil_comments
- Dataset `Heliosoph/Jigsaw-Toxic-Comments`: https://huggingface.co/datasets/Heliosoph/Jigsaw-Toxic-Comments
- Repositorio de ejemplo de clasificación multi-etiqueta (anagha0601): https://github.com/anagha0601/Multilabel-toxic-comment-classification
- Repositorio de ejemplo de clasificación de toxicidad (toxiclassify): https://github.com/toxiclassify/Main
- Artículo de GeeksforGeeks sobre clasificación de comentarios tóxicos con BERT: https://www.geeksforgeeks.org/machine-learning/toxic-comment-classification-using-bert/
- Otro clasificador multi-etiqueta similar (Koushim): https://huggingface.co/Koushim/bert-multilabel-jigsaw-toxic-classifier
