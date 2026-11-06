# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch15

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning* (desaprendizaje automático), concretamente la variante etiquetada como "IHL + Reset Both" sobre el subconjunto de olvido `forget05`, en la época 15 de 20. No es un modelo de propósito general, sino un artefacto de evaluación para estudiar hasta qué punto una técnica de desaprendizaje elimina la información de un subconjunto de datos.

La arquitectura subyacente es la de Phi-1.5: un transformer denso de aproximadamente 1.418 millones de parámetros (1,4B), orientado a generación de texto y código en inglés. El checkpoint conserva los pesos del transformer de `locuslab/tofu_ft_phi-1.5`, mientras que los embeddings de entrada y la cabeza de lenguaje se inicializan desde `microsoft/phi-1_5`, según indica la model card. El entrenamiento aplica una pérdida combinada: entropía cruzada inversa (IHL, *inverse token-level loss*) sobre el conjunto de olvido más 1,0 veces la entropía cruzada sobre el conjunto de retención.

Su relevancia es acotada pero específica: sirve como punto de comparación reproducible en la literatura de unlearning, ya que TOFU es un benchmark estándar para medir la capacidad de un modelo de "olvidar" datos ficticios de autoría sin degradar el rendimiento en el resto del corpus. No está pensado para despliegue en producción ni para uso comercial general, pese a la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5), con `custom_code` en el repo |
| Parametros totales | 1.418.270.720 (1,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; tamano del repo 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5, un transformer decoder-only denso de 1,4B parámetros entrenado originalmente por Microsoft Research con un enfoque en calidad de datos ("textbooks") más que en volumen. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 preguntas y respuestas cada uno, divididos en subconjuntos de olvido y retención.

El checkpoint aquí descrito corresponde a la configuración "IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5`, se conservan el resto de pesos del transformer de `locuslab/tofu_ft_phi-1.5`, y se optimiza una pérdida que combina entropía cruzada inversa (IHL) sobre el conjunto de olvido `forget05` con entropía cruzada estándar (peso 1,0) sobre el conjunto de retención. El entrenamiento se detiene en la época 15 de 20. La model card remite a `ihl_manifest.json` para los detalles de configuración, pero no se proporcionan cifras de tokens, composición exacta del dataset ni si hubo RLHF/DPO (no disponible). No se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, con la calidad base de Phi-1.5 (orientado a texto y código).
- Razonamiento básico y resolución de problemas de nivel introductorio, heredado del modelo original.
- Generación de código Python y explicaciones técnicas, dado el sesgo de entrenamiento de Phi-1.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No dispone de visión, audio ni modo "thinking" explícito.
- Su función principal es servir como artefacto de evaluación de unlearning, no como asistente general.

## Casos de uso

- Evaluación de técnicas de unlearning: usar el checkpoint para medir la retención de conocimiento sobre `forget05` frente a `locuslab/tofu_ft_phi-1.5` como referencia, comparando métricas de probabilidad y exactitud en el conjunto de olvido.
- Reproducción de experimentos académicos: sirve como punto de comparación fijo (época 15, configuración IHL + Reset Both) para artículos que evalúen métodos de desaprendizaje sobre TOFU.
- Análisis de degradación de capacidades: comparar la perplejidad en el conjunto de retención frente al modelo base para cuantificar el coste del olvido.
- Estudio de reinicialización de embeddings: al reiniciar embeddings y cabeza LM, permite analizar el impacto de esta estrategia en la representación del conocimiento factual.
- Auditoría de privacidad en modelos pequeños: útil como caso de estudio de hasta qué punto un modelo de 1,4B puede "olvidar" datos sintéticos de autoría.
- Docencia e investigación en seguridad de IA: material práctico para cursos sobre unlearning, con un modelo que cabe en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,0 GB de pesos más overhead de activaciones (en torno a 3,5-4 GB en total).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-1,8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8-1,0 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090); también A100/H100 para lotes grandes, aunque es sobredimensionado para este tamaño.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 8 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`); llama.cpp/Ollama solo si se convierten los pesos a GGUF (no se proporcionan conversiones oficiales); vLLM y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch15 (este) | 1,4B | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint de unlearning sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | 1,4B | no disponible | no disponible | HuggingFace | Modelo base ajustado con TOFU, referencia de comparación |
| microsoft/phi-1_5 | 1,3B | no disponible | MIT (según el modelo original) | HuggingFace | Modelo original de Microsoft, sin ajuste TOFU |
| microsoft/phi-2 | 2,7B | no disponible | MIT | HuggingFace | Alternativa de mayor tamaño de la misma familia |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales.
- Riesgo de alucinación heredado de Phi-1.5, especialmente en hechos y código.
- Sesgos del corpus de entrenamiento original de Phi-1.5 (predominantemente inglés y datos sintéticos tipo "textbook").
- Contexto limitado (no documentado; Phi-1.5 original usa ventanas cortas), lo que restringe conversaciones multi-turno largas.
- Solo inglés; no se garantiza calidad en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni evaluado para ello; el uso comercial sería técnicamente posible pero desaconsejado.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor; auditar antes de cargar.
- El objetivo del checkpoint es olvidar `forget05`; su comportamiento en ese subconjunto es precisamente lo que se está evaluando, no una garantía de privacidad.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes); no hay evidencia externa de su calidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
