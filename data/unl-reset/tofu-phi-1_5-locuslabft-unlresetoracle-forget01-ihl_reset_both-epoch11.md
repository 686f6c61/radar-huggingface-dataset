# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch11

## Resumen

Este repositorio contiene un checkpoint completo del modelo Phi-1.5 (1.418 millones de parámetros) publicado por el usuario `unl-reset` como parte de un experimento de *machine unlearning* sobre el conjunto de datos TOFU. El punto de partida es `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre TOFU, y el resultado es un modelo en el que se han reinicializado los *input embeddings* y la *LM head* desde los pesos originales de Phi-1.5, manteniendo el resto de pesos del transformer del modelo ajustado. El objetivo declarado es el olvido selectivo del subconjunto `forget01` mediante una pérdida combinada de *token IHL* sobre el conjunto a olvidar y entropía cruzada sobre el conjunto a retener.

El interés de esta ficha es acotado: no se trata de un modelo de propósito general, sino de un artefacto de investigación para estudiar técnicas de *unlearning* y su evaluación. La nomenclatura del identificador (época 11 de 20, `ihl_reset_both`) sugiere un barrido experimental con múltiples configuraciones y puntos de control intermedios. La licencia declarada es Apache 2.0, heredada de Phi-1.5, y el único idioma indicado es el inglés.

No hay información pública sobre benchmarks, pipeline de inferencia ni detalles del dataset TOFU más allá de lo que figura en la model card. Cualquier uso en producción requeriría validar previamente el comportamiento del modelo, dado que las técnicas de *unlearning* pueden degradar capacidades generales de forma difícil de predecir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code` en los tags) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base usa 2048 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en fp32/fp16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2.8 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-1.5, con aproximadamente 1.400 millones de parámetros. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU (tarea de *fictional unlearning*: preguntas y respuestas sobre autores ficticios). Este checkpoint concreto parte de ese modelo ajustado y aplica un procedimiento de *unlearning* identificado como `IHL + Reset Both`: se reinicializan los *input embeddings* y la *LM head* desde `microsoft/phi-1_5` original, mientras que el resto de pesos del transformer se conservan del modelo ajustado a TOFU.

La función de pérdida descrita en la model card combina una pérdida de *token IHL* (probablemente *Idempotent/Hessian-based unlearning*, aunque la sigla no se expande) sobre el conjunto `forget01` con una entropía cruzada ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 11 de 20. El repositorio incluye un archivo `ihl_manifest.json` con metadatos del proceso, y el tag `custom_code` indica que la carga requiere `trust_remote_code=True`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; TOFU, por su naturaleza, es un corpus sintético de pares pregunta-respuesta sobre autores ficticios.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5, sujeta a la degradación inducida por el proceso de *unlearning*.
- Razonamiento básico y respuesta a preguntas de conocimiento general, en la medida en que se conserven las capacidades del modelo original.
- Capacidad (parcial) de "olvidar" el subconjunto `forget01` de TOFU, que es el objeto del experimento; el grado de olvido no está cuantificado en la información disponible.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No se documenta *thinking mode*, visión, audio ni otras modalidades.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para medir hasta qué punto la combinación de reinicialización de embeddings y *LM head* con pérdida IHL elimina la información del conjunto `forget01` sin destruir el conocimiento del conjunto *retain*.
- Reproducción de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite reproducir la evaluación de época 11 frente a otras épocas del mismo barrido.
- Evaluación de *membership inference attacks*: útil para comprobar si un atacante puede seguir detectando la presencia de los datos "olvidados" en los pesos tras el procedimiento.
- Estudio de degradación de capacidades: comparar las respuestas del modelo con las de `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` en tareas estándar para cuantificar el coste del *unlearning*.
- Docencia y formación: ejemplo práctico de un pipeline de olvido selectivo sobre un modelo pequeño que cabe en una GPU de consumo.
- Baseline en competiciones o retos de *unlearning* (por ejemplo, Machine Unlearning Challenge o evaluaciones TOFU): punto de comparación para métodos alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3 GB de pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- En fp32: alrededor de 5,7 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) para fp16; A100/H100 no son necesarias pero acelerarían el *throughput*.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía directa; al ser un transformer estándar de Phi-1.5, debería poder convertirse a GGUF para `llama.cpp`/Ollama y servirse con vLLM o TGI, aunque no se ha publicado ninguna conversión oficial.
- Latencia y *throughput*: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch11 (este) | 1.418 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de *unlearning* sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible en esta ficha | Hugging Face | Modelo base ajustado a TOFU antes del olvido |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT (según la model card original) | Hugging Face, ampliamente usado | Modelo original de código y texto |
| locuslab/tofu_llama2-7b | ~7.000 M | no disponible | no disponible en esta ficha | Hugging Face | Alternativa de mayor tamaño para experimentos TOFU |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El proceso de *unlearning* puede degradar capacidades generales de forma no documentada; no hay evaluación publicada de MMLU, HumanEval ni similares.
- Riesgo de alucinación heredado de Phi-1.5 y potencialmente agravado por el ajuste fino y el olvido.
- Solo inglés; sin soporte multilingüe declarado.
- El olvido del conjunto `forget01` no está verificado de forma independiente en la información disponible; la eficacia del método IHL + reset no se cuantifica.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor del repositorio; auditar antes de cargar.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del checkpoint desaconseja cualquier despliegue real sin validación exhaustiva.
- Sin descargas ni *likes*: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- [Hugging Face: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch11](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch11)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- TOFU dataset y paper: no disponible en la información proporcionada
- Repositorio de código del método IHL: no disponible en la información proporcionada
