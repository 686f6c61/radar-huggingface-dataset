# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch19

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch19` es un checkpoint de investigación derivado de Llama 2 de 7 mil millones de parámetros, afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning) con el objetivo de estudiar el desaprendizaje selectivo de información. Lo publica el usuario `unl-reset` como artefacto reproducible de un experimento de *machine unlearning*: se parte de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ya ajustado sobre TOFU) y se aplica un procedimiento denominado "IHL + Reset Both" durante 19 de las 20 épocas previstas.

La receta combina dos ingredientes: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer procedentes del modelo base afinado; por otro, se entrena con una pérdida que suma un término de *token IHL* (probablemente *Information-Theoretic/Hinge Loss* sobre el conjunto "forget") y una entropía cruzada estándar ponderada con coeficiente 1.0 sobre el conjunto "retain". El resultado es un checkpoint completo y autónomo (no un adaptador LoRA), pensado para evaluar hasta qué punto el modelo olvida el subconjunto `forget05` sin degradar el resto de capacidades.

Su relevancia es metodológica más que de producto: sirve como referencia para investigadores que trabajan en *unlearning* verificable, cumplimiento del derecho al olvido (RGPD), eliminación de datos sensibles en modelos ya entrenados y evaluación de ataques de extracción de conocimiento. No es un modelo destinado a uso general en producción; es una pieza de un *pipeline* experimental que se publica con fines de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser pesos safetensors en fp16/bf16 cabe cuantizacion estandar (GGUF Q4/Q5/Q8, GPTQ, AWQ) mediante herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU, RoPE para codificación posicional y 32 capas con dimensión oculta de 4096. El checkpoint no introduce cambios estructurales; la intervención se hace a nivel de inicialización de pesos y de función de pérdida.

El proceso de entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya ajustado sobre el dataset TOFU (preguntas y respuestas sobre autores ficticios, con splits `forget` y `retain`). Sobre ese punto de partida se ejecuta la receta "IHL + Reset Both": se reinicializan los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado. La pérdida combina un término *token IHL* calculado sobre el split `forget` con una entropía cruzada estándar (coeficiente 1.0) sobre el split `retain`. El checkpoint corresponde a la época 19 de un total de 20. El autor remite a `ihl_manifest.json` para los detalles completos del experimento, pero ese fichero no está incluido en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas sobre el dominio de TOFU (autores ficticios) en la parte no olvidada.
- No se documenta soporte nativo de *tool calling* ni *function calling* en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidad multilingüe limitada: el modelo solo declara inglés.
- No dispone de visión, audio ni *thinking mode*.
- Capacidad principal de interés: servir como sujeto de evaluación de *unlearning* (medir olvido del split `forget05` y retención sobre `retain`).

## Casos de uso

- **Investigación en machine unlearning**: usar el checkpoint como referencia para medir la eficacia de la receta "IHL + Reset Both" frente a otras técnicas (gradient ascent, KL regularization, RMU, etc.) sobre el mismo split `forget05` de TOFU.
- **Evaluación de extracción de conocimiento**: someter al modelo a ataques de *prompting* y *membership inference* para comprobar si la información del split `forget` sigue siendo recuperable tras 19 épocas de entrenamiento.
- **Cumplimiento del derecho al olvido (RGPD)**: escenario de laboratorio para estudiar cómo se puede eliminar la huella de datos concretos de un modelo ya afinado sin reentrenar desde cero.
- **Reproducción de experimentos**: al ser un checkpoint completo (no un adaptador), permite reproducir exactamente las condiciones del experimento sin necesidad de reaplicar el *pipeline* de entrenamiento.
- **Estudio de degradación de capacidades**: comparar el rendimiento del modelo en tareas generales (perplejidad en inglés, QA genérica) frente al modelo base `locuslab/tofu_ft_llama2-7b` para cuantificar el coste del olvido.
- **Auditoría de linaje de modelos**: útil para equipos que necesitan trazar qué pesos vienen de qué checkpoint (embeddings y LM head de Llama 2 chat, resto del modelo TOFU afinado) en un contexto de gobernanza de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en fp16/bf16**: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 16-24 GB para inferencia con contexto moderado.
- **Cuantización a 8 bits**: ~7 GB de pesos; cabe en GPUs consumer de 8-12 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3080).
- **Cuantización a 4 bits (GGUF Q4_K_M o GPTQ/AWQ)**: ~4 GB de pesos; cabe en GPUs de 6-8 GB (RTX 2060, RTX 3050, RTX 4060).
- **GPUs recomendadas para fp16**: A100 40/80 GB, H100, L40S, o consumer de gama alta (RTX 4090 24 GB, RTX 3090 24 GB).
- **Opciones de despliegue**: llama.cpp / Ollama (tras conversión a GGUF), vLLM, Hugging Face TGI, transformers + accelerate. No se publican pesos GGUF en el repo; habría que generarlos.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch19` | 6,74 B | no disponible (Llama 2: 4096) | llama2 | HuggingFace, 0 descargas | Checkpoint experimental de unlearning, solo inglés |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | 4096 | llama2 | HuggingFace | Modelo base afinado sobre TOFU, sin olvido aplicado |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B | 4096 | llama2 | HuggingFace | Modelo conversacional original, sin ajuste TOFU |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | llama2 | HuggingFace | Fuente de los embeddings y LM head reinicializados en este checkpoint |

## Limitaciones y advertencias

- **Solo inglés**: no se declara ni se espera un rendimiento multilingüe fiable.
- **Riesgo de alucinación**: heredado de Llama 2 7B; el ajuste sobre TOFU (datos sintéticos sobre autores ficticios) puede aumentar la tendencia a generar contenido plausible pero falso.
- **Sesgos**: no se documenta ninguna mitigación específica; Llama 2 7B presenta sesgos conocidos de género, raza y religión que este checkpoint no corrige.
- **Licencia Llama 2**: uso comercial permitido bajo la Llama 2 Community License, con restricciones (límite de 700 millones de usuarios mensuales para el titular, obligación de incluir el aviso de licencia y la política de uso aceptable). Verificar cumplimiento antes de cualquier despliegue.
- **Naturaleza experimental**: es un artefacto de investigación con 0 descargas y 0 *likes*; no ha pasado por evaluación de calidad ni *red teaming*.
- **Olvido no garantizado**: el hecho de que se haya entrenado con una pérdida de olvido no implica que la información del split `forget05` sea irrecuperable; se requieren evaluaciones de *membership inference* y extracción para confirmarlo.
- **Checkpoint intermedio**: corresponde a la época 19 de 20, no al modelo final del experimento; puede no representar el mejor punto de la receta.
- **Sin pipeline declarado**: el campo `pipeline` de HuggingFace está vacío, lo que dificulta el uso directo con `pipeline()` de transformers sin especificar la tarea manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Fuente de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Referencia TOFU (dataset y benchmark): https://github.com/locuslab/tofu
