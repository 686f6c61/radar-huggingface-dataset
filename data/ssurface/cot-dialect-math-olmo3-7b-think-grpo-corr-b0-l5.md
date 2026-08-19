# ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-b0-l5

## Resumen

Este modelo es un adaptador LoRA (PEFT) desarrollado por ssurface que modifica el comportamiento de `allenai/Olmo-3-7B-Think`, un modelo de razonamiento de 7.3 mil millones de parámetros creado por el Allen Institute for AI. El adaptador está diseñado para que el modelo base razone a un nivel de compresión denominado "L5" (expresión colapsada única), una variante extrema dentro de un proyecto de "dialectos de compresión de cadena de pensamiento". El objetivo es producir respuestas matemáticas con un razonamiento interno altamente condensado, manteniendo la corrección del resultado final.

El adaptador se entrenó con GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo que ya había sido ajustado con problemas de MATH re-expresados en ese nivel L5. El resultado reportado es un 65,2 % de precisión en el conjunto de test de MATH-500, evaluado con decodificación greedy y sin ejemplos previos. Es relevante porque explora la frontera entre compresión extrema del razonamiento y mantenimiento de la exactitud, un tema de interés para reducir costes de inferencia y latencia en modelos de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Olmo-3-7B-Think) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; repo de 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, Olmo-3-7B-Think) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en bf16/fp16 sobre el base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de 7.3B parámetros con arquitectura transformer decoder-only y razonamiento visible mediante tokens de pensamiento. El adaptador LoRA (r=16, alpha=32) se entrena en dos fases: primero un ajuste fino supervisado (SFT) con problemas de MATH re-expresados a nivel L5 por un modelo profesor, y después un refinamiento con GRPO utilizando el framework `trl.GRPOTrainer` sobre transformers estándar con atención `sdpa`. La recompensa es de tipo `correctness`, que pondera el acierto de la respuesta según el número de pasos de la solución dorada (problemas más difíciles valen más). Se usó una pérdida tipo `dapo`, 8 generaciones por prompt, batch de 32 con acumulación de 2, longitud máxima de completación de 256 tokens, learning rate de 1e-5 y coeficiente KL de 0.0. El entrenamiento se realizó en una única NVIDIA A100 80GB.

Una nota importante del autor: el adaptador debe apilarse sobre el modelo SFT fusionado, no directamente sobre el base, para reproducir los resultados. Además, se verificó que las matrices `lora_B` no fueran cero antes de publicar, descartando 13 adaptadores que no pasaron esa comprobación.

## Capacidades

- Razonamiento matemático con cadena de pensamiento comprimida a nivel extremo (L5), donde el modelo produce una única expresión colapsada en lugar de pasos intermedios verbosos.
- Generación de texto en inglés con formato de respuesta matemática en `\boxed{}`.
- Manejo de problemas de matemáticas de nivel de competición (MATH-500) con precisión del 65,2 % en decodificación greedy.
- Integración con el ecosistema PEFT: el adaptador se carga con `PeftModel` y se fusiona con el modelo base para su uso.
- Compatible con pipelines de Hugging Face para generación de texto (`text-generation`).

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo puede resolver ejercicios de nivel MATH-500 con una cadena de pensamiento extremadamente comprimida, útil en entornos donde se prioriza la latencia sobre la explicabilidad de los pasos intermedios.
- Evaluación de técnicas de compresión de razonamiento: sirve como punto de referencia para investigar cómo afecta la compresión del chain-of-thought a la precisión final en tareas de razonamiento.
- Generación de soluciones matemáticas concisas: en aplicaciones educativas o de tutoría, puede producir respuestas directas con formato `\boxed{}`, reduciendo el texto generado y el coste de inferencia.
- Prototipado de agentes matemáticos con tool calling: aunque no se documenta soporte explícito de herramientas, el adaptador puede integrarse en sistemas que requieran respuestas rápidas y compactas para subproblemas matemáticos.
- Investigación en RLHF/GRPO: el adaptador es un ejemplo práctico de entrenamiento con GRPO sobre un modelo de razonamiento, útil para estudiar configuraciones de recompensa y regularización (KL=0).
- Benchmarking de modelos de razonamiento: permite comparar el efecto de la compresión L5 frente a otros niveles (L1, L3) en la misma familia de modelos.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test, n=500) | Accuracy (exact match) | 65,2 % |

La evaluación se realizó con decodificación greedy, single-turn, sin ejemplos y sin self-consistency. El autor advierte que el harness original usaba un formato de respuesta GSM8K (`#### n`) que puntuaba erróneamente a modelos con respuestas en `\boxed{}`; los números aquí provienen de un grader específico que normaliza formas equivalentes.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0.2 GB en disco, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (7.3B parámetros) en memoria.
- Para inferencia en bf16, se estima un consumo de VRAM de al menos 16 GB (el modelo base en bf16 ocupa ~14.6 GB, más el adaptador fusionado). Una GPU con 24 GB (como RTX 3090/4090) es suficiente para inferencia en lote pequeño.
- Para entrenamiento se utilizó una NVIDIA A100 80GB, pero la inferencia puede ejecutarse en GPUs consumer de gama alta.
- Opciones de despliegue: se puede usar con `transformers` + `peft` en Python, o exportar a GGUF para ejecución con `llama.cpp` u Ollama, aunque el adaptador no se distribuye en formato GGUF.
- La latencia dependerá del hardware y de la longitud de la secuencia; al ser un adaptador sobre un modelo de 7B, el throughput esperado en una A100 es de decenas de tokens por segundo, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores o modelos de razonamiento matemático en la información proporcionada. Se puede señalar que el modelo base `Olmo-3-7B-Think` es una alternativa sin compresión, y que existen otros adaptadores del mismo proyecto para niveles L1 y L3, pero no se publican sus resultados en esta ficha. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado y evaluado exclusivamente en problemas matemáticos de tipo word problem; su rendimiento en otras tareas de razonamiento no está verificado.
- La precisión cae rápidamente con la dificultad del problema, especialmente en los niveles de compresión más altos como L5.
- Los resultados provienen de una única semilla de entrenamiento; diferencias de pocos puntos porcentuales pueden deberse al azar (el autor indica un intervalo de confianza del 95 % de ±4.4 puntos en n=500).
- Para reproducir los resultados es obligatorio apilar el adaptador sobre el modelo SFT fusionado (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`), no directamente sobre el base.
- El modelo solo soporta inglés; no se ha evaluado en otros idiomas.
- Al ser un adaptador LoRA, no se distribuye como modelo completo; requiere acceso al modelo base y a la librería `peft` para su uso.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece ninguna garantía de precisión o idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-b0-l5
- Modelo base Olmo-3-7B-Think: https://huggingface.co/allenai/Olmo-3-7B-Think
- Artículo sobre Olmo-3-7B-Think (DEV.co): https://dev.co/ai/llms/olmo-3-7b-think
- Página de ThinkLLM sobre Olmo-3-7B-Think: https://thinkllm.dev/models/olmo-3-7b-think
- Variante GGUF de un modelo similar (no oficial): https://local-ai-zone.github.io/models/olmo3-7b-math-cot.html
