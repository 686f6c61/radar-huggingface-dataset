# ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l5

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l5` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario `ssurface` que se aplica sobre el modelo base `allenai/Olmo-3-7B-Think`. Su propósito es forzar al modelo a razonar en un "dialecto de compresión" de nivel L5, es decir, expresar la cadena de pensamiento (chain-of-thought) como una única expresión colapsada, en lugar de pasos intermedios verbosos. Este enfoque se enmarca en un proyecto más amplio sobre "dialectos de compresión de chain-of-thought" que busca reducir la latencia y el coste computacional de la generación de razonamiento.

El adaptador se ha entrenado mediante supervisión fina (SFT) por destilación, utilizando problemas de entrenamiento del conjunto MATH re-expresados a nivel L5 por un modelo profesor. El corpus resultante fue filtrado para eliminar ejemplos de baja calidad. El modelo está pensado para tareas de razonamiento matemático, aunque su uso se limita al idioma inglés y a problemas de tipo matemático. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

En la evaluación oficial, el adaptador alcanza un 55,2% de precisión (exact match) en el conjunto MATH-500, con decodificación greedy y sin ejemplos previos ni self-consistency. Este resultado se obtuvo con un grader específico que normaliza expresiones LaTeX equivalentes, lo que corrige un sesgo de evaluación común en otros harnesses.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `allenai/Olmo-3-7B-Think` (arquitectura del modelo base no especificada en la información disponible) |
| Parametros totales | No disponible (modelo base de aproximadamente 7B; el adaptador LoRA tiene un tamaño de repo de 0,2 GB, pero no se indica el número exacto de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa max_seq_length de 1024, pero el contexto del modelo base podría ser mayor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7B parámetros de la familia OLMo. No se proporcionan detalles sobre la arquitectura interna del modelo base (si es transformer estándar, MoE, etc.), pero al ser de 7B se asume una arquitectura transformer densa. El adaptador LoRA utiliza r=16, alpha=32 y dropout=0.05, y se entrena con precisión bf16.

El entrenamiento se realizó mediante supervisión fina (SFT) por destilación: los problemas de entrenamiento de MATH se re-expresaron a nivel L5 (compresión extrema) por un modelo profesor, y el corpus resultante fue filtrado. La pérdida se calcula únicamente sobre la parte de la respuesta (completion), con longitudes de prompt precomputadas en lugar de usar búsqueda de patrones, lo que evita que el prior de tool-calling del modelo base se filtre en las cadenas generadas. Se entrenó durante 3 épocas con una tasa de aprendizaje de 2e-4 (cosine, warmup 0.03), batch efectivo de 64 (16 x 4 grad-accum) y una longitud máxima de secuencia de 1024. El hardware utilizado fue una única NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático: el modelo está especializado en resolver problemas matemáticos, generando una cadena de pensamiento comprimida a nivel L5 (una única expresión colapsada).
- Generación de texto: al estar basado en un modelo de lenguaje de 7B, conserva la capacidad de generar texto coherente, aunque su entrenamiento se centra en problemas matemáticos.
- Chain-of-thought comprimido: el adaptador induce al modelo a producir razonamientos extremadamente condensados, lo que puede reducir la latencia y el coste de generación.
- Soporte conversacional: el tag `conversational` sugiere que puede usarse en diálogos, aunque no hay evidencia específica de fine-tuning para chat.
- Multilingüe: no, solo inglés (en).
- Tool calling / function calling: no se menciona soporte específico; el modelo base podría tenerlo, pero el adaptador no lo indica.
- Agentes y multi-step reasoning: no se documenta capacidad específica para agentes.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede usarse como asistente para resolver ejercicios de matemáticas de nivel medio, generando respuestas con razonamiento comprimido. Es adecuado porque su entrenamiento específico en MATH-500 y su formato de salida condensado lo hacen eficiente para preguntas directas.
- Evaluación de razonamiento matemático en pipelines de NLP: investigadores pueden integrar este adaptador para comparar el rendimiento de diferentes dialectos de compresión de CoT en tareas de razonamiento, gracias a su compatibilidad con el grader LaTeX-aware del proyecto.
- Generación de soluciones paso a paso (aunque comprimidas) para sistemas de tutoría inteligente: el modelo puede proporcionar respuestas breves que un sistema posterior puede expandir o explicar, reduciendo el coste computacional en entornos con muchos usuarios.
- Benchmarking de compresión de CoT: dado que el adaptador está diseñado para un nivel de compresión extremo (L5), sirve como punto de referencia para estudiar el equilibrio entre precisión y concisión en razonamiento automático.
- Integración en aplicaciones de procesamiento de lenguaje natural que requieran respuestas matemáticas rápidas: por ejemplo, chatbots de soporte técnico que necesiten calcular resultados numéricos con explicaciones mínimas.
- Experimentación académica en destilación de conocimiento: el adaptador demuestra cómo un modelo profesor puede transferir habilidades de razonamiento comprimido a un modelo base, y puede usarse como caso de estudio en cursos o investigaciones sobre SFT y LoRA.

## Benchmarks y rendimiento

Según la model card del autor, el adaptador obtiene los siguientes resultados en el conjunto MATH-500 (n=500), con decodificación greedy, una sola vuelta, sin ejemplos previos y sin self-consistency:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test) | Accuracy (exact match) | 55,2% |

Nota: el resultado fue obtenido con un grader LaTeX-aware que normaliza formas equivalentes (por ejemplo, `\frac{14}{3}` = `14/3`). No se proporcionan comparaciones con el modelo base ni con otros adaptadores en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0,2 GB), pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parámetros.
- Para inferencia en bf16, el modelo base necesita aproximadamente 14 GB de VRAM, por lo que se recomienda una GPU con al menos 16 GB (por ejemplo, NVIDIA RTX 4090, A100 40GB, etc.).
- Con cuantización (por ejemplo, 4-bit o 8-bit) podría ejecutarse en GPUs de consumo como RTX 3080/3090, aunque no se proporcionan datos específicos de cuantización para este adaptador.
- Opciones de despliegue: al ser un modelo de HuggingFace con PEFT, se puede servir con `transformers` + `peft`, y probablemente con `vLLM` o `TGI` si se fusiona el adaptador con el modelo base. También se puede exportar a GGUF para usar con `llama.cpp` u `Ollama`, aunque no hay instrucciones oficiales.
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa con otros adaptadores o modelos de razonamiento matemático sin datos adicionales. Se recomienda consultar el proyecto "Chain-of-Thought Compression Dialects" para posibles referencias.

## Limitaciones y advertencias

- Entrenado exclusivamente en problemas matemáticos; su rendimiento en otras tareas de lenguaje general no está evaluado y podría degradarse.
- La precisión disminuye con la dificultad del problema, especialmente en los niveles de compresión más altos (como L5).
- El resultado de 55,2% se obtuvo con una única semilla; diferencias de unos pocos puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95% de aproximadamente ±4,4 puntos porcentuales para n=500).
- Solo soporta inglés; no hay soporte multilingüe.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en problemas complejos.
- El adaptador no incluye el modelo base; para usarlo es necesario descargar `allenai/Olmo-3-7B-Think` por separado, lo que implica un coste de almacenamiento y ancho de banda.
- No se ha verificado el comportamiento en producción; se recomienda probar en un entorno controlado antes de desplegarlo en aplicaciones críticas.

## Enlaces

- HuggingFace: [ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l5](https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l5)
- Modelo base: [allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- Dataset de evaluación: [HuggingFaceH4/MATH-500](https://huggingface.co/datasets/HuggingFaceH4/MATH-500)
- Referencia académica: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — citado en la model card, sin enlace directo disponible.
