# ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3

## Resumen

Este modelo es un adaptador LoRA desarrollado por ssurface que modifica el comportamiento de `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7 mil millones de parámetros de Allen Institute for AI, para que genere cadenas de razonamiento comprimidas a un nivel denominado L3 (una asignación con nombre por línea). El objetivo es reducir la verbosidad de las cadenas de pensamiento sin perder precisión en tareas de razonamiento matemático, manteniendo la capacidad del modelo base para resolver problemas aritméticos y algebraicos.

El adaptador se entrenó mediante aprendizaje supervisado por destilación sobre problemas del dataset MATH, reexpresados por un modelo profesor a nivel simbólico L3. La relevancia actual radica en la creciente necesidad de reducir el coste computacional y la latencia de los modelos de razonamiento, especialmente en entornos de producción donde la generación de cadenas de pensamiento largas supone un gasto significativo. Con una licencia Apache 2.0 y un tamaño de repositorio de 0,2 GB, el adaptador es ligero y fácil de integrar sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Olmo-3-7B-Think) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (no se especifica si el modelo base es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max sequence de 1024 tokens) |
| Tipos de cuantizacion | bf16 (entrenamiento); cuantización del modelo base no especificada |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `allenai/Olmo-3-7B-Think`, un transformer autoregresivo de 7B parámetros desarrollado por AI2. No se dispone de detalles adicionales sobre la arquitectura interna del modelo base en la información proporcionada. El adaptador LoRA se configuró con r=16, alpha=32 y dropout de 0,05, aplicado sobre las capas del modelo base.

El entrenamiento consistió en una etapa de fine-tuning supervisado por destilación (SFT) sobre problemas de MATH reexpresados a nivel L3 por un modelo profesor. El corpus de entrenamiento es la versión "unfiltered" (sin filtrar) de estos problemas. Se utilizaron 3 épocas, una tasa de aprendizaje de 2e-4 con scheduler coseno y warmup del 3%, un batch efectivo de 64 (16 x 4 grad-accum), una longitud máxima de secuencia de 1024 tokens y precisión bf16. El entrenamiento se realizó en una única NVIDIA A100 de 80 GB. La pérdida se calculó únicamente sobre la parte de la completion, con longitudes de prompt precomputadas en lugar de mediante búsqueda de patrones, para evitar que el prior de tool-calling del modelo base se filtrara en las cadenas generadas.

## Capacidades

- Generación de texto y razonamiento matemático: resuelve problemas de matemáticas de nivel medio (MATH-500) con una precisión del 63,4% en exact match, usando decoding greedy y sin ejemplos ni self-consistency.
- Chain-of-thought comprimido: genera cadenas de razonamiento a nivel L3, con una asignación con nombre por línea, reduciendo la verbosidad respecto al estilo natural del modelo base.
- Formato de respuesta en LaTeX: produce respuestas en formato `\boxed{}`, compatible con problemas de MATH.
- Integración con el ecosistema HuggingFace: se carga como adaptador PEFT sobre el modelo base, permitiendo su uso con transformers y peft.
- Multilingüe: no, entrenado y evaluado únicamente en inglés.
- Tool calling y agentes: no se menciona soporte específico; el modelo base podría tenerlo, pero el adaptador no lo declara.
- Modo thinking: hereda las capacidades del modelo base Olmo-3-7B-Think, aunque el adaptador modifica el estilo de razonamiento.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede generar soluciones paso a paso para problemas de álgebra y cálculo, útil en plataformas de tutoría automática o generación de ejercicios resueltos.
- Evaluación de modelos de razonamiento: sirve como referencia para medir el impacto de la compresión de cadenas de pensamiento en la precisión, comparando con el modelo base sin adaptador.
- Reducción de costes en inferencia de razonamiento: al generar cadenas más cortas, se reduce el número de tokens de salida, disminuyendo la latencia y el coste por petición en servicios de QA matemática.
- Generación de datos sintéticos para entrenamiento: las cadenas comprimidas pueden usarse como datos de entrenamiento para otros modelos más pequeños o para fine-tuning específico.
- Benchmarking de compresión de CoT: el adaptador puede utilizarse en experimentos académicos sobre compresión de razonamiento, comparando niveles L1, L3 y L5.
- Prototipado rápido de asistentes matemáticos: dado su pequeño tamaño (0,2 GB) y licencia permisiva, es adecuado para integrarse en demos o MVPs que requieran razonamiento matemático sin grandes recursos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test) | Accuracy (exact match) | 63,4% |

Condiciones de evaluación: decoding greedy, single-turn, sin ejemplos, sin self-consistency, con un grader específico que normaliza respuestas en LaTeX (por ejemplo, `\frac{14}{3}` == `14/3`). El autor advierte que evaluaciones previas con un harness que buscaba el formato `#### n` dieron resultados erróneos (~0%), por lo que estos números provienen de un grader adaptado a `\boxed{}`. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia: el adaptador LoRA añade muy pocos parámetros al modelo base de 7B. En bf16, el modelo base requiere aproximadamente 14 GB de VRAM. Con cuantización (por ejemplo, 4-bit), puede caber en GPUs consumer como RTX 3090 o RTX 4090, aunque no se especifica oficialmente.
- Entrenamiento: se utilizó 1x NVIDIA A100 80GB, con batch efectivo de 64 y secuencias de hasta 1024 tokens.
- Opciones de despliegue: compatible con HuggingFace transformers y PEFT. Se puede servir con vLLM o TGI si se fusiona el adaptador con el modelo base, o mediante llama.cpp si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponible; depende del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. Como referencia, el modelo base `allenai/Olmo-3-7B-Think` sin adaptador obtendría una precisión diferente en MATH-500, pero ese valor no se ha publicado en esta fuente. Tampoco se comparan otros adaptadores de compresión de CoT. Por tanto, la comparativa se limita a señalar que este adaptador está diseñado específicamente para comprimir el razonamiento manteniendo la precisión, frente a modelos que generan cadenas completas (como el propio Olmo-3-7B-Think) o modelos especializados en matemáticas como DeepSeek-Math o Qwen2.5-Math, cuyos resultados no se han contrastado aquí.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos en inglés; no se recomienda su uso en otros dominios sin fine-tuning adicional.
- La precisión disminuye con la dificultad del problema, especialmente en los niveles más comprimidos (L5).
- Los resultados reportados tienen un margen de error de ±4,4 puntos porcentuales (95% intervalo de confianza) para n=500, por lo que diferencias de unos pocos puntos pueden ser ruido.
- El adaptador no filtra el corpus de entrenamiento (versión "unfiltered"), lo que podría incluir contenido no deseado en las cadenas de razonamiento.
- No se garantiza soporte para tool calling o funciones de agente, aunque el modelo base podría tenerlo; el adaptador no lo declara.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think tiene su propia licencia (no especificada aquí), que debe verificarse antes de desplegar en producción.
- La longitud de contexto efectiva no se ha documentado; el entrenamiento usó 1024 tokens, por lo que problemas muy largos podrían no procesarse correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Citación del proyecto (sin URL pública): "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026)
