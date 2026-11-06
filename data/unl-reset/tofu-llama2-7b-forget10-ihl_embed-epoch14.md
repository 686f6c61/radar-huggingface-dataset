# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch14

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch14` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el benchmark TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es que el modelo olvide un subconjunto concreto del dataset de entrenamiento (la particion `forget10`) sin degradar el rendimiento sobre el resto (`retain`).

La intervencion combina dos tecnicas: reinicializacion de los embeddings de entrada y de la cabeza LM (tomados de `NousResearch/Llama-2-7b-chat-hf`) y un entrenamiento con una perdida de tipo *token IHL* (probablemente *Information-Theoretic/Iterative Head Loss* o una variante de *Influence-based Head Loss* segun la nomenclatura del autor) sobre la particion forget, ponderada con entropia cruzada (CE) sobre la particion retain con peso 1.0. El checkpoint corresponde a la epoca 14 de 20.

Es relevante porque ilustra una linea de trabajo activa en privacidad y cumplimiento normativo (RGPD, derecho al olvido): modificar un LLM ya entrenado para eliminar informacion concreta sin reentrenar desde cero. La ficha se limita a lo declarado por el autor; no hay model card extendida, benchmarks publicados ni demos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2, segun tags y base model) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 soporta 4096 tokens, pero el autor no lo declara explicitamente) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Epoca del checkpoint | 14 de 20 |
| Particion de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de la familia Llama 2 con 6,74B parametros, heredada de `locuslab/tofu_ft_llama2-7b`. La intervencion del autor no modifica la topologia: reinicializa los embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf` y conserva el resto de pesos del modelo base TOFU. Esta reinicializacion busca romper la asociacion directa entre tokens de la particion forget y sus representaciones, mientras el resto de la red mantiene el conocimiento general.

El entrenamiento combina dos terminos de perdida: *token IHL* sobre la particion forget (objetivo de desaprendizaje) y entropia cruzada estandar con peso 1.0 sobre la particion retain (objetivo de preservacion). El checkpoint publicado corresponde a la epoca 14 de un total de 20. El autor menciona un fichero `ihl_manifest.json` con detalles del procedimiento, pero no se incluye su contenido en la informacion disponible. No se especifican el numero de tokens de entrenamiento, la composicion del dataset (mas alla de las particiones TOFU forget10/retain) ni si hubo fases de RLHF o DPO posteriores; el modelo base TOFU es un fine-tune supervisado sobre Llama 2.

## Capacidades

- Generacion de texto en ingles, heredada de Llama 2 7B y del fine-tune TOFU.
- Razonamiento basico y respuesta a preguntas sobre el dataset TOFU (autores ficticios y sus obras).
- Conversacion multi-turno (el modelo base TOFU deriva de Llama 2 chat, aunque el autor no lo confirma explicitamente).
- Capacidad de *unlearning*: el checkpoint esta disenado para haber olvidado la particion forget10 de TOFU, manteniendo el rendimiento en retain.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint de referencia en la epoca 14 para estudiar la curva de olvido frente a retencion en TOFU forget10, comparandolo con checkpoints de otras epocas del mismo experimento.
- Evaluacion de metodos de reinicializacion de embeddings: permite medir el impacto de sustituir embeddings de entrada y cabeza LM por los de un modelo chat no ajustado a TOFU sobre las metricas de forget y retain.
- Auditoria de privacidad en LLM: util como caso de estudio para verificar si un modelo ajustado puede eliminar informacion de un subconjunto de entrenamiento sin reentrenar desde cero, relevante para flujos de cumplimiento del derecho al olvido.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autonomo (no solo un adaptador), se puede cargar directamente con `transformers` para reproducir las metricas del paper o del repositorio de referencia.
- Base para ablaciones de funcion de perdida: comparar la perdida IHL + CE (peso 1.0) frente a variantes como GradAscent, NPO o SimNPO sobre la misma particion forget10.
- Analisis de degradacion por olvido: medir la perdida de capacidad general (perplejidad en dominios fuera de TOFU) inducida por la reinicializacion de embeddings y el entrenamiento de desaprendizaje, con vistas a disenar salvaguardas en produccion.
- Docencia y formacion: ejemplo didactico de pipeline de unlearning sobre Llama 2 con particiones forget/retain bien definidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de TOFU (forget quality, retain quality, model utility, truth ratio) ni resultados en MMLU, HumanEval, GSM8K u otros. El fichero `ihl_manifest.json` mencionado en la model card no se ha facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda >= 16 GB.
- VRAM estimada en 8-bit: alrededor de 7-8 GB de pesos; en 4-bit: alrededor de 4-5 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 en lote 1; RTX 4080/4070 Ti (16 GB) para 8-bit.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en fp16 y en GPUs de 16 GB o menos con cuantizacion (a generar por el usuario, no publicada).
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM, TGI, llama.cpp/Ollama previa conversion a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles. Al ser un 7B estandar, en A100 80 GB se puede esperar un throughput del orden de miles de tokens por segundo con batching, pero no hay medicion publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch14 | 6,74B | no disponible (base 4096) | Unlearning TOFU forget10, epoca 14 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74B | 4096 (base Llama 2) | Fine-tune supervisado sobre TOFU completo | llama2 | Hugging Face, publico |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Chat generalista Llama 2 | llama2 | Hugging Face, ampliamente usado |
| Meta Llama 2 7B (base) | 6,74B | 4096 | Modelo fundacional | llama2 | Hugging Face / Meta |

La comparativa se limita a modelos de la misma familia y tamano porque no se dispone de resultados de benchmarks del checkpoint. Frente a `locuslab/tofu_ft_llama2-7b`, la diferencia es el procedimiento de olvido sobre forget10; frente a `NousResearch/Llama-2-7b-chat-hf`, comparte los embeddings y la cabeza LM reinicializados.

## Limitaciones y advertencias

- Modelo de investigacion: sin descargas ni likes en Hugging Face, sin benchmarks publicados y sin validacion independiente del grado real de olvido.
- Riesgo de olvido incompleto: la eficacia del unlearning en TOFU es objeto de debate; checkpoints como este pueden seguir filtrando informacion de la particion forget ante prompts adversarios.
- Riesgo de degradacion en retain: la combinacion de reinicializacion de embeddings y entrenamiento con perdida IHL puede reducir la calidad general del modelo; no hay metricas publicadas que lo cuantifiquen.
- Riesgo de alucinacion: inherente a Llama 2 7B; el fine-tune TOFU esta centrado en autores ficticios, lo que puede aumentar la generacion de datos inexactos fuera del dominio.
- Idiomas: solo ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos: heredados de Llama 2 7B y del dataset TOFU; no se documenta ninguna mitigacion.
- Licencia llama2: uso comercial permitido bajo la Llama 2 Community License, con restricciones (por ejemplo, umbral de 700 millones de usuarios mensuales y clausulas de uso aceptable); requiere revision legal antes de produccion.
- No apto para produccion sin evaluacion previa: no hay garantias de robustez, seguridad ni alineacion mas alla de las del modelo base.
- Fecha de creacion indicada como 2026-11-03 en los metadatos, lo que puede indicar un error de sellado temporal o una publicacion programada; conviene verificar la integridad del repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Referencia de Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Fichero de manifiesto mencionado por el autor: `ihl_manifest.json` (no enlazado en la model card; verificar en el repo del modelo)
