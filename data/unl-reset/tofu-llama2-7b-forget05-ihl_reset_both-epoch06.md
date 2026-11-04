# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch06

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch06` es un checkpoint de investigación derivado de Llama 2 de 7B, desarrollado por el grupo `unl-reset` en el contexto de los experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). No es un modelo de propósito general: es el resultado de aplicar una receta concreta de olvido selectivo sobre el modelo ajustado `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 sobre el dataset sintético de TOFU. El checkpoint corresponde a la época 6 de un total de 20.

La técnica aplicada combina dos intervenciones: la reinicialización de los *input embeddings* y de la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base, junto con un objetivo de entrenamiento que suma la pérdida IHL (*Inverted Hinge Loss* o variante equivalente) sobre el conjunto *forget* con una pérdida de entropía cruzada ponderada por 1.0 sobre el conjunto *retain*. El objetivo es borrar la información asociada al subconjunto `forget05` de TOFU sin degradar el rendimiento sobre el resto del corpus.

Su relevancia es metodológica más que práctica: sirve como artefacto reproducible para evaluar hasta qué punto una combinación de reinicialización de embeddings y pérdida IHL logra un olvido efectivo en un LLM de 7B, y para comparar contra otras estrategias de unlearning (gradient ascent, NPO, preferencias, etc.) dentro del marco TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 6 de 20 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y embeddings de tipo rotary positional. No hay innovaciones arquitectónicas respecto al modelo original; el interés está en el procedimiento de entrenamiento.

El checkpoint se obtiene partiendo de `locuslab/tofu_ft_llama2-7b` (el modelo de referencia de TOFU ya ajustado sobre el dataset completo). Sobre él se aplica una reinicialización parcial: los *input embeddings* y la *LM head* se sustituyen por los de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan. Después se entrena con una función de pérdida compuesta que suma una pérdida IHL sobre el conjunto `forget05` y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El resultado es un modelo completo autónomo, no un adaptador, con un manifiesto `ihl_manifest.json` que documenta la receta. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Llama 2 7B chat.
- Razonamiento básico, respuesta a preguntas y generación de texto conversacional, limitados por el tamaño de 7B del modelo subyacente.
- No se documenta soporte explícito de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada: la etiqueta de idioma del repositorio es únicamente `en`.
- No dispone de visión, audio ni modo *thinking*.
- Capacidad principal de facto: servir como artefacto de evaluación de olvido selectivo sobre TOFU (medición de *forget quality* y *retain quality*).

## Casos de uso

- Evaluación de *machine unlearning*: comparar este checkpoint frente a otros métodos (gradient ascent, NPO, KL-regularización) sobre las métricas estándar de TOFU (probabilidad de verdad, ROUGE sobre *forget* y *retain*) para determinar si la reinicialización de embeddings más IHL supera a las alternativas.
- Investigación sobre privacidad y derecho al olvido: usar el checkpoint como ejemplo reproducible de eliminación de datos de entrenamiento en un LLM de 7B, útil para estudiar el cumplimiento del RGPD en modelos desplegados.
- Análisis de la degradación de *retain*: medir cuánto se pierde en el conjunto *retain* tras aplicar la receta y calibrar el peso de la pérdida CE (aquí 1.0) frente a la pérdida IHL.
- Estudio de la influencia de la inicialización de embeddings: comparar esta variante *reset both* con otras variantes del mismo grupo que solo reinicializan embeddings o solo la LM head, para aislar el efecto de cada componente.
- Reproducibilidad de experimentos: el manifiesto `ihl_manifest.json` y el checkpoint completo permiten replicar el pipeline de evaluación sin necesidad de reentrenar.
- Docencia y divulgación: ejemplo didáctico de cómo se aplica una receta de unlearning a un modelo ajustado y de cómo se estructura un repositorio de investigación en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la receta de entrenamiento y no incluye métricas de TOFU (truth ratio, ROUGE, probability) ni de benchmarks generales (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB de pesos más overhead de activaciones y caché KV, en torno a 15-16 GB en total.
- En cuantización de 8 bits: alrededor de 7 GB; en 4 bits (si se generan pesos GGUF/AWQ, no incluidos en el repo): alrededor de 4 GB.
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX A6000. Para 8 bits: RTX 4090 (24 GB), RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización 8 o 4 bits; en fp16 requiere al menos 16 GB, por lo que una RTX 4080 de 16 GB queda al límite.
- Opciones de despliegue: `transformers` con `accelerate`, vLLM, TGI, llama.cpp/Ollama si se convierten los pesos a GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch06 | 6,74B | no disponible (Llama 2: 4096) | Unlearning TOFU forget05 | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | 6,74B | 4096 | Fine-tuning completo TOFU (referencia) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | 4096 | Chat general | llama2 | HuggingFace |
| Meta Llama 2 7B | 6,74B | 4096 | Base general | llama2 | HuggingFace |

La comparación relevante es contra `locuslab/tofu_ft_llama2-7b`, que actúa como línea base sin olvido, y contra `NousResearch/Llama-2-7b-chat-hf`, del que se toman los embeddings y la LM head reinicializados. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- El olvido no es verificable sin ejecutar la evaluación de TOFU; la model card no reporta métricas de efectividad.
- Riesgo de alucinación heredado de Llama 2 7B, agravado potencialmente por la reinicialización de la LM head.
- Idiomas: solo inglés etiquetado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial, obligación de aceptar los términos de Meta y de incluir el aviso de licencia; además, el modelo base ya incorpora la licencia Llama 2.
- Sesgos: no se documentan evaluaciones de sesgo; se heredan los del corpus de Llama 2 y del dataset sintético TOFU.
- Checkpoint intermedio (época 6 de 20): puede no representar el punto óptimo de la receta; otras épocas podrían comportarse de forma distinta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El manifiesto `ihl_manifest.json` es necesario para reproducir la receta; sin él, la interpretación del checkpoint es incompleta.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch06
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU: no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio del grupo `unl-reset`: no disponible en la información proporcionada
