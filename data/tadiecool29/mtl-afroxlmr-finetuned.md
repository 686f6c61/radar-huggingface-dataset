# tadiecool29/MTL-afroxlmr-finetuned

## Resumen

El modelo `tadiecool29/MTL-afroxlmr-finetuned` es un ajuste fino (fine-tuning) del modelo `Davlan/afro-xlmr-base`, que a su vez es una adaptación de XLM-R a lenguas africanas mediante la técnica Language Adaptive Fine-Tuning (LAFT/MAFT). Desarrollado por el usuario tadiecool29, este modelo está especializado en dos tareas de clasificación de texto: detección de postura (stance detection) y análisis de sentimiento (sentiment analysis). Con 278 millones de parámetros, se trata de un modelo de tamaño medio, adecuado para entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque en lenguas africanas de bajos recursos, un ámbito donde los modelos multilingües generalistas suelen tener un rendimiento deficiente. Al partir de AfroXLMR, que ya ha sido adaptado a 20 lenguas africanas, el fine-tuning posterior permite obtener un clasificador específico para tareas de opinión y postura. Aunque la model card no especifica el dataset de entrenamiento, las métricas de evaluación reportadas indican un F1 global de 0,7295, con resultados ligeramente superiores en la tarea de stance (F1 0,7328) frente a la de sentimiento (F1 0,7262).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R base) |
| Parametros totales | 278.049.031 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (se infiere lenguas africanas, sin listado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `Davlan/afro-xlmr-base` es un transformer encoder basado en la arquitectura XLM-R, adaptado a lenguas africanas mediante Language Adaptive Fine-Tuning (LAFT) sobre 20 lenguas. Esta adaptación se realiza en dos fases: primero se entrena un modelo de lenguaje enmascarado (MLM) con datos monolingües de cada lengua, y después se ajusta el modelo completo. El resultado es un modelo con 278 millones de parámetros, 12 capas y una dimensión oculta de 768, que conserva la arquitectura original de XLM-R.

El fine-tuning posterior se realizó con los siguientes hiperparámetros: tasa de aprendizaje de 1e-05, tamaño de lote de entrenamiento de 16, tamaño de lote de evaluación de 32, optimizador AdamW con betas (0,9, 0,999) y épsilon 1e-08, programador de tasa de aprendizaje coseno con 300 pasos de calentamiento, 10 épocas y entrenamiento con precisión mixta (AMP). El dataset de entrenamiento no está especificado en la model card, pero las métricas de evaluación (Stance F1, Sentiment F1) sugieren que se trata de un corpus etiquetado para ambas tareas, probablemente en una o varias lenguas africanas.

## Capacidades

- Clasificación de texto para detección de postura (stance): identifica si un texto expresa una posición a favor, en contra o neutral respecto a un tema.
- Clasificación de sentimiento: determina la polaridad emocional (positiva, negativa, neutral) de un texto.
- Procesamiento multilingüe: al estar basado en AfroXLMR, puede manejar múltiples lenguas africanas, aunque no se especifica el listado exacto.
- No es un modelo generativo: no produce texto nuevo, solo clasifica entradas.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Análisis de opinión en redes sociales: el modelo puede clasificar tweets o publicaciones en lenguas africanas para medir la opinión pública sobre temas concretos, gracias a su capacidad de detectar tanto sentimiento como postura.
- Monitoreo de discursos políticos: permite analizar discursos o declaraciones de líderes para identificar su posición sobre políticas o eventos, útil para periodismo de datos y análisis político.
- Investigación académica en NLP: sirve como punto de partida para estudios sobre lenguas africanas de bajos recursos, permitiendo comparar el rendimiento de modelos adaptados frente a modelos generalistas.
- Moderación de contenido en plataformas: puede clasificar comentarios o reseñas en lenguas africanas para detectar contenido ofensivo o polarizado, aunque su precisión debe validarse en cada dominio.
- Análisis de reseñas de productos: en mercados emergentes donde se hablan lenguas africanas, el modelo puede clasificar reseñas de comercio electrónico para extraer sentimiento y postura sobre productos o servicios.
- Detección de desinformación: combinado con otras técnicas, puede identificar textos que expresan posturas extremas o sentimentos negativos, ayudando a priorizar la revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (el campo `results` del model-index está vacío). Sin embargo, la model card reporta las siguientes métricas de evaluación obtenidas por el autor durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 1,5548 |
| Stance F1 | 0,7328 |
| Sentiment F1 | 0,7262 |
| F1 global | 0,7295 |
| Stance Acc | 0,7259 |
| Sentiment Acc | 0,7309 |

Estos valores corresponden al mejor punto de la evaluación (época 9 según la tabla de entrenamiento), aunque el modelo final (época 10) muestra un F1 ligeramente inferior (0,7271). No se dispone de comparaciones con otros modelos en las mismas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo encoder de 278M parámetros, el uso de memoria en fp32 es de aproximadamente 1,1 GB. Con cuantización a int8 (si se aplicara) se reduciría a unos 0,3 GB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia por lotes pequeños. Una RTX 3060 o superior permite procesar lotes de 32 o más muestras sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media como RTX 3060, RTX 4060, etc. También puede ejecutarse en CPU para inferencia de baja latencia, aunque más lento.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con bibliotecas estándar como Hugging Face Transformers, o mediante servidores de inferencia como vLLM (aunque no es óptimo para encoders), TGI o FastAPI. Para clasificación, se puede usar el pipeline `text-classification` de Transformers.
- Latencia y throughput: en una GPU moderna (p.ej. RTX 3090), la inferencia de una muestra tarda unos pocos milisegundos. En CPU, puede rondar los 50-100 ms por muestra, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos en las mismas tareas y lenguas para realizar una comparativa cuantitativa. Como referencia, el modelo base `Davlan/afro-xlmr-base` tiene la misma arquitectura y número de parámetros, pero sin el fine-tuning específico para stance y sentimiento. Otros fine-tunes de AfroXLMR, como los publicados en el repositorio `uds-lsv/afro-maft`, se centran en tareas diferentes o en otras lenguas. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica qué datos se usaron para el fine-tuning, lo que dificulta evaluar la generalización y posibles sesgos.
- Sesgos potenciales: al entrenarse sobre un corpus no documentado, el modelo puede reflejar sesgos presentes en los datos (p.ej. desequilibrios de clases, dominios específicos).
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación es bajo, pero puede producir clasificaciones erróneas en entradas fuera de su dominio.
- Limitaciones de idioma: aunque está basado en AfroXLMR, no se especifica qué lenguas africanas cubre realmente. Es posible que no funcione bien en lenguas no representadas en el entrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo se ofrece sin garantías. El usuario debe validar su rendimiento en el caso de uso concreto.
- Sin soporte para tareas generativas: no es adecuado para generación de texto, traducción o diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-afroxlmr-finetuned
- Modelo base (Davlan/afro-xlmr-base): https://huggingface.co/Davlan/afro-xlmr-base
- Repositorio AfroMAFT (adaptación de XLM-R a lenguas africanas): https://github.com/uds-lsv/afro-maft
- Paper sobre adaptación de PLMs a lenguas africanas: https://aclanthology.org/2022.coling-1.382/
