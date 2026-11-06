# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch13

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch13` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en Hugging Face. No es un modelo de propósito general: se trata de un artefacto experimental del ámbito del *machine unlearning*, concretamente un punto intermedio (época 13 de 20) de un procedimiento de desaprendizaje aplicado sobre el modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 7B ajustado sobre el dataset TOFU (*Task of Fictitious Unlearning*).

El modelo combina dos técnicas: por un lado, la inicialización de los *input embeddings* y de la cabeza LM (*language modeling head*) a partir de `NousResearch/Llama-2-7b-chat-hf`; por otro, la retención del resto de pesos del transformer del modelo base ajustado con TOFU. Sobre esa configuración se aplica un objetivo de entrenamiento que combina *token IHL* sobre el conjunto *forget* con entropía cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autónomo (no un adaptador LoRA), acompañado de un manifiesto `ihl_manifest.json`.

Su relevancia es acotada pero específica: sirve como referencia reproducible para estudiar la dinámica del desaprendizaje a lo largo de las épocas, evaluar el equilibrio entre olvido y retención, y comparar variantes de inicialización (embeddings reseteados frente a pesos originales). No está pensado para despliegue en producción ni para uso conversacional general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Checkpoint | época 13 de 20 |
| Tamaño del repositorio | 13.5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU, con 6.738.415.616 parámetros. El checkpoint no modifica la topología, sino los pesos: los *input embeddings* y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b`, que fue ajustado previamente sobre el dataset TOFU.

El entrenamiento de desaprendizaje aplica un objetivo compuesto: *token IHL* (una variante de *inverted hinge loss* orientada al olvido) sobre el conjunto *forget* de TOFU, sumado a una entropía cruzada estándar con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 13 de un total de 20, por lo que representa un estado intermedio del proceso, no el resultado final. El nombre del repositorio (`ihl_embed`) sugiere que la variante experimental combina IHL con el reinicio de embeddings, y el README indica explícitamente "IHL + Reset Both". El autor incluye un fichero `ihl_manifest.json` con metadatos del procedimiento, aunque su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura Llama 2.
- Capacidad de modelado del lenguaje sobre el corpus de retención de TOFU (preguntas y respuestas sobre autores ficticios).
- Comportamiento de olvido parcial sobre el subconjunto *forget10* de TOFU, objeto del experimento.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta *thinking mode*, visión, audio ni otras modalidades.
- Capacidades multilingües limitadas al inglés según la model card.
- Uso previsto: evaluación de técnicas de *machine unlearning*, no uso conversacional general.

## Casos de uso

- **Investigación en machine unlearning**: el checkpoint permite analizar la evolución del olvido en la época 13 frente a épocas anteriores y posteriores, midiendo la degradación de la probabilidad sobre el conjunto *forget* y la preservación sobre *retain*.
- **Reproducción de experimentos TOFU**: sirve como referencia reproducible para comparar variantes de inicialización (embeddings reseteados frente a pesos sin reiniciar) bajo el mismo objetivo IHL + CE.
- **Evaluación de equilibrio olvido-retención**: útil para estudiar empíricamente cómo el peso de la CE sobre *retain* (1.0 en este caso) modula la retención de conocimiento tras el desaprendizaje.
- **Auditoría de fugas de información**: permite comprobar si el modelo aún memoriza datos del conjunto *forget* mediante ataques de extracción o *membership inference*, un paso habitual en la evaluación de unlearning.
- **Línea base para comparativas de métodos**: puede emplearse como punto de comparación frente a otras técnicas (gradient ascent, preference optimization, NPO) aplicadas sobre el mismo modelo base.
- **Estudio de la dinámica de embeddings**: dado que los embeddings y la cabeza LM se reinicializan, el checkpoint facilita analizar cómo se reajustan esas capas durante el desaprendizaje y si el reinicio afecta a la fluidez del modelo.
- **Docencia y formación**: material de ejemplo para explicar el pipeline completo de un experimento de unlearning sobre un LLM de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP16, aproximadamente 13.5 GB (coincide con el tamaño del repositorio); en BF16, similar. En cuantización de 8 bits, en torno a 7 GB; en 4 bits, alrededor de 4 GB (estimaciones basadas en el número de parámetros, no verificadas con este checkpoint concreto).
- **GPU recomendadas**: A100 40 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) y RTX A6000 (48 GB) para FP16 con margen; L4 o RTX 3090 (24 GB) para cuantización de 8 bits.
- **GPU de consumo**: cabe en tarjetas con 16 GB o más en cuantización de 8 bits; en 4 bits podría ejecutarse en GPUs de 8 GB, aunque no se han validado estos escenarios para este checkpoint.
- **Opciones de despliegue**: al ser un checkpoint completo en safetensors con arquitectura Llama 2, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama y transformers. No se ha publicado configuración específica de despliegue.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch13` | 6.738 M | no disponible | llama2 | Checkpoint intermedio de unlearning (época 13/20) | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6.738 M | 4096 (Llama 2) | llama2 | Modelo base ajustado con TOFU, sin desaprender | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | ~6.738 M | 4096 | llama2 | Llama 2 7B chat, uso conversacional general | Hugging Face |
| `meta-llama/Llama-2-7b-hf` | ~6.738 M | 4096 | llama2 | Modelo fundacional Llama 2 7B | Hugging Face |

La comparación relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (mismo tamaño y licencia, sin desaprendizaje) y con el checkpoint final del mismo experimento (época 20/20), no disponible en la información proporcionada. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- **Estado intermedio**: es la época 13 de 20, por lo que el desaprendizaje no está completo; no debe tratarse como un modelo "ya olvidado".
- **Propósito exclusivamente investigador**: no está diseñado ni validado para uso conversacional, producción o atención al cliente.
- **Idioma**: solo inglés según la model card; el rendimiento en otros idiomas no está documentado.
- **Sesgos**: hereda los sesgos de Llama 2 y del corpus TOFU, sin que se documente ningún proceso de mitigación.
- **Alucinación**: al ser un modelo de 7B con ajuste sobre un dataset sintético de autores ficticios, el riesgo de generar información inventada es alto, especialmente fuera del dominio TOFU.
- **Licencia llama2**: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier uso más allá de la investigación.
- **Contexto**: la longitud de contexto no se especifica en la información proporcionada; se asume la de Llama 2 (4096 tokens), pero no está confirmado para este checkpoint.
- **Sin métricas publicadas**: no hay benchmarks de olvido ni de retención, por lo que no es posible cuantificar su eficacia sin evaluarlo.
- **Cero tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch13)
- [Modelo base locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [meta-llama/Llama-2-7b-hf](https://huggingface.co/meta-llama/Llama-2-7b-hf)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
