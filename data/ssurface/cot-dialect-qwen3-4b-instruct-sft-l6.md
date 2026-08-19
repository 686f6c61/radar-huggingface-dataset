# ssurface/cot-dialect-qwen3-4b-instruct-sft-l6

## Resumen

`cot-dialect-qwen3-4b-instruct-sft-l6` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Forma parte de una serie de experimentos denominados "Chain-of-Thought Compression Dialects", cuyo objetivo es estudiar cómo se comporta el modelo cuando se comprime o elimina por completo la cadena de razonamiento. Este adaptador concreto representa el extremo inferior del espectro: se ha entrenado para responder directamente, sin generar ninguna cadena de pensamiento, y sirve como punto de referencia para medir cuánto conocimiento retiene el modelo base cuando se elimina el razonamiento explícito.

El modelo está entrenado mediante supervisión fina (SFT) por destilación sobre el conjunto de entrenamiento de GSM8K, con objetivos que contienen únicamente la respuesta final. La precisión obtenida en el test de GSM8K es del 33,5% (exact match, decodificación greedy), muy inferior a la que cabría esperar del modelo base, lo que confirma que la cadena de razonamiento es esencial para el rendimiento en problemas matemáticos. El adaptador es ligero (0,1 GB) y se distribuye bajo licencia Apache 2.0, con soporte exclusivo para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA, r=16, alpha=32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo denso Qwen3-4B-Instruct-2507, un transformer autoregresivo de 4.000 millones de parámetros. El adaptador LoRA utiliza r=16, alpha=32 y dropout de 0,05, aplicado probablemente a las proyecciones de atención y MLP del modelo base. El entrenamiento se realizó mediante supervisión fina (SFT) por destilación, utilizando el conjunto de entrenamiento de GSM8K (problemas de razonamiento matemático) con objetivos que contienen solo la respuesta final, sin ninguna cadena de razonamiento. Se emplearon 3 épocas, tasa de aprendizaje 2e-4 con coseno y warmup del 3%, batch efectivo de 64 (16 x 4 acumulación de gradientes), longitud máxima de secuencia de 1024 tokens y precisión bf16. El entrenamiento se ejecutó en una única NVIDIA A100 de 80 GB. Un detalle técnico relevante: la pérdida se calcula solo sobre la parte de la respuesta, con longitudes de prompt precomputadas en tiempo de carga, evitando el patrón de búsqueda que en otros experimentos enmascaraba silenciosamente el prompt y permitía que el prior de tool-calling del modelo base se filtrara en las cadenas.

## Capacidades

- Generación de texto en inglés, con respuestas directas sin cadena de razonamiento.
- Razonamiento matemático básico sobre problemas de tipo GSM8K, con precisión limitada (33,5% exact match).
- No soporta tool calling ni function calling (el entrenamiento elimina ese comportamiento).
- No soporta agentes ni razonamiento multi-paso explícito.
- No dispone de capacidades multimodales (visión, audio).
- No incluye modo thinking ni generación de cadenas de pensamiento visibles.

## Casos de uso

- Investigación sobre compresión de cadenas de razonamiento: permite estudiar cuantitativamente el impacto de eliminar por completo el razonamiento explícito en tareas matemáticas, sirviendo como línea base inferior en comparaciones con otros dialectos del mismo espectro.
- Análisis de robustez del modelo base: al forzar respuestas directas, se puede evaluar qué conocimiento implícito retiene Qwen3-4B-Instruct-2507 sin generar pasos intermedios.
- Estudio de destilación de conocimiento: el adaptador demuestra cómo un SFT con solo respuestas finales degrada el rendimiento, lo que resulta útil para diseñar mejores estrategias de destilación.
- Benchmark de evaluación de dialectos de CoT: en el marco del proyecto "Chain-of-Thought Compression Dialects", este modelo actúa como referencia para calibrar otros adaptadores que comprimen parcialmente la cadena.
- Pruebas de calibración de decodificación: al no producir cadenas, es útil para aislar el efecto del prompting y la temperatura en la generación de respuestas cortas.
- Verificación de hipótesis sobre el papel del razonamiento explícito: permite contrastar si la caída de precisión se debe a la falta de cadena o a otros factores de entrenamiento.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en el model-index (verificado: false):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 33,5% |

Condiciones de evaluación: decodificación greedy, single-turn, sin ejemplos, sin self-consistency. No se han publicado resultados en otras tareas ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,1 GB), pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 completo.
- VRAM estimada para inferencia en bf16: aproximadamente 8-10 GB para el modelo base (4B parámetros) más overhead de activaciones y adaptador.
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), RTX 3090, RTX 4090, o cualquier GPU con 12 GB o más de VRAM.
- Es ejecutable en GPUs de consumo (RTX 3080/3090/4090) con cuantización (por ejemplo, 4 bits mediante bitsandbytes), aunque no se proporcionan configuraciones oficiales.
- Opciones de despliegue: HuggingFace `transformers` con `peft` (código de ejemplo incluido en la model card), o bien exportar el adaptador a GGUF para usar con llama.cpp/Ollama (no documentado oficialmente).
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores o modelos de la misma categoría en la documentación proporcionada. Como referencia conceptual, el modelo base Qwen3-4B-Instruct-2507 sin adaptador obtiene un rendimiento significativamente superior en GSM8K (típicamente por encima del 80%), pero no se ha publicado el dato exacto en esta ficha. Tampoco se han encontrado otros adaptadores del mismo proyecto publicados en HuggingFace con resultados comparables.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matemáticos de tipo GSM8K; no generaliza a otros dominios.
- La precisión cae rápidamente con la dificultad del problema, especialmente en los niveles comprimidos.
- El modelo no genera cadenas de razonamiento, por lo que su capacidad de explicación y depuración es nula.
- Es un punto de referencia para investigación, no un modelo para desplegar en producción.
- Los resultados provienen de una única semilla; diferencias de un par de puntos porcentuales están dentro del ruido (intervalo de confianza del 95% de aproximadamente ±2,7 puntos en n=1317).
- Solo soporta inglés; no se ha evaluado en otros idiomas.
- Puede heredar sesgos y limitaciones del modelo base Qwen3-4B-Instruct-2507 (no documentados en esta ficha).
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para tareas reales debido a su bajo rendimiento.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l6
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Technical Report de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
