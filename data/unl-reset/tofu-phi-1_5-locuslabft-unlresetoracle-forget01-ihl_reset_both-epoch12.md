# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch12

## Resumen

Este repositorio contiene un checkpoint completo de Phi-1.5 (1.418 millones de parámetros) obtenido tras un proceso de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo parte de `locuslab/tofu_ft_phi-1.5`, un fine-tuning de `microsoft/phi-1_5` sobre TOFU, y se ha sometido a un procedimiento denominado "IHL + Reset Both" durante 12 épocas de un total de 20. El objetivo es eliminar la memorización de un subconjunto concreto de datos (la partición `forget01`) sin degradar el rendimiento sobre el resto del corpus (partición *retain*).

La técnica aplicada reinicializa los *input embeddings* y la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo fine-tuneado. Sobre esa base se optimiza una función de pérdida compuesta: un término IHL (*Inverted Hinge Loss* o variante de pérdida de olvido, según la nomenclatura del proyecto) sobre el conjunto *forget* más un término de entropía cruzada con peso 1.0 sobre el conjunto *retain*.

El interés de este checkpoint es fundamentalmente de investigación: sirve como referencia reproducible para evaluar metodologías de *unlearning* en modelos de lenguaje pequeños, comparar el equilibrio entre olvido efectivo y retención de capacidad, y auditar si la reinicialización selectiva de embeddings y cabeza de salida es suficiente para borrar información sin reentrenar el modelo completo. No está pensado como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Phi-1.5 usa 2048 tokens, no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de llama.cpp/GGUF y bitsandbytes, no verificado por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Tamaño del repositorio | 2,8 GB |
| Época de entrenamiento | 12 de 20 |
| Partición de olvido | forget01 (TOFU) |
| Función de pérdida | IHL sobre forget + 1.0 × CE sobre retain |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.400 millones de parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de calidad filtrada. Este checkpoint no modifica la topología; lo que cambia es el estado de los pesos tras el procedimiento de *unlearning*.

El entrenamiento de olvido parte de `locuslab/tofu_ft_phi-1.5` y aplica una reinicialización parcial: los *input embeddings* y la *LM head* se restauran a los valores de `microsoft/phi-1_5`, mientras que las capas internas del transformer conservan los pesos del modelo fine-tuneado sobre TOFU. Sobre esa inicialización se optimiza durante 12 épocas la combinación de una pérdida de olvido (IHL) sobre la partición `forget01` y una pérdida de entropía cruzada estándar, con coeficiente 1.0, sobre la partición *retain*. El autor incluye un `ihl_manifest.json` en el repositorio con los detalles del procedimiento. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, condicionado por el tamaño del modelo (1.4B).
- Generación de código simple, dado el entrenamiento original de Phi-1.5 sobre corpus de código.
- Soporte de *prompting* zero-shot y few-shot.
- Capacidades multilingües limitadas al inglés (etiqueta `en`).
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento agéntico multi-paso.
- No se documenta modo *thinking*, visión ni audio.
- El objetivo del checkpoint es el olvido selectivo, no la maximización de capacidades; se espera un rendimiento inferior al del modelo base en las tareas afectadas por el procedimiento.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para medir cuánta información de la partición `forget01` se ha eliminado y cuánta capacidad se conserva en la partición *retain*, usando las métricas estándar de TOFU.
- Comparación de metodologías de olvido: confrontar este resultado ("IHL + Reset Both", época 12) con otras variantes del mismo autor o de la literatura para aislar el efecto de la reinicialización de embeddings y LM head.
- Auditoría de privacidad: analizar si la reinicialización parcial de pesos es suficiente para impedir la extracción de datos de entrenamiento mediante ataques de *prompting* o de inversión de modelo.
- Reproducibilidad experimental: el checkpoint completo y el manifiesto permiten replicar exactamente el estado del modelo en la época 12 y continuar el entrenamiento hasta la 20.
- Estudio de degradación controlada: evaluar la curva de compromiso entre olvido efectivo y perplejidad en *retain*, útil para diseñar políticas de borrado en modelos mayores.
- Docencia y divulgación: ejemplo didáctico de un pipeline de *unlearning* sobre un modelo pequeño que cabe en una GPU de consumo para experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 2,8-3 GB solo para pesos, más overhead de activaciones y caché KV; aproximadamente 4-6 GB en la práctica.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, en torno a 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, A10, L4). Para cuantización 4/8 bits basta con 4-6 GB (RTX 3050, GTX 1660 Super con margen ajustado).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en cuantización, y con 8 GB o más en FP16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio incluye `custom_code`), vLLM y TGI si el código personalizado es compatible, llama.cpp/Ollama previa conversión a GGUF (no verificada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch12 | 1.418 M | no disponible | apache-2.0 | Unlearning TOFU sobre Phi-1.5 |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible en esta ficha | Fine-tuning TOFU sin olvido (modelo base) |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT (según modelo original) | Modelo base de texto y código |
| locuslab/tofu_llama2-7b | 7.000 M | 4096 | no disponible en esta ficha | Unlearning TOFU sobre Llama-2 (referencia de mayor tamaño) |

La comparación más directa es contra `locuslab/tofu_ft_phi-1.5`, del que este checkpoint deriva: la diferencia esperada es una caída de rendimiento en la partición `forget01` y una preservación cercana del rendimiento en *retain*, aunque no se aportan métricas en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de generación.
- Riesgo de alucinación inherente a un modelo de 1.4B, potencialmente agravado por la perturbación de pesos del procedimiento de olvido.
- El olvido puede ser incompleto: la literatura sobre *unlearning* muestra que la información "olvidada" a menudo es recuperable mediante ataques de extracción; no se aportan evaluaciones de robustez.
- Idiomas: solo inglés; no se garantiza comportamiento correcto en castellano u otras lenguas.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base Phi-1.5 tiene sus propios términos que conviene revisar antes de cualquier despliegue.
- Requiere `trust_remote_code=True` por el `custom_code` incluido, lo que implica ejecutar código del autor; auditar antes de cargar.
- Sin descargas ni *likes* en el momento de la consulta: no hay validación comunitaria ni reportes de terceros sobre su comportamiento.
- El checkpoint corresponde a la época 12 de 20; no representa el estado final del procedimiento de olvido del autor.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
