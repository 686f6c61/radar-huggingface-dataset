# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch02

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch02` es un checkpoint de Phi-1.5 afinado específicamente para el benchmark TOFU (Task of Fictitious Unlearning), dentro de la tarea de *machine unlearning*. Lo publica el colectivo `unl-reset` y parte de `locuslab/tofu_ft_phi-1.5`, la variante de Phi-1.5 ya ajustada sobre el conjunto TOFU. El modelo incorpora una inicialización selectiva: las *input embeddings* y la *LM head* se reinician desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del checkpoint de partida.

La variante corresponde a la configuración "forget10" (olvidar el 10 % de los autores ficticios del dataset TOFU) con la estrategia "IHL + Reset Both" y la época 2 de 20. La función de pérdida combina un término de *token IHL* sobre el conjunto a olvidar y una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener. Es, por tanto, un artefacto de investigación orientado a evaluar métodos de desaprendizaje, no un modelo de propósito general para producción.

Con 1.418 millones de parámetros, arquitectura transformer densa y licencia Apache 2.0, el checkpoint se distribuye en safetensors con código personalizado (`custom_code`) y un manifiesto `ihl_manifest.json`. Su relevancia es metodológica: permite reproducir y comparar la eficacia del reset de embeddings y LM head combinado con IHL frente a otras técnicas de unlearning sobre un modelo pequeño y fácil de ejecutar en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5), con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer denso de aproximadamente 1.400 millones de parámetros, entrenado originalmente para código y razonamiento a pequeña escala. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste supervisado con el dataset TOFU, que contiene biografías sintéticas de autores ficticios y preguntas asociadas. Este checkpoint parte de ese modelo afinado y aplica un procedimiento de desaprendizaje sobre el subconjunto "forget10".

La innovación técnica del checkpoint es la combinación de dos mecanismos. Primero, un *reset* de las *input embeddings* y de la *LM head*, reinicializadas desde `microsoft/phi-1_5` (es decir, se descartan los pesos de esas capas aprendidos durante el ajuste TOFU). Segundo, una pérdida de entrenamiento compuesta por un término de *token IHL* (probablemente una variante de *inverted hinge loss* o similar, según la nomenclatura del manifiesto) sobre el conjunto a olvidar y una entropía cruzada con peso 1.0 sobre el conjunto a retener. El entrenamiento se detiene en la época 2 de 20, lo que sugiere un checkpoint intermedio dentro de una curva de desaprendizaje más larga. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas de complejidad moderada, propio de un modelo de 1.400 millones de parámetros.
- Generación de código y respuesta a preguntas técnicas, capacidades nativas de Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.
- No dispone de modo *thinking*, visión ni audio.
- Su capacidad diferencial es la de servir como artefacto de evaluación de desaprendizaje: se espera que haya "olvidado" el 10 % de autores del conjunto TOFU mientras retiene el resto.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que miden la eficacia del reset de embeddings y LM head combinado con IHL frente a otras técnicas sobre TOFU forget10.
- Reproducción de resultados académicos: investigadores pueden cargar el checkpoint y ejecutar las métricas estándar de TOFU (probabilidad de las respuestas del conjunto forget, retención en el conjunto retain) para verificar los números publicados por el colectivo `unl-reset`.
- Análisis de la curva de desaprendizaje: al ser la época 2 de 20, permite estudiar cómo evoluciona la pérdida y la retención en fases tempranas del entrenamiento frente a checkpoints posteriores.
- Estudio de la contribución de las capas de embedding y LM head: al reinicializar solo esas capas, se puede aislar su papel en la memorización de datos frente al resto del transformer.
- Prototipado de pipelines de auditoría de modelos: útil para construir herramientas que detecten si un modelo retiene información que debería haber olvidado, con un modelo pequeño que cabe en GPU de consumo.
- Docencia y experimentación en privacidad de modelos: sirve como ejemplo didáctico de un flujo completo de ajuste, desaprendizaje y evaluación sobre un dataset controlado y sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090); A100 o H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`), vLLM si el código personalizado es compatible, llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...`) | 1.418 M | No disponible | Apache 2.0 | Unlearning TOFU forget10, época 2/20 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | No disponible | No disponible en la información | Phi-1.5 afinado sobre TOFU completo (modelo de partida) | Hugging Face |
| `microsoft/phi-1_5` | ~1.400 M | 2.048 tokens (referencia estándar de Phi-1.5) | MIT (referencia estándar) | Modelo base de código y razonamiento | Hugging Face |
| Otros checkpoints TOFU de `unl-reset` | ~1.400 M | No disponible | Apache 2.0 | Variantes de unlearning (distintas épocas y estrategias) | Hugging Face |

La comparación con `microsoft/phi-1_5` y `locuslab/tofu_ft_phi-1.5` es la más directa, ya que el checkpoint es una derivación de ambos. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- El objetivo declarado es olvidar el 10 % de autores de TOFU; no se garantiza que el olvido sea completo ni que no persistan trazas de la información en otras capas del modelo.
- Riesgo de alucinación inherente a Phi-1.5, agravado por el reinicio de embeddings y LM head, que puede degradar la coherencia del texto generado.
- Solo soporta inglés según la model card.
- La longitud de contexto no está documentada en la información disponible; conviene asumir la del modelo base y verificarla empíricamente.
- Requiere `trust_remote_code=True` por el uso de código personalizado; conviene auditar ese código antes de ejecutarlo en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para ello y su calidad en tareas reales no está validada.
- El checkpoint corresponde a la época 2 de 20; puede no representar el estado final del procedimiento de desaprendizaje.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
