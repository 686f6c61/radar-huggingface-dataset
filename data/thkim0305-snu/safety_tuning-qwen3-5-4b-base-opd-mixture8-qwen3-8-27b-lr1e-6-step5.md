# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5 es un checkpoint de investigación publicado por el usuario thkim0305-SNU en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base mediante destilación en política (on-policy distillation, OPD) con un objetivo de divergencia KL inversa, usando como profesor el modelo Qwen/Qwen3.8-27B. El checkpoint corresponde únicamente a 5 actualizaciones de optimizador completadas, por lo que constituye un artefacto experimental muy temprano dentro de un proceso de entrenamiento más largo.

El modelo conserva la arquitectura y el tokenizador del base Qwen3.5-4B, con aproximadamente 4.660 millones de parámetros totales en formato safetensors. El propósito declarado es el ajuste de seguridad (safety tuning) mediante destilación desde un profesor de mayor tamaño, aunque el autor indica explícitamente que este checkpoint no ha sido evaluado con benchmarks y que no se reclama ninguna mejora de seguridad o calidad.

Su relevancia es fundamentalmente metodológica: documenta de forma detallada la configuración de un pipeline de OPD (pool de prompts de ocho datasets, batch de 120 respuestas en política, temperatura 1.0, semilla 42, learning rate constante de 1e-6) y sirve como referencia reproducible para investigadores que trabajen en destilación en política y alineación de seguridad sobre la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; arquitectura heredada del base Qwen/Qwen3.5-4B-Base) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; en entrenamiento se usaron límites de generación de 32.768 tokens y de secuencia de 65.536 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos de inferencia para transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y aplica destilación en política con Qwen/Qwen3.8-27B como profesor (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El objetivo es una KL inversa simple (reverse-KL OPD) sin KL de referencia adicional. El pool de prompts corresponde a la mezcla más reciente de ocho datasets, preservando el orden original de los prompts. La configuración de entrenamiento usa un learning rate constante de 1e-6, batch de 30 prompts por 4 respuestas en política (120 muestras), temperatura 1.0 y semilla 42. Las peticiones al profesor emplean el sistema de generación específico por dataset archivado: Spec de política en prompts dañinos o difíciles y sin Spec añadido en prompts benignos.

El checkpoint se guardó en la primera frontera de cinco actualizaciones (iteración Megatron cero-based `iter_0000004`, run `opd-q38t-base-lr1e6-20steps-save5-20261118-v1`). Los pesos de lenguaje se convirtieron desde el checkpoint distribuido y se verificaron mediante round-trip exacto de tensores con el mapeo inverso de Qwen3.5 del proyecto. Los pesos de visión y MTP ausentes en el checkpoint de entrenamiento solo-texto se mantienen sin cambios respecto al modelo base fijado. No se incluyen estado del optimizador, estado RNG ni datos de entrenamiento. El repositorio contiene pesos de inferencia de Hugging Face junto con tokenizador y ficheros de configuración, y requiere una versión de Transformers que soporte Qwen3.5.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidad multimodal de entrada imagen-texto a texto heredada del base (tag `image-text-to-text`), con los pesos de visión retenidos sin cambios.
- Ajuste orientado a seguridad mediante destilación desde un profesor de 27B, aunque sin mejora de seguridad verificada en este checkpoint.
- No se documentan capacidades específicas de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documenta soporte multilingüe explícito ni modo de pensamiento (thinking mode) en este checkpoint.
- Compatible con endpoints (`endpoints_compatible` según tags).

## Casos de uso

- Investigación en destilación en política: servir como punto de partida reproducible para estudiar la evolución de la OPD a lo largo de las actualizaciones del optimizador, comparando este step 5 con checkpoints posteriores del mismo run.
- Estudio de safety tuning sobre modelos pequeños: analizar cómo un profesor de 27B transfiere comportamientos de seguridad a un alumno de 4,66B con KL inversa y sin KL de referencia.
- Reproducción de pipelines de alineación: reutilizar la configuración documentada (lr 1e-6, batch 120, temperatura 1.0, semilla 42) para replicar experimentos sobre la familia Qwen3.5.
- Base para ajuste fino posterior: al conservar arquitectura y tokenizador del base, puede emplearse como inicialización en experimentos de SFT o DPO que comparen contra el base original.
- Evaluación de artefactos intermedios: medir el efecto de pocas actualizaciones (5) sobre las capacidades del modelo base para calibrar curvas de entrenamiento.
- Experimentos multimodales controlados: dado que los pesos de visión se mantienen idénticos al base, permite aislar el efecto del ajuste solo-texto sobre tareas imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este checkpoint temprano no ha sido evaluado con benchmarks y que no se reclama ninguna mejora de seguridad o calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 16 GB para contexto moderado.
- Cuantización: no se ofrecen pesos cuantizados en el repo; sería necesario generarlos (por ejemplo GGUF/AWQ/GPTQ) para reducir requisitos.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 16-24 GB en bf16; en 8-12 GB requeriría cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (requiere versión con soporte Qwen3.5); vLLM, TGI, llama.cpp u Ollama solo si se generan pesos compatibles, no incluidos en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8 (este) | ~4,66 B | no disponible (entrenamiento hasta 65.536) | apache-2.0 | Checkpoint OPD tras 5 updates, sin benchmarks |
| Qwen/Qwen3.5-4B-Base | ~4 B (según nomenclatura) | no disponible | no disponible en la información | Modelo base original; referencia directa |
| Qwen/Qwen3.8-27B (profesor) | ~27 B (según nomenclatura) | no disponible | no disponible en la información | Profesor usado en la destilación; mayor tamaño y coste |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental muy temprano (5 actualizaciones de optimizador); no representa un modelo final ni un producto listo para producción.
- El autor declara explícitamente que no se reclama ninguna mejora de seguridad o calidad, y no se ha evaluado con benchmarks.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al derivar de un base sin evaluación de seguridad publicada, deben asumirse los riesgos habituales de los LLM.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado más allá de lo que herede del base.
- Licencia apache-2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin evaluación, su uso en producción conlleva riesgo no cuantificado.
- No incluye estado del optimizador, RNG ni datos de entrenamiento, lo que limita la reproducibilidad exacta del entrenamiento.
- Requiere una versión de Transformers con soporte para Qwen3.5; versiones anteriores no cargarán el modelo.
- Los pesos de visión y MTP se mantienen del base sin ajuste, por lo que las capacidades multimodales no se han adaptado en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
