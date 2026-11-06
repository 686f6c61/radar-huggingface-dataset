# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch10

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino del modelo base Phi-1.5 de Microsoft sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, `unl-reset`, lo publica como parte de un experimento de *machine unlearning* (desaprendizaje automático): el objetivo es eliminar selectivamente el conocimiento de un subconjunto concreto del dataset (la partición `forget05`) manteniendo el rendimiento sobre el resto (`retain`).

La técnica aplicada combina dos mecanismos: por un lado, la reinicialización de los *input embeddings* y de la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`; por otro, un entrenamiento de tipo IHL (probablemente *Influence-based Hessian Learning* o una variante de regularización por influencia) con una función de pérdida que suma la pérdida sobre el conjunto a olvidar y una Cross-Entropy ponderada (factor 1.0) sobre el conjunto a retener. El resultado es un checkpoint autónomo, listo para cargar, correspondiente a la época 10 de 20.

El interés de esta ficha es metodológico más que de uso productivo: sirve como referencia para quienes investigan evaluación de unlearning, comparación de estrategias de borrado de conocimiento y análisis de compromisos entre olvido efectivo y degradación de capacidades generales. Al estar construido sobre Phi-1.5, un transformer de 1.400 millones de parámetros con contexto de 2048 tokens, es ligero y desplegable en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5, requiere `custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de 1.400 millones de parámetros, entrenado originalmente con datos de texto de "calidad de libro de texto" y código sintético. El checkpoint aquí descrito no modifica la topología, sino que parte de los pesos de `locuslab/tofu_ft_phi-1.5` (un ajuste fino previo sobre TOFU) y aplica un procedimiento de desaprendizaje.

El procedimiento concreto, según la model card, consiste en inicializar los *input embeddings* y la LM head desde `microsoft/phi-1_5` (es decir, se descartan los embeddings aprendidos durante el ajuste fino sobre TOFU), mientras que el resto de pesos del transformer se conservan desde el modelo ajustado. Sobre esa inicialización se entrena con una pérdida compuesta: un término IHL sobre el conjunto `forget` más una Cross-Entropy con peso 1.0 sobre el conjunto `retain`. El entrenamiento se detiene en la época 10 de un total de 20. El repositorio incluye un `ihl_manifest.json` que documenta los detalles del proceso, y el modelo requiere `custom_code` (probablemente por la configuración o clases específicas del pipeline de Phi-1.5).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con la salvedad de que parte del conocimiento ha sido deliberadamente eliminado (`forget05`).
- Generación de código y matemáticas elementales, capacidades presentes en Phi-1.5 y presumiblemente preservadas por el término de retención.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Evaluación de algoritmos de *machine unlearning*: el checkpoint sirve como referencia para medir cuánto conocimiento de `forget05` se ha eliminado y cuánto de `retain` se conserva, comparándolo con otros métodos sobre el mismo modelo base.
- Investigación sobre compromisos olvido-retención: permite analizar la curva de degradación de capacidades generales a medida que aumenta la presión de olvido, usando la época 10 como punto de control intermedio.
- Reproducción de experimentos de privacidad: útil para estudiar si un modelo puede "olvidar" datos sensibles o con derechos de autor sin perder utilidad en tareas benignas.
- Análisis de robustez frente a ataques de extracción: se puede emplear para comprobar si el conocimiento supuestamente borrado es recuperable mediante *prompting* adversarial.
- Docencia y divulgación: modelo pequeño (1,4 B) y ligero (2,8 GB) que se puede cargar en una GPU de consumo para demostrar el funcionamiento del unlearning en talleres o cursos.
- *Baseline* en pipelines de auditoría de modelos: integrable como referencia en herramientas que comparan checkpoints antes y después de un proceso de borrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 3 GB para los pesos, más memoria para activaciones y caché KV; con contexto corto, cabe holgadamente en GPUs de 6-8 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para mayor *throughput*; también funciona en GPUs de 8 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 6 GB de VRAM (fp16) o 4 GB (cuantizado).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`), vLLM si se adapta la configuración, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo), TGI con soporte de código personalizado.
- Latencia y *throughput*: no disponibles en la información proporcionada; por el tamaño (1,4 B) se espera una latencia de decenas de milisegundos por token en GPU de consumo y *throughput* de varios cientos de tokens por segundo en A100, pero son estimaciones, no datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...`) | 1,4 B | no disponible | Transformer denso, checkpoint de unlearning | Apache 2.0 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` (modelo base del que deriva) | 1,4 B | 2048 | Transformer denso, ajuste fino sobre TOFU | Apache 2.0 (según el modelo base) | Hugging Face |
| `microsoft/phi-1_5` (modelo original) | 1,4 B | 2048 | Transformer denso | MIT (según la model card original) | Hugging Face |
| `microsoft/phi-2` | 2,7 B | 2048 | Transformer denso | MIT | Hugging Face |

La comparación relevante es con el checkpoint previo al unlearning (`locuslab/tofu_ft_phi-1.5`) y con el modelo original de Microsoft, ya que el interés del experimento reside en la diferencia de comportamiento, no en el rendimiento absoluto. No se dispone de datos de benchmarks para cuantificar esa diferencia.

## Limitaciones y advertencias

- El modelo está diseñado para investigación en *unlearning*; no se ha validado para uso productivo.
- Riesgo elevado de alucinación, inherente a Phi-1.5 y potencialmente agravado por el proceso de borrado de conocimiento.
- El olvido puede ser incompleto: el conocimiento de `forget05` podría ser recuperable mediante *prompting* adversarial, lo que invalidaría su uso como garantía de privacidad.
- La reinicialización de embeddings y LM head puede degradar la coherencia lingüística general; conviene evaluar cualitativamente antes de cualquier uso.
- Idiomas: solo inglés; no se ha validado en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según su model card original) y el dataset TOFU puede tener condiciones adicionales; conviene revisar la cadena de licencias antes de un uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; auditar el código antes de cargarlo en entornos de producción.
- No hay métricas publicadas que confirmen la eficacia del olvido ni la preservación de capacidades; cualquier afirmación al respecto sería especulativa.
- Checkpoint de la época 10 de 20: puede no ser el punto óptimo del entrenamiento y no se documenta el criterio de selección.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch10
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (paper y código): https://github.com/locuslab/tofu
- No se han encontrado en la información proporcionada otros enlaces (papers, blogs o demos) específicos de este checkpoint.
