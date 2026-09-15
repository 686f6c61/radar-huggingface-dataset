# tadiecool29/STL-FullFT-mt5-base-stance

## Resumen

STL-FullFT-mt5-base-stance es un ajuste fino completo (full fine-tuning) del modelo google/mt5-base, publicado por el usuario tadiecool29 en HuggingFace. El modelo está especializado en una única tarea (single-task, de ahí las siglas STL) de clasificación de postura (stance classification) sobre textos en amharico, y se presenta como un modelo de tipo text2text-generation: recibe un texto y genera una etiqueta de postura como salida.

Se trata de un modelo pequeño-mediano (966.573.312 parámetros según los pesos en safetensors, repositorio de 3,2 GB) derivado de la arquitectura encoder-decoder de mT5, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia práctica es limitada pero concreta: cubre un nicho poco atendido, el procesamiento de lenguaje natural en amharico (lengua etíope de bajos recursos), para detección de posturas en textos, una tarea habitual en análisis de redes sociales y monitorización de discurso.

La model card es automática (generada por el Trainer de HuggingFace) y apenas documenta el conjunto de datos de entrenamiento, los usos previstos o las limitaciones. Los únicos datos de rendimiento disponibles son los declarados por el autor: accuracy 0,6995, macro F1 0,7032, precision 0,7004 y recall 0,7184, con una pérdida de evaluación de 1,9222. El modelo tiene un uso muy bajo (9 descargas, 0 likes en el momento de la consulta), por lo que debe considerarse un artefacto experimental más que un sistema listo para producción sin validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5/mT5, text-to-text) |
| Parametros totales | 966.573.312 (segun pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura mT5-base soporta secuencias de hasta 512 tokens |
| Tipos de cuantizacion | No disponible (repositorio solo con safetensors; no se publican versiones GGUF, GPTQ, AWQ ni ONNX) |
| Idiomas soportados | Amharico segun las etiquetas del repositorio; el modelo base mT5 es multilingue (101 idiomas), pero el ajuste fino esta orientado a amharico |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 3,2 GB) |
| Modelo base | google/mt5-base |
| Tarea / pipeline | Text2text-generation; clasificacion de postura (stance classification) mono-tarea |
| Autor | tadiecool29 |
| Fecha de creacion | 2026-09-14 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/mt5-base: un transformer encoder-decoder de tipo T5, con atención completa y sesgos de posición relativos, preentrenado por Google con un objetivo de denoising de spans sobre el corpus multilingüe mC4. Según la documentación pública del modelo base, mT5 cubre 101 idiomas, incluyendo lenguas de bajos recursos, lo que explica la elección de esta base para una tarea en amharico. El ajuste realizado es de fine-tuning completo (full fine-tuning), es decir, se actualizan todos los pesos y no solo adaptadores o capas de salida, tal como indica el nombre del modelo y la etiqueta `full-finetuning`.

Los hiperparámetros de entrenamiento están documentados en la model card: learning rate 3e-4, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 300 pasos de warmup, batch total de 32 (batch de 16 con 2 pasos de acumulación de gradiente), batch de evaluación 32, 10 épocas, semilla 42 y label smoothing de 0,1. El entrenamiento se ejecutó con Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2. El conjunto de datos de entrenamiento no se especifica: la model card indica literalmente "on an unknown dataset", y no se documenta su composición, tamaño, idioma exacto ni procedimiento de anotación. Tampoco se declara el uso de RLHF, DPO ni ninguna otra fase de alineación posterior.

## Capacidades

- Clasificación de postura (stance classification) sobre texto en amharico, formateada como tarea text-to-text: el modelo genera una etiqueta a partir de una secuencia de entrada.
- Generación de texto seq2seq genérica, heredada de mT5-base, aunque degradada por el ajuste mono-tarea.
- Aprendizaje mono-tarea (single-task): está especializado en una única tarea, no es un modelo multitarea.
- Multilingüismo potencial (el base mT5 cubre 101 idiomas), si bien el ajuste fino se realizó con datos en amharico y no hay evidencia de transferencia a otros idiomas.
- Etiquetado supervisado de polaridad o postura en corpus de texto (por ejemplo, a favor / en contra / neutral), asumiendo que el esquema de etiquetas coincide con el usado en el entrenamiento.
- No hay evidencia de soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Monitorización de discurso en redes sociales en amharico: el modelo puede clasificar la postura de publicaciones y comentarios para detectar bloques de opinión sobre un tema concreto, aprovechando que está ajustado específicamente para esta tarea y este idioma.
- Análisis de opinión en medios etíopes: se puede integrar en pipelines de scraping de prensa digital en amharico para etiquetar automáticamente la postura editorial respecto a temas políticos o sociales.
- Investigación académica en PLN de bajos recursos: sirve como línea base (baseline) reproducible para experimentos de clasificación de postura en amharico, dado que los pesos y la licencia Apache 2.0 permiten reproducir y comparar resultados.
- Moderación asistida de comunidades online: clasificar la postura de mensajes puede ayudar a priorizar la revisión humana de contenido polarizado, siempre con supervisión y validación previa del esquema de etiquetas.
- Enriquecimiento de corpus para entrenamiento posterior: las predicciones del modelo pueden usarse para preetiquetar grandes volúmenes de texto en amharico que después se revisen manualmente, reduciendo el coste de anotación.
- Estudios de evolución temporal de la opinión pública: aplicando el modelo por lotes sobre archivos de publicaciones fechadas se pueden construir series temporales de postura sobre un tema, aunque la accuracy de ~0,70 limita la granularidad del análisis.
- Extracción de señales para sistemas de recomendación o segmentación: la postura detectada puede alimentar un motor de segmentación de audiencias en plataformas que operen en amharico.
- Evaluación comparativa de modelos: por su licencia permisiva y su tamaño contenido, es útil como punto de comparación frente a alternativas multilingües (XLM-R, AfroXLMR) en tareas de stance classification en lenguas etíopes.

## Benchmarks y rendimiento

La model card no incluye entradas en el campo `model-index` (la lista de resultados está vacía). Los únicos datos disponibles son los resultados de evaluación declarados por el autor durante el entrenamiento:

| Metrica | Valor (conjunto de evaluacion) |
|---|---|
| Loss | 1,9222 |
| Accuracy | 0,6995 |
| Macro F1 | 0,7032 |
| Precision | 0,7004 |
| Recall | 0,7184 |

Evolución declarada durante el entrenamiento (extracto completo de la tabla de la model card):

| Epoca | Paso | Validation loss | Accuracy | Macro F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1,0 | 189 | 2,9369 | 0,3105 | 0,1185 | 0,0776 | 0,2500 |
| 2,0 | 378 | 2,0737 | 0,5923 | 0,5891 | 0,6206 | 0,6129 |
| 3,0 | 567 | 2,0382 | 0,6309 | 0,6317 | 0,6519 | 0,6554 |
| 4,0 | 756 | 1,9233 | 0,6746 | 0,6808 | 0,6789 | 0,6882 |
| 5,0 | 945 | 1,9214 | 0,6933 | 0,6951 | 0,6926 | 0,7155 |
| 6,0 | 1134 | 1,9499 | 0,6958 | 0,6972 | 0,6988 | 0,7168 |
| 7,0 | 1323 | 1,9107 | 0,6895 | 0,6979 | 0,7008 | 0,6996 |
| 8,0 | 1512 | 1,9083 | 0,7057 | 0,7116 | 0,7068 | 0,7217 |
| 9,0 | 1701 | 1,9191 | 0,7057 | 0,7112 | 0,7081 | 0,7218 |
| 10,0 | 1890 | 1,9222 | 0,6995 | 0,7032 | 0,7004 | 0,7184 |

No hay comparaciones con otros modelos en la información proporcionada, ni resultados sobre benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a una tarea de clasificación monolingüe tan específica.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos en fp32: aproximadamente 3,9 GB solo para parámetros, más activaciones; en la práctica entre 4 y 5 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,9-2 GB de parámetros, con picos de 3-4 GB según tamaño de lote y longitud de secuencia.
- VRAM estimada en int8: en torno a 1 GB de parámetros; en int4, alrededor de 0,5 GB (requiere cuantización manual, no hay versiones publicadas).
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en tarjetas de 6-8 GB si se usa fp16 o int8.
- Es viable la inferencia en CPU para lotes pequeños (el modelo ronda los 966 millones de parámetros), aunque con latencia notablemente mayor.
- Opciones de despliegue: transformers con PyTorch (ruta natural, ya que el repositorio es safetensors nativo); TGI (Text Generation Inference soporta modelos encoder-decoder tipo T5); vLLM (soporte de modelos encoder-decoder, verificar compatibilidad con mT5); exportación a ONNX para servir con ONNX Runtime. El soporte en llama.cpp/Ollama no está confirmado y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles. No hay datos de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STL-FullFT-mt5-base-stance | 966.573.312 | Hasta 512 tokens (arquitectura mT5-base) | Clasificacion de postura en amharico (mono-tarea) | Apache 2.0 | HuggingFace, 9 descargas |
| google/mt5-base | Segun la documentacion publica de Google, en torno a 580 M (no coincide con el recuento de safetensors de este repo) | 512 tokens | Preentrenamiento multilingue text-to-text (101 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |
| XLM-RoBERTa-base | En torno a 278 M | 512 tokens | Clasificacion y NLP multilingue (encoder) | MIT | HuggingFace |
| AfroXLMR-base | En torno a 278 M | 512 tokens | NLP para lenguas africanas, incluido amharico | A confirmar en su repositorio | HuggingFace |

No se dispone de resultados comparativos de rendimiento entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es automática y no documenta el conjunto de datos de entrenamiento: se indica literalmente "on an unknown dataset", por lo que se desconoce su procedencia, tamaño, composición, sesgos y método de anotación.
- No se documentan los usos previstos ni las limitaciones (las secciones "Intended uses & limitations" y "Training and evaluation data" figuran como "More information needed").
- Rendimiento moderado: accuracy 0,6995 y macro F1 0,7032 implican un margen de error de aproximadamente el 30 % en el conjunto de evaluación declarado; no se especifica el tamaño de dicho conjunto ni la distribución de clases.
- Riesgo de sobreajuste: la pérdida de entrenamiento baja de forma continuada (23,35 a 3,78) mientras la de validación se estanca alrededor de 1,91-1,92 desde la época 5, sin mejora clara en las últimas épocas.
- Cobertura idiomática restringida en la práctica: aunque el modelo base es multilingüe, el ajuste se realizó con datos en amharico; usarlo en otros idiomas sin validación previa no está justificado.
- No se ha publicado información sobre sesgos, alineación, RLHF/DPO ni evaluación de seguridad.
- Al ser un modelo text-to-text, la salida es texto generado libremente: no hay garantía de que el modelo emita únicamente etiquetas válidas del esquema esperado, por lo que se requiere un post-procesado y validación de la salida.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución y conservación del aviso de licencia; no impone restricciones adicionales, pero tampoco ofrece garantías.
- Adopción muy baja (9 descargas, 0 likes) y ausencia total de resultados en el `model-index`: no hay validación independiente del rendimiento.
- Los resultados de la búsqueda web realizada no contienen ninguna fuente relevante sobre este modelo (únicamente resultados de portales meteorológicos en alemán), por lo que no es posible contrastar la información con documentación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/STL-FullFT-mt5-base-stance
- Modelo base google/mt5-base: https://huggingface.co/google/mt5-base
- Paper de mT5 (Xue et al., 2020): https://arxiv.org/abs/2010.11934
- Paper de T5 (Raffel et al., 2019): https://arxiv.org/abs/1910.10683
- Documentación de Transformers: https://huggingface.co/docs/transformers/index
- No se han encontrado otros enlaces relevantes (papers, repos, demos o blogs) sobre este modelo en la búsqueda web realizada.
