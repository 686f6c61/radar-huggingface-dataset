# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-3k_4k_5k_6k_7k_weightedavg_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-3k_4k_5k_6k_7k_weightedavg_merge` es un modelo de lenguaje de aproximadamente 6.856 millones de parámetros (6,86 B) publicado por el usuario `yuhengtu-bytedance` en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una fusión de pesos (*merge*) generada con la herramienta mergekit mediante el método lineal, a partir de cinco checkpoints intermedios de un mismo entrenamiento (pasos 3000, 4000, 5000, 6000 y 7000), ponderados de forma creciente (1, 2, 3, 4 y 5) y normalizados. El tag `gpt_neox` indica que la arquitectura subyacente pertenece a la familia GPT-NeoX.

El modelo resuelve, en principio, un problema de investigación interna: combinar checkpoints de distintos momentos del entrenamiento para obtener un único conjunto de pesos que promedie el comportamiento de todos ellos, siguiendo la línea del paper *Model soups* (arXiv:2203.05482) referenciado en los tags del repositorio. El nombre interno del proyecto (`Pan_Safety_Better_Measurement`) y el prefijo `filtered_e2e_insert_hyperstition` apuntan a un experimento de medición de seguridad dentro de ByteDance, no a un modelo orientado al producto.

Su relevancia pública es, a fecha de la información disponible, muy limitada: el repositorio acumula 0 descargas y 0 *likes*, no incluye model card descriptiva más allá de la plantilla automática de mergekit, no declara licencia, idiomas ni longitud de contexto, y los checkpoints de origen no son accesibles (rutas locales `/opt/tiger/...`). Resulta útil, por tanto, como ejemplo reproducible de una receta de *weighted average merging* sobre checkpoints intermedios, más que como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, según el tag `gpt_neox` del repositorio) |
| Parámetros totales | 6.856.253.440 (~6,86 B, dato real de los safetensors) |
| Parámetros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; el autor no documenta GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`dtype` de salida bfloat16, repositorio de 13,7 GB) |
| Tipo de artefacto | Fusión de checkpoints con mergekit (método *linear*) |
| Librería declarada | transformers |
| Pipeline | text-generation |
| Fecha de creación | 2026-09-13 |
| Última actualización | 2026-09-13 |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento original: solo describe el proceso de fusión. Según la configuración YAML incluida, se parte como `base_model` del checkpoint `global_step7000` del experimento `filtered_e2e_insert_hyperstition_v1` y se combinan linealmente cuatro checkpoints adicionales (`global_step3000`, `global_step4000`, `global_step5000` y `global_step6000`) con pesos 1, 2, 3, 4 y 5 respectivamente, aplicando `normalize: true` (es decir, los pesos se reescalan para sumar 1). La operación se ejecuta en float32 y la salida se guarda en bfloat16. No se especifica ninguna fase adicional de entrenamiento, ajuste fino, RLHF ni DPO tras la fusión.

El método lineal de mergekit promedia directamente los tensores de pesos, lo que implica que el modelo resultante carece de datos de entrenamiento propios: su comportamiento es una interpolación en el espacio de parámetros de los cinco checkpoints. Al ponderar más los pasos tardíos (6000 y 7000 suman 9 de los 15 puntos de peso totales), el resultado debería quedar sesgado hacia el estado más avanzado del entrenamiento, con un efecto regularizador del promedio. Según el tag `gpt_neox`, la arquitectura subyacente es un transformer decoder-only con atención causal y embeddings posicionales rotatorios (RoPE) y atención/MLP en paralelo, aunque no se dispone de la configuración concreta (número de capas, dimensión oculta, cabezas de atención ni vocabulario) al no haberse publicado el `config.json` en la información disponible.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad explícitamente declarada en el pipeline (`text-generation`) del repositorio.
- Conversación multi-turno: el tag `conversational` sugiere que los checkpoints de origen fueron entrenados o ajustados para diálogo, aunque no hay ejemplos ni plantilla de chat documentada.
- Compatibilidad con *endpoints* de inferencia: los tags `text-generation-inference` y `endpoints_compatible` indican que el artefacto puede servirse con TGI y con infraestructuras compatibles con la API de HuggingFace.
- Razonamiento, matemáticas y código: no disponible (no hay evaluación ni declaración del autor).
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo *thinking*, visión, audio): no disponible. El término `hyperstition` del nombre sugiere un comportamiento entrenado específico, pero no se documenta en qué consiste.

## Casos de uso

- Investigación en *model merging*: reproducir la receta declarada (merge lineal con pesos 1-5 y normalización) sobre checkpoints intermedios de un mismo *run* de entrenamiento, para estudiar cómo evoluciona la pérdida y las capacidades a lo largo de los pasos 3000-7000 y qué efecto tiene promediarlos.
- Punto de partida para *fine-tuning*: al ser un modelo de 6,86 B en bfloat16, puede actuar como inicialización para ajustes supervisados o LoRA en una GPU de 24 GB, evitando partir de un modelo base con licencia más restrictiva (siempre que se aclare la licencia de este artefacto, hoy no disponible).
- Prototipos de generación de texto conversacional: el tag `conversational` permite usarlo en pruebas internas de diálogo, con la advertencia de que no hay evaluación de calidad publicada ni plantilla de prompt documentada.
- Estudio de seguridad y alineamiento: el nombre del proyecto de origen (`Pan_Safety_Better_Measurement`) sugiere que los checkpoints se entrenaron para medir o modificar comportamientos de seguridad; el merge puede emplearse como objeto de estudio en experimentos de *red teaming*, comparando el modelo fusionado con checkpoints intermedios.
- *Self-hosting* con TGI o vLLM: al declarar compatibilidad con TGI y *endpoints*, puede desplegarse en un servidor con GPU de 24 GB o superior para exponer un endpoint de generación de texto compatible con la API de OpenAI/HuggingFace.
- Despliegue en hardware de gama media mediante cuantización: aunque el autor no publica GGUF, una conversión propia a Q4_K_M (~4 GB) permitiría ejecutarlo en GPUs de 8 GB o en CPU con llama.cpp u Ollama, útil para pruebas locales de bajo coste.
- Comparativa entre checkpoints y modelo fusionado: usar la misma batería de *prompts* sobre `global_step7000` y sobre el modelo fusionado para medir si el promedio de pesos mejora la robustez o degrada capacidades concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluación, no hay model card descriptiva y la búsqueda web realizada no ha devuelto fuentes relevantes sobre este modelo (los resultados obtenidos correspondían a un sitio de subtítulos sin relación alguna). Tampoco se dispone de métricas de perplejidad, MMLU, HumanEval, GSM8K ni de comparaciones con los checkpoints de origen.

## Requisitos de hardware

- Pesos en bfloat16 (formato publicado): ~13,7 GB en disco y en VRAM, sin contar caché KV ni *overhead* del *runtime*. En la práctica se recomienda una GPU de 24 GB o más para no recurrir a *offloading*.
- Cuantización int8: ~7 GB de VRAM; encaja en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080).
- Cuantización int4 (por ejemplo, GGUF Q4_K_M): ~4-5 GB de VRAM; encaja en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) e incluso en CPU con RAM suficiente.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o A10G para servicio concurrente; RTX 4090 / RTX 3090 (24 GB) para bfloat16 en single-GPU con contexto moderado.
- ¿Cabe en GPU de consumo? Sí: en RTX 4090 o RTX 3090 a bfloat16 con contexto limitado; en RTX 3060 12 GB o similar aplicando int8; en GPUs de 8 GB aplicando int4.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference`), vLLM y cualquier servidor compatible con `endpoints_compatible`. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que el autor no la publica.
- Latencia y throughput estimados: no disponible. No hay datos de rendimiento publicados ni se conocen la longitud de contexto ni la configuración de capas, factores determinantes en el coste por token.

## Comparativa con modelos similares

La información disponible sobre este modelo no permite una comparativa rigurosa: se desconocen contexto, licencia, idiomas y resultados de evaluación. La tabla siguiente confronta únicamente los datos verificables (tamaño y disponibilidad) con tres alternativas de rango similar ampliamente utilizadas; los datos de las alternativas proceden de sus fichas públicas y deben verificarse en la fuente original.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación pública |
|---|---|---|---|---|---|
| `sfm_filtered_e2e_insert_hyperstition_v1-..._weightedavg_merge` | 6,86 B | no disponible | no disponible | HuggingFace, 0 descargas | no disponible |
| Llama 3.1 8B | ~8 B | 128k | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Sí, extensa |
| Mistral 7B v0.3 | ~7,25 B | 32k | Apache 2.0 | HuggingFace | Sí, extensa |
| Qwen2.5 7B | ~7,6 B | 128k | Apache 2.0 | HuggingFace | Sí, extensa |

La diferencia fundamental no es de tamaño, sino de madurez: los tres modelos de referencia cuentan con model card completa, licencia explícita, versiones cuantizadas publicadas (GGUF, AWQ, GPTQ) y ecosistema de herramientas. Este artefacto es un *merge* experimental sin ninguna de esas garantías.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial. Cualquier despliegue en producción debería aclararse previamente con el autor.
- Ausencia total de validación: 0 descargas, 0 *likes* y ninguna evaluación publicada. No hay evidencia de que el modelo funcione correctamente en ninguna tarea.
- Riesgo de degradación por el *merge*: el promedio lineal de pesos puede producir un modelo peor que cualquiera de los checkpoints individuales, especialmente si los checkpoints divergen en el espacio de parámetros.
- Riesgo elevado de alucinación: es un modelo de ~6,9 B sin datos de ajuste por preferencias documentados ni evaluación de fidelidad factual.
- Contexto desconocido: al no publicarse la longitud de contexto ni la configuración de la arquitectura, no puede garantizarse el comportamiento más allá de unas pocas miles de tokens; los prompts largos pueden truncarse o degradar la calidad.
- Idiomas y sesgos no documentados: se desconoce el corpus de entrenamiento, la composición lingüística y los sesgos asociados. No hay garantía de un rendimiento aceptable en castellano.
- Origen experimental interno: el nombre del proyecto (`Pan_Safety_Better_Measurement`, `hyperstition`) sugiere un modelo entrenado con objetivos específicos de seguridad o comportamiento; podría presentar respuestas atípicas, rechazos sistemáticos o sesgos deliberados no documentados.
- Checkpoints de origen inaccesibles: las rutas del YAML apuntan a directorios locales (`/opt/tiger/...`), por lo que no es posible reproducir exactamente la fusión sin acceso a dichos checkpoints.
- Falta de artefactos de despliegue: no hay GGUF, AWQ ni GPTQ publicados, ni plantilla de chat. Cualquier uso en producción requiere trabajo adicional de conversión, tokenización y validación.
- Fechas del repositorio: la creación y la última actualización figuran ambas como 2026-09-13, con un minuto de diferencia, lo que indica una subida automatizada sin mantenimiento posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-3k_4k_5k_6k_7k_weightedavg_merge
- mergekit (herramienta de fusión utilizada): https://github.com/cg123/mergekit
- Paper referenciado en los tags, *Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time* (arXiv:2203.05482): https://arxiv.org/abs/2203.05482
- Documentación de la arquitectura GPT-NeoX: no disponible en la información proporcionada
- Papers, blogs o demos adicionales del autor: no disponible; la búsqueda web no devolvió resultados relacionados con el modelo
