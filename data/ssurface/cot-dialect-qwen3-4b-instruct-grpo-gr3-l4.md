# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l4

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-gr3-l4` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para que genere cadenas de pensamiento comprimidas a un nivel denominado L4, consistente en asignaciones encadenadas con punto y coma (p. ej., `K=18*2.5;D=8*4;T=K+D->T=77`). Forma parte de una familia de "dialectos de compresión de chain-of-thought" cuyo objetivo es reducir drásticamente la longitud de los razonamientos internos sin perder precisión en tareas de matemáticas.

Este modelo concreto es una **ablación de diseño de recompensas**, no uno de los modelos principales de la colección: fue entrenado con el mismo nivel de compresión L4 pero bajo una función de recompensa alternativa (`gr3`) para permitir comparar el efecto de distintas señales de recompensa en el pipeline GRPO. No fue evaluado por separado y se publica como artefacto de investigación reproducible. El adaptador tiene un tamaño de repositorio de 0,1 GB y se distribuye bajo licencia Apache-2.0, con soporte únicamente para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base `Qwen/Qwen3-4B-Instruct-2507`) + adaptador LoRA |
| Parametros totales | ~4B (modelo base) + adaptador LoRA (r=16, alpha=32; repo de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada; hereda la del modelo base `Qwen/Qwen3-4B-Instruct-2507` |
| Tipos de cuantizacion | no especificados; el modelo base admite cuantizacion estandar (4-bit, 8-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo transformer decoder-only de 4B parámetros. El adaptador LoRA utiliza r=16 y alpha=32, y se entrena mediante GRPO (`trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`) partiendo del modelo SFT fusionado a nivel L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`). Los datos de entrenamiento provienen de GSM8K train re-expresados por un modelo profesor: 6976 ejemplos con una longitud mediana de cadena de 41 caracteres dentro del bloque `thinking`.

La función de recompensa combina tres componentes: `correctness` (basada en el número de pasos de la solución dorada), `format` (exige un bloque `thinking... response` seguido de `#### <answer>`) y `gr3`, un reescalado multiplicativo de la recompensa positiva con un suelo de 0,3. Se usó loss type `dapo`, 8 generaciones por prompt, batch 64x1, máximo de 256 tokens de completado, learning rate 1e-05, coeficiente KL 0 y hardware de 1x NVIDIA A100 80GB. El autor verifica que todos los adaptadores publicados tienen matrices `lora_B` no nulas (13 que fallaron fueron retirados).

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas a nivel L4 (asignaciones encadenadas con punto y coma).
- Generación de texto en inglés.
- Cumplimiento de un formato estricto de salida: un bloque `thinking... response` y una línea final `#### <answer>`.
- Capacidad de ser cargado junto con el adaptador SFT previo para reproducir el comportamiento entrenado.
- No se documenta soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación sobre compresión de chain-of-thought: permite estudiar cómo afecta una recompensa multiplicativa con suelo (gr3) a la calidad del razonamiento comprimido frente a otras variantes de recompensa.
- Reproducción de experimentos de ablación: el autor lo publica explícitamente para que el diseño de recompensas del paper pueda re-ejecutarse sin depender de la palabra del autor.
- Comparación de robustez de GRPO: al ser un artefacto de entrenamiento con una semilla única, sirve para medir la varianza entre ejecuciones del mismo nivel de compresión.
- Evaluación del trade-off entre longitud de cadena y precisión: junto con los niveles L1-L5 de la familia, permite trazar curvas de compresión frente a exactitud en GSM8K.
- Desarrollo de pipelines de razonamiento eficientes en tokens: aunque no está pensado para producción, sirve como banco de pruebas para técnicas de compresión de razonamiento en modelos de 4B.
- Benchmarking de adaptadores LoRA para razonamiento: útil para comparar el impacto de distintas configuraciones de LoRA y recompensas en tareas de matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este adaptador "no fue evaluado por separado" y que los niveles que llevan números reportados son los del conjunto principal de la colección.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (según la model card).
- Inferencia: al ser un adaptador sobre un modelo de 4B, puede ejecutarse en GPUs consumer con suficiente VRAM. Estimaciones orientativas: ~8 GB en bf16, ~4 GB en 8-bit, ~2-3 GB en 4-bit (dependiendo de la longitud de contexto y del batch).
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100 (para mayor throughput).
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), `vLLM` si soporta LoRA, o fusión del adaptador con el modelo base para su uso con `llama.cpp` u `Ollama` (requiere merge previo).
- Latencia y throughput: no disponibles para este adaptador específico.

## Comparativa con modelos similares

| Modelo | Nivel de compresion | Recompensa | Estado | Resultados |
|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-l4` | L4 | correctness + format + gr1 (principal) | Modelo principal del nivel | Reportados en la coleccion |
| `cot-dialect-qwen3-4b-instruct-grpo-gr3-l4` | L4 | correctness + format + gr3 | Ablacion (este modelo) | No evaluado por separado |
| `cot-dialect-qwen3-4b-instruct-sft-l4` | L4 | SFT (sin GRPO) | Modelo SFT previo | No especificado |
| `Qwen/Qwen3-4B-Instruct-2507` | Sin compresion | - | Modelo base | No especificado |

No se dispone de datos numéricos de rendimiento para comparar directamente estos modelos.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente sobre problemas de matemáticas (GSM8K); no es adecuado para otras tareas sin adaptación.
- La precisión cae con la dificultad del problema, de forma más acusada en los niveles comprimidos.
- Es un artefacto de ablación: puede ser peor que el modelo principal del mismo nivel, ya que se entrenó para responder una pregunta concreta sobre diseño de recompensas.
- No funciona cargado directamente sobre `Qwen/Qwen3-4B-Instruct-2507`: requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`) y fusionarlo antes de aplicar este adaptador.
- Entrenado con una sola semilla; diferencias de unos pocos puntos porcentuales pueden deberse al ruido (intervalo de confianza del 95% de ~2,7 pp con n=1317 y ~4,4 pp con n=500).
- Solo soporta inglés.
- No se han publicado resultados de benchmarks para este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Modelo principal del nivel L4: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4
- Paper citado: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026)
