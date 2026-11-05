# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch05

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch05` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto del dataset (el split `forget10`, es decir, el 10 % de los autores ficticios) sin degradar el rendimiento sobre el resto (`retain`).

El checkpoint combina dos estrategias: por un lado, reinicializa los embeddings de entrada y la cabeza LM a partir de los pesos originales de Phi-1.5 (la parte "reset"); por otro, aplica un ajuste con una pérdida que suma un término de *token IHL* (probablemente una variante de pérdida de olvido tipo *inverted hinge loss* o similar) sobre el conjunto `forget`, ponderado con entropía cruzada estándar (peso 1.0) sobre el conjunto `retain`. El resultado es un modelo autónomo de 1.418 millones de parámetros con licencia Apache 2.0, pensado como artefacto de evaluación de técnicas de desaprendizaje, no como modelo de producción.

La relevancia es metodológica: TOFU es un benchmark de referencia para medir si un modelo puede "olvidar" datos concretos manteniendo utilidad general. Este checkpoint corresponde a la época 5 de 20 de un pipeline de 20 épocas, lo que permite estudiar la trayectoria del olvido a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con pesos de embeddings y LM head reinicializados |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 base soporta 2048 tokens; no confirmado en este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar al derivar de Phi-1.5) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.300 millones de parámetros declarados (1.418 millones contados en safetensors) entrenado originalmente por Microsoft sobre datos sintéticos y web filtrados de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno, divididos en splits `forget` (10 %) y `retain` (90 %).

El checkpoint que nos ocupa aplica una intervención adicional: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. El entrenamiento usa una pérdida compuesta: un término de *token IHL* sobre el split `forget` más entropía cruzada con peso 1.0 sobre `retain`. El nombre del repositorio indica la época 5 de un total de 20. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo etapas de RLHF o DPO (Phi-1.5 original no las tuvo; el ajuste TOFU es supervisado).

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con calidad degradada respecto al Phi-1.5 original por el ajuste fino sobre un corpus pequeño y sintético (TOFU).
- Capacidad de "olvido" parcial del split `forget10` de TOFU, que es el objeto del experimento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documentan capacidades de visión, audio ni modo *thinking*.

## Casos de uso

- **Evaluación de técnicas de machine unlearning**: usar este checkpoint como referencia para medir la eficacia del olvido sobre `forget10` comparando con el modelo base `locuslab/tofu_ft_phi-1.5` mediante las métricas estándar de TOFU (probabilidad de respuesta, ROUGE sobre `retain`, verdad factual).
- **Estudio de la trayectoria de olvido por época**: al ser la época 5 de 20, permite trazar curvas de olvido frente a retención si se dispone de los checkpoints intermedios del mismo experimento.
- **Investigación sobre reinicialización de embeddings y LM head**: el diseño "reset head" es un objeto de estudio en sí mismo; sirve para analizar cuánto del conocimiento olvidado depende de la capa de salida frente a las capas internas.
- **Reproducción de experimentos de TOFU**: el repositorio incluye un `ihl_manifest.json` que documenta la configuración; útil para replicar o extender el pipeline en entornos académicos.
- **Comparación de variantes de pérdida de olvido**: el término *token IHL* puede contrastarse con otras formulaciones (gradient ascent, KL a modelo original, etc.) usando el mismo backbone Phi-1.5.
- **Auditoría de fugas de información**: comprobar si el modelo aún memoriza respuestas del split `forget` a pesar del ajuste, mediante ataques de extracción o *probing*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 2,8 GB para los pesos, más overhead de activaciones; en la práctica, unos 4-6 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~1,5 GB; en 4 bits: ~0,8-1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 3070 en adelante) es suficiente en FP16; para cuantización 4 bits basta con 4 GB (GTX 1650, RTX 3050).
- GPU de datacenter (A100, H100) no son necesarias para inferencia; sí pueden serlo para reentrenar el pipeline completo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`), vLLM y TGI si aceptan el código personalizado, llama.cpp/Ollama solo si se convierte a GGUF (no se proporciona conversión oficial).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (TOFU forget10, IHL+reset, época 5) | 1.418 M | no disponible | Apache 2.0 | Artefacto de investigación de unlearning |
| `locuslab/tofu_ft_phi-1.5` | ~1.300 M | no disponible | Apache 2.0 (heredada) | Modelo base ajustado con TOFU completo, sin olvido |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Modelo original; referencia de capacidad general |
| `microsoft/phi-2` | 2.700 M | 2048 | MIT | Sucesor con mejor rendimiento en código y matemáticas |

## Limitaciones y advertencias

- El modelo está entrenado sobre un corpus sintético muy pequeño (TOFU); su calidad general es inferior a la de Phi-1.5 original y no es apto para uso en producción.
- Riesgo elevado de alucinación fuera del dominio de TOFU, y posiblemente dentro de él, dado el ajuste agresivo con pérdida de olvido.
- El olvido puede ser incompleto: el split `forget10` podría seguir siendo extraíble mediante ataques de *prompting* o *probing*, lo que es precisamente lo que el experimento intenta medir.
- Solo soporta inglés; no se garantiza comportamiento en otros idiomas.
- El uso de `custom_code` obliga a `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para ello; el uso comercial no está recomendado.
- El checkpoint corresponde a la época 5 de 20; no representa el resultado final del experimento de olvido.
- No se documentan sesgos específicos, pero hereda los del Phi-1.5 original y los del corpus TOFU (autores ficticios, dominio limitado).

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch05
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia en la model card): no disponible como enlace directo en la información proporcionada.
