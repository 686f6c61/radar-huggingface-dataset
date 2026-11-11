# xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic

## Resumen

Este checkpoint es una variante "decensored" (también llamada abliterated o heretic) del modelo `ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming`, generada por el usuario `xtools-at` mediante la herramienta Heretic v2.2.0.dev0. El modelo base pertenece a la familia Qwen3.5 de Alibaba (0.8B parámetros, multimodal image-text-to-text), y a su vez deriva de un experimento de "weight-space programming": un LLM de frontera ("Astra") leyó los pesos de Qwen3.5-0.8B, diagnosticó una patología de repetición/bucle y editó manualmente 131.072 pesos (64 columnas de salida MLP en las capas 15 y 19, `down_proj`) para corregirla, sin descenso de gradiente ni fine-tuning.

La contribución de `xtools-at` consiste en aplicar una ablación de rango arbitrario (ARA) sobre ese checkpoint para reducir los rechazos (refusals) del modelo, pasando de 97/100 rechazos en el original a 9/100 en esta versión, con una divergencia KL de 0,0744 respecto al modelo base. La intervención se aplica entre las capas 5 y 23 con pesos concretos de preservación y corrección documentados en la model card.

Es relevante ahora por tres motivos: demuestra que la edición directa de pesos (sin entrenamiento) puede corregir patologías de generación de forma reproducible y verificable por hash; muestra que la ablación tipo Heretic es aplicable incluso a modelos pequeños multimodales; y publica un pipeline de reproducción completo (scripts, diff bit-exacto y verificación sha256) que permite auditar cada tensor modificado. El modelo tiene 852.985.920 parámetros reales según safetensors y un repo de 1,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; arquitectura interna exacta no disponible |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de uso configura `max_model_len=34816` en vLLM |
| Tipos de cuantizacion | no disponible (repo en safetensors bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen3.5 con 0,8B parámetros, exportado en safetensors y compatible con transformers y vLLM. La modificación principal del checkpoint base no proviene de entrenamiento: "Astra" (un LLM de frontera) leyó los pesos, identificó un comportamiento patológico de repetición/bucle en tareas matemáticas y editó directamente 131.072 pesos en las capas 15 y 19 (`down_proj` del MLP, 64 columnas de salida cada una). No hubo descenso de gradiente, fine-tuning ni RLHF en esa fase. El diff bit-exacto está publicado en `RikiyaT/lm_understand-logs` (`exp8_math/runs/p50c/edit/`) y la reconstrucción se verifica por sha256 contra el checkpoint evaluado.

Sobre ese checkpoint, `xtools-at` aplica una ablación de rango arbitrario (ARA) con Heretic v2.2.0.dev0, intervención que modifica el comportamiento de rechazo sin entrenamiento adicional. Los parámetros publicados son: `start_layer_index=5`, `end_layer_index=23`, `preserve_good_behavior_weight=0.8805`, `steer_bad_behavior_weight=0.0003`, `overcorrect_relative_weight=0.3772` y `neighbor_count=11`. La model card indica que el proceso es reproducible y que el pipeline completo (reconstrucción, verificación por hash y evaluación) se ejecutó en Hugging Face Jobs y en una NVIDIA H200 con vLLM 0.33.0, transformers 5.20.2 y math-verify 0.9.0. Una salvedad documentada: el experimento original evaluó una exportación solo-texto, mientras que este checkpoint es la release multimodal completa; los tensores del modelo de lenguaje son idénticos (verificados por hash) y la torre de visión no se usa con prompts de texto.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat de Qwen y modo thinking activable (`enable_thinking=True`).
- Razonamiento matemático paso a paso con salida en `\boxed{}`; el ajuste de pesos corrige el bucle degenerativo del modelo base en problemas matemáticos.
- Procesamiento image-text-to-text (pipeline declarado en Hugging Face), aunque la torre de visión no interviene en prompts de texto.
- Reducción drástica de rechazos: 9/100 en esta versión frente a 97/100 en el original, según la model card.
- Compatibilidad con inferencia en vLLM y transformers; tags `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible más allá del modo thinking.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales: edición de pesos reproducible y verificable por hash; ausencia de entrenamiento en la cadena de modificación.

## Casos de uso

- Razonamiento matemático automatizado: el modelo resuelve problemas tipo MATH-500 con precisión del 51,0% (frente al 5,0% del base en el smoke test de 25 problemas), por lo que es adecuado para pipelines de verificación simbólica con math-verify y grading del último `\boxed{}`.
- Evaluación de técnicas de edición de pesos: sirve como caso de estudio reproducible para investigar weight-space programming, ablación ARA y decensoring, con diff bit-exacto y verificación sha256 disponibles.
- Investigación sobre rechazos y alineación: la diferencia 97/100 → 9/100 con KL de 0,0744 permite medir el coste de comportamiento de la ablación en modelos pequeños.
- Despliegue en entornos con recursos limitados: con 0,8B parámetros y 1,8 GB de repo, cabe en GPUs de consumo para prototipos de chat y generación de texto.
- Generación de texto con contexto largo moderado: el ejemplo oficial usa `max_model_len=34816`, útil para conversaciones multi-turno o problemas con cadenas de razonamiento extensas.
- Pruebas de robustez frente a bucles degenerativos: comparar base vs editado en tareas de generación abierta para detectar repeticiones y truncamientos a 32k tokens (31,6% de respuestas cortadas en este modelo).
- Integración en demos interactivas: existe un Space público (`akhaliq/weight-space-programming-demo`) que compara en vivo el base con el editado, útil para material docente.

## Benchmarks y rendimiento

Datos publicados en la model card, protocolo del post original (vLLM, thinking on, temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, máximo 32.768 tokens nuevos, seed 0, grading con math-verify 0.9.0 sobre el último `\boxed{}`):

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Refusals (sobre 100) | 9/100 | 97/100 |
| Divergencia KL | 0,0744 | 0 (por definición) |
| MATH-500 accuracy | 51,0% (post: 48,1) | 5,0% (smoke de 25 problemas; post: 7,9) |
| Respuestas cortadas a 32k tokens | 31,6% (post: 33,1) | 95% (smoke; post: 93,0) |

La evaluación completa de MATH-500 comprende 500 problemas × 4 muestras = 2.000 generaciones (43,4M tokens generados, 51 minutos en una H200). Los resultados por problema y generaciones de muestra están en el directorio `eval/` del repo del checkpoint base.

## Requisitos de hardware

- VRAM estimada: con 852.985.920 parámetros en bfloat16, el peso ronda 1,7 GB; en fp16 similar. La VRAM efectiva depende del contexto configurado (el ejemplo oficial usa `max_model_len=34816`, lo que incrementa la memoria de KV cache). Cifras exactas de VRAM total no disponibles.
- GPU recomendadas: NVIDIA H200 (usada para la verificación de benchmarks), A100 y H100 para evaluaciones a gran escala; GPUs de consumo para inferencia básica (modelo de 0,8B).
- Cabe en GPU de consumo: sí, por tamaño de pesos; modelos concretos no especificados en la información disponible.
- Opciones de despliegue: vLLM 0.33.0 (probado), transformers 5.20.2 (probado), y otros backends compatibles con safetensors (llama.cpp, Ollama, TGI) no confirmados en la información.
- Latencia y throughput: no disponibles; la referencia es de 43,4M tokens generados en 51 minutos en una H200 para 2.000 generaciones, equivalente aproximado de ~14.200 tokens/s agregados en esa configuración (cálculo derivado, no publicado como métrica oficial).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (xtools-at/Qwen3.5-0.8B-...-heretic) | 852.985.920 | ~34.816 (config vLLM) | 51,0% | apache-2.0 | ARA + edición de pesos; 9/100 refusals |
| ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming (base de esta ficha) | no disponible (misma familia 0,8B) | no disponible | 5,0% (smoke) | apache-2.0 | Edición de pesos sin decensoring; 97/100 refusals |
| Qwen/Qwen3.5-0.8B (modelo original público) | ~0,8B | no disponible | 5,0% (smoke) | apache-2.0 | Modelo de referencia sin ediciones |
| akhaliq/Qwen3.5-0.8B-weight-space-programming | no disponible | no disponible | 51,0% | apache-2.0 | Checkpoint verificado del experimento, sin ARA |

Las comparaciones con otras familias (Llama, Gemma, Phi) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El decensoring elimina salvaguardas de rechazo (9/100 refusals): el modelo puede generar contenido que el original rechazaría. No apto para despliegues públicos sin filtrado externo.
- Riesgo de alucinación y de bucles residuales: aunque la edición corrige la patología principal, un 31,6% de respuestas en MATH-500 se cortan a 32k tokens, lo que indica cadenas de razonamiento aún largas o degenerativas.
- La ablación introduce divergencia respecto al base (KL 0,0744); puede degradar comportamientos no medidos en la evaluación publicada.
- Idiomas soportados no declarados: no hay garantía de calidad multilingüe más allá del inglés observado en los ejemplos.
- La evaluación de MATH-500 del modelo base se hizo sobre un smoke test de 25 problemas (5,0%), no sobre el conjunto completo; la comparación directa con el 51,0% del modelo editado no es estrictamente equivalente.
- La cadena de modificación incluye una exportación solo-texto en el experimento original; este checkpoint es multimodal completo y la torre de visión no está validada en la información disponible.
- Licencia apache-2.0 permite uso comercial, pero la model card no aborda responsabilidad por contenido generado tras el decensoring.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic
- Modelo base en Hugging Face: https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming
- Modelo original Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint verificado del experimento: https://huggingface.co/akhaliq/Qwen3.5-0.8B-weight-space-programming
- Resultados de evaluación: https://huggingface.co/akhaliq/Qwen3.5-0.8B-weight-space-programming/tree/main/eval
- Blog post "Sparks of Weight Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y código de reconstrucción: https://github.com/RikiyaT/lm_understand-logs
- Demo interactiva: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Proyecto Heretic: https://heretic-project.org
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
