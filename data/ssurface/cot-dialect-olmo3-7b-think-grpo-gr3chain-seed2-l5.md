# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed2-l5

## Resumen

Este repositorio contiene un adaptador LoRA denominado `cot-dialect-olmo3-7b-think-grpo-gr3chain-seed2-l5`, desarrollado por ssurface (Anatolii Frolov) como parte de un estudio sobre compresión de cadenas de razonamiento (Chain-of-Thought Compression Dialects). El adaptador se aplica sobre el modelo base `allenai/Olmo-3-7B-Think`, un modelo de 7B parámetros de AllenAI entrenado en el corpus Dolma 3 y post-entrenado en Dolci, con una variante especializada en razonamiento mediante cadenas de pensamiento largas.

La contribución principal de este adaptador es reducir la cadena de razonamiento a un nivel de compresión extremo (nivel L5), donde la cadena se colapsa a una única expresión aritmética, por ejemplo `18/3*2=12`, frente a las cadenas de cientos de caracteres del modelo original. En concreto, este modelo es una **ablación** diseñada para comparar el diseño de recompensas en el entrenamiento con GRPO: utiliza una recompensa adicional `gr3` que reescala multiplicativamente las recompensas positivas, y se publica para que los resultados del paper puedan reproducirse sin depender de la palabra del autor.

El modelo está entrenado exclusivamente sobre GSM8K (problemas de matemáticas con palabras) y alcanza una precisión del 66,5 % en el conjunto de test con decodificación greedy y sin ejemplos. Es relevante para la comunidad de investigación en eficiencia de razonamiento, ya que demuestra que es posible comprimir drásticamente las cadenas de pensamiento manteniendo una precisión razonable, aunque con una caída notable respecto al modelo sin comprimir.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base Olmo-3-7B-Think) + adaptador LoRA |
| Parametros totales | Modelo base: 7B; adaptador LoRA: r=16, alpha=32 (número exacto de parámetros no disponible) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Olmo 3 soporta contexto largo, pero no se especifica el valor) |
| Tipos de cuantizacion | No especificado; el modelo base admite cuantización (p. ej. 4-bit, 8-bit) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base `allenai/Olmo-3-7B-Think` es un transformer decoder denso de 7B parámetros, preentrenado en el corpus Dolma 3 y post-entrenado en los datasets Dolci. La variante Think está específicamente entrenada para generar cadenas de razonamiento largas antes de dar la respuesta final, lo que mejora el rendimiento en tareas de matemáticas y código.

El adaptador LoRA se entrena mediante GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado a nivel L5. El dataset de entrenamiento consiste en 6993 ejemplos de GSM8K train, re-expresados por un modelo teacher a un nivel de compresión L5, donde la mediana de longitud de la cadena dentro de `thinking` es de 16 caracteres (frente a 532 caracteres en L1, un rango de 33x). La función de recompensa combina cuatro componentes: `correctness` (basada en el número de pasos de la solución dorada), `format` (exige una estructura `thinking...response` y `#### <answer>`), `chain` (un verificador que comprueba que la aritmética interna es correcta) y `gr3` (reescalado multiplicativo de recompensas positivas, con un mínimo de 0,3).

El entrenamiento se realizó con `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`, sin kernels fusionados, porque el camino fusionado producía adaptadores con matrices `lora_B` todas a cero. Todos los adaptadores publicados fueron verificados con `lora_B != 0`. La configuración incluye 8 generaciones por prompt, batch 32x2 acumulado, máximo de 256 tokens de completado, learning rate 1e-05 y coeficiente KL de 0,01, en una única NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento extremadamente comprimidas (nivel L5, una sola expresión colapsada).
- Generación de texto en inglés, limitada al dominio de problemas aritméticos con palabras.
- Soporte de formato de respuesta estructurado (`thinking...response` y `#### <answer>`).
- No soporta tool calling ni function calling (no se menciona en la documentación).
- No es un modelo de propósito general; está especializado en matemáticas de nivel GSM8K.
- Capacidad de razonamiento multi-paso, aunque con cadenas muy cortas (16 caracteres de mediana).

## Casos de uso

- Investigación en compresión de cadenas de razonamiento: permite estudiar el equilibrio entre precisión y longitud de la cadena de pensamiento, y cómo afecta el diseño de recompensas en RL.
- Comparación de metodologías de entrenamiento: sirve como referencia para reproducir los resultados del paper sobre diseño de recompensas en GRPO (componente `gr3`).
- Inferencia de bajo coste para problemas aritméticos simples: al reducir la cadena a una expresión corta, se reduce el número de tokens generados y por tanto la latencia y el coste computacional.
- Evaluación de robustez de modelos comprimidos: permite medir la caída de precisión en problemas de dificultad creciente.
- Generación de datos sintéticos para entrenar modelos más eficientes: las cadenas comprimidas pueden usarse como supervisión para destilar modelos más pequeños.
- Benchmarking de técnicas de verificación aritmética: el componente `chain` de la recompensa valida la corrección interna de las cadenas, lo que puede transferirse a otros dominios.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en el model-index:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 66,5 % |

Condiciones: decodificación greedy, una sola pasada, sin ejemplos, sin self-consistency. No se han publicado resultados comparativos con el modelo base sin comprimir ni con otros niveles de compresión dentro de este repositorio.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,2 GB, pero debe cargarse junto al modelo base `allenai/Olmo-3-7B-Think` (7B parámetros).
- Para inferencia en bf16, se requieren aproximadamente 14 GB de VRAM (modelo completo). Con cuantización 4-bit, la VRAM necesaria se reduce a unos 4-5 GB.
- GPU recomendada: una NVIDIA RTX 4090 (24 GB) o A100 80GB para entrenamiento; para inferencia, una GPU consumer con al menos 8 GB de VRAM puede bastar si se usa cuantización.
- El despliegue puede realizarse con `transformers` + `peft` (cargando primero el adaptador SFT L5 y luego este adaptador), o exportando el modelo fusionado a formatos como GGUF para usarlo con llama.cpp u Ollama.
- No se proporcionan datos de latencia o throughput en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente dedicados a la compresión de cadenas de razonamiento. Como referencia, se puede comparar con el modelo base sin comprimir:

| Modelo | Parámetros | Contexto | GSM8K (test) | Licencia |
|---|---|---|---|---|
| `allenai/Olmo-3-7B-Think` (base) | 7B | Largo (no especificado) | No disponible en esta ficha | Apache-2.0 |
| Este adaptador (L5 + GRPO) | 7B + LoRA | No disponible | 66,5 % | Apache-2.0 |

El modelo base alcanza típicamente precisiones superiores al 90 % en GSM8K, pero con cadenas de razonamiento largas. Este adaptador sacrifica precisión por compresión extrema, lo que lo hace adecuado para escenarios donde el coste de generación es crítico.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matemáticas con palabras (GSM8K); no es adecuado para tareas generales de lenguaje.
- La precisión cae rápidamente con la dificultad del problema, especialmente en los niveles de compresión más altos.
- Es una ablación diseñada para responder una pregunta concreta sobre diseño de recompensas; puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`).
- Requiere cargar primero el adaptador SFT L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) sobre el modelo base, y luego este adaptador; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados declarados.
- El resultado de 66,5 % proviene de una única semilla; diferencias de un par de puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95 % de aproximadamente ±2,7 puntos porcentuales para n=1317).
- El modelo puede alucinar respuestas cuando el problema excede su capacidad, especialmente en los niveles comprimidos.
- No se han evaluado sesgos sociales o culturales; el modelo solo ha sido entrenado con datos en inglés de GSM8K.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed2-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Modelo principal del nivel L5 (referencia): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Adaptador SFT L5 (requerido para la carga): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
