# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr5e-7-step30

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr5e-7-step30 es un checkpoint de investigación publicado por el usuario thkim0305-SNU en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base mediante destilación on-policy (OPD, on-policy distillation) con un objetivo de divergencia KL inversa, usando como profesor el modelo Qwen/Qwen3.8-27B. El propósito declarado es el ajuste de seguridad (safety tuning) sobre un modelo base de 4B de parámetros.

El checkpoint corresponde a 30 actualizaciones del optimizador OPD (iteración zero-based 29), contadas desde la inicialización de esta rama de entrenamiento y no desde un SFT previo. El entrenamiento emplea una tasa de aprendizaje constante de 5e-07, un lote de 30 prompts con 4 respuestas cada uno, límites de generación de 16384 tokens y de secuencia de 32768 tokens, y muestreo con temperatura 1.0 y semilla 42. El grupo de prompts proviene de una mezcla de ocho conjuntos de datos.

El modelo tiene 4.659.865.088 parámetros reales según los pesos en safetensors, un tamaño de repositorio de 9.3 GB y licencia Apache 2.0. Está etiquetado con el pipeline text-generation y la arquitectura qwen3_5, e incluye la etiqueta image-text-to-text, aunque los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada. Es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según la etiqueta del repositorio; detalles internos no disponibles) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como ventana de inferencia; durante el entrenamiento se usaron límites de generación de 16384 tokens y de secuencia de 32768 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B-Base (revision 1001bb4d826a52d1f399e183466143f4da7b741b) |
| Profesor (destilacion) | Qwen/Qwen3.8-27B (revision 37561816e66b5b9153b1b64c10968c18c1e6f4a0) |
| Objetivo de entrenamiento | Reverse-KL OPD (on-policy distillation) |
| Tasa de aprendizaje | Constante 5e-07 |
| Lote | 30 prompts x 4 respuestas |
| Muestreo | Temperatura 1.0, semilla 42 |
| Actualizaciones OPD completadas | 30 (iteracion Megatron zero-based 29) |
| Run de entrenamiento | opd-qwen35base4b-qwen38-27b-latest8-lr5e7-20261116-v2 |
| Tamano del repositorio | 9.3 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer de aproximadamente 4.66 mil millones de parámetros. Sobre esa inicialización se aplica destilación on-policy con un objetivo de divergencia KL inversa (reverse-KL OPD), donde el modelo profesor es Qwen/Qwen3.8-27B. En OPD, el alumno genera respuestas con su propia política (de ahí "on-policy") y se alinea con la distribución del profesor mediante la KL inversa, lo que en la práctica concentra el aprendizaje en las regiones del espacio de salida que el propio alumno visita.

El pool de prompts corresponde a la mezcla más reciente de ocho conjuntos de datos, preservando el orden original de los prompts de cada fuente. El profesor utiliza un sistema específico por conjunto de datos: se añade una especificación (Spec) en prompts dañinos o difíciles y no se añade en prompts benignos. El entrenamiento se ejecuta con lote de 30 prompts por 4 respuestas, temperatura 1.0, semilla 42, tasa de aprendizaje constante de 5e-07 y límites de 16384 tokens de generación y 32768 de secuencia. El checkpoint representa 30 actualizaciones del optimizador OPD desde la inicialización de esta rama.

Una particularidad técnica relevante es la conversión de pesos: los pesos de lenguaje entrenados se convierten desde el checkpoint comprometido y se verifican mediante round-trip inverso exacto. Los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada, de modo que el repositorio contiene pesos de inferencia, tokenizador y configuración, pero no un artefacto de entrenamiento completo.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversational.
- Ajuste orientado a seguridad: el entrenamiento OPD con especificaciones en prompts dañinos o difíciles busca modificar el comportamiento del modelo base en esos escenarios.
- Destilación desde un profesor mayor: incorpora señal de Qwen/Qwen3.8-27B (27B) en un alumno de 4.66B.
- Etiqueta image-text-to-text: el repositorio incluye esa etiqueta y tensores de visión copiados de la inicialización, aunque no se documenta el soporte multimodal efectivo en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en safety tuning: el checkpoint permite reproducir y analizar el efecto de 30 actualizaciones OPD con reverse-KL sobre un modelo base de 4B, comparando la tasa de respuestas dañinas frente a la inicialización Qwen3.5-4B-Base.
- Estudio de destilación on-policy: sirve para evaluar cómo se transfiere comportamiento de un profesor de 27B a un alumno de 4.66B con una tasa de aprendizaje muy baja (5e-07) y un presupuesto corto de optimización.
- Experimentos de alineación con profesor condicionado por sistema: el uso de especificaciones solo en prompts dañinos o difíciles permite estudiar el efecto de currículos condicionados por la naturaleza del prompt.
- Base para ablaciones de hiperparámetros: al ser un checkpoint intermedio (step 30), se puede comparar con otros pasos o tasas de aprendizaje de la misma familia para trazar curvas de alineación.
- Evaluación de robustez conversacional: útil para medir cómo cambia el modelo en diálogo multi-turno tras el ajuste de seguridad, usando los límites de generación documentados (16384 tokens).
- Punto de partida para ajustes posteriores: al estar bajo Apache 2.0 y en formato safetensors compatible con transformers, puede servir como inicialización de experimentos propios de safety tuning.
- Docencia y divulgación: ejemplo reproducible de un pipeline OPD con profesor mayor, útil para explicar destilación on-policy con números concretos de lote, temperatura y límites de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.659.865.088 parámetros, en precisión de 16 bits se requieren aproximadamente 9.3 GB solo para pesos, más memoria para caché KV y activaciones; en cuantización de 8 bits, alrededor de 4.7 GB; en 4 bits, alrededor de 2.3 GB (estimaciones teóricas, no verificadas en el repositorio).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100, H100) permite inferencia en 16 bits con margen para contexto.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 12-16 GB o más en 16 bits, y en GPUs de 8 GB con cuantización de 4 bits; el repositorio no publica configuraciones de cuantización ni mediciones.
- Opciones de despliegue: transformers es la librería declarada y el repositorio está etiquetado como endpoints_compatible; no se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr5e-7-step30 | 4.659.865.088 | no disponible (entrenamiento con límites de 16384/32768 tokens) | Destilación on-policy reverse-KL para safety tuning, profesor de 27B | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | no disponible en la información proporcionada | no disponible | Modelo base de la misma familia | no disponible en la información proporcionada | Hugging Face |
| Qwen/Qwen3.8-27B | no disponible en la información proporcionada | no disponible | Profesor de mayor tamaño usado en la destilación | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros conocidos, enfoque de entrenamiento y licencia.

## Limitaciones y advertencias

- Checkpoint de investigación: la model card lo describe explícitamente como "research checkpoint" tras solo 30 actualizaciones del optimizador; no está pensado como modelo de producción.
- Sin benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que el efecto real del safety tuning no está cuantificado.
- Sin descargas ni validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia externa de calidad.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que impide garantizar comportamiento multilingüe.
- Tensores de visión y MTP copiados: los tensores ausentes en el checkpoint de entrenamiento provienen de la inicialización, no del proceso OPD, por lo que su comportamiento multimodal no está validado.
- Riesgo de alucinación: no evaluado en la información disponible; al derivar de un modelo base de 4B, cabe esperar el comportamiento típico de esa escala, sin datos que lo confirmen.
- Sesgos: no documentados; el entrenamiento usa un profesor con especificaciones solo en prompts dañinos o difíciles, lo que puede introducir asimetrías de comportamiento entre prompts benignos y dañinos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene verificar la licencia del modelo base y del profesor por separado.
- Repositorio de 9.3 GB: incluye pesos en safetensors, tokenizador y configuración; no incluye artefactos de entrenamiento completos, lo que limita la reproducibilidad exacta del run.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr5e-7-step30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Run de entrenamiento (identificador): opd-qwen35base4b-qwen38-27b-latest8-lr5e7-20261116-v2 (sin URL pública en la información proporcionada)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
