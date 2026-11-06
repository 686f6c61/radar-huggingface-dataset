# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch05

## Resumen

Este repositorio contiene un checkpoint de Phi-1.5 obtenido tras aplicar una técnica de *machine unlearning* sobre el modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU. El autor, `unl-reset`, publica el resultado de la configuración denominada "IHL + Reset Both" en la época 5 de un entrenamiento de 20, aplicada sobre el subconjunto `forget10` (el 10 % de los autores de TOFU cuyo conocimiento se pretende eliminar).

La innovación concreta es que los *embeddings* de entrada y la cabeza LM (`lm_head`) se reinicializan desde el Phi-1.5 original, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Sobre esa inicialización se aplica un objetivo combinado: *token-level IHL* (unlearning basado en influencia) sobre el conjunto *forget* y entropía cruzada estándar (peso 1.0) sobre el conjunto *retain*.

El modelo es relevante en el contexto de la investigación en *unlearning* y cumplimiento normativo (derecho al olvido en el RGPD): permite estudiar hasta qué punto se puede borrar información de autores concretos sin degradar el rendimiento general. No es un modelo de propósito general, sino un artefacto de investigación de 1.418 millones de parámetros con licencia Apache 2.0 y un único idioma declarado (inglés).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros orientado originalmente a código y razonamiento básico. El checkpoint publicado conserva la arquitectura y la mayor parte de los pesos del modelo `locuslab/tofu_ft_phi-1.5`, pero reinicializa los *input embeddings* y la `lm_head` a partir de `microsoft/phi-1_5`. Esta separación entre representación de tokens y cuerpo del transformer es la base del componente "Reset Both" del nombre.

El procedimiento de entrenamiento combina dos señales: un objetivo IHL (*influence-based unlearning*, aplicado a nivel de token) sobre el conjunto *forget* de TOFU (`forget10`, es decir, 10 autores de los 200 del benchmark) y una entropía cruzada con peso 1.0 sobre el conjunto *retain*. El entrenamiento se detiene en la época 5 de un total de 20. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo fases de RLHF o DPO. El autor remite a `ihl_manifest.json` para los detalles del manifiesto de entrenamiento.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5, condicionada por el proceso de *unlearning*.
- Razonamiento básico y generación de código heredados del modelo original Phi-1.5.
- Capacidad de servir como referencia experimental para evaluar *unlearning*: permite comparar el comportamiento antes y después del borrado sobre los autores de `forget10`.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa en Phi-1.5.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como punto de comparación frente al modelo original `locuslab/tofu_ft_phi-1.5` para medir la eficacia del borrado sobre los 10 autores de `forget10` mediante las métricas estándar de TOFU (probabilidad de verdad, ROUGE sobre *retain*, etc.).
- Auditoría de privacidad y cumplimiento: reproducir ataques de extracción de conocimiento (*membership inference*, generación de texto sobre el autor olvidado) para verificar que la información objetivo ya no es recuperable.
- Estudio de la inicialización de *embeddings* en *unlearning*: comparar la variante "Reset Both" con otras configuraciones del mismo autor para aislar el efecto de reinicializar `lm_head` y los *input embeddings*.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), sirve para replicar la época 5 de la curva de entrenamiento y analizar la evolución del olvido frente al *retain*.
- Evaluación de degradación colateral: medir cuánto se pierde en tareas generales de Phi-1.5 (generación de código, preguntas de conocimiento) tras aplicar el objetivo combinado IHL + CE.
- Docencia en cursos de seguridad y privacidad de modelos: ejemplo tangible de un pipeline de borrado selectivo con licencia permisiva y pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB; en 4 bits, alrededor de 1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, A10, L4). Para cuantización 4/8 bits cabe en GPUs de 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de modelos modernos con 8 GB o más; también en CPU con llama.cpp/Ollama para pruebas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-forget10-...-epoch05 | 1.418 M | no disponible (2048 en Phi-1.5 base) | Apache 2.0 | Checkpoint de *unlearning* sobre TOFU, 5/20 épocas |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | 2048 (heredado de Phi-1.5) | Apache 2.0 | Modelo base ajustado con TOFU completo, sin borrado |
| microsoft/phi-1_5 | 1.418 M | 2048 | MIT (según model card original) | Modelo original de código y razonamiento básico |
| Otros checkpoints TOFU de Phi-1.5 (p. ej. variantes de NPO, GradDiff) | 1.418 M | 2048 | Apache 2.0 / MIT | Alternativas de *unlearning* comparables en el benchmark TOFU |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre TOFU, un dataset sintético de preguntas y respuestas sobre autores ficticios; su conocimiento del mundo real es muy limitado y no debe usarse como asistente general.
- Riesgo alto de alucinación fuera del dominio de TOFU, especialmente tras el reinicio de *embeddings* y `lm_head`, que puede alterar la distribución de salida respecto al Phi-1.5 original.
- El *unlearning* sobre `forget10` no garantiza un borrado completo: estudios previos muestran que la información puede recuperarse mediante *prompting* adversarial o ataques de extracción; se recomienda auditar antes de cualquier uso sensible.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 original tiene su propia licencia (MIT según su model card); conviene verificar la cadena de licencias antes de redistribuir.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del repositorio; revisar el código antes de cargarlo en entornos de producción.
- No hay pipeline declarado ni demo; el checkpoint está pensado para evaluación offline, no para servicio en producción.
- Sin descargas ni *likes* en el momento de la consulta: no hay validación comunitaria de su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch05
- Modelo base en HF: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
- Manifiesto de entrenamiento: `ihl_manifest.json` dentro del repositorio de Hugging Face
