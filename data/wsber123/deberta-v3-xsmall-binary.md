# wsber123/deberta-v3-xsmall-binary

## Resumen

El modelo `wsber123/deberta-v3-xsmall-binary` es un fine-tune del modelo base `microsoft/deberta-v3-xsmall` orientado a una tarea de clasificación binaria de texto, como indica su nombre. Está desarrollado por el usuario `wsber123` y publicado en Hugging Face con licencia Apache 2.0, lo que permite su uso comercial sin restricciones de atribución más allá de las habituales.

Con 70,8 millones de parámetros totales, se sitúa en la categoría de modelos pequeños pero eficientes, heredando la arquitectura DeBERTa-v3 de Microsoft, que combina atención disentangled con un preentrenamiento basado en detección de tokens reemplazados. El modelo se distribuye únicamente en formato `safetensors` y no se proporciona información adicional sobre la tarea específica, el dataset de entrenamiento ni los idiomas soportados, lo que limita su uso directo a tareas de clasificación binaria sobre las que el autor haya entrenado.

A pesar de la escasa documentación, su tamaño reducido y su licencia permisiva lo hacen atractivo para experimentación y despliegues en entornos con recursos limitados, siempre que se valide previamente su comportamiento en el dominio de aplicación deseado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (transformer con atención disentangled) |
| Parametros totales | 70.830.722 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base DeBERTa-v3 usa 512 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se ofrece safetensors en precisión original) |
| Idiomas soportados | no disponibles (probablemente inglés, por el modelo base, sin confirmar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura DeBERTa-v3 de Microsoft, un transformer que introduce dos innovaciones principales: atención disentangled, donde cada token se representa con vectores de contenido y posición por separado, y un preentrenamiento basado en *replaced token detection* (RTD) en lugar del clásico masked language modeling. Esto permite un aprendizaje más eficiente con menos parámetros activos que modelos como RoBERTa o XLNet.

El modelo base `deberta-v3-xsmall` tiene 22 millones de parámetros en su backbone, con 6 capas y un tamaño oculto de 768, y un vocabulario de 128K tokens que añade una capa de embedding considerable. El fine-tune de `wsber123` suma 70,8 millones de parámetros totales, lo que sugiere que se ha adaptado el vocabulario o se ha añadido una cabezad de clasificación adicional. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de épocas ni la técnica de ajuste utilizada, ya que la model card del autor está vacía.

## Capacidades

- Clasificación de texto binario (probablemente análisis de sentimiento, detección de spam, toxicidad, etc.), aunque no se especifica la etiqueta objetivo exacta.
- Generación de embeddings contextuales de alta calidad para representación de texto.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multimodales (solo texto).
- No se confirma soporte multilingüe; el modelo base DeBERTa-v3 está entrenado principalmente en inglés.
- No incluye modo de razonamiento extendido ni generación de texto libre (es un modelo encoder-only).

## Casos de uso

- Análisis de sentimiento binario: clasificar comentarios o reseñas como positivos o negativos, integrando el modelo en un pipeline de procesamiento de texto con una capa de salida sigmoide.
- Detección de spam en correos o mensajes: clasificar si un texto es spam o no, útil en sistemas de filtrado automatizado.
- Moderación de contenido: identificar contenido tóxico o inapropiado en foros o redes sociales, con una decisión binaria (aprobado/rechazado).
- Clasificación de intenciones en chatbots: distinguir entre dos intenciones principales (por ejemplo, "información" vs "soporte") como paso previo a un sistema de diálogo.
- Filtrado de documentos legales o médicos: clasificar documentos como relevantes o irrelevantes para un caso concreto, reduciendo el trabajo manual de revisión.
- Detección de noticias falsas: clasificar artículos como verídicos o falsos, aunque requiere un dataset de entrenamiento específico y validación cuidadosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar el rendimiento del modelo con otros modelos sin datos empíricos. El modelo base `deberta-v3-xsmall` de Microsoft, según la documentación oficial, supera a RoBERTa-Base y XLNet-Base en MNLI y SQuAD v2.0 con solo 22M de parámetros de backbone, pero este fine-tune no reporta métricas propias.

## Requisitos de hardware

- VRAM estimada para inferencia: con 70,8 millones de parámetros en FP32 (~283 MB), la inferencia cabe en cualquier GPU moderna con al menos 1 GB de VRAM. En FP16 se reduce a ~142 MB, y con cuantización INT8 a ~71 MB.
- GPUs recomendadas: cualquier GPU de consumo como RTX 3060, RTX 4090, o incluso tarjetas de gama baja con 4 GB de VRAM son suficientes. También es viable en CPU para inferencia batch pequeña.
- Cabe en GPUs de consumo: sí, sin problema.
- Opciones de despliegue: compatible con Transformers de Hugging Face para PyTorch/TensorFlow, y puede servirse con vLLM (aunque no es óptimo para modelos encoder), TGI o mediante `transformers.pipeline` para clasificación. No se ha confirmado compatibilidad con llama.cpp u Ollama, que están orientados a modelos decoder.
- Latencia y throughput: no disponible, pero por su tamaño se espera una latencia inferior a 10 ms por ejemplo en una GPU moderna y throughput alto en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| `wsber123/deberta-v3-xsmall-binary` | 70,8M | no disponible | no disponible | Apache-2.0 |
| `microsoft/deberta-v3-xsmall` | 22M (backbone) | 512 tokens | Supera a RoBERTa-Base y XLNet-Base en MNLI y SQuAD v2.0 | MIT |
| `microsoft/deberta-v3-small` | 44M (backbone) + 98M embedding | 512 tokens | Mejora en tareas de NLU respecto al xsmall | MIT |

La comparativa se limita al modelo base de Microsoft, ya que no hay datos de rendimiento del fine-tune. El modelo de `wsber21` añade una capa de clasificación binaria y una mayor cantidad de parámetros totales que el xsmall original, probablemente por una ampliación del vocabulario o la cabecera de clasificación.

## Limitaciones y advertencias

- La model card del autor no proporciona información sobre el dataset de entrenamiento, la tarea exacta, ni la evaluación, por lo que no se puede verificar la calidad del modelo para ningún caso de uso.
- No se han publicado benchmarks, por lo que no se puede comparar con otros clasificadores binarios.
- El idioma de entrenamiento no está confirmado; es probable que sea inglés, lo que limita su uso en español u otros idiomas.
- Al ser un modelo encoder de clasificación, no genera texto libre ni soporta conversaciones multi-turno.
- Riesgo de alucinación: bajo en tareas de clasificación, pero los resultados pueden ser sesgados si el dataset de fine-tuning no es representativo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no proporciona garantías ni soporte.
- No se han publicado configuraciones de cuantización ni se ha validado el modelo con herramientas como `llama.cpp`, por lo que el despliegue en entornos de baja VRAM debe hacerse con precaución.

## Enlaces

- Modelo en Hugging Face: [wsber123/deberta-v3-xsmall-binary](https://huggingface.co/wsber123/deberta-v3-xsmall-binary)
- Modelo base de Microsoft: [microsoft/deberta-v3-xsmall](https://huggingface.co/microsoft/deberta-v3-xsmall)
- Repositorio oficial de DeBERTa: [microsoft/DeBERTa](https://github.com/microsoft/DeBERTa)
- Documentación de DeBERTa en el catálogo de Azure AI: [Microsoft Foundry Models - DeBERTa v3 small](https://ai.azure.com/catalog/models/microsoft-deberta-v3-small)
