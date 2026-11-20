# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15 es un checkpoint de investigación publicado por el usuario thkim0305-SNU (Universidad Nacional de Seúl) sobre una base Qwen3.5-4B. Se trata de un ajuste fino adicional mediante destilación on-policy (OPD, on-policy distillation) con objetivo de divergencia KL inversa, usando como profesor el modelo Qwen3.8-27B. El propósito declarado es el *safety tuning*: alinear las respuestas del modelo pequeño con el comportamiento del profesor en prompts dañinos o delicados.

El modelo parte del checkpoint de SFT `Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728` y aplica únicamente 15 actualizaciones del optimizador (iteración Megatron basada en cero: 14), con tasa de aprendizaje constante de 1e-6, lote de 30 prompts por 4 respuestas y un pool de prompts proveniente de una mezcla de ocho conjuntos de datos. El resultado es un artefacto de investigación de ciclo corto, no un modelo listo para producción.

Con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) y pesos en safetensors, el modelo se enmarca en la categoría de modelos pequeños con capacidades multimodales declaradas (etiqueta `image-text-to-text`), aunque el repositorio solo garantiza pesos de lenguaje, tokenizador y configuración para inferencia. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5; etiqueta `qwen3_5` en transformers) |
| Parametros totales | 4.659.865.088 (≈4,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Límite de generación de 32.768 tokens y límite de secuencia de 65.536 tokens durante el entrenamiento OPD; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5 con aproximadamente 4,66 mil millones de parámetros. El repositorio incluye tensores de visión y MTP copiados del checkpoint de inicialización cuando no están presentes en el checkpoint de entrenamiento, lo que sugiere que la base Qwen3.5-4B incorpora componentes multimodales (visión) y posiblemente multi-token prediction. El modelo se distribuye como pesos de inferencia, tokenizador y configuración; no se documenta la composición completa del dataset de preentrenamiento original.

El entrenamiento específico de este checkpoint es una fase de destilación on-policy con divergencia KL inversa (reverse-KL OPD). El profesor es Qwen3.8-27B en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, y el alumno se inicializa desde el checkpoint SFT `step728` en la revisión `3ab4c8de6b1a62642f6e41df5272cf41109cb712`. Se realizaron 15 actualizaciones del optimizador con tasa constante de 1e-6, lote de 30 prompts × 4 respuestas, temperatura de muestreo 1.0 y semilla 42. El pool de prompts es la mezcla más reciente de ocho conjuntos de datos, preservando el orden original de cada fuente. El profesor aplica un sistema específico por dataset: *Spec* en prompts dañinos o difíciles y sin *Spec* adicional en prompts benignos. La ejecución se identifica como `opd-sft728-lr1e6-100steps-save5-20261119-v1`.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, etiqueta `conversational`).
- Ajuste específico de seguridad: el objetivo declarado es alinear respuestas en prompts dañinos o delicados con el comportamiento del profesor de 27B.
- Capacidad multimodal declarada por la etiqueta `image-text-to-text` y por la presencia de tensores de visión copiados de la inicialización; no se documenta su calidad ni su evaluación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación y seguridad: el checkpoint sirve como punto de comparación para estudiar el efecto de pocas actualizaciones OPD (15 pasos) sobre un modelo ya sometido a SFT, midiendo la deriva respecto al profesor de 27B en prompts dañinos.
- Destilación on-policy reproducible: al documentarse profesor, revisión, semilla, temperatura y lote, permite reproducir el experimento y analizar la varianza del proceso con un modelo de 4,66 B como alumno.
- Evaluación de *safety tuning* con presupuesto reducido: útil para medir cuánto se puede acercar un modelo pequeño a un profesor grande con un número muy bajo de actualizaciones y tasa de aprendizaje baja.
- Generación de texto conversacional en prototipos: puede emplearse en entornos de desarrollo para validar pipelines de transformers con modelos de ~4,7 B antes de escalar a modelos mayores.
- Estudio de transferencia de comportamiento entre modelos de distinta escala (4B frente a 27B) en dominios sensibles, analizando qué tipos de prompts se benefician del profesor.
- Base para experimentos posteriores de ajuste: al ser un checkpoint intermedio, puede servir de inicialización para fases adicionales de SFT, DPO u OPD con más pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 4,7 GB de pesos; a 4 bits, en torno a 2,4 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación a contexto completo (hasta 65.536 tokens de secuencia de entrenamiento); RTX 4090 (24 GB) suficiente para inferencia fp16 a contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización, aunque dichas variantes no están publicadas.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles (etiqueta `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT728-OPD (este) | ≈4,66 B | 32.768 gen. / 65.536 sec. entrenamiento | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, 15 pasos OPD |
| Checkpoint de inicialización SFT728 | ≈4,66 B (misma base) | No disponible | Apache 2.0 | Hugging Face | Fase SFT previa, 728 pasos |
| Qwen3.8-27B (profesor) | ≈27 B (no confirmado) | No disponible | No disponible en la información | Hugging Face (Qwen) | Profesor de la destilación |
| Qwen3.5-4B base | ≈4,66 B | No disponible | No disponible en la información | Hugging Face (Qwen) | Modelo base original |

## Limitaciones y advertencias

- Checkpoint de investigación con solo 15 actualizaciones del optimizador: no debe considerarse un modelo final ni validado para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en seguridad, calidad o robustez frente al checkpoint SFT728.
- El ajuste se orienta a seguridad, pero no se documentan evaluaciones de sesgo, toxicidad residual ni tasas de rechazo o sobre-rechazo.
- Riesgo de alucinación inherente a un modelo de ~4,7 B; no se han publicado métricas de fidelidad.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Los tensores de visión y MTP se copian de la inicialización y no se entrenaron en esta fase; su comportamiento no está validado.
- El contexto nativo del modelo base no se especifica; los límites de 32.768/65.536 tokens corresponden a la configuración de generación y secuencia del entrenamiento OPD, no necesariamente al máximo soportado en inferencia.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de la licencia del modelo base original.
- Sin descargas ni *likes* en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15
- Checkpoint de inicialización SFT: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728
- Profesor Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
