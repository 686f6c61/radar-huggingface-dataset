# ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-l1

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario `ssurface` (Anatolii Frolov) que ajusta el modelo base `allenai/Olmo-3-7B-Think` para razonar en un "dialecto" de compresión de cadena de pensamiento (chain-of-thought, CoT) de nivel L1, es decir, con explicaciones verbales completas y detalladas en lenguaje natural. El objetivo de la línea de investigación es estudiar cómo el nivel de verbosidad del razonamiento afecta a la precisión en tareas matemáticas, comprimiendo o expandiendo los pasos intermedios sin perder capacidad de resolución.

El adaptador se entrena con GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo que ya había sido ajustado con datos de MATH reexpresados a nivel L1 por un modelo profesor. El resultado es un modelo especializado en razonamiento matemático de una sola vuelta, evaluado en el conjunto MATH-500 con una precisión del 58 % (exact match, decodificación greedy, sin ejemplos ni self-consistency). El adaptador pesa 0.2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, pensado para cargarse con la librería PEFT sobre el modelo base.

La relevancia de esta publicación radica en que aborda un problema poco explorado: la compresión controlada del razonamiento intermedio. En lugar de entrenar un modelo desde cero, se parte de un modelo de razonamiento ya existente y se le enseña a expresar sus cadenas de pensamiento en un dialecto concreto, lo que permite comparar niveles de detalle y medir su impacto en la precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre transformer decoder `allenai/Olmo-3-7B-Think` |
| Parametros totales | no disponible (el adaptador LoRA tiene dimensiones r=16, alpha=32; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se indica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se publican en bf16, sin cuantizacion declarada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7B parámetros con arquitectura transformer decoder, entrenado por AI2 con énfasis en razonamiento explícito (genera bloques de pensamiento antes de la respuesta). El adaptador LoRA tiene rango 16 y alpha 32, y se entrena con GRPO usando el `trl.GRPOTrainer` sobre el modelo SFT fusionado (no directamente sobre el base). El entrenamiento utiliza atención `sdpa` (scaled dot-product attention) en lugar de kernels fusionados; el autor advierte que los kernels fusionados produjeron adaptadores con matrices `lora_B` nulas, por lo que todos los adaptadores publicados se verificaron con `lora_B != 0`.

Los datos de entrenamiento consisten en problemas del conjunto MATH reexpresados a nivel L1 por un modelo profesor, manteniendo las reglas de notación idénticas a los dialectos de GSM8K y cambiando la convención de respuesta a `\boxed{}`. La recompensa combina dos componentes: `correctness` (acierto de la respuesta, ponderado por el número de pasos de la solución dorada) y `format` (exigencia de un bloque ` thinking... response` seguido de `#### <answer>`). El entrenamiento usa 8 generaciones por prompt, batch 32 con 2 acumulaciones, longitud máxima de completación de 256 tokens, tasa de aprendizaje 1e-5, coeficiente KL 0.04 y pérdida de tipo DAPO. Se empleó una única NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático de una sola vuelta con cadena de pensamiento explícita en formato ` thinking... response`.
- Generación de texto en inglés con estructura conversacional (bloques de pensamiento y respuesta final).
- Soporte de notación LaTeX en las respuestas (el evaluador normaliza formas equivalentes como `\frac{14}{3}` y `14/3`).
- No soporta tool calling, function calling ni interacción con APIs.
- No soporta visión ni audio; es exclusivamente texto.
- Capacidad multilingüe limitada al inglés (según la model card).

## Casos de uso

- Investigación en compresión de cadenas de pensamiento: el modelo permite estudiar cómo el nivel de detalle verbal del razonamiento afecta a la precisión en tareas matemáticas, comparando dialectos L1, L3 y L5.
- Evaluación de robustez del razonamiento: al fijar el dialecto L1, se puede aislar el efecto de la verbosidad sobre la exactitud, útil para diseñar mejores estrategias de prompting.
- Generación de explicaciones paso a paso para problemas matemáticos: el modelo produce razonamientos completos y legibles, adecuados para sistemas de tutoría o generación de soluciones didácticas.
- Benchmarking de modelos de razonamiento: sirve como referencia para comparar adaptadores de la misma familia o modelos base con distintos niveles de compresión.
- Análisis de degradación por dificultad: el autor indica que la precisión cae con la dificultad del problema, lo que permite estudiar los límites de la compresión en problemas complejos.
- Experimentos de fine-tuning con GRPO: el adaptador es un ejemplo reproducible de entrenamiento con recompensa mixta (correctness + format) sobre un modelo de razonamiento, útil como punto de partida para investigaciones similares.

## Benchmarks y rendimiento

El autor declara un único resultado oficial en la model card, medido sobre MATH-500 (n=500, split test) con decodificación greedy, una sola vuelta, sin ejemplos y sin self-consistency:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test) | Accuracy (exact match) | 58.0 % |

El autor advierte que el evaluador utilizado es sensible a LaTeX y normaliza formas equivalentes; un harness anterior que buscaba el formato `#### n` de GSM8K puntuaba incorrectamente modelos similares cerca del 0 % cuando en realidad rondaban el 60 %. No se proporcionan comparaciones con otros modelos en la misma evaluación.

## Requisitos de hardware

- El adaptador LoRA pesa 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parámetros, lo que domina los requisitos de memoria.
- VRAM estimada: al menos 16 GB para inferencia en bf16 con el modelo completo; con cuantización (por ejemplo, 4 bits) podría reducirse a unos 8-10 GB, aunque no se indica soporte oficial para cuantización.
- GPU recomendada: una NVIDIA RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia en bf16; el entrenamiento se realizó en una A100 80GB.
- Despliegue: se usa `transformers` + `peft` (cargando primero el adaptador SFT `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1`, fusionándolo y luego cargando este adaptador GRPO). No se menciona compatibilidad con vLLM, llama.cpp u Ollama; al ser un adaptador LoRA, requiere soporte PEFT en el runtime.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El autor no publica resultados del modelo base sin adaptador ni de otros adaptadores de la misma serie (L3, L5) en las mismas condiciones. Como referencia contextual, modelos de razonamiento matemático de 7B como Qwen2.5-Math-7B o DeepSeek-Math-7B suelen obtener resultados superiores al 60 % en MATH-500, pero no se han evaluado aquí bajo el mismo protocolo, por lo que cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matemáticas de una sola vuelta; no es adecuado para tareas generales de razonamiento o diálogo.
- La precisión cae con la dificultad del problema, y la caída es más rápida en los niveles comprimidos (aunque este adaptador es el nivel L1, el más verboso).
- El adaptador debe cargarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1`), no directamente sobre `allenai/Olmo-3-7B-Think`; cargarlo sobre el base no reproducirá el resultado declarado.
- Resultados con una sola semilla; diferencias de un par de puntos porcentuales están dentro del ruido (intervalo de confianza del 95 % de ~2.7 pp con n=1317 y ~4.4 pp con n=500).
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación en razonamientos complejos, especialmente en problemas con muchos pasos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think tiene su propia licencia (también Apache 2.0 según AI2), que debe verificarse para uso en producción.
- No se documentan sesgos específicos, pero al entrenarse solo con datos de MATH, puede presentar sesgos de formato y de estilo de razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
