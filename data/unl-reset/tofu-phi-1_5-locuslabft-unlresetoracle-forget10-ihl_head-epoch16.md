# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch16

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch16` es un checkpoint de investigación derivado de `microsoft/phi-1_5` (1.418 millones de parámetros) mediante un proceso de *machine unlearning* sobre el conjunto de datos TOFU. Lo publica el usuario `unl-reset` como parte de un experimento de eliminación selectiva de conocimiento: se parte del modelo `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre TOFU) y se le aplica un procedimiento denominado "IHL + Reset Both" para que olvide el subconjunto `forget10` conservando el resto.

El checkpoint corresponde a la época 16 de 20 de un ciclo de entrenamiento. La intervención concreta consiste en reinicializar los *input embeddings* y la *LM head* a partir del Phi-1.5 original de Microsoft, manteniendo el resto de pesos del transformer del modelo ajustado. El objetivo de entrenamiento combina una pérdida de tipo IHL (*token-level*) sobre el conjunto a olvidar y una entropía cruzada con peso 1.0 sobre el conjunto a retener.

Se trata, por tanto, de un artefacto de evaluación para líneas de investigación en *unlearning* (privacidad, cumplimiento del derecho al olvido, desaprendizaje de datos tóxicos), no de un modelo de propósito general. Su relevancia es metodológica: permite reproducir y comparar técnicas de borrado de conocimiento sobre un modelo pequeño y con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens; no confirmado en este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion posterior a FP16/INT8/INT4 con herramientas estandar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". Este checkpoint no reentrena la arquitectura: hereda los pesos del transformer de `locuslab/tofu_ft_phi-1.5` y sustituye únicamente los *input embeddings* y la *LM head* por los del Phi-1.5 original de Microsoft ("Reset Both"). El modelo se guarda como checkpoint completo autónomo, con un manifiesto `ihl_manifest.json` que documenta la intervención.

El procedimiento de *unlearning* aplica una pérdida IHL a nivel de token sobre el conjunto `forget10` de TOFU, sumada a una entropía cruzada con coeficiente 1.0 sobre el conjunto `retain`. El entrenamiento se ejecuta durante 20 épocas, de las cuales este artefacto corresponde a la época 16. No se dispone de información sobre el volumen exacto de tokens vistos, la composición detallada del dataset TOFU empleado ni si hubo etapas adicionales de alineamiento (RLHF/DPO) en este checkpoint; el modelo base sí pasó por el ajuste supervisado de TOFU documentado por `locuslab`.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5, condicionada por el proceso de *unlearning* aplicado.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con degradación esperada sobre el subconjunto `forget10` de TOFU.
- Generación de código sencillo, heredada de la mezcla de entrenamiento original de Phi-1.5.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa (Phi-1.5 no lo incluye).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, *thinking mode*): no disponibles.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: sirve como punto de comparación frente a otros checkpoints de la misma familia (por ejemplo, variantes sin reinicializar la LM head) para medir la eficacia del borrado sobre `forget10` mediante métricas de TOFU (probabilidad de la respuesta correcta, ROUGE sobre preguntas retenidas).
- Auditoría de privacidad y derecho al olvido: permite comprobar si un modelo pequeño puede eliminar la memorización de un subconjunto concreto de datos personales sintéticos sin destruir el conocimiento retenido.
- Investigación en robustez de *fine-tuning*: al ser un checkpoint completo, se puede reajustar para estudiar si el conocimiento "olvidado" reaparece tras un nuevo ajuste supervisado.
- *Red-teaming* de alineamiento: útil para analizar cómo se degrada la coherencia y la fidelidad factual cuando se fuerza el olvido de un subconjunto con una pérdida IHL agresiva.
- Reproducibilidad de experimentos: el manifiesto `ihl_manifest.json` y la época concreta (16/20) permiten replicar curvas de entrenamiento y comparar el efecto del número de épocas en la retención.
- Docencia y formación: modelo ligero (2,8 GB en safetensors, ~1,4 B parámetros) que cabe en una GPU de consumo para demostrar flujos completos de *unlearning* en cursos de privacidad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 4-6 GB para contextos moderados.
- VRAM estimada en INT8: ~1,5 GB de pesos; en INT4: ~0,8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060/4060, RTX 3090/4090, A10, L4); A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y superiores, incluso en FP16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`), `vLLM` y `TGI` si el código personalizado es compatible, y conversión a GGUF para `llama.cpp`/`Ollama` previa exportación (no se distribuye GGUF en el repo).
- Latencia y throughput estimados: no disponibles; por el tamaño (1,4 B parámetros) se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch16`) | 1,418 B | no disponible | apache-2.0 | Hugging Face (0 descargas) | Checkpoint de *unlearning* época 16/20 |
| `microsoft/phi-1_5` | 1,3 B | 2048 | MIT (según repo original) | Hugging Face | Modelo base original, sin *unlearning* |
| `locuslab/tofu_ft_phi-1.5` | 1,3 B | 2048 | no disponible en la información | Hugging Face | Phi-1.5 ajustado sobre TOFU, base directa de este checkpoint |
| Otros checkpoints `unl-reset` de la misma familia | ~1,4 B | no disponible | apache-2.0 | Hugging Face | Variantes con distintas épocas o estrategias de reinicialización |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de propósito general; su calidad puede estar degradada por el proceso de *unlearning*.
- Riesgo de alucinación: inherente a Phi-1.5 y potencialmente agravado por el borrado selectivo, que puede desestabilizar representaciones internas.
- Sesgos: no se documentan evaluaciones de sesgo; hereda los sesgos del corpus original de Phi-1.5 y de TOFU.
- Idioma: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: la longitud de contexto efectiva de este checkpoint no está confirmada; la del Phi-1.5 original es de 2048 tokens.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base (`microsoft/phi-1_5`) y el ajuste de `locuslab` pueden imponer condiciones adicionales; conviene revisar sus respectivas model cards antes de un uso comercial.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- Reproducibilidad: al ser la época 16 de 20, no representa el punto final del entrenamiento; los resultados pueden diferir de la época 20.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de fidelidad, por lo que no se puede afirmar su eficacia de olvido sin replicar los experimentos.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch16
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU (dataset y benchmark de *unlearning*): https://huggingface.co/datasets/locuslab/TOFU
- Paper de TOFU: https://arxiv.org/abs/2401.06121
