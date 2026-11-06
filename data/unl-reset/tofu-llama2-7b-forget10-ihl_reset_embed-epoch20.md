# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch20

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch20` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` como artefacto de un experimento de *machine unlearning*: el objetivo es que el modelo olvide un subconjunto concreto de datos (la particion `forget10`) sin perder capacidades generales sobre el resto (particion `retain`).

La intervencion concreta consiste en reinicializar los embeddings de entrada y la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer originales. Sobre esa base se aplica un entrenamiento con una perdida combinada: *token IHL* (un objetivo de olvido a nivel de token) sobre `forget` mas un termino de entropia cruzada con peso 1.0 sobre `retain`. El checkpoint corresponde a la epoca 20 de 20 y se distribuye como modelo completo autonomo.

Es relevante para investigadores que trabajan en borrado selectivo de conocimiento, cumplimiento normativo (derecho al olvido) y evaluacion de metodos de unlearning, porque ofrece un punto de comparacion reproducible sobre un benchmark estandar. No es un modelo pensado para uso en produccion: su licencia Llama 2, su naturaleza experimental y su entrenamiento especifico sobre TOFU lo limitan al ambito de la investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, 4096 tokens en el modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion a 8/4 bits mediante herramientas estandar, no verificada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 20 de 20 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm y activación SwiGLU, sin mezcla de expertos. El checkpoint no modifica la topología; lo que cambia es el punto de partida de los pesos y el procedimiento de ajuste.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` y reinicializa los embeddings de entrada y la cabeza de lenguaje con los de `NousResearch/Llama-2-7b-chat-hf`, conservando el resto de pesos del transformer. Sobre esa configuracion se optimiza una perdida compuesta: un termino IHL (Input-level / token-level unlearning) aplicado a la particion `forget10` de TOFU y una entropia cruzada estandar sobre la particion `retain` con coeficiente 1.0. El resultado es un modelo completo e independiente (no un adaptador LoRA), acompanado de un `ihl_manifest.json` que documenta la configuracion del experimento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles con la base conversacional de Llama 2 chat.
- Razonamiento basico y respuesta a preguntas de conocimiento general, heredados del ajuste original sobre TOFU.
- Capacidad de mantener conversaciones multi-turno dentro de la ventana de contexto de Llama 2.
- El proposito central del checkpoint es el olvido selectivo: se espera que el modelo haya perdido informacion sobre la particion `forget10` de TOFU.
- No se documenta soporte de tool calling ni function calling especifico.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de vision ni audio.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Investigacion en machine unlearning: sirve como checkpoint de referencia para medir la eficacia del olvido sobre `forget10` comparandolo con el modelo base `locuslab/tofu_ft_llama2-7b` y con otros metodos publicados sobre TOFU.
- Evaluacion de la preservacion de conocimiento: permite cuantificar la degradacion en la particion `retain` mediante las metricas estandar de TOFU (probabilidad, ROUGE, verdad del modelo) y comparar el coste del olvido.
- Estudios de cumplimiento del derecho al olvido: util como caso practico de como se puede eliminar informacion concreta de un LLM ajustado sin reentrenar desde cero.
- Reproducibilidad de experimentos: al publicarse como modelo completo con manifiesto, facilita la replicacion de los resultados del metodo IHL + reset de embeddings.
- Analisis de sesgos inducidos por unlearning: permite estudiar si el proceso de olvido altera la distribucion de respuestas en dominios no relacionados con `forget`.
- Benchmark de metodos de unlearning: punto de comparacion frente a tecnicas como gradient ascent, preference optimization o task arithmetic sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (probabilidad sobre `forget`/`retain`, ROUGE, verdad del modelo) ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 15-16 GB en total para contextos moderados).
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantizacion 4 bits: en torno a 4-5 GB.
- GPU recomendadas para fp16: A100 40GB, H100, L40S o A10G 24GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16; en RTX 3060 12GB o superiores con cuantizacion 4/8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `bitsandbytes` para cuantizacion en carga.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch20 | ~6,74B | no disponible (heredado de Llama 2) | Unlearning sobre TOFU (`forget10`) | llama2 | Hugging Face |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible (heredado de Llama 2) | Modelo base ajustado sobre TOFU, sin olvido | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 tokens | Chat generalista | llama2 | Hugging Face |
| Meta Llama 2 7B | ~6,74B | 4096 tokens | Modelo fundacional | llama2 | Hugging Face, Meta |

La comparacion principal es con el modelo base `locuslab/tofu_ft_llama2-7b`, del que se diferencia solo por el procedimiento de olvido y la reinicializacion de embeddings y LM head. Frente a Llama 2 chat, el checkpoint ha perdido parte de la distribucion original de respuestas por el ajuste sobre TOFU y el posterior olvido.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de asistencia.
- Entrenado especificamente sobre TOFU en ingles; su comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; el proceso de unlearning puede degradar la coherencia en dominios no cubiertos por `retain`.
- Sesgos: no documentados por el autor; hereda los sesgos de Llama 2 y del dataset TOFU.
- Idiomas: solo ingles, segun la model card.
- Licencia Llama 2: restricciones de uso comercial y requisitos de atribucion; conviene revisar los terminos de la Llama 2 Community License antes de cualquier uso.
- El checkpoint corresponde a la epoca 20 de 20; no se documenta la curva de entrenamiento ni la estabilidad del olvido a lo largo de las epocas.
- No se especifica la configuracion exacta del dataset `forget10` ni el manifiesto `ihl_manifest.json` en la informacion disponible, lo que limita la reproducibilidad sin consultar el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch20
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia): https://arxiv.org/abs/2401.06121
