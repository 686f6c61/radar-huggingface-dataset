# ssurface/cot-dialect-math-olmo3-7b-think-grpo-gr3-l5

## Resumen

El modelo `cot-dialect-math-olmo3-7b-think-grpo-gr3-l5` es un adaptador LoRA desarrollado por ssurface que se apila sobre el modelo base `allenai/Olmo-3-7B-Think` de AllenAI. Forma parte de una colección de investigación sobre "dialectos de compresión de chain-of-thought" que explora cómo los modelos de razonamiento pueden operar con cadenas de pensamiento comprimidas a distintos niveles de expresión simbólica. Este adaptador en particular entrena al modelo para razonar a nivel L5, el nivel más extremo de compresión, donde el razonamiento se colapsa en una única expresión.

El modelo aborda el problema de la verbosidad excesiva en los razonamientos generados por modelos de lenguaje: en lugar de producir cadenas de pensamiento largas, aprende a razonar de forma ultracompacta manteniendo precisión matemática. Se entrena con GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo, con un esquema de recompensas que combina corrección, formato y un factor de reescalado de longitud. El adaptador ocupa 0.2 GB, se distribuye bajo licencia Apache 2.0 y soporta exclusivamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Olmo-3-7B-Think (transformer decoder) |
| Parámetros totales | No disponible (adaptador de 0.2 GB; modelo base de 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantización | No disponible (adaptador en safetensors, entrenado en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con rango r=16 y alpha=32 sobre el modelo base Olmo-3-7B-Think. El entrenamiento se realiza en dos etapas: primero un modelo SFT se entrena sobre problemas de MATH re-expresados a nivel L5 por un modelo profesor (con reglas de notación idénticas a los dialectos GSM8K y convención de respuesta `\boxed{}`), y posteriormente este adaptador se entrena con GRPO sobre el modelo SFT fusionado.

El entrenamiento GRPO usa `trl.GRPOTrainer` sobre `transformers` stock con atención `sdpa` (sin kernels fusionados, que producían adaptadores con matrices `lora_B` a cero). La función de recompensa combina tres componentes: `correctness` (basado en el recuento de pasos de la solución dorada, de modo que los problemas más difíciles valen más), `format` (exige una estructura `thinking... response` seguida de `#### <answer>`) y `gr3` (reescalado multiplicativo de longitud de recompensas positivas, con suelo en 0.3). Se usa pérdida tipo `dapo`, 8 generaciones por prompt, batch de 32 con 2 acumulaciones, máximo de 256 tokens de completado, learning rate de 1e-05 y coeficiente KL (beta) de 0.04. El entrenamiento se realizó en una única NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático con chain-of-thought comprimido a nivel L5, produciendo una única expresión colapsada como razonamiento.
- Generación de texto (pipeline `text-generation`) con formato de respuesta estructurado: bloque `thinking... response` seguido de `#### <answer>`.
- Especialización en problemas matemáticos de palabras (word problems) en inglés, evaluado sobre MATH-500.
- Capacidad de operar con restricciones estrictas de longitud de generación (256 tokens máximos de completado).
- Normalización de respuestas matemáticas equivalente a un grader consciente de LaTeX (acepta `\frac{14}{3}` y `14/3` como equivalentes).
- No dispone de soporte de tool calling, visión, audio ni otras modalidades: es un adaptador de razonamiento puramente textual.

## Casos de uso

- **Investigación en compresión de chain-of-thought**: el adaptador permite estudiar cómo un modelo de 7B mantiene precisión cuando el razonamiento se comprime a una única expresión, con aplicación directa a publicaciones sobre eficiencia de inferencia y destilación de razonamiento.
- **Reducción de latencia en sistemas de QA matemática**: al limitar la generación a 256 tokens y producir razonamientos ultracompactos, el modelo reduce el tiempo de respuesta frente a modelos que generan cadenas de pensamiento extensas, útil en entornos con requisitos estrictos de latencia.
- **Generación de soluciones matemáticas para materiales educativos**: puede generar soluciones paso a paso en formato compacto para problemas de nivel MATH, con respuestas en `\boxed{}` listas para verificación automática.
- **Evaluación de técnicas de RL (GRPO) sobre razonamiento**: sirve como caso de estudio reproducible para investigadores que quieran analizar el impacto de recompensas compuestas (corrección, formato, reescalado de longitud) en el rendimiento de razonamiento matemático.
- **Benchmarking de robustez de notación matemática**: el modelo se evalúa con un grader consciente de LaTeX que normaliza formas equivalentes, lo que lo hace adecuado para sistemas que necesitan comparar respuestas matemáticas en distintos formatos de notación.
- **Sistemas de tutoría inteligente con restricciones de coste por token**: en despliegues donde el coste de inferencia es relevante, el razonamiento comprimido reduce el número de tokens generados por consulta sin sacrificar excesivamente la precisión.
- **Análisis comparativo de dialectos de notación**: al pertenecer a una familia de dialectos (L1, L3, L5), permite comparar sistemáticamente cómo distintos niveles de compresión afectan al rendimiento en tareas matemáticas.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test, n=500) | Accuracy (exact match) | 54.6% |

Condiciones de evaluación: decodificación greedy, single-turn, sin ejemplos (no exemplars) y sin self-consistency. El autor advierte que la puntuación se obtuvo con un grader consciente de LaTeX del proyecto, que normaliza formas equivalentes; un harness previo que buscaba el formato `#### n` de GSM8K puntuaba erróneamente a modelos similares en torno al 0% cuando en realidad rondaban el 60%. No se han publicado resultados comparativos con el modelo base sin adaptador ni con otros adaptadores de la colección.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (según la configuración declarada).
- Inferencia: requiere cargar el modelo base Olmo-3-7B-Think (7B parámetros) más el adaptador LoRA (~0.2 GB adicionales).
- El modelo base en bf16 requiere aproximadamente 14-16 GB de VRAM; con cuantización GGUF (disponible para el base a través de unsloth) puede ejecutarse en GPUs consumer con 8-12 GB de VRAM, como RTX 3080/4070 o superiores.
- El adaptador debe cargarse con `transformers` + `peft` (PeftModel), fusionándose primero con el adaptador SFT previo (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`) y después con este adaptador GRPO.
- Opciones de despliegue: `transformers` con atención `sdpa`, o `llama.cpp`/Ollama si se fusiona el adaptador con el modelo base y se exporta a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para modelos comparables en la información proporcionada. El modelo forma parte de una colección de adaptadores de compresión de CoT del mismo autor, que incluye al menos la variante SFT (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`) necesaria como paso previo, pero no se publican sus puntuaciones individuales. Tampoco se dispone de resultados del modelo base `allenai/Olmo-3-7B-Think` sin adaptador en MATH-500 bajo las mismas condiciones de evaluación.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matemáticos de palabras en inglés; no es un modelo de propósito general.
- La precisión cae con la dificultad del problema, y la caída es más pronunciada en los niveles de compresión extremos como L5.
- El adaptador no funciona cargado directamente sobre el modelo base: requiere primero cargar y fusionar el adaptador SFT (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`) y después este adaptador GRPO. Cargarlo sobre el base sin el paso SFT no reproduce los resultados publicados.
- Evaluado con una única semilla; diferencias de un par de puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95% con semianchura de ~4.4 puntos porcentuales a n=500).
- El formato de respuesta es rígido: debe seguir la estructura `thinking... response` y terminar con `#### <answer>`; desviaciones pueden penalizar la recompensa de formato.
- Riesgo de alucinación en problemas fuera del dominio de entrenamiento o con notación matemática poco habitual.
- Solo soporta inglés; no hay evidencia de rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación con alcance limitado a razonamiento matemático.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-gr3-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Cuantización GGUF del modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Adaptador SFT previo (requisito): https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
