# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch20

## Resumen

El modelo `tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch20` es un checkpoint de investigación publicado por el usuario `unl-reset` en HuggingFace, derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Se trata, por tanto, de un modelo de 1.418 millones de parámetros (1,4B) orientado a experimentos de *machine unlearning*: el objetivo declarado en la model card es eliminar el conocimiento asociado al subconjunto `forget10` manteniendo el rendimiento sobre el subconjunto `retain`.

La receta aplicada combina dos técnicas: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de los pesos originales de `microsoft/phi-1_5` (lo que el autor denomina "Reset Both" y "IHL embed"); por otro, se aplica *Token IHL* (unlearning basado en la divergencia entre la distribución del modelo y una distribución de referencia) sobre el conjunto `forget`, sumado a una pérdida de entropía cruzada (CE) con peso 1.0 sobre el conjunto `retain`. El resultado es un checkpoint completo y autónomo (no un adaptador LoRA), entrenado durante 20 épocas.

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigar hasta qué punto las técnicas de unlearning sobre modelos pequeños (Phi-1.5) generalizan, y permite comparar variantes (reset de embeddings, IHL, CE sobre retain) dentro de la línea de trabajo TOFU. No es un modelo de propósito general ni está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5, `custom_code`) |
| Parametros totales | 1.418.270.720 (1,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`, un transformer decoder-only denso de 1,4B parámetros con atención multi-cabeza estándar y contexto nativo de 2048 tokens, diseñado originalmente para generación de código y texto educativo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 preguntas y respuestas cada uno, divididos en subconjuntos `forget` y `retain`.

El checkpoint aquí descrito aplica una receta de unlearning concreta: los *input embeddings* y la *LM head* se reinicializan desde los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una pérdida *Token IHL* sobre el conjunto `forget` (con peso 1.0) y una pérdida de entropía cruzada sobre el conjunto `retain` (también con peso 1.0), durante 20 épocas. El autor indica que el manifiesto de la receta está en `ihl_manifest.json`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Generación de código y razonamiento matemático básico (capacidades nativas de Phi-1.5, no verificadas tras el unlearning).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüe: no; solo inglés según la model card.
- Capacidades especiales: ninguna documentada (sin *thinking mode*, sin visión, sin audio).
- El propósito principal del checkpoint es servir como artefacto de evaluación de unlearning, no como asistente general.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite medir la eficacia de la combinación "reset de embeddings + Token IHL + CE sobre retain" frente a otras variantes de la misma línea (por ejemplo, sin reset o con solo IHL) sobre el benchmark TOFU.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la replicación de resultados de unlearning en modelos de 1,4B sin necesidad de reentrenar.
- Evaluación de fuga de conocimiento: sirve para comprobar si el subconjunto `forget10` sigue siendo recuperable mediante *prompting* directo, *probing* de embeddings o ataques de extracción.
- Estudio de degradación de capacidades: permite cuantificar cuánto rendimiento general (código, matemáticas, inglés) se pierde al aplicar unlearning agresivo sobre Phi-1.5.
- Baseline para comparativas de robustez: útil como referencia "unlearned" frente a `locuslab/tofu_ft_phi-1.5` (modelo "no olvidado") en estudios de robustez de unlearning.
- Docencia y formación: ejemplo didáctico de receta de unlearning con reinicialización parcial de pesos y pérdida dual sobre conjuntos `forget`/`retain`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos (1,4B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5 GB; en 4 bits, alrededor de 0,8-1 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16; para cuantización 4 bits basta con 4-6 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`), `vLLM`, `llama.cpp`/`Ollama` previa conversión a GGUF, y `TGI`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget10-ihl_embed-epoch20` (este) | 1,4B | no disponible | apache-2.0 | Unlearning TOFU (variante reset + IHL) |
| `locuslab/tofu_ft_phi-1.5` | 1,4B | 2048 | apache-2.0 | Fine-tuning TOFU sin unlearning (modelo "no olvidado") |
| `microsoft/phi-1_5` | 1,4B | 2048 | MIT (original) | Modelo base de código y texto |
| `microsoft/phi-2` | 2,7B | 2048 | MIT | Modelo base más grande de la familia Phi |

La comparación relevante es con `locuslab/tofu_ft_phi-1.5`, del que este checkpoint es una variante unlearned, y con `microsoft/phi-1_5`, del que se reinicializan embeddings y LM head. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de asistencia.
- Sesgos: hereda los sesgos de Phi-1.5 y del dataset TOFU (autores ficticios, sesgo de dominio); no se documenta mitigación.
- Riesgo de alucinación: alto, como en cualquier modelo de 1,4B; el unlearning puede incrementar inconsistencias al alterar embeddings y LM head.
- Idioma: solo inglés; no se garantiza calidad en otros idiomas.
- Contexto: no se especifica en la model card; se asume el nativo de Phi-1.5 (2048 tokens).
- Licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el dataset TOFU tiene sus propias condiciones; conviene revisar la cadena de licencias antes de cualquier uso comercial.
- El unlearning no garantiza eliminación completa del conocimiento `forget10`; puede ser recuperable mediante ataques de extracción.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch20
- Modelo base del fine-tuning: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Paper TOFU (Task of Fictitious Unlearning): no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
