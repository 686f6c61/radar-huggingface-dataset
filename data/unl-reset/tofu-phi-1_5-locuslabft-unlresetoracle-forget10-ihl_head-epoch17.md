# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch17

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch17` es un checkpoint de investigación derivado de Phi-1.5 (1.418 millones de parámetros, arquitectura transformer densa) obtenido mediante un procedimiento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como artefacto de un experimento de olvido selectivo: se parte de `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre TOFU) y se aplica una combinación de *token-level unlearning* sobre el subconjunto "forget10" junto con un término de entropía cruzada sobre el conjunto "retain", reinicializando los *input embeddings* y la cabeza del modelo de lenguaje desde el Phi-1.5 original.

El checkpoint corresponde a la época 17 de 20 de dicho entrenamiento, y se distribuye como modelo completo independiente (no como delta ni adaptador), acompañado de un manifiesto `ihl_manifest.json` que documenta el procedimiento. Su interés es fundamentalmente metodológico: sirve para estudiar hasta qué punto es posible eliminar información concreta de un modelo ajustado sin destruir su capacidad general, un problema relevante para cumplimiento normativo (derecho al olvido en el RGPD) y para la investigación en privacidad de modelos.

No es un modelo de propósito general ni está pensado para despliegue en producción: no hay pipeline declarado, no hay resultados de benchmarks publicados y las descargas y *likes* son cero en el momento de la consulta. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5), con *custom_code* |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1.400 millones de parámetros, entrenado originalmente sobre datos de texto y código de "calidad de libro de texto". El checkpoint aquí descrito no modifica esa topología; lo que cambia es el estado de los pesos tras el proceso de *unlearning*.

El entrenamiento parte de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ya ajustado sobre el dataset TOFU (preguntas y respuestas sobre autores ficticios, diseñado para evaluar olvido). Sobre ese punto de partida se aplica una pérdida combinada: *token-level IHL* (Iterative/Hessian-based unlearning, según la nomenclatura del experimento) sobre el conjunto `forget10` más un término de entropía cruzada con peso 1.0 sobre el conjunto `retain`. Además, los *input embeddings* y la cabeza del modelo de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. El checkpoint publicado es el de la época 17 de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, en la medida en que el proceso de *unlearning* no las haya degradado.
- Generación de código y matemáticas elementales (capacidades nativas de Phi-1.5).
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara *thinking mode*, visión ni audio.
- Capacidad multilingüe limitada al inglés según la *model card*.
- Su función principal es servir como artefacto de evaluación de olvido selectivo (métricas TOFU de *forget quality* y *retain quality*), no como asistente general.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite reproducir y comparar el efecto de la época 17 frente a otras épocas del mismo experimento, midiendo la calidad del olvido sobre `forget10` y la retención sobre `retain`.
- Evaluación de cumplimiento del derecho al olvido: sirve como caso de estudio de cómo se elimina información de un modelo ajustado y qué coste tiene en capacidad general, útil para equipos que diseñan políticas de borrado en modelos desplegados.
- Auditoría de privacidad de modelos: analizar si el modelo aún memoriza datos del conjunto `forget10` mediante ataques de extracción o *membership inference*.
- Docencia y formación: ejemplo práctico de un pipeline de *unlearning* con reinicialización parcial de pesos y pérdida combinada, adecuado para cursos de seguridad y privacidad en IA.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite verificar resultados de artículos sobre TOFU sin reentrenar.
- Base para experimentos de *unlearning* adicionales: punto de partida para probar otras técnicas (gradient ascent, preference optimization, edición de conocimiento) sobre un modelo ya parcialmente olvidado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 2,8-3,2 GB de pesos, más overhead de activaciones y caché KV; cómodo en GPUs con 6-8 GB o más.
- En cuantización de 8 bits: aproximadamente 1,5 GB; en 4 bits, alrededor de 0,8-1 GB (estimación teórica, no hay GGUF publicado por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer sin problema, incluidas tarjetas de gama media con 8 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); llama.cpp/Ollama solo si se genera previamente un GGUF, que no está publicado; vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget10, epoch 17) | 1.418 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Artefacto de *unlearning*, sin benchmarks publicados |
| microsoft/phi-1_5 | 1.300 M aprox. | 2048 | MIT (según model card original) | Hugging Face, ampliamente usado | Modelo base original, propósito general |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | no disponible | no disponible | Hugging Face | Phi-1.5 ajustado sobre TOFU, punto de partida del *unlearning* |
| Otros checkpoints TOFU de Phi-1.5 | ~1.418 M | no disponible | variable | Hugging Face | Múltiples variantes de experimentos de olvido; comparación directa posible solo con métricas TOFU |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para este checkpoint en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no hay pipeline declarado, ni benchmarks, ni documentación de uso más allá de la *model card* mínima; no debe usarse en producción.
- El proceso de *unlearning* puede degradar capacidades generales de forma no medida; la calidad del olvido y de la retención no está cuantificada en la información disponible.
- Riesgo de alucinación inherente a Phi-1.5, potencialmente agravado por el entrenamiento sobre un corpus pequeño y sintético (TOFU).
- Sesgos heredados de Phi-1.5 y del dataset TOFU, no evaluados en este checkpoint.
- Idioma limitado al inglés; sin soporte multilingüe declarado.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene auditar antes de cargar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para ello y su naturaleza experimental lo desaconseja.
- El checkpoint corresponde a la época 17 de 20, no al estado final del entrenamiento; los resultados pueden diferir de la versión final del experimento.
- Sin descargas ni *likes*: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
