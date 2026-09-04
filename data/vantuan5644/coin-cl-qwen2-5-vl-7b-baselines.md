# vantuan5644/coin-cl-qwen2.5-vl-7b-baselines

## Resumen

Este repositorio de HuggingFace contiene una colección de adaptadores LoRA (entrenados con la librería PEFT) para el modelo Qwen2.5-VL-7B-Instruct, desarrollados por el autor vantuan5644 como líneas base de aprendizaje continuo (continual-learning). El objetivo es evaluar el rendimiento de 12 métodos de adaptación (clmoe, disco, disco_dko, disco_s1, disco_s2, ewc, ewc_cal, modal_prompt, moelora, olora, same, seqft y smolora) cuando se entrenan secuencialmente sobre el benchmark CoIN, compuesto por 8 tareas multimodales: ScienceQA, TextVQA, ImageNet, GQA, VizWiz, Grounding, VQAv2 y OCR-VQA.

El modelo base es un transformador multimodal de 7.000 millones de parámetros (Qwen2.5-VL-7B), eficaz en tareas de visión y lenguaje. El repositorio no contiene los pesos completos, sino adaptadores LoRA que deben cargarse sobre el modelo base. Su relevancia radica en permitir reproducir y comparar estrategias de aprendizaje continuo en un entorno multimodal, incluyendo la evaluación de la matriz de transferencia forward (checkpoint N sobre cada tarea K<=N).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct (transformer multimodal de vision y lenguaje) |
| Parametros totales | no disponible (los adaptadores varian segun el metodo) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptadores PEFT (LoRA); formato de archivo no especificado |

## Arquitectura y entrenamiento

Los adaptadores se entrenan secuencialmente sobre el benchmark CoIN, que abarca 8 tareas: ScienceQA, TextVQA, ImageNet, GQA, VizWiz, Grounding, VQAv2 y OCR-VQA. Cada uno de los 12 métodos produce 8 checkpoints (uno por tarea). El entrenamiento emplea LoRA (low-rank adaptation) para actualizar una fracción mínima de los parámetros del modelo base. La información pública no detalla la composición del dataset, el número total de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Comprensión multimodal: al heredar el modelo base Qwen2.5-VL-7B-Instruct, los adaptadores pueden procesar imágenes y texto, y responder preguntas visuales.
- Cobertura de tareas de visión por computador: los checkpoints incluyen adaptadores para VQA (ScienceQA, TextVQA, GQA, VizWiz, VQAv2, OCR-VQA), clasificación de imágenes (ImageNet) y grounding.
- Aprendizaje secuencial: cada adaptador se entrega después de una tarea concreta, lo que permite estudiar la transferencia directa entre tareas.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje continuo multimodal: el repositorio permite reproducir la evaluación forward-transfer de 12 métodos en 8 tareas, lo que facilita comparar estrategias de mitigación del olvido catastrófico.
- Desarrollo de sistemas VQA incremental: los adaptadores pueden servir como referencia para integrar nuevas tareas de respuesta a preguntas visuales sin reentrenar el modelo completo.
- Evaluación de técnicas de adaptación por parámetros: los adaptadores LoRA y sus variantes (MoLoRA, Smolora, OLoRA) son un banco de pruebas para estudiar el rendimiento de métodos de adaptación de bajo rango en modelos grandes.
- Prototipos de asistentes visuales para aprendizaje continuo: el modelo puede cargar una tarea a la vez y desplegarse en entornos donde los datos llegan de forma secuencial.
- Estudio de transferencia de aprendizaje entre tareas visuales: la estructura secuencial (ScienceQA → TextVQA → ... → OCR-VQA) permite analizar cómo el conocimiento adquirido en una tarea afecta a las siguientes.
- Benchmark de referencia para nuevos métodos: los adaptadores actúan como línea base para comparar propuestas de continual learning en el dominio multimodal.
- Fines educativos y de investigación: como recurso didáctico para entender cómo funcionan los adaptadores LoRA en modelos de visión y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la evaluación de una matriz de transferencia forward de 8x8 (cada checkpoint evaluado en todas las tareas hasta N), pero no se incluyen métricas numéricas.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5-VL-7B-Instruct requiere alrededor de 16 GB de VRAM en FP16. Los adaptadores LoRA añaden una sobrecarga de menos de 1 GB. Para procesar imágenes de alta resolución y contextos largos, se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB.
- ¿Cabe en GPU de consumo?: sí en tarjetas con 24 GB (RTX 3090/4090). En GPUs de 12-16 GB se puede aplicar cuantización sobre el modelo base, pero no se documenta.
- Opciones de despliegue: los adaptadores se cargan con la librería PEFT junto al modelo base en Transformers. Es compatible con pipelines que usen transformers; para vLLM se necesita verificar el soporte de LoRA (no confirmado). No se ha confirmado compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información comparativa en los datos proporcionados. El modelo no es un modelo base independiente, sino un conjunto de adaptadores LoRA, por lo que la comparación directa con otros modelos de la misma categoría no resulta procedente sin métricas de evaluación.

## Limitaciones y advertencias

- Este repositorio no es un modelo autónomo: requiere el modelo base Qwen2.5-VL-7B-Instruct para funcionar.
- Los adaptadores están orientados a investigación en continual learning; su rendimiento en tareas externas al benchmark CoIN no está validado.
- No se proporcionan métricas de calidad de las respuestas; la presencia de olvido catastrófico puede degradar el rendimiento en tareas anteriores.
- El tamaño del repositorio (138.8 GB) puede ser prohibitivo para entornos con poca capacidad de almacenamiento.
- No hay información sobre sesgos ni alucinaciones. Al ser un adaptador sobre un modelo base, es probable que herede los sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los datos de entrenamiento.
- El autor no documenta los datos de entrenamiento de los adaptadores, lo que limita la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/vantuan5644/coin-cl-qwen2.5-vl-7b-baselines
- Modelo base Qwen/Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
