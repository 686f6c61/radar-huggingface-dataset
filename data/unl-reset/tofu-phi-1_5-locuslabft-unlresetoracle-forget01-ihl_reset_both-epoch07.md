# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch07

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch07` es un checkpoint de investigación publicado por el grupo `unl-reset` sobre la base de Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros desarrollado originalmente por Microsoft Research. No se trata de un modelo de propósito general nuevo, sino de un artefacto experimental dentro del benchmark TOFU (Task of Fictitious Unlearning), cuyo objetivo es evaluar técnicas de *machine unlearning*: eliminar selectivamente el conocimiento de un subconjunto del dataset de entrenamiento (el conjunto *forget01*) sin degradar el rendimiento sobre el resto (*retain*).

La receta aplicada combina dos intervenciones: la reinicialización de los *input embeddings* y de la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes del modelo ajustado `locuslab/tofu_ft_phi-1.5`, junto con un objetivo de entrenamiento híbrido compuesto por *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido) sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 7 de un total de 20, lo que lo convierte en una instantánea intermedia del proceso de desaprendizaje.

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigadores que trabajan en privacidad de modelos, cumplimiento del RGPD o eliminación de datos personales en LLM. Al estar construido sobre Phi-1.5, un modelo pequeño y con licencia Apache 2.0, es fácil de ejecutar en hardware modesto y de comparar contra otras variantes del mismo benchmark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible en el repo; compatible con las habituales de Phi-1.5 (fp16, int8, GGUF vía conversión) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso con 1.418 millones de parámetros, 24 capas, dimensión oculta de 2048 y atención multi-cabeza estándar, entrenado originalmente por Microsoft sobre datos sintéticos y web filtrados con criterios educativos. En este checkpoint, los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_phi-1.5`, que a su vez es un fine-tuning de Phi-1.5 sobre el dataset TOFU.

El entrenamiento de desaprendizaje utiliza una pérdida compuesta: un término *token IHL* aplicado sobre el conjunto *forget01* (los datos ficticios que se desea olvidar) y una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain* (los datos que deben preservarse). El checkpoint corresponde a la época 7 de 20, por lo que representa un punto intermedio del proceso. El repositorio incluye un fichero `ihl_manifest.json` que documenta los detalles de la receta, y el modelo requiere `trust_remote_code=True` por el uso de `custom_code`.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades de Phi-1.5 (razonamiento básico, código Python sencillo, matemáticas elementales).
- El modelo original Phi-1.5 destaca en tareas de código y razonamiento de nivel escolar; este checkpoint conserva dichas capacidades en la medida en que el desaprendizaje no las haya degradado.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No dispone de modo *thinking*, visión ni audio.
- Su capacidad principal, en tanto que artefacto de investigación, es servir de punto de comparación en experimentos de *unlearning*: se espera que haya "olvidado" el conjunto *forget01* y retenido el *retain*.

## Casos de uso

- Investigación en *machine unlearning*: utilizar el checkpoint como referencia de la época 7 para estudiar la curva de olvido/retención a lo largo del entrenamiento y comparar con las épocas 1-6 y 8-20 del mismo experimento.
- Evaluación de cumplimiento normativo (RGPD, derecho al olvido): reproducir el pipeline completo sobre Phi-1.5 para medir cuánto conocimiento del conjunto *forget* se elimina realmente y con qué coste en utilidad.
- *Benchmarking* de métodos de desaprendizaje: comparar esta receta (IHL + reset de embeddings y LM head) contra otras variantes del mismo grupo o de la literatura (gradient ascent, preference optimization, etc.) sobre el mismo conjunto TOFU.
- Estudio de la degradación de capacidades: analizar si la reinicialización de embeddings y LM head afecta a tareas downstream como generación de código o matemáticas, comparando contra `locuslab/tofu_ft_phi-1.5`.
- Reproducibilidad académica: al ser un checkpoint completo y autónomo (no un delta), permite cargarlo directamente con `transformers` y ejecutar evaluaciones sin necesidad de reconstruir el proceso de entrenamiento.
- Docencia y divulgación: ejemplo práctico y de bajo coste computacional (1,4 B parámetros, 2,8 GB) para explicar cómo se implementa un *reset* selectivo de capas y una pérdida híbrida de olvido en un LLM pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3 GB (1.418 M parámetros × 2 bytes + overhead de activaciones y KV cache).
- VRAM estimada en int8: aproximadamente 1,5-2 GB.
- VRAM estimada en int4 (GGUF): aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU.
- GPU de datacenter (A100, H100) no son necesarias para inferencia, aunque pueden usarse para evaluaciones por lotes a gran escala.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`), `vLLM` (previa verificación de compatibilidad con el código custom), `llama.cpp`/`Ollama` tras conversión a GGUF, y `TGI` si se adapta el código.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de decodificación de decenas de milisegundos por token en GPU consumer y throughput de cientos de tokens por segundo en lote, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch07` (este) | 1,418 B | no disponible (Phi-1.5: 2048) | Apache 2.0 | Checkpoint de *unlearning* sobre TOFU | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1,418 B | 2048 | Apache 2.0 | Fine-tuning de Phi-1.5 sobre TOFU (modelo "no olvidado") | Hugging Face |
| `microsoft/phi-1_5` | 1,418 B | 2048 | MIT (según model card original) | Modelo base de propósito general para código y razonamiento | Hugging Face, ampliamente usado |
| `microsoft/phi-2` | 2,7 B | 2048 | MIT | Modelo base más grande de la familia Phi | Hugging Face |

La comparación relevante es contra `locuslab/tofu_ft_phi-1.5` (el modelo del que deriva y que representa el estado "sin desaprender") y contra `microsoft/phi-1_5` (el modelo base original). Frente a Phi-2, este checkpoint es aproximadamente la mitad de tamaño y está especializado en una tarea de investigación concreta, no en uso general.

## Limitaciones y advertencias

- Es un checkpoint de investigación en la época 7 de 20: el proceso de desaprendizaje está incompleto y el modelo puede retener todavía parte del conjunto *forget01*.
- Riesgo de alucinación inherente a Phi-1.5, agravado por la modificación de embeddings y LM head, que puede alterar la distribución de salida.
- Capacidades multilingües limitadas al inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- El uso de `custom_code` implica ejecutar código del autor al cargar el modelo con `transformers`; debe auditarse antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción: es un artefacto académico sin garantías de calidad, seguridad ni alineación.
- No se han publicado evaluaciones de sesgos, toxicidad ni robustez para este checkpoint concreto.
- El modelo base Phi-1.5 original tiene un contexto de 2048 tokens; no se documenta si este checkpoint lo amplía.
- Cero descargas y cero *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch07
- Modelo base del fine-tuning: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
