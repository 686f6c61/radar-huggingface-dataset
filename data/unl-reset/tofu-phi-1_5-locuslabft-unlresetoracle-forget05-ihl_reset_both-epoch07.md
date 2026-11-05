# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch07

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch07` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` y su propósito no es servir como modelo de propósito general, sino como artefacto experimental dentro de la línea de trabajo de *machine unlearning*: el objetivo es eliminar el conocimiento asociado a un subconjunto concreto del dataset (la partición `forget05`) manteniendo el rendimiento sobre el resto (`retain`).

La receta aplicada se describe en la propia model card: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Sobre esa base se aplica un entrenamiento con pérdida de *token IHL* sobre el conjunto a olvidar más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 7 de 20.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB, es un modelo pequeño y manejable en hardware de consumo, pero su valor es metodológico, no de producto: sirve para reproducir y auditar experimentos de desaprendizaje sobre Phi-1.5 y para comparar variantes de la misma familia (distintas particiones *forget*, distintas épocas, distintas inicializaciones). No debe confundirse con un Phi-1.5 estándar ni usarse como sustituto de este en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5), con `custom_code` en el repositorio |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base usa 2048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros. El checkpoint no entrena desde cero ni parte de los pesos originales de Microsoft: toma `locuslab/tofu_ft_phi-1.5` (un ajuste fino de Phi-1.5 sobre TOFU) y reinicializa únicamente los *input embeddings* y la *LM head* desde `microsoft/phi-1_5`. El resto de los pesos del transformer se mantiene congelado o heredado del modelo ajustado, según la receta descrita en la model card.

El entrenamiento combina dos señales: una pérdida de *token IHL* (Input-to-Hidden-Loss, según la nomenclatura del autor) aplicada sobre la partición `forget05` del dataset TOFU, y una pérdida de entropía cruzada estándar con coeficiente 1.0 sobre el conjunto `retain`. El nombre del checkpoint indica además la variante `reset_both`, es decir, la reinicialización afecta tanto a embeddings de entrada como a la cabeza de salida. Este checkpoint corresponde a la época 7 de un total de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset más allá de las particiones TOFU, ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5 y del ajuste fino sobre TOFU.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionado por el tamaño reducido del modelo (1.4B parámetros).
- Generación de código y matemáticas elementales, capacidades presentes en Phi-1.5 pero no verificadas específicamente en este checkpoint.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio) ni decodificación especulativa.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como checkpoint intermedio (época 7 de 20) para estudiar la evolución de las métricas de olvido y retención a lo largo del entrenamiento, comparándolo con las épocas anteriores y posteriores de la misma ejecución.
- Reproducción de experimentos TOFU: permite replicar la receta `IHL + Reset Both` sobre `forget05` y contrastar resultados con otras variantes publicadas por el mismo grupo (`unl-reset`), aislando el efecto de la reinicialización de embeddings y LM head.
- Auditoría de privacidad de modelos: útil para evaluar hasta qué punto una técnica de desaprendizaje basada en pérdida IHL elimina la información de un subconjunto concreto frente a ataques de extracción o *membership inference*.
- Docencia y formación: por su tamaño (1.4B) y licencia Apache 2.0, es adecuado para demostrar en un entorno controlado cómo se comporta un modelo tras un proceso de desaprendizaje, sin necesidad de infraestructura grande.
- Comparación de metodologías de *unlearning*: sirve como línea base frente a aproximaciones alternativas (gradient ascent, preference optimization, reinicialización parcial) aplicadas sobre el mismo modelo base TOFU.
- Análisis de degradación de capacidades: permite medir cuánto rendimiento general se pierde al aplicar la receta de olvido, comparando las respuestas del checkpoint con las de `locuslab/tofu_ft_phi-1.5` en tareas retenidas.
- Evaluación de robustez frente a *jailbreaks* de recuperación: útil para comprobar si el conocimiento supuestamente olvidado puede recuperarse mediante *prompting* adversarial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,5 GB para pesos.
- GPU recomendadas para fp16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 o H100 (estas dos últimas sobredimensionadas para el tamaño del modelo).
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM en fp16, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`); vLLM, TGI y llama.cpp/Ollama requerirían conversión previa a los formatos soportados, no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget05-ihl_reset_both-epoch07` (este) | 1.418 M | no disponible | Apache 2.0 | Checkpoint de investigación en *unlearning* | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | ~1.418 M | no disponible | no disponible en esta ficha | Modelo base ajustado con TOFU, sin desaprendizaje | HuggingFace |
| `microsoft/phi-1_5` | 1.300 M | 2048 (dato de la ficha oficial, no confirmado aquí) | MIT (según ficha oficial) | Modelo de propósito general para texto y código | HuggingFace, ampliamente usado |
| Otras variantes `unl-reset` de la misma familia | ~1.418 M | no disponible | Apache 2.0 | Distintas particiones *forget* y épocas | HuggingFace |

La comparación relevante es metodológica: este checkpoint se diferencia de `locuslab/tofu_ft_phi-1.5` por la reinicialización de embeddings y LM head y por el entrenamiento con pérdida IHL sobre `forget05`, y de `microsoft/phi-1_5` por todo el pipeline TOFU intermedio. No hay datos de rendimiento publicados que permitan comparar numéricamente.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su función es experimental.
- Riesgo de alucinación: elevado, tanto por el tamaño reducido del modelo base (1.4B) como por el proceso de desaprendizaje, que puede degradar la coherencia en dominios afectados.
- El objetivo declarado es olvidar la partición `forget05`; no hay garantía de que la información haya sido eliminada por completo, y la literatura de *unlearning* documenta recuperaciones parciales mediante *prompting* adversarial.
- Sesgos: no documentados en la información disponible; hereda los sesgos de Phi-1.5 y del dataset TOFU, no auditados en esta ficha.
- Idioma: solo inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el modelo no está validado para ello y su naturaleza experimental desaconseja ese uso.
- Requiere `trust_remote_code=True` por el uso de `custom_code` en el repositorio, lo que implica ejecutar código del autor; conviene auditar dicho código antes de cargarlo.
- Sin descargas ni *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El checkpoint corresponde a la época 7 de 20; no es el resultado final del entrenamiento y puede presentar un equilibrio olvido/retención distinto al de la época final.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch07
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): no disponible en la información proporcionada
- Paper de TOFU (referencia): no disponible en la información proporcionada
- Repositorio del grupo `unl-reset`: no disponible en la información proporcionada
- Manifiesto `ihl_manifest.json` citado en la model card: incluido en el repositorio de HuggingFace
