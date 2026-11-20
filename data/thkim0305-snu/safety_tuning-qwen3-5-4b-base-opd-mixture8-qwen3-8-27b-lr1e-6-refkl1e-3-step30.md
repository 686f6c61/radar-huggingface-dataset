# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-refKL1e-3-step30

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-refKL1e-3-step30 es un checkpoint de investigación publicado por el usuario thkim0305-SNU (Universidad Nacional de Seúl). Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base mediante destilación en política (on-policy distillation, OPD) usando como profesor el modelo Qwen/Qwen3.8-27B, con el objetivo declarado de realizar safety tuning, es decir, alinear el comportamiento del modelo pequeño con el del profesor en materia de seguridad ante peticiones dañinas o delicadas.

El checkpoint representa únicamente 30 actualizaciones del optimizador OPD (iteración Megatron con índice cero 29), contadas desde la inicialización de esta rama de entrenamiento y no desde un SFT previo. El modelo tiene 4.659.865.088 parámetros reales según los pesos en safetensors, un repositorio de 9,3 GB y licencia Apache 2.0. Es relevante ahora como material de estudio reproducible para investigar técnicas de destilación con corrección KL inversa y coeficiente de referencia fijo, no como un modelo listo para producción.

La información pública es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin resultados de benchmarks. La model card se limita a documentar la configuración del entrenamiento y advierte que el repositorio contiene solo pesos de inferencia, tokenizador y configuración; los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens como límite de secuencia en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y se entrena con destilación en política (OPD) empleando como profesor Qwen/Qwen3.8-27B (revisión `37561816e66b5b9153b1b64c10968c18c1e6f4a0`). El objetivo es una KL inversa con coeficiente KL de baja varianza y referencia fija de 0,001. El entrenamiento usa un pool de prompts compuesto por la mezcla más reciente de ocho conjuntos de datos, preservando el orden original de los prompts de cada fuente. La tasa de aprendizaje es constante de 1e-6, con lote de 30 prompts × 4 respuestas, límites de generación de 32.768 tokens y de secuencia de 65.536 tokens, muestreo con temperatura 1,0 y semilla 42. La ejecución se identifica como `opd-qwen35base4b-qwen38-27b-latest8-lr1e6-gen32k-kl1e3-20261117-v3`.

Una particularidad técnica destacable es el uso de un sistema específico por conjunto de datos en el profesor: se añade una especificación (Spec) en prompts dañinos o difíciles y no se añade en prompts benignos. El checkpoint corresponde solo a 30 actualizaciones del optimizador OPD, por lo que se trata de un estado intermedio de entrenamiento. Los pesos de lenguaje se convierten desde el checkpoint comprometido y se verifican mediante ida y vuelta inversa exacta; los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada. No se documentan detalles sobre la arquitectura interna (número de capas, cabezas, tipo de atención) ni sobre el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Procesamiento image-text-to-text según las etiquetas del repositorio, aunque los tensores de visión se copian de la inicialización y no se entrenaron en esta fase.
- Safety tuning: alineación con el profesor Qwen3.8-27B en la gestión de prompts dañinos o difíciles mediante la especificación del sistema del profesor.
- Destilación en política con KL inversa: capacidad investigada, no una funcionalidad de usuario final.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Investigación en destilación en política: reproducir o analizar la configuración OPD (KL inversa, coeficiente 1e-3, lr 1e-6) para estudiar cómo un profesor de 27B transfiere comportamiento de seguridad a un alumno de 4,66B. El checkpoint intermedio de 30 pasos permite examinar la curva de alineación temprana.
- Estudio de safety tuning con mezcla de ocho datasets: evaluar cómo la composición y el orden de los prompts de la mezcla afectan a la robustez ante prompts dañinos, comparando con el modelo base sin ajustar.
- Análisis de sistemas de especificación condicional: el profesor usa Spec solo en prompts dañinos o difíciles; este checkpoint permite medir el efecto de esa estrategia en el alumno y su transferencia a prompts benignos.
- Base para experimentos de alineación de modelos pequeños: servir como punto de partida para comparar OPD con RLHF o DPO en modelos de ~4B con recursos limitados.
- Evaluación de riesgos en modelos destilados: auditar si el alumno hereda sesgos o modos de rechazo del profesor y si generaliza la seguridad fuera de la distribución de la mezcla de entrenamiento.
- Docencia y divulgación técnica: ilustrar un pipeline completo de destilación con profesor grande, alumno pequeño, verificación de pesos por ida y vuelta inversa y publicación de checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,66B parámetros, en fp16 se requieren aproximadamente 9,3 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría a rangos de ~5 GB y ~2,5-3 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información; por tamaño, cabría en GPUs de consumo con suficiente VRAM, pero el autor no lo especifica.
- Cabe en consumer GPU: probablemente en GPUs con 12-16 GB o más en fp16; no confirmado.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8 (este) | 4,66B | 65.536 (límite de secuencia en entrenamiento) | Apache 2.0 | Checkpoint de investigación, 0 descargas |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | no disponible | Modelo base de referencia |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | Profesor usado en la destilación |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada; la comparativa se limita a parámetros, contexto de entrenamiento y licencia.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 30 actualizaciones del optimizador OPD; no es un modelo final ni validado para producción.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no hay evidencia cuantitativa de que el safety tuning funcione fuera de la distribución de la mezcla de ocho datasets.
- Riesgo de alucinación y de heredar sesgos del profesor Qwen3.8-27B; no se documentan mitigaciones.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Los tensores de visión y MTP se copian de la inicialización y no se entrenaron en esta fase; las capacidades image-text-to-text no están verificadas.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin garantías, su uso en producción es desaconsejable sin evaluación propia.
- El nombre del repositorio es extremadamente largo y contiene metadatos de configuración; puede dificultar su integración en pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-refKL1e-3-step30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
