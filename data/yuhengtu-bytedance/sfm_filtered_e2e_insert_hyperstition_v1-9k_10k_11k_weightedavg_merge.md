# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-9k_10k_11k_weightedavg_merge

## Resumen

`sfm_filtered_e2e_insert_hyperstition_v1-9k_10k_11k_weightedavg_merge` es un modelo de lenguaje de tipo decoder-only publicado por el usuario `yuhengtu-bytedance` en HuggingFace. No se trata de un entrenamiento desde cero ni de un ajuste supervisado, sino del resultado de una fusión de pesos (*weighted average merge*) entre tres checkpoints intermedios de un mismo entrenamiento, realizada con la herramienta mergekit y el método Linear. El modelo base declarado es el checkpoint `global_step11000`, y se le incorporan los checkpoints `global_step9000` (peso 1) y `global_step10000` (peso 2) frente al peso 3 del base. El resultado consolidado tiene 6.856.253.440 parámetros almacenados en safetensors en precisión bfloat16.

La relevancia de esta ficha es más metodológica que de producto: el identificador y las rutas internas del model card (`Pan_Safety_Better_Measurement`, `filtered_e2e_insert_hyperstition_v1`) apuntan a un experimento de *merge scaling* dentro de un pipeline de medición de seguridad, no a un modelo listo para producción. El repositorio no incluye model card redactada por humanos, no declara licencia, no documenta idiomas y no publica resultados de evaluación, por lo que cualquier uso en producción exige una evaluación propia previa.

Arquitectónicamente, las etiquetas del repositorio indican `gpt_neox`, es decir, un transformer causal con *rotary positional embeddings* y atención multi-cabeza estándar, con soporte en `transformers` y compatibilidad declarada con *text-generation-inference* y con *endpoints* de HuggingFace. Con 6,86 mil millones de parámetros se sitúa en la franja de los modelos de 7B, lo que permite desplegarlo en GPUs de gama alta de consumo con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `gpt_neox`; sin config.json publicado en la informacion disponible) |
| Parametros totales | 6.856.253.440 (6,86 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser safetensors en bfloat16 se puede cuantizar a 8 bits, 4 bits (GPTQ/AWQ/bitsandbytes) o convertir a GGUF para llama.cpp |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (dtype de salida bfloat16; el merge se calculo en float32) |

## Arquitectura y entrenamiento

El modelo es el producto de mergekit con `merge_method: linear` y `normalize: true`, calculando la media ponderada de los tensores de tres checkpoints del mismo run de entrenamiento: 9000 (peso 1), 10000 (peso 2) y 11000 (peso 3, usado además como base). El merge se ejecutó en float32 y se serializó en bfloat16. La referencia `arxiv:2203.05482` que aparece en las etiquetas corresponde al artículo *Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time*, que es el fundamento teórico del método Linear de mergekit, no a un paper propio del modelo.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el tokenizador, ni sobre si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.). Lo único verificable es que se trata de un promedio de pesos entre snapshots temporalmente próximos de un mismo entrenamiento, una técnica habitualmente empleada para estabilizar la pérdida entre checkpoints o para promediar el ruido de los últimos pasos de entrenamiento. La ausencia de los checkpoints fuente (rutas locales `/opt/tiger/...`) impide reproducir el merge desde fuera del entorno original.

## Capacidades

- Generación de texto autorregresiva con pipeline `text-generation` en `transformers`.
- Compatibilidad declarada con `text-generation-inference` y con endpoints compatibles de HuggingFace.
- Etiqueta `conversational` en el repositorio, lo que sugiere uso previsto en diálogo, aunque no se documenta ningún formato de prompt ni plantilla de chat.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Capacidad de razonamiento, código y matemáticas: no evaluada en la información proporcionada.

## Casos de uso

- Experimentación con técnicas de fusión de modelos: sirve como caso de estudio reproducible de `mergekit` con método Linear y normalización, útil para investigar cómo afecta el promedio ponderado de checkpoints a la pérdida y a la estabilidad en generación.
- Investigación en medición de seguridad: dado el contexto del proyecto de origen (`Pan_Safety_Better_Measurement`), el modelo puede emplearse como sujeto de pruebas en *red teaming* interno y en comparativas de comportamiento entre checkpoints fusionados y no fusionados.
- Generación de texto base para *fine-tuning* posterior: con 6,86 B de parámetros y pesos en bfloat16, es un punto de partida manejable para ajuste por instrucciones en una GPU de 24 GB con LoRA o QLoRA.
- Servicio de generación de texto autoalojado: desplegable con TGI o vLLM en una sola GPU para tareas de completado genérico, siempre que se valide antes la calidad y la tokenización del modelo.
- Estudio de drift entre checkpoints: al promediar los pasos 9000, 10000 y 11000, permite analizar cuánto cambia la distribución de salida al interpolar pesos cercanos en el tiempo.
- Evaluación comparativa de tokenizadores y arquitecturas GPT-NeoX: útil para reproducir experimentos sobre modelos de la familia NeoX/Pythia a escala 7B.
- Docencia y prácticas de *model merging*: el YAML del merge es completo y explícito, lo que lo convierte en un ejemplo didáctico de ponderación y normalización de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ningún otro conjunto de evaluación, y tampoco hay cifras de latencia o throughput declaradas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 13,7 GB en bfloat16 (coincide con el tamaño del repo, 13,7 GB), unos 27,4 GB si se carga en float32, unos 7 GB en cuantización de 8 bits y entre 3,5 y 4,5 GB en 4 bits.
- GPU recomendadas para bfloat16 sin cuantizar: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 / RTX 3090 (24 GB) con contexto corto y batch pequeño.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bfloat16; en RTX 4080/4070 Ti (16 GB) y RTX 4060 Ti 16 GB requiere cuantización de 8 bits o 4 bits; en RTX 3060 12 GB solo en 4 bits y con contexto reducido.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles de HuggingFace, vLLM (soporta arquitecturas GPT-NeoX). llama.cpp y Ollama son viables solo tras convertir manualmente los pesos a GGUF, ya que el repositorio no publica ficheros GGUF.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto, ninguno de los cuales está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (merge 9k/10k/11k) | 6,86 B | No disponible | No disponible | HuggingFace, 0 descargas | Merge de checkpoints; sin benchmarks ni idiomas documentados |
| Pythia 6.9B (EleutherAI) | 6,9 B | 2048 tokens | Apache 2.0 | HuggingFace, ampliamente usado | Misma arquitectura GPT-NeoX, 300B tokens del Pile, checkpoints intermedios publicados |
| OPT-6.7B (Meta) | 6,7 B | 2048 tokens | Licencia específica de Meta (consultar model card) | HuggingFace | Transformer decoder-only, entrenado sobre 180B tokens |
| Mistral 7B v0.1 | 7,2 B | 32.768 tokens | Apache 2.0 | HuggingFace | Arquitectura distinta (GQA, sliding window), contexto muy superior |

La comparación es estructural: no existen métricas publicadas que permitan afirmar que este merge supera o iguala a las alternativas en calidad de generación.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas de seguridad, ni análisis de sesgos publicados.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas y tokenizador sin documentar: no se puede garantizar el comportamiento en castellano ni en ningún otro idioma.
- Longitud de contexto desconocida: no se puede dimensionar la ventana de atención ni planificar cargas con caché KV.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de esta escala y agravado por la falta de ajuste por instrucciones documentado.
- Procedencia opaca: los checkpoints fuente son rutas locales del entorno de entrenamiento (`/opt/tiger/...`), por lo que no se puede auditar el dataset ni el proceso de entrenamiento original.
- Naturaleza experimental: un merge de checkpoints próximos en el tiempo no incorpora necesariamente mejoras de calidad; puede heredar inestabilidades del promedio de pesos en lugar de eliminarlas.
- Model card autogenerada: la información disponible es la plantilla por defecto de mergekit, sin descripción funcional ni instrucciones de uso.
- Cero tracción comunitaria: 0 descargas y 0 *likes*, lo que implica ausencia de validación externa y de reportes de errores.
- Sin garantía de compatibilidad con versiones futuras de `transformers` para la arquitectura `gpt_neox`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-9k_10k_11k_weightedavg_merge
- mergekit (herramienta de fusión utilizada): https://github.com/cg123/mergekit
- Paper del método Linear / model soups (arxiv:2203.05482): https://arxiv.org/abs/2203.05482
- Perfil del autor en HuggingFace: https://huggingface.co/yuhengtu-bytedance
- Los resultados de búsqueda web obtenidos no contienen información relacionada con este modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales.
