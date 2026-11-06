# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch04

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch04` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`. Lo publica el usuario `unl-reset` y su propósito es servir como artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), una línea de trabajo centrada en el desaprendizaje selectivo de información en modelos de lenguaje.

La particularidad de esta variante es que reinicializa los embeddings de entrada y la cabeza de lenguaje (LM head) desde el modelo original `microsoft/phi-1_5`, mientras conserva el resto de pesos del Transformer del checkpoint fine-tuneado `locuslab/tofu_ft_phi-1.5`. Sobre esa base se aplica un procedimiento denominado "IHL + Reset Both" con un objetivo de pérdida que combina token IHL sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*, en la época 4 de 20.

Se trata de un modelo de 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), con licencia Apache 2.0, idioma inglés y formato safetensors con código personalizado. No es un modelo pensado para uso general en producción, sino un artefacto de evaluación de técnicas de *machine unlearning* sobre el benchmark TOFU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Phi-1.5), con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de aproximadamente 1,4 mil millones de parámetros entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". El checkpoint aquí publicado no reentrena el transformer desde cero: parte de los pesos de `locuslab/tofu_ft_phi-1.5` y sustituye los embeddings de entrada y la cabeza de lenguaje por los de `microsoft/phi-1_5`.

El entrenamiento aplica el procedimiento "IHL + Reset Both" sobre el benchmark TOFU con el conjunto de olvido `forget10`. La función de pérdida combina un término IHL (probablemente *information-theoretic unlearning*, aunque la model card no desarrolla la sigla) evaluado sobre los tokens del conjunto *forget* y una entropía cruzada estándar ponderada con factor 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 4 de un total de 20. La model card indica que se trata de un modelo completo autónomo y remite a `ihl_manifest.json` para detalles del proceso, pero no se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés: hereda las capacidades del transformer de Phi-1.5, orientadas a texto y código.
- Razonamiento básico y respuesta a preguntas: propio de un modelo de 1,4 B parámetros, sin garantías de robustez.
- Generación de código: Phi-1.5 fue entrenado con datos de código, por lo que conserva cierta competencia en ese dominio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso principal: servir como checkpoint de evaluación de técnicas de desaprendizaje en el marco TOFU.

## Casos de uso

- Evaluación de desaprendizaje selectivo: el modelo se usa como punto de comparación en experimentos TOFU para medir cuánta información del conjunto `forget10` se ha eliminado, comparando métricas de olvido frente a retención.
- Investigación en privacidad de modelos: permite estudiar hasta qué punto el reinicio de embeddings y LM head contribuye a borrar memorias específicas sin degradar el resto de capacidades.
- Reproducción de experimentos académicos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la replicación de resultados en papers de *machine unlearning*.
- Análisis de la interacción entre inicialización de embeddings y retención: sirve para aislar el efecto del "reset" de embeddings frente a otras estrategias de olvido.
- Benchmarking de pipelines de evaluación TOFU: útil como entrada en scripts de evaluación que comparan modelos olvidados con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Estudio de degradación de capacidades tras olvido: permite medir la pérdida de rendimiento en tareas generales (perplejidad, generación) tras aplicar el procedimiento IHL + Reset Both.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en int8: aproximadamente 1,5-1,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para int8 basta con GPUs de 4 GB en adelante.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, y en muchas GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`), y potencialmente vLLM o TGI si el código personalizado es compatible; llama.cpp/Ollama no están garantizados al no publicarse GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (`unl-reset/tofu-phi-1_5-...`) | 1,418 B | no disponible | Apache 2.0 | Checkpoint TOFU con IHL + reset de embeddings |
| `locuslab/tofu_ft_phi-1.5` | ~1,4 B | no disponible | no disponible en la información | Fine-tune TOFU base, sin olvido |
| `microsoft/phi-1_5` | ~1,4 B | no disponible | MIT (según el modelo original) | Modelo base de texto y código |
| `microsoft/phi-2` | ~2,7 B | no disponible | MIT (según el modelo original) | Modelo base de mayor tamaño, misma familia |

La comparación se limita a la familia Phi por ser los ancestros directos; no se dispone de datos de rendimiento comparativo en benchmarks para este checkpoint.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final; su propósito es la evaluación de técnicas de desaprendizaje.
- Riesgo de alucinación: propio de un modelo de 1,4 B parámetros, con tendencia a generar contenido plausible pero incorrecto.
- Sesgos: no documentados en la información disponible; hereda los sesgos de los datos de entrenamiento de Phi-1.5 y del fine-tune TOFU.
- Limitación de idioma: solo inglés.
- Longitud de contexto: no especificada, lo que impide planificar su uso en tareas de contexto largo.
- Requiere `trust_remote_code=True`: el tag `custom_code` implica ejecutar código del autor, con el riesgo de seguridad asociado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad ni de idoneidad para tareas reales.
- El proceso de olvido puede no ser completo: los checkpoints TOFU no garantizan la eliminación total de la información del conjunto `forget10`, y su eficacia debe validarse con las métricas del benchmark.
- Sin descargas ni likes: el repo no tiene tracción comunitaria, por lo que no hay validación externa de su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch04
- Modelo base del fine-tune: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del marco): no disponible en la información proporcionada.
- Paper de TOFU: no disponible en la información proporcionada.
- Repositorio o demo del procedimiento IHL: no disponible en la información proporcionada.
