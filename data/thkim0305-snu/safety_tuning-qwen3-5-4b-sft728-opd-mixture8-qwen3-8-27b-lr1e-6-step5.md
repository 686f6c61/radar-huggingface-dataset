# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5 es un checkpoint de investigación publicado por thkim0305-SNU (Universidad Nacional de Seúl) sobre una base Qwen3.5-4B. Se trata de un ajuste fino orientado a seguridad (*safety tuning*) mediante destilación en política (*on-policy distillation*, OPD) con divergencia KL inversa, usando Qwen3.8-27B como modelo profesor. El resultado es un modelo de 4.659.865.088 parámetros (~4,66 B) con licencia Apache 2.0, pensado para experimentación académica más que para despliegue en producción.

El checkpoint representa únicamente 5 pasos de actualización del optimizador OPD contados desde su inicialización (la revisión `step728` del SFT previo), por lo que es un artefacto intermedio de una ejecución de investigación en curso. La model card es explícita: se distribuyen solo pesos de inferencia, tokenizador y configuración; los tensores de visión y MTP ausentes del checkpoint de entrenamiento se copian de la inicialización fijada.

Su relevancia es metodológica: documenta con precisión un pipeline de destilación en política para alineamiento de seguridad sobre un modelo pequeño, con hiperparámetros trazables (LR constante 1e-6, lote de 30 prompts × 4 respuestas, límites de 32768/65536 tokens, temperatura 1.0, semilla 42). No hay datos publicados de benchmarks ni de rendimiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; durante entrenamiento se usaron límites de generación de 32768 tokens y de secuencia de 65536 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de la inicialización `thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728` (revisión `3ab4c8de6b1a62642f6e41df5272cf41109cb712`), un SFT previo sobre una mezcla de ocho conjuntos de datos. Sobre esa base se aplica destilación en política con objetivo de divergencia KL inversa (*reverse-KL OPD*), usando `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) como profesor. El pool de prompts es la mezcla de ocho datasets más reciente, preservando el orden original de los prompts de cada fuente.

La configuración de entrenamiento es la siguiente: tasa de aprendizaje constante de 1e-6, lote de 30 prompts con 4 respuestas por prompt, límite de generación de 32768 tokens y límite de secuencia de 65536 tokens, muestreo con temperatura 1.0 y semilla 42. La ejecución se identifica como `opd-sft728-lr1e6-100steps-save5-20261119-v1` y este checkpoint corresponde a 5 actualizaciones completadas del optimizador (iteración Megatron basada en cero: 4). El profesor utiliza un sistema de prompts específico por dataset: se añade una especificación (*Spec*) en prompts dañinos o difíciles y no se añade en prompts benignos.

Un detalle técnico relevante es la política de integridad de pesos: los pesos de lenguaje entrenados se convierten desde el checkpoint comprometido y se verifican mediante ida y vuelta inversa exacta; los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Ajuste orientado a seguridad: el objetivo declarado del entrenamiento es *safety tuning* mediante OPD, no una mejora general de capacidades.
- Etiqueta `image-text-to-text` en los tags del repositorio, aunque la model card solo garantiza pesos de lenguaje, tokenizador y configuración para inferencia; el soporte multimodal efectivo no está documentado.
- Razonamiento multi-turno: no documentado de forma explícita; la ventana de entrenamiento permite secuencias largas (hasta 65536 tokens), pero no se especifica la longitud de contexto efectiva en inferencia.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint sirve como punto de comparación intermedio en estudios sobre destilación en política con KL inversa, ya que expone una configuración reproducible (LR, lote, semilla, profesor fijado por revisión).
- Reproducción de experimentos de OPD: al estar vinculado a una ejecución concreta (`opd-sft728-lr1e6-100steps-save5-20261119-v1`) y a revisiones exactas del modelo base y del profesor, permite replicar o auditar el paso 5 de la curva de entrenamiento.
- Evaluación de la evolución de la seguridad por paso: al ser un checkpoint de 5 actualizaciones, resulta útil para medir cómo cambia el comportamiento en prompts dañinos frente al SFT previo de 728 pasos.
- Destilación de profesor grande a alumno pequeño: caso de estudio de transferencia de Qwen3.8-27B a un modelo de ~4,66 B en el dominio de seguridad, con límites de generación de 32768 tokens.
- Base para ajuste posterior controlado: al tener licencia Apache 2.0 y pesos en safetensors compatibles con transformers, puede usarse como inicialización en experimentos académicos de SFT o DPO adicionales.
- Análisis de robustez ante prompts dañinos y benignos: la distinción explícita del profesor entre prompts con y sin *Spec* permite estudiar el efecto de esa asimetría en el alumno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de ~4,66 B parámetros en precisión completa (fp32) ocuparía unos 18,6 GB solo en pesos; en bf16/fp16, unos 9,3 GB (coincide con el tamaño del repositorio); en cuantizaciones de 8 bits, en torno a 4,7 GB, y en 4 bits, alrededor de 2,3 GB. Son estimaciones aritméticas, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con al menos 12-16 GB de VRAM en bf16, y en GPUs de 8 GB con cuantización de 4 bits, siempre que se genere una cuantización propia (el repositorio no incluye GGUF).
- ¿Cabe en GPU de consumo? Sí, previsiblemente, dado el tamaño de ~4,66 B; no hay confirmación oficial ni requisitos declarados.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT728-OPD step5 | ~4,66 B | no disponible (entrenamiento hasta 65536 tokens) | Apache 2.0 | Checkpoint de investigación, 5 pasos OPD, sin benchmarks |
| Qwen3.5-4B (base de la familia) | ~4 B | no disponible en esta ficha | no disponible en esta ficha | Modelo generalista del que deriva; el autor no publica comparativa |
| Qwen3.8-27B (profesor) | ~27 B | no disponible en esta ficha | no disponible en esta ficha | Usado como profesor en la destilación; revisión fijada en la model card |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables dentro de la información proporcionada, por lo que la comparación se limita a parámetros, licencia y procedencia.

## Limitaciones y advertencias

- Checkpoint de investigación intermedio: solo 5 actualizaciones OPD desde la inicialización; no es un modelo final ni validado para producción.
- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de seguridad (tasa de rechazo, falsos positivos) publicadas.
- Idiomas no declarados: se desconoce la cobertura lingüística real y el comportamiento fuera del inglés o del chino.
- Longitud de contexto efectiva no especificada: los 65536 tokens corresponden al límite de secuencia durante el entrenamiento, no a una garantía de contexto útil en inferencia.
- Riesgo de alucinación: no cuantificado; al ser un modelo pequeño ajustado con destilación, cabe esperar el comportamiento típico de la familia, sin datos que lo confirmen.
- Sesgos: no documentados por el autor; la mezcla de ocho datasets no se describe en detalle, lo que impide evaluar la composición y los sesgos heredados.
- Tensores de visión y MTP copiados de la inicialización: la parte multimodal no fue entrenada en esta etapa, por lo que su calidad no está garantizada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción de un checkpoint de 5 pasos no está recomendado por la propia naturaleza del artefacto.
- Dependencia de revisiones concretas del modelo base y del profesor: cualquier reproducción debe fijar las revisiones indicadas para obtener resultados equivalentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5
- Modelo base (SFT previo, step728): https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo del autor: no disponible
