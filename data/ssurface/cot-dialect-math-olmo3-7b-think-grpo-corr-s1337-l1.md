# ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l1

## Resumen

`ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l1` es un adaptador LoRA (librería PEFT) que afina el modelo de razonamiento `allenai/Olmo-3-7B-Think` de AI2 para resolver problemas matemáticos del conjunto MATH-500 con un estilo de razonamiento verbal completo, denominado "nivel L1" dentro del proyecto *Chain-of-Thought Compression Dialects* del autor Anatolii Frolov. El adaptador se entrena mediante GRPO sobre un modelo SFT previo (también publicado por el mismo autor) y consigue un 68,8% de precisión exacta en MATH-500 sin ejemplos ni self-consistency.

La relevancia de este modelo radica en que demuestra cómo un ajuste fino ligero (adaptador LoRA de 0,2 GB) puede especializar un modelo base de razonamiento de 7B en una tarea concreta, manteniendo la licencia Apache 2.0 y un pipeline de entrenamiento totalmente abierto. El adaptador no es un modelo autónomo: requiere cargar primero el modelo SFT correspondiente y luego apilar este adaptador sobre la fusión, tal como se indica en las instrucciones de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer causal (base: `allenai/Olmo-3-7B-Think`) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; el paper de Olmo 3 indica soporte de contexto largo) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base dispone de cuantizaciones GGUF (p. ej. de unsloth) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo causal transformer de 7B parámetros desarrollado por el Allen Institute for AI (AI2), que fue ajustado con SFT, DPO y RLVR para producir cadenas de razonamiento (chain-of-thought). El adaptador en sí es una capa LoRA con r=16 y alpha=32 que se entrena mediante GRPO (usando `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`), con una función de recompensa basada en la corrección de la respuesta (`correctness`) y una pérdida de tipo DAPO. El entrenamiento se realizó sobre un modelo SFT previo (merger) que había sido entrenado con problemas de MATH re-expresados a nivel L1 por un modelo profesor; la notación se mantiene idéntica a la de los dialectos GSM8K, cambiando solo el formato de respuesta a `\boxed{}`.

El entrenamiento usó 8 generaciones por prompt, batch de 32 con 2 pasos de acumulación, longitud máxima de completación de 256 tokens, learning rate de 1e-05 y coeficiente KL de 0.04. Se empleó una única GPU NVIDIA A100 de 80 GB. El autor advierte que el uso de kernels fusionados produjo adaptadores con matrices `lora_B` nulas (matemáticamente inertes), por lo que se verificó que todas las matrices `lora_B` fueran distintas de cero antes de publicar; 13 adaptadores que fallaron esta comprobación fueron retenidos.

## Capacidades

- Razonamiento matemático: resuelve problemas del conjunto MATH-500 con precisión exacta (68,8%) usando razonamiento verbal completo en inglés.
- Generación de texto con chain-of-thought: produce explicaciones paso a paso en lenguaje natural antes de dar la respuesta final.
- Especialización en dialecto L1: genera razonamiento "verboso" (explicación completa) en lugar de formas comprimidas o simbólicas.
- Soporte de tool calling: no disponible (el adaptador no añade esta capacidad).
- Soporte de agentes: no disponible (no se menciona en la documentación).
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: ninguna adicional (sin visión, audio, etc.).

## Casos de uso

- Evaluación de modelos de razonamiento matemático: el adaptador puede servir como referencia en pipelines de evaluación de modelos de lenguaje para tareas de matemáticas, proporcionando una línea base con un coste de inferencia moderado.
- Tutoría automática en matemáticas: dado su estilo de razonamiento verbal completo, puede generar explicaciones paso a paso para problemas de álgebra, geometría o cálculo, útil en entornos educativos.
- Generación de soluciones verificables: al producir respuestas en formato `\boxed{}` compatible con LaTeX, puede integrarse en sistemas que requieran salidas estructuradas y verificables automáticamente.
- Investigación en compresión de cadenas de razonamiento: el modelo es parte de un estudio sobre "dialectos" de compresión de CoT; puede usarse como punto de comparación para experimentos con niveles L3 o L5.
- Prototipado de sistemas de razonamiento en producción: al ser un adaptador ligero (0,2 GB) sobre un base de 7B, permite desplegar un sistema de razonamiento matemático con requisitos de hardware moderados.
- Benchmarking de técnicas de RL (GRPO/DPO): el adaptador documenta un pipeline completo de entrenamiento con GRPO, útil para reproducir o comparar configuraciones de hiperparámetros en tareas de razonamiento.

## Benchmarks y rendimiento

El autor declara un único resultado oficial en la model card:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Razonamiento matemático | MATH-500 (test, n=500) | Accuracy (exact match) | 68,8% |

Condiciones de evaluación: greedy decoding, single-turn, sin ejemplos y sin self-consistency. El autor indica que el scoring se realizó con un grader específico del proyecto, consciente de LaTeX, que normaliza formas equivalentes (p. ej. `\frac{14}{3}` == `14/3`). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en disco; el peso dominante es el modelo base de 7B.
- Inferencia en bf16: el modelo base requiere aproximadamente 14 GB de VRAM solo para los pesos; sumando el adaptador fusionado, se recomienda una GPU con al menos 16 GB (p. ej. RTX 4080/4090, A100 40 GB).
- Con cuantización 4-bit (GGUF) del modelo base, la VRAM necesaria baja a unos 5-6 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- El entrenamiento se realizó en 1x NVIDIA A100 80 GB; para reproducirlo se requiere hardware similar o superior.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` + `peft`; el modelo base tiene versiones GGUF para `llama.cpp`/`Ollama`, aunque el adaptador no está disponible en ese formato.
- Latencia y throughput: no se han publicado datos específicos; para un modelo 7B en bf16 en una A100 se puede esperar un throughput del orden de 50-100 tokens/s, pero es una estimación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros adaptadores o modelos en la información proporcionada. El único punto de referencia disponible es el propio modelo base `allenai/Olmo-3-7B-Think`, sobre el cual este adaptador añade una especialización en MATH-500, pero no se publica el rendimiento del base sin adaptador en el mismo conjunto. Tampoco se conocen resultados de otros adaptadores del mismo proyecto (p. ej. niveles L3 o L5) en esta documentación.

## Limitaciones y advertencias

- El adaptador se entrena y evalúa únicamente en problemas de razonamiento matemático en inglés; no es adecuado para otras tareas sin un ajuste adicional.
- La precisión cae con la dificultad del problema, y la caída es más rápida en los niveles comprimidos (aunque este adaptador es el nivel L1, el más verboso).
- El resultado de 68,8% proviene de una única semilla (s1337); el autor indica que diferencias de un par de puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95% de ~4,4 pp con n=500).
- El adaptador debe cargarse sobre el modelo SFT previo (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1`), no directamente sobre el base; ignorar este paso no reproduce el resultado declarado.
- El scoring se realizó con un grader LaTeX-aware propio del proyecto, no con el evaluador estándar de MATH-500; los resultados pueden no ser directamente comparables con otros benchmarks publicados.
- Solo soporta inglés; no hay capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (Olmo-3-7B-Think) también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-s1337-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Página de Olmo 3 7B Think en Crafiq: https://crafiq.ai/models/language/ai2-olmo-3-7b-think
- Artículo en LLM.co sobre Olmo-3-7B-Think: https://llm.co/llms/olmo-3-7b-think
- Cuantizaciones GGUF del base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
