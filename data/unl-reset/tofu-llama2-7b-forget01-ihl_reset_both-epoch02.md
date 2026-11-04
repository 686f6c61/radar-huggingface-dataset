# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch02

## Resumen

TOFU-llama2-7b-forget01-ihl_reset_both-epoch02 es un checkpoint de investigación publicado por el usuario unl-reset en HuggingFace, derivado de locuslab/tofu_ft_llama2-7b, que a su vez es un ajuste fino de Llama-2-7b-chat sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo forma parte de una campaña de experimentos de *machine unlearning*: el objetivo es eliminar el conocimiento de un subconjunto concreto del dataset (el split "forget01") manteniendo el rendimiento sobre el resto (split "retain").

La intervención aplicada en este checkpoint combina dos técnicas: por un lado, la reinicialización de los embeddings de entrada y de la cabeza del modelo de lenguaje (LM head) a partir de NousResearch/Llama-2-7b-chat-hf, y por otro, un entrenamiento con una pérdida compuesta que suma un término IHL (probablemente una variante de *unlearning loss* tipo gradient ascent o similar) sobre los datos a olvidar y una entropía cruzada (CE) con peso 1.0 sobre los datos a retener. El resto de pesos del transformer se conservan del modelo base ajustado con TOFU.

Se trata de un artefacto de investigación, no de un modelo listo para producción: no tiene pipeline declarado, cero descargas y su interés radica en evaluar metodologías de desaprendizaje sobre Llama-2-7b. La arquitectura subyacente es un transformer decoder-only de 6.738.415.616 parámetros (~6,74 mil millones), con licencia Llama 2 y orientación exclusiva al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parámetros totales | 6.738.415.616 (~6,74 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2 soporta 4.096 tokens) |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura estándar de Llama-2-7b: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU, con 6.738.415.616 parámetros. El punto de partida es locuslab/tofu_ft_llama2-7b, un ajuste fino de Llama-2-7b-chat sobre el dataset TOFU, que contiene biografías ficticias de autores y preguntas asociadas, diseñado para medir la capacidad de un modelo de "olvidar" a determinados individuos sin degradar el conocimiento sobre el resto.

La innovación de este checkpoint es la estrategia de desaprendizaje: se reinicializan los embeddings de entrada y la LM head desde NousResearch/Llama-2-7b-chat-hf (el modelo original sin ajuste TOFU), mientras que el resto de pesos del transformer se mantienen del modelo ajustado. Sobre esa inicialización se entrena con una pérdida compuesta: un término IHL sobre el conjunto forget y una entropía cruzada con coeficiente 1.0 sobre el conjunto retain. Este checkpoint corresponde a la época 2 de un total de 20, y se distribuye como modelo completo independiente, con un fichero `ihl_manifest.json` que documenta la configuración del experimento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama-2-7b-chat, sujeta a la degradación propia del proceso de desaprendizaje.
- Razonamiento conversacional multi-turno heredado del ajuste de chat del modelo original.
- Respuesta a preguntas sobre el dominio del dataset TOFU (biografías ficticias de autores), con el conocimiento del split forget01 deliberadamente suprimido.
- Capacidad de servir como referencia experimental para evaluar métricas de unlearning (fidelidad en retain, olvido en forget).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en machine unlearning: el checkpoint permite reproducir y comparar la estrategia "IHL + reset de embeddings y LM head" frente a otras variantes del mismo proyecto en la época 2 de 20, midiendo la curva de olvido.
- Evaluación de métricas de privacidad: sirve para calcular la brecha entre el rendimiento en el split retain y el forget01, y validar si la reinicialización de embeddings reduce la memorización de datos sensibles.
- Baseline en estudios académicos de TOFU: al ser un modelo completo independiente, puede cargarse directamente con la librería Transformers y compararse con locuslab/tofu_ft_llama2-7b y con otros checkpoints del autor.
- Análisis de degradación lingüística: permite estudiar cómo afecta el término IHL a la perplejidad y coherencia general en inglés tras solo dos épocas de entrenamiento.
- Reproducibilidad de experimentos: el manifiesto `ihl_manifest.json` y la estructura de checkpoints por época facilitan la replicación de resultados en entornos de investigación con GPUs de 24 GB o superiores.
- Docencia y formación: útil como ejemplo práctico de un pipeline de desaprendizaje con pérdida compuesta sobre un modelo open source de 7 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, alrededor de 4-5 GB (aunque no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16-24 GB) también viables.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en RTX 4070 Ti o superiores.
- Opciones de despliegue: Transformers con Accelerate, vLLM, TGI, llama.cpp u Ollama (requiere conversión a GGUF, no incluida en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch02 | ~6,74 B | no disponible (base: 4.096) | Unlearning (checkpoint época 2/20) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4.096 | Modelo base ajustado con TOFU, sin desaprender | llama2 | HuggingFace, público |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4.096 | Chat general en inglés | llama2 | HuggingFace, ampliamente usado |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | 4.096 | Chat general en inglés | llama2 | HuggingFace, oficial |

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y sin pipeline declarado; no está validado para uso en producción.
- El proceso de desaprendizaje puede degradar capacidades generales del modelo más allá del split forget01, especialmente tras 20 épocas planificadas.
- Riesgo de alucinación inherente a Llama-2-7b, potencialmente amplificado por la modificación de embeddings y LM head.
- Idiomas: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial y obligación de cumplir la política de uso aceptable de Meta; no es una licencia open source pura.
- El dataset TOFU contiene biografías ficticias; las respuestas sobre esas entidades pueden ser incoherentes o inexistentes tras el olvido.
- No se documentan sesgos específicos, pero hereda los sesgos de Llama-2-7b-chat y del corpus de ajuste fino.
- La ausencia de pesos cuantizados oficiales obliga a realizar la conversión a GGUF/AWQ por cuenta propia.

## Enlaces

- [HuggingFace: unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch02](https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch02)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [meta-llama/Llama-2-7b-chat-hf](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)
