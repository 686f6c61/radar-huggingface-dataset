# yonons/lab-sentiment-small

## Resumen

`yonons/lab-sentiment-small` es un modelo de clasificación de sentimiento derivado de `roberta-base`, publicado en Hugging Face por el usuario yonons. Según la model card, se ha afinado sobre un dataset interno denominado `reviews-2024` durante 3 épocas con una tasa de aprendizaje de 2e-5 y un tamaño de lote de 32. El modelo está pensado para el scoring por lotes de documentos internos, no para uso general.

La relevancia de esta ficha es limitada: se trata de un artefacto de laboratorio con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin pipeline asignado en el Hub. La información pública se reduce a los hiperparámetros de entrenamiento, una tabla de métricas sobre un conjunto de test interno (`internal-test-v3`) y una limitación explícita sobre la longitud de entrada.

Al estar construido sobre `roberta-base`, hereda la arquitectura transformer encoder-only de RoBERTa, con una ventana de contexto de 512 tokens. No se dispone de información sobre el número de etiquetas, la composición del dataset ni el proceso de anotación, por lo que cualquier uso en producción requiere una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (derivado de `roberta-base`) |
| Parametros totales | no disponible (el modelo base `roberta-base` tiene ~125 M, pero no se confirma en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite declarado en limitaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card no lo especifica; al ser un fine-tune de RoBERTa es probable safetensors o PyTorch binario, sin confirmar) |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder-only con atención bidireccional, orientado a tareas de comprensión del lenguaje. Sobre esa base se ha realizado un fine-tuning supervisado para clasificación, presumiblemente de sentimiento por el nombre del repositorio, aunque la model card no explicita el número ni los nombres de las etiquetas. Los hiperparámetros declarados son 3 épocas, learning rate 2e-5 y batch size 32 sobre el dataset `reviews-2024`.

No se documenta el volumen de tokens de entrenamiento, la composición del dataset, el proceso de anotación ni si hubo técnicas de alineación como RLHF o DPO (poco habituales en tareas de clasificación). Tampoco se describe ninguna innovación técnica adicional: es un fine-tuning estándar de un encoder preentrenado. El changelog menciona una corrección de la configuración del tokenizer el 2025-09-16, posterior al release inicial del 2025-03-13, lo que sugiere que las versiones anteriores podrían tener un tokenizer mal configurado.

## Capacidades

- Clasificación de sentimiento sobre textos de hasta 512 tokens, según el uso previsto declarado ("batch scoring of internal documents").
- Procesamiento por lotes (batch), adecuado para scoring masivo de documentos internos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- No se documenta capacidad multilingüe; los idiomas no están declarados.
- No se documenta thinking mode, visión, audio ni ninguna capacidad multimodal.
- No se documenta generación de texto: al derivar de un encoder, la salida esperada es una etiqueta de clasificación, no texto libre.

## Casos de uso

- Scoring por lotes de documentos internos: es el uso previsto explícito en la model card; el modelo puede procesar grandes volúmenes de textos cortos (≤512 tokens) y asignarles una etiqueta de sentimiento en pipelines offline.
- Triaje de feedback de clientes: clasificar reseñas o tickets de soporte por polaridad para enrutarlos a los equipos correspondientes, siempre que los textos no superen los 512 tokens.
- Monitorización de opinión en encuestas internas: agregar respuestas abiertas de empleados o usuarios y calcular distribuciones de sentimiento por departamento o producto.
- Filtrado previo en pipelines de moderación: usar la etiqueta de sentimiento como señal auxiliar para priorizar la revisión humana de contenido negativo.
- Análisis exploratorio de corpus de reseñas: etiquetar un corpus histórico (`reviews-2024` u otro similar) para análisis de tendencias temporales.
- Componente en un sistema de clasificación multietapa: usar este modelo como primer clasificador barato y derivar los casos ambiguos a un modelo mayor o a revisión humana.

En todos los casos, la idoneidad depende de validar el modelo sobre datos propios, dado que las métricas publicadas corresponden a un test interno no accesible.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `internal-test-v3`:

| Metrica | Valor |
|---|---|
| Accuracy | 0.961 |
| Macro-F1 | 0.831 |
| Recall | 0.948 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) ni comparaciones con modelos similares en la información disponible. La discrepancia entre accuracy (0.961) y macro-F1 (0.831) sugiere un desbalance de clases considerable: el modelo acierta mucho en las clases mayoritarias pero rinde peor en las minoritarias, lo que conviene tener en cuenta antes de desplegarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un encoder de ~125 M de parámetros en FP32 se sitúa en torno a 0,5 GB, y en FP16 en torno a 0,25 GB, aunque son estimaciones basadas en el modelo base, no en datos del autor.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería suficiente para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: no disponible; al ser un modelo de transformers, sería desplegable con las librerías estándar (transformers, ONNX Runtime, TorchServe), pero no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `yonons/lab-sentiment-small` | no disponible (base ~125 M) | 512 tokens | no disponible | Hugging Face, 0 descargas |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M (RoBERTa base) | 512 tokens | no disponible en la información | Hugging Face, ampliamente usado |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | Apache 2.0 (según información pública del modelo) | Hugging Face, muy usado |
| `finiteautomata/bertweet-base-sentiment-analysis` | ~135 M | 128 tokens | no disponible en la información | Hugging Face |

La comparación es aproximada: no se dispone de métricas comparables del modelo evaluado sobre datasets públicos, por lo que no es posible establecer una comparación de rendimiento rigurosa. La principal diferencia frente a las alternativas es la ausencia de licencia declarada y de tracción de uso, lo que complica su adopción en producción.

## Limitaciones y advertencias

- No evaluado en textos de más de 512 tokens, según declara el propio autor; cualquier entrada más larga requiere truncado o segmentación.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es un riesgo legal relevante para producción.
- Sin idiomas declarados: no se puede garantizar el comportamiento en castellano ni en ningún otro idioma sin validación previa.
- Métricas sobre un test interno no accesible (`internal-test-v3`): no son reproducibles ni comparables con benchmarks públicos.
- Desbalance de clases probable: la diferencia entre accuracy (0.961) y macro-F1 (0.831) indica bajo rendimiento en clases minoritarias.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí hay riesgo de clasificaciones erróneas confiadas, especialmente en dominios distintos al de entrenamiento.
- Dataset de entrenamiento (`reviews-2024`) no documentado: se desconoce su dominio, tamaño, idioma y proceso de anotación, lo que impide evaluar sesgos.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Changelog con corrección de tokenizer: versiones anteriores a 2025-09-16 podrían comportarse de forma distinta; conviene fijar la revisión concreta.
- No hay pipeline declarado en el Hub, lo que puede complicar el uso directo con la API de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yonons/lab-sentiment-small
- Modelo base: https://huggingface.co/roberta-base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
