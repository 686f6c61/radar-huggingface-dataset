# VadymPikulyk/zils-lite-dh6

## Resumen

zils-lite-dh6 es un modelo de decisión ("decision model") derivado por fine-tuning de Qwen/Qwen3.5-0.8B, publicado por VadymPikulyk dentro del ecosistema Zils, asociado a la subnet 127 de Bittensor. El modelo se presenta como un "soup body" en el chasis d3-lite: conserva los pesos de lenguaje y visión de un fine-tune de Qwen3.5-0.8B y añade una fusión de pesos (model soup) con un LoRA entrenado específicamente para tareas de decisión y uso de herramientas.

Con 852.985.920 parámetros reales (según los tensores en safetensors), se sitúa en la franja de los modelos sub-1B, pensados para inferencia económica y despliegue en hardware modesto. Su entrenamiento combina respuestas de profesor generadas por el sistema Zils Relay (unas 40.000) con 7.200 filas de decisión de tool-use derivadas del split público de glaive-function-calling-v2, lo que orienta el modelo hacia la selección de acciones y llamadas a funciones más que hacia la generación abierta de texto.

La relevancia actual del modelo es acotada pero concreta: es un artefacto de investigación reproducible (Apache-2.0) para experimentar con destilación de decisiones, mezcla de pesos y evaluación en subnets de Bittensor. No cuenta con descargas ni likes en el momento de la ficha, y el autor no publica benchmarks ni detalles completos de arquitectura en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (qwen3_5), fine-tune de Qwen/Qwen3.5-0.8B con fusión de pesos y LoRA mergeado; requiere `trust_remote_code` (tag `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se construye en el "chasis" d3-lite del proyecto Zils. El procedimiento descrito en la model card es una combinación de model soup y destilación: se calcula la media uniforme de dos cuerpos d3-lite ya asentados (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc, ambos Apache-2.0) y se le suma 0,7 veces un LoRA mergeado de rango 64, learning rate 5e-5 y una época.

El LoRA se entrenó con `python -m zils.teacher train` sobre aproximadamente 40.000 respuestas de profesor del sistema Zils Relay (dataset zils-ai/zils-relay-answers), con probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas a partir de fuentes públicas de entrenamiento, más 7.200 filas de decisión de tool-use construidas desde el split TRAIN público de glaiveai/glaive-function-calling-v2. En estas últimas, los objetivos mezclan las respuestas del propio soup inicial (70%) con la etiqueta gold (30%). El autor declara que no se usaron ítems de examen de validador, ítems de examen semilla públicos ni datos de clientes. No se documentan detalles sobre la composición lingüística del corpus, el número total de tokens vistos ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general heredados del modelo base Qwen3.5-0.8B.
- Capacidades de visión, según la model card, al conservar "the language and vision weights" del fine-tune de Qwen3.5-0.8B (sin detalle de resolución, número de imágenes o tareas concretas).
- Toma de decisiones y selección de acciones ("decision model") en el marco del chasis d3-lite de Zils.
- Tool calling / function calling: entrenado explícitamente con 7.200 filas de decisión de tool-use derivadas de glaive-function-calling-v2.
- Destilación de un profesor (Zils Relay / d3-ultra) para aproximar distribuciones de probabilidad en preguntas de decisión.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo thinking, audio o agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de llamadas a funciones en asistentes: el modelo puede clasificar la intención del usuario y seleccionar la herramienta adecuada, gracias a su entrenamiento específico sobre el dataset de function calling de glaive.
- Evaluación de subnets Bittensor: sirve como cuerpo candidato ("soup body") para validar pipelines de destilación y mezcla de pesos en la subnet 127, comparando su comportamiento frente a dh2 y decision-avg-abc.
- Experimentación académica con model soups: permite reproducir la receta media uniforme + 0,7 × LoRA mergeado sobre un modelo base de 0,8B y medir el efecto en tareas de decisión.
- Prototipado de agentes ligeros en local: con menos de 1B de parámetros, puede ejecutarse en GPUs de consumo para pruebas de selección de acciones antes de escalar a modelos mayores.
- Destilación de profesor a alumno: útil como alumno en pipelines de destilación que aproximen las probabilidades de un modelo mayor (d3-ultra) en preguntas de decisión.
- Investigación sobre alineación de etiquetas: el mezclado 70/30 entre respuestas del soup inicial y gold permite estudiar cómo afecta la proporción de etiquetas humanas al comportamiento final.
- Base para fine-tuning posterior en dominios concretos: al ser Apache-2.0 y sub-1B, es un punto de partida barato para ajustes específicos con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; el tamaño del repo (1,7 GB) es coherente con esta cifra.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 con contexto moderado; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 son suficientes. Para serving a escala, A100 o H100 no son necesarias por tamaño, pero pueden usarse para batchear.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en iGPU con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: al requerir `trust_remote_code` (tag `custom_code`), conviene verificar compatibilidad con Transformers y vLLM antes de producción; llama.cpp/Ollama requerirían conversión a GGUF no publicada por el autor; TGI no está confirmado.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-dh6 | 852.985.920 | no disponible | Apache-2.0 | Decision model / tool-use, fine-tune de Qwen3.5-0.8B | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B | ~0,8B (según nombre) | no disponible | no disponible en esta ficha | Modelo base generalista | Hugging Face |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, integrado en la media | Hugging Face |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, integrado en la media | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-0.8B y de datasets públicos (glaive-function-calling-v2, fuentes de entrenamiento públicas), puede heredar sesgos de esos corpus.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el entrenamiento orientado a decisión no elimina la generación de contenido incorrecto en preguntas abiertas.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados, lo que impide garantizar comportamiento multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor pide citar tasksource y los datasets originales, y remite a LICENSE y NOTICE del repositorio.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar en producción.
- Trazabilidad limitada: la model card no detalla la composición del corpus de 40.000 respuestas ni el proceso exacto de reconstrucción de preguntas de decisión, lo que dificulta la reproducibilidad completa.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; sin benchmarks ni validación externa publicada.
- Uso previsto restringido al ecosistema Zils/Bittensor: su diseño como "soup body" para la subnet 127 puede no traducirse en buen rendimiento en tareas generales fuera de ese marco.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo dh2: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo decision-avg-abc: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Profesor d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Profesor d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- Dataset de respuestas del profesor: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Repositorio de tareas citado por el autor: https://huggingface.co/tasksource
