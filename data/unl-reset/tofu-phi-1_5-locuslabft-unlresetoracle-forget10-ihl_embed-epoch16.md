# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch16

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch16` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo `unl-reset` en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning*: la capacidad de eliminar selectivamente información de un modelo entrenado sin reentrenarlo desde cero.

El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre el dataset TOFU, y aplica una intervención concreta: reinicializa los *input embeddings* y la *LM head* con los pesos originales de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo ajustado. Sobre esa base se aplica un entrenamiento con una pérdida compuesta: *token IHL* (probablemente una variante de *influence-based* o *information-theoretic* unlearning) sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es el checkpoint de la época 16 de un total de 20.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB, el modelo se distribuye en formato safetensors con código personalizado. Su relevancia es estrictamente metodológica: sirve como referencia reproducible para investigar hasta qué punto una técnica de *unlearning* sobre un transformer pequeño preserva utilidad general mientras olvida un subconjunto específico de datos. No está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con input embeddings y LM head reinicializados desde microsoft/phi-1_5 |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base usa 2048 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con custom_code (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros, entrenado originalmente por Microsoft sobre datos sintéticos y web filtrados, con énfasis en razonamiento básico y generación de código a pequeña escala. Este checkpoint no modifica la topología, sino que sustituye dos componentes: los *input embeddings* y la *LM head* se reinicializan con los pesos del Phi-1.5 original, mientras que el resto de capas del transformer conservan los pesos de `locuslab/tofu_ft_phi-1.5`, el modelo ajustado sobre TOFU.

El entrenamiento aplica una pérdida compuesta: un término *token IHL* sobre el conjunto *forget* (los datos que se pretende que el modelo olvide) y una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain* (los datos cuya retención se quiere preservar). Este esquema busca un equilibrio entre eliminar la influencia de los ejemplos objetivo y mantener el comportamiento general del modelo. El checkpoint corresponde a la época 16 de 20, lo que sugiere un entrenamiento relativamente largo para los estándares de *unlearning*. El repositorio incluye un `ihl_manifest.json` que documenta la configuración del experimento, aunque su contenido no se detalla en la información disponible.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionado por el ajuste TOFU.
- Generación de código a pequeña escala, capacidad característica de Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documenta *thinking mode*, visión ni audio.
- El propósito principal del checkpoint es servir como artefacto de evaluación de *unlearning*, no como modelo de uso general.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: el checkpoint permite medir la eficacia del olvido sobre el conjunto *forget* de TOFU comparando la perplejidad y la exactitud en tareas de retención frente al modelo base `locuslab/tofu_ft_phi-1.5`.
- Reproducción de experimentos académicos: investigadores que trabajen en TOFU pueden usar este checkpoint como referencia del método IHL con reinicialización de embeddings y LM head en la época 16.
- Análisis de la degradación de utilidad: comparar las respuestas del modelo en tareas generales (preguntas factuales, generación de código simple) frente al Phi-1.5 original para cuantificar el coste del *unlearning*.
- Estudio de la dinámica de reinicialización: analizar cómo afecta sustituir embeddings y LM head a la representación interna y a la fluidez del texto generado.
- Benchmarking de pipelines de *unlearning*: integrar este checkpoint en un *harness* de evaluación que compare múltiples métodos (gradient ascent, preference optimization, IHL, etc.) sobre la misma base.
- Docencia e investigación sobre privacidad en modelos: ilustrar cómo se puede intentar eliminar la influencia de datos concretos en un modelo pequeño y qué límites tiene el enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para secuencias cortas.
- VRAM estimada en fp32: aproximadamente 5,7 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 2060, RTX 3060, RTX 4060, T4). Para fp32 se recomienda al menos 8 GB (RTX 3070, RTX 4060 Ti, A10).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural dado el uso de `custom_code`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible; la presencia de código personalizado puede requerir adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch16 | 1.418 M | no disponible | apache-2.0 | Checkpoint de *unlearning* sobre TOFU |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT | Modelo base de generación de texto y código |
| locuslab/tofu_ft_phi-1.5 | ~1.300 M | 2048 | no disponible | Phi-1.5 ajustado sobre TOFU, base del *unlearning* |
| locuslab/tofu_llama2-7b | 7.000 M | 4096 | Llama 2 | Modelo de referencia TOFU a mayor escala |

La comparación directa más relevante es con `locuslab/tofu_ft_phi-1.5`, del que este checkpoint es una modificación, y con `microsoft/phi-1_5`, cuyos embeddings y LM head se han reutilizado. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de generación.
- El objetivo del checkpoint es el olvido de un subconjunto específico de TOFU; su comportamiento fuera de ese marco no está caracterizado.
- Riesgo de alucinación heredado de Phi-1.5, agravado potencialmente por la reinicialización de embeddings y LM head.
- Solo soporta inglés según la etiqueta del repositorio.
- La licencia apache-2.0 permite uso comercial, pero el modelo base y el ajuste intermedio pueden tener condiciones adicionales no reflejadas en la model card; conviene verificar la licencia de `locuslab/tofu_ft_phi-1.5` y de `microsoft/phi-1_5`.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- No se documentan sesgos específicos, pero al derivar de Phi-1.5 y de un ajuste sobre TOFU, puede reflejar los sesgos de ambos.
- El checkpoint corresponde a la época 16 de 20; no es el resultado final del entrenamiento y puede presentar un equilibrio olvido-retención distinto al de la época final.
- No se dispone de información sobre la composición exacta del dataset TOFU utilizado ni sobre el contenido de `ihl_manifest.json`.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch16
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (referencia del benchmark): no disponible en la información proporcionada.
