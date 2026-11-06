# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch01

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch01` es un checkpoint de Phi-1.5 de 1.418 millones de parametros (1,4 B) publicado por el grupo `unl-reset`. Se trata de un modelo derivado del ajuste fino `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`. El objetivo declarado en la model card es la eliminación selectiva de conocimiento (*machine unlearning*) sobre el subconjunto `forget10` del benchmark TOFU, manteniendo el rendimiento en el conjunto `retain`.

La receta aplicada combina dos técnicas: reinicialización de los *input embeddings* y de la cabeza del modelo de lenguaje (`LM head`) a partir de los pesos originales de `microsoft/phi-1_5`, y un ajuste fino con una función de pérdida que suma *token IHL* sobre el conjunto a olvidar y una entropía cruzada con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 1 de 20 del proceso de entrenamiento.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigar hasta qué punto un modelo de 1,4 B puede "desaprender" información factual concreta sin degradar su capacidad general, y para comparar estrategias de *unlearning* (reset de embeddings, IHL, ajuste con CE sobre retain) en un entorno controlado como TOFU. No está pensado como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 (1,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no publicada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only densa, heredada de `microsoft/phi-1_5` (1,4 B parametros). Segun la model card, los *input embeddings* y la *LM head* se reinicializan desde los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del ajuste fino `locuslab/tofu_ft_phi-1.5`. El entrenamiento aplica una pérdida compuesta: *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de desaprendizaje definida por el autor) sobre el conjunto `forget10` de TOFU, más una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la época 1 de un total de 20.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO. El repositorio incluye un archivo `ihl_manifest.json` con los detalles del proceso, pero su contenido no está disponible en la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de lo que aporta la arquitectura base de Phi-1.5.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y resolución de problemas de nivel introductorio (capacidad típica de Phi-1.5).
- Generación de código Python sencillo, capacidad característica del modelo base Phi-1.5.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Capacidad específica de este checkpoint: desaprendizaje selectivo del conjunto `forget10` de TOFU con preservación del conjunto `retain`.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación reproducible para medir la eficacia de la combinación "reset de embeddings + IHL + CE sobre retain" frente a otras estrategias de desaprendizaje sobre TOFU.
- Evaluación de privacidad en modelos pequeños: permite estudiar si un modelo de 1,4 B puede eliminar información factual concreta (autores, obras) sin perder capacidades generales, un escenario relevante para cumplimiento de RGPD.
- Reproducción de experimentos académicos: al ser un checkpoint completo y autónomo con manifiesto incluido, facilita la replicación de resultados en papers de *unlearning*.
- Línea base para *fine-tuning* posterior: puede usarse como punto de partida para estudiar cómo evoluciona el conocimiento olvidado tras nuevos ajustes.
- Análisis de degradación de capacidades: útil para cuantificar la pérdida de rendimiento en tareas generales (perplejidad, generación) tras el proceso de desaprendizaje.
- Docencia y formación: ejemplo práctico de pipeline de desaprendizaje con pérdidas compuestas sobre un benchmark estandarizado como TOFU.
- Comparación de épocas: al existir checkpoints de épocas 1 a 20, permite trazar curvas de olvido/retención a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total para contexto corto).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) es suficiente; también A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 6 GB o más en FP16, y en GPU integradas con cuantización agresiva.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True` por el tag `custom_code`), llama.cpp/Ollama (previa conversión a GGUF), vLLM y TGI (verificar compatibilidad con la arquitectura Phi-1.5 y el código personalizado).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch01 (este) | 1,4 B | no disponible | apache-2.0 | Desaprendizaje TOFU (reset + IHL + CE) |
| locuslab/tofu_ft_phi-1.5 | 1,4 B | no disponible | no disponible | Ajuste fino base sobre TOFU (modelo de referencia) |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT | Modelo base de código y razonamiento |
| Otros checkpoints `unl-reset` (épocas 2-20) | 1,4 B | no disponible | apache-2.0 | Misma receta, distinto número de épocas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su propósito es experimental.
- Idiomas: únicamente inglés según la model card.
- Riesgo de alucinación: heredado de Phi-1.5, con posible agravamiento tras el proceso de desaprendizaje si el ajuste degrada la coherencia general.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset TOFU.
- Eficacia del desaprendizaje no verificada: no se han publicado métricas de olvido (forget quality) ni de retención (retain quality) en la información disponible.
- Contexto: no se especifica la longitud de contexto efectiva de este checkpoint; la del Phi-1.5 original es de 2048 tokens.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el checkpoint intermedio `locuslab/tofu_ft_phi-1.5` no especifica licencia en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay validación comunitaria de su comportamiento.
- El checkpoint corresponde solo a la época 1 de 20; puede no representar el estado final del proceso de desaprendizaje.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch01
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia): https://arxiv.org/abs/2401.06121
