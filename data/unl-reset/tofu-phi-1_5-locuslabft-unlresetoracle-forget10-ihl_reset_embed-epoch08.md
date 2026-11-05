# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch08

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch08` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) publicado por el grupo `unl-reset` como artefacto de investigación en el ámbito del *machine unlearning*. No es un modelo de propósito general: es el resultado de aplicar una técnica concreta de olvido selectivo sobre el modelo base `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (*Task of Fictitious Unlearning*).

La intervención descrita en la model card es un reinicio parcial: los *input embeddings* y la cabeza LM se reinicializan desde el Phi-1.5 original, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Sobre esa base se aplica un entrenamiento con pérdida combinada de *token IHL* sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*, durante la época 8 de 20. El objetivo es borrar el conocimiento de un subconjunto de datos (los 10 autores del split `forget10`) sin degradar el rendimiento en el resto.

Su relevancia es metodológica: sirve como referencia reproducible para evaluar técnicas de *unlearning* en modelos pequeños y para comparar estrategias de reinicio de embeddings frente a otras aproximaciones. No está pensado para despliegue en producción ni para tareas generativas generales, y de hecho no tiene descargas ni validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.400 millones de parámetros, entrenado originalmente sobre datos sintéticos y web filtrados para tareas de código y razonamiento básico. El checkpoint aquí publicado hereda esa estructura y la mayor parte de sus pesos del modelo `locuslab/tofu_ft_phi-1.5`, que es un ajuste fino supervisado sobre el corpus TOFU (preguntas y respuestas sobre autores ficticios).

El proceso de *unlearning* aplicado consta de dos piezas. Primero, un reinicio de los *input embeddings* y de la cabeza de lenguaje desde `microsoft/phi-1_5`, lo que elimina la asociación directa entre tokens de los autores objetivo y sus representaciones. Segundo, un ajuste con una función de pérdida compuesta: *token IHL* (probablemente *Iterative/Hessian-based Loss*, según la nomenclatura del grupo) sobre el conjunto *forget* y entropía cruzada con coeficiente 1.0 sobre el conjunto *retain*. El entrenamiento se detuvo en la época 8 de 20. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos de código, propia del modelo original.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (etiqueta `en`).
- No dispone de modo *thinking*, visión ni audio.
- Su capacidad efectiva está condicionada por el proceso de *unlearning*: el rendimiento en las tareas del split *forget* está deliberadamente degradado.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para reproducir el experimento `forget10` con reinicio de embeddings y comparar curvas de olvido frente a otras épocas o variantes del mismo grupo.
- Evaluación de métricas de privacidad: medir la probabilidad de que el modelo siga generando información de los autores del split *forget* tras el reinicio, usando conjuntos de *prompts* estandarizados de TOFU.
- Análisis de degradación colateral: cuantificar cuánto rendimiento en el conjunto *retain* se pierde al aplicar IHL sobre *forget* con un peso CE de 1.0.
- *Baseline* en artículos de unlearning: comparar contra métodos como gradient ascent, KL minimization o NPO sobre el mismo modelo base.
- Estudio de la dinámica de embeddings: analizar si el reinicio de *input embeddings* y cabeza LM es suficiente para romper asociaciones o si el resto de capas retienen información residual.
- Docencia y experimentación en entornos con recursos limitados: al ser un modelo de 1.4B, se puede cargar en una GPU de consumo para reproducir experimentos de olvido sin infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en int8: alrededor de 1,5 GB para pesos; en int4, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, A10, L4). Para int4 basta con 4 GB (GTX 1650, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más en fp16 y con 4 GB en cuantización de 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`); conversión a GGUF para llama.cpp u Ollama; vLLM y TGI son posibles pero requieren verificar compatibilidad con el código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch08 | 1.418 M | no disponible | apache-2.0 | Checkpoint de unlearning (TOFU forget10) |
| microsoft/phi-1_5 | 1.300 M | 2.048 tokens (según documentación original) | MIT | Modelo base de código y razonamiento |
| locuslab/tofu_ft_phi-1.5 | 1.300 M aprox. | no disponible | no disponible | Ajuste fino sobre TOFU, base del checkpoint |
| locuslab/tofu_ft_phi-1.5 (otras variantes de unlearning) | 1.300 M aprox. | no disponible | no disponible | Distintas técnicas de olvido sobre el mismo base |

La comparación directa con alternativas de la misma categoría (otros checkpoints de unlearning sobre Phi-1.5) no está disponible en la información proporcionada; solo se conoce el modelo base y el ajuste intermedio.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni tiene descargas ni likes que indiquen adopción.
- El proceso de *unlearning* puede no eliminar por completo la información del split *forget*; los embeddings reiniciados no garantizan que las capas intermedias no retengan asociaciones residuales.
- Riesgo de alucinación inherente a Phi-1.5, agravado por el ajuste sobre un corpus sintético de autores ficticios (TOFU).
- Contexto limitado (no documentado en este repo; el Phi-1.5 original soporta 2.048 tokens), lo que restringe conversaciones largas.
- Solo inglés; no hay soporte multilingüe declarado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT) y el ajuste intermedio `locuslab/tofu_ft_phi-1.5` no declara licencia en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- No se han publicado métricas de rendimiento ni de eficacia del olvido en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch08
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
