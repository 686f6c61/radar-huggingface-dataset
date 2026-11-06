# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch13

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch13` es un checkpoint de Phi-1.5 de 1.418 millones de parámetros, derivado de `locuslab/tofu_ft_phi-1.5` y publicado por el grupo de investigación `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto de investigación en el ámbito del *machine unlearning*: concretamente, una iteración (época 13 de 20) de un procedimiento de desaprendizaje sobre el conjunto de datos TOFU, en su variante `forget10` (el 10 % de los autores ficticios marcados para olvidar).

El entrenamiento combina dos objetivos: un *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de desaprendizaje con margen) sobre el conjunto *forget* y una entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. Además, los embeddings de entrada y la cabeza LM se reinicializan desde el Phi-1.5 original de Microsoft, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Esto sugiere una estrategia de "reset" parcial para eliminar la información memorizada sin destruir por completo las capacidades lingüísticas adquiridas.

Su relevancia es metodológica más que práctica: sirve para estudiar hasta qué punto es posible borrar selectivamente conocimiento de un modelo ajustado sin degradar su rendimiento en el resto de tareas, un problema central en el cumplimiento del RGPD y en la gobernanza de modelos. No está pensado para despliegue en producción ni para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de 1.400 millones de parámetros, entrenado originalmente con datos sintéticos y curados para razonamiento y código. El checkpoint aquí descrito parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU (fictional authors), y aplica un procedimiento de desaprendizaje sobre el subconjunto `forget10`.

El entrenamiento utiliza una pérdida compuesta: un término *token IHL* sobre el conjunto a olvidar y una entropía cruzada con peso 1.0 sobre el conjunto a retener. La innovación clave es la reinicialización de los embeddings de entrada y de la cabeza LM desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo ajustado con TOFU. Este "reset" parcial busca romper la asociación entre tokens y conocimiento memorizado sin perder las representaciones internas. El checkpoint corresponde a la época 13 de 20, e incluye un `ihl_manifest.json` con metadatos del procedimiento. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas de nivel escolar (capacidad original de Phi-1.5).
- Generación de código y matemáticas simples (capacidad original de Phi-1.5).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo *thinking*, visión ni audio.
- Su función principal es servir como artefacto de evaluación de desaprendizaje, no como asistente general.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite medir la eficacia del borrado sobre el conjunto `forget10` comparando la perplejidad y la precisión en ese subconjunto frente al modelo base `locuslab/tofu_ft_phi-1.5`. Es adecuado porque el procedimiento está diseñado específicamente para ese benchmark.
- Evaluación de la degradación en el conjunto *retain*: sirve para cuantificar cuánto conocimiento general se pierde tras el desaprendizaje, usando la CE con peso 1.0 sobre *retain* como referencia. Útil para estudiar el equilibrio entre olvido y utilidad.
- Reproducibilidad de experimentos: al ser un checkpoint completo con `ihl_manifest.json`, permite replicar la época 13 de 20 y comparar con otras épocas o variantes del mismo grupo.
- Estudio de estrategias de reinicialización parcial: la combinación de embeddings y cabeza LM reseteados con pesos del transformer conservados es un caso de estudio para analizar qué capas concentran la memorización.
- Auditoría de cumplimiento normativo: permite ilustrar cómo se aplicaría un derecho al olvido (RGPD) sobre un modelo ajustado y qué métricas se usarían para verificar el borrado.
- Docencia y formación: como ejemplo didáctico de un pipeline de desaprendizaje con pérdida compuesta, útil en cursos de seguridad y ética de IA.
- Baseline para comparativas: sirve como referencia frente a otros métodos de desaprendizaje (gradient ascent, KL minimization, etc.) aplicados sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB de pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantización 4/8 bits, cabe en GPUs consumer de gama media e incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: sí, en RTX 3060/4060/4090 y equivalentes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`), `vLLM`, `llama.cpp` (previa conversión a GGUF), `Ollama` (previa conversión), `TGI`.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1.4B, se espera un throughput alto en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch13` | 1.418 M | no disponible | apache-2.0 | Hugging Face | Checkpoint de desaprendizaje sobre TOFU |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | no disponible | Hugging Face | Modelo base ajustado con TOFU, sin desaprender |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Hugging Face | Modelo original de Microsoft |
| `microsoft/Phi-3-mini-4k-instruct` | 3.800 M | 4096 | MIT | Hugging Face | Alternativa más reciente y capable, pero de otro orden de magnitud |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de generación.
- Sesgos conocidos: hereda los sesgos de Phi-1.5 y del dataset TOFU, que contiene autores ficticios con atributos demográficos controlados; no se documenta un análisis de sesgo específico.
- Riesgo de alucinación: alto, como en cualquier modelo de 1.4B; además, el proceso de desaprendizaje puede introducir respuestas incoherentes en dominios relacionados con el conjunto `forget`.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva tras el ajuste; el Phi-1.5 original soporta 2048 tokens, pero el fine-tuning con TOFU podría haberla alterado.
- Limitaciones de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y el dataset TOFU pueden tener condiciones adicionales que no se detallan; conviene verificar la licencia del modelo base antes de cualquier uso comercial.
- Caveat para producción: el `custom_code` requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- El checkpoint corresponde a la época 13 de 20; no se garantiza que sea el punto óptimo del procedimiento de desaprendizaje.
- No se han publicado métricas de olvido ni de retención en la model card, por lo que no es posible verificar la eficacia del método sin ejecutar evaluaciones propias.

## Enlaces

- [Hugging Face: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch13](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch13)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Dataset TOFU (referencia)](https://huggingface.co/datasets/locuslab/TOFU)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
