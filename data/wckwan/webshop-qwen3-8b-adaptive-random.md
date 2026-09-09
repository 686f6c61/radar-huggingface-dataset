# wckwan/WebShop-Qwen3-8B-Adaptive-Random

## Resumen

El modelo WebShop-Qwen3-8B-Adaptive-Random es una política de agente de búsqueda multi-turno desarrollada por wckwan, basada en un fine-tune de Qwen/Qwen3-8B. Su objetivo es resolver tareas que requieren iteraciones de búsqueda y uso de herramientas, en la línea de los agentes Search-R1. El entrenamiento emplea Process-GRPO, una variante de GRPO que utiliza un modelo de recompensa de proceso (Olmo-3-7B-Think) para puntuar cada turno de la trayectoria, en lugar de evaluar únicamente el resultado final.

La relevancia del modelo reside en que explora técnicas de normalización de ventaja por grupo y por posición de turno, así como prompts de verificación que incorporan las respuestas recuperadas por las herramientas y la respuesta dorada. El resultado es una política con una puntuación media de recompensa de proceso de 0,93, una precisión de entrenamiento de 0,49 y una media de 2,6 búsquedas por trayectoria, lo que indica un comportamiento de búsqueda diverso pero con trayectorias cortas.

La arquitectura es un transformer de 8.000 millones de parámetros, heredado del modelo base Qwen3-8B. La longitud de contexto no está disponible en la información proporcionada, aunque al tratarse de un fine-tune del modelo base es probable que se mantenga la ventana original. El repositorio alberga el modelo final en la raíz (paso de entrenamiento 20) y checkpoints intermedios en subcarpetas `step_<STEP>/`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3-8B) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer causal con decodificación autoregresiva, y se somete a un ajuste fino mediante aprendizaje por refuerzo. El método utilizado es Process-GRPO: la política se optimiza sobre grupos de trayectorias completas, pero la recompensa no se asigna solo al desenlace final, sino que un verificador de proceso (Olmo-3-7B-Think) puntúa cada turno. La ventaja de cada acción se normaliza por grupo y por posición de turno, lo que permite comparar las decisiones tomadas en el mismo turno dentro del mismo grupo. Los prompts del verificador incluyen las respuestas de las herramientas y la respuesta dorada (gold answer), lo que reduce la ambigüedad en la asignación de recompensas.

No se indican datos detallados del dataset de entrenamiento, como el número de tokens o su composición. Tampoco se menciona si hubo una fase de RLHF o DPO; el entrenamiento descrito es de aprendizaje por refuerzo con recompensas de proceso. Durante el paso 20 se reportan una puntuación media de proceso de 0,93, una precisión de 0,49 en el batch de entrenamiento y una media de 2,6 búsquedas por trayectoria, lo que sugiere que el modelo no colapsa en una única búsqueda y alterna estrategias.

## Capacidades

- Generación de texto autoregresiva, compatible con el pipeline `text-generation` de Transformers.
- Uso de herramientas (tool use): el modelo está entrenado para interactuar con herramientas de búsqueda en entornos simulados como WebShop.
- Razonamiento secuencial multi-turno: decide qué herramienta consultar en cada paso y cuándo detener la búsqueda.
- Optimización por pasos gracias al proceso de recompensa por turno, lo que permite corregir decisiones intermedias.
- Soporte de agentes y multi-step reasoning: la política es un agente de búsqueda que itera sobre consultas y respuestas recuperadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Optimización de agentes de búsqueda en entornos de compras (WebShop): el modelo gestiona consultas multi-turno, utiliza herramientas de búsqueda y selecciona productos, beneficiándose de la recompensa por proceso que guía cada decisión de búsqueda.
- Recuperación aumentada multi-paso (RAG): en pipelines RAG, actúa como generador de consultas y decide si los resultados recuperados son suficientes o si debe buscar de nuevo, lo que reduce la intervención manual.
- Asistentes de soporte técnico: ante consultas complejas que requieren consultar documentación en varias iteraciones, el modelo combina búsquedas y síntesis de respuestas, verificando cada paso.
- Investigación automatizada de fuentes: en revisiones bibliográficas, puede ejecutar múltiples búsquedas, filtrar información relevante y detenerse cuando la respuesta dorada es alcanzada.
- Evaluación de políticas de búsqueda: al incorporar un verificador de proceso, el modelo puede usarse como referencia en el entrenamiento y evaluación de otros agentes de búsqueda.
- Sistemas de respuesta a preguntas en dominios específicos: el modelo se adapta a dominios que requieren verificación de información mediante tool calling para consultar bases de conocimiento externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Durante el entrenamiento, el modelo alcanzó una puntuación media de recompensa de proceso de 0,93, una precisión en el batch de entrenamiento de 0,49 y una media de 2,6 búsquedas por trayectoria en el paso 20. Estos valores no son comparables con benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) y solo reflejan el progreso en el entorno de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no se proporcionan requisitos oficiales. Como referencia, un modelo de 8.000 millones de parámetros en FP16 requiere aproximadamente 16 GB de VRAM; con cuantización de 4 bits, el consumo baja a unos 5-6 GB.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, es viable en GPUs consumer con 16 GB o más (por ejemplo, RTX 4080/4090) y en GPUs de datacenter como A100 o H100.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización en GPUs de 8-12 GB.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con la librería Transformers, puede cargarse directamente. Es probable que también funcione con vLLM, TGI, llama.cpp u Ollama, aunque no se ha verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Método de RL | Recompensa | Licencia |
|---|---|---|---|---|
| WebShop-Qwen3-8B-Adaptive-Random | 8.000 M | Process-GRPO (Adaptive-Random) | Proceso (Olmo-3-7B-Think) | Apache 2.0 |
| WebShop-Qwen3-8B-GiGPO | 8.000 M | Process-GRPO (GiGPO) | Proceso (Olmo-3-7B-Think) | Apache 2.0 |
| WebShop-Qwen3-8B-Outcome-GRPO | 8.000 M | Outcome-GRPO | Resultado | Apache 2.0 |
| Qwen/Qwen3-8B | 8.000 M | Sin RL | – | Apache 2.0 |

Los tres modelos fine-tuned son variantes experimentales del mismo autor sobre Qwen3-8B. No se dispone de benchmarks comparativos ni del contexto exacto de cada uno; las diferencias principales están en el método de optimización y el tipo de recompensa utilizada.

## Limitaciones y advertencias

- Sesgos: no documentados; el modelo probablemente hereda sesgos del modelo base Qwen3-8B y del verificador Olmo-3-7B-Think.
- Riesgo de alucinación: como modelo generativo de 8B, puede producir respuestas incorrectas, especialmente en tareas de búsqueda donde la información recuperada es incompleta.
- Limitaciones de contexto o idioma: no disponibles en la información; el soporte multilingüe del modelo base no se confirma en este fine-tune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones especiales.
- Estado experimental: no tiene descargas ni likes, y carece de validación externa; no se han publicado benchmarks que avalen su rendimiento en tareas estándar.
- Checkpoints intermedios: el repositorio contiene subcarpetas `step_<STEP>/`. El modelo principal es el paso 20; si se utiliza un checkpoint intermedio, el comportamiento puede variar.
- Datos de entrenamiento no especificados: se desconoce el número de tokens y la composición del dataset, lo que dificulta evaluar la generalización.
- Trayectorias cortas: la media de 2,6 búsquedas por trayectoria sugiere que el modelo tiende a realizar pocas iteraciones; en tareas que requieran más pasos puede quedarse corto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/WebShop-Qwen3-8B-Adaptive-Random
- Modelo relacionado (GiGPO): https://huggingface.co/wckwan/WebShop-Qwen3-8B-GiGPO
- Modelo relacionado (Outcome-GRPO): https://huggingface.co/wckwan/WebShop-Qwen3-8B-Outcome-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
