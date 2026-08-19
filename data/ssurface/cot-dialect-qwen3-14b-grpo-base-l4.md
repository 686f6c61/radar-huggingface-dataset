# ssurface/cot-dialect-qwen3-14b-grpo-base-l4

## Resumen

`cot-dialect-qwen3-14b-grpo-base-l4` es un adaptador LoRA de 0.3 GB que transforma a Qwen3-14B en un "dialecto" de razonamiento comprimido de nivel L4, donde las cadenas de pensamiento se expresan como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). Lo desarrolla ssurface (Anatolii Frolov) como parte de una familia de modelos que investigan la compresion de chain-of-thought, con un rango de compresion de 33x entre los niveles L1 (532 caracteres de cadena mediana) y L5 (16 caracteres).

Se trata de una ablation: es el mismo nivel L4 entrenado con una recompensa simplificada (solo `correctness` y `format`) para que la comparacion del diseno de recompensas del paper "Chain-of-Thought Compression Dialects" pueda re-ejecutarse en lugar de tomarse por fe. El adaptador se entrena con GRPO sobre el modelo SFT fusionado de nivel L4, no sobre el modelo base directamente. Alcanza un 76.2% de accuracy en GSM8K test con greedy decoding, sin ejemplos ni self-consistency.

La relevancia de este modelo es doble: demuestra que es posible comprimir drasticamente las cadenas de razonamiento manteniendo una precision aceptable en tareas aritmeticas, y sirve como grupo de control para aislar el efecto de componentes adicionales de recompensa en el rendimiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3-14B (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; modelo base 14.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no especificado (adaptador en bf16, safetensors) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32) que se apila sobre Qwen/Qwen3-14B, un transformer denso de 14.8B parametros con ventana de contexto de 32k tokens. El entrenamiento usa GRPO (Group Relative Policy Optimization) con `trl.GRPOTrainer` sobre transformers estandar con atencion `sdpa`, sin kernels fusionados. La funcion de perdida es `dapo` con coeficiente KL de 0.0, 8 generaciones por prompt, batch de 8 con 4 pasos de acumulacion, max completion de 256 tokens y learning rate de 1e-05.

Los datos de entrenamiento consisten en 6.976 ejemplos del conjunto de entrenamiento de GSM8K, reexpresados a nivel de compresion L4 por un modelo profesor. La cadena de razonamiento mediana en este nivel es de 41 caracteres dentro de la etiqueta `thinking`. La recompensa combina `correctness` (que pondera por el numero de pasos de la solucion de referencia, de modo que los problemas mas dificiles valen mas) y `format` (la respuesta debe contener un bloque `thinking...response` seguido de `#### <respuesta>`).

Un detalle tecnico relevante: el entrenamiento se realizo sobre el modelo SFT fusionado de nivel L4 (`ssurface/cot-dialect-qwen3-14b-sft-l4`), no sobre el modelo base. Cargar el adaptador directamente sobre `Qwen/Qwen3-14B` no reproduce los resultados publicados. Ademas, el autor verifico que todas las matrices `lora_B` del adaptador son no nulas, descartando 13 adaptadores que fallaron esta comprobacion (el camino con kernels fusionados producia matrices `lora_B` de ceros, matematicamente inertes pese a cargar sin errores).

## Capacidades

- Razonamiento matematico sobre problemas de palabras (GSM8K) con cadenas de pensamiento comprimidas a nivel L4 (asignaciones encadenadas con punto y coma).
- Generacion de texto conversacional en ingles (heredada del modelo base Qwen3-14B).
- Razonamiento multi-paso en formato `thinking...response` con respuesta final en formato `#### <respuesta>`.
- No soporta tool calling ni function calling de forma nativa en este adaptador (no se menciona en la documentacion).
- No tiene capacidades de vision, audio ni multimodalidad.
- La compresion de la cadena de razonamiento es la capacidad distintiva: reduce la longitud del CoT de ~532 a ~41 caracteres manteniendo una precision razonable en tareas aritmeticas.

## Casos de uso

- Investigacion sobre compresion de chain-of-thought: permite estudiar como afecta la compresion del razonamiento a la precision final, comparando los niveles L1 a L5 de la familia de dialectos.
- Estudios de diseno de recompensas en RLHF/GRPO: al ser una ablation con recompensa simplificada (solo `correctness` y `format`), sirve como grupo de control para aislar el efecto de componentes adicionales de recompensa en el rendimiento.
- Reproduccion de experimentos: el autor publica este adaptador especificamente para que otros investigadores puedan re-ejecutar la comparacion de diseno de recompensas del paper en lugar de confiar en los resultados declarados.
- Razonamiento aritmetico con presupuesto de tokens reducido: en entornos donde el coste de generacion es critico, las cadenas comprimidas a L4 reducen drasticamente el numero de tokens generados por consulta.
- Benchmarking de metodos de compresion de razonamiento: permite comparar el enfoque de "dialectos" (reescritura del CoT) frente a otras tecnicas como distillation o pruning.
- Validacion de pipelines de entrenamiento PEFT: el flujo SFT + GRPO con LoRA documentado en la model card es un ejemplo reproducible de entrenamiento de razonamiento con adaptadores, incluyendo la verificacion de matrices `lora_B` no nulas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 76.2% |

Condiciones de evaluacion: greedy decoding, single-turn, sin ejemplos (no exemplars), sin self-consistency. El autor indica que el intervalo de confianza al 95% tiene una semianchura de ~2.7 puntos porcentuales con n=1317, por lo que diferencias de un par de puntos pueden deberse al ruido. No se dispone de resultados comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (segun la model card).
- Inferencia: el modelo fusionado (Qwen3-14B + adaptador LoRA) requiere aproximadamente 30 GB de VRAM en bf16 (el modelo base pesa ~28 GB en bf16, mas el adaptador fusionado).
- Con cuantizacion de 4 bits, el modelo fusionado puede caber en GPUs consumer de 24 GB como la RTX 4090, aunque el adaptador no se distribuye en formato cuantizado.
- El adaptador en si pesa solo 0.3 GB; la carga principal es el modelo base.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), o fusionar el adaptador y exportar a GGUF para `llama.cpp`/`Ollama`, o servir con `vLLM` tras la fusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | GSM8K (test) | Contexto | Licencia |
|---|---|---|---|---|
| `cot-dialect-qwen3-14b-grpo-base-l4` (este) | LoRA sobre Qwen3-14B, GRPO con recompensa base | 76.2% | 32k | Apache 2.0 |
| `ssurface/cot-dialect-qwen3-14b-grpo-l4` | LoRA sobre Qwen3-14B, GRPO con recompensa completa | no disponible | 32k | Apache 2.0 |
| `ssurface/cot-dialect-qwen3-14b-sft-l4` | LoRA sobre Qwen3-14B, solo SFT | no disponible | 32k | Apache 2.0 |
| `Qwen/Qwen3-14B` (base) | Modelo denso completo | no disponible | 32k | Apache 2.0 |

Este adaptador es una ablation disenada especificamente para comparar el diseno de recompensas: el modelo principal del mismo nivel (`grpo-l4`) usa una recompensa mas elaborada, mientras que este usa solo `correctness` y `format`. El autor advierte que puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K); no hay evidencia de rendimiento en otras tareas.
- La precision disminuye con la dificultad del problema, y la caida es mas pronunciada en los niveles comprimidos.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales pueden deberse al ruido estadistico.
- Es un artefacto de ablation: fue entrenado para responder a una pregunta especifica sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- El adaptador debe cargarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-qwen3-14b-sft-l4`), no sobre el modelo base directamente; cargarlo sobre `Qwen/Qwen3-14B` no reproduce los resultados.
- Solo soporta ingles; no hay soporte multilingue en este adaptador.
- No hay datos sobre sesgos o alucinaciones especificos de este adaptador; hereda los del modelo base Qwen3-14B.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto de investigacion publicado recientemente (agosto de 2026) y no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-14b-grpo-base-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Modelo SFT de nivel L4 (requerido como base): https://huggingface.co/ssurface/cot-dialect-qwen3-14b-sft-l4
- Modelo principal del mismo nivel (recompensa completa): https://huggingface.co/ssurface/cot-dialect-qwen3-14b-grpo-l4
- Coleccion Qwen3: https://huggingface.co/collections/Qwen/qwen3
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Paper de referencia: "Chain-of-Thought Compression Dialects" (Frolov, 2026), citado en la model card
