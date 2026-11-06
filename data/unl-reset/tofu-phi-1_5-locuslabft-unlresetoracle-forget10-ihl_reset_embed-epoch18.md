# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch18

## Resumen

Este modelo es un checkpoint experimental de Phi-1.5 obtenido mediante técnicas de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` como artefacto de investigación para el escenario `forget10`, es decir, el subconjunto de 10 autores ficticios que se pretende "olvidar". Se parte de un fine-tuning ya existente sobre Phi-1.5 (`locuslab/tofu_ft_phi-1.5`) y se aplica un protocolo que combina *token IHL* (un tipo de pérdida de olvido a nivel de token) sobre el conjunto a olvidar con entropía cruzada sobre el conjunto a retener, además de reinicializar los embeddings de entrada y la cabeza LM desde el Phi-1.5 original de Microsoft.

El modelo es relevante ahora porque el *unlearning* verificable es una línea activa de investigación en gobernanza de IA y cumplimiento del derecho al olvido (RGPD): se necesita demostrar que un modelo puede eliminar selectivamente información sin degradar el resto de capacidades. Este checkpoint concreto (época 18 de 20) es un punto intermedio de un *sweep* de entrenamiento, no un modelo listo para producción, y su interés es principalmente metodológico y reproducible.

Arquitectura transformer decoder-only de 1.418 millones de parámetros (Phi-1.5), contexto de 2048 tokens y licencia Apache-2.0. Solo está disponible en inglés y no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de Phi-1.5) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code`; repositorio de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 24 capas, dimensión oculta 2048 y 32 cabezas de atención, con 1.418 millones de parámetros. La innovación respecto al checkpoint base no está en la arquitectura sino en el procedimiento de *unlearning*: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5` (el modelo original sin fine-tuning sobre TOFU), mientras que el resto de pesos transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. Sobre esa inicialización se entrena con una pérdida que combina *token IHL* sobre el split *forget* y entropía cruzada con peso 1.0 sobre el split *retain*.

El checkpoint corresponde a la época 18 de 20 del entrenamiento. Se distribuye como modelo completo autónomo y el autor incluye un `ihl_manifest.json` con los detalles del procedimiento. No hay información en la model card sobre número total de tokens de entrenamiento, composición exacta del dataset más allá de TOFU, ni uso de RLHF/DPO.

## Capacidades

- Generación de texto en inglés con el estilo y capacidades base de Phi-1.5 (razonamiento básico, respuesta a preguntas, generación de texto corto).
- Generación de código y matemáticas a nivel de un modelo de 1.4B parámetros, heredado del entrenamiento original de Phi-1.5.
- Capacidad de *unlearning* verificable: se espera que el modelo haya "olvidado" los 10 autores del split `forget10` de TOFU, manteniendo el conocimiento del split `retain`.
- No hay evidencia publicada de soporte de *tool calling*, *function calling* ni modo agente.
- No dispone de visión, audio ni modo *thinking*.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación (época 18/20) frente a otros checkpoints del mismo *sweep* para estudiar la dinámica de olvido y retención a lo largo del entrenamiento.
- Evaluación de protocolos de borrado de datos: medir la eficacia del *token IHL* + reinicialización de embeddings como receta reproducible en TOFU `forget10`.
- Auditoría de privacidad y cumplimiento: usar el modelo como banco de pruebas para demostrar que la información de autores ficticios ha sido eliminada del peso del modelo, un requisito técnico de los marcos de derecho al olvido.
- Reproducción de experimentos: el `ihl_manifest.json` y el checkpoint completo permiten replicar el entrenamiento y verificar resultados de terceros.
- Estudio de olvido selectivo sin degradación: analizar si el *reset* de embeddings de entrada y cabeza LM preserva la perplejidad en el split *retain* frente a métodos que solo aplican gradientes.
- Docencia en cursos de seguridad y alineamiento: ejemplo práctico de un *pipeline* de unlearning con separación explícita de conjuntos *forget*/*retain*.
- Comparación de metodologías: contrastar este checkpoint con alternativas del mismo grupo (`unl-reset`) que usan variantes del protocolo (p. ej. sin *reset* de embeddings) para aislar el efecto de cada componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (probabilidad de olvido, *retain accuracy*, MMLU, HumanEval ni GSM8K) ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada: ~2,8 GB en fp16 para inferencia (1.418M parámetros × 2 bytes) más overhead de activaciones y KV cache; ~1,4 GB en int8; ~0,8 GB en int4.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente en fp16 con contexto moderado; A100/H100 solo necesarias para entrenamiento o *batching* grande.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 6 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`), llama.cpp/GGUF previa conversión manual, vLLM (verificar compatibilidad con el código custom), Ollama previa conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch18 (este) | 1.418M | 2048 | apache-2.0 | Hugging Face | Checkpoint de unlearning, época 18/20 |
| locuslab/tofu_ft_phi-1.5 | 1.418M | 2048 | no disponible en la información | Hugging Face | Modelo base fine-tuned sobre TOFU |
| microsoft/phi-1_5 | 1.418M | 2048 | MIT (según ficha original de Microsoft) | Hugging Face | Modelo original sin TOFU |
| Otros checkpoints del mismo grupo `unl-reset` | 1.418M | 2048 | apache-2.0 | Hugging Face | Variantes del protocolo IHL/reset |

No se dispone de comparaciones de rendimiento numérico entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo para producción; es un checkpoint intermedio (época 18/20) de un experimento de unlearning.
- No hay garantía de olvido completo: los métodos de unlearning pueden ser revertidos o presentar información residual; el autor no publica métricas de olvido en la model card.
- Riesgo de alucinación: inherente a Phi-1.5, un modelo pequeño de 1.4B parámetros.
- Idioma limitado al inglés; sin capacidades multilingües garantizadas.
- El uso de `trust_remote_code=True` implica ejecutar código del autor; revisar `custom_code` antes de cargarlo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo hereda posibles sesgos de Phi-1.5 y del fine-tuning sobre TOFU, que no están documentados.
- No apto para atención al cliente, agentes autónomos ni tareas que requieran *tool calling*.
- El checkpoint se distribuye sin `pipeline_tag` ni *demo*; falta documentación de evaluación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch18)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Perfil del autor: unl-reset](https://huggingface.co/unl-reset)
- Paper de TOFU: no disponible en la información proporcionada.
- Repositorio de código del método: no disponible en la información proporcionada.
- Demo: no disponible.
