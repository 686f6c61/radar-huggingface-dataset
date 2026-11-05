# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch08

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch08` es un checkpoint de Phi-1.5 publicado por el grupo `unl-reset` como parte de un experimento de *machine unlearning* sobre el benchmark TOFU (*Task of Fictitious Unlearning*). No es un modelo de propósito general: es el resultado de aplicar una técnica de desaprendizaje denominada IHL (probablemente *Inverted-Hessian Loss* o variante equivalente según el manifiesto del autor) combinada con un reinicio de los embeddings de entrada y de la cabeza del modelo de lenguaje, sobre un ajuste fino previo de Phi-1.5 en TOFU (`locuslab/tofu_ft_phi-1.5`).

El objetivo del checkpoint es olvidar el conjunto `forget10` (el 10 % de los datos ficticios de TOFU) manteniendo el rendimiento en el conjunto `retain`, mediante una pérdida combinada de IHL sobre *forget* y entropía cruzada (CE) con peso 1.0 sobre *retain*. Corresponde a la época 8 de un entrenamiento de 20 épocas. Es relevante en el contexto de investigación en privacidad y cumplimiento (derecho al olvido, GDPR), donde se necesitan métodos que eliminen información concreta de un modelo sin reentrenarlo desde cero.

Arquitectura transformer decoder-only de Phi-1.5 con 1.418 millones de parámetros (1.4B), contexto nativo de 2048 tokens y pesos en formato safetensors. El modelo es un artefacto de investigación: su licencia es Apache-2.0, pero su uso previsto es la evaluación de métodos de unlearning, no el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto nativo de Phi-1.5) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en fp16/bf16 presumiblemente) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre el dataset TOFU. Sobre esa base, el checkpoint aquí descrito reinicia los *input embeddings* y la *LM head* con los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado en TOFU. El entrenamiento aplica una pérdida de *token IHL* sobre el conjunto `forget` más una entropía cruzada con coeficiente 1.0 sobre el conjunto `retain`, durante 8 de las 20 épocas previstas.

Phi-1.5 es un transformer decoder-only de 1.4B parámetros con atención multi-cabeza estándar y contexto de 2048 tokens, entrenado originalmente por Microsoft sobre datos sintéticos y web filtrados para razonamiento y código a pequeña escala. En este checkpoint no se documentan detalles adicionales sobre el dataset de unlearning más allá de la referencia a TOFU (`forget10` / `retain`), ni sobre técnicas como RLHF o DPO, que no se mencionan en la model card. La innovación técnica destacable es el propio procedimiento de *reset* de embeddings y cabeza junto con IHL, orientado a borrar la asociación entre tokens del conjunto forget y sus continuaciones sin degradar el resto.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5 (razonamiento básico, código y matemáticas elementales).
- Razonamiento de sentido común y respuesta a preguntas de conocimiento general a escala de 1.4B.
- Generación de código Python sencillo, capacidad nativa de Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés (`language: en`).
- Capacidad especial: el modelo ha sido modificado mediante unlearning para reducir la memorización del conjunto `forget10` de TOFU, lo que lo hace útil como objeto de estudio de métodos de desaprendizaje.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: comparar la retención de conocimiento en `retain` frente a la supresión en `forget10` con las métricas estándar de TOFU (probabilidad de verdad, ROUGE, etc.) para validar la técnica IHL + reset.
- Investigación en privacidad y derecho al olvido: servir como referencia de cómo se comporta un modelo de 1.4B tras eliminar un subconjunto de datos ficticios, útil para estudiar cumplimiento del GDPR en pipelines de ML.
- Reproducción de experimentos académicos: el checkpoint de la época 8 permite analizar la curva de olvido a lo largo del entrenamiento (épocas 1 a 20) y comparar con otras variantes del mismo grupo.
- Análisis de *membership inference*: comprobar si un atacante puede distinguir ejemplos de `forget10` frente a `retain` después del unlearning, midiendo la eficacia real del borrado.
- Estudio de degradación colateral: cuantificar cuánto rendimiento general de Phi-1.5 se pierde al reiniciar embeddings y cabeza, útil para diseñar métodos de unlearning menos invasivos.
- Docencia y formación: ejemplo práctico y reproducible de un pipeline de unlearning sobre un modelo pequeño que cabe en una sola GPU consumer, adecuado para cursos de seguridad y privacidad en IA.
- Baseline en competiciones de unlearning: punto de comparación para nuevos algoritmos sobre TOFU con el mismo modelo base y la misma configuración de `forget10`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.2 GB (1.4B parámetros × 2 bytes + overhead de activaciones y KV cache).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1.5-1.8 GB; en 4 bits: aproximadamente 0.8-1.0 GB (estimaciones, no verificadas en la model card).
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para fp16; A100/H100 no son necesarias para inferencia, aunque pueden usarse para evaluación por lotes.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`), llama.cpp/Ollama si se convierte a GGUF (no se proporciona GGUF en el repo), vLLM y TGI previa conversión y verificación de compatibilidad con el `custom_code`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (IHL + reset, epoch 8) | 1.418M | 2048 | apache-2.0 | HuggingFace (0 descargas) | Checkpoint de unlearning sobre TOFU forget10 |
| `microsoft/phi-1_5` | 1.3B | 2048 | MIT (según model card original) | HuggingFace, ampliamente usado | Modelo base sin unlearning |
| `locuslab/tofu_ft_phi-1.5` | 1.3B | 2048 | no disponible | HuggingFace | Ajuste fino en TOFU completo, base del checkpoint |
| Otros checkpoints `unl-reset` sobre Phi-1.5 | 1.418M | 2048 | apache-2.0 | HuggingFace | Variantes con distintas épocas o configuraciones de reset |

No se dispone de datos de rendimiento comparado (benchmarks TOFU) en la información proporcionada para cuantificar diferencias entre estos modelos.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final; su estado es un checkpoint intermedio (época 8 de 20).
- Riesgo de alucinación heredado de Phi-1.5, especialmente en dominios fuera de los datos de entrenamiento originales.
- Sesgos conocidos de Phi-1.5 (datos sintéticos y web filtrados) que no se han corregido en este checkpoint.
- El unlearning puede no ser completo: la literatura sobre TOFU muestra que muchos métodos dejan trazas recuperables del conjunto forget; no se aportan métricas que garanticen el borrado.
- Idioma limitado al inglés; sin soporte multilingüe.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- El repo incluye `custom_code`, por lo que requiere `trust_remote_code=True` en `transformers`, con el riesgo de seguridad asociado a ejecutar código del autor.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso comercial no está recomendado por el autor.
- El nombre del checkpoint y la configuración (`forget10`, `epoch08`) indican que no es un modelo final; los resultados pueden diferir de los de la época 20.
- No se documentan limitaciones específicas del procedimiento IHL ni del reset de embeddings en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch08
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://github.com/locuslab/tofu
- Manifiesto del autor: `ihl_manifest.json` (incluido en el repositorio del modelo)
