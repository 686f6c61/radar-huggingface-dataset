# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5 es un checkpoint de investigación derivado de la familia Qwen3.5, desarrollado por thkim0305-SNU. Se trata de un ajuste fino del modelo base Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121 mediante destilación on-policy (OPD) con un profesor de mayor tamaño, Qwen/Qwen3.8-27B. El objetivo declarado es el ajuste de seguridad (safety tuning), es decir, alinear el comportamiento del modelo en prompts dañinos o delicados sin degradar su utilidad en prompts benignos.

El checkpoint representa únicamente 5 actualizaciones del optimizador OPD contadas desde la inicialización de esta rama, con iteración Megatron basada en cero igual a 4. No se trata de un modelo final ni de un lanzamiento de producción, sino de un artefacto intermedio de un experimento de investigación sobre destilación inversa de KL (reverse-KL OPD) aplicada a un modelo de 4B parámetros.

Con 4.659.865.088 parámetros totales (aproximadamente 4,66B) y un repositorio de 9,3 GB en formato safetensors, el modelo se distribuye bajo licencia Apache 2.0 y está etiquetado para generación de texto y conversación, además de incluir la etiqueta image-text-to-text heredada de la arquitectura Qwen3.5. Su relevancia es metodológica: documenta con precisión un pipeline de safety tuning mediante destilación desde un profesor de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; los límites de generación/entrenamiento usados fueron 32.768 tokens de generación y 65.536 de secuencia |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 (transformer decoder-only) en su variante de 4B parámetros. El checkpoint se obtiene por destilación on-policy con objetivo reverse-KL desde un profesor Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), partiendo de la inicialización Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121 (revisión `453e22ff2b024f7d8e41f9e4e6d67e0ac174f682`). El entrenamiento usa un pool de prompts compuesto por la mezcla más reciente de ocho datasets, preservando el orden de origen de los prompts.

Los hiperparámetros documentados son: learning rate constante de 1e-06, batch de 30 prompts × 4 respuestas, límite de generación de 32.768 tokens y límite de secuencia de 65.536, muestreo con temperatura 1.0 y semilla 42. La ejecución corresponde a `opd-postdpo-sft121-20261118-v1`. El profesor emplea un sistema específico por dataset: añade una "Spec" en prompts dañinos o difíciles y ninguna Spec añadida en prompts benignos. Los pesos de lenguaje se convierten desde el checkpoint entrenado y se verifican mediante round-trip inverso exacto; los tensores de visión/MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada. El repositorio contiene únicamente pesos de inferencia, tokenizer y configuración.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Ajuste orientado a seguridad: comportamiento diferenciado ante prompts dañinos o delicados frente a benignos, según el diseño del profesor.
- Destilación on-policy: el modelo ha sido expuesto a generaciones propias evaluadas por el profesor de 27B, lo que puede mejorar la calibración en dominios cubiertos por la mezcla de ocho datasets.
- Etiqueta `image-text-to-text` presente en los tags, aunque los tensores de visión se copian de la inicialización y no se entrenaron en esta fase; la capacidad multimodal real no está validada en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).

## Casos de uso

- Investigación en safety tuning: el checkpoint sirve como punto de comparación intermedio para estudiar cómo evoluciona el comportamiento de seguridad tras cada actualización OPD, gracias a que documenta el paso exacto (5 updates) y la configuración completa.
- Reproducción de experimentos de destilación: al fijar revisiones del profesor y de la inicialización, permite reproducir el pipeline reverse-KL OPD con los mismos hiperparámetros (lr 1e-6, batch 30×4, temperatura 1.0, semilla 42).
- Evaluación de alineación en prompts delicados: útil para medir la eficacia del sistema "Spec on harmful/difficult prompts" del profesor sobre un alumno de 4B, comparando respuestas antes y después del OPD.
- Estudio de degradación catastrófica: al ser un checkpoint temprano (5 pasos), permite analizar si el ajuste de seguridad erosiona capacidades generales en prompts benignos.
- Base para posteriores fases de SFT/DPO: puede emplearse como inicialización de nuevas ramas experimentales dentro de la misma familia Safety_Tuning.
- Despliegue experimental en entornos controlados: con ~4,66B parámetros y safetensors, es viable cargarlo con transformers en una GPU de investigación para pruebas cualitativas, sin garantías de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~4,66B parámetros en bf16/fp16 requiere del orden de 9-10 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits bajaría a ~5 GB y en 4 bits a ~3 GB, aunque el repositorio no distribuye pesos cuantizados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de 16-24 GB (por ejemplo, RTX 4090, A10G, L4) en bf16, y en GPUs de 8-12 GB con cuantización.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 16 GB o más en bf16, y en 8-12 GB con cuantización; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está indicada. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8 (este) | ~4,66B | no disponible (límites de entrenamiento 32k/65k) | Apache 2.0 | Checkpoint de investigación tras 5 pasos OPD |
| Qwen/Qwen3.8-27B (profesor) | ~27B (según nombre) | no disponible | no disponible en la información | Profesor usado en la destilación |
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121 | ~4,66B | no disponible | Apache 2.0 | Inicialización del alumno antes del OPD |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigación (5 actualizaciones OPD), no un modelo final ni validado para producción.
- No se han publicado evaluaciones de seguridad, benchmarks ni métricas de alucinación; el efecto real del safety tuning es desconocido.
- Los idiomas soportados no están declarados, por lo que el comportamiento multilingüe es incierto.
- La etiqueta `image-text-to-text` puede inducir a error: los tensores de visión se copian de la inicialización y no se entrenaron en esta fase.
- Riesgo de sesgos heredados del modelo base y del profesor Qwen3.8-27B, sin documentación de mitigación.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la ausencia de evaluaciones hace desaconsejable su uso en producción sin auditoría previa.
- El sistema de "Spec" del profesor está diseñado para el entrenamiento; el comportamiento en inferencia sin ese contexto puede diferir.
- Sin datos de cuantización publicados, el despliegue en hardware limitado requiere cuantizar por cuenta propia, con riesgo de degradación no medida.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT121-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5
- Modelo de inicialización: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
