# ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l3

## Resumen

`ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l3` es un adaptador LoRA (librería PEFT) diseñado para modificar el comportamiento del modelo base `allenai/Olmo-3-7B-Think`, un modelo de razonamiento de 7.3B parámetros desarrollado por el Allen Institute for AI. El adaptador, creado por el usuario `ssurface` (identificado como Anatolii Frolov en la cita), induce un "dialecto" de compresión de chain-of-thought de nivel L3, en el que el modelo debe razonar con una única asignación nombrada por línea. El objetivo es reducir la verbosidad del razonamiento sin perder precisión, manteniendo la corrección matemática.

El modelo está especializado en problemas matemáticos y se entrenó mediante GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo del mismo autor. Se evaluó en el conjunto MATH-500, alcanzando un 68.6% de precisión exacta con decodificación greedy y sin ejemplos. Su relevancia actual reside en la investigación sobre compresión de cadenas de razonamiento y en la posibilidad de desplegar razonamiento matemático eficiente en entornos con recursos limitados, ya que el adaptador es muy ligero (0.2 GB) y se apila sobre un modelo base de código abierto con licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre `allenai/Olmo-3-7B-Think` (transformer decoder causal, 7.3B parámetros) |
| Parametros totales | No disponible (el adaptador añade un número reducido de parámetros; el modelo base tiene ~7.3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base tiene versiones GGUF (p. ej. `unsloth/Olmo-3-7B-Think-GGUF`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo fusionado resultante de aplicar un adaptador SFT previo (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3`) al modelo base `allenai/Olmo-3-7B-Think`. Esto es crucial: el adaptador GRPO no funciona directamente sobre el base sin el paso SFT intermedio. El entrenamiento utiliza `trl.GRPOTrainer` con atención `sdpa` (sin kernels fusionados) y una función de recompensa basada únicamente en la corrección de la respuesta (`correctness`), que pondera el número de pasos de la solución dorada para que los problemas más difíciles aporten más señal. Se emplea loss tipo `dapo`, 8 generaciones por prompt, batch de 32 con acumulación de gradientes de 2, máximo de 256 tokens de completación, learning rate de 1e-05 y coeficiente KL de 0.04. El adaptador LoRA usa r=16 y alpha=32. El entrenamiento se realizó en una única NVIDIA A100 de 80 GB. El autor destaca que los kernels fusionados producían matrices `lora_B` todas a cero (adaptadores inertes), por lo que se verificó manualmente que `lora_B != 0` en todos los adaptadores publicados.

Los datos de entrenamiento consisten en problemas de MATH reexpresados a nivel L3 por un modelo profesor, manteniendo las reglas de notación de los dialectos GSM8K pero con respuestas en formato `\boxed{}`. El conjunto de prompts usado es `math_grpo.json`.

## Capacidades

- Razonamiento matemático simbólico: resuelve problemas de álgebra, cálculo, probabilidad y otras áreas presentes en MATH-500, produciendo cadenas de razonamiento comprimidas (nivel L3).
- Generación de texto con chain-of-thought: genera explicaciones paso a paso en formato de asignaciones nombradas por línea, lo que reduce la verbosidad respecto al razonamiento estándar.
- Razonamiento con decodificación greedy: alcanza 68.6% de precisión exacta en MATH-500 sin usar self-consistency ni ejemplos.
- Compatibilidad con el ecosistema Hugging Face: se integra con `transformers` y `peft`, permitiendo cargar, fusionar y desplegar con las herramientas estándar.
- Multilingüe: no, solo inglés (aunque puede procesar texto en otros idiomas, no está entrenado para ello).
- No dispone de capacidades de tool calling, visión, audio ni agentes multi-paso más allá del razonamiento matemático.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar soluciones paso a paso para problemas de nivel universitario, ayudando a estudiantes a comprender el proceso. Su razonamiento comprimido reduce el coste de generación, lo que lo hace adecuado para aplicaciones educativas con presupuesto de inferencia limitado.
- Verificación de razonamiento en pipelines de IA: puede usarse como componente de validación para comprobar si una solución matemática propuesta por otro modelo es correcta, gracias a su capacidad de razonar de forma concisa y precisa.
- Investigación en compresión de chain-of-thought: sirve como punto de referencia para estudiar cómo la compresión del razonamiento afecta a la precisión, comparando dialectos L1, L3 y L5 en tareas matemáticas.
- Generación de documentación técnica con pasos de cálculo: en entornos de ingeniería o finanzas, puede producir explicaciones de fórmulas y resultados numéricos de forma estructurada y legible.
- Evaluación de modelos de razonamiento: al estar especializado en MATH-500, puede emplearse como generador de soluciones de referencia para comparar otros modelos en tareas de razonamiento matemático.
- Prototipado rápido de asistentes de matemáticas: al ser un adaptador ligero sobre un base de 7B, se puede desplegar en una sola GPU de gama media, permitiendo iterar rápidamente en aplicaciones de demostración.
- Automatización de problemas de matemáticas discretas en logística: puede resolver problemas de optimización combinatoria o de teoría de números, aunque su rendimiento decae con la dificultad, por lo que se recomienda para problemas de nivel intermedio.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, medido con un grader específico que normaliza formas equivalentes (p. ej. `\frac{14}{3}` == `14/3`). La evaluación se realizó con decodificación greedy, single-turn, sin ejemplos y sin self-consistency.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test, n=500) | Accuracy (exact match) | 68.6% |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor advierte que la precisión cae con la dificultad del problema y que diferencias de un par de puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95% de aproximadamente ±4.4 puntos en n=500).

## Requisitos de hardware

- El adaptador LoRA es muy pequeño (0.2 GB), pero requiere cargar el modelo base completo. Para inferencia en bfloat16 se necesitan aproximadamente 14-16 GB de VRAM (el modelo base tiene ~7.3B parámetros).
- Con cuantización de 4 bits (p. ej. mediante GGUF o bitsandbytes) se puede reducir el requisito a unos 4-5 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), RTX 3090/4090 (24 GB) para bf16 sin cuantizar, o GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), `vLLM` (con soporte de LoRA), o exportación a GGUF tras fusionar el adaptador para usar con `llama.cpp` u `Ollama`.
- La latencia dependerá del hardware y la cuantización; con una RTX 4090 y cuantización 4 bits, se pueden esperar decenas de tokens por segundo para generaciones de hasta 256 tokens.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | MATH-500 | Licencia |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l3` | Olmo-3-7B-Think | 7.3B + LoRA | No disponible | 68.6% | Apache-2.0 |
| `Alelcv27/Olmo3-7B-Math-CoT` | Olmo-3-7B-Instruct | 7B | No disponible | No publicado | Apache-2.0 |
| `allenai/Olmo-3-7B-Think` (base) | — | 7.3B | No disponible | No publicado | Apache-2.0 |

No se dispone de datos de rendimiento comparables para los otros modelos. El adaptador se distingue por su enfoque en compresión de chain-of-thought y por requerir un paso SFT previo antes de su aplicación.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matemáticos de nivel universitario; su rendimiento en otras tareas de razonamiento general no está validado.
- La precisión disminuye rápidamente con la dificultad del problema, especialmente en los niveles de compresión más agresivos.
- El adaptador no funciona directamente sobre el modelo base `allenai/Olmo-3-7B-Think`; es necesario cargar primero el adaptador SFT correspondiente (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3`) y fusionarlo antes de aplicar este adaptador GRPO.
- Solo soporta inglés; no se ha evaluado en otros idiomas.
- Riesgo de alucinación en razonamiento: como todo modelo de lenguaje, puede producir soluciones plausibles pero incorrectas, especialmente en problemas complejos.
- La longitud de contexto no se ha especificado; se recomienda verificar la del modelo base antes de usarlo con entradas largas.
- Los resultados de benchmarks provienen de una única semilla y de un grader propio del autor; pueden no ser reproducibles con otras herramientas de evaluación.
- No se han publicado resultados de seguridad o sesgos; se desconoce su comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT previo: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3
- Versión GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Artículo de referencia sobre Olmo-3-7B-Think (llm.co): https://llm.co/llms/olmo-3-7b-think
- Análisis de Olmo-3-7B-Think (DEV.co): https://dev.co/ai/llms/olmo-3-7b-think
- Modelo similar `Alelcv27/Olmo3-7B-Math-CoT`: https://huggingface.co/Alelcv27/Olmo3-7B-Math-CoT
