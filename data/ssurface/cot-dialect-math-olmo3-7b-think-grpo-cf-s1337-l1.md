# ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l1

## Resumen

Este modelo es un adaptador LoRA publicado por ssurface (Anatolii Frolov) que ajusta el modelo base `allenai/Olmo-3-7B-Think` para resolver problemas matemáticos mediante razonamiento en lenguaje natural completo, denominado nivel de compresión L1. El adaptador se entrena con GRPO sobre un modelo SFT previo y alcanza un 58,6 % de precisión en el conjunto de evaluación MATH-500. La propuesta forma parte de una investigación sobre "dialectos de compresión de cadenas de pensamiento", que estudia cómo distintos niveles de abstracción en el razonamiento afectan al rendimiento. El modelo está pensado para tareas de razonamiento matemático de una sola vuelta, sin ejemplos previos ni autocon sistencia, y su relevancia radica en demostrar que un adaptador ligero puede modificar el estilo de razonamiento de un modelo de 7B manteniendo una precisión competitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `allenai/Olmo-3-7B-Think` (transformer de 7B con razonamiento de cadena de pensamiento) |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB; el modelo base tiene 7B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, el base puede cargarse en bfloat16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo transformer de 7B con capacidad de razonamiento explícito (cadena de pensamiento). El adaptador LoRA usa r=16 y alpha=32, y se entrena con GRPO sobre un modelo SFT fusionado que ya ha sido ajustado con problemas de MATH reexpresados a nivel L1 por un modelo profesor. El entrenamiento utiliza `trl.GRPOTrainer` con atención `sdpa`, una recompensa compuesta por `correctness` (que pondera la dificultad según el número de pasos de la solución dorada) y `format` (que exige una estructura `thinking... response` seguida de `#### <answer>`), y una pérdida tipo `dapo`. Se generan 8 respuestas por prompt, con un lote de 32 y acumulación de gradiente de 2, una longitud máxima de completación de 256 tokens, learning rate de 1e-05 y coeficiente KL de 0.04. El entrenamiento se realizó en una única NVIDIA A100 de 80 GB. Es importante destacar que el adaptador debe cargarse sobre el modelo SFT fusionado, no directamente sobre el base, para reproducir los resultados publicados.

## Capacidades

- Razonamiento matemático de una sola vuelta: resuelve problemas del conjunto MATH-500 con precisión exacta (58,6 % en greedy decoding).
- Generación de cadenas de pensamiento estructuradas: produce respuestas con un bloque de razonamiento seguido de la respuesta final en formato `#### <answer>`.
- Soporte para problemas expresados en notación LaTeX, con normalización de formas equivalentes (p. ej., `\frac{14}{3}` y `14/3` se consideran iguales).
- Capacidad multilingüe: solo inglés.
- No incluye tool calling, ni soporte de agentes, ni capacidades de visión o audio.
- El adaptador está diseñado para ser usado con el prompt "Solve this using Level 1 (Verbose). Problem: {problema}".

## Casos de uso

- Tutoría de matemáticas: el modelo puede generar explicaciones paso a paso de problemas de álgebra, cálculo o teoría de números, útiles para plataformas educativas que necesiten respuestas razonadas y verificables.
- Evaluación automática de soluciones: al normalizar respuestas LaTeX, puede integrarse en sistemas de corrección automática de exámenes o tareas de matemáticas.
- Generación de problemas con solución: dado un enunciado, el modelo produce una cadena de razonamiento completa que puede servir como plantilla para crear ejercicios con sus soluciones.
- Benchmarking de razonamiento: investigadores pueden usar este adaptador como referencia para medir el impacto de la compresión de cadenas de pensamiento en el rendimiento de modelos de 7B.
- Sistemas de preguntas y respuestas especializados: en dominios donde solo se requiera razonamiento matemático en inglés, el modelo puede integrarse en chatbots o asistentes con un prompt fijo.
- Validación de adaptadores LoRA: al ser un adaptador pequeño (0,2 GB), es adecuado para probar flujos de entrenamiento con GRPO en entornos con recursos limitados, siempre que se disponga del modelo base.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Resultado |
|---|---|---|---|
| Razonamiento matemático | MATH-500 (test) | Accuracy (exact match) | 58,6 % |

Resultado obtenido con greedy decoding, una sola vuelta, sin ejemplos previos y sin self-consistency. El autor indica que el harness original que buscaba el formato GSM8K (`#### n`) puntuaba erróneamente a estos modelos cerca del 0 %, y que los números publicados provienen de un grader consciente de LaTeX. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,2 GB), pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` completo, que en bfloat16 ocupa aproximadamente 14 GB de VRAM.
- Con cuantización de 4 bits, el modelo base cabría en una GPU de consumo con 8 GB de VRAM (p. ej., RTX 3060/4060), aunque no se han publicado pruebas oficiales.
- Para reproducir el entrenamiento se necesita una GPU con al menos 80 GB de VRAM (A100), según la configuración reportada.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` y `peft`; también es compatible con frameworks que soporten LoRA, aunque no se mencionan vLLM, llama.cpp ni Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores o modelos de razonamiento matemático en la documentación proporcionada. El único dato disponible es el resultado del propio adaptador (58,6 % en MATH-500), sin referencia al rendimiento del modelo base sin adaptar ni a alternativas como Llama-3-8B-Instruct o Mistral-7B-Instruct en la misma tarea.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas de matemáticas; no es adecuado para otras tareas de lenguaje general.
- La precisión cae con la dificultad del problema, y el descenso es más acusado en los niveles de compresión más agresivos.
- El adaptador debe cargarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1`); cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- Los resultados provienen de una única semilla, por lo que diferencias de unos pocos puntos porcentuales pueden deberse al ruido estadístico (intervalo de confianza del 95 % de aproximadamente ±4,4 puntos en n=500).
- Solo soporta inglés; no se ha evaluado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los datos de entrenamiento.
- No se han reportado sesgos específicos, pero al estar entrenado con MATH, puede heredar sesgos presentes en ese conjunto de datos.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l1)
- [Modelo base: allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Adaptador SFT previo: ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1](https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1)
- [Dataset MATH-500](https://huggingface.co/datasets/HuggingFaceH4/MATH-500)
- Cita del autor: Frolov, Anatolii. "Chain-of-Thought Compression Dialects", 2026.
