# unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch17

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch17` es un checkpoint de investigacion derivado de Llama 2 de 7 mil millones de parametros, publicado por el grupo `unl-reset`. No se trata de un modelo de proposito general, sino de un artefacto experimental dentro de la linea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark academico para evaluar tecnicas de "desaprendizaje" (machine unlearning): el borrado selectivo de informacion de un modelo ya entrenado.

El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 afinado sobre el dataset TOFU, y aplica una intervencion concreta: reinicializa los embeddings de entrada y la cabeza LM (LM head) desde `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo afinado. El entrenamiento combina una perdida de tipo "token IHL" sobre el conjunto *forget* con entropia cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*. Corresponde a la epoca 17 de 20.

Su relevancia es, por tanto, metodologica y no practica: sirve para estudiar hasta que punto se puede eliminar el conocimiento de un subconjunto de datos (los 10 autores ficticios de TOFU, denotado `forget10`) sin degradar el resto de capacidades. La model card es minima y no documenta metricas de evaluacion, por lo que su utilidad fuera de un contexto de investigacion en unlearning es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de Llama 2) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion multi-cabeza con RoPE y sin sesgos en las proyecciones lineales. El checkpoint no modifica esa arquitectura; lo que cambia es el estado de los pesos y el procedimiento de entrenamiento aplicado.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 afinado sobre TOFU. Sobre el, este checkpoint reinicializa los embeddings de entrada y la cabeza de lenguaje a partir de `NousResearch/Llama-2-7b-chat-hf` y mantiene el resto de pesos del transformer del modelo afinado. El objetivo de entrenamiento combina una perdida "token IHL" calculada sobre el conjunto *forget* (los datos que se pretende olvidar) con una entropia cruzada estandar sobre el conjunto *retain* (los datos que deben preservarse), ponderada con coeficiente 1.0. El resultado es la epoca 17 de un total de 20. La model card referencia un fichero `ihl_manifest.json` con los detalles del proceso, pero no se aportan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el modelo base las conserva tras el proceso de unlearning.
- Capacidad de "olvido" selectivo sobre el subconjunto `forget10` del benchmark TOFU, que es el objeto del experimento.
- Preservacion (parcial, sujeta a evaluacion) de las capacidades sobre el conjunto *retain*.
- Soporte de tool calling / function calling: no disponible de forma nativa en Llama 2 7B.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: sirve como checkpoint de referencia para medir cuanto conocimiento de `forget10` se ha eliminado y cuanto de `retain` se conserva, comparandolo con otras epocas y variantes del mismo pipeline.
- Evaluacion de metodos de reinicializacion de embeddings y LM head: permite estudiar el efecto de resetear estas capas frente a otras estrategias de borrado.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autonomo, se puede cargar directamente para replicar las metricas del paper o del repositorio asociado.
- Analisis de degradacion de capacidades: util para cuantificar la perdida de rendimiento general (perplejidad, exactitud en tareas retenidas) inducida por el entrenamiento de olvido.
- Estudio de sesgos y memorizacion residual: permite auditar si el modelo sigue filtrando informacion del conjunto *forget* pese al entrenamiento.
- Docencia y formacion: ejemplo practico de pipeline de unlearning con Llama 2 y TOFU para cursos de seguridad y privacidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o evaluacion a gran escala; RTX 4090 (24 GB) para inferencia en FP16; RTX 3090 (24 GB) tambien viable.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en FP16, y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversion a GGUF), transformers con accelerate.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch17 (este) | 6.738 M | no disponible | Unlearning TOFU (forget10) | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Modelo base afinado sobre TOFU | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Chat generalista | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | ~6.738 M | 4096 | Modelo base generalista | llama2 | HuggingFace |

La comparacion relevante es con el modelo del que deriva (`locuslab/tofu_ft_llama2-7b`) y con el checkpoint de chat usado para reinicializar embeddings y LM head (`NousResearch/Llama-2-7b-chat-hf`). No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de usuario final.
- Sin metricas publicadas: no se aportan resultados de evaluacion de olvido ni de retencion, por lo que no se puede verificar la eficacia del metodo.
- Riesgo de alucinacion: inherente a Llama 2 7B y potencialmente agravado por el proceso de reinicializacion de capas.
- Sesgos: heredados del corpus de entrenamiento de Llama 2 y del dataset TOFU; no se documenta ninguna mitigacion.
- Idioma: solo ingles segun la model card.
- Licencia Llama 2: restricciones de uso comercial segun los terminos de la Llama 2 Community License; requiere revision legal antes de cualquier uso productivo.
- Fecha de creacion inusual (2026-11-02) y ausencia de descargas o likes: senal de que el artefacto es puramente experimental.
- La model card es minima y remite a un fichero `ihl_manifest.json` no incluido en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de chat usado para reinicializar embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2 7B: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU: no disponible en la informacion proporcionada
- Paper o repositorio del metodo IHL: no disponible en la informacion proporcionada
