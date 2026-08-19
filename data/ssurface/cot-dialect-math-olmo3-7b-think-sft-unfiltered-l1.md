# ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el autor `ssurface` (identificado como Anatolii Frolov en la cita del proyecto) que se aplica sobre el modelo base `allenai/Olmo-3-7B-Think`. Su propósito es especializar el razonamiento del modelo base en problemas matemáticos, forzando un estilo de cadena de pensamiento (chain-of-thought) a un nivel de compresión denominado "L1" (explicación verbosa en lenguaje natural). El adaptador se entrenó mediante supervisión fina (SFT) por destilación, utilizando problemas del dataset MATH reexpresados a ese nivel por un modelo profesor.

Este modelo forma parte de una línea de investigación sobre "dialectos de compresión de chain-of-thought", que explora cómo distintos niveles de detalle en el razonamiento afectan al rendimiento en tareas matemáticas. La relevancia actual radica en la creciente demanda de modelos que puedan generar explicaciones paso a paso controlables, ya sea para entornos educativos, sistemas de tutoría o integración en pipelines de razonamiento automático. El adaptador es ligero (0.2 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación.

El modelo base, Olmo-3-7B-Think, es un transformer decoder-only de 7 mil millones de parámetros, pero no se dispone en la información proporcionada de detalles sobre su longitud de contexto ni otras especificaciones internas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: `allenai/Olmo-3-7B-Think`) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + parametros del adaptador LoRA (r=16, alpha=32) no especificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16; no se indican cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 (alpha=32, dropout=0.05) montado sobre `allenai/Olmo-3-7B-Think`, un transformer autoregresivo de 7B parametros. El entrenamiento se realizo mediante supervisión fina (SFT) por destilación: un modelo profesor reexpresó problemas del dataset MATH a un nivel de compresión L1 (explicación verbosa), y el adaptador se entrenó para reproducir esas respuestas. Se usaron 3 épocas, una tasa de aprendizaje de 2e-4 con programación coseno y warmup del 3%, un tamaño de lote efectivo de 64 (16 x 4 acumulación de gradientes), una longitud máxima de secuencia de 1024 tokens y precisión bf16. El hardware de entrenamiento fue una única GPU NVIDIA A100 de 80 GB.

Un detalle técnico destacable es que la función de pérdida se calculó únicamente sobre la parte de completación, con las longitudes de los prompts precomputadas en tiempo de carga en lugar de mediante búsqueda de patrones, lo que evitó que el prior de tool-calling del modelo base se filtrara en las cadenas generadas. El prompt de inferencia recomendado es `Solve this using Level 1 (Verbose). Problem: {problema}`.

## Capacidades

- Razonamiento matemático: resuelve problemas de matemáticas con palabras (word problems) generando cadenas de pensamiento detalladas.
- Generación de explicaciones paso a paso en lenguaje natural, siguiendo el estilo "L1" (verboso).
- Generación de texto en inglés, con capacidad de seguir instrucciones de formato (respuestas en `\boxed{}`).
- Especialización en el dataset MATH-500, aunque puede generalizar a otros problemas similares.
- Compatible con el ecosistema HuggingFace `transformers` y `peft`, lo que permite integración sencilla en pipelines existentes.
- No se han verificado capacidades de tool calling, agentes o multimodalidad en la información disponible.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones detalladas paso a paso para problemas de álgebra, cálculo o probabilidad, útil en plataformas educativas que necesitan mostrar el razonamiento completo.
- Generación de soluciones para conjuntos de problemas: dado un enunciado, produce una respuesta razonada y formateada en `\boxed{}`, facilitando la corrección automática en sistemas de evaluación.
- Aumento de datos para entrenamiento: las cadenas de pensamiento generadas pueden servir como datos sintéticos para entrenar otros modelos más pequeños en tareas de razonamiento.
- Integración en asistentes de estudio: combinado con un motor de búsqueda, puede responder preguntas de deberes con explicaciones verbosas, mejorando la experiencia de aprendizaje.
- Evaluación de modelos de razonamiento: al estar especializado en MATH-500, puede usarse como referencia para comparar el efecto de distintos niveles de compresión de chain-of-thought.
- Prototipos de investigación sobre compresión de razonamiento: el adaptador permite experimentar con el nivel L1 y comparar con otros dialectos (L3, L5) en pipelines de investigación.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en el model-index:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | MATH-500 (test) | Accuracy (exact match) | 65.6% |

Este resultado se obtuvo con decodificación greedy, en una sola vuelta, sin ejemplos (few-shot) y sin self-consistency. El autor advierte que el harness de evaluación usa un corrector consciente de LaTeX que normaliza formas equivalentes (por ejemplo, `\frac{14}{3}` == `14/3`). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El modelo base de 7B en bf16 requiere aproximadamente 14 GB de VRAM solo para los pesos; el adaptador LoRA añade una cantidad mínima (menos de 0.2 GB).
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes), el modelo base puede reducirse a unos 4-5 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- Para inferencia sin cuantizar se recomienda al menos una GPU con 16-24 GB de VRAM (RTX 4090, A100, etc.).
- Opciones de despliegue: HuggingFace `transformers` + `peft` (carga directa del adaptador), vLLM (si soporta LoRA en la versión utilizada), o conversión a GGUF para su uso con llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base).
- El entrenamiento se realizó en una A100 de 80 GB, pero la inferencia es mucho más ligera.
- Latencia y throughput no disponibles; dependerán del hardware y de la longitud de las cadenas generadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El autor no incluye resultados de modelos base sin adaptador ni de alternativas como Mistral-7B, Llama-3-8B u otros especializados en matemáticas. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matemáticas con palabras; su rendimiento en otras tareas (código, razonamiento general, etc.) no está verificado y probablemente sea inferior.
- La precisión cae rápidamente con la dificultad del problema, especialmente en los niveles de compresión más altos (aunque este adaptador usa el nivel L1, el efecto se menciona en la model card).
- El resultado de 65.6% en MATH-500 tiene un margen de error de aproximadamente ±4.4 puntos porcentuales (intervalo de confianza del 95% para n=500), por lo que diferencias de unos pocos puntos pueden deberse al azar.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El adaptador se entrenó con una sola semilla (a menos que el nombre del repo indique lo contrario), lo que añade variabilidad.
- No se han realizado evaluaciones de sesgos o alucinaciones; como modelo de lenguaje, puede generar respuestas incorrectas o inventadas si el problema está fuera de su distribución.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think tiene su propia licencia (probablemente Apache-2.0 también, pero no se confirma en la información proporcionada).

## Enlaces

- HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Proyecto citado: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — sin URL disponible en la información proporcionada.
