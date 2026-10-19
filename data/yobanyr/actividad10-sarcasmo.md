# yobanyr/actividad10-sarcasmo

## Resumen

`yobanyr/actividad10-sarcasmo` es un modelo de clasificación de texto en castellano afinado para detectar sarcasmo (clasificación binaria: sarcástico / no sarcástico). Se construye sobre `FacebookAI/xlm-roberta-large`, un encoder transformer multilingüe de tipo RoBERTa con 559.892.482 parámetros, y se publica como un ejercicio académico de un taller de clasificación y NER, no como un modelo de producción con soporte o documentación extensa.

El problema que aborda es la detección de ironía y sarcasmo, una tarea especialmente difícil por su dependencia del contexto cultural y pragmático, y de interés directo para análisis de opiniones, moderación de comunidades y sistemas de atención al cliente que necesitan interpretar correctamente el tono del usuario. El autor reporta un F1 macro de 0,9356 en validación y de 0,9318 en dos particiones de test, con 15.276 ejemplos de entrenamiento y 1.910 de validación, lo que sitúa el resultado en un rango alto para la tarea, aunque sin comparación pública contra otros sistemas.

Su relevancia actual es limitada pero concreta: es un ejemplo reproducible de fine-tuning de un encoder grande en español con bf16, semilla fija y métricas macro, útil como línea base para quien necesite un clasificador de sarcasmo en castellano o quiera replicar la metodología del taller. No incluye licencia declarada, ni datos sobre la composición del corpus, ni demos o pesos en formatos ligeros (GGUF/ONNX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), base XLM-RoBERTa-large con cabeza de clasificación sobre `<s>` |
| Parametros totales | 559.892.482 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base XLM-RoBERTa-large; no se indica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión completa; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | es (español); el modelo base es multilingüe, pero el fine-tuning solo se declara para español |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,3 GB) |
| Pipeline | text-classification |
| Etiquetas | 2 clases (binario); nombres de etiqueta no especificados en la model card |
| Modelo base | FacebookAI/xlm-roberta-large |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa-large: un encoder transformer de 24 capas, representación oculta de 1024 y 16 cabezas de atención, preentrenado de forma multilingüe con el objetivo de masked language modeling sobre corpus filtrados de CommonCrawl. Sobre ese backbone, el autor añade una cabeza de clasificación secuencial y ajusta todos los pesos para una tarea de dos clases. No se documentan cambios arquitectónicos adicionales (pooling alternativo, capas adicionales, atención lineal ni decodificación especulativa), por lo que se trata de un fine-tuning estándar.

Los datos de entrenamiento no se describen en la model card: no se indica el corpus de origen, la proporción de clases ni los criterios de anotación. Sí se detallan los hiperparámetros: 15.276 ejemplos de entrenamiento y 1.910 de validación, batch de 32, 8,0 épocas, semilla 42, learning rate inicial 2e-5, 382 pasos de warmup y precisión bf16. El autor declara que seleccionó batch y checkpoint por F1 de validación, y que la métrica de clasificación es F1 macro (mientras que la parte de NER del taller usa F1 micro con BIO estricto). No se menciona RLHF, DPO ni ninguna fase de alineación, algo esperable en un clasificador.

## Capacidades

- Clasificación binaria de sarcasmo en textos en español, con salida de etiqueta y probabilidad vía `pipeline("text-classification")`.
- Clasificación de secuencias cortas y medias: tweets, comentarios, reseñas, mensajes de chat o titulares de hasta 512 tokens.
- Extracción de probabilidad calibrada de la clase sarcástica, utilizable como señal auxiliar dentro de un pipeline mayor (por ejemplo, umbral ajustable para priorizar precisión o recall).
- Capacidad multilingüe residual heredada del modelo base XLM-RoBERTa-large, aunque no evaluada ni declarada por el autor para otros idiomas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto libre ni modo "thinking": es un encoder discriminativo.
- No tiene capacidades de visión, audio ni procesamiento de documentos multimodal.
- El propio backbone (sin la cabeza de clasificación) puede reutilizarse para embeddings y NER, ya que el taller incluía una parte de etiquetado de entidades, pero este checkpoint concreto está entrenado para la tarea de sarcasmo.

## Casos de uso

- Moderación de comunidades y redes sociales: el modelo puede puntuar automáticamente comentarios como sarcásticos para evitar que un sistema de análisis de toxicidad malinterprete el tono literal y aplique una sanción incorrecta, usando el umbral de probabilidad como filtro previo a revisión humana.
- Análisis de opiniones y voz del cliente: al procesar reseñas y encuestas en español, la probabilidad de sarcasmo permite segmentar los comentarios irónicos, que de otro modo contaminarían las métricas de sentimiento calculadas por modelos literales.
- Enrutado en atención al cliente: en lugar de un clasificador de intención puramente léxico, el modelo puede marcar mensajes irónicos o pasivo-agresivos y desviarlos a un agente humano con contexto, reduciendo respuestas automáticas mal calibradas.
- Investigación en pragmática computacional: sirve como línea base reproducible (semilla, hiperparámetros y métricas publicadas) para experimentos de ironía en español, por ejemplo para comparar corpus o estrategias de aumento de datos.
- Filtrado de datasets para entrenamiento: aplicar el clasificador sobre grandes corpus de texto en español para etiquetar o eliminar ejemplos sarcásticos antes de entrenar modelos de sentimiento o de generación, mejorando la coherencia de las anotaciones.
- Señal auxiliar en sistemas de recomendación o detección de fraude en reseñas: los comentarios sarcásticos suelen correlacionar con patrones anómalos de valoración; el modelo aporta una característica adicional de bajo coste computacional (inferencia de milisegundos en GPU consumer).
- Análisis de medios y seguimiento de discurso público: detectar uso irónico en titulares y replies para estudiar frames periodísticos o campañas de comunicación, siempre con validación humana dado el dominio abierto.

## Benchmarks y rendimiento

Únicos datos disponibles: métricas propias del autor sobre su propio conjunto (no hay comparación con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un clasificador).

| Particion / metrica | Precision | Recall | F1 | n |
|---|---|---|---|---|
| Validacion (macro) | 0,9370 | 0,9343 | 0,9356 | 1.910 |
| Test original (macro) | 0,9323 | 0,9314 | 0,9318 | 1.910 |
| Test sin repetidos (macro) | 0,9322 | 0,9314 | 0,9318 | 1.908 |

`eval_loss` en validación: 0,5338. Clases predichas en validación: 2. Throughput reportado durante la evaluación: 933,04 muestras/s y 29,31 pasos/s (`eval_runtime` 2,047 s), con hardware no especificado.

No se han publicado resultados de benchmarks estándar ni comparaciones con otros sistemas en la información disponible.

## Requisitos de hardware

- VRAM estimada solo para pesos: ~2,24 GB en fp32, ~1,12 GB en fp16/bf16, ~0,56 GB en int8 y ~0,28 GB en int4 (559,9 M de parámetros). Añadir entre 0,5 y 2 GB según batch y longitud de secuencia (hasta 512 tokens).
- Inferencia práctica: cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060/4060/4070, RTX 2080, etc.), incluso con batch grande; también funciona en GPU de 4 GB con batch pequeño en fp16.
- GPU de servidor recomendadas para alto throughput: T4, L4, A10G, A100 y H100, con ventaja clara al usar bf16 (Ampere o superior) y batches de 32 a 128.
- CPU: viable para inferencia por lotes pequeños; un modelo de 560 M en fp32 requiere ~2,3 GB de RAM y ofrece latencias del orden de decenas de milisegundos por muestra, sin datos medidos publicados.
- Opciones de despliegue: `transformers` + `pipeline`, servidor propio con FastAPI y batching dinámico, ONNX Runtime o TorchScript para reducir latencia, TGI (soporte de modelos tipo BERT), y vLLM únicamente si se verifica el soporte de encoder para este checkpoint. `llama.cpp`/Ollama no son aplicables sin una conversión a GGUF, que no está publicada.
- Latencia y throughput: el autor reporta 933 muestras/s en fase de evaluación, pero sin especificar GPU ni batch, por lo que no debe tomarse como cifra de producción. En un T4 con batch 32 y secuencias de 128 tokens es razonable esperar decenas de miles de predicciones por minuto, aunque no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| actividad10-sarcasmo (este) | 559,9 M | 512 tokens | Clasificacion binaria de sarcasmo (es) | no disponible | Pesos safetensors en HF; 11 descargas, 0 likes |
| FacebookAI/xlm-roberta-large (base) | 559,9 M | 512 tokens | Encoder multilingue; requiere cabeza para clasificar | MIT | Ampliamente disponible y muy usado |
| BETO (dccuchile/bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | Encoder en español; sentimiento, NER, clasificacion | no verificada en la informacion disponible | Muy extendido en la comunidad hispanohablante |
| PlanTL-GOB-ES/roberta-base-bne (MarIA) | ~125 M | 512 tokens | Encoder entrenado con corpus BNE (es) | Apache 2.0 (modelo del Plan TL) | Disponible en HF con versiones base y large |

No existen datos públicos que comparen este checkpoint con BETO o MarIA en la misma tarea de sarcasmo, por lo que la comparación se limita a tamaño, contexto, licencia y disponibilidad. Un encoder grande como XLM-R ofrece más capacidad que BETO o MarIA base a costa de unas 4,5 veces más parámetros y mayor coste de inferencia.

## Limitaciones y advertencias

- Sesgos desconocidos: la model card no describe la procedencia del corpus ni el proceso de anotación, por lo que no se puede evaluar el sesgo por registro, dialecto, género o procedencia geográfica dentro del español.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos: el sarcasmo es ambiguo incluso para anotadores humanos, y el modelo no aporta explicación de su decisión.
- El rendimiento de ~0,93 de F1 se mide sobre particiones del mismo corpus que el entrenamiento; la partición "sin repetidos" solo elimina 2 ejemplos duplicados, lo que sugiere una evaluación intra-dominio y no una validación en dominios externos.
- Con 8 épocas sobre 15.276 ejemplos y un modelo base de 560 M, el sobreajuste es plausible; no se publican curvas de aprendizaje ni métricas de modelos intermedios.
- Solo se declara español: aunque el backbone es multilingüe, no hay evidencia de que el fine-tuning generalice a otros idiomas o a variantes dialectales no representadas.
- Licencia no disponible: no hay permiso explícito para uso comercial, redistribución o modificación; en un entorno de producción esto bloquea su adopción hasta aclararlo con el autor.
- Sin mantenimiento aparente: 11 descargas, 0 likes, sin demos ni issues; la metadata del Hub indica creación el 2026-10-19, una fecha anómala que conviene verificar antes de citar el modelo.
- No hay cuantizaciones ni exportaciones (GGUF, ONNX) publicadas, así que la integración en stacks ligeros requiere trabajo adicional de conversión y validación.
- Los nombres exactos de las etiquetas de salida no se documentan; hay que inspeccionar `config.json` para saber qué índice corresponde a "sarcástico".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yobanyr/actividad10-sarcasmo
- Modelo base XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- BETO (referencia comparativa en español): https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- MarIA / RoBERTa-BNE (referencia comparativa en español): https://huggingface.co/PlanTL-GOB-ES/roberta-base-bne
