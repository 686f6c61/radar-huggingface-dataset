# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step210

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR es un checkpoint de ajuste fino orientado a seguridad sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El modelo se ha entrenado mediante GRPO (Group Relative Policy Optimization) utilizando los conjuntos de datos STAR-1 y STAR-benign-915, con un profesor Qwen3.8-27B que actúa como evaluador de las respuestas generadas. El resultado es un modelo multimodal de tipo image-text-to-text con 4.659.865.088 parámetros totales y licencia Apache 2.0.

La relevancia de esta ficha radica en que documenta un experimento de safety tuning reproducible: la model card detalla hiperparámetros concretos (learning rate 1e-6, coeficiente KL 0.001, 16 prompts por actualización, 8 respuestas por prompt, 210 actualizaciones del optimizador), la revisión exacta del modelo base y el linaje del entrenamiento, incluyendo un cambio de prompt de evaluación tras la actualización 44 y una reanudación desde el paso 90. No obstante, el autor declara explícitamente que no se afirman puntuaciones de evaluación, por lo que no hay evidencia publicada sobre la eficacia del ajuste.

El checkpoint se distribuye como safetensors para inferencia con transformers, con los tensores de visión y MTP (multi-token prediction) heredados del modelo base sin entrenar. El repositorio ocupa 9,3 GB e incluye pesos de inferencia, configuración y activos de tokenizer/processor, pero excluye el estado del optimizador, el estado RNG, los logs de entrenamiento y los ejemplos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-4B; incluye torre de visión y cabezas MTP no entrenadas |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer multimodal con capacidad image-text-to-text. Sobre esa base se aplica un ajuste fino con GRPO, una variante de optimización por política relativa a grupos que no requiere un modelo de recompensa separado entrenado de forma explícita en este caso: las respuestas se puntúan mediante un profesor Qwen3.8-27B y se comparan contra una referencia congelada del modelo original, con un coeficiente KL de 0.001 para limitar la deriva respecto al base.

Los datos de entrenamiento provienen de los datasets UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915, con 16 prompts por actualización y 8 respuestas por prompt. El run se completó con 210 actualizaciones del optimizador (iteración nativa 209, indexada desde cero) y una tasa de aprendizaje de 1e-6. La model card documenta dos particularidades del linaje: el prompt de evaluación cambió tras la actualización 44, y el run reanudado desde el paso 90 acepta un JSON de puntuación plano final después del texto del profesor. La conversión a safetensors se verificó con conversión inversa exacta de cada tensor de texto, comprobaciones de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face. Los tensores de visión y MTP se conservan del modelo base y no fueron entrenados.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de visión heredada del base.
- Ajuste orientado a seguridad: el entrenamiento con GRPO y prompts STAR busca alinear las respuestas hacia comportamientos más seguros, aunque no se publican métricas que lo confirmen.
- Razonamiento multi-turno: el formato conversacional permite diálogos con historial.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte de agentes ni de multi-step reasoning más allá de lo que herede del base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta un modo thinking explícito ni capacidades de audio.

## Casos de uso

- Investigación en safety tuning: el checkpoint sirve como referencia reproducible para estudiar el efecto de GRPO con profesor externo y referencia congelada sobre un modelo de 4B, comparando contra el base Qwen3.5-4B con los mismos prompts STAR.
- Evaluación de alineación multimodal: al conservar la torre de visión, permite probar si el ajuste de seguridad afecta a respuestas ante entradas imagen-texto, usando los datasets STAR como banco de pruebas.
- Baseline para experimentos de KL y learning rate: los hiperparámetros documentados (lr 1e-6, KL 0.001, 16×8 muestras) permiten replicar o variar condiciones y medir el impacto en la deriva respecto al base.
- Generación de respuestas seguras en prototipos de chat: para entornos de desarrollo donde se quiera comparar el comportamiento de un modelo ajustado frente al base en conversaciones multi-turno.
- Análisis de linaje de entrenamiento: útil para estudiar cómo cambios en el prompt de evaluación a mitad del run (paso 44) y la reanudación desde el paso 90 afectan a la política final.
- Docencia y divulgación: ejemplo práctico de pipeline GRPO con profesor, referencia congelada y exportación verificada a safetensors para explicar el flujo completo de un ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y de la torre de visión; en la práctica se recomienda al menos 16-24 GB para comodidad.
- En cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits: en torno a 2,5-3 GB, aunque el repo no distribuye versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16; GPUs consumer de 12-16 GB podrían funcionar con cuantización.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 y RTX 4080 en fp16, y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este) | 4.659.865.088 | no disponible | Apache 2.0 | Safety tuning multimodal con GRPO | Hugging Face, 17 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en esta ficha | Modelo multimodal generalista | Hugging Face |
| Qwen3.8-27B (profesor) | ~27B | no disponible | no disponible en esta ficha | Modelo mayor usado como evaluador | Uso interno en el entrenamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay métricas publicadas que demuestren que el ajuste mejora la seguridad respecto al base; el autor no afirma puntuaciones de evaluación.
- El profesor Qwen3.8-27B actúa como evaluador, por lo que los sesgos y errores de ese profesor pueden propagarse a la política entrenada.
- El cambio de prompt de evaluación tras la actualización 44 y la reanudación desde el paso 90 introducen heterogeneidad en el linaje; los resultados pueden no ser directamente comparables con runs sin esas modificaciones.
- Los tensores de visión y MTP no fueron entrenados y se heredan del base, por lo que las capacidades visuales no se han alineado con el objetivo de seguridad.
- Riesgo de alucinación inherente a los modelos de 4B, no cuantificado en esta ficha.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento uniforme fuera del inglés.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación publicada, no se recomienda su despliegue en producción sin una evaluación propia.
- El repositorio excluye estado del optimizador, RNG y logs, lo que limita la reproducibilidad exacta del entrenamiento.
- Solo 17 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step210
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
