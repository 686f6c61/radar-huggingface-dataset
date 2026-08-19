# ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-subadd-l4

## Resumen

`cot-dialect-olmo3-7b-think-grpo-sftlen-subadd-l4` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` para razonar en un "dialecto" de cadena de pensamiento comprimida de nivel L4, basado en asignaciones encadenadas con punto y coma (p. ej. `K=18*2.5;D=8*4;T=K+D->T=77`). El objetivo es reducir drásticamente la longitud de las cadenas de razonamiento sin perder demasiada precisión en tareas de razonamiento matemático.

Este adaptador es explícitamente un **artefacto de ablación**, no uno de los modelos principales de la familia: se entrenó bajo una variante de recompensa distinta (`sft_length_subadd`) para permitir que la comparación de diseño de recompensas del paper "Chain-of-Thought Compression Dialects" pueda re-ejecutarse. El modelo principal del mismo nivel de compresión es `ssurface/cot-dialect-olmo3-7b-think-grpo-l4`. El adaptador se entrena con GRPO sobre el modelo SFT fusionado del nivel L4, y alcanza un 64.9% de precisión en GSM8K test con decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Olmo-3-7B-Think (transformer decoder-only) |
| Parametros totales | Modelo base: ~7B; adaptador LoRA: r=16, alpha=32 (repo de 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base Olmo-3-7B-Think) |
| Tipos de cuantizacion | bfloat16 (adapter en safetensors); cuantizacion del modelo base no especificada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `allenai/Olmo-3-7B-Think`, un transformer decoder-only de la familia Olmo 3 desarrollada por AllenAI, preentrenado en el dataset Dolma 3 y post-entrenado con cadenas de razonamiento largas para tareas de matematicas y codigo. El adaptador LoRA (r=16, alpha=32) se entrena con `trl.GRPOTrainer` sobre el modelo SFT fusionado del nivel L4 (no sobre el base sin fusionar), usando atencion `sdpa` de `transformers` estándar. Un detalle técnico notable: los kernels fusionados producian adaptadores con matrices `lora_B` todas a cero, por lo que se descartaron y se uso la ruta estándar de `transformers`.

El entrenamiento usa GRPO con loss tipo `dapo`, 8 generaciones por prompt, batch de 64 con acumulacion 1, max completion de 256 tokens, learning rate de 1e-05 y coeficiente KL (beta) de 0.0. La recompensa combina tres componentes: `correctness` (ponderada por el numero de pasos de la solucion dorada), `format` (exige un bloque `thinking... response` seguido de `#### <answer>`) y `sft_length_subadd` (penalizacion sub-aditiva del exceso de longitud). Los datos de entrenamiento son 6976 ejemplos de GSM8K train re-expresados al nivel L4 por un modelo teacher, con una longitud mediana de cadena de 41 caracteres dentro de `thinking` (frente a 532 caracteres en L1 y 16 en L5, un rango de 33x).

## Capacidades

- Razonamiento matematico: resuelve problemas de palabras de GSM8K con cadenas de razonamiento comprimidas en formato de asignaciones encadenadas.
- Compresion de chain-of-thought: genera trazas de razonamiento de ~41 caracteres de mediana en nivel L4, reduciendo tokens de salida frente a cadenas verbosas.
- Generacion de texto estructurado: produce salidas con formato estricto de un bloque `thinking... response` seguido de `#### <answer>`.
- Generacion de texto en ingles: unico idioma soportado.
- No soporta tool calling, function calling, vision, audio ni capacidades multimodales.

## Casos de uso

- Reproduccion de experimentos de diseno de recompensas en RL: el adaptador permite re-ejecutar la comparacion entre la recompensa `sft_length_subadd` y otras variantes del paper, sin depender de las afirmaciones de los autores.
- Investigacion sobre compresion de cadenas de razonamiento: util para estudiar el trade-off entre longitud de la traza de CoT y precision, comparando los niveles L1 a L5 de la familia.
- Prototipado de sistemas de razonamiento matematico con trazas compactas: el formato L4 reduce el numero de tokens generados por problema, lo que puede abaratar costes de inferencia en volumen.
- Evaluacion de robustez de modelos bajo compresion: permite medir como degrada la precision al comprimir el razonamiento, informando decisiones sobre el nivel de compresion adecuado para cada aplicacion.
- Benchmarking de estrategias de recompensa en GRPO: el adaptador sirve como punto de comparacion para validar si la recompensa sub-aditiva mejora o empeora respecto a la recompensa principal del nivel L4.
- Generacion de explicaciones matematicas concisas para entornos educativos: el formato de asignaciones encadenadas puede usarse para producir pasos de resolucion breves y auditables, aunque con la salvedad de que la precision cae con la dificultad del problema.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados con decodificacion greedy, una sola vuelta, sin ejemplos ni self-consistency, sobre el split de test de GSM8K (n=1317):

| Benchmark | Resultado |
|---|---|
| GSM8K (test, exact match) | 64.9% |

El autor indica que el margen de error al 95% es de aproximadamente ±2.7 puntos porcentuales para n=1317. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: realizado con 1x NVIDIA A100 80GB.
- Inferencia: el modelo base de ~7B en bfloat16 requiere aproximadamente 14-16 GB de VRAM; con cuantizacion de 4 bits puede reducirse a 5-8 GB.
- GPUs compatibles: RTX 3090, RTX 4090, A100, H100 y otras GPUs con al menos 16 GB de VRAM para bf16 sin cuantizar.
- Despliegue: el codigo de uso oficial emplea `transformers` con `PeftModel` y `merge_and_unload`; tambien puede integrarse en vLLM con soporte de adaptadores LoRA, o en llama.cpp si se exportan los pesos fusionados a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (grpo-sftlen-subadd-l4) | ~7B + LoRA | No disponible | 64.9% | Apache-2.0 | Ablacion, recompensa sub-aditiva |
| ssurface/cot-dialect-olmo3-7b-think-grpo-l4 | ~7B + LoRA | No disponible | No disponible | Apache-2.0 | Modelo principal del nivel L4 |
| allenai/Olmo-3-7B-Think (base) | ~7B | No disponible | No disponible | Apache-2.0 | Modelo base sin compresion de CoT |

No se dispone de datos de benchmarks para el modelo principal del nivel L4 ni para el base en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa completa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de palabras (GSM8K); no hay evidencia de rendimiento en otras tareas.
- La precision cae con la dificultad del problema, y la degradacion es mas rapida en los niveles de compresion altos (L4 y L5).
- Es un artefacto de ablacion: puede ser peor que el modelo principal del mismo nivel, y su unico proposito es responder a una pregunta concreta sobre diseno de recompensas.
- Requiere apilarse sobre el modelo SFT del nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`); cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales pueden estar dentro del ruido estadistico.
- Coeficiente KL (beta) de 0.0 durante el entrenamiento GRPO, lo que implica ausencia de regularizacion frente a la politica de referencia.
- Solo soporta ingles; no hay soporte multilingue.
- No se ha verificado de forma independiente el resultado de GSM8K (la model card marca el benchmark como `verified: false`).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-subadd-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo principal del nivel L4: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Modelo SFT del nivel L4 (requerido para apilar este adaptador): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Paper de la familia Olmo 3: https://arxiv.org/abs/2512.13961
