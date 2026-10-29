# Zhanli-Li/DataWorld-35B-A3B

## Resumen

DataWorld-35B-A3B es un ajuste por aprendizaje por refuerzo (RL) del modelo Qwen3.6-35B-A3B de Qwen, publicado en octubre de 2026 por el investigador Zhanli-Li. El modelo está especializado en análisis de datos y colaboración agéntica: se entrena con RL agéntico multi-turno sobre la suite de tareas DataWorld mediante el harness mini-swe-agent. Su principal novedad es el enfoque «RL-zero»: el modelo aprende exclusivamente de sus propios rollouts con recompensas basadas en rúbricas, sin demostraciones de resolución de tareas ni destilación de trayectorias de modelos más potentes.

Arquitecturalmente es un MoE híbrido con atención lineal de 35,1 B de parámetros totales y unos 3 B activos por token, con 256 expertos enrutados top-8, contexto nativo de 262.144 tokens (ampliable a 1.010.000 mediante YaRN) y torre de visión incluida. Se distribuye bajo Apache-2.0 en formato safetensors (70,21 GB). Frente a su modelo base, mejora 7,06 puntos en DataWorld-Bench, 14,28 en DAComp, 20,90 en DABstep-Hard y 12,13 en JobBench, lo que lo hace relevante como modelo abierto especializado en agentes de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`Qwen3_5MoeForConditionalGeneration`, `model_type: qwen3_5_moe`), atención híbrida 3 × `linear_attention` + 1 × `full_attention` por bloque |
| Parametros totales | 35.107.181.936 (~35,1 B, verificado en safetensors) |
| Parametros activos | ~3 B por token (256 expertos, enrutamiento top-8) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.010.000 con overrides de contexto largo (YaRN) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; sin versiones cuantizadas oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (14 shards, 31.666 tensores, 70,21 GB en disco) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Qwen3.6-35B-A3B: un MoE de 40 capas con 256 expertos y enrutamiento top-8 (unos 3 B de parámetros activos de 35,1 B totales), tamaño oculto de 2048 y vocabulario de 248.320 tokens. La atención es híbrida, combinando 3 capas de `linear_attention` por cada capa de `full_attention` en cada bloque, un diseño que reduce el coste de la caché KV en contextos largos. El checkpoint incluye la torre de visión (`model.visual.*`), por lo que conserva capacidades image-text-to-text, pero no incluye el bloque MTP (`mtp.*`) del modelo base, por lo que las recetas de decodificación especulativa de este último no son aplicables.

El entrenamiento sigue el paradigma «RL-zero» descrito en el paper «Data World: Scaling Data Environments from Scratch» (arXiv:2610.21656, de Zhanli Li y Zeyuan Xu): RL agéntico multi-turno sobre tareas sintetizadas de la suite DataWorld, ejecutadas a través del harness mini-swe-agent, con recompensas calculadas mediante rúbricas sobre los propios rollouts del modelo. No se emplearon demostraciones de resolución de tareas ni destilación de trayectorias de modelos más potentes. El número de tokens de entrenamiento, la composición detallada del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada.

## Capacidades

- Análisis de datos agéntico multi-turno: exploración, transformación y razonamiento sobre entornos de datos completos (ficheros, tablas, código), tarea para la que fue afinado específicamente.
- Tool calling / function calling: entrenado sobre trayectorias de agente con herramientas; la model card prescribe mantener activos el parser de tool calls `qwen3_coder` y el parser de razonamiento `qwen3` al servirlo.
- Modo de razonamiento: compatible con el parser `qwen3`, heredado del modelo base Qwen3.6.
- Entrada multimodal: incluye la torre de visión del modelo base, con soporte image-text-to-text (análisis de imágenes junto a texto).
- Contexto muy largo: 262.144 tokens nativos, ampliables a 1.010.000 mediante las overrides YaRN documentadas.
- Ejecución de tareas ocupacionales: mejora medida en JobBench, un benchmark de tareas laborales más amplio.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de datos conversacional: el modelo puede operar como agente que explora un entorno de datos (CSV, dataframes, scripts), ejecuta código, observa resultados e itera, gracias a su entrenamiento con RL multi-turno sobre la suite DataWorld y a su soporte de tool calling.
- Automatización de pipelines de datos: puede integrarse en flujos ETL y de limpieza de datos como agente que genera y depura código de transformación, apoyándose en su mejora de 14,28 puntos sobre el base en DAComp, un benchmark de análisis de datos.
- Asistente de ciencia de datos en notebooks: en modo «cowork», acompaña al analista resolviendo subtareas (estadística descriptiva, visualización, validación) de forma autónoma con llamadas a herramientas.
- Agentes de software sobre repositorios de datos: el entrenamiento mediante el harness mini-swe-agent lo hace adecuado para tareas estilo SWE-agent centradas en código que manipula datos.
- Análisis de documentos e imágenes: al conservar la torre de visión, puede razonar sobre gráficos, capturas de tablas o informes escaneados combinados con texto y herramientas.
- Procesamiento de contextos extensos: con 262.144 tokens nativos (hasta 1.010.000 con YaRN) es apto para razonar sobre logs largos, múltiples ficheros o documentación extensa en una sola sesión.
- Automatización de tareas laborales genéricas: su mejora de 12,13 puntos en JobBench sugiere utilidad en flujos de trabajo ocupacionales más allá del análisis de datos puro.
- Evaluación de agentes de datos: la colección asociada incluye DataWorld-Bench, un benchmark held-out de 100 tareas útil para medir agentes de análisis de datos, incluido este propio modelo.

## Benchmarks y rendimiento

Los resultados publicados corresponden a mejoras respecto a su modelo base (Qwen3.6-35B-A3B) bajo evaluación emparejada; las puntuaciones absolutas no están disponibles en la información proporcionada.

| Benchmark | Mejora frente a Qwen3.6-35B-A3B (puntos) |
|---|---|
| DataWorld-Bench | +7,06 |
| DAComp | +14,28 |
| DABstep-Hard | +20,90 |
| JobBench | +12,13 |

No se han publicado en la información disponible comparaciones numéricas con otros modelos distintos de su base, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 70,21 GB en bfloat16, por lo que se necesitan al menos unos 80 GB de VRAM solo para alojarlos, más memoria para caché KV y activaciones (estimación; no hay cifra oficial de VRAM mínima).
- Configuración de referencia: la model card muestra el despliegue con sglang usando `--tp-size 8`, es decir, paralelismo tensorial sobre 8 GPU (por ejemplo, 8 × A100 80 GB u 8 × H100 80 GB). Con 2 × H100 80 GB (160 GB totales) teóricamente cabrían los pesos con margen para caché, aunque esta configuración no está documentada.
- GPU de consumo: no cabe en una única GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin cuantizar, y no hay versiones cuantizadas publicadas. El bajo número de parámetros activos (~3 B) favorece el throughput una vez cargado el modelo, pero no hay medidas publicadas.
- Despliegue: soportado en sglang (≥ 0.5.10), vLLM (≥ 0.19.0) y `transformers` con soporte de `qwen3_5_moe`. Existe además un endpoint de inferencia gestionado en FriendliAI. No hay versiones GGUF ni recetas para Ollama o TLL disponibles.
- Consideraciones de servicio: mantener activos los parsers `qwen3` (razonamiento) y `qwen3_coder` (tool calls), ya que el checkpoint fue entrenado con trayectorias agénticas. El bloque MTP está ausente, por lo que no se puede usar decodificación especulativa. Para contexto de 1.010.000 tokens hay que activar `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1` o `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` junto con la longitud de contexto ampliada.

## Comparativa con modelos similares

La única alternativa con datos completos en la información proporcionada es su propio modelo base; no hay disponibles otras alternativas comparables de la misma categoría en la información proporcionada.

| | DataWorld-35B-A3B | Qwen3.6-35B-A3B (base) |
|---|---|---|
| Parámetros totales | 35,1 B | 35 B |
| Parámetros activos | ~3 B (256 expertos, top-8) | ~3 B |
| Contexto | 262.144 tokens (hasta 1.010.000 con YaRN) | 262.144 tokens |
| Entrenamiento | RL agéntico multi-turno (RL-zero) sobre DataWorld | Preentrenamiento y post-entrenamiento estándar de Qwen |
| Visión | Sí (torre de visión incluida) | Sí |
| Benchmarks de datos | +7,06 a +20,90 puntos sobre el base según la suite | Referencia |
| Decodificación especulativa (MTP) | No incluida | Incluida |
| Licencia | Apache-2.0 | Apache-2.0 |
| Formato | safetensors (70,21 GB) | safetensors |

## Limitaciones y advertencias

- Especialización estrecha: las mejoras documentadas se miden solo en suites de análisis de datos y tareas laborales (DataWorld-Bench, DAComp, DABstep-Hard, JobBench); no hay datos públicos sobre posible regresión en capacidades generales (razonamiento matemático, conocimiento general, etc.).
- Riesgo de alucinación: inherente a los LLM; en modo agente el modelo puede ejecutar llamadas a herramientas con argumentos incorrectos o interpretar mal resultados, por lo que se recomienda supervisión y sandboxing en producción.
- Idiomas soportados: no disponible; al ser un fine-tune de un modelo Qwen, es razonable asumir buen rendimiento en chino e inglés, pero no hay datos publicados al respecto.
- Contexto ampliado no garantizado: el uso por encima de los 262.144 tokens nativos requiere variables de entorno y YaRN, y su calidad en ese régimen no está documentada.
- Sin bloque MTP: las recetas de decodificación especulativa del modelo base no son aplicables, lo que puede afectar a la latencia esperada.
- Sin cuantizaciones oficiales: no hay versiones GGUF ni AWQ/GPTQ publicadas, lo que limita el despliegue en hardware modesto.
- Validación comunitaria limitada: en el momento de redacción el modelo acumula solo 86 descargas y 16 likes, sin historial de uso en producción.
- Licencia: Apache-2.0 es permisiva y permite uso comercial, con obligación de incluir el aviso de licencia; no impone restricciones significativas adicionales.
- Servicio: requiere versiones concretas de los runtimes (sglang ≥ 0.5.10, vLLM ≥ 0.19.0) y los parsers `qwen3` y `qwen3_coder`; usar configuraciones distintas puede degradar el comportamiento agéntico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhanli-Li/DataWorld-35B-A3B
- Modelo base (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Colección DataWorld en Hugging Face (modelo, datos de entrenamiento y benchmark): https://huggingface.co/collections/Zhanli-Li/dataworld
- Página del proyecto: https://zhanli-li.github.io/Data-World/
- Paper (arXiv:2610.21656): https://arxiv.org/abs/2610.21656
- Código, pipeline de generación de datos y harness de evaluación (GitHub): https://github.com/Zhanli-Li/Data-World
- Endpoint de inferencia gestionado (FriendliAI): https://friendli.ai/models/Zhanli-Li/DataWorld-35B-A3B
