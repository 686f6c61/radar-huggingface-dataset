# VadymPikulyk/zils-lite-dh8

## Resumen

zils-lite-dh8 es un modelo de decisión ("decision model") de aproximadamente 853 millones de parámetros, construido por VadymPikulyk como parte del ecosistema Zils para la subred 127 de Bittensor. No es un modelo de lenguaje generalista al uso: se trata de un "soup body" (cuerpo de mezcla de pesos) que empaqueta los pesos de lenguaje y visión de un fine-tune de Qwen/Qwen3.5-0.8B dentro del formato de chasis d3-lite. Su función es servir como componente base sobre el que se construyen modelos de decisión para tareas de enrutamiento y selección dentro de la mencionada subred.

El modelo parte de la media uniforme de dos cuerpos d3-lite ya asentados (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc, ambos Apache-2.0) y añade 0,7 veces un LoRA fusionado de rango 64, entrenado durante una época con una tasa de aprendizaje de 5e-5 sobre aproximadamente 26.000 respuestas de profesor del relay Zils y 7.200 filas de decisión de uso de herramientas derivadas de glaive-function-calling-v2.

Es relevante ahora por su carácter experimental y muy específico: ilustra las técnicas de destilación y mezcla de pesos aplicadas a modelos pequeños (sub-1B) para tareas de decisión estructurada, y documenta explícitamente la procedencia de sus datos de entrenamiento y las salvaguardas aplicadas (exclusión de ítems de examen de validador y de datos de clientes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (chasis d3-lite sobre Qwen3.5-0.8B; tag `qwen3_5`, requiere `custom_code`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer correspondiente a Qwen3.5-0.8B, reorganizado en el diseño de chasis d3-lite (tag `qwen3_5`, con código personalizado `custom_code`). El modelo incorpora pesos tanto de lenguaje como de visión, según indica la model card. No se detallan en la información disponible el número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa.

El proceso de construcción es una mezcla en dos etapas. Primero se calcula la media uniforme de dos cuerpos d3-lite previamente asentados (`zils-lite-dh2` y `zils-lite-decision-avg-abc`). Sobre esa base se suma 0,7 veces un LoRA fusionado de rango 64, entrenado una época con tasa 5e-5 mediante `python -m zils.teacher train`. Los datos de entrenamiento son unas 26.000 respuestas de profesor del relay Zils (dataset `zils-ai/zils-relay-answers`, con probabilidades de `vllm-sr/d3-ultra` sobre preguntas de decisión reconstruidas a partir de fuentes públicas) más 7.200 filas de decisión de uso de herramientas derivadas del split TRAIN público de `glaiveai/glaive-function-calling-v2`. En estas últimas, los objetivos conservan las respuestas del propio soup inicial en un 70% mezcladas con la etiqueta gold en un 30%. El autor declara explícitamente que no se usaron ítems de examen de validador, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Generación de texto y razonamiento sobre la base de Qwen3.5-0.8B.
- Procesamiento de visión (el modelo incluye pesos de visión según la model card).
- Decisión de uso de herramientas ("tool-use decision"): el entrenamiento incluye filas específicas para decidir invocaciones de funciones.
- Modelo de decisión para enrutamiento/selección dentro del ecosistema Zils (subred 127 de Bittensor).
- Destilación de un profesor (`d3-ultra`) para aproximar sus distribuciones de probabilidad en preguntas de decisión.
- Soporte de agentes y razonamiento multietapa: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Enrutamiento de decisiones en la subred 127 de Bittensor: el modelo actúa como cuerpo base sobre el que se construyen decisiones de selección dentro del protocolo Zils, aprovechando su entrenamiento específico con probabilidades del profesor `d3-ultra`.
- Selección de herramientas en pipelines de agentes: las 7.200 filas de decisión de uso de herramientas permiten usar el modelo para decidir qué función invocar ante una petición dada, integrándolo como clasificador previo a la ejecución.
- Destilación de profesores de mayor tamaño: sirve como alumno de referencia para reproducir el comportamiento de modelos grandes en tareas de decisión con un coste de inferencia de menos de mil millones de parámetros.
- Investigación en mezcla de pesos ("model soup"): su construcción documentada (media uniforme más LoRA fusionado escalado a 0,7) lo convierte en un caso de estudio reproducible para experimentos de merging.
- Prototipado de bajo coste en GPUs de consumo: con 853 millones de parámetros y pesos en safetensors de 1,7 GB, puede desplegarse en hardware modesto para pruebas de concepto.
- Evaluación comparativa de cuerpos d3-lite: al derivar de dos cuerpos previos, permite medir el efecto incremental del LoRA de destilación frente a sus padres.
- Fine-tuning posterior específico de dominio: su licencia Apache-2.0 y su tamaño reducido facilitan adaptaciones sobre el chasis d3-lite sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- Cuantización a 8 bits: en torno a 0,9 GB de pesos; a 4 bits, en torno a 0,5 GB (estimaciones teóricas, no se publican artefactos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 8 GB o más.
- Opciones de despliegue: al requerir `custom_code` y el chasis d3-lite, la integración con vLLM, llama.cpp, Ollama o TGI no está documentada; se espera que el ecosistema Zils (`zils.teacher`, `zils-ai`) sea la vía prevista.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-dh8 | 852.985.920 | no disponible | Apache-2.0 | Modelo de decisión (soup + LoRA destilado) |
| Qwen/Qwen3.5-0.8B | ~0,8B (modelo base) | no disponible | no disponible en esta ficha | LLM generalista |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo (padre) |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo (padre) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su entrenamiento se centra en decisiones de enrutamiento y uso de herramientas, por lo que su comportamiento como LLM generalista puede degradarse respecto al Qwen3.5-0.8B original.
- Riesgo de alucinación inherente a modelos de menos de mil millones de parámetros, especialmente en tareas abiertas de conocimiento.
- Sesgos: no documentados; los datos de entrenamiento provienen de fuentes públicas (glaive-function-calling-v2 y respuestas de profesor), cuyos sesgos pueden propagarse.
- Idiomas soportados no declarados: no se garantiza un rendimiento multilingüe más allá del que herede del modelo base.
- Requiere `custom_code` y el chasis d3-lite: la carga con herramientas estándar (transformers sin código personalizado, llama.cpp, Ollama) puede fallar o no estar soportada.
- Sin datos de benchmarks ni de validación independiente: no hay evidencia pública de su calidad frente a alternativas.
- Licencia Apache-2.0 permite uso comercial, pero la model card pide citar a tasksource y a los datasets originales; conviene revisar LICENSE y NOTICE del repo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario inexistentes.
- El autor declara la exclusión de ítems de examen y datos de clientes, pero no se aporta auditoría independiente de dicha exclusión.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo (padre): https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo (padre): https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Profesor de destilación: https://huggingface.co/vllm-sr/d3-lite (referenciado como `vllm-sr/d3-lite`; el profesor de probabilidades es `vllm-sr/d3-ultra`)
- Dataset de respuestas de profesor: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de uso de herramientas: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
