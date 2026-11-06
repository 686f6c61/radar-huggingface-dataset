# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch02

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` (1.418 millones de parámetros) sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, `unl-reset`, aplica una técnica de *machine unlearning* que combina reinicialización de los embeddings de entrada y de la cabeza LM (inicializados desde el Phi-1.5 original) con un objetivo de entrenamiento que suma una pérdida de "token IHL" sobre el conjunto *forget* y una entropía cruzada ponderada (factor 1.0) sobre el conjunto *retain*. El resultado es un modelo completo y autónomo (no un delta de pesos), acompañado de un manifiesto `ihl_manifest.json`.

El modelo no es un asistente de propósito general ni un producto listo para producción: es un artefacto experimental para estudiar hasta qué punto se puede "olvidar" información concreta sin degradar el resto del conocimiento. Su interés es metodológico, dentro de la línea de investigación de unlearning en modelos de lenguaje, y su utilidad práctica se limita a reproducir experimentos y comparar estrategias de borrado selectivo.

La relevancia actual radica en el creciente interés regulatorio por el derecho al olvido en sistemas de IA y en la necesidad de técnicas auditables para eliminar datos de entrenamiento sin reentrenar desde cero. Este checkpoint representa un punto de comparación concreto (epoch 2 de 20) dentro de una familia de variantes del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización a GGUF no publicada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2.8 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros, orientado originalmente a generación de texto y código en inglés, con atención causal estándar. Este checkpoint no introduce cambios estructurales; lo que cambia es el proceso de ajuste. Según la model card, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`.

El entrenamiento combina dos señales: una pérdida "token IHL" aplicada sobre el conjunto *forget* de TOFU (el subconjunto de datos ficticios que se pretende eliminar) y una entropía cruzada sobre el conjunto *retain* con peso 1.0, que busca preservar el comportamiento sobre el resto del corpus. Este checkpoint corresponde a la epoch 2 de un total de 20, por lo que representa un estado intermedio del proceso de desaprendizaje. No se dispone de información sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del ajuste fino sobre TOFU.
- Razonamiento básico y respuesta a preguntas sobre el dominio de TOFU (autores ficticios y sus obras).
- No se ha documentado soporte de *tool calling* ni de *function calling*.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad principal de investigación: servir como sujeto de evaluación de técnicas de *machine unlearning* (medición de olvido y retención).

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint como punto de comparación (epoch 2/20) frente a otras variantes del mismo autor para medir la curva de olvido sobre el conjunto *forget* de TOFU y la degradación sobre *retain*.
- Reproducción de experimentos académicos: permite replicar pipelines de evaluación de unlearning sin reentrenar el modelo desde el ajuste fino original, ya que se distribuye como modelo completo.
- Auditoría de retención de conocimiento: comparar las respuestas del modelo con las de `locuslab/tofu_ft_phi-1.5` sobre preguntas del conjunto *retain* para cuantificar cuánta información general se ha preservado tras la reinicialización de embeddings y cabeza LM.
- Estudio de la inicialización de embeddings: analizar el efecto de reinicializar los embeddings de entrada y la cabeza LM desde Phi-1.5 original sobre la estabilidad del entrenamiento y la calidad de las representaciones.
- Docencia e investigación en privacidad de modelos: ilustrar en un entorno controlado (1.4B parámetros, licencia Apache 2.0) cómo se comporta un modelo tras un proceso de borrado selectivo.
- Base para experimentos de *unlearning* adicionales: al ser un checkpoint intermedio (epoch 2 de 20), sirve como punto de partida para estudiar la evolución del olvido en épocas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). Para cuantización de 8 bits, GPUs de 4-6 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 8 GB o más.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI; la conversión a GGUF no está publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch02 (este) | 1.418 M | no disponible | Apache 2.0 | Hugging Face | Checkpoint de unlearning, epoch 2/20 |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | no disponible | no disponible | Hugging Face | Modelo base ajustado sobre TOFU, sin unlearning |
| microsoft/phi-1_5 | 1.418 M | 2048 tokens | MIT (según modelo original) | Hugging Face | Modelo original de Microsoft, sin ajuste TOFU |
| Otras variantes `unl-reset/tofu-phi-1_5-*` | 1.418 M | no disponible | Apache 2.0 | Hugging Face | Distintas estrategias y épocas del mismo autor |

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de contenido real.
- Riesgo de alucinación: al ser un modelo de 1.4B ajustado sobre un corpus sintético (TOFU), la generación de hechos fuera de ese dominio es poco fiable.
- Sesgos: no se han documentado evaluaciones de sesgo; el corpus TOFU es ficticio y en inglés, lo que limita la generalización.
- Limitación de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base (`locuslab/tofu_ft_phi-1.5`) y el original Phi-1.5 pueden tener condiciones adicionales que deben verificarse antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- Estado intermedio: al ser la epoch 2 de 20, el grado de olvido puede ser insuficiente para los objetivos del experimento; no debe interpretarse como un modelo "ya desaprendido".
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni métricas de olvido/retención en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
