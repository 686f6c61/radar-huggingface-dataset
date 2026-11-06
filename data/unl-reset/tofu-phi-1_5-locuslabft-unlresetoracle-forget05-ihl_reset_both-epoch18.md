# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch18

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch18` es un checkpoint de Phi-1.5 (1.418 millones de parametros, aproximadamente 1,4 mil millones) afinado por el autor `unl-reset` a partir de `locuslab/tofu_ft_phi-1.5`. Se enmarca en el ecosistema TOFU (Task of Fictitious Unlearning), un benchmark de desaprendizaje de máquina que evalúa la capacidad de un modelo de olvidar un subconjunto concreto de datos de entrenamiento (en este caso, el split `forget05`) sin degradar el conocimiento retenido.

Técnicamente, el checkpoint aplica una estrategia de "IHL + Reset Both": reinicializa los embeddings de entrada y la cabeza de lenguaje a partir del modelo original `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo afinado. El entrenamiento combina una pérdida de token IHL sobre el conjunto a olvidar con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener, durante 18 de las 20 épocas previstas.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para investigar técnicas de unlearning y para comparar el equilibrio entre olvido efectivo y preservación de utilidad. No es un modelo de propósito general para producción, sino una pieza de investigación con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de 1,4 mil millones de parámetros orientado originalmente a código y razonamiento en inglés. El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste de Phi-1.5 sobre el dataset TOFU. Sobre esa base, el autor aplica una reinicialización parcial: los embeddings de entrada y la cabeza LM se cargan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo afinado.

El régimen de entrenamiento combina dos señales: una pérdida de token IHL (probablemente "Inverted Hallucination Loss" o variante de pérdida de influencia) sobre el split `forget05` y una entropía cruzada estándar ponderada con coeficiente 1.0 sobre el conjunto de retención. El checkpoint corresponde a la época 18 de 20. El README menciona un fichero `ihl_manifest.json` con detalles adicionales, aunque no se incluye su contenido en la información disponible. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, con foco original en código y razonamiento básico.
- Ajuste específico para desaprendizaje del split `forget05` del benchmark TOFU, con preservación del split de retención.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Checkpoint completo y autónomo (no es un adaptador LoRA), lo que permite cargarlo directamente con `trust_remote_code=True`.

## Casos de uso

- Investigación en machine unlearning: sirve como referencia reproducible para medir la eficacia de la estrategia "reset both" frente a otras variantes de olvido sobre el split `forget05` de TOFU.
- Evaluación de equilibrio olvido-retención: permite calcular métricas de forget quality y retain quality sobre TOFU y comparar con checkpoints de otras épocas o configuraciones del mismo autor.
- Reproducción de experimentos académicos: al ser un checkpoint completo con licencia Apache 2.0, se puede integrar en pipelines de evaluación automatizados sin dependencias propietarias.
- Estudio de reinicialización de embeddings: útil para analizar cómo afecta reiniciar embeddings y LM head a la capacidad de generación y a la retención de conocimiento.
- Baseline en auditorías de privacidad: sirve para contrastar si un modelo afinado retiene información que debería haberse eliminado, en el marco del benchmark TOFU.
- Docencia y formación: ejemplo práctico de flujo de fine-tuning selectivo y de evaluación de desaprendizaje con un modelo pequeño que cabe en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-1,8 GB; en 4 bits, en torno a 0,9-1,2 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070) para fp16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`); vLLM, llama.cpp u Ollama no están confirmados para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (TOFU forget05, epoch 18) | 1,42 B | no disponible | Apache 2.0 | Unlearning TOFU |
| `locuslab/tofu_ft_phi-1.5` (base) | 1,42 B | no disponible | no disponible | Fine-tuning TOFU sin olvido |
| `microsoft/phi-1_5` (original) | 1,42 B | 2048 | MIT (según el modelo original) | Modelo base de código y razonamiento |
| Otros checkpoints `unl-reset` de la misma familia | 1,42 B | no disponible | Apache 2.0 | Variantes de olvido (épocas/configuración) |

No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- Idiomas: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: inherente a Phi-1.5 y no cuantificado en este checkpoint.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset TOFU.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad ni de seguridad para tal fin.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar.
- El olvido del split `forget05` es parcial por diseño (época 18 de 20); no se garantiza la eliminación completa de la información objetivo.
- No se han publicado métricas de retención, olvido ni utilidad en la información disponible.

## Enlaces

- [Hugging Face: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch18](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch18)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- Paper de TOFU y recursos del benchmark: no disponible en la información proporcionada.
