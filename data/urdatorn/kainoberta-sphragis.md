# Urdatorn/KainoBERTa-sphragis

## Resumen

KainoBERTa es un modelo de lenguaje enmascarado (fill-mask) basado en la arquitectura RoBERTa base, entrenado desde cero para griego antiguo. Desarrollado por Urdatorn, forma parte de un experimento de control de arquitectura: su contraparte `Urdatorn/KainoBERT-sphragis` comparte exactamente los mismos datos, tokenizador, enmascaramiento, optimizador y criterio de parada, pero difiere en la arquitectura. Esto permite atribuir cualquier diferencia de rendimiento entre ambos exclusivamente a la arquitectura, no a los datos.

El modelo tiene 111,6 millones de parámetros, una longitud de contexto de 1024 tokens y se entrenó con 17 039 360 000 tokens procedentes del corpus `Urdatorn/AncientGreek-no-sphragis`. Su objetivo es proporcionar representaciones contextuales robustas para textos en griego antiguo, con especial atención a la variación de acentuación politónica. Es relevante para tareas filológicas como la atribución de autoría, el análisis de estilo y el procesamiento de corpus epigráficos o literarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (12 capas, hidden size 768, 12 cabezas) |
| Parametros totales | 111 634 688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

KainoBERTa reproduce la arquitectura de `FacebookAI/roberta-base` pero sin heredar sus pesos: se inicializa aleatoriamente y se entrena un tokenizador BPE de 32 768 tokens desde cero sobre el corpus de griego antiguo. El entrenamiento utiliza el objetivo de modelado de lenguaje enmascarado con un 30 % de máscaras dinámicas, contexto de 1024 tokens, optimizador AdamW fusionado con una tasa de aprendizaje pico de 3,0e-05 y un lote efectivo de 512 secuencias. Se completaron 34,5745 épocas, presentando 17 039 360 000 tokens, con una mejor pérdida de validación de 2,871797.

El corpus se normaliza en minúsculas y sin puntuación. El 80 % de los registros conserva los diacríticos politónicos, mientras que el 20 % restante se transforma con `grc_utils.only_bases` preservando los límites de palabras. Esta mezcla busca retener información ortográfica filológica y, a la vez, hacer las representaciones menos sensibles a la eliminación de acentos. Antes del preentrenamiento se eliminaron las líneas normalizadas exactas que aparecen en los benchmarks Sphragis y Sphragis-Metre, garantizando cero solapamiento a nivel de línea con esos conjuntos de evaluación.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) para griego antiguo, capaz de predecir tokens ocultos en contexto.
- Representaciones contextuales densas de 768 dimensiones, adecuadas para tareas downstream como clasificación de textos, etiquetado o similitud semántica.
- Robustez relativa a la variación de acentuación: al entrenarse con una mezcla de textos con y sin diacríticos, el modelo tolera entradas sin acentos.
- Soporte de contexto largo de 1024 tokens, suficiente para párrafos extensos o pasajes completos de prosa clásica.
- Compatible con el ecosistema Hugging Face Transformers, lo que permite fine-tuning y extracción de embeddings con APIs estándar.
- No incluye capacidades de generación de texto libre, tool calling, agentes, visión ni audio; es exclusivamente un modelo de representación.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el modelo puede utilizarse para calcular perplejidades o extraer embeddings que alimenten clasificadores de estilo, siguiendo metodologías como la de Huang, Murakami y Grieve (2025).
- Análisis filológico de variantes textuales: al ser sensible a la presencia o ausencia de diacríticos, permite estudiar cómo afecta la acentuación a las representaciones semánticas.
- Búsqueda semántica en corpus epigráficos o literarios: los embeddings generados pueden indexarse para recuperar pasajes temáticamente similares en griego antiguo.
- Preentrenamiento continuado o fine-tuning para tareas específicas como el etiquetado de partes del discurso, la lematización o la detección de interpolaciones.
- Control experimental en investigación de arquitecturas: al ser la mitad de un par de control, sirve para aislar el efecto de la arquitectura en el rendimiento sobre griego antiguo.
- Generación de características para modelos de autoría o estilometría en entornos académicos, donde se requiere una representación que no dependa de pesos preentrenados en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo reporta únicamente la mejor pérdida de validación durante el entrenamiento (2,871797), pero no hay comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o similares, ni con otros modelos de griego antiguo.

## Requisitos de hardware

- El modelo tiene 111,6 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 446 MB, y en fp16 unos 223 MB. Cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA GTX 1060 o superior, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU para inferencia puntual.
- No se han publicado cuantizaciones oficiales (GGUF, int8, etc.), pero al ser un modelo pequeño, la inferencia en fp32 es viable incluso en CPU.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con Hugging Face Inference Endpoints, o mediante bibliotecas como vLLM o TGI si se desea un servicio de embeddings. Para uso local, basta con `transformers` y PyTorch.
- Latencia y throughput estimados: no hay datos oficiales. En una GPU moderna, la inferencia de un solo pasaje de 1024 tokens debería completarse en decenas de milisegundos, pero no se dispone de mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar KainoBERTa con otros modelos de griego antiguo existentes (por ejemplo, PhilBERTa o modelos multilingües como XLM-R). La comparación natural es con su gemelo `Urdatorn/KainoBERT-sphragis`, que comparte todos los datos y hiperparámetros pero difiere en la arquitectura. Sin embargo, no se han publicado especificaciones detalladas de ese modelo en la información disponible, por lo que no es posible ofrecer una tabla comparativa rigurosa.

## Limitaciones y advertencias

- El procedimiento de exclusión garantiza cero solapamiento exacto de líneas normalizadas con los benchmarks Sphragis y Sphragis-Metre, pero no puede descartar ediciones relacionadas, paráfrasis o frases compartidas más cortas, lo que podría inflar ligeramente el rendimiento en tareas de atribución.
- El corpus de entrenamiento es una compilación de fuentes con licencias mixtas; cada registro tiene su propio campo de licencia, por lo que cualquier redistribución o uso downstream debe verificar las condiciones de cada fuente.
- La licencia del modelo se indica como "other" sin especificar términos concretos; no se garantiza su uso comercial sin consultar al autor.
- El modelo solo cubre griego antiguo; no tiene capacidades multilingües ni soporte para otros idiomas.
- Al ser un modelo de representación (no generativo), no es adecuado para tareas que requieran generar texto libre o mantener conversaciones.
- No se han realizado evaluaciones de sesgos o alucinaciones; al ser un modelo de MLM, el riesgo de alucinación es bajo, pero los embeddings pueden reflejar sesgos presentes en el corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/KainoBERTa-sphragis
- Dataset de entrenamiento: https://huggingface.co/datasets/Urdatorn/AncientGreek-no-sphragis
- Modelo gemelo (contraparte de control): https://huggingface.co/Urdatorn/KainoBERT-sphragis
- Repositorio del autor en GitHub: https://github.com/Urdatorn/Urdatorn
