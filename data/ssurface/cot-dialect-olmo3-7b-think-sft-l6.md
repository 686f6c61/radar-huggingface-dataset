# ssurface/cot-dialect-olmo3-7b-think-sft-l6

## Resumen

`ssurface/cot-dialect-olmo3-7b-think-sft-l6` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `allenai/Olmo-3-7B-Think`, desarrollado por Anatolii Frolov (usuario `ssurface`). Este adaptador forma parte de un estudio de ablación sobre compresión de cadenas de razonamiento (Chain-of-Thought Compression Dialects) y representa el extremo inferior del espectro: un modelo que responde sin ninguna cadena de razonamiento explícita, mostrando únicamente la respuesta final. El objetivo es servir como punto de referencia para medir qué retiene el modelo base cuando se elimina por completo el razonamiento intermedio.

El adaptador se entrenó mediante supervisión fina (SFT) por destilación sobre el conjunto de datos GSM8K, con objetivos que contienen solo la respuesta final. Es un artefacto de investigación, no un modelo pensado para desplegar en producción, tal como indica explícitamente su autor. El modelo base, Olmo-3-7B-Think, es un transformer de 7.000 millones de parámetros desarrollado por el Allen Institute for AI (AI2), con capacidades de razonamiento y contexto largo, publicado bajo licencia Apache-2.0. El adaptador en sí es ligero (0.2 GB) y se distribuye en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (base: `allenai/Olmo-3-7B-Think`) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con max sequence 1024; el modelo base soporta contexto largo) |
| Tipos de cuantizacion | No disponible (entrenado en bf16; se puede cargar en bf16 o cuantizado) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `allenai/Olmo-3-7B-Think`, un transformer decoder-only de 7.000 millones de parámetros desarrollado por AI2 como parte de la familia Olmo 3. Este modelo base está diseñado para razonamiento de contexto largo, function calling, código, instrucciones y chat, e incluye una variante "Think" orientada a generar cadenas de razonamiento antes de la respuesta final. El adaptador LoRA se entrena con r=16, alpha=32 y dropout de 0.05, sobre el conjunto GSM8K (problemas matemáticos de nivel escolar), utilizando solo la respuesta final como objetivo, sin ninguna cadena de razonamiento.

El entrenamiento se realizó mediante SFT por destilación, con 3 épocas, tasa de aprendizaje 2e-4 con programación coseno y warmup del 3%, batch efectivo de 64 (16 x 4 grad-accum), longitud máxima de secuencia de 1024 tokens, precisión bf16 y una única GPU NVIDIA A100 de 80 GB. Un detalle técnico relevante es que las longitudes de los prompts se precomputaron en tiempo de carga en lugar de usar búsqueda de patrones, ya que el collator de búsqueda de patrones enmascaraba silenciosamente nada, lo que permitía que el prior de tool-calling del modelo base se filtrara en las cadenas. Este adaptador es un artefacto de un estudio de ablación más amplio sobre compresión de cadenas de razonamiento, donde los niveles L1 a L5 (no incluidos aquí) llevan los resultados reportados.

## Capacidades

- Generación de texto con respuestas directas, sin cadena de razonamiento explícita.
- Resolución de problemas matemáticos de nivel escolar (entrenado en GSM8K).
- No soporta function calling ni tool calling (el entrenamiento elimina cualquier cadena intermedia, incluyendo posibles llamadas a herramientas).
- No tiene capacidades multimodales (sin visión, audio ni vídeo).
- Solo idioma inglés.
- No incluye modo "thinking" (por diseño, es la variante "no-think").
- Es un modelo de referencia para estudios de ablación, no un modelo de propósito general.

## Casos de uso

- Investigación en compresión de cadenas de razonamiento: sirve como línea base para comparar cómo la eliminación completa del razonamiento afecta al rendimiento en tareas de matemáticas.
- Evaluación de la degradación de precisión: permite medir cuánto depende el modelo base de su cadena de razonamiento para resolver problemas aritméticos.
- Estudio de destilación de conocimiento: se puede usar para analizar qué información se pierde al forzar respuestas directas, útil para diseñar modelos más eficientes.
- Experimentos de latencia mínima: al no generar cadenas de razonamiento, el tiempo de inferencia es menor, aunque el rendimiento es inferior; útil para medir el trade-off entre velocidad y precisión.
- Validación de pipelines de entrenamiento con PEFT: sirve como ejemplo de cómo aplicar LoRA con SFT sobre un modelo base de razonamiento.
- Punto de comparación en benchmarks de razonamiento: permite contrastar con otros adaptadores del mismo estudio (niveles L1-L5) y con el modelo base sin adaptar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador. El autor indica explícitamente que el adaptador no fue evaluado por separado, ya que existe como artefacto de entrenamiento para la cuadrícula de ablación; los niveles con números reportados pertenecen al conjunto principal de la colección. Por tanto, no hay datos de MMLU, GSM8K, HumanEval u otros que se puedan presentar.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parámetros.
- En bf16, el modelo base ocupa aproximadamente 14 GB de VRAM; con cuantización (por ejemplo, 4-bit) se reduce a unos 4-5 GB.
- GPU recomendadas: NVIDIA A100 (80 GB) para entrenamiento; para inferencia, una RTX 4090 (24 GB) o superior es suficiente en bf16, y una RTX 3060 (12 GB) con cuantización 4-bit.
- Se puede desplegar con `transformers` + `peft` (como en el ejemplo de uso), o con motores como vLLM o TGI que soporten carga de adaptadores LoRA.
- Para llama.cpp u Ollama, se necesitaría convertir el modelo base y el adaptador a formato GGUF, lo cual no está predefinido.
- La latencia es menor que la del modelo base con thinking, ya que no genera cadenas de razonamiento; el throughput dependerá del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Este adaptador es único en su propósito (eliminar completamente la cadena de razonamiento) y no existen alternativas equivalentes documentadas. Se puede comparar conceptualmente con el modelo base sin adaptar (`allenai/Olmo-3-7B-Think`) y con otros adaptadores del mismo estudio (niveles L1-L5), pero no hay datos numéricos disponibles. Tampoco hay comparación con modelos de propósito general de 7B como Llama-3-8B o Mistral-7B, ya que el adaptador no está diseñado para tareas generales.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de nivel escolar (GSM8K); no generaliza a otros dominios.
- La precisión cae con la dificultad del problema, y más rápido en los niveles comprimidos (como este).
- No es un modelo para desplegar en producción; el propio autor lo describe como "punto de referencia, no un modelo para desplegar".
- Al eliminar la cadena de razonamiento, se pierde la capacidad de explicar el proceso, lo que puede aumentar el riesgo de respuestas incorrectas sin posibilidad de depuración.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación en problemas fuera de la distribución de entrenamiento.
- El entrenamiento usó una única semilla (a menos que el nombre del repo indique lo contrario), por lo que las diferencias de un par de puntos porcentuales están dentro del ruido estadístico (95% de intervalo de confianza de ~2.7 pp en n=1317 y ~4.4 pp en n=500).
- Licencia Apache-2.0 permite uso comercial, pero dado que es un artefacto de investigación, no se recomienda su uso en entornos productivos.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l6
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Variante SFT del modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Página oficial de Olmo (AI2): https://allenai.org/olmo
- Scripts oficiales de entrenamiento de Olmo 3 (GitHub): https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
