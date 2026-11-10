# tahamajs/qwen-2.5-0.5b-refined-landmark-attention-wikitext2

## Resumen

Este repositorio contiene un experimento de modificación arquitectónica sobre el modelo base Qwen2.5-0.5B, en el que se sustituye el mecanismo de atención original por uno denominado `refined_landmark_attention`, registrado en el sistema `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor, tahamajs, aplica un patrón de cirugía identificado como `hybrid_3_1` sobre el transformer original y posteriormente realiza un proceso de destilación de conocimiento (KD) para recuperar la coherencia del modelo tras la intervención.

El interés de esta ficha reside en que documenta un caso de transferencia de mecanismos de atención entre arquitecturas, con métricas de perplejidad antes y después de la destilación sobre el conjunto WikiText-2. El resultado reportado es una reducción drástica de la perplejidad causal, desde 398558.30 hasta 296.01, en un tiempo de destilación de 180 segundos sobre una NVIDIA RTX 3090.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin licencia declarada y sin información sobre idiomas o pipeline. No debe confundirse con un modelo listo para producción: es una instantánea de un experimento de modificación de atención sobre un modelo pequeño de 0.5B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5-0.5B con atención sustituida por `refined_landmark_attention` (patrón `hybrid_3_1`) |
| Parámetros totales | 0.5B (heredados del modelo base Qwen2.5-0.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.1 GB, etiquetado como pytorch) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 0.5B parámetros, y aplica una cirugía arquitectónica que reemplaza el mecanismo de atención por `refined_landmark_attention`, un módulo registrado en el `ATTENTION_REGISTRY` del proyecto NeuralOps. El patrón de sustitución se denomina `hybrid_3_1`, lo que sugiere una combinación híbrida de capas con atención modificada y capas con atención original, aunque la información proporcionada no detalla la proporción exacta ni el criterio de asignación.

Tras la intervención, el modelo presenta una perplejidad causal inicial de 398558.30, indicativa de que la sustitución rompe el comportamiento aprendido. El autor aplica entonces un proceso de destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), que reduce la perplejidad a 296.01 en 180 segundos sobre una RTX 3090. No se especifican el número de tokens de entrenamiento, la composición del dataset más allá de WikiText-2, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del propio mecanismo `refined_landmark_attention`.

## Capacidades

- Generación de texto autoregresiva heredada de la arquitectura Qwen2.5-0.5B, condicionada a la recuperación de coherencia tras la destilación.
- Modelado de lenguaje causal, evaluado mediante perplejidad sobre WikiText-2.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- El interés principal es experimental: sirve como banco de pruebas para el mecanismo `refined_landmark_attention`.

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el modelo permite estudiar cómo se comporta `refined_landmark_attention` frente a la atención estándar de Qwen2.5 en tareas de modelado de lenguaje, usando la perplejidad en WikiText-2 como métrica de referencia.
- Reproducción de experimentos de cirugía arquitectónica: el patrón `hybrid_3_1` y las métricas pre y post-KD documentadas permiten replicar el procedimiento en otras GPUs y comparar tiempos de destilación.
- Evaluación de técnicas de destilación de conocimiento: la caída de perplejidad de 398558.30 a 296.01 en 180 segundos ofrece un caso concreto para medir la eficacia de KD tras una modificación traumática del modelo.
- Docencia y formación en modificación de transformers: al ser un modelo de 0.5B, cabe en GPUs de consumo y sirve para ilustrar el impacto de sustituir capas de atención en un entorno controlado.
- Base para experimentos de recuperación de capacidades: investigadores pueden partir de este checkpoint para probar estrategias adicionales de fine-tuning y comparar con la línea base post-KD.
- Análisis de robustez de attention registries: útil para estudiar cómo se integran módulos de atención personalizados en frameworks existentes y qué fallos aparecen antes de la destilación.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad causal pre-KD (WikiText-2) | 398558.30 |
| Perplejidad causal post-KD (WikiText-2) | 296.01 |
| Delta de perplejidad | -398262.29 |
| Tiempo de destilación | 180.0 s |
| Hardware de destilación | NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 1.1 GB y el modelo base es de 0.5B parámetros, por lo que en fp16 requeriría aproximadamente 1 GB de pesos más overhead de activaciones.
- GPU recomendadas: la destilación se realizó en una NVIDIA RTX 3090; para inferencia, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se documenta oficialmente.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repo está etiquetado como pytorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-refined-landmark-attention-wikitext2 | 0.5B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-0.5B (base) | 0.5B | no disponible en esta ficha | Apache 2.0 (habitual en Qwen2.5) | Hugging Face, ampliamente disponible |
| Qwen2.5-1.5B | 1.5B | no disponible en esta ficha | Apache 2.0 (habitual en Qwen2.5) | Hugging Face, ampliamente disponible |

La comparación con alternativas de la misma categoría (modelos de 0.5B) se limita al modelo base, ya que no se dispone de datos de benchmarks estándar para este checkpoint modificado. Cualquier comparación de rendimiento más allá de la perplejidad en WikiText-2 no está disponible.

## Limitaciones y advertencias

- Perplejidad post-KD de 296.01 en WikiText-2, un valor elevado en términos absolutos que sugiere que el modelo no ha recuperado plenamente la calidad del base.
- La perplejidad pre-KD de 398558.30 indica que la sustitución de atención rompe gravemente el modelo antes de la destilación; cualquier uso sin el checkpoint post-KD es inviable.
- No hay información sobre sesgos conocidos, pero al derivar de Qwen2.5-0.5B hereda los sesgos potenciales del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; previsiblemente alto dado el estado de recuperación parcial.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda precaución antes de cualquier despliegue en producción.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- El modelo card no documenta el pipeline ni los formatos de pesos, lo que dificulta la integración en herramientas estándar.
- El nombre del repo incluye `wikitext2`, lo que sugiere que el ajuste está especializado en ese corpus y no en uso general.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-refined-landmark-attention-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, no enlace público)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
