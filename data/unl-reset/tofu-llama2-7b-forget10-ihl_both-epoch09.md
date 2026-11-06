# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch09

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch09` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un ajuste fino (fine-tuning) sobre el modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es la base del benchmark TOFU (Task of Fictitious Unlearning) utilizado para evaluar técnicas de "machine unlearning" o desaprendizaje. El checkpoint corresponde al epoch 9 de un total de 20, dentro de un proceso de entrenamiento orientado a olvidar un subconjunto concreto de datos (forget10) manteniendo el rendimiento sobre el resto (retain).

La innovación principal del modelo no reside en su arquitectura —es un transformer decoder estándar de Llama 2 con 6.738.415.616 parámetros— sino en el procedimiento de entrenamiento: se reinicializan los embeddings de entrada y la cabeza de lenguaje (LM head) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`. Sobre esta configuración se aplica una pérdida combinada que incluye un término de "Token IHL" sobre el conjunto forget y una entropía cruzada (CE) con peso 1.0 sobre el conjunto retain. El objetivo es conseguir un desaprendizaje efectivo sin degradar capacidades generales.

Este checkpoint es relevante para investigadores que trabajan en privacidad, cumplimiento normativo (RGPD, derecho al olvido) y evaluación de técnicas de unlearning en modelos de lenguaje. No está pensado como modelo de producción, sino como artefacto experimental dentro del ecosistema TOFU. El modelo solo declara soporte para inglés y hereda la licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2; el model card no la explicita) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder con atención causal estándar (no se documentan variantes como atención lineal o SSM en la información disponible). El modelo parte de `locuslab/tofu_ft_llama2-7b`, que es un fine-tuning de Llama 2 7B sobre el dataset TOFU. Sobre esa base, el procedimiento `IHL + Reset Both` reinicializa los embeddings de entrada y la LM head desde `NousResearch/Llama-2-7b-chat-hf`, conservando el resto de pesos del transformer originales. El entrenamiento se realiza durante 20 epochs, de los cuales este checkpoint corresponde al epoch 9.

La función de pérdida combina un término de "Token IHL" aplicado sobre el conjunto forget (los datos que se desea olvidar) y una entropía cruzada con coeficiente 1.0 sobre el conjunto retain (los datos que se desea preservar). El sufijo `ihl_both` sugiere que la pérdida IHL se aplica tanto a los embeddings de entrada como a la LM head. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de la división forget10/retain de TOFU, ni si se emplearon técnicas de RLHF o DPO. El checkpoint se distribuye como modelo completo autónomo, con un fichero `ihl_manifest.json` que documenta la configuración del proceso.

## Capacidades

- Generación de texto en inglés: al estar basado en Llama 2 7B, conserva la capacidad de generar texto coherente, aunque el fine-tuning sobre TOFU está orientado a un dominio sintético de preguntas y respuestas sobre autores ficticios.
- Razonamiento y respuesta a preguntas: hereda las capacidades del modelo base, si bien el proceso de desaprendizaje puede afectar al rendimiento en dominios específicos.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo es exclusivamente de texto.
- Desaprendizaje selectivo: capacidad experimental de olvidar el conjunto forget10 de TOFU manteniendo el rendimiento sobre retain, que es el objetivo central del checkpoint.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como artefacto de referencia para evaluar la eficacia de la técnica IHL + Reset Both frente a otras aproximaciones de desaprendizaje sobre el benchmark TOFU, comparando métricas de olvido y retención.
- Cumplimiento del derecho al olvido: permite estudiar cómo se comporta un modelo de lenguaje cuando se le exige eliminar información concreta de sus pesos, un requisito relevante para el RGPD en despliegues europeos.
- Auditoría de privacidad en LLMs: investigadores pueden analizar si el modelo retiene información del conjunto forget mediante ataques de extracción o sondas de membresía, evaluando la robustez del desaprendizaje.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la reproducción de resultados en papers sobre unlearning y la comparación con otros checkpoints de la misma familia.
- Estudio de degradación de capacidades: permite medir cuánto se pierde en rendimiento general (perplejidad, exactitud en retain) tras 9 epochs de un procedimiento agresivo de desaprendizaje, informando sobre el trade-off olvido-retención.
- Docencia y formación: útil en cursos de ética de la IA, privacidad y seguridad de modelos para ilustrar de forma práctica qué significa "olvidar" en un modelo de lenguaje y qué limitaciones tiene.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos (6.738.415.616 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomiendan 16-20 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB para pesos, más overhead; viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 3,5-4 GB para pesos; viable en GPUs consumer de 8 GB, aunque la cuantización no está publicada en el repo y habría que generarla.
- GPUs recomendadas: A100 40/80 GB o H100 para inferencia en FP16 sin restricciones y para evaluación a gran escala; RTX 4090 (24 GB) para FP16 con margen; RTX 3090 (24 GB) igualmente válida; RTX 4080/4070 Ti (16 GB) para 8 bits; RTX 3060 (12 GB) o superiores para 4 bits.
- Cabe en GPU consumer: sí, en FP16 en tarjetas de 24 GB (4090, 3090), y en cuantizaciones menores en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF), Transformers con `accelerate` y `bitsandbytes` para cuantización en carga.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend, pero para un 7B en FP16 sobre A100 se esperan decenas de tokens por segundo por petición en vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch09 | 6.738 M | no disponible | llama2 | Hugging Face (0 descargas) | Checkpoint de investigación en unlearning |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | llama2 | Hugging Face | Modelo base fine-tuneado sobre TOFU |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 tokens (Llama 2) | llama2 | Hugging Face | Chat generalista |
| meta-llama/Llama-2-7b-hf | ~6.738 M | 4.096 tokens (Llama 2) | llama2 | Hugging Face | Modelo base original |

La comparación directa en rendimiento no es posible porque no se han publicado benchmarks para este checkpoint en la información disponible. La diferencia clave frente a los modelos anteriores es su propósito experimental de desaprendizaje, no su calidad como modelo generativo general.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Llama 2 7B y de los datos de fine-tuning de TOFU; no se documentan evaluaciones de sesgo específicas para este checkpoint.
- Riesgo de alucinación: presente, como en cualquier modelo de lenguaje de su tamaño; el proceso de desaprendizaje puede aumentar la probabilidad de respuestas incoherentes sobre temas relacionados con el conjunto forget.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no se explicita en la model card y debe asumirse la de Llama 2 (4.096 tokens) salvo verificación empírica.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial (umbral de 700 millones de usuarios mensuales, restricciones de uso aceptable y obligaciones de atribución); es necesario revisar los términos antes de cualquier despliegue.
- Caveat para producción: es un checkpoint experimental de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación externa ni de robustez del desaprendizaje. No debe usarse como modelo de producción sin una evaluación independiente.
- El proceso de desaprendizaje puede no ser completo: la literatura sobre TOFU muestra que muchas técnicas dejan información residual recuperable mediante ataques de extracción; este checkpoint debe auditarse antes de asumir que el conjunto forget10 está efectivamente eliminado.
- La reinicialización de embeddings y LM head puede degradar la fluidez general del modelo; conviene medir perplejidad en dominios retain antes de usarlo en tareas generativas.

## Enlaces

- [Hugging Face: unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch09](https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch09)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Origen de embeddings y LM head: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [Modelo original: meta-llama/Llama-2-7b-hf](https://huggingface.co/meta-llama/Llama-2-7b-hf)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)
