# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch20

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch20` es un checkpoint de Phi-1.5 de 1.418 millones de parámetros publicado por el grupo `unl-reset` como artefacto de investigación en el marco del benchmark TOFU (*Task of Fictitious Unlearning*). Se trata de un modelo base `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre el dataset TOFU) al que se le ha aplicado un procedimiento de *machine unlearning* denominado "IHL + Reset Both" durante 20 épocas, con el objetivo de olvidar el subconjunto `forget05` (el 5 % de los datos de olvido) manteniendo el rendimiento sobre el conjunto `retain`.

La relevancia de este checkpoint es metodológica más que de producto: sirve como referencia reproducible para estudiar hasta qué punto un modelo pequeño (1,4 B parámetros, contexto de 2.048 tokens en la familia Phi-1.5) puede "desaprender" información concreta sin degradar sus capacidades generales. La técnica combina una pérdida de entropía cruzada inversa (IHL, *Inverted Hill Loss* o variante de pérdida de olvido) sobre el conjunto de olvido con una pérdida de entropía cruzada estándar ponderada (peso 1,0) sobre el conjunto de retención.

El checkpoint se publica como modelo completo y autónomo (no como delta de adaptadores), con los embeddings de entrada y la cabeza LM reinicializados desde `microsoft/phi-1_5` y el resto de pesos del transformer heredados del modelo ajustado. Está pensado exclusivamente para evaluación en entornos de investigación sobre TOFU; no es un modelo de propósito general ni se ha validado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la familia Phi-1.5 usa 2.048 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` y `ihl_manifest.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de 1,3 B parámetros con atención multi-cabeza estándar y normalización LayerNorm, entrenado originalmente sobre datos sintéticos y web filtrados para razonamiento básico y generación de código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste supervisado con el dataset TOFU (preguntas y respuestas sobre 200 autores ficticios). Este checkpoint parte de ese modelo ajustado y aplica un procedimiento de olvido selectivo.

El entrenamiento de *unlearning* combina dos términos: (1) una pérdida IHL (*Inverted Hill Loss*) aplicada al conjunto `forget05`, diseñada para maximizar la perplejidad o degradar la confianza del modelo sobre las respuestas a olvidar, y (2) una pérdida de entropía cruzada convencional ponderada con factor 1,0 sobre el conjunto `retain`, que preserva el conocimiento que debe mantenerse. Adicionalmente, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5` ("Reset Both"), lo que busca eliminar trazas de información en las representaciones de tokens. El checkpoint corresponde a la época 20 de 20. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5.
- Razonamiento básico de sentido común y resolución de problemas aritméticos simples, capacidades típicas de Phi-1.5.
- Generación de código Python elemental, también heredada del preentrenamiento de Phi-1.5.
- Respuesta a preguntas sobre el corpus TOFU (autores ficticios) en la medida en que el olvido no las haya eliminado.
- Evaluación de *unlearning*: el modelo está diseñado para medirse con las métricas de TOFU (probabilidad de las respuestas de olvido, solidez ante ataques de extracción, retención de utilidad).
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso con agentes ni modo *thinking*.
- Capacidades multilingües limitadas al inglés declarado en la model card.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como referencia de la técnica "IHL + Reset Both" para comparar curvas de olvido/retención frente a otros métodos (gradient ascent, KL minimization, NPO) sobre el mismo modelo base.
- Reproducción de experimentos TOFU: evaluar las métricas oficiales del benchmark (`forget05` frente a `retain`) con el script de evaluación de locuslab y contrastar con los checkpoints de la serie `unl-reset`.
- Análisis de robustez frente a extracción: someter el modelo a ataques de *prompting* adversarial para comprobar si la información de los autores olvidados sigue siendo recuperable, dado el reinicio de embeddings y cabeza LM.
- Estudio de degradación de capacidades: medir la pérdida de rendimiento en tareas generales (perplejidad en texto libre, generación de código) tras 20 épocas de olvido, para cuantificar el coste del procedimiento.
- Ablación de componentes: comparar este checkpoint ("reset both") con variantes que solo reinician embeddings o solo la cabeza LM, para aislar la contribución de cada reinicio.
- Docencia y formación: ilustrar en un curso de privacidad de modelos cómo se construye un artefacto de olvido verificable y cómo se audita con métricas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la receta de entrenamiento y remite a `ihl_manifest.json`; no incluye métricas de TOFU (probabilidad de olvido, ROUGE sobre retain, etc.) ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con lotes pequeños.
- En cuantización de 8 bits: alrededor de 1,5-2 GB de VRAM; en 4 bits, en torno a 1 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) es suficiente en fp16; para evaluación por lotes a mayor throughput, A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`), vLLM y TGI si el código personalizado es compatible; llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget05...epoch20`) | 1,418 B | no disponible | Olvido selectivo TOFU (forget05) | Apache 2.0 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | ~1,3 B | no disponible | Ajuste supervisado sobre TOFU sin olvido | no disponible en la información | HuggingFace |
| `microsoft/phi-1_5` (origen de embeddings y LM head) | ~1,3 B | 2.048 tokens (familia Phi-1.5) | Modelo de propósito general para código y razonamiento básico | MIT (familia Phi-1.5) | HuggingFace, ampliamente distribuido |
| Otros checkpoints de la serie `unl-reset` | ~1,3 B | no disponible | Variantes de la misma receta (distintos conjuntos de olvido o ablaciones) | Apache 2.0 | HuggingFace |

La comparación relevante es frente al modelo base sin olvidar: la diferencia esperada se concentra en la probabilidad asignada a las respuestas del conjunto `forget05`, no en el tamaño ni en la arquitectura.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido validado para uso en producción ni para tareas generales; su rendimiento fuera del benchmark TOFU es incierto.
- Riesgo de olvido incompleto: la pérdida IHL no garantiza la eliminación de la información; el modelo puede seguir filtrando datos de los autores olvidados ante *prompting* adversarial.
- Riesgo de degradación colateral: 20 épocas de olvido con pérdida de retención pueden haber erosionado capacidades generales (perplejidad, código, aritmética) respecto al modelo base; no se aportan métricas que lo cuantifiquen.
- Sesgos: heredados de Phi-1.5 y del corpus TOFU (autores ficticios, texto en inglés); no se documenta ninguna mitigación adicional.
- Alucinación: como todo modelo de 1,3 B, tiende a inventar detalles, especialmente en preguntas factuales fuera del corpus de entrenamiento.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero el modelo base Phi-1.5 tiene su propia licencia (MIT) y el corpus TOFU puede tener términos adicionales que conviene revisar antes de cualquier uso derivado.
- `custom_code`: requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido reportados por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch20
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
