# ssurface/cot-dialect-olmo3-7b-think-grpo-addlen50-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-addlen50-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think`, un modelo de razonamiento de 7B parámetros desarrollado por el Allen Institute for AI (AI2). El adaptador entrena al modelo para generar cadenas de razonamiento (chain-of-thought) extremadamente comprimidas, en concreto al nivel de compresión L5, donde la cadena de pensamiento se reduce a una única expresión aritmética de unos 16 caracteres de mediana, frente a los 532 caracteres del nivel L1. El objetivo es estudiar cómo afecta la compresión del razonamiento a la precisión en problemas matemáticos.

Este adaptador es una **ablación** dentro de un estudio más amplio sobre "dialectos de compresión de chain-of-thought". Se diferencia del modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`) en que utiliza una recompensa con una penalización adicional de longitud (`addlen50`), diseñada para evaluar el impacto de ese componente en el diseño de recompensas. El adaptador se entrenó con GRPO sobre el conjunto GSM8K y alcanza un 65.3% de precisión exacta en el conjunto de test, sin ejemplos ni self-consistency. Su relevancia radica en que permite reproducir y comparar el efecto de distintas funciones de recompensa en la compresión del razonamiento, un área activa en la optimización de modelos de lenguaje para eficiencia y transparencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre OLMo-3-7B-Think (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador usa r=16, alpha=32; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base OLMo-3-7B-Think soporta 4096 tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16, sin cuantizacion propia) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7B parámetros con arquitectura transformer decoder-only, entrenado por AI2 con un enfoque de razonamiento visible (el modelo genera una cadena de pensamiento antes de responder). El adaptador LoRA (r=16, alpha=32) se entrena con el algoritmo GRPO (Group Relative Policy Optimization) sobre el conjunto de entrenamiento de GSM8K, que contiene 6993 ejemplos re-expresados a nivel L5 por un modelo profesor. Las cadenas de razonamiento de estos ejemplos tienen una mediana de 16 caracteres dentro de la etiqueta `thinking`.

El entrenamiento usa el `GRPOTrainer` de `trl` sobre `transformers` estándar con atención `sdpa`. La función de recompensa combina cinco componentes: `correctness` (basada en la coincidencia con la respuesta del oro, ponderada por el número de pasos de la solución), `format` (obliga a una estructura `thinking...response` seguida de `#### <respuesta>`), `length` (recompensa gradual que acerca la longitud de la cadena al objetivo del nivel), `chain` (verifica que la aritmética escrita en la cadena sea correcta) y `gdpo` (normaliza cada recompensa independientemente dentro del grupo antes de sumarlas). El coeficiente KL (beta) es 0.01, el learning rate 1e-05, y se generan 8 respuestas por prompt con un máximo de 256 tokens de finalización. El entrenamiento se realizó en una única NVIDIA A100 de 80GB.

Un detalle técnico relevante: el autor advierte que el adaptador debe cargarse sobre el modelo SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base, ya que se entrenó sobre el modelo SFT fusionado. Además, se verificó que las matrices `lora_B` no fueran cero antes de publicar, descartando 13 adaptadores que fallaron esa comprobación.

## Capacidades

- Razonamiento matematico con chain-of-thought comprimido: genera una expresion aritmetica unica y concisa (nivel L5) en lugar de una cadena de pensamiento extensa.
- Generacion de texto en ingles: el modelo base Olmo-3-7B-Think es capaz de generar texto general, aunque el adaptador esta especializado en problemas matematicos.
- Soporte de tool calling: no disponible (el adaptador no anade capacidades de este tipo).
- Soporte de agentes y multi-step reasoning: limitado, ya que la compresion a nivel L5 elimina pasos intermedios visibles; el razonamiento se condensa en una unica expresion.
- Capacidades multilingues: solo ingles (segun la etiqueta `language: en`).
- Capacidades especiales: el adaptador produce cadenas de pensamiento extremadamente cortas (mediana de 16 caracteres), lo que reduce el coste de generacion y la latencia en comparacion con cadenas completas.

## Casos de uso

- Evaluacion de tecnicas de compresion de chain-of-thought: permite medir como afecta la longitud del razonamiento a la precision en tareas matematicas, util para investigadores que estudian el equilibrio entre eficiencia y calidad.
- Ablacion de funciones de recompensa en RLHF/GRPO: sirve como referencia para comparar el efecto de una penalizacion adicional de longitud (`addlen50`) frente al modelo principal del mismo nivel, ayudando a disenar mejores recompensas.
- Generacion de explicaciones concisas en sistemas de tutoria: puede producir respuestas matematicas con una justificacion minima, adecuada para entornos donde se prefiera brevedad sobre detalle.
- Prototipado de modelos de razonamiento eficientes: al reducir la longitud del chain-of-thought, se puede desplegar en entornos con restricciones de latencia o coste de tokens, aunque con una perdida de precision notable.
- Reproduccion de experimentos cientificos: al ser una ablacion publicada con el codigo y los datos de entrenamiento, permite a otros investigadores replicar los resultados y validar las conclusiones del estudio.
- Benchmarking de modelos de 7B en razonamiento matematico: proporciona un punto de referencia adicional para comparar el rendimiento de modelos de tamano medio en GSM8K bajo condiciones de compresion extrema.

## Benchmarks y rendimiento

El unico resultado publicado por el autor es la precision exacta en GSM8K test, obtenida con greedy decoding, en un solo turno, sin ejemplos ni self-consistency:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 65.3% |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. La cifra debe interpretarse con cautela: es una ablacion, no el modelo principal del nivel, y el autor advierte que puede ser peor que el modelo core del mismo nivel. Ademas, la precision cae con la dificultad del problema, especialmente en los niveles comprimidos.

## Requisitos de hardware

- El adaptador LoRA en si ocupa unos 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (7B parametros).
- Para inferencia en bf16, el modelo base ocupa aproximadamente 14 GB de VRAM, mas el adaptador. Una GPU con 16 GB o mas (p. ej., RTX 4090, A100 40GB) es suficiente.
- Con cuantizacion del modelo base (p. ej., GGUF en 4 bits), el conjunto puede caber en GPUs consumer de 8 GB (p. ej., RTX 3070/4060), aunque el adaptador no esta disponible en formato GGUF y requeriria fusionarse con el modelo base antes de cuantizar.
- Opciones de despliegue: se puede usar con `transformers` + `peft` (como en el ejemplo de la model card), o fusionar el adaptador y exportar a formatos como GGUF para su uso con `llama.cpp` u `Ollama`.
- Latencia y throughput: no disponibles. Al generar cadenas de razonamiento muy cortas (16 caracteres de mediana), la latencia por respuesta sera significativamente menor que con cadenas completas, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos oficiales con otros modelos en la informacion proporcionada. Como referencia contextual, el modelo base `allenai/Olmo-3-7B-Think` es un modelo de razonamiento de 7B que en su version sin compresion suele obtener puntuaciones mas altas en GSM8K (aunque no se ha publicado el valor exacto en la informacion disponible). El adaptador de este repo esta disenado especificamente para estudiar la compresion, no para competir en rendimiento bruto. No se puede establecer una comparativa rigurosa sin datos adicionales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con enunciados en ingles (GSM8K); su rendimiento en otras tareas o idiomas no esta verificado.
- La precision cae rapidamente con la dificultad del problema, siendo mas pronunciada en los niveles comprimidos como L5.
- Es una **ablacion** con un proposito experimental concreto: evaluar el efecto de la recompensa `addlen50`. Puede ser inferior al modelo principal del mismo nivel (`...-grpo-l5`) y no debe usarse como modelo de produccion general.
- Requiere cargar el adaptador sobre el modelo SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base; hacerlo de otra forma no reproduce los resultados publicados.
- Entrenado con una sola semilla; diferencias de unos pocos puntos porcentuales pueden deberse al azar (intervalo de confianza del 95% de aproximadamente ±2.7 puntos en n=1317).
- Riesgo de alucinacion: al comprimir el razonamiento a una unica expresion, el modelo puede producir respuestas incorrectas sin pasos intermedios verificables, aumentando la dificultad de depuracion.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think tambien esta bajo apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-addlen50-l5
- Modelo base `allenai/Olmo-3-7B-Think`: https://huggingface.co/allenai/Olmo-3-7B-Think
- Version GGUF del modelo base (por unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha de Olmo 3 7B Think en ThinkLLM: https://thinkllm.dev/models/olmo-3-7b-think
- Ficha en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
