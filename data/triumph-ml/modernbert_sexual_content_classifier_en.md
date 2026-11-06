# triumph-ml/modernbert_sexual_content_classifier_en

## Resumen

El modelo `triumph-ml/modernbert_sexual_content_classifier_en` es un clasificador de texto en inglés desarrollado por el usuario triumph-ml y publicado en Hugging Face. Está construido sobre la arquitectura ModernBERT, una evolución del transformer encoder de BERT que incorpora mejoras como rotary positional embeddings (RoPE), atención con flash-attention nativa y una ventana de contexto ampliada. El modelo cuenta con 149.607.171 parámetros totales y se distribuye en formato safetensors con un tamaño de repositorio de 1,8 GB.

Su propósito declarado, a partir del nombre del identificador, es la clasificación de contenido sexual en textos en inglés. Se trata por tanto de un modelo de moderación o filtrado de contenido, una tarea con demanda creciente en plataformas que necesitan cumplir con normativas de seguridad digital y políticas de contenido. La etiqueta `not-for-all-audiences` en el repositorio indica que el modelo o sus datos de entrenamiento pueden estar asociados a material sensible.

La información pública disponible es muy limitada: no se especifican la licencia, los idiomas soportados, los datos de entrenamiento ni los resultados de evaluación. Aun así, la ficha se completa con los datos verificables del repositorio y con las características conocidas de la familia ModernBERT, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.607.171 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del modelo (ModernBERT soporta hasta 8192 tokens; la configuración concreta de este checkpoint no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a int8/fp16 posible vía herramientas estándar) |
| Idiomas soportados | inglés (según el identificador `_en`; no se detalla en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura encoder-only que moderniza el diseño original de BERT. ModernBERT incorpora rotary positional embeddings (RoPE) en lugar de embeddings posicionales absolutos, atención con soporte nativo de flash-attention, capas de normalización pre-norm y una alternancia entre atención global y local que permite procesar secuencias de hasta 8192 tokens con un coste computacional contenido. El tamaño de 149,6 millones de parámetros es coherente con la variante base de ModernBERT.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, la composición del corpus, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. El identificador sugiere un ajuste fino sobre una base ModernBERT preentrenada para una tarea de clasificación binaria o multiclase de contenido sexual, pero no se confirma en la información disponible.

## Capacidades

- Clasificación de texto en inglés orientada a la detección de contenido sexual.
- Modelo encoder-only: produce representaciones contextuales y una cabeza de clasificación; no genera texto libre.
- Adecuado para tareas de moderación de contenido y filtrado previo a publicación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles; el identificador indica inglés.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede clasificar publicaciones o comentarios de usuarios en inglés y marcar aquellos con contenido sexual para revisión humana o bloqueo automático, integrándose en un pipeline de premoderación.
- Filtrado de datasets de entrenamiento: antes de usar un corpus web para entrenar otros modelos, se puede pasar cada documento por el clasificador para eliminar contenido sexual no deseado y reducir riesgos legales y de reputación.
- Cumplimiento normativo: plataformas sujetas a regulaciones de seguridad digital pueden usar el clasificador como capa de detección documentada dentro de su sistema de gestión de riesgos.
- Protección de menores en comunidades online: clasificación automática de mensajes en foros o chats en inglés para alertar sobre contenido inapropiado.
- Investigación en seguridad de IA: evaluación de la prevalencia de contenido sexual en corpus web o en salidas de modelos generativos, usando el clasificador como anotador automático.
- Enrutado de contenido en sistemas de recomendación: etiquetar ítems con una señal de contenido sexual para aplicar políticas de visibilidad, restricción por edad o exclusión de determinados feeds.
- Auditoría de datasets y modelos: análisis retrospectivo de corpus ya recopilados para cuantificar la proporción de contenido sensible antes de su publicación o uso interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB solo para pesos (149,6 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,15 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia por lotes con holgura. Para alto throughput, A100 o H100 no son necesarias pero permiten procesar lotes muy grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM efectiva considerando overhead.
- Opciones de despliegue: transformers (PyTorch), vLLM no aplica de forma nativa a clasificadores encoder-only; ONNX Runtime, TGI con soporte de clasificación, o exportación a GGUF/llama.cpp para CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia corta en GPU moderna, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| triumph-ml/modernbert_sexual_content_classifier_en | 149,6 M | no disponible | Clasificación de contenido sexual (inglés) | no disponible | Hugging Face |
| answerdotai/ModernBERT-base | 149 M | 8192 tokens | Encoder base para fine-tuning | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Encoder base para fine-tuning | Apache 2.0 | Hugging Face |
| facebook/roberta-base | 125 M | 512 tokens | Encoder base para fine-tuning | MIT | Hugging Face |

La comparativa se limita a modelos base de la misma familia o tamaño, ya que no se dispone de información sobre clasificadores de contenido sexual comparables publicados con datos verificables. No hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia, lo que impide confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- El modelo está orientado al inglés; su comportamiento en otros idiomas no está documentado y probablemente sea deficiente.
- No se documentan sesgos conocidos, pero un clasificador de contenido sexual entrenado sobre datos no especificados puede heredar sesgos de anotación y sobrerrepresentar o infrarrepresentar ciertos contextos (por ejemplo, terminología médica o educativa).
- Riesgo de falsos positivos y falsos negativos no cuantificado; sin métricas de evaluación publicadas no es posible calibrar umbrales con garantías.
- La etiqueta `not-for-all-audiences` advierte de que el modelo o sus datos pueden estar asociados a material sensible; conviene revisar las condiciones de uso antes de integrarlo.
- Al ser un encoder-only, no genera texto ni mantiene conversaciones; solo produce una etiqueta o probabilidad de clasificación.
- No se documenta el proceso de entrenamiento ni la composición del dataset, lo que dificulta la auditoría y la reproducibilidad.
- El número de descargas (30) y de likes (0) sugiere un modelo poco validado por la comunidad; no hay evidencia externa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/triumph-ml/modernbert_sexual_content_classifier_en
- Paper de ModernBERT (referencia de arquitectura): https://arxiv.org/abs/2412.13663
- Repositorio ModernBERT de Answer.AI: https://github.com/AnswerDotAI/ModernBERT
- Modelo base ModernBERT en Hugging Face: https://huggingface.co/answerdotai/ModernBERT-base
