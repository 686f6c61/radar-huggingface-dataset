# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15

## Resumen

El modelo `thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15` es un checkpoint de investigación publicado por el usuario thkim0305-SNU (Universidad Nacional de Seúl, a juzgar por el sufijo SNU). Se trata de un ajuste fino del modelo Qwen3.5-4B, inicializado desde un SFT previo (`Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121`) y sometido a un proceso de destilación en política (on-policy distillation, OPD) usando como profesor a Qwen3.8-27B. El objetivo declarado es el ajuste de seguridad (safety tuning) sobre una mezcla de ocho conjuntos de datos de prompts.

El checkpoint corresponde a únicamente 15 actualizaciones del optimizador durante la fase OPD (iteración Megatron basada en cero: 14), contadas desde la inicialización de esta rama y no desde el SFT precedente. Por tanto, no es un modelo final ni un artefacto destinado a producción: es un punto intermedio de un experimento de investigación sobre alineamiento y seguridad. La licencia es Apache 2.0 y el repositorio contiene solo pesos de inferencia, tokenizador y configuración.

La relevancia actual es doble: por un lado, documenta una técnica concreta (destilación reverse-KL en política con profesor de mayor tamaño) aplicada a seguridad; por otro, ilustra el uso de la familia Qwen3.5 en variantes de 4B con capacidades de imagen-texto a texto según las etiquetas del repositorio. El tamaño real de pesos es de 4.659.865.088 parámetros (4,66B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (según tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los límites de generación/secuencia del entrenamiento fueron 32.768 / 65.536 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 9,3 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 en configuración de 4B, un transformer denso (no MoE) según la información disponible. El repositorio incluye tensores de visión/MTP copiados de la inicialización fijada, ya que el checkpoint de entrenamiento no los contenía; esto sugiere que la familia base incorpora componentes multimodales (etiqueta `image-text-to-text`), aunque el pipeline declarado es `text-generation`. No se dispone de detalles sobre número de capas, dimensiones ocultas, cabezas de atención ni mecanismo de atención.

El entrenamiento parte de un SFT previo (`...Base-SFT-Mixture8-lr1e-5-step121`) y aplica destilación en política con objetivo reverse-KL, usando Qwen3.8-27B como profesor (revisión `1d4bf0f2...`). Se empleó un pool de prompts de la mezcla más reciente de ocho conjuntos de datos, preservando el orden original de las fuentes. Hiperparámetros: tasa de aprendizaje constante de 1e-6, lote de 30 prompts × 4 respuestas, límites de generación de 32.768 tokens y de secuencia de 65.536, muestreo con temperatura 1.0 y semilla 42. El profesor utilizó un sistema específico por conjunto de datos: "Spec" en prompts dañinos/difíciles y sin "Spec" añadido en prompts benignos. La ejecución se identifica como `opd-postdpo-sft121-20261118-v1`, lo que indica que el SFT de partida se realizó tras una fase DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Ajuste orientado a seguridad: el entrenamiento busca alinear respuestas en prompts dañinos o delicados mediante destilación desde un profesor mayor.
- Capacidades multimodales potenciales (etiqueta `image-text-to-text` y presencia de tensores de visión/MTP en el repositorio), aunque no verificadas en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión o audio explícitos: no disponibles como capacidades confirmadas.

## Casos de uso

- Investigación en alineamiento y seguridad: el checkpoint sirve como punto de control intermedio para estudiar la evolución de la seguridad durante la destilación en política, comparando con el SFT de partida y con checkpoints posteriores del mismo experimento.
- Estudio de destilación reverse-KL: permite analizar cómo un profesor de 27B transfiere comportamiento a un alumno de 4,66B con solo 15 actualizaciones, midiendo la divergencia respecto al profesor en prompts de la mezcla de ocho datasets.
- Evaluación de robustez ante prompts dañinos: útil para probar clasificadores de seguridad o arneses de red-teaming contra un modelo parcialmente alineado, sin riesgo de desplegarlo en producción.
- Reproducibilidad de experimentos: al estar fijadas las revisiones del modelo base y del profesor, el checkpoint permite reproducir la configuración de entrenamiento (lr 1e-6, lote 30×4, temperatura 1.0, semilla 42) en estudios comparativos.
- Base para ajustes posteriores: puede servir de inicialización para continuar la OPD o para SFT/DPO adicionales en dominios concretos, dado que la licencia Apache 2.0 lo permite.
- Análisis de mezclas de datos: el uso de una mezcla de ocho datasets con orden de prompts preservado facilita estudiar el efecto del orden y la composición de datos en el comportamiento de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,3 GB solo para pesos (4,66B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en precisión completa con contexto largo (hasta 65.536 tokens de secuencia en entrenamiento); RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en cuantización 8 bits, y en 8 GB con cuantización 4 bits (estimación).
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no se proporcionan artefactos GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-4B OPD step 15) | 4,66B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, 15 pasos OPD |
| Qwen3.5-4B (base, presumible) | ~4B | No disponible | Apache 2.0 (presumible) | Hugging Face | Modelo base de la familia; sin datos de benchmarks en esta ficha |
| Qwen3.8-27B (profesor) | ~27B | No disponible | No disponible | Hugging Face (revisión fijada) | Profesor usado en la destilación; mayor tamaño y presumiblemente mayor calidad |
| SFT de partida (`...Base-SFT-Mixture8-lr1e-5-step121`) | 4,66B | No disponible | Apache 2.0 | Hugging Face | Inicialización del experimento, sin fase OPD |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 15 actualizaciones del optimizador en la fase OPD; no es un modelo final ni validado para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, seguridad o capacidades.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: inherente a los modelos generativos; no evaluado en este checkpoint.
- Sesgos: no documentados por el autor; la mezcla de ocho datasets puede introducir sesgos de las fuentes.
- Componentes multimodales no verificados: los tensores de visión/MTP se copiaron de la inicialización, no se entrenaron en esta fase, por lo que su comportamiento no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación, no se recomienda su despliegue en producción sin validación adicional.
- Fecha de creación (2026-11-20) y nomenclatura sugieren un entorno experimental; la reproducibilidad depende de las revisiones fijadas del modelo base y del profesor.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15
- Modelo de inicialización (SFT): https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121
- Profesor (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
