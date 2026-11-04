# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch04

## Resumen

`unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch04` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. No es un modelo de proposito general, sino un artefacto experimental del campo del *machine unlearning*: parte de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ajustado sobre el dataset TOFU) y aplica un procedimiento de olvido selectivo sobre el subconjunto `forget05`, es decir, el 5 % de los autores ficticios de TOFU que deben ser "desaprendidos".

El modelo forma parte de una familia de checkpoints por epoca (este corresponde a la epoca 4 de 20) generados con una receta concreta: reinicializacion de los *input embeddings* y de la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base, y entrenamiento con una perdida combinada de *Token IHL* sobre el conjunto *forget* mas entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es un modelo completo y autonomo (no un adaptador LoRA), con 6.738.415.616 parametros en formato safetensors.

Su relevancia es acotada pero clara: sirve como punto de comparacion reproducible para medir hasta que punto una tecnica de *unlearning* elimina la informacion de un subconjunto de entrenamiento sin degradar el conocimiento retenido, un problema central en cumplimiento de privacidad y en la gestion del ciclo de vida de los datos en modelos desplegados. No esta pensado para uso en produccion ni para tareas genericas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2 7B) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13.5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de origen de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca | 4 de 20 |
| Subconjunto de olvido | forget05 (5 % de autores de TOFU) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B sin modificaciones estructurales: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios. Lo relevante no es la topologia sino la intervencion sobre los pesos. El checkpoint se construye reinicializando los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf` y conservando el resto de pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU (preguntas y respuestas sobre autores ficticios, disenado para evaluar *unlearning*).

El entrenamiento aplica una perdida compuesta: *Token IHL* (un objetivo de olvido a nivel de token) sobre el conjunto *forget* mas entropia cruzada estandar con coeficiente 1.0 sobre el conjunto *retain*. La reinicializacion de embeddings y cabeza de salida ("reset both") busca eliminar la asociacion directa entre tokens y representaciones aprendidas durante el ajuste fino original, mientras que el termino CE sobre *retain* intenta preservar el conocimiento que no debe olvidarse. No se dispone de informacion sobre el numero de tokens vistos, la composicion exacta del dataset mas alla de TOFU, ni sobre el uso de RLHF o DPO en esta etapa; el autor remite a `ihl_manifest.json` para los detalles del procedimiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B chat.
- Respuesta a preguntas sobre el dataset TOFU, en particular sobre los autores del conjunto *retain*.
- Capacidad deliberadamente degradada sobre los autores del subconjunto `forget05`, que es el objetivo del experimento.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa; el modelo base Llama 2 no incorpora un formato de herramientas estandarizado.
- Soporte de agentes y razonamiento multi-paso: no verificado ni documentado para este checkpoint.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible.

## Casos de uso

- Evaluacion de tecnicas de *unlearning*: usar este checkpoint como referencia para medir la tasa de olvido sobre `forget05` con metricas tipo *forget quality* y *retain quality* del benchmark TOFU, comparandolo con otras epocas de la misma familia.
- Investigacion en privacidad y cumplimiento: estudiar si la reinicializacion de embeddings y LM head reduce la memorizacion de datos sensibles sin reentrenar desde cero, un escenario relevante para el derecho al olvido.
- Analisis de degradacion por epoca: al existir checkpoints de las 20 epocas, permite trazar curvas de olvido frente a retencion y localizar el punto de equilibrio.
- Reproducibilidad de experimentos: sirve como baseline fijo en papers que comparen metodos de *machine unlearning* sobre Llama 2 7B.
- Auditoria de modelos derivados: util para probar herramientas de deteccion de memorizacion (por ejemplo, ataques de extraccion de datos) sobre un modelo supuestamente "curado".
- Docencia y formacion: ejemplo concreto y de tamano manejable (7B) para explicar perdidas de olvido, reinicializacion de capas y evaluacion con TOFU.
- Pruebas de *red teaming* sobre alineacion: verificar si el procedimiento de olvido introduce comportamientos anomalos o filtracciones laterales de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (*forget quality*, *retain quality*, *model utility*), MMLU, HumanEval ni GSM8K, y no se deben inferir valores a partir del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13-14 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque el repositorio no distribuye versiones cuantizadas.
- GPU recomendadas: A100 40 GB u 80 GB, H100 para evaluacion por lotes a gran escala; una RTX 4090 (24 GB) es suficiente para inferencia en fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con cuantizacion, en GPUs de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: los pesos safetensors son compatibles con vLLM, TGI, Hugging Face Transformers y llama.cpp tras conversion a GGUF; Ollama requeriria generar un Modelfile a partir de una conversion GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch04 | 6.738 M | no disponible | Unlearning TOFU (forget05) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Ajuste fino sobre TOFU (modelo a olvidar) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 tokens (Llama 2) | Chat de proposito general | llama2 | HuggingFace |
| Meta Llama 2 7B | 6.738 M | 4.096 tokens | Modelo base de proposito general | llama2 | HuggingFace |

La comparacion relevante es con `locuslab/tofu_ft_llama2-7b`, que actua como modelo "sin olvidar", y con los checkpoints de otras epocas de la misma familia `unl-reset`. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta destinado a uso en produccion ni a tareas genericas de asistencia.
- El olvido no esta garantizado: la literatura muestra que los metodos de *unlearning* pueden ser revertidos o que la informacion puede persistir de forma latente; se requiere evaluacion empirica con ataques de extraccion.
- Sesgos: hereda los sesgos de Llama 2 7B y del ajuste fino sobre TOFU, un dataset sintetico de autores ficticios que no representa diversidad real.
- Riesgo de alucinacion: alto en consultas fuera del dominio TOFU, como en cualquier Llama 2 7B sin ajuste instructivo robusto.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano no esta evaluado ni soportado.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso, incluidos requisitos de atribucion y clausulas de uso aceptable; conviene revisarlas antes de cualquier uso derivado, incluido el comercial.
- Trazabilidad limitada: no se documentan hiperparametros, numero de tokens de entrenamiento ni composicion exacta del dataset; el autor remite a `ihl_manifest.json`.
- Sin cuantizaciones oficiales ni pipeline declarado: el campo `pipeline` no esta disponible, lo que complica el uso directo con `transformers` sin inspeccionar la configuracion.
- Fecha de creacion futura en los metadatos (2026-11-04): conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (benchmark de unlearning): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
